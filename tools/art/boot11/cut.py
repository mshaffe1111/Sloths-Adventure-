"""Cut a boot11 take into the bootprint decal (2026-11-05): the print and a feathered moss rim only (no bed, no edge, so it cannot stand
up off the surface like round 1's disc), the rim graded to the end bank's own moss, toe east, saved at 4x its game size.
    python3 -I tools/art/boot11/cut.py <take png> <out webp> [game width px, 84] [game height px, 22]
(the height squashes the take to the end bank seen low from the side: the takes come out ~84 x 30-39, taller than the ~8 px moss band)
Measured on today's 1-1 end bank (tools/art/boot11/endshot.mjs, sideways, x 37320-37440): the lit moss is only y 722-730 under the
walking line, then the bank's dark earth face (y 732+ about RGB 77,71,45). So the decal hangs from the walking line (place.py: its top
edge on the line; above it is the background), its rim graded to the moss (RIM_RGB) and its lower rim to the earth face, so it reads as pressed
INTO the grass edge, not stuck on the earth below it.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

RIM_RGB = np.array([112, 110, 64], np.float32)  # the lit moss at y 722-728 (measured)
FACE_RGB = np.array([78, 71, 45], np.float32)   # the bank face at y 732-744 (measured)
take, out = sys.argv[1], sys.argv[2]
GW = int(sys.argv[3]) if len(sys.argv) > 3 else 84
GH = int(sys.argv[4]) if len(sys.argv) > 4 else 22
a = np.asarray(Image.open(take).convert('RGB')).astype(np.float32)
lum = a @ np.array([0.3, 0.59, 0.11], np.float32)
g = a[..., 1] - (a[..., 0] + a[..., 2]) / 2
# the print: the big dark, not-green blob in the middle (its floor, walls and lugs)
dark = (lum < np.percentile(lum, 30)) & (g < 18)
dark = ndimage.binary_closing(dark, iterations=6)
dark = ndimage.binary_fill_holes(dark)
lab, n = ndimage.label(dark)
if not n:
    sys.exit('no print found')
sizes = ndimage.sum(dark, lab, range(1, n + 1))
pm = lab == (1 + int(np.argmax(sizes)))
ys, xs = np.where(pm)
print('print bbox', xs.min(), ys.min(), xs.max(), ys.max())
# the rim: a band outside the print, fading to nothing over RIM px
RIM = max(14, int((xs.max() - xs.min()) * 0.09))  # (wide enough that the torn, pushed-up moss lip survives at 84 px)
dist = ndimage.distance_transform_edt(~pm)
alpha = np.clip(1 - dist / RIM, 0, 1) ** 1.4
alpha = np.maximum(alpha, pm.astype(np.float32))
alpha = ndimage.gaussian_filter(alpha, 1.2)
# grade the rim (outside the print) toward the moss above and the earth face below, keeping the take's own light and shading
rim = (alpha > 0.02) & ~pm
yy = np.linspace(0, 1, a.shape[0])[:, None]
cy = (ys.min() + ys.max()) / 2 / a.shape[0]
target = np.where((yy < cy)[..., None], RIM_RGB, RIM_RGB * 0.7 + FACE_RGB * 0.3)
mu = a[rim].mean(0)
graded = a * (target / np.maximum(mu, 1))
w_rim = np.clip(dist / RIM, 0, 1)[..., None] * rim[..., None]
rgb = a * (1 - w_rim * 0.6) + graded * (w_rim * 0.6)
# the floor lifted toward World 1's warm earth brown and its lugs sharpened: at 84 x 22 a near-black floor read only as a slot
EARTH_RGB = np.array([92, 66, 46], np.float32)
inside = pm[..., None]
lifted = rgb * 0.55 + EARTH_RGB * 0.45 * (rgb / np.maximum(rgb.mean(), 1)) ** 0.5
rgb = np.where(inside, lifted, rgb)
blur = ndimage.gaussian_filter(rgb, (3, 3, 0))
rgb = np.where(inside, rgb + (rgb - blur) * 1.6, rgb)
# crop to the rim's box, then scale to 4x the game width
y0, y1 = max(0, ys.min() - RIM), min(a.shape[0], ys.max() + RIM + 1)
x0, x1 = max(0, xs.min() - RIM), min(a.shape[1], xs.max() + RIM + 1)
im = Image.fromarray(np.dstack([rgb.clip(0, 255), alpha * 255])[y0:y1, x0:x1].astype(np.uint8), 'RGBA')
W4 = GW * 4
H4 = GH * 4
im = im.resize((W4, H4), Image.LANCZOS)
Path(out).parent.mkdir(parents=True, exist_ok=True)
im.save(out, 'WEBP', quality=90, method=6)
print(out, im.size, 'game', GW, 'x', round(H4 / 4), Path(out).stat().st_size // 1024, 'KB')
