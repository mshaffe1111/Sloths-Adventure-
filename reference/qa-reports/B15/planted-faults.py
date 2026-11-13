#!/usr/bin/env python3
"""B15's planted faults (level.md rule 12): each fault is put into the code, the test that guards it must FAIL, and the code is put back.
Run from the repo root: python3 reference/qa-reports/B15/planted-faults.py   (prints CAUGHT or MISSED for each; exit 1 on a miss)"""
import pathlib, subprocess, sys

T_CREAK = 'src/game/gen2/creak.test.ts'
T_LIMB = 'src/game/limbTrap.test.ts'
T_ARC = 'src/game/gen2/worlds/w1Arc15.test.ts'
ARC = 'src/game/gen2/worlds/w1Arc15.ts'
FAULTS = [
    ('the engine reads every fragile hold as 1.1', 'src/game/engine.ts', 'plat.crumbleAfter ?? plat.creak ?? 1.1', 'plat.crumbleAfter ?? 1.1', T_CREAK),
    ("the lesson's limbs are not marked free", 'src/game/gen2/pipeline.ts', 'creakLimb(p, M, budget.difficulty, !creakTaught)', 'creakLimb(p, M, budget.difficulty, false)', T_CREAK),
    ("World 1 has no creaky limb row", 'src/game/gen2/worlds/w1.ts', '    creak: W1_CREAK,\n', '', T_CREAK),
    ('a set-back leaves broken limbs broken', 'src/game/engine.ts', "      if (pl.type === 'fragile') {\n        pl.broken = false;", "      if (pl.type === 'fragile' && pl.creak === undefined) {\n        pl.broken = false;", T_CREAK),
    ('a limb giving way never lets its trap go', 'src/game/engine.ts', '          this.cast?.limbGone(plat.id);\n', '', T_LIMB),
    ('a limb may come down on an animal', 'src/game/dropTrap.ts', "  if (on.some((a) => a.patrolMinX < x1 && a.patrolMaxX > x0)) bad.push", "  if (on.some((a) => a.patrolMinX < x1 && a.patrolMaxX > x0) && false) bad.push", T_LIMB),
    ('a chased-off animal glides into the ground', 'src/game/castPlay.ts', '      e.y = Math.min(e.y, floor - m.foot);\n', '', T_LIMB),
    ('a mark is laid as a plain relic', 'src/game/gen2/pipeline.ts', "type: 'relic', mark: 'meeca', x: k.x", "type: 'relic', x: k.x", T_LIMB),
    ("the locked exit forgets the keeper's line", 'src/game/stagePlan.ts', "{ '1:relic_hunt': \"We missed some of her marks. They're back there!\" }", '{}', T_LIMB),
    ("the engine's locked exit ignores the keeper's line", 'src/game/engine.ts', "const line = sealedLine(this.currentStage.config.worldIndex, objType) ?? goalLine(", "const line = null ?? goalLine(", 'src/game/limbTrap.test.ts'),
    ('the HUD shows the stone idol for her marks', 'src/components/hud/goalInfo.ts', "w === 1 ? { kind: 'drawn', name: 'carving' } : { kind: 'drawn', name: 'idol' }", "{ kind: 'drawn', name: 'idol' }", T_LIMB),
    ("the creaky line is not a teach line", ARC, "teachTips: [...(M.teachTips ?? []), 'creak', 'last']", "teachTips: [...(M.teachTips ?? []), 'last']", T_ARC),
    ('Dot says the creaky line at the limb', ARC, "flag('a', 0.3), tip('tip', 'a', 0.25, 'creak'),", "flag('a', 0.3), tip('tip', 'c', 0.9, 'creak'),", T_ARC),
    ("a creaky limb hangs over a snake's patch", ARC, "over('L3', 'Q', Qa, 20 + S.lateGap,", "over('L3', 'S', G, 20,", T_ARC),
    ('the first snake of the stage is awake', ARC, "const t = trapped('t', 'r', true);", "const t = trapped('t', 'r', false);", T_ARC),
    ("the den's patch is wider than the limb's chase", ARC, 'const W = 400, D = 150, LW = 120;', 'const W = 400, D = 300, LW = 120;', T_LIMB),
    ('a step up under a deck', ARC, "    bank('r3', 'V', 200, UP), bank('z', 'r3', 260, DOWN),", "    { ...bank('r3', 'V', 200, UP), place: { kind: 'walk', after: 'V', dy: [-56, -50] } }, bank('z', 'r3', 260, DOWN), over('L4', 'r3', 200, 0, 120, { creak: true }),", T_ARC),
    ("a line changed from the keeper's words", ARC, "creak: 'Creaky limbs drop you, but only down to the roots!'", "creak: 'Creaky limbs drop you to the roots!'", T_ARC),
]

def run(test: str) -> bool:
    r = subprocess.run(['npx', 'tsx', '--test', test], capture_output=True, text=True, timeout=1200)
    return '# fail 0' in r.stdout

missed = 0
for name, path, old, new, test in FAULTS:
    p = pathlib.Path(path)
    src = p.read_text()
    if src.count(old) != 1:
        print(f'SKIPPED (the fault does not apply: {src.count(old)} matches): {name}')
        missed += 1
        continue
    p.write_text(src.replace(old, new))
    try:
        ok = run(test)
    finally:
        p.write_text(src)
    print(('MISSED' if ok else 'CAUGHT') + f': {name} ({test})')
    missed += ok
print(f'{len(FAULTS) - missed} of {len(FAULTS)} caught')
sys.exit(1 if missed else 0)
