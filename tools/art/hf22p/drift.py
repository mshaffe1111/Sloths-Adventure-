"""ART-22P (b): cut a repainted drift-petal take (driftstart.py's grid, painted on flat grey) into a packed sheet like
src/assets/flora/petals.webp: each piece keyed (grey connected to the border; alpha from the distance to the grey; rim colour un-mixed
from it), long side 64 px, packed 7 a row with a 2 px gap in a 512 px wide sheet (7 x 66 = 462; 8 would run past 512 and clip); frames as JSON for petalData.ts.

    python3 -I tools/art/hf22p/drift.py <take.png> <out.webp> <frames.json> [min piece area px, default 4000]
"""
import json, sys
from collections import deque
import numpy as np
from PIL import Image

src, out, fj = sys.argv[1:4]
MIN = int(sys.argv[4]) if len(sys.argv) > 4 else 4000
T_IN, T_OUT, SIDE, GAP, ROW = 14.0, 46.0, 64, 2, 7
px = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
H, W, _ = px.shape
bg = np.median(np.concatenate([px[0], px[-1], px[:, 0], px[:, -1]]), axis=0)
d = np.sqrt(((px - bg) ** 2).sum(axis=2))
near = d < T_OUT
seen = np.zeros((H, W), bool)
q = deque((y, x) for y in range(H) for x in (0, W - 1) if near[y, x])
q.extend((y, x) for x in range(W) for y in (0, H - 1) if near[y, x])
for y, x in q: seen[y, x] = True
while q:
    y, x = q.popleft()
    for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
        if 0 <= yy < H and 0 <= xx < W and near[yy, xx] and not seen[yy, xx]:
            seen[yy, xx] = True; q.append((yy, xx))
alpha = np.ones((H, W), np.float32)
alpha[seen] = np.clip((d[seen] - T_IN) / (T_OUT - T_IN), 0, 1)
a3 = np.maximum(alpha, 1e-3)[..., None]
rgb = np.clip((px - (1 - a3) * bg) / a3, 0, 255)
# the pieces: 8-connected parts of alpha > 0.05, big enough (specks are dropped: nothing floating)
solid = alpha > 0.05
lab = np.zeros((H, W), np.int32); n = 0; parts = []
for y0 in range(H):
    for x0 in range(W):
        if solid[y0, x0] and not lab[y0, x0]:
            n += 1; lab[y0, x0] = n; qq = deque([(y0, x0)]); pts = []
            while qq:
                y, x = qq.popleft(); pts.append((y, x))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        yy, xx = y + dy, x + dx
                        if 0 <= yy < H and 0 <= xx < W and solid[yy, xx] and not lab[yy, xx]:
                            lab[yy, xx] = n; qq.append((yy, xx))
            if len(pts) >= MIN:
                ys, xs = zip(*pts); parts.append((n, min(ys), min(xs), max(ys) + 1, max(xs) + 1))
parts.sort(key=lambda p: (round(p[1] / (H / 3)), p[2]))  # reading order: the grid's rows, then left to right
tiles = []
for n, y0, x0, y1, x1 in parts:
    m = (lab[y0:y1, x0:x1] == n)
    rgba = np.dstack([rgb[y0:y1, x0:x1], alpha[y0:y1, x0:x1] * m * 255]).astype(np.uint8)
    t = Image.fromarray(rgba, 'RGBA')
    k = SIDE / max(t.size)
    tiles.append(t.resize((max(1, round(t.width * k)), max(1, round(t.height * k))), Image.LANCZOS))
rows = (len(tiles) + ROW - 1) // ROW
assert ROW * (SIDE + GAP) - GAP <= 512, 'a row must fit the 512 px sheet'
S = Image.new('RGBA', (512, rows * (SIDE + GAP) - GAP), (0, 0, 0, 0))
frames = []
for i, t in enumerate(tiles):
    x, y = (i % ROW) * (SIDE + GAP), (i // ROW) * (SIDE + GAP)
    S.paste(t, (x, y)); frames.append({'x': x, 'y': y, 'w': t.width, 'h': t.height})
arr = np.asarray(S).copy(); arr[arr[..., 3] == 0, :3] = 0
Image.fromarray(arr, 'RGBA').save(out, 'WEBP', lossless=True)
json.dump(frames, open(fj, 'w'))
print(out, S.size, len(frames), 'pieces;', n - len(parts), 'specks dropped')
