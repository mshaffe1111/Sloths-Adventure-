import test from 'node:test';
import assert from 'node:assert/strict';
import { airLean, flipFrame, flipPose } from './heroSprite.ts';

test('the air lean is a little back going up, forward coming down, and never extreme', () => {
  assert.ok(airLean(-640) < 0 && airLean(-640) >= -0.1);
  assert.ok(airLean(950) > 0 && airLean(950) <= 0.22);
  assert.equal(airLean(0), 0);
  assert.ok(airLean(300) > airLean(100), 'it grows smoothly with the fall speed');
});

test('the double jump turns exactly once and then stays upright, whatever the engine keeps counting', () => {
  assert.equal(flipPose(0).angle, 0);
  const half = flipPose(Math.PI);
  assert.ok(Math.abs(half.angle - Math.PI) < 1e-9, 'half way through the engine angle is half a turn');
  for (const a of [Math.PI * 2, Math.PI * 4, 40]) {
    const f = flipPose(a);
    assert.equal(f.u, 1);
    assert.ok(Math.abs(f.angle - Math.PI * 2) < 1e-9, 'one full turn, not more');
  }
  // the other direction turns the other way
  assert.ok(flipPose(-3).angle < 0);
  // never goes backwards while the engine angle grows
  let last = -1;
  for (let a = 0; a <= 7; a += 0.1) {
    const v = flipPose(a).angle;
    assert.ok(v >= last - 1e-12);
    last = v;
  }
});

test('the flip is stretched at launch, curled in the middle and open at the end', () => {
  assert.equal(flipFrame(0), 'jump_up');
  assert.equal(flipFrame(0.5), 'duck');
  assert.equal(flipFrame(0.95), 'fall');
  assert.equal(flipFrame(1), 'fall');
});
