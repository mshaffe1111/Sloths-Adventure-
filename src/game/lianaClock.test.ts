/**
 * ENG-285, R-165.295 (DESIGN-29 found it): the lianas swing on the game's own clock. Their clock was its own sum (engine.ts vineClock),
 * and the Android app's flag resume (engine.ts startAtFlag -> restoreRun) puts back only the game's time, so after a resume every
 * liana's phase against everything else on the game's clock (a river's logs, stones and pads, every beat) differed from a straight run's:
 * a let-go the drop judge passed against one relation (2-4's rows) met another. Here a straight run reaches a flag, the phone cuts it off,
 * the stage is entered again at that flag, and from the first frame on every liana swings exactly as the straight run's does at the same
 * game time, and the logs (driftX at the game's clock) are where they were.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { asNativeApp, run, standAt, step } from './saveEngineHarness.ts';
import { clearFlag, flagFor } from './flagResume.ts';
import { vineAngle } from './physics.ts';
import type { Vine } from './types.ts';

const STAGE = '1-6';
const LAYOUT = 3;

test('a run resumed at a flag swings every liana as the straight run does at the same game time (R-165.295)', () => {
  asNativeApp(true);
  clearFlag();
  try {
    // the straight run: 12 s of play from the stage's start, then on to a flag (the phone cuts it off there)
    const a = run(STAGE, LAYOUT);
    a.e.isRunning = true;
    step(a, 360);
    const cps = a.e.currentStage.checkpoints as Array<{ x: number; y: number }>;
    assert.ok(cps.length >= 2, 'set-up: the stage has flags');
    standAt(a, cps[1]);
    step(a);
    assert.ok(flagFor(STAGE), 'set-up: the flag was saved');
    const lianas = () => (a.e.vines as Vine[]).filter((v) => v.vineType !== 'tree_climb');
    assert.ok(lianas().length >= 2, 'set-up: the stage has swinging lianas');
    // the stage entered again: he comes back at the flag, on the clock the flag kept
    const b = run(STAGE, LAYOUT);
    b.e.start();
    assert.ok(Math.abs(b.e.player.x - cps[1].x) < 50, 'set-up: he is back at his flag');
    assert.ok(Math.abs(b.e.gameTime - a.e.gameTime) < 1e-6, `set-up: the game's time kept, ${b.e.gameTime} vs ${a.e.gameTime}`);
    for (let f = 1; f <= 30; f++) {
      step(a);
      step(b);
      const va = lianas(), vb = (b.e.vines as Vine[]).filter((v) => v.vineType !== 'tree_climb');
      assert.equal(vb.length, va.length);
      va.forEach((v, i) => {
        assert.ok(Math.abs((vb[i].swingAngle ?? 0) - (v.swingAngle ?? 0)) < 1e-9, `frame ${f}, the liana at x=${Math.round(v.x)}: resumed ${(vb[i].swingAngle ?? 0).toFixed(4)} rad, the straight run ${(v.swingAngle ?? 0).toFixed(4)}`);
        // (and on the game's clock itself: the liana's phase against every log, stone and pad, which run on it, is the straight run's)
        assert.ok(Math.abs((vb[i].swingAngle ?? 0) - vineAngle(vb[i], b.e.gameTime)) < 1e-9, `frame ${f}: the liana at x=${Math.round(v.x)} is off the game's clock`);
      });
    }
  } finally {
    clearFlag();
    asNativeApp(false);
  }
});
