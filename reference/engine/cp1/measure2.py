# CP1 v2: the level designer's definitions (ENGINE-SPEC, designer's note 11-05 ~12:02 AM): ground its own kind, climbs and bounces counted,
# size bands short <150 / medium 150-300 / long >300 px, run and share by kind and by kind x size, up/flat/down per landing and the longest
# flat stretch, splits = two standable routes in parallel 300+ px at heights 120+ px apart, "new" = a landing on a kind x size not in the
# last 6 landings. Plus the lead's placement measures: hearts, checkpoints, pickups per phone view.
import json, sys, collections, statistics as st
def kind(p):
    if p['soil']: return None
    if p['type'] == 'bouncy': return 'mushroom'
    if p['drift'] or p['type'] == 'drift': return 'drifting log'
    if p['type'] == 'fragile': return 'creaking limb' if p['creak'] else 'snap twig'
    if p['style'] == 'canopy_bridge': return 'bridge'
    if p['style'] == 'log': return 'log'
    if p['style'] == 'branch': return 'catch branch' if p['catchL'] else 'branch'
    if p['style'] == 'moss_stone': return 'ground' if p['h'] > 60 else 'stone'
    if p['lily']: return 'lily pad'
    return 'ground'
# (Easy's own size bands on the mixed 1-5, the designer's pacing ruling A, 11-05: Normal's times w1mix.ts EASY_BS; every other stage and
# setting reads on Normal's)
EASY_BS = 1.35
band = lambda w, s=1: 'short' if w < 150 * s else 'medium' if w <= 300 * s else 'long'
def landings(r):
    s = EASY_BS if r.get('tag') == 'mix' and r.get('setting') == 'easy' else 1
    # (a canopy's boughs keep Normal's bands on Easy: the high road is optional, the designer, 11-05)
    L = [(p['x'], p['x'] + p['w'], p['y'], kind(p), band(p['w'], 1 if 'bough' in (p.get('keys') or '').split('|') else s)) for p in r['platforms'] if kind(p)]
    L += [(v['x'], v['x'], v['bot'], 'climb' if v['type'] == 'tree_climb' else 'liana', '-') for v in r['vines']]
    L += [(q['x0'], q['x1'], q['y'], 'rope', band(q['x1'] - q['x0'], s)) for q in r['ropes']]
    return sorted(L, key=lambda q: (q[0] + q[1]) / 2)
def runs(seq, L):
    best = bestpx = 0; i = 0
    while i < len(seq):
        j = i
        while j + 1 < len(seq) and seq[j + 1] == seq[i]: j += 1
        best = max(best, j - i + 1); bestpx = max(bestpx, L[j][1] - L[i][0]); i = j + 1
    return best, round(bestpx)
def splits(L):
    plats = [q for q in L if q[3] not in ('climb', 'liana')]
    x, x1 = min(q[0] for q in plats), max(q[1] for q in plats)
    zones, run = 0, 0
    while x < x1:
        ys = sorted({q[2] for q in plats if q[0] <= x <= q[1]})
        if len(ys) >= 2 and ys[-1] - ys[0] > 120: run += 20
        else:
            zones += run > 300; run = 0
        x += 20
    return zones + (run > 300)
def measure(r):
    L = landings(r); k = [q[3] for q in L]; ks = [f'{q[3]} {q[4]}' for q in L]
    ck, cks = collections.Counter(k), collections.Counter(ks)
    plats = [q for q in L if q[3] not in ('climb', 'liana')]
    tops = [q[2] for q in plats]
    moves = []
    for a, b in zip(plats, plats[1:]):
        d = b[2] - a[2]; moves.append('up' if d < -20 else 'down' if d > 20 else 'flat')
    fl = bestfl = 0; start = None
    for i, m in enumerate(moves):
        if m == 'flat':
            if start is None: start = plats[i][0]
            bestfl = max(bestfl, plats[i + 1][1] - start)
        else: start = None
    news = [ (L[i][0] + L[i][1]) / 2 for i in range(len(L)) if ks[i] not in ks[max(0, i - 6):i] ]
    gaps = [b - a for a, b in zip(news, news[1:])] or [0]
    spawn = r.get('spawnX') or 0
    hearts = sorted(c['x'] for c in r['collect'] if c['t'] in ('heart', 'super_heart'))
    cps = sorted(c['x'] for c in r['checkpoints'])
    picks = [c['x'] for c in r['collect'] if c['t'] not in ('exit_totem', 'heart', 'super_heart')]
    def per_view(w):
        if not picks: return 0, 0
        x0, x1 = min(q[0] for q in L), max(q[1] for q in L); c = []
        x = x0
        while x < x1: c.append(sum(1 for p in picks if x <= p < x + w)); x += w / 2
        return st.median(c), max(c)
    return {
        'kinds': len(ck), 'kindSizes': len(cks), 'run': runs(k, L)[0], 'runPx': runs(k, L)[1], 'runKS': runs(ks, L)[0], 'runKSPx': runs(ks, L)[1],
        'share': round(ck.most_common(1)[0][1] / len(k), 3), 'shareKS': round(cks.most_common(1)[0][1] / len(ks), 3), 'top': ck.most_common(1)[0][0], 'topKS': cks.most_common(1)[0][0],
        'yRange': max(tops) - min(tops), 'up': moves.count('up'), 'flat': moves.count('flat'), 'down': moves.count('down'), 'flatPx': round(bestfl),
        'splits': splits(L), 'newMeanPx': round(st.mean(gaps)), 'newLongPx': round(max(gaps)),
        'hearts': len(hearts), 'heartsFirst30s': sum(1 for h in hearts if h - spawn < 30 * 285), 'checkpoints': len(cps),
        'cpGapMin': min([b - a for a, b in zip(cps, cps[1:])] or [0]), 'cpGapMed': round(st.median([b - a for a, b in zip(cps, cps[1:])] or [0])),
        'pickSideMed': per_view(1100)[0], 'pickSideMax': per_view(1100)[1], 'pickUpMax': per_view(400)[1],
    }
if __name__ == '__main__':
    rows = collections.defaultdict(list)
    for f in sys.argv[1:]:
        for r in json.load(open(f)): rows[(r['tag'], r['id'], r['setting'])].append(measure(r))
    json.dump({' '.join(k): v for k, v in rows.items()}, open('cp1/measures2.json', 'w'))
    cols = ['kinds', 'kindSizes', 'run', 'runKS', 'runKSPx', 'share', 'shareKS', 'yRange', 'up', 'flat', 'down', 'flatPx', 'splits', 'newMeanPx', 'newLongPx', 'hearts', 'heartsFirst30s', 'checkpoints', 'cpGapMin', 'cpGapMed', 'pickSideMed', 'pickSideMax', 'pickUpMax']
    def md(v):
        v = sorted(v); m = v[len(v) // 2]
        return f'{m}' if v[0] == v[-1] else f'{m} ({v[0]}-{v[-1]})'
    for k, v in rows.items():
        print(f'== {k[0]} {k[1]} {k[2]}: top {collections.Counter(x["top"] for x in v).most_common(1)[0][0]} / {collections.Counter(x["topKS"] for x in v).most_common(1)[0][0]}')
        print('   ' + '  '.join(f'{c}={md([x[c] for x in v])}' for c in cols))
