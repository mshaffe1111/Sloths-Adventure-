#!/usr/bin/env python3
"""BUILD-23 / BUILD-23b planted faults (level.md rule 12): each plant breaks one rule 2-3's data or its engine pieces hold, runs the test
file that holds it, and must turn it RED; the source is put back after each. Run from the repo root:
python3 reference/qa-reports/BUILD-23/planted-faults.py"""
import subprocess, sys
ARC = 'src/game/gen2/worlds/w2Arc23.test.ts'
CAGE = 'src/game/gen2/designedCage.test.ts'
LOOK = 'src/game/followArt.test.ts'
SHEETS = 'src/game/stageSheets.test.ts'
FINDS = 'src/game/finds.test.ts'
FACES = 'src/game/followFaces.test.ts'
A = 'src/game/gen2/worlds/w2Arc23.ts'
PLANTS = [
    # w2Arc23.test.ts: the keeper's lines, the row, the cages, the teach distances, the line's rules, the post
    ('a keeper line edited (lines verbatim)', ARC, A, "  post: 'Everybody wait here. This part is sloth work.',", "  post: 'Everybody wait here. This is sloth work.',"),
    ('two beats swapped in the arc (the row beat for beat)', ARC, A, "'reeds-23-arc': 'A Tg Th R Pw Xh R Pr Wf R Ch R S E'", "'reeds-23-arc': 'A Th Tg R Pw Xh R Pr Wf R Ch R S E'"),
    ("the post's little one a duckling (the five cages' kinds)", ARC, A, "cage('cage4', 'b', 260 / 360, 'otter', POST_H - 40)", "cage('cage4', 'b', 260 / 360, 'duck', POST_H - 40)"),
    ("`look` said over the reeds (no time to read before them)", ARC, A, "tip('t-look', 'a', 0.6, 'look')", "tip('t-look', 'd', 0.9, 'look')"),
    ("Easy's three clumps at Normal's 300 px (Easy never harder)", ARC, A, "const W: Reed = easy ? 340 : 300, G = 350;", "const W: Reed = easy ? 300 : 300, G = 350;"),
    ("beat 7's second heron not laid on Normal (the lag)", ARC, A, "    for (const z of two) zones.push(", "    for (const z of two.slice(0, 0)) zones.push("),
    ("the first heron's first look takes him (not free)", ARC, A, "lesson: ['teach-heron'], free: 'lesson' },", "lesson: ['teach-heron'] },"),
    ("the w2-new sheet not preloaded on 2-3", ARC, 'src/game/stageSheets.ts', "  '2-3': ['w2-new'],", "  '2-3': [],"),
    ('the mooring post not laid', ARC, A, "  layW2New23(st);\n", "\n"),
    ("the post's kapok trunk drawn under it too (rope not set)", ARC, A, "      v.rope = true;\n", "\n"),
    ("the find back on the rest's first bank (inside its boulder)", FINDS, A, "{ id: 'find', role: 'findSpot', on: 'b', t: 0.5 }", "{ id: 'find', role: 'findSpot', on: 'a', t: 0.5 }"),
    ("a HUD face that ignores movement (lit while a moving one is seen)", FACES, 'src/game/followFaces.ts', "lineInCover(covers, f) && !f.moved ? 'hid' : 'open'", "lineInCover(covers, f) ? 'hid' : 'open'"),
    # the engine pieces
    ('ENGINE PIECE (designed cage socket): the branch off', CAGE, 'src/game/gen2/pipeline.ts', "} else if (s.role === 'objective' && s.allow?.includes('cage')) {", "} else if (s.role === 'objective' && s.allow?.includes('cage') && false) {"),
    ("ENGINE PIECE (heron look): the look drawn only while its wash is in view", LOOK, 'src/game/followArt.ts', "  return wash || bird;", "  return wash;"),
    ("sheetWarm asks for the eagle on a follow stage", SHEETS, 'src/game/sheetWarm.ts', "if (st.proto?.watch?.length && !st.proto.follow) out.add('eagle');", "if (st.proto?.watch?.length) out.add('eagle');"),
    ("sheetWarm asks for World 1's bush sheet for reed clumps", SHEETS, 'src/game/sheetWarm.ts', "!!st.proto?.bushes?.some((b) => b.kind !== 'reeds')", "!!st.proto?.bushes?.length"),
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
