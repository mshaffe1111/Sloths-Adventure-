import subprocess,sys,re
rev=sys.argv[1]
C=[l.split('|',3) for l in open(sys.argv[2]).read().strip().split('\n') if l.strip() and not l.startswith('#')]
cache={}
def lines(f):
    if f not in cache:
        r=subprocess.run(['git','show',f'{rev}:{f}'],capture_output=True,text=True)
        cache[f]=r.stdout.split('\n') if r.returncode==0 else None
    return cache[f]
bad=0
for f,a,b,sym in C:
    L=lines(f); a=int(a); b=int(b)
    if L is None: print('MISSING FILE',f); bad+=1; continue
    seg='\n'.join(L[max(0,a-3):b+2])
    if not re.search(sym,seg):
        hits=[i+1 for i,x in enumerate(L) if re.search(sym,x)][:6]
        print(f'MISS {f}:{a}-{b} /{sym}/ real lines {hits} | cited text: {L[a-1].strip()[:90] if a<=len(L) else "EOF"}'); bad+=1
print('checked',len(C),'miss',bad)
