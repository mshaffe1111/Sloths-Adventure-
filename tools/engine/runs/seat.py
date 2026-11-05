# RUNS #80: how far each flag (checkpoint), heart and find sits above the nearest standable top under it (px; 0 = its base on the top),
# 16 layouts x 2 settings. A checkpoint's y and the exit's are their foot; a pickup's y is its middle (it bobs in the air by design).
#   python3 -I tools/engine/runs/seat.py <dump.json>...
import json, sys, collections
for f in sys.argv[1:]:
    by = collections.defaultdict(lambda: collections.defaultdict(list))
    for r in json.load(open(f)):
        if 'error' in r or r['id'] not in ('1-1', '1-5'): continue
        ps = [p for p in r['platforms'] if not p['deco'] and not p['soil']]
        def gap(x, y):
            c = [p['y'] - y for p in ps if p['x'] <= x <= p['x'] + p['w'] and p['y'] >= y - 4]
            return min(c) if c else None
        k = (r['tag'], r['id'], r['setting'])
        for c in r['checkpoints']: by[k]['flag'].append(gap(c['x'], c['y']))
        for c in r['collect']:
            if c['t'] in ('heart', 'super_heart', 'find', 'mark'): by[k][c['t']].append(gap(c['x'], c['y']))
    for k, d in sorted(by.items()):
        print(f"{' '.join(k)}: " + ' | '.join(f"{t} n={len(v)} within 4 px {sum(1 for g in v if g is not None and g <= 4)}, over {sorted(set(g for g in v if g is not None and g > 4))[:6]}, nothing under {sum(1 for g in v if g is None)}" for t, v in d.items()))
