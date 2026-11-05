# RUNS, R-164.11: rollshares.ts's per-roll numbers summed up per stage and setting: min, p10, median, p90, max of each measure over the
# rolls, and each roll's lean (its hop share minus the stage's median hop share).   python3 -I tools/engine/runs/rollsum.py <tag=json>...
import json, sys, collections
def q(v, p): a = sorted(x for x in v if x is not None); return a[min(len(a) - 1, int(p * len(a)))] if a else None
f = lambda x: '-' if x is None else f'{x:.3f}'
for arg in sys.argv[1:]:
    tag, path = arg.split('=', 1)
    by = collections.defaultdict(list)
    for r in json.load(open(path)): by[(r['id'], r['setting'])].append(r)
    for (sid, s), v in sorted(by.items()):
        gate = '' if s == 'normal' else f", {v[0]['maxRiseGate']} px (the Easy gate)"
        print(f"== {tag} {sid} {s}: {len(v)} rolls; highest rise the gate allows {v[0]['maxRiseJumpOK']} px (jumpOK){gate}")
        print('   measure                      min    p10    med    p90    max')
        keys = [('hop share', 'hopShare'), ('gap share, roll median', 'gapMed'), ('gap share, roll p90', 'gapP90'), ('rise share, roll median', 'riseMed'), ('rise share, roll p90', 'riseP90')]
        if s == 'easy': keys += [('gap share (Easy gate), median', 'gapGateMed'), ('gap share (Easy gate), p90', 'gapGateP90'), ('rise share (Easy gate), median', 'riseGateMed'), ('rise share (Easy gate), p90', 'riseGateP90')]
        for name, k in keys:
            xs = [r[k] for r in v]
            print(f'   {name:30s} ' + ' '.join(f'{f(q(xs, p)):>6s}' for p in (0, 0.1, 0.5, 0.9, 0.9999)))
        m = q([r['hopShare'] for r in v], 0.5)
        print('   lean per roll (hop share - median), by variant: ' + ' '.join(f"{r['variant']}:{r['hopShare'] - m:+.3f}" for r in v))
        print(f"   jumps per roll on the route: gaps {q([r['gapN'] for r in v], 0.5)}, rises {q([r['riseN'] for r in v], 0.5)} (medians)")
