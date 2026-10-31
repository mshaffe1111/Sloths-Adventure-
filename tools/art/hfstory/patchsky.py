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
keep = 1 - m
s = 60
num = np.stack([ndimage.gaussian_filter(im[:, :, c] * keep, s) for c in range(3)], 2)
den = ndimage.gaussian_filter(keep, s)[:, :, None]
fill = num / np.maximum(den, 1e-3)
grain = im - np.stack([ndimage.gaussian_filter(im[:, :, c], 3) for c in range(3)], 2)
rng = np.random.default_rng(1)
dx, dy = rng.integers(200, 400), rng.integers(200, 400)
grain = np.roll(grain, (dy, dx), (0, 1)) * 0.6
a = np.clip(ndimage.gaussian_filter(m, 18) * 1.4, 0, 1)[:, :, None]
out = im * (1 - a) + (fill + grain) * a
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(sys.argv[2])
