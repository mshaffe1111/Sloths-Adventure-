"""Find one clean loop in a cycle clip (run, walk): the frame gap at which the silhouette repeats best, and the best start for it."""
import sys, numpy as np
from pathlib import Path
from PIL import Image
sys.path.insert(0, '.')
from clips import key, torso_x, bbox
S = Path('vids')
name = sys.argv[1]
fs = sorted((S / name).glob(f'{name}_*.png'))
sil = []
for f in fs:
    a = key(np.asarray(Image.open(f).convert('RGB'))) > 128
    x0, y0, x1, y1 = bbox(a.astype(np.uint8) * 255)
    cx = torso_x(a.astype(np.uint8) * 255)
    # silhouette in a box centred on the torso, feet at the bottom
    pad = np.zeros((a.shape[0] + 400, a.shape[1] + 400), bool); pad[200:-200, 200:-200] = a
    c = pad[y1 + 200 - 260:y1 + 200, int(cx) + 200 - 130:int(cx) + 200 + 130]
    sil.append(c)
def iou(i, j):
    a, b = sil[i], sil[j]
    return (a & b).sum() / max(1, (a | b).sum())
n = len(sil)
print('lag  mean match')
best = None
for L in range(5, 17):
    m = np.mean([iou(i, i + L) for i in range(n - L)])
    print(L, round(m, 3))
    if best is None or m > best[1]: best = (L, m)
L = best[0]
starts = sorted(((iou(s, s + L), s) for s in range(4, n - L)), reverse=True)[:5]
print('period', L, 'best starts', [(s, round(v, 3)) for v, s in starts])
heights = [bbox(key(np.asarray(Image.open(f).convert('RGB'))))[3] - bbox(key(np.asarray(Image.open(f).convert('RGB'))))[1] for f in fs[::6]]
print('figure height px (every 6th frame)', heights)
