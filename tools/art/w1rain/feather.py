"""ENG-LOOK2 (the lead's (i), 11-15): w1rain-mid.webp's canopy runs to the strip's LEFT edge with a hard vertical cut, and its right side has
no canopy, so every wrap of the strip (drawn ~668 px wide sideways) showed a hard-edged lighter panel behind the play (1-2, 1-5, 1-8 play
w1rain). Feathers the strip's alpha over its first 260 px (smoothstep), so the canopy grows out of nothing at the wrap.

    python3 -I tools/art/w1rain/feather.py src/assets/backdrops/w1rain-mid.webp
"""
import sys
import numpy as np
from PIL import Image

p = sys.argv[1]
im = np.asarray(Image.open(p).convert('RGBA')).astype(np.float32)
N = 260
t = np.clip(np.arange(N) / (N - 1), 0, 1)
ramp = t * t * (3 - 2 * t)
im[:, :N, 3] *= ramp[None, :]
Image.fromarray(np.clip(im, 0, 255).astype(np.uint8), 'RGBA').save(p, 'WEBP', quality=86, method=6, alpha_quality=90)
print('feathered', p, im.shape)
