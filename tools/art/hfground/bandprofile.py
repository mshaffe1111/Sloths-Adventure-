"""Column-brightness profile of a world's soil as the game lays it (groundPaint.ts soilCells: 600-unit tiles, brick bond, four variants
by (col + 2 row) mod 4), one tile row at a time, so a vertical band (a column of a different shade) shows as a step or hump at the same x.
    python3 tools/art/hfground/bandprofile.py <sheet.webp> <world> [rows]   -> per row: the profile's range, the largest step over 30 units
"""
import json, re, sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
G = json.loads(re.search(r'GROUND_FRAMES: Record<number, GroundSheet> = (\{.*\});', (ROOT / 'src/game/groundAtlasData.ts').read_text(), re.S).group(1))


def profile(sheet, w, row, x0=0, x1=4800, px=0.5):
    g = G[str(w)]
    S = np.asarray(Image.open(sheet).convert('RGB'), np.float32) @ np.array([0.299, 0.587, 0.114], np.float32)
    fills = [S[f['y']:f['y'] + f['h'], f['x']:f['x'] + f['w']] for f in g['fills']]
    n = len(fills)
    cm = [f.mean(0) for f in fills]  # each fill's column means (a row of tiles is a whole tile tall)
    off = (row % 2) * 300
    xs = np.arange(x0, x1, px)
    out = np.empty_like(xs)
    for i, x in enumerate(xs):
        c = int(np.floor((x - off) / 600))
        v = ((c + 2 * row) % 4 + 4) % 4 if n >= 4 else 0
        u = (x - off - c * 600) / 600
        col = cm[v % n]
        out[i] = col[min(len(col) - 1, int(u * len(col)))]
    return xs, out


if __name__ == '__main__':
    sheet, w = sys.argv[1], int(sys.argv[2])
    for row in range(int(sys.argv[3]) if len(sys.argv) > 3 else 2):
        xs, p = profile(sheet, w, row)
        k = int(30 / 0.5)
        sm = np.convolve(p, np.ones(k) / k, mode='valid')
        step = np.abs(sm[k:] - sm[:-k]).max()
        print(f'w{w} row{row}: mean {p.mean():.1f} range(30u avg) {sm.min():.1f}-{sm.max():.1f} = {sm.max() - sm.min():.1f}  max step over 30u {step:.1f}')
