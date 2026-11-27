import json,sys,re,statistics as st
new=[json.loads(l) for f in sys.argv[2:] for l in open(f) if l.strip()]
base=[json.loads(l) for l in open(sys.argv[1]) if l.strip()]
kind=lambda w: re.sub(r'-?\d+(\.\d+)?','#',w)
def kinds(rows): return {kind(s['what']) for r in rows for s in r.get('stuck',[])}
print('rows',len(new),'shrine',sum(r['end']=='shrine' for r in new))
un=[(r['bot'],r['setting'],r['seed'],u) for r in new for u in (r.get('dark') or {}).get('unlit',[])]
print('unlit events',len(un)); [print(' ',*x) for x in un]
lp=max(((r.get('dark') or {}).get('loop',0),r['bot'],r['setting'],r['seed']) for r in new); print('max loop',lp)
print('gaveUp',sum(len((r.get('dark') or {}).get('gaveUp',[])) for r in new),'edgeTurns',sum(len((r.get('dark') or {}).get('edgeTurns',[])) for r in new))
nk=kinds(new)-kinds(base); print('rescue kinds the base lacks',len(nk)); [print(' ',k) for k in sorted(nk)]
print('bot setting  shrine  median new / base  delta  rescues new/base')
for b in ['kid','child','middle','adult','expert']:
  for s in ['normal','easy']:
    n=[r for r in new if r['bot']==b and r['setting']==s]; o=[r for r in base if r['bot']==b and r['setting']==s and r['seed']<=max([x['seed'] for x in n] or [0])]
    if not n: continue
    mn=st.median(r['time'] for r in n); mo=st.median(r['time'] for r in o) if o else float('nan')
    print(f"{b:7}{s:7} {sum(r['end']=='shrine' for r in n)}/{len(n)}  {mn:6.1f} / {mo:6.1f}  {mn-mo:+6.1f}  {sum(r['rescues'] for r in n)}/{sum(r['rescues'] for r in o)}")
