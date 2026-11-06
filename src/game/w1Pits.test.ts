/**
 * World 1's painted pits (R-6.38, w1Pits.ts): which gaps are pits, and of what kind, from the platforms alone.
 *   npx tsx --test src/game/w1Pits.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { dropOutline, findW1Pits, paintedBank, SUNK_STEP } from './w1Pits.ts';
import { endFace } from './groundPaint.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

const G = 580;
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

test("a marked drop is painted only between two banks of earth with nothing standing in it; beside a slab, a branch or with ground in it, it is open air (R-164.6, R-164.8, Matt's stills 03-08)", () => {
  const D = { pit: 'drop' } as Partial<Platform>;
  // (two banks of earth, a slit between them: a real pit, painted)
  const pit = findW1Pits([P(1, 0, G, 600, 120, D), P(2, 648, G, 600, 120, D)]);
  assert.deepEqual([pit[0].drop, pit[0].walls], [true, [G, G]]);
  // (a bank, then a 50 px stone slab: still 04's black column hung under the slab, through the air)
  const slab = findW1Pits([P(1, 0, G, 600, 120, D), P(2, 700, G, 200, 50, D), P(3, 1000, G, 600, 120, D)]);
  assert.ok(slab.length >= 1 && slab.every((g) => g.drop && !g.walls), JSON.stringify(slab));
  // (a bank, then a branch: 1-3's and 1-2's dark box, its straight side standing in the air under the branch's end)
  const branch = findW1Pits([P(1, 0, G, 600, 120, D), P(2, 900, G, 300, 24, { ...D, style: 'branch' }), P(3, 1200, G, 600, 120, D)]);
  assert.ok(branch.some((g) => g.x0 === 600 && g.drop && !g.walls), JSON.stringify(branch));
  // (ground standing in the gap: still 03's darkness box stood behind the stones he stood on)
  const inGap = findW1Pits([P(1, 0, G, 600, 120, D), P(2, 660, G - 30, 190, 50, D), P(3, 1075, G, 600, 120, D)]);
  assert.ok(inGap.every((g) => !g.walls), JSON.stringify(inGap));
});

test("a drop's dark follows its banks' own painted faces all the way down, and is closed where they meet (R-164.8)", () => {
  const [g] = findW1Pits([P(1, 0, G, 600, 400, { pit: 'drop' }), P(2, 700, G, 600, 400)]);
  const fl = endFace(1, g.x0, G, G + 1200, true), fr = endFace(1, g.x1, G, G + 1200, false);
  const at = (f: Array<[number, number]>, y: number) => {
    if (y <= f[0][1]) return f[0][0];
    for (let i = 1; i < f.length; i++) if (f[i][1] >= y) return f[i - 1][0] + ((f[i][0] - f[i - 1][0]) * (y - f[i - 1][1])) / (f[i][1] - f[i - 1][1] || 1);
    return f[f.length - 1][0];
  };
  const rows = dropOutline(g, G, G, G + 1200);
  assert.ok(rows.length > 100 && rows[0][0] === G && rows[rows.length - 1][0] === G + 1200);
  let leans = 0;
  for (const [y, a, b] of rows) {
    const l = at(fl, y), r = at(fr, y);
    if (l < r) assert.deepEqual([a, b], [l, r], `at ${y}`);
    else assert.equal(a, b, `closed at ${y}`);
    // (the faces wobble and lean: a straight column from x0 to x1 left open air beside it here)
    if (Math.abs(a - g.x0) > 4 || Math.abs(b - g.x1) > 4) leans++;
  }
  assert.ok(leans > 20, `the faces lean in ${leans} rows`);
});

test("World 1, 16 layouts: every painted drop has a bank of earth at both sides and nothing standing in it; only the mixer's stages mark drops (engine-core)", () => {
  for (const id of ['1-2', '1-3', '1-5', '1-9']) {
    for (let s = 1; s <= 16; s++) {
      const ps = new RealPlay(id, s).platforms;
      for (const g of findW1Pits(ps)) {
        if (!g.walls) continue;
        for (const x of [g.x0, g.x1]) assert.ok(ps.some((q) => paintedBank(q) && (Math.abs(q.x + q.width - x) < 3 || Math.abs(q.x - x) < 3)), `${id} layout ${s}: the drop at ${Math.round(g.x0)} has no bank at ${Math.round(x)}`);
        assert.ok(!ps.some((q) => !q.broken && q.type !== 'fragile' && q.type !== 'bouncy' && q.type !== 'drift' && q.type !== 'moving' && q.x < g.x1 - 4 && q.x + q.width > g.x0 + 4 && q.y + q.height > g.top + 4), `${id} layout ${s}: ground stands in the drop at ${Math.round(g.x0)}`);
      }
    }
  }
  // (engine-core: only the mixer's stages mark drops, so drawW1Pits, which paints marked drops only, leaves every other World 1 stage
  // to main's painting; the rebuild's 1-3 box, R-164.6, is not on main)
  for (const id of ['1-2', '1-3', '1-4', '1-6', '1-7', '1-8', '1-9']) for (const s of [1, 2]) assert.ok(!new RealPlay(id, s).platforms.some((q) => q.pit === 'drop'), `${id} layout ${s} marks a drop`);
  // (1-1's Play is gen2 since 11-06, its drops painted by its own look: only the mixer's 1-5 marks drops now)
  for (const id of ['1-5']) assert.ok(new RealPlay(id, 1).platforms.some((q) => q.pit === 'drop'), `${id} marks its drops`);
});

test("a marked drop between two banks at any height is judged against its own two banks, not the stage's one ground line (the mixer's 1-5)", () => {
  const D = { pit: 'drop' } as Partial<Platform>;
  // (the commonest top is G; a pair of banks 300 higher, a 60 px slit between them, as the mixer's 1-5 climbs)
  const ps = [P(1, 0, G, 2000, 120, D), P(2, 2100, G - 300, 500, 120, D), P(3, 2660, G - 320, 500, 120, D), P(4, 3300, G, 2000, 120, D)];
  const g = findW1Pits(ps).find((q) => q.x0 === 2600);
  assert.ok(g && g.drop && g.walls && g.top === G - 300, JSON.stringify(findW1Pits(ps)));
  // (with a stone standing in it, it is open air)
  assert.ok(!findW1Pits([...ps, P(5, 2610, G - 290, 40, 50, D)]).some((q) => q.x0 === 2600 && q.walls));
});
