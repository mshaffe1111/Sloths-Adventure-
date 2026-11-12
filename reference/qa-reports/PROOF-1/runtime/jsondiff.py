import json,sys
a=json.load(open(sys.argv[1])); b=json.load(open(sys.argv[2])); lim=int(sys.argv[3]) if len(sys.argv)>3 else 25
out=[]
def walk(x,y,p):
    if len(out)>lim: return
    if type(x)!=type(y): out.append(f'{p}: main {json.dumps(x)[:90]} | head {json.dumps(y)[:90]}'); return
    if isinstance(x,dict):
        for k in sorted(set(x)|set(y)):
            if k not in x: out.append(f'{p}.{k}: only on head = {json.dumps(y[k])[:90]}')
            elif k not in y: out.append(f'{p}.{k}: only on main = {json.dumps(x[k])[:90]}')
            else: walk(x[k],y[k],p+'.'+k)
    elif isinstance(x,list):
        if len(x)!=len(y): out.append(f'{p}: length main {len(x)} head {len(y)}')
        for i,(u,v) in enumerate(zip(x,y)): walk(u,v,f'{p}[{i}]')
    elif x!=y: out.append(f'{p}: main {x!r} head {y!r}')
for s in a:
    out.append(f'--- step {s} t main {a[s]["t"]} head {b[s]["t"]}')
    walk(a[s]['v'],b[s]['v'],'')
print('\n'.join(out[:lim+10]))
