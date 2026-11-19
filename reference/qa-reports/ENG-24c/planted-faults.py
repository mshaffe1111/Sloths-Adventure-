#!/usr/bin/env python3
"""ENG-24c planted faults (level.md rule 12): each plant takes one new rule out of the source, runs its test, and must turn it RED; the
source is put back after each. Run from the repo root: python3 reference/qa-reports/ENG-24c/planted-faults.py"""
import subprocess, sys
CUE_T = 'src/game/letGoCue.test.ts'
RAFT_T = 'src/game/riverRaft.test.ts'
PLANTS = [
    ("the drawn glow back to World 1's (the sweet spot, eased), the cue unread", 'src/game/engine.ts',
     "          this.sweetGlow = !cue && this.cueOverRiver ? 0 : this.sweetGlow + ((cue ? 1 : 0) - this.sweetGlow) * Math.min(1, dt * 14);",
     "          this.sweetGlow += ((sweet ? 1 : 0) - this.sweetGlow) * Math.min(1, dt * 14);", CUE_T),
    ("the river glow fades out over the water (no snap)", 'src/game/engine.ts',
     "          this.sweetGlow = !cue && this.cueOverRiver ? 0 : this.sweetGlow + ((cue ? 1 : 0) - this.sweetGlow) * Math.min(1, dt * 14);",
     "          this.sweetGlow += ((cue ? 1 : 0) - this.sweetGlow) * Math.min(1, dt * 14);", CUE_T),
    ("the judge's bare read (no press climb, no margin, one clock)", 'src/game/letGoCue.ts',
     "export const CUE = { climbFrames: 1, inset: 8, clocks: [0, -DT] } as const;",
     "export const CUE = { climbFrames: 0, inset: 0, clocks: [0] } as const;", CUE_T),
    ("facing back read without the mirror (the forward flight)", 'src/game/letGoCue.ts',
     "  const A: SwingVine = dir === 1 ? v : { ...v, x: -v.x, swingPhase: (v.swingPhase ?? 0) + 0.5 };",
     "  const A: SwingVine = v;", CUE_T),
    ("a table flown on every frame his grip moves", 'src/game/engine.ts',
     "    if (under.flowT || gripMoved) return false;", "    if (under.flowT) return false;", CUE_T),
    ("the river glow on 1-6 too (every liana read as over a river)", 'src/game/engine.ts',
     "    if (!under) return sweet;", "    if (!under) return false;", CUE_T),
    ("layRiver drops the row's look", 'src/game/gen2/riverLay.ts',
     ", ...(row.look ? { look: row.look } : {}) };", " };", RAFT_T),
    ("the painted pass draws a raft as a log", 'src/game/riverArt.ts',
     "  if (p.drift?.look === 'raft') {", "  if (p.drift?.look === ('none' as string)) {", RAFT_T),
    ("the drawn layer draws a raft as a log", 'src/game/platformPlan.ts',
     "  if (p.type === 'drift') return p.drift?.look === 'raft' ? 'raft' : 'drift';", "  if (p.type === 'drift') return 'drift';", RAFT_T),
    ("the drawn layer turns a raft into a barge or a pad", 'src/game/platformPlan.ts',
     "  rotate('raft', RAFT_LOOKS, 31, (p) => p.type === 'drift');", "  rotate('raft', RAFT_LOOKS, 31);", RAFT_T),
    ("a raft stage never asks for the kit's sheet", 'src/game/gen2/game.ts',
     "  return (['normal', 'easy'] as const).some((d) => {\n    const M = kit(d).manifest;",
     "  return false && (['normal', 'easy'] as const).some((d) => {\n    const M = kit(d).manifest;", RAFT_T),
]
bad = 0
for name, path, old, new, test in PLANTS:
    src = open(path).read()
    if src.count(old) != 1:
        print(f'NOT PLANTED ({src.count(old)} matches): {name}'); bad += 1; continue
    open(path, 'w').write(src.replace(old, new))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', test], capture_output=True, text=True, timeout=900)
    finally:
        open(path, 'w').write(src)
    red = r.returncode != 0
    fails = [l for l in r.stdout.splitlines() if l.startswith('not ok')]
    print(f"{'CAUGHT' if red else 'MISSED'}: {name} -> {'; '.join(fails)[:240]}", flush=True)
    bad += 0 if red else 1
sys.exit(1 if bad else 0)
