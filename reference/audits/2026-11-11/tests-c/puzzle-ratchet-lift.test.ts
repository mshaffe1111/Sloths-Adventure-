/**
 * Audit C (puzzle), finding P-07. Asserts the CORRECT behaviour; FAILS today.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/puzzle-ratchet-lift.test.ts
 *
 * 4-6's pinwheel lift is a ratchet (`hold: true`): "it holds where it was wound to" (protoStage.ts pinwheelRoom). puzzlePlay.ts
 * stepRoom keeps it at its level whenever he is not on it (`want = ... l.spec.hold && !l.unwind ? l.level : 0`), and only the room's
 * signpost sets `unwind` (resetRoom). So once he has ridden it up, any drop back to the room's floor (a step back off the ledge, a
 * missed jump higher up in this ascent stage) leaves the plank 260 px over his head for good: "too high to jump to". The code's own
 * reason for the rule is the opposite case ("wound up empty it would leave him below"). Nothing tells him the signpost is the way:
 * the room's stuck lines are about the lever, which is already pulled, and Dot points at the raised plank (focus() -> the exit).
 *
 * Correct: with him back on the floor below it, the lift comes back down for him (or the room says how to bring it down).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import type { KitPlay } from '../../../../src/game/puzzlePlay.ts';

test('P-07: 4-6: he rides the pinwheel lift up, drops back to the floor, and can ride it again', () => {
  const r = new RealPlay('4-6', 1);
  const kit = r.e.kit as KitPlay;
  const room = kit.rooms[0];
  const lift = room.lifts[0];
  const floor = r.platforms.find((p) => p.id === room.spec.ground[0])!;
  // on the lift, the lever pulled from it (as w4Puzzles.test.ts plays it), wound right up by the gusts
  r.stand(lift.plat.x + 14, lift.plat.y);
  r.frame({ left: true });
  r.frame();
  r.frame({ punch: true });
  r.frame();
  assert.equal(room.levers[0].on, true, 'the lever is pulled');
  r.wait(16);
  assert.ok(lift.level >= 0.999, `wound right up (${lift.level.toFixed(2)})`);
  // back down on the room's floor (a step back off the plank's left edge)
  r.stand(floor.x + floor.width - 60, floor.y);
  r.wait(12);
  const said = r.said.map((s) => s.text);
  assert.ok(lift.level < 0.05, `12 s later the plank still hangs ${Math.round(lift.baseY - lift.plat.y)} px over the floor (level ${lift.level.toFixed(2)}), the lever is on (${room.levers[0].on}), and all Dot said in the room was: ${said.join(' | ')}`);
});
