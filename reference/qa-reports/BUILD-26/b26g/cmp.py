import json,sys,collections
def load(p):
    d={}
    for l in open(p):
        l=l.strip()
        if l.startswith('{'): r=json.loads(l); d[(r['bot'],r['setting'],r['seed'])]=r
    return d
a=load(sys.argv[1]); b=load(sys.argv[2])
ok=lambda r: r['pass'] and r['rescues']==0
pa=collections.Counter(); pb=collections.Counter()
for k in a: pa[k[:2]]+=ok(a[k])
for k in b: pb[k[:2]]+=ok(b[k])
for t in sorted(pa): print(t, pa[t], '->', pb[t], '' if pb[t]>=pa[t] else 'DROP')
lost=[k for k in sorted(b) if k in a and ok(a[k]) and not ok(b[k])]
gain=[k for k in sorted(b) if k in a and not ok(a[k]) and ok(b[k])]
print('LOST', len(lost), ' '.join(f'{x[0]} {x[1][0].upper()} {x[2]}' for x in lost))
print('GAINED', len(gain), ' '.join(f'{x[0]} {x[1][0].upper()} {x[2]}' for x in gain))
