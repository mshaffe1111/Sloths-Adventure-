import json, sys, collections
sys.path.insert(0, 'cp1')
from measure2 import landings
def zones(r):
    L=[q for q in landings(r) if q[3] not in ('climb','liana')]
    x0,x1=min(q[0] for q in L),max(q[1] for q in L); out=[]; run=0; x=x0
    while x<x1:
        ys=sorted({q[2] for q in L if q[0]-90<=x<=q[1]+90})
        if len(ys)>=2 and ys[-1]-ys[0]>=120: run+=20
        else:
            if run>300: out.append((x-run, x))
            run=0
        x+=20
    return out
rows=json.load(open(sys.argv[1]))
mix=json.load(open(sys.argv[2]))  # explain per layout
cnt=collections.Counter()
for r in rows:
    if r['setting']!='normal': continue
    ex=mix[str(r['layout'])]
    for a,b in zones(r):
        m=(a+b)/2
        hit=[e for e in ex if e['x0']<=m<=e['x1']]
        cnt[' + '.join(sorted({e['idea']+('/'+e['road'] if e.get('road') else '') for e in hit})) or 'between']+=1
for k,v in cnt.most_common(): print(f'{v/16:5.2f} per roll  {k}')
