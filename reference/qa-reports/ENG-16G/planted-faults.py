#!/usr/bin/env python3
"""ENG-16G planted faults (level.md rule 12): each fault is put in, the test that must catch it runs, the file is put back.
Run from the repo root: python3 reference/qa-reports/ENG-16G/planted-faults.py  (prints CAUGHT or MISSED per fault)."""
import subprocess, sys
FAULTS = [
  ('the old foot-to-foot measure', 'src/game/physics.ts',
   "  const dx = Math.abs(b.x - a.x);\n  let worst = Infinity;",
   "  return Math.abs(b.x - a.x) - swingReach(a) - swingReach(b) - SWING_CLEAR.body - SWING_CLEAR.margin;\n  const dx = Math.abs(b.x - a.x);\n  let worst = Infinity;",
   'src/game/swingClearance.test.ts', 'laid clear'),
  ('no lay rule (clearSwings taken out)', 'src/game/gen2/pipeline.ts',
   "    if (hang) clearSwings(tpl, all, sockets, out, p);", "",
   'src/game/swingClearance.test.ts', 'swing clearance lay'),
  ('the false liana laid swinging (amp 0 taken off)', 'src/game/gen2/worlds/w1Arc16.ts',
   "len: FALSE_LEN, amp: 0 }", "len: FALSE_LEN }",
   'src/game/swingClearance.test.ts', 'swing clearance lay'),
]
ok = True
for name, f, old, new, t, pat in FAULTS:
    src = open(f).read()
    assert src.count(old) == 1, f'{name}: anchor not found once in {f}'
    open(f, 'w').write(src.replace(old, new))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', f'--test-name-pattern={pat}', t], capture_output=True, text=True)
        caught = r.returncode != 0
    finally:
        open(f, 'w').write(src)
    print(('CAUGHT' if caught else 'MISSED') + f': {name} ({t} "{pat}")')
    ok &= caught
sys.exit(0 if ok else 1)
