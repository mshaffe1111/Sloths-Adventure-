# Hearts and checkpoints against risk, on the level designer's idea stretches (cp2/idea-tags.json, layout 1 Normal).
# A stretch is RISKY if it holds any of: a breaking piece (fragile), an animal, a liana or rope, water under the route, or a fall
# (a gap of 60+ px between neighbouring standable pieces with nothing standable within 300 px under it). Estimate of risk, not a bot run.
# Rules checked (ENGINE-SPEC placement rules 2-3): a heart only after a risky stretch and never in the first stretch;
# a checkpoint only before a risky stretch (one within the next 2 stretches), and never two checkpoints with no risky stretch between.
import json, sys
sys.path.insert(0, 'cp1'); from measure2 import landings
tags = json.load(open('/home/user/Sloths-Adventure-/reference/engine/cp2/idea-tags.json'))
name = {('old', '1-1'): 'Old 1-1 (live)', **{('new', f'1-{i}'): f'Rebuilt 1-{i}' for i in range(1, 6)}}
for f in ['cp1-old.json', 'cp1-new.json']:
    for r in json.load(open(f)):
        if r['layout'] != 1 or r['setting'] != 'normal': continue
        st = sorted(tags[name[(r['tag'], r['id'])]], key=lambda s: s[0])
        L = landings(r); plats = [q for q in L if q[3] not in ('climb', 'liana', 'rope')]
        frag = [ (p['x'] + p['w'] / 2) for p in r['platforms'] if p['type'] == 'fragile' ]
        hang = [ (q[0] + q[1]) / 2 for q in L if q[3] in ('liana', 'rope') ]
        foes = [ e['x'] for e in r['enemies'] ]
        falls = []
        ps = sorted(plats, key=lambda q: q[0])
        for a, b in zip(ps, ps[1:]):
            if b[0] - a[1] >= 60:
                gx = (a[1] + b[0]) / 2; y = min(a[2], b[2])
                below = any(q[0] <= gx <= q[1] and 0 < q[2] - y <= 300 for q in ps)
                if not below or (r['waterY'] and r['waterY'] > y): falls.append(gx)
        def risky(s): return any(s[0] <= x <= s[1] for x in frag + hang + foes + falls)
        R = [risky(s) for s in st]
        hearts = sorted(c['x'] for c in r['collect'] if c['t'] in ('heart', 'super_heart'))
        cps = sorted(c['x'] for c in r['checkpoints'])
        idx = lambda x: max([i for i, s in enumerate(st) if s[0] <= x] or [0])
        badH = [h for h in hearts if idx(h) == 0 or not any(R[:idx(h) + 1])]
        badC = [c for c in cps if not any(R[idx(c): idx(c) + 3])]
        back = sum(1 for a, b in zip(cps, cps[1:]) if not any(R[idx(a) + 1: idx(b) + 1]))
        print(f'{name[(r["tag"], r["id"])]:16} stretches {len(st):3} risky {sum(R):3} | hearts {len(hearts):2}, not after a risk {len(badH)} | '
              f'checkpoints {len(cps):2}, not before a risk {len(badC):2}, back to back over safe ground {back:2}')
