"""ART-18: a further-back variant of a painted piece: mirrored (its light and its stalks on the other side) and hazed toward 1-8's mist
(the palms' haze, cut.py --haze: some colour out, then mixed K of the way to the mist), so a repeat on one screen reads as another tree
further back, never the same picture twice. No Hugging Face: the picture's own paint, graded.
    python3 -I tools/art/hfpalm/hazed.py <in.webp> <out.webp> [--haze K] [--no-mirror]
"""
import sys
import numpy as np
from PIL import Image, ImageOps
src, out = sys.argv[1], sys.argv[2]
K = float(sys.argv[sys.argv.index('--haze') + 1]) if '--haze' in sys.argv else 0.38
MIST = np.array([172, 190, 180], np.float32)
im = Image.open(src).convert('RGBA')
if '--no-mirror' not in sys.argv:
    im = ImageOps.mirror(im)
a = np.asarray(im).astype(np.float32)
rgb = a[..., :3]
lum = rgb.mean(-1, keepdims=True)
rgb = rgb * (1 - 0.35 * K) + lum * (0.35 * K)
rgb = rgb * (1 - K) + MIST * K
a[..., :3] = rgb
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA').save(out, 'WEBP', quality=90, method=6)
print(out, im.size)
