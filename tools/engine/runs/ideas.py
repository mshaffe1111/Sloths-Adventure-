# RUNS: the set-of-ideas measure (TRIAGE #2 #8 #21 #22 #103 #105 #115 and the C14 calibration): CP2's tagger (engine-spec
# reference/engine/cp2/tag_ideas.py, its tag() copied verbatim below) over every roll, and the Jaccard share of ideas two stages hold.
# The tagger's heights (canopy y < 450, floor y >= 560) are old 1-1's own coordinates (its ground is y 580 = its spawnY); other stages
# are shifted so their spawn height sits at 580 (an adaptation, named; a climbing stage like 1-4 is not judged by it).
# Kinds are CP1's (cp1/measure.py kind()). The mixer's own node labels (meta.mix.explain) are reported beside it for 1-1 and 1-5.
#   python3 -I tools/engine/runs/ideas.py <dump.json>...
import json, sys, collections, itertools
def kind(p):
    if p['soil']: return None
    if p['type'] == 'bouncy': return 'mushroom'
    if p['drift'] or p['type'] == 'drift': return 'drifting log'
    if p['type'] == 'fragile': return 'creaking limb' if p['creak'] else 'snap twig'
    if p['style'] == 'canopy_bridge': return 'bridge'
    if p['style'] == 'log': return 'log'
    if p['style'] == 'branch': return 'catch branch' if p['catchL'] else 'branch'
    if p['style'] == 'moss_stone': return 'bank' if p['h'] > 60 else 'stone'
    if p['lily']: return 'lily pad'
    return (p['style'] or p['type'])
def tag(p):  # verbatim from cp2/tag_ideas.py:7-31
    out = []
    for x, w, y, k, f in p:
        if k == 'mushroom': t = 'bounce up'
        elif k in ('rope',): t = 'rope crossing'
        elif k == 'stone': t = 'high perch'
        elif k == 'branch' and y < 450: t = 'canopy run'
        elif k == 'branch': t = 'low boughs'
        elif k in ('bank', 'log') and w <= 320: t = 'bank hops'
        elif k == 'log' and w > 900 and y >= 560: t = 'floor under canopy'
        else: t = 'flat walk' if w > 320 else 'bank hops'
        out.append((x, x + w, t))
    out.sort()
    segs = []
    for a, b, t in out:
        if t == 'floor under canopy':
            continue  # counted as the low road of a fork below
        if segs and segs[-1][2] == t and a - segs[-1][1] < 450: segs[-1][1] = max(segs[-1][1], b)
        else: segs.append([a, b, t])
    floors = [(a, b) for a, b, t in out if t == 'floor under canopy']
    for s in segs:
        if s[2] == 'canopy run' and any(fa < s[1] and fb > s[0] and min(fb, s[1]) - max(fa, s[0]) > 300 for fa, fb in floors):
            s[2] = 'the fork (canopy over the floor)'
    return segs
def strip(r):
    dy = 580 - (r.get('spawnY') or 580)
    p = [(q['x'], q['w'], q['y'] + dy, kind(q), None) for q in r['platforms'] if kind(q)]
    p += [(q['x0'], q['x1'] - q['x0'], q['y'] + dy, 'rope', None) for q in r['ropes']]
    return p
def ideas(r):
    segs = tag(strip(r)); tot = sum(b - a for a, b, _ in segs) or 1
    sh = collections.Counter()
    for a, b, t in segs: sh[t] += b - a
    return {t: v / tot for t, v in sh.items()}
def jac(a, b): return len(a & b) / len(a | b) if a | b else 0
if __name__ == '__main__':
    rows = []
    for f in sys.argv[1:]: rows += [r for r in json.load(open(f)) if 'error' not in r]
    by = collections.defaultdict(list)
    for r in rows: by[(r['tag'], r['id'], r['setting'])].append(r)
    for k, v in sorted(by.items()):
        sets = [set(ideas(r)) for r in v]; n = sorted(len(s) for s in sets)
        top = sorted(max(ideas(r).values()) for r in v)
        mixn = sorted(len({e['idea'] for e in r['mix']}) for r in v if r.get('mix'))
        print(f'{k[0]} {k[1]} {k[2]}: tagger ideas median {n[len(n)//2]} ({n[0]}-{n[-1]}); top idea share median {top[len(top)//2]:.2f} (max {top[-1]:.2f})' + (f'; mixer node ideas {mixn[len(mixn)//2]} ({mixn[0]}-{mixn[-1]})' if mixn else '') + f'; ideas seen {sorted(set().union(*sets))}')
    def pair(a, b, s):
        A, B = by[a + (s,)], by[b + (s,)]
        if not A or not B: return None
        j = sorted(jac(set(ideas(x)), set(ideas(y))) for x, y in zip(sorted(A, key=lambda r: r['layout']), sorted(B, key=lambda r: r['layout'])))
        return j
    print('\npairs (Jaccard of the tagger idea sets, same layout number, 16 layouts): median (min-max)')
    keys = sorted({(k[0], k[1]) for k in by}, key=lambda k: (k[0], [int(x) for x in k[1].split('-')]))
    for s in ('normal', 'easy'):
        cand = [(('old', '1-1'), ('mix', '1-3')), (('old', '1-1'), ('old', '1-3')), (('mix', '1-1'), ('mix', '1-5')), (('old', '1-1'), ('mix', '1-1'))]
        for t in ('old', 'mix'):
            ids = [k[1] for k in keys if k[0] == t]
            cand += [((t, a), (t, b)) for a, b in zip(ids, ids[1:])]
        for a, b in cand:
            j = pair(a, b, s)
            if j: print(f'  {s:6s} {a[0]} {a[1]:4s} vs {b[0]} {b[1]:4s}: {j[len(j)//2]:.2f} ({j[0]:.2f}-{j[-1]:.2f})')
