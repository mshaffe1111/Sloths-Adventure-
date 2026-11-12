/**
 * Audit 2026-11-11, slice "save" — the Android app's flag resume (src/game/flagResume.ts, engine.ts start()/startAtFlag/stop()).
 *
 * PROVES (both fail today):
 *  1. A run that comes back at a flag is scored as a whole clean run. startAtFlag (engine.ts:5222) restores only the position: the clock,
 *     the lives lost and the hearts lost all start from zero, so the clear that follows reports a few seconds, no life lost and no hit
 *     taken. That is what App.tsx saves as the stage's best time (stageBest.ts keeps the smallest for good), what calculateLevelStars
 *     turns into the third star, and what badges.ts reads for Flawless / Untouchable / the clean-clear streak.
 *  2. A CLEARED stage keeps its resume flag. flagResume.ts:4 says the flag is "forgotten whenever the stage ends the normal way (cleared,
 *     restarted, left for the map or the title)", but the only clearFlag() is in GameEngine.stop() (engine.ts:1241), and the stage-cleared
 *     card ('victory') and the Game Over card are not screens that stop the engine (screenFlow.ts RELEASING_SCREENS). The phone killing
 *     the app while the stage-cleared card is up leaves the flag behind for 24 h. Today this is masked: a cleared stage rolls a new
 *     layout (layoutMemory.ts forgetLayout) and startAtFlag only accepts a flag within 2 px of one in the built stage, so it bites only
 *     where the layout does not change (?layout=fixed, a stage with one layout). It is a contract the code does not keep, not a rule.
 *
 * FIXED LOOKS LIKE: (1) the flag carries the run's clock and losses (or a resumed run is marked, and its time, stars and medals are not
 * recorded as a best); (2) the engine clears the flag the moment it declares the stage won, so a flag exists only while a run is
 * really under way.
 *
 * Stage 9-5 with one layout number throughout: a stage keeps its layout until it is cleared (layoutMemory.ts), so the run the phone
 * cut off and the run that comes back are the same build.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { asNativeApp, run, standAt, step } from './saveEngineHarness.ts';
import { clearFlag, flagFor } from './flagResume.ts';

const STAGE = '9-5';

test('a run that came back at a flag is not recorded as a whole clean run', () => {
  asNativeApp(true);
  clearFlag();
  // the run the phone cut off: two lives lost, 95 s in, standing at the last flag
  const a = run(STAGE, 4242);
  a.e.isRunning = true;
  const cps = a.e.currentStage.checkpoints as Array<{ x: number; y: number }>;
  standAt(a, cps[cps.length - 1]);
  a.e.gameTime = 95;
  a.e.statLivesLost = 2;
  a.e.statHeartsLost = 6;
  step(a);
  assert.ok(flagFor(STAGE), 'set-up: the flag was saved');
  // the app is killed here (no stop). The player opens the game again and enters the stage:
  const b = run(STAGE, 4242);
  b.e.start();
  assert.ok(Math.abs(b.e.player.x - cps[cps.length - 1].x) < 50, 'set-up: he is back at his flag');
  b.e.exitTotemReached = true;
  step(b, 3);
  asNativeApp(false);
  assert.equal(b.wins.length, 1, 'set-up: the engine called onVictory');
  const s = b.stats[b.stats.length - 1];
  b.e.stop();
  assert.ok(
    b.wins[0].timeSec >= 95 && s.livesLost >= 2 && s.heartsLost >= 6,
    `the clear was reported as time ${b.wins[0].timeSec}s, lives lost ${s.livesLost}, hearts lost ${s.heartsLost}, stars ${b.wins[0].stars} (the run really took over 95 s and lost 2 lives)`,
  );
});

test('a stage that was cleared has no flag to come back to', () => {
  asNativeApp(true);
  clearFlag();
  const a = run(STAGE, 4242);
  a.e.isRunning = true;
  const cps = a.e.currentStage.checkpoints as Array<{ x: number; y: number }>;
  standAt(a, cps[cps.length - 1]);
  step(a);
  assert.ok(flagFor(STAGE), 'set-up: touching the last flag saved it');
  // he reaches the exit: the engine itself declares the stage won, and the stage-cleared card comes up (no stop() until it is left)
  a.e.exitTotemReached = true;
  step(a, 3);
  asNativeApp(false);
  assert.equal(a.wins.length, 1, 'set-up: the engine called onVictory');
  const left = flagFor(STAGE);
  a.e.stop();
  assert.equal(left, null, 'the stage is cleared and its card is up, and the resume flag is still in storage (a phone kill here keeps it for 24 h)');
});
