"""ART-678b, the lead's ruling (11-14): a live post replaces the TALL plank pole that holds a bough (1-4): build that pole to its real
height from a hi-res cut of w1-livepost-tall (recut.py with units 400 gives 517x1200 from raw post-53).

    python3 tools/art/hf678/polebuild.py <post.webp> <out.webp> <tiles> <row 0> <row 1> [fade px]

The post is read as cap = rows [0, row 0), trunk tile = [row 0, row 1) (one full turn of the vine), foot = [row 1, bottom). The pole is
cap + tile x <tiles> + foot, so the cap-to-tile and tile-to-foot joins are the original picture (no join at all); only where one tile
copy meets the next is there a join, and there the next copy's first <fade> rows blend from the previous copy's natural continuation
(rows [row 1, row 1 + fade)) into its own start (colour by alpha weight, alpha ramped). Pick the rows with the best match: the search
in ART-678b found 380 / 726 (one vine turn, 346 px) on the 1200 px cut. The caller scales the result to the height it needs.
"""
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1:3]
N, M0, M1 = map(int, sys.argv[3:6])
F = int(sys.argv[6]) if len(sys.argv) > 6 else 24
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
parts = [a[:M0]]
for i in range(N):
    tile = a[M0:M1].copy()
    if i > 0:  # the join: blend from the previous copy running on (rows M1..M1+F) into this copy's start (rows M0..M0+F)
        t = np.linspace(1, 0, F)[:, None, None]
        run, own = a[M1:M1 + F], a[M0:M0 + F]
        wa, wb = t * run[..., 3:] / 255, (1 - t) * own[..., 3:] / 255
        rgb = (run[..., :3] * wa + own[..., :3] * wb) / np.maximum(wa + wb, 1e-6)
        tile[:F] = np.concatenate([rgb, run[..., 3:] * t + own[..., 3:] * (1 - t)], 2)
    parts.append(tile)
parts.append(a[M1:])
o = np.concatenate(parts, 0)
o[o[..., 3] < 1, :3] = 0
Image.fromarray(o.clip(0, 255).astype(np.uint8)).save(dst, 'WEBP', lossless=True, method=6)
print(dst, o.shape[1], 'x', o.shape[0], 'tiles', N, 'joins', max(0, N - 1))
