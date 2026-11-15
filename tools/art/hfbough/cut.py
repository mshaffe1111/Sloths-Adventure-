"""ENG-LOOK2: the Long Branch's bough piece from one Hugging Face take (spec-bough.json; raw takes in reference/art/hfbough/).

    python3 -I tools/art/hfbough/cut.py <take.webp> <out.webp> [x0 x1]

Keys the flat magenta off, crops the take's straight middle span [x0, x1) (full-res px), grades the bark from the take's red toward World 1's
warm brown (the long-branch sheet's chaseSeg), closes the wrap so it tiles left to right (RGB cross-faded by alpha, alpha ramped end to
start, hf-art.md 2026-11-11), fades what hangs under the bark into nothing, and trims to the piece. Prints the piece's size and its rows:
`top` (the walkable moss line) and `body` (moss line to the bark's underside) for protoArt.ts BOUGH.
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, out = sys.argv[1], sys.argv[2]
x0, x1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (650, 1390)
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
# (the key: distance from the take's own border magenta; soft 40-90)
ring = np.concatenate([im[:6].reshape(-1, 3), im[-6:].reshape(-1, 3)])
bg = np.median(ring, 0)
d = np.sqrt(((im - bg) ** 2).sum(-1))
a = np.clip((d - 40) / 50, 0, 1)
# (despill: pull magenta out of the rim)
mag = np.minimum(im[..., 0], im[..., 2]) - im[..., 1]
spill = np.clip(mag / 255, 0, 1) * (1 - a)
im[..., 0] -= spill * 60; im[..., 2] -= spill * 80
im = im[:, x0:x1]; a = a[:, x0:x1]
w = x1 - x0
# (grade, in HSV: the bark's red turned to World 1's warm brown (the long-branch sheet's chaseSeg bark, mean RGB 130,100,80: hue ~24
#  deg), a little less saturated; the moss a touch darker and less acid (the sheet's 127,139,71). Values (the painted light and the dark
#  outline) are kept)
hsv = np.asarray(Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGB').convert('HSV')).astype(np.float32)
hh, ss, vv = hsv[..., 0], hsv[..., 1], hsv[..., 2]
redish = (hh < 22) | (hh > 225)
hh[redish] = 15
ss[redish] *= 0.62
vv[redish] = np.minimum(255, vv[redish] * 1.04)
green = (hh >= 30) & (hh < 110)
ss[green] *= 0.78
vv[green] *= 0.86
im = np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB')).astype(np.float32)
# (rows: the moss line = the first row where most columns are solid; the bark's underside = the last row where most are)
solid = (a > 0.5).mean(1)
rows = np.where(solid > 0.85)[0]
top, under = int(rows[0]), int(rows[-1])
# (nothing hangs under the bark in the piece: the moss and epiphytes under the bough are dressing rows (ENG-DR's piece, the lead's
#  condition (c)); the underside keeps its own dark outline, a 6 px soft edge under it)
fade = np.clip(1 - (np.arange(H) - under - 4) / 6, 0, 1)[:, None]
a = a * fade
# (the wrap: the last Z px cross-fade into the first)
Z = 120
t = np.linspace(0, 1, Z)[None, :]
eA, sA = a[:, -Z:], a[:, :Z]
eC, sC = im[:, -Z:], im[:, :Z]
na = eA * (1 - t) + sA * t
wgt_e = (eA * (1 - t))[..., None]; wgt_s = (sA * t)[..., None]
nc = (eC * wgt_e + sC * wgt_s) / np.maximum(wgt_e + wgt_s, 1e-3)
im = np.concatenate([nc, im[:, Z:-Z]], 1)
a = np.concatenate([na, a[:, Z:-Z]], 1)
a = np.where(a < 0.08, 0, a)
rgba = np.dstack([np.clip(im, 0, 255), np.clip(a * 255, 0, 255)]).astype(np.uint8)
pic = Image.fromarray(rgba, 'RGBA')
ys = np.where((a > 0.02).any(1))[0]
y0, y1 = max(0, int(ys[0]) - 2), min(H, int(ys[-1]) + 3)
pic = pic.crop((0, y0, pic.width, y1))
pic.save(out, 'WEBP', lossless=True)
print({'w': pic.width, 'h': pic.height, 'top': top - y0, 'body': under - top})
