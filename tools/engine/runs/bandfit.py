# RUNS #63: the spec's dial d = (0.1 (w-1) + 0.2 (s-1)/8) / 1.1 against bands.ts's measured 0-100 score per stage and setting
# (tools/inspect/inspect.ts --worlds 1-4 --firsttimer, its `bands.scored`), on the old W1-W4 (main) and today's. Pass (TRIAGE #63):
# the measured score rises with every stage inside a world, and no stage of world N sits above world N+1's first (SR:133).
# Also the least-squares fit score = a + b d, and its r.   python3 -I tools/engine/runs/bandfit.py <inspect json>...
import json, sys
for f in sys.argv[1:]:
    d = json.load(open(f)); sc = d['bands']['scored']
    for setting in ('normal', 'easy'):
        rows = [(r['id'], r['world'], r['score']) for r in sc if r['setting'] == setting and r['id'].split('-')[1].isdigit()]
        def dial(i): w, s = map(int, i.split('-')); return (0.1 * (w - 1) + 0.2 * (s - 1) / 8) / 1.1
        xs = [dial(i) for i, _, _ in rows if int(i.split('-')[1]) <= 9]; ys = [s for i, _, s in rows if int(i.split('-')[1]) <= 9]
        n = len(xs); mx, my = sum(xs) / n, sum(ys) / n
        b = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs); a = my - b * mx
        r = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sum((x - mx) ** 2 for x in xs) * sum((y - my) ** 2 for y in ys)) ** 0.5
        falls, over = [], []
        for w in range(1, 5):
            st = [(i, s) for i, ww, s in rows if ww == w and int(i.split('-')[1]) <= 9]
            falls += [f'{a1}->{b1} ({s1}->{s2})' for (a1, s1), (b1, s2) in zip(st, st[1:]) if s2 < s1]
            nxt = [s for i, ww, s in rows if ww == w + 1 and i.endswith('-1')]
            if nxt: over += [f'{i} {s} > {w + 1}-1 {nxt[0]}' for i, s in st if s > nxt[0]]
        print(f"{f.split('/')[-1]} {setting}: scores " + ' '.join(f'{i}:{s}' for i, _, s in rows))
        print(f"   fit score = {a:.1f} + {b:.1f} d, r = {r:.2f} (stages 1-9 of each world); score falls stage to stage {len(falls)} times: {', '.join(falls)}; above the next world's first: {len(over)}: {', '.join(over)}")
