"""The lead's depth measure (2026-11-01): luminance spread (std dev) of the top 60% of the upright 412x915 frame, after vs before.
    python3 -I tools/art/hfbackdrops/lumspread.py <before dir> <after dir> <stage> ...     pass = after >= 0.8 x before
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image

b, a = Path(sys.argv[1]), Path(sys.argv[2])


def spread(d, sid):
    for k in ('b', 'a'):
        p = d / f'{sid}-412x915-{k}.png'
        if p.exists():
            im = np.asarray(Image.open(p).convert('L')).astype(np.float32)
            return float(im[int(im.shape[0] * 0.07):int(im.shape[0] * 0.6)].std())  # (below the HUD bar)
    return None


for sid in sys.argv[3:]:
    x, y = spread(b, sid), spread(a, sid)
    r = y / x if x and y else float('nan')
    print(f'{sid}: before {x:.1f}  after {y:.1f}  ratio {r:.2f}  {"PASS" if r >= 0.8 else "FAIL"}')
