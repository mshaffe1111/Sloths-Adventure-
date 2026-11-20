import json,sys,collections
rows=[]
for f in sys.argv[1:]:
    for l in open(f):
        r=json.loads(l)
        hit=[o for o in r['runs'] if o['orphan'] is not None and o['art'] and o.get('visPx',0)>20]
        lone=[o for o in r['runs'] if o['orphan'] is not None and not o['art'] and o.get('visPx',0)>20]
        rows.append((r['job'],r['diff'],r['seed'],len(hit),len(lone)))
by=collections.defaultdict(lambda:[0,0,0])
for j,d,s,h,lo in sorted(rows):
    st=j.split(':')[0]; by[(st,d)][0]+=h; by[(st,d)][1]+=lo; by[(st,d)][2]+=1
for k in sorted(by): print(k, 'builds',by[k][2],'tabs',by[k][0],'lone',by[k][1])
print('TOTAL builds',len(rows),'tabs',sum(r[3] for r in rows),'lone',sum(r[4] for r in rows), 'builds with a tab', sum(1 for r in rows if r[3]))
