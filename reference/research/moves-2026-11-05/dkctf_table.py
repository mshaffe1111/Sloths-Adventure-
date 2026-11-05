# DKC Tropical Freeze (Wii U 2014): enemy presence per level from sources/dkc-dkctf-enemy-levels.txt (Super Mario Wiki level tables
# for worlds 1-7 and 11 enemies' level lists). Same three rules as returncheck.py. Names not found in the level tables are reported.
import re,collections
t=open('sources/dkc-dkctf-enemy-levels.txt').read()
order=[];code={}
for blk in re.findall(r'=== World \d level table ===[^\n]*\n(.*?)(?=\n===)',t,re.S):
    for m in re.finditer(r'^\| (\d-[A-Z0-9]+) \| ([^|]+) \|',blk,re.M):
        c,n=m.group(1),m.group(2).strip(); order.append(c); code[n.lower()]=c
idx={c:i for i,c in enumerate(order)}
at={}; unknown=collections.Counter()
for m in re.finditer(r'^=== ([^(\n]+) \(http[^\n]*===\n([^\n]*)',t,re.M):
    e=m.group(1).strip(); st=set()
    for n in m.group(2).split(';'):
        n=re.sub(r'\s*\(.*?\)\s*$','',n.strip()).strip().lower()
        if not n: continue
        if n in code: st.add(code[n])
        else: unknown[n]+=1
    if st: at[e]=sorted(st,key=idx.get)
W=lambda c:int(c[0])
print(f"DKCTF: {len(order)} levels (W1-W7 incl. A/B/K and bosses); {len(at)} enemies; names not in the level tables (3D/Switch-only or spelling): {dict(unknown)}\n")
print("| enemy | first | levels | share of later | longest absence | later worlds | 3-level windows with none | staple env. | signature env. |\n|---|---|---|---|---|---|---|---|---|")
for e,st in sorted(at.items(),key=lambda x:-len(x[1])):
    f=idx[st[0]]; later=len(order)-1-f; sh=(len(st)-1)/later
    gaps=[idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]+[len(order)-1-idx[st[-1]]]; mg=max(gaps)
    lw=list(range(W(st[0])+1,8)); cov=sum(w in {W(c) for c in st} for w in lw)
    em=sum(1 for i in range(f+1,len(order)-2) if not any(idx[c] in (i,i+1,i+2) for c in st))
    core=sh>=0.30 and cov==len(lw) and mg<=8; sig=mg<=25 and (cov/len(lw) if lw else 1)>=3/7
    print(f"| {e} | {st[0]} | {len(st)} | {100*sh:.0f}% | {mg} | {cov}/{len(lw)} | {em}/{len(order)-2-(f+1)} | {'pass' if core else 'FAIL'} | {'pass' if sig else 'FAIL'} |")
