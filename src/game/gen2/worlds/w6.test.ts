/**
 * World 6 on gen2: 6-2 Flat Water (stealth), 6-4 Low Tide (sprint), 6-5 The Spear (purge) and 6-9 Blackwater (gauntlet) built through
 * buildGen2Stage on 20 rolls, Normal and Easy. Every roll passes the check as its difficulty plays it, is long enough (the time model's
 * floors, and 2:00+ for the inspector's quick player), never goes quiet for over 4 s, spends under a fifth of its time quiet, keeps
 * animals out of the opening seconds, teaches each thing before it can hurt (the watching water, the tide, the shut shrine, each new
 * animal), lays both halves of a pair or neither, costs a life in water (warned first on Easy) and lands soft in mud, and hands its
 * props to the engine; the rolls differ (the inspector's action 3-grams, 0.35+ apart).
 */
import '../../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, MODEL_TYPICAL, modelStage } from '../../stageTime.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { Difficulty } from '../../difficulty.ts';
import { buildGen2Stage, checkStage, layLocal, planBudget, rngFor } from '../pipeline.ts';
import type { Gen2Stage } from '../types.ts';
import { pickRoute } from '../../../../tools/inspect/eraRoll.ts';
import { actionTokens, cosine, deadTime, EASY_GAP, NORMAL_GAP, profile } from '../../../../tools/inspect/analyze.ts';
import {
  MEET_LEAD,
  W6_CREATURES,
  W6_GEN2_STAGES,
  W6_LESSON,
  W6_MANIFEST,
  W6_PROP,
  W6_PROPS,
  W6_SOFT_STAGES,
  W6_TIPS,
  w6Finish,
  w6Kit,
  w6Manifest,
  type W6Extras,
} from './w6.ts';
import { W6_GROUND_SECTIONS, W6_MUD_GAPS, W6_THEME } from './w6Ground.ts';

const LEVELS = generateAllLevels();
const cfgOf = (id: string) => LEVELS.find((c) => c.id === id)!;
const STAGES = ['6-2', '6-4', '6-5', '6-9'] as const;
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const cache = new Map<string, Gen2Stage>();
const build = (id: string, seed: number, difficulty: Difficulty) => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) {
    const config = cfgOf(id);
    cache.set(k, w6Finish(buildGen2Stage({ config, kit: w6Kit(config.miniIndex), seed, difficulty })));
  }
  return cache.get(k)!;
};
const each = (f: (id: string, seed: number, difficulty: Difficulty) => void) => {
  for (const id of STAGES) for (const difficulty of ['normal', 'easy'] as const) for (const seed of SEEDS) f(id, seed, difficulty);
};
const gen2Of = (st: Gen2Stage) => ((st.proto as { gen2?: Record<string, unknown> }).gen2 ?? {}) as { w6?: W6Extras; waterWarnings?: unknown[] };
const w6Of = (st: Gen2Stage) => gen2Of(st).w6 ?? ({} as W6Extras);
const hintX = (st: Gen2Stage, text: string) => st.proto.hints.filter((h) => h.text === text).map((h) => h.x);

test('the manifest: ids unique, every socket asks for something the world has, every section laid in its own space', () => {
  const ids = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(ids(W6_PROPS) && ids(W6_CREATURES) && ids(W6_GROUND_SECTIONS));
  const tags = new Set([...W6_PROPS.flatMap((p) => p.tags), ...W6_PROPS.map((p) => p.id)]);
  const creatures = new Set(W6_CREATURES.flatMap((c) => [c.id, ...(c.tags ?? [])]));
  const themes = new Set<string>(Object.values(W6_THEME));
  const taughtBy = new Set(W6_GROUND_SECTIONS.flatMap((s) => (s.teaches ? [s.teaches] : [])));
  const budget = planBudget(cfgOf('6-5'), W6_MANIFEST, 'normal');
  for (const s of W6_GROUND_SECTIONS) {
    const L = layLocal(s, budget, rngFor(3));
    const keys = new Set(L.pieces.map((p) => p.key));
    for (const k of L.sockets) {
      assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      if (k.role === 'prop' || k.role === 'receptor') assert.ok(k.allow!.some((a) => tags.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'enemy') assert.ok(k.allow!.length && k.allow!.every((a) => creatures.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'receptor') assert.ok(L.sockets.some((q) => q.id === k.link && q.role === 'source'), `${s.id}.${k.id} has its source`);
      if (k.role === 'tip') assert.ok(W6_TIPS[k.allow![0]], `${s.id}.${k.id}: Dot has a line for ${k.allow![0]}`);
    }
    // (a theme a section uses is opened by some gate)
    for (const m of s.uses ?? []) if (themes.has(m)) assert.ok(taughtBy.has(m), `${s.id} uses ${m}, which no gate opens`);
    assert.ok(!s.room && !s.pieces.some((p) => p.style === 'ruin'), `${s.id}: no room here, nothing crumbles`);
    assert.ok(L.width >= 600 && L.width <= 1800, `${s.id}: ${L.width} px (a section is a few seconds of play)`);
    if (!L.mirrored) assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
    // (a section that climbs or drops is never flipped: flipped, its way up becomes a way down)
    if (s.exitDy !== 0) assert.equal(s.mirrorable, false, s.id);
  }
  assert.ok(W6_GROUND_SECTIONS.length >= 15);
  // the world's falls are soft; the creeks are water except in the mud stages; a wide or second-jump gap is never water
  const wet = (s: { pieces: Array<{ key: string; place: object }> }) => s.pieces.filter((p) => (p.place as { water?: boolean }).water).map((p) => p.key);
  for (const s of W6_GROUND_SECTIONS) for (const k of W6_MUD_GAPS[s.id] ?? []) assert.ok(!wet(s).includes(k), `${s.id}.${k}: a wide gap over water`);
  assert.equal(W6_MANIFEST.pit, 'soft');
  for (const id of W6_GEN2_STAGES) {
    const n = Number(id.split('-')[1]);
    const creeks = w6Manifest(n).sections.flatMap(wet);
    assert.ok(W6_SOFT_STAGES.includes(n) ? creeks.length === 0 : creeks.length > 0, `${id}: ${creeks.length} creek pieces`);
  }
});

test('6-2, 6-4, 6-5 and 6-9 on 20 rolls, Normal and Easy: every roll passes the check and is long enough', () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const b = st.gen2.budget;
    assert.deepEqual(checkStage(st, b).errors, [], `${id} ${difficulty} ${seed}`);
    const fast = modelStage(st, MODEL_FAST).total;
    assert.ok(fast >= b.seconds.fastFloor && fast >= 120, `${id} ${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
    if (difficulty === 'normal') {
      const typical = modelStage(st, MODEL_TYPICAL).total;
      assert.ok(typical >= b.seconds.target * 0.98, `${id} ${seed}: typical ${typical.toFixed(0)} s`);
    }
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), 'nothing crumbles');
  });
});

test('Easy is the same stage as Normal under kinder rules: the same sections, never more animals, 60% over the rolls', () => {
  for (const id of STAGES) {
    let easy = 0;
    let normal = 0;
    for (const seed of SEEDS) {
      const n = build(id, seed, 'normal');
      const e = build(id, seed, 'easy');
      assert.deepEqual(e.gen2.sections.map((s) => [s.template, s.mirrored]), n.gen2.sections.map((s) => [s.template, s.mirrored]), `${id} ${seed}`);
      assert.ok(e.enemies.length <= n.enemies.length, `${id} ${seed}: Easy ${e.enemies.length}, Normal ${n.enemies.length}`);
      easy += e.enemies.length;
      normal += n.enemies.length;
    }
    assert.ok(easy <= normal * 0.8, `${id}: Easy ${easy} animals over the rolls, Normal ${normal}`);
  }
  // the purge and the gauntlet lay their goal + 2 (Easy: easyMode's 60% + 2) before the shrine
  for (const id of ['6-5', '6-9']) {
    for (const seed of SEEDS) {
      for (const d of ['normal', 'easy'] as const) {
        const st = build(id, seed, d);
        const before = st.enemies.filter((e) => e.x <= st.exitTotemX - 200).length;
        assert.ok(before >= st.gen2.budget.quota.check, `${id} ${d} ${seed}: ${before} animals for a goal of ${st.gen2.budget.quota.check}`);
      }
    }
  }
});

test('teaching: no animal in the opening seconds, and each thing is taught before it can hurt', () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const tag = `${id} ${difficulty} ${seed}`;
    const firstFoe = Math.min(...st.enemies.map((e) => e.patrolMinX));
    assert.ok(firstFoe > st.spawnX + 5 * st.gen2.budget.walkSpeed - 60, `${tag}: an animal ${firstFoe - st.spawnX} px in`);
    // each new animal: Dot's line MEET_LEAD px before the first of its kind (said once)
    for (const kind of ['caiman', 'frog', 'tayra', 'harpy']) {
      const xs = st.enemies.filter((e) => e.type === kind).map((e) => e.patrolMinX);
      const said = hintX(st, W6_TIPS[kind]);
      if (!xs.length) continue;
      assert.equal(said.length, 1, `${tag}: Dot's ${kind} line said ${said.length} times`);
      assert.ok(said[0] <= Math.min(...xs) - 300, `${tag}: the ${kind} line at ${said[0]}, the first ${kind} at ${Math.min(...xs)}`);
    }
    // the stage's own thing: its gate comes first and says the line before any of it
    const gate = st.gen2.sections[0].template;
    if (id === '6-2') {
      assert.match(gate, /^w6-watch-gate-/, tag);
      const [x] = hintX(st, W6_TIPS[W6_LESSON.watch]);
      const zones = st.proto.watch ?? [];
      assert.ok(zones.length >= 6, `${tag}: ${zones.length} watched stretches`);
      assert.ok(x !== undefined && x < Math.min(...zones.map((z) => z.x0)), `${tag}: the watch taught at ${x}`);
      // (the first pass is the lesson's long calm, and every watched stretch has a root to hide in)
      assert.ok(zones[0].calm[0] >= 9, tag);
      for (const z of zones) assert.ok((st.proto.bushes ?? []).some((b) => b.x + b.w > z.x0 && b.x < z.x1), `${tag}: no root in the watch at ${z.x0}`);
    }
    if (id === '6-4') {
      assert.match(gate, /^w6-tide-gate-/, tag);
      const [x] = hintX(st, W6_TIPS[W6_LESSON.tide]);
      const tides = (st.zones ?? []).filter((z) => z.kind === 'tide');
      assert.ok(tides.length >= 6, `${tag}: ${tides.length} mudflats`);
      assert.ok(x !== undefined && x < Math.min(...tides.map((z) => z.x0)), `${tag}: the tide taught at ${x}`);
    }
    if (id === '6-5' || id === '6-9') {
      assert.match(gate, id === '6-5' ? /^w6-hunt-gate-/ : /^w6-fight-gate-/, tag);
      const [x] = hintX(st, W6_TIPS[id === '6-5' ? W6_LESSON.hunt : W6_LESSON.fight]);
      assert.ok(x !== undefined && x < firstFoe, `${tag}: the shut shrine explained at ${x}, the first animal at ${firstFoe}`);
    }
    // every section that uses a theme comes after the gate that opened it
    const taught = new Set<string>();
    for (const s of st.gen2.sections) {
      const t = W6_GROUND_SECTIONS.find((q) => q.id === s.template)!;
      for (const m of t.uses ?? []) assert.ok(taught.has(m) || Object.keys(W6_MANIFEST.lessons!).includes(m), `${tag}: ${t.id} uses ${m} untaught`);
      if (t.teaches) taught.add(t.teaches);
    }
  });
});

test('the creeks cost a life (warned first on Easy), every other fall lands soft; the tides and props reach the engine', () => {
  const creeks = new Map<string, number>();
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const tag = `${id} ${difficulty} ${seed}`;
    const soft = W6_SOFT_STAGES.includes(st.config.miniIndex);
    const falls = [...(st.gen2.falls ?? [])].sort((a, c) => a.x0 - c.x0);
    const water = falls.filter((f) => f.kind === 'water');
    // (Matt's rule: on land a fall is soft, on Easy and Normal; only the creeks are water)
    assert.ok(falls.every((f) => f.kind === 'soft' || f.kind === 'water'), tag);
    if (soft) assert.equal(water.length, 0, `${tag}: water in a mud stage`);
    else {
      if (water.length) assert.ok(st.waterY !== undefined, `${tag}: creeks but no water line`);
      creeks.set(id, (creeks.get(id) ?? 0) + water.length);
      // (Normal at the first water; Easy again at a water gap 12 s of walking past the last warning: types.ts WATER_WARN)
      const signs = (gen2Of(st).waterWarnings ?? []).length;
      const normalSigns = (gen2Of(build(id, seed, 'normal')).waterWarnings ?? []).length;
      const due = water.length ? 1 : 0;
      assert.ok(difficulty === 'easy' ? signs >= normalSigns && signs >= due : signs === due, `${tag}: ${signs} water warnings, ${water.length} creeks`);
      // over water: no glide trap (two creeks within the leaf's reach, ~457 px: the route glides there and a first-timer who has not
      // been told to glide drowns), no flag within 150 px before a creek (every respawn there went straight back in)
      for (let i = 0; i + 1 < water.length; i++) assert.ok(water[i + 1].x1 - water[i].x0 > 470, `${tag}: a glide trap at ${water[i].x0}`);
      for (const c of st.checkpoints ?? []) assert.ok(!water.some((f) => f.x0 - c.x >= 0 && f.x0 - c.x < 150), `${tag}: the flag at ${c.x} stands at a creek`);
      // (a creek is a third of a jump: STAGE-RULES §6)
      for (const f of water) assert.ok(f.x1 - f.x0 <= 62, `${tag}: a creek ${f.x1 - f.x0} px wide at ${f.x0}`);
    }
    // (the opening: the gate has no gap at all)
    const gate = st.gen2.sections[0];
    assert.ok(!falls.some((f) => f.x0 < gate.x1), `${tag}: a gap in ${gate.template}`);
    // every mudflat section lays its tide (the section's zone), its low water outlasting the walk across, its post beside it
    const tides = (st.zones ?? []).filter((z) => z.kind === 'tide');
    const want = st.gen2.sections.reduce((k, s) => k + (W6_GROUND_SECTIONS.find((q) => q.id === s.template)!.zones?.length ?? 0), 0);
    assert.equal(tides.length, want, tag);
    for (const z of tides) assert.ok(z.period - z.warn - z.active >= (z.x1 - z.x0) / (285 * 0.78 * 0.8) + 1, `${tag}: a tide too quick for its mud`);
    if (id === '6-4') assert.ok(tides.length >= 6, `${tag}: ${tides.length} mudflats`);
    const w6 = w6Of(st);
    const n = (k: string) => st.gen2.fills.filter((f) => f.what === k && f.role === 'prop').length;
    assert.equal(w6.posts?.length ?? 0, n(W6_PROP.tidePost), tag);
    assert.ok(n(W6_PROP.tidePost) >= Math.min(tides.length, 1), `${tag}: no tide post`);
    assert.equal(st.proto.bushes?.length ?? 0, n(W6_PROP.rootHide) + n(W6_PROP.reedHide), tag);
    assert.ok((w6.decor?.length ?? 0) > 40, tag);
    // nothing stands in a tide, and every animal keeps to its patch
    for (const e of st.enemies) {
      assert.ok(e.edgeMinX === e.patrolMinX && e.edgeMaxX === e.patrolMaxX, tag);
      assert.ok(!tides.some((z) => e.x > z.x0 && e.x < z.x1 && e.y > z.top && e.y < z.bottom), `${tag}: an animal in the tide`);
    }
  });
  // (the water stages have creeks: a few a roll in a knee-root theme, many in the pools)
  for (const [id, k] of creeks) assert.ok(k >= SEEDS.length * 2 * 3, `${id}: ${k} creeks over the rolls`);
  // calling w6Finish again changes nothing
  const st = build('6-5', 1, 'normal');
  const before = JSON.stringify(st.proto.hints);
  w6Finish(st);
  assert.equal(JSON.stringify(st.proto.hints), before);
});

test('the inspector on 20 rolls: no quiet stretch over 4 s, under a fifth quiet, 2:00+ for its quick player, and the rolls differ (0.35+)', () => {
  for (const id of STAGES) {
    const profs: Array<ReturnType<typeof profile>> = [];
    for (const seed of SEEDS) {
      for (const difficulty of ['normal', 'easy'] as const) {
        const st = build(id, seed, difficulty);
        const tag = `${id} ${difficulty} ${seed}`;
        const R = pickRoute(st.config.objectiveType, st as never);
        const { br, samples, route } = R.used;
        assert.notEqual(route.traced, 'failed', tag);
        const dn = deadTime(br.beats, br.total, difficulty === 'easy' ? EASY_GAP : NORMAL_GAP, samples);
        const longest = Math.max(0, ...dn.list.map((d) => d.counted));
        assert.ok(longest <= 4, `${tag}: ${longest.toFixed(1)} s quiet`);
        assert.ok(dn.total <= 0.2 * br.total, `${tag}: ${((dn.total / br.total) * 100).toFixed(0)}% quiet`);
        assert.ok(R.quick.time >= 120, `${tag}: ${R.quick.time.toFixed(0)} s for the quick player`);
        if (difficulty === 'normal') profs.push(profile(actionTokens(br.beats, br.total)));
      }
    }
    let s = 0;
    let k = 0;
    for (let i = 0; i < profs.length; i++) for (let j = i + 1; j < profs.length; j++) (s += 1 - cosine(profs[i], profs[j])), k++;
    assert.ok(s / k >= 0.35, `${id}: diversity ${(s / k).toFixed(3)}`);
  }
});

test('the kit for the other stages: 6-1, 6-3, 6-6 and 6-7 build from the ground sections alone (the swing sections join them later)', () => {
  for (const id of ['6-1', '6-3', '6-6', '6-7']) {
    const config = cfgOf(id);
    const st = w6Finish(buildGen2Stage({ config, kit: w6Kit(config.miniIndex), seed: 1, difficulty: 'normal' }));
    assert.equal(st.gen2.sections[0].template, 'w6-landing', id);
    assert.ok(!st.gen2.plan.some((p) => /tide|watch|hunt|fight/.test(p.template)), `${id}: another stage's gate or flats`);
  }
  assert.throws(() => buildGen2Stage({ config: cfgOf('6-8'), kit: w6Kit(8), seed: 1, difficulty: 'normal' }), /hand-built/);
});
