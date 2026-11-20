"""
The bank end's face line, measured on the rock (ENG-24h, R-165.323 2c). pack.py set each world's `face` (the line the bank's soil and a
river's water are cut to, groundPaint.ts endFace) at 9 heights from the rightmost solid pixel of each row, the hanging roots included, so
the line ran out to the roots' tips and the soil showed in a strip between the rock and its roots (tools/perf/endcheck.mjs 'roots' gap':
81-95% of it soil, every world). Here the face is the rock's own edge, the roots left out, at N heights, each point at or inside the
edge over the rows either side of it (so the straight line between two points never runs outside the rock): what is behind the face
(the soil's cut) stays under the painted rock, which groundPaint.ts endSolid lays solid from its edge in.

  python3 tools/art/hfground/endface.py            (prints old vs new; --write rewrites groundAtlasData.ts's end and ends `face`)
"""
import json, re, sys
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / 'src/game/groundAtlasData.ts'
N = 25
# World 1 keeps pack.py's line: its pits' drops and hollow walls are fitted to it (w1Pits.ts dropOutline, wallLine; hollowWalls.test.ts
# fails on the rock's line: a wall held on its bound). Its line runs 6 units outside its rock on average, over pits, never a river.
KEEP = {'1'}
ERODE = 5  # a run at least 2 * ERODE + 1 px wide is rock; a hanging root is narrower (the same rule as groundPaint.ts solidEndAlpha)


def body_edge(al):
    h, w = al.shape
    out = np.full(h, -1.0)
    for y in range(h):
        mx = al[y].max()
        if mx < 8:
            continue
        run = 0
        for x in range(w):
            run = run + 1 if al[y, x] >= mx / 2 else 0
            if run >= 2 * ERODE + 1:
                out[y] = x + 0.5
    return out


def faces(e, al):
    h, w = al.shape
    edge = body_edge(al)
    rows = [min(h - 1, round(h * i / (N - 1))) for i in range(N)]
    pts = []
    for i, r in enumerate(rows):
        lo, hi = rows[max(0, i - 1)], rows[min(N - 1, i + 1)]
        seg = edge[lo:hi + 1]
        seg = seg[seg >= 0]
        pts.append(None if not len(seg) else float(seg.min()))
    # (rows with no rock, the grass over the top: the first point found)
    first = next(p for p in pts if p is not None)
    pts = [first if p is None else p for p in pts]
    corner = e['cx'] * w
    pts[0] = min(pts[0], corner)
    return [round(p / w, 4) for p in pts]


def main():
    src = DATA.read_text()
    m = re.search(r'(GROUND_FRAMES: Record<number, GroundSheet> = )(\{.*\});', src)
    g = json.loads(m.group(2))
    for w, s in g.items():
        if w in KEEP:
            print(f'w{w}: kept (KEEP)')
            continue
        e = s['end']
        im = np.asarray(Image.open(ROOT / f'src/assets/ground/w{w}.webp').convert('RGBA'))
        al = im[e['y']:e['y'] + e['h'], e['x']:e['x'] + e['w'], 3].astype(np.int32)
        new = faces(e, al)
        old = e['face']
        # (how far the old line ran outside the rock, sheet px, at the new line's heights)
        oldi = np.interp(np.linspace(0, 1, N), np.linspace(0, 1, len(old)), old)
        out = (oldi - np.array(new)) * e['w']
        print(f'w{w}: old {len(old)} points, new {N}; the old line outside the new by up to {out.max():.0f} px (mean {out.mean():.0f})')
        for k in ('end',):
            s[k]['face'] = new
        for x in s.get('ends', []):
            if (x['x'], x['y']) == (e['x'], e['y']):
                x['face'] = new
    if '--write' in sys.argv:
        DATA.write_text(src[:m.start(2)] + json.dumps(g) + src[m.end(2):])
        print('wrote', DATA.relative_to(ROOT))


main()
