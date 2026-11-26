import sys, glob, re, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; ranges = [tuple(map(float, r.split('-'))) for r in sys.argv[3:]]
fs = {float(re.search(r'-t([0-9.]+)\.png$', f).group(1)): f for f in glob.glob(os.path.join(d, '1-1-walk-t*.png'))}
rows = []
for a, b in ranges:
    ts = sorted(t for t in fs if a - 1e-6 <= t <= b + 1e-6)
    tiles = [Image.open(fs[t]).convert('RGB') for t in ts]; w, h = tiles[0].size
    row = Image.new('RGB', (w * len(tiles), h + 20), 'white'); dr = ImageDraw.Draw(row)
    for n, (t, tl) in enumerate(zip(ts, tiles)): row.paste(tl, (n * w, 20)); dr.text((n * w + 4, 4), f'{t:.2f} s', fill='black')
    rows.append(row)
W = max(r.size[0] for r in rows); H = sum(r.size[1] for r in rows)
sh = Image.new('RGB', (W, H), 'white'); y = 0
for r in rows: sh.paste(r, (0, y)); y += r.size[1]
sh.save(out); print(out, sh.size)
