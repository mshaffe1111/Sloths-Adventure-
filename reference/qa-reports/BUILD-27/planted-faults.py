#!/usr/bin/env python3
"""BUILD-27's planted faults (level.md rule 12): each plant goes into a scratch worktree of the head, w2Arc27.test.ts runs, and the plant must
turn it RED. Usage: python3 reference/qa-reports/BUILD-27/planted-faults.py <a scratch worktree of the head, node_modules linked>.
Every plant is restored before the next."""
import subprocess, sys, pathlib

tree = pathlib.Path(sys.argv[1])
TEST = 'src/game/gen2/worlds/w2Arc27.test.ts'
PLANTS = [
    ('a keeper line reworded', 'src/game/gen2/worlds/w2Arc27.ts', "turn: \"Now home's the other way! Go with the river!\"", "turn: \"Now home is the other way! Go with the river!\""),
    ('the hand build back in w2Stages', 'src/game/w2Stages.ts', "  '2-6': '2-6',\n", "  '2-6': '2-6',\n  '2-7': '2-6' as never,\n"),
    ('a home river flowing right (at him)', 'src/game/gen2/worlds/w2Arc27.ts', "versions: [{ id: 'ride', lay: crossing('ride') }]", "versions: [{ id: 'ride', lay: crossing('back27') }]"),
    ('Easy lays a deep home river', 'src/game/gen2/worlds/w2Arc27.ts', "easy: crossing('ride', 300, 360)", "easy: crossing('long', 300, 360)"),
    ('the weir dress dropped from the brief', 'src/game/gen2/worlds/w2Arc27.ts', ", columnDress: W2_WEIR,", ","),
    ('turn moved off the weir to the reed bank (too late)', 'src/game/gen2/worlds/w2Arc27.ts', "sockets: [tip('t-turn', 'a', 0.3, 'turn'), petal('pb', 'b', 0.5)],", "sockets: [petal('pb', 'b', 0.5)],"),
    ('the old mission line back', 'src/game/stagePlan.ts', "'Carry the post up the mill-race, then race the mail boat home.'", "'Take the long way round the river, past every door marked PLEASE BE PATIENT.'"),
]
bad = 0
for name, f, a, b in PLANTS:
    p = tree / f
    s = p.read_text()
    if a not in s:
        print(f'MISSING-ANCHOR {name}'); bad += 1; continue
    p.write_text(s.replace(a, b, 1))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', TEST], cwd=tree, capture_output=True, text=True, timeout=900)
        red = r.returncode != 0
    finally:
        p.write_text(s)
    print(f"{'CAUGHT' if red else 'MISSED'} {name}")
    bad += 0 if red else 1
sys.exit(1 if bad else 0)
