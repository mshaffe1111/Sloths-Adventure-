# tabulate top-1 IL records per level for one category: ilt.py levels.json records.json catid
import json,sys,re
L=[(x['id'],x['name']) for x in json.load(open(sys.argv[1]))['data']]
d=json.load(open(sys.argv[2]))['data']
best={}
for r in d:
    if r['category']!=sys.argv[3] or not r['runs']: continue
    t=r['runs'][0]['run']['times']['primary_t']
    if r['level'] not in best or t<best[r['level']][0]: best[r['level']]=(t,r['runs'][0]['run']['weblink'])
for i,n in L:
    if i in best: print(f"{best[i][0]:8.2f}\t{n}\t{best[i][1]}")
    else: print(f"     n/a\t{n}")
