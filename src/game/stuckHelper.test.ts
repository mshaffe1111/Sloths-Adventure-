import test from 'node:test';
import assert from 'node:assert/strict';
import { StuckWatch, STUCK_TRIES } from './stuckHelper.ts';

/** one jump: take off at x, land back at x2 and height y2 */
function hop(w: StuckWatch, x: number, wall: boolean, opts: { x2?: number; y2?: number; dbl?: boolean } = {}) {
  let spoke = false;
  spoke = w.tick({ grounded: true, x, y: 580, doubleJumping: false, wallAhead: wall }) || spoke;
  spoke = w.tick({ grounded: false, x, y: 560, doubleJumping: false, wallAhead: wall }) || spoke;
  spoke = w.tick({ grounded: false, x, y: 480, doubleJumping: !!opts.dbl, wallAhead: wall }) || spoke;
  spoke = w.tick({ grounded: true, x: opts.x2 ?? x + 20, y: opts.y2 ?? 580, doubleJumping: false, wallAhead: wall }) || spoke;
  return spoke;
}

test('stuck-helper: three single jumps at a tall wall, landing where they began, and Dot speaks once', () => {
  const w = new StuckWatch();
  const said = Array.from({ length: STUCK_TRIES + 3 }, () => hop(w, 1000, true));
  assert.deepEqual(said.map(Number), [0, 0, 1, 0, 0, 0]);
});

test('stuck-helper: jumps with no wall ahead, or that use the second jump, or that get up, never count', () => {
  const a = new StuckWatch();
  assert.ok(![1, 2, 3, 4, 5].some(() => hop(a, 1000, false)), 'no wall');
  const b = new StuckWatch();
  assert.ok(![1, 2, 3, 4, 5].some(() => hop(b, 1000, true, { dbl: true })), 'the second jump was used');
  const c = new StuckWatch();
  hop(c, 1000, true);
  hop(c, 1000, true);
  hop(c, 1000, true, { y2: 430 }); // got up
  assert.equal(hop(c, 1200, true), false, 'the count started again');
});
