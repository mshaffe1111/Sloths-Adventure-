// The hazard under a gap is the BRIEF's (the lead, 11-11 8:30 PM, the first point of "why 42 hand-authored sections"): GraphBrief.pits
// 'hurt' turns every section pit into the world's hurt floor, applied by the lay, so a stage needs no re-cut copy of a section to
// change what lies under its gaps. Proved test-side on 1-1's OWN sections and a proven plan: the same sections, the same pieces, a
// thorn hollow under their pits. Nothing in the game sets it yet.
//   npx tsx --test src/game/gen2/briefPits.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { layStage, missionGraph, planBudget, stagePool, type Laid } from './pipeline.ts';
import { provenPlan, provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { WorldKit } from './types.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const ROW = { lesson: 'thorns', art: 'w1-thorn', depth: [150, 170] as [number, number], clearStart: 1300 };
/** World 1's kit for 1-1, as it is; or with a hurt floor row and the brief's `pits` (test-side only) */
const kit = (o: { row?: boolean; pits?: boolean } = {}): WorldKit => {
  const k = w1World(), M = k.manifest, b = M.graphs!.briefs['1-1'];
  return { ...k, manifest: { ...M, sections: stagePool(M, '1-1'), ...(o.row ? { hurtFloor: ROW } : {}), graphs: { ...M.graphs!, briefs: { ...M.graphs!.briefs, '1-1': { ...b, ...(o.pits ? { pits: 'hurt' as const } : {}) } } } } };
};
const lay = (seed: number, k: WorldKit): Laid => {
  const budget = planBudget(cfg, k.manifest, 'normal'), r = provenPlan('1-1', seed)!;
  return layStage(budget, missionGraph(budget, k.manifest, seed), k, r.seed, { plan: r.plan });
};
const pieces = (L: Laid) => L.sections.map((q) => q.pieces.map((p) => [p.key, p.platform.x, p.platform.y, p.platform.width]));
const hollows = (L: Laid) => L.platforms.filter((p) => p.pit === 'hurt');

test("1-1's own sections with a thorn floor by brief: the same sections and pieces, hollows under their pits, none near the start", () => {
  let laidHollows = 0;
  for (const seed of provenSeeds('1-1').slice(0, 12)) {
    const plain = lay(seed, kit()), thorn = lay(seed, kit({ row: true, pits: true }));
    assert.equal(hollows(plain).length, 0, `seed ${seed}: a hurt floor with no brief asking`);
    assert.deepEqual(hollows(lay(seed, kit({ row: true }))), [], `seed ${seed}: the row alone lays nothing: the brief asks`);
    // (the same plan, the same pieces where they stood: no section was re-cut)
    assert.deepEqual(thorn.plan, plain.plan);
    assert.deepEqual(pieces(thorn), pieces(plain), `seed ${seed}: a section's own pieces moved`);
    for (const h of hollows(thorn)) {
      laidHollows++;
      assert.ok(h.x >= thorn.spawn.x + ROW.clearStart, `seed ${seed}: a hollow at x ${h.x}, inside ${ROW.clearStart} px of the spawn`);
      // (wall to wall under one of the stage's gaps, the hurt line on its zone; soft on Easy only, so here it costs a heart)
      const z = thorn.heartFalls.find((q) => q.x0 === h.x && q.x1 === h.x + h.width);
      assert.ok(z && z.y === h.y && !z.soft, `seed ${seed}: the hollow at x ${h.x} has no heart-fall zone on its floor`);
    }
    // (a hollow has no steps out: the soft pit's floor and steps are gone from under it)
    assert.ok(thorn.platforms.length <= plain.platforms.length, `seed ${seed}`);
  }
  assert.ok(laidHollows >= 12, `only ${laidHollows} hollows over 12 proven stages: the brief is not reaching the sections' pits`);
});

test("a brief that asks for hollows in a world with no hurt floor row fails by name (never a silent soft pit)", () => {
  const seed = provenSeeds('1-1').find((s) => hollows(lay(s, kit({ row: true, pits: true }))).length > 0)!;
  assert.throws(() => lay(seed, kit({ pits: true })), /no hurtFloor row/);
});

test("World 1's painter finds every hollow the lay makes (w1Pits kind 'hurt': its floor the marked piece's top, its lips the banks beside it)", async () => {
  // (planted: red before w1Pits reported a hurt floor, when a hollow read as a soft pit's leaf bed or as nothing at all)
  const { findW1Pits } = await import('../w1Pits.ts');
  let seen = 0;
  for (const seed of provenSeeds('1-1').slice(0, 12)) {
    const thorn = lay(seed, kit({ row: true, pits: true }));
    const found = findW1Pits(thorn.platforms);
    for (const h of hollows(thorn)) {
      seen++;
      const g = found.filter((q) => q.x0 < h.x + h.width && q.x1 > h.x);
      assert.deepEqual(g.map((q) => [q.kind, q.x0, q.x1, q.floor]), [['hurt', h.x, h.x + h.width, h.y]], `seed ${seed}: the hollow at x ${h.x}`);
      assert.ok(g[0].top < h.y && g[0].walls!.every((y) => y < h.y), `seed ${seed}: a lip at or under the hurt floor at x ${h.x}`);
    }
    // (and nothing else moved: a stage with no hollow is found as before)
    const plain = lay(seed, kit());
    assert.ok(findW1Pits(plain.platforms).every((q) => q.kind !== 'hurt'), `seed ${seed}: a hurt pit with no hurt floor`);
  }
  assert.ok(seen >= 12, `only ${seen} hollows in 12 rolls`);
});
