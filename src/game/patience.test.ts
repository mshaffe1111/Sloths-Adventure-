import test from 'node:test';
import assert from 'node:assert/strict';
import { PATIENCE, frondSolid, isStill, mistReveal, newPatience, onSpot, stepPatience, type PatienceSpot } from './patience.ts';

const frond: PatienceSpot = { kind: 'frond', x0: 100, x1: 160, y: 500, fill: 3, platformId: 7 };
const mist: PatienceSpot = { kind: 'mist', x0: 100, x1: 160, y: 500, fill: 2, hides: [8, 9] };

/** run `secs` of frames at 30 fps */
const run = (s: PatienceSpot, st = newPatience(), secs: number, here: boolean, still: boolean) => {
  for (let i = 0; i < Math.round(secs * 30); i++) st = stepPatience(s, st, here, still, 1 / 30);
  return st;
};

test('a frond unrolls after standing still on its spot for its fill time, and stays unrolled', () => {
  let st = run(frond, newPatience(), frond.fill + PATIENCE.settle + 0.1, true, true);
  assert.equal(frondSolid(st), true);
  st = run(frond, st, 5, false, false);
  assert.equal(frondSolid(st), true, 'an unrolled frond rolled back up');
});

test('a frond left half way just stops: moving never undoes it, and finishing it takes only the rest', () => {
  let st = run(frond, newPatience(), PATIENCE.settle + frond.fill / 2, true, true);
  const half = st.level;
  assert.ok(half > 0.4 && half < 0.6, `level ${half}`);
  st = run(frond, st, 4, true, false);
  assert.equal(st.level, half, 'moving changed the frond');
  st = run(frond, st, PATIENCE.settle + frond.fill / 2 + 0.1, true, true);
  assert.equal(frondSolid(st), true);
});

test('a pause shorter than the settle time does not start a frond (a run that merely stops for a moment)', () => {
  const st = run(frond, newPatience(), PATIENCE.settle - 0.1, true, true);
  assert.equal(st.level, 0);
});

test('the mist shows the ledges once settled, and rises again when he moves', () => {
  let st = run(mist, newPatience(), PATIENCE.settle + mist.fill, true, true);
  assert.equal(mistReveal(st), 1);
  st = run(mist, st, 1, true, false);
  assert.ok(mistReveal(st) < 1, 'moving left the mist down');
  st = run(mist, st, 1 / PATIENCE.ebb + 0.1, false, false);
  assert.equal(st.level, 0);
  assert.equal(mistReveal(st), 0);
});

test('standing still off the spot does nothing', () => {
  const st = run(mist, newPatience(), 5, false, true);
  assert.equal(st.level, 0);
});

test('on the spot means his middle inside it and his feet near its height; still means slow and on the ground', () => {
  assert.equal(onSpot(frond, 130, 500), true);
  assert.equal(onSpot(frond, 99, 500), false);
  assert.equal(onSpot(frond, 130, 500 - PATIENCE.reach - 1), false);
  assert.equal(isStill({ vx: 5, grounded: true }), true);
  assert.equal(isStill({ vx: 5, grounded: false }), false);
  assert.equal(isStill({ vx: 60, grounded: true }), false);
});
