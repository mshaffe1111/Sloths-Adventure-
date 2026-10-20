import test from 'node:test';
import assert from 'node:assert/strict';
import { COACH, TouchCoach, firstJumpSpot, type CoachStep } from './touchCoach.ts';

function make(spot: number | null = 600) {
  const seen: CoachStep[] = [];
  let done = 0;
  const c = new TouchCoach('screen', (s) => seen.push(s), () => done++);
  c.setCourse(100, spot);
  return { c, seen, done: () => done };
}
/** run the lesson forward: the hero at x for this many seconds */
function stay(c: TouchCoach, x: number, secs: number) {
  for (let t = 0; t < secs; t += 1 / 30) c.update(1 / 30, x, false);
}

test('it waits a moment, then asks for a run', () => {
  const { c, seen } = make();
  stay(c, 100, COACH.startDelay - 0.2);
  assert.equal(c.step, null);
  stay(c, 100, 0.5);
  assert.equal(c.step, 'run');
  assert.deepEqual(seen, ['run']);
});

test('running far enough clears the hint, and the jump hint comes just before the first thing to jump', () => {
  const { c } = make(600);
  stay(c, 100, 1.5);
  c.update(1 / 30, 100 + COACH.runDone + 5, false);
  assert.equal(c.step, null, 'run learned');
  c.update(1 / 30, 600 - COACH.jumpLead - 20, false);
  assert.equal(c.step, null, 'not yet');
  c.update(1 / 30, 600 - COACH.jumpLead + 5, false);
  assert.equal(c.step, 'jump');
});

test('the jump ends it with a well done, then it is gone for good', () => {
  const { c, seen, done } = make(600);
  stay(c, 100, 1.5);
  c.update(1 / 30, 300, false);
  c.update(1 / 30, 320, false);
  c.update(1 / 30, 330, true);
  assert.equal(c.step, 'nice');
  stay(c, 330, COACH.niceFor + 0.1);
  assert.equal(c.step, null);
  assert.equal(done(), 1);
  assert.ok(c.done);
  assert.deepEqual(seen, ['run', null, 'jump', 'nice', null]);
});

test('someone who jumps before being asked does not get the lesson', () => {
  const { c, done } = make();
  stay(c, 100, 0.3);
  c.update(1 / 30, 120, true);
  assert.equal(c.step, null);
  assert.ok(c.done);
  assert.equal(done(), 1);
});

test('with nothing to jump for, the jump hint still comes after a long run', () => {
  const { c } = make(null);
  stay(c, 100, 1.5);
  c.update(1 / 30, 300, false);
  c.update(1 / 30, 100 + COACH.jumpFallback + 1, false);
  assert.equal(c.step, 'jump');
});

test('the first thing to jump for is a hole or a ledge, not something floating high above the ground', () => {
  const ground = 500;
  // flat ground, then a pit, then more ground
  const pit = [{ x: 0, y: ground, width: 600 }, { x: 740, y: ground, width: 600 }];
  assert.equal(firstJumpSpot(pit, 100, ground), 600, 'the edge of the pit');
  // a ledge to hop up onto
  const step = [{ x: 0, y: ground, width: 2000 }, { x: 500, y: ground - 40, width: 200 }];
  assert.equal(firstJumpSpot(step, 100, ground), 500);
  // a platform far above (a bonus row) is not in the way
  const high = [{ x: 0, y: ground, width: 2000 }, { x: 500, y: ground - 220, width: 200 }];
  assert.equal(firstJumpSpot(high, 100, ground), null);
  // ground only: nothing
  assert.equal(firstJumpSpot([{ x: 0, y: ground, width: 3000 }], 100, ground), null);
});
