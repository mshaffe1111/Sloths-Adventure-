import re,sys
eng={}; hdr=None
for ln in open(sys.argv[1]):
    m=re.match(r'### eng-([\d.]+)-s(\d)',ln)
    if m: lock,seed=m.groups(); continue
    m=re.match(r'(normal|easy): ',ln)
    if m: d=m.group(1); continue
    m=re.match(r'\s+liana x(\d+) grip ([\d.]+): ONE lands (\w+); early \d+ f = ([\d.]+) s, late \d+ f = ([\d.]+)',ln)
    if m:
        x,g,one,e,l=m.groups(); eng[(f'{float(lock):.2f}',d,seed,x,g)]=(one=='true',float(e),float(l))
bad=0; rows=0
for ln in open(sys.argv[2]):
    p=ln.split()
    if not p or p[0]!='M': continue
    lock,d,seed,x,g=f'{float(p[1]):.2f}',p[2],p[3][1:],p[4][1:],p[5][1:]
    one=p[6]=='one=true'; e,l=float(p[7]),float(p[8])
    k=(lock,d,seed,x,g)
    if k not in eng: print('NO ENGINE ROW',k); bad+=1; continue
    E=eng[k]; rows+=1
    bar=0.2 if d=='normal' else 0.3
    mp= one and min(e,l)>=bar-1e-9; ep=E[0] and min(E[1],E[2])>=bar-1e-9
    loose = (one and not E[0]) or e>E[1]+1e-9 or l>E[2]+1e-9
    flag = 'VERDICT-LOOSER' if mp and not ep else ('looser-num' if loose else '')
    if mp and not ep: bad+=1
    print(f'{lock} {d:6} s{seed} x{x:5} g{g:4} eng {"ONE" if E[0] else "MISS"} {E[1]:.2f}/{E[2]:.2f} {"P" if ep else "R"} | model {"ONE" if one else "MISS"} {e:.2f}/{l:.2f} {"P" if mp else "R"} {flag}')
print('rows',rows,'verdict-looser',bad)
