#!/usr/bin/env python3
"""ENG-W3a's planted faults (level.md rule 12): each plants one fault in World 3's kit, the draft state or gen2's down flow, runs the
named test of src/game/gen2/worlds/w3.test.ts, and must see it go RED; the file is put back after each. Run from the repo root, on a
tree no run is reading:
    python3 reference/qa-reports/ENG-W3/planted-faults.py
Prints CAUGHT or MISSED per fault; exits 1 on any MISSED."""
import subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
TEST = 'src/game/gen2/worlds/w3.test.ts'
FAULTS = [
    ("the packet's plant: the draft travels back to 'right'", 'src/game/gen2/worlds/stageTable.ts',
     "  '3-1': { kit: 'w3', travel: 'down' },", "  '3-1': { kit: 'w3', travel: 'right' },", 'the way DOWN'),
    ('readying lifts no hand-built shadow (the game builds the old 3-1)', 'tools/engine/draftReady.ts',
     "  delete HAND_STAGES[id];", "", 'the way DOWN'),
    ('the draft is also a listed row', 'src/game/gen2/worlds/stageTable.ts',
     "  '1-1': { kit: 'w1',", "  '3-1': { kit: 'w3' },\n  '1-1': { kit: 'w1',", 'the draft row'),
    ("the floor's walk to the shrine is off the route measure (routeAt, down)", 'src/game/gen2/tower.ts',
     "  if (route.flow === 'down' && last && y > Math.max(last.entry.y, last.exit.y) + 1) return", "  if (route.flow === 'never' && last && y > Math.max(last.entry.y, last.exit.y) + 1) return", 'the last flag'),
    ('the floor is no flag spot on a way down', 'src/game/gen2/pipeline.ts',
     "    if (laid.tower?.flow === 'down') {", "    if (laid.tower?.flow === ('never' as string)) {", 'the last flag'),
    ('a down catch searches only the band (blind drops come back)', 'src/game/gen2/tower.ts',
     "      if (flow === 'down') for (let y = Math.min(top - 20, e.p.y + TOWER.clear - HEAD); y >= e.p.y + HEAD; y -= 20) ys.push(y);", "", 'every roll'),
    ('the kit names art the game does not draw', 'src/game/gen2/worlds/w3.ts',
     "  shelf: ['w3#branch'],", "  shelf: ['w3#branch', 'w3-new#shelf-long'],", 'the kit'),
    ("World 3's rows run World 1's finish", 'src/game/gen2/listed.ts',
     "w3: W3 };", "w3: W1 };", 'every piece of the draft'),
    ('a brick of the way down lays an animal', 'src/game/gen2/worlds/w3.ts',
     "  sockets: [{ id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 },", "  sockets: [{ id: 'foe', role: 'enemy', on: 'c', t: 0.5 }, { id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 },", 'the cast rows'),
]

missed = 0
for name, f, old, new, pattern in FAULTS:
    p = ROOT / f
    src = p.read_text()
    if old not in src:
        print(f'MISSED  {name}: the line to plant is not in {f} (the fault list is stale)')
        missed += 1
        continue
    try:
        p.write_text(src.replace(old, new, 1))
        r = subprocess.run(['npx', 'tsx', '--test', '--test-name-pattern', pattern, TEST], cwd=ROOT, capture_output=True, text=True)
        red = r.returncode != 0 and '# fail 0' not in r.stdout
        print(f"{'CAUGHT' if red else 'MISSED'}  {name} ({pattern})")
        missed += 0 if red else 1
    finally:
        p.write_text(src)
sys.exit(1 if missed else 0)
