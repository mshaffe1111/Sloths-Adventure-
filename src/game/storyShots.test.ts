import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraAt, poseAt, shakeAt, flashAt, type PoseKey } from './storyShots.ts';

test('the camera starts on its first shot, ends on its last, and holds it', () => {
  const m = { from: { zoom: 1, fx: 0.4, fy: 0.5 }, to: { zoom: 2, fx: 0.8, fy: 0.7 }, dur: 4 };
  assert.deepEqual(cameraAt(m, 0), m.from);
  assert.deepEqual(cameraAt(m, 4), m.to);
  assert.deepEqual(cameraAt(m, 99), m.to);
  const mid = cameraAt(m, 2);
  assert.ok(mid.zoom > 1 && mid.zoom < 2);
});

test('a pose timeline switches frames on time and carries offsets forward', () => {
  const keys: PoseKey[] = [
    { at: 0, frame: 'guard' },
    { at: 1, frame: 'punch', dx: 0.1, dur: 0.5, ease: 'linear' },
    { at: 3, frame: 'idle' },
  ];
  assert.equal(poseAt(keys, 0.5).frame, 'guard');
  assert.equal(poseAt(keys, 0.5).dx, 0);
  const mid = poseAt(keys, 1.25);
  assert.equal(mid.frame, 'punch');
  assert.ok(Math.abs(mid.dx - 0.05) < 1e-9, 'half way there');
  assert.equal(poseAt(keys, 2).dx, 0.1);
  assert.equal(poseAt(keys, 5).frame, 'idle');
  assert.equal(poseAt(keys, 5).dx, 0.1, 'an offset stays until a later key changes it');
});

test('a walk loops its frames at the given rate and a flip is remembered', () => {
  const keys: PoseKey[] = [{ at: 1, frame: ['a', 'b', 'c'], fps: 2, flip: true }];
  assert.equal(poseAt(keys, 1).frame, 'a');
  assert.equal(poseAt(keys, 1.5).frame, 'b');
  assert.equal(poseAt(keys, 2).frame, 'c');
  assert.equal(poseAt(keys, 2.5).frame, 'a');
  assert.equal(poseAt(keys, 1.2).flip, true);
});

test('before its first key an actor shows that first key', () => {
  assert.equal(poseAt([{ at: 2, frame: 'x' }], 0).frame, 'x');
});

test('shake and flash only act inside their moment and fade out', () => {
  const fx = [{ at: 1, kind: 'shake' as const, amount: 10, dur: 0.4 }, { at: 1, kind: 'flash' as const, dur: 0.2 }];
  assert.deepEqual(shakeAt(fx, 0.5), [0, 0]);
  assert.deepEqual(shakeAt(fx, 2), [0, 0]);
  assert.ok(Math.abs(shakeAt(fx, 1.05)[0]) + Math.abs(shakeAt(fx, 1.05)[1]) > 0);
  assert.equal(flashAt(fx, 0.9), 0);
  assert.ok(flashAt(fx, 1.0) > 0.8);
  assert.equal(flashAt(fx, 1.3), 0);
});
