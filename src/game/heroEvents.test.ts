import test from 'node:test';
import assert from 'node:assert/strict';
import { HeroEvents, HURT_TIME, LAND_TIME, LAND_TIME_HARD } from './heroEvents.ts';

test('a hit shows the hurt pose for a moment, then it ends', () => {
  const e = new HeroEvents();
  e.track({ hp: 5, grounded: true, vy: 0 }, 10);
  e.track({ hp: 4, grounded: true, vy: 0 }, 10.1);
  assert.equal(e.isHurt(10.2), true);
  assert.equal(e.isHurt(10.1 + HURT_TIME + 0.01), false);
});

test('a hurt timer from the last stage does not carry into a new stage whose clock starts at 0', () => {
  const e = new HeroEvents();
  e.track({ hp: 5, grounded: true, vy: 0 }, 140);
  e.track({ hp: 4, grounded: true, vy: 0 }, 140.1);
  // new stage: game time restarts
  e.track({ hp: 5, grounded: true, vy: 0 }, 0.05);
  assert.equal(e.isHurt(0.05), false);
  assert.equal(e.isHurt(20), false);
});

test('even a stale timer that was never reset cannot run far past its own length', () => {
  const e = new HeroEvents();
  e.hurtUntil = 500;
  e.track({ hp: 5, grounded: true, vy: 0 }, 1);
  assert.equal(e.isHurt(1.5), false);
});

test('landing shows the land pose only briefly', () => {
  const e = new HeroEvents();
  e.track({ hp: 5, grounded: false, vy: 200 }, 3);
  e.track({ hp: 5, grounded: true, vy: 0 }, 3.05);
  assert.equal(e.isLanding(3.1), true);
  assert.equal(e.isLanding(3.5), false);
});

test('a long drop holds the landing pose longer than a hop, and never longer than the hard-landing time', () => {
  const hop = new HeroEvents();
  hop.track({ hp: 5, grounded: false, vy: 250 }, 1);
  hop.track({ hp: 5, grounded: true, vy: 0 }, 1.03);
  const drop = new HeroEvents();
  drop.track({ hp: 5, grounded: false, vy: 500 }, 1);
  drop.track({ hp: 5, grounded: false, vy: 950 }, 1.03);
  drop.track({ hp: 5, grounded: true, vy: 0 }, 1.06);
  assert.ok(drop.landUntil - 1.06 > hop.landUntil - 1.03 + 0.05, 'the hard landing lasts longer');
  assert.ok(drop.landUntil - 1.06 <= LAND_TIME_HARD + 1e-9);
  assert.ok(Math.abs(hop.landUntil - 1.03 - LAND_TIME) < 1e-9, 'a hop is the normal landing');
});

test('the fall speed of one drop is not carried into the next landing', () => {
  const e = new HeroEvents();
  e.track({ hp: 5, grounded: false, vy: 950 }, 1);
  e.track({ hp: 5, grounded: true, vy: 0 }, 1.03);
  e.track({ hp: 5, grounded: false, vy: 200 }, 2);
  e.track({ hp: 5, grounded: true, vy: 0 }, 2.03);
  assert.ok(Math.abs(e.landUntil - 2.03 - LAND_TIME) < 1e-9);
});

test('only a drop at nearly the hardest speed marks a hard landing (the tumble roll-out)', () => {
  const hard = new HeroEvents();
  hard.track({ hp: 5, grounded: false, vy: 940 }, 1);
  hard.track({ hp: 5, grounded: true, vy: 0 }, 1.05);
  assert.equal(hard.isHardLanding(1.1), true);
  assert.equal(hard.isHardLanding(1.5), false);
  const soft = new HeroEvents();
  soft.track({ hp: 5, grounded: false, vy: 600 }, 1);
  soft.track({ hp: 5, grounded: true, vy: 0 }, 1.05);
  assert.equal(soft.isHardLanding(1.1), false);
});

test('reversing at a run skids first, then turns round; the picture never holds up the physics (AN-13)', () => {
  const ev = new HeroEvents();
  const dt = 1 / 30;
  let t = 1;
  const st = (vx: number, facing: 1 | -1, grounded = true) => ({ hp: 3, grounded, vy: 0, vx, x: 100, y: 200, facing });
  for (let i = 0; i < 10; i++, t += dt) ev.track(st(285, 1), t);
  assert.equal(ev.isSkidding(t), false);
  // the thumb flips left: the engine turns him at once, his speed still carries him right
  ev.track(st(130, -1), t);
  assert.equal(ev.isSkidding(t), false, 'below skid speed: no skid');
  const ev2 = new HeroEvents();
  t = 1;
  for (let i = 0; i < 10; i++, t += dt) ev2.track(st(285, 1), t);
  ev2.track(st(200, -1), t);
  assert.ok(ev2.isSkidding(t), 'a fast reversal skids');
  assert.equal(ev2.skidDir, 1, 'facing the way he slides');
  assert.equal(ev2.puffs.length, 2, 'two puffs of dust');
  t += dt;
  ev2.track(st(40, -1), t);
  t += dt;
  ev2.track(st(-120, -1), t);
  t += dt;
  ev2.track(st(-240, -1), t);
  assert.equal(ev2.isSkidding(t), false, 'the skid ends once he moves the new way');
  assert.ok(ev2.turnPhase(t) >= 0, 'and the turn plays');
  t += 0.1;
  ev2.track(st(-285, -1), t);
  assert.equal(ev2.turnPhase(t), -1, 'the turn is over within 90 ms');
});

test('a turn in the air is instant, and a turn while busy (attacking, climbing) draws no turn', () => {
  const ev = new HeroEvents();
  ev.track({ hp: 3, grounded: false, vy: 0, vx: 100, facing: 1 }, 1);
  ev.track({ hp: 3, grounded: false, vy: 0, vx: 100, facing: -1 }, 1.03);
  assert.equal(ev.turnPhase(1.03), -1);
  ev.track({ hp: 3, grounded: true, vy: 0, vx: 0, facing: 1 }, 1.06, true);
  assert.equal(ev.turnPhase(1.06), -1);
  ev.track({ hp: 3, grounded: true, vy: 0, vx: 0, facing: 1 }, 1.1);
  ev.track({ hp: 3, grounded: true, vy: 0, vx: 0, facing: -1 }, 1.13);
  assert.ok(ev.turnPhase(1.13) >= 0, 'standing, a turn plays');
});

test('the landing goes down and back up, three frames from the hardest drop', () => {
  const ev = new HeroEvents();
  ev.track({ hp: 3, grounded: false, vy: 1000 }, 1);
  ev.track({ hp: 3, grounded: true, vy: 0 }, 1.03);
  assert.ok(ev.isHardLanding(1.03));
  assert.equal(ev.landPhase(1.03), 0);
  assert.ok(ev.landPhase(1.03 + LAND_TIME_HARD / 2) > 0.45 && ev.landPhase(1.03 + LAND_TIME_HARD / 2) < 0.55);
});
