"""ART 11-13: rebuild a file sent back from the HF sandbox. Each `hf_sandbox_fs cat <file>.pN --max-bytes 100000` result is too big to
show, so the harness saves it under /tmp/output-trim/; this finds those saves by the path they name and joins the parts in order.

    python3 -I tools/art/hf1113/pull.py <sandbox file> <local out>
"""
import base64, glob, json, os, re, sys
src, out = sys.argv[1], sys.argv[2]
got = {}
for f in sorted(glob.glob('/tmp/output-trim/*.txt'), key=os.path.getmtime):
    t = open(f).read()
    i = t.find('{"op":"cat"')
    if i < 0:
        continue
    try:
        j = json.loads(t[i:t.rindex('}') + 1])
    except Exception:
        continue
    m = re.fullmatch(re.escape(src) + r'\.p(\d+)', j.get('path', ''))
    if m:
        got[int(m.group(1))] = j['content']
if not got:
    raise SystemExit('no parts found for ' + src)
n = max(got) + 1
miss = [k for k in range(n) if k not in got]
if miss:
    raise SystemExit(f'missing parts {miss}')
data = base64.b64decode(''.join(''.join(got[k].split()) for k in range(n)))
open(out, 'wb').write(data)
print(out, len(data), n, 'parts')
