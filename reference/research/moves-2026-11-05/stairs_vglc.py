# Count stair rises in VGLC Super Mario Bros level text (one char = one 16 px tile).
# h(c) = height of the contiguous solid 'X' stack resting on the column's floor (rows counted from the bottom).
# A stair = a maximal run of columns where each next column is exactly 1 tile higher (up) or lower (down).
# Rises = number of +1 (or -1) steps in the run. Runs with >= 2 rises are reported.
import sys,glob,os,collections
def heights(rows):
    H=len(rows); W=max(len(r) for r in rows); h=[]
    for c in range(W):
        n=0
        for r in range(H-1,-1,-1):
            ch=rows[r][c] if c<len(rows[r]) else '-'
            if ch=='X': n+=1
            else: break
        h.append(n)
    return h
allr=collections.Counter()
for f in sorted(glob.glob(sys.argv[1]+'/mario-*.txt')):
    lines=[l.rstrip('\n') for l in open(f)]
    if '---' in lines: lines=lines[lines.index('---')+1:]   # saved files carry a URL header ending in a '---' line
    rows=[r for r in lines if r and set(r)<=set('XSQ?E<>[]oBb-%|*')]
    h=heights(rows); out=[]
    for d,name in ((1,'up'),(-1,'down')):
        c=0
        while c<len(h)-1:
            if h[c]>0 and h[c+1]-h[c]==d:
                s=c
                while c<len(h)-1 and h[c+1]-h[c]==d: c+=1
                rises=c-s
                if rises>=2:
                    out.append((s,name,rises,min(h[s],h[c]),max(h[s],h[c]))); allr[rises]+=1
            else: c+=1
    out.sort()
    print(os.path.basename(f), ' '.join(f"col{s}:{n}{r}(h{a}->{b})" for s,n,r,a,b in out) or '(none)')
print('rises distribution over all stairs:',dict(sorted(allr.items())), 'n=',sum(allr.values()))
