/**
 * AUDIT 2026-11-11 (area A, draw slice) — proof test. FAILS today.
 *
 * What it proves: while the game is paused (the Pause menu, a note being read, a lesson card, Normal's help offer: engine.pause()),
 * the engine's loop still calls render() 30 times a second (engine.ts loop: `this.render()` is outside the `!this.isPaused` step loop),
 * which PERFORMANCE-RULES §3.5 says does not happen ("Nothing runs behind a menu ... the loop stops behind menus"). And because
 * render() takes the screen shake from the real clock (`shakeOffset(this.camera.trauma, performance.now() / 1000, 16)`) while the
 * shake's trauma only dies away inside update() (never run while paused), a pause taken in the half second after a hit leaves the
 * whole world wobbling behind the menu for as long as the pause lasts.
 *
 * Fixed looks like: a paused stage is drawn once and then left alone (or redrawn only when something on it changes), and a shake
 * under way at the moment of the pause is not still shaking a second later.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';

function pausedSecond(trauma: number) {
  const e = new RealPlay('1-2', 1).e;
  let renders = 0;
  e.render = () => { renders++; };
  e.isRunning = true;
  e.lastRenderTime = 0;
  e.camera.trauma = trauma;
  e.pause();
  // one second of the browser's animation frames at 60 Hz, as the engine's own loop receives them
  for (let i = 1; i <= 60; i++) e.loop(i * (1000 / 60));
  return { renders, trauma: e.camera.trauma as number };
}

test('a paused stage is not redrawn 30 times a second (PERFORMANCE-RULES §3.5)', () => {
  const { renders } = pausedSecond(0);
  assert.ok(renders <= 1, `render() ran ${renders} times in one paused second`);
});

test('a shake under way when the game is paused is not still shaking a second later', () => {
  const { renders, trauma } = pausedSecond(0.8);
  // either the picture is frozen (nothing drawn), or the shake has died away on the real clock
  assert.ok(renders <= 1 || trauma < 0.01, `after one paused second render() ran ${renders} times with the shake's trauma still ${trauma}`);
});
