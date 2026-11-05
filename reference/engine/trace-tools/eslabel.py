import re,sys
sys.path.insert(0,'')
spec=open('/home/user/Sloths-Adventure-/reference/engine/ENGINE-SPEC.md').read().split('\n')
t=open('/home/user/Sloths-Adventure-/reference/engine/SPEC-TRACE.md').read().split('\n')
end=next(i for i,l in enumerate(t) if l.startswith('## (a) Research rows'))
STOP=set('the and that with from this only every their there which about after before never under over into each more less than none they for not'.split())
miss=0;tot=0
for ln,row in enumerate(t[:end],1):
    if not row.startswith('| ') or row.startswith('|---'): continue
    c=[x.strip() for x in row.split('|')[1:-1]]
    if len(c)<6 or c[2] in ('Tag',): continue
    m=re.fullmatch(r'(\d+)(?:-(\d+))?',c[0])
    if not m: continue
    a=int(m.group(1)); b=int(m.group(2) or a); tot+=1
    blob=' '.join(spec[a-1:b]).lower()
    r=c[1].lower()
    nums=set(re.findall(r'\d+(?:[.,]\d+)+|\d{2,}',r)); words={w for w in re.findall(r"[a-z][a-z'-]{4,}",r) if w not in STOP}
    hn=[n for n in nums if n in blob]; hw=[w for w in words if w in blob]
    ok = (hn and (len(hw)>=1 or not words)) or len(hw)>=2 or (len(hw)==1 and len(words)<=2)
    if not ok:
        miss+=1
        # find best nearby line
        best=None
        for d in range(-6,7):
            for span in (0,1,2,3):
                lo=a+d; hi=lo+span
                if lo<1: continue
                bl=' '.join(spec[lo-1:hi]).lower()
                sc=sum(n in bl for n in nums)*2+sum(w in bl for w in words)
                if best is None or sc>best[0] or (sc==best[0] and abs(d)<abs(best[1])): best=(sc,d,lo,hi)
        print(f'trace:{ln} ES {c[0]} | {c[1][:70]} | hits n={hn} w={hw[:3]} | best {best[2]}-{best[3]} score {best[0]}')
print('labels',tot,'miss',miss)
