import json,sys,glob,statistics as S
rows=[json.loads(l) for f in sys.argv[1:] for l in open(f) if l.strip()]
errs=[r for r in rows if 'error' in r]
rows=[r for r in rows if 'error' not in r]
stages=sorted({r['stage'] for r in rows})
bots=['kid','adult','child','middle','expert']
print('errors',len(errs), [ (e['stage'],e['bot'],e['setting'],e['seed'],e['error'][:80]) for e in errs][:5])
print('stage setting | ' + ' | '.join(f'{b}: pass, miss/run (h l p r), miss/min' for b in bots))
for st in stages:
  for se in ['normal','easy']:
    cells=[]
    for b in bots:
      rr=[r for r in rows if r['stage']==st and r['bot']==b and r['setting']==se]
      if not rr: cells.append('-'); continue
      m=[r['hits']+r['lives']+r['putbacks']+r['rescues'] for r in rr]
      mm=[(r['hits']+r['lives']+r['putbacks']+r['rescues'])/(r['time']/60) for r in rr]
      cells.append(f"{sum(r['pass'] for r in rr)}/{len(rr)} {S.mean(m):.1f} ({sum(r['hits'] for r in rr)} {sum(r['lives'] for r in rr)} {sum(r['putbacks'] for r in rr)} {sum(r['rescues'] for r in rr)}) {S.mean(mm):.2f}")
    print(st, se, '|', ' | '.join(cells))
