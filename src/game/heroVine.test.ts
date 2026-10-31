import test from 'node:test';
import assert from 'node:assert/strict';
import { vineTrail, VINE_TRAIL_MAX } from './heroVine.ts';

test('on a vine his body trails behind the swing, never far, and hangs straight at the ends of the swing', () => {
  assert.equal(vineTrail(0), 0, 'at the end of a swing (no speed) he hangs along the vine');
  assert.ok(vineTrail(1.5) > 0, 'swinging his feet to the right, they lag to the left (a clockwise turn about his hands)');
  assert.equal(vineTrail(-1.5), -vineTrail(1.5));
  assert.equal(vineTrail(20), VINE_TRAIL_MAX, 'capped');
});
