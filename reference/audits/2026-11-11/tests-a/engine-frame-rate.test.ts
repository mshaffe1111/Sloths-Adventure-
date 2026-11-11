/**
 * AUDIT A-02 / A-05 / A-06 (2026-11-11): behaviour that depends on the frame time. The engine's loop() hands update() a dt anywhere
 * from 22 ms to 50 ms (engine.ts loop: `dt = Math.min(elapsed / steps / 1000, 0.05)`), but every reach tool, bot and stage check
 * steps it at exactly 1/30 s (realPlay.ts `export const DT = 1 / 30`), and PERFORMANCE-RULES §3.2 promises "steps of exactly 1/30 s".
 *
 * A-02 proves: the same held jump tops out at a different height by the frame time alone (gravity is added before the move, so a
 *       longer step loses more height).
 * A-05 proves: the camera's "never more than 11 px a frame" (CAM_RISE_STEP, INT-1-1 delta 2) is per UPDATE, and a late frame runs
 *       two or three updates before one draw: the picture moves 22-33 px in one drawn frame, the snap the cap was added to stop.
 *       (The sibling camera Critic owns this fix; noted here once.)
 * A-06 proves: while the stage is paused the loop still draws the whole scene every frame (PERFORMANCE-RULES §3.5 says "the loop
 *       stops behind menus"), and the screen shake runs on the wall clock with nothing decaying it, so a pause taken during a shake
 *       shakes the picture behind the menu for as long as the menu is open.
 * Fixed looks like: update in fixed 1/30 s steps (A-02, A-05 fall out of it), and no scene draw while paused (one still frame).
 *
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/engine-frame-rate.test.ts
 */
import { makeEngine, standOn, step, type Eng } from './_harness.ts';
import { shakeOffset } from '../../../../src/game/screenShake.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

/** a wide solid floor of the stage to jump on */
const floor = (e: Eng) => e.platforms.filter((p: any) => p.type === 'solid' && p.width >= 300 && !p.push).sort((a: any, b: any) => a.x - b.x)[1];

/** the height (px) a full held jump reaches at this frame time */
function apex(dt: number): number {
  const { e, input } = makeEngine('1-2');
  const pl = floor(e);
  standOn(e, pl);
  step(e, 4, dt);
  const y0 = e.player.y;
  input.state.jumpPressed = true;
  input.state.jumpHeld = true;
  let top = y0;
  for (let i = 0; i < 120; i++) {
    step(e, 1, dt);
    top = Math.min(top, e.player.y);
    if (i > 3 && e.player.grounded) break;
  }
  return y0 - top;
}

test('A-02 a held jump reaches the same height whatever the frame time (22 ms, 33 ms, 45 ms, 50 ms)', () => {
  const at = { '22 ms (3 steps of a 67 ms frame)': apex(0.0222), '25 ms (2 steps of a 50 ms frame)': apex(0.025), '33 ms (30 fps)': apex(1 / 30), '45 ms (22 fps)': apex(0.045), '50 ms (the cap)': apex(0.05) };
  const hs = Object.values(at);
  const spread = Math.max(...hs) - Math.min(...hs);
  assert.ok(spread <= 1, `jump height by frame time: ${Object.entries(at).map(([k, v]) => `${k}: ${v.toFixed(1)} px`).join('; ')} (spread ${spread.toFixed(1)} px)`);
});

test('A-05 the view never moves up more than CAM_RISE_STEP (11 px) in one DRAWN frame, late frames included', () => {
  const { e } = makeEngine('1-2');
  const pl = floor(e);
  standOn(e, pl);
  step(e, 30);
  // a mushroom's bounce from the ground (the case the cap was written for), played through the engine's own loop with 67 ms frames
  let worst = 0;
  let prev = NaN;
  e.render = () => {
    if (Number.isFinite(prev)) worst = Math.max(worst, prev - e.camera.y);
    prev = e.camera.y;
  };
  e.isRunning = true;
  e.isPaused = false;
  let now = 1000;
  e.lastRenderTime = now;
  e.loop((now += 1000 / 30));
  e.bounceOff();
  for (let i = 0; i < 40; i++) e.loop((now += 200 / 3));
  e.isRunning = false;
  assert.ok(worst <= 11.01, `with 67 ms frames (two updates a draw) the view rose ${worst.toFixed(1)} px in one drawn frame (the cap is 11)`);
});

test('A-06 a paused stage is not redrawn every frame, and its picture does not shake', () => {
  const { e } = makeEngine('1-2');
  let draws = 0;
  e.render = () => draws++;
  e.isRunning = true;
  e.camera.trauma = 0.6; // (a hit a moment before the Menu button)
  e.pause();
  let now = 1000;
  e.lastRenderTime = now;
  for (let i = 0; i < 60; i++) e.loop((now += 1000 / 30));
  e.isRunning = false;
  const a = shakeOffset(e.camera.trauma, 10, 16), b = shakeOffset(e.camera.trauma, 10.5, 16);
  assert.ok(
    draws <= 1 && e.camera.trauma === 0,
    `2 s paused: the scene was drawn ${draws} times; trauma is still ${e.camera.trauma}, so the picture sits at (${a.x.toFixed(1)}, ${a.y.toFixed(1)}) then (${b.x.toFixed(1)}, ${b.y.toFixed(1)}) half a second later`,
  );
});
