#!/usr/bin/env python3
"""ENG-W2's planted faults (level.md rule 12): each plants one fault in the World 2 kit's wiring, runs the named test of
src/game/gen2/worlds/w2.test.ts, and must see it go RED; the file is put back after each. Run from the repo root:
    python3 reference/qa-reports/ENG-W2/planted-faults.py
Prints CAUGHT or MISSED per fault; exits 1 on any MISSED."""
import subprocess, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[3]
TEST = 'src/game/gen2/worlds/w2.test.ts'
FAULTS = [
    ('the finish lays no rivers', 'src/game/gen2/worlds/w2.ts',
     "  if (!falls || st.rivers?.length) return st;", "  if (falls || !falls) return st;", 'the rivers'),
    ('a splash-back river keeps its pit bed', 'src/game/gen2/worlds/w2.ts',
     "  if (drop.size) st.platforms = st.platforms.filter((p) => !drop.has(p.id));", "", 'the rivers'),
    ("World 2's rows run World 1's finish", 'src/game/gen2/listed.ts',
     "w2: W2 };", "w2: W1 };", 'the look'),
    ('the kit names a piece waiting on a fix', 'src/game/gen2/worlds/w2.ts',
     "  rock: ['w2#boulder', 'w2#stump'],", "  rock: ['w2#boulder', 'w2#stump', 'w1-ledge-earth-b'],", 'the kit'),
    ("Dot's warning is not the keeper's line", 'src/game/gen2/worlds/w2.ts',
     "  water: 'This river\\'s deep. Stay on the logs!',", "", 'the first deep river'),
    ('2-1 has no stage-table row', 'src/game/gen2/worlds/stageTable.ts',
     "  '2-1': { kit: 'w2' },", "", 'the rows'),
    ('the hand-built 2-1 is still a plan', 'src/game/w2Stages.ts',
     "export const W2_STAGES: Record<string, W2Plan> = {", "export const W2_STAGES: Record<string, W2Plan> = {\n  '2-1': '2-3',", 'the rows'),
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
