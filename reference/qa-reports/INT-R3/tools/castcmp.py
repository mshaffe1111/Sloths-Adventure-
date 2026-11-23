import json, sys
a = {(r['bot'], r['setting'], r['seed']): r for r in map(json.loads, open(sys.argv[1]))}
b = {(r['bot'], r['setting'], r['seed']): r for r in map(json.loads, open(sys.argv[2]))}
print('committed rows', len(a), 'merged-head rows', len(b))
only_a = sorted(set(a) - set(b)); only_b = sorted(set(b) - set(a))
if only_a: print('only committed:', only_a[:10], len(only_a))
if only_b: print('only merged:', only_b[:10], len(only_b))
diff = 0
for k in sorted(set(a) & set(b)):
    ra, rb = a[k], b[k]
    keys = [x for x in sorted(set(ra) | set(rb)) if ra.get(x) != rb.get(x)]
    if keys:
        diff += 1
        if diff <= 15: print('DIFF', k, {x: (ra.get(x), rb.get(x)) for x in keys if x != 'stuck'}, '(stuck differs)' if 'stuck' in keys else '')
passes = lambda d: {c: sum(1 for k, r in d.items() if k[:2] == c and r['pass']) for c in sorted({k[:2] for k in d})}
print('passes committed', passes(a)); print('passes merged   ', passes(b))
print('ROWS DIFFERING', diff, 'of', len(set(a) & set(b)))
sys.exit(1 if diff or only_a or only_b else 0)
