# compares clockdiff.ts outputs (main vs head): per stage, gameTime and every engine field present on both sides, step by step
import json, sys
m = json.load(open('/tmp/claude-0/cd-main.json')); h = json.load(open('/tmp/claude-0/cd-head.json'))
tot = {'stages': 0, 't_diff': 0, 'fields_cmp': 0}
diffs = {}
for sid in sorted(set(m) | set(h)):
    a, b = m.get(sid), h.get(sid)
    if not a or not b or a.get('err') or b.get('err'):
        print('stage', sid, 'missing/err', a and a.get('err'), b and b.get('err')); continue
    tot['stages'] += 1
    fa, fb = a['frames'], b['frames']
    tdiff = [i for i in range(min(len(fa), len(fb))) if fa[i]['t'] != fb[i]['t'] or fa[i]['vc'] != fb[i]['vc']]
    if tdiff: tot['t_diff'] += 1; print(sid, 'gameTime/vineClock differ from step', tdiff[0], fa[tdiff[0]]['t'], fb[tdiff[0]]['t'])
    common = set(fa[0]) & set(fb[0]) - {'t', 'vc'}
    for k in sorted(common):
        tot['fields_cmp'] += 1
        first = next((i for i in range(min(len(fa), len(fb))) if k in fa[i] and k in fb[i] and fa[i][k] != fb[i][k]), None)
        if first is not None:
            diffs.setdefault(k, []).append((sid, first))
print(json.dumps(tot))
for k, v in sorted(diffs.items(), key=lambda x: -len(x[1])):
    print(f'field {k}: differs on {len(v)} stages, e.g. {v[:6]}')
