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
    assert.equal(swings.length, reached + linked, `${id}: ${swings.length} swings for ${reached} lianas reached and ${linked} linked`);
    if (r.soft) assert.deepEqual(swings.filter((c) => c.cost === 'life').map((c) => Math.round(c.x)), [], `${id}: its pits are soft, so no swing costs a life`);
  }
});
