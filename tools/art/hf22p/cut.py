"""ART-22P: key one grey take (crop.py's crop of a take painted on flat mid grey) into a pickup the size of the shipped petal.

    python3 -I tools/art/hf22p/cut.py <crop.webp|png> <out.webp> [long side px, default 96]

The background is the grey CONNECTED TO THE PICTURE'S EDGE (a flood from the border over pixels within T_IN of the border's median
grey), so pale lavender or white inside the petal is never keyed. The rim's alpha comes from its distance to that grey (T_IN..T_OUT);
its colour is un-mixed from the grey (c = (p - (1 - a) * bg) / a), so no grey halo sits on a light ground. Specks not joined to the
biggest part are dropped (nothing floating). Cropped to the piece, long side N px (the pickups' 96: cutprops.py), colour under clear
pixels zeroed, lossless WebP.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image

src, out = sys.argv[1:3]
N = int(sys.argv[3]) if len(sys.argv) > 3 else 96
T_IN, T_OUT = 14.0, 46.0
im = Image.open(src).convert('RGB')
px = np.asarray(im).astype(np.float32)
H, W, _ = px.shape
bg = np.median(np.concatenate([px[0], px[-1], px[:, 0], px[:, -1]]), axis=0)
d = np.sqrt(((px - bg) ** 2).sum(axis=2))
# flood the background from the border through near-grey pixels
near = d < T_OUT
seen = np.zeros((H, W), bool)
q = deque()
for y in range(H):
    for x in (0, W - 1):
        if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
for x in range(W):
    for y in (0, H - 1):
        if near[y, x] and not seen[y, x]: seen[y, x] = True; q.append((y, x))
while q:
    y, x = q.popleft()
    for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
        if 0 <= yy < H and 0 <= xx < W and near[yy, xx] and not seen[yy, xx]:
            seen[yy, xx] = True; q.append((yy, xx))
alpha = np.ones((H, W), np.float32)
alpha[seen] = np.clip((d[seen] - T_IN) / (T_OUT - T_IN), 0, 1)
# keep only the biggest solid part
solid = alpha > 0.5
lab = np.zeros((H, W), np.int32); n = 0; sizes = []
for y0 in range(H):
    for x0 in range(W):
        if solid[y0, x0] and not lab[y0, x0]:
            n += 1; lab[y0, x0] = n; q = deque([(y0, x0)]); c = 0
            while q:
                y, x = q.popleft(); c += 1
                for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                    if 0 <= yy < H and 0 <= xx < W and solid[yy, xx] and not lab[yy, xx]:
                        lab[yy, xx] = n; q.append((yy, xx))
            sizes.append(c)
keep = 1 + int(np.argmax(sizes))
from PIL import ImageFilter
mask = Image.fromarray(((lab == keep) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
alpha *= np.asarray(mask) > 0
a3 = np.maximum(alpha, 1e-3)[..., None]
rgb = np.clip((px - (1 - a3) * bg) / a3, 0, 255)
rgba = np.dstack([rgb, alpha * 255]).astype(np.uint8)
ys, xs = np.nonzero(alpha > 0.02)
piece = Image.fromarray(rgba, 'RGBA').crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))
k = N / max(piece.size)
piece = piece.resize((max(1, round(piece.width * k)), max(1, round(piece.height * k))), Image.LANCZOS)
arr = np.asarray(piece).copy(); arr[arr[..., 3] == 0, :3] = 0
Image.fromarray(arr, 'RGBA').save(out, 'WEBP', lossless=True)
print(out, piece.size, 'dropped parts', len(sizes) - 1)
