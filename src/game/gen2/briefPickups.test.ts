// The pickups are the BRIEF's (routing packet item 6; "why 42 hand-authored sections", point 1): GraphBrief.petals 'low' lays no
// petal arc over any gap, and GraphBrief.offRoad 'fruit' lays a bloom (a `fruit`) at every pickup socket off the road, both applied
// by the fill, so a stage needs no re-cut copy of a section to change what it holds. Proved test-side on 1-1's OWN sections and
// proven plans: the same sections, the same pieces. Nothing in the game sets either field yet.
//   npx tsx --test src/game/gen2/briefPickups.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, layStage, missionGraph, planBudget, stagePool, type Laid } from './pipeline.ts';
import { provenPlan, provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import { validateStage } from '../levelCheck.ts';
import { cfg as toyCfg, kit as toyKit } from './toyWorld.ts';
import type { Difficulty } from '../difficulty.ts';
import type { GraphBrief, Gen2Stage, WorldKit } from './types.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const SEEDS = provenSeeds('1-1').slice(0, 12);
/** World 1's kit for 1-1, as it is; or with brief fields added (test-side only) */
const kit = (o: Partial<GraphBrief> = {}): WorldKit => {
  const k = w1World(), M = k.manifest, b = M.graphs!.briefs['1-1'];
  return { ...k, manifest: { ...M, sections: stagePool(M, '1-1'), graphs: { ...M.graphs!, briefs: { ...M.graphs!.briefs, '1-1': { ...b, ...o } } } } };
};
const build = (seed: number, k: WorldKit, difficulty: Difficulty = 'normal'): Gen2Stage => buildGen2Stage({ config: cfg, kit: k, seed, difficulty, replay: provenPlan('1-1', seed)! });
/** the same plan laid alone, for its gaps and each placed piece's road mark (x is the built stage's: a rolled stage moves down, never along) */
const lay = (seed: number, k: WorldKit, difficulty: Difficulty = 'normal'): Laid => {
  const budget = planBudget(cfg, k.manifest, difficulty), r = provenPlan('1-1', seed)!;
  return layStage(budget, missionGraph(budget, k.manifest, seed), k, r.seed, { plan: r.plan });
};
const petalish = (st: Gen2Stage) => st.collectibles.filter((c) => c.type === 'flower' || c.type === 'fruit');
const shape = (st: Gen2Stage) => st.platforms.map((p) => [p.id, p.x, p.y, p.width, p.height]);
/** the piece right under a pickup: the nearest top below it among the pieces it is over */
const under = (st: Gen2Stage, c: { x: number; y: number }) => st.platforms.filter((p) => c.x >= p.x && c.x <= p.x + p.width && p.y > c.y).sort((a, b) => a.y - b.y)[0];
/** the ids of the placed pieces off the road (the lay's own reading: marked `main: false`, or a ledge `over` another with no mark) */
const offRoad = (L: Laid) => new Set(L.sections.flatMap((q) => q.pieces.filter((p) => p.main === false).map((p) => p.platform.id)));

test('no brief field: a proven 1-1 stage holds exactly what it held (nothing moves until a brief asks)', () => {
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS.slice(0, 6)) {
    const a = build(seed, w1World(), d), b = build(seed, kit(), d);
    assert.deepEqual(b.collectibles, a.collectibles, `seed ${seed} ${d}`);
    assert.ok(petalish(a).every((c) => c.type === 'flower'), `seed ${seed} ${d}: a bloom with no brief asking`);
  }
});

test("petals 'low' by brief on 1-1's own sections: no petal over a gap, none more than 50 px over the piece under it, the same pieces", () => {
  let checked = 0, arcsGone = 0, inGap = 0;
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const plain = build(seed, kit(), d), low = build(seed, kit({ petals: 'low' }), d), L = lay(seed, kit({ petals: 'low' }), d);
    assert.deepEqual(low.gen2.plan, plain.gen2.plan, `seed ${seed} ${d}: the plan`);
    assert.deepEqual(shape(low), shape(plain), `seed ${seed} ${d}: a piece moved`);
    assert.deepEqual(low.gen2.errors ?? [], plain.gen2.errors ?? [], `seed ${seed} ${d}: the roll's errors changed`);
    const flowers = low.collectibles.filter((c) => c.type === 'flower'), own = new Set(L.sections.flatMap((q) => q.pieces.map((p) => p.platform.id)));
    for (const c of flowers) {
      checked++;
      const p = under(low, c);
      assert.ok(p && p.y - c.y <= 50, `seed ${seed} ${d}: the petal at x ${c.x} hangs ${p ? p.y - c.y : 'over nothing'} px up`);
      // (inside a gap's span only on a section's own piece standing in that gap, a side stone: never in the air over it)
      const g = L.gaps.find((q) => c.x > q.x0 && c.x < q.x1);
      if (g) { inGap++; assert.ok(own.has(p.id), `seed ${seed} ${d}: a petal at x ${c.x} over the gap ${g.x0}-${g.x1}, on no piece of a section`); }
    }
    // (every petal left is one the plain stage holds too: only the arcs went)
    const had = new Set(plain.collectibles.map((c) => `${c.type} ${c.x} ${c.y}`));
    assert.ok(flowers.every((c) => had.has(`flower ${c.x} ${c.y}`)), `seed ${seed} ${d}: a petal the plain stage never laid`);
    arcsGone += plain.collectibles.filter((c) => c.type === 'flower').length - flowers.length;
    assert.ok(flowers.length > 0, `seed ${seed} ${d}: no petal left`);
  }
  assert.ok(arcsGone >= 24, `only ${arcsGone} arc petals gone over 24 builds: the brief is not reaching the arcs`);
  console.log(`petals low: ${checked} petals checked over 24 builds, ${arcsGone} arc petals not laid, ${inGap} on a section's stone standing in a gap`);
});

test("offRoad 'fruit' by brief on 1-1's own sections: a pickup socket off the road lays blooms, every other one petals; the same pieces", () => {
  let fruits = 0, sockets = 0, flowersSeen = 0;
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const plain = build(seed, kit(), d), k = kit({ offRoad: 'fruit' }), st = build(seed, k, d), L = lay(seed, k, d), off = offRoad(L);
    assert.deepEqual(shape(st), shape(plain), `seed ${seed} ${d}: a piece moved`);
    assert.deepEqual(st.gen2.errors ?? [], plain.gen2.errors ?? [], `seed ${seed} ${d}: the roll's errors changed`);
    // (the same spots hold a pickup: only its kind changed)
    assert.deepEqual(petalish(st).map((c) => [c.x, c.y]), petalish(plain).map((c) => [c.x, c.y]), `seed ${seed} ${d}: a pickup moved`);
    // (by socket: the fill's own record against the section's piece)
    for (const f of st.gen2.fills.filter((q) => q.role === 'pickup')) {
      const sec = L.sections.find((q) => q.uid === f.section)!, so = sec.sockets.find((q) => q.socket.id === f.socket)!;
      const isOff = off.has(so.piece.id);
      assert.equal(f.what, isOff ? 'fruit' : 'flower', `seed ${seed} ${d}: ${sec.template} socket ${f.socket} on ${so.socket.on}`);
      if (isOff) sockets++;
    }
    // (on the built stage: a bloom stands over an off-road piece, a petal never does)
    for (const c of petalish(st)) {
      const p = under(st, c);
      if (c.type === 'fruit') { fruits++; assert.ok(p && off.has(p.id), `seed ${seed} ${d}: the bloom at x ${c.x} is over ${p ? `piece ${p.id}, which is on the road` : 'nothing'}`); }
      else { flowersSeen++; assert.ok(!p || !off.has(p.id) || p.y - c.y > 50, `seed ${seed} ${d}: a petal at x ${c.x} sits on the off-road piece ${p?.id}`); }
    }
  }
  assert.ok(sockets >= 6 && fruits >= 6, `only ${fruits} blooms at ${sockets} off-road sockets over 24 builds: the brief is not reaching the sockets`);
  console.log(`off road: ${fruits} blooms at ${sockets} off-road pickup sockets, ${flowersSeen} petals on the road, over 24 builds`);
});

test("both, as 1-2's brief asks: what is left inside a gap's span is a bloom on a side stone, never a petal", () => {
  let blooms = 0;
  for (const d of ['normal', 'easy'] as const) for (const seed of SEEDS) {
    const k = kit({ petals: 'low', offRoad: 'fruit' }), st = build(seed, k, d), L = lay(seed, k, d);
    for (const c of petalish(st)) {
      const g = L.gaps.find((q) => c.x > q.x0 && c.x < q.x1);
      if (!g) continue;
      assert.equal(c.type, 'fruit', `seed ${seed} ${d}: a petal at x ${c.x} inside the gap ${g.x0}-${g.x1}`);
      blooms++;
    }
  }
  console.log(`both: ${blooms} blooms on side stones inside a gap's span, 0 petals, over 24 builds`);
});

test('a harvest under both fields (the toy world, test-side): the top-up still reaches its laid count in petals alone, blooms beside them', () => {
  // (a brief with no graph of the harvest's archetype rolls nothing: the stage keeps its spine and only the pickups read the brief)
  const M = toyKit.manifest, brief: GraphBrief = { ends: 'quiet', trend: 'level', branching: 'none', petals: 'low', offRoad: 'fruit' };
  const k: WorldKit = { ...toyKit, manifest: { ...M, graphs: { list: [], briefs: { '5-3': brief } } } };
  let blooms = 0;
  for (const seed of [3, 4, 5, 6, 7, 8]) for (const d of ['normal', 'easy'] as const) {
    const config = toyCfg('5-3', 'harvest', 40), st = buildGen2Stage({ config, kit: k, seed, difficulty: d });
    assert.deepEqual(validateStage(st).errors, [], `seed ${seed} ${d}`);
    assert.deepEqual(st.gen2.errors ?? [], [], `seed ${seed} ${d}`);
    const lay = planBudget(config, k.manifest, d).quota.lay, flowers = st.collectibles.filter((c) => c.type === 'flower');
    assert.ok(flowers.length >= lay, `seed ${seed} ${d}: ${flowers.length} petals laid, the harvest lays ${lay}`);
    for (const c of flowers) { const p = under(st, c); assert.ok(p && p.y - c.y <= 50, `seed ${seed} ${d}: the petal at x ${c.x} hangs ${p ? p.y - c.y : 'over nothing'} px up`); }
    blooms += st.collectibles.filter((c) => c.type === 'fruit').length;
  }
  assert.ok(blooms > 0, 'no bloom on the toy world\'s high road over 12 builds');
  console.log(`harvest: 12 toy builds, every one at its laid count in petals, ${blooms} blooms beside them`);
});
