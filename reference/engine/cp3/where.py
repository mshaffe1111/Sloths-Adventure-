import json, sys
sys.path.insert(0, 'cp1')
from measure2 import landings
rows=json.load(open(sys.argv[1])); ex=json.load(open(sys.argv[2]))
def at(e,x): return ', '.join(sorted({f"n{q['node']} {q['idea']}" for q in e if q['x0']-40<=x<=q['x1']+40})) or 'frame'
for r in rows:
    if r['setting']!='normal' : continue
    e=ex[str(r['layout'])]; L=landings(r)
    plats=[q for q in L if q[3] not in ('climb','liana')]
    best=(0,0,0); start=None
    for i,(a,b) in enumerate(zip(plats,plats[1:])):
        if abs(b[2]-a[2])<=20:
            if start is None: start=a[0]
            if b[1]-start>best[0]: best=(b[1]-start,start,b[1])
        else: start=None
    ks=[f'{q[3]} {q[4]}' for q in L]
    news=[(L[i][0]+L[i][1])/2 for i in range(len(L)) if ks[i] not in ks[max(0,i-6):i]]
    g=max(zip(news,news[1:]),key=lambda p:p[1]-p[0])
    print(r['layout'],'flat',round(best[0]),at(e,(best[1]+best[2])/2),'| new-gap',round(g[1]-g[0]),at(e,(g[0]+g[1])/2))
