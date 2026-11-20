import json, sys
a = json.load(open(sys.argv[1])); b = json.load(open(sys.argv[2]))
by = {}
for k, parts in b.items():
    w = a.get(k)
    if w is None: continue
    diff = sorted(p for p in set(parts) | set(w) if parts.get(p) != w.get(p))
    if not diff: continue
    st, setting, v = k.split(' ')
    d = by.setdefault(st, {'normal': set(), 'easy': set(), 'parts': set()})
    d[setting].add(int(v)); d['parts'].update(diff)
stages = sorted({k.split(' ')[0] for k in b})
print(f"{len(stages) - len(by)}/{len(stages)} stages unchanged")
for st in sorted(by, key=lambda s: [int(x) if x.isdigit() else x for x in s.replace('-', ' ').split()]):
    d = by[st]
    parts = sorted(d['parts']); ptxt = 'whole layout' if len(parts) > 6 else ','.join(parts)
    print(f"  {st}: N {len(d['normal'])}/16 E {len(d['easy'])}/16  N{sorted(d['normal']) if len(d['normal'])<16 else ''}  [{ptxt}]")
