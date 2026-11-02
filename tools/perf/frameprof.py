# python3 tools/perf/frameprof.py <from ms> <to ms> [nomarker]: self and total time per function in that window of /tmp/frameprof.json (ms after the live marker; 'nomarker' for qstep's profile: ms from its start). Sample counts x 0.25 ms (qstep) or x 0.5 ms (frameprof): check the interval you profiled with.
import json,sys,collections
d=json.load(open('/tmp/frameprof.json')); p=d['profile']; live=d['live']
t0=float(sys.argv[1]) if len(sys.argv)>1 else 0; t1=float(sys.argv[2]) if len(sys.argv)>2 else 1e9
nodes={n['id']:n for n in p['nodes']}; parent={}
for n in p['nodes']:
  for c in n.get('children',[]): parent[c]=n['id']
# profile startTime is in us of monotonic clock; performance.now origin unknown -> align: assume sample times relative; use timeOrigin from first gap? we use relative to live via 'live' in ms and profile in us since some epoch; print window in profile ms
t=p['startTime']; times=[]
for dt in p['timeDeltas']: t+=dt; times.append(t)
self=collections.Counter(); tot=collections.Counter()
# find the window: user gives offsets relative to profile end minus 2600ms
mk=[] if len(sys.argv)>3 else [ts for sid,ts in zip(p['samples'],times) if nodes[sid]['callFrame']['functionName']=='__MARK_LIVE']
base=max(mk) if mk else p['startTime']
print('marker found', bool(mk))
for sid,ts in zip(p['samples'],times):
  rel=(ts-base)/1000
  if rel<t0 or rel>t1: continue
  n=nodes[sid]; cf=n['callFrame']; self[(cf['functionName'] or '(anon)')+' '+cf['url'].split('/')[-1].split('?')[0]+':'+str(cf['lineNumber'])]+=1
  seen=set(); x=sid
  while x in nodes:
    cf=nodes[x]['callFrame']; k=(cf['functionName'] or '(anon)')+' '+cf['url'].split('/')[-1].split('?')[0]+':'+str(cf['lineNumber'])
    if k not in seen: tot[k]+=1; seen.add(k)
    x=parent.get(x,-1)
print('SELF'); [print(v*0.25,'ms',k) for k,v in self.most_common(25)]
print('TOTAL'); [print(v*0.25,'ms',k) for k,v in tot.most_common(40)]
