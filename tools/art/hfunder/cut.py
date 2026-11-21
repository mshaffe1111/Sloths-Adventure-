"""ART-UNDER (11-21): cut a picked underside take for World 2's ground sheet.
  strip   key the grey below (flood from the bottom edge only: the top, left and right are soil), drop pieces not joined to the body,
          un-mix the rim from the grey, close the wrap (hf-art.md 11-11: RGB cross-faded by alpha, alpha ramped from the end's outline
          to the start's, <200 snapped to 0, a 0.8 px rim), scale to 1024 wide, crop the empty grey below the lowest root to 256 tall
          (or the next multiple of 8 if a root reaches past it), feather the top FEATHER px (it lies over the bank's own fill).
  corner  the same key flooding from the bottom AND right edges, scaled to 384 x 576, top and left feathered (they join the bank's
          fill and the strip). Mirrored in code for the other side.
Prints: size, edge (the share of the height where the soil's ragged edge runs: the mean over columns of the first see-through row
under the body), shade (the overhang's 40 px over the top band, brightness), wrap (mean abs RGB, wrap column, opaque rows).
    python3 -I tools/art/hfunder/cut.py <take.png|webp> <out.png> strip|corner [fade 192] [feather 20] [--match]
"""
import sys

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd

src, out, kind = sys.argv[1], sys.argv[2], sys.argv[3]
ARGS = [x for x in sys.argv[4:] if not x.startswith("--")]
FADE = int(ARGS[0]) if ARGS else 192
FEATHER = int(ARGS[1]) if len(ARGS) > 1 else 20
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W = a.shape[:2]
bg = np.median(a[-1], axis=0)
near = np.abs(a - bg).max(axis=2) < 26
lab, _ = nd.label(near)
seeds = set(lab[-1][near[-1]].tolist())
if kind == 'corner':
    seeds |= set(lab[:, -1][near[:, -1]].tolist())
bgm = np.isin(lab, list(seeds - {0}))
# grey trapped between roots under the soil's edge is background too (a pocket the border flood can't reach came out as a grey, and
# after the shade lift a WHITE, shard on the corner takes, 11-21): below each column's body edge, every grey-near px is keyed
_y0 = int(0.3 * H)
_e = np.array([_y0 + (int(np.argmin((~bgm)[_y0:, x])) if not (~bgm)[_y0:, x].all() else H - _y0) for x in range(W)])
bgm |= near & (np.arange(H)[:, None] > _e[None, :] + 2)
# and a pocket closed in by a root and the face: a FLAT grey region (within 10 of the key, 30 px or more) is the take's background
_flat = np.abs(a - bg).max(axis=2) < 10
_fl, _n = nd.label(_flat)
if _n:
    _sz = nd.sum(_flat, _fl, range(1, _n + 1))
    _pk = np.isin(_fl, 1 + np.where(_sz >= 30)[0]) & ~bgm
    print(f'pockets keyed {int(_pk.sum())} px (top band {int(_pk[:int(0.3 * H)].sum())})')
    bgm |= nd.binary_dilation(_pk, iterations=1) & near
solid = ~bgm
# keep only what joins the body (a floating clod or root bit is junk: hf-art.md "loose pieces")
sl, n = nd.label(solid)
if n > 1:
    sizes = nd.sum(solid, sl, range(1, n + 1))
    solid = sl == (1 + int(np.argmax(sizes)))
alpha = np.where(solid, 255.0, 0.0)
alpha = np.asarray(Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)
# un-mix the rim from the grey: a rim px takes the nearest solid colour (no grey halo on a dark dusk ground)
inner = nd.binary_erosion(solid, iterations=2)
_, (iy, ix) = nd.distance_transform_edt(~inner, return_indices=True)
rim = solid & ~inner
a[rim] = a[iy[rim], ix[rim]]
# --match: grade the take so its top band (the bank's own soil) has World 2's fill colour: a per-channel GAIN (top band mean -> the fill's
# mean), the same on every px, so the overhang keeps its share of the top's brightness (a mean+spread match lifted the darks: 0.33 -> 0.67)
if '--match' in sys.argv:
    fill = np.asarray(Image.open(__import__('os').path.join(__import__('os').path.dirname(__file__), '../../../src/assets/ground/w2.webp'))
                      .convert('RGB').crop((3, 3, 1021, 1021))).reshape(-1, 3).astype(np.float32)
    band = a[int(0.04 * H):int(0.3 * H)][solid[int(0.04 * H):int(0.3 * H)]]
    a = np.clip(a * (fill.mean(0) / band.mean(0)), 0, 255)
# --shade=R: the order puts the overhang in shadow at 55-65% of the fill's brightness; the takes paint it near a third. Lift the band
# above each column's soil edge so its median is R of the top band's (a smooth ramp in from 0.3 of the height; the roots below the edge
# keep their own dark)
SH = [float(x[8:]) for x in sys.argv if x.startswith('--shade=')]
if SH:
    lum = a.mean(axis=2)
    y0 = int(0.3 * H)
    e = np.array([y0 + (int(np.argmin(solid[y0:, x])) if not solid[y0:, x].all() else H - y0) for x in range(W)])
    bw = int(0.13 * H)
    meas = range(W) if kind == 'strip' else range(int(0.6 * W))
    band = np.concatenate([lum[max(y0, e[x] - bw):max(y0, e[x] - int(0.03 * H)), x] for x in meas if e[x] - bw > y0])
    topm = np.median(lum[int(0.04 * H):y0][solid[int(0.04 * H):y0]])
    gain = float(np.clip(SH[0] / (np.median(band) / topm), 1, 2.4))
    # the ramp follows a SMOOTHED edge (a per-column gain left vertical streaks, 11-21), and the chroma lifts at 0.4 of the light, so a
    # dark brown band does not turn orange
    es = nd.uniform_filter1d(nd.median_filter(e.astype(float), size=61, mode='wrap' if kind == 'strip' else 'nearest'), 61,
                             mode='wrap' if kind == 'strip' else 'nearest')
    yy = np.arange(H)[:, None]
    r0 = np.maximum(y0, es - 2.2 * bw)[None, :]   # the lift ramps in over ~2 band widths above the band, not from 0.3 H (a glare band)
    s = np.clip((yy - r0) / np.maximum(1, (es[None, :] - bw) - r0), 0, 1)
    s = s * s * (3 - 2 * s)
    below = np.clip((yy - e[None, :]) / 6.0, 0, 1)   # the roots under the edge keep their own dark (a 6 px blend)
    gl = 1 + (gain - 1) * s * (1 - below)
    gc = 1 + (gain - 1) * 0.4 * s * (1 - below)
    L = a.mean(axis=2, keepdims=True)
    a = np.clip(L * gl[..., None] + (a - L) * gc[..., None], 0, 255)
    print(f'shade gain {gain:.2f} (band {np.median(band) / topm:.2f} -> {SH[0]})')
rgba = np.dstack([a, alpha])

if kind == 'strip':
    t = np.linspace(1, 0, FADE)[None, :, None]
    E, B = rgba[:, W - FADE:], rgba[:, :FADE]
    ae, ab = E[..., 3:] / 255, B[..., 3:] / 255
    we, wb = t * ae, (1 - t) * ab
    ws = np.maximum(we + wb, 1e-6)
    rgb_h = (E[..., :3] * we + B[..., :3] * wb) / ws
    al_h = E[..., 3:] * t + B[..., 3:] * (1 - t)
    al_h = np.where(al_h < 200, 0, al_h)
    al_h = np.asarray(Image.fromarray(al_h[..., 0].astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)[..., None]
    rgba = np.concatenate([np.concatenate([rgb_h, al_h], 2), rgba[:, FADE:W - FADE]], 1)
    im = Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA')
    s = 1024 / im.width
    im = im.resize((1024, round(im.height * s)), Image.LANCZOS)
    al = np.asarray(im)[..., 3]
    low = int(np.where(al.max(axis=1) > 8)[0].max()) + 1
    h = 256 if low <= 252 else int(np.ceil((low + 4) / 8) * 8)
    im = im.crop((0, 0, 1024, min(h, im.height))) if h <= im.height else im
else:
    im = Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), 'RGBA').resize((384, 576), Image.LANCZOS)

o = np.asarray(im).astype(np.float32)
h, w = o.shape[:2]
ramp = np.clip(np.arange(h) / FEATHER, 0, 1)[:, None]
o[..., 3] *= ramp
if kind == 'corner':
    o[..., 3] *= np.clip(np.arange(w) / FEATHER, 0, 1)[None, :]
o[o[..., 3] == 0, :3] = 0
Image.fromarray(np.clip(o, 0, 255).astype(np.uint8), 'RGBA').save(out, optimize=True)

al = o[..., 3] > 128
lum = o[..., :3].mean(axis=2)
cols = range(w if kind == 'strip' else int(0.7 * w))
edges, over = [], []
for x in cols:
    c = al[FEATHER:, x]
    e = FEATHER + (int(np.argmin(c)) if not c.all() else len(c))
    edges.append(e)
    if e > 40:
        over.append(np.median(lum[e - 34:e - 7, x]))
top = np.median(lum[FEATHER:int(0.3 * h)][al[FEATHER:int(0.3 * h)]])
wrap = ''
if kind == 'strip':
    rows = al[:, 0] & al[:, -1]
    wrap = f' wrap {np.abs(o[rows, 0, :3] - o[rows, -1, :3]).mean():.1f}'
print(f'{out} {w}x{h} edge {np.mean(edges) / h:.4f} shade {np.mean(over) / top:.2f}{wrap}')
