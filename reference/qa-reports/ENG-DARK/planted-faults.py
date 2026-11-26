#!/usr/bin/env python3
"""ENG-DARK planted faults: each one breaks the dark brick, the bounded wake or the verdict, and must turn a named test in
src/game/gen2/dark.test.ts RED. Run in a FROZEN worktree of the commit under test (D115), never the tree being edited:
    git worktree add --detach <dir> <hash>; ln -s <repo>/node_modules <dir>/node_modules
    python3 reference/qa-reports/ENG-DARK/planted-faults.py <dir>
Each plant is applied, the test run, the file restored (git checkout). Prints CAUGHT / MISSED per plant; exit 1 on any MISSED."""
import subprocess, sys, pathlib, re
# (ENG-DARK-i) node reads --test-name-pattern as a REGEX: a name with ( ) [ ] . ? + * matched NO test, and a plant that runs no test
#  printed MISSED as if the test stayed green (plants 17/18, "own kind ('climbed')", never ran from box 5 to box 8). The filter is
#  escaped, and a plant whose filter runs no test prints NO TEST and fails the run.
pat = lambda name: re.sub(r'[.*+?^${}()|\[\]\\]', lambda m: '\\' + m.group(0), name)

wt = pathlib.Path(sys.argv[1]).resolve()
TEST = 'src/game/gen2/dark.test.ts'
PLANTS = [
    ('the wake unbounded below (GLOW_REACH.down huge)', 'src/game/zones.ts',
     'up: 240, down: 420,', 'up: 240, down: 100000,', 'the wake reaches below, bounded'),
    ('the engine wakes by x alone again (no glowReaches)', 'src/game/engine.ts',
     'if (!glowReaches(l, p.x, p.y, p.facing)) continue;', 'if (l.x < p.x - GLOW_REACH.back || l.x > p.x + GLOW_REACH.ahead) continue;', 'the wake reaches below, bounded'),
    ('no glowworm over a landing (the glow stretch lays none)', 'src/game/gen2/dark.ts',
     '    z.lights!.push({ x: at.x, y: at.y, r: DARK_GLOW.light, sleep: true, id: id++ });', '    void at;', 'the brick on a real World 3 row'),
    ('a glowworm hung 500 px over its landing (out of any stop\'s reach)', 'src/game/gen2/dark.ts',
     'const at = { x: land.x, y: Math.min(land.y - DARK_ZONE.lightUp, r.y + GLOW_REACH.down) };', 'const at = { x: land.x, y: land.y - 500 };', 'the brick on a real World 3 row'),
    ('litAhead asks nothing (need 0)', 'src/game/gen2/dark.ts',
     'const need = DARK_AHEAD[setting];', 'const need = 0 * DARK_AHEAD[setting];', 'stood still until the landing woke'),
    ('litAhead counts a landing never lit as lit', 'src/game/gen2/dark.ts',
     'const lead = c.litAt === undefined ? -Infinity : c.t - c.litAt;', 'const lead = c.litAt === undefined ? Infinity : c.t - c.litAt;', 'walked off a dark rim at once'),
    ("ruling A off: the glowworms' dark keeps 'nothing stands inside'", 'src/game/zones.ts',
     "export const keepsClear = (z: Pick<Zone, 'kind' | 'lights'>) => !(z.kind === 'dark' && !!z.lights?.some((l) => l.sleep));",
     "export const keepsClear = (z: Pick<Zone, 'kind' | 'lights'>) => z.kind !== '' as string;", 'ruling A'),
    ("the lay hangs no glowworm by a dark flag (glowFlags off)", 'src/game/gen2/pipeline.ts',
     '  glowFlags(sink, flags);', '  void glowFlags;', 'the brick on a real World 3 row'),
    ("darkFlags asks nothing of a dark flag", 'src/game/gen2/dark.ts',
     '    if (zs.length && !flagLit(', '    if (false && zs.length && !flagLit(', 'darkFlags'),
    ('World 6 copies its own dark (not the lifted one)', 'src/game/gen2/worlds/w6Swing.ts',
     "export { DARK_PROP as W6S_PROP, DARK_PROPS as W6S_PROPS, DARK_ZONE, darkEnds, DARK_EMIT as W6S_EMIT } from '../dark.ts';",
     "export { DARK_PROP as W6S_PROP, DARK_ZONE, darkEnds } from '../dark.ts';\nexport const W6S_PROPS = [...DARK_PROPS]; export const W6S_EMIT = { ...DARK_EMIT };", 'World 6 lays the one lifted dark'),
    # (ENG-DARK-b) the lock's cause planted back: box 1's lockall moved 37 gen2 stages' proto.gen2 with it
    ('the glow counter written into every stage\'s extras again', 'src/game/gen2/dark.ts',
     '  if (id !== first) out.extras[GLOW_ID] = id;', '  out.extras[GLOW_ID] = id;', 'the lay leaves every other stage'),
    # (ENG-DARK-b) the bots' skill removed in the code, not by its flag: the GREEN toy goes RED
    ("the bots' dark stop removed (glowWait never stops him)", 'tools/inspect/firsttimer.ts',
     '    if (this.who.noGlowWait) return null;', '    if (this.who || this.who.noGlowWait) return null;', "the dark's skill: he stands", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-c) the stop for a running jump removed: the expert's jump pressed 94 px out goes into the dark again
    ("the bots' dark stop skips a jump (glowJump not read)", 'tools/inspect/firsttimer.ts',
     '    if (gj) return gj;', '    void gj;', "holds a running JUMP", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-d) unlit cause 2: the stop taken facing away is never turned to the rim; the give-up kept for the whole run
    ("the dark stop never turns him to face the rim", 'tools/inspect/firsttimer.ts',
     'if (p.facing !== rim.dir && stop.turn !== 2 && !this.who.noGlowTurn) {', 'if (false) {', "stop FACES the rim", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 25) re-anchored: box 22's c16 (23fae3c18) changed on(r) to held(r) on this line; NO ANCHOR (no plant test) from c16 to c18
    ("a dark give-up kept for the whole run", 'tools/inspect/firsttimer.ts',
     '    if (this.glowGaveUp.size && p.grounded) for (const r of this.glowGaveUp) if (!held(r)) this.glowGaveUp.delete(r);', '', "give-up ends with the visit", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-d) unlit cause 3: the stop reads only the route's way, never the steer the thumb presses
    ("the dark stop never reads the pressed steer (glowSteer not called)", 'tools/inspect/firsttimer.ts',
     '    this.glowSteer(out);\n', '', "stop reads the THUMB", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-e) the lead's ruling: a climb down a trunk past a rim is its own kind, never 'went over', not counted by 'lit 1 s ahead'
    ("RimWatch hides a climb inside 'went over' (no 'climbed' kind)", 'src/game/gen2/dark.ts',
     '    if (p.climbing) this.crossings.push({ ...c, climbed: true });', '    if (p.climbing) this.crossings.push(c);', "own kind ('climbed')"),
    ("litAhead counts a climb past a rim as a blind drop", 'src/game/gen2/dark.ts',
     '    if (c.climbed) continue;\n', '', "own kind ('climbed')"),
    # (ENG-DARK-f) child Easy 25's strand: the tower's way-down plan asked the vine's top one way only, and pressed down mid-trunk
    ("the way-down plan's top test one-sided again", 'tools/inspect/firsttimer.ts',
     '      if (Math.abs(e.nearTreeVine.topY - p.y) <= 14) return { down: true };', '      if (e.nearTreeVine.topY <= p.y + 14) return { down: true };', "MID-WAY", 'src/game/gen2/darkBots.test.ts'),
    ("the way-down plan never takes a trunk mid-way (no up grab)", 'tools/inspect/firsttimer.ts',
     '      if (e.nearTreeVine.topY < p.y - 14 && under &&', '      if (false && under &&', "MID-WAY", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-h) the lead's rulings (i) and (ii), the wall rim's light depth, the 80-roll loop
    ("the cave mouth laid asleep (ruling (ii) off)", 'src/game/gen2/dark.ts',
     'if (r.light && mouth.has(r.piece)) r.light.sleep = false;', 'if (false && r.light && mouth.has(r.piece)) r.light.sleep = false;', 'the cave mouth is lit'),
    ("every light in the dark laid awake (not only the cave mouth's)", 'src/game/gen2/dark.ts',
     'if (r.light && mouth.has(r.piece)) r.light.sleep = false;', 'if (r.light) r.light.sleep = false;', 'the brick on a real World 3 row'),
    ("darkLandings asks no room of a drop in from outside", 'src/game/gen2/dark.ts',
     '      if (room >= stop) continue;', '      if (room >= stop || !rims.some((m) => m.piece === u.piece)) continue;', 'the cave mouth is lit'),
    ("ruling (i) off: a dark-rim drop's edge inside its own light does not pass", 'src/game/gen2/dark.ts',
     '(!!ud.light && Math.hypot(ud.light.x - n.x, ud.light.y - n.y) <= ud.light.r)', 'false', 'the brick on a real World 3 row'),
    # (box 14) the behind-edge exemption: no real row decides it (box 13); its SHAPE toy, a deep drop on a real rim (the lead's ruling)
    ("an edge behind a dark-rim drop's landing judged as one he lands toward", 'src/game/gen2/dark.ts',
     'let lit = !!ud && ((ud.drop && n.dir !== u.dir) || (!!ud.light', 'let lit = !!ud && ((!!ud.light', 'an edge BEHIND a dark-rim drop'),
    ("a wall rim's light hung over its landing past the stop's reach (the depth bound off)", 'src/game/gen2/dark.ts',
     'y: Math.min(land.y - DARK_ZONE.lightUp, r.y + GLOW_REACH.down) }', 'y: land.y - DARK_ZONE.lightUp }', "a wall rim's light hangs no deeper"),
    ("an awake light counts as lit from anywhere (no reach)", 'src/game/gen2/dark.ts',
     '  if (!glowReaches(l, x, feet, facing)) return Infinity;', '  if (l.sleep && !glowReaches(l, x, feet, facing)) return Infinity;', 'darkFlags: a flag'),
    # (ENG-DARK-l, box 12) plant 28: box 10's seam check (downEnd's ledgeEnds) off: a seam under his feet read as a way down again
    ('the seam check off: a seam he walks over read as a way down (downEnd)', 'tools/inspect/firsttimer.ts',
     'if (d === 0 || this.who.noSeamWalk) return d;', 'if (d === 0 || true) return d;', 'a seam he walks over is no way down',
     'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 15) the seam run's end picked by his facing again, not the end the way on comes out past (roll 11 adult N, loop 11)
    ("the seam run's end by his facing (downEnd)", 'tools/inspect/firsttimer.ts',
     '      if (this.who.seamByFacing) return this.sim.p.facing < 0 ? -1 : 1;', '      return this.sim.p.facing < 0 ? -1 : 1;',
     'the way on under a seam run comes out past its far end', 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 16) no end of his run picked when the way on lies straight under it (roll 15 expert N: stranded by the right wall)
    ("no open end picked under a run with the way on under it (downEnd)", 'tools/inspect/firsttimer.ts',
     '    const wayOn = this.who.noOpenEnd ? null : this.downPt(p);', '    const wayOn = null as Pt | null;',
     'the way on straight under a run that ends at a side wall', 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 21) going down, a ledge over him read as a step up whatever way the route runs (roll 19 child N: a double at the dip)
    ("every ledge over him a step up going down (wayRises not read)", 'tools/inspect/firsttimer.ts',
     "this.stepUp(here, dir) && this.wayRises(p) ? 'double' : 'single';", "this.stepUp(here, dir) ? 'double' : 'single';",
     "a ledge over him is a step up only where the way rises", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 22) the dark stop held by the piece's span alone (c15 x40: 7 of 9 unlit, the stop dropped at the lip, his middle past the end)
    ("the dark stop dropped at the lip (standingOnId not read)", 'tools/inspect/firsttimer.ts',
     "const held = (r: DarkRim) => on(r) || (!this.who.noLipHold && p.grounded && e.standingOnId === r.piece.id);", "const held = on;",
     "a dark stop holds at the lip", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 22, kind C) a put-back counted as a crossing (c15 x40 expert N 25: a rescue across the rim at x 648)
    ("a put-back across a rim counted gone over (RimWatch.put a no-op)", 'src/game/gen2/dark.ts',
     "  put(): void {\n    this.onPiece = null;\n    this.over = null;\n  }", "  put(): void {\n  }",
     "a put-back (a rescue) from a rim's piece to past its end is no crossing"),
    ("the bot's put-back never tells the rim watch (placeAt without RimWatch.put)", 'tools/inspect/firsttimer.ts',
     "    this.rimWatch?.put();\n", "",
     "the bot's own put-back (placeAt", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 16) landed ahead on the way's floor, still followed by the point over his head (roll 26 middle N: up the trunk again)
    ("landed ahead, never put on the way at his floor (landedAhead)", 'tools/inspect/firsttimer.ts',
     '    if (p.grounded && this.airFrom && this.landedAhead(p)) more = true;', '',
     "landed ahead on the way's own floor", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 14) the RUNNING step off: the verdict, the lay that lights it, and the bot's stop at a lit edge whose run meets a rim
    ("darkLandings asks nothing of a running step off ((iii) off)", 'src/game/gen2/dark.ts',
     '    if (stops) continue;\n    out.push(', '    if (stops || true) continue;\n    out.push(', 'a RUN off a rim with no stop is judged where it lands'),
    ("the lay lights no running step off's landing (awakeLights' run-offs off)", 'src/game/gen2/dark.ts',
     '      if (stops) continue;\n      n.light!.sleep = false;', '      if (stops || true) continue;\n      n.light!.sleep = false;', 'the brick on a real World 3 row'),
    ("the bot's dark stop skips a run off a lit edge (runOffRims not read)", 'tools/inspect/firsttimer.ts',
     '.filter((r) => r.light?.id !== undefined && !own.some(', '.filter((r) => false && r.light?.id !== undefined && !own.some(', 'a RUN off a lit edge in the dark',
     'src/game/gen2/darkBots.test.ts'),
    # plant 29: box 11's turn room off (glowWait presses the turn wherever he stands, the rim's very edge included)
    ("the dark stop's turn room off: the turn pressed at the rim's very edge (glowWait)", 'tools/inspect/firsttimer.ts',
     'if (!this.who.noTurnRoom && stop.turn !== 1) {', 'if (false) {', "the dark stop's turn is never pressed at the rim's very edge",
     'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-r, box 18) the wall slot (child Normal 25's 1850 px fall) and box 17's walled-end rule, each planted back
    ('offEnd as it was: an end 14 px in from the wall read as no end', 'src/game/gen2/tower.ts',
     "  return dir < 0 ? (end - 20 <= hang ? null : Math.max(20, end - 24)) : width - 20 - end <= hang ? null : Math.min(width - 20, end + 24);",
     "  const x = end + dir * 24; return x < 20 || x > width - 20 ? null : x;", 'offEnd: an end 14 px in from the wall', 'src/game/gen2/tower.test.ts'),
    ('offEnd with no hang: an end 4 px in from the wall read as a way off (Normal 22 strand)', 'src/game/gen2/tower.ts',
     "  return dir < 0 ? (end - 20 <= hang ? null :", "  hang = 0;\n  return dir < 0 ? (end - 20 <= hang ? null :", 'offEnd: an end 14 px in from the wall', 'src/game/gen2/tower.test.ts'),
    ("handOn's walledEnd filter removed (a walled end read as a way off)", 'src/game/gen2/tower.ts',
     "filter((x, i): x is number => x !== null && !walledEnd(platforms, i ? r.b : r.a, i ? 1 : -1, r.y))",
     "filter((x): x is number => x !== null)", 'a walled end is no way off: a catch', 'src/game/gen2/tower.test.ts'),
    ("towerRoute's dropTo steps off a walled end (open without walledEnd)", 'tools/inspect/towerRoute.ts',
     "const open = (d: -1 | 1) => (walledEnd(wood as Parameters<typeof walledEnd>[0], d < 0 ? lo : hi, d, at.y) ? undefined : underAt(d));",
     "const open = (d: -1 | 1) => underAt(d);", 'the way down off a walled catch goes off its OPEN end', 'src/game/gen2/darkBots.test.ts'),
    ('walledEnd false (lay, verdict and route read no walled end)', 'src/game/gen2/tower.ts',
     "  const a = dir < 0 ? end - WALL_HALF : end, b = dir < 0 ? end : end + WALL_HALF;",
     "  return false;\n  const a = dir < 0 ? end - WALL_HALF : end, b = dir < 0 ? end : end + WALL_HALF;", 'no rescue at the walled catch', 'src/game/gen2/darkBots.test.ts'),

    # (ENG-DARK-r, box 18) box 16's 89ef9a985, its two changes planted back (toys written box 18)
    ("runOffs skips an edge with its own sleeping stop (89ef9a985's lay change reverted)", 'src/game/gen2/dark.ts',
     "    const uds = rims.filter((m) => m.piece === u.piece && m.dir === u.dir);\n",
     "    const uds = rims.filter((m) => m.piece === u.piece && m.dir === u.dir);\n    if (uds.some((m) => m.light?.sleep)) continue;\n",
     'a RUN off an edge with its OWN dark stop is judged too'),
    ("glowWait takes the first rim at an end (89ef9a985's bot change reverted)", 'tools/inspect/firsttimer.ts',
     "<= GLOW_NEAR && unlit(r));\n    if (!rim) return null;", "<= GLOW_NEAR);\n    if (!rim || !unlit(rim)) return null;",
     'a dark stop at an end that is two rims', 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK box 24, plant 47) at the lip the way on's first point within 8 px of his middle read as straight under him (expert N 15 x 367)
    ("lipEnd off: a point past his wood's end within 8 px read straight under him (downEnd 0)", 'tools/inspect/firsttimer.ts',
     "      const d = dx > 8 ? 1 : dx < -8 ? -1 : endOf(at);\n", "      const d = dx > 8 ? 1 : dx < -8 ? -1 : 0;\n",
     "at the lip over the way on's first point, he steps off that end", 'src/game/gen2/darkBots.test.ts'),
    # (box 26) the run-on into the wall reads its slot off the run-on alone again: Easy 6's end 19 px from the wall line is left open
    ("the run-on's slot read off the run-on alone (not the run it makes)", 'src/game/gen2/tower.ts',
     "!slotted(r0, r1, e.p.y, [e.p])", "!slotted(w0, w1, e.p.y, [e.p])",
     'going down, an end 19 px in from the wall line is run on into the wall', 'src/game/gen2/tower.test.ts'),
    ("the run-on's slot read off the run-on alone: the raw 3-1 rolls (Easy 6's blind drop)", 'src/game/gen2/tower.ts',
     "!slotted(r0, r1, e.p.y, [e.p])", "!slotted(w0, w1, e.p.y, [e.p])",
     'head room on the way down: no piece of 24 raw rolls', 'src/game/gen2/worlds/w3.test.ts'),
]
# (ENG-DARK box 13) ONLY='a|b': run only the plants whose name holds one of these (a re-anchor's check; the full proof runs them all)
import os
if os.environ.get('ONLY'): PLANTS = [q for q in PLANTS if any(k in q[0] for k in os.environ['ONLY'].split('|'))]
missed = 0
base: dict = {}
# (an optional second argument runs only those plants, 1-based: '17,18')
ONLY = {int(n) for n in sys.argv[2].split(',')} if len(sys.argv) > 2 else None
for k, plant in enumerate(PLANTS, 1):
    if ONLY and k not in ONLY: continue
    name, f, old, new, test = plant[:5]
    tf = plant[5] if len(plant) > 5 else TEST
    # (ENG-DARK-i) the toy must be GREEN unplanted first: a toy already red reads CAUGHT whatever the plant does (plant 15 on 0dadb295)
    if (tf, test) not in base:
        b = subprocess.run(['npx', 'tsx', '--test', f'--test-name-pattern={pat(test)}', tf], cwd=wt, capture_output=True, text=True, timeout=900)
        base[(tf, test)] = '# fail 0' in b.stdout and bool(sum(int(n) for n in re.findall(r'^# (?:pass|fail) (\d+)$', b.stdout, re.M)))
    if not base[(tf, test)]:
        print(f"BASE RED  {name}  -> '{test}' (the toy fails or runs nothing unplanted)"); missed += 1; continue
    p = wt / f
    s = p.read_text()
    if old not in s:
        print(f'NO ANCHOR  {name}  ({f})'); missed += 1; continue
    if 'World 6 copies' in name:
        # (the copy is local: the file must still import what it re-spreads)
        new_s = s.replace(old, new, 1)
    else:
        new_s = s.replace(old, new, 1)
    p.write_text(new_s)
    try:
        r = subprocess.run(['npx', 'tsx', '--test', f'--test-name-pattern={pat(test)}', tf], cwd=wt, capture_output=True, text=True, timeout=900)
        ran = sum(int(n) for n in re.findall(r'^# (?:pass|fail) (\d+)$', r.stdout, re.M))
        if not ran:
            print(f"NO TEST  {name}  -> '{test}' (the filter runs no test)"); missed += 1; continue
        red = '# fail 0' not in r.stdout
        print(f"{'CAUGHT' if red else 'MISSED'}  {name}  -> '{test}'")
        missed += 0 if red else 1
    finally:
        subprocess.run(['git', 'checkout', '--', f], cwd=wt)
sys.exit(1 if missed else 0)
