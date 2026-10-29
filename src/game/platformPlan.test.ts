import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planStage, baseLook, findStairs, groundRegions, lookShares, longestRun, h01, VARIANTS, PILLAR_VARIANTS, SIGNATURE, type ThinLook } from './platformPlan.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import type { Platform } from './types.ts';

let nextId = 1;
const plat = (x: number, y: number, width: number, height: number, extra: Partial<Platform> = {}): Platform => ({
  id: nextId++, x, y, width, height, type: 'solid', ...extra,
});

/**
 * The variety rules are for the mixed looks: a world's own material (SIGNATURE) is the place itself, so it may take more than 40% and
 * stand in a row (as bridges always could). These measure the rest: the largest share any other look takes, and the longest run of any other look.
 */
function mixedShares(order: ThinLook[], world: number) {
  const sig = SIGNATURE[world]?.look;
  const counts = new Map<ThinLook, number>();
  for (const l of order) if (l !== sig && l !== 'bridge') counts.set(l, (counts.get(l) ?? 0) + 1);
  let maxLook: ThinLook | null = null;
  let max = 0;
  for (const [l, c] of counts) if (c > max) { max = c; maxLook = l; }
  const distinct = new Set(order).size;
  let run = 0;
  let best = 0;
  for (let i = 0; i < order.length; i++) {
    const free = order[i] === sig || order[i] === 'bridge'; // a span and the world's own material may stand in a row
    run = free ? 0 : i > 0 && order[i] === order[i - 1] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  return { maxShare: order.length ? max / order.length : 0, maxLook, distinct, run: best, sigShare: sig ? order.filter((l) => l === sig).length / order.length : 0 };
}

/** a row of thin platforms with the generator's tags, the way a stage lays them out */
function thinRow(n: number, style: Platform['style'] | undefined, type: Platform['type'] = 'solid'): Platform[] {
  const out: Platform[] = [];
  for (let i = 0; i < n; i++) out.push(plat(400 + i * 260, 500 - (i % 3) * 40, 150, 18, { style, type }));
  return out;
}

test('a plan is deterministic: the same stage and seed always give the same looks and variants', () => {
  const ps = [plat(0, 700, 3000, 90, { style: 'log' }), ...thinRow(12, 'branch'), ...thinRow(4, 'moss_stone')];
  const a = planStage(ps, 3, 99);
  const b = planStage(ps, 3, 99);
  assert.deepEqual(a.order, b.order);
  for (const p of ps) {
    assert.deepEqual(a.thin.get(p), b.thin.get(p));
    assert.deepEqual(a.ground.get(p), b.ground.get(p));
  }
});

test('hashing is stable, in range and spreads', () => {
  assert.equal(h01(5, 6, 7, 8), h01(5, 6, 7, 8));
  const seen = new Set<number>();
  for (let i = 0; i < 500; i++) {
    const v = h01(i, 3);
    assert.ok(v >= 0 && v < 1);
    seen.add(Math.floor(v * 10));
  }
  assert.equal(seen.size, 10, 'every tenth of the range is reached');
});

test('the generator tags decide the base look: crumbling ruin tiles are ruins, other fragile platforms are timber', () => {
  assert.equal(baseLook(plat(0, 0, 100, 18, { type: 'fragile', crumbleAfter: 1.4 })), 'ruin');
  assert.equal(baseLook(plat(0, 0, 100, 18, { type: 'fragile' })), 'plank');
  assert.equal(baseLook(plat(0, 0, 100, 18, { type: 'bouncy' })), 'toadstool');
  assert.equal(baseLook(plat(0, 0, 100, 18, { type: 'moving' })), 'raft');
  assert.equal(baseLook(plat(0, 0, 100, 18, { type: 'drift' })), 'drift');
  assert.equal(baseLook(plat(0, 0, 100, 18, { style: 'canopy_bridge' })), 'bridge');
  assert.equal(baseLook(plat(0, 0, 100, 18)), 'island', 'no style keeps the island');
});

test('every plan names a look and a variant that exist', () => {
  const ps = [...thinRow(10, 'branch'), ...thinRow(6, 'log'), ...thinRow(5, 'ruin'), ...thinRow(4, undefined), ...thinRow(3, 'moss_stone'), ...thinRow(3, undefined, 'bouncy'), ...thinRow(3, undefined, 'moving'), ...thinRow(3, undefined, 'fragile')];
  for (const world of [1, 2, 5, 7, 10]) {
    const plan = planStage(ps, world, 4);
    for (const p of ps) {
      const t = plan.thin.get(p);
      assert.ok(t, `platform ${p.id} has a plan`);
      assert.ok(t!.variant >= 0 && t!.variant < VARIANTS[t!.look], `${t!.look} variant ${t!.variant}`);
    }
  }
});

test('a stage of one generator style is still drawn with several looks, never above 40% and never three in a row', () => {
  for (const style of ['branch', 'log', 'moss_stone', 'ruin'] as const) {
    const ps = thinRow(14, style);
    for (const world of [1, 4, 7, 9]) {
      const plan = planStage(ps, world, 11);
      const s = mixedShares(plan.order, world);
      assert.ok(s.maxShare <= 0.4 + 1e-9, `${style} in world ${world}: ${s.maxLook} is ${Math.round(s.maxShare * 100)}%`);
      assert.ok(s.distinct >= (SIGNATURE[world] ? 3 : 4), `${style} in world ${world}: only ${s.distinct} looks`);
      assert.ok(s.run <= 2, `${style} in world ${world}: three identical looks in a row`);
    }
  }
});

test('a world with a material of its own shows it on a good share of its platforms', () => {
  const ps = thinRow(20, 'branch');
  for (const w of Object.keys(SIGNATURE).map(Number)) {
    const s = mixedShares(planStage(ps, w, 11).order, w);
    assert.ok(s.sigShare >= 0.3, `world ${w}: its own material is only ${Math.round(s.sigShare * 100)}%`);
  }
  assert.equal(mixedShares(planStage(ps, 1, 11).order, 1).sigShare, 0, 'a world without one keeps the mix');
});

test('on the generated stages of every world the plan meets the variety targets', () => {
  const levels = generateAllLevels();
  let checked = 0;
  for (const l of levels) {
    if (l.miniIndex > 6) continue; // a sample per world keeps the run short; the script measures the rest
    setLayoutVariant(null);
    const stage = generateStage(l);
    const plan = planStage(stage.platforms as Platform[], l.worldIndex, 12345);
    const n = plan.order.length;
    if (n < 8) continue;
    checked++;
    const s = mixedShares(plan.order, l.worldIndex);
    assert.ok(s.maxShare <= 0.4 + 1e-9, `${l.id}: ${s.maxLook} is ${Math.round(s.maxShare * 100)}% of ${n} platforms`);
    assert.ok(s.distinct >= (SIGNATURE[l.worldIndex] ? 3 : 4), `${l.id}: only ${s.distinct} looks among ${n} platforms`);
    assert.ok(s.run <= 2, `${l.id}: three identical looks in a row`);
  }
  assert.ok(checked >= 20, `only ${checked} stages were large enough to check`);
});

test('moving, bouncy and fragile platforms differ from one world to the next and from one platform to the next', () => {
  const ps = [...thinRow(9, undefined, 'bouncy'), ...thinRow(9, undefined, 'moving'), ...thinRow(9, undefined, 'fragile')];
  const kinds = (world: number) => {
    const plan = planStage(ps, world, 3);
    return new Set(ps.map((p) => `${plan.thin.get(p)!.look}/${plan.thin.get(p)!.variant}`));
  };
  assert.ok(kinds(1).size >= 6, 'a world shows several different special platforms, not one');
  const sets = [1, 3, 5, 7, 9].map((w) => [...kinds(w)].sort().join(','));
  assert.ok(new Set(sets).size >= 3, 'the worlds do not all use the same special platforms');
});

test('a stage keeps its thin platforms whatever the scene seed, and different stages (ids) get different looks', () => {
  const ps = thinRow(16, 'branch');
  assert.equal(planStage(ps, 2, 1).order.join(), planStage(ps, 2, 2).order.join());
  const other = thinRow(16, 'branch'); // the same layout with other platform ids
  assert.notEqual(planStage(ps, 2, 1).order.join(), planStage(other, 2, 1).order.join());
});

test("World 7's crumbling tiles take no kit look: Matt's painted crumble frames draw them (crumbleArt.ts), and the plan's mix leaves them out", () => {
  const trail: Platform[] = [];
  for (let i = 0; i < 24; i++) trail.push(plat(500 + i * 130, 560, 100, 26, { type: 'fragile', style: 'moss_stone', crumbleAfter: 1.2 }));
  const plan = planStage([...trail, ...thinRow(6, 'branch')], 7, 9);
  assert.equal(plan.order.length, 6, 'only the branches are in the mix');
  for (const t of trail) assert.equal(plan.thin.get(t), undefined);
});

test('adjacent ground stretches never share a treatment, and the choice is repeatable', () => {
  for (const world of [1, 3, 5, 7, 9]) {
    const g = plat(0, 700, 6000, 90, { style: 'log' });
    const r1 = groundRegions(g, world, 7, null);
    const r2 = groundRegions(g, world, 7, null);
    assert.deepEqual(r1, r2);
    assert.ok(r1.length >= 3, 'a long block is split into several stretches');
    for (let i = 1; i < r1.length; i++) assert.notEqual(r1[i].treat, r1[i - 1].treat, `world ${world}: stretch ${i} repeats the one before`);
    assert.equal(r1[0].x0, g.x);
    assert.equal(r1[r1.length - 1].x1, g.x + g.width);
    for (let i = 1; i < r1.length; i++) assert.equal(r1[i].x0, r1[i - 1].x1, 'stretches meet exactly');
  }
});

test('a stage uses more than one ground treatment, and the scene seed changes where they fall', () => {
  const ground = [plat(0, 700, 2600, 90, { style: 'log' }), plat(2900, 700, 2600, 90, { style: 'log' })];
  for (const world of [1, 4, 8]) {
    const used = new Set<string>();
    for (const p of ground) for (const r of planStage(ground, world, 5).ground.get(p)!.regions) used.add(r.treat);
    assert.ok(used.size >= 3, `world ${world} shows ${used.size} treatments`);
  }
  const a = planStage(ground, 4, 5).ground.get(ground[0])!.regions.map((r) => r.treat).join();
  let differs = false;
  for (let seed = 6; seed < 16 && !differs; seed++) differs = planStage(ground, 4, seed).ground.get(ground[0])!.regions.map((r) => r.treat).join() !== a;
  assert.ok(differs, 'some other scene seed lays the treatments out differently');
});

test('a run of narrow touching ground blocks, each a step higher, is found as a staircase', () => {
  const steps = [plat(5000, 700, 100, 90), plat(5100, 660, 100, 130), plat(5200, 620, 100, 170), plat(5300, 580, 100, 210)];
  const wide = plat(0, 700, 5000, 90);
  const runs = findStairs([wide, ...steps], 1);
  assert.equal(runs.length, 1);
  assert.equal(runs[0].steps.length, 4);
  assert.equal(runs[0].rising, true);
  const plan = planStage([wide, ...steps], 7, 1);
  steps.forEach((s, i) => {
    const gp = plan.ground.get(s)!;
    assert.equal(gp.role, 'step');
    assert.equal(gp.stepIndex, i);
  });
  assert.equal(plan.ground.get(wide)!.role, 'ground');
});

test('a lone narrow block is a pillar, and a field of pillars is never one repeated shape', () => {
  const pillars: Platform[] = [];
  for (let i = 0; i < 14; i++) pillars.push(plat(1000 + i * 260, 700 - (i % 4) * 30, 100, 150 + (i % 4) * 30));
  const plan = planStage([plat(0, 700, 900, 90), ...pillars], 3, 21);
  const vs = pillars.map((p) => {
    const gp = plan.ground.get(p)!;
    assert.equal(gp.role, 'pillar');
    assert.ok(gp.variant >= 0 && gp.variant < PILLAR_VARIANTS);
    return gp.variant;
  });
  for (let i = 1; i < vs.length; i++) assert.notEqual(vs[i], vs[i - 1], `pillars ${i - 1} and ${i} share a variant`);
  assert.ok(new Set(vs).size >= 4, `only ${new Set(vs).size} pillar variants in 14 pillars`);
});

test('the plan does not move any platform or change collision data', () => {
  const ps = [plat(0, 700, 2000, 90, { style: 'log' }), ...thinRow(8, 'branch'), ...thinRow(3, undefined, 'bouncy')];
  const before = JSON.stringify(ps);
  planStage(ps, 5, 3);
  assert.equal(JSON.stringify(ps), before);
});

test('lookShares leaves bridges out of the maximum and longestRun does the same', () => {
  const order: ThinLook[] = ['bridge', 'bridge', 'bridge', 'bridge', 'branch', 'log'];
  assert.equal(lookShares(order).maxLook === 'bridge', false);
  assert.equal(longestRun(order), 1);
  assert.equal(longestRun(['log', 'log', 'log', 'branch']), 3);
});
