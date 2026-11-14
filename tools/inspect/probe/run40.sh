#!/bin/bash
# usage: run40.sh <stage> <out.jsonl>  (8 chunks in parallel, json rows)
S=$(dirname $2); for i in 0 1 2 3 4 5 6 7; do seeds=$(python3 -c "print(','.join(str(s) for s in range(1,41) if s%8==$i))"); npx tsx tools/inspect/castBots.ts --stage $1 --seeds $seeds --json > $2.$i 2>/dev/null & done; wait; cat $2.? > $2; rm $2.?
python3 - "$2" <<'PY'
import json,sys,collections
rows=[json.loads(l) for l in open(sys.argv[1]) if l.startswith('{')]
by=collections.defaultdict(list)
for r in rows: by[(r['bot'],r['setting'])].append(r)
tot=0
for k,R in sorted(by.items()):
  P=[r for r in R if r['pass']]; tot+=len(P); t=sorted(r['time'] for r in P)
  print(k, f"{len(P)}/{len(R)}", 'min', t[0] if t else '-', 'med', t[len(t)//2] if t else '-', 'under120', sum(1 for r in R if r['time']<120))
print('TOTAL', tot, '/', len(rows))
c=collections.Counter()
for r in rows:
  if not r['pass']:
    for s in r['stuck']: c[(s['what'][:60], s['x']//100*100)]+=1
for k,v in c.most_common(12): print(' ',v,k)
PY
