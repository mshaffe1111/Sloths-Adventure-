"""Grade a repainted old strip (the crown-top fixes, hf-backdrops2) back to the old strip's own colours: each channel's mean and spread
over the opaque paint matched to the old file's, so the world looks as it did, only with whole crowns. Alpha untouched.
    python3 -I tools/art/hfbackdrops/matchold.py <new.webp> <old.webp> <out.webp>
"""
import sys
import numpy as np
from PIL import Image

new, old, out = sys.argv[1:4]
a = np.asarray(Image.open(new).convert('RGBA')).astype(np.float32)
o = np.asarray(Image.open(old).convert('RGBA')).astype(np.float32)
pa, po = a[..., :3][a[..., 3] > 200], o[..., :3][o[..., 3] > 200]
rgb = (a[..., :3] - pa.mean(0)) / (pa.std(0) + 1e-3) * po.std(0) + po.mean(0)
a[..., :3] = rgb.clip(0, 255)
Image.fromarray(a.astype(np.uint8), 'RGBA').save(out, quality=88, method=6)
print(out, pa.mean(0).round(), '->', po.mean(0).round())
