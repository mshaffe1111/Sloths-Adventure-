"""Remove thin bright rain streaks a text-to-image take painted into a far strip (W1 sunrise, 2026-11-01): a pixel much brighter than its
7x7 median (a thin light line) is replaced by the median; broad light (sun, clouds) is left alone.
    python3 -I tools/art/hfbackdrops/destreak.py <file.webp> [threshold 10]
"""
import sys
import numpy as np
from PIL import Image, ImageFilter
p = sys.argv[1]
th = float(sys.argv[2]) if len(sys.argv) > 2 else 10
im = Image.open(p)
mode = im.mode if im.mode in ('RGB', 'RGBA') else 'RGB'
a = np.asarray(im.convert(mode)).astype(np.float32)
med = np.asarray(im.convert('RGB').filter(ImageFilter.MedianFilter(7))).astype(np.float32)
lum = lambda x: x[..., :3] @ np.array([0.299, 0.587, 0.114])
m = (lum(a) - lum(med)) > th
m = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3))) > 0
a[..., :3][m] = med[m]
Image.fromarray(a.clip(0, 255).astype(np.uint8), mode).save(p, quality=86, method=6)
print(p, 'pixels replaced', int(m.sum()))
