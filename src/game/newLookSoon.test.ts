import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEW_LOOK_SOON, newLookSoon } from './newLookSoon.ts';

test('the "New look coming soon" tag is on Worlds 9 and 10 only, from the list each rebuild trims (World 8 rebuilt, 2026-10-31)', () => {
  assert.deepEqual([...NEW_LOOK_SOON], [9, 10]);
  for (let w = 1; w <= 10; w++) assert.equal(newLookSoon(w), w >= 9, `World ${w}`);
});

test('UI-20: the store build never shows the tag', () => {
  for (let w = 1; w <= 10; w++) assert.equal(newLookSoon(w, true), false, `World ${w}`);
  assert.equal(newLookSoon(9, false), true);
});
