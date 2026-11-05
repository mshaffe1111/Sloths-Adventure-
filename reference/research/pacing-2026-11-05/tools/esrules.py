# esrules.py file.tsv... : per world, test ENGINE-SPEC 667-674's three pass lines on stages in play order (all roles)
import sys
for f in sys.argv[1:]:
    rows=[l.rstrip('\n').split('\t') for l in open(f) if l.strip() and not l.startswith('#')]
    W={}
    for w,c,n,s,role in rows: W.setdefault(w,[]).append((c,float(s),role))
    for w,L in W.items():
        t=[x[1] for x in L]; srt=sorted(L,key=lambda x:-x[1]); rank={x[0]:i+1 for i,x in enumerate(srt)}
        pairs=list(zip(t,t[1:])); d=[abs(a-b)/min(a,b) for a,b in pairs]
        fin=[x for x in L if x[2] in('boss','finale')]
        mains=[x for x in L if x[2]=='main']
        print(f"{w:9s} n={len(L):2d} spread={max(t)-min(t):4.0f}s >=150s:{'Y' if max(t)-min(t)>=150 else 'n'} | neighbours>=20%: {sum(x>=0.2 for x in d)}/{len(d)} all:{'Y' if all(x>=0.2 for x in d) else 'n'} | median neighbour diff {sorted(d)[len(d)//2]*100:3.0f}% | finale top3:{'Y' if fin and rank[fin[0][0]]<=3 else 'n'} ({fin[0][0] if fin else '-'} rank {rank[fin[0][0]] if fin else '-'}) | last main top3:{'Y' if rank[mains[-1][0]]<=3 else 'n'} ({mains[-1][0]} rank {rank[mains[-1][0]]})")
