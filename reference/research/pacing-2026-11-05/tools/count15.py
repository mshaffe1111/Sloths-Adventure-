# count15.py [file.tsv ...]: the §2.3 counts over shipped worlds. Rows "world<TAB>code<TAB>name<TAB>seconds<TAB>role", main path + boss.
# default input: raw/distinct15_mainpath.tsv (TF bronze + Rayman Legends IL + DKC Returns shiny, main path + boss).
import sys, statistics
files = sys.argv[1:] or ['raw/distinct15_mainpath.tsv']
W = {}
for f in files:
    for l in open(f):
        if l.startswith('#') or not l.strip(): continue
        w, c, n, s, r = l.rstrip('\n').split('\t')
        if r in ('main', 'boss'): W.setdefault(w, []).append((c, float(s), r))
tot = dict(boss_top3=0, boss_longest=0, last_regular_top3=0, spread_ge_150s=0, all_neighbours_ge_20pct=0, run_of_3_within_10pct=0)
ratios = []
for w, L in W.items():
    t = [x[1] for x in L]; rk = {x[0]: i + 1 for i, x in enumerate(sorted(L, key=lambda x: -x[1]))}
    boss = [x for x in L if x[2] == 'boss'][0]; last = [x for x in L if x[2] == 'main'][-1]
    d = [abs(a - b) / min(a, b) for a, b in zip(t, t[1:])]
    best = cur = 0
    for x in d: cur = cur + 1 if x < 0.1 else 0; best = max(best, cur)
    tot['boss_top3'] += rk[boss[0]] <= 3; tot['boss_longest'] += rk[boss[0]] == 1; tot['last_regular_top3'] += rk[last[0]] <= 3
    tot['spread_ge_150s'] += (max(t) - min(t)) >= 150; tot['all_neighbours_ge_20pct'] += all(x >= 0.2 for x in d)
    tot['run_of_3_within_10pct'] += best >= 3
    ratios.append((round(max(t) / min(t), 2), w, best))
print(len(W), 'worlds', tot)
for r in sorted(ratios): print(f'  {r[1]:8s} longest/shortest {r[0]:.2f}  longest run of pairs <10%: {r[2]}')
print('median ratio', statistics.median([r[0] for r in ratios]))
