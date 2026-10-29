"""Decode the Sloths control tests sheet for touchReplay.ts.

  python3 -I tools/qa/touchReplayDecode.py out.json sheet-part-1.json [sheet-part-2.json ...]

Each input is a Sheets values export of Sessions!A:H ({"values": [[arrived, who, session, part, device, build, secs, data], ...]}), as
the Sheets connector's get_values saves it. Rows whose data is gz64 (gzip + base64) or raw are decoded into their log lines
(playRecorder.ts). The output holds testers' touches: keep it out of git.
"""
import base64, gzip, json, sys

out = []
for f in sys.argv[2:]:
    for r in json.load(open(f))['values']:
        if len(r) < 8 or r[0] == 'Arrived':
            continue
        data = r[7]
        try:
            if data.startswith('gz64:'):
                txt = gzip.decompress(base64.b64decode(data[5:])).decode()
            elif data.startswith('raw:'):
                txt = data[4:]
            else:
                continue
            lines = json.loads(txt)
        except Exception:
            continue
        # arrived: "10/23/2026 17:17:03" (the sheet's local time) as 2026-10-23
        m, d, y = r[0].split(' ')[0].split('/')
        out.append(dict(arrived=f'{y}-{int(m):02d}-{int(d):02d}', who=r[1], session=r[2], part=int(r[3] or 0), device=r[4], build=r[5], lines=lines))
json.dump(out, open(sys.argv[1], 'w'))
print(len(out), 'rows decoded')
