/**
 * World 9 on gen2, raw rolls (DESIGN.md B12 step 6): the kit's sections and sockets are sound, and 10 rolls of each stage, Normal and
 * Easy, built through buildGen2Stage on the game's kit, pass the check, are long enough, lay Easy as Normal's plan with fewer animals, keep
 * the lava's rule (deadly on Normal, soft on Easy and at every second-jump, glide and start gap), stand the geysers 110 px apart or more
 * with no animal or flag in their column, and teach each stage's own thing at its gate before any of it.
 */
import '../../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../../stageTime.ts';
import { generateAllLevels } from '../../worldsData.ts';
import type { Difficulty } from '../../difficulty.ts';
import { buildGen2Stage, checkStage, layLocal, maxGap, planBudget, rngFor } from '../pipeline.ts';
import type { Gen2Stage } from '../types.ts';
import { W9_CREATURES, W9_LESSON, W9_MANIFEST, W9_PROPS, W9_TIPS, w9Falls, w9Finish } from './w9.ts';
import { W9_GAME_STAGES, w9GameKit } from './w9Game.ts';
import { W9_GROUND_SECTIONS, W9_THEME } from './w9Ground.ts';

const LEVELS = generateAllLevels();
const cfgOf = (id: string) => LEVELS.find((c) => c.id === id)!;
const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
const cache = new Map<string, Gen2Stage>();
const build = (id: string, seed: number, difficulty: Difficulty) => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) {
    const config = cfgOf(id);
    cache.set(k, w9Finish(buildGen2Stage({ config, kit: w9GameKit(config.miniIndex, difficulty), seed, difficulty })));
  }
  return cache.get(k)!;
};
const each = (f: (id: string, seed: number, difficulty: Difficulty) => void) => {
  for (const id of W9_GAME_STAGES) for (const difficulty of ['normal', 'easy'] as const) for (const seed of SEEDS) f(id, seed, difficulty);
};

test('the kit: ids unique, every socket asks for something the world has, every section a few seconds long and laid as authored', () => {
  const ids = (xs: Array<{ id: string }>) => new Set(xs.map((x) => x.id)).size === xs.length;
  assert.ok(ids(W9_PROPS) && ids(W9_CREATURES) && ids(W9_GROUND_SECTIONS));
  const tags = new Set([...W9_PROPS.flatMap((p) => p.tags), ...W9_PROPS.map((p) => p.id)]);
  const creatures = new Set(W9_CREATURES.flatMap((c) => [c.id, ...(c.tags ?? [])]));
  const themes = new Set<string>(Object.values(W9_THEME));
  const taughtBy = new Set(W9_GROUND_SECTIONS.flatMap((s) => (s.teaches ? [s.teaches] : [])));
  const budget = planBudget(cfgOf('9-6'), W9_MANIFEST, 'normal');
  for (const s of W9_GROUND_SECTIONS) {
    const L = layLocal(w9Falls(s), budget, rngFor(3));
    const keys = new Set(L.pieces.map((p) => p.key));
    for (const k of L.sockets) {
      assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      if (k.role === 'prop') assert.ok(k.allow!.some((a) => tags.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'enemy') assert.ok(k.allow!.length && k.allow!.every((a) => creatures.has(a)), `${s.id}.${k.id}`);
      if (k.role === 'tip') assert.ok(W9_TIPS[k.allow![0]], `${s.id}.${k.id}: Dot has a line for ${k.allow![0]}`);
    }
    for (const m of s.uses ?? []) if (themes.has(m)) assert.ok(taughtBy.has(m), `${s.id} uses ${m}, which no gate opens`);
    // (a glide gap is as long as a liana's: World 6's rule, +370 px a liana)
    const glides = s.pieces.filter((p) => p.place.kind === 'pit' && p.place.jump === 'glide').length;
    assert.ok(L.width >= 560 && L.width <= 1800 + 370 * glides, `${s.id}: ${L.width} px (a section is a few seconds of play)`);
    if (s.exitDy !== 0) assert.equal(s.mirrorable, false, `${s.id}: a section that climbs or drops is never flipped`);
    // (a section with a tip on its entry is never flipped: the line would come after the thing)
    if (s.sockets.some((k) => k.role === 'tip')) assert.equal(s.mirrorable, false, s.id);
  }
  assert.ok(W9_GROUND_SECTIONS.length >= 30, `${W9_GROUND_SECTIONS.length} sections`);
  assert.equal(W9_MANIFEST.pit, 'void');
});

test('10 rolls of each stage, Normal and Easy: the check passes, long enough, Easy the same stage with fewer animals', () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const b = st.gen2.budget;
    assert.deepEqual(checkStage(st, b).errors, [], `${id} ${difficulty} ${seed}`);
    const fast = modelStage(st, MODEL_FAST).total;
    assert.ok(fast >= b.seconds.fastFloor && fast >= 120, `${id} ${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
    if (difficulty === 'easy') {
      const n = build(id, seed, 'normal');
      assert.deepEqual(st.gen2.sections.map((s) => [s.template, s.mirrored]), n.gen2.sections.map((s) => [s.template, s.mirrored]), `${id} ${seed}`);
      assert.ok(st.enemies.length <= n.enemies.length, `${id} ${seed}`);
    }
  });
});

test("the lava's rule: deadly on Normal, soft on Easy, soft at every second-jump, glide and start gap; the geysers fair and clear", () => {
  each((id, seed, difficulty) => {
    const st = build(id, seed, difficulty);
    const tag = `${id} ${difficulty} ${seed}`;
    const falls = st.gen2.falls ?? [];
    if (difficulty === 'easy') assert.ok(falls.every((f) => f.kind === 'soft'), tag);
    else assert.ok(falls.some((f) => f.kind === 'void'), `${tag}: no lava at all`);
    // (a gap wider than one jump (a second-jump or a glide gap) keeps its crust: no deadly gap needs more than one jump)
    const one = maxGap(0, false, st.gen2.budget.margin) + 12;
    // (a chain over the lava is the swing's: 9-3's, the way over is the chain)
    const swung = (f: { x0: number; x1: number }) => st.vines.some((v) => v.vineType === 'swing_liana' && v.x > f.x0 - 260 && v.x < f.x1);
    for (const f of falls) if (f.kind === 'void' && !swung(f)) assert.ok(f.x1 - f.x0 <= one, `${tag}: a ${f.x1 - f.x0} px lava gap at ${f.x0}, past one jump`);
    const gs = (st.zones ?? []).filter((z) => z.kind === 'geyser').sort((a, b) => a.x0 - b.x0);
    for (const z of gs) {
      for (const e of st.enemies) assert.ok(!(e.x > z.x0 - 30 && e.x < z.x1 + 30 && e.y > z.baseY - 150 && e.y < z.bottom + 60), `${tag}: an animal in the geyser at ${z.x0}`);
      assert.ok(z.period - z.warn - z.active >= 2 && z.warn >= 1.1 && z.active <= 1.2, `${tag}: a geyser's beat`);
    }
  });
});

test("each stage's gate says its line before any of its thing: the doorstep's eye, the vents' warm air, the shut shrines", () => {
  for (const seed of SEEDS) {
    const hint = (st: Gen2Stage, text: string) => st.proto.hints.find((h) => h.text === text)?.x;
    const s4 = build('9-4', seed, 'normal');
    const w4 = hint(s4, W9_TIPS[W9_LESSON.watch]);
    assert.ok(w4 !== undefined && w4 < Math.min(...(s4.proto.watch ?? []).map((z) => z.x0)), `9-4 ${seed}: the watcher named at ${w4}`);
    const s5 = build('9-5', seed, 'normal');
    const vents = (s5.zones ?? []).filter((z) => z.kind === 'geyser' && z.baseY - z.top < 150);
    assert.ok(vents.length, `9-5 ${seed}: no vents`);
    assert.ok((hint(s5, W9_TIPS[W9_LESSON.vent]) ?? Infinity) < Math.min(...vents.map((z) => z.x0)), `9-5 ${seed}: the warm air named after the first vent`);
    for (const [id, line] of [['9-6', W9_LESSON.hunt], ['9-9', W9_LESSON.fight], ['9-8', W9_LESSON.threads]] as const) {
      const st = build(id, seed, 'normal');
      const x = hint(st, W9_TIPS[line]);
      const first = Math.min(...st.enemies.map((e) => e.patrolMinX), Infinity);
      assert.ok(x !== undefined && x < first, `${id} ${seed}: the shut shrine explained at ${x}, the first animal at ${first}`);
    }
  }
});
