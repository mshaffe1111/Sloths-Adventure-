"""Pack World 1's drop-trap pieces (ART-W1, 2026-11-12; the lead's picks of contact-sheet-1 and Matt's hive sheet) into one small atlas,
src/assets/props/w1-traps.webp, and write its frame table and the measures the draw code needs, src/game/w1TrapsData.ts (generated:
never hand-edit). Every piece is defringed (tools/art/edges/defringe.py: no dark rim, no key spill) and stored at no more than
PX atlas px per game unit at its usual size. Review sheet: reference/qa-reports/ART-W1/pieces-on-dark-and-light.jpg.

    python3 -I tools/art/w1traps/pack.py <takes root: cuts/, r4cut/> '{"tendril": "<seed>", "stake": ..., "vineLong": ...}'
"""
import importlib.util, json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = Path(__file__).resolve().parents[3]


def _load(name, path):
    sp = importlib.util.spec_from_file_location(name, path)
    m = importlib.util.module_from_spec(sp)
    sp.loader.exec_module(m)
    return m


hfcut = _load('hfcut', ROOT / 'tools/art/hfprops/cut.py')
sys.argv, ARGS = sys.argv[:1], sys.argv[1:]
defr = _load('defr', ROOT / 'tools/art/edges/defringe.py')
T = Path(ARGS[0])
PX = 4  # atlas px per game unit (hf-props' rule: sharp at 2x on a phone at the game's zoom)
POKEY = 89.1

# ART-W1B (2026-11-12): the pieces the lead kept are taken from the shipped atlas byte for byte (KEEP); the new ones are cut from
# the takes (PIECES). Out: Matt's hive frames (a brown cocoon at phone size: hive A, the lead's call), the stone's knotted net (B:
# the vines-wrapped stone A instead), the tendril's saw-cut stake (World 1 has no made things: a living root hoop instead).
KEEP = {'sapling': 'the anchor: a bent sapling, the load hangs under its crown (anchorArch-5)',
        'clump': 'the bough end the handle hangs from, its stick toward the sapling (leafClump-41)',
        'link': 'the vine from the handle over to the load (vineLink-79)',
        'handle': 'the vine handle, set: a knotted loop at his raised hand (handleSet-29)',
        'sprung': 'the vine handle, sprung: a limp snapped end (handleSprung-41)',
        'bee': "Matt, 11-12: one bee from his hive sheet's frame 1, for the buzz"}
# (name, source, axis, game units at its usual size, why it is in the trap)
PIECES = [
    ('sapling2', 'cuts/anchorArch-41.png', 'h', 220, 'the second sapling behind the handle: the vine\'s corner hangs from its crown'),
    ('tendril', 'r4cut/rootSet-PICK.png', 'w', 30, 'the tendril handle, set: taut, knotted round a living root hoop'),
    ('stake', 'r4cut/rootCut-PICK.png', 'w', 46, 'the tendril handle, cut: the root hoop and the torn curl of creeper'),
    ('stoneHang', 'cuts/stoneHang-17.png', 'w', 50, 'the mossy stone with vines wrapped round it, hanging (A)'),
    ('stoneDown', 'cuts/stoneDown-down-stoneHang-17-s42-31.png', 'w', 50, 'the same stone landed, its vines slack (A)'),
    ('hiveHang', 'cuts/hiveHang-67.png', 'h', 52, 'hive A: the painted hanging hive with the dark doorway'),
    ('hiveDown', 'cuts/hiveDown-down-hiveHang-67-s42-7.png', 'w', 56, 'hive A landed on its side, whole'),
    ('trunk', 'cuts/anchorArm-41.png', 'h', 230, "a living tree for a shimmy vine's end (World 1: no rope, no posts): the vine ties on at its arm"),
]
PICK = json.loads(ARGS[1]) if len(ARGS) > 1 else {}


def clean(im, erode=2):
    """the model paints a soft dark halo round each piece that the key leaves as a speckled rim: the edge is re-cut at a hard
    threshold (the ink line kept, the halo off), pinholes under 80 px filled (a net's or a knot's real loops are bigger and stay
    open), `erode` px off, a 0.6 px soft edge; then defringe (the outer ring's colour not trusted, key spill out)"""
    a = np.asarray(im.convert('RGBA')).copy()
    solid = a[..., 3] > 140
    holes = ndimage.binary_fill_holes(solid) & ~solid
    lab, n = ndimage.label(holes)
    if n:
        sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
        solid |= np.isin(lab, [i + 1 for i, z in enumerate(sizes) if z < 80])
    if erode:
        solid = ndimage.binary_erosion(solid, iterations=erode)
    a[..., 3] = (ndimage.gaussian_filter(solid.astype(np.float32), 0.6) * 255).clip(0, 255).astype(np.uint8)
    out, _ = defr.process(a, scale=1.0, ring=2.0, do_despill=True)
    return Image.fromarray(out, 'RGBA')


def key_plum(c):
    """Matt's sheet is keyed on a muted plum, not magenta: alpha from the colour distance to the cell's own plum, holes inside the
    painting filled (the comb's dark cells are not background), only big blobs kept"""
    a = np.asarray(c).astype(np.float32)
    ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
    d = np.linalg.norm(a - np.median(ring, 0), axis=-1)
    al = np.clip((d - 28) / 40, 0, 1)
    solid = ndimage.binary_fill_holes(al > 0.5)
    # frame 2's crack opens to the top: closed, and what the closing adds is painted as the crack's dark inside
    closed = ndimage.binary_fill_holes(ndimage.binary_closing(solid, iterations=7))
    crack = closed & ~ndimage.binary_dilation(al > 0.5, iterations=1)
    crack &= ndimage.binary_erosion(closed, iterations=3)
    a[crack] = (58, 34, 16)
    al = np.where(crack, 1.0, al)
    solid = closed
    al = np.where(ndimage.binary_erosion(solid, iterations=2), 1.0, al)
    # un-mix the plum from the edge pixels
    bg = np.median(ring, 0)
    rgb = np.where(al[..., None] > 0.02, (a - (1 - al[..., None]) * bg) / np.maximum(al[..., None], 0.02), 0).clip(0, 255)
    return Image.fromarray(np.dstack([rgb, al * 255]).astype(np.uint8), 'RGBA')


def blobs(im, frac=0.08):
    """every blob at least `frac` of the biggest (Matt's frame 2 is two halves joined only at the crack)"""
    a = np.asarray(im.getchannel('A'))
    lab, n = ndimage.label(a > 40)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(a), lab, range(1, n + 1))
        keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s >= frac * sizes.max()])
        keep = ndimage.binary_dilation(keep, iterations=2)
        im = im.copy(); im.putalpha(Image.fromarray(np.where(keep, a, 0).astype(np.uint8)))
    return im.crop(im.getbbox())


def sized(im, ax, units):
    k = min(1.0, PX * units / (im.height if ax == 'h' else im.width))
    return im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS) if k < 1 else im


import re
_ts = (ROOT / 'src/game/w1TrapsData.ts').read_text()
OLD = json.loads(re.search(r'W1_TRAP_FRAMES = (\{.*?\n\}) as const', _ts, re.S).group(1))
old_atlas = Image.open(ROOT / 'src/assets/props/w1-traps.webp').convert('RGBA')
pieces = {}
for n, why in KEEP.items():
    f = OLD[n]
    pieces[n] = (old_atlas.crop((f['x'], f['y'], f['x'] + f['w'], f['y'] + f['h'])), f['axis'], f['units'], why, 'the shipped atlas (ART-W1)')
for n, src, ax, units, why in PIECES:
    src = src.replace('PICK', str(PICK.get(n, '')))
    # (the landed stone's img2img painted a soft grey shadow just outside its ink on the right: 6 px off that one)
    pieces[n] = (sized(clean(Image.open(T / src), erode=6 if n == 'stoneDown' else 2), ax, units), ax, units, why, src)

# shelf-pack into one sheet
order = sorted(pieces, key=lambda n: -pieces[n][0].height)
W, x, y, rowh, pos = 2048, 0, 0, 0, {}
for n in order:
    im = pieces[n][0]
    if x + im.width + 4 > W:
        x, y, rowh = 0, y + rowh + 4, 0
    pos[n] = (x, y); x += im.width + 4; rowh = max(rowh, im.height)
H = y + rowh
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for n, (x0, y0) in pos.items():
    atlas.alpha_composite(pieces[n][0], (x0, y0))
out = ROOT / 'src/assets/props/w1-traps.webp'
atlas.save(out, 'WEBP', quality=90, method=6)


def alpha(n):
    return np.asarray(pieces[n][0].getchannel('A')) > 128


def ends(n):
    """a lengthwise piece's two ends: the middle of its first and last opaque columns"""
    a = alpha(n); cols = np.nonzero(a.any(0))[0]
    mid = lambda c: float(np.nonzero(a[:, c])[0].mean())
    return [[int(cols[0]), round(mid(cols[0]), 1)], [int(cols[-1]), round(mid(cols[-1]), 1)]]


def under(n, cols=24):
    """the lowest opaque row in each of `cols` columns (the underside a thing hangs from); -1 where empty"""
    a = alpha(n); h, w = a.shape
    r = []
    for i in range(cols):
        c = a[:, min(w - 1, round((i + 0.5) * w / cols))]
        ys = np.nonzero(c)[0]
        r.append(int(ys[-1]) if len(ys) else -1)
    return r


def edge(n, xmax, rows=48):
    """the trunk's edge on the side away from the crown: the leftmost opaque px left of xmax in each of `rows` rows; -1 where none"""
    a = alpha(n); h = a.shape[0]
    r = []
    for i in range(rows):
        xs = np.nonzero(a[min(h - 1, round((i + 0.5) * h / rows)), :xmax])[0]
        r.append(int(xs[0]) if len(xs) else -1)
    return r


sap = alpha('sapling'); sh, sw = sap.shape
foot = np.nonzero(sap[-6:].any(0))[0]
meta = {
    'sapling': {'foot': [round(float(foot.mean()), 1), sh], 'footW': int(foot[-1] - foot[0]), 'under': under('sapling'),
                'trunkTo': int(sw * 0.45), 'edge': edge('sapling', int(sw * 0.45))},
    'clump': {'under': under('clump', 12), 'stick': ends('clump')[0]},
    'link': {'ends': ends('link')},
}
sap2 = alpha('sapling2'); s2h, s2w = sap2.shape
foot2 = np.nonzero(sap2[-6:].any(0))[0]
tr = alpha('trunk'); th, tw = tr.shape
trf = np.nonzero(tr[-6:].any(0))[0]
band = tr[int(th * 0.3):int(th * 0.75)]
tipx = int(np.nonzero(band.any(0))[0][-1])
tipy = int(th * 0.3) + float(np.nonzero(band[:, max(0, tipx - 40):tipx + 1].any(1))[0].mean())
# (the arm's bark where it leaves the trunk: the trunk's right edge at the arm's height, a third of the way out)
meta['trunk'] = {'foot': [round(float(trf.mean()), 1), th], 'footW': int(trf[-1] - trf[0]), 'armTip': [tipx, round(tipy, 1)]}
meta['sapling2'] = {'foot': [round(float(foot2.mean()), 1), s2h], 'footW': int(foot2[-1] - foot2[0]), 'under': under('sapling2')}
frames = {}
for n, (x0, y0) in pos.items():
    im, ax, units, why, src = pieces[n]
    frames[n] = {'x': x0, 'y': y0, 'w': im.width, 'h': im.height, 'units': units, 'axis': ax}
ts = ['// generated by python3 -I tools/art/w1traps/pack.py (ART-W1, ART-W1B 2026-11-12): World 1\'s drop-trap pieces in src/assets/props/w1-traps.webp.',
      '// Do not edit by hand. units: the size it is drawn at (game units) along `axis` (w or h); measures in the frame\'s own px.',
      "export const W1_TRAPS_URL = new URL('../assets/props/w1-traps.webp', import.meta.url).href;",
      f'export const W1_TRAP_FRAMES = {json.dumps(frames, indent=1)} as const;',
      f'export const W1_TRAP_MEASURES = {json.dumps(meta, indent=1)} as const;',
      'export type W1TrapPiece = keyof typeof W1_TRAP_FRAMES;', '']
(ROOT / 'src/game/w1TrapsData.ts').write_text('\n'.join(ts))

# review: every piece on a dark and a light backdrop at 2x game size (fringe shows there), and the provenance list
rv = ROOT / 'reference/qa-reports/ART-W1B'
rv.mkdir(parents=True, exist_ok=True)
cells = []
for n in sorted(pieces):
    im = pieces[n][0]
    k = min(1, 230 / im.height, 300 / im.width)
    t = im.resize((max(1, round(im.width * k)), max(1, round(im.height * k))), Image.LANCZOS)
    c = Image.new('RGBA', (620, 250), (0, 0, 0, 255))
    ImageDraw.Draw(c).rectangle((310, 0, 620, 250), fill=(236, 230, 210, 255))
    ImageDraw.Draw(c).rectangle((0, 0, 310, 250), fill=(24, 30, 26, 255))
    c.alpha_composite(t, (5, 5)); c.alpha_composite(t, (315, 5))
    ImageDraw.Draw(c).text((5, 236), f'{n} {im.width}x{im.height}', fill=(255, 255, 0))
    cells.append(c)
cols = 3
R = Image.new('RGB', (cols * 620, ((len(cells) + cols - 1) // cols) * 250))
for i, c in enumerate(cells):
    R.paste(c.convert('RGB'), ((i % cols) * 620, (i // cols) * 250))
R.save(rv / 'pieces-on-dark-and-light.jpg', quality=85)
(ROOT / 'tools/art/w1traps/picks.json').write_text(json.dumps({n: {'source': p[4], 'units': p[2], 'axis': p[1], 'why': p[3]}
                                                               for n, p in pieces.items()}, indent=1))
print(out, atlas.size, out.stat().st_size, 'bytes')
