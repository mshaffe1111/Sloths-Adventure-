import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeBest } from './stageBest.ts';

test('each best is kept with the mode it was set on (LV-1)', () => {
  const first = mergeBest(null, { stars: 2, score: 1000, time: 150 }, 'easy');
  assert.deepEqual(first, { completed: true, stars: 2, highScore: 1000, bestTime: 150, starsMode: 'easy', scoreMode: 'easy', timeMode: 'easy' });
  // a worse replay on Normal: nothing is overwritten, the modes stay
  const worse = mergeBest(first, { stars: 1, score: 400, time: 200 }, 'normal');
  assert.deepEqual(worse, first);
  // a better score and time on Normal: those two move to Normal, the stars stay Easy's
  const mixed = mergeBest(first, { stars: 2, score: 1300, time: 120 }, 'normal');
  assert.equal(mixed.highScore, 1300);
  assert.equal(mixed.scoreMode, 'normal');
  assert.equal(mixed.timeMode, 'normal');
  assert.equal(mixed.stars, 2);
  assert.equal(mixed.starsMode, 'normal', 'the same two stars, now on Normal, count as Normal');
  // an old record with no mode keeps its results
  const old = mergeBest({ completed: true, stars: 3, highScore: 900, bestTime: 100 }, { stars: 1, score: 100, time: 300 }, 'easy');
  assert.deepEqual(old, { completed: true, stars: 3, highScore: 900, bestTime: 100 });
});
