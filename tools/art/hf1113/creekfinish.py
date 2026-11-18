"""ART 11-13: put a repainted join band back into the rolled creek take (creekstart.py), feathered over FEATHER px each side, so the
tile wraps: its two ends are the take's untouched middle, and its middle (the old join) is repainted whole.

    python3 -I tools/art/hf1113/creekfinish.py <take.webp> <band take> <out.png>   prints the join score (mean colour step across the
    middle column vs the median step between neighbouring columns elsewhere)
"""
import sys
import numpy as np
from PIL import Image

FEATHER = 220
take, band, out = sys.argv[1:4]
im = np.asarray(Image.open(take).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
r = np.concatenate([im[:, W // 2:], im[:, :W // 2]], 1)
b = np.asarray(Image.open(band).convert('RGB').resize((1024, H), Image.LANCZOS)).astype(np.float32)
x0 = W // 2 - 512
w = np.ones(1024, np.float32)
ramp = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, FEATHER))
w[:FEATHER] = ramp; w[-FEATHER:] = ramp[::-1]
r[:, x0:x0 + 1024] = r[:, x0:x0 + 1024] * (1 - w[None, :, None]) + b * w[None, :, None]
Image.fromarray(r.clip(0, 255).astype(np.uint8)).save(out)
steps = np.abs(np.diff(r, axis=1)).mean((0, 2))
wrap = np.abs(r[:, 0] - r[:, -1]).mean()
print(out, 'middle', round(float(steps[W // 2 - 1]), 2), 'wrap', round(float(wrap), 2), 'median', round(float(np.median(steps)), 2))
