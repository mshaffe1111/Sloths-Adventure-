#!/usr/bin/env python3
"""ENG-16I planted faults: each plant puts one rule back the way it was, runs the test that holds the rule, and expects it RED; then
restores the file and checks the test GREEN. Run from the repo root: python3 reference/qa-reports/ENG-16I/planted-faults.py [name]"""
import subprocess, sys, pathlib

PLANTS = [
    ('stair-top-liana', 'tools/inspect/firsttimer.ts', '      if (ahead) goal = ahead;', '      if (ahead && false) goal = ahead;',
     'tools/inspect/pitClimb.test.ts'),
]

def run(test):
    r = subprocess.run(['npx', 'tsx', '--test', test], capture_output=True, text=True, timeout=1800)
    out = r.stdout + r.stderr
    fails = [l for l in out.splitlines() if l.startswith('# fail')]
    return r.returncode == 0, (fails[0] if fails else '?')

only = sys.argv[1:] or [p[0] for p in PLANTS]
ok = True
for name, f, old, new, test in PLANTS:
    if name not in only:
        continue
    p = pathlib.Path(f); src = p.read_text()
    pairs = old if isinstance(old, list) else [(old, new)]
    planted = src
    for o, n in pairs:
        assert planted.count(o) == 1, f'{name}: the line to plant is not in {f} exactly once'
        planted = planted.replace(o, n)
    p.write_text(planted)
    try:
        green, fails = run(test)
    finally:
        p.write_text(src)
    caught = not green
    green_after, _ = run(test)
    print(f'{name}: planted -> {"CAUGHT (RED, " + fails + ")" if caught else "MISSED (still green)"}; restored -> {"GREEN" if green_after else "RED"}')
    ok = ok and caught and green_after
sys.exit(0 if ok else 1)
