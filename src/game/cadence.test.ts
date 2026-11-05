import test from 'node:test';
import assert from 'node:assert/strict';
import { cadenceBreaches } from './cadence.ts';

test('cadence: a ramp that cools passes; a flat 6-7 run from slot 3 on, a peak that never cools, and a front-loaded stage fail', () => {
  assert.deepEqual(cadenceBreaches([1, 2, 3, 5, 2, 4, 6, 3, 1, 5, 7, 4, 1]), []);
  assert.match(cadenceBreaches([1, 2, 6, 7, 6, 7, 6, 7, 1]).join(';'), /flat: slots 3-6/);
  assert.match(cadenceBreaches([1, 3, 6, 5, 5, 1, 2, 7, 3]).join(';'), /no cool-down: slot 3/);
  assert.match(cadenceBreaches([8, 2, 1, 3, 2, 4, 1, 2, 1]).join(';'), /no ramp/);
});
