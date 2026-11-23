"""DRESS-27: close the weir cut's see-through seam (seamcheck.py: rows 329-331 of reference/art/hfnext/cut/weir.png fully transparent
across the falls, between the foam's foot and the pool). In each column, a fully transparent pixel with the piece painted within 6 rows
above AND below it takes the straight blend of those two nearest painted pixels (colour and alpha), so the foam runs into the pool with
nothing new along the line. Every other pixel is left as cut.
    python3 -I reference/qa-reports/DRESS-27/weirseam.py <weir.png in> <weir.png out> [y0 y1]
"""
import sys
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
y0, y1 = (int(v) for v in sys.argv[3:5]) if len(sys.argv) > 4 else (320, 340)
a = np.asarray(Image.open(src).convert('RGBA')).astype(np.float32)
h, w = a.shape[:2]
R = 6
filled = 0
for x in range(w):
    col = a[:, x]
    for y in range(y0, y1):
        if col[y, 3] != 0:
            continue
        up = next((y - k for k in range(1, R + 1) if y - k >= 0 and col[y - k, 3] > 0), None)
        dn = next((y + k for k in range(1, R + 1) if y + k < h and col[y + k, 3] > 0), None)
        if up is None or dn is None:
            continue
        t = (y - up) / (dn - up)
        a[y, x] = col[up] * (1 - t) + col[dn] * t
        filled += 1
Image.fromarray(np.clip(a + 0.5, 0, 255).astype(np.uint8), 'RGBA').save(out)
print('filled', filled, 'px')
