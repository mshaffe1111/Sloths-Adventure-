/**
 * R-165.240 (INT-8, 11-14): the clip tool's frame step (tools/inspect/clipPress.mjs pressFrame, the ONE function clip.mjs runs in the
 * page) on the headless game with the REAL InputEngine (not realPlay's FakeInput: the bug lived in InputEngine.update, which drops a bare
 * press before the engine reads it). Planted: the old bare press (PLANT_BARE_JUMP's path) must be caught as lost (no lift, no grab: the
 * clip exits JUMP-NO-LIFT), and the touch pad's press must lift him. INT-7's clip pressed the bare way and its fig-gate "jump" never
 * left the vine; this is the check that it cannot happen again.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import { headlessCanvas } from '../../src/game/headlessDom.ts';
import { GameEngine } from '../../src/game/engine.ts';
import { InputEngine } from '../../src/game/inputEngine.ts';
import { levelConfig } from '../../src/game/realPlay.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import { pressFrame, lostPress } from './clipPress.mjs';

/** 1-2 (no seed list to load), Normal, the real input; stepped until he stands on the start floor */
function standing() {
  setDifficulty('normal');
  const noop = () => {};
  const e = new GameEngine(headlessCanvas(), levelConfig('1-2'), new InputEngine() as never, {
    onProgressUpdate: noop, onVictory: noop, onDefeat: noop, onGameOver: noop, onGuide: noop,
  } as never) as unknown as { player: { grounded: boolean; vy: number }; update(dt: number): void; isPaused: boolean };
  e.isPaused = true;
  for (let i = 0; i < 90 && !e.player.grounded; i++) e.update(1 / 30);
  for (let i = 0; i < 10; i++) e.update(1 / 30);
  assert.ok(e.player.grounded, 'he stands on the start floor before the press');
  return e;
}

test('PLANTED: the old bare press (state.jumpPressed set by hand) is LOST on the real input: no lift, no grab, the clip stops', () => {
  const e = standing();
  const r = pressFrame(e, { jump: true }, { noRender: true }, true);
  assert.ok(r.lift, 'a jump frame reports its lift');
  assert.equal(r.lift.lifted, false, `the bare press must not lift him (vy after ${r.lift.vyAfter})`);
  assert.equal(lostPress(r.lift), true, 'the clip reads it as JUMP-NO-LIFT');
});

test('the touch pad press lifts him on the next frame (vy < 0, a jump spent), and the clip reads it as a real press', () => {
  const e = standing();
  const r = pressFrame(e, { jump: true }, { noRender: true }, false);
  assert.ok(r.lift.vyAfter < 0, `vy after the press ${r.lift.vyAfter}`);
  assert.ok(r.lift.spent >= 1, 'one jump spent');
  assert.equal(lostPress(r.lift), false);
  // and a second flick in the air (the double) lifts again
  let s = r;
  for (let i = 0; i < 40 && s.vy < -40; i++) s = pressFrame(e, { release: i === 8 }, { noRender: true }, false);
  const d = pressFrame(e, { jump: true }, { noRender: true }, false);
  assert.ok(!d.grounded && d.lift.spent >= 1 && d.lift.vyAfter < 0, `the second flick: ${JSON.stringify(d.lift)}`);
});
