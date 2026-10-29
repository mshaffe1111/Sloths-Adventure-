import test from 'node:test';
import assert from 'node:assert/strict';
import { ROPE_STRIDE, ropeFrame, ropeSway } from './heroRope.ts';
import { ROPE_CYCLE, ROPE_FRAMES, ROPE_STILL } from './heroRopeData.ts';
import { HeroEvents } from './heroEvents.ts';
import { ROPE_DIP, ropeDip, ropeDrawY } from './ropeArt.ts';
import { ROPE_SPEED, ropeYAt } from './rope.ts';
import type { Rope } from './types.ts';

test('a creep starts on the first picture of the cycle and runs through every one, one cycle a stride', () => {
  assert.equal(ropeFrame(true, 0), ROPE_CYCLE[0]);
  const seen = new Set<string>();
  for (let d = 0; d < ROPE_STRIDE; d += ROPE_STRIDE / 97) seen.add(ropeFrame(true, d));
  assert.equal(seen.size, new Set(ROPE_CYCLE).size, 'every picture of the cycle shows over one stride');
  assert.equal(ropeFrame(true, ROPE_STRIDE + 0.01), ROPE_CYCLE[0], 'and it begins again');
  // the paws keep a believable pace at his creeping speed: between 0.6 and 2 hand-over-hand cycles a second
  const perSec = ROPE_SPEED / ROPE_STRIDE;
  assert.ok(perSec > 0.6 && perSec < 2, `${perSec.toFixed(2)} cycles a second`);
});

test('hanging still is the one-paw picture, with a gentle sway', () => {
  assert.equal(ropeFrame(false, 123), ROPE_STILL);
  for (let t = 0; t < 4; t += 0.1) assert.ok(Math.abs(ropeSway(false, 0, t)) <= 0.05 + 1e-9);
});

test('every picture hangs from its grip on the rope line', () => {
  for (const f of Object.values(ROPE_FRAMES)) {
    assert.ok(f.gy >= 0 && f.gy < f.h * 0.15, 'the grip is at the top of the picture');
    assert.ok(f.ax > 0 && f.ax < f.w, 'the torso is inside the picture');
  }
});

test('each creep counts its travel from where it began, and hanging still is no travel', () => {
  const ev = new HeroEvents();
  const p = { hp: 3, grounded: false, vy: 0, hanging: true, vx: 0, walkCycle: 50 };
  ev.track(p, 1);
  assert.equal(ev.ropeTravel, 0);
  p.vx = ROPE_SPEED;
  ev.track(p, 1.03);
  assert.equal(ev.ropeTravel, 0, 'the first frame of a creep is the start of the cycle');
  p.walkCycle += 10 * 0.08;
  ev.track(p, 1.06);
  assert.ok(Math.abs(ev.ropeTravel - 10) < 1e-6);
  p.vx = 0;
  ev.track(p, 1.1);
  assert.equal(ev.ropeTravel, 0);
  p.vx = -ROPE_SPEED;
  p.walkCycle += 3;
  ev.track(p, 1.13);
  assert.equal(ev.ropeTravel, 0, 'a new creep starts the cycle again');
});

test('the rope gives under him: nothing at the posts, most when he is in the middle, his hands at the bottom of the V', () => {
  const r: Rope = { id: 1, x0: 100, x1: 600, y: 200, g0: 346, g1: 346, required: true };
  assert.equal(ropeDip(r, r.x0, 350, 1), 0);
  assert.equal(ropeDip(r, r.x1, 350, 1), 0);
  assert.ok(Math.abs(ropeDip(r, 350, 350, 1) - ROPE_DIP) < 1e-9);
  assert.ok(ropeDip(r, 150, 150, 1) < ROPE_DIP * 0.5, 'near a post the rope barely gives');
  for (let x = r.x0; x <= r.x1; x += 25) assert.ok(ropeDip(r, x, 260, 1) <= ropeDip(r, 260, 260, 1) + 1e-9);
  assert.equal(ropeDip(r, 300, 350, 0), 0, 'no weight, no give');
  // the drawing only: where it is drawn is the rope's own sag plus the give
  assert.equal(ropeDrawY(r, 300), ropeYAt(r, 300));
  assert.ok(ropeDrawY(r, 300, { id: 1, x: 300, amt: 1 }) > ropeYAt(r, 300));
  assert.equal(ropeDrawY(r, 300, { id: 2, x: 300, amt: 1 }), ropeYAt(r, 300), 'another rope is not his');
});
