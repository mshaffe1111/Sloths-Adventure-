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
# --match: grade the take so its top band (the bank's own soil) has World 2's fill colour: per channel, the top band's mean and spread
# moved to the fill's; the same line applied to every px, so the overhang keeps its share of the top's brightness
if '--match' in sys.argv:
    fill = np.asarray(Image.open(__import__('os').path.join(__import__('os').path.dirname(__file__), '../../../src/assets/ground/w2.webp'))
                      .convert('RGB').crop((3, 3, 1021, 1021))).reshape(-1, 3).astype(np.float32)
    band = a[int(0.04 * H):int(0.3 * H)][solid[int(0.04 * H):int(0.3 * H)]]
    m0, s0, m1, s1 = band.mean(0), band.std(0) + 1e-3, fill.mean(0), fill.std(0)
    a = np.clip((a - m0) * (s1 / s0) + m1, 0, 255)
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
    if e > 30:
        over.append(lum[e - 27:e, x].mean())
top = lum[FEATHER:int(0.3 * h)][al[FEATHER:int(0.3 * h)]].mean()
wrap = ''
if kind == 'strip':
    rows = al[:, 0] & al[:, -1]
    wrap = f' wrap {np.abs(o[rows, 0, :3] - o[rows, -1, :3]).mean():.1f}'
print(f'{out} {w}x{h} edge {np.mean(edges) / h:.4f} shade {np.mean(over) / top:.2f}{wrap}')
