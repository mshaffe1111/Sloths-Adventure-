# RUNS: the move-ladder rows (TRIAGE #121 #122 #123 #126 #127 #145 #152 #154) read off ladder-uses.ts's counts (16 layouts, Normal).
# "Worst roll" = the minimum over the 16 layouts (the spec's "counted ... 16 rolls, the worst roll", ENGINE-SPEC "More used" table);
# "any roll" = the maximum. A touch = 1-2, some = 3-6, lots = 7+ (ENGINE-SPEC "More used" amounts). Lairs (x-10) are skipped for echoes.
#   python3 -I tools/engine/runs/ladder.py <ladder-uses.json> [<main ladder-uses.json>]
import json, sys
d = json.load(open(sys.argv[1]))
ids = list(d)
W = lambda i: int(i.split('-')[0])
lo = lambda i, m: min(d[i]['counts'].get(m, [0]))
hi = lambda i, m: max(d[i]['counts'].get(m, [0]))
nonlair = [i for i in ids if not d[i]['lair']]
# the spec's teaching table (ENGINE-SPEC "Pokey's moves, in teaching order"), the moves MECHS can count
TEACH = {'mushroom': '1-1', 'rope': '1-4', 'trunk': '1-4', 'breaking': '1-5', 'liana': '1-6', 'push': '1-6', 'bush': '1-7',
         'drift': '2-1', 'lift': '2-7', 'updraft': '4-7', 'silk': '5-4', 'swim': '6-7'}
CORE = ['mushroom', 'rope', 'trunk', 'breaking', 'liana', 'push', 'bush', 'swim', 'moving']
print('== first stage, measured (any roll) vs the spec table (#121 #122 #123)')
for m, t in TEACH.items():
    first = next((i for i in ids if hi(i, m) > 0), None)
    firstw = next((i for i in ids if lo(i, m) > 0), None)
    print(f'  {m:9s} table {t:5s} measured first (any roll) {first}  (every roll) {firstw}  {"PASS" if first == t else "MISS"}')
print('  glide     table clearing 4-1: MECHS has no glide row (tools/validate/mechanics.ts:18-41), moveladder.json has none: MISS')
print('\n== teach stage, echo and own world (#126; ENGINE-SPEC "More used": teach lots, echo some x2, own world a touch every stage and some in half)')
for m, t in TEACH.items():
    if t not in ids: continue
    k = nonlair.index(t)
    echo = nonlair[k + 1:k + 3]
    own = [i for i in nonlair[k + 3:] if W(i) == W(t)]
    print(f'  {m:9s} teach {t}: worst {lo(t, m)} any {hi(t, m)} ({"lots" if lo(t, m) >= 7 else "NOT lots"})')
    print(f'            echo {", ".join(f"{i}:{lo(i, m)}-{hi(i, m)}" for i in echo)}  some on worst roll: {sum(lo(i, m) >= 3 for i in echo)}/2')
    if own:
        touch = sum(lo(i, m) >= 1 for i in own); some = sum(lo(i, m) >= 3 for i in own)
        print(f'            own world after echo ({len(own)} stages): touch every stage {touch}/{len(own)}, some {some}/{len(own)} (needs >= {(len(own) + 1) // 2})  {"PASS" if touch == len(own) and some * 2 >= len(own) else "MISS"}')
        print(f'              per stage worst-any: {" ".join(f"{i}:{lo(i, m)}-{hi(i, m)}" for i in own)}')
    else: print('            own world after echo: no stages left in the world')
print('\n== every later world (#127; SR:19-20 floor >= 1 stage a world; spec >= 1 in 3 stages)')
for m in CORE:
    t = TEACH.get(m) or next((i for i in ids if hi(i, m) > 0), None)
    if not t: continue
    rows = []
    for w in range(W(t) + 1, 11):
        st = [i for i in nonlair if W(i) == w]
        a = sum(hi(i, m) > 0 for i in st); b = sum(lo(i, m) > 0 for i in st)
        rows.append((w, a, b, len(st)))
    floor = all(a >= 1 for _, a, _, _ in rows); rate = all(a * 3 >= n for _, a, _, n in rows)
    print(f'  {m:9s} from {t}: ' + ' '.join(f'W{w}:{a}/{n}' + (f'({b})' if b != a else '') for w, a, b, n in rows) + f'   SR floor {"PASS" if floor else "MISS"}, 1-in-3 {"PASS" if rate else "MISS"}')
print('   (W:a/n = stages using it on any roll / non-lair stages; (b) = on every roll when it differs)')
print('\n== animals: longest absence in play order after first showing (#152; ES 139-140 limit: absent <= 2 stages)')
for m in sorted(k for k in d[ids[0]]['counts'] if k.startswith('animal:')):
    seen = [n for n, i in enumerate(ids) if hi(i, m) > 0]
    if not seen: continue
    gaps = [(b - a - 1, ids[a], ids[b]) for a, b in zip(seen, seen[1:])]
    tail = len(ids) - 1 - seen[-1]
    g = max(gaps, default=(0, '', ''))
    print(f'  {m[7:]:8s} first {ids[seen[0]]:5s} last {ids[seen[-1]]:5s} in {len(seen):3d} stages; longest absence {g[0]} stages ({g[1]} -> {g[2]}); after its last {tail}  {"PASS" if g[0] <= 2 else "MISS"}')
print('\n== swim (#154: 6-7 teaches, 6-8/6-9 echo, W6-W8 and W10 >= 1 in 3, none in W9)')
for w in range(6, 11):
    st = [i for i in nonlair if W(i) == w]
    print(f'  W{w}: ' + ' '.join(f'{i}:{lo(i, "swim")}-{hi(i, "swim")}' for i in st))
if len(sys.argv) > 2:
    dm = json.load(open(sys.argv[2]))
    print('\n== main (the old game): first stage of each move in 1-1..1-3 and W1-W4 (#145)')
    for m in ['trunk', 'mushroom', 'liana', 'rope', 'breaking', 'push', 'bush']:
        first = next((i for i in dm if max(dm[i]['counts'][m]) > 0), None)
        print(f'  {m:9s} main first {first}; 1-1..1-3 worst-any: ' + ' '.join(f'{i}:{min(dm[i]["counts"][m])}-{max(dm[i]["counts"][m])}' for i in ['1-1', '1-2', '1-3']))
