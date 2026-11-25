#!/usr/bin/env python3
"""ENG-DARK planted faults: each one breaks the dark brick, the bounded wake or the verdict, and must turn a named test in
src/game/gen2/dark.test.ts RED. Run in a FROZEN worktree of the commit under test (D115), never the tree being edited:
    git worktree add --detach <dir> <hash>; ln -s <repo>/node_modules <dir>/node_modules
    python3 reference/qa-reports/ENG-DARK/planted-faults.py <dir>
Each plant is applied, the test run, the file restored (git checkout). Prints CAUGHT / MISSED per plant; exit 1 on any MISSED."""
import subprocess, sys, pathlib

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
     'const at = { x: r.land.x, y: r.land.y - DARK_ZONE.lightUp };', 'const at = { x: r.land.x, y: r.land.y - 500 };', 'the brick on a real World 3 row'),
    ('litAhead asks nothing (need 0)', 'src/game/gen2/dark.ts',
     'const need = DARK_AHEAD[setting];', 'const need = 0 * DARK_AHEAD[setting];', 'walked off a dark rim at once'),
    ('World 6 copies its own dark (not the lifted one)', 'src/game/gen2/worlds/w6Swing.ts',
     "export { DARK_PROP as W6S_PROP, DARK_PROPS as W6S_PROPS, DARK_ZONE, darkEnds, DARK_EMIT as W6S_EMIT } from '../dark.ts';",
     "export { DARK_PROP as W6S_PROP, DARK_ZONE, darkEnds } from '../dark.ts';\nexport const W6S_PROPS = [...DARK_PROPS]; export const W6S_EMIT = { ...DARK_EMIT };", 'World 6 lays the one lifted dark'),
]
missed = 0
for name, f, old, new, test in PLANTS:
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
        r = subprocess.run(['npx', 'tsx', '--test', f'--test-name-pattern={test}', TEST], cwd=wt, capture_output=True, text=True, timeout=900)
        red = '# fail 0' not in r.stdout
        print(f"{'CAUGHT' if red else 'MISSED'}  {name}  -> '{test}'")
        missed += 0 if red else 1
    finally:
        subprocess.run(['git', 'checkout', '--', f], cwd=wt)
sys.exit(1 if missed else 0)
