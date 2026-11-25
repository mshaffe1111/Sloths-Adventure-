import json,sys,collections,re
rows=[json.loads(l) for f in sys.argv[1:] for l in open(f) if l.startswith('{')]
by=collections.defaultdict(lambda:[0,0,0,0,[]])
for r in rows:
  k=(r['bot'],r['setting']); b=by[k]; b[0]+=1; b[1]+=r['pass']; b[2]+=r['end']=='shrine'; b[3]+=r['rescues']; b[4].append(r['time'])
print(len(rows),'rows')
for k,b in sorted(by.items()): print(f"{k[0]:7}{k[1]:7} n{b[0]:3} pass{b[1]:3} shrine{b[2]:3} rescues{b[3]:4} min{min(b[4]):6.1f}")
c=collections.Counter()
for r in rows:
  for s in r['stuck']: c[re.sub(r'\d+','N',s['what'])]+=1
for w,n in c.most_common(8): print(n,w[:110])
