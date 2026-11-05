# RUNS #134-#141: which worlds lay each CP1 landing kind (cp1/measure.py kind(), the labels the spec's table uses: bank = moss_stone
# 60 px or deeper), from the built stages (16 layouts x 2 settings), with the share of the world's landings.
#   python3 -I tools/engine/runs/kinds-world.py <dump.json>...
import json, sys, collections
sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0]); from ideas import kind
c = collections.defaultdict(collections.Counter); tot = collections.Counter()
for f in sys.argv[1:]:
    for r in json.load(open(f)):
        if 'error' in r: continue
        w = int(r['id'].split('-')[0])
        for p in r['platforms']:
            k = kind(p)
            if not k or p['deco']: continue
            if p['type'] == 'fragile' and p['style'] == 'ruin': k = 'crumble (ruin slab)'
            if 'stump' in (p['keys'] or '').split('|'): c['log on a stump post'][w] += 1
            c[k][w] += 1; tot[w] += 1
for k in sorted(c, key=lambda k: -sum(c[k].values())):
    print(f"  {k:24s} " + ' '.join(f"W{w}:{c[k][w] / tot[w]:.3f}" for w in range(1, 11) if c[k][w]) + f"   (worlds {sorted(c[k])})")
