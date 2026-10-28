"""Loop points in a clip (as w6/swim/loops.py, on raw/<clip>/*.webp beside this file): the (start, end) pairs whose keyed silhouettes
match best, for a cycle between minlen and maxlen frames, starting at or after `first`.
    python3 -I tools/art/anim/loops.py <clip> <minlen> [maxlen] [first] [last]"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

H = Path(__file__).resolve().parent
sys.path.insert(0, str(H.parent / 'train'))
from clips import key  # noqa: E402

n, mn = sys.argv[1], int(sys.argv[2])
mx = int(sys.argv[3]) if len(sys.argv) > 3 else 48
first = int(sys.argv[4]) if len(sys.argv) > 4 else 0
fs = sorted((H / 'raw' / n).glob(f'{n}_*.webp'))
fs = fs[:int(sys.argv[5]) + 1] if len(sys.argv) > 5 else fs  # optional last frame (a clip that freezes at its end)
sil = [key(np.asarray(Image.open(f).convert('RGB'))) > 128 for f in fs]


def iou(i, j):
    a, b = sil[i], sil[j]
    return (a & b).sum() / max(1, (a | b).sum())


res = sorted(((iou(s, e), s, e) for s in range(first, len(sil)) for e in range(s + mn, min(len(sil), s + mx + 1))), reverse=True)[:10]
print(n, [(s, e, round(v, 3)) for v, s, e in res])
