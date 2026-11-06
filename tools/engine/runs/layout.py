# RUNS: the layout rows (TRIAGE #1 #37 #49 #52 #53 #79 #87 #101 #108-#111 #114 #162) and the view rows (#28 #29 #30 #81 #85 #96 #97) on the
# dumps (dump.ts, 16 layouts x 2 settings). Splits and the two-road share are CP3's own (cp3/split180.py, cp3/zones.py: two standable
# tops >= DIST px apart within 90 px of each x, for over 300 px), with DIST a parameter for #1. Landings and kinds are CP1's (measure2.py).
# Views use the world-px views the real camera shows at clipcheck's sizes inside the insets (out/views.txt: 440 x 900 upright, 1073 x 512
# sideways), slid half a view at a time along the stage.
#   python3 -I tools/engine/runs/layout.py <cp1 dir> <dump.json>...
import json, sys, collections, statistics as st
sys.path.insert(0, sys.argv[1]); import measure2 as M
rows = []
for f in sys.argv[2:]: rows += [r for r in json.load(open(f)) if 'error' not in r and r['id'] in ('1-1', '1-2', '1-3', '1-5')]
by = collections.defaultdict(list)
for r in rows: by[(r['tag'], r['id'], r['setting'])].append(r)
def zones(r, dist=120):
    L = [q for q in M.landings(r) if q[3] not in ('climb', 'liana')]
    x0, x1 = min(q[0] for q in L), max(q[1] for q in L); out = []; run = 0; x = x0
    while x < x1:
        ys = sorted({q[2] for q in L if q[0] - 90 <= x <= q[1] + 90})
        if len(ys) >= 2 and ys[-1] - ys[0] >= dist: run += 20
        else:
            if run > 300: out.append((x - run, x))
            run = 0
        x += 20
    if run > 300: out.append((x - run, x))
    return out
def md(v): v = sorted(v); return v[len(v) // 2]
def rg(v): v = sorted(v); return f'{md(v)} ({v[0]}-{v[-1]})' if v[0] != v[-1] else f'{v[0]}'
def nodes(r):
    out = collections.OrderedDict()
    for e in r['mix'] or []:
        if e['node'] < 1: continue
        k = e.get('nid'); a, b = out.get(k, (1e9, -1e9, e['job']))[:2]; out[k] = (min(a, e['x0']), max(b, e['x1']), e['job'])
    return out
GROUND = {'ground', 'log', 'stone', 'mushroom', 'drifting log'}; TREE = {'branch', 'catch branch', 'creaking limb', 'snap twig', 'bridge'}; WATER = {'lily pad'}
HAZ = {'creaking limb', 'snap twig'}
print('== splits and two-road share (CP3 rule), and the split distance (#1)')
for k in sorted(by):
    v = by[k]; W = lambda r: max(p['x'] + p['w'] for p in r['platforms'])
    s = {d: [len(zones(r, d)) for r in v] for d in (80, 120, 160, 200)}
    two = [round(sum(b - a for a, b in zones(r)) / W(r), 3) for r in v]
    line = f"{' '.join(k)}: splits at 80/120/160/200 px: {rg(s[80])} / {rg(s[120])} / {rg(s[160])} / {rg(s[200])}; two-road share (120 px) {rg(two)}"
    if k[1] == '1-1' and v[0]['mix']:
        n811 = []
        for r in v:
            nd = nodes(r); a = min(nd[x][0] for x in nd if x in ('8', '9', '10', '11')); b = max(nd[x][1] for x in nd if x in ('8', '9', '10', '11'))
            n811.append(sum(1 for z0, z1 in zones(r) if a <= (z0 + z1) / 2 <= b))
        line += f"; splits inside n8-n11 {rg(n811)}"
    print(line)
print('\n== forks (#37 #52 #53): per fork node, the gap between its two roads\' height bands (px), share of the stage, crossings')
for k in sorted(by):
    v = by[k]
    if not v[0]['mix']: continue
    sep, share, cross = collections.defaultdict(list), collections.defaultdict(list), collections.defaultdict(list)
    for r in v:
        W = max(p['x'] + p['w'] for p in r['platforms'])
        hi = [e for e in r['mix'] if e.get('road') == 'high']
        L = [q for q in M.landings(r) if q[3] not in ('climb', 'liana')]
        for e in hi:
            lo = next((q for q in r['mix'] if q.get('road') == 'low' and q.get('nid') == e.get('nid')), None)
            a, b = min(e['x0'], lo['x0'] if lo else e['x0']), max(e['x1'], lo['x1'] if lo else e['x1'])
            # the two roads' height bands: the tops of every landing in the fork's span, crossing, step-down and catch pieces left out
            # (they join or catch the roads by design), sorted; the widest gap between neighbouring tops is the space between the bands
            ys = sorted({p['y'] for p in r['platforms'] if not p['soil'] and not p['deco'] and not p['catchL'] and a <= p['x'] + p['w'] / 2 <= b
                         and not ({'crossing', 'stepDown', 'perch'} & set((p['keys'] or '').split('|')))})
            best = max((ys[i + 1] - ys[i] for i in range(len(ys) - 1)), default=None)
            best = best if best is not None else 1e9
            key = f"n{e.get('nid')} {e['job']}"
            sep[key].append(best if best < 1e9 else None); share[key].append(round((b - a) / W, 3))
            cross[key].append(sum(1 for p in r['platforms'] if 'crossing' in (p['keys'] or '').split('|') and a <= p['x'] <= b))
    for key in sep:
        s2 = [x for x in sep[key] if x is not None]
        print(f"  {' '.join(k)} {key}: gap between the roads' height bands {rg(s2) if s2 else '-'} px; length share {rg(share[key])}; crossing pieces {rg(cross[key])}")
print('\n== elements per node range (#114), 1-1: ground / tree / water share of landings')
for k in sorted(by):
    if k[1] != '1-1' or not by[k][0]['mix']: continue
    g17, t811, w = [], [], []
    for r in by[k]:
        nd = nodes(r); L = M.landings(r)
        def share(ids, S):
            a = min(nd[x][0] for x in ids); b = max(nd[x][1] for x in ids)
            ks = [q[3] for q in L if a <= (q[0] + q[1]) / 2 <= b and q[3] not in ('climb', 'liana', 'rope')]
            return round(sum(1 for x in ks if x in S) / max(1, len(ks)), 3)
        g17.append(share([str(i) for i in range(1, 8)], GROUND)); t811.append(share([str(i) for i in range(8, 12)], TREE))
        w.append(sum(1 for q in L if q[3] in WATER))
    print(f"  {' '.join(k)}: ground in n1-n7 {rg(g17)}; tree in n8-n11 {rg(t811)}; water pieces {rg(w)}")
print('\n== ground ends by drop (#79): bank and ground-log ends (h >= 60) and the drop under each end')
for k in sorted(by):
    c = collections.Counter()
    for r in by[k]:
        ps = [p for p in r['platforms'] if not p['soil'] and not p['deco']]
        for p in ps:
            if p['h'] < 60 or p['type'] != 'solid': continue
            for ex in (p['x'] - 2, p['x'] + p['w'] + 2):
                under = [q['y'] for q in ps if q is not p and q['x'] <= ex <= q['x'] + q['w'] and q['y'] >= p['y'] - 4]
                d = (min(under) - p['y']) if under else (r['H'] - p['y'])
                c['ends'] += 1; c['drop>120'] += d > 120
    print(f"  {' '.join(k)}: per build {c['ends'] / len(by[k]):.1f} ends, {c['drop>120'] / len(by[k]):.1f} over a drop of more than 120 px")
VIEWS = {'upright': (440, 900), 'sideways': (1073, 512)}
print('\n== per phone view (#28 #29 #30 #81 #97), max over the stage per build, then median (min-max) over builds')
for k in sorted(by):
    res = collections.defaultdict(list)
    for r in by[k]:
        L = M.landings(r); x0, x1 = min(q[0] for q in L), max(q[1] for q in L)
        picks = [c for c in r['collect'] if c['t'] not in ('exit_totem', 'heart', 'super_heart')]
        trunks = r.get('trunks') or []; trees = r.get('trees') or []
        for name, (vw, vh) in VIEWS.items():
            mp = mh = mk = mt = 0; upper = []; x = x0
            while x < x1:
                inv = [q for q in L if q[1] >= x and q[0] <= x + vw]
                if inv:
                    play = max(q[2] for q in inv)  # the lowest top in view: the play line
                    ink = {q[3] for q in inv if q[3] not in ('climb', 'liana', 'rope') and play - vh * 0.75 <= q[2] <= play + vh * 0.25}
                    mk = max(mk, len(ink))
                    hz = {q[3] for q in inv if q[3] in HAZ} | {e['t'] for e in r['enemies'] if x <= e['x'] <= x + vw}
                    mh = max(mh, len(hz))
                    mp = max(mp, sum(1 for c in picks if x <= c['x'] < x + vw))
                    mt = max(mt, sum(1 for t in trunks if x <= t['x'] <= x + vw and t.get('w', 1) >= 1) + sum(1 for t in trees if x <= t['x'] <= x + vw))
                    if name == 'upright':
                        top = play - vh / 2
                        upper.append(any(play - 30 > q[2] >= top for q in inv) or any(x <= c['x'] <= x + vw and play - 30 > c['y'] >= top for c in r['collect'])
                                     or any(x <= v['x'] <= x + vw and v['top'] < play - 30 for v in r['vines']) or any(x <= t['x'] <= x + vw and t['topY'] < play - 30 for t in trunks + trees))
                x += vw / 2
            res[f'{name} pickups'].append(mp); res[f'{name} hazard/animal kinds'].append(mh); res[f'{name} standing kinds'].append(mk); res[f'{name} full trunks'].append(mt)
            if name == 'upright': res['upright views with play in the upper half'].append(round(sum(upper) / max(1, len(upper)), 3))
    print(f"  {' '.join(k)}: " + '; '.join(f'{a} {rg(b)}' for a, b in res.items()))
print('\n== boughs and trunks (#85 #96), the mixer\'s stages (old stages carry no trunks in their data): boughs per trunk, boughs within 220 px on different trunks')
for k in sorted(by):
    if not by[k][0]['trunks']: continue
    per, apart, n = collections.Counter(), 0, 0
    for r in by[k]:
        T = r['trunks']
        B = [p for p in r['platforms'] if p['style'] == 'branch' and not p['catchL'] and not p['soil'] and not p['deco']]
        own = {}
        for b in B:
            t = next((i for i, t in enumerate(T) if b['x'] - 30 <= t['x'] <= b['x'] + b['w'] + 30 and t['topY'] <= b['y'] + 10 and t['bottomY'] >= b['y']), None)
            own[b['id']] = t
        cnt = collections.Counter(v for v in own.values() if v is not None)
        for i in range(len(T)): per[cnt.get(i, 0)] += 1
        for a in B:
            for b in B:
                if a['id'] < b['id'] and abs((a['x'] + a['w'] / 2) - (b['x'] + b['w'] / 2)) <= 220:
                    n += 1; apart += own[a['id']] != own[b['id']]
    tot = sum(per.values())
    print(f"  {' '.join(k)}: trunks holding 0/1/2/3/4+ boughs: " + ' / '.join(str(per[i]) for i in range(4)) + f" / {sum(v for i, v in per.items() if i >= 4)} (of {tot}); bough pairs within 220 px: {n}, on different trunks or none {apart}")
