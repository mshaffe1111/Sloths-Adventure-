"""
decode.py: turns rows of Matt's control-test sheet (tab Sessions) into one JSON per session, for logscan.py, controlscan.py
and profile.py.

    python3 -I tools/playtesters/decode.py <out folder> <saved get_values result>...

Each input is a saved Google Sheets get_values result ({"range":..., "values":[[Arrived, Player, Session, Part, Device,
Version, Seconds, Data], ...]}). Data is 'gz64:' + gzip+base64 JSON, or 'raw:' + JSON. Parts are joined in Part order.
"""
import json,sys,base64,gzip,collections
out,files=sys.argv[1],sys.argv[2:]
rows=[]
for f in files:
    d=json.load(open(f)); rows+=d['values']; print(d.get('range'),len(d['values']))
sess=collections.defaultdict(list)
for r in rows:
    if len(r)<8 or not r[3].isdigit(): continue
    sess[(r[1].strip(),r[2])].append(r)
count=collections.Counter()
for (p,s),rs in sess.items():
    rs.sort(key=lambda r:int(r[3]))
    parts=[]
    for r in rs:
        c=r[7]
        raw=gzip.decompress(base64.b64decode(c[5:])).decode() if c.startswith('gz64:') else c[4:]
        try: parts.append(json.loads(raw))
        except Exception: pass
    json.dump({'player':p,'session':s,'arrived':rs[0][0],'device':rs[0][4],'version':rs[0][5],'parts':parts},
              open(f'{out}/{p.replace(" ","_")}_{s}.json','w'))
    count[p]+=1
print(dict(count))
