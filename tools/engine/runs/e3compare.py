# RUNS, the E3 side by side (the lead, 12:22 PM ET): the planner's rule (tools/engine/stonesupport.ts, its per-piece test copied below:
# open air = nothing solid, no water surface and not the stage floor within 8 px under the collider's bottom, anywhere along its width)
# against support.py's rule (held by ground 50 px+ deep / resting on a top / a stump post / a trunk or tree), on the same builds
# (simdump.ts: the stage as stonesupport.ts reads it, through the real engine), 16 layouts x 2 settings. Every piece the two disagree on
# is listed with its x and y.   python3 -I tools/engine/runs/e3compare.py <out prefix> <simdump.json>...
import json, sys, collections
sys.path.insert(0, sys.argv[0].rsplit('/', 1)[0])
src = open(sys.argv[0].rsplit('/', 1)[0] + '/support.py').read().split('rows = []')[0]; M = {}; exec(src, M)
def planner_open(p, P, water, floorY):  # stonesupport.ts:36-44, verbatim in Python
    bottom = p['y'] + (p['h'] or 24)
    under = [q['y'] for q in P if q is not p and q['x'] < p['x'] + p['w'] and q['x'] + q['w'] > p['x'] and q['y'] >= bottom - 8]
    under += [z['y'] for z in water if z['x0'] < p['x'] + p['w'] and z['x1'] > p['x'] and z['y'] >= bottom - 8]
    near = min(under + [floorY]); gap = near - bottom
    return gap > 8, (not under) and gap > 8, gap
prefix = sys.argv[1]
rows = []
for f in sys.argv[2:]: rows += json.load(open(f))
by = collections.defaultdict(list)
for r in rows: by[(r['tag'], r['id'], r['setting'])].append(r)
lines = ['tag stage setting layout | x y w h | kind (catalog) style type | planner: open air (gap px, pit) | support.py: held by']
summary = []
for k in sorted(by):
    sh_p, sh_m, n_both, dis = [], [], 0, collections.Counter()
    for r in by[k]:
        P = r['platforms']
        L_p = [p for p in P if p['kind']]                 # stonesupport counts landings the catalogue names
        fl_p = 0
        for p in L_p:
            op, pit, gap = planner_open(p, P, r['water'], r['floorY'])
            if p['mayFloat'] == 'yes' and op: fl_p += 1
        sh_p.append(fl_p / max(1, len(L_p)))
        L_m = [p for p in P if M['land'](p)]
        fl_m = sum(1 for p in L_m if M['held'](p, P, r['trunks'], r['trees']) == 'float')
        sh_m.append(fl_m / max(1, len(L_m)))
        for p in P:
            if not p['kind'] or not M['land'](p): continue
            n_both += 1
            op, pit, gap = planner_open(p, P, r['water'], r['floorY'])
            h = M['held'](p, P, r['trunks'], r['trees'])
            mf = h == 'float'
            if op != mf:
                why = f"planner {'OPEN' if op else 'held'} / support.py {h}"
                dis[(why, p['kind'])] += 1
                lines.append(f"{k[0]} {k[1]} {k[2]} L{r['layout']} | {round(p['x'])} {round(p['y'])} {round(p['w'])} {round(p['h'])} | {p['kind']} {p['style']} {p['type']} | " +
                             (f"open, gap {round(gap)}{' (pit)' if pit else ''}" if op else f"held (gap {round(gap)})") + f" | {h}")
    md = lambda v: sorted(v)[len(v) // 2]
    summary.append(f"{' '.join(k)}: float share, planner's rule (mayFloat 'yes' pieces with open air, of catalogue landings) {md(sh_p):.3f} ({min(sh_p):.3f}-{max(sh_p):.3f}); support.py {md(sh_m):.3f} ({min(sh_m):.3f}-{max(sh_m):.3f}); pieces judged by both {n_both} over 16 builds, disagreeing {sum(dis.values())}")
    for (why, kind), c in dis.most_common(): summary.append(f"     {c:5d}  {why:44s} {kind}")
open(prefix + '-pieces.txt', 'w').write('\n'.join(lines) + '\n')
open(prefix + '-summary.txt', 'w').write('\n'.join(summary) + '\n')
print('\n'.join(summary))
