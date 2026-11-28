// METER-4: the meter prices the LINE (2-3 "Walk Them Home": follow.ts, followPlay.ts, gen2/lineFaults.ts), so 2-3 is judged by numbers
// before it is built. score.ts lineCrossings / lineChallenges read the game's own code: lineFaults' safeWindow (FollowPlay flown) for the
// leave, follow.ts lineInCover for the stop, the follow row (W2_FOLLOW) for pace and gap, PHYS.maxRun for his run, STAKES for a spook's
// fetch. The toy is ENG-23's marsh (lineBot.test.ts), lineToy.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lineCrossings, lineChallenges, stopSpan, scoreStage, windowBits, deadlineBits, STAKES, UnpricedPiece, leaveWindow, mirrorFollow } from './score.ts';
import { layMarsh, marsh, marshStage, TOY_Y } from './lineToy.ts';
import { W2_FOLLOW } from '../../src/game/gen2/worlds/w2.ts';
import { safeWindow } from '../../src/game/gen2/lineFaults.ts';
import { PHYS } from '../../src/game/physics.ts';
import type { Bush } from '../../src/game/watcher.ts';

const SAMPLES = Array.from({ length: 401 }, (_, i) => ({ x: i * 25, y: TOY_Y, base: (i * 25) / PHYS.maxRun, seg: {} as any }));
const CAGES = [420, 470, 520];
const reeds = (x: number, w: number): Bush => ({ x, w, y: TOY_Y, kind: 'reeds' });
/** the crossing between the marsh's two clumps (A at 1000, B at bx) */
const mid = (m = marsh(), setting: 'normal' | 'easy' = 'normal') => lineCrossings(marshStage(m), W2_FOLLOW, setting, CAGES, 3).find((c) => c.A && c.B)!;
const lineOf = (m = marsh(), setting: 'normal' | 'easy' = 'normal') => lineChallenges(marshStage(m), W2_FOLLOW, SAMPLES as any, setting, CAGES, 3).filter((c) => c.kind === 'line' && /from the reeds at 1000/.test(c.note))[0];

test('the leave is lineFaults\' own flown safeWindow, priced as a timed press he may wait for', () => {
  const c = mid();
  const flown = safeWindow(W2_FOLLOW, false, reeds(1000, 300), reeds(1700, 300), marsh().zones, marshStage().platforms, [], 3);
  assert.equal(c.safe, flown, 'the same flight, the same number');
  assert.equal(c.cycle, 5 + 2.0 + 2.6, 'the cycle: calm + warn + pass (watcher.ts WATCH)');
  assert.ok(Math.abs(c.cross - (400 + 3 * W2_FOLLOW.gap) / W2_FOLLOW.pace.normal) < 1e-9, 'crossing (G + N x gap) / pace');
  const l = lineOf();
  assert.ok(Math.abs(l.bits - windowBits(c.cycle, c.safe)) < 1e-9);
  assert.deepEqual(l.span, [l.t, l.t + c.cross], 'the heron\'s eye is on the line while it crosses');
});

test('a crossing with a wide safe window prices low, a tight one high (wider mud; a second heron out of step)', () => {
  const wide = marsh({ covers: [reeds(1000, 300), reeds(1500, 300)] }); // G 200
  const open = marsh({ covers: [reeds(1000, 300), reeds(1800, 300)] }); // G 500
  const two = marsh({ covers: [reeds(1000, 300), reeds(1650, 300)], zones: [{ x0: 900, x1: 2100, calm: [5, 5] }, { x0: 900, x1: 2100, calm: [5, 5], lag: 3.2 }] }); // G 350, 2-3's beat 7
  const [w, o, t] = [mid(wide), mid(open), mid(two)];
  assert.ok(w.safe > o.safe, `G 200 leaves ${w.safe} s, G 500 ${o.safe} s`);
  assert.ok(lineOf(wide).bits < lineOf(open).bits, 'the wider mud prices higher');
  assert.ok(t.herons === 2 && t.safe < mid(marsh({ covers: [reeds(1000, 300), reeds(1650, 300)] })).safe, `two herons out of step narrow it (${t.safe} s)`);
  assert.ok(lineOf(two).bits > lineOf(marsh({ covers: [reeds(1000, 300), reeds(1650, 300)] })).bits, 'and price it higher');
});

test('the stop: where he and the N little ones all stand inside the reeds (lineInCover), W - N x gap - 20 px; narrower reeds price higher', () => {
  assert.equal(stopSpan(reeds(1700, 300), 3, W2_FOLLOW.gap), 300 - 3 * W2_FOLLOW.gap - 20);
  assert.equal(stopSpan(reeds(1700, 260), 5, W2_FOLLOW.gap), 260 - 5 * W2_FOLLOW.gap - 20, '2-3.md: W 260 holds the five in ~70 px');
  assert.equal(stopSpan(reeds(1700, 160), 5, W2_FOLLOW.gap), 0, 'a clump that cannot hold the line has no stop');
  const st = (w: number) => lineChallenges(marshStage(marsh({ covers: [reeds(1000, 300), reeds(1700, w)] })), W2_FOLLOW, SAMPLES as any, 'normal', CAGES, 3).find((c) => c.kind === 'line-stop' && c.x === 1700)!;
  assert.ok(Math.abs(st(300).bits - deadlineBits(178 / PHYS.maxRun)) < 1e-9, 'a press he cannot wait out at a run');
  assert.ok(st(240).bits > st(300).bits);
});

test('a spook adds its fetch cost: 2 x distance / his run, at the meter\'s replay rate', () => {
  const near = mid();
  const back = mid(marsh({ zones: [{ x0: 900, x1: 2100, calm: [5, 5], setback: 400 }] }));
  assert.ok(Math.abs(near.fetch - (2 * (1700 - 900)) / PHYS.maxRun) < 1e-9, 'from the crossing\'s far side back to the stretch\'s start');
  assert.ok(Math.abs(back.fetch - near.fetch - (2 * 500) / PHYS.maxRun) < 1e-9, 'a setback 500 px further back: 3.5 s more fetch');
  const a = lineOf(), b = lineOf(marsh({ zones: [{ x0: 900, x1: 2100, calm: [5, 5], setback: 400 }] }));
  assert.equal(a.cost, 'soft', 'no heart: nobody is hurt');
  assert.ok(Math.abs(a.stakes - (STAKES.soft + near.fetch * STAKES.replayPerSec)) < 1e-9);
  assert.ok(Math.abs(b.stakes - a.stakes - ((2 * 500) / PHYS.maxRun) * STAKES.replayPerSec) < 1e-9, 'the longer fetch costs exactly its seconds');
});

test('a stretch\'s first crossing: its whole first calm; free where the first look only warns (freeFirst, Easy); nobody following, nothing asked', () => {
  const first = (m = marsh(), s: 'normal' | 'easy' = 'normal') => lineChallenges(marshStage(m), W2_FOLLOW, SAMPLES as any, s, CAGES, 3).find((c) => c.kind === 'line' && /start/.test(c.note))!;
  assert.equal(first().cost, 'soft');
  assert.ok(Math.abs(first().bits - deadlineBits(5 + 2.0 - (100 + 3 * W2_FOLLOW.gap) / W2_FOLLOW.pace.normal)) < 1e-9);
  assert.equal(first(marsh(), 'easy').cost, 'retry');
  assert.equal(first(marsh({ zones: [{ x0: 900, x1: 2100, calm: [5, 5], freeFirst: true }] })).cost, 'retry');
  assert.equal(lineChallenges(marshStage(), W2_FOLLOW, SAMPLES as any, 'normal', [2500], 1).length, 0, 'the cage past the stretch: no line in it');
  assert.equal(mid(marsh(), 'normal').n, 3);
  assert.equal(lineCrossings(marshStage(), W2_FOLLOW, 'easy', [100, 200, 300, 400, 500], 3)[1].n, 3, 'at most the goal: Easy brings 3 of 5 home');
});

test('the follow toy end to end: the engine\'s own FollowPlay, line:follow a piece, both settings; without the follow row it is the old refusal', () => {
  for (const s of ['normal', 'easy'] as const) {
    const r = scoreStage('2-3', s, 1, new Map(), layMarsh());
    assert.equal(r.count.line, 3, `${s}: the stretch's start, clump to clump, the stretch's end`);
    assert.equal(r.count['line-stop'], 2);
    assert.ok(r.pieces.includes('line:follow') && !r.pieces.includes('beat:watched stretches'), r.pieces.join(','));
  }
  const n = scoreStage('2-3', 'normal', 1, new Map(), layMarsh()), e = scoreStage('2-3', 'easy', 1, new Map(), layMarsh());
  const sum = (r: typeof n) => r.challenges.filter((c) => c.kind.startsWith('line')).reduce((a, c) => a + c.points, 0);
  assert.ok(sum(e) < sum(n), `Easy's faster line asks less (${sum(e).toFixed(2)} < ${sum(n).toFixed(2)})`);
  // (planted: the same marsh read with no line channel (no follow row: the heron's stretch is then the eagle's watched stretches beat,
  //  which nothing prices): refused, as every follow stage was before METER-4)
  assert.throws(() => scoreStage('2-3', 'normal', 1, new Map(), layMarsh(marsh(), false)), (err: unknown) => err instanceof UnpricedPiece && err.piece === 'beat:watched stretches');
});

// ENG-METER-L (R-165.578): a LEFT-running follow stage (2-8's parade home) is priced, never refused. The toy marsh read in a mirror about
// M (x -> M - x: a different axis from the meter's own x -> -x, so nothing rides on where the stage sits): the same open ground, clumps,
// line, stops and fetches; its leave flown leftward with the game's FollowPlay at dir -1. The herons' first look sweeps world +x whichever
// way he runs (watcher.ts newWatch), so the left leave is the right one with the sweep turned: shifting the herons one whole cycle
// (WatchZone.lag = cycle) turns the sweep, and then each flight is the other's, to the 0.1 s step the leave is sampled at.
const M = 6000;
const flip = (c: Bush): Bush => ({ ...c, x: M - (c.x + c.w) });
const leftStage = (m = marsh()) => ({ ...marshStage(m), exitX: M - m.exit, dir: -1 as const, zones: m.zones.map((z) => ({ ...z, x0: M - z.x1, x1: M - z.x0 })), covers: m.covers.map(flip) });
const LCAGES = CAGES.map((x) => M - x);

test('a left-running follow stage: priced as the mirror of the right-running one, crossing by crossing (a and b in his travel)', () => {
  for (const s of ['normal', 'easy'] as const) {
    const R = lineCrossings(marshStage(), W2_FOLLOW, s, CAGES, 3);
    const L = lineCrossings(leftStage(), W2_FOLLOW, s, LCAGES, 3);
    assert.equal(L.length, R.length, `${s}: the same crossings`);
    assert.equal(L.length, 3);
    R.forEach((r, i) => {
      const l = L[i];
      assert.equal(l.a, M - r.a, `${s} ${i}: he leaves at the mirror of a`);
      assert.equal(l.b, M - r.b);
      assert.ok(l.a > l.b, 'in his travel: a left-running crossing runs from the larger x to the smaller');
      assert.deepEqual(l.A && { x: l.A.x, w: l.A.w }, r.A && { x: M - (r.A.x + r.A.w), w: r.A.w });
      assert.deepEqual(l.B && { x: l.B.x, w: l.B.w }, r.B && { x: M - (r.B.x + r.B.w), w: r.B.w });
      for (const k of ['n', 'herons', 'cycle', 'first', 'free', 'stop'] as const) assert.equal(l[k], r[k], `${s} ${i}: ${k}`);
      assert.ok(Math.abs(l.cross - r.cross) < 1e-9 && Math.abs(l.fetch - r.fetch) < 1e-9, `${s} ${i}: crossing time and fetch`);
      const y = r.A?.y ?? r.B!.y;
      const A1 = l.A ?? { x: l.a, w: 400, y, kind: 'reeds' as const }, B1 = l.B ?? { x: l.b - 400, w: 400, y, kind: 'reeds' as const };
      assert.equal(l.safe, l.first ? 0 : leaveWindow(W2_FOLLOW, s === 'easy', A1, B1, leftStage().zones, marshStage().platforms, [], l.n, -1), `${s} ${i}: the leave flown leftward`);
    });
    // (the mirror's own leave would be the right-running stage's: its first look then sweeps the way he runs, so it is not the game's)
    assert.ok(L[1].safe > 0 && L[1].safe < R[1].safe, `${s}: the herons' first look meets a left-runner head on: ${L[1].safe.toFixed(1)}s < ${R[1].safe.toFixed(1)}s`);
  }
});

test('the leftward leave is safeWindow\'s flight read the other way: one heron cycle later, each is the other (to the 0.1 s step)', () => {
  const m = marsh(), P = marshStage().platforms, A = m.covers[0], B = m.covers[1];
  for (const calm of [3, 5]) for (const easy of [false, true]) {
    const cyc = calm + 2.0 + 2.6;
    const zr = (lag: number) => [{ x0: 900, x1: 2100, calm: [calm, calm] as [number, number], lag }];
    const zl = (lag: number) => [{ x0: M - 2100, x1: M - 900, calm: [calm, calm] as [number, number], lag }];
    const r0 = safeWindow(W2_FOLLOW, easy, A, B, zr(0), P, [], 3), rL = safeWindow(W2_FOLLOW, easy, A, B, zr(cyc), P, [], 3);
    const l0 = leaveWindow(W2_FOLLOW, easy, flip(A), flip(B), zl(0), P, [], 3, -1), lL = leaveWindow(W2_FOLLOW, easy, flip(A), flip(B), zl(cyc), P, [], 3, -1);
    assert.ok(Math.abs(lL - r0) <= 0.1 + 1e-9, `calm ${calm} easy ${easy}: left a cycle late ${lL.toFixed(1)} = right ${r0.toFixed(1)}`);
    assert.ok(Math.abs(l0 - rL) <= 0.1 + 1e-9, `calm ${calm} easy ${easy}: left ${l0.toFixed(1)} = right a cycle late ${rL.toFixed(1)}`);
    assert.equal(leaveWindow(W2_FOLLOW, easy, A, B, zr(0), P, [], 3, 1), r0, 'dir 1 is lineFaults\' own safeWindow: no right-running number moves');
  }
});

test('a left-running stage\'s challenges: the right one\'s prices, each at the mirror of its place; the stop where his travel meets the clump', () => {
  const LSAMPLES = SAMPLES.map((q) => ({ ...q, x: M - q.x }));
  for (const s of ['normal', 'easy'] as const) {
    const R = lineChallenges(marshStage(), W2_FOLLOW, SAMPLES as any, s, CAGES, 3);
    const L = lineChallenges(leftStage(), W2_FOLLOW, LSAMPLES as any, s, LCAGES, 3);
    assert.deepEqual(L.map((c) => c.kind), R.map((c) => c.kind), `${s}: the same beats`);
    const Lc = lineCrossings(leftStage(), W2_FOLLOW, s, LCAGES, 3);
    L.forEach((l, i) => {
      const r = R[i];
      assert.equal(l.x, M - r.x, `${s} ${l.kind} ${i}: at the mirror of its place`);
      assert.ok(Math.abs(l.t - r.t) < 1e-9, `${s} ${l.kind} ${i}: on the same clock`);
      assert.equal(l.cost, r.cost);
      if (l.kind === 'line-stop') assert.ok(Math.abs(l.bits - r.bits) < 1e-9 && Math.abs(l.stakes - r.stakes) < 1e-9, 'the stop is the mirror\'s');
    });
    const ls = L.filter((c) => c.kind === 'line'), mids = Lc.filter((c) => !c.first);
    for (const c of mids) assert.ok(ls.some((l) => Math.abs(l.bits - windowBits(c.cycle, c.safe)) < 1e-9), `${s}: the leave priced from the leftward flight`);
    assert.match(ls[0].note, /over 100 px/, 'the open ground a positive length');
  }
  // (the mirror is its own inverse: read twice, the stage it was)
  const twice = mirrorFollow(mirrorFollow(leftStage()));
  assert.deepEqual(twice.covers, leftStage().covers);
  assert.deepEqual(twice.zones, leftStage().zones);
  assert.equal(twice.dir, -1);
});
