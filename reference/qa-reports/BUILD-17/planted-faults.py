#!/usr/bin/env python3
"""BUILD-17's planted faults (level.md rule 12): each fault is put into the code, the named tests are run, and the fault must turn them red
(CAUGHT). The file is restored after each, whatever happens. Run from the repo root: python3 reference/qa-reports/BUILD-17/planted-faults.py"""
import subprocess, sys
A17 = 'src/game/gen2/worlds/w1Arc17.ts'
T17 = 'src/game/gen2/worlds/w1Arc17.test.ts'
FAULTS = [
  # (name, file, old, new, test file, name pattern)
  ('hanging on a rope is not holding (hanging moss never hides him)', 'src/game/engine.ts', 'h.holding = !!(p.climbing || p.isVineSwinging || p.hanging);', 'h.holding = !!(p.climbing || p.isVineSwinging);', 'src/game/hangCover.test.ts', 'hanging still'),
  ('creeping along the rope counts as still', 'src/game/stillness.ts', ' || (!!p.hanging && Math.abs(p.vx) > set.speed)', '', 'src/game/hangCover.test.ts', 'hanging still'),
  ('the perch moved on the kit but not on the snag', 'src/game/sweepPose.ts', 'export const SNAG_PERCH = 56;', 'export const SNAG_PERCH = 90;', 'src/game/eaglePerch.test.ts', ''),
  ("a keeper line reworded ('hold still')", A17, "get in the green and keep still.", "get in the green and hold still.", T17, "lines are the story keeper's"),
  ('the old crouch mission line back', 'src/game/stagePlan.ts', "S('stealth', 'A Very Good Bush', 'An eagle is watching. Hide in the green like Dot did, and collect her petals.'),", "S('stealth', 'A Very Good Bush', 'Eagles are watching. Duck under the leaves the way Dot hid from the soldiers.'),", T17, "lines are the story keeper's"),
  ("the locked-exit line keyed '1:harvest'", 'src/game/stagePlan.ts', "  '1:stealth': 'We left some", "  '1:harvest': 'We left some", T17, "lines are the story keeper's"),
  ('the twist and finale lianas never marked mossy', A17, '      for (const v of vs) v.mossy = true;', '', T17, 'the mossy lianas'),
  ("Easy's first passes not free", A17, '  if (easy) for (const e of eagles()) e.kitFree = true;', '', T17, 'the eagle:'),
  ('the perch beat never perches its eagle', A17, "export const W17_PERCH = { section: 'w1-17-eagle-lands', at: 0.55 } as const;", "export const W17_PERCH = { section: 'w1-17-nowhere', at: 0.55 } as const;", T17, 'the eagle:'),
  ('bare bark 591 px wide', A17, "bank('w2', 'w1', easy ? 200 : 360), bank('w3', 'w2', 260)", "bank('w2', 'w1', easy ? 200 : 500), bank('w3', 'w2', 260)", T17, 'green close enough'),
  ("the creak line under 800 px before its beat's eye", A17, "bank('a', null, 360), bank('b', 'a', 340), rock('rb', 'b', 0.5), bank('w1', 'b', 360), limb('k', 'w1', !easy)", "bank('a', null, 360), bank('w1', 'a', 360), limb('k', 'w1', !easy)", T17, 'Dot teaches BEFORE'),
  ('Easy lays a creaky limb', A17, "hop('w2', 'k', 360), bank('w3', 'w2', 200), hop('z', 'w3', 320)],\n    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), watch('creak'", "hop('w2', 'k', 360), bank('w3', 'w2', 200), hop('z', 'w3', 320)].map((p) => (p.key === 'k' ? { ...p, creak: true } : p)),\n    sockets: [flag('a'), petals('pa', 'a', 0.5, 1), watch('creak'", T17, 'Easy is never harder'),
  ("Easy lays the twist's second liana", A17, "  const r2 = easy ? [] : liana('b2', 'b1', 'short');\n  const last = easy ? 'b1' : 'b2';\n  return {\n    pieces: [bank('a', null, 320), bank('w1', 'a', 340)", "  const r2 = liana('b2', 'b1', 'short');\n  const last = 'b2';\n  return {\n    pieces: [bank('a', null, 320), bank('w1', 'a', 340)", T17, 'the mossy lianas'),
]
bad = 0
only = sys.argv[1] if len(sys.argv) > 1 else ''
for name, f, old, new, tfile, pat in FAULTS:
  if only and only not in name: continue
  src = open(f).read()
  if src.count(old) != 1:
    print(f'NOT PLANTED ({src.count(old)} matches): {name}'); bad += 1; continue
  try:
    open(f, 'w').write(src.replace(old, new))
    args = ['npx', 'tsx', '--test'] + (['--test-name-pattern', pat] if pat else []) + [tfile]
    r = subprocess.run(args, capture_output=True, text=True, timeout=1200)
    caught = r.returncode != 0
  finally:
    open(f, 'w').write(src)
  print(('CAUGHT  ' if caught else 'MISSED  ') + name)
  bad += 0 if caught else 1
print('all CAUGHT' if not bad else f'{bad} NOT CAUGHT')
sys.exit(1 if bad else 0)
