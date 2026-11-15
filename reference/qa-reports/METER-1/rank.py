# METER-1 cross-check: the meter's Normal and Easy medians against the bots' misses a minute (hits + lives + put-backs + 8 x rescues:
# a rescue is the help's put-past after 8 tries at one spot), tier bots (child, middle, expert: calibrated on the testers' 1-1) and
# first-timers (kid, adult); Spearman rank over the stages both have
import json, sys, statistics as S
meter = {}
for name, f in [('before', sys.argv[1]), ('after', sys.argv[2])]:
    d = json.load(open(f))
    for r in d['rows']: meter[(name, r['id'], r['setting'])] = r['score']
rows = [json.loads(l) for f in sys.argv[3:] for l in open(f) if l.strip()]
rows = [r for r in rows if 'error' not in r]
def idx(stage, setting, bots):
    v = []
    for b in bots:
        rr = [r for r in rows if r['stage'] == stage and r['setting'] == setting and r['bot'] == b]
        if rr: v.append(S.mean([(r['hits'] + r['lives'] + r['putbacks'] + 8 * r['rescues']) / (r['time'] / 60) for r in rr]))
    return S.mean(v) if v else None
def rank(xs):
    o = sorted(range(len(xs)), key=lambda i: xs[i]); r = [0.0] * len(xs); i = 0
    while i < len(o):
        j = i
        while j + 1 < len(o) and xs[o[j + 1]] == xs[o[i]]: j += 1
        for k in range(i, j + 1): r[o[k]] = (i + j) / 2 + 1
        i = j + 1
    return r
def spear(a, b):
    ra, rb = rank(a), rank(b); ma, mb = S.mean(ra), S.mean(rb)
    num = sum((x - ma) * (y - mb) for x, y in zip(ra, rb)); den = (sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb)) ** 0.5
    return num / den if den else float('nan')
for setting in ['normal', 'easy']:
    stages = sorted({r['stage'] for r in rows if r['setting'] == setting})
    print(f'-- {setting}: stage | meter before | meter after | tier bots misses/min | first-timers misses/min | pass (all bots)')
    T, F, B, A, st = [], [], [], [], []
    for s in stages:
        t = idx(s, setting, ['child', 'middle', 'expert']); f = idx(s, setting, ['kid', 'adult'])
        b = meter.get(('before', s, setting)); a = meter.get(('after', s, setting))
        rr = [r for r in rows if r['stage'] == s and r['setting'] == setting]
        print(f"{s} | {b} | {a} | {t:.2f} | {f:.2f} | {sum(r['pass'] for r in rr)}/{len(rr)}")
        if b is not None and a is not None: T.append(t); F.append(f); B.append(b); A.append(a); st.append(s)
    print(f'   Spearman over {",".join(st)}: tier vs before {spear(B, T):.2f}, after {spear(A, T):.2f}; first-timers vs before {spear(B, F):.2f}, after {spear(A, F):.2f}')
