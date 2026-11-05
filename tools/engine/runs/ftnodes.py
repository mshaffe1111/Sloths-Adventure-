# RUNS: the first-timer sweep (ftsweep.ts) read per node (TRIAGE #25 #68 #100 #104): each harm and each jump try is put in the node whose
# laid span (meta.mix.explain x0..x1, by the node's spec id nid) holds its x; crossings between fork roads count to the fork.
# Only runs the validator method counts (reference/methods/validator.md step 4: a run with more than 3 rescues or no shrine is not
# counted); the runs left out are listed.
#   python3 -I tools/engine/runs/ftnodes.py <ftsweep.json>
import json, sys, collections
d = json.load(open(sys.argv[1]))
def spans(mix):
    out = []; last = None
    for e in mix:
        nid = e.get('nid') if e['node'] > 0 else last
        if e['node'] > 0: last = (e.get('nid'), e['job'])
        out.append((e['x0'], e['x1'], (e.get('nid'), e['job']) if e['node'] > 0 else last))
    return out
def node_of(sp, x):
    for a, b, k in sp:
        if a - 1 <= x <= b + 1: return k
    return ('-', 'between nodes / start / end')
for who in ('ADULT', 'KID'):
    allr = [r for r in d if r['who'] == who]
    runs = [r for r in allr if r['rescues'] <= 3 and r['end'] == 'shrine']
    out_ = [f"L{r['layout']} ({r['end']}, {r['rescues']} rescues)" for r in allr if r not in runs]
    if not runs:
        print(f'== {d[0]["id"]} {who}: NOT JUDGED, no counted run (left out: {", ".join(out_)})'); continue
    lives, hits, tries, okt, heart, dbl, dblok = (collections.Counter() for _ in range(7))
    order = []
    for r in runs:
        sp = spans(r['mix'])
        for _, _, k in sp:
            if k not in order: order.append(k)
        for h in r['harms']: (lives if h['kind'] == 'life' else hits)[node_of(sp, h['x'])] += 1
        for t in r['tries']:
            k = node_of(sp, t['x']); tries[k] += 1; okt[k] += t['ok']
            if t['kind'] == 'double': dbl[k] += 1; dblok[k] += t['ok']
        for x in r['hearts']: heart[node_of(sp, x)] += 1
    n = len(runs)
    print(f'== {d[0]["id"]} {who} ({runs[0]["setting"]}), {n} counted runs of {len(allr)} (left out: {", ".join(out_) or "none"}): per node: lives lost per run | hits per run | jump tries ok share | doubles ok | hearts laid per build')
    print(f'   whole stage: lives {sum(lives.values())/n:.2f}/run, hits {sum(hits.values())/n:.2f}/run, rescues {sum(r["rescues"] for r in runs)/n:.2f}/run, soft falls {sum(r["softFalls"] for r in runs)/n:.2f}/run (soft falls carry no x)')
    for k in order + [('-', 'between nodes / start / end')]:
        if not (tries[k] or lives[k] or hits[k] or heart[k]): continue
        print(f'   n{k[0]} {k[1]:18s} lives {lives[k]/n:.2f} | hits {hits[k]/n:.2f} | tries {tries[k]} ok {okt[k]/max(1,tries[k]):.3f} | doubles {dbl[k]} ok {dblok[k]/max(1,dbl[k]):.3f} | hearts {heart[k]/n:.2f}')
