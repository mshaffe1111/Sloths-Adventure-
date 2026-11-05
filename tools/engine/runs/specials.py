# RUNS "Specials" (the lead for Matt, 12:33 PM ET): one row per hand-built or special stage and per lair, from today's measures:
#   builder (builders.ts), support (support.py: float share and floating stones, out/support-all.txt), water kinds (the stage's water
#   fields: rivers, falls/tides, pit water; calm pools from ladder-uses' swim count; W3's two-waters rule), length (the quick clock vs
#   the 2:00 floor, clock.ts), the ladder (what first shows here: teaches; what it brings back from the two stages before: echoes),
#   look-alike (era.ts lookalikeWith against its world neighbours, distinct layouts), crumble timing (fragile pieces by who sets their
#   hold: the builder's own crumbleAfter or creak, or the engine's default, engine.ts:2484).
#   python3 -I tools/engine/runs/specials.py <builders.tsv> <support-all.txt> <ladder-uses.json> <era json>... --clock <txt>... --dumps <json>...
import json, sys, re, collections
a = sys.argv[1:]
bt, sup, lu = a[0], a[1], a[2]
eras = a[3:a.index('--clock')]; clocks = a[a.index('--clock') + 1:a.index('--dumps')]; dumps = a[a.index('--dumps') + 1:]
B = [l.rstrip('\n').split('\t') for l in open(bt) if l.strip()]
order = [r[0] for r in B]
sp = {}
for l in open(sup):
    m = re.match(r'mix (\S+) (normal|easy): float ([\d.]+) \(([\d.]+)-([\d.]+)\).*no-float floating (\d+) \(max (\d+)\)', l)
    if m: sp[(m[1], m[2])] = (float(m[3]), int(m[6]), int(m[7]))
L = json.load(open(lu))
look, distinct = {}, {}
for f in eras:
    for s in json.load(open(f))['stages']: look[s['id']] = s['lookalikeWith']; distinct[s['id']] = s['distinct']['layouts']
clk = {}
for f in clocks:
    st = None
    for l in open(f):
        if l.startswith('== '): st = l.split()[1].rstrip(':')
        m = re.match(r'\s+(\S+)\s+(\d+) \((\d+)-(\d+)\)', l)
        if m and st == 'normal': clk[m[1]] = (int(m[2]), int(m[3]), int(m[4]))
cr = collections.defaultdict(lambda: collections.Counter())
for f in dumps:
    for r in json.load(open(f)):
        if r.get('setting') != 'normal' or 'error' in r: continue
        for p in r['platforms']:
            if p['type'] != 'fragile': continue
            c = cr[r['id']]
            c['own crumbleAfter' if p['crumble'] is not None else 'own creak' if p['creak'] is not None else 'engine default 1.1 s'] += 1
nonlair = [i for i in order if i in L and not L[i]['lair']]
def first_here(i):
    out = []
    for m, v in L[i]['counts'].items():
        if m in ('gap', 'water', 'waterzone') or max(v) == 0: continue
        prev = [j for j in order[:order.index(i)] if j in L and max(L[j]['counts'].get(m, [0])) > 0]
        if not prev: out.append(m)
    return out
def echoes(i):
    if i not in nonlair: return []
    k = nonlair.index(i); before = nonlair[max(0, k - 2):k]; out = []
    for j in before:
        for m in first_here(j):
            if max(L[i]['counts'].get(m, [0])) > 0: out.append(f'{m} ({j})')
    return out
SPECIAL = lambda r: r[4].startswith('hand') or 'boss lair' in r[4] or r[0] in ('4-D', '5-M') or 'w5Arena' in r[4]
wcap = {}
for l in open(sup):
    m = re.match(r'\s+mix W(\d+) normal: float ([\d.]+) -> cap (\d+)%', l)
    if m: wcap[m[1]] = int(m[3])
rows = []
for r in B:
    if not SPECIAL(r): continue
    i = r[0]; w = i.split('-')[0]
    s = sp.get((i, 'normal')); se = sp.get((i, 'easy'))
    c = clk.get(i)
    lk = look.get(i, {}); nb = []
    if i in order:
        k = order.index(i)
        for j in (order[k - 1] if k else None, order[k + 1] if k + 1 < len(order) else None):
            if j and j.split('-')[0] == w and j in lk: nb.append(f'{j} {lk[j]}/16')
    rows.append(dict(id=i, name=r[3], kind=r[2], builder=r[4],
        float=f"{s[0]:.0%} N / {se[0]:.0%} E" if s and se else '-', stones=f"{s[1]} (max {s[2]})" if s else '-',
        clock=(f"{c[0]} s ({c[1]}-{c[2]})" + (' UNTIMED' if c[0] < 60 else ' under 2:00' if c[0] < 120 else '')) if c else '-',
        rivers=max(L[i]['counts'].get('water', [0])) if i in L else 0, swim=max(L[i]['counts'].get('swim', [0])) if i in L else 0,
        teaches=', '.join(first_here(i)) if i in L else '-', echoes=', '.join(echoes(i)) or '-',
        look=', '.join(nb) or ('none with a neighbour' if lk is not None else '-'), layouts=distinct.get(i, '-'),
        crumble=', '.join(f'{k} {v // 16}' for k, v in cr[i].items()) or 'none'))
json.dump(rows, open('specials.json', 'w'), indent=1)
for x in rows: print(json.dumps(x))
