# Critic's recount of tools/engine/moveladder.json (engine-mixer 7d9ad9a9): first stage, stage count, longest absence per mechanic.
# Run from the engine-mixer checkout: python3 reference/engine/critic-runs/ladder.py tools/engine/moveladder.json
import json, sys
d = json.load(open(sys.argv[1]))
allst = set().union(*[set(r['stages']) for r in d['rows']])
key = lambda s: (int(s.split('-')[0]), -1 if not s.split('-')[1].isdigit() else int(s.split('-')[1]))
order = sorted(allst, key=key); idx = {s: i for i, s in enumerate(order)}
print('layouts', d['layouts'], 'stages', d['stages'], 'stages in any row', len(order))
for r in d['rows']:
    st = sorted(r['stages'], key=key); pos = [idx[s] for s in st]
    gaps = [(pos[i+1]-pos[i]-1, st[i], st[i+1]) for i in range(len(pos)-1)] + [(len(order)-1-pos[-1], st[-1], 'end')]
    print(f"{r['id']:<14} first={st[0]:<5} n={len(st):<3} longest={max(gaps)}")
