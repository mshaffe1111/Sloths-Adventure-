import test from 'node:test';
import assert from 'node:assert/strict';
import type { Enemy } from './types.ts';
import { FEET, stepPredator, type PredatorType } from './predatorAI.ts';

const mk = (type: PredatorType, over: Partial<Enemy> = {}): Enemy => ({
  id: 1, type, x: 400, y: 1000 - FEET[type], vx: 40, vy: 0, width: 60, height: 30, hp: 3, maxHp: 3, facing: 1,
  patrolMinX: 300, patrolMaxX: 600, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0,
  hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...over,
});

/** run a predator for `secs` with the player standing `gap` px in front of it, recording what happened */
function run(type: PredatorType, secs: number, gap: number, over: Partial<Enemy> = {}) {
  const e = mk(type, over);
  const states = new Set<string>();
  let minX = e.x;
  let maxX = e.x;
  let maxLift = 0;
  const hurtStates = new Set<string>();
  for (let t = 0; t < secs; t += 1 / 30) {
    const { hurt } = stepPredator(e, { x: e.x + gap, y: 1000 }, 1 / 30);
    states.add(e.state ?? '');
    minX = Math.min(minX, e.x);
    maxX = Math.max(maxX, e.x);
    maxLift = Math.max(maxLift, (e.groundY ?? e.y) - e.y);
    if (hurt.length > 1) hurtStates.add(e.state ?? '');
    assert.ok(Number.isFinite(e.x) && Number.isFinite(e.y), `${type} produced a bad position`);
  }
  return { e, states, minX, maxX, maxLift, hurtStates };
}

test('jaguar telegraphs, leaps in an arc, lands back on the ground and returns to patrol', () => {
  const r = run('jaguar', 6, 200);
  for (const s of ['patrol', 'windup', 'leap', 'recover']) assert.ok(r.states.has(s), `jaguar never reached ${s}`);
  assert.ok(r.maxLift > 40 && r.maxLift < 80, `leap height ${r.maxLift}`);
  assert.ok(r.minX >= 300 - 15 && r.maxX <= 600 + 15, 'jaguar left its ground');
  // it must not stay floating or keep a sprint speed after the leap
  const e = run('jaguar', 3.4, 200).e;
  if (e.state !== 'leap') assert.equal(e.y, e.groundY);
});

test('ocelot pounce is a real arc and its speed goes back to normal (it used to float and sprint forever)', () => {
  const r = run('ocelot', 6, 120, { vx: -55, facing: -1 });
  assert.ok(r.states.has('leap'));
  assert.ok(r.maxLift > 10 && r.maxLift < 40);
  assert.equal(r.e.y === r.e.groundY || r.e.state === 'leap', true);
  assert.ok(Math.abs(r.e.vx) <= 55 * 2.6, 'ocelot kept a pounce speed');
});

test('a ground predator that is far from the player just patrols and never leaves its patch', () => {
  for (const t of ['ocelot', 'jaguar', 'caiman', 'tayra'] as PredatorType[]) {
    const r = run(t, 20, 900);
    assert.deepEqual([...r.states], ['patrol']);
    assert.ok(r.minX >= 300 - 3 && r.maxX <= 600 + 3, `${t} wandered off its ground`);
  }
});

test('boa stays coiled where it lies and only its strike reaches out', () => {
  const r = run('boa', 8, 110);
  for (const s of ['coil', 'rear', 'strike', 'bite', 'recover']) assert.ok(r.states.has(s), `boa never reached ${s}`);
  assert.ok(r.maxX - r.minX < 1, 'a coiled boa must not slither around');
  assert.deepEqual([...r.hurtStates].sort(), ['bite', 'strike']);
});

test('caiman lunges forward a short way and snaps; the jaws only hurt during the lunge and bite', () => {
  const r = run('caiman', 8, 100);
  for (const s of ['patrol', 'windup', 'lunge', 'bite', 'recover']) assert.ok(r.states.has(s), `caiman never reached ${s}`);
  assert.deepEqual([...r.hurtStates].sort(), ['bite', 'lunge']);
  assert.ok(r.maxX <= 600 + 15);
});

test('tayra stands up, dashes fast, skids to a stop and stays on its ground', () => {
  const r = run('tayra', 6, 200);
  for (const s of ['patrol', 'alert', 'dash', 'recover']) assert.ok(r.states.has(s), `tayra never reached ${s}`);
  assert.ok(r.maxX <= 600 + 15 && r.minX >= 300 - 15);
});

test('a knocked-back predator walks back onto its ground instead of popping there', () => {
  const e = mk('jaguar', { x: 300 });
  stepPredator(e, { x: 9999, y: 1000 }, 1 / 30); // initialise
  e.x = 200; // knockback far past the patrol edge
  const before = e.x;
  stepPredator(e, { x: 9999, y: 1000 }, 1 / 30);
  assert.ok(e.x - before < 9, `snapped ${e.x - before}px in a frame`);
  for (let i = 0; i < 120; i++) stepPredator(e, { x: 9999, y: 1000 }, 1 / 30);
  assert.ok(e.x >= 300 - 15);
});

test('a player on a different level (far above or below) does not trigger an attack', () => {
  const e = mk('jaguar');
  for (let t = 0; t < 5; t += 1 / 30) stepPredator(e, { x: e.x + 100, y: 700 }, 1 / 30);
  assert.equal(e.state, 'patrol');
});
