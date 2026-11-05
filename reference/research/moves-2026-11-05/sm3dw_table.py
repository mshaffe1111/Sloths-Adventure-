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
