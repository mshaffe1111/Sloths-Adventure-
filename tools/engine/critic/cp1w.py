# Critic's run: CP1's own measures (reference/engine/cp1/measure2.py `measure`, unchanged) on the old stages of more worlds, Normal,
# median over the layouts in the dump. python3 tools/engine/critic/cp1w.py <cp1 dump json>...
import json, sys, collections, statistics as st
sys.path.insert(0, 'reference/engine/cp1')
from measure2 import measure
rows = collections.defaultdict(list); tops = collections.defaultdict(collections.Counter)
for f in sys.argv[1:]:
    for r in json.load(open(f)):
        if r['setting'] != 'normal': continue
        try: m = measure(r)
        except Exception as e: print('skip', r['id'], r['layout'], e); continue
        rows[r['id']].append(m); tops[r['id']][m['top']] += 1
cols = ['kinds', 'kindSizes', 'share', 'run', 'runKS', 'yRange', 'splits', 'newMeanPx', 'newLongPx', 'flatPx']
print(f"{'stage':<6} {'top kind':<14} " + ' '.join(f'{c:>9}' for c in cols))
key = lambda s: tuple(int(x) if x.isdigit() else -1 for x in s.split('-'))
for sid in sorted(rows, key=key):
    v = rows[sid]
    print(f"{sid:<6} {tops[sid].most_common(1)[0][0]:<14} " + ' '.join(f"{st.median([x[c] for x in v]):>9g}" for c in cols))
