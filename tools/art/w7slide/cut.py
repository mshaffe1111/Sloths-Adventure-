"""Cut and pack the 7-4 slide art (2026-10-29) from the unpacked img2img results (w5/unpack_carrier.py -> tools/art/w7slide/raw/).

    python3 -I tools/art/w7slide/cut.py

picks.json names the take used for each piece. Writes src/assets/w7slide/ (nothing imports it yet; the w7-slide builder wires it in):
  chute-floor.webp        1024 sq, seamless both ways (repeats along the chute and across it)
  chute-wall-roots.webp   1024 sq, seamless both ways
  chute-wall-glyph.webp   1024 sq, seamless both ways
  chute-mouth.webp        the chute vanishing into the torch-lit dark, the backdrop behind the far end of the chute
  chamber.webp            2048 wide, the side-on chamber he shoots out into
  obstacles.webp          the six obstacles seen from the front, cut from the magenta, in one atlas
  pokey-slide.webp        (only if any still stayed on model) Pokey from behind
  manifest.json           every file, its size, the atlases' frames (x, y, w, h, anchor at the middle of the bottom edge) and notes
and the QA pictures in reference/prop-sheets/qa-notes/7-4-slide-art/ (3x tiled previews on dark, the cut-outs on dark, a contact sheet).
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

H = Path(__file__).resolve().parent
REPO = H.parents[2]
RAW = H / 'raw'
OUT = REPO / 'src/assets/w7slide'
QA = REPO / 'reference/prop-sheets/qa-notes/7-4-slide-art'
PICKS = json.loads((H / 'picks.json').read_text())
DARK = (22, 24, 28)


def raw(name):
    return Image.open(RAW / f'{name}.webp').convert('RGB')


def seamless(im, band=0.22):
    """repeat-ready both ways: blend the picture with itself rolled by half, the rolled copy taking over near the edges (where the
    picture's own wrap would show a seam) and the picture itself in the middle"""
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    r = np.roll(np.roll(a, h // 2, 0), w // 2, 1)

    def ramp(n):
        x = np.minimum(np.arange(n), np.arange(n)[::-1]) / (n * band)
        return np.clip(x, 0, 1)
    wgt = np.minimum.outer(ramp(h), ramp(w))[..., None]
    wgt = wgt * wgt * (3 - 2 * wgt)  # smoothstep
    return Image.fromarray((a * wgt + r * (1 - wgt)).clip(0, 255).astype(np.uint8))


def seamless_periodic(im, P=512, m=96):
    """for the walls: their starts were a 512 px panel tiled 2 x 2, so the paint repeats about every 512 px. Near each far edge fade
    into the copy one period back, so the last column leads on into the first with no seam and no half-roll ghosting in the middle"""
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    t = (np.arange(m) + 1) / m
    t = (t * t * (3 - 2 * t))
    for axis, n in ((1, w), (0, h)):
        idx = np.arange(n - m, n)
        cur = np.take(a, idx, axis=axis)
        back = np.take(a, idx - P, axis=axis)
        shape = [1, 1, 1]; shape[axis] = m
        blend = cur * (1 - t.reshape(shape)) + back * t.reshape(shape)
        if axis == 1:
            a[:, n - m:] = blend
        else:
            a[n - m:] = blend
    # the last row/column is now the one a period back from the end; the first is a period's start, so the wrap reads as the interior
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def seam_repair(key, repaint, half=72, feather=34):
    """the rolled texture (seamstarts.py) with the model's low-strength repaint kept only in feathered bands over its seam lines"""
    import sys
    sys.path.insert(0, str(H))
    from seamstarts import ROLL, rolled
    a = np.asarray(rolled(key)).astype(np.float32)
    b = np.asarray(raw(repaint)).astype(np.float32)
    h, w = a.shape[:2]
    dy, dx = ROLL[key]

    def band(n, lines):
        x = np.arange(n)[:, None]
        d = np.min(np.abs(x - np.array(lines)[None, :]), axis=1)
        return np.clip((half + feather - d) / feather, 0, 1)
    my = band(h, [dy] if dy == 512 else [256, 768]) if dy else np.zeros(h)
    mx = band(w, [512] if dx == 512 else [256, 768]) if dx else np.zeros(w)
    m = np.maximum(my[:, None], mx[None, :])[..., None]
    m = m * m * (3 - 2 * m)
    return Image.fromarray((a * (1 - m) + b * m).clip(0, 255).astype(np.uint8))


def patch_floor(im, half=100, rows=130):
    """the chamber's start had the chute groove in the middle of its floor strip, which the paint kept as a pale block: cover it with
    the floor just left of it, feathered in"""
    a = np.asarray(im).astype(np.float32)
    h, w = a.shape[:2]
    cx = w // 2
    src = a[h - rows:, cx - 3 * half:cx - half].copy()
    dst = a[h - rows:, cx - half:cx + half]
    f = np.clip(np.minimum(np.arange(2 * half), np.arange(2 * half)[::-1]) / 30, 0, 1)[None, :, None]
    a[h - rows:, cx - half:cx + half] = src * f + dst * (1 - f)
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def tiled(im, n=3, scale=0.5):
    t = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    out = Image.new('RGB', (t.width * n + 2 * 16, t.height * n + 2 * 16), DARK)
    for y in range(n):
        for x in range(n):
            out.paste(t, (16 + x * t.width, 16 + y * t.height))
    return out


def seam_score(im):
    """mean step across the wrap edges vs the mean step inside: about 1 means no visible seam"""
    a = np.asarray(im).astype(np.float32)
    inner = (np.abs(np.diff(a, axis=1)).mean() + np.abs(np.diff(a, axis=0)).mean()) / 2
    wrap = (np.abs(a[:, 0] - a[:, -1]).mean() + np.abs(a[0] - a[-1]).mean()) / 2
    return round(float(wrap / inner), 2)


def key_magenta(im):
    """alpha from the flat magenta: distance from the key, then the pink spill pulled out of the soft edge"""
    a = np.asarray(im).astype(np.float32)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mag = np.minimum(r, b) - g  # high on magenta, low on stone, roots, moss
    alpha = np.clip((150 - mag) / 90, 0, 1)
    fig = alpha > 0.5
    lab, n = ndimage.label(fig)
    if n:
        sizes = ndimage.sum(fig, lab, range(1, n + 1))
        fig = np.isin(lab, 1 + np.flatnonzero(sizes > 1500))
    fig = ndimage.binary_fill_holes(fig) & (alpha > 0.02) | fig
    alpha = np.where(ndimage.binary_erosion(fig, iterations=2), 1.0, np.where(fig, alpha, 0.0))
    # despill: nothing in these pieces is meant to be magenta (grey stone has b ~ g, brown roots and moss b < g), so wherever blue
    # stands above green the key leaked in: take that excess out of both red and blue
    spill = np.clip(np.minimum(r, b) - g, 0, None)
    a[..., 0] -= spill; a[..., 2] -= spill
    fig = ndimage.binary_erosion(fig, iterations=1)
    alpha = np.where(fig, alpha, 0.0)
    edge = fig & ~ndimage.binary_erosion(fig, iterations=3)
    a[edge] = a[edge] * 0.75  # a hint of the dark outline the kit pieces carry
    rgba = np.dstack([a.clip(0, 255), (alpha * 255)]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA'), fig


def cells(rgba, fig, cols=3, rows=2):
    """the biggest piece (plus anything near it) in each grid cell, trimmed"""
    W, Hh = rgba.size
    out = []
    lab, n = ndimage.label(ndimage.binary_dilation(fig, iterations=8))
    for j in range(rows):
        for i in range(cols):
            x0, y0, x1, y1 = i * W // cols, j * Hh // rows, (i + 1) * W // cols, (j + 1) * Hh // rows
            sub = lab[y0:y1, x0:x1]
            ids, counts = np.unique(sub[sub > 0], return_counts=True)
            keep = ids[counts > counts.max() * 0.08] if len(ids) else []
            m = np.isin(lab, keep) & fig
            m[:, :x0] = False; m[:, x1:] = False; m[:y0] = False; m[y1:] = False
            ys, xs = np.nonzero(m)
            box = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
            piece = rgba.crop(box)
            pa = np.asarray(piece).copy()
            pa[..., 3] = np.where(m[box[1]:box[3], box[0]:box[2]], pa[..., 3], 0)
            out.append(Image.fromarray(pa, 'RGBA'))
    return out


def key_grey(im):
    import sys
    sys.path.insert(0, str(H.parent / 'train'))
    from clips import key
    a = np.asarray(im)
    m = key(a) > 128
    # the sheet's pale sticker rim: peel edge pixels that are pale and unsaturated, a ring at a time
    pale = (a.min(-1) > 165) & (a.max(-1).astype(int) - a.min(-1) < 70)
    for _ in range(6):
        edge = m & ~ndimage.binary_erosion(m)
        m &= ~(edge & pale)
    m = ndimage.binary_opening(m, iterations=3)  # drops the thin slope line left under a hand
    lab, n = ndimage.label(m)
    m = lab == 1 + int(np.argmax(ndimage.sum(m, lab, range(1, n + 1))))
    m = ndimage.binary_erosion(m, iterations=3)
    alpha = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8)))
    return Image.fromarray(np.dstack([a, alpha]), 'RGBA')


def trim(im):
    a = np.asarray(im)[..., 3]
    ys, xs = np.nonzero(a > 8)
    return im.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))


def pack(pieces, maxw=2048, pad=4):
    x = y = row = 0
    pos = {}
    for n, p in pieces:
        if x + p.width > maxw:
            x, y, row = 0, y + row + pad, 0
        pos[n] = (x, y)
        x, row = x + p.width + pad, max(row, p.height)
    sheet = Image.new('RGBA', (maxw, y + row), (0, 0, 0, 0))
    frames = {}
    for n, p in pieces:
        sheet.alpha_composite(p, pos[n])
        frames[n] = {'x': pos[n][0], 'y': pos[n][1], 'w': p.width, 'h': p.height, 'ax': p.width / 2, 'ay': p.height}
    return sheet, frames


def on_dark(pieces, tw=300, cols=3, title=''):
    th = 300
    rows = (len(pieces) + cols - 1) // cols
    S = Image.new('RGB', (cols * tw, rows * (th + 18) + 24), DARK)
    d = ImageDraw.Draw(S)
    d.text((6, 6), title, fill=(255, 255, 255))
    for i, (n, p) in enumerate(pieces):
        k = min((tw - 16) / p.width, (th - 16) / p.height)
        q = p.resize((max(1, round(p.width * k)), max(1, round(p.height * k))), Image.LANCZOS)
        x, y = (i % cols) * tw, 24 + (i // cols) * (th + 18)
        q = q.convert('RGBA')
        S.paste(q, (x + (tw - q.width) // 2, y + 18 + (th - q.height) // 2), q)
        d.text((x + 4, y + 2), n, fill=(255, 220, 120))
    return S


def save_webp(im, path, q=90):
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, 'WEBP', quality=q, method=6)
    return path.stat().st_size


def crumble_frames(im, n=4):
    """the four crumble frames: each quarter keyed from the magenta, all cut to one shared box so the frames line up when played"""
    rgba, fig = key_magenta(im)
    W, Hh = rgba.size
    cw = W // n
    boxes = []
    for i in range(n):
        m = fig[:, i * cw:(i + 1) * cw]
        ys, xs = np.nonzero(m)
        boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
    x0 = min(b[0] for b in boxes); y0 = min(b[1] for b in boxes); x1 = max(b[2] for b in boxes); y1 = max(b[3] for b in boxes)
    return [(f'crumble-{i}', rgba.crop((i * cw + x0, y0, i * cw + x1, y1))) for i in range(n)]


TEX = [  # (pick key, file, seamless, use)
    ('floor2', 'chute-floor-3lane', 'top to bottom (along the chute)',
     'the chute floor, seen straight down, three lanes: grooves at x = 1/3 and 2/3; repeat it down the chute'),
    ('floor', 'chute-floor-1groove', 'top to bottom (along the chute)', 'a one-groove floor (round 1), spare'),
    ('wall-roots', 'chute-wall-roots', 'both ways', 'chute wall: carved key-pattern stone with fig roots; repeat it along the chute'),
    ('wall-glyph', 'chute-wall-glyph', 'both ways', 'chute wall variant: glyph tablets and a carved band; mix with wall-roots'),
    ('ceiling', 'chute-ceiling', 'both ways', 'the chute ceiling seen from below: dark slabs, fig roots across them'),
]


def main():
    OUT.mkdir(parents=True, exist_ok=True); QA.mkdir(parents=True, exist_ok=True)
    for f in OUT.glob('*'):
        f.unlink()
    man = {'note': '7-4 "The Way Down" slide art: Hugging Face img2img (Qwen-Image + the slothadv style model) from paste-ups of '
                   "World 7's own kit and made props (tools/art/w7slide/envstarts.py, envstarts2.py), cut by tools/art/w7slide/cut.py, "
                   '2026-10-29. Not wired in yet.', 'takes': PICKS, 'files': {}}
    prev = []
    for key, fn, way, use in TEX:
        im = seam_repair(key, PICKS['seam'][key])
        sz = save_webp(im, OUT / f'{fn}.webp')
        tiled(im).save(QA / f'{fn}-tiled3x.jpg', quality=86)
        man['files'][f'{fn}.webp'] = {'w': im.width, 'h': im.height, 'bytes': sz, 'seamless': way, 'use': use}
        prev.append((fn, im))
    for key, fn, use in (('mouth-bright', 'chute-end-light', 'the way out at the end of the chute: daylight and leaves seen from inside '
                                                             '(vanishing point about x 0.5, y 0.42)'),
                         ('mouth', 'chute-far-dark', 'the chute running on into torch-lit dark (vanishing point about x 0.5, y 0.42), '
                                                     'the far view before the light shows')):
        m = raw(PICKS[key])
        man['files'][f'{fn}.webp'] = {'w': m.width, 'h': m.height, 'bytes': save_webp(m, OUT / f'{fn}.webp'), 'use': use}
        prev.append((fn, m))
    c = raw(PICKS['chamber2'])
    c = c.resize((2048, round(c.height * 2048 / c.width)), Image.LANCZOS)
    man['files']['chamber.webp'] = {'w': c.width, 'h': c.height, 'bytes': save_webp(c, OUT / 'chamber.webp'),
                                    'use': "side-on: the chamber he shoots out into; the chute's mouth is high on the left "
                                           '(its spout lip about x 0.02-0.22, y 0.70); stone floor is the bottom ~15%'}
    prev.append(('chamber', c))
    # obstacles: round 2 (made for the builder's list) and the round-1 pieces it can still use
    r2, f2 = key_magenta(raw(PICKS['obstacles2']))
    pieces = [(n, trim(p)) for n, p in zip(['lintel-a', 'rubble-wide-a', 'gap-near-lip', 'lintel-b', 'rubble-wide-b', 'gap-far-lip'],
                                           cells(r2, f2))]
    r1, f1 = key_magenta(raw(PICKS['obstacles']))
    c1 = cells(r1, f1)
    rh, fh = key_magenta(raw(PICKS['obstacle_overrides']['statue-head']))
    pieces += [('statue-head', trim(cells(rh, fh)[1])), ('rubble-pile', trim(c1[4])), ('roots-tangle', trim(c1[5]))]
    sheet, frames = pack(pieces)
    man['files']['obstacles.webp'] = {'w': sheet.width, 'h': sheet.height, 'bytes': save_webp(sheet, OUT / 'obstacles.webp', 92),
                                      'frames': frames, 'anchor': 'ax, ay: middle of the bottom edge (where it stands on the chute floor)',
                                      'use': 'obstacles seen from the front (from behind Pokey); lintels: duck under the slab, the posts '
                                             'stand at the chute sides; gap-near-lip: the floor ending before a gap; gap-far-lip: the '
                                             'broken front face of the floor after it; rubble-wide: jump; statue-head, rubble-pile, '
                                             'roots-tangle: one-lane blockers'}
    on_dark(pieces, title='7-4 obstacles, cut from the magenta, on dark').save(QA / 'obstacles-on-dark.jpg', quality=88)
    cr = crumble_frames(raw(PICKS['crumble']))
    csheet, cframes = pack(cr)
    man['files']['crumble.webp'] = {'w': csheet.width, 'h': csheet.height, 'bytes': save_webp(csheet, OUT / 'crumble.webp', 92),
                                    'frames': cframes, 'use': 'side-on: the hall floor giving way, frames 0-3 (whole, cracked, breaking, '
                                                              'falling); every frame shares one box, so they line up'}
    on_dark(cr, cols=4, title='7-4 crumble frames on dark').save(QA / 'crumble-on-dark.jpg', quality=88)
    if PICKS.get('pokey'):  # optional: the on-model stills (no clip stayed on model)
        pk = [(n, trim(key_grey(raw(s)))) for n, s in PICKS['pokey'].items()]
        pk = [(n, p.resize((round(p.width * 512 / p.height), 512), Image.LANCZOS)) for n, p in pk]
        psheet, pframes = pack(pk)
        man['files']['pokey-slide-stills.webp'] = {
            'w': psheet.width, 'h': psheet.height, 'bytes': save_webp(psheet, OUT / 'pokey-slide-stills.webp', 92), 'frames': pframes,
            'anchor': 'middle of the bottom edge', 'satchel': 'strap from his left shoulder (screen left) to the bag on his right hip '
                                                               '(screen right), checked on every still',
            'use': "optional: Pokey from behind, repainted on model with his character model from slomatt/02 cells 1 (flipped), 10 and "
                   "14; the Hugging Face clips from them were all thrown away (see the report). Do not mirror lean-left for a right "
                   "lean: a mirror puts the satchel on the wrong side."}
        on_dark(pk, title='Pokey from behind (HF stills), keyed, on dark').save(QA / 'pokey-on-dark.jpg', quality=88)
    (OUT / 'manifest.json').write_text(json.dumps(man, indent=1))
    on_dark(prev + pieces + cr, tw=340, cols=4, title='7-4 The Way Down: art pack (src/assets/w7slide), on dark').save(QA / 'contact.jpg', quality=86)
    for f, v in man['files'].items():
        if 'w' in v:
            print(f, v['w'], v['h'], v['bytes'])


if __name__ == '__main__':
    main()
