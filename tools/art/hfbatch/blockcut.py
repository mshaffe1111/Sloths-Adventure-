"""Cut the hf-art-blocking takes (2026-10-29) into atlases + frames json, and make the review sheets.

    python3 -I tools/art/hfbatch/blockcut.py <game checkout> <takes dir> <sheet> <pick name>[,<pick name>...] [<piece>=<take> ...]

<sheet> is w7anchors, w7walls, w4falls or w6ledges (w6ledges also takes the w6perches pick: pass both, ledges first). Extra
<piece>=<take> pairs take single pieces from another take. Pieces are cut from the boxes blockstart.py laid them out in, so each comes
from where its start was.
- Opaque pieces: w6to10/geminicut.py cut_cell (border flood, soft rim, despill), then a wider despill on the 4 px band at the edge.
- Water (falls, pours, foam, mist): unmixed from the magenta: for a pixel c = a F + (1 - a) K with grey-white water F (min(r, b) = g),
  min(r, b) - g = 255 (1 - a), so the alpha comes back soft and the colour is (c - (1 - a) K) / a. The mist and spray keep their see-through.
- Tiling pieces (wall strips, fall bodies, the pillar, splash strips) are made seamless after the cut: the strip is cut at its two
  darkest joint rows (walls) or a fixed length, and the overlap is cross-faded into the start (the end that wraps round), so the last
  row runs on into the first. Each gets a 3x stacked (or side by side) check image.
Writes src/assets/<w>/<name>.webp + .json and reference/prop-sheets/qa-notes/hf-art-blocking/<sheet>-*.jpg.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'w6to10'))
from geminicut import cut_cell, pack  # noqa: E402

GAME, TAKES, SHEET = Path(sys.argv[1]), Path(sys.argv[2]), sys.argv[3]
PICKS = sys.argv[4].split(',')
OVR = dict(a.split('=') for a in sys.argv[5:])
QA = GAME / 'reference/prop-sheets/qa-notes/hf-art-blocking'
QA.mkdir(parents=True, exist_ok=True)
DARK, GREY = (20, 16, 24), (128, 128, 128)


def take(n):
    return Image.open(TAKES / f'{n}.webp').convert('RGB')


def despill(sp):
    a = np.asarray(sp).astype(np.float32)
    band = ndimage.binary_dilation(a[..., 3] < 128, iterations=4) & (a[..., 3] > 0)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 6, 0, None) * band
    a[..., 0] -= ex; a[..., 2] -= ex
    # (and anywhere in the piece: a magenta cast (r and b both well over g) is key showing through, never paint in these kits:
    # brown has b under g, moss and stone have min(r, b) near g)
    ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 14, 0, None)
    a[..., 0] -= ex; a[..., 2] -= ex
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def opaque_cut(im):
    sp = cut_cell(im, 'magenta', {})
    return despill(sp) if sp else None


def unmix(im, crop=True, water_only=True):
    """soft alpha off the magenta for grey-white water (see the doc string)"""
    c = np.asarray(im.convert('RGB')).astype(np.float32)
    k = np.minimum(c[..., 0], c[..., 2]) - c[..., 1]
    a = np.clip(1 - k / 255, 0, 1)
    a = np.clip((a - 0.08) / 0.86, 0, 1)
    # (only what joins the painted piece: the border-flooded key is clear)
    lab, n = ndimage.label(a > 0.04)
    if n:
        sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= 60])
        a = a * keep
    K = np.array([255, 0, 255], np.float32)
    F = (c - (1 - a[..., None]) * K) / np.maximum(a[..., None], 1e-3)
    F = np.clip(F, 0, 255)
    # (what is left of a pink cast on thin spray: r and b no higher than g + 12)
    m = np.minimum(F[..., 0], F[..., 2]); ex = np.clip(m - F[..., 1] - 12, 0, None)
    F[..., 0] -= ex; F[..., 2] -= ex
    if water_only:
        # (water is white to blue-grey: green flecks the repaint left at the edges become spray, green no higher than r and b)
        F[..., 1] = np.minimum(F[..., 1], np.maximum(F[..., 0], F[..., 2]) + 4)
    out = Image.fromarray(np.dstack([F, a * 255]).astype(np.uint8), 'RGBA')
    if crop:
        bb = out.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
        out = out.crop(bb) if bb else out
    return out


def rs(im, w, h):
    return im.resize((max(1, round(w)), max(1, round(h))), Image.LANCZOS)


def on(im, col, pad=0):
    bg = Image.new('RGBA', (im.width + 2 * pad, im.height + 2 * pad), col + (255,))
    bg.alpha_composite(im, (pad, pad))
    return bg.convert('RGB')


def wrap_v(im, H, ov):
    """seamless top to bottom: rows [0, H) of im, with the first ov rows cross-faded from rows [H, H + ov)"""
    a = np.asarray(im).astype(np.float32)
    assert a.shape[0] >= H + ov, (a.shape, H, ov)
    out = a[:H].copy()
    t = (np.arange(ov) / ov)[:, None, None]
    t = t * t * (3 - 2 * t)
    out[:ov] = a[:ov] * t + a[H:H + ov] * (1 - t)
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), im.mode)


def wrap_h(im, W, ov):
    return wrap_v(im.transpose(Image.TRANSPOSE), W, ov).transpose(Image.TRANSPOSE)


def stack3(im, vertical=True, col=DARK):
    if vertical:
        S = Image.new('RGBA', (im.width, im.height * 3), col + (255,))
        for i in range(3):
            S.alpha_composite(im, (0, i * im.height))
    else:
        S = Image.new('RGBA', (im.width * 3, im.height), col + (255,))
        for i in range(3):
            S.alpha_composite(im, (i * im.width, 0))
    return S


def label(d, xy, t):
    d.text((xy[0] + 1, xy[1] + 1), t, fill=(0, 0, 0)); d.text(xy, t, fill=(255, 230, 0))


def candidates_sheet(names, tw=640):
    ims = [take(n) for n in names]
    th = round(tw * ims[0].height / ims[0].width)
    cols = 2
    rows = (len(ims) + 1) // 2
    S = Image.new('RGB', (cols * (tw + 8), rows * (th + 22)), (24, 24, 24))
    d = ImageDraw.Draw(S)
    for i, (n, im) in enumerate(zip(names, ims)):
        x, y = (i % cols) * (tw + 8), (i // cols) * (th + 22)
        S.paste(im.resize((tw, th), Image.LANCZOS), (x, y + 20))
        label(d, (x + 4, y + 4), n + ('   <- PICK' if n in PICKS or n in OVR.values() else ''))
    return S


def vstack(parts, gap=16, bg=(24, 24, 24)):
    W = max(p.width for p in parts)
    H = sum(p.height for p in parts) + gap * (len(parts) - 1)
    S = Image.new('RGB', (W, H), bg)
    y = 0
    for p in parts:
        S.paste(p, (0, y)); y += p.height + gap
    return S


def strip_of(sprites, col, scale=1.0, gap=24, titles=True):
    ims = [(n, rs(im, im.width * scale, im.height * scale)) for n, im in sprites.items()]
    W = sum(im.width for _, im in ims) + gap * (len(ims) + 1)
    H = max(im.height for _, im in ims) + gap * 2 + 14
    S = Image.new('RGBA', (W, H), col + (255,))
    x = gap
    d = ImageDraw.Draw(S)
    for n, im in ims:
        S.alpha_composite(im, (x, gap + 14))
        if titles:
            label(d, (x, 4), n)
        x += im.width + gap
    return S.convert('RGB')


def write_atlas(sprites, anchors, out_dir, name, meta, width=2048):
    sheet, place = pack(sprites, width=width, pad=4)
    out_dir.mkdir(parents=True, exist_ok=True)
    sheet.save(out_dir / f'{name}.webp', 'WEBP', quality=90, method=6)
    frames = {}
    for n, im in sprites.items():
        x, y = place[n]
        f = {'x': x, 'y': y, 'w': im.width, 'h': im.height}
        f.update(anchors.get(n, {}))
        frames[n] = f
    js = {'sheet': f'{name}.webp', 'size': {'w': sheet.width, 'h': sheet.height}, **meta, 'frames': frames}
    (out_dir / f'{name}.json').write_text(json.dumps(js, indent=1))
    kb = (out_dir / f'{name}.webp').stat().st_size // 1024
    print(out_dir / f'{name}.webp', sheet.size, kb, 'KiB')
    return sheet


def src_of(piece, default):
    return take(OVR.get(piece, default))


# ------------------------------------------------------------------------------------------------------------------------------------
def w7anchors():
    pick = PICKS[0]
    sprites, anchors = {}, {}
    for i in range(4):
        cx, cy = i % 2, i // 2
        name = f'anchor-{i + 1}'
        im = src_of(name, pick).crop((cx * 608, cy * 448, cx * 608 + 608, cy * 448 + 448 - 8))
        sp_full = cut_cell_full(im)
        sp_full = despill(sp_full)
        al = np.asarray(sp_full.getchannel('A')) > 128
        cols = np.nonzero(al.any(axis=0))[0]
        x0, x1 = cols[0], cols[-1] + 1
        w = x1 - x0
        # (the frame's top: the first row that is mostly painted stone, not the start's dark top line or a gap; the lintel runs
        # on above from there)
        rgb = np.asarray(sp_full.convert('RGB')).astype(np.float32)[:, x0:x1]
        solid = (al[:, x0:x1]) & (rgb.mean(axis=2) > 70)
        y0 = int(np.nonzero(solid.mean(axis=1) > 0.72)[0][0])
        dark = al[:, x0:x1] & (rgb.mean(axis=2) < 50)
        rows = np.nonzero(dark[:40].mean(axis=1) > 0.015)[0]
        if len(rows):
            y0 = max(y0, int(rows[-1]) + 2)
        h = round(w * 220 / 300)
        piece = sp_full.crop((x0, y0, x1, y0 + h))
        # (the liana: the widest run of opaque pixels on the bottom row is where it leaves the frame)
        row = np.asarray(piece.getchannel('A'))[-1] > 128
        lab, n = ndimage.label(row)
        if n:
            sizes = ndimage.sum(row, lab, range(1, n + 1))
            j = int(np.argmax(sizes)) + 1
            xs = np.nonzero(lab == j)[0]
            lx, lw = (xs[0] + xs[-1] + 1) / 2, xs[-1] - xs[0] + 1
        else:
            lx, lw = w / 2, 0
        k = 300 / w
        piece = rs(piece, 300, h * k)
        sprites[name] = piece
        anchors[name] = {'ax': round(lx * k, 1), 'ay': piece.height, 'lianaW': round(lw * k, 1)}
        # (the same take's liana below the frame, as a run that repeats top to bottom, so the hanging part matches the knot)
        run = sp_full.crop((x0, y0 + h, x1, sp_full.height - 4))
        ra = np.asarray(run.getchannel('A')) > 128
        cs = np.nonzero(ra.any(axis=0))[0]
        cx = int(round(lx))
        half = int(max(lw, 20) * 1.6)
        run = run.crop((max(0, cx - half), 0, min(run.width, cx + half), run.height))
        L = run.height - 60
        if L > 400:  # (the round-a cells hold too little liana below the frame; the runs come from the w7lianas sheet)
            tile = wrap_v(run, L, 60)
            tile = rs(tile, tile.width * k, tile.height * k)
            sprites[f'liana-{i + 1}'] = tile
            anchors[f'liana-{i + 1}'] = {'ax': round((cx - max(0, cx - half)) * k, 1), 'ay': 0, 'tile': 'vertical',
                                         'note': f'hangs from anchor-{i + 1} (ax at its top lines up with the anchor ax)'}
    meta = {'anchor': 'ax, ay: the middle of the liana where it leaves the bottom of the frame (hang the game liana from there); '
                      'the top edge is the lintel running on above the screen', 'takes': {n: OVR.get(n, pick) for n in sprites},
            'method': 'img2img (Qwen-Image + slothadv style model) from blockstart.py w7anchors (W7 kit stone + liana)'}
    write_atlas(sprites, anchors, GAME / 'src/assets/w7', 'vine-anchors', meta)
    # review
    names = sorted(p.stem for p in TAKES.glob('w7anchors-*.webp'))
    parts = [candidates_sheet(names), strip_of(sprites, DARK), strip_of(sprites, GREY)]  # (anchors and liana runs)
    # game size (x0.5 on a 390 x 844 phone), hung under the screen top over the W7 backdrop with the kit liana below
    parts.append(phone_mock_anchors(sprites, anchors))
    vstack(parts).save(QA / 'w7anchors-review.jpg', quality=88)
    print(QA / 'w7anchors-review.jpg')


def cut_cell_full(im, main_only=True):
    """cut_cell, but on the cell's own canvas (not cropped to the piece), so positions inside the cell are kept: four 8 x 8 dark
    markers in the corners hold the bbox open and are cleared after"""
    m = im.convert('RGB').copy()
    d = ImageDraw.Draw(m)
    W, H = m.size
    for x, y in ((0, 0), (W - 8, 0), (0, H - 8), (W - 8, H - 8)):
        d.rectangle([x, y, x + 7, y + 7], fill=(10, 10, 10))
    sp = cut_cell(m, 'magenta', {})          # (with pockets: the key shut in between roots, posts and planks goes too)
    assert sp.size == (W, H), sp.size
    a = np.asarray(sp).copy()
    for x, y in ((0, 0), (W - 8, 0), (0, H - 8), (W - 8, H - 8)):
        a[max(0, y - 2):y + 10, max(0, x - 2):x + 10, 3] = 0
    if main_only:
        # (only the piece itself: the biggest part and anything near its size; ends of the next cell's posts are dropped)
        lab, n = ndimage.label(ndimage.binary_dilation(a[..., 3] > 60, iterations=3))
        if n > 1:
            sizes = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1))
            keep = [i + 1 for i, sz in enumerate(sizes) if sz >= 0.12 * sizes.max()]
            a[..., 3] = a[..., 3] * np.isin(lab, keep)
    return Image.fromarray(a, 'RGBA')


def kitframes():
    t = (GAME / 'src/game/kitAtlasData.ts').read_text()
    return json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', t, re.S).group(1))


def backdrop(w, h, name):
    bd = Image.open(GAME / f'src/assets/backdrops/{name}.webp').convert('RGBA')
    k = h / bd.height
    bd = rs(bd, bd.width * k, h)
    return bd.crop((0, 0, w, h)) if bd.width >= w else rs(bd, w, h)


def phone_mock_anchors(sprites, anchors):
    PW, PH, s = 390, 844, 0.5
    cards = []
    for bgname in ('w7-far', 'w7dusk-far'):
        P = backdrop(PW, PH, bgname)
        dim = Image.new('RGBA', P.size, (0, 0, 0, 90)); P.alpha_composite(dim)
        F = kitframes()['7']
        kit = Image.open(GAME / 'src/assets/kits/w7.webp').convert('RGBA')
        f = F['liana']
        lia = kit.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        lia = lia.crop(lia.getchannel('A').getbbox())
        for i, n in enumerate(['anchor-1', 'anchor-2'] if bgname == 'w7-far' else ['anchor-3', 'anchor-4']):
            sp = sprites[n]
            q = rs(sp, sp.width * s, sp.height * s)
            x = 20 + i * 200
            ax = anchors[n]['ax'] * s
            # (the kit liana, its stem (about a third of its width) scaled to the anchor's liana where it leaves the frame)
            run = sprites.get(n.replace('anchor', 'liana'))
            ky = q.height - 4
            if run is not None:
                run = rs(run, run.width * s, run.height * s)
                rax = anchors[n.replace('anchor', 'liana')]['ax'] * s
                for yy in range(q.height - 2, q.height + 420, run.height):
                    P.alpha_composite(run, (round(x + ax - rax), yy))
                ky = q.height + 400
            kw = max(10, anchors[n]['lianaW'] * s * 2.6)
            ln = rs(lia, kw, lia.height * kw / lia.width)
            P.alpha_composite(ln, (round(x + ax - ln.width / 2), ky))
            P.alpha_composite(q, (x, 0))
        cards.append(P.convert('RGB'))
    S = Image.new('RGB', (PW * 2 + 16, PH + 22), (24, 24, 24))
    d = ImageDraw.Draw(S)
    label(d, (4, 4), 'game size x0.5 on a 390 x 844 phone: each anchor, its own liana run (repeated), then the kit liana (lit, dusk)')
    for i, c in enumerate(cards):
        S.paste(c, (i * (PW + 16), 22))
    return S


import re  # noqa: E402

# ------------------------------------------------------------------------------------------------------------------------------------
def best_joint(a, lo, hi):
    """the darkest horizontal joint row in [lo, hi): mean luminance over the strip, smoothed a little"""
    lum = a[..., :3].mean(axis=2).mean(axis=1)
    lum = ndimage.uniform_filter1d(lum, 3)
    return lo + int(np.argmin(lum[lo:hi]))


def w7walls():
    pick = PICKS[0]
    sprites, anchors = {}, {}
    checks = []
    for s in range(4):
        name = f'wall-{s + 1}'
        im = src_of(name, pick)
        x0 = 48 + s * 308
        strip = im.crop((x0 + 3, 28 + 2, x0 + 260 - 3, 28 + 1160 - 2)).convert('RGBA')  # (inside the strip: all stone, no key)
        a = np.asarray(strip).astype(np.float32)
        k = 220 / strip.width
        want = round(900 / k)                     # source rows for 900 output rows
        y1 = best_joint(a, 8, 120)
        # (the second joint, 900 output rows on, give or take 5%; and an overlap to cross-fade)
        y2 = best_joint(a, y1 + int(want * 0.95), min(a.shape[0] - 40, y1 + int(want * 1.05)))
        ov = min(36, a.shape[0] - y2 - 1)
        body = strip.crop((0, y1, strip.width, min(a.shape[0], y2 + ov)))
        body = rs(body, 220, body.height * 900 / (y2 - y1))
        ovo = body.height - 900
        tile = wrap_v(body, 900, ovo) if ovo > 0 else body.crop((0, 0, 220, 900))
        # (the strips sit side by side: a soft dark joint down both long edges, so any two read as two courses of blocks)
        t = np.asarray(tile).astype(np.float32)
        for xx, f in ((0, 0.55), (1, 0.75), (2, 0.9), (217, 0.9), (218, 0.75), (219, 0.55)):
            t[:, xx, :3] *= f
        tile = Image.fromarray(t.astype(np.uint8), 'RGBA')
        # (tone to the W7 kit's grey-green: green at or above red)
        sprites[name] = tile
        anchors[name] = {'tile': 'vertical', 'src': [int(y1), int(y2)]}
        checks.append(stack3(tile))
    meta = {'anchor': 'none: each strip tiles top to bottom (900 px period) and sits beside any other strip',
            'takes': {n: OVR.get(n, pick) for n in sprites},
            'method': 'img2img (Qwen-Image + slothadv style model) from blockstart.py w7walls; cut at two dark joint rows, the '
                      'overlap cross-faded into the top'}
    write_atlas(sprites, anchors, GAME / 'src/assets/w7', 'temple-walls', meta, width=4 * 224)
    names = sorted(p.stem for p in TAKES.glob('w7walls-*.webp'))
    # 3x stacked check (every strip, three periods), and the four side by side in two orders
    W = Image.new('RGB', (4 * 236, 2700), (24, 24, 24))
    for i, c in enumerate(checks):
        W.paste(c.convert('RGB'), (i * 236, 0))
    W = rs(W, W.width / 2, W.height / 2)
    order = [[0, 1, 2, 3, 0, 2], [3, 1, 0, 2, 1, 3]]
    side = []
    for o in order:
        R = Image.new('RGB', (220 * len(o), 1800))
        for i, j in enumerate(o):
            R.paste(sprites[f'wall-{j + 1}'].convert('RGB'), (i * 220, 0))
            R.paste(sprites[f'wall-{j + 1}'].convert('RGB'), (i * 220, 900))
        side.append(rs(R, R.width / 2, R.height / 2))
    top = Image.new('RGB', (W.width + 16 + side[0].width + 16 + side[1].width, max(W.height, side[0].height) + 22), (24, 24, 24))
    d = ImageDraw.Draw(top)
    label(d, (4, 4), 'x0.5: each strip stacked 3x | six strips side by side, two periods, two orders')
    top.paste(W, (0, 22)); top.paste(side[0], (W.width + 16, 22)); top.paste(side[1], (W.width + 32 + side[0].width, 22))
    parts = [candidates_sheet(names, tw=480), top, phone_mock_walls(sprites)]
    vstack(parts).save(QA / 'w7walls-review.jpg', quality=86)
    print(QA / 'w7walls-review.jpg')


def phone_mock_walls(sprites):
    PW, PH, s = 390, 844, 0.5
    cards = []
    for bgname, order in (('w7-far', [0, 2]), ('w7dusk-far', [3, 1])):
        P = backdrop(PW, PH, bgname)
        F = kitframes()['7']
        kit = Image.open(GAME / 'src/assets/kits/w7.webp').convert('RGBA')
        f = F['branch']
        ledge = kit.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        # a high ledge with two strips of wall under it to the floor, Pokey-sized gap beside
        ly = 330
        for i, j in enumerate(order):
            t = rs(sprites[f'wall-{j + 1}'], 110, 450)
            for yy in range(ly + 20, PH, 450):
                P.alpha_composite(t, (i * 110, yy))
        P.alpha_composite(rs(ledge, 250, 41), (-10, ly))
        cards.append(P.convert('RGB'))
    S = Image.new('RGB', (PW * 2 + 16, PH + 22), (24, 24, 24))
    d = ImageDraw.Draw(S)
    label(d, (4, 4), 'game size x0.5 on a 390 x 844 phone: two strips under a high ledge, stacked to the floor')
    for i, c in enumerate(cards):
        S.paste(c, (i * (PW + 16), 22))
    return S


# ------------------------------------------------------------------------------------------------------------------------------------
FALLS = {  # name: (box in the start/take, kind)
    'fall-narrow': ((40 - 30, 40, 40 + 110 + 30, 760), 'vbody'),
    'fall-medium': ((210 - 30, 40, 210 + 190 + 30, 760), 'vbody'),
    'fall-wide': ((460 - 30, 40, 460 + 300 + 30, 760), 'vbody'),
    'pillar': ((820 - 8, 40, 820 + 190 + 8, 760), 'vrock'),
    'lip-1': ((1070 - 20, 30, 1070 + 380, 40 + 236), 'lip'),
    'lip-2': ((1070 - 20, 280, 1070 + 380, 290 + 236), 'lip'),
    'lip-3': ((1070 - 20, 530, 1070 + 380, 540 + 236), 'lip'),
    'splash-1': ((40, 780, 40 + 620, 800 + 165), 'hfoam'),
    'splash-2': ((700, 780, 700 + 620, 800 + 165), 'hfoam'),
    'mist-1': ((20, 970, 380, 1140), 'soft'),
    'mist-2': ((385, 980, 690, 1140), 'soft'),
    'plume': ((1320, 800, 1536, 1145), 'soft'),
}


def w4falls():
    pick = PICKS[0]
    sprites, anchors, checks = {}, {}, {}
    for name, (box, kind) in FALLS.items():
        im = src_of(name, pick).crop(box)
        if kind == 'vrock':
            sp = opaque_cut(im)
            sp = sp.crop((4, 6, sp.width - 4, sp.height - 6))
            H, ov = sp.height - 90, 90
            tile = wrap_v(sp, H, ov)
            sprites[name], anchors[name] = tile, {'tile': 'vertical'}
            checks[name] = ('v', tile)
        elif kind == 'vbody':
            sp = unmix(im, crop=False)
            sp = sp.crop((0, 6, sp.width, sp.height - 6))
            # (keep the full width: the ragged edges and side streams; crop the empty key either side)
            bb = sp.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
            sp = sp.crop((bb[0], 0, bb[2], sp.height))
            H, ov = sp.height - 110, 110
            tile = wrap_v(sp, H, ov)
            sprites[name], anchors[name] = tile, {'tile': 'vertical'}
            checks[name] = ('v', tile)
        elif kind == 'hfoam':
            sp = unmix(im, crop=False)
            bb = sp.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
            sp = sp.crop((6, bb[1], sp.width - 6, bb[3]))
            W, ov = sp.width - 100, 100
            tile = wrap_h(sp, W, ov)
            sprites[name], anchors[name] = tile, {'tile': 'horizontal', 'ax': tile.width / 2, 'ay': tile.height}
            checks[name] = ('h', tile)
        elif kind == 'lip':
            sp = unmix(im, water_only=False)
            # (the pour ends in dark arched gaps at the cell's foot: cut above them and fade the pour out over its last stretch,
            # so a fall body drawn under the lip joins it with no hard line)
            H0 = sp.height
            cut = int(H0 * 0.8)
            sp = sp.crop((0, 0, sp.width, cut))
            a = np.asarray(sp).astype(np.float32)
            fl = int(cut * 0.24)
            ramp = np.linspace(1, 0, fl) ** 1.3
            a[cut - fl:, :, 3] *= ramp[:, None]
            sp = Image.fromarray(a.astype(np.uint8), 'RGBA')
            # (the rock is opaque: where the cut_cell alpha is solid, use it)
            sprites[name] = sp
            anchors[name] = {'ax': round(sp.width / 2, 1), 'ay': 0, 'note': 'top of the rock; the pour hangs below'}
        else:
            sp = unmix(im)
            sprites[name], anchors[name] = sp, {'ax': round(sp.width / 2, 1), 'ay': sp.height}
    meta = {'anchor': 'tile pieces repeat (vertical or horizontal) with no seam; lips: top middle; mist, plume: foot middle',
            'takes': {n: OVR.get(n, pick) for n in sprites},
            'method': 'img2img (Qwen-Image + slothadv style model) from blockstart.py w4falls; water unmixed from the key (soft '
                      'alpha), tiling pieces cross-faded after the cut'}
    write_atlas(sprites, anchors, GAME / 'src/assets/w4', 'falls', meta)
    names = sorted(p.stem for p in TAKES.glob('w4falls-*.webp'))
    # 3x checks
    vs = [n for n, (o, _) in checks.items() if o == 'v']
    hs = [n for n, (o, _) in checks.items() if o == 'h']
    cks = []
    for col in (DARK, GREY):
        Hh = max(checks[n][1].height for n in vs) * 3
        V = Image.new('RGB', (sum(checks[n][1].width + 20 for n in vs) + 20, Hh + 22), col)
        x = 20
        for n in vs:
            V.paste(stack3(checks[n][1], True, col).convert('RGB'), (x, 22)); x += checks[n][1].width + 20
        d = ImageDraw.Draw(V); label(d, (4, 4), 'each fall body and the pillar stacked 3x (x1)')
        cks.append(rs(V, V.width / 2, V.height / 2))
        Hs = [stack3(checks[n][1], False, col).convert('RGB') for n in hs]
        Hs = [rs(h, h.width / 2, h.height / 2) for h in Hs]
        cks.append(vstack(Hs, 8, col))
    parts = [candidates_sheet(names, tw=640), strip_of({k: v for k, v in sprites.items() if checks.get(k, ('', None))[0] != 'v'}, DARK, 0.6),
             strip_of({k: v for k, v in sprites.items() if checks.get(k, ('', None))[0] != 'v'}, GREY, 0.6)] + cks
    parts.append(phone_mock_falls(sprites))
    vstack(parts).save(QA / 'w4falls-review.jpg', quality=86)
    print(QA / 'w4falls-review.jpg')


def phone_mock_falls(sprites):
    PW, PH, s = 844, 390, 0.5   # sideways
    out = []
    for bg in ('w4-far', 'w4mist-far'):
        P = backdrop(PW, PH, bg)
        F = kitframes()['4']
        kit = Image.open(GAME / 'src/assets/kits/w4.webp').convert('RGBA')
        f = F['bank']
        bank = kit.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h']))
        # pillar strip left, a medium fall from a lip into a splash on a lower ledge, a wide fall far right
        pil = rs(sprites['pillar'], sprites['pillar'].width * s, sprites['pillar'].height * s)
        for yy in range(-40, PH, pil.height):
            P.alpha_composite(pil, (20, yy))
        for (fname, lip, fx, top, floor) in (('fall-medium', 'lip-1', 250, 70, 300), ('fall-wide', 'lip-2', 560, 40, 320)):
            fb = sprites[fname]; fb = rs(fb, fb.width * s, fb.height * s)
            lp = sprites[lip]; lp = rs(lp, lp.width * s, lp.height * s)
            cx = fx + lp.width // 2
            for yy in range(top + 30, floor, fb.height):
                seg = fb.crop((0, 0, fb.width, min(fb.height, floor - yy)))
                P.alpha_composite(seg, (cx - fb.width // 2, yy))
            P.alpha_composite(lp, (fx, top))
            sp = sprites['splash-1']; sp = rs(sp, sp.width * s * 0.6, sp.height * s * 0.6)
            P.alpha_composite(sp.crop((0, 0, min(sp.width, fb.width + 60), sp.height)), (cx - (fb.width + 60) // 2, floor - sp.height + 18))
            P.alpha_composite(rs(bank, 300, 134), (cx - 150, floor))
        m = sprites['mist-1']; m = rs(m, m.width * s, m.height * s)
        P.alpha_composite(m, (430, 300))
        pl = sprites['plume']; pl = rs(pl, pl.width * s, pl.height * s)
        P.alpha_composite(pl, (720, 250))
        out.append(P.convert('RGB'))
    S = Image.new('RGB', (PW, 2 * PH + 40), (24, 24, 24))
    d = ImageDraw.Draw(S)
    label(d, (4, 4), 'game size x0.5, sideways 844 x 390: two falls from rock lips onto ledges, splash, mist, spray, the pillar')
    S.paste(out[0], (0, 22)); S.paste(out[1], (0, 40 + PH))
    return S


# ------------------------------------------------------------------------------------------------------------------------------------
LEDGE_NAMES = ['root-shelf', 'stilt-deck', 'boardwalk', 'wedged-branch']


def walk_top(al):
    """the first row where the middle 60% of the piece is mostly solid"""
    w = al.shape[1]
    mid = al[:, int(w * 0.2):int(w * 0.8)]
    fr = mid.mean(axis=1)
    ys = np.nonzero(fr > 0.7)[0]
    return int(ys[0]) if len(ys) else 0


def w6ledges():
    lpick, ppick = PICKS[0], PICKS[1]
    sprites, anchors = {}, {}
    for short, pick, (cw, ch, cols), ratio, suffix in ((False, lpick, (768, 448, 2), 3.0, 'ledge'),
                                                       (True, ppick, (384, 768, 4), 1.3, 'perch')):
        for i, base in enumerate(LEDGE_NAMES):
            name = f'{base}-{suffix}'
            cx, cy = (i % cols) * cw, (i // cols) * ch
            im = src_of(name, pick).crop((cx + 4, cy + 4, cx + cw - 4, cy + ch - 2))
            full = despill(cut_cell_full(im))
            # (tone to the W6 kit: the repaint shaded the grey-green wood a little lilac (37% of pixels with r and b over g, the
            # kit 7%); pull any r, b excess over g out and cool the blue a touch, so the wood is grey-green like the kit)
            fa = np.asarray(full).astype(np.float32)
            ex = np.clip(np.minimum(fa[..., 0], fa[..., 2]) - fa[..., 1], 0, None)
            fa[..., 0] -= ex; fa[..., 2] -= ex
            fa[..., 2] *= 0.95; fa[..., 0] *= 1.02
            full = Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8), 'RGBA')
            al = np.asarray(full.getchannel('A')) > 128
            ys, xs = np.nonzero(al)
            x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            w = x1 - x0
            tall = full.crop((x0, y0, x1, y1))
            h = round(w / ratio)
            # (the frame at the asked shape: from the top down to w / ratio, supports cut straight at the frame's foot; and the
            # tall frame: the whole painted piece, supports to their painted ends)
            short_f = full.crop((x0, y0, x1, min(y1, y0 + h)))
            top = walk_top(np.asarray(short_f.getchannel('A')) > 128)
            k = (600 if not short else 260) / w
            for nm, im2 in ((name, short_f), (name + '-tall', tall)):
                q = rs(im2, im2.width * k, im2.height * k)
                sprites[nm] = q
                anchors[nm] = {'ax': round(q.width / 2, 1), 'ay': round(top * k, 1),
                               'walkTop': round(top * k, 1), 'note': 'ax, ay: the middle of the flat walkable top'}
    meta = {'anchor': 'ax, ay: middle of the walkable top (put the collider top there). <name>: the asked shape (ledges 3:1, perches '
                      '1.3:1) with the supports cut straight at the frame foot, running on below; <name>-tall: the whole piece',
            'takes': {n: OVR.get(n.replace('-tall', ''), lpick if 'ledge' in n else ppick) for n in sprites},
            'method': 'img2img (Qwen-Image + slothadv style model) from blockstart.py w6ledges / w6perches (W6 kit wood and roots)'}
    write_atlas(sprites, anchors, GAME / 'src/assets/w6', 'ledges', meta)
    names = sorted(p.stem for p in TAKES.glob('w6ledges-*.webp')) + sorted(p.stem for p in TAKES.glob('w6perches-*.webp'))
    shorts = {k: v for k, v in sprites.items() if not k.endswith('-tall')}
    talls = {k: v for k, v in sprites.items() if k.endswith('-tall')}
    parts = [candidates_sheet(names, tw=560), strip_of(shorts, DARK, 0.7), strip_of(shorts, GREY, 0.7),
             strip_of(talls, DARK, 0.5), phone_mock_w6(sprites, anchors)]
    vstack(parts).save(QA / 'w6ledges-review.jpg', quality=86)
    print(QA / 'w6ledges-review.jpg')


def phone_mock_w6(sprites, anchors):
    PW, PH, s = 844, 390, 0.4
    out = []
    hero = Image.open(GAME / 'src/assets/hero/pokey.webp').convert('RGBA') if (GAME / 'src/assets/hero/pokey.webp').exists() else None
    for bg, set_ in (('w6-far', 'ledge'), ('w6dusk-far', 'perch')):
        P = backdrop(PW, PH, bg)
        x = 20
        for i, base in enumerate(LEDGE_NAMES):
            n = f'{base}-{set_}-tall'
            q = sprites[n]; q = rs(q, q.width * s * (1 if set_ == 'ledge' else 1.4), q.height * s * (1 if set_ == 'ledge' else 1.4))
            y = [190, 150, 210, 170][i]
            P.alpha_composite(q.crop((0, 0, q.width, min(q.height, PH - y))), (x, y))
            x += q.width + 25
        out.append(P.convert('RGB'))
    S = Image.new('RGB', (PW, 2 * PH + 40), (24, 24, 24))
    d = ImageDraw.Draw(S)
    label(d, (4, 4), 'game size (ledges x0.4, perches x0.56), sideways 844 x 390, on the W6 backdrops, tall frames running down')
    S.paste(out[0], (0, 22)); S.paste(out[1], (0, 40 + PH))
    return S


{'w7anchors': w7anchors, 'w7walls': w7walls, 'w4falls': w4falls, 'w6ledges': w6ledges}[SHEET]()
