"""ENG-LOOK2: the Long Branch's bough sheet from one Hugging Face take (spec-bough.json; raw takes in reference/art/hfbough/).

    python3 -I tools/art/hfbough/cut.py <take.webp> <out.webp>

Keys the flat magenta off; grades the bark from the take's red to World 1's warm brown and the moss a touch darker (HSV, values kept, so
the painted light and outline stay); cuts THREE variants of the take's straight body (no mirroring: the lead's (f), a mirrored seam printed
a chevron in the grain), each starting with the right half of one join strip J and ending with its left half, so ANY variant follows ANY
(the joins cross-faded RGB by alpha, alpha ramped, hf-art.md 2026-11-11); swells each variant's bark gently along its length and back to
the join's thickness at its ends (the lead's (g): a living bough, not a sawn beam; the uneven underside is the take's own outline); trims
what stands above the moss line (ferns would repeat) and fades nothing under the bark (the hanging moss is dressing, condition (c)).
Writes the variants stacked as rows of one sheet; prints its rows: `w`, `h` (a row), `top` (the walkable moss line), `body` (moss line to
the underside at the joins) for protoArt.ts BOUGH.
"""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W0, _ = im.shape
ring = np.concatenate([im[:6].reshape(-1, 3), im[-6:].reshape(-1, 3)])
bg = np.median(ring, 0)
a = np.clip((np.sqrt(((im - bg) ** 2).sum(-1)) - 40) / 50, 0, 1)
mag = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
spill = np.clip(mag / 255, 0, 1) * (1 - a)
im[..., 0] -= spill * 60; im[..., 2] -= spill * 80
hsv = np.asarray(Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB').convert('HSV')).astype(np.float32)
hh, ss, vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
red = (hh < 22) | (hh > 225)
hh[red] = 15; ss[red] *= 0.62; vv[red] = np.minimum(255, vv[red] * 1.04)
grn = (hh >= 30) & (hh < 110)
ss[grn] *= 0.78; vv[grn] *= 0.86
im = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)
# (rows over the straight body: the moss line and the underside, read where most columns are solid)
body = slice(700, 1300)
solid = (a[:, body] > 0.5).mean(1)
rows = np.where(solid > 0.85)[0]
top, under = int(rows[0]), int(rows[-1])
# (nothing more than 16 px above the moss line: ferns and tufts would repeat with the variant)
a[: max(0, top - 16)] = 0
a[max(0, top - 16): top] *= np.linspace(0, 1, min(16, top))[:, None]
a[under + 6:] = 0
a[under: under + 6] *= np.linspace(1, 0, 6)[:, None]
JX, Z, ZB, W = 880, 120, 80, 480
CORES = (260, 560, 1080)


def blend(c1, a1, c2, a2):
    """c1 fading into c2 across the columns: RGB weighted by alpha, alpha ramped"""
    t = np.linspace(0, 1, c1.shape[1])[None, :]
    na = a1 * (1 - t) + a2 * t
    w1, w2 = (a1 * (1 - t))[..., None], (a2 * t)[..., None]
    return (c1 * w1 + c2 * w2) / np.maximum(w1 + w2, 1e-3), na


def swell(c, al, amp):
    """each column's bark below the moss line stretched by 1 + amp * sin(pi u): the joins keep their thickness"""
    n = c.shape[1]
    oc, oa = c.copy(), al.copy()
    for x in range(n):
        f = 1 + amp * np.sin(np.pi * x / (n - 1))
        ys = np.arange(top, H)
        srcy = top + (ys - top) / f
        y0 = np.clip(np.floor(srcy).astype(int), 0, H - 1); y1 = np.clip(y0 + 1, 0, H - 1); fr = (srcy - y0)[:, None]
        oc[top:, x] = c[y0, x] * (1 - fr) + c[y1, x] * fr
        oa[top:, x] = al[y0, x] * (1 - fr[:, 0]) + al[y1, x] * fr[:, 0]
    return oc, oa


rows_out = []
for k, cx in enumerate(CORES):
    h2 = Z // 2
    jr_c, jr_a = im[:, JX + h2: JX + Z], a[:, JX + h2: JX + Z]
    jl_c, jl_a = im[:, JX: JX + h2], a[:, JX: JX + h2]
    s_c, s_a = blend(im[:, JX + Z: JX + Z + ZB], a[:, JX + Z: JX + Z + ZB], im[:, cx: cx + ZB], a[:, cx: cx + ZB])
    core_c, core_a = im[:, cx + ZB: cx + W - ZB], a[:, cx + ZB: cx + W - ZB]
    e_c, e_a = blend(im[:, cx + W - ZB: cx + W], a[:, cx + W - ZB: cx + W], im[:, JX - ZB: JX], a[:, JX - ZB: JX])
    c = np.concatenate([jr_c, s_c, core_c, e_c, jl_c], 1)
    al = np.concatenate([jr_a, s_a, core_a, e_a, jl_a], 1)
    c, al = swell(c, al, (0.07, 0.1, 0.05)[k])
    al = np.where(al < 0.08, 0, al)
    rows_out.append(np.dstack([np.clip(c, 0, 255), np.clip(al * 255, 0, 255)]).astype(np.uint8))
sheet = np.concatenate(rows_out, 0)
ys = np.where((sheet[..., 3] > 5).reshape(3, H, -1).any(0).any(1))[0]
y0, y1 = max(0, int(ys[0]) - 2), min(H, int(ys[-1]) + 3)
rows_cut = [r[y0:y1] for r in rows_out]
Image.fromarray(np.concatenate(rows_cut, 0), 'RGBA').save(out, 'WEBP', lossless=True)
print({'w': rows_cut[0].shape[1], 'h': y1 - y0, 'top': top - y0, 'body': under - top, 'rows': 3})
