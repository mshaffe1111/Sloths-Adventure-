"""Make a backdrop strip repeat with no seam, by a narrow band only (engine-render, 2026-11-05: Matt's 1-1 still, a hard vertical edge
where w1sunrise-mid's cut trunk met the next copy's empty right end).

    python3 tools/art/strips/seamband.py <in.webp> <out.webp> <band px>

The last `band` columns are dropped and cross-faded into the first `band` (premultiplied, smoothstep), so the right end of the new strip
runs straight into its left start: copies side by side are continuous. Only the band changes; the rest of the painting is untouched (a
whole-width blend with a shifted copy reads as a double exposure: STAGE-RULES §6, w7 walls).
"""
import sys
import numpy as np
from PIL import Image

src, dst, band = sys.argv[1], sys.argv[2], int(sys.argv[3])
im = Image.open(src)
mode = im.mode
a = np.asarray(im.convert('RGBA'), np.float32) / 255.0
H, W = a.shape[:2]
B = band
rgb, al = a[..., :3] * a[..., 3:4], a[..., 3:4]
t = (np.arange(B, dtype=np.float32) + 0.5) / B
t = (t * t * (3 - 2 * t))[None, :, None]
pre_l, pre_r = rgb[:, :B], rgb[:, W - B:]
al_l, al_r = al[:, :B], al[:, W - B:]
rgb_b = t * pre_l + (1 - t) * pre_r
al_b = t * al_l + (1 - t) * al_r
out_rgb = np.concatenate([rgb_b, rgb[:, B:W - B]], axis=1)
out_al = np.concatenate([al_b, al[:, B:W - B]], axis=1)
col = np.where(out_al > 1e-4, out_rgb / np.maximum(out_al, 1e-4), 0)
o = np.concatenate([col, out_al], axis=2)
img = Image.fromarray(np.clip(o * 255 + 0.5, 0, 255).astype(np.uint8), 'RGBA')
if mode == 'RGB':
    img = img.convert('RGB')
img.save(dst, 'WEBP', quality=90, method=6)
print(dst, img.size)
