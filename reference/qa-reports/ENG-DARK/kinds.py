import json,re,sys,glob
kind=lambda w: re.sub(r'-?\d+(\.\d+)?','#',w)
def load(fs):
    out=[]
    for f in fs: out+= [json.loads(l) for l in open(f) if l.strip()]
    return out
base=load(['cast-3-1-x40-base-c1008d8e.jsonl'])
new=load(sys.argv[1:])
bk={kind(s['what']) for r in base for s in r.get('stuck',[])}
def down(w):
    m=re.search(r'way on is (-?\d+) px down',w); return int(m.group(1)) if m else None
print('base rescues',sum(r['rescues'] for r in base),'new rescues',sum(r['rescues'] for r in new))
for r in new:
    for s in r.get('stuck',[]):
        k=kind(s['what'])
        if k in bk: continue
        same=[(b['bot'],b2['x'],b2['what']) for b in base if b['seed']==r['seed'] and b['setting']==r['setting'] for b2 in b.get('stuck',[]) if abs(b2['x']-s['x'])<=120 and down(b2['what']) is not None and down(s['what']) is not None and abs(down(b2['what'])-down(s['what']))<=40]
        nb=sum(b['rescues'] for b in base if b['seed']==r['seed'] and b['setting']==r['setting'])
        print(f"{r['bot']} {r['setting']} {r['seed']} x {s['x']}: {s['what']} | base same spot: {len(same)} (base rescues on this roll {nb})")
        for t in same[:3]: print('    base',t)
