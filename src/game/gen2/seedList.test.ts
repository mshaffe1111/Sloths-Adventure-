// The proven-seed list (gen2/seedList.ts): Play draws only from it. The checker names a list that is short, repeats a seed, or holds a seed
// that no longer lays cleanly on a setting (planted: a failing seed found, not assumed); 1-1's list holds at least SEED_LIST_MIN seeds, a
// sample of them builds cleanly on both settings here (the whole list is tools/engine/seedlist.ts --check, the gate), and a play's draw
// always lands on the list.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { provenSeedFor, provenSeeds, seedListBreaches, SEED_LIST_MIN } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import { quietJudge } from '../../../tools/engine/listRules.ts';

const c = generateAllLevels().find((l) => l.id === '1-1')!;

test('the checker names a short list, a repeat, and a seed that fails its build', () => {
  let bad = -1;
  for (let s = 1; s <= 400 && bad < 0; s += 2) if (buildGen2Stage({ config: c, kit: w1World(), seed: s, difficulty: 'normal' }).gen2.errors?.length) bad = s;
  assert.ok(bad > 0, 'no failing seed in 200: the planted case is gone');
  const b = seedListBreaches(c, w1World, [bad, bad], 3);
  assert.ok(b.some((x) => /under 3/.test(x)), b.join(' | '));
  assert.ok(b.some((x) => /listed twice/.test(x)), b.join(' | '));
  assert.ok(b.some((x) => x.startsWith(`1-1 seed ${bad} normal:`)), b.join(' | '));
});

test("1-1's list: at least SEED_LIST_MIN distinct seeds; 12 of them, spread through it, build cleanly on both settings", () => {
  const s = provenSeeds('1-1');
  assert.ok(s.length >= SEED_LIST_MIN, `${s.length} proven seeds for 1-1 (tools/engine/seedlist.ts 1-1)`);
  assert.equal(new Set(s).size, s.length);
  const sample = Array.from({ length: 12 }, (_, i) => s[Math.floor((i * s.length) / 12)]);
  assert.deepEqual(seedListBreaches(c, w1World, sample, 0), []);
});

test("a play's draw always lands on the list, any number", () => {
  const s = new Set(provenSeeds('1-1'));
  for (const n of [0, 1, 299, 300, 12345, -7, 2 ** 31 - 1]) assert.ok(s.has(provenSeedFor('1-1', n)), `draw ${n}`);
});

// (plan replay, the lead 11-06: Play builds a listed seed's proven plan, one lay and its check; the list's plans are held identical to
// their full search by tools/engine/seedlist.ts --check, in CI. Planted: a plan with one slot flipped to mirrored is named stale)
test("a listed seed's replay is its full search's stage; a tampered plan is named stale; Play's build is clean", async () => {
  const { buildPlayStage, packPlan, provenList, provenPlan, stageParts, unpackPlan } = await import('./seedList.ts');
  const L = provenList('1-1')!;
  const picks = [0, Math.floor(L.seeds.length / 2), L.seeds.length - 1];
  // (the search the list was built with, the quiet line its own rule (tools/engine/seedlist.ts `also`, listRules.ts quietJudge; libstage.ts
  // builds the same): POLISH-7's pool steers more rolls by it, and a search without it is not the search that listed the seed (D19))
  const also = quietJudge(c);
  assert.deepEqual(seedListBreaches(c, w1World, picks.map((i) => L.seeds[i]), 0, { dict: L.dict, plans: picks.map((i) => L.plans[i]) }, also), []);
  const r = provenPlan('1-1', L.seeds[0])!;
  const dict = [...L.dict];
  const k = r.plan.findIndex((p) => !p.mirrored && p.template !== 'w1-seed-perch');
  const bad = packPlan({ ...r, plan: r.plan.map((p, i) => (i === k ? { ...p, mirrored: true } : p)) }, dict);
  const b = seedListBreaches(c, w1World, [L.seeds[0]], 0, { dict, plans: [bad] }, also);
  assert.ok(b.some((x) => /its replay differs from its search/.test(x)), b.join(' | '));
  assert.deepEqual(unpackPlan(L.plans[0], L.dict).plan.map((p) => p.template), r.plan.map((p) => p.template));
  for (const difficulty of ['normal', 'easy'] as const) {
    const play = buildPlayStage(c, w1World(), L.seeds[0], difficulty);
    assert.deepEqual(play.gen2.errors ?? [], []);
    assert.deepEqual(stageParts(play), stageParts(buildGen2Stage({ config: c, kit: w1World(), seed: L.seeds[0], difficulty, also })), difficulty);
  }
});
