"""Loop points in a swim clip (as gen/loopfind.py, on raw/<clip>/*.webp): the (start, end) pairs whose keyed silhouettes match best,
for a cycle between minlen and maxlen frames.  python3 -I tools/art/w6/swim/loops.py <clip> <minlen> [maxlen]"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H.parents[1] / 'train'))
from clips import key  # noqa: E402

n, mn = sys.argv[1], int(sys.argv[2])
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 48
fs = sorted((H / 'raw' / n).glob(f'{n}_*.webp'))
sil = [key(np.asarray(Image.open(f).convert('RGB'))) > 128 for f in fs]


def iou(i, j):
    a, b = sil[i], sil[j]
    return (a & b).sum() / max(1, (a | b).sum())


res = sorted(((iou(s, e), s, e) for s in range(len(sil)) for e in range(s + mn, min(len(sil), s + mx + 1))), reverse=True)[:10]
print(n, [(s, e, round(v, 3)) for v, s, e in res])
