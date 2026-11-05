# Super Mario 3D World, whole game W1-W8 (Wii U): enemy-kind presence per course, built from the saved Super Mario Wiki enemy tables:
#   W1-W2: sources/mario-wiki-3dw-*.txt via sm3dw_table.py's parser; W3: sources/mario-wiki-3dw-world3-enemy-tables.txt;
#   W4-W8: sources/mario-wiki-3dw-world4-8-enemy-tables.txt. Bosses ("(boss)" / "Boss") are left out. Courses with no enemies table
#   take the kind their level-table line names (blockades, Fire Bros. Hideouts); Coin Express has none (no enemies counted).
# Captain Toad, Mystery House, Sprixie/Toad houses are not in the course list. Then each kind is checked with the same three rules
# as returncheck.py (ES 1-in-3 window; DKCR staple envelope; DKCR signature envelope).
import re,collections,io,contextlib,sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
with contextlib.redirect_stdout(io.StringIO()):
    import sm3dw_table as t          # W1-W3 parse (prints suppressed)
order=list(t.order); at=collections.defaultdict(list,{k:list(v) for k,v in t.at.items()})
txt=open('sources/mario-wiki-3dw-world4-8-enemy-tables.txt').read()
NOTAB={'4-A':'Brolder','5-A':"Chargin' Chuck",'6-A':'Prince Bully','7-A':'Brolder','7-B':'Prince Bully',
       '4-B':'Fire Bro','5-B':'Fire Bro','6-B':['Fire Bro','Hammer Bro','Boomerang Bro'],'7-C':'Fire Bro','5-T':None,'6-C':None,'8-A':None}
for m in re.finditer(r'^=== ([^\n]+?) \(([0-9]-[A-Za-z0-9]+)[^)\n]*\)(?: enemies)? ===\n(.*?)(?=^===|\Z)',txt,re.M|re.S):
    name,code,body=m.groups()
    if 'level table' in name: continue
    order.append(code)
    if '(no enemies table' in body:
        k=NOTAB.get(code)   # 6-B's level-table line: "one Fire Bro along with two Hammer Bros. and two Boomerang Bros." (:127)
        for kk in ([k] if isinstance(k,str) else (k or [])): at[kk].append(code)
        continue
    ks={r.group(1).strip() for r in re.finditer(r'^\| ([^|]+) \| ([^|]*)',body,re.M) if 'boss' not in r.group(2).lower() and r.group(1).strip()!='Name'}
    for k in ks: at[k].append(code)
idx={c:i for i,c in enumerate(order)}
for k in at: at[k]=sorted(set(at[k]),key=idx.get)
W=lambda c:int(c[0])
print(f"Super Mario 3D World: {len(order)} courses W1-W8 (no Captain Toad / houses); {len(at)} enemy kinds")
one=sum(1 for v in at.values() if len(v)==1); print(f"kinds in exactly one course: {one} of {len(at)}")
rows=[]
for k,st in at.items():
    f=idx[st[0]]; later=len(order)-1-f
    if later<6: continue
    share=(len(st)-1)/later; gaps=[idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]+[len(order)-1-idx[st[-1]]]; mg=max(gaps)
    lw=list(range(W(st[0])+1,9)); cov=sum(w in {W(c) for c in st} for w in lw)
    empty=sum(1 for i in range(f+1,len(order)-2) if not any(idx[c] in (i,i+1,i+2) for c in st))
    rows.append((k,st[0],len(st),share,mg,cov,len(lw),empty,len(order)-2-(f+1)))
rows.sort(key=lambda r:-r[2])
print("\n| enemy kind | first | courses | share of later | longest absence | later worlds | 3-course windows with none | ES window | staple | signature |\n|---|---|---|---|---|---|---|---|---|---|")
tot=collections.Counter()
for k,f,n,sh,mg,cov,nl,em,nw in rows:
    es=em==0; core=sh>=0.30 and cov==nl and mg<=8; sig=mg<=25 and (cov/nl if nl else 1)>=3/7
    tot['n']+=1; tot['es']+=es; tot['core']+=core; tot['sig']+=sig
    if n>=4: print(f"| {k} | {f} | {n} | {100*sh:.0f}% | {mg} | {cov}/{nl} | {em}/{nw} | {'pass' if es else 'FAIL'} | {'pass' if core else 'FAIL'} | {'pass' if sig else 'FAIL'} |")
print(f"\n(rows shown: kinds in 4+ courses.) All {tot['n']} kinds with 6+ later courses: ES window passes {tot['es']}, staple envelope {tot['core']}, signature envelope {tot['sig']}")
sh=sorted(r[3] for r in rows); print(f"share of later courses over those kinds: median {100*sh[len(sh)//2]:.0f}%, max {100*sh[-1]:.0f}%; kinds at >= 33%: {sum(s>=1/3 for s in sh)}")
