"""
logscan.py: QA log analysis of the control-test recordings (decoded sessions, as for profile.py).

    python3 -I tools/playtesters/logscan.py <folder of decoded sessions>

Reports freezes and choppy frame rates by device, the hardest sections (hurts, lives lost, quits), places players got stuck
(no progress for over 15 s while touching), and per-player gesture habits (ducks, kicks, jumps per minute).
From the 2026-10-26 recorder on: memory over a session ('mem'), which atlas sheet a freeze followed ('stall ... after <sheet>'),
and a count of any other event kinds (err, long, hidden, screen, quality, blank, camjump, blink, jitter, flipflop: see
tools/playtesters/LOG_EVENTS.md once it lands) with where they happened.
"""
import json,glob,collections,re,statistics,sys
D=sys.argv[1]
secTime=collections.defaultdict(list)   # section -> seconds spent per visit
secHurt=collections.Counter(); secLife=collections.defaultdict(collections.Counter); secQuit=collections.Counter()
secVisits=collections.Counter(); stalls=collections.defaultdict(list); fpsBad=collections.defaultdict(list)
stuck=[]; duckOn=collections.Counter(); kicks=collections.Counter(); mins=collections.Counter(); jumps=collections.Counter()
stallAfter=collections.Counter(); memRuns=[]; other=collections.defaultdict(list)
bossHurt=collections.Counter()  # (by, move) for each boss-fight heart: 'strike act pounce 0.96' (bossHurt, 2026-10-26 on)
KNOWN={'bossHurt','look','section','hurt','lostLife','quit','stall','fps','mem','checkpoint','sheet','stomp','finish','mix','survey','start','rules','playAgain','difficulty','stuckHelp'}
for f in sorted(glob.glob(D+'/*.json')):
    s=json.load(open(f)); who=s['player']; dev=s['device'].split(';')[0]+' '+s['device'].split(';')[1].strip().split(' ')[0]
    lines=[l for part in s['parts'] if isinstance(part,list) for l in part]
    lines.sort(key=lambda l:l[1])
    if not lines: continue
    mins[who]+= (lines[-1][1]-lines[0][1])/60000
    sec=None; secStart=None; lastX=None; lastMoveT=None; touching=0; stuckFrom=None; mem=[]
    for l in lines:
        k,t=l[0],l[1]
        if k=='e':
            e=l[2]; d=str(l[3]) if len(l)>3 else ''
            if e=='section':
                if sec and secStart is not None: secTime[sec].append((t-secStart)/1000)
                sec=d; secStart=t; secVisits[sec]+=1
            elif e=='hurt': secHurt[sec]+=1
            elif e=='lostLife': secLife[sec][d]+=1
            elif e=='quit': secQuit[sec]+=1
            elif e=='stall':
                m=re.match(r'(\d+)ms x(\d+)',d)
                if m: stalls[dev].append((int(m.group(1)),int(m.group(2)),sec,who))
                a=re.search(r'after (\S+)',d)
                if a: stallAfter[re.sub(r'-[A-Za-z0-9_]{8}\.','.',a.group(1))]+=1
            elif e=='mem':
                m=re.match(r'([\d.]+)/([\d.]+)\s*MB',d)
                if m: mem.append((t,float(m.group(1))))
            elif e=='bossHurt':
                w=d.split(); bossHurt[(w[0] if w else '?', w[2] if len(w)>2 else '?', w[1] if len(w)>1 else '?')]+=1
            elif e not in KNOWN:
                other[e].append((dev,who,sec,d[:60]))
            elif e=='fps':
                m=re.match(r'([\d.]+)fps p90 (\d+)ms max (\d+)ms',d)
                if m and (float(m.group(1))<26 or int(m.group(2))>45): fpsBad[dev].append((float(m.group(1)),int(m.group(2)),int(m.group(3)),sec,who))
        elif k=='i':
            if l[2]=='duck' and len(l)>3 and l[3]==1: duckOn[who]+=1
            if l[2]=='kick': kicks[who]+=1
            if l[2] in ('jump','tapjump'): jumps[who]+=1
        elif k in ('d','m'): lastMoveT=t
        elif k=='p':
            x=l[2]
            if lastX is None or abs(x-lastX)>40:
                if stuckFrom and t-stuckFrom[0]>15000 and lastMoveT and lastMoveT>stuckFrom[0]:
                    stuck.append(((t-stuckFrom[0])/1000,sec,who,stuckFrom[1]))
                lastX=x; stuckFrom=(t,x)
    if len(mem)>=3:
        span=(mem[-1][0]-mem[0][0])/60000
        memRuns.append((round((mem[-1][1]-mem[0][1])/max(span,0.1),2),who,dev,round(mem[0][1],1),round(mem[-1][1],1),round(max(v for _,v in mem),1),round(span,1)))
print('### Freezes (>100 ms from 2026-10-26, >250 ms before) by device: count, at stage start (x<300), mid-stage worst')
for dev,v in stalls.items():
    mid=[a for a in v if a[1]>=300]
    print(f'  {dev:32s} {len(v):3d} total, {len(v)-len(mid):3d} at start, mid-stage {len(mid)}: worst {sorted(mid,reverse=True)[:3]}')
print('### Freezes that followed an atlas sheet finishing loading:', stallAfter.most_common(10))
print('### Memory per session (MB per minute of play, start -> end, peak, minutes): climbers first')
for r in sorted(memRuns,reverse=True)[:12]: print(f'  {r[0]:+6.2f} MB/min  {r[1]:14s} {r[2]:28s} {r[3]} -> {r[4]} MB, peak {r[5]}, {r[6]} min')
print('### Boss hearts by cause (by, move, state): "body" or a strike outside "act" is a hit with no wind-up to see')
for (by,mv,st),n in bossHurt.most_common(15): print(f'  {n:3d}  {by:14s} {mv:14s} {st}'+('   <- check: no wind-up' if by=='body' or (by=='strike' and st!='act') else ''))
print('### Other events (new recorder kinds): count, where')
for k,v in sorted(other.items(),key=lambda kv:-len(kv[1])):
    print(f'  {k:10s} {len(v):4d}  sections {collections.Counter(a[2] for a in v).most_common(4)}  devices {collections.Counter(a[0] for a in v).most_common(3)}  e.g. {v[0][3]!r}')
print('### Choppy 5-second windows (<26 fps or p90 frame >45 ms) by device')
for dev,v in fpsBad.items():
    print(f'  {dev:32s} {len(v):3d} windows; sections {collections.Counter(a[3] for a in v).most_common(4)}; worst {sorted(v)[:2]}')
print('### Sections: visits, median seconds, hurts per visit, lives lost (cause), quits')
rows=[]
for sct in secVisits:
    tt=secTime.get(sct,[]); med=statistics.median(tt) if tt else 0
    rows.append((secHurt[sct]/max(1,secVisits[sct]),sct,secVisits[sct],med,secHurt[sct],dict(secLife[sct]),secQuit[sct]))
for r in sorted(rows,reverse=True): print(f'  {str(r[1]):22s} visits {r[2]:3d}  median {r[3]:5.1f}s  hurts {r[4]:3d} ({r[0]:.2f}/visit)  lives {r[5]}  quits {r[6]}')
print('### Stuck: no progress for >15 s while touching (seconds, section, player, x)')
c=collections.Counter(a[1] for a in stuck); print('  by section', c.most_common(8)); print('  longest', sorted(stuck,reverse=True)[:8])
print('### Player or game? Each section judged against who it beats (Matt, 2026-10-26)')
# A visit runs from a section starting to the next new section (passed), or to a quit or the session's end (gave up). Lives lost
# count either way. A respawn that falls back to an earlier section isn't a pass. Skill tiers come from how players do overall:
# a section that beats beginners but not skilled players is the player; one that beats skilled players too is the game.
visits=[]  # (player, section, passed, lives, hurts, seconds, nth visit by this player)
looks=[]  # the HUD each visit was played with: 'new'/'old' (+' quiet'), from the 'look' line (2026-10-26 on); '?' before
for f in sorted(glob.glob(D+'/*.json')):
    s=json.load(open(f)); who=s['player']
    lines=sorted([l for part in s['parts'] if isinstance(part,list) for l in part],key=lambda l:l[1])
    cur=None; seen=set(); look='?'
    def close(passed,t):
        if cur: visits.append((who,cur['sec'],passed,cur['lives'],cur['hurts'],(t-cur['t'])/1000)); looks.append(cur['look'])
    for l in lines:
        if l[0]!='e': continue
        e=l[2]; t=l[1]
        if e=='look': look=('new' if 'newLook 1' in str(l[3]) else 'old')+(' quiet' if 'quiet' in str(l[3]) else '')
        elif e in ('start','playAgain'): close(False,t); cur=None; seen=set()
        elif e=='section':
            d=str(l[3])
            if cur and d==cur['sec']: continue
            if d in seen and cur: cur['lives']+=0; continue  # fell back after a fall: still the same attempt
            close(True,t); seen.add(d); cur={'sec':d,'t':t,'lives':0,'hurts':0,'look':look}
        elif cur and e=='lostLife': cur['lives']+=1
        elif cur and e=='hurt': cur['hurts']+=1
        elif e=='finish': close(True,t); cur=None
        elif e=='quit': close(False,t); cur=None
    if cur: close(False,lines[-1][1] if lines else 0)
nth=collections.Counter(); vv=[]
for v in visits: nth[(v[0],v[1])]+=1; vv.append(v+(nth[(v[0],v[1])],))
byP=collections.defaultdict(list)
for v in vv: byP[v[0]].append(v)
# skill: hits taken per section, and only with real experience behind it (40+ section visits): a 3-minute session with no hits
# says little. Skilled = experienced and rarely hit; everyone else is judged as the learning group.
hpv={p:sum(v[4] for v in L)/len(L) for p,L in byP.items()}
skilled={p for p,L in byP.items() if len(L)>=40 and hpv[p]<=0.25}
print('  skilled (40+ sections, <=0.25 hits a section):', ', '.join(f'{p} {hpv[p]:.2f}' for p in sorted(skilled,key=hpv.get)),
      '| the rest:', ', '.join(f'{p} {hpv[p]:.2f} ({len(byP[p])})' for p in sorted(set(byP)-skilled,key=lambda p:-len(byP[p]))))
bySec=collections.defaultdict(list)
for v in vv: bySec[v[1]].append(v)
for sec,L in sorted(bySec.items(),key=lambda kv:-len(kv[1])):
    players={v[0] for v in L}
    if len(players)<3: continue
    passed=sum(v[2] for v in L)
    sk=[v for v in L if v[0] in skilled]; first=[v for v in L if v[6]==1]
    others=[v for v in L if v[0] not in skilled]
    avg=lambda vs,i:sum(v[i] for v in vs)/len(vs) if vs else None
    skPass,skLives,skHurt=(sum(v[2] for v in sk)/len(sk) if sk else None),avg(sk,3),avg(sk,4)
    oPass,oLives,oHurt=(sum(v[2] for v in others)/len(others) if others else None),avg(others,3),avg(others,4)
    # did the players it hit hard the first time do better later? (learning: the player, not the game)
    learned=[p for p in players if any((v[3] or v[4]>=2) for v in L if v[0]==p and v[6]==1) and any(v[2] and not v[3] and v[4]<2 for v in L if v[0]==p and v[6]>1)]
    if passed==0: verdict='CAN IT BE DONE? nobody got through'
    elif sk and (skPass<0.5 or skLives>=0.5 or skHurt>=1.5): verdict='THE GAME: hard even for skilled players'
    elif sk and oHurt is not None and oHurt>=1 and oHurt>=2*max(skHurt,0.1): verdict='THE PLAYER: skilled players get through clean, the rest take hits'+(' (learned it later: '+', '.join(learned)+')' if learned else '')
    elif not sk and oHurt is not None and (oHurt>=1.5 or (oLives or 0)>=0.5): verdict='WATCH: hard for the learning group, no skilled player has played it yet'
    else: verdict='fine'
    fmt=lambda x,pct=False:'-' if x is None else (f'{x:.0%}' if pct else f'{x:.1f}')
    print(f'  {sec:22s} {len(players):2d} players {len(L):3d} visits | skilled: through {fmt(skPass,1)}, hits {fmt(skHurt)}, lives {fmt(skLives)}'
          f' | the rest: through {fmt(oPass,1)}, hits {fmt(oHurt)}, lives {fmt(oLives)} -> {verdict}')
# does the new HUD and Dot help? the learning group's first visits, new look against old, section by section (once 'look' lines exist)
if any(k!='?' for k in looks):
    print('### New look or old: the learning group\'s first visits (through, hits, lives, seconds)')
    fv=[(v,k) for v,k in zip(vv,looks) if v[6]==1 and v[0] not in skilled]
    for sec in sorted({v[1] for v,_ in fv}):
        row=[]
        for k in ('new','new quiet','old'):
            g=[v for v,kk in fv if v[1]==sec and kk==k]
            if g: row.append(f"{k}: {len(g)} x through {sum(v[2] for v in g)/len(g):.0%} hits {sum(v[4] for v in g)/len(g):.1f} lives {sum(v[3] for v in g)/len(g):.1f} {statistics.median(v[5] for v in g):.0f}s")
        if len(row)>1: print(f'  {sec:22s} '+' | '.join(row))
print('### Per player per minute: duck-on, kicks, jumps')
for w in mins:
    if mins[w]>2: print(f'  {w:14s} {mins[w]:6.1f} min  duck {duckOn[w]/mins[w]:5.1f}/min  kicks {kicks[w]/mins[w]:4.1f}/min  jumps {jumps[w]/mins[w]:5.1f}/min')
