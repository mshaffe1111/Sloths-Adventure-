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
KNOWN={'section','hurt','lostLife','quit','stall','fps','mem','checkpoint','sheet','stomp','finish','mix','survey','start','rules','playAgain','difficulty','stuckHelp'}
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
print('### Per player per minute: duck-on, kicks, jumps')
for w in mins:
    if mins[w]>2: print(f'  {w:14s} {mins[w]:6.1f} min  duck {duckOn[w]/mins[w]:5.1f}/min  kicks {kicks[w]/mins[w]:4.1f}/min  jumps {jumps[w]/mins[w]:5.1f}/min')
