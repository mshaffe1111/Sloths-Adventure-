/**
 * Audit 2026-11-11, slice "save" — the Trophy Room's saved counters (`sloth_badges`) after Game Over -> Continue.
 *
 * PROVES (fails today): one run that ends in a Game Over, is continued from the card, and is then cleared is folded into the saved
 * counters TWICE. The engine reports the run's totals so far at the Game Over (engine.ts:4990 `onStageStats(buildStats(false, 0))`),
 * App.tsx folds that report into the store and saves it (App.tsx:389-396: the effect runs on 'game_over' and calls recordStage +
 * saveBadgeStore). continueFromCheckpoint (engine.ts:5029) keeps the run and every stat counter ("Stage progress ... is kept, which is
 * the point"), so the clear reports the SAME stomps, kills, flowers, punches, kicks, swings and seconds again, plus whatever came
 * after, and App.tsx adds that whole report as well (recordStage, badges.ts:471, only ever adds). Each extra Game Over + Continue
 * adds the run so far once more. The tiered medals (stomps, flowers, each animal's knock-outs, play time) come early for a player who
 * dies and continues, and the journal's "times played" (playRecords.ts withRun n += 1) counts one run as two.
 *
 * FIXED LOOKS LIKE: one run is folded once. Either the engine reports only what happened since its last report (a delta), or the
 * Game Over report is not folded while the run can still be continued (fold it when the run is really over: cleared, restarted, left).
 * This test folds the engine's own reports exactly as App.tsx does and expects the store to hold what really happened.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { run, step } from './save-engine.ts';
import { emptyStore, recordStage } from '../../../../src/game/badges.ts';

test('a run continued after Game Over is counted once in the saved counters', () => {
  const r = run('9-5', 4242);
  const e = r.e;
  e.isRunning = true;
  // what really happened in this run so far: 7 stomps, 4 frogs knocked out, 12 punches, 60 s played
  e.statStomps = 7;
  e.statKills = { frog: 4 };
  e.statPunches = 12;
  e.gameTime = 60;
  // the last life goes: the engine's own life-lost beat, then its Game Over report
  e.lives = 1;
  e.player.invincibleTimer = 0;
  e.loseLife('pit');
  for (let i = 0; i < 300 && r.defeats === 0; i++) step(r);
  assert.equal(r.defeats, 1, 'set-up: the engine called onDefeat');
  assert.equal(r.stats.length, 1, 'set-up: the engine reported the run at the Game Over');
  // the player taps Continue on the card (App.tsx continueRun)
  assert.equal(e.continueFromCheckpoint(), true, 'set-up: the run was continued');
  // ...and reaches the exit with nothing more done
  e.exitTotemReached = true;
  for (let i = 0; i < 10 && r.wins.length === 0; i++) step(r);
  assert.equal(r.wins.length, 1, 'set-up: the engine called onVictory');
  assert.equal(r.stats.length, 2, 'set-up: the engine reported the run again at the clear');
  e.stop();

  // App.tsx:391 folds every report it is handed into the saved store
  let store = emptyStore();
  for (const s of r.stats) store = recordStage(store, s);
  assert.deepEqual(
    { stomps: store.counters.stomps, frogs: store.kills.frog, punches: store.counters.punches },
    { stomps: 7, frogs: 4, punches: 12 },
    'the saved counters after one continued run (7 stomps, 4 frogs, 12 punches really happened)',
  );
});
