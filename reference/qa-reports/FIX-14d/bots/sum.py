import json,sys,glob,collections
S=sys.argv[1]
for head in ['14b','14d']:
  rows=[json.loads(l) for f in glob.glob(f'{S}/cb{head}-*.jsonl') for l in open(f) if l.startswith('{')]
  c=collections.defaultdict(lambda:[0,0]); fails=collections.defaultdict(collections.Counter)
  for r in rows:
    k=(r['bot'],r['setting']); c[k][1]+=1; c[k][0]+=r['pass']
    if not r['pass']:
      for s in r['stuck'][:1]: fails[k][f"x{s['x']} {s['what'][:40]}"]+=1
  print(head, ' '.join(f"{b}-{s[0].upper()} {p}/{n}" for (b,s),(p,n) in sorted(c.items())))
  for k,v in sorted(fails.items()): print('  ',k, v.most_common(3))
