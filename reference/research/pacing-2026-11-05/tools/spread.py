# spread.py file.tsv : rows "world<TAB>code<TAB>name<TAB>seconds<TAB>role" ; role in main/secret/temple/boss/finale
import sys,statistics as st
rows=[l.rstrip('\n').split('\t') for l in open(sys.argv[1]) if l.strip() and not l.startswith('#')]
W={}
for w,c,n,s,role in rows: W.setdefault(w,[]).append((c,n,float(s),role))
def mmss(x): return f"{int(x//60)}:{x%60:04.1f}"
print("world | n | min | median | max | max/min | spread s | longest | boss/finale rank (1=longest) | last main stage rank | neighbour diffs >=20%")
for w,L in W.items():
    t=[x[2] for x in L]; srt=sorted(L,key=lambda x:-x[2])
    rank={x[0]:i+1 for i,x in enumerate(srt)}
    fin=[x for x in L if x[3] in('boss','finale')]
    mains=[x for x in L if x[3]=='main']
    seq=[x[2] for x in L if x[3] in('main','boss','finale')]
    nd=[abs(a-b)/min(a,b) for a,b in zip(seq,seq[1:])]
    print(f"{w} | {len(L)} | {mmss(min(t))} | {mmss(st.median(t))} | {mmss(max(t))} | {max(t)/min(t):.2f} | {max(t)-min(t):.0f} | {srt[0][1]} | {', '.join(f'{x[0]}={rank[x[0]]}/{len(L)}' for x in fin)} | {mains[-1][0]}={rank[mains[-1][0]]}/{len(L)} | {sum(d>=0.2 for d in nd)}/{len(nd)}")
