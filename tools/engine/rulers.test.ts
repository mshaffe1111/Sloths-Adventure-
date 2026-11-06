/**
 * The replacement rulers' planted failures (the lead 12:15 and 12:49 PM, 11-06): each ruler must FAIL the case it was made to catch,
 * before stage.ts judges anything with it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Platform } from '../../src/game/types.ts';
import { distinctness } from '../../src/game/stageVariety.ts';
import { requiredMoveBreaches, reachableSplits, againstOldBreaches, lengthBreaches, type BotSays } from './rulers.ts';

const teach = { job: 'teach' as const, move: 'double', x0: 2000, x1: 3000 };
const clean = (reachX: number): BotSays => ({ end: 'shrine', reachX, rescueXs: [], softFallXs: [] });

test('required move: a limited run that got past the node only by rescues fails the gate (planted: Roll A, 4 rescues)', () => {
  const lim: BotSays = { end: 'shrine', reachX: 9000, rescueXs: [2310, 2330, 2600, 2720], softFallXs: [] };
  assert.deepEqual(requiredMoveBreaches(teach, clean(9000), lim), [], 'carried through: the move is still required, no breach');
  const free = { ...lim, rescueXs: [] };
  assert.match(requiredMoveBreaches(teach, clean(9000), free).join(';'), /not required/, 'a clean limited pass is the breach');
});
test('required move: a soft fall inside the node counts as carried; one outside it does not', () => {
  const inNode: BotSays = { end: 'shrine', reachX: 9000, rescueXs: [], softFallXs: [2500] };
  assert.deepEqual(requiredMoveBreaches(teach, clean(9000), inNode), []);
  const outside: BotSays = { end: 'shrine', reachX: 9000, rescueXs: [400], softFallXs: [5000] };
  assert.match(requiredMoveBreaches(teach, clean(9000), outside).join(';'), /not required/);
});
test('required move: the full bot rescued in a TEACH is its own breach; in a TEST it is not', () => {
  const lim: BotSays = { end: 'stuck', reachX: 2100, rescueXs: [], softFallXs: [] };
  const full: BotSays = { end: 'shrine', reachX: 9000, rescueXs: [2400], softFallXs: [] };
  assert.match(requiredMoveBreaches(teach, full, lim).join(';'), /rescued in the teach/);
  assert.deepEqual(requiredMoveBreaches({ ...teach, job: 'test' }, full, lim), []);
});
test('required move: the full bot stopping inside the node fails', () => {
  const lim: BotSays = { end: 'stuck', reachX: 2100, rescueXs: [], softFallXs: [] };
  assert.match(requiredMoveBreaches(teach, { end: 'stuck', reachX: 2500, rescueXs: [], softFallXs: [] }, lim).join(';'), /full bot stopped/);
});

const plat = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 20, type: 'solid' });
test('reachable splits: a deck he cannot reach is not a split (planted: a high deck over the floor)', () => {
  const floor = plat(1, 0, 600, 3000), deck = plat(2, 500, 300, 1200);
  assert.equal(reachableSplits({ platforms: [floor, deck] }, new Set([1, 2])).splits, 1, 'both reachable: one split');
  assert.equal(reachableSplits({ platforms: [floor, deck] }, new Set([1])).splits, 0, 'the deck unreachable: no split');
});

// three made-up "stages" of piece tokens: old's rolls share a vocabulary but each orders it its own way
const old = [
  ['a', 'b', 'c', 'd', 'e', 'f', 'a', 'c', 'e', 'b', 'd', 'f'],
  ['b', 'a', 'd', 'c', 'f', 'e', 'b', 'd', 'f', 'a', 'c', 'e'],
  ['c', 'd', 'a', 'b', 'e', 'f', 'c', 'a', 'e', 'd', 'b', 'f'],
  ['a', 'c', 'b', 'e', 'd', 'f', 'a', 'e', 'c', 'f', 'b', 'd'],
];
test("against old: old's own rolls judged as new fail (planted: old against itself)", () => {
  const spread = distinctness(old).mean; // old's own spread, as 0.237 is real old 1-1's
  const asNew = old.map((tokens, i) => ({ id: `old${i}`, tokens }));
  assert.ok(againstOldBreaches(asNew, old, spread).length > 0, 'old against itself must breach');
  assert.equal(againstOldBreaches([{ id: 'copy', tokens: old[0] }], old, spread).length, 1, 'a copy of an old roll breaches');
});
test('against old: a roll built of other pieces passes', () => {
  const fresh = ['x', 'y', 'z', 'w', 'v', 'u', 'x', 'z', 'v', 'y', 'w', 'u'];
  assert.deepEqual(againstOldBreaches([{ id: 'new', tokens: fresh }], old, 0.237), []);
});

test('length: a short roll fails the floors (planted: 100 s typical against a 120 s floor); a long one has no cap', () => {
  const floors = { target: 120, fastFloor: 75 };
  assert.match(lengthBreaches({ typical: 100, fast: 80 }, floors, 'roll 3').join(';'), /typical 100 s under the floor 120 s/);
  assert.match(lengthBreaches({ typical: 130, fast: 60 }, floors, 'roll 4').join(';'), /fast 60 s/);
  assert.deepEqual(lengthBreaches({ typical: 400, fast: 300 }, floors, 'roll 5'), []);
});
