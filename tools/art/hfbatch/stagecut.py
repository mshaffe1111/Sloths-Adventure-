"""Cut and pack the every-stage pieces (hf-art-stage, 2026-10-29) from the img2img takes named in stage-picks.json: keyed with the repo's
cut and despill (w6to10/geminicut.py cut_cell: border flood, soft rim, the key's spill clamped off the fringe), loose crumbs and stray
streaks dropped (anything under 2% of the piece), each pair (shut/open, unlit/lit) scaled by one factor so the two line up, then:
  src/assets/props/stage-art.webp + src/game/stageArtData.ts   the shared sheet: flagUnlit, flagLit, heart, superHeart, speed, shield,
                                                               magnet, thornShut, thornOpen, fern, fernLit, bell, bellLit, netWhole, netTorn
  src/assets/props/gates/w<N>.webp                             each world's gate, shut and open (GATE_FRAMES)
  src/assets/props/pitwater/w<N>.webp                          the water strip (made to tile: its ends cross-faded) and its shine
                                                               (PIT_WATER: the strip's surface line and the deep colour under it)
  reference/prop-sheets/qa-notes/hf-art-stage/review-*.jpg      every take, and the picks on dark and on mid-grey
The fern's and the bell's lit frames are their plain frames re-lit (warm, brighter, a pale rim), so the game can breathe one over the
other with no ghosting; the flag's lit frame is its own painting (a glowing bead and a gold-green pennant).
    python3 -I tools/art/hfbatch/stagecut.py <takes dir>
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

HERE = Path(__file__).resolve().parent
R = HERE.parents[2]
sys.path.insert(0, str(HERE.parent / 'w6to10'))
from geminicut import cut_cell  # noqa: E402
sys.path.insert(0, str(HERE))
from stagestarts import GATE, fill_door_gaps  # noqa: E402

TAKES = Path(sys.argv[1])
PICKS = json.loads((HERE / 'stage-picks.json').read_text())
QA = R / 'reference/prop-sheets/qa-notes/hf-art-stage'
QA.mkdir(parents=True, exist_ok=True)


def take(name):
    return Image.open(TAKES / f'{name}.webp').convert('RGB')


def clean(im, keep=0.02):
    """drop parts smaller than `keep` of the biggest (streaks, sparkles, crumbs)"""
    a = np.asarray(im).copy()
    lab, n = ndimage.label(a[..., 3] > 40)
    if n > 1:
        sizes = ndimage.sum(np.ones(lab.shape), lab, range(1, n + 1))
        big = sizes.max()
        for i, s in enumerate(sizes, 1):
            if s < big * keep:
                a[lab == i, 3] = 0
    out = Image.fromarray(a, 'RGBA')
    bb = out.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox()
    return out.crop(bb)


def despill(im, key):
    """a second, wider despill on the band next to the transparency (the model paints the thin outline with some key in it)"""
    a = np.asarray(im).astype(np.float32)
    band = ndimage.binary_dilation(a[..., 3] < 128, iterations=4) & (a[..., 3] > 0)
    if key == 'magenta':
        ex = np.clip(np.minimum(a[..., 0], a[..., 2]) - a[..., 1] - 6, 0, None) * band
        a[..., 0] -= ex; a[..., 2] -= ex
    else:
        ex = np.clip(np.minimum(a[..., 1], a[..., 2]) - a[..., 0] - 6, 0, None) * band
        a[..., 1] -= ex; a[..., 2] -= ex
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def cut(src, box, key, keep=0.02):
    sp = cut_cell(src.crop(box), key, {})
    return despill(clean(sp, keep), key)


def halves(src, key, keep=0.02):
    w, h = src.size
    return cut(src, (0, 0, w // 2, h), key, keep), cut(src, (w // 2, 0, w, h), key, keep)


def scale_pair(a, b, H):
    k = H / max(a.height, b.height)
    return [im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS) for im in (a, b)]


def fit_box(im, W, H):
    k = min(W / im.width, H / im.height)
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)


def relit(im):
    """the plain frame lit warm: brighter, golden, with a pale rim along the outline"""
    a = np.asarray(im).astype(np.float32)
    a[..., 0] = a[..., 0] * 1.1 + 22
    a[..., 1] = a[..., 1] * 1.08 + 16
    a[..., 2] = a[..., 2] * 0.96 + 4
    rim = ndimage.binary_dilation(a[..., 3] < 100, iterations=3) & (a[..., 3] >= 100)
    a[rim, :3] = a[rim, :3] * 0.5 + np.array([255, 240, 190]) * 0.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def flag_anchor(im):
    """the post's foot (bottom middle of the post) and where the post ends and the pennant begins"""
    a = np.asarray(im)[..., 3] > 100
    h = a.shape[0]
    band = a[int(h * 0.55):int(h * 0.8)]
    cols = np.where(band.any(axis=0))[0]
    x0, x1 = cols.min(), cols.max()
    return (x0 + x1) / 2, h - 2, int(x1 + 6)


pieces = {}  # name -> (image, ax, ay, extra)

# the checkpoint (unlit, lit): 384 tall, anchored at the post's foot
u, l = scale_pair(*halves(take(PICKS['flag']), 'magenta'), 384)
for n, im in (('flagUnlit', u), ('flagLit', l)):
    ax, ay, px = flag_anchor(im)
    pieces[n] = (im, ax, ay, {'px': px})

# pickups: a 3 x 2 grid on cyan; each centred, 160 px
src = take(PICKS['pickups'])
cw, ch = src.width // 3, src.height // 2
for i, n in enumerate(['heart', 'superHeart', 'speed', 'shield', 'magnet']):
    im = fit_box(cut(src, ((i % 3) * cw, (i // 3) * ch, (i % 3 + 1) * cw, (i // 3 + 1) * ch), 'cyan'), 160, 160)
    pieces[n] = (im, im.width / 2, im.height / 2, {})

# the Thorn Gate (shut, open), 256, centred
s_, o_ = scale_pair(*halves(take(PICKS['thorn']), 'cyan'), 256)
pieces['thornShut'] = (s_, s_.width / 2, s_.height / 2, {})
pieces['thornOpen'] = (o_, o_.width / 2, o_.height / 2, {})

# the finds: the plain fern and bell (left column of the 2 x 2), 256 tall, their lit frames re-lit from them; anchored at the foot
src = take(PICKS['finds'])
cw, ch = src.width // 2, src.height // 2
for row, n in ((0, 'fern'), (1, 'bell')):
    im = fit_box(cut(src, (0, row * ch, cw, (row + 1) * ch), 'cyan'), 256, 256)
    pieces[n] = (im, im.width / 2, im.height - 2, {})
    pieces[n + 'Lit'] = (relit(im), im.width / 2, im.height - 2, {})

# 4-8's netting (whole, torn), 192 tall, anchored at the pegs' feet (bottom middle)
w_, t_ = scale_pair(*halves(take(PICKS['net']), 'magenta', keep=0.004), 192)
pieces['netWhole'] = (w_, w_.width / 2, w_.height - 2, {})
pieces['netTorn'] = (t_, t_.width / 2, t_.height - 2, {})


def pack(items, width=1024, pad=4):
    """shelf-pack (name, image) by height; returns the sheet and {name: (x, y)}"""
    items = sorted(items, key=lambda t: -t[1].height)
    x = y = shelf = 0
    at = {}
    for n, im in items:
        if x + im.width > width:
            x, y, shelf = 0, y + shelf + pad, 0
        at[n] = (x, y)
        x += im.width + pad
        shelf = max(shelf, im.height)
    sheet = Image.new('RGBA', (width, y + shelf), (0, 0, 0, 0))
    for n, im in items:
        sheet.alpha_composite(im, at[n])
    return sheet, at


sheet, at = pack([(n, p[0]) for n, p in pieces.items()])
out = R / 'src/assets/props/stage-art.webp'
sheet.save(out, 'WEBP', quality=90, method=6)
print(out, sheet.size, out.stat().st_size)
frames = {}
for n, (im, ax, ay, ex) in pieces.items():
    x, y = at[n]
    frames[n] = {'x': x, 'y': y, 'w': im.width, 'h': im.height, 'ax': round(ax), 'ay': round(ay), **ex}

# the gates: shut and open side by side, 640 tall
gates = {}
for key in sorted(k for k in PICKS if k.startswith('gate-w')):
    w = int(key[6:])
    src = take(PICKS[key])
    if w in GATE:
        # (the key showing through between the door and the pillars: filled with the door way's dark, stagestarts.fill_door_gaps)
        shut = cut(fill_door_gaps(src.crop((0, 0, 768, 960)), w), (0, 0, 768, 960), 'magenta')
    else:
        shut = cut(src, (0, 0, src.width // 2, src.height), 'magenta')
    if f'gateopen-w{w}' in PICKS:
        o = take(PICKS[f'gateopen-w{w}'])
        opn = cut(fill_door_gaps(o, w) if w in GATE else o, (0, 0, o.width, o.height), 'magenta')
    else:
        opn = cut(src, (src.width // 2, 0, src.width, src.height), 'magenta')
    s_, o_ = scale_pair(shut, opn, 640)
    g = Image.new('RGBA', (s_.width + o_.width + 4, 640), (0, 0, 0, 0))
    g.alpha_composite(s_, (0, 640 - s_.height))
    g.alpha_composite(o_, (s_.width + 4, 640 - o_.height))
    p = R / f'src/assets/props/gates/w{w}.webp'
    p.parent.mkdir(parents=True, exist_ok=True)
    g.save(p, 'WEBP', quality=90, method=6)
    print(p, g.size, p.stat().st_size)
    gates[w] = {'shut': {'x': 0, 'y': 640 - s_.height, 'w': s_.width, 'h': s_.height, 'ax': round(s_.width / 2), 'ay': s_.height - 2},
                'open': {'x': s_.width + 4, 'y': 640 - o_.height, 'w': o_.width, 'h': o_.height, 'ax': round(o_.width / 2), 'ay': o_.height - 2}}
    pieces[f'gate-w{w}-shut'] = (s_, 0, 0, {})
    pieces[f'gate-w{w}-open'] = (o_, 0, 0, {})


def tileable(im, n=160):
    """cross-fade the strip's right end into its left so copies meet with no seam; the strip comes back n px shorter"""
    a = np.asarray(im).astype(np.float32)
    W = a.shape[1]
    ramp = np.linspace(0, 1, n)[None, :, None]
    body = a[:, :W - n].copy()
    body[:, :n] = a[:, :n] * ramp + a[:, W - n:] * (1 - ramp)
    return Image.fromarray(np.clip(body, 0, 255).astype(np.uint8), 'RGBA')


water = {}
for key in sorted(k for k in PICKS if k.startswith('water-w')):
    w = int(key[7:])
    src = take(PICKS[key])
    sp = cut_cell(src, 'magenta', {'pockets': False})
    # (cut_cell crops to the water: put it back on the full strip so the surface line keeps its place)
    full = Image.new('RGBA', src.size, (0, 0, 0, 0))
    a = np.asarray(cut_cell(src, 'magenta', {'pockets': False}).convert('RGBA'))
    bb_top = src.height - a.shape[0]
    full.alpha_composite(Image.fromarray(a, 'RGBA'), (0, bb_top))
    full = despill(full, 'magenta')
    strip = tileable(full).resize((1024, 256), Image.LANCZOS)
    sa = np.asarray(strip).astype(np.float32)
    alpha = sa[..., 3] / 255
    surf_rows = np.where(alpha.mean(axis=1) > 0.6)[0]
    surface = float(surf_rows.min()) / sa.shape[0] if len(surf_rows) else 0.3
    deep = sa[-6:, :, :3].reshape(-1, 3).mean(axis=0)
    # the shine: the strip's own highlights, lifted off it (whitened, on transparency), to slide over it
    lum = sa[..., :3].mean(axis=2)
    thr = np.percentile(lum[alpha > 0.9], 93)
    sh = np.zeros_like(sa)
    sh[..., :3] = np.clip(sa[..., :3] * 0.4 + 170, 0, 255)
    sh[..., 3] = np.clip((lum - thr) / 40, 0, 1) * 255 * alpha
    shine = Image.fromarray(sh.astype(np.uint8), 'RGBA')
    wsheet = Image.new('RGBA', (1024, 516), (0, 0, 0, 0))
    wsheet.alpha_composite(strip, (0, 0))
    wsheet.alpha_composite(shine, (0, 260))
    p = R / f'src/assets/props/pitwater/w{w}.webp'
    p.parent.mkdir(parents=True, exist_ok=True)
    wsheet.save(p, 'WEBP', quality=88, method=6)
    print(p, wsheet.size, p.stat().st_size, 'surface', round(surface, 3))
    water[w] = {'strip': {'x': 0, 'y': 0, 'w': 1024, 'h': 256, 'ax': 0, 'ay': 0}, 'shine': {'x': 0, 'y': 260, 'w': 1024, 'h': 256, 'ax': 0, 'ay': 0},
                'surface': round(surface, 3), 'deep': '#%02x%02x%02x' % tuple(int(v) for v in deep)}
    pieces[f'water-w{w}'] = (strip, 0, 0, {})

names = [n for n in frames]
ts = ['/**',
      ' * Generated by tools/art/hfbatch/stagecut.py (hf-art-stage, 2026-10-29) from the Hugging Face img2img takes in stage-picks.json. Do',
      ' * not edit by hand. Where each painted every-stage piece sits in its sheet (stageArt.ts draws them): x, y, w, h in the sheet, and',
      ' * (ax, ay) the anchor in the piece: a post\'s or a gate\'s foot, a nest net\'s pegs\' feet, a pickup\'s or the Thorn Gate\'s middle.',
      ' * px: the flag post\'s right edge (the pennant, right of it, is drawn in fluttering slices).',
      ' */',
      'export interface ArtFrame { x: number; y: number; w: number; h: number; ax: number; ay: number; px?: number }',
      f"export type StageArtName = {' | '.join(repr(n) for n in names)};",
      f'export const STAGE_ART_SIZE = {{ w: {sheet.width}, h: {sheet.height} }};',
      f'export const STAGE_ART_FRAMES: Record<StageArtName, ArtFrame> = {json.dumps(frames)};',
      '/** each world\'s exit gate (assets/props/gates/w<N>.webp) */',
      f'export const GATE_FRAMES: Record<number, {{ shut: ArtFrame; open: ArtFrame }}> = {json.dumps({str(k): v for k, v in gates.items()})};',
      '/** pit water (assets/props/pitwater/w<N>.webp): the strip, its shine, how far down the strip its surface is, and the deep colour under it */',
      f'export const PIT_WATER: Record<number, {{ strip: ArtFrame; shine: ArtFrame; surface: number; deep: string }}> = {json.dumps({str(k): v for k, v in water.items()})};',
      '']
(R / 'src/game/stageArtData.ts').write_text('\n'.join(ts))
print('stageArtData.ts', len(frames), 'pieces', len(gates), 'gates', len(water), 'waters')

# review sheets: the picks on dark and on mid-grey, at full size and at phone size (x0.3)
for label, col in (('dark', (20, 16, 24)), ('grey', (128, 128, 128))):
    ims = [(n, p[0]) for n, p in pieces.items()]
    W = 1600
    x = y = shelf = 0
    pos = []
    for n, im in ims:
        k = min(1, 300 / im.height)
        im2 = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
        small = im.resize((max(1, round(im2.width * 0.3)), max(1, round(im2.height * 0.3))), Image.LANCZOS)
        w_ = im2.width + small.width + 16
        if x + w_ > W:
            x, y, shelf = 0, y + shelf + 26, 0
        pos.append((n, im2, small, x, y))
        x += w_ + 12
        shelf = max(shelf, im2.height)
    S = Image.new('RGBA', (W, y + shelf + 30), col + (255,))
    d = ImageDraw.Draw(S)
    for n, im2, small, x, y in pos:
        S.alpha_composite(im2, (x, y + 18))
        S.alpha_composite(small, (x + im2.width + 8, y + 18 + im2.height - small.height))
        d.text((x + 2, y + 3), n, fill=(255, 230, 0))
    p = QA / f'review-picks-{label}.jpg'
    S.convert('RGB').save(p, 'JPEG', quality=86)
    print(p, S.size)
