import test from 'node:test';
import assert from 'node:assert/strict';
import { padIntent, followAnchor, clampKnob, PAD } from './padControl.ts';

test('a thumb at rest does nothing, and a small wobble is ignored', () => {
  assert.deepEqual(padIntent(0, 0), { move: 'none', duck: false, up: false });
  assert.deepEqual(padIntent(PAD.dead - 1, 6), { move: 'none', duck: false, up: false });
});

test('sideways runs, either way', () => {
  assert.equal(padIntent(30, 0).move, 'right');
  assert.equal(padIntent(-30, 0).move, 'left');
});

test('down ducks and up jumps', () => {
  assert.equal(padIntent(0, 40).duck, true);
  assert.equal(padIntent(0, -45).up, true);
  assert.equal(padIntent(0, -45).duck, false);
});

test('running with a little downward drift never ducks or jumps', () => {
  assert.equal(padIntent(40, 34).duck, false);
  assert.equal(padIntent(-40, -40).up, false);
  assert.equal(padIntent(40, 34).move, 'right');
});

test('the anchor follows a thumb that runs past the radius, so reversing is instant', () => {
  assert.equal(followAnchor(100, 120), 100);
  const a = followAnchor(100, 100 + PAD.radius + 30);
  assert.equal(a, 100 + 30);
  assert.equal(padIntent(100 + PAD.radius + 30 - a, 0).move, 'right');
  assert.equal(padIntent(a - PAD.radius - 5 - a, 0).move, 'left');
});

test('the knob stays inside the ring', () => {
  const k = clampKnob(200, 0);
  assert.equal(Math.round(k.x), PAD.radius);
  assert.equal(k.y, 0);
  assert.deepEqual(clampKnob(10, -5), { x: 10, y: -5 });
});
