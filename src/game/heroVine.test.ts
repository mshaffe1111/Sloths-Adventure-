import test from 'node:test';
import assert from 'node:assert/strict';
import { vinePose, vineTrail, VINE_TRAIL_MAX } from './heroVine.ts';
import { VINE_FRAMES } from './heroVineData.ts';

test('on a vine his body trails behind the swing, never far, and hangs straight at the ends of the swing', () => {
  assert.equal(vineTrail(0), 0, 'at the end of a swing (no speed) he hangs along the vine');
  assert.ok(vineTrail(1.5) > 0, 'swinging his feet to the right, they lag to the left (a clockwise turn about his hands)');
  assert.equal(vineTrail(-1.5), -vineTrail(1.5));
  assert.equal(vineTrail(20), VINE_TRAIL_MAX, 'capped');
});

test('through a swing he goes from hanging straight, through the in-between, to the full kick or trail, and back', () => {
  const seq = [0, 0.1, 0.2, 0.3, 0.45, 0.6].map((a) => vinePose(a, 1, 1));
  assert.deepEqual(seq, ['still', 'still', 'stillfwd', 'stillfwd', 'forward', 'forward']);
  assert.equal(vinePose(0.3, -1, 1), 'stillback');
  assert.equal(vinePose(0.5, -1, 1), 'back');
  for (const n of ['still', 'stillfwd', 'forward', 'stillback', 'back'] as const) assert.ok(VINE_FRAMES[n], n);
});
