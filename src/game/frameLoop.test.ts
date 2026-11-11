/**
 * The frame loop keeps real time (R-165.116; engine audit A-01, 2026-11-11, brought in from
 * reference/audits/2026-11-11/tests-a/engine-loop-time.test.ts on t-audit-engine-a@afc01365, its cases and thresholds unchanged).
 *
 * Before the fix, engine.ts loop() took `dt` from the whole gap since the last frame AND set lastRenderTime back by the gap's
 * remainder (the old phase line), so a late frame's remainder was played twice. On a phone that holds 30 fps but drops one refresh,
 * the game then ran at 1.5x for good, and the governor, fed 50 ms "slow" frames, stepped the picture from q0 to q2.
 * The rule now (PERFORMANCE-RULES.md §3.2): the game is played in steps of exactly 1/30 s, from an account of real time not yet played;
 * a late frame catches up in up to three steps and anything longer is dropped; the governor and the recorder see the true gap.
 *
 * These tests drive the engine's own loop() with rAF timestamps; only update() and render() are swapped for counters.
 */
import { RealPlay } from './realPlay.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

type Eng = Record<string, any>;

/** the engine's own loop, fed these rAF timestamps (ms) */
function drive(stamps: number[]) {
  const eng = new RealPlay('1-2', 1).e as Eng;
  const dts: number[] = [];
  let frames = 0;
  eng.update = (dt: number) => void dts.push(dt);
  eng.render = () => void frames++;
  eng.isRunning = true;
  eng.isPaused = false;
  eng.lastRenderTime = stamps[0];
  eng.lastTime = stamps[0];
  for (let i = 1; i < stamps.length; i++) eng.loop(stamps[i]);
  eng.isRunning = false;
  const sim = dts.reduce((a, b) => a + b, 0);
  return { eng, sim, real: (stamps[stamps.length - 1] - stamps[0]) / 1000, updates: dts.length, dts, frames };
}

/** rAF callbacks every `gapMs` for `seconds` */
const every = (gapMs: number, seconds: number) => Array.from({ length: Math.floor((seconds * 1000) / gapMs) + 1 }, (_, i) => i * gapMs);

/** a 60 Hz phone whose frame work takes workLo..workHi ms (seeded): each rAF fires on the first vsync after the last frame's work ended */
function struggling(workLo: number, workHi: number, seconds: number): number[] {
  const out = [0];
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const vs = 1000 / 60;
  while (out[out.length - 1] < seconds * 1000) {
    const done = out[out.length - 1] + workLo + rnd() * (workHi - workLo);
    out.push(Math.ceil(done / vs - 1e-9) * vs);
  }
  return out;
}

const CASES: Array<[string, number[]]> = [
  ['60 Hz, steady (the baseline: must be exact)', every(1000 / 60, 10)],
  ['90 Hz, steady', every(1000 / 90, 10)],
  ['120 Hz, steady', every(1000 / 120, 10)],
  ['144 Hz, steady', every(1000 / 144, 10)],
  ['59.94 Hz, steady (most "60 Hz" screens)', every(1000 / 59.94, 10)],
  ['60 Hz screen, each frame takes 50 ms (a struggling phone at 20 fps)', every(50, 10)],
  ['60 Hz screen, frame work 36-60 ms at random (the APK today: R-3.1 says under 20 fps)', struggling(36, 60, 10)],
  ['60 Hz screen, frame work 20-40 ms at random (a phone that mostly holds 30, some frames late)', struggling(20, 40, 10)],
  ['48 Hz screen (a variable-refresh phone at its 48 Hz step)', every(1000 / 48, 10)],
  ['75 Hz screen', every(1000 / 75, 10)],
];

for (const [name, stamps] of CASES) {
  test(`A-01 game time keeps real time, in 1/30 s steps, at most 30 frames a second: ${name}`, () => {
    const r = drive(stamps);
    const err = (r.sim - r.real) / r.real;
    assert.ok(
      Math.abs(err) < 0.02,
      `simulated ${r.sim.toFixed(3)} s of game in ${r.real.toFixed(3)} s of real time (${(err * 100).toFixed(1)}% ${err > 0 ? 'fast' : 'slow'}, ${r.updates} updates)`,
    );
    const step = (1 / 30) * r.eng.speedScale;
    assert.ok(r.dts.every((d) => d === step), `every step is exactly 1/30 s (saw ${[...new Set(r.dts)].slice(0, 4).join(', ')})`);
    // the 30 fps lock: never more frames than steps, so never more than 30 a second (+1 for the end of the window)
    assert.ok(r.frames <= r.real * 30 + 1, `${r.frames} frames in ${r.real.toFixed(2)} s: over the 30 fps lock`);
  });
}

/**
 * The sharpest form: a phone that holds a true 30 fps (its frames take 17-33 ms, so it can never run two frames one vsync apart)
 * drops ONE vsync, once. Before the fix every later frame read 50 ms though frames still arrived every 33.3 ms: the game played at 1.5x,
 * and the frame governor and the control test's fps line were fed 50 ms "slow" frames, so the picture quality was stepped down on a
 * phone that was keeping up.
 */
test('A-01b one late frame on a 30 fps phone must not leave the game at 1.5x speed with the governor reading 50 ms', () => {
  const eng = new RealPlay('1-2', 1).e as Eng;
  const vs = 1000 / 60;
  // 1 s at a steady 30 fps, one frame one vsync late (50 ms), then 9 s at a steady 30 fps again
  const stamps: number[] = [0];
  for (let i = 0; i < 30; i++) stamps.push(stamps[stamps.length - 1] + 2 * vs);
  stamps.push(stamps[stamps.length - 1] + 3 * vs);
  const lateAt = stamps.length - 1;
  for (let i = 0; i < 270; i++) stamps.push(stamps[stamps.length - 1] + 2 * vs);

  let simAfter = 0;
  let index = 0;
  eng.update = (dt: number) => {
    if (index > lateAt) simAfter += dt;
  };
  eng.render = () => {};
  const fed: number[] = [];
  const feed = eng.gov.feed.bind(eng.gov);
  eng.gov.feed = (ms: number) => {
    if (index > lateAt) fed.push(ms);
    return feed(ms);
  };
  // (start from the full picture, as a 2023-or-newer phone does: PERFORMANCE-RULES §1 says it must stay there for the stage)
  eng.quality = 0;
  const q0 = eng.quality;
  eng.isRunning = true;
  eng.isPaused = false;
  eng.lastRenderTime = 0;
  for (index = 1; index < stamps.length; index++) eng.loop(stamps[index]);
  eng.isRunning = false;

  const realAfter = (stamps[stamps.length - 1] - stamps[lateAt]) / 1000;
  const avgFed = fed.reduce((a, b) => a + b, 0) / fed.length;
  const speed = simAfter / realAfter;
  assert.ok(
    Math.abs(speed - 1) < 0.02 && avgFed < 36 && eng.quality === q0,
    `after one 50 ms frame, 9 s of steady 33.3 ms frames played at ${speed.toFixed(2)}x; the governor was fed ${avgFed.toFixed(1)} ms frames ` +
      `(real gap 33.3 ms); picture quality went q${q0} -> q${eng.quality}`,
  );
});

test('a stall is caught up in three steps at most and the rest is dropped, never played back in a burst', () => {
  // steady 30 fps, one 500 ms stall, steady again
  const stamps = [...every(1000 / 30, 1)];
  const t0 = stamps[stamps.length - 1] + 500;
  const stallFrame = stamps.length - 1; // (perFrame[k] is stamps[k + 1]): the frame that ends the stall plays three steps
  for (let i = 0; i <= 60; i++) stamps.push(t0 + (i * 1000) / 30);
  const perFrame: number[] = [];
  const eng = new RealPlay('1-2', 1).e as Eng;
  let n = 0;
  eng.update = () => void n++;
  eng.render = () => {};
  eng.isRunning = true;
  eng.lastRenderTime = stamps[0];
  for (let i = 1; i < stamps.length; i++) {
    n = 0;
    eng.loop(stamps[i]);
    perFrame.push(n);
  }
  assert.equal(Math.max(...perFrame), 3, `at most three steps in one frame (saw ${Math.max(...perFrame)})`);
  assert.equal(perFrame[stallFrame], 3, 'the frame after the stall plays three steps');
  assert.ok(perFrame.slice(stallFrame + 1).every((k) => k === 1), `after the stall, one step a frame again (saw ${perFrame.slice(stallFrame + 1).join('')})`);
  // 1 s + 2 s of steady play + 0.1 s caught up of the 0.5 s stall
  const sim = perFrame.reduce((a, b) => a + b, 0) / 30;
  const real = (stamps[stamps.length - 1] - stamps[0]) / 1000;
  assert.ok(Math.abs(sim - (real - 0.4)) < 0.034, `the stall's last 0.4 s is dropped: ${sim.toFixed(3)} s played in ${real.toFixed(3)} s`);
});
