import test from 'node:test';
import assert from 'node:assert/strict';
import { FALLS, fallPush, inFall, plugged, poolLogY, stepFlow, stepPool, surgeFlow, type Pool, type Waterfall } from './waterfalls.ts';

const fall: Waterfall = { id: 1, x: 400, width: 80, top: 200, bottom: 700, plug: { platformId: 5, atX: 300 } };
const surge: Waterfall = { id: 2, x: 900, width: 80, top: 200, bottom: 700, surge: { pour: 3, ease: 1, quiet: 2.5, offset: 0 } };
const pool: Pool = { fedBy: 1, platformId: 9, fullY: 520, emptyY: 680 };

const settle = (w: Waterfall, flow: number, isPlugged: boolean, secs: number, t0 = 0) => {
  for (let i = 0; i < secs * 30; i++) flow = stepFlow(w, flow, isPlugged, t0 + i / 30, 1 / 30);
  return flow;
};

test('a boulder in the channel dries the fall; rolled back out, the fall pours again', () => {
  const at = new Map([[5, 120]]);
  assert.equal(plugged(fall, (id) => at.get(id)), false);
  at.set(5, 300);
  assert.equal(plugged(fall, (id) => at.get(id)), true);
  let flow = settle(fall, 1, true, FALLS.dry + 0.1);
  assert.equal(flow, 0);
  flow = settle(fall, flow, false, FALLS.dry + 0.1);
  assert.equal(flow, 1);
});

test('a surge fall pours, eases (the warning), then goes quiet, on its own rhythm', () => {
  const s = surge.surge!;
  assert.equal(surgeFlow(s, 1.5), 1);
  const easing = surgeFlow(s, s.pour + s.ease / 2);
  assert.ok(easing > 0.3 && easing < 0.7, `easing ${easing}`);
  assert.equal(surgeFlow(s, s.pour + s.ease + 1), 0);
  // and it comes round again
  assert.equal(surgeFlow(s, s.pour + s.ease + s.quiet + 1.5), 1);
});

test('the pool drains slowly after its fall is plugged, and its log sinks with it', () => {
  let level = 1;
  for (let i = 0; i < 30; i++) level = stepPool(level, 0, 1 / 30);
  assert.ok(level > 0 && level < 1, 'a pool should take its time');
  for (let i = 0; i < FALLS.drain * 30; i++) level = stepPool(level, 0, 1 / 30);
  assert.equal(level, 0);
  assert.equal(poolLogY(pool, 1), pool.fullY);
  assert.equal(poolLogY(pool, 0), pool.emptyY);
});

test('pouring water pushes him down in the air and slows his walk; a trickle does nothing', () => {
  const air = fallPush(1, { vx: 200, vy: -400, grounded: false }, 1 / 30);
  assert.ok(air.vy > -400, 'a jump into the fall was not pushed down');
  const walk = fallPush(1, { vx: 200, vy: 0, grounded: true }, 1 / 30);
  assert.ok(Math.abs(walk.vx - 200 * FALLS.wade) < 1);
  const trickle = fallPush(FALLS.trickle, { vx: 200, vy: -400, grounded: false }, 1 / 30);
  assert.deepEqual(trickle, { vx: 200, vy: -400 });
});

test('inside a fall means between its edges and overlapping its height', () => {
  assert.equal(inFall(fall, 440, 500, 48), true);
  assert.equal(inFall(fall, 390, 500, 48), false);
  assert.equal(inFall(fall, 440, 190, 48), false);
});
