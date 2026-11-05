# Super Mario 3D World (Wii U, 2013), Worlds 1-2: per-course enemy table, built from the "## Enemies" table of each saved Super Mario
# Wiki course page (sources/mario-wiki-3dw-*.txt, Super Mario 3D World section only; Captain Toad: Treasure Tracker tables ignored).
# Course order: sources/mario-wiki-3dworld-world1.txt (Levels table) and mario-wiki-3dworld-world2.txt:22-28. Captain Toad, Mystery House
# and Sprixie House courses left out (not fetched). Bosses (Bowser, Boom Boom) left out.
import re,glob,collections
files=[('1-1','mario-wiki-3dw-1-1-super-bell-hill.txt'),('1-2','mario-wiki-3dw-1-2-koopa-troopa-cave.txt'),('1-A','mario-wiki-3dw-blockades-1a-2a.txt#1'),
 ('1-3','mario-wiki-3dw-1-3-mount-beanpole.txt'),('1-4','mario-wiki-3dw-1-4-plessies-plunging-falls.txt'),('1-5','mario-wiki-3dw-1-5-switch-scramble-circus.txt'),
 ('1-C','mario-wiki-3dw-1-castle-highway-showdown.txt'),('2-1','mario-wiki-3dw-2-1-conkdor-canyon.txt'),('2-2','mario-wiki-3dw-2-2-puffprod-peaks.txt'),
 ('2-3','mario-wiki-3dw-2-3-shadow-play-alley.txt'),('2-4','mario-wiki-3dw-2-4-really-rolling-hills.txt'),('2-A','mario-wiki-3dw-blockades-1a-2a.txt#2'),
 ('2-5','mario-wiki-3dw-2-5-double-cherry-pass.txt'),('2-T','mario-wiki-3dw-2-tank-bullet-bill-brigade.txt')]
skip={'Bowser','Boom Boom','Name','---'}
def enemies(fn):
    f,_,part=fn.partition('#'); t=open('sources/'+f).read()
    if part=='1': return {'Chargin\' Chuck'}   # 1-A page text: "two Chargin' Chucks in a yellow caged room" (no Enemies table)
    if part=='2': t=t.split('Big_Galoomba_Blockade ===')[1]
    sec=t.split('## Enemies',1)[1].split('\n## ',1)[0]
    sec=sec.split('Captain Toad: Treasure Tracker')[0]
    return {m.group(1).strip() for m in re.finditer(r'^\| ([^|]+) \|',sec,re.M) if m.group(1).strip() not in skip}
order=[c for c,_ in files]; idx={c:i for i,c in enumerate(order)}; at=collections.defaultdict(list)
for c,fn in files:
    for e in enemies(fn): at[e].append(c)
print(f"| enemy | courses (of {len(order)}) | first | longest absence after first (courses) |\n|---|---|---|---|")
one=0
for e,st in sorted(at.items(),key=lambda x:(idx[x[1][0]],x[0])):
    gaps=[idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]
    if len(st)==1: one+=1
    print(f"| {e} | {', '.join(st)} | {st[0]} | {max(gaps) if gaps else '— (one course only)'} |")
print(f"\n{len(at)} enemy kinds in W1-W2; {one} appear in exactly one course; "+
      f"new kinds per course: "+', '.join(f"{c}:{sum(1 for e,st in at.items() if st[0]==c)}" for c in order))
print("reused kinds per course (seen in an earlier course): "+', '.join(f"{c}:{sum(1 for e,st in at.items() if c in st and st[0]!=c)}" for c in order))

# --- uses per course (TRIAGE #124): the wiki's per-course enemy COUNT, main enemy vs guest enemies ---
print("\nUses per course (wiki enemy counts; 'main' = the course's most numerous kind):")
def counts(fn):
    f,_,part=fn.partition('#'); t=open('sources/'+f).read()
    if part=='1': return {"Chargin' Chuck":2}
    if part=='2': t=t.split('Big_Galoomba_Blockade ===')[1]
    sec=t.split('## Enemies',1)[1].split('\n## ',1)[0].split('Captain Toad: Treasure Tracker')[0]
    out={}
    for m in re.finditer(r'^\| ([^|]+) \| ([0-9]+)',sec,re.M):
        if m.group(1).strip() not in skip: out[m.group(1).strip()]=int(m.group(2))
    return out
allc=[]
for c,fn in files:
    d=counts(fn); 
    if not d: continue
    main=max(d,key=d.get); allc+=list(d.values())
    print(f"  {c}: main {main} x{d[main]}; others: "+', '.join(f"{k} x{v}" for k,v in sorted(d.items(),key=lambda x:-x[1]) if k!=main))
b=collections.Counter('touch 1-2' if v<=2 else 'some 3-6' if v<=6 else 'lots 7+' for v in allc)
print(f"  all enemy-kind counts per course (n={len(allc)}): {dict(b)}")
# echo: does a kind return in the next 2 regular courses (blockades 1-A/2-A and the castle/tank count as courses here)?
ech=sum(1 for e,st in at.items() if any(0<idx[s]-idx[st[0]]<=2 for s in st)); 
print(f"  echo: {ech} of {len(at)} kinds appear again within the next 2 courses after their first")

# --- World 3 added (sources/mario-wiki-3dw-world3-enemy-tables.txt): do W1-W2 kinds come back one world later? ---
w3=open('sources/mario-wiki-3dw-world3-enemy-tables.txt').read()
W3=[('3-1','Snowball Park'),('3-2','Chain-Link Charge'),('3-3','Shifty Boo Mansion'),('3-4','Pretty Plaza Panic'),('3-A','Magikoopa Blockade'),
    ('3-5','Pipeline Lagoon'),('3-6','Mount Must Dash'),('3-7','Switchboard Falls'),('3-T','The Bullet Bill Express')]
for c,name in W3:
    sec=w3.split(f'=== {name} (')[1].split('\n===')[0]
    ks={m.group(1).strip() for m in re.finditer(r'^\| ([^|]+) \|',sec,re.M) if 'boss' not in m.group(0)}
    if c=='3-A': ks={'Magikoopa'}
    order.append(c); idx[c]=len(order)-1
    for e in ks: at[e].append(c)
w12={e for e,st in at.items() if st[0][0] in '12'}
back=sorted(e for e in w12 if any(s[0]=='3' for s in at[e]))
print(f"\nWith World 3 ({len(order)} courses): of {len(w12)} kinds first met in W1-W2, {len(back)} appear again in W3: {', '.join(back)}")
one=[e for e,st in at.items() if len(st)==1]
print(f"  kinds seen in exactly one course over W1-W3: {len(one)} of {len(at)}")
gaps=[]
for e,st in at.items():
    gaps+= [idx[b]-idx[a]-1 for a,b in zip(st,st[1:])]
gaps.sort(); print(f"  absences between appearances (courses), all kinds: n={len(gaps)} median {gaps[len(gaps)//2]} max {gaps[-1]}; {sum(g<=2 for g in gaps)} of {len(gaps)} are <= 2")
print("  new kinds per W3 course: "+', '.join(f"{c}:{sum(1 for e,st in at.items() if st[0]==c)}" for c,_ in W3))
