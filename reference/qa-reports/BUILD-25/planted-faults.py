#!/usr/bin/env python3
"""BUILD-25 / BUILD-25b planted faults (level.md rule 12): each plant breaks one rule 2-5's data or its engine pieces hold, runs the test
file that holds it, and must turn it RED; the source is put back after each. Run from the repo root (needs 2-5's seed list in the tree):
python3 reference/qa-reports/BUILD-25/planted-faults.py"""
import subprocess, sys
ARC = 'src/game/gen2/worlds/w2Arc25.test.ts'
SNAP = 'src/game/gen2/snapRow.test.ts'
GOAL = 'src/game/goalsEasy.test.ts'
COUNT = 'src/game/snapperCount.test.ts'
A = 'src/game/gen2/worlds/w2Arc25.ts'
R = 'src/game/gen2/rideLay.ts'
PLANTS = [
    ('a keeper line edited', ARC, A, "  count: 'The stones bite on four! One, two, three, off!',", "  count: 'The stones bite on four! One, two, three, go!',"),
    ('the mission card left as the old one', ARC, 'src/game/stagePlan.ts', "S('purge', 'River Snappers', 'The stones bite on four. Hop across and send the snappers home.')", "S('purge', 'River Snappers', 'Chase the snappers off the bank.')"),
    ("the teaching stone's bite costs a heart (no freeBite, R-165.337)", ARC, A, "clock: 'river', safe: true, freeBite: true },", "clock: 'river', safe: true },"),
    ('beat 4 deep on Normal (the first awake snapper is its new thing)', ARC, A, "  pair25: { by: 'snap', pads: ['snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river', safe: true },", "  pair25: { by: 'snap', pads: ['snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river' },"),
    ("an Easy pond that bites for real (beat 3's twin not splash-back)", ARC, A, "  step25e: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river', safe: true },", "  step25e: { by: 'snap', pads: ['snap', 'snap', 'snap'], gap: 30, snap: { count: 0.75 }, clock: 'river' },"),
    ("the quickening on the river's bar (one name, two bars: the build throws)", ARC, A, "snap: { count: 0.6 }, clock: 'quick' },", "snap: { count: 0.6 }, clock: 'river' },"),
    ('the first snapper awake', ARC, A, "snapper('e', 'c', 0.5, 'snapper-asleep')", "snapper('e', 'c', 0.5, 'snapper')"),
    ('the first snapper awake (the count test)', COUNT, A, "snapper('e', 'c', 0.5, 'snapper-asleep')", "snapper('e', 'c', 0.5, 'snapper')"),
    ("the design's count dropped (the goal a share of what is laid)", ARC, 'src/game/stagePlan.ts', "'The stones bite on four. Hop across and send the snappers home.'), count: 8 },", "'The stones bite on four. Hop across and send the snappers home.') },"),
    ("withGoals ignores countSet (R-165.336: Play asked 7 / Easy 6)", ARC, 'src/game/goals.ts', "  if (st.config.countSet) {", "  if (false && st.config.countSet) {"),
    ("withGoals ignores countSet (the generic goal test)", GOAL, 'src/game/goals.ts', "  if (st.config.countSet) {", "  if (false && st.config.countSet) {"),
    ('the follow teach said at the wave (no time to read)', ARC, A, "sockets: [tip('t-follow', 'a', 0.1, 'follow')", "sockets: [tip('t-follow', 'b', 0.9, 'follow')"),
    ('`quiet` said before the Big Snap', ARC, A, "sockets: [tip('t-quiet', 'z', 0.1, 'quiet')]", "sockets: [tip('t-quiet', 'a', 0.1, 'quiet')]"),
    ('two beats swapped in the graph', ARC, A, "'A Tf Pg&:&snapper-asleep*1 Pf Xw&:&snapper*1 R", "'A Pg&:&snapper-asleep*1 Tf Pf Xw&:&snapper*1 R"),
    ("the sleeper's hop removed (the quiet line: teach stone -> sleeper 4.5-7.0 s)", ARC, A, "pieces: [bank('a', null, 480), rock('ra', 'a', 0.6), bank('b', 'a', 400), ...snapperGround('c', 'b')", "pieces: [bank('a', null, 480), bank('b', 'a', 400), ...snapperGround('c', 'b')"),
    ("snapFaults never compares Easy (no setting reads it)", SNAP, R, "if (difficulty !== 'normal' && we < wn - 1e-6)", "if (difficulty === undefined && we < wn - 1e-6)"),
    ("snapFaults compares Easy on a Normal build too", SNAP, R, "if (difficulty !== 'normal' && we < wn - 1e-6)", "if (we < wn - 1e-6)"),
    ('PadRow.clock ignored (each row its own bar)', SNAP, R, "const snapId = `snap-${row.clock ?? id}`;", "const snapId = `snap-${id}`;"),
    ('two bars under one name let through', SNAP, 'src/game/gen2/pipeline.ts', "if (had && JSON.stringify(had) !== JSON.stringify(c)) throw", "if (false && had && JSON.stringify(had) !== JSON.stringify(c)) throw"),
]
bad = 0
for name, test, path, old, new in PLANTS:
    src = open(path).read()
    if src.count(old) != 1:
        print(f'NOT PLANTED ({src.count(old)} matches): {name}'); bad += 1; continue
    open(path, 'w').write(src.replace(old, new))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', test], capture_output=True, text=True, timeout=1500)
    finally:
        open(path, 'w').write(src)
    red = r.returncode != 0
    fails = [l for l in r.stdout.splitlines() if l.startswith('not ok')]
    print(f"{'CAUGHT' if red else 'MISSED'}: {name} -> {'; '.join(fails)[:240]}", flush=True)
    bad += 0 if red else 1
sys.exit(1 if bad else 0)
