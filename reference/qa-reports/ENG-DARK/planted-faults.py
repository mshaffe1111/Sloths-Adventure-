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
     'const at = { x: r.land.x, y: Math.min(r.land.y - DARK_ZONE.lightUp, r.y + GLOW_REACH.down) };', 'const at = { x: r.land.x, y: r.land.y - 500 };', 'the brick on a real World 3 row'),
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
    ("a dark give-up kept for the whole run", 'tools/inspect/firsttimer.ts',
     '    if (this.glowGaveUp.size && p.grounded) for (const r of this.glowGaveUp) if (!on(r)) this.glowGaveUp.delete(r);', '', "give-up ends with the visit", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-d) unlit cause 3: the stop reads only the route's way, never the steer the thumb presses
    ("the dark stop never reads the pressed steer (glowSteer not called)", 'tools/inspect/firsttimer.ts',
     '    this.glowSteer(out);\n', '', "stop reads the THUMB", 'src/game/gen2/darkBots.test.ts'),
    # (ENG-DARK-e) the lead's ruling: a climb down a trunk past a rim is its own kind, never 'went over', not counted by 'lit 1 s ahead'
    ("RimWatch hides a climb inside 'went over' (no 'climbed' kind)", 'src/game/gen2/dark.ts',
     '...(p.climbing ? { climbed: true as const } : {})', '...({})', "own kind ('climbed')"),
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
    ("an edge behind a dark-rim drop's landing judged as one he lands toward", 'src/game/gen2/dark.ts',
     'let lit = !!ud && (n.dir !== u.dir || ', 'let lit = !!ud && (', 'the brick on a real World 3 row'),
    ("a wall rim's light hung over its landing past the stop's reach (the depth bound off)", 'src/game/gen2/dark.ts',
     'y: Math.min(r.land.y - DARK_ZONE.lightUp, r.y + GLOW_REACH.down) }', 'y: r.land.y - DARK_ZONE.lightUp }', "a wall rim's light hangs no deeper"),
    ("an awake light counts as lit from anywhere (no reach)", 'src/game/gen2/dark.ts',
     '  if (!glowReaches(l, x, feet, facing)) return Infinity;', '  if (l.sleep && !glowReaches(l, x, feet, facing)) return Infinity;', 'darkFlags: a flag'),
]
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
