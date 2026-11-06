# RUNS: the E3 support check (LABELS.md §4, engine-spec): no tool existed, so this is the smallest one. For every landing of a built
# stage (platforms that are not soil, decoration or a water piece), what holds it up:
#   ground  a solid block 50 px or deeper: terrain.ts draws it as earth down to the screen's bottom (src/game/groundFloor.ts:4-5)
#   rests   another piece's top within 4 px under its bottom, overlapping it (it sits on something)
#   post    a log the mixer marks `stump` (drawn on a stump post: src/game/mixer/w1mix.ts:208, :798)
#   trunk   a bough or creaky limb (style branch) inside a drawn trunk's x span, the trunk reaching its height (proto.trunks; the mixer's
#           stages), or inside a stage tree's trunk (stage.trees: x +- trunkWidth/2 + 30, topY to groundY; the old builders' kapoks)
#   float   none of these. What the draw adds that the stage data does not carry (gen2 columns under thin ruin ledges, columnArt.ts;
#           scenery kapoks drawn behind 1-2's canopy logs, the 38136a2e commit) is not seen: an upper bound where those are drawn.
# Float share = floating landings / landings, per stage and setting. "No-float" kinds (LABELS §0 rule 1: rocks never float) are
# moss_stone under 50 px, ruin, fragile ruin, moving stone: each one floating is counted on its own.
#   python3 -I tools/engine/runs/support.py <dump.json>...
import json, sys, collections
def land(p): return not p['soil'] and not p['deco'] and not p['lily'] and p['type'] != 'drift'
def held(p, ps, trunks, trees2=()):
    if p['type'] in ('solid',) and p['h'] >= 50 and p['style'] != 'branch': return 'ground'
    b = p['y'] + p['h']
    for q in ps:
        if q is p: continue
        if q['x'] < p['x'] + p['w'] - 4 and q['x'] + q['w'] > p['x'] + 4 and b - 2 <= q['y'] <= b + 4: return 'rests'
    if 'stump' in (p['keys'] or '').split('|'): return 'post'
    if p['style'] == 'branch':
        for t in trunks:
            half = 30 * (t.get('w') or 1)
            if p['x'] - half <= t['x'] <= p['x'] + p['w'] + half and t['topY'] <= p['y'] + 10 and t['bottomY'] >= p['y']: return 'trunk'
    for t in trees2:
        if p['x'] - t['w'] / 2 - 30 <= t['x'] <= p['x'] + p['w'] + t['w'] / 2 + 30 and t['topY'] <= p['y'] + 10 and t['groundY'] >= p['y']: return 'tree'
    return 'float'
def nofloat(p): return (p['style'] == 'moss_stone' and p['h'] < 50) or p['style'] == 'ruin' or (p['type'] == 'moving' and p['style'] in ('moss_stone', 'ruin'))
rows = []
for f in sys.argv[1:]: rows += [r for r in json.load(open(f)) if 'error' not in r]
by = collections.defaultdict(list)
for r in rows: by[(r['tag'], r['id'], r['setting'])].append(r)
def md(v): v = sorted(v); return v[len(v) // 2]
world = collections.defaultdict(lambda: collections.Counter())
print('stage setting: float share median (min-max) over layouts | held by (median counts) | floating no-float pieces median (max) | examples')
for k in sorted(by, key=lambda k: (k[0], [int(x) if x.isdigit() else 0 for x in k[1].split('-')], k[2])):
    fs, nf, hb = [], [], collections.Counter(); ex = []
    for r in by[k]:
        L = [p for p in r['platforms'] if land(p)]
        c = collections.Counter(); bad = 0
        for p in L:
            h = held(p, r['platforms'], r.get('trunks') or [], r.get('trees') or []); c[h] += 1
            if h == 'float' and nofloat(p):
                bad += 1
                if len(ex) < 3 and r['layout'] == 1: ex.append(f"{p['style']}/{p['type']} {p['w']}x{p['h']} at ({p['x']},{p['y']})")
        fs.append(c['float'] / max(1, len(L))); nf.append(bad); hb.update({x: v / len(by[k]) for x, v in c.items()})
        world[(k[0], k[1].split('-')[0], k[2])].update({'land': len(L), 'float': c['float'], 'nofloat': bad})
    fs.sort()
    print(f"{k[0]} {k[1]} {k[2]}: float {fs[len(fs)//2]:.3f} ({fs[0]:.3f}-{fs[-1]:.3f}) | " + ' '.join(f'{x} {round(v)}' for x, v in sorted(hb.items())) + f" | no-float floating {md(nf)} (max {max(nf)})" + (f" | e.g. {'; '.join(ex)}" if ex else ''))
print('\nper world (all stages, all layouts pooled): float share, floating no-float pieces per build, cap = share rounded up to the next 5% (LABELS §4)')
import math
for k in sorted(world, key=lambda k: (k[0], int(k[1]), k[2])):
    w = world[k]; s = w['float'] / max(1, w['land'])
    n = sum(1 for kk in by if kk[0] == k[0] and kk[1].split('-')[0] == k[1] and kk[2] == k[2]) * 16
    print(f"  {k[0]} W{k[1]} {k[2]}: float {s:.3f} -> cap {math.ceil(s * 20 - 1e-9) * 5}% | no-float floating {w['nofloat']} over {n} builds")
