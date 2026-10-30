# fpsread.py: per-session frame-rate read for decoded control-test sessions (decode.py output): GPU line, sections, average
# and worst 5 s windows, governor steps, stalls split into the game's own draw (d>=40 ms) vs outside the game.
#   python3 -I tools/playtesters/fpsread.py <session.json>...
import json,sys,re,statistics
for f in sys.argv[1:]:
    s=json.load(open(f)); L=sorted([l for p in s['parts'] if isinstance(p,list) for l in p],key=lambda l:l[1]); ev=[l for l in L if l[0]=='e']
    print('==',s['session'],'|',s['device'][-40:],'|',s['version'],'| mins',round((L[-1][1]-L[0][1])/60000,1))
    print(' env:',[str(l[3]) for l in ev if l[2]=='env'][0][:260])
    sec=None; fps=[]; secs=[]
    for l in ev:
        if l[2]=='section': sec=str(l[3]); secs.append(sec)
        if l[2]=='fps':
            m=re.match(r'([\d.]+)fps p90 (\d+)ms max (\d+)ms (q\d) (\S+) slow (\d+)',str(l[3]))
            if m: fps.append((round(l[1]/1000),float(m.group(1)),int(m.group(2)),int(m.group(3)),m.group(4),m.group(5),int(m.group(6)),sec))
    print(' sections:',' > '.join(secs))
    print(' fps windows',len(fps),'mean',round(statistics.mean(f[1] for f in fps),1),'median',statistics.median(f[1] for f in fps),'under20',[f for f in fps if f[1]<20])
    print(' worst:',sorted(fps,key=lambda f:f[1])[:4])
    print(' quality:',[(round(l[1]/1000,1),str(l[3])) for l in ev if l[2]=='quality'])
    st=[]
    for l in ev:
        if l[2]=='stall':
            d=str(l[3]); m=re.match(r'(\d+)ms x(\d+) (q\d)(?: js u(\d+) d(\d+))?',d)
            if m: st.append((int(m.group(1)),int(m.group(2)),m.group(3),int(m.group(4) or -1),int(m.group(5) or -1)))
    own=[x for x in st if x[4]>=40]; out=[x for x in st if 0<=x[4]<40]
    print(' stalls',len(st),'| own draw-heavy',len(own),'(draw median',statistics.median([x[4] for x in own]) if own else '-', 'update max',max([x[3] for x in own]) if own else '-',') | outside game',len(out))
    print(' draw-heavy stall x:',sorted(x[1] for x in own))
    print(' outside stall x:',sorted(x[1] for x in out))
