# rule 28: castBots rows, row for row (key: bot, setting, seed). python3 rowdiff.py <committed.jsonl> <new.jsonl>
import json, sys
F = ['end', 'pass', 'time', 'rescues', 'goal', 'hits', 'lives', 'turnBacks', 'stuck']
def load(p):
    return {(r['bot'], r['setting'], r['seed']): r for r in (json.loads(l) for l in open(p) if l.strip())}
a, b = load(sys.argv[1]), load(sys.argv[2])
moved = [(k, [f for f in F if a[k].get(f) != b[k].get(f)]) for k in sorted(a) if k in b]
moved = [(k, fs) for k, fs in moved if fs]
print(f'rows: committed {len(a)}, new {len(b)}, compared {sum(1 for k in a if k in b)}, missing {sorted(set(a) ^ set(b))[:6]}')
print(f'moved: {len(moved)}')
for k, fs in moved:
    print(' ', k, '; '.join(f"{f}: {json.dumps(a[k].get(f))[:90]} -> {json.dumps(b[k].get(f))[:90]}" for f in fs))
