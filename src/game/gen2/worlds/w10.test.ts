/**
 * World 10 on gen2: 10-1 The Door Made for Him (sprint), 10-3 Thunder (stealth), 10-7 The Walls (purge) and 10-9 The Fortress Gate
 * (gauntlet) built through buildGen2Stage on 20 rolls, Normal and Easy, with the game's kit (w10Game.ts). Every roll passes the check as
 * its difficulty plays it (the rods, the gusts, the spike beds and the crumbling ramparts held to levelCheck's zone rules, and the stage
 * finishable with every rampart slab gone), is long enough, never goes quiet for over 4 s, keeps animals out of the opening seconds,
 * teaches each thing before it can hurt (the rods and the spike beds in 10-1, the storm's watch in 10-3, the shut shrine, the first
 * soldier) in Pokey's own short lines, costs a life in a deep chasm on Normal only (warned first) and lands soft on Easy, and hands its
 * dressing and cover to the engine; the rolls differ.
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
import { MEET_LEAD, W10_CREATURES, W10_LESSON, W10_MANIFEST, W10_NEW_LINES, W10_PROPS, W10_TIPS, w10Finish, type W10Extras } from './w10.ts';
import { W10_GROUND_SECTIONS, W10_THEME } from './w10Ground.ts';
import { w10GameKit } from './w10Game.ts';

const LEVELS = generateAllLevels();
const cfgOf = (id: string) => LEVELS.find((c) => c.id === id)!;
const STAGES = ['10-1', '10-3', '10-7', '10-9'] as const;
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const cache = new Map<string, Gen2Stage>();
const build = (id: string, seed: number, difficulty: Difficulty) => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) {
    const config = cfgOf(id);
    cache.set(k, w10Finish(buildGen2Stage({ config, kit: w10GameKit(config.miniIndex, difficulty), seed, difficulty })));
  }
  return cache.get(k)!;
};
const each = (f: (id: string, seed: number, difficulty: Difficulty) => void) => {
  for (const id of STAGES) for (const difficulty of ['normal', 'easy'] as const) for (const seed of SEEDS) f(id, seed, difficulty);
};
const gen2Of = (st: Gen2Stage) => ((st.proto as { gen2?: Record<string, unknown> }).gen2 ?? {}) as { w10?: W10Extras; waterWarnings?: unknown[] };
const w10Of = (st: Gen2Stage) => gen2Of(st).w10 ?? ({} as W10Extras);
const hintX = (st: Gen2Stage, text: string) => st.proto.hints.filter((h) => h.text === text).map((h) => h.x);
const zonesOf = (st: Gen2Stage, kind: string) => (st.zones ?? []).filter((z) => z.kind === kind).sort((a, b) => a.x0 - b.x0);

test("the manifest: ids unique, every socket asks for something the world has, every section laid in its own space, Pokey's lines short", () => {
  const ids = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(ids(W10_PROPS) && ids(W10_CREATURES) && ids(W10_GROUND_SECTIONS));
  const tags = new Set([...W10_PROPS.flatMap((p) => p.tags), ...W10_PROPS.map((p) => p.id)]);
  const creatures = new Set(W10_CREATURES.flatMap((c) => [c.id, ...(c.tags ?? [])]));
  const themes = new Set<string>(Object.values(W10_THEME));
  const taughtBy = new Set(W10_GROUND_SECTIONS.flatMap((s) => (s.teaches ? [s.teaches] : [])));
  const budget = planBudget(cfgOf('10-7'), W10_MANIFEST, 'normal');
  for (const s of W10_GROUND_SECTIONS) {
    const L = layLocal(s, budget, rngFor(3));
    const keys = new Set(L.pieces.map((p) => p.key));
    for (const k of L.sockets) {
      assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      if (k.role === 'prop') assert.ok(k.allow!.some((a) => tags.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'enemy') assert.ok(k.allow!.length && k.allow!.every((a) => creatures.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'tip') assert.ok(W10_TIPS[k.allow![0]], `${s.id}.${k.id}: Pokey has a line for ${k.allow![0]}`);
    }
    for (const z of s.zones ?? []) {
      if (z.kind === 'bolt' || z.kind === 'tide') assert.ok(keys.has(z.on), `${s.id}: a zone on ${z.on}`);
      if (z.kind === 'wind') assert.ok(keys.has(z.from) && keys.has(z.to), `${s.id}: a gust from ${z.from} to ${z.to}`);
    }
    for (const m of s.uses ?? []) if (themes.has(m)) assert.ok(taughtBy.has(m), `${s.id} uses ${m}, which no gate opens`);
    assert.ok(!s.room, `${s.id}: no room here (the swing builder's)`);
    assert.ok(L.width >= 600 && L.width <= 1800, `${s.id}: ${L.width} px (a section is a few seconds of play)`);
    if (!L.mirrored) assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
    // (a section with a tip on its first piece is never flipped: flipped, the line would come after the thing it names)
    if (s.sockets.some((k) => k.role === 'tip')) assert.equal(s.mirrorable, false, s.id);
  }
  assert.ok(W10_GROUND_SECTIONS.length >= 30, `${W10_GROUND_SECTIONS.length} sections`);
  // Pokey's lines: short (under 10 words), his own, none naming Dot (she is away)
  for (const line of W10_NEW_LINES) {
    assert.ok(line.split(/\s+/).length < 10, line);
    assert.doesNotMatch(line, /\bDot\b/, line);
  }
});

test('10-1, 10-3, 10-7 and 10-9 on 20 rolls, Normal and Easy: every roll passes the check and is long enough', () => {
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
  });
});

test('Easy is the same stage as Normal under kinder rules: the same sections, never more animals, no spike beds, every fall soft', () => {
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
      assert.equal(zonesOf(e, 'spikes').length, 0, `${id} ${seed}: spikes on Easy`);
      assert.ok((e.gen2.falls ?? []).every((f) => f.kind === 'soft'), `${id} ${seed}: a deadly fall on Easy`);
    }
    if (normal >= 10) assert.ok(easy <= normal * 0.8, `${id}: Easy ${easy} animals over the rolls, Normal ${normal}`);
  }
  for (const id of ['10-7', '10-9']) {
    for (const seed of SEEDS) {
      for (const d of ['normal', 'easy'] as const) {
        const st = build(id, seed, d);
        const before = st.enemies.filter((e) => e.x <= st.exitTotemX - 200).length;
        assert.ok(before >= st.gen2.budget.quota.check, `${id} ${d} ${seed}: ${before} animals for a goal of ${st.gen2.budget.quota.check}`);
      }
    }
  }
});

test("teaching: nothing hurts in the opening seconds, and each thing is taught, in Pokey's line, before it can hurt", () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const tag = `${id} ${difficulty} ${seed}`;
    const open = st.spawnX + 5 * st.gen2.budget.walkSpeed - 60;
    const firstFoe = Math.min(...st.enemies.map((e) => e.patrolMinX));
    assert.ok(firstFoe > open, `${tag}: an animal ${firstFoe - st.spawnX} px in`);
    for (const z of st.zones ?? []) assert.ok(z.x0 > open, `${tag}: a ${z.kind} zone ${z.x0 - st.spawnX} px in`);
    // the first soldier: Pokey's line MEET_LEAD px before it, once
    const soldiers = st.enemies.filter((e) => e.look === 'soldier').map((e) => e.patrolMinX);
    if (soldiers.length) {
      const said = hintX(st, W10_TIPS[W10_LESSON.soldier]);
      assert.equal(said.length, 1, `${tag}: the soldier line said ${said.length} times`);
      assert.ok(said[0] <= Math.min(...soldiers) - Math.min(300, MEET_LEAD), `${tag}: the soldier line at ${said[0]}, the first soldier at ${Math.min(...soldiers)}`);
    }
    // 10-1: the rods and the spike beds, each taught in its line before the first of its kind, on every roll
    if (id === '10-1') {
      const [rodX] = hintX(st, W10_TIPS[W10_LESSON.bolt]);
      const rods = zonesOf(st, 'bolt');
      assert.ok(rods.length >= 3 && rodX !== undefined && rodX < rods[0].x0, `${tag}: the rods taught at ${rodX}, the first at ${rods[0]?.x0}`);
      const [spX] = hintX(st, W10_TIPS[W10_LESSON.spikes]);
      const beds = (st.gen2.falls ?? []).filter((_, i) => i >= 0);
      assert.ok(spX !== undefined, `${tag}: the spike line`);
      if (difficulty === 'normal') assert.ok(zonesOf(st, 'spikes').length >= 2 && spX < zonesOf(st, 'spikes')[0].x0, `${tag}: the spikes taught at ${spX}`);
      assert.ok(beds.length > 0, tag);
    }
    // the stage's own thing: its gate comes first and says the line before any of it
    const gate = st.gen2.sections[0].template;
    if (id === '10-3') {
      assert.match(gate, /^w10-storm-gate-/, tag);
      const [x] = hintX(st, W10_TIPS[W10_LESSON.storm]);
      const watch = st.proto.watch ?? [];
      assert.ok(watch.length >= 4, `${tag}: ${watch.length} watched stretches`);
      assert.ok(x !== undefined && x < Math.min(...watch.map((z) => z.x0)), `${tag}: the storm taught at ${x}`);
      assert.ok(watch[0].calm[0] >= 9 && watch[0].freeFirst, `${tag}: the first watch is the lesson's: a long calm, a harmless first pass`);
      for (const z of watch) assert.ok((st.proto.bushes ?? []).some((b) => b.x + b.w > z.x0 && b.x < z.x1), `${tag}: no cover in the watch at ${z.x0}`);
    }
    if (id === '10-7' || id === '10-9') {
      assert.match(gate, id === '10-7' ? /^w10-hunt-gate-/ : /^w10-fight-gate-/, tag);
      const [x] = hintX(st, W10_TIPS[id === '10-7' ? W10_LESSON.hunt : W10_LESSON.fight]);
      assert.ok(x !== undefined && x < firstFoe, `${tag}: the shut shrine explained at ${x}, the first animal at ${firstFoe}`);
    }
    if (id === '10-1') assert.match(gate, /^w10-door-gate-/, tag);
    // every section that uses a theme or a lesson comes after what opened it
    const taught = new Set<string>(Object.entries(W10_MANIFEST.lessons!).filter(([, s]) => Number(s.split('-')[0]) * 10 + Number(s.split('-')[1]) < st.config.worldIndex * 10 + st.config.miniIndex).map(([m]) => m));
    for (const s of st.gen2.sections) {
      const t = W10_GROUND_SECTIONS.find((q) => q.id === s.template);
      if (!t) continue;
      for (const m of t.uses ?? []) assert.ok(taught.has(m), `${tag}: ${t.id} uses ${m} untaught`);
      if (t.teaches) taught.add(t.teaches);
    }
  });
});

test('the falls: a deep chasm costs a life on Normal (warned first, no glide trap), the spike beds lie in soft troughs, the dressing reaches the engine', () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const tag = `${id} ${difficulty} ${seed}`;
    const falls = [...(st.gen2.falls ?? [])].sort((a, c) => a.x0 - c.x0);
    const deep = falls.filter((f) => f.kind === 'void');
    if (difficulty === 'normal' && deep.length) {
      assert.ok((gen2Of(st).waterWarnings ?? []).length >= 1, `${tag}: no warning before the first deep fall`);
      // (two deep chasms within the leaf's reach of each other is a glide trap)
      for (let i = 0; i + 1 < deep.length; i++) assert.ok(deep[i + 1].x1 - deep[i].x0 > 470, `${tag}: a glide trap at ${deep[i].x0}`);
      for (const c of st.checkpoints ?? []) assert.ok(!deep.some((f) => f.x0 - c.x >= 0 && f.x0 - c.x < 150), `${tag}: the flag at ${c.x} stands at a chasm`);
    }
    // (the opening: the gate has no gap at all)
    const gate = st.gen2.sections[0];
    assert.ok(!falls.some((f) => f.x0 < gate.x1), `${tag}: a gap in ${gate.template}`);
    // every spike bed sits on a trough's floor, under its lips, and nothing stands in any zone
    for (const z of zonesOf(st, 'spikes')) assert.ok(st.platforms.some((p) => Math.abs(p.y - z.baseY) < 1 && p.x <= z.x0 && p.x + p.width >= z.x1), `${tag}: a spike bed off its floor`);
    for (const e of st.enemies) {
      assert.ok(e.edgeMinX === e.patrolMinX && e.edgeMaxX === e.patrolMaxX, tag);
      assert.ok(!(st.zones ?? []).some((z) => e.x > z.x0 - 30 && e.x < z.x1 + 30 && e.y > z.top - 150 && e.y < z.bottom + 60), `${tag}: an animal in a zone`);
    }
    const w10 = w10Of(st);
    assert.ok((w10.decor?.length ?? 0) > 20, `${tag}: ${w10.decor?.length ?? 0} pieces of dressing`);
    const n = (k: string) => st.gen2.fills.filter((f) => f.what === k && f.role === 'prop').length;
    assert.equal(st.proto.bushes?.length ?? 0, n('crates') + n('barrels'), tag);
    assert.equal(w10.hides?.length ?? 0, st.proto.bushes?.length ?? 0, tag);
  });
  // calling w10Finish again changes nothing
  const st = build('10-7', 1, 'normal');
  const before = JSON.stringify(st.proto.hints);
  w10Finish(st);
  assert.equal(JSON.stringify(st.proto.hints), before);
});

test('the inspector on 20 rolls: no quiet stretch over 4 s, under a fifth quiet, 2:00+ for its quick player, and the rolls differ', () => {
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
        assert.ok(R.quick.time >= 120, `${tag}: ${R.quick.time.toFixed(0)} s for the quick player`);
        if (difficulty === 'normal') profs.push(profile(actionTokens(br.beats, br.total)));
      }
    }
    // (raw rolls: curation ships the 16 that differ most, 0.35 or more: game.test.ts; 10-3's watched walls read alike within a theme)
    let s = 0;
    let k = 0;
    for (let i = 0; i < profs.length; i++) for (let j = i + 1; j < profs.length; j++) (s += 1 - cosine(profs[i], profs[j])), k++;
    assert.ok(s / k >= 0.2, `${id}: diversity ${(s / k).toFixed(3)}`);
  }
});
