#!/usr/bin/env python3
"""BUILD-24 planted faults (level.md rule 12): each plant breaks one rule 2-4's data holds, runs w2Arc24.test.ts, and must turn it RED; the
source is put back after each. Run from the repo root: python3 reference/qa-reports/BUILD-24/planted-faults.py"""
import subprocess, sys
T = 'src/game/gen2/worlds/w2Arc24.test.ts'
A = 'src/game/gen2/worlds/w2Arc24.ts'
PLANTS = [
    ('a keeper line edited', A, "  catch: 'Ride a log under the vine, then jump up!',", "  catch: 'Ride a log under the vine and jump up!',"),
    ('the mission card left as the old one', 'src/game/stagePlan.ts', "'Vines to logs, logs to vines. Cross the river to the jetty.'", "'Swing across the river on the hanging vines.'"),
    ('beat 6 splash-back on Normal (the first deep river moves to beat 8)', A, "  noLand24: { ...W2_RIVERS.twin, logs: 5 },", "  noLand24: { ...W2_RIVERS.twin, logs: 5, safe: true },"),
    ('beat 4 deep on Normal (deep before its teach is said, and before the warning)', A, "  twin24: { ...W2_RIVERS.twin, safe: true },", "  twin24: { ...W2_RIVERS.twin },"),
    ("an Easy row harder than Normal's (faster)", A, "  gap280Easy: { ...W2_RIVERS.deep, logs: 5, safe: true },", "  gap280Easy: { ...W2_RIVERS.deep, speed: 120, logs: 5, safe: true },"),
    ('the log-caught liana inside the chain distance (the log skipped)', A, "const FAR_W = 765;", "const FAR_W = 600;"),
    ('the drop teach said at the river (no time to read)', A, "sockets: [tip('t-drop', 'a', 0.1, 'drop')", "sockets: [tip('t-drop', 'b', 0.9, 'drop')"),
    ('Pokey says `view` before the great swing', A, "sockets: [tip('t-view', 'z', 0.05, 'view')]", "sockets: [tip('t-view', 'a', 0.5, 'view')]"),
    ('two beats swapped in the graph', A, "'river-24-arc': 'A Tr Pg Pr Xw R Pf Wr R Pb Cw R S E'", "'river-24-arc': 'A Tr Pg Xw R Pr Pf Wr R Pb Cw R S E'"),
    ("Pokey's journal page left as the old one", 'src/game/pokeyJournal.ts', "Dropped from the vines onto passing logs and jumped back up.", "Swung across the river on the vines while the crocodile watched."),
    ('the great swing no longer the longest liana', A, "lianaS('l', 'b', [500, 500], [500, 500])", "lianaS('l', 'b')"),
]
bad = 0
for name, path, old, new in PLANTS:
    src = open(path).read()
    if src.count(old) != 1:
        print(f'NOT PLANTED ({src.count(old)} matches): {name}'); bad += 1; continue
    open(path, 'w').write(src.replace(old, new))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', T], capture_output=True, text=True, timeout=1200)
    finally:
        open(path, 'w').write(src)
    red = r.returncode != 0
    fails = [l for l in r.stdout.splitlines() if l.startswith('not ok')]
    print(f"{'CAUGHT' if red else 'MISSED'}: {name} -> {'; '.join(fails)[:240]}", flush=True)
    bad += 0 if red else 1
sys.exit(1 if bad else 0)
