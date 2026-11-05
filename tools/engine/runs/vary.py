# RUNS: the landing-share and run rows (TRIAGE #40 #41 #44 #46 #102/#116 #132) on CP1's own measure (engine-spec
# reference/engine/cp1/measure2.py, imported unchanged from the path given) over 16 layouts x 2 settings.
#   python3 -I tools/engine/runs/vary.py <measure2.py dir> <dump.json>...
import json, sys, collections, statistics as st
sys.path.insert(0, sys.argv[1]); import measure2 as M
rows = []
for f in sys.argv[2:]: rows += [r for r in json.load(open(f)) if 'error' not in r]
by = collections.defaultdict(list)
for r in rows: by[(r['tag'], r['id'], r['setting'])].append(r)
def med(v): v = sorted(v); return v[len(v) // 2]
def rng(v): v = sorted(v); return f'{med(v)} ({v[0]}-{v[-1]})' if v[0] != v[-1] else f'{v[0]}'
BOUGH = {'branch', 'catch branch', 'creaking limb', 'snap twig'}
CORE = {'1-1': {'ground', 'log', 'stone'}, '1-5': {'branch', 'catch branch', 'creaking limb', 'snap twig', 'ground'}}  # stages.ts:13, :52 core lists in CP1 kinds (bank = CP1 'ground')
def shares(r):
    L = [q for q in M.landings(r)]
    c = collections.Counter(q[3] for q in L); n = len(L)
    return c, n
print('stage: runKS | creaky share, rank | boughs+creaky share | top-3 share | core share | newMeanPx with / without bridges')
for k in sorted(by, key=lambda k: (k[0], [int(x) for x in k[1].split('-')], k[2])):
    if k[1] not in ('1-1', '1-2', '1-3', '1-5') : continue
    v = by[k]; out = collections.defaultdict(list)
    for r in v:
        m = M.measure(r); out['runKS'].append(m['runKS']); out['newMeanPx'].append(m['newMeanPx'])
        c, n = shares(r)
        cr = c['creaking limb'] + c['snap twig']; out['creaky'].append(round(cr / n, 3))
        rank = sorted(c.values(), reverse=True); out['creakyRank'].append(1 + sum(x > max(c['creaking limb'], c['snap twig']) for x in rank) if cr else 99)
        out['bough'].append(round(sum(c[x] for x in BOUGH) / n, 3))
        out['top3'].append(round(sum(x for _, x in c.most_common(3)) / n, 3))
        if k[1] in CORE: out['core'].append(round(sum(c[x] for x in CORE[k[1]]) / n, 3))
        r2 = dict(r); r2['platforms'] = [p for p in r['platforms'] if p['style'] != 'canopy_bridge']
        out['newNoBridge'].append(M.measure(r2)['newMeanPx'])
    print(f"{k[0]} {k[1]} {k[2]}: runKS {rng(out['runKS'])} | creaky {rng(out['creaky'])}, rank {rng(out['creakyRank'])} | boughs+creaky {rng(out['bough'])} | top3 {rng(out['top3'])} | core {rng(out['core']) if out['core'] else '-'} | new {rng(out['newMeanPx'])} / {rng(out['newNoBridge'])}")
# #41: old 1-1's canopy-over-floor stretches, in pieces
sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0]); import ideas as I
for k in sorted(by):
    if k[1] != '1-1' or k[2] != 'normal': continue
    lens = []
    for r in by[k]:
        s = I.strip(r)
        for a, b, t in I.tag(s):
            if t.startswith('the fork') or t == 'canopy run':
                lens.append(sum(1 for x, w, y, kk, _ in s if kk == 'branch' and y < 450 and x >= a - 1 and x + w <= b + 1))
    c = collections.Counter(lens)
    print(f'{k[0]} 1-1 normal canopy stretches (fork + canopy run), pieces each over 16 layouts: {sorted(c.items())}; inside 2-5: {sum(v for x, v in c.items() if 2 <= x <= 5)}/{len(lens)}')
