#!/usr/bin/env python3
"""ENG-PETAL planted faults (the ENG-16H script's form): each plant puts one rule of the walked-path model back the way it was, runs the
test that holds the rule and expects it RED (by its test name), then restores the file and checks the test GREEN.
Run from the repo root: python3 reference/qa-reports/ENG-PETAL/planted.py [name ...]"""
import subprocess, sys, pathlib, re

T = 'src/game/gen2/walkedPath.test.ts'
W = 'src/game/gen2/walkedSpan.ts'
PLANTS = [
    # (A, B) the plain jumps: arrival by a full jump off the piece behind, take-off at the testers' far aim
    ('plain-jumps', W, [('  for (const o of behind) {', '  for (const o of [] as Platform[]) {'),
                        ('  for (const { q, r } of lands) hi =', '  for (const { q, r } of [] as typeof lands) hi =')], '^[AB]:'),
    # (C) a miss piece is no way on or off and never next
    ('away', W, [(' && !st.away?.(q);\n', ';\n'), (" && r.type !== 'bouncy' && !st.away?.(r))", " && r.type !== 'bouncy')"),
                 ('    if (st.away?.(q) || (q !== p && mine && !mine(q))) return undefined;\n', '    if (q !== p && mine && !mine(q)) return undefined;\n')], '^C:'),
    # (D) the walked path on the BUILT stage
    ('walk-pass', 'src/game/petalPass.ts', [('  if ((stage as { gen2?: unknown }).gen2) o.walked = walkPetals(stage);\n', '')], '^D:'),
    # (E-class) the fill's ledge trails only inside walked spans
    ('fill-span', 'src/game/petals.ts', [('      if (w.hi - w.lo < WALKED_MIN || ws.away!(p)) continue;\n      lo = Math.max(lo, w.lo);\n      hi = Math.min(hi, w.hi - step * (len - 1));\n', '')], '^D:'),
    # (R-165.263) the brief: no fill (its jump tier is the arcs over gaps the finished stage gained: jumpTrails' routeGaps finds none on a gen2 stage)
    ('brief-fill', 'src/game/petalPass.ts', [(' && !petalsLow(stage)) {', ') {')], '^E:'),
]

def run(pattern):
    r = subprocess.run(['npx', 'tsx', '--test', f'--test-name-pattern={pattern}', T], capture_output=True, text=True, timeout=1800)
    out = r.stdout + r.stderr
    fails = [l for l in out.splitlines() if l.startswith('# fail')]
    first = next((l.strip() for l in out.splitlines() if re.search(r"^\s+(\+|0:)\s+'|AssertionError \[|message: '", l)), '')
    return r.returncode == 0, (fails[0] if fails else '?'), first[:220]

only = sys.argv[1:] or [p[0] for p in PLANTS]
ok = True
for name, f, pairs, pattern in PLANTS:
    if name not in only:
        continue
    p = pathlib.Path(f); src = p.read_text()
    planted = src
    for o, n in pairs:
        assert planted.count(o) == 1, f'{name}: the line to plant is not in {f} exactly once: {o!r}'
        planted = planted.replace(o, n)
    p.write_text(planted)
    try:
        green, fails, first = run(pattern)
    finally:
        p.write_text(src)
    green_after, _, _ = run(pattern)
    caught = not green
    ok = ok and caught and green_after
    print(f"{name}: planted {'RED (CAUGHT)' if caught else 'GREEN (MISSED)'} {fails} | {first} | restored {'GREEN' if green_after else 'RED'}", flush=True)
print('ALL CAUGHT' if ok else 'NOT ALL CAUGHT')
sys.exit(0 if ok else 1)
