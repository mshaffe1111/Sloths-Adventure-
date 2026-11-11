# For catalogues outside the cut-folder format: write <out>/world-fit.csv (id, kind, worlds best first, why) and <out>/BY-WORLD.md.
# usage: apply_simple.py <fit module> <rows csv with id,kind> <out dir> <title>
import sys, csv, importlib, os
sys.path.insert(0, '.')
from worlds import W, GAP, fmt
F = importlib.import_module(sys.argv[1]).F; rows = list(csv.DictReader(open(sys.argv[2]))); out = sys.argv[3]; title = sys.argv[4]
os.makedirs(out, exist_ok=True)
ids = [r['id'] for r in rows]; assert set(ids) == set(F), (set(ids) ^ set(F))
with open(f'{out}/world-fit.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['id', 'kind', 'worlds_best_first', 'why'])
    for r in rows: w.writerow([r['id'], r['kind'], fmt(F[r['id']][0]), F[r['id']][1]])
L = [f'# World fit: {title}\n', 'Matt, 11-11: "determine where they work the best... some may work in multiple worlds" (universal for all art). '
     'Every world each piece fits, best first, with a reason, in `world-fit.csv`; by material and mood, with the kit gaps from reference/art/KIT-AUDIT.md (11-06). Data only, no art changed. '
     '**Made things are never World 1** (the lead, 11-11): rope, sawn posts and boards, lashed frames, carved stone go to W2 Sunlit Riverbank or W7 Ancient Ruins; natural pieces stay as tagged.\n',
     '## By world\n', '| World | Pieces (best fit in bold) | Its kit gap |', '|---|---|---|']
for n in W:
    ps = [(i, F[i][0][0] == n) for i in ids if n in F[i][0]]
    L.append(f"| {n} {W[n]} ({len(ps)}) | {', '.join(f'**{i}**' if b else i for i, b in ps) or 'none'} | {GAP[n]} |")
import re as _re
w1 = [r['id'] for r in rows if 1 in F[r['id']][0] and _re.search(r'walkable|plank|stump|rock|island|pit wall|standable|platform|step|ledge|perch|boulder|bough', r['kind'], _re.I)]
L.insert(2, f"**World 1 flat tops left** (pieces you can stand on that still fit W1, after the made-things and sawn-wood rulings): **{len(w1)}**: {', '.join(w1) or 'none'}.\n")
open(f'{out}/BY-WORLD.md', 'w').write('\n'.join(L) + '\n')
print({n: sum(1 for i in ids if n in F[i][0]) for n in W})
