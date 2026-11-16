"""ART-678: rebuild files sent back from the HF sandbox by `hf_sandbox_fs cat <file>.pN --max-bytes 100000` (parts from
tools/art/hf1113/sbx.py parts). As hf1113/pull.py, but it searches every saved tool result (a helper agent's saves too, recursively)
and takes many files at once.

    python3 -I tools/art/hf678/pull.py <local out dir> <sandbox file>...
"""
import base64, glob, json, os, re, sys
od, srcs = sys.argv[1], sys.argv[2:]
SAVES = glob.glob('/tmp/output-trim/*.txt') + glob.glob(os.path.expanduser('~/.claude/projects/**/*.txt'), recursive=True) \
    + glob.glob('/tmp/claude-0/**/*.txt', recursive=True) + glob.glob(os.path.expanduser('~/.claude/projects/**/*.json'), recursive=True)
parts = {}
for f in sorted(SAVES, key=os.path.getmtime):
    try:
        t = open(f, errors='replace').read()
    except Exception:
        continue
    for m in re.finditer(r'\{"op": ?"cat"', t):
        try:
            j, _ = json.JSONDecoder().raw_decode(t[m.start():])
        except Exception:
            continue
        pm = re.fullmatch(r'(.*)\.p(\d+)', j.get('path', ''))
        if pm:
            parts.setdefault(pm.group(1), {})[int(pm.group(2))] = j['content']
os.makedirs(od, exist_ok=True)
bad = 0
for src in srcs:
    got = parts.get(src, {})
    n = max(got) + 1 if got else 0
    miss = [k for k in range(n) if k not in got]
    if not got or miss:
        print('MISSING', src, miss or 'all'); bad += 1; continue
    data = base64.b64decode(''.join(''.join(got[k].split()) for k in range(n)))
    open(os.path.join(od, os.path.basename(src)), 'wb').write(data)
    print('ok', src, len(data), n, 'parts')
sys.exit(1 if bad else 0)
