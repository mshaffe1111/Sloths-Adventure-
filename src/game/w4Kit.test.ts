import test from 'node:test';
import assert from 'node:assert/strict';
import { DOT_HELP, chimeLean, newKnot, stepKnot, underKnot, type DotKnot } from './w4Kit.ts';
import { idleTime, type Zone } from './zones.ts';

const gust: Zone = { kind: 'wind', x0: 0, x1: 1000, top: 0, bottom: 800, baseY: 700, dir: 1, period: 8, warn: 1.2, active: 2.4, offset: 0, force: 140 };

test('the chimes hang still between gusts, ring toward the coming gust while it warns, and lean with it while it blows', () => {
  const idle = chimeLean(gust, 1);
  assert.ok(Math.abs(idle.angle) < 0.05 && !idle.ringing);
  const t0 = idleTime(gust);
  let toward = 0;
  for (let t = t0; t < t0 + gust.warn; t += 0.05) {
    const c = chimeLean(gust, t);
    assert.equal(c.ringing, true);
    if (c.angle > 0) toward++;
  }
  assert.ok(toward > 0.9 * (gust.warn / 0.05), 'the warning swing should point the way the gust blows');
  const blowing = chimeLean(gust, t0 + gust.warn + gust.active / 2);
  assert.ok(blowing.angle > 0.4);
  const left = chimeLean({ ...gust, dir: -1 }, t0 + gust.warn + gust.active / 2);
  assert.ok(left.angle < -0.4);
});

const knot: DotKnot = { x: 600, y: 200, x0: 560, x1: 640, ground: 700, releases: { kind: 'vine', id: 3 } };

test('standing still under a knot sends Dot up; she flies, picks it, and it comes free', () => {
  let k = newKnot();
  for (let i = 0; i < Math.ceil(DOT_HELP.ask * 30) + 1; i++) k = stepKnot(k, true, 1 / 30);
  assert.equal(k.phase, 'flying');
  // walking off now does not call her back
  for (let i = 0; i < Math.ceil((DOT_HELP.fly + DOT_HELP.pick) * 30) + 2; i++) k = stepKnot(k, false, 1 / 30);
  assert.equal(k.phase, 'free');
});

test('passing under a knot without stopping does not send her', () => {
  let k = newKnot();
  for (let i = 0; i < 30; i++) k = stepKnot(k, i % 10 < 5, 1 / 30);
  assert.equal(k.phase, 'tied');
});

test('under the knot means inside its spot, on its ground', () => {
  assert.equal(underKnot(knot, 600, 700), true);
  assert.equal(underKnot(knot, 700, 700), false);
  assert.equal(underKnot(knot, 600, 600), false);
});
