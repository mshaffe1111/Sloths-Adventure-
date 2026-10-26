"""
controlscan.py: QA check of the control-test recordings for moments a player lost control of Pokey.

    python3 -I tools/playtesters/controlscan.py <folder of decoded sessions>

Finds: touches the phone took away (touchcancel), steering held on the ground with no movement for 1.5 s, Pokey running on with
no finger down for 0.8 s, and a jump asked for on the ground with no lift-off within 0.4 s. A clean result means none happened.
"""
import json,glob,collections,sys
D=sys.argv[1]
cancels=collections.Counter(); touches=collections.Counter()
noResp=collections.defaultdict(list); drift=collections.defaultdict(list); deadJump=collections.defaultdict(list)
secNoResp=collections.Counter(); secDrift=collections.Counter(); secDead=collections.Counter()
for f in sorted(glob.glob(D+'/*.json')):
    s=json.load(open(f)); who=s['player']
    lines=sorted([l for part in s['parts'] if isinstance(part,list) for l in part],key=lambda l:l[1])
    sec=None; move='none'; fingers=set(); lastUp=-1e9
    P=[]  # (t,x,y,vx,vy,state,sec,move,nf)
    jumpsAt=[]
    for l in lines:
        k,t=l[0],l[1]
        if k=='e' and l[2]=='section': sec=str(l[3])
        elif k=='d': fingers.add(l[2]); touches[who]+=1
        elif k=='u': fingers.discard(l[2]); lastUp=t
        elif k=='c': fingers.discard(l[2]); cancels[who]+=1; lastUp=t
        elif k=='i':
            if l[2]=='move': move=str(l[3]) if len(l)>3 else 'none'
            if l[2] in ('jump','tapjump'): jumpsAt.append((t,sec))
        elif k=='p' and len(l)>=7:
            P.append((t,l[2],l[3],l[4],l[5],str(l[6]),sec,move,len(fingers),t-lastUp))
    # 1. steering held, on the ground, but no movement for 1.5 s (excludes climbing/hanging/swinging/duck)
    run=None
    for p in P:
        t,x,y,vx,vy,st,sc,mv,nf,sinceUp=p
        ground=st.startswith('g')
        if mv in ('left','right') and nf>0 and ground and abs(vx)<5:
            if run is None: run=(t,x,sc)
            elif t-run[0]>=1500 and abs(x-run[1])<6:
                noResp[who].append((run[2],round(run[1]))); secNoResp[run[2]]+=1; run=(t+10**9,x,sc)
        else: run=None
    # 2. moving with no finger down for over 0.8 s on the ground, more than a second after the last lift
    run=None
    for p in P:
        t,x,y,vx,vy,st,sc,mv,nf,sinceUp=p
        if nf==0 and st.startswith('g') and abs(vx)>120 and sinceUp>1000:
            if run is None: run=(t,x,sc)
            elif t-run[0]>=800:
                drift[who].append((run[2],round(run[1]),round(vx))); secDrift[run[2]]+=1; run=(t+10**9,x,sc)
        else: run=None
    # 3. a jump asked for while on the ground, but no lift-off within 0.4 s
    for (tj,sc) in jumpsAt:
        before=[p for p in P if tj-150<=p[0]<=tj]
        after=[p for p in P if tj<p[0]<=tj+400]
        if before and after and before[-1][5].startswith('g') and all(a[5].startswith('g') and a[4]>=-50 for a in after):
            deadJump[who].append((sc,round(before[-1][1]))); secDead[sc]+=1
print('### System took the touch (touch cancelled, e.g. an edge swipe): per player')
for w in touches: 
    if cancels[w]: print(f'  {w:14s} {cancels[w]:4d} of {touches[w]} touches')
print('### Thumb steering, Pokey on the ground but not moving for 1.5 s+: by section', secNoResp.most_common(8))
for w,v in noResp.items(): print(f'  {w:14s} {len(v):3d}  e.g. {v[:4]}')
print('### Pokey running on with no finger down for 0.8 s+ (lost control / sliding): by section', secDrift.most_common(8))
for w,v in drift.items(): print(f'  {w:14s} {len(v):3d}  e.g. {v[:3]}')
print('### Jump asked for on the ground, no lift-off within 0.4 s: by section', secDead.most_common(8))
for w,v in deadJump.items(): print(f'  {w:14s} {len(v):3d}  e.g. {v[:4]}')
