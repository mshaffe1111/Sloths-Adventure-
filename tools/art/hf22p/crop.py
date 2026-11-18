"""ART-22P (in the sandbox): crop a take to its piece (everything not the flat grey ground, plus a margin) and save it lossless, small
enough to bring back by sbx.py parts.   python crop.py <take.png> <out.webp> [max side, default 640]"""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1:3]
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 640
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(np.int16)
bg = np.median(np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]]), axis=0)
m = np.abs(a - bg).max(axis=2) > 24
ys, xs = np.nonzero(m)
pad = 24
box = (max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad), min(im.height, ys.max() + pad))
c = im.crop(box)
k = min(1, mx / max(c.size))
c = c.resize((round(c.width * k), round(c.height * k)), Image.LANCZOS)
c.save(out, 'WEBP', lossless=True)
print(out, box, c.size)
