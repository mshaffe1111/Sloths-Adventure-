#!/usr/bin/env python3
"""BUILD-19's planted faults (level.md rule 12): each fault is applied to a file, the named test file is run, the named test must go
RED, and the file is restored. Run from anywhere: paths are relative to the repo root (D83: no absolute paths)."""
import os, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
ARC = 'src/game/gen2/worlds/w1Arc19.ts'
TEST = 'src/game/gen2/worlds/w1Arc19.test.ts'
PIPE = 'src/game/gen2/pipeline.ts'
FAULTS = [
  ('the petal-goal rule off (topUpFoes tops 1-9 up again)', PIPE, "  if (!ask && !fightsForGoal(budget)) return [];", "  if (!ask && budget.archetype !== 'purge' && budget.archetype !== 'gauntlet') return [];", TEST, 'the designed eleven'),
  ('a keeper line changed', ARC, "freeze: \"Boa rearing up? Don't move, and it slides off!\"", "freeze: \"Boa rearing up? Hold still, and it slides off!\"", TEST, "word for word"),
  ("beat 2's step made level", ARC, "root('f', 'e', 360, DOWN)", "bank('f', 'e', 360)", TEST, 'beat 2:'),
  ("Normal's roost limb made sound", ARC, "limb('k', 'w1', !easy)", "limb('k', 'w1', false)", TEST, 'beat 7:'),
  ('the freeze line moved beside its boa', ARC, "tip('t-freeze', 'm', 0.2, 'freeze')", "tip('t-freeze', 'e', 0.9, 'freeze')", TEST, '800 px or more'),
  ('the reads swapped', ARC, "Cg&:&boa-trapped! Ch&:&boa-roost!", "Ch&:&boa-roost! Cg&:&boa-trapped!", TEST, 'beat for beat'),
]
caught = 0
for name, f, old, new, test, title in FAULTS:
  p = os.path.join(ROOT, f)
  src = open(p).read()
  assert old in src, f'{name}: the line to plant on is gone ({f})'
  open(p, 'w').write(src.replace(old, new, 1))
  try:
    r = subprocess.run(['npx', 'tsx', '--test', test], cwd=ROOT, capture_output=True, text=True)
    red = any(l.startswith('not ok') and title in l for l in r.stdout.splitlines())
  finally:
    open(p, 'w').write(src)
  caught += red
  print(('CAUGHT ' if red else 'MISSED ') + name)
print(f'{caught}/{len(FAULTS)} caught')
sys.exit(0 if caught == len(FAULTS) else 1)
