/**
 * The one clock on the engine's fixed step (EN-W step 5; clock.ts stageClock): the engine steps the stage's clock on the line that
 * advanced `gameTime`, and `gameTime` IS the clock's time, so every existing timer (lifts, drifting logs, zones, the cheer) reads the
 * one clock and nothing moves: the same sum of the same steps, bit for bit.
 *   npx tsx --test src/game/engineClock.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';

test("the engine's game time is its stage clock's, bit for bit, and is still the plain sum of its steps", () => {
  // (planted: red before the engine held a clock, `e.clock` undefined)
  const sim = new RealPlay('1-1', 1);
  const e = sim.e;
  assert.equal(typeof e.clock?.time, 'function', 'the engine holds no stage clock');
  let sum = 0;
  for (let i = 0; i < 900; i++) {
    const before = e.gameTime;
    e.update(1 / 30);
    // (a step the engine did not count, a hold or a card, is not counted by the clock either)
    if (e.gameTime !== before) sum += 1 / 30;
    assert.ok(Object.is(e.clock.time(), e.gameTime), `step ${i}: the clock reads ${e.clock.time()}, gameTime ${e.gameTime}`);
    assert.ok(Object.is(e.gameTime, sum), `step ${i}: gameTime ${e.gameTime} is not the sum of its steps ${sum}`);
  }
  assert.ok(sum > 20, `only ${sum} s of game time in 900 steps`);
});

test('a harness that places game time places the clock, and the next step counts on from there (realPlay.ts `t`)', () => {
  // (planted: red when the engine copied the clock over `gameTime` each step, which threw away what w4LongDrop.test.ts and
  // tools/perf/frozen.mjs set: 4-7's rocks were then flown at the wrong moment of their cycle)
  const sim = new RealPlay('1-1', 1);
  const e = sim.e;
  for (let i = 0; i < 30; i++) e.update(1 / 30);
  sim.t = 123.5;
  assert.ok(Object.is(e.clock.time(), 123.5) && Object.is(e.gameTime, 123.5), `placed at 123.5, the clock reads ${e.clock.time()}`);
  e.update(1 / 30);
  assert.ok(Object.is(e.gameTime, 123.5 + 1 / 30), `one step on from 123.5 reads ${e.gameTime}`);
  assert.ok(Object.is(e.clock.time(), e.gameTime));
});
