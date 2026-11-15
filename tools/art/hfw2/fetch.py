"""ART-W2: rebuild a file from the hf_sandbox_fs `cat <f>.pN` results the session saved under tool-results/ (each a JSON {path, content}).

    python3 -I tools/art/hfw2/fetch.py <tool-results dir> <sandbox file> <out>

Finds every saved result whose path is <sandbox file>.pN, joins N in order, base64-decodes. Fails loudly on a missing or truncated part.
"""
import base64, glob, json, re, sys

d, want, out = sys.argv[1:4]
parts = {}
for f in glob.glob(d + '/mcp-*hf_sandbox_fs-*.txt'):
    try:
        j = json.load(open(f))
    except Exception:
        continue
    m = re.fullmatch(re.escape(want) + r'\.p(\d+)', j.get('path', ''))
    if m:
        assert not j.get('truncated'), f
        parts[int(m.group(1))] = j['content']
n = max(parts) + 1
missing = [i for i in range(n) if i not in parts]
assert not missing, f'missing parts {missing}'
data = base64.b64decode(''.join(parts[i].strip() for i in range(n)))
open(out, 'wb').write(data)
print(out, len(data), 'from', n, 'parts')
