# CP1: the baseline. Reads the platform/vine/rope dumps of stages built exactly as engine.ts builds them (cp1-dump.ts), and measures what a
# player meets: piece kinds and sizes, the spread of sizes, climb and drop, high/low splits, the longest run of one piece, the commonest
# piece's share, and how often something new appears. Pieces are ordered along x (the way most of World 1 runs; 1-2's leftward bough leg
# is the exception and is read in x order too, which can only shorten its runs).
import json, sys, statistics as st, collections
SOIL_SKIP = True
def kind(p):
    if p['soil']: return None                                  # ground filler under a bank (types.ts: never drawn as a platform)
    if p['type'] == 'bouncy': return 'mushroom'
    if p['drift'] or p['type'] == 'drift': return 'drifting log'
    if p['type'] == 'fragile': return 'creaking limb' if p['creak'] else 'snap twig'
    if p['style'] == 'canopy_bridge': return 'bridge'
    if p['style'] == 'log': return 'log'
    if p['style'] == 'branch': return 'catch branch' if p['catchL'] else 'branch'
    if p['style'] == 'moss_stone': return 'bank' if p['h'] > 60 else 'stone'
    if p['lily']: return 'lily pad'
    return (p['style'] or p['type'])
def pieces(r):
    out = []
    for p in r['platforms']:
        k = kind(p)
        if k: out.append((p['x'] + p['w'] / 2, k, p['w'], p['y'], p['x'], p['x'] + p['w']))
    for v in r['vines']: out.append((v['x'], 'climb vine' if v['type'] == 'tree_climb' else 'liana', 0, v['bot'], v['x'], v['x']))
    for q in r['ropes']: out.append(((q['x0'] + q['x1']) / 2, 'rope', q['x1'] - q['x0'], q['y'], q['x0'], q['x1']))
    return sorted(out)
def splits(ps):
    # stretches of 500 px or more where standable tops sit at two heights 90+ px apart at once (a high and a low road)
    plats = [q for q in ps if q[1] not in ('climb vine', 'liana', 'rope')]
    if not plats: return 0
    x0, x1 = min(q[4] for q in plats), max(q[5] for q in plats)
    zones, run = 0, 0
    x = x0
    while x < x1:
        ys = sorted({q[3] for q in plats if q[4] <= x <= q[5]})
        two = len(ys) >= 2 and ys[-1] - ys[0] >= 90
        if two: run += 40
        else:
            if run >= 500: zones += 1
            run = 0
        x += 40
    if run >= 500: zones += 1
    return zones
def measure(r):
    ps = pieces(r)
    ks = [q[1] for q in ps]
    c = collections.Counter(ks)
    widths = [q[2] for q in ps if q[2] > 0]
    bands = {(q[1], int(q[2] // 60)) for q in ps}
    tops = [q[3] for q in ps if q[1] not in ('climb vine', 'liana', 'rope')]
    # longest run of one kind (pieces in a row), and its length in px
    best, bestpx, i = 0, 0, 0
    while i < len(ks):
        j = i
        while j + 1 < len(ks) and ks[j + 1] == ks[i]: j += 1
        if j - i + 1 > best: best = j - i + 1
        bestpx = max(bestpx, ps[j][5] - ps[i][4])
        i = j + 1
    # something new: a change of kind from the piece before; px between changes
    changes = [ps[i][0] for i in range(1, len(ps)) if ks[i] != ks[i - 1]]
    gaps = [b - a for a, b in zip(changes, changes[1:])] or [0]
    w = sorted(widths)
    q = lambda f: w[min(len(w) - 1, int(f * len(w)))] if w else 0
    return {
        'pieces': len(ps), 'kinds': len(c), 'mix': dict(c.most_common()),
        'sizeBands': len(bands), 'wP10': q(0.1), 'wP90': q(0.9), 'wCV': round(st.pstdev(widths) / st.mean(widths), 2) if widths else 0,
        'yRange': (max(tops) - min(tops)) if tops else 0, 'heights': len({int(t // 100) for t in tops}),
        'splits': splits(ps), 'run': best, 'runPx': round(bestpx), 'topShare': round(c.most_common(1)[0][1] / len(ks), 3),
        'newEveryPx': round(st.mean(gaps)), 'newLongestPx': round(max(gaps)), 'width': round(max(q[5] for q in ps) - min(q[4] for q in ps)),
    }
if __name__ == "__main__":
    rows = collections.defaultdict(list)
    for f in sys.argv[1:]:
        for r in json.load(open(f)):
            rows[(r['tag'], r['id'], r['setting'])].append(measure(r))
    json.dump({f'{k[0]} {k[1]} {k[2]}': v for k, v in rows.items()}, open('cp1/measures.json', 'w'))
    cols = ['kinds', 'sizeBands', 'wP10', 'wP90', 'wCV', 'yRange', 'heights', 'splits', 'run', 'runPx', 'topShare', 'newEveryPx', 'newLongestPx']
    def md(vals):
        vals = sorted(vals)
        m = vals[len(vals) // 2]
        return f'{m}' if vals[0] == vals[-1] else f'{m} ({vals[0]}-{vals[-1]})'
    print('stage setting | ' + ' | '.join(cols) + ' | commonest piece')
    for k, v in rows.items():
        top = collections.Counter(max(x['mix'], key=x['mix'].get) for x in v).most_common(1)[0][0]
        print(f'{k[0]} {k[1]} {k[2]:6} | ' + ' | '.join(md([x[c] for x in v]) for c in cols) + f' | {top}')
