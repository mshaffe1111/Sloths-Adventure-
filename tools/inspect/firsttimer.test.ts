// npx tsx --test tools/inspect/firsttimer.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dotReport, edgesOf, firstHarms, flagsFor, flickHold, FirstTimerRun, FT_ADULT, FT_KID, gauss, peakStress, Progress, rng, SpotMemory, teaches,
  type Harm, type Shown, type Try,
} from './firsttimer.ts';
import type { Platform } from '../../src/game/types.ts';

const shown = (t0: number, t1: number | null, text: string, o: Partial<Shown> = {}): Shown => ({ key: `k:${text}`, text, kind: 'teach', source: 'engine', t0, t1, far: 0, near: 0, ...o });
const tryAt = (x: number, t0: number, ok: boolean, o: Partial<Try> = {}): Try => ({ x, y: 580, dir: 1, t0, t1: t0 + 0.6, kind: 'single', ok, hurt: !ok, running: true, hold: 0.15, ...o });

test('spot memory: a single jump that fails at a spot is followed by a double there; two falls back are a loop', () => {
  const m = new SpotMemory();
  assert.equal(m.plan(500, 580), 'single');
  m.result(500, 580, 'single', false);
  assert.equal(m.plan(530, 580), 'double', 'the same spot (within 60 px)');
  assert.equal(m.plan(700, 580), 'single', 'another spot');
  assert.equal(m.loops().length, 0);
  m.result(510, 580, 'double', false);
  assert.deepEqual(m.loops().map((l) => [l.n, l.doubles]), [[2, 1]]);
  // three deaths at one spot count too
  m.died(1500, 580);
  m.died(1520, 580);
  assert.ok(m.loops().some((l) => l.deaths === 2));
});

test('progress follows him along the route, never jumps to a far part of it, and finds him again after a respawn', () => {
  const pts = Array.from({ length: 101 }, (_, i) => ({ x: i * 24, y: 580 }));
  const pr = new Progress(pts);
  pr.relocate({ x: 0, y: 580 });
  assert.equal(pr.step({ x: 240, y: 580 }), true);
  assert.equal(pr.cur, 10);
  assert.equal(pr.step({ x: 240, y: 580 }), false, 'no further: no progress');
  pr.step({ x: 2400, y: 580 });
  assert.ok(pr.cur < 60, 'a point far ahead is not taken in one step');
  pr.relocate({ x: 48, y: 580 });
  assert.equal(pr.cur, 2);
  assert.ok(pr.best >= 10, 'the best so far is kept');
  assert.deepEqual(pr.target({ x: 48, y: 580 }), pts[6], 'heads for the first point over 90 px on');
});

test("the thumb: reaction and hold noise as the Gemini research's Stage B, never a flick under 2 frames", () => {
  const r = rng(7);
  const lag = Array.from({ length: 4000 }, () => gauss(r, FT_KID.thumb));
  const mean = lag.reduce((a, b) => a + b, 0) / lag.length;
  const sd = Math.sqrt(lag.reduce((a, b) => a + (b - mean) ** 2, 0) / lag.length);
  assert.ok(Math.abs(mean - 0.09) < 0.006 && Math.abs(sd - 0.065) < 0.006, `kid N(+90 ms, 65 ms): ${mean.toFixed(3)}, ${sd.toFixed(3)}`);
  const holds = Array.from({ length: 4000 }, () => flickHold(r, FT_KID));
  assert.ok(Math.min(...holds) >= 2 / 30 - 1e-9);
  const taps = holds.filter((h) => Math.abs(h - 2 / 30) < 1e-9).length / holds.length;
  assert.ok(taps > 0.06 && taps < 0.2, `about 8% cut to a tap (plus the low tail): ${taps.toFixed(3)}`);
  assert.ok(FT_ADULT.thumb[0] < FT_KID.thumb[0] && FT_ADULT.hold[1] < FT_KID.hold[1]);
});

test("Dot: repeats, lines too close (a warning may come at once), lines up 20 s+ with their thing out of reach, re-teaching, wordy lines", () => {
  const d = dotReport([
    shown(1, 5, 'Flick up to jump.'),
    shown(6, 10, 'Watch out!', { kind: 'danger' }),
    shown(8, 34, 'Flick up into the vine to grab it.', { far: 700, near: 80 }),
    shown(40, 44, 'Flick up to jump.', { doneBefore: true }),
    shown(60, 64, 'This is a very long line that has far more than ten words in it.', { kind: 'info' }),
  ], 100);
  assert.deepEqual(d.repeats.map((r) => [r.text, r.n]), [['Flick up to jump.', 2]]);
  assert.deepEqual(d.quick.map((q) => q.text), ['Flick up into the vine to grab it.'], 'the danger line 5 s after is allowed');
  assert.deepEqual(d.long.map((l) => [l.dur, l.outOfReach]), [[26, true]]);
  assert.deepEqual(d.reteach.map((l) => l.t), [40]);
  assert.equal(d.wordy.length, 1);
});

test('the first harm of each kind against the first tip that teaches it (on screen a reaction before it)', () => {
  const harms: Harm[] = [
    { kind: 'life', t: 1.3, x: 504, y: 640, cause: 'water', onScreen: null },
    { kind: 'hit', t: 30, x: 4000, y: 580, cause: 'foe:snake', onScreen: true },
    { kind: 'life', t: 40, x: 5000, y: 640, cause: 'water', onScreen: null },
  ];
  const lines = [shown(0.2, 3, "Gather flowers for the river king's crown!", { kind: 'goal' }), shown(20, 24, 'Tap to punch it before it gets close.', { topic: 'foe' }), shown(26, 30, 'Hop the lily pads.')];
  assert.equal(teaches('water', lines[0]), false, 'the goal line is not teaching');
  const f = firstHarms(harms, lines, 1);
  assert.deepEqual(f.map((h) => [h.cause, h.ok, h.tip?.t ?? null]), [['water', false, 26], ['foe:snake', true, 20]]);
});

test('the gates: survival per edge over the tries, and peak stress per burst before a rest', () => {
  const tries = [tryAt(500, 1, true), tryAt(510, 9, false), tryAt(520, 12, true), tryAt(900, 2, true), tryAt(905, 10, true), tryAt(910, 13, true)];
  const e = edgesOf(tries);
  assert.deepEqual(e.map((x) => [x.x, x.tries, x.sr]), [[500, 3, 0.67], [900, 3, 1]]);
  // the two edges 0.4 s apart are one burst on Normal (rest 1 s), two on Easy's 2 s? no: 1.6 - 0.4 < 2 too; both one burst
  const p = peakStress(e, 1);
  assert.equal(p.bursts, 1);
  assert.equal(p.peak, 0.33);
  assert.equal(peakStress(e, 0.2).bursts, 2);
});

test('in the real engine: a waist-high step is got over with a plain flick; a tall wall stops him and is reported with its height', () => {
  const ground = (x: number, w: number, y = 580): Platform => ({ id: 1, x, y, width: w, height: 90, type: 'solid' }) as Platform;
  const line = Array.from({ length: 160 }, (_, i) => ({ x: 100 + i * 24, y: 580 }));
  const play = (block: Platform) => {
    const run = new FirstTimerRun('1-1', 1, FT_ADULT, { route: line, cap: 16, rescueAfter: 1000 });
    run.sim.bare([ground(0, 4000), block]);
    run.sim.stand(100, 580);
    run.prog.relocate(run.sim.p);
    return run.play();
  };
  const step = play({ id: 2, x: 700, y: 520, width: 300, height: 60, type: 'solid' } as Platform);
  assert.ok(step.sim.p.x > 1000, `over the 60 px step (x ${Math.round(step.sim.p.x)})`);
  assert.ok(step.tries.length >= 1 && step.stuck.length === 0);
  const wall = play({ id: 2, x: 700, y: 250, width: 120, height: 330, type: 'solid' } as Platform);
  assert.ok(wall.stuck.length >= 1 && wall.stuck[0].x < 700, 'the 330 px wall stops him (and he is then put past it)');
  assert.ok(wall.stuck[0].step !== null && Math.abs(wall.stuck[0].step - 330) < 4, JSON.stringify(wall.stuck[0]));
  assert.ok(wall.loopsReport().some((l) => l.n >= 2 && l.doubles >= 1), 'he falls back, and tries a double after the first failure');
});

test('the findings name the rule each breaks', () => {
  const base = { who: 'KID', setting: 'easy', seed: 1, end: 'shrine', time: 120, x: 9000, progress: 1, goal: null, opening: [], harms: [], perMin: { hits: 0, lives: 0 }, gameOvers: 0, firstHarm: [], stuck: [], loops: [], stops: { n: 0, firstJumpFailed: 0, heights: [] }, puzzles: [], rescues: 0, dot: dotReport([], 120), flags: [], tries: [], turns: { n: 0, lag: 0 }, backtrack: { route: 1, bot: 1 }, noRoute: false, frames: 0, ms: 0 } as const;
  const f = flagsFor({ ...base, holdOn: { hit: null, life: { kind: 'life', t: 1.3, x: 504, y: 640, cause: 'water', onScreen: null } }, stuck: [{ x: 600, y: 580, t: 10, dur: 9, what: 'a 60 px waist-high step ahead', step: 60, dip: null, puzzle: false, rescued: false }] } as never);
  assert.equal(f[0].rule, 'opening');
  assert.ok(f.some((x) => x.rule === 'plainWalk' && x.kind === 'stuck'));
});
