/**
 * Audit C saves #2 (2026-11-11): a pause that lands while a stage is loading. App.tsx sets the 'playing' screen at the tap, but the
 * engine is built only once the sheets are in and started seconds later (launchEngine's go, after readyBuiltStage). A pause in that
 * time (Android Back, a locked phone, a call) found no engine to pause, and go then started the stage live under the pause menu.
 * go now starts it through screenFlow.ts startLoaded with "the pause menu is up"; this drives the real engine's loop after it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { startLoaded } from '../components/screenFlow.ts';

type Eng = Record<string, any>;

/** the real engine for a stage, started by startLoaded, then fed `frames` rAF frames 33 ms apart; how much game time went by */
function runAfterLoad(pausedMeanwhile: boolean, frames = 60): { played: number; eng: Eng } {
  const g = globalThis as Record<string, unknown>;
  const hadRaf = g.requestAnimationFrame;
  g.requestAnimationFrame = () => 0; // the loop asks for its next frame; this test hands it frames itself
  const eng = new RealPlay('1-2', 1).e as Eng;
  let played = 0;
  const update = eng.update.bind(eng);
  eng.update = (dt: number) => {
    played += dt;
    update(dt);
  };
  eng.render = () => {};
  try {
    startLoaded(eng as never, pausedMeanwhile);
    const t0 = eng.lastTime as number;
    for (let i = 1; i <= frames; i++) eng.loop(t0 + i * (1000 / 30));
  } finally {
    eng.isRunning = false;
    if (hadRaf === undefined) delete g.requestAnimationFrame;
    else g.requestAnimationFrame = hadRaf;
  }
  return { played, eng };
}

test('a stage that finishes loading after the pause menu came up starts paused: no game time runs under the menu', () => {
  const { played, eng } = runAfterLoad(true);
  assert.equal(played, 0, `${played.toFixed(2)} s of the stage played under the pause menu`);
  assert.equal(eng.isPaused, true);
});

test('the control: with no pause, the loaded stage plays', () => {
  const { played } = runAfterLoad(false);
  assert.ok(played > 1.5, `the stage played ${played.toFixed(2)} s of 2`);
});
