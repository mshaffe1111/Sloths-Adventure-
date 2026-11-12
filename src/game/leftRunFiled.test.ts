/**
 * Audit C (things-3): a medal that pops in play is not kept if the stage is left. App.tsx checks the run so far every 2 s and pops a
 * medal the moment it is earned ("nothing is saved here: the stage's end files the medals"), but the pause menu's map, title and story
 * exits and Restart call engine.stop(), which sent no report: the run's counters (the 25th stomp that popped "Stomper I") were thrown
 * away, and the medal popped again some later day.
 *
 * Correct: a stage left with its run under way files what the run did, once; a run that already ended (won, out of lives) is not filed
 * again; leaving does not end the clean-clear streak (it never did), and it is not a play in the journal's record (App.tsx).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { run, step } from './saveEngineHarness.ts';
import { emptyStore, recordStage } from './badges.ts';

test('a stage left from the pause menu files what the run did, once', () => {
  const r = run('9-5', 4242);
  const e = r.e;
  e.isRunning = true;
  e.statStomps = 25;
  e.statKills = { frog: 3 };
  e.gameTime = 80;
  step(r);
  e.pause();
  // the pause menu's World Map (App.tsx onOpenMap): the engine is stopped, and stopped again as the stage is let go (releasesStage)
  e.stop();
  e.stop();
  assert.equal(r.stats.length, 1, `the left run was reported once (${r.stats.length} reports)`);
  const s = r.stats[0];
  assert.equal(s.left, true, 'the report says the stage was left');
  assert.equal(s.win, false);
  let store = emptyStore();
  store = { ...store, counters: { ...store.counters, streak: 4, bestStreak: 4 } };
  for (const x of r.stats) store = recordStage(store, x);
  assert.deepEqual(
    { stomps: store.counters.stomps, frogs: store.kills.frog, streak: store.counters.streak },
    { stomps: 25, frogs: 3, streak: 4 },
    'the stomps and knock-outs that popped medals are kept, and the clean-clear streak is not ended by leaving',
  );
});

test('a run that already ended is not filed again when the stage is left', () => {
  const r = run('9-5', 4242);
  const e = r.e;
  e.isRunning = true;
  e.statStomps = 5;
  e.exitTotemReached = true;
  for (let i = 0; i < 10 && r.wins.length === 0; i++) step(r);
  assert.equal(r.wins.length, 1, 'set-up: the stage was won');
  e.stop();
  assert.equal(r.stats.length, 1, 'only the win was reported');
  assert.equal(r.stats[0].left, undefined);
});

test('a Game Over then Continue, then the map: the left part is filed on top of the Game Over, once', () => {
  const r = run('9-5', 4242);
  const e = r.e;
  e.isRunning = true;
  e.statStomps = 7;
  e.lives = 1;
  e.player.invincibleTimer = 0;
  e.loseLife('pit');
  for (let i = 0; i < 300 && r.defeats === 0; i++) step(r);
  assert.equal(r.defeats, 1, 'set-up: Game Over');
  assert.equal(e.continueFromCheckpoint(), true, 'set-up: Continue');
  e.statStomps += 3;
  e.stop();
  assert.equal(r.stats.length, 2);
  let store = emptyStore();
  for (const x of r.stats) store = recordStage(store, x);
  assert.equal(store.counters.stomps, 10, `10 stomps in the run, ${store.counters.stomps} kept`);
});
