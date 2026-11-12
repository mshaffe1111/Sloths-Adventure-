/**
 * EN-F things-4b (the owner's check on things-4): the engine keeps the mode the stage was built on (engine.ts `easy`), and two places
 * outside it still read the menu's mode live, so a pause-menu switch mid-stage ("It starts from the next stage") changed them at once:
 *  (a) the guardian's weak point flickers in the last half second of its opening (bossArt.ts drawWeakPoint): it timed that from the
 *      menu's mode while the opening itself (bossAI.ts, openMul) runs on the run's, so after a switch the flicker and the opening disagree;
 *  (b) the input's jump buffer (inputEngine.ts pressKeep) changed length mid-stage.
 * Correct: both follow the mode the run is played on, handed in by the engine.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty, switchDifficulty } from './difficulty.ts';
import { drawBossFighter } from './bossArt.ts';
import { EASY_OPEN_MUL, type BossDef } from './bossAI.ts';
import { GameEngine } from './engine.ts';
import { InputEngine, pressKeep } from './inputEngine.ts';
import { levelConfig } from './saveEngineHarness.ts';
import type { BossEntity } from './types.ts';

/** a drawing surface that draws nothing and counts the radial glows (the open weak point's gold glow is one) */
function countingCtx() {
  const n = { glows: 0 };
  const ctx: unknown = new Proxy(function () {}, {
    get: (_t, k) =>
      k === Symbol.toPrimitive ? () => 0 : k === 'measureText' ? () => ({ width: 10 }) : k === 'createRadialGradient' ? () => (n.glows++, ctx) : ctx,
    apply: () => ctx,
    set: () => true,
  });
  return { ctx: ctx as CanvasRenderingContext2D, n };
}

test("(a) the weak point's closing flicker follows the opening the run is played on, not the menu", () => {
  setDifficulty('easy');
  try {
    // an Easy-built guardian fight, with the menu then switched to Normal mid-stage
    const r = new RealPlay('2-10', 1);
    const e = r.e;
    switchDifficulty('normal');
    const def = e.bossDef as BossDef;
    assert.ok(def?.openCue && !def.weakAt, '2-10: an opening with a closing flicker');
    const [move, m] = Object.entries(def.moves).find(([, mv]) => mv.rec >= 0.4)!;
    const floor = e.currentStage.arena.floor as number;
    // 0.45 s of the opening left at the plain length (flickering), 0.45 + 0.25 x rec at Easy's (not yet)
    const b = { ...(e.boss as BossEntity), defeated: false, ai: { ...(e.boss as BossEntity).ai!, state: 'rec', move, t: m.rec - 0.45, alpha: 1, air: 0 } } as BossEntity;
    const flickerT = (3 * Math.PI) / 2 / 40; // (a moment when the flicker is off)
    const glows = (openMul: number) => {
      const c = countingCtx();
      drawBossFighter(c.ctx, b, def, flickerT, 2, floor, openMul);
      return c.n.glows;
    };
    // the menu says Normal: the drawing still follows what it is handed
    assert.equal(glows(EASY_OPEN_MUL), glows(1) + 1, "on the run's Easy opening the weak point is still lit 0.45 s from the plain end");
    setDifficulty('easy');
    assert.equal(glows(1), glows(EASY_OPEN_MUL) - 1, 'on a plain opening it flickers off, whatever the menu says');
    // and the engine hands the drawing (engine.ts drawBossFighter / drawBossOverDark) the openings its fight runs on, after the switch
    assert.equal(e.openMul, EASY_OPEN_MUL, 'the run keeps the Easy openings after the switch');
  } finally {
    setDifficulty('normal');
  }
});

test("(b) the jump buffer is the run's, set by the engine as it builds the stage", () => {
  const cbs = { onProgressUpdate() {}, onVictory() {}, onDefeat() {} };
  setDifficulty('easy');
  try {
    const inp = new InputEngine();
    new GameEngine(headlessCanvas(), levelConfig('1-2'), inp, cbs as never);
    switchDifficulty('normal'); // (the pause menu, mid-stage)
    inp.triggerTouchUp();
    assert.equal((inp as unknown as { jumpBufferTimer: number }).jumpBufferTimer, pressKeep(true), "the Easy stage keeps Easy's buffer");
    // the next stage is built on the menu's mode now, and the same input follows it
    new GameEngine(headlessCanvas(), levelConfig('1-2'), inp, cbs as never);
    inp.triggerTouchUp();
    assert.equal((inp as unknown as { jumpBufferTimer: number }).jumpBufferTimer, pressKeep(false), "the next stage has Normal's");
    assert.notEqual(pressKeep(true), pressKeep(false));
  } finally {
    setDifficulty('normal');
  }
});
