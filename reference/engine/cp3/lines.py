# CP3: the variety gate's pass lines (ENGINE-SPEC, from CP1's old 1-1 numbers), per roll, both settings; and the two-road share
import json, sys
sys.path.insert(0, 'cp1')
exec(open('cp1/zones.py').read().split("rows=json.load")[0])
d = json.load(open('cp1/measures2.json'))
def ud(x): return (x['up'] + x['down']) / (x['up'] + x['down'] + x['flat'])
om = sorted(ud(x) for x in d['old 1-1 normal'])[8]
for k in ['mix 1-5 normal', 'mix 1-5 easy']:
    v = d[k]; print(k)
    rows = [('same piece in a row', 'max', max(x['run'] for x in v), '<=', 9), ('kind x size in a row', 'max', max(x['runKS'] for x in v), '<=', 7),
            ('new every (mean px)', 'max', max(x['newMeanPx'] for x in v), '<=', 572), ('longest with nothing new px', 'max', max(x['newLongPx'] for x in v), '<=', 1516),
            ('flat stretch px', 'max', max(x['flatPx'] for x in v), '<=', 1351), ('up+down share', 'min', round(min(ud(x) for x in v), 3), '>=', round(om, 3)),
            ('kinds', 'min', min(x['kinds'] for x in v), '>=', 5), ('commonest share', 'max', max(x['share'] for x in v), '<=', 0.468),
            ('climb range px', 'min', min(x['yRange'] for x in v), '>=', 415)]
    for name, agg, val, op, line in rows:
        ok = val <= line if op == '<=' else val >= line
        print(f'  {name:28} {agg} {val:>8}  line {op} {line:<6} {"PASS" if ok else "MISS"}')
for f in ['cp1-old.json', 'cp3-mix.json']:
    out = []
    for r in json.load(open(f)):
        if r['setting'] != 'normal': continue
        W = max(p['x'] + p['w'] for p in r['platforms']); out.append(round(sum(b - a for a, b in zones(r)) / W, 3))
    out.sort(); print(f, 'two-road share of length, Normal: median', out[8], 'range', out[0], '-', out[-1])
