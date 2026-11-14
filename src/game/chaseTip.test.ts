/**
 * 1-8 NEW 8, THE TIP (ENG-B6; chase.ts ChaseStretch.tip, pieces/chasePiece.ts), on the real engine: the last stretch of a laid chase ends
 * at the branch's tip (its last section drawn as the tip, Matt's long-branch sheet), a gap, a liana (phased to a runner, NEW 4), the far
 * bank. As he leaves the tip on the liana, the WHOLE of the stretch still standing breaks off at once, the tip tumbling whole, in a moment
 * of slow motion (the old 1-8's 0.55 s); standing on the tip it holds; a respawn before it makes it whole again; the lay refuses a tip on
 * a stretch that is not the last. PLANTED: the same run with no tip on the stretch leaves the branch ahead of the front standing.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { chaseLayProblems, type ChaseLay } from './chase.ts';
import { TIP } from './pieces/chasePiece.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform, Vine } from './types.ts';

const Y = 500;
const START = 1200, TIP_END = 3000, D0 = 250;

function world(tip: boolean): { plats: Platform[]; vines: Vine[]; lay: ChaseLay } {
  const plats: Platform[] = [];
  let id = 6000;
  const ground = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 222) plats.push({ id: id++, x, y: Y, width: Math.min(222, x1 - x), height: 400, type: 'solid', ...(chase ? { chase: true } : {}) } as Platform);
  };
  ground(0, START, false);
  ground(START, TIP_END, true);
  ground(TIP_END + D0 + 230, TIP_END + D0 + 2000, false);
  const v: Vine = { id: 55, x: TIP_END + D0, topY: Y - 380, bottomY: Y + 30, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingPhase: 0.4, runner: true };
  return { plats, vines: [v], lay: { stretches: [{ start: START, end: TIP_END, last: true, ...(tip ? { tip: true } : {}) }] } };
}

type Eng = { currentStage: GeneratedStage; checkpoint: unknown; vineClock: number; slowMoLeft: number; pieces: Array<{ kind: string; respawn?(h: unknown): void }>; pieceHost: unknown; player: { hp: number; maxHp: number } };

function setUp(tip: boolean) {
  setDifficulty('normal');
  const w = world(tip);
  const sim = new RealPlay('1-2', 1);
  const e = sim.e as unknown as Eng;
  e.currentStage.chase = w.lay;
  (e.currentStage as GeneratedStage).vines = w.vines;
  sim.bare(w.plats, w.vines);
  e.checkpoint = { x: 300, y: Y };
  sim.stand(300, Y);
  e.vineClock = 0;
  return { sim, e, w, own: w.plats.filter((p) => p.chase) };
}

/** he runs at his top run and presses at the tip's end: until he is on the liana and 10 frames more */
function swingOff(tip: boolean) {
  const { sim, e, w, own } = setUp(tip);
  const p = sim.p;
  let pressAt = -1, caughtAt = -1, slowAt = -1, fellAt = -1, wholeWhenLeft = NaN, i = 0;
  for (; i < 30 * 14; i++) {
    const press = p.grounded && p.x >= TIP_END - 30 && pressAt < 0;
    if (press) pressAt = i;
    sim.frame({ right: true, ...(pressAt >= 0 && i - pressAt < 6 ? { jump: true, press } : {}) });
    if (!p.grounded && p.x > TIP_END + TIP.past && Number.isNaN(wholeWhenLeft)) wholeWhenLeft = own.filter((q) => !q.broken).length;
    if (slowAt < 0 && e.slowMoLeft > 0) slowAt = i;
    if (fellAt < 0 && own.every((q) => q.broken)) fellAt = i;
    if (caughtAt < 0 && p.isVineSwinging && p.swingVineId === w.vines[0].id) caughtAt = i;
    if (caughtAt >= 0 && i > caughtAt + 10) break;
  }
  return { sim, e, own, caughtAt, slowAt, fellAt, pressAt, tipSec: own[own.length - 1] };
}

test('the tip: the stretch\'s last section is drawn as the tip; as he leaves it on the liana the whole stretch falls at once, in slow motion', () => {
  const r = swingOff(true);
  assert.ok(r.caughtAt >= 0, 'he caught the liana off the tip');
  assert.equal(r.tipSec.chaseTip, true, 'its last section is the tip');
  assert.ok(r.fellAt >= 0, `the branch end fell: ${r.own.filter((q) => !q.broken).length} sections still standing`);
  // (at once: the step he left the tip, never before he left it)
  assert.ok(r.fellAt > r.pressAt, 'never before he jumped');
  assert.ok(r.slowAt >= 0 && r.slowAt === r.fellAt, `slow motion from the same step (slow ${r.slowAt}, fell ${r.fellAt})`);
  const debris = (r.e.pieces.find((q) => q.kind === 'chase') as unknown as { debris: Array<{ tip?: boolean }> }).debris;
  assert.ok(debris.some((d) => d.tip), 'the tip tumbles whole');
});

test('the tip, PLANTED: with no tip on the stretch, the same run leaves the branch ahead of the front standing, and no slow motion', () => {
  const r = swingOff(false);
  assert.ok(r.caughtAt >= 0);
  assert.ok(r.own.some((q) => !q.broken), 'with no tip some sections still stand');
  assert.equal(r.slowAt, -1);
});

test('the tip holds while he stands on it; a respawn before it makes the whole branch end again', () => {
  const { sim, e, own } = setUp(true);
  sim.stand(TIP_END - 60, Y);
  for (let i = 0; i < 15; i++) sim.frame({});
  assert.ok(own[own.length - 1].broken !== true, 'standing on the tip, it holds');
  const r = swingOff(true);
  assert.ok(r.fellAt >= 0);
  const chase = r.e.pieces.find((q) => q.kind === 'chase')!;
  r.sim.stand(300, Y);
  chase.respawn!(r.e.pieceHost);
  assert.ok(r.own.every((q) => !q.broken), 'whole again from a flag before the stretch');
  void e;
});

test('the lay refuses a tip on a stretch that is not the last', () => {
  const bad = chaseLayProblems({ stretches: [{ start: 0, end: 900, tip: true }, { start: 1200, end: 2000 }] });
  assert.ok(bad.some((m) => /a tip on a stretch that is not the last/.test(m)), bad.join('; '));
  assert.deepEqual(chaseLayProblems(world(true).lay), []);
});
