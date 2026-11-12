"""1-3's sunrise far (ART-W1B): close the wrap join. The native pass is only as seamless as its input; the img2img take's ends were
painted apart. `band` rolls the strip half a width (the join to the middle) and cuts the 1024-wide band round it; `put` lays a
repainted band back with 160 px feathered sides and rolls back, then reports the join against any two columns.
    python3 -I tools/art/sky13/seam.py band <strip.webp>                       -> reference/qa-reports/ART-W1B/sky/seam-band.webp
    python3 -I tools/art/sky13/seam.py put <strip.webp> <band take.webp> <out.webp>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'reference/qa-reports/ART-W1B/sky'
W, H, BW, F = 2160, 1302, 1024, 160


def strip(p):
    return np.asarray(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)


def seam(a):
    return float(np.abs(a[:, -1] - a[:, 0]).mean()), float(np.mean([np.abs(a[:, i + 1] - a[:, i]).mean() for i in range(100, W - 60, 50)]))


a = np.roll(strip(sys.argv[2]), W // 2, axis=1)
x0 = W // 2 - BW // 2
if sys.argv[1] == 'band':
    Image.fromarray(a[:, x0:x0 + BW].astype(np.uint8)).save(OUT / 'seam-band.webp', 'WEBP', quality=94)
else:
    b = np.asarray(Image.open(sys.argv[3]).convert('RGB').resize((BW, H), Image.LANCZOS)).astype(np.float32)
    w = np.ones(BW, np.float32); r = np.linspace(0, 1, F); w[:F] = r; w[-F:] = r[::-1]
    a[:, x0:x0 + BW] = a[:, x0:x0 + BW] * (1 - w[None, :, None]) + b * w[None, :, None]
    a = np.roll(a, -(W // 2), axis=1)
    Image.fromarray(a.clip(0, 255).astype(np.uint8)).save(sys.argv[4], 'WEBP', quality=90, method=6)
    print('seam %.2f, any two columns %.2f' % seam(a))
