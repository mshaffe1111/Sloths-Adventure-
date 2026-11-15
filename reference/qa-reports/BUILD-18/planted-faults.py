#!/usr/bin/env python3
"""BUILD-18 planted faults (level.md rule 12): each fault is planted in a copy of the tree, w1Arc18.test.ts runs, and the named test must
go RED (CAUGHT); the tree is restored after each. Run from a worktree root (never the shared checkout):
    python3 reference/qa-reports/BUILD-18/planted-faults.py
`BASE` faults are applied first and kept (none on a head where every test is green; while runnerLip is owed, the stills-only K2 filter)."""
import os, re, subprocess, sys

ARC = 'src/game/gen2/worlds/w1Arc18.ts'
PLAN = 'src/game/stagePlan.ts'
TEST = 'src/game/gen2/worlds/w1Arc18.test.ts'
BASE = [(ARC, "      const no = runnerProblems(v, st.platforms);", "      const no = runnerProblems(v, st.platforms).filter((m) => !/px of run to its lip/.test(m));")] if os.environ.get('B18_BASE') == 'runner' else []
ONLY = os.environ.get('B18_ONLY')
FAULTS = [
    ('a keeper line changed', [(ARC, "nut: 'Little nuts roll at you. Hop them!'", "nut: 'Little nuts roll at you. Jump them!'")], "lines are the story keeper's"),
    ("stagePlan's mission is the old one", [(PLAN, "'Race the long branch before it gives way, and gather her petals.'", "'Race the long branch to the shrine.'")], "lines are the story keeper's"),
    ('the first two stretches swap places (their windows swapped)', [(ARC, "brick({ id: 'w1-18-at-pace', window: [0.26, 0.39],", "brick({ id: 'w1-18-at-pace', window: [0.1, 0.25],"), (ARC, "brick({ id: 'w1-18-first-run', window: [0.1, 0.25],", "brick({ id: 'w1-18-first-run', window: [0.26, 0.39],")], 'the arc beat for beat'),
    ('the fork line said too late (inside the last 800 px)', [(ARC, "tip('t-fork', 'c', 0.08, 'fork')", "tip('t-fork', 'z', 0.6, 'fork')")], 'every teach line is 800 px'),
    ("Easy's nuts and fruit cost a heart", [(ARC, "...(teach || easy ? { teach: true } : {})", "...(teach ? { teach: true } : {})")], 'one threat at a time'),
    ('a heart inside a stretch', [(ARC, "past: -200, up: 34", "past: 120, up: 34")], 'the hearts stand on the fork'),
    ('no still fork laid', [(ARC, "  const why = layStillFork(st as unknown as StillForkStage, fork, W1_STILL_FORK, 1);", "  const why: string[] = [];")], 'the still fork'),
    ('the palm crown not laid', [(ARC, "const d = h.kind === 'low' ? DRESS_18.palm : DRESS_18.trunk;", "const d = DRESS_18.trunk;")], "the keeper's look is laid"),
    ("Easy's creaky limb kept", [(ARC, "limb('k', 'b', !easy, easy ? [40, 46] : [100, 118])", "limb('k', 'b', true, easy ? [40, 46] : [100, 118])")], 'Easy is never harder than Normal'),
]


def edit(edits):
    keep = {}
    for f, a, b in edits:
        s = keep.get(f) or open(f).read()
        keep.setdefault(f, s)
        cur = open(f).read()
        if a not in cur:
            raise SystemExit(f'fault text not found in {f}: {a[:60]}')
        open(f, 'w').write(cur.replace(a, b, 1))
    return keep


def red(name):
    r = subprocess.run(['npx', 'tsx', '--test', TEST], capture_output=True, text=True, timeout=1500)
    nots = re.findall(r'^not ok \d+ - (.+)$', r.stdout, re.M)
    return any(name in n for n in nots), nots


base_keep = edit(BASE) if BASE else {}
try:
    ok, nots = red('@@none@@')
    print(f'BASE: {len(nots)} red before any fault' + (f': {nots}' if nots else ''))
    caught = 0
    for what, edits, test in FAULTS:
        if ONLY and ONLY not in what:
            continue
        keep = edit(edits)
        try:
            hit, nots = red(test)
        finally:
            for f, s in keep.items():
                cur_base = s
                open(f, 'w').write(cur_base)
        caught += hit
        print(('CAUGHT ' if hit else 'MISSED ') + what + f'  -> {test!r}' + ('' if hit else f' (red: {nots})'))
    print(f'{caught} of {len(FAULTS)} CAUGHT')
finally:
    for f, s in base_keep.items():
        open(f, 'w').write(s)
