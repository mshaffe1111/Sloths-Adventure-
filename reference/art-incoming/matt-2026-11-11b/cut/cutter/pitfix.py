# P-01-d: the pit's inside is painted as darkened magenta (the ground's hue). Keep its brightness, drop the hue: a near-black
# shaft with a slight earth-brown tint, so the pit reads as deep, not pink.
import sys; ROOT = sys.argv[1]; sys.path.insert(0, ROOT + '/pylib')
import numpy as np
from PIL import Image
f = f'{ROOT}/artcut/pieces/P-01-d.png'; a = np.asarray(Image.open(f)).astype(np.float32).copy()
r, g, b = a[..., 0], a[..., 1], a[..., 2]
hue = (r - g > 4) & (b - g > 4) & (a[..., 3] > 0)
L = 0.3 * r + 0.59 * g + 0.11 * b
tint = np.array([1.0, 0.85, 0.72])
for c in range(3): a[..., c] = np.where(hue, np.clip(L * tint[c] * 0.8, 0, 255), a[..., c])
print('pit px recoloured', int(hue.sum()))
Image.fromarray(np.clip(a + .5, 0, 255).astype(np.uint8), 'RGBA').save(f, compress_level=6)
