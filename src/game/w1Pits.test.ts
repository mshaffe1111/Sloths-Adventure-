/**
 * World 1's painted pits (R-6.38, w1Pits.ts): which gaps are pits, and of what kind, from the platforms alone.
 *   npx tsx --test src/game/w1Pits.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { findW1Pits } from './w1Pits.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

const G = 580;
/** a floor this close under the lower lip is its own way out (findW1Pits: 'A sunk step (75 px) is not a pit') */
const SUNK_STEP = 75;
const P = (id: number, x: number, y: number, width: number, height: number, more: Partial<Platform> = {}): Platform => ({ id, x, y, width, height, type: 'solid', style: 'moss_stone', ...more }) as Platform;

test('a soft pit (a floor 130 down) is found with its steps; a 75 px sunk step is not a pit; a floorless gap is a fall', () => {
  const ps = [
    P(1, 0, G, 1000, 90, { style: 'log' }),
    // (a soft pit 1000-1600: its floor 130 down, a soil step at its far wall)
    P(2, 1000, G + 130, 600, 90), P(3, 1530, G + 75, 70, 55, { soil: true }),
    P(4, 1600, G, 800, 90),
    // (a sunk step 2400-2480: 75 down, a step and not a pit)
    P(5, 2400, G + 75, 80, 90),
    P(6, 2480, G, 600, 90),
    // (a floorless gap 3080-3300)
    P(7, 3300, G, 600, 90),
  ];
  const g = findW1Pits(ps);
  assert.equal(g.length, 2, JSON.stringify(g));
  assert.deepEqual([g[0].x0, g[0].x1, g[0].kind, g[0].floor], [1000, 1600, 'soft', G + 130]);
  assert.deepEqual(g[0].steps, [[1530, G + 75, 70, 55, true]]);
  assert.equal(g[0].lipL && g[0].lipR, true);
  assert.deepEqual([g[1].x0, g[1].x1, g[1].kind], [3080, 3300, 'fall']);
});

test('a tall stump standing on the ground is ground, not a gap; a breaking branch over a gap is not a floor', () => {
  const ps = [P(1, 0, G, 700, 90), P(2, 700, G - 80, 160, 170), P(3, 860, G, 400, 90), P(4, 1260, G - 5, 200, 24, { type: 'fragile', style: 'branch' }), P(5, 1460, G, 400, 90)];
  const g = findW1Pits(ps);
  assert.deepEqual(g.map((q) => [q.x0, q.x1, q.kind]), [[1260, 1460, 'fall']]);
});

test('the way out of a soft pit: a step in it, or a floor within a sunk step of its lower lip; deeper with no step is a trap', () => {
  const lowLip = [P(1, 0, G, 700, 300), P(2, 700, G + 100, 400, 90), P(3, 1100, G + 50, 400, 300)];
  const q1 = findW1Pits(lowLip).find((q) => q.kind === 'soft')!;
  assert.ok(q1 && !(q1.steps ?? []).length && q1.floor! - q1.top <= SUNK_STEP, JSON.stringify(q1));
  const trap = [P(1, 0, G, 700, 300), P(2, 700, G + 160, 400, 90), P(3, 1100, G, 400, 300)];
  const q2 = findW1Pits(trap).find((q) => q.kind === 'soft')!;
  assert.ok(q2 && !(q2.steps ?? []).length && q2.floor! - q2.top > SUNK_STEP, JSON.stringify(q2));
});

test("1-8's long branch: the holes between the chase's sections are falls", () => {
  const ps = [P(1, 0, 455, 500, 24, { chase: true } as Partial<Platform>), P(2, 600, 455, 500, 24, { chase: true } as Partial<Platform>), P(3, 1300, 470, 300, 24, { chase: true } as Partial<Platform>)];
  const g = findW1Pits(ps);
  assert.deepEqual(g.map((q) => [q.x0, q.x1, q.kind]), [[500, 600, 'fall'], [1100, 1300, 'fall']]);
});

test('World 1, layout 1: the vault pits are soft pits with steps; the only unmarked floorless gaps outside 1-8 are 1-6\'s water', () => {
  const soft: Record<string, number> = {}, falls: Record<string, number> = {};
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9']) {
    const g = findW1Pits(new RealPlay(id, 1).platforms);
    soft[id] = g.filter((q) => q.kind === 'soft').length;
    // (unmarked floorless gaps, read as water: a builder's marked drop, `pit: 'drop'`, is a pit and is not counted here)
    falls[id] = g.filter((q) => q.kind === 'fall' && !q.drop).length;
    // (a way out: a step standing in the pit, or the floor itself within a sunk step (75 px, findW1Pits' own rule) of the lower lip,
    // so he walks or hops straight out: 1-2's rebuilt root tier, layout 1, floor 930 against the bank at 880; the lead, 2026-11-04)
    for (const q of g.filter((q) => q.kind === 'soft')) assert.ok((q.steps ?? []).length >= 1 || q.floor! - q.top <= SUNK_STEP, `${id} ${q.x0}: a soft pit with no step out`);
  }
  // (1-5 rebuilt on the beat, w1Rhythm.ts: its pits are real drops under the snap twigs, painted as drops, never soft or water:
  // stage15.test.ts "every floor gap paints as a drop")
  assert.ok(soft['1-3'] >= 3 && soft['1-9'] >= 3, JSON.stringify(soft));
  assert.ok(falls['1-8'] >= 10, JSON.stringify(falls));
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-7', '1-9']) assert.equal(falls[id], 0, `${id}: ${falls[id]} floorless gaps`);
});

test("a floorless gap is water unless a builder marks a bank `pit: 'drop'`: then it is a painted drop", () => {
  const water = findW1Pits([P(1, 0, G, 600, 90), P(2, 800, G, 600, 90)]);
  assert.equal(water[0].drop, undefined);
  const drop = findW1Pits([P(1, 0, G, 600, 90, { pit: 'drop' }), P(2, 800, G, 600, 90)]);
  assert.equal(drop[0].drop, true);
});
