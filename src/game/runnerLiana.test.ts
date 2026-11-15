/**
 * 1-8 NEW 4, A LIANA PHASED TO A RUNNER'S ARRIVAL (ENG-B6; runnerLiana.ts, pieces/runnerLianaPiece.ts), on the real engine: a lip, a gap,
 * a liana over it marked `runner`, the far bank. A player who holds the way on at his top run and presses at the lip catches it, from
 * EVERY moment its swing can start at, never stopping (in stride: no dead wait); no frame of its swing moves further than its own swing
 * plus the easing's share; it is never eased while he holds it; a respawn puts it back as laid. PLANTED: with the piece taken off the
 * hook the same run misses it from a third or more of those moments (the plain self-swing is luck at a run).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { PHYS, vineAmp, vinePeriod } from './physics.ts';
import { PIECE_KINDS } from './pieces/index.ts';
import { RUNNER_LIANA_PIECE } from './pieces/runnerLianaPiece.ts';
import { easePhase, phaseFor, RUNNER, runnerLip, runnerMoment, runnerProblems } from './runnerLiana.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform, Vine } from './types.ts';

const Y = 500;
const LIP = 3000;
const dt = 1 / 30;

/** a run-up to the lip, a gap, the far bank; the liana D0 px past the lip, 380 px up, 410 long (the old 1-8's last liana hung 170-195 px
 *  out; at 250 a run's jump meets it at under half the moments of its plain swing, physics.ts canGrabSwing) */
const D0 = 250;
function world(phase: number, runner = true): { plats: Platform[]; vines: Vine[] } {
  const plats: Platform[] = [];
  let id = 8000;
  for (let x = 0; x < LIP; x += 222) plats.push({ id: id++, x, y: Y, width: Math.min(222, LIP - x), height: 400, type: 'solid' } as Platform);
  plats.push({ id: id++, x: LIP + D0 + 230, y: Y, width: 1600, height: 400, type: 'solid' } as Platform);
  const v: Vine = { id: 77, x: LIP + D0, topY: Y - 380, bottomY: Y + 30, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingPhase: phase, ...(runner ? { runner: true } : {}) };
  return { plats, vines: [v] };
}

/** he holds right from the run-up at his top run and presses at the lip (held 0.2 s): caught? and did he ever slow before the lip? */
function runAt(phase: number, runner = true, setting: 'normal' | 'easy' = 'normal') {
  setDifficulty(setting);
  const w = world(phase, runner);
  const sim = new RealPlay('1-2', 1);
  const e = sim.e as unknown as { currentStage: GeneratedStage; checkpoint: unknown; vineClock: number; startPieces(): void };
  (e.currentStage as GeneratedStage).vines = w.vines;
  sim.bare(w.plats, w.vines);
  e.checkpoint = { x: LIP - 1500, y: Y };
  sim.stand(LIP - 1500, Y);
  e.vineClock = 0;
  const v = w.vines[0];
  let caught = false, slowest = Infinity, pressAt = -1, maxStep = 0, eased = 0, heldMoved = false, prevA = NaN;
  for (let i = 0; i < 30 * 9; i++) {
    const p = sim.p;
    const before = v.swingPhase;
    const press = p.grounded && p.x >= LIP - 30 && pressAt < 0;
    if (press) pressAt = i;
    const holdJump = pressAt >= 0 && i - pressAt < 6;
    sim.frame({ right: true, ...(holdJump ? { jump: true, press } : {}) });
    if (v.swingPhase !== before) eased++;
    if (Number.isFinite(prevA)) maxStep = Math.max(maxStep, Math.abs((v.swingAngle ?? 0) - prevA));
    prevA = v.swingAngle ?? 0;
    if (p.grounded && p.x > LIP - 900 && p.x < LIP - 40) slowest = Math.min(slowest, Math.abs(p.vx));
    // (in stride: caught within a second of the press, still up at the lip's height; a catch as it swings back to him falling into the
    // gap is no catch at a run)
    if (p.isVineSwinging && p.swingVineId === v.id) {
      caught = pressAt >= 0 && i - pressAt <= 30 && p.y < Y + 60;
      break;
    }
  }
  // (held: a few frames on, its phase does not move)
  if (caught) {
    const ph = v.swingPhase;
    for (let i = 0; i < 20; i++) sim.frame({ right: true });
    heldMoved = v.swingPhase !== ph;
  }
  setDifficulty('normal');
  return { caught, slowest, maxStep, eased, heldMoved, v };
}

const PHASES = Array.from({ length: 12 }, (_, i) => i / 12);

test('the moment: a full-run jump off the lip catches the planted liana at some moments of its swing, and the lay finds its lip', () => {
  const w = world(0);
  const lip = runnerLip(w.vines[0], w.plats);
  assert.ok(lip && lip.x + lip.width === LIP, 'its lip is the run-up\'s end');
  const m = runnerMoment(w.vines[0], LIP, Y);
  assert.ok(m && m.share > 0.5, `best moment ${JSON.stringify(m)}`);
  assert.deepEqual(runnerProblems(w.vines[0], w.plats), []);
});

test('easing: never more than RUNNER.rate of a swing a second, the short way round', () => {
  assert.ok(Math.abs(easePhase(0.1, 0.9, 1) - (0.1 - RUNNER.rate + 1)) < 1e-9, 'the short way round, by the rate');
  assert.ok(Math.abs(easePhase(0.2, 0.21, 1) - 0.21) < 1e-9);
  assert.ok(Math.abs(phaseFor({ x: 0, topY: 0, bottomY: 400 }, 0.25, vinePeriod({ x: 0, topY: 0, bottomY: 400 })) - 0.25) < 1e-9);
});

for (const setting of ['normal', 'easy'] as const) {
  test(`real engine, ${setting}: a runner catches the runner liana in stride from every moment its swing can start at; no frame jumps`, () => {
    const amp = vineAmp(world(0).vines[0]);
    for (const ph of PHASES) {
      const r = runAt(ph, true, setting);
      assert.ok(r.caught, `swing starting at ${ph.toFixed(3)}: missed`);
      assert.ok(r.slowest >= PHYS.maxRun * 0.9, `swing starting at ${ph.toFixed(3)}: he slowed to ${Math.round(r.slowest)} px/s before the lip`);
      // (its own swing's fastest step, and the easing's share on top: never a jump)
      const most = amp * ((2 * Math.PI) / vinePeriod(r.v)) * dt * (1 + RUNNER.rate * vinePeriod(r.v)) + 1e-6;
      assert.ok(r.maxStep <= most, `swing starting at ${ph.toFixed(3)}: a frame moved it ${r.maxStep.toFixed(4)} rad (most ${most.toFixed(4)})`);
      assert.equal(r.heldMoved, false, 'never eased while he holds it');
    }
  });
}

test('real engine, PLANTED: with the piece off the hook the same run misses the liana from a third or more of those moments', () => {
  const i = PIECE_KINDS.indexOf(RUNNER_LIANA_PIECE);
  assert.ok(i >= 0, 'the piece is on the hook');
  PIECE_KINDS.splice(i, 1);
  try {
    const missed = PHASES.filter((ph) => !runAt(ph).caught);
    console.log(`plain swing, a run's jump: caught from ${PHASES.length - missed.length} of ${PHASES.length} moments (missed ${missed.map((p) => p.toFixed(2)).join(' ')})`);
    assert.ok(missed.length >= PHASES.length / 3, `the plain swing missed from ${missed.length} of ${PHASES.length}: ${missed.map((p) => p.toFixed(2)).join(' ')}`);
  } finally {
    PIECE_KINDS.splice(i, 0, RUNNER_LIANA_PIECE);
  }
  // (and the same liana unmarked, the piece on: never eased)
  assert.equal(runAt(0.5, false).eased, 0);
});

test('a respawn puts the liana back as laid; the lay refuses a runner liana with no lip, or too short a run to ease it', () => {
  const w = world(0.3);
  const st = { vines: w.vines } as unknown as GeneratedStage;
  const host = { platforms: w.plats } as never;
  const piece = RUNNER_LIANA_PIECE.start(st, host)!;
  w.vines[0].swingPhase = 0.9;
  piece.respawn!(host);
  assert.equal(w.vines[0].swingPhase, 0.3);
  const noLip = runnerProblems(w.vines[0], w.plats.filter((p) => p.x >= LIP));
  assert.ok(noLip.some((m) => /no ground he runs off/.test(m)), noLip.join('; '));
  const short = w.plats.filter((p) => p.x >= LIP - 300);
  const sh = runnerProblems(w.vines[0], short);
  assert.ok(sh.some((m) => /px of run to its lip/.test(m)), sh.join('; '));
});

// ENG-CL (8), the lead 8:20 PM 11-14: runnerLip took the ground end NEAREST the liana at any height, so under a soft gap it took the pit's
// stair step (lower, its end nearer) and every Normal 1-8 K2 runner liana failed "200 px of run to its lip" (the fixture's tip filtered the
// line out). The lip is the ground he takes off from: of the ground ends in reach, the HIGHEST (anything lower lies in the gap under him),
// the nearest of those.
test('PLANTED: a pit step under the gap, its end nearer the liana, is not the lip; the run-up is, and the lay finds no fault', () => {
  const w = world(0);
  const step = { id: 9001, x: LIP, y: Y + 80, width: 150, height: 40, type: 'solid' } as Platform;
  const floor = { id: 9002, x: LIP, y: Y + 160, width: D0 + 230, height: 300, type: 'solid' } as Platform;
  const plats = [...w.plats, step, floor];
  const lip = runnerLip(w.vines[0], plats);
  assert.ok(lip && lip.x + lip.width === LIP && lip.y === Y, `its lip is the run-up's end at ${LIP}, not ${lip ? `${lip.x + lip.width} at y ${lip.y}` : 'none'}`);
  assert.deepEqual(runnerProblems(w.vines[0], plats), []);
  // (and a log lying on the run's end, which he hops onto and takes off from, is the lip: the higher of two ends at the same x)
  const log = { id: 9003, x: LIP - 300, y: Y - 40, width: 300, height: 40, type: 'solid' } as Platform;
  assert.equal(runnerLip(w.vines[0], [...plats, log])?.id, 9003, 'the log on the lip is the take-off');
});
