#!/usr/bin/env python3
"""INT-10 planted faults: each plant must turn its test file RED (petalArcs.test.ts unless named); the file is restored after each.
Run from the repo root: python3 reference/qa-reports/INT-10/planted.py"""
import subprocess, sys
T = 'src/game/gen2/petalArcs.test.ts'
PLANTS = [
  ('liana gap counted as a hop', 'src/game/gen2/walkedSpan.ts',
   "    if (st.vines.some((v) => swinging(v) && v.x > p.x + p.width / 2 && v.x < q.x + q.width / 2)) continue;\n", ''),
  ('a walked step or drop counted as a required hop', 'src/game/gen2/walkedSpan.ts',
   "    if (q.x - end <= SEAM && p.y - q.y <= SEAM) continue;\n", ''),
  ('take-off always at the middle aim (falls short of a wide gap)', 'src/game/gen2/walkedSpan.ts',
   "Math.max(p.x, end - TAKEOFF_MID, q.x + 20 - r)", "Math.max(p.x, end - TAKEOFF_MID)"),
  ('the brief field ignored (no arcs on 1-6)', 'src/game/petals.ts',
   "?.brief?.petalArcs === true;", "?.brief?.petalArcs === 'never';"),
  ('1-6 brief without the arcs (bank rows alone read 0.46)', 'src/game/gen2/worlds/w1Arc16.ts',
   "  petalArcs: true,\n", ''),
  ('the door counts the arc petals', 'src/game/goals.ts', " && !x.arc && ", " && ",
   ['--test-name-pattern=a bonus', 'src/game/gen2/petalArcs.test.ts']),
  ('the meter builds its anchor from the list (no fixed layouts)', 'tools/difficulty/score.ts',
   "  const undo = id === ANCHOR.id ? plantSeedList(ANCHOR.id, ANCHOR_LIST) : null;", "  const undo = null as null | (() => void);",
   ['--test-name-pattern=fixed layouts', 'tools/difficulty/score.test.ts']),
  ('1-6 Easy as it was (LONG gaps on the snake on your vine and the creaky landing): Easy 0.63 x Normal', 'src/game/gen2/worlds/w1Arc16.ts',
   [("gap: easy ? 'short' : 'far', w: 260", "gap: easy ? 'long' : 'far', w: 260"), ("easy ? [{ gap: 'short', perch: 'sound' }]", "easy ? [{ gap: 'long', perch: 'sound' }]")], None,
   ['--test-name-pattern=difficulty meter', 'src/game/gen2/worlds/w1Arc16.test.ts']),
]
bad = 0
for name, f, a, b, *t in PLANTS:
    src = open(f).read()
    pairs = a if isinstance(a, list) else [(a, b)]
    if any(src.count(x) != 1 for x, _ in pairs):
        print(f'NOT PLANTED ({[src.count(x) for x, _ in pairs]} matches): {name}'); bad += 1; continue
    new = src
    for x, y in pairs: new = new.replace(x, y)
    open(f, 'w').write(new)
    try:
        r = subprocess.run(['npx', 'tsx', '--test', *(t[0] if t else [T])], capture_output=True, text=True, timeout=900)
        red = r.returncode != 0
    finally:
        open(f, 'w').write(src)
    print(('CAUGHT (RED)' if red else 'MISSED (green)') + f': {name}')
    bad += 0 if red else 1
r = subprocess.run(['npx', 'tsx', '--test', T], capture_output=True, text=True, timeout=900)
print('restored: ' + ('GREEN' if r.returncode == 0 else 'RED'))
sys.exit(1 if bad or r.returncode else 0)
