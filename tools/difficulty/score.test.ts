// R-165.239 (TOOLS-1, 11-14): the meter scores each liana ONCE, at its release, and a missed swing costs what the ground under it costs.
// BUILD-16b found every liana scored twice (route.ts gives a bank-to-bank liana two swing moves, the grab off the bank and the let-go onto
// the far one, and score.ts charged each) and every swing a life, even over World 1's soft moss pits, where a jump over the same pit is a
// set-back (costAt with softPits). The planted stage: two banks, one liana between, then a chain of two; with and without soft moss.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { swingChallenges, scoreStage, OTHER_BITS, STAKES } from './score.ts';
import type { Route, Seg } from '../inspect/route.ts';

const P = (id: number, x: number, y: number, width: number) => ({ id, x, y, width, height: 90, type: 'solid' as const });
const BANK_A = P(1, 0, 600, 300);
const BANK_B = P(2, 900, 600, 300);
/** a liana stage: the two banks, and (when given) what lies under the gap */
const stage = (under: ReturnType<typeof P>[] = [], heartFalls: Array<{ x0: number; x1: number; soft?: boolean }> = []) => ({
  platforms: [BANK_A, BANK_B, ...under], heartFalls, checkpoints: [{ x: 0 }], spawnX: 0,
});
const seg = (s: Partial<Seg> & Pick<Seg, 'kind' | 'x0' | 'y0' | 'x1' | 'y1'>): Seg => ({ dt: 1, ...s });
/** the route over one liana at x 450: walk the bank, grab it off the bank, let go onto the far bank */
const ONE: Route = { traced: 'extended', presumedHops: 0, addedLinks: 2, stops: 0, skippedStops: 0, segs: [
  seg({ kind: 'walk', x0: 100, y0: 600, x1: 300, y1: 600, plat: BANK_A }),
  seg({ kind: 'swing', x0: 300, y0: 600, x1: 450, y1: 560, from: BANK_A, note: 'added' }),
  seg({ kind: 'swing', x0: 450, y0: 560, x1: 900, y1: 600, plat: BANK_B, note: 'added' }),
] };
/** the route over a chain of two lianas (x 450, then 650): grab, leap to the next, let go */
const CHAIN: Route = { ...ONE, segs: [
  ONE.segs[0], ONE.segs[1],
  seg({ kind: 'swing', x0: 450, y0: 560, x1: 650, y1: 560, note: 'added' }),
  seg({ kind: 'swing', x0: 650, y0: 560, x1: 900, y1: 600, plat: BANK_B, note: 'added' }),
] };
/** a ledge-to-ledge swing the level check linked whole (one move for the liana) */
const LINKED: Route = { ...ONE, segs: [ONE.segs[0], seg({ kind: 'swing', x0: 300, y0: 600, x1: 900, y1: 600, from: BANK_A, plat: BANK_B })] };

test('one liana bank to bank is one swing, scored at its release, not two', () => {
  const c = swingChallenges(stage(), ONE, [], false);
  assert.equal(c.length, 1, 'the grab off the bank is the same liana, not a second swing');
  assert.equal(c[0].x, 450, "scored at the liana's release");
  assert.equal(c[0].bits, OTHER_BITS.swing);
});

test('a chain of two lianas is two swings; a ledge-to-ledge swing the check linked is one', () => {
  assert.equal(swingChallenges(stage(), CHAIN, [], false).length, 2);
  assert.equal(swingChallenges(stage(), LINKED, [], false).length, 1);
});

test('a missed swing costs what the ground under it costs, as a jump does', () => {
  // (no floor under the gap, the pits hard: a life, at least the life's stakes)
  const hard = swingChallenges(stage(), ONE, [], false)[0];
  assert.equal(hard.cost, 'life');
  assert.ok(hard.stakes >= STAKES.life);
  // (the same gap with soft moss, World 1's soft pits: a set-back, the stakes of one)
  const soft = swingChallenges(stage(), ONE, [], true)[0];
  assert.equal(soft.cost, 'soft');
  assert.equal(soft.stakes, STAKES.soft);
  // (a thorn floor under the swing: a heart; ground close under it: only another go)
  assert.equal(swingChallenges(stage([], [{ x0: 500, x1: 800 }]), ONE, [], true)[0].cost, 'heart');
  assert.equal(swingChallenges(stage([P(3, 300, 700, 600)]), ONE, [], false)[0].cost, 'retry');
  // (every swing of the chain the same way)
  assert.deepEqual(swingChallenges(stage(), CHAIN, [], true).map((x) => x.cost), ['soft', 'soft']);
});

test('on the real World 1 stages: one swing a liana the route hangs on, and none charged a life on a soft-pit stage', () => {
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7']) {
    const r = scoreStage(id, 'normal', 1, new Map());
    const swings = r.challenges.filter((c) => c.kind === 'swing');
    // (what the route hangs on: each liana it reaches, by a grab off a bank or a leap from the liana before, and each ledge-to-ledge
    // swing the check linked whole; one challenge each)
    const reached = r.route.segs.filter((s) => s.kind === 'swing' && !s.plat).length;
    const linked = r.route.segs.filter((s) => s.kind === 'swing' && s.from && s.plat).length;
    // (METER-1: a route link that leaps a chain's middle liana is flown liana by liana (chainOf), so there may be MORE swings than the
    //  route's moves, never two for one liana: each swing names its liana, and no liana is named twice)
    const vines = swings.map((c) => (c as any).vine?.id);
    assert.equal(new Set(vines).size, vines.length, `${id}: a liana scored twice (${vines.join(',')})`);
    const releases = r.route.segs.filter((s) => s.kind === 'swing' && !(s.from && !s.plat)).length;
    assert.ok(swings.length >= releases, `${id}: ${swings.length} swings for ${releases} release moves (${reached} lianas reached, ${linked} linked)`);
    if (r.soft) assert.deepEqual(swings.filter((c) => c.cost === 'life').map((c) => Math.round(c.x)), [], `${id}: its pits are soft, so no swing costs a life`);
  }
});

// ───────────── METER-1 (R-165.261, 11-14): the asks the meter did not count, each planted where it can be ─────────────
// 1-6 read Normal 3.3 (easier than 1-1's 4) on a meter that priced every liana release at a guessed 0.4 s in 1.6 s (2.32 bits), never saw
// the vine snakes, the catch off a bank or a creaky perch under a release, and leapt chain lianas the route's added links skipped; 1-8's
// chase read as a 2-bit hazard every 1.5 s (~16 a stretch) while its nuts scored nothing; 1-7's eagles took the default 0.5 s tell (a 200 px
// lookup that missed them) and their watched ground was not read.
import { releaseBits, releaseWindow, chainOf, catchWindow, snakeChallenges, chaseChallenges, rollingChallenges, watchChallenges, memberAt, combine,
  creatureBits, fittsBits, windowBits, BODY, REF_S, type Challenge } from './score.ts';
import { JUMP_AIRTIME, PHYS, SIM_DTS } from '../../src/game/physics.ts';
import { heldLandings } from '../../src/game/levelCheck.ts';
import { CHASE } from '../../src/game/chase.ts';
import { STILLNESS } from '../../src/game/stillness.ts';

/** a 420 px liana at x 1000, its anchor 420 px over the bank's top (1-6's measured liana) */
const LIANA = (id: number, x: number, extra: Record<string, unknown> = {}) => ({ id, x, topY: 400, bottomY: 820, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana' as const,
  isSwingingVine: true, swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0, ...extra });
const STAGE1 = (vines: any[], platforms: any[], more: Record<string, unknown> = {}) => ({ config: { worldIndex: 1, miniIndex: 6, levelHeight: 1400 }, vines, platforms, checkpoints: [{ x: 0 }], spawnX: 0, heartFalls: [], ...more });

test('a release is a timed press in the window the engine flies for that perch: bits = windowBits(period, heldLandings window)', () => {
  const v = LIANA(1, 1000);
  const perch = P(5, 1300, 820, 240);
  const st = STAGE1([v], [P(1, 600, 820, 300), perch]);
  const lines = heldLandings(v as any, 1, [perch as any], 1500, false).get(5) ?? 0;
  assert.ok(lines > 0, 'the engine lands him on the perch');
  const w = releaseWindow(st, v, { x: 1300, plat: perch }, 'normal', false);
  assert.equal(w.find((o) => o.plat === perch)?.w, lines * SIM_DTS[0], "the perch's window is the engine's own lines");
  const r = releaseBits(st, v, { x: 1300, plat: perch }, 'normal');
  assert.ok(Math.abs(r.bits - windowBits(2.85, lines * SIM_DTS[0])) < 1e-9 || r.note.includes('with the double'), r.note);
  // (a narrower perch further out leaves a narrower window: more bits)
  const far = P(6, 1420, 820, 60);
  const rn = releaseBits(STAGE1([v], [P(1, 600, 820, 300), far]), v, { x: 1420, plat: far }, 'normal');
  assert.ok(rn.bits > r.bits, `narrow ${rn.bits.toFixed(2)} > wide ${r.bits.toFixed(2)}`);
  // (crumbling wood where he lands: the crumble's +1)
  const creak = { ...perch, id: 7, type: 'fragile' };
  const rc = releaseBits(STAGE1([v], [P(1, 600, 820, 300), creak]), v, { x: 1300, plat: creak }, 'normal');
  assert.ok(Math.abs(rc.bits - r.bits - 1) < 1e-9, `crumble +1: ${rc.bits} vs ${r.bits}`);
  // (a perch no press reaches: the setting's floor, said so)
  const gone = P(8, 2600, 820, 200);
  const rf = releaseBits(STAGE1([v], [gone]), v, { x: 2600, plat: gone }, 'normal');
  assert.match(rf.note, /NOT FLOWN/);
  assert.equal(rf.bits, windowBits(2.85, 0.167));
});

test("a route link that leaps a chain's middle liana is flown liana by liana (chainOf), never through a false one", () => {
  const a = LIANA(1, 1000), b = LIANA(2, 1240), c = LIANA(3, 1480), f = LIANA(4, 1120, { snake: { route: 'still' }, swingAmp: 0 });
  const st = STAGE1([a, f, b, c], []);
  assert.deepEqual(chainOf(st, a, 1480).map((q) => q.id), [1, 2, 3]);
  assert.deepEqual(chainOf(st, c, 1000).map((q) => q.id), [3, 2, 1], 'and the other way');
});

test('the catch off a bank: a liana every running jump catches is the whole swing (free); one out of reach is none', () => {
  const bank = P(1, 600, 820, 300);
  const near = LIANA(1, 960);
  const w = catchWindow(bank, near, 1, 'normal');
  assert.ok(w > 0 && w <= 2.85 + 1e-9, `window ${w}`);
  assert.equal(catchWindow(bank, LIANA(2, 2400), 1, 'normal'), 0, 'out of any jump');
  // (Easy's longer grab, TIMED.grabX 76 over 60: of the same swing, Easy's catch is never the narrower share)
  const ez = LIANA(3, 1040);
  assert.ok(catchWindow(bank, ez, 1, 'easy') / 2.85 >= catchWindow(bank, ez, 1, 'normal') / 2.85 - 1e-9);
});

test("a vine snake is a creature in reach by its own warn (its tell), a threat at its liana's release, costing what the swing costs", () => {
  const clocks = [{ id: 'down', phases: [{ name: 'off', seconds: 6.4 }, { name: 'warn', seconds: 0.6 }, { name: 'on', seconds: 7 }], offset: 0, easyStretch: 1.15 }];
  const v = LIANA(1, 1000, { snake: { route: 'down-off', clock: 'down' } });
  const f = LIANA(2, 1128, { snake: { route: 'still' }, swingAmp: 0 });
  const far = LIANA(3, 2000, { snake: { route: 'still' }, swingAmp: 0 });
  const st = STAGE1([v, f, far], [], { clocks });
  const swing = { t: 10, x: 1000, ys: [800, 800] as [number, number], kind: 'swing', bits: 2.5, cost: 'soft' as const, stakes: 1, threat: false, note: '', vine: v };
  const out = snakeChallenges(st, [swing], 'normal');
  const sn = out.find((c) => c.kind === 'vine-snake')!;
  assert.equal(sn.bits, creatureBits(0.6));
  assert.equal(sn.threat, true);
  assert.equal(sn.cost, 'soft', "a startle off costs what the swing's ground costs");
  assert.ok(Math.abs(snakeChallenges(st, [swing], 'easy').find((c) => c.kind === 'vine-snake')!.bits - creatureBits(0.6 * 1.15)) < 1e-9, "Easy's stretched clock");
  const choices = out.filter((c) => c.kind === 'vine-snake-choice');
  assert.equal(choices.length, 1, 'the false liana beside the liana, not the one 1000 px off');
  assert.equal(choices[0].bits, 0.5);
  // (and the release on that liana is raised by it: things at once)
  const list: Challenge[] = [{ ...swing, overlap: 1, novelty: 1, points: 0 }, { ...sn, overlap: 1, novelty: 1, points: 0 }];
  combine(list, 1, new Map());
  assert.equal(list[0].overlap, 1.5);
});

/** a straight route over x 0..40000 at his run (the planted clock: t = x / 285) */
const SAMPLES = Array.from({ length: 401 }, (_, i) => ({ x: i * 100, y: 800, base: (i * 100) / PHYS.maxRun, seg: {} as any }));

test("a chase is one challenge a stretch, the front's share of his run, and the front overlaps every move inside its stretch", () => {
  const st = { chase: { stretches: [{ start: 1000, end: 4000 }, { start: 6000, end: 9000, last: true }] } };
  const c = chaseChallenges(st, SAMPLES as any, 'normal');
  assert.equal(c.length, 2, 'one a stretch, not a beat every 1.5 s');
  assert.equal(c[0].bits, fittsBits(CHASE.base / PHYS.maxRun));
  assert.equal(c[1].bits, fittsBits((CHASE.base + CHASE.final) / PHYS.maxRun), 'the last stretch at its burst');
  assert.equal(c[0].cost, 'heart', 'caught: a heart and back to his flag');
  const jump = (x: number): Challenge => ({ t: x / PHYS.maxRun, x, kind: 'single', bits: 2, cost: 'retry', stakes: 1, threat: false, overlap: 1, novelty: 1, points: 0, note: '' });
  const inside = jump(2500), outside = jump(5000);
  combine([inside, outside, ...c.map((q) => ({ ...q, overlap: 1, novelty: 1, points: 0 }))], 1, new Map());
  assert.equal(inside.overlap, 1.5, 'a jump in a stretch is done with the front coming');
  assert.equal(outside.overlap, 1, 'a jump on the living fork between is not');
  // (the hand-built chase: its run, then its burst from finalFrom)
  const hand = chaseChallenges({ proto: { chase: { start: 1000, end: 9000, finalFrom: 7000 } } }, SAMPLES as any, 'normal');
  assert.deepEqual(hand.map((q) => q.bits), [fittsBits(CHASE.base / PHYS.maxRun), fittsBits((CHASE.base + CHASE.final) / PHYS.maxRun)]);
});

test('a rolling nut is a hop timed to its roll; a fruit is read in its tell; a teach only bumps; each height its own move', () => {
  const R = { ROLL: { lowR: 15 }, rollRow: (h: any, easy: boolean) => ({ speed: h.speed * (easy ? 0.8 : 1), bounce: h.bounce }), rollTell: (easy: boolean) => 0.8 * (easy ? 1.15 : 1),
    rollMeetX: (h: any) => h.dropX - 300, rollTeaches: (h: any) => !!h.teach };
  const st = { rolling: [{ kind: 'low', dropX: 3000, speed: 110, bounce: 8 }, { kind: 'high', dropX: 6000, speed: 110, bounce: 110, teach: true }] };
  const [nut, fruit] = rollingChallenges(st, SAMPLES as any, 'normal', R);
  const win = JUMP_AIRTIME - (2 * 15 + BODY) / (PHYS.maxRun + 110);
  assert.equal(nut.kind, 'roll-low');
  assert.equal(nut.bits, Math.max(creatureBits(0.8), Math.log2(1 + REF_S / win)));
  assert.equal(nut.cost, 'heart');
  assert.equal(fruit.kind, 'roll-high', 'two heights, two moves (novelty apart)');
  assert.equal(fruit.bits, creatureBits(0.8));
  assert.equal(fruit.cost, 'retry', 'a teach: a bump');
  assert.ok(Math.abs(nut.t - 2700 / PHYS.maxRun) < 1, 'where it meets him');
  assert.equal(rollingChallenges({}, SAMPLES as any, 'normal', R).length, 0);
});

test("a watched stretch: each pass the run to the worst spot's nearest cover plus the calm-in, of the warn; its eye over the stretch", () => {
  const def = { kind: 'eagle', warn: 2, cool: 5, tell: 0.75, beatenBy: { still: { ends: 'flees' } }, easy: { cool: 1.5 } };
  const m = { e: { x: 1000, kit: { minX: 1000, maxX: 2000 }, kitFree: true }, def };
  const covers = [{ x: 990, w: 110 }, { x: 1790, w: 110 }];
  const out = watchChallenges([m], covers, SAMPLES as any, 'normal');
  // (cover spans 1000..1090 and 1800..1890, inside by 10 px: the worst spot is mid-way, 355 px from both; and 110 px past the last one)
  const need = (1800 - 1090) / 2;
  assert.equal(out.length, Math.max(1, Math.ceil((1000 / PHYS.maxRun) / 7)));
  assert.ok(Math.abs(out[0].bits - fittsBits((need / PHYS.maxRun + STILLNESS.normal.calmIn) / 2)) < 0.05, out[0].note);
  assert.equal(out[0].cost, 'retry', "the kit's first pass only warns");
  assert.ok(out[0].span, 'its eye is on him over the stretch');
  // (a mossy liana between the two bushes is cover: the worst spot comes nearer)
  const withMoss = watchChallenges([m], covers, SAMPLES as any, 'normal', [LIANA(9, 1445, { mossy: true })]);
  assert.ok(withMoss[0].bits < out[0].bits, `${withMoss[0].note}`);
  // (not a watcher: nothing)
  assert.equal(watchChallenges([{ e: m.e, def: { kind: 'snake', tell: 0.5 } }], covers, SAMPLES as any, 'normal').length, 0);
});

test("a creature beat finds its member on the member's own ground, not only within 200 px of where it perches (1-7's eagles)", () => {
  const eagle = { e: { x: 3000, kit: { minX: 3000, maxX: 3358 } }, def: { kind: 'eagle' } };
  const snake = { e: { x: 9000 }, def: { kind: 'snake' } };
  assert.equal(memberAt([eagle, snake], 2798), eagle, '202 px before its perch, its beat');
  assert.equal(memberAt([eagle, snake], 3300), eagle);
  assert.equal(memberAt([eagle, snake], 9100), snake);
  assert.equal(memberAt([eagle, snake], 6000), undefined);
});

test('on the real World 1 stages: a hand-built chase is scored by its stretches, never as a two-bit hazard a beat', () => {
  const r = scoreStage('1-8', 'normal', 1, new Map());
  if (!(r as any).route) return;
  const chaseBeats = r.challenges.filter((c) => c.kind === 'hazard' && /the branch collapses behind him/.test(c.note));
  assert.deepEqual(chaseBeats.map((c) => Math.round(c.x)), [], 'no chase pacing beat scored as a hazard');
  assert.ok(r.challenges.filter((c) => c.kind === 'chase').length >= 1, 'its chase is scored');
});
