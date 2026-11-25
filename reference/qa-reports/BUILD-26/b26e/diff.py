import json,sys,collections
def load(f):
    d={}
    for l in open(f):
        r=json.loads(l); k=(r.get('bot') or r.get('who') or r.get('name'), r.get('setting'), r.get('seed')); d[k]=r
    return d
a,b=load(sys.argv[1]),load(sys.argv[2])
ok=lambda r: bool(r.get('pass', r.get('ok')))
cnt=collections.Counter()
for k in sorted(set(a)|set(b), key=str):
    ra,rb=a.get(k),b.get(k)
    pa,pb=ok(ra) if ra else None, ok(rb) if rb else None
    cnt[(k[0],k[1],'base')]+=bool(pa); cnt[(k[0],k[1],'head')]+=bool(pb)
    if pa!=pb: print('GAINED' if pb else 'LOST', k, 'base', ra.get('time') if ra else None, (ra or {}).get('rescues'), '| head', rb.get('time') if rb else None, (rb or {}).get('rescues'))
for bot in sorted({k[0] for k in cnt}):
    for s in ('normal','easy'):
        if (bot,s,'base') in cnt: print(f'{bot} {s}: base {cnt[(bot,s,"base")]} head {cnt[(bot,s,"head")]}')
