// A stage's pool is picked by NEED (the lead 11-11, EN-L step 2: a section is a brick, not one stage's): GraphBrief.pick. Proved on
// World 1's OWN sections, the kit changed test-side only: nothing in the game sets `pick` yet, and a brief without it cuts its pool
// exactly as before (the stage lock and the proven list hold that; the first test here holds it by name).
//   npx tsx --test src/game/gen2/briefPick.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage, layStage, missionGraph, planBudget, stagePool } from './pipeline.ts';
import { provenPlan, provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { GraphBrief, SectionTemplate, WorldKit, WorldManifest } from './types.ts';

const cfg = { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true };
const M0 = w1World().manifest;
const withBrief = (b: Partial<GraphBrief>, more: Partial<WorldManifest> = {}): WorldManifest => ({ ...M0, ...more, graphs: { ...M0.graphs!, briefs: { ...M0.graphs!.briefs, '1-1': { ...M0.graphs!.briefs['1-1'], ...b } } } });
const ids = (ts: SectionTemplate[]) => ts.map((t) => t.id);

test('no `pick`: the pool is cut by `feel` as before, section for section', () => {
  assert.deepEqual(ids(stagePool(M0, '1-1')), ids(M0.sections.filter((t) => !t.feel || t.feel.includes('1-1'))));
  assert.deepEqual(ids(stagePool(M0, '1-3')), ids(M0.sections.filter((t) => !t.feel || t.feel.includes('1-3'))));
});

test('`pick`: the whole library less what is parked and what the deal holds no type for; `feel` names no stage there', () => {
  const pool = stagePool(withBrief({ pick: {} }), '1-1'), got = new Set(ids(pool));
  const parked = M0.sections.filter((t) => t.parked), deal = M0.graphs!.briefs['1-1'].deal!;
  assert.ok(parked.length >= 3 && parked.every((t) => !got.has(t.id)), 'a parked section is in a pool picked by need');
  // (sections another stage's list held are in: the stage ids in `feel` are not read)
  const others = M0.sections.filter((t) => !t.parked && t.feel && !t.feel.includes('1-1') && (!t.content || t.content === 'structural' || t.content in deal));
  assert.ok(others.length >= 3 && others.every((t) => got.has(t.id)), `${others.filter((t) => !got.has(t.id)).map((t) => t.id)} left out by a stage id`);
  // (a type the deal does not hold is out: 1-1's deal has no rope)
  assert.ok(M0.sections.some((t) => t.content === 'rope') && pool.every((t) => t.content !== 'rope'));
  // (a deal without floating takes every floating section out, and nothing else)
  const noFloat = stagePool(withBrief({ pick: {}, deal: { ground: 50, climb: 30, bounce: 20 } }), '1-1');
  assert.deepEqual(ids(noFloat), ids(pool.filter((t) => t.content !== 'floating')));
});

test('`pick.refuse`: a section whose `feel` names a refused thing is out; `feel` only excludes', () => {
  const tagged = M0.sections.map((t, i) => (i % 5 === 0 ? { ...t, feel: ['canopy'] } : t));
  const open = stagePool(withBrief({ pick: {} }, { sections: tagged }), '1-1'), shut = stagePool(withBrief({ pick: { refuse: ['canopy'] } }, { sections: tagged }), '1-1');
  assert.deepEqual(ids(shut), ids(open.filter((t) => !t.feel?.includes('canopy'))));
  assert.ok(shut.length < open.length);
});

/** a proven 1-1 roll rebuilt whole (sockets filled) under a kit */
const build = (seed: number, M: WorldManifest) => buildGen2Stage({ config: cfg, kit: { ...w1World(), manifest: M } as WorldKit, seed, difficulty: 'normal' });

test('`pick.refuse`: a socket whose `allow` starts with a refused name stays empty, and nothing else moves', () => {
  let cut = 0;
  for (const seed of provenSeeds('1-1').slice(0, 4)) {
    const plain = build(seed, M0), pool = { sections: stagePool(M0, '1-1') };
    // (the same pool, so the same roll; only the refusal differs)
    const st = build(seed, withBrief({ pick: { refuse: ['hint.1-1', 'coach.', 'squirrel'] } }, pool));
    assert.deepEqual(st.gen2.plan, plain.gen2.plan, `seed ${seed}: the plan moved`);
    assert.deepEqual(st.platforms, plain.platforms, `seed ${seed}: a piece moved`);
    const said = (s: typeof st) => s.gen2.fills.filter((f) => f.role === 'tip').map((f) => String(f.what));
    assert.ok(said(plain).some((m) => /^(hint\.1-1|coach\.)/.test(m)), `seed ${seed}: 1-1 says none of its own lines`);
    assert.deepEqual(said(st).filter((m) => /^(hint\.1-1|coach\.)/.test(m)), [], `seed ${seed}: a refused line was said`);
    cut += said(plain).length - said(st).length;
    assert.deepEqual(st.collectibles, plain.collectibles, `seed ${seed}: a pickup moved`);
    assert.deepEqual(st.enemies, plain.enemies, `seed ${seed}: an animal moved`);
  }
  assert.ok(cut >= 4, `only ${cut} lines refused over 4 stages`);
});

test("a stage that TEACHES the hurt floor's lesson lays no hollow by brief before the lesson's showing piece ends", () => {
  const ROW = { lesson: 'bounce', art: 'w1-thorn', depth: [150, 170] as [number, number], clearStart: 1300 };
  // (1-1 teaches the bounce: filed as the hurt floor's lesson here, its teach section stands in for a thorn teach. A row whose lesson
  // the stage does not teach waits for nothing: briefPits.test.ts)
  const pool = stagePool(M0, '1-1');
  const kit = { ...w1World(), manifest: withBrief({ pits: 'hurt' }, { sections: pool, hurtFloor: ROW }) } as WorldKit;
  let seen = 0, after = 0;
  for (const seed of provenSeeds('1-1').slice(0, 12)) {
    const budget = planBudget(cfg, kit.manifest, 'normal'), r = provenPlan('1-1', seed)!;
    const L = layStage(budget, missionGraph(budget, kit.manifest, seed), kit, r.seed, { plan: r.plan });
    const teach = L.sections.find((s) => pool.find((t) => t.id === s.template)?.teaches === ROW.lesson);
    assert.ok(teach, `seed ${seed}: no bounce teach laid`);
    const show = teach.pieces.find((p) => p.key === 'show')?.platform;
    const from = show ? show.x + show.width : teach.x1;
    for (const h of L.platforms.filter((p) => p.pit === 'hurt')) { seen++; assert.ok(h.x >= from - 1, `seed ${seed}: a hollow at x ${h.x}, before the lesson is shown (x ${Math.round(from)})`); }
    after += L.gaps.filter((g) => g.x0 >= from).length;
  }
  assert.ok(seen >= 6, `only ${seen} hollows after the lesson over 12 stages (${after} gaps stand after it)`);
});
