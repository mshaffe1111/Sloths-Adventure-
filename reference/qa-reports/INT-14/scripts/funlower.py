# Lower funknown.json only: given the committed list (old) and FUNCHECK_WRITE's rewrite (new), keep each old entry at min(old, new),
# delete an entry the run no longer flags, never add or raise one (the list only shrinks). Prints every change.
import json,sys
old_p,new_p,out_p=sys.argv[1:4]
old=json.load(open(old_p)); new=json.load(open(new_p))
key=lambda e:(e['stage'],e['setting'],e['rule'])
nk={key(e):e for e in new['known']}
keep=[]
for e in old['known']:
    k=key(e)
    if k not in nk: print('delete',k,e['layouts']); continue
    n=nk[k]['layouts']
    if n<e['layouts']: print('lower',k,e['layouts'],'->',n); e=dict(e,layouts=n)
    keep.append(e)
old['known']=keep
open(out_p,'w').write(json.dumps(old,indent=1,ensure_ascii=False)+'\n')
print(len(keep),'entries kept')
