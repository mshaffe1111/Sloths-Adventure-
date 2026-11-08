# CP1 diagnosis: what a player sees as "the same thing over and over" when kinds alternate. For each stage, in x order:
#  - pairShare: share of all consecutive pairs that are the commonest pair (e.g. creaking limb -> stone);
#  - repeatRun: the longest stretch (px) where a pattern of 1-3 pieces repeats back to back (A A A, AB AB AB, ABC ABC);
#  - perScreen: distinct kinds in each 1100 px (one sideways screen, beatTrace.ts VIEWS), median over the stage.
import json, sys, collections, statistics as st
sys.path.insert(0, 'cp1'); from measure import pieces
def diag(r):
    ps = pieces(r); ks = [q[1] for q in ps]
    pairs = collections.Counter(zip(ks, ks[1:]))
    top, n = pairs.most_common(1)[0]
    best = 0
    for L in (1, 2, 3):
        i = 0
        while i + L <= len(ks):
            j = i + L
            while j + L <= len(ks) and ks[j:j + L] == ks[i:i + L]: j += L
            if (j - i) // L >= 3: best = max(best, ps[j - 1][5] - ps[i][4])
            i += 1
    x0, x1 = ps[0][4], max(q[5] for q in ps)
    scr = []
    x = x0
    while x < x1:
        scr.append(len({q[1] for q in ps if x <= q[0] < x + 1100})); x += 550
    return round(n / max(1, len(ks) - 1), 3), f'{top[0]}>{top[1]}', round(best), st.median(scr)
rows = collections.defaultdict(list)
for f in sys.argv[1:]:
    for r in json.load(open(f)):
        if r['setting'] == 'normal': rows[(r['tag'], r['id'])].append(diag(r))
print('stage | commonest pair share | commonest pair | longest repeating pattern px | kinds per screen (median)')
for k, v in rows.items():
    md = lambda i: sorted(x[i] for x in v)[len(v) // 2]
    print(f'{k[0]} {k[1]} | {md(0)} | {collections.Counter(x[1] for x in v).most_common(1)[0][0]} | {md(2)} | {md(3)}')
