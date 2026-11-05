# RUNS #31 #33: the arc check. Each node's height change: the mean top of its first two and last two landings by x (catch, crossing,
# step-down and perch pieces left out: they are not the road), in screen px (+ = down). The stage's: its last node's end minus its first's
# start. The node's time is the first-timer bot's (ftsweep.ts): from its first jump try in the node to its last.
#   python3 -I tools/engine/runs/arc.py <dump.json> <ftsweep.json> <stage>
import json, sys, collections
d = [r for r in json.load(open(sys.argv[1])) if r.get('id') == sys.argv[3] and 'error' not in r]
ft = {(r['layout'], r['setting']): r for r in json.load(open(sys.argv[2]))}
def road(p): return not p['soil'] and not p['deco'] and not p['catchL'] and not ({'crossing', 'stepDown', 'perch'} & set((p['keys'] or '').split('|')))
for setting in ('normal', 'easy'):
    stage, signs, alt, n3 = [], collections.Counter(), [], []
    for r in [x for x in d if x['setting'] == setting]:
        nodes = collections.OrderedDict()
        for e in r['mix']:
            if e['node'] < 1 or e.get('road') == 'high': continue
            k = e.get('nid'); a, b = nodes.get(k, (1e9, -1e9))[:2]; nodes[k] = (min(a, e['x0']), max(b, e['x1']))
        P = sorted([p for p in r['platforms'] if road(p)], key=lambda p: p['x'])
        dys = []
        for k, (a, b) in nodes.items():
            inn = [p for p in P if a <= p['x'] + p['w'] / 2 <= b]
            if len(inn) < 2: continue
            s0 = sum(p['y'] for p in inn[:2]) / len(inn[:2]); s1 = sum(p['y'] for p in inn[-2:]) / len(inn[-2:])
            dys.append((k, round(s1 - s0)))
        first = [p for p in P if nodes[next(iter(nodes))][0] <= p['x'] + p['w'] / 2][:2]; last = [p for p in P if p['x'] + p['w'] / 2 <= list(nodes.values())[-1][1]][-2:]
        net = round(sum(p['y'] for p in last) / len(last) - sum(p['y'] for p in first) / len(first)); stage.append(net)
        sg = ['+' if dy > 20 else '-' if dy < -20 else '0' for _, dy in dys]
        alt.append(sum(1 for x, y in zip(sg, sg[1:]) if x == y and x != '0'))
        for (k, dy), s in zip(dys, sg): signs[(k, s)] += 1
        if '3' in nodes:
            f = ft.get((r['layout'], setting)); a, b = nodes['3']
            ts = [t['t0'] for t in (f or {}).get('tries', []) if a <= t['x'] <= b]
            ups = [k for k, dy in dys if dy < -20]
            n3.append((dict(dys).get('3'), round(max(ts) - min(ts), 1) if ts else None, ups[0] if ups else None))
    print(f"== {sys.argv[3]} {setting}: the stage's net height change (px, + = ends lower) per layout: {sorted(stage)}")
    print(f"   neighbouring nodes that move the same way (both up or both down), per layout: {sorted(alt)}")
    ks = list(dict.fromkeys(k for k, _ in signs))
    print('   per node, layouts going up (-) / level (0) / down (+): ' + '; '.join(f"n{k} {signs[(k, '-')]}/{signs[(k, '0')]}/{signs[(k, '+')]}" for k in ks))
    if n3: print(f"   n3 (rise px, bot seconds in it, first rising node): {n3}")
