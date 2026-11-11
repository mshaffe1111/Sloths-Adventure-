/**
 * ENGINE-AUDIT-C finding C-07 (2026-11-11). Asserts the CORRECT behaviour; FAILS on t-int-1-1 @ fa5ad9d1.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/dot-coach-marked-early.test.ts
 *
 * The DOT-1 rule (tipMemory.ts, dotSay.ts keep): a tip or lesson counts as taught only once its line has been SHOWN. The first-stage
 * coach was not brought under it: engine.start() writes "coach done" and "the gap lesson is seen" to the phone the moment the stage
 * starts, before a word of it has been said (engine.ts start(): `markCoachDone(); // once per device` and `markLessonSeen('gap')`).
 * A brand-new player whose first 1-1 is restarted, backed out of or reloaded in its first seconds is never coached, and never gets
 * the gap lesson either.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from '../../../../src/game/headlessDom.ts';
import { GameEngine } from '../../../../src/game/engine.ts';
import { InputEngine } from '../../../../src/game/inputEngine.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { coachDone, coachWanted } from '../../../../src/game/touchCoach.ts';
import { lessonsSeen } from '../../../../src/game/lessons.ts';

test('C-07: starting 1-1 does not mark the coach and the gap lesson as taught before anything was said', () => {
  localStorage.clear();
  // a brand-new touch player (touchCoach.ts coachWanted: ?coach=1 stands in for the coarse-pointer check, which the headless DOM lacks)
  (globalThis as unknown as { location: { search: string } }).location.search = '?coach=1';
  const lvl = generateAllLevels().find((l) => l.id === '1-1')!;
  assert.equal(coachWanted(lvl.id, lvl.secret), true);
  const said: string[] = [];
  const e = new GameEngine(headlessCanvas(), lvl, new InputEngine(), { onCoach: (s) => void (s && said.push(s)) });
  e.start();
  // not one frame of play yet: the coach has shown nothing (its first step comes 1.1 s in)
  assert.deepEqual(said, []);
  e.stop();
  assert.equal(coachDone(), false, 'sloth_coach_done was written at start(): leaving now, the coach never comes back on this phone');
  assert.equal(lessonsSeen().has('gap'), false, "the gap lesson was marked seen at start(): Dot will never say it either");
});
