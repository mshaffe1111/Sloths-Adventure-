"""ART 11-13: key and pack the creek hurt-floor tile (creekfinish.py's output). Only the top is key colour (its sides and bottom are
water and stones), so the key is measured from the top rows per column, and only background joined to the top edge is cleared.

    python3 -I tools/art/hf1113/creekpack.py <tile.png> <out stem>   -> <stem>.webp + <stem>.json
json: w, h, surface (px: the water line under the spray: the floor line), bed (the bottom rows' colour, for the depth below),
units_per_px (1/3: the set pieces' 3 px a unit; at World 1's pit scale, 0.41, the stones drew as tall as Pokey
and the shallow creek read as a river, mock 11-13), wrap (mean colour step across the tile's ends).
"""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage

src, stem = sys.argv[1:3]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = a.shape
bg = np.median(a[:40], 0)                                   # per column
bg = ndimage.uniform_filter1d(bg, 61, axis=0)[None].repeat(H, 0)
d = np.linalg.norm(a - bg, axis=-1)
al = np.clip((d - 34) / 80, 0, 1)
lab, n = ndimage.label(al < 0.5)
top = set(np.unique(lab[0])) - {0}
backg = np.isin(lab, list(top))
# (soft edge: within 3 px of the cleared background keep the measured alpha, everything else is solid)
near = ndimage.binary_dilation(backg, iterations=3)
alpha = np.where(backg, 0, np.where(near, al, 1.0))
# (spray drops: small solid islands up in the key area stay; the key's pink is un-mixed from every edge pixel)
A = alpha[..., None]
rgb = np.where(A < 0.999, (a - (1 - A) * bg) / np.maximum(A, 0.05), a).clip(0, 255)
rgb[alpha == 0] = 0
solid = alpha > 0.9
run = ndimage.uniform_filter1d(solid.astype(np.float32), 25, axis=0, origin=-12) > 0.999
first = np.argmax(run, axis=0)
surface = int(np.median(first))
y0 = max(0, int(np.nonzero(alpha.max(1) > 0)[0][0]) - 2)
out = np.dstack([rgb, alpha * 255]).astype(np.uint8)[y0:]
# (the pebble bank must melt into the bed fill the engine draws below the tile, never stop on a line: its bottom 70 px fade to the
# bank's own darkest tone, which is the bed colour)
bedc = np.percentile(a[-80:].reshape(-1, 3), 12, axis=0)
f = np.clip((np.arange(out.shape[0]) - (out.shape[0] - 70)) / 70, 0, 1)[:, None, None]
f = f * f * (3 - 2 * f)
out = out.astype(np.float32)
out[..., :3] = out[..., :3] * (1 - f) + bedc * f
out = out.clip(0, 255).astype(np.uint8)
K = 0.75  # (1792 take px -> 1344: 448 units at 3 px a unit)
o = Image.fromarray(out, 'RGBA')
o = o.resize((round(W * K), round(o.height * K)), Image.LANCZOS)
o.save(stem + '.webp', quality=90, method=6)
bed = '#%02x%02x%02x' % tuple(int(v) for v in bedc)
wrap = float(np.abs(a[:, 0] - a[:, -1]).mean())
meta = {'w': o.width, 'h': o.height, 'surface': round((surface - y0) * K),
        'surface_spread': [round((np.percentile(first, 5) - y0) * K), round((np.percentile(first, 95) - y0) * K)],
        'bed': bed, 'units_per_px': round(1 / 3, 4), 'wrap': round(wrap, 2)}
open(stem + '.json', 'w').write(json.dumps(meta, indent=1))
print(meta)
