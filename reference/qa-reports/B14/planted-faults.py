#!/usr/bin/env python3
"""B14's planted faults (level.md rule 12): each fault is put into the code, the named tests are run, and the fault must turn them red
(CAUGHT). The file is restored after each, whatever happens. Run from the repo root: python3 reference/qa-reports/B14/planted-faults.py"""
import subprocess, sys
FAULTS = [
  # (name, file, old, new, test file, name pattern)
  ('pods hit a vine beside his own', 'src/game/podfall.ts', 'hands: 26,', 'hands: 90,', 'src/game/feelPairRoom.test.ts', 'pods: on a podded'),
  ('two hands count as one line', 'src/game/fieldPlay.ts', 'h.hands.b ? [h.hands.a.x, h.hands.b.x] : [h.hands.a.x]', '[p.x]', 'src/game/feelPairRoom.test.ts', 'pods: on a podded'),
  ('a knock lets him grab the next vine on the way down', 'src/game/engine.ts', "if (v.off || this.knocked > 0) continue;", 'if (v.off) continue;', 'src/game/feelPairRoom.test.ts', 'pods: on a podded'),
  ('a shut gate is footing', 'src/game/fieldPlay.ts', 'if (b) b.broken = gateLeft(g, clusters) > 0;', 'if (b) b.broken = false;', 'src/game/feelPairRoom.test.ts', 'a gate: shut'),
  ('the climb vaults onto a shut bough', 'src/game/engine.ts', '&& !this.field?.blocksTop(nearTreeVine)) {', ') {', 'src/game/feelPairRoom.test.ts', 'a gate: shut'),
  ('a gate opens on the first cluster', 'src/game/fieldPlay.ts', 'if (left === 0) {', 'if (left <= 1) {', 'src/game/feelPairRoom.test.ts', 'gate of two'),
  ('gateShut reads a gate of two open after one', 'src/game/vineField.ts', 'gateLeft(g, clusters) > 0;\n', 'gateLeft(g, clusters) > g.clusters.length - 1;\n', 'src/game/feelPairRoom.test.ts', 'gate of two'),
  ('a freed cluster falls through the floor', 'src/game/fieldPlay.ts', 'if (v) c.land = clusterLand(v, c.y, this.platforms, this.gateIds);', '', 'src/game/feelPairRoom.test.ts', 'gate of two'),
  ('the tell is shortened to 0.6 s', 'src/game/feelPairStage.ts', 'export const POD_TELL = 1.0;', 'export const POD_TELL = 0.6;', 'src/game/feelPairRoom.test.ts', 'the room:'),
  ('the engine never builds the stage beats', 'src/game/engine.ts', 'this.clock = beatClock(st.clocks ?? [], this.easy, this.clock.time());', '', 'src/game/feelPairRoom.test.ts', 'pods: on a podded'),
  ('beatFaults forgets the warnings-apart rule', 'src/game/beat.ts', 'out.push(`${a.id} and ${b.id}: their warnings start within ${rule.apart} s`);', '', 'src/game/podfall.test.ts', 'beatFaults'),
  ('Easy does not stretch a lane\'s shift', 'src/game/clock.ts', 'const offset = b.offset + shift * b.stretch;', 'const offset = b.offset + shift;', 'src/game/podfall.test.ts', 'the beat:'),
  ('podFaults forgets the fall fits its on', 'src/game/podfall.ts', "out.push(`pod ${p.id}: its beat's 'on' (${on.toFixed(2)} s) is too short to fall its column and burst`);", '', 'src/game/podfall.test.ts', 'podFaults'),
  ('gateFaults forgets a vine that misses the bough', 'src/game/vineField.ts', "out.push(`cluster ${id}: its vine ${v.id} does not reach gate ${g.id}'s bough`);", '', 'src/game/podfall.test.ts', 'a gate:'),
]
bad = 0
for name, f, old, new, tfile, pat in FAULTS:
  src = open(f).read()
  if src.count(old) != 1:
    print(f'NOT PLANTED ({src.count(old)} matches): {name}'); bad += 1; continue
  try:
    open(f, 'w').write(src.replace(old, new))
    r = subprocess.run(['npx', 'tsx', '--test', '--test-name-pattern', pat, tfile], capture_output=True, text=True, timeout=900)
    caught = r.returncode != 0
  finally:
    open(f, 'w').write(src)
  print(('CAUGHT  ' if caught else 'MISSED  ') + name)
  bad += 0 if caught else 1
print('all CAUGHT' if not bad else f'{bad} NOT CAUGHT')
sys.exit(1 if bad else 0)
