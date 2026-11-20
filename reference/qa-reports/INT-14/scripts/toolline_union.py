# gates.yml tool-test line conflict: ours, plus every test file only theirs names (appended in their order)
import re,sys
p=sys.argv[1]; s=open(p).read()
pat=re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n',re.S)
def fix(m):
    a,b=m.group(1),m.group(2)
    assert a.count('\n')==1 and b.count('\n')==1, 'not a one-line conflict'
    at=a.split(); extra=[x for x in b.split() if x not in at]
    print('appended:',extra)
    return a.rstrip('\n').rstrip()+(' '+' '.join(extra) if extra else '')+'\n'
s,n=pat.subn(fix,s); assert n==1,n; open(p,'w').write(s)
