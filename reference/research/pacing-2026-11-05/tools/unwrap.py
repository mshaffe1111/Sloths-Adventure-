# unwrap a TinyFish result file -> text of each result (markdown escapes in JSON undone)
import json,sys,re
d=json.load(open(sys.argv[1]))
for r in d['results']:
    t=r['text']
    if len(sys.argv)>2:
        t=t.replace('\\_','_')
        open(sys.argv[2],'w').write(t)
    else:
        print(r['url']); print(t[:500])
for e in d.get('errors',[]): print('ERR',e)
