import test from 'node:test';
import assert from 'node:assert/strict';
import { leanFromOrientation, tiltDirection } from './controls.ts';

test('portrait uses gamma, landscape uses beta with the sign of the rotation', () => {
  assert.equal(leanFromOrientation(40, 12, 0), 12);
  assert.equal(leanFromOrientation(40, 12, 90), 40);
  assert.equal(leanFromOrientation(40, 12, 270), -40);
  assert.equal(leanFromOrientation(40, 12, -90), -40);
  assert.equal(leanFromOrientation(40, 12, 180), -12);
});

test('tilt has a dead zone and does not flicker at the edge', () => {
  assert.equal(tiltDirection(3, 'none'), 'none');
  assert.equal(tiltDirection(-3, 'none'), 'none');
  assert.equal(tiltDirection(9, 'none'), 'right');
  assert.equal(tiltDirection(-9, 'none'), 'left');
  // once running right, a lean of 5 (inside the entry zone but outside the leave zone) keeps running
  assert.equal(tiltDirection(5, 'right'), 'right');
  assert.equal(tiltDirection(3, 'right'), 'none');
  // and it can swing straight to the other side
  assert.equal(tiltDirection(-9, 'right'), 'left');
});
