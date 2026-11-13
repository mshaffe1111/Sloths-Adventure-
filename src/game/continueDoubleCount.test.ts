/**
 * Audit C (things): a Game Over, then Continue, then the run's next ending. The engine reports the run so far at every ending
 * (engine.ts stepDown -> onStageStats(buildStats(false, 0)); the win -> onStageStats(buildStats(true, stars))), its counters are never
 * reset by continueFromCheckpoint, and the app folds EVERY report into the lifetime medal counters (App.tsx: the effect that calls
 * recordStage on 'game_over' and on 'victory'). So everything done before a Game Over is counted again at the next ending.
 *
 * Correct: after one run, the lifetime counters hold what happened in that run, once.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { emptyStore, recordStage, type StageStats } from './badges.ts';
import { withRun, type PlayRecord } from './playRecords.ts';

test('one run with a Game Over and a Continue is counted once in the lifetime counters', () => {
  const r = new RealPlay('1-2', 1);
  const e = r.e;
  // the real life-lost path (the harness swaps it for a note), and the real "running" state Continue asks for
  delete e.loseLife;
  e.isRunning = true;
  const reports: StageStats[] = [];
  e.callbacks.onStageStats = (s: StageStats) => reports.push(s);

  // pick one petal up, the real way: stand on it for a frame
  const petal = r.collectibles.find((c) => c.type === 'flower' || c.type === 'leaf')!;
  assert.ok(petal, 'the stage holds a petal');
  r.stand(petal.x, petal.y + 20);
  r.frame();
  assert.equal(petal.collected, true, 'the petal was picked up');

  const loseAll = () => {
    for (let guard = 0; guard < 40 && !e.outOfLives; guard++) {
      e.loseLife('pit');
      for (let i = 0; i < 90 && e.down; i++) r.frame();
    }
    for (let i = 0; i < 90 && e.down; i++) r.frame();
  };

  loseAll();
  assert.equal(reports.length, 1, 'the first Game Over reported the run');
  const livesFirst = reports[0].livesLost;
  assert.ok(livesFirst >= 1);

  assert.equal(e.continueFromCheckpoint(), true, 'Continue is taken');
  loseAll();
  assert.equal(reports.length, 2, 'the second ending reported the run');

  // what really happened in this one run
  const realFalls = e.statLivesLost;
  const realFlora = r.collectibles.filter((c) => c.collected && (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit')).length;

  // what the app keeps: every report folded in (App.tsx recordStage on each 'game_over' / 'victory')
  let store = emptyStore();
  let rec: PlayRecord | null = null;
  for (const s of reports) {
    store = recordStage(store, s);
    rec = withRun(rec, s, { finds: [], medals: [], now: 0 });
  }

  assert.equal(store.counters.flora, realFlora, `petals picked: ${realFlora} in the run, ${store.counters.flora} kept`);
  assert.equal(store.counters.falls, realFalls, `lives lost: ${realFalls} in the run, ${store.counters.falls} kept`);
  assert.equal(rec!.n, 1, `one run played, ${rec!.n} counted in the journal's record`);
});
