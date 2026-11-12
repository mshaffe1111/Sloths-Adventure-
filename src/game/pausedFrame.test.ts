/**
 * Audit A-06 (2026-11-11; EN-F): while the stage is paused (the Pause menu, a find's note, Normal's help offer: engine.pause()) the loop
 * still drew the whole scene every frame, against PERFORMANCE-RULES §3.5 ("nothing runs behind a menu"), and the screen shake runs on
 * the wall clock while its trauma only dies away in update(), so a pause taken just after a hit shook the world behind the menu for as
 * long as the menu was up. Battery and heat on every pause.
 * Fixed: a paused stage is drawn once, still and unshaken, then left alone until play resumes, the view changes size or the canvas comes
 * back from a lost context.
 * Proofs: audit A's tests-a/engine-frame-rate A-06 and the draw slice's tests-a/draw-paused-redraw, in one file.
 */
import { makeEngine, type Eng } from './engineCoreHarness.ts';
import { RealPlay } from './realPlay.ts';
import { shakeOffset } from './screenShake.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('A-06 a paused stage is not redrawn every frame, and its picture does not shake (2 s at 30 fps)', () => {
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

function pausedSecond(trauma: number) {
  const e = new RealPlay('1-2', 1).e as unknown as Eng;
  let renders = 0;
  e.render = () => { renders++; };
  e.isRunning = true;
  e.lastRenderTime = 0;
  e.camera.trauma = trauma;
  e.pause();
  // one second of the browser's animation frames at 60 Hz, as the engine's own loop receives them
  for (let i = 1; i <= 60; i++) e.loop(i * (1000 / 60));
  e.isRunning = false;
  return { e, renders, trauma: e.camera.trauma as number };
}

test('a paused stage is not redrawn 30 times a second (PERFORMANCE-RULES §3.5)', () => {
  const { renders } = pausedSecond(0);
  assert.ok(renders <= 1, `render() ran ${renders} times in one paused second`);
});

test('a shake under way when the game is paused is not still shaking a second later', () => {
  const { renders, trauma } = pausedSecond(0.8);
  assert.ok(renders <= 1 || trauma < 0.01, `after one paused second render() ran ${renders} times with the shake's trauma still ${trauma}`);
});

test('paused, the still is drawn again after the view changes size, and play draws every frame again on resume', () => {
  const { e } = makeEngine('1-2');
  let draws = 0;
  e.render = () => draws++;
  e.isRunning = true;
  e.pause();
  let now = 1000;
  e.lastRenderTime = now;
  for (let i = 0; i < 10; i++) e.loop((now += 1000 / 30));
  assert.equal(draws, 1, 'one still frame when paused');
  // the phone turns under the menu: the canvas is resized (which clears it), so the still is drawn once more
  e.resizeCanvas();
  for (let i = 0; i < 10; i++) e.loop((now += 1000 / 30));
  assert.equal(draws, 2, 'drawn once more after a resize, then left alone');
  e.resume();
  now = e.lastRenderTime;
  for (let i = 0; i < 10; i++) e.loop((now += 1000 / 30));
  e.isRunning = false;
  assert.equal(draws, 12, 'every frame drawn again once play resumes');
});
