"""DRESS-27: a see-through seam inside a painted piece (2-7's weir: 2-3 fully transparent rows across the whole falls between the foam and
the pool, cut rows 329-331, so the sky and banks behind showed as a hard thin dark line with coloured specks). For each frame of a sheet:
a row is a SEAM when, across the piece's painted span (columns painted both above and below it within 8 rows), 60% or more of those
columns are fully transparent on that row. Exit 1 on any seam, naming frame and rows.
    python3 -I reference/qa-reports/DRESS-27/seamcheck.py <sheet.webp> <frames.json> [frame ...]
"""
import json, sys
import numpy as np
from PIL import Image
sheet, frames = sys.argv[1], json.load(open(sys.argv[2]))
names = sys.argv[3:] or list(frames)
A = np.asarray(Image.open(sheet).convert('RGBA'))[..., 3]
bad = 0
for n in names:
    f = frames[n]
    a = A[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']]
    h = a.shape[0]
    rows = []
    for y in range(8, h - 8):
        above = (a[y - 8:y] > 128).any(axis=0)
        below = (a[y + 1:y + 9] > 16).any(axis=0)
        span = above & below
        if span.sum() < 0.2 * a.shape[1]:
            continue
        if (a[y][span] == 0).mean() >= 0.6:
            rows.append(y)
    if rows:
        bad += 1
        print(f'SEAM {n}: rows {rows[0]}..{rows[-1]} ({len(rows)}) see-through across the piece')
    else:
        print(f'ok {n}')
sys.exit(1 if bad else 0)
