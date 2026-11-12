/**
 * Audit A-12 (2026-11-11; EN-F): the loop's catch ended the stage only after 20 frames IN A ROW had failed, and any good frame reset the
 * count. An update that throws on every other frame (or every third) never ended the stage: each failed frame was half-applied (moved,
 * not landed) and the player was left in a broken stage with nothing reported. Fixed: failures are counted with a slow leak (a good
 * frame forgives a twentieth of one), so a recurring error ends the stage cleanly (onFatal) while a rare one-off still plays on.
 */
import { makeEngine } from './engineCoreHarness.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

function run(failEvery: number, frames: number) {
  const { e } = makeEngine('1-2');
  let fatal = 0;
  e.callbacks.onFatal = () => fatal++;
  e.render = () => {};
  const upd = e.update.bind(e);
  let n = 0;
  e.update = (dt: number) => {
    if (++n % failEvery === 0) throw new Error(`planted update error ${n}`);
    upd(dt);
  };
  const err = console.error;
  console.error = () => {};
  try {
    e.isRunning = true;
    e.isPaused = false;
    let now = 1000;
    e.lastRenderTime = now;
    for (let i = 0; i < frames && e.isRunning; i++) e.loop((now += 1000 / 30));
  } finally {
    console.error = err;
  }
  return { fatal, running: e.isRunning as boolean };
}

test('A-12 an update error on every other frame ends the stage cleanly (onFatal), not 10 s of a half-applied stage', () => {
  const r = run(2, 300);
  assert.equal(r.fatal, 1, `an error every other frame for 10 s: onFatal ${r.fatal} times, stage ${r.running ? 'still running' : 'stopped'}`);
});

test('A-12 an update error on every third frame ends the stage too', () => {
  const r = run(3, 300);
  assert.equal(r.fatal, 1, `an error every third frame for 10 s: onFatal ${r.fatal} times`);
});

test('A-12 control: one error in a long while (every 60th frame) never ends the stage', () => {
  const r = run(60, 1800);
  assert.equal(r.fatal, 0, 'a rare one-off error does not end the stage');
  assert.equal(r.running, true);
});
