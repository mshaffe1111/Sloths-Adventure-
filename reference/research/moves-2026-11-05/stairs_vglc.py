# Count stair rises in VGLC Super Mario Bros level text (one char = one 16 px tile).
# h(c) = height of the contiguous solid 'X' stack resting on the column's floor (rows counted from the bottom).
# A stair = a maximal run of columns where each next column is exactly 1 tile higher (up) or lower (down).
# Rises = number of +1 (or -1) steps in the run. Runs with >= 2 rises are reported.
import sys,glob,os,collections
# usage: python3 -I stairs_vglc.py sources/vglc
def heights(rows):
    H=len(rows); W=max(len(r) for r in rows); h=[]
    for c in range(W):
        n=0
        for r in range(H-1,-1,-1):
            ch=rows[r][c] if c<len(rows[r]) else '-'
            if ch=='X': n+=1
            else: break
        h.append(n)
    # VGLC draws some enemies IN a step's cell (3-1 col 181: heights 6,6,8 with an 'E' where the 7th block is). Count that E as the
    # block only when it closes exactly such a hole: same height as the left column, the right column 2 higher, E right on top.
    for c in range(1,W-1):
        top=H-1-h[c]
        if 0<=top<H and c<len(rows[top]) and rows[top][c]=='E' and h[c]==h[c-1] and h[c+1]==h[c]+2: h[c]+=1
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
                    out.append((s,name,rises,min(h[s],h[c]),max(h[s],h[c])))
            else: c+=1
    out.sort()
    # the last up-stair that starts within 40 columns of the level's end leads to the flagpole (D&T 2012 :597-599): marked FLAG
    ups=[o for o in out if o[1]=='up']
    if ups and len(h)-ups[-1][0]<=40: out=[o if o is not ups[-1] else (o[0],'FLAG-up',*o[2:]) for o in out]
    for o in out: allr[('flag' if o[1].startswith('FLAG') else 'mid',o[2])]+=1
    print(os.path.basename(f), ' '.join(f"col{s}:{n}{r}(h{a}->{b})" for s,n,r,a,b in out) or '(none)')
for k in ('mid','flag'):
    d={r:n for (t,r),n in sorted(allr.items()) if t==k}; v=sorted(r for (t,r),n in allr.items() if t==k for _ in range(n))
    print(f'{k}-level stairs: rises distribution {d}, n={len(v)}, median {v[len(v)//2] if v else None}; 2-4 rises: {sum(2<=x<=4 for x in v)} of {len(v)}')
print('Note: a step is counted only as an exact +1/-1 block change, so equal 1-block steps hold by construction; what is measured is how many there are.')
