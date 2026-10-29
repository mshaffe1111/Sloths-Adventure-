"""Cut Venom Fang's painted body tile (AN-7, hf-art-bosses, 2026-10-29) from the picked take (make_spec3.py): the body band keyed off
the magenta, a 640 px run from its middle made to tile by cross-fading its last 96 px into its first, and saved at half size.
    python3 -I tools/art/hfbosses/venomcut.py <take.webp> <game checkout>
Out: src/assets/enemies/venom-body.webp (the tile, lying left to right, belly at the bottom) and its rows printed for venomRig.ts.
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

src, GAME = Image.open(sys.argv[1]).convert('RGB'), Path(sys.argv[2])
a = np.asarray(src).astype(np.float32)
key = np.minimum(a[..., 0], a[..., 2]) - a[..., 1]
rows = np.where((key < 90).mean(axis=1) > 0.9)[0]
top, bot = rows.min(), rows.max() + 1
band = a[top:bot]
k = key[top:bot]
alpha = np.clip((150 - k) / 100, 0, 1)
ex = np.clip(np.minimum(band[..., 0], band[..., 2]) - band[..., 1] - 8, 0, None) * (alpha < 1)
band[..., 0] -= ex
band[..., 2] -= ex
L, F = 640, 96
x0 = (band.shape[1] - L - F) // 2
seg = band[:, x0:x0 + L + F].copy()
al = alpha[:, x0:x0 + L + F].copy()
w = np.linspace(0, 1, F)[None, :, None]
seg[:, :F] = seg[:, :F] * w + seg[:, L:L + F] * (1 - w)
al[:, :F] = al[:, :F] * w[..., 0] + al[:, L:L + F] * (1 - w[..., 0])
tile = np.dstack([seg[:, :L], al[:, :L] * 255])
im = Image.fromarray(np.clip(tile, 0, 255).astype(np.uint8), 'RGBA')
im = im.resize((L // 2, round(im.height / 2)), Image.LANCZOS)
out = GAME / 'src/assets/enemies/venom-body.webp'
im.save(out, 'WEBP', quality=90, method=6)
print(out, im.size, out.stat().st_size, 'band rows', top, bot)
