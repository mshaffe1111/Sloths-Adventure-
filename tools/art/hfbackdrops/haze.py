"""Grade a cut middle or near strip into the light of the far strip it plays in front of (hf-backdrops, 2026-10-31): each colour
channel's mean and spread moved toward the far strip's lower half (where the distance meets the middle strip), then a little of the
far's haze mixed in (more for a middle strip, which stands further back). Alpha untouched.
    python3 -I tools/art/hfbackdrops/haze.py <strip.webp> <far.webp> <out.webp> [haze 0.18] [match 0.6]
"""
import sys
import numpy as np
from PIL import Image

src, far, out = sys.argv[1:4]
haze = float(sys.argv[4]) if len(sys.argv) > 4 else 0.18
match = float(sys.argv[5]) if len(sys.argv) > 5 else 0.6
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
f = np.asarray(Image.open(far).convert('RGB')).astype(np.float32)
f = f[f.shape[0] // 2:].reshape(-1, 3)
m = a[..., 3] > 200
px = a[..., :3][m]
mu, sd = px.mean(0), px.std(0) + 1e-3
fmu, fsd = f.mean(0), f.std(0) + 1e-3
# (the strip keeps its own contrast more than the far's: it is nearer)
tmu = mu + (fmu * 0.85 - mu) * match
tsd = sd + (np.maximum(fsd, sd * 0.8) - sd) * match * 0.5
rgb = (a[..., :3] - mu) / sd * tsd + tmu
rgb = rgb * (1 - haze) + fmu * haze
a[..., :3] = rgb.clip(0, 255)
Image.fromarray(a.astype(np.uint8), 'RGBA').save(out, quality=90, method=6)
print(out, 'mean', mu.round(), '->', a[..., :3][m].mean(0).round(), 'far', fmu.round())
