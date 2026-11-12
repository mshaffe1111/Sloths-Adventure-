// The generator's yield (R-165.120, audit B-02: gen2 laid a clean 1-1 from a fresh seed 2 times in 120). The rules that refuse a roll
// were judged only after the search had returned, the deal typed nodes the pool had no section for, and nothing kept a scarce section
// for the node that needed it. Each test below was red on release-0.9.6 (06bbd29f) and names what it plants.
//   npx tsx --test src/game/gen2/yield.test.ts   (about 60 s: 30 fresh seeds searched on both settings)
// The full table (200 seeds a setting, the rolls each rule stops): npx tsx tools/engine/yield.ts 1-1 --par 4
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, keptFoes, layStage, missionGraph, planBudget, rollUnmet, stagePool, unfilled } from './pipeline.ts';
import { packPlan, stageParts, unpackPlan } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Gen2Stage } from './types.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
// (fresh seeds: above the proven list's highest, 61616; the audit's own range)
const FRESH = Array.from({ length: 30 }, (_, k) => 50001 + k);
const kit11 = () => { const k = w1World(); return { ...k, manifest: { ...k.manifest, sections: stagePool(k.manifest, '1-1') } }; };

// (each fresh seed searched once on each setting, for the tests below)
let cache: Map<number, { n: Gen2Stage; e: Gen2Stage }> | undefined;
const rolls = () => (cache ??= new Map(FRESH.map((seed) => [seed, {
  n: buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty: 'normal' }),
  e: buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty: 'easy' }),
}])));

test('unfilled: every slot filled at once, each section at most its cap (the matching the deal and the lay ask)', () => {
  const one = () => 1;
  assert.equal(unfilled([['a'], ['a', 'b']], one), 0, 'the second slot moves to b so the first keeps a');
  assert.equal(unfilled([['a', 'b'], ['a'], ['b']], one), 1, 'three slots, two sections');
  // (planted: the greedy order takes a for slot 1 and b for slot 2 and leaves slot 3 short; the matching re-routes both)
  assert.equal(unfilled([['a', 'b', 'c'], ['b', 'c'], ['c']], one), 1 - 1, 'a, b, c in turn');
  assert.equal(unfilled([['a'], ['a'], ['a']], (id) => (id === 'a' ? 2 : 1)), 1, 'a cap of 2 fills two');
  assert.equal(unfilled([['a'], ['a'], ['a']], () => Infinity), 0, 'no cap');
  assert.equal(unfilled([[], ['a']], one), 1, 'a slot with no candidate is short');
  assert.equal(unfilled([], one), 0);
});

test('the deal: a node is not dealt a type no section of its job has (was 38 fresh graphs in 200: a combine dealt bounce or climb)', () => {
  const M = kit11().manifest;
  const budget = planBudget(cfg, M, 'normal');
  const bad: string[] = [];
  for (let seed = 50001; seed <= 50200; seed++) {
    for (const n of missionGraph(budget, M, seed).nodes) {
      if (!n.content || !n.job || n.job === 'teach') continue;
      if (!M.sections.some((t) => t.jobs?.includes(n.job!) && (!t.content || t.content === n.content))) bad.push(`seed ${seed}: ${n.id} ${n.job} dealt ${n.content}`);
    }
  }
  // (what is left, 1 in 200: a graph whose caps, neighbours, windows and deal counts leave its combine no type the pool has, seed
  // 50124's sprint-B; the repair breaks no rule of the deal to fix another, so that roll still fails by name)
  assert.ok(bad.length <= 2, `${bad.length} of 200 graphs: ${bad.slice(0, 5).join('; ')}`);
});

test('the deal stays the deal: a re-typed graph keeps the caps, the neighbours and the windows (its node code is clean when laid clean)', () => {
  // (the same seed gives the same graph, whatever is built after: the deal's repair draws from its own stream)
  const M = kit11().manifest;
  const budget = planBudget(cfg, M, 'normal');
  for (const seed of FRESH) assert.deepEqual(missionGraph(budget, M, seed), missionGraph(budget, M, seed));
  for (const [seed, { n }] of rolls()) if (!n.gen2.errors?.length) assert.deepEqual(n.gen2.codeErrors ?? [], [], `seed ${seed}`);
});

test('the yield floor: of 30 fresh 1-1 seeds at least 12 lay cleanly on BOTH settings (was 0 or 1; the probe measures 200)', () => {
  const clean = [...rolls()].filter(([, r]) => !r.n.gen2.errors?.length && !r.e.gen2.errors?.length).length;
  assert.ok(clean >= 12, `${clean} of ${FRESH.length} fresh seeds are clean on both settings`);
});

test('a roll the search returns clean carries no after-rule; one it returns refused says so on that setting (rollUnmet is rollErrors, placed)', () => {
  let refused = 0;
  for (const [seed, r] of rolls()) for (const [st, difficulty] of [[r.n, 'normal'], [r.e, 'easy']] as const) {
    const unmet = rollUnmet(st, { config: cfg, kit: kit11(), seed, difficulty });
    if (!st.gen2.errors?.length) { assert.deepEqual(unmet, [], `seed ${seed} ${difficulty}: clean, yet an after-rule refuses it`); continue; }
    refused++;
    // (every line the roll's own errors carry for this build; a slot, when named, is one of the plan's)
    for (const u of unmet) {
      assert.ok(st.gen2.errors.includes(u.line), `seed ${seed} ${difficulty}: ${u.line}`);
      if (u.slot !== undefined) assert.ok(u.slot >= 0 && u.slot < st.gen2.plan.length, `seed ${seed}: slot ${u.slot} of ${st.gen2.plan.length}`);
    }
    // (a verdict of this build's own setting that lies on the route names its place; an Easy roll also carries Normal's lines, whose
    // places are Normal's build's to name)
    for (const u of unmet) if (new RegExp(`^verdict (floor\\.unmarked|drop\\.untyped) \\(${difficulty}\\)`).test(u.line)) assert.notEqual(u.slot, undefined, `seed ${seed}: ${u.line} names no slot`);
  }
  assert.ok(refused > 0, 'no refused roll among the 30: the planted case is gone (take a wider range)');
});

test('a clean roll that came through a repair or a re-roll replays from its packed plan to the same stage, on both settings', () => {
  // (the trap: a repair that changed the lay without the plan keeping it would be a stage the list could never replay)
  let repaired = 0;
  for (const [seed, { n, e }] of rolls()) {
    if (n.gen2.errors?.length || e.gen2.errors?.length) continue;
    if (n.gen2.rerolls > 0 || n.gen2.repairs.some((r) => r.kind === 'swap')) repaired++;
    const dict: string[] = [];
    const replay = unpackPlan(packPlan({ seed: n.gen2.seed, rerolls: n.gen2.rerolls, plan: n.gen2.plan, foes: [...keptFoes(n)] }, dict), dict);
    for (const [full, difficulty] of [[n, 'normal'], [e, 'easy']] as const) {
      const rep = buildGen2Stage({ config: cfg, kit: w1World(), seed, difficulty, replay });
      assert.deepEqual(rep.gen2.errors ?? [], [], `seed ${seed} ${difficulty}: its replay fails`);
      const a = stageParts(full), b = stageParts(rep);
      assert.deepEqual(Object.keys(a).filter((k) => a[k] !== b[k]), [], `seed ${seed} ${difficulty}: its replay differs from its search`);
    }
  }
  assert.ok(repaired >= 5, `only ${repaired} clean rolls came through a repair: the case this test is for is nearly gone`);
});

test('pacing the climb changes only what the plan keeps: a paced lay laid again from its plan, unpaced, is the same stage', () => {
  const kit = kit11();
  const budget = planBudget(cfg, kit.manifest, 'normal');
  let differs = 0;
  for (const seed of FRESH.slice(0, 12)) {
    const graph = missionGraph(budget, kit.manifest, seed);
    let paced;
    try { paced = layStage(budget, graph, kit, seed, { pace: true }); } catch { continue; }
    const again = layStage(budget, graph, kit, seed, { plan: paced.plan });
    assert.deepEqual(again.platforms, paced.platforms, `seed ${seed}: the plan does not carry the paced lay`);
    let plain;
    try { plain = layStage(budget, graph, kit, seed); } catch { continue; }
    if (JSON.stringify(plain.plan) !== JSON.stringify(paced.plan)) differs++;
  }
  assert.ok(differs > 0, 'pacing changed no plan in 12 seeds: it is not being applied');
});

test("lift: a slot asked to climb takes a section that climbs at least that much (V19b's repair)", () => {
  const kit = kit11();
  const budget = planBudget(cfg, kit.manifest, 'normal');
  const byId = new Map(kit.manifest.sections.map((t) => [t.id, t]));
  let tried = 0;
  for (const seed of FRESH) {
    const graph = missionGraph(budget, kit.manifest, seed);
    let laid;
    try { laid = layStage(budget, graph, kit, seed); } catch { continue; }
    // (planted: the stage's last section, a level arrival; asked for 50 px of climb, the slot takes one of the exits that step up)
    const k = laid.plan.length - 1;
    if (byId.get(laid.plan[k].template)!.exitDy <= -50) continue;
    const lifted = layStage(budget, graph, kit, seed, { plan: laid.plan, open: new Set([k]), bans: new Map([[k, new Set([laid.plan[k].template])]]), lift: new Map([[k, -50]]) });
    if (lifted.plan[k].loose) continue;
    tried++;
    const q = lifted.sections[k];
    assert.ok(byId.get(q.template)!.exitDy <= -50 && q.exit.y - q.entry.y <= -30, `seed ${seed}: ${q.template} at the lifted slot ends ${Math.round(q.exit.y - q.entry.y)} px from its entry`);
    // (and without the lift the same swap is free to stay level: the lift is what asks)
    assert.deepEqual(lifted.plan.slice(0, k), laid.plan.slice(0, k), 'the kept slots moved');
  }
  assert.ok(tried >= 5, `the lift was tried on ${tried} rolls only`);
});
