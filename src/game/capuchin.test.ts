import test from 'node:test';
import assert from 'node:assert/strict';
import { CAP, capBlocks, newCapuchin, stepGuard, stepLookout, stepThief, type Capuchin } from './capuchin.ts';

const dt = 1 / 30;

const thief: Capuchin = { job: 'thief', x: 500, y: 700, path: [{ x: 800, y: 700 }, { x: 1100, y: 600 }, { x: 1400, y: 600 }] };

test('a thief grabs the petal when he comes close, runs to a post and teases there', () => {
  const s = newCapuchin(thief);
  assert.deepEqual(stepThief(thief, s, 200, 700, false, dt), {});
  assert.equal(stepThief(thief, s, 380, 700, false, dt).grabbed, true);
  for (let i = 0; i < 60 && s.mode === 'flee'; i++) stepThief(thief, s, 380, 700, false, dt);
  assert.equal(s.mode, 'tease');
  assert.equal(s.x, 800);
});

test('catching up while it teases makes it drop the petal; a punch does too', () => {
  const s = newCapuchin(thief);
  stepThief(thief, s, 400, 700, false, dt);
  for (let i = 0; i < 60 && s.mode === 'flee'; i++) stepThief(thief, s, 400, 700, false, dt);
  assert.equal(stepThief(thief, s, 790, 700, false, dt).dropped, true);
  assert.equal(s.carrying, false);
  const p = newCapuchin(thief);
  stepThief(thief, p, 400, 700, false, dt);
  assert.equal(stepThief(thief, p, 300, 700, true, dt).dropped, true);
});

test('a thief nobody catches ends up in its den, still holding the petal', () => {
  const s = newCapuchin(thief);
  stepThief(thief, s, 400, 700, false, dt);
  // (he follows, but never quite reaches it)
  for (let i = 0; i < 30 * 30; i++) stepThief(thief, s, s.x - 200, 700, false, dt);
  assert.equal(s.x, 1400);
  assert.equal(s.carrying, true);
  assert.equal(s.mode, 'tease');
});

test('at a post it waits for him to come in sight before it teases and runs on, so it always stops where he can catch it', () => {
  const s = newCapuchin(thief);
  stepThief(thief, s, 400, 700, false, dt);
  for (let i = 0; i < 60 && s.mode === 'flee'; i++) stepThief(thief, s, 400, 700, false, dt);
  // far behind (lost on a stair): it sits at its post however long he takes
  for (let i = 0; i < 30 * 20; i++) stepThief(thief, s, 800 - CAP.wait - 100, 700, false, dt);
  assert.equal(s.mode, 'tease');
  assert.equal(s.post, 0);
  // he comes in sight: it teases a while, and touching it then (from a jump, too) makes it drop the petal
  for (let i = 0; i < Math.floor(CAP.tease * 30) - 5; i++) stepThief(thief, s, 800 - CAP.wait + 50, 700, false, dt);
  assert.equal(s.post, 0);
  assert.equal(stepThief(thief, s, 800 - CAP.catch + 8, 700 - CAP.catchUp + 10, false, dt).dropped, true);
});

test('it runs faster than he walks, so he catches it at a post, not on the way', () => {
  assert.ok(CAP.run > 200);
  assert.ok(CAP.tease >= 2);
});

const look: Capuchin = { job: 'lookout', x: 1000, y: 700, x0: 700, x1: 1300 };

test('a lookout stares before it screeches, and ducking back under cover in time stops it', () => {
  const s = newCapuchin(look);
  stepLookout(look, s, 900, false, [], dt);
  assert.equal(s.mode, 'stare');
  for (let i = 0; i < 10; i++) stepLookout(look, s, 900, false, [], dt);
  stepLookout(look, s, 900, true, [], dt);
  assert.equal(s.mode, 'sit');
  let screeched = false;
  for (let i = 0; i < Math.ceil(CAP.stare * 30) + 2; i++) screeched ||= !!stepLookout(look, s, 900, false, [], dt).screech;
  assert.equal(screeched, true);
});

test('hidden, or outside its stretch, it sees nothing', () => {
  const s = newCapuchin(look);
  for (let i = 0; i < 90; i++) {
    assert.ok(!stepLookout(look, s, 900, true, [], dt).screech);
    assert.ok(!stepLookout(look, s, 1500, false, [], dt).screech);
  }
});

test('a fruit nearby draws it off to eat, and while it eats it never screeches', () => {
  const s = newCapuchin(look);
  const fruit = [{ x: 1150, y: 700 }];
  let ate;
  for (let i = 0; i < 30 * (CAP.eat + 2); i++) {
    const r = stepLookout(look, s, 900, false, ate ? [] : fruit, dt);
    if (!ate) assert.ok(!r.screech, 'it screeched while busy with fruit');
    if (r.ate) ate = r.ate;
  }
  assert.deepEqual(ate, fruit[0]);
});

const guard: Capuchin = { job: 'guard', x: 2000, y: 400, x0: 1950, x1: 2050 };

test('a guard paces its ledge and blocks the way', () => {
  const s = newCapuchin(guard);
  for (let i = 0; i < 300; i++) {
    stepGuard(guard, s, 0, dt);
    assert.ok(s.x >= 1950 && s.x <= 2050);
  }
  assert.equal(capBlocks(guard, s, s.x + 10), true);
});

test('a strong gust knocks a guard down; it stops blocking and climbs back later', () => {
  const s = newCapuchin(guard);
  assert.ok(!stepGuard(guard, s, 0.4, dt).knocked, 'a breeze knocked it over');
  assert.equal(stepGuard(guard, s, -0.8, dt).knocked, true);
  assert.equal(capBlocks(guard, s, s.x), false);
  for (let i = 0; i < 30 * CAP.down + 2; i++) stepGuard(guard, s, 0, dt);
  assert.equal(s.mode, 'pace');
});
