#!/usr/bin/env python3
"""B14's pipeline hook for FA (gen2/pipeline.ts is FA's today; B14 never commits it): every laid piece carries its section uid and piece
key (types.ts Vine.tag / Platform.tag, on t-b14), so a stage's own finish (1-4's vine field, figs, gates and pods: w1Arc14.ts) finds
its pieces by key. Two lines, inserted by text match (line numbers differ on t-fa). Run from the repo root:
  python3 reference/qa-reports/B14/pipeline-hook.py   (idempotent)"""
p = 'src/game/gen2/pipeline.ts'
s = open(p).read()
INS = [
  ('          vines.push(v);\n          const h = lp.hang;\n',
   '          // (every laid piece knows its section and key, types.ts Vine.tag / Platform.tag: what a stage\'s own finish finds it by)\n          v.tag = `${placed.uid}:${lp.key}`;\n'),
  ('        const p = mk(ox + lp.x, oy + lp.y, lp.w, lp.shape, lp.h, row?.style ?? lp.style, !!lp.crumble);\n',
   None),
]
if 'v.tag = `${placed.uid}:${lp.key}`' in s and 'p.tag = `${placed.uid}:${lp.key}`' in s:
  print('already applied'); raise SystemExit(0)
a, add = INS[0]
assert s.count(a) == 1, 'vine anchor not found once'
s = s.replace(a, add + a)
b, _ = INS[1]
assert s.count(b) == 1, 'platform anchor not found once'
s = s.replace(b, b + '        p.tag = `${placed.uid}:${lp.key}`;\n')
open(p, 'w').write(s)
print('applied')
