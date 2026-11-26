#!/usr/bin/env python3
"""ENG-SPORE's planted faults: each new read removed in a COPY tree (argv[1], a git worktree of the head, node_modules linked; never the
frozen one), sporeBots.test run, the plant restored. CAUGHT = some test RED; MISSED = all green. python3 planted-faults.py <copy tree>"""
import subprocess, sys, pathlib
root = pathlib.Path(sys.argv[1])
PLANTS = [
  ('glowGo: a clocked light never waited for', 'tools/inspect/firsttimer.ts',
   "    if (l.clock) {\n      const at", "    if (l.clock) return true;\n    if (l.clock) {\n      const at"),
  ("glowRimsOf: clocked rims left out", 'tools/inspect/firsttimer.ts',
   "(r.light?.sleep && r.light.id !== undefined) || !!r.light?.clock);", "(r.light?.sleep && r.light.id !== undefined));"),
  ("RimWatch: a clocked light read as always lit", 'src/game/gen2/dark.ts',
   "  l.clock ? clockLitAt(l.clock, t) : l.sleep ? woke(l) : -Infinity;", "  l.sleep ? woke(l) : -Infinity;"),
  ("darkGaps: the clock rule removed", 'src/game/gen2/dark.ts',
   "      if (r.light.clock.len < need - 1e-6) out.push(", "      if (false) out.push("),
  ("glowZone: no puff light (a glowworm as before)", 'src/game/gen2/dark.ts',
   "      const puff = puffAt(puffs, land.x, land.y);", "      const puff = undefined as ReturnType<typeof puffAt>;"),
  ("glowGo: the window's end not read", 'tools/inspect/firsttimer.ts',
   " && clockLitLeft(l.clock, e.gameTime) >= rimAir(r) + CLOCK_SPARE;", ";"),
]
for name, f, old, new in PLANTS:
  p = root / f; src = p.read_text()
  if src.count(old) != 1: print(f'{name}: ANCHOR MISSING'); continue
  p.write_text(src.replace(old, new))
  try:
    r = subprocess.run(['npx', 'tsx', '--test', 'src/game/gen2/sporeBots.test.ts'], cwd=root, capture_output=True, text=True, timeout=900)
    reds = [l for l in r.stdout.splitlines() if l.startswith('not ok')]
    print(f"{name}: {'CAUGHT' if reds else 'MISSED'} {'; '.join(x[:90] for x in reds)}", flush=True)
  finally:
    p.write_text(src)
