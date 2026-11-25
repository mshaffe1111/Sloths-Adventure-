// The engine plays the court's drum (engine.ts drumStep / loseLife; reference/design/2-9.md NEW 2, R-165.449; ENG-29c): on the tempo toy's
// REAL row (gen2/worlds/w2TempoToy.ts) in the real engine, with a spy on `sound`: drumTick every step with the engine's own game time and
// the court's beat on the setting; drumHold the step a life is lost, at that game time; through the down, drumTick on with game time
// standing (the schedule's backstop). On a stage with no tempo, neither, ever. And the court's drum is a sound, never a heroNoise 'drum'.
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { setLayoutVariant } from './stageGenerator.ts';
import { asNativeApp, run, step, type Run } from './saveEngineHarness.ts';
import { clearFlag } from './flagResume.ts';
import { sound } from './audio.ts';
import { tempoBeat } from './tempo.ts';
import { buildGen2Stage, keptFoes } from './gen2/pipeline.ts';
import { withTestStage } from './gen2/listed.ts';
import { packPlan, plantSeedList } from './gen2/seedList.ts';
import { COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow } from './gen2/worlds/w2TempoToy.ts';
import type { DrumBeat } from '../audio/drum.ts';

const SEED = 1;
const runToy = (): Run => {
  const r: Run = { e: null, stats: [], wins: [], defeats: 0, guides: [] } as unknown as Run;
  setLayoutVariant(SEED);
  r.e = new GameEngine(headlessCanvas(), tempoCfg(), { state: {}, update() {}, triggerHaptic() {}, clearAll() {}, carry() {} } as never, { onProgressUpdate() {}, onVictory() {}, onDefeat() {}, onStageStats() {}, onGuide() {} } as never);
  setLayoutVariant(null);
  return r;
};
/** the spy: every drumTick and drumHold the engine makes, until undone */
function spy() {
  const ticks: Array<{ beat: DrumBeat; g: number }> = [];
  const holds: number[] = [];
  const s = sound as unknown as { drumTick: (b: DrumBeat, g: number) => void; drumHold: (g: number) => void };
  const t0 = s.drumTick;
  const h0 = s.drumHold;
  s.drumTick = (beat, g) => void ticks.push({ beat, g });
  s.drumHold = (g) => void holds.push(g);
  return { ticks, holds, undo: () => Object.assign(s, { drumTick: t0, drumHold: h0 }) };
}

test('the engine plays the court\'s drum on its tempo row: every step on game time, the hold as a life is lost, game time standing through the down', () => {
  const st = withTestStage({ [TEMPO_ID]: tempoRow() }, () => buildGen2Stage({ config: tempoCfg(), kit: tempoKit(), seed: SEED, difficulty: 'normal' }));
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  withTestStage({ [TEMPO_ID]: tempoRow() }, () => {
    const undo = plantSeedList(TEMPO_ID, { dict, seeds: [SEED], plans: [packed] });
    asNativeApp(true);
    clearFlag();
    const sp = spy();
    try {
      const a = runToy();
      a.e.isRunning = true;
      assert.ok(a.e.currentStage.tempo, 'set-up: the toy\'s stage carries the court\'s tempo');
      const times: number[] = [];
      for (let f = 0; f < 120; f++) {
        step(a);
        times.push(a.e.gameTime);
      }
      assert.equal(sp.ticks.length, 120, 'a drumTick every step');
      sp.ticks.forEach((t, k) => assert.equal(t.g, times[k], `step ${k}: the engine's game time`));
      const B = tempoBeat(COURT_TEMPO, false);
      assert.ok(sp.ticks.every((t) => t.beat.beats === COURT_TEMPO.beats && t.beat.beat === B), `the court's beat on Normal (${B} s)`);
      assert.equal(sp.holds.length, 0, 'no hold while he plays');
      // (a life lost: the hold that step, at its game time; then game time stands through the down and drumTick goes on, the backstop)
      const g0 = a.e.gameTime;
      (a.e as unknown as { loseLife(r: string): void }).loseLife('pit');
      assert.deepEqual(sp.holds, [g0], 'drumHold the step a life is lost, at its game time');
      const n = sp.ticks.length;
      step(a, 10);
      assert.equal(sp.ticks.length, n + 10, 'drumTick through the down');
      assert.ok(sp.ticks.slice(n).every((t) => t.g === g0), 'with game time standing');
      // (the toy plays no hero 'drum' noise: the court's drum is heard, never a sound the foes hear)
      const noises = (a.e as unknown as { kit?: { noises: Array<{ from: string }> } }).kit?.noises ?? [];
      assert.ok(noises.every((x) => x.from !== 'drum'), 'no heroNoise drum');
    } finally {
      sp.undo();
      clearFlag();
      asNativeApp(false);
      undo();
    }
  });
});

test('a stage with no tempo never touches the drum: no drumTick, no drumHold (1-1)', () => {
  const sp = spy();
  try {
    const r = run('1-1', 0);
    r.e.isRunning = true;
    assert.equal(r.e.currentStage.tempo, undefined, 'set-up: 1-1 has no tempo');
    step(r, 60);
    (r.e as unknown as { loseLife(r: string): void }).loseLife('pit');
    step(r, 10);
    assert.equal(sp.ticks.length + sp.holds.length, 0);
  } finally {
    sp.undo();
  }
});
