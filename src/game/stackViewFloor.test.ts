/**
 * The view's foot over a stacked leg's earth (DRESS-27c, BUILD-27f's finding 1): upright on 2-7's raised out leg the camera framed past
 * the end of that leg's soil (the stand-in underside's column seams over a dark strip, the race leg's backdrop seen from above). The
 * camera now holds its foot at groundStack.ts viewFloor while he stands over a ceiling (engine.ts's camera, protoArt.ts stackViewFloor):
 *   1. on the upper earth inside a ceiling's run: the highest the line comes over the view, less the underside's reach into the soil;
 *   2. on the lower leg (his feet under the line), past every run's end, or with no ceilings: null (the view frames as before);
 *   3. a view running past a run's end: the line slants down into the hillside there, so the run's own line is still the floor;
 *   4. the reach: the stand-in band's 56 in a world with no painted underside strips.
 *   npx tsx --test src/game/stackViewFloor.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { STEP, underReach, viewFloor, type Ceiling } from './groundStack.ts';

/** a ceiling's line from x0, n samples STEP apart */
const line = (x0: number, n: number, y: (i: number) => number): Ceiling => ({ x0, x1: x0 + (n - 1) * STEP, ys: Array.from({ length: n }, (_, i) => y(i)), lower: [] });
const flat = line(1000, 101, () => 1120); // x 1000..2600, y 1120

test('1. on the upper earth over a ceiling: the line less the reach', () => {
  assert.equal(viewFloor([flat], 1500, 1940, 1640, 747, 56), 1120 - 56);
  // (the line wobbles up and down along the run: the view's highest point of it)
  const rising = line(1000, 101, (i) => 1180 - i);
  assert.equal(viewFloor([rising], 1500, 1940, 1640, 747, 0), 1180 - (1940 - 1000) / STEP);
});

test('2. on the lower leg, past the run, or no ceiling: null', () => {
  assert.equal(viewFloor([flat], 1500, 1940, 1640, 1500, 56), null, 'his feet under the line: the lower leg');
  assert.equal(viewFloor([flat], 2700, 3140, 2900, 747, 56), null, 'past the run\'s end');
  assert.equal(viewFloor([], 1500, 1940, 1640, 747, 56), null, 'no leg stacked');
});

test('3. a view past the run\'s end: the run\'s own line is the floor (its ends slant down)', () => {
  assert.equal(viewFloor([flat], 2400, 2840, 2500, 747, 56), 1120 - 56);
  assert.equal(viewFloor([flat], 700, 1140, 1100, 747, 56), 1120 - 56);
});

test('4. the stand-in\'s reach where a world has no painted underside', () => {
  assert.equal(underReach(-1), 56);
});
