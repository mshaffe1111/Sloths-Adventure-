#!/usr/bin/env python3
"""Every file the build ships, ranked by bytes with a running total (task AS-1, lead's addition 11-11 8:50 PM ET).

    python3 tools/assets/rank.py dist reference/art/compress-trials/ranked-assets.csv

Columns: rank, bytes, KB, running MB, running % of the whole build, type, source file under src/ (matched by content hash; built
JS/CSS have no single source), dist path. Prints how much of the game the top 20 / 50 / 100 / 200 files are.
"""
import csv, hashlib, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
dist, out = sys.argv[1], sys.argv[2]
md5 = lambda p: hashlib.md5(open(p, 'rb').read()).hexdigest()
src = {}
for base in ('src', 'public'):
    for d, _, fs in os.walk(os.path.join(ROOT, base)):
        for f in fs:
            p = os.path.join(d, f)
            if os.path.getsize(p) > 0:
                src.setdefault(md5(p), os.path.relpath(p, ROOT))
rows = []
for d, _, fs in os.walk(dist):
    for f in fs:
        p = os.path.join(d, f)
        rows.append((os.path.getsize(p), os.path.relpath(p, dist), src.get(md5(p), '(built)')))
rows.sort(key=lambda r: -r[0])
total = sum(r[0] for r in rows)
run = 0
with open(out, 'w', newline='') as fh:
    w = csv.writer(fh)
    w.writerow(['rank', 'bytes', 'KB', 'running_MB', 'running_pct', 'type', 'source', 'dist'])
    for i, (b, dp, sp) in enumerate(rows, 1):
        run += b
        w.writerow([i, b, round(b / 1024), round(run / 2**20, 2), round(100 * run / total, 1), dp.rsplit('.', 1)[-1], sp, dp])
print(f'{len(rows)} files, {total / 2**20:.1f} MB')
run = 0
for i, (b, _, _) in enumerate(rows, 1):
    run += b
    if i in (10, 20, 50, 100, 200, 400):
        print(f'top {i}: {run / 2**20:.1f} MB ({100 * run / total:.0f}%)')
