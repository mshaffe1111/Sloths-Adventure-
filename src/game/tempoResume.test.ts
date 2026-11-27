// The court's lianas keep the stage clock after a flag resume (reference/design/2-9.md NEW 1's third RED, R-165.449; ENG-29b): on the tempo
// toy's REAL row (gen2/worlds/w2TempoToy.ts) in the real engine, a straight run reaches a flag, the phone cuts it off, the stage is entered
// again there, and from the first frame every liana is on the court's bar at the game's time (its ONE on every bar: the swing the lay set,
// vineAngle at gameTime, ENG-285's vineClock = gameTime). RED with the engine's test seam (the liana clock shifted 0.3 s): off the bar, by name.
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { setLayoutVariant } from './stageGenerator.ts';
import { asNativeApp, standAt, step, type Run } from './saveEngineHarness.ts';
import { clearFlag, flagFor } from './flagResume.ts';
import { vineAngle, vinePeriod } from './physics.ts';
import { tempoBar } from './tempo.ts';
import { buildGen2Stage, keptFoes } from './gen2/pipeline.ts';
import { withTestStage } from './gen2/listed.ts';
import { packPlan, plantSeedList } from './gen2/seedList.ts';
import { COURT_TEMPO, TEMPO_ID, tempoCfg, tempoKit, tempoRow } from './gen2/worlds/w2TempoToy.ts';
import type { Vine } from './types.ts';

const SEED = 1;
const runToy = (): Run => {
  const r: Run = { e: null, stats: [], wins: [], defeats: 0, guides: [] } as unknown as Run;
  setLayoutVariant(SEED);
  r.e = new GameEngine(headlessCanvas(), tempoCfg(), { state: {}, update() {}, triggerHaptic() {}, clearAll() {}, carry() {} } as never, { onProgressUpdate() {}, onVictory() {}, onDefeat() {}, onStageStats() {}, onGuide() {} } as never);
  setLayoutVariant(null);
  return r;
};
const lianasOf = (r: Run) => (r.e.vines as Vine[]).filter((v) => v.vineType !== 'tree_climb' && v.isSwingingVine && v.swingAmp !== 0);
/** every liana off the court's bar at the engine's game time, in words (none: on the bar) */
function offBar(r: Run): string[] {
  const out: string[] = [];
  const bar = tempoBar(COURT_TEMPO, false);
  for (const v of lianasOf(r)) {
    if (Math.abs(vinePeriod(v) - bar) > 1e-6 || v.swingPhase !== COURT_TEMPO.lock) out.push(`the liana at x ${Math.round(v.x)}: not the court's swing`);
    else if (Math.abs((v.swingAngle ?? 0) - vineAngle(v, r.e.gameTime)) > 1e-9) out.push(`the liana at x ${Math.round(v.x)}: off the bar (${(v.swingAngle ?? 0).toFixed(4)} rad, the bar's ${vineAngle(v, r.e.gameTime).toFixed(4)} at game time ${r.e.gameTime.toFixed(3)} s)`);
  }
  return out;
}

test('the court\'s lianas keep the bar after a flag resume, on the toy\'s real row; RED with the liana clock shifted 0.3 s', () => {
  const st = withTestStage({ [TEMPO_ID]: tempoRow() }, () => buildGen2Stage({ config: tempoCfg(), kit: tempoKit(), seed: SEED, difficulty: 'normal' }));
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  withTestStage({ [TEMPO_ID]: tempoRow() }, () => {
    const undo = plantSeedList(TEMPO_ID, { dict, seeds: [SEED], plans: [packed] });
    asNativeApp(true);
    clearFlag();
    try {
      const a = runToy();
      a.e.isRunning = true;
      step(a, 360);
      const cps = a.e.currentStage.checkpoints as Array<{ x: number; y: number }>;
      assert.ok(cps.length >= 2, `set-up: the toy has flags (${cps.length})`);
      standAt(a, cps[1]);
      step(a);
      assert.ok(flagFor(TEMPO_ID), 'set-up: the flag was saved');
      assert.ok(lianasOf(a).length >= 3, 'set-up: the court\'s lianas');
      assert.deepEqual(offBar(a), [], 'the straight run is on the bar');
      const b = runToy();
      b.e.start();
      assert.ok(Math.abs(b.e.player.x - cps[1].x) < 50, 'set-up: he is back at his flag');
      assert.ok(Math.abs(b.e.gameTime - a.e.gameTime) < 1e-6, 'set-up: the game\'s time kept');
      for (let f = 1; f <= 90; f++) {
        step(a);
        step(b);
        assert.deepEqual(offBar(b), [], `frame ${f} after the resume`);
      }
      // (planted: the liana clock shifted off the game's time, the engine's test seam: every liana off the bar, by name)
      (b.e as unknown as { vineClock: number }).vineClock = b.e.gameTime + 0.3;
      step(b);
      const red = offBar(b);
      assert.equal(red.length, lianasOf(b).length, red.join('; '));
      assert.match(red[0], /^the liana at x \d+: off the bar/);
    } finally {
      clearFlag();
      asNativeApp(false);
      undo();
    }
  });
});
