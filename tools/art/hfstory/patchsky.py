"""Paint a stray shape out of a plate's soft sky (hf-cutscenes): the box is filled from the sky around it (a normalised blur that
ignores the box), with the painting's own grain added back, feathered at the edge.
    python3 -I tools/art/hfstory/patchsky.py <in.png> <out.png> x0,y0,x1,y1   (shares of the picture)
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

im = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
h, w, _ = im.shape
x0, y0, x1, y1 = [float(v) for v in sys.argv[3].split(',')]
m = np.zeros((h, w), np.float32)
m[round(y0 * h):round(y1 * h), round(x0 * w):round(x1 * w)] = 1
# (filled small: an eighth of the size, the hole grown inward from its edge by repeated normalised blurs, then scaled back up)
k = 8
sm = np.asarray(Image.fromarray(im.astype(np.uint8)).resize((w // k, h // k), Image.BILINEAR)).astype(np.float32)
mm = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((w // k, h // k), Image.BILINEAR)).astype(np.float32) / 255 > 0.01
fill = sm.copy()
known = (~mm).astype(np.float32)
for _ in range(60):
    num = np.stack([ndimage.gaussian_filter(fill[:, :, c] * known, 3) for c in range(3)], 2)
    den = ndimage.gaussian_filter(known, 3)[:, :, None]
    est = num / np.maximum(den, 1e-4)
    fill = np.where(mm[:, :, None], est, sm)
    known = np.maximum(known, (den[:, :, 0] > 0.2).astype(np.float32))
fill = np.asarray(Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)).astype(np.float32)
fill = np.stack([ndimage.gaussian_filter(fill[:, :, c], 6) for c in range(3)], 2)
grain = np.random.default_rng(1).normal(0, 2.0, (h, w, 1)).astype(np.float32)
a = np.clip(ndimage.gaussian_filter(m, 18) * 1.4, 0, 1)[:, :, None]
out = im * (1 - a) + (fill + grain) * a
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(sys.argv[2])
