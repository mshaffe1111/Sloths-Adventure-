/**
 * The gen2 pipeline on a tiny test world: four toy sections (a meadow rest, stumps, a pit hop with a spider, and a puzzle-kit carry
 * room). Every stage it builds passes levelCheck (with puzzleCheck through it) on several seeds, is the same for the same seed,
 * differs across seeds, keeps its jumps inside the difficulty's envelope, and plays as long as the time model asks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { fastFloor, MODEL_FAST, MODEL_TYPICAL, modelStage, targetSeconds } from '../stageTime.ts';
import { bandFor, buildGen2Stage, difficultyScore, layLocal, maxGap, placeRoom, planBudget, rngFor, STAGE_HEAT } from './pipeline.ts';
import { cfg, kit, manifest, pitHop } from './toyWorld.ts';
import { MARGIN } from './types.ts';

const SEEDS = [1, 2, 3, 4, 5];
const sig = (st: ReturnType<typeof buildGen2Stage>) => st.platforms.map((p) => `${p.x},${p.y},${p.width}`).join(';');

test('every seed builds a stage that passes levelCheck (and its puzzle room passes puzzleCheck)', () => {
  for (const seed of SEEDS) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    const res = validateStage(st);
    assert.deepEqual(res.errors, [], `seed ${seed}: ${res.errors.join('; ')}`);
    assert.ok(st.gen2.sections.length > 8, `seed ${seed}: only ${st.gen2.sections.length} sections`);
  }
});

test('the same seed gives the same stage; different seeds give different stages', () => {
  const a = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed: 7, difficulty: 'normal' });
  const b = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed: 7, difficulty: 'normal' });
  assert.equal(sig(a), sig(b));
  assert.deepEqual(a.gen2.sections, b.gen2.sections);
  assert.deepEqual(a.enemies.map((e) => [e.x, e.patrolMinX]), b.enemies.map((e) => [e.x, e.patrolMinX]));
  const sigs = new Set(SEEDS.map((seed) => sig(buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' }))));
  assert.equal(sigs.size, SEEDS.length);
  const orders = new Set(SEEDS.map((seed) => buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' }).gen2.sections.map((s) => s.template).join(',')));
  assert.ok(orders.size >= 3, 'the section order changes with the seed');
});

test('it is as long as the time model asks (at least 2 minutes for the quick player), by construction and checked after', () => {
  for (const seed of [1, 2, 3]) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    const t = modelStage(st, MODEL_TYPICAL).total;
    const f = modelStage(st, MODEL_FAST).total;
    assert.ok(t >= targetSeconds(5, 7, 'stealth'), `seed ${seed}: typical ${t.toFixed(0)} s`);
    assert.ok(f >= fastFloor(5, 7, 'stealth') && f >= 95, `seed ${seed}: fast ${f.toFixed(0)} s`);
  }
});

test('Easy and Normal share the layout seed: the same sections in the same order, Easy with narrower jumps and wider landings', () => {
  for (const seed of [1, 2, 3]) {
    const n = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    const e = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'easy' });
    assert.deepEqual(e.gen2.sections.map((s) => [s.template, s.mirrored]), n.gen2.sections.map((s) => [s.template, s.mirrored]));
    assert.deepEqual(validateStage(e).errors, []);
    assert.ok(e.gen2.budget.margin === MARGIN.easy && n.gen2.budget.margin === MARGIN.normal);
    assert.ok(e.enemies.length < n.enemies.length, `seed ${seed}: Easy ${e.enemies.length} animals, Normal ${n.enemies.length}`);
    // Easy drops the cakes (a hazard prop on an `easy: 'drop'` socket)
    assert.ok(!e.gen2.fills.some((f) => f.what === 'cake'));
  }
  // the pit hop's jump, Easy against Normal, from the same roll: never wider than the margin allows, and its landing wider
  const nb = planBudget(cfg('5-7', 'stealth'), manifest, 'normal');
  const eb = planBudget(cfg('5-7', 'stealth'), manifest, 'easy');
  const ln = layLocal(pitHop, nb, rngFor(9));
  const le = layLocal(pitHop, eb, rngFor(9));
  const wn = ln.gaps[0].x1 - ln.gaps[0].x0;
  const we = le.gaps[0].x1 - le.gaps[0].x0;
  assert.ok(wn <= maxGap(0, false, MARGIN.normal) + 1 && we <= maxGap(0, false, MARGIN.easy) + 1 && we < wn);
  assert.ok(le.pieces.find((p) => p.key === 'far')!.w > ln.pieces.find((p) => p.key === 'far')!.w);
});

test('teaching and the opening seconds: nothing hurts early, and the spider tip comes before the first spider', () => {
  for (const seed of SEEDS) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    const first = Math.min(...st.enemies.map((e) => e.patrolMinX));
    assert.ok(first > st.spawnX + 5 * 185, `seed ${seed}: an animal ${first - st.spawnX} px in`);
    const tip = st.proto.hints.find((h) => h.text.startsWith('A spider'));
    if (st.enemies.length) assert.ok(tip && tip.x < first, `seed ${seed}: the tip comes first`);
    assert.ok(st.gen2.sections.filter((s) => s.template === 'toy-carry').length <= 1);
  }
});

test('a harvest lays enough flowers for its goal; a hand-built stage is refused', () => {
  const st = buildGen2Stage({ config: cfg('5-3', 'harvest', 40), kit, seed: 3, difficulty: 'normal' });
  assert.deepEqual(validateStage(st).errors, []);
  assert.ok(st.collectibles.filter((c) => c.type === 'flower').length >= 60);
  assert.throws(() => buildGen2Stage({ config: cfg('5-6', 'relic_hunt'), kit, seed: 1, difficulty: 'normal' }), /hand-built/);
});

test('the difficulty bands climb world by world and every stage stays inside its own band', () => {
  for (let w = 1; w <= 9; w++) {
    const [lo, hi] = bandFor(w);
    const [lo2, hi2] = bandFor(w + 1);
    assert.ok(lo2 > lo && hi2 > hi && lo2 < hi, 'they overlap a little');
    assert.ok((lo2 + hi2) / 2 > hi, "the next world's middle is above this world's top");
    for (let s = 1; s <= 9; s++) {
      const d = difficultyScore(w, s);
      assert.ok(d >= lo && d <= hi);
    }
    assert.ok(difficultyScore(w + 1, 1) < difficultyScore(w, 9), "a world's first stage sits just under the last of the one before");
  }
  assert.equal(STAGE_HEAT.length, 9);
});

test('linked pairs are both or neither (A7), props go through the world emitter, the room is placed on the stitched platforms', () => {
  let pairs = 0;
  for (const seed of SEEDS) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    for (const s of st.gen2.sections) {
      const bell = st.gen2.fills.find((f) => f.section === s.uid && f.socket === 'bell');
      const pile = st.gen2.fills.find((f) => f.section === s.uid && f.socket === 'pile');
      if (!bell && !pile) continue;
      assert.equal(!!bell?.what, !!pile?.what, `seed ${seed} ${s.uid}: a source without its receptor`);
      if (bell?.what) pairs++;
    }
    const chairs = st.gen2.fills.filter((f) => f.what === 'chair').length;
    assert.equal(((st.proto as { gen2?: { chairs?: unknown[] } }).gen2?.chairs ?? []).length, chairs);
    for (const room of st.kit?.rooms ?? []) {
      const ids = new Set(st.platforms.map((p) => p.id));
      assert.ok(ids.has(room.left.on) && ids.has(room.beyond.on) && room.ground.every((g) => ids.has(g)));
      assert.match(room.exit, /^s\d+-gate$/);
    }
  }
  assert.ok(pairs > 0, 'some rolls lay the pair');
  // a room's wires follow its renamed pieces
  const r = placeRoom(
    { id: 'r', left: { on: 'a', at: 0 }, right: { on: 'a', at: 1 }, above: 1, below: 1, exit: 'g', beyond: { on: 'a', at: 1 }, ground: ['a'], pieces: [{ kind: 'gate', id: 'g', at: { on: 'a', at: 0.5 }, open: { all: ['p', { not: 'q' }] } }] },
    's9',
    () => 42,
  );
  assert.deepEqual((r.pieces[0] as { open: unknown }).open, { all: ['s9-p', { not: 's9-q' }] });
  assert.equal(r.left.on, 42);
});

test('local repair before a re-roll: a section that cannot be crossed is swapped at its slot', () => {
  // a broken section: its far bank sits far above any jump (a template mistake the repair must route around)
  const broken = {
    ...pitHop, id: 'toy-broken', teaches: undefined, uses: undefined, weight: 50, phases: ['sho' as const, 'ten' as const],
    pieces: [pitHop.pieces[0], { key: 'far', shape: 'bank' as const, w: 600, main: true, place: { kind: 'over' as const, on: 'near', at: 1, dy: -400 } }],
    exit: { piece: 'far', kind: 'ground' as const }, sockets: [],
  };
  const k2 = { ...kit, manifest: { ...manifest, corridor: { ...manifest.corridor, top: 0 }, sections: [...manifest.sections, broken] } };
  const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k2, seed: 2, difficulty: 'normal' });
  assert.deepEqual(validateStage(st).errors, []);
  assert.ok(st.gen2.repairs.some((r) => r.kind === 'swap'), JSON.stringify(st.gen2.repairs));
  assert.ok(!st.gen2.sections.some((s) => s.template === 'toy-broken'));
});
