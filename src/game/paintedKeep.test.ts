import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setsToDrop, KEEP_WORLDS, BACKDROP_WAIT_MS, FADE_IN_MS, stageUsesCanopy } from './paintedBackdrops.ts';

test('the decoded backdrops are counted by world, not by set (VI-3)', () => {
  assert.equal(KEEP_WORLDS, 2);
  // World 5's dusk set on screen, the twilight set for the next stage just in: World 4's set stays (two worlds), both World 5 sets
  // too (counting sets, the dusk one on screen went)
  assert.deepEqual(setsToDrop(['w4', 'w5dusk1', 'w5twi1'], 'w5twi1'), []);
  assert.deepEqual(setsToDrop(['w3', 'w4', 'w5dusk1', 'w5twi1'], 'w5twi1'), ['w3']);
  // two worlds only: nothing goes
  assert.deepEqual(setsToDrop(['w4', 'w5dusk1'], 'w5dusk1'), []);
  // a third set of one world: its oldest goes
  assert.deepEqual(setsToDrop(['w5gold2', 'w5dusk1', 'w5twi1'], 'w5twi1'), ['w5gold2']);
  // the set just decoded is never dropped, even when it is the oldest in the order
  assert.deepEqual(setsToDrop(['w3', 'w1', 'w2'], 'w3'), ['w1']);
});

test('the stage waits for its backdrop, and a late one fades in (VI-3)', () => {
  assert.equal(BACKDROP_WAIT_MS, 2500);
  assert.ok(FADE_IN_MS >= 250 && FADE_IN_MS <= 300);
  assert.ok(stageUsesCanopy({ id: '1-8', objectiveType: 'collect' }), '1-8 runs the long branch high in the canopy');
  assert.ok(stageUsesCanopy({ id: '1-4', objectiveType: 'ascent' }));
  assert.ok(!stageUsesCanopy({ id: '1-2', objectiveType: 'collect' }));
});
