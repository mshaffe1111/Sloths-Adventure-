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
