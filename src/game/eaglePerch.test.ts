/**
 * 1-7 beat 12, the eagle lands (ENG-E2, 1-7.md NEW 8): a sweeper PERCHED on a snag (Post.perched; laid by w1Cast.ts eagleOver with a
 * perch): its body stays on its branch while its gaze sweeps the stretch; its head turn is the warn, it looks down through the pass and
 * blinks when its gaze is on him hidden; it dives from the snag and flies back to it; two empty looks and it gives up and flies off.
 * Planted: each fails on the base (t-eng-e1@f573675b), where every eagle rides its eye and nothing is ever drawn perched.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CastPlay, type CastHero } from './castPlay.ts';
import { newPredator, stepPredator } from './predators/core.ts';
import { EAGLE } from './predators/world1.ts';
import type { PredatorState, Prey } from './predators/types.ts';
import { SNAG_PERCH, sweepPose, type SweepScene } from './sweepPose.ts';
import { SNAG_PERCH_DRAWN } from './w17Art.ts';
import { eagleOver } from './gen2/worlds/w1Cast.ts';
import type { Cover } from './stillness.ts';
import type { Platform } from './types.ts';

const GROUND = 500;
const ground: Platform[] = [{ id: 1, x: -400, y: GROUND, width: 3000, height: 40, type: 'solid' } as Platform];
const SNAG_X = 300;
const zone = { x0: 0, x1: 900, calm: [6, 6] as [number, number] };
const hero = (x: number, o: Partial<CastHero> = {}): CastHero => ({ x, y: GROUND, vx: 0, vy: 0, facing: 1, grounded: true, holding: false, ...o });
const prey = (x: number, still: boolean, covered: boolean): Prey => ({ x, y: GROUND, still, covered, facing: 1 } as Prey);

test('a perched eagle is laid on its snag over the moss: its body at the snag, its feet SNAG_PERCH over the ground', () => {
  const e = eagleOver(zone, GROUND, 9, { x: SNAG_X });
  assert.equal(e.kitPerch, true);
  assert.equal(e.x, SNAG_X);
  const c = new CastPlay({ kinds: ['eagle'], traps: [] }, [e], ground, 1, []);
  const s = c.members[0].s;
  assert.equal(s.perched, true);
  assert.equal(s.x, SNAG_X, 'its body starts on its snag, never on its eye (a rider starts on its eye)');
  assert.equal(s.y, GROUND - SNAG_PERCH);
  assert.equal(s.eyeX, zone.x0, 'its gaze starts at the end its first look sweeps from');
  // (a plain eagle over the same stretch still rides its eye)
  const plain = new CastPlay({ kinds: ['eagle'], traps: [] }, [eagleOver(zone, GROUND, 8)], ground, 1, []).members[0].s;
  assert.ok(!plain.perched);
  assert.equal(plain.x, plain.eyeX);
});

test("the kit's perch height is the snag's own branch (the piece it is measured on)", () => {
  assert.equal(Math.round(SNAG_PERCH_DRAWN), SNAG_PERCH);
});

test('perched, its body stays on its branch while its gaze sweeps the whole stretch; hidden still in the moss, it never dives', () => {
  const s = newPredator(EAGLE, { x: SNAG_X, y: GROUND - SNAG_PERCH, minX: zone.x0, maxX: zone.x1, perched: true });
  const dt = 1 / 30;
  let lo = Infinity, hi = -Infinity, dived = false;
  for (let i = 0; i < 12 * 30; i++) {
    const ev = stepPredator(EAGLE, s, { dt, t: i * dt, hero: prey(600, true, true), easy: false });
    if (ev.tell || s.phase === 'act') dived = true;
    assert.equal(s.x, SNAG_X, `its body left the snag in '${s.phase}' at ${(i * dt).toFixed(2)} s`);
    lo = Math.min(lo, s.eyeX);
    hi = Math.max(hi, s.eyeX);
  }
  assert.equal(dived, false, 'a hidden still sloth is never dived at');
  assert.equal(lo, zone.x0);
  assert.equal(hi, zone.x1, 'its gaze crossed the whole stretch');
});

test('perched, it dives FROM the snag at a moving sloth in the open, then flies back to its branch', () => {
  const s = newPredator(EAGLE, { x: SNAG_X, y: GROUND - SNAG_PERCH, minX: zone.x0, maxX: zone.x1, perched: true });
  const dt = 1 / 30;
  const seen: Array<{ phase: string; x: number; y: number }> = [];
  let hurtAt = -1;
  for (let i = 0; i < 14 * 30; i++) {
    // he walks back and forth near x 600, in the open
    const x = 600 + 20 * Math.sin(i * dt * 3);
    stepPredator(EAGLE, s, { dt, t: i * dt, hero: { ...prey(x, false, false) }, easy: false });
    seen.push({ phase: s.phase, x: s.x, y: s.y });
    if (s.phase === 'act' && hurtAt < 0) hurtAt = i;
  }
  assert.ok(hurtAt > 0, 'it dived at him');
  const firstAct = seen[hurtAt];
  assert.ok(Math.abs(firstAct.x - SNAG_X) < 40 && firstAct.y < GROUND - SNAG_PERCH + 40, `the act starts at its snag (${firstAct.x}, ${firstAct.y})`);
  assert.ok(seen.some((p) => p.phase === 'act' && Math.abs(p.x - 600) < 40 && Math.abs(p.y - GROUND) < 10), 'and reaches him');
  // back on its branch before its next look
  const back = seen.findIndex((p, k) => k > hurtAt && p.phase === 'hunt');
  assert.ok(back > 0, 'it looked again');
  assert.equal(seen[back].x, SNAG_X);
  assert.equal(seen[back].y, GROUND - SNAG_PERCH);
});

test('two empty looks with him hidden and it gives up and flies off (giveUp 2): 1-7 beat 12 "It was RIGHT THERE"', () => {
  const s = newPredator(EAGLE, { x: SNAG_X, y: GROUND - SNAG_PERCH, minX: zone.x0, maxX: zone.x1, perched: true });
  const dt = 1 / 30;
  let gone = false;
  for (let i = 0; i < 40 * 30 && !gone; i++) {
    stepPredator(EAGLE, s, { dt, t: i * dt, hero: prey(600, true, true), easy: false });
    if (s.phase === 'flee' || s.phase === 'gone') gone = true;
  }
  assert.ok(gone, `it gave up (phase ${s.phase})`);
});

/** the pose of a perched eagle at each kit phase, with him at `at` (hidden or not) */
const scene = (at: number, hidden: boolean): SweepScene => ({ hero: { x: at, y: GROUND }, view: { x: 0, y: GROUND - 600, w: 915 }, easy: false, spared: false, time: 1, hidden });
const state = (o: Partial<PredatorState>): PredatorState =>
  ({ ...newPredator(EAGLE, { x: SNAG_X, y: GROUND - SNAG_PERCH, minX: zone.x0, maxX: zone.x1, perched: true }), ...o });

test('drawn perched: away ahead at rest, its head turned for the warn, looking down the pass with its gaze shadow, a blink on him hidden', () => {
  const rest = sweepPose(EAGLE, state({ phase: 'rest' }), scene(600, false))!;
  assert.equal(rest.perch, 'ahead');
  assert.equal(rest.x, SNAG_X);
  assert.equal(rest.y, GROUND - SNAG_PERCH, 'drawn by its feet on the branch');
  assert.equal(rest.shadow, null, 'no gaze at rest');
  const warn = sweepPose(EAGLE, state({ phase: 'hunt', t: 0.5, eyeX: zone.x0 }), scene(600, false))!;
  assert.equal(warn.perch, 'turn', 'the head turn is the warn');
  assert.ok(warn.shadow && warn.shadow.x === zone.x0, 'its gaze shows where the look starts');
  const pass = sweepPose(EAGLE, state({ phase: 'hunt', t: 3, eyeX: 400 }), scene(600, true))!;
  assert.equal(pass.perch, 'down');
  assert.equal(pass.shadow?.x, 400, 'the gaze shadow slides with its eye');
  const onHim = sweepPose(EAGLE, state({ phase: 'hunt', t: 3, eyeX: 610 }), scene(600, true))!;
  assert.equal(onHim.perch, 'blink', 'it looks straight down at him, hidden, and blinks');
  const onHimOpen = sweepPose(EAGLE, state({ phase: 'hunt', t: 3, eyeX: 610 }), scene(600, false))!;
  assert.equal(onHimOpen.perch, 'down');
  // the dive and the fly-off are the flying eagle, never the perched frames
  for (const ph of ['tell', 'act', 'recover', 'flee'] as const) {
    const p = sweepPose(EAGLE, state({ phase: ph, t: 0.3, x: 450, y: GROUND - 60 }), scene(600, false))!;
    assert.equal(p.perch, undefined, `${ph} flies`);
    assert.equal(p.phase, 'swoop');
  }
  // a plain eagle is never drawn perched
  const flier = newPredator(EAGLE, { x: SNAG_X, y: GROUND, minX: zone.x0, maxX: zone.x1 });
  assert.equal(sweepPose(EAGLE, { ...flier, phase: 'hunt', t: 3, eyeX: 400 }, scene(600, false))?.perch, undefined);
});

test('perched in a real run: hidden still in moss cover as its gaze passes over him, it blinks and never dives', () => {
  const covers: Cover[] = [{ x: 500, w: 346, y: GROUND }];
  const c = new CastPlay({ kinds: ['eagle'], traps: [] }, [eagleOver(zone, GROUND, 9, { x: SNAG_X })], ground, 1, covers);
  const m = c.members[0];
  const dt = 1 / 30;
  let blinked = false;
  for (let i = 0; i < 12 * 30; i++) {
    const r = c.step(hero(600), dt, i * dt, false);
    assert.equal(r.hurts.length, 0);
    assert.equal(r.told.length, 0, 'never a tell');
    const p = sweepPose(m.def, m.s, { ...scene(600, c.calmNow(false) >= 1), time: i * dt });
    if (p?.perch === 'blink' && m.s.phase === 'hunt') blinked = true;
  }
  assert.ok(blinked, 'its gaze reached him and it blinked');
});
