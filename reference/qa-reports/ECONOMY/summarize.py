"""ECONOMY summary: python3 -I reference/qa-reports/ECONOMY/summarize.py reference/qa-reports/ECONOMY/raw/*.jsonl
Per stage x setting x tier: runs, finished, median s, hits (hearts lost) mean/p90/max, lives mean/max, share with a life lost,
Game Overs under today's 3 lives, and what the proposed Normal (3 hearts a life) would cost: lives and Game Overs re-counted from the
hit times is not possible from tallies, so the proposal is judged on hits per run against 3-heart pools (see ECONOMY.md)."""
import json, sys, statistics as S
runs, stages = [], {}
for f in sys.argv[1:]:
    for line in open(f):
        d = json.loads(line)
        if d['kind'] == 'run': runs.append(d)
        elif d['kind'] == 'stage': stages.setdefault((d['stage'], d['setting']), []).append(d)
def p(xs, q): xs = sorted(xs); return xs[min(len(xs) - 1, int(q * len(xs)))]
print('stage set     tier    n fin  med_s | hits mean p90 max | lives mean max share | GO runs | putbk resc')
for key in sorted({(r['stage'], r['setting'], r['tier']) for r in runs}):
    rs = [r for r in runs if (r['stage'], r['setting'], r['tier']) == key]
    h = [r['hits'] for r in rs]; l = [r['lives'] for r in rs]
    print(f"{key[0]} {key[1]:6} {key[2]:7} {len(rs):2} {sum(r['end']=='shrine' for r in rs):3} {S.median([r['seconds'] for r in rs]):5.0f} |"
          f" {S.mean(h):4.1f} {p(h,.9):3} {max(h):3} | {S.mean(l):4.2f} {max(l):3} {sum(x>0 for x in l)/len(l):4.0%} |"
          f" {sum(r['gameOvers']>0 for r in rs):3}/{len(rs)} | {S.mean([r['putbacks'] for r in rs]):4.1f} {S.mean([r['rescues'] for r in rs]):4.1f}")
print('\nstage set     hearts laid (min-max)  flags (min-max)  flowers laid  goal')
for (st, se), ds in sorted(stages.items()):
    g = lambda k: f"{min(d[k] for d in ds)}-{max(d[k] for d in ds)}"
    print(f"{st} {se:6}  {g('hearts'):>8}               {g('checkpoints'):>6}         {g('flowers'):>7}   {g('goal')} {ds[0]['objective']}")
causes = {}
for r in runs:
    for c in r['lifeCauses']: causes[(r['stage'], c)] = causes.get((r['stage'], c), 0) + 1
print('\nlife causes:', ', '.join(f"{k[0]} {k[1]} {v}" for k, v in sorted(causes.items())))
