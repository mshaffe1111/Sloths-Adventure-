import json,sys
d=json.load(open(sys.argv[1]))
# stage order: all stages from the gap row (every stage)
order=max((r['stages'] for r in d['rows']),key=len)
idx={s:i for i,s in enumerate(order)}
world=lambda s:s.split('-')[0]
print(len(order),'stages;', 'rows',len(d['rows']))
# new per stage
firsts={}
for r in d['rows']: firsts.setdefault(r['first'],[]).append(r['id'])
print('new mechanics per stage (first appearance):')
print(' ',{s:len(firsts.get(s,[])) for s in order if firsts.get(s)})
print(f"{'mech':22} first  n   later%  maxgap(stages)  worldsAfter/worldsLater  1in3windowsFail")
for r in d['rows']:
    st=sorted(r['stages'],key=idx.get); f=idx[st[0]]
    later=len(order)-f-1; reuse=len(st)-1
    gaps=[idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]+[len(order)-1-idx[st[-1]]]
    fw=int(world(st[0])); ws={int(world(s)) for s in st}
    lw=[w for w in range(fw+1,11)]
    # 1-in-3 windows after first
    fails=0
    for i in range(f+1,len(order)-2):
        if not any(idx[s] in (i,i+1,i+2) for s in st): fails+=1
    print(f"{r['id']:22} {st[0]:6} {len(st):3} {100*reuse/max(later,1):6.0f}%  {max(gaps) if gaps else 0:5}   {len([w for w in lw if w in ws])}/{len(lw)}   {fails}")
