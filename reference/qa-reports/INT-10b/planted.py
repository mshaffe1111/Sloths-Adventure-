#!/usr/bin/env python3
"""INT-10b planted faults: each plant must turn its test RED; the file is restored after each. Run from the root of a worktree of its
own (never the tree bots or lists are running in): python3 reference/qa-reports/INT-10b/planted.py"""
import subprocess, sys
P = 'src/game/gen2/pipeline.ts'
TOY = ['--test-name-pattern=ONE piece', 'src/game/gen2/pitJoin.test.ts']
SLOT = ['--test-name-pattern=any slot', 'src/game/gen2/gen2Pits.test.ts']
OLD_JOIN = """      if (Math.abs(l.y - r.y) < 1) {
        l.width = R(r.x + r.width - l.x);
        floors.delete(r);
        platforms.splice(platforms.indexOf(r), 1);
        gone.push(r);
        continue;
      }"""
PLANTS = [
  # the old join (a fill piece of its own between the two floors): the 1-6 creaky landing's stair flush with its end again
  ('the join laid as its own piece (the old join), the toy', P, OLD_JOIN,
   """      if (Math.abs(l.y - r.y) < 1) {
        const fill = { id: -1, x: j.x, y: j.y, width: j.w, height: bankH, type: 'solid', style: 'moss_stone' } as Platform;
        platforms.push(fill);
        floors.add(fill);
        continue;
      }""", TOY),
  ('the join laid as its own piece (the old join), 1-6 built (gen2Pits.test:61)', P, OLD_JOIN,
   """      if (Math.abs(l.y - r.y) < 1) {
        const fill = { id: -1, x: j.x, y: j.y, width: j.w, height: bankH, type: 'solid', style: 'moss_stone' } as Platform;
        platforms.push(fill);
        floors.add(fill);
        continue;
      }""", SLOT),
  ('the later floor left in the stage under the merged one', P, "        platforms.splice(platforms.indexOf(r), 1);\n", '', TOY),
  ('only each floor\'s far side looked at (a chain never closes from the later floor\'s near side)', P,
   "    for (const side of [1, -1] as const) {\n      const j = pitHoleFill(fp, side,", "    for (const side of [1] as const) {\n      const j = pitHoleFill(fp, side,", TOY),
  ('a step: the shallower floor not deepened to the deeper one\'s foot', P,
   "      shallow.height = Math.max(shallow.height, deep.y + bankH - shallow.y);\n", '', TOY),
  ('a step: the deeper LATER floor not reaching the shallower one\'s end', P,
   "      else { r.width = R(r.x + r.width - (l.x + l.width)); r.x = R(l.x + l.width); }\n", '', TOY),
  ('a floor reaching a bank: the bank not deepened past it', P,
   "        j.deepen.height = Math.max(j.deepen.height, j.y + bankH - j.deepen.y);\n        continue;", "        continue;", TOY),
  ('a floor reaching a bank: the floor not lengthened (left short of the bank)', P,
   "        if (side > 0) fp.width = R(j.x + j.w - fp.x);\n", "        if (side > 0) fp.width = fp.width;\n", TOY),
  ('the wall not laid at a join', P, "      if (wall) walls.push({ ...wall, mid: j.x + j.w / 2 });\n", '', TOY),
  # (1-4's column petals, INT-10b (8))
  ('a climb trail under a fig gate laid to the vine top (the shut lid ignored)', 'src/game/petals.ts',
   "    const cut = Math.max(0, lid - (v.topY + 80));\n", "    const cut = 0;\n", ['src/game/fieldPetals.test.ts']),
  ('pairPetals moves only petals within 12 px of a line (one hand takes 13-38 px)', 'src/game/vineField.ts',
   "Math.abs(v.x - c.x) <= PICKUP_REACH && c.y >= v.topY", "Math.abs(v.x - c.x) <= 12 && c.y >= v.topY", ['src/game/fieldPetals.test.ts']),
  ('a spent sweeper still glances (the still fork\'s second look)', 'src/game/predators/core.ts',
   "  if (!g || !gl || s.passesLeft === 0) return true;", "  if (!g || !gl) return true;", ['--test-name-pattern=never turns its head', 'src/game/gen2/stillFork.test.ts']),
]
bad = 0
for name, f, a, b, t in PLANTS:
    src = open(f).read()
    if src.count(a) != 1:
        print(f'NOT PLANTED ({src.count(a)} matches): {name}'); bad += 1; continue
    open(f, 'w').write(src.replace(a, b))
    try:
        r = subprocess.run(['npx', 'tsx', '--test', *t], capture_output=True, text=True, timeout=1200)
        red = r.returncode != 0
    finally:
        open(f, 'w').write(src)
    print(('CAUGHT (RED)' if red else 'MISSED (green)') + f': {name}')
    bad += 0 if red else 1
r = subprocess.run(['npx', 'tsx', '--test', *TOY], capture_output=True, text=True, timeout=900)
print('restored: ' + ('GREEN' if r.returncode == 0 else 'RED'))
sys.exit(1 if bad or r.returncode else 0)
