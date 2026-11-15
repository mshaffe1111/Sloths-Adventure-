#!/usr/bin/env python3
"""INT-10 planted faults: each plant must turn src/game/gen2/petalArcs.test.ts RED; the file is restored after each.
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
]
bad = 0
for name, f, a, b in PLANTS:
    src = open(f).read()
    if src.count(a) != 1:
        print(f'NOT PLANTED ({src.count(a)} matches): {name}'); bad += 1; continue
    open(f, 'w').write(src.replace(a, b))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', T], capture_output=True, text=True, timeout=900)
        red = r.returncode != 0
    finally:
        open(f, 'w').write(src)
    print(('CAUGHT (RED)' if red else 'MISSED (green)') + f': {name}')
    bad += 0 if red else 1
r = subprocess.run(['npx', 'tsx', '--test', T], capture_output=True, text=True, timeout=900)
print('restored: ' + ('GREEN' if r.returncode == 0 else 'RED'))
sys.exit(1 if bad or r.returncode else 0)
