import json,sys
def load(p):
    d={}
    for l in open(p):
        r=json.loads(l); d[(r['bot'],r['setting'],r['seed'])]=r
    return d
a,b=load(sys.argv[1]),load(sys.argv[2])
moved=[(k,a[k]['pass'],b[k]['pass'],a[k]['lives'],b[k]['lives'],a[k]['time'],b[k]['time']) for k in sorted(a) if k in b and (a[k]['pass']!=b[k]['pass'] or a[k]['lives']!=b[k]['lives'] or abs(a[k]['time']-b[k]['time'])>0.05)]
print('rows',len(a),len(b),'moved',len(moved))
for m in moved: print(' ',*m)
