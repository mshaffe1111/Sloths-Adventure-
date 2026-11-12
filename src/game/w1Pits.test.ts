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
import { floorlessGaps } from './gen2/promises11.ts';
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

test('World 1, layout 1: the vault pits are soft pits with steps, 1-3 has none; the only unmarked floorless gaps outside 1-8 are 1-6\'s water', () => {
  const soft: Record<string, number> = {}, falls: Record<string, number> = {};
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9']) {
    const sim = new RealPlay(id, 1);
    const g = findW1Pits(sim.platforms);
    // (gen2's soft level gaps, heartFalls `soft`: a fall there puts him back on the take-off and draws a painted pit floor (stills,
    // reference/qa-reports/engine-core/soft-gap): a soft pit, not water)
    const softZones = (sim.stage.heartFalls ?? []).filter((z) => z.soft);
    soft[id] = g.filter((q) => q.kind === 'soft').length;
    // (unmarked floorless gaps, read as water: a builder's marked drop, `pit: 'drop'`, is a pit and is not counted here)
    // (1-1 since E0a (R-165.61): a slot is a fall only when he can fall into it, promises11.ts realFalls, the verdict's own reading; changed,
    // INT-1-1: the re-laid 1-1's dip at x22604 on layout 1 is a slot a block fills, which findW1Pits alone reads as a fall: planted below)
    falls[id] = id === '1-1' ? floorlessGaps(sim.stage).length : g.filter((q) => q.kind === 'fall' && !q.drop && !softZones.some((z) => q.x0 >= z.x0 - 4 && q.x1 <= z.x1 + 4)).length;
    // (a way out: a step standing in the pit, or the floor itself within a sunk step (75 px, findW1Pits' own rule) of the lower lip,
    // so he walks or hops straight out: 1-2's rebuilt root tier, layout 1, floor 930 against the bank at 880; the lead, 2026-11-04)
    for (const q of g.filter((q) => q.kind === 'soft')) assert.ok((q.steps ?? []).length >= 1 || q.floor! - q.top <= SUNK_STEP, `${id} ${q.x0}: a soft pit with no step out`);
  }
  // (1-5 rebuilt on the beat, w1Rhythm.ts: its pits are real drops under the snap twigs, painted as drops, never soft or water:
  // stage15.test.ts "every floor gap paints as a drop")
  // (1-9's vault pits; 1-3's were the hand-built stage's, deleted 11-12 (new replaces old): the designed 1-3 keeps its route LEVEL, no
  // pit and no fall anywhere (reference/design/1-3.md "the route stays LEVEL"), so it is held to none at all)
  assert.ok(soft['1-9'] >= 3, JSON.stringify(soft));
  assert.equal(soft['1-3'], 0, `1-3 is level by design: ${JSON.stringify(soft)}`);
  assert.ok(falls['1-8'] >= 10, JSON.stringify(falls));
  for (const id of ['1-1', '1-2', '1-3', '1-4', '1-5', '1-7', '1-9']) assert.equal(falls[id], 0, `${id}: ${falls[id]} floorless gaps`);
});

test('1-1 (layout 1, seed 769, x22604): a 119 px slot between two banks with a block in it is no fall by realFalls, though findW1Pits alone reads one', () => {
  // (the pieces as laid, and a wide bank on the stage's ground line (its banks' commonest top, 1112), which findW1Pits reads as the band)
  const slot = [P(1, 10000, 1112, 6000, 500), P(99, 22357, 708, 247, 979), P(100, 22604, 776, 119, 120), P(101, 22723, 708, 217, 979)];
  assert.deepEqual(findW1Pits(slot).filter((q) => q.kind === 'fall').map((q) => [q.x0, q.x1]), [[22604, 22723]], 'findW1Pits alone: a fall');
  assert.deepEqual(floorlessGaps({ platforms: slot }), [], 'realFalls: the block fills it');
  assert.deepEqual(floorlessGaps({ platforms: slot.filter((q) => q.id !== 100) }), [[22604, 22723]], 'planted: without the block it is a fall');
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

/** ground standing in a painted drop: any footing inside its walls that rises over its lower lip, but a hollow's own hurt floor */
const standsIn = (ps: readonly Platform[], g: { x0: number; x1: number; top: number; kind: string }) =>
  ps.some((q) => !q.broken && q.type !== 'fragile' && q.type !== 'bouncy' && q.type !== 'drift' && q.type !== 'moving' && !(g.kind === 'hurt' && q.pit === 'hurt') && q.x < g.x1 - 4 && q.x + q.width > g.x0 + 4 && q.y + q.height > g.top + 4);

test('PLANTED: a hollow\'s own hurt floor is its bottom, not ground in it; a block standing in that hollow is still caught', () => {
  const ps = new RealPlay('1-2', 1).platforms;
  const hs = findW1Pits(ps).filter((q) => q.kind === 'hurt');
  assert.ok(hs.length >= 10, `${hs.length} hollows`);
  for (const g of hs) assert.equal(standsIn(ps, g), false, `x ${Math.round(g.x0)}`);
  const g = hs[0];
  const block = { id: 990001, x: g.x0 + 10, y: g.floor! - 60, width: 30, height: 60, type: 'solid', style: 'moss_stone' } as Platform;
  assert.equal(standsIn([...ps, block], g), true, 'a block standing in the hollow');
});

test("World 1, 16 layouts: every painted drop has a bank of earth at both sides and nothing standing in it; only the mixer's stages mark drops (engine-core)", () => {
  for (const id of ['1-2', '1-3', '1-5', '1-9']) {
    for (let s = 1; s <= 16; s++) {
      const ps = new RealPlay(id, s).platforms;
      for (const g of findW1Pits(ps)) {
        if (!g.walls) continue;
        for (const x of [g.x0, g.x1]) assert.ok(ps.some((q) => paintedBank(q) && (Math.abs(q.x + q.width - x) < 3 || Math.abs(q.x - x) < 3)), `${id} layout ${s}: the drop at ${Math.round(g.x0)} has no bank at ${Math.round(x)}`);
        // (a hollow's own hurt floor is its bottom, not ground standing in it: a set-back floor, the lead's ruling 11-12; anything else is)
        assert.ok(!standsIn(ps, g), `${id} layout ${s}: ground stands in the drop at ${Math.round(g.x0)}`);
      }
    }
  }
  // (engine-core: only the mixer's stages mark drops, so drawW1Pits, which paints marked drops only, leaves every other World 1 stage
  // to main's painting; the rebuild's 1-3 box, R-164.6, is not on main)
  // (0.9.5: 1-5 is main's again, so no shipped World 1 stage lays the mixer's marked drops)
  for (const id of ['1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9']) for (const s of [1, 2]) assert.ok(!new RealPlay(id, s).platforms.some((q) => q.pit === 'drop'), `${id} layout ${s} marks a drop`);
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

test('a floorless gap inside a soft heartFalls zone is a soft pit, not water; one outside it still counts (planted)', () => {
  const ps = [P(1, 0, G, 600, 90), P(2, 800, G, 600, 90), P(3, 1600, G, 600, 90)];
  const zones = [{ x0: 600, x1: 800, soft: true }];
  const falls = findW1Pits(ps).filter((q) => q.kind === 'fall' && !q.drop && !zones.some((z) => q.x0 >= z.x0 - 4 && q.x1 <= z.x1 + 4));
  assert.deepEqual(falls.map((q) => Math.round(q.x0)), [1400], 'the gap at 1400 has no soft zone over it');
});

// ── the thorn hollow's look (EN-W's Roughs 1-4, Matt 11-11): the library's 1-2 kit lays the only hollows, on these rolls ──
const hollowRolls = async () => {
  const { buildGen2Stage } = await import('./gen2/pipeline.ts');
  const { config12, kitLib12 } = await import('../../tools/engine/library.ts');
  const out: Array<{ seed: number; platforms: Platform[] }> = [];
  for (const seed of [1, 2, 3, 4]) out.push({ seed, platforms: buildGen2Stage({ config: config12({ flown: true }) as never, kit: kitLib12({ flown: true }), seed, difficulty: 'normal' }).platforms });
  return out;
};

test("a hollow's torn lips each hang into at most a quarter of it, so over a narrow hollow they never meet as a column of roots (EN-W Rough 1)", async () => {
  const W = await import('./w1Pits.ts');
  let n = 0;
  for (const { seed, platforms } of await hollowRolls()) {
    for (const g of findW1Pits(platforms).filter((q) => q.kind === 'hurt')) {
      const w = g.x1 - g.x0, reach = W.LIP_IN * W.hollowLipWidth(g);
      assert.ok(reach <= w * 0.26, `seed ${seed}: the hollow at ${Math.round(g.x0)} (${Math.round(w)} wide): each lip hangs ${reach.toFixed(1)} px into it`);
      assert.ok(w - 2 * reach >= w * 0.48, `seed ${seed}: the hollow at ${Math.round(g.x0)} shows ${Math.round(w - 2 * reach)} px of hole between its lips`);
      n++;
    }
  }
  assert.ok(n >= 20, `${n} hollows checked`);
});

test("a hollow has two painted walls, World 1's own bank end face (not one mirrored picture), standing at most HOLLOW_JUT into it and rounded into its floor, never a box; its dark and its thorns stay between its walls, so close hollows share a clean bank (the lead 11-12)", async () => {
  const W = await import('./w1Pits.ts');
  const { endFace } = await import('./groundPaint.ts');
  const at = (pts: Array<[number, number]>, y: number) => {
    for (let i = 1; i < pts.length; i++) if (pts[i][1] >= y) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y1 === y0 ? x1 : x0 + ((x1 - x0) * (y - y0)) / (y1 - y0); }
    return pts[pts.length - 1][0];
  };
  let n = 0;
  for (const { seed, platforms } of await hollowRolls()) {
    const hs = findW1Pits(platforms).filter((q) => q.kind === 'hurt');
    for (const g of hs) {
      const [yl, yr] = g.walls!, w = g.x1 - g.x0, floor = g.floor!, foot = floor + W.HOLLOW_FOOT;
      const S = W.HOLLOW_FACE_SCALE, sc = (x: number, pts: Array<[number, number]>) => pts.map(([px, py]): [number, number] => [x + (px - x) * S, py]);
      const fl = sc(g.x0, endFace(1, g.x0, yl, foot + 40, true)), fr = sc(g.x1, endFace(1, g.x1, yr - W.hollowFaceLift(g), foot + 40, false));
      // (a face that fits between the bounds all the way down is the wall as it is; one that does not is fitted, and the bake moves its
      // picture onto the fitted line, hollowWallShift: RF3, hollowWalls.test.ts)
      const fits = (pts: Array<[number, number]>, edge: number, d: number) => { for (let y = g.top; y <= floor; y++) { const u = d * (at(pts, y) - edge); if (u <= -W.HOLLOW_JUT + 0.5 || u >= W.HOLLOW_BACK - 0.5) return false; } return true; };
      // (a taller bank's wall is fitted to stand out past its cut above the hollow's top, and blends to its face under it)
      const fitsL = yl >= g.top && fits(fl, g.x0, -1), fitsR = yr >= g.top && fits(fr, g.x1, 1);
      let differ = 0, widest = 0;
      for (let y = g.top; y <= floor - 24; y += 4) {
        const [a, b] = W.hollowWalls(g, y);
        widest = Math.max(widest, b - a);
        const where = `seed ${seed} x ${Math.round(g.x0)} y ${y}: walls ${a.toFixed(1)}..${b.toFixed(1)}`;
        assert.ok(a <= g.x0 + W.HOLLOW_JUT + 0.01 && a >= g.x0 - W.HOLLOW_BACK - 0.01 && b >= g.x1 - W.HOLLOW_JUT - 0.01 && b <= g.x1 + W.HOLLOW_BACK + 0.01, where);
        // (each wall is its bank's own painted end face, where that face lies inside the bounds)
        if (g.lipL && fitsL && y < foot - 44) assert.ok(Math.abs(a - at(fl, y)) < 0.6, `${where}: the left wall is not its bank's end face`);
        if (g.lipR && fitsR && y < foot - 44) assert.ok(Math.abs(b - at(fr, y)) < 0.6, `${where}: the right wall is not its bank's end face`);
        assert.ok(b - a >= w * 0.6, `${where}: the hole narrows to ${Math.round(b - a)} of ${Math.round(w)} px`);
        // (a wall held on a bound runs as a straight cut line: the face must fit, never be clamped)
        if (g.lipL) assert.ok(a < g.x0 + W.HOLLOW_JUT - 0.01 && a > g.x0 - W.HOLLOW_BACK + 0.01, `${where}: the left wall is held on a bound (a straight cut)`);
        if (g.lipR) assert.ok(b > g.x1 - W.HOLLOW_JUT + 0.01 && b < g.x1 + W.HOLLOW_BACK - 0.01, `${where}: the right wall is held on a bound (a straight cut)`);
        if (Math.abs((a - g.x0) + (b - g.x1)) > 6) differ++;
      }
      assert.ok(differ >= 4, `seed ${seed} x ${Math.round(g.x0)}: the two walls are one mirrored picture`);
      // (rounded into its floor: a box keeps its width to the bottom)
      const low = W.hollowWalls(g, foot - 2);
      assert.ok(low[1] - low[0] <= 0.75 * widest, `seed ${seed} x ${Math.round(g.x0)}: ${Math.round(low[1] - low[0])} px wide at its foot, ${Math.round(widest)} above: a box`);
      // (its thorns stand between its walls: no backing past them)
      const [t0, t1] = W.thornBedSpan(g), [s0, s1] = W.hollowSpan(g);
      assert.ok(t0 >= s0 - 0.01 && t1 <= s1 + 0.01, `seed ${seed} x ${Math.round(g.x0)}: thorns ${t0.toFixed(0)}..${t1.toFixed(0)} past the walls ${s0.toFixed(0)}..${s1.toFixed(0)}`);
      n++;
    }
    // (close hollows: the bank between keeps most of its width as plain soil, no dark block)
    for (let i = 1; i < hs.length; i++) {
      const bank = hs[i].x0 - hs[i - 1].x1;
      if (bank > 400) continue;
      const clear = W.hollowSpan(hs[i])[0] - W.hollowSpan(hs[i - 1])[1];
      assert.ok(clear >= bank * 0.5, `seed ${seed}: the ${Math.round(bank)} px bank at ${Math.round(hs[i - 1].x1)} keeps ${Math.round(clear)} px clear of both hollows`);
    }
  }
  assert.ok(n >= 20, `${n} hollows checked`);
});

test("a hollow's banks' sides over it are closed (EN-W Roughs 2, 3)", async () => {
  for (const { seed, platforms } of await hollowRolls()) {
    for (const g of findW1Pits(platforms).filter((q) => q.kind === 'hurt')) {
      const W = await import('./w1Pits.ts');
      const banks = platforms.filter(paintedBank);
      const L = banks.find((q) => Math.abs(q.x + q.width - g.x0) < 3 && q.y < g.floor!), R = banks.find((q) => Math.abs(q.x - g.x1) < 3 && q.y < g.floor!);
      if (L) assert.ok(W.sideOverHollow(L, banks, 'r'), `seed ${seed}: the bank left of ${Math.round(g.x0)} keeps an open face over the hollow`);
      if (R) assert.ok(W.sideOverHollow(R, banks, 'l'), `seed ${seed}: the bank right of ${Math.round(g.x0)} keeps an open face over the hollow`);
    }
  }
});
