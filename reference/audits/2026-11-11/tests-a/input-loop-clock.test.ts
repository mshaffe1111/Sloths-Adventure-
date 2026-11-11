/**
 * AUDIT 2026-11-11, slice input-lifecycle. PROOF TEST: fails today.
 *
 * What it proves: the 30 fps loop (engine.ts `loop`) hands the simulation MORE time than really passed, and feeds the frame governor
 * a frame gap that is longer than the real one, whenever a frame is not exactly on the loop's own 33.3 ms grid.
 *
 *   loop:  elapsed = now - lastRenderTime
 *          lastRenderTime = elapsed < 35.3 ? now : now - (elapsed % 33.3)      <- keeps the remainder for the next frame ...
 *          dt = elapsed / steps                                                <- ... but this frame already simulated it
 *
 * The remainder is simulated twice: once in this frame's dt (the whole `elapsed`), and again in the next frame's `elapsed`, which is
 * measured from the pushed-back lastRenderTime. start() and resume() set lastRenderTime from performance.now() (any moment between two
 * screen refreshes), while the frames come on the screen's refresh: so the remainder is there from the first frame and, on a screen
 * whose refresh divides evenly, never goes away.
 *
 * Fixed looks like: over any stretch of play, the dt handed to update() adds up to the real time that passed (to within a frame), on
 * any refresh rate and from any start / resume moment; and the governor is fed the real gap between two drawn frames.
 *
 * Run: npx tsx --test reference/audits/2026-11-11/tests-a/input-loop-clock.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';

const g = globalThis as unknown as Record<string, unknown>;
let clock = 0;
Object.defineProperty(globalThis.performance, 'now', { value: () => clock, configurable: true });
let nextId = 1;
const frames = new Map<number, (t: number) => void>();
g.requestAnimationFrame = (f: (t: number) => void) => (frames.set(nextId, f), nextId++);
g.cancelAnimationFrame = (id: number) => void frames.delete(id);

const { RealPlay } = await import('../../../../src/game/realPlay.ts');

interface Loop {
  start(): void;
  stop(): void;
  pause(): void;
  resume(): void;
  render: () => void;
  update: (dt: number) => void;
  stepQuality: () => void;
  gov: { feed(ms: number): boolean };
}
/** an engine whose update and draw are stand-ins: only the loop's own clock work runs. `sim` adds up the dt it hands the simulation */
function rig() {
  const e = new RealPlay('1-2', 7).e as unknown as Loop;
  const out = { e, sim: 0, updates: 0, steps: 0, fed: [] as number[] };
  e.render = () => {};
  e.update = (dt: number) => {
    out.sim += dt;
    out.updates++;
  };
  e.stepQuality = () => {
    out.steps++;
  };
  const feed = e.gov.feed.bind(e.gov);
  e.gov.feed = (ms: number) => (out.fed.push(ms), feed(ms));
  return out;
}
/** the screen refreshes: every frame asked for runs with the refresh's own time stamp, as a browser does */
function refresh(t: number) {
  clock = t;
  const due = [...frames.values()];
  frames.clear();
  for (const f of due) f(t);
}

const HZ60 = 1000 / 60;

test('control: a 60 Hz phone whose stage starts exactly on a refresh keeps real time (passes today)', () => {
  frames.clear();
  const r = rig();
  clock = 10_000;
  r.e.start();
  for (let k = 1; k <= 600; k++) refresh(10_000 + k * HZ60);
  r.e.stop();
  assert.ok(Math.abs(r.sim - 10) < 0.05, `10 s of screen time, ${r.sim.toFixed(2)} s simulated`);
});

test('a perfect 60 Hz phone, the stage started 8 ms after a refresh: 10 s of real time must be 10 s of game time', () => {
  frames.clear();
  const r = rig();
  clock = 20_000 + 8; // start() runs from a timer / a promise: any moment between two refreshes
  r.e.start();
  for (let k = 1; k <= 600; k++) refresh(20_000 + k * HZ60);
  r.e.stop();
  // every drawn frame was a real 33.3 ms after the one before it
  assert.ok(Math.abs(r.sim - 10) < 0.1, `10 s of real time, 30 real frames a second, but ${r.sim.toFixed(2)} s were simulated (${r.updates} updates)`);
});

test('the same phone: the governor must be fed the real 33.3 ms gap, and must not lighten the picture', () => {
  frames.clear();
  const r = rig();
  clock = 30_000 + 8;
  r.e.start();
  for (let k = 1; k <= 900; k++) refresh(30_000 + k * HZ60);
  r.e.stop();
  const late = r.fed.slice(5);
  const worst = Math.max(...late);
  assert.ok(worst < 35 && r.steps === 0, `every real gap was 33.3 ms; the governor was told ${worst.toFixed(1)} ms and stepped the picture down ${r.steps} time(s) in 15 s`);
});

test('resume() 8 ms after a refresh (the pause menu, a lesson card, a find): game time keeps real time afterwards', () => {
  frames.clear();
  const r = rig();
  clock = 40_000;
  r.e.start();
  for (let k = 1; k <= 60; k++) refresh(40_000 + k * HZ60);
  r.e.pause();
  for (let k = 61; k <= 120; k++) refresh(40_000 + k * HZ60);
  clock = 40_000 + 120 * HZ60 + 8; // the tap on Resume is handled between two refreshes
  r.e.resume();
  const before = r.sim;
  for (let k = 121; k <= 720; k++) refresh(40_000 + k * HZ60);
  r.e.stop();
  const after = r.sim - before;
  assert.ok(Math.abs(after - 10) < 0.1, `10 s of real time after Resume, ${after.toFixed(2)} s simulated`);
});

test('a slow phone at a steady 20 fps (a frame every third refresh): game time keeps real time', () => {
  frames.clear();
  const r = rig();
  clock = 50_000;
  r.e.start();
  for (let k = 1; k <= 200; k++) refresh(50_000 + k * 3 * HZ60);
  r.e.stop();
  assert.ok(Math.abs(r.sim - 10) < 0.1, `10 s of real time at 20 fps, ${r.sim.toFixed(2)} s simulated`);
});

test('a 48 Hz screen: game time keeps real time', () => {
  frames.clear();
  const r = rig();
  clock = 60_000;
  r.e.start();
  for (let k = 1; k <= 480; k++) refresh(60_000 + (k * 1000) / 48);
  r.e.stop();
  assert.ok(Math.abs(r.sim - 10) < 0.1, `10 s of real time at 48 Hz, ${r.sim.toFixed(2)} s simulated`);
});
