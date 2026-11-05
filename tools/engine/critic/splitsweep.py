# Critic's run: how the split count (ENGINE-SPEC L37, cp3/split180.py) moves with its OPEN 120 px height rule.
# Same code as reference/engine/cp3/split180.py (90 px road reach each side, runs over 300 px), with the height threshold swept.
# python3 tools/engine/critic/splitsweep.py <cp1-dump json>...   (dumps from reference/engine/cp1/cp1-dump.ts.txt)
import json, sys
sys.path.insert(0, 'reference/engine/cp1')
from measure2 import landings
def splits(r, dy):
    L = [q for q in landings(r) if q[3] not in ('climb', 'liana')]
    x0, x1 = min(q[0] for q in L), max(q[1] for q in L); zones = run = 0; x = x0
    while x < x1:
        ys = sorted({q[2] for q in L if q[0] - 90 <= x <= q[1] + 90})
        if len(ys) >= 2 and ys[-1] - ys[0] >= dy: run += 20
        else: zones += run > 300; run = 0
        x += 20
    return zones + (run > 300)
for f in sys.argv[1:]:
    rows = json.load(open(f)); out = {}
    for r in rows:
        for dy in (80, 120, 160, 200):
            out.setdefault((r['tag'], r['id'], r['setting'], dy), []).append(splits(r, dy))
    for k, v in sorted(out.items()):
        v = sorted(v); print(f'{k[0]} {k[1]} {k[2]:<6} dy>={k[3]:<3}  median {v[len(v)//2]:<3} min {v[0]:<3} max {v[-1]}')
