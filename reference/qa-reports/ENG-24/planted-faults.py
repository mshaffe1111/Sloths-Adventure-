#!/usr/bin/env python3
"""ENG-24 planted faults (level.md rule 12): each plant takes one new rule out of the source, runs its test, and must turn it RED; the
source is put back after each. Run from the repo root: python3 reference/qa-reports/ENG-24/planted-faults.py
The bot skills' plants live inside tools/inspect/lianaRide.test.ts itself (each skill switched off: SKILLS.dropOnLog, vineFromLog)."""
import subprocess, sys
PLANTS = [
    ('the drop judge off (lianaRiverFaults says nothing)', 'src/game/gen2/riverLay.ts',
     "    if (over.length) out.push(...lianaRiverFaults(r, logs, over, near, difficulty).map((f) => `${at}: ${f}`));",
     "    void lianaRiverFaults;", 'src/game/gen2/lianaRiver.test.ts'),
    ('the hop rule kept under a liana (riverFaults)', 'src/game/gen2/riverLay.ts',
     "if (gap > hopLimit(d.dir) && !over.length)", "if (gap > hopLimit(d.dir))", 'src/game/gen2/lianaRiver.test.ts'),
    ('the hop rule kept under a liana (levelCheck)', 'src/game/levelCheck.ts',
     "if (gap > limit && !lianasOver(stage.vines ?? [], r).length)", "if (gap > limit)", 'src/game/gen2/lianaRiver.test.ts'),
    ('the engine turn off in the judge (its waits drift from the engine flight)', 'src/game/gen2/riverLay.ts',
     "          return c.y > top + DRIFT_CATCH.drop;\n        }, true);", "          return c.y > top + DRIFT_CATCH.drop;\n        }, false);",
     'src/game/gen2/lianaRiver.test.ts'),
    ('a river after a liana laid from the liana, not its bank', 'src/game/gen2/pipeline.ts',
     "      while (a.hang?.kind === 'liana') a = ref(a.hang.from!);\n      riverFrom = a.key;", "      riverFrom = a.key;",
     'src/game/gen2/lianaRiver.test.ts'),
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
    print(f"{'CAUGHT' if red else 'MISSED'}: {name} -> {'; '.join(fails)[:300]}")
    bad += 0 if red else 1
sys.exit(1 if bad else 0)
