import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { validateStage } from './levelCheck.ts';
import { reachGlide, reachJump } from './physics.ts';
import { GLIDE, glideLift, glideStep, newGlide } from './glide.ts';
import { ventLift, type Zone } from './zones.ts';

const levels = generateAllLevels();
/** the same stage, judged as if the glide could not be relied on yet (the rules of stage 4-6) */
const withoutGlide = (s: ReturnType<typeof generateStage>) => validateStage({ ...s, config: { ...s.config, worldIndex: 4, miniIndex: 6 } });

test('the leaf carries a falling jump much further than a double jump', () => {
  // off a ledge into a drop, a plain jump with the leaf beats a double jump by far; on the level, a double jump with the leaf does
  for (const dy of [-120, -200]) assert.ok(reachGlide(dy, false) > reachJump(dy, true) * 1.3, `drop ${dy}`);
  assert.ok(reachGlide(0, true) > reachJump(0, true) * 1.5);
});

test('4-7 The Long Drop and 8-6 Glide by Moonlight cannot be finished without the leaf, and are fine with it', () => {
  for (const id of ['4-7', '8-6']) {
    const s = generateStage(levels.find((l) => l.id === id)!);
    assert.equal(validateStage(s).ok, true, `${id} with the glide`);
    assert.equal(withoutGlide(s).ok, false, `${id} needs the glide`);
  }
});

test('no stage before 4-7 needs the leaf', () => {
  for (const l of levels.filter((x) => (x.worldIndex - 1) * 10 + x.miniIndex < 37 && x.objectiveType !== 'boss_lair')) {
    const s = generateStage(l);
    assert.equal(validateStage(s).ok, true, l.id);
  }
});

test('warm air over a vent holds the leaf open and lifts him, but only where the column is not burning', () => {
  const z: Zone = { kind: 'geyser', x0: 100, x1: 160, top: 500, bottom: 750, baseY: 750, dir: 1, period: 4, warn: 1, active: 1, offset: 0, force: 0 };
  // above the column: always warm air
  assert.equal(ventLift([z], 130, 400, 0), true);
  assert.equal(ventLift([z], 130, 100, 0), false, 'too high');
  assert.equal(ventLift([z], 60, 400, 0), false, 'beside it');
  // inside it: only while it is not erupting (idle for the first 2 s of the cycle, erupting in the last 1 s)
  assert.equal(ventLift([z], 130, 600, 0.5), true);
  assert.equal(ventLift([z], 130, 600, 3.5), false);
  const g = newGlide();
  const cap = glideStep(g, { has: true, airborne: true, held: true, vy: -50, lift: true }, 1 / 60);
  assert.equal(g.on, true);
  assert.equal(cap, GLIDE.fallSpeed);
  assert.ok(glideLift(0, 1 / 60) < 0, 'it pushes him up');
  assert.equal(glideLift(-1000, 1 / 60), -GLIDE.liftMax, 'never faster than liftMax');
  // without the skill, or letting go of Jump, nothing happens
  const g2 = newGlide();
  glideStep(g2, { has: false, airborne: true, held: true, vy: 200, lift: true }, 1 / 60);
  assert.equal(g2.on, false);
});
