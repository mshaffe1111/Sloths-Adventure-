// 1-2 judged on its own real jumps (F12, 11-12): its Normal rows were flown on stage 1-2 in the real engine at 30 fps
// (`FLIGHT_STAGE=1-2 npx tsx reference/specs/sims/flight.ts normal rise|dist|ddist|bdist|apex|chain`; the Designer's chain.md §1, re-flown
// on the merged engine, reference/qa-reports/F12/fly/), entered as world data (worlds/flownArcs.ts), and its table row says `judged`.
// 1-2's help is easeAssist(2) = 0.958 of 1-1's: the double and the bounce + air jump climb 1-2 px less; no gap figure moved.
//   npx tsx --test src/game/gen2/flown12.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { FLOWN_ARCS, JUDGED, arc, gapEnvelope, judgedOnArcs, lesserArcs, linkArcs, scopeOf } from './reach.ts';
import { judgeRoll } from './verdicts.ts';
import type { Judged11 } from './verdicts.ts';
import type { ReachMove } from './verdicts.types.ts';
import { gapFor } from './pipeline.ts';

const planted = (setting: 'normal' | 'easy', gap: number): Judged11 =>
  ({ stageId: '1-2', setting, policy: 'per-gap', drops: [], asks: [{ section: 's1', kind: 'single-gap', x0: 400, x1: 400 + gap, figure: gap, move: 'single-flick', headroom: 9999 }], routeGaps: [] }) as Judged11;

test('1-2 is judged on its own flown rows: Normal reads normal-1-2, Easy easy-any', () => {
  assert.equal(JUDGED['1-2'], 'normal-1-2');
  assert.equal(judgedOnArcs('1-2'), true);
  assert.equal(scopeOf('1-2', 'normal'), 'normal-1-2');
  assert.equal(scopeOf('1-2', 'easy'), 'easy-any');
  // (1-1 did not move)
  assert.equal(JUDGED['1-1'], 'normal-1-1');
});

test("1-2's Normal rows are the flight's figures (sims/out normal-1-2-rise, -dist, -ddist, -bdist), every move", () => {
  const want: Record<ReachMove, [number, number, number, number, number]> = {
    'single-hold': [123, 117, 137, 223, 246],
    'single-flick': [123, 116, 128, 213, 239],
    'single-tap': [87, 81, 77, 163, 184],
    'double-hold': [213, 207, 292, 379, 409],
    'double-flick': [211, 205, 283, 370, 396],
    'double-tap-tap': [150, 143, 191, 278, 299],
    bounce: [223, 217, 178, 178, 178],
    'bounce-air': [316, 307, 340, 340, 340],
  };
  for (const [move, w] of Object.entries(want) as [ReachMove, number[]][]) {
    const a = arc(move, 'normal-1-2');
    assert.deepEqual([a.climb.block, a.climb.thin, a.gap.from70, a.gap.lastGround, a.gap.any], w, move);
    assert.match(a.source, /^chain\.md §1 "/, move);
  }
  assert.equal(FLOWN_ARCS.filter((a) => a.scope === 'normal-1-2').length, 8, 'one row a move, no more');
  // (the lookups the builder and the verdicts read)
  assert.deepEqual(linkArcs('normal', '1-2'), { single: { gap: 143, climb: { block: 123, thin: 116 } }, double: { gap: 283, climb: { block: 211, thin: 205 } } });
  assert.deepEqual(lesserArcs('normal', '1-2'), { single: { gap: 246, climb: { block: 123, thin: 117 } }, double: { gap: 409, climb: { block: 213, thin: 207 } } });
});

test("1-2's builder envelope is the bands, not the closed form's unflown 230 px double (EN-W: what threw 49% of 1-2's rolls)", () => {
  const b = (difficulty: 'normal' | 'easy') => ({ id: '1-2', margin: difficulty === 'easy' ? 0.65 : 0.82, riseShare: difficulty === 'easy' ? 0.84 : 1, difficulty });
  assert.equal(gapEnvelope(true, 'normal', '1-2'), 262);
  assert.equal(gapFor(0, true, b('normal')), 262);
  assert.equal(gapFor(0, false, b('normal')), 143);
  assert.equal(gapFor(0, false, b('easy')), 114);
});

test('1-2 is judged by the verdicts now (planted): a 300 px single gap is refused band.out on both settings; 120 px passes', () => {
  for (const s of ['normal', 'easy'] as const) {
    const v = judgeRoll(planted(s, 300));
    assert.equal(v.accepted, false, s);
    assert.ok(!v.accepted && v.failed.some((f) => f.name === 'band.out'), `${s}: ${JSON.stringify(v)}`);
    assert.ok(!v.notJudged.includes('reach.unflown'), s);
    assert.equal(judgeRoll(planted(s, 100)).accepted, true, `${s}: a gap inside the band passes`);
  }
});
