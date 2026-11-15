// METER-2a step 2 (R-165.272; METER-COVERAGE #20 / #25): the ride channel. A hop onto a moving floor is a MOVING jump (the still jump's
// bits plus its board window, RW), a hop off it is a forced deadline (FB). Until METER-2a jumps.ts routeJumps took jumps and hops only,
// so a 'timedHop' scored nothing at all; the planted rivers and rides below are each priced from the engine's own rule for the floor.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rideChallenges, rideTiming, windowBits, deadlineBits, fittsBits, scoreStage, REACH, BODY, UnpricedPiece } from './score.ts';
import { sampleRoute } from '../inspect/beats.ts';
import { driftCycle, type DriftInfo } from '../../src/game/river.ts';
import { beatOf } from '../../src/game/clock.ts';
import type { Route, Seg } from '../inspect/route.ts';

const P = (id: number, x: number, y: number, width: number, extra: Record<string, unknown> = {}) => ({ id, x, y, width, height: 60, type: 'solid' as const, ...extra });
const seg = (s: Partial<Seg> & Pick<Seg, 'kind' | 'x0' | 'y0' | 'x1' | 'y1'>): Seg => ({ dt: 1, ...s });
/** a river 700 px wide (x 300-1000) flowing with him at 70 px/s, three 160 px logs spaced on its one clock (river.ts driftX) */
const D = (offset: number): DriftInfo => ({ x0: 300, x1: 1000, dir: 1, speed: 70, width: 160, offset, baseY: 628 });
const LOGS = [0, 1, 2].map((k) => ({ ...P(10 + k, 300 + k * 240, 628, 160), type: 'drift' as const, drift: D(k * (driftCycle(D(0)) / 3)) }));
const BANK_A = P(1, 0, 600, 300), BANK_B = P(2, 1000, 600, 300);
const river = (safe: boolean) => ({ platforms: [BANK_A, BANK_B, ...LOGS], rivers: [{ x0: 300, x1: 1000, surfaceY: 642, dir: 1, speed: 70, ...(safe ? { safe: { backX: 250, backY: 600 } } : {}) }], heartFalls: [], checkpoints: [{ x: 0 }], spawnX: 0 });
/** the route over it: bank, onto log 1, log 1 to log 2, log 2 to the far bank */
const RIVER: Route = { traced: 'check', presumedHops: 0, addedLinks: 0, stops: 0, skippedStops: 0, segs: [
  seg({ kind: 'walk', x0: 100, y0: 600, x1: 300, y1: 600, plat: BANK_A }),
  seg({ kind: 'timedHop', x0: 300, y0: 600, x1: 360, y1: 628, from: BANK_A, plat: LOGS[0] as any }),
  seg({ kind: 'timedHop', x0: 460, y0: 628, x1: 560, y1: 628, from: LOGS[0] as any, plat: LOGS[1] as any }),
  seg({ kind: 'timedHop', x0: 700, y0: 628, x1: 1010, y1: 600, from: LOGS[1] as any, plat: BANK_B }),
] };

test('a hop onto a drifting log is a moving jump: its board window (feet on the log, once a log spacing), not nothing (planted: the old meter priced it 0)', () => {
  const rt = rideTiming(river(false), LOGS[0], 'normal')!;
  assert.equal(rt.how, 'drift');
  assert.ok(Math.abs(rt.cycle - driftCycle(D(0)) / 3) < 1e-9, 'one log spacing: the cycle over the three logs');
  assert.ok(Math.abs(rt.board - (160 - BODY) / 70) < 1e-9, 'his body on a 160 px log at 70 px/s');
  const c = rideChallenges(river(false), RIVER, sampleRoute(RIVER), 'normal', false, 'fixture');
  const boards = c.filter((x) => x.kind === 'ride-board'), offs = c.filter((x) => x.kind === 'ride-off');
  assert.equal(boards.length, 2, 'onto log 1, onto log 2');
  assert.equal(offs.length, 2, 'off log 1, off log 2');
  for (const b of boards) { assert.ok(b.bits > 0); assert.ok(Math.abs(b.bits - windowBits(rt.cycle, rt.board)) < 1e-9, b.note); }
});

test('the step-off is a forced deadline: a single jump\'s reach over the log\'s speed, or half the ride, the shorter; Easy no harder', () => {
  const rt = rideTiming(river(false), LOGS[1], 'normal')!;
  assert.ok(Math.abs(rt.stepOff - Math.min(REACH.single.gap.normal / 70, 700 / 70 / 2)) < 1e-9);
  const off = rideChallenges(river(false), RIVER, sampleRoute(RIVER), 'normal', false, 'fixture').filter((x) => x.kind === 'ride-off');
  for (const o of off) { assert.ok(Math.abs(o.bits - deadlineBits(rt.stepOff)) < 1e-9); assert.equal(o.threat, true); }
  const easy = rideChallenges(river(false), RIVER, sampleRoute(RIVER), 'easy', false, 'fixture').filter((x) => x.kind === 'ride-off');
  for (let i = 0; i < off.length; i++) assert.ok(easy[i].bits <= off[i].bits + 1e-9);
});

test('a miss into the water costs what the water costs: a teaching river splashes him back (soft), a deep one is a life', () => {
  assert.ok(rideChallenges(river(true), RIVER, sampleRoute(RIVER), 'normal', false, 'fixture').every((x) => x.cost === 'soft'));
  assert.ok(rideChallenges(river(false), RIVER, sampleRoute(RIVER), 'normal', false, 'fixture').every((x) => x.cost === 'life'));
});

test('a ride on a stage beat (ride.ts): board while it stands at the near end, once in two periods, plus the still jump; Easy stretches it', () => {
  const clock = { id: 'ferry', offset: 0, easyStretch: 1.5, phases: [{ name: 'off', seconds: 1 }, { name: 'warn', seconds: 0.5 }, { name: 'on', seconds: 2 }, { name: 'rest', seconds: 1 }] };
  const raft = { ...P(20, 400, 600, 120), type: 'moving' as const, ride: { clock: 'ferry', path: [{ x: 400, y: 600 }, { x: 700, y: 600 }], w: 120 } };
  const st = { platforms: [BANK_A, BANK_B, raft], clocks: [clock], heartFalls: [], checkpoints: [{ x: 0 }], spawnX: 0 };
  const route: Route = { ...RIVER, segs: [RIVER.segs[0], seg({ kind: 'timedHop', x0: 300, y0: 600, x1: 420, y1: 600, from: BANK_A, plat: raft as any }), seg({ kind: 'timedHop', x0: 800, y0: 600, x1: 1010, y1: 600, from: raft as any, plat: BANK_B })] };
  for (const setting of ['normal', 'easy'] as const) {
    const b = beatOf(clock as any, setting === 'easy');
    const rt = rideTiming(st, raft, setting)!;
    assert.equal(rt.how, 'ride');
    assert.ok(Math.abs(rt.cycle - 2 * b.period) < 1e-9 && Math.abs(rt.board - (b.period - 2 * (setting === 'easy' ? 1.5 : 1))) < 1e-9, `${setting}: stands its rest, off and warn`);
    const [board] = rideChallenges(st, route, sampleRoute(route), setting, false, 'fixture').filter((x) => x.kind === 'ride-board');
    assert.ok(Math.abs(board.bits - (fittsBits(120 / REACH.single.gap[setting]) + windowBits(rt.cycle, rt.board))) < 1e-9, board.note);
  }
});

test('a moving floor on no clock the meter reads is refused, never priced as nothing', () => {
  const old = { ...P(30, 400, 600, 120), type: 'moving' as const, moveRange: 200, moveSpeed: 60 };
  const st = { platforms: [BANK_A, BANK_B, old], heartFalls: [], checkpoints: [{ x: 0 }], spawnX: 0 };
  const route: Route = { ...RIVER, segs: [RIVER.segs[0], seg({ kind: 'timedHop', x0: 300, y0: 600, x1: 420, y1: 600, from: BANK_A, plat: old as any })] };
  assert.throws(() => rideChallenges(st, route, sampleRoute(route), 'normal', false, 'fixture'), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'platform:moving');
});

test("on a real river stage (the hand-built 2-1): every hop onto or off a log is priced, and its river beat is no flat 2", () => {
  const r = scoreStage('2-1', 'normal', 1, new Map());
  const hops = r.route.segs.filter((s) => s.kind === 'timedHop').length;
  assert.ok(hops > 0);
  const rides = r.challenges.filter((c) => c.kind.startsWith('ride'));
  assert.ok(rides.length >= hops, `${rides.length} ride challenges for ${hops} log hops`);
  assert.ok(!r.challenges.some((c) => c.kind === 'hazard' && /river crossing/.test(c.note)), 'the river is priced hop by hop, not as one 2-bit beat');
});

// FIX-22 step 2 (METER-COVERAGE #21; R-165.272): the pad price. A sinking pad (gen2/rideLay.ts layPads: a 'moving' lily carrying a `pad`)
// is a dwell: once on it he must be off before it goes under (FB, the stand deadline from its clock); a beat row's pad also has a board
// window (RW: up and shivering, once a breath). Planted: before this the meter refused every pad (`platform:moving` on no clock it reads).
import { padSizeClock, padBeatClock, PAD_SIZES, PAD_LAY } from '../../src/game/gen2/rideLay.ts';
const POND = { x0: 300, x1: 1000, surfaceY: 642, dir: 1 as const, speed: 0 };
const padSt = (by: 'weight' | 'beat', safe: boolean) => {
  const clock = by === 'weight' ? padSizeClock('small') : padBeatClock('pads-row', { up: 1.8, shiver: 0.6, under: 0.6 });
  const pad = { ...P(40, 400, 634, PAD_SIZES.small.w), height: PAD_LAY.h, type: 'moving' as const, lily: true, pad: { by, clock: clock.id, look: by === 'beat' ? 'beat' : 'small' } };
  return { pad, st: { platforms: [BANK_A, BANK_B, pad], clocks: [clock], rivers: [{ ...POND, ...(safe ? { safe: { backX: 230, backY: 600 } } : {}) }], heartFalls: [], checkpoints: [{ x: 0 }], spawnX: 0 }, clock };
};
const padRoute = (pad: any): Route => ({ ...RIVER, segs: [RIVER.segs[0], seg({ kind: 'timedHop', x0: 300, y0: 600, x1: 420, y1: 634, from: BANK_A, plat: pad }), seg({ kind: 'timedHop', x0: 530, y0: 634, x1: 1010, y1: 600, from: pad, plat: BANK_B })] });

test('a weight pad is priced from its count: always up when he boards, off before it goes under (its hold, Easy x1.5); never refused', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const { pad, st, clock } = padSt('weight', false);
    const b = beatOf(clock as any, setting === 'easy');
    const rt = rideTiming(st, pad, setting)!;
    assert.ok(rt, 'a pad is on a clock the meter reads');
    assert.equal(rt.how, 'pad');
    const hold = PAD_SIZES.small.hold * (setting === 'easy' ? PAD_LAY.easyStretch : 1);
    assert.ok(Math.abs(rt.stepOff - hold) < 1e-9, `${setting}: the stand deadline is the pad's hold (${rt.stepOff} vs ${hold})`);
    assert.ok(Math.abs(rt.board - b.period) < 1e-9 && Math.abs(rt.cycle - b.period) < 1e-9, 'a weight pad is up whenever he comes to it');
    const c = rideChallenges(st, padRoute(pad), sampleRoute(padRoute(pad)), setting, false, 'fixture');
    const off = c.find((x) => x.kind === 'ride-off')!, on = c.find((x) => x.kind === 'ride-board')!;
    assert.ok(Math.abs(off.bits - deadlineBits(hold)) < 1e-9, off.note);
    assert.ok(Math.abs(on.bits - fittsBits(120 / REACH.single.gap[setting])) < 1e-9, `boarding is the still hop alone: ${on.note}`);
    assert.ok(c.every((x) => x.cost === 'life'), 'a deep pond is a life');
  }
  const easy = rideTiming(padSt('weight', false).st, padSt('weight', false).pad, 'easy')!, normal = rideTiming(padSt('weight', false).st, padSt('weight', false).pad, 'normal')!;
  assert.ok(deadlineBits(easy.stepOff) <= deadlineBits(normal.stepOff), 'Easy never harder');
});

test('a beat pad is priced from its row\'s breath: board while it is up or shivering, once a breath (RW), off before it goes under (FB)', () => {
  const { pad, st, clock } = padSt('beat', true);
  for (const setting of ['normal', 'easy'] as const) {
    const b = beatOf(clock as any, setting === 'easy');
    const rt = rideTiming(st, pad, setting)!;
    const stand = b.period - b.seconds[b.names.indexOf('on')];
    assert.ok(Math.abs(rt.board - stand) < 1e-9 && Math.abs(rt.cycle - b.period) < 1e-9 && Math.abs(rt.stepOff - stand) < 1e-9, `${setting}: up + shiver of the breath`);
    const c = rideChallenges(st, padRoute(pad), sampleRoute(padRoute(pad)), setting, false, 'fixture');
    const on = c.find((x) => x.kind === 'ride-board')!;
    assert.ok(Math.abs(on.bits - (fittsBits(120 / REACH.single.gap[setting]) + windowBits(rt.cycle, rt.board))) < 1e-9, on.note);
    assert.ok(c.every((x) => x.cost === 'soft'), 'a splash-back pond is a set-back');
  }
});

test('a pad whose clock the stage does not list is refused, never priced as nothing', () => {
  const { pad, st } = padSt('weight', false);
  const bare = { ...st, clocks: [] };
  assert.throws(() => rideChallenges(bare, padRoute(pad), sampleRoute(padRoute(pad)), 'normal', false, 'fixture'), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'platform:moving');
});
