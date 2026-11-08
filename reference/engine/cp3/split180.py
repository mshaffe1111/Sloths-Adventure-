import json, sys
sys.path.insert(0, 'cp1')
from measure2 import landings
def splits180(r):
    L=[q for q in landings(r) if q[3] not in ('climb','liana')]
    x0,x1=min(q[0] for q in L),max(q[1] for q in L); zones=0; run=0; x=x0
    while x<x1:
        ys=sorted({q[2] for q in L if q[0]-90<=x<=q[1]+90})
        if len(ys)>=2 and ys[-1]-ys[0]>=120: run+=20
        else:
            zones+= run>300; run=0
        x+=20
    return zones+(run>300)
for f,tag in [('cp1-old.json','old 1-1'),('cp1-new.json','rebuilt'),('cp3-mix.json','mix 1-5')]:
    out={}
    for r in json.load(open(f)):
        out.setdefault((r['id'],r['setting']),[]).append(splits180(r))
    for k,v in out.items():
        print(f'{tag} {k}: {v}  median {sorted(v)[len(v)//2]}')
