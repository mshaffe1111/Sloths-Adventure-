/**
 * The gen2 pipeline on a tiny test world: four toy sections (a meadow rest, stumps, a pit hop with a spider, and a puzzle-kit carry
 * room). Every stage it builds passes levelCheck (with puzzleCheck through it) on several seeds, is the same for the same seed,
 * differs across seeds, keeps its jumps inside the difficulty's envelope, and plays as long as the time model asks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { fastFloor, MODEL_FAST, MODEL_TYPICAL, modelStage, targetSeconds } from '../stageTime.ts';
import { bandFor, buildGen2Stage, checkStage, chooseVersions, difficultyScore, growPlan, layLocal, maxGap, missionGraph, PIT, pitSteps, placeRoom, planBudget, riseLimit, QUICK, rngFor, STAGE_HEAT, THEME, trimPlan, lianaRelease } from './pipeline.ts';
import { cfg, kit, manifest, meadow, pitHop, stumps } from './toyWorld.ts';
import { LIANA, MARGIN, TIDE, versionKey, WATER_LINE, WATER_WARN, type LocalRoomSpec, type SectionTemplate, type WorldKit } from './types.ts';
import { WorldOnce } from './variety.ts';
import { addKitPlatforms } from '../puzzleKit.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { tideCrossTime, idleTime } from '../zones.ts';
import { findRoute, type Route } from '../../../tools/inspect/route.ts';
import { inspectJumps, KID } from '../../../tools/inspect/jumps.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';
import { actionTokens, cosine, profile } from '../../../tools/inspect/analyze.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { Platform } from '../types.ts';

test("a section's teapot room keeps its basket and its trough through placeRoom, and passes puzzleCheck", () => {
  // (Meeca's tea room, meecaStage.ts, as a section's room on its own pieces by key: the pot pours down the trough into the basket,
  // the basket raises the lift, and the Butler's arch is the wall the lift climbs over)
  const G = 580;
  const P: Platform[] = [
    { id: 11, x: 0, y: G, width: 590, height: 90, type: 'solid' },
    { id: 12, x: 590, y: G + 60, width: 110, height: 90, type: 'solid' },
    { id: 13, x: 700, y: G, width: 500, height: 90, type: 'solid' },
  ];
  const ids: Record<string, number> = { floor: 11, well: 12, floor2: 13 };
  const at = (on: string, x: number, dy?: number) => {
    const p = P.find((q) => q.id === ids[on])!;
    return { on, at: (x - p.x) / p.width, ...(dy ? { dy } : {}) };
  };
  const local: LocalRoomSpec = {
    id: 'tea',
    left: at('floor', 180), right: at('floor2', 820), above: 420, below: 90,
    pieces: [
      { kind: 'reset', id: 'post', at: at('floor', 200) },
      { kind: 'basket', id: 'basket', at: at('floor', 370), mouth: 110, need: 1, drop: 70 },
      { kind: 'teapot', id: 'pot', at: at('floor', 545, -110), into: 'basket', trough: [at('floor', 460, -122), at('floor', 378, -116)] },
      { kind: 'lift', id: 'lift', at: { on: 'well', at: 0.5, dy: -60 }, w: 110, rise: 250, by: 'basket' },
      { kind: 'gate', id: 'butler', at: at('floor2', 750), open: { any: [] }, h: 250, look: 'butler' },
    ],
    exit: 'lift',
    beyond: at('floor2', 860),
    ground: ['floor', 'well'],
  };
  const room = placeRoom(local, 's11', (k) => ids[k]);
  const pot = room.pieces.find((p) => p.kind === 'teapot') as Extract<(typeof room.pieces)[number], { kind: 'teapot' }>;
  assert.equal(pot.into, 's11-basket');
  assert.deepEqual(pot.trough!.map((a) => a.on), [11, 11]);
  const kitX = { rooms: [room] };
  addKitPlatforms(P, kitX);
  const st = {
    config: { ...cfg('5-9', 'sprint'), levelWidth: 1200 }, trees: [], platforms: P, vines: [], ropes: [], enemies: [], boss: null,
    collectibles: [{ id: 1, type: 'exit_totem', x: 1100, y: G - 30, collected: false, bobPhase: 0 }],
    spawnX: 60, spawnY: G, exitTotemX: 1100, exitTotemY: G, kit: kitX,
  } as GeneratedStage;
  assert.deepEqual(validateStage(st).errors, []);
  // (and the room really is the way on: without its teapot it cannot be opened)
  st.kit!.rooms[0].pieces = st.kit!.rooms[0].pieces.filter((p) => p.kind !== 'teapot');
  assert.match(validateStage(st).errors.join('\n'), /room s11-tea/);
});

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

const fnv = (s: string) => {
  let a = 2166136261;
  for (let i = 0; i < s.length; i++) a = Math.imul(a ^ s.charCodeAt(i), 16777619) >>> 0;
  return a.toString(16);
};

test("a world with no sub-blocks lays exactly what it laid before sub-blocks came in (the curated seeds' geometry holds)", () => {
  // (if a change to passes 1-3 means to move these, the curated seeds in gen2/seeds.ts must be curated again: say so in its commit.
  // Moved since: 2026-10-28's pit steps (pitSteps), which re-laid every soft pit's floor and steps and nothing else; then QUICK's
  // fast floor, which grew seeds 1 and 2 by a section before the shrine)
  const want: Record<number, string> = { 1: '7bb5ab7a', 2: 'adef3f92', 3: '1e084cdd' };
  for (const seed of [1, 2, 3]) {
    const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    assert.equal(fnv(st.platforms.map((p) => `${p.x},${p.y},${p.width},${p.height}`).join(';')), want[seed], `seed ${seed}`);
  }
});

test('Easy rolls every socket the way Normal does (the same chance per socket, the same props), only its rules differ', () => {
  for (const seed of [1, 2, 3]) {
    const n = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    const e = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'easy' });
    const keyed = (st: typeof n, role: string) => st.gen2.fills.filter((f) => f.role === role && f.what && f.what !== 'cake').map((f) => `${f.section}/${f.socket}=${f.what}`).sort();
    for (const role of ['pickup', 'prop', 'source', 'receptor']) assert.deepEqual(keyed(e, role), keyed(n, role), `seed ${seed} ${role}`);
  }
});

/** a section with one sub-block of three versions; the section's far bank refers to the sub-block's `mid` (laid before it) */
const garden: SectionTemplate = {
  id: 'toy-garden',
  name: 'garden',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  weight: 3,
  pieces: [
    { key: 'bank', shape: 'bank', w: [300, 400], place: { kind: 'start' } },
    { key: 'far', shape: 'bank', w: [400, 500], place: { kind: 'walk', after: 'mid' } },
  ],
  subBlocks: [
    {
      id: 'middle',
      versions: [
        { id: 'flat', pieces: [{ key: 'mid', shape: 'bank', w: [300, 400], place: { kind: 'walk', after: 'bank' } }], sockets: [{ id: 'm', role: 'pickup', on: 'mid', t: 0.5, dn: 34 }] },
        {
          id: 'stump',
          pieces: [
            { key: 'mid', shape: 'bank', w: [300, 400], place: { kind: 'walk', after: 'bank' } },
            { key: 'st', shape: 'block', w: 140, place: { kind: 'on', on: 'mid', at: 0.5, h: [50, 70] } },
          ],
          sockets: [{ id: 'm', role: 'pickup', on: 'st', t: 0.5, dn: 34 }],
        },
        { id: 'pit', pieces: [{ key: 'mid', shape: 'bank', w: [300, 400], place: { kind: 'pit', after: 'bank', jump: 'jump' }, landing: true }] },
      ],
    },
  ],
  entry: { piece: 'bank', kind: 'ground' },
  exit: { piece: 'far', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  mirrorable: true,
};
const gardenKit: WorldKit = { ...kit, manifest: { ...manifest, sections: [...manifest.sections, garden] } };

test('sub-blocks: one version rolled per use, every version taking its turn before one comes back, Easy laying Normal\'s', () => {
  for (const seed of [1, 2, 3]) {
    const n = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: gardenKit, seed, difficulty: 'normal' });
    assert.deepEqual(validateStage(n).errors, [], `seed ${seed}`);
    const uses = n.gen2.plan.filter((p) => p.template === 'toy-garden').map((p) => p.versions!.middle);
    assert.ok(uses.length >= 3, `seed ${seed}: the garden was used ${uses.length} times`);
    // (WorldOnce: the first three uses are the three versions, and the rotation goes on in turn)
    assert.deepEqual([...uses.slice(0, 3)].sort(), ['flat', 'pit', 'stump']);
    for (let i = 3; i < uses.length; i++) assert.equal(uses[i], uses[i - 3]);
    const e = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: gardenKit, seed, difficulty: 'easy' });
    assert.deepEqual(e.gen2.plan.map((p) => p.versions ?? null), n.gen2.plan.map((p) => p.versions ?? null));
    assert.deepEqual(validateStage(e).errors, [], `seed ${seed} easy`);
  }
  // the versions the world's earlier stages used wait their turn
  const st = buildGen2Stage({
    config: cfg('5-7', 'stealth'), kit: gardenKit, seed: 1, difficulty: 'normal',
    usedVersions: [versionKey('toy-garden', 'middle', 'flat'), versionKey('toy-garden', 'middle', 'stump')],
  });
  assert.equal(st.gen2.plan.find((p) => p.template === 'toy-garden')!.versions!.middle, 'pit');
  // a version is laid with its own pieces and sockets, the section's piece after it follows it, and Easy widens its landing
  const nb = planBudget(cfg('5-7', 'stealth'), manifest, 'normal');
  const eb = planBudget(cfg('5-7', 'stealth'), manifest, 'easy');
  const L = layLocal(garden, nb, rngFor(4), false, { versions: { middle: 'stump' } });
  const mid = L.pieces.find((p) => p.key === 'mid')!;
  const far = L.pieces.find((p) => p.key === 'far')!;
  assert.ok(L.pieces.some((p) => p.key === 'st') && far.x === mid.x + mid.w && L.sockets.some((s) => s.on === 'st'));
  const lp = layLocal(garden, nb, rngFor(4), false, { versions: { middle: 'pit' } });
  const le = layLocal(garden, eb, rngFor(4), false, { versions: { middle: 'pit' } });
  assert.ok(lp.gaps.length === 1 && le.pieces.find((p) => p.key === 'mid')!.w > lp.pieces.find((p) => p.key === 'mid')!.w);
  // a mistake in a version is named
  const bad: SectionTemplate = { ...garden, subBlocks: [{ id: 'middle', versions: [{ id: 'oops', pieces: [] }] }] };
  assert.throws(() => layLocal(bad, nb, rngFor(1)), /far refers to mid, which is never laid/);
  assert.throws(() => chooseVersions(garden, rngFor(1), new WorldOnce<string>(), { middle: 'nope' }), /no version nope/);
  // a section with no sub-blocks draws nothing for them
  assert.deepEqual(chooseVersions(pitHop, () => assert.fail('drew a number')), {});
});

test("water on Easy (Matt, 2026-10-28): land falls are soft on Easy, water still costs a life there, and it is warned first", () => {
  // the pit rule by world and difficulty
  const pitOf = (pit: 'soft' | 'water' | 'void', d: 'easy' | 'normal') => planBudget(cfg('5-7', 'stealth'), { ...manifest, pit }, d).pit;
  assert.equal(pitOf('void', 'easy'), 'soft');
  assert.equal(pitOf('void', 'normal'), 'void');
  assert.equal(pitOf('soft', 'easy'), 'soft');
  assert.equal(pitOf('water', 'easy'), 'water');
  assert.equal(pitOf('water', 'normal'), 'water');
  const wet: WorldKit = { ...kit, manifest: { ...manifest, pit: 'water' } };
  const walk = planBudget(cfg('5-7', 'stealth'), manifest, 'easy').walkSpeed;
  for (const seed of [1, 2, 3]) {
    for (const d of ['easy', 'normal'] as const) {
      const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: wet, seed, difficulty: d });
      assert.deepEqual(validateStage(st).errors, [], `seed ${seed} ${d}`);
      assert.ok(st.waterY !== undefined, 'the water is there');
      const falls = (st.gen2.falls ?? []).filter((f) => f.x1 - f.x0 >= 20);
      assert.ok(falls.length > 3 && falls.every((f) => f.kind === 'water'));
      // nothing under the water gaps: no soft floor laid on either difficulty
      for (const f of falls) assert.ok(!st.platforms.some((p) => p.x >= f.x0 && p.x + p.width <= f.x1 && p.y > f.y + 60), `seed ${seed} ${d}: a floor in the water at ${f.x0}`);
      const warns = st.proto.hints.filter((h) => h.text === WATER_LINE);
      const signs = ((st.proto as { gen2?: { waterWarnings?: unknown[] } }).gen2?.waterWarnings ?? []).length;
      assert.equal(signs, warns.length, 'a sign at the edge with every warning');
      assert.ok(warns[0].x < falls[0].x0 && warns[0].passX! > falls[0].x1, 'the first water is warned before it');
      if (d === 'normal') assert.equal(warns.length, 1, 'Normal warns once');
      else {
        assert.ok(warns.length >= 2, `seed ${seed}: Easy warned ${warns.length} times`);
        for (const f of falls) {
          const before = warns.filter((h) => h.x < f.x0);
          assert.ok(before.length && f.x0 - before.at(-1)!.x <= WATER_WARN.every * walk + WATER_WARN.lead + 1, `seed ${seed}: water at ${f.x0} without a recent warning`);
        }
      }
    }
  }
});

test("a purge or gauntlet lays its goal's animals: the top-up, Poisson-spaced, never early nor at a flag; Easy held to easyMode's goal", () => {
  // a gauntlet stub world: the toy world's spider and a sleeping one, both for the top-up, and a spawn hook that keeps the sleepers
  // the way World 5's code would (proto.w5.spiders with doze)
  const sleeper = { ...manifest.creatures[0], id: 'sleeper', tags: ['topup', 'sleeper'] };
  const stub: WorldKit = {
    ...kit,
    manifest: { ...manifest, creatures: [{ ...manifest.creatures[0], tags: ['topup'] }, sleeper] },
    spawn: (e, c, out) => {
      if (c.tags?.includes('sleeper')) ((out.extras.sleepers ??= []) as number[]).push(e.id);
    },
  };
  const OPEN = 5 * 185;
  for (const [k, id, type, goal] of [[stub, '5-9', 'gauntlet', 26], [kit, '5-4', 'purge', 12]] as const) {
    for (const seed of [1, 2, 3]) {
      for (const d of ['normal', 'easy'] as const) {
        const st = buildGen2Stage({ config: cfg(id, type, goal), kit: k, seed, difficulty: d });
        const check = d === 'easy' ? Math.round(goal * 0.6) : goal;
        const what = `${id} seed ${seed} ${d}`;
        assert.equal(st.config.targetCount, goal, `${what}: the goal stays the designed one`);
        assert.equal(st.gen2.budget.quota.check, check);
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], what);
        const before = st.enemies.filter((e) => e.x <= st.exitTotemX - 200);
        assert.ok(before.length >= check + 2, `${what}: ${before.length} animals for a goal of ${check}`);
        assert.ok(st.enemies.every((e) => e.patrolMinX > st.spawnX + OPEN), `${what}: an animal in the opening seconds`);
        const tops = st.gen2.fills.filter((f) => f.socket === 'topup');
        for (const f of tops) {
          assert.ok(!(st.checkpoints ?? []).some((c) => f.x <= c.x && c.x - f.x < 400), `${what}: a top-up right before a flag at ${f.x}`);
          const sec = st.gen2.sections.find((s) => s.uid === f.section)!;
          assert.ok(sec.phase !== 'rest' && sec.phase !== 'start' && sec.phase !== 'goal' && sec.template !== 'toy-carry');
        }
        // (Poisson: any two animals at least 120 px apart)
        const xs = [...st.enemies].sort((a, b) => a.x - b.x);
        for (let i = 1; i < xs.length; i++) assert.ok(xs[i].x - xs[i - 1].x >= 120, `${what}: animals at ${xs[i - 1].x} and ${xs[i].x}`);
        if (k === stub) {
          const sleepers = ((st.proto as { gen2?: { sleepers?: number[] } }).gen2?.sleepers ?? []).length;
          assert.ok(sleepers > 0 && sleepers < st.enemies.length, `${what}: sleepers and spiders both (${sleepers} of ${st.enemies.length})`);
        }
      }
    }
  }
  // Easy's stage is held to Easy's goal: against Normal's it may well be short (it lays for 16 + 2, not 26 + 2)
  const e = buildGen2Stage({ config: cfg('5-9', 'gauntlet', 26), kit: stub, seed: 1, difficulty: 'easy' });
  if (e.enemies.length < 26) assert.match(validateStage(e).errors.join('\n'), /not enough enemies/);
});

test('the length loop converges: every roll lands in its window (or ships long, said so), and Easy\'s quick player makes the floor', () => {
  const tgt = targetSeconds(5, 7, 'stealth');
  const max = Math.min(tgt * 1.1, 295);
  for (let seed = 1; seed <= 20; seed++) {
    const n = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'normal' });
    const e = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed, difficulty: 'easy' });
    const t = modelStage(n, MODEL_TYPICAL).total;
    const long = n.gen2.repairs.some((r) => /ships long/.test(r.note));
    assert.ok(t >= tgt && (t <= max || long), `seed ${seed}: typical ${t.toFixed(0)} s outside [${tgt}, ${max.toFixed(0)}]`);
    assert.ok(modelStage(n, MODEL_FAST).total >= fastFloor(5, 7, 'stealth'), `seed ${seed}: Normal quick`);
    assert.ok(modelStage(e, MODEL_FAST).total >= fastFloor(5, 7, 'stealth'), `seed ${seed}: Easy quick ${modelStage(e, MODEL_FAST).total.toFixed(0)} s`);
    // (and the inspector's quick player, what curation measures, is over 2:00 on both: QUICK)
    for (const st of [n, e]) {
      const q = pickRoute('stealth', st).quick.time;
      assert.ok(q >= QUICK.seconds, `seed ${seed} ${st.gen2.budget.difficulty}: the inspector's quick player ${q.toFixed(0)} s`);
      assert.ok(st.gen2.budget.seconds.fastFloor * QUICK.ratio >= QUICK.seconds - 1e-9);
    }
    assert.deepEqual(e.gen2.plan.map((p) => p.template), n.gen2.plan.map((p) => p.template), `seed ${seed}: Easy lays Normal's plan`);
  }
  // a change keeps the prefix: one section added (fresh) or taken off just before the shrine's node, nothing before it moves
  const b = planBudget(cfg('5-7', 'stealth'), manifest, 'normal');
  const graph = missionGraph(b);
  const plan = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed: 4, difficulty: 'normal' }).gen2.plan;
  const goal = graph.nodes.at(-1)!.id;
  const g = growPlan(plan, graph);
  assert.equal(g.plan.length, plan.length + 1);
  assert.deepEqual(g.plan.slice(0, g.open), plan.slice(0, g.open));
  assert.equal(g.plan[g.open + 1].node, goal);
  const byId = new Map(manifest.sections.map((s) => [s.id, s]));
  const t2 = trimPlan(plan, graph, byId)!;
  const cut = t2.findIndex((p, i) => p !== plan[i]);
  assert.equal(t2.length, plan.length - 1);
  assert.ok(plan.slice(cut + 1).every((p) => p.node === goal || p.node === plan[cut].node), 'only the end is trimmed');
});

test("a soft pit's way out is one plain jump at a time onto a tread a kid's thumb lands on, at any pitDepth (the kid bot at 85%+)", () => {
  // the geometry, for every depth, width and lip height a stage lays: each rise at most a hop, each tread at least PIT.tread, room
  // to stand before the first step, the floor never deeper than asked and never above the lower lip
  for (const hop of [riseLimit(false, MARGIN.easy) * PIT.hop, riseLimit(false, MARGIN.normal) * PIT.hop]) {
    for (const depth of [40, 99, 110, 130, 200, 320]) {
      for (const w of [60, 99, 113, 145, 160, 203, 230, 400]) {
        for (const farDy of [-40, 0, 60]) {
          const lip = 580;
          const far = lip + farDy;
          const { floor, steps } = pitSteps(0, w, lip, far, depth, hop);
          const what = `hop ${hop.toFixed(0)} depth ${depth} width ${w} far ${farDy}`;
          const lower = Math.max(lip, far);
          assert.ok(floor > lower && floor <= lower + depth + 1e-6, `${what}: floor ${floor - lower} under the lower lip`);
          const tops = [floor, ...steps.map((s) => s.top), far];
          for (let i = 1; i < tops.length; i++) assert.ok(tops[i - 1] - tops[i] <= hop + 1e-6, `${what}: a rise of ${(tops[i - 1] - tops[i]).toFixed(0)}`);
          steps.forEach((s, i) => {
            const tread = (steps[i + 1]?.x ?? w) - s.x;
            assert.ok(tread >= PIT.tread - 1e-6 && s.x + s.w === w, `${what}: a ${tread.toFixed(0)} px tread`);
          });
          if (steps.length) assert.ok(steps[0].x >= PIT.floor - 1e-6, `${what}: no floor before the first step`);
          // (deep enough to need steps and wide enough for them: the full depth)
          if (w - PIT.floor >= PIT.tread * Math.ceil((lower + depth - far) / hop)) assert.ok(Math.abs(floor - lower - depth) < 1e-6, `${what}: raised`);
        }
      }
    }
  }
  // built: Easy stages with narrow pits (World 5's) and double-jump pits wide enough for steps, at several depths; the kid bot flies
  // every hop out of every pit (floor, steps, far bank) and every jump on the inspector's route
  const narrow: SectionTemplate = {
    ...pitHop, id: 'toy-narrowpit', teaches: undefined, uses: undefined, weight: 4, sockets: [],
    pieces: [pitHop.pieces[0], { ...pitHop.pieces[1], place: { kind: 'pit', after: 'near', jump: 'jump', share: [0.5, 0.9] } }],
  };
  const wide: SectionTemplate = { ...narrow, id: 'toy-widepit', pieces: [pitHop.pieces[0], { ...pitHop.pieces[1], place: { kind: 'pit', after: 'near', jump: 'double', share: [0.7, 1] } }] };
  let stepped = 0;
  for (const depth of [99, 130, 250]) {
    const k: WorldKit = { ...kit, manifest: { ...manifest, pitDepth: depth, sections: [...manifest.sections, narrow, wide] } };
    for (const seed of [1, 2]) {
      const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: 'easy' });
      const what = `depth ${depth} seed ${seed}`;
      assert.deepEqual(validateStage(st).errors, [], what);
      const segs: Route['segs'] = [];
      for (const f of st.gen2.falls ?? []) {
        if (f.x1 - f.x0 < 20) continue;
        const inside = st.platforms.filter((p) => p.x >= f.x0 && p.x + p.width <= f.x1 && p.y > f.y).sort((a, b) => b.y - a.y);
        const far = st.platforms.find((p) => p.x === f.x1 && !inside.includes(p))!;
        assert.ok(inside.length && far, `${what}: a soft floor under the pit at ${f.x0}`);
        if (inside.length > 1) stepped++;
        const chain = [...inside, far];
        for (let i = 1; i < chain.length; i++) {
          const [a, b] = [chain[i - 1], chain[i]];
          segs.push({ kind: 'hop', x0: a.x + 10, y0: a.y, x1: b.x + 30, y1: b.y, dt: 0, from: a, plat: b });
        }
      }
      const route: Route = { segs, traced: 'check', presumedHops: 0, addedLinks: 0, stops: 0, skippedStops: 0 };
      for (const r of [...inspectJumps(st, route, true, KID), ...inspectJumps(st, findRoute(st), true, KID)]) {
        if (r.rate === null) continue;
        assert.ok(r.rate >= 0.85, `${what}: the kid bot makes the jump at ${r.x} (rise ${r.rise}, landing ${r.landW} px) ${(r.rate * 100).toFixed(0)}%`);
      }
    }
  }
  assert.ok(stepped > 0, 'some pits are deep and wide enough for steps');
});

test("a prop's threat is paid from its section's threat budget like a creature's (sockets in order); no threat, nothing changes", () => {
  // a section with a teapot's socket before a spider's: a teapot that costs 3 leaves a Sho or early Ten section too little for a spider
  const kettle: SectionTemplate = {
    id: 'toy-kettle', name: 'kettle', archetypes: 'any', phases: ['sho', 'ten', 'ketsu'], difficulty: 5, weight: 3, uses: ['spider'],
    pieces: [{ key: 'bank', shape: 'bank', w: [900, 1000], place: { kind: 'start' } }],
    entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'bank', kind: 'ground' }, exitDy: 0,
    sockets: [
      { id: 'pot', role: 'prop', on: 'bank', t: 0.3, allow: ['steam'] },
      { id: 'foe', role: 'enemy', on: 'bank', t: 0.7, maxThreat: 3 },
    ],
    mirrorable: true,
  };
  const worldWith = (pot?: number, bell?: number): WorldKit => ({
    ...kit,
    manifest: {
      ...manifest,
      sections: [...manifest.sections, kettle],
      props: [
        ...manifest.props.map((p) => (p.id === 'bell' && bell !== undefined ? { ...p, threat: bell } : p)),
        { id: 'teapot', tags: ['steam'], w: 60, minApart: 300, beat: true, ...(pot !== undefined ? { threat: pot } : {}) },
      ],
    },
  });
  const build = (k: WorldKit, seed: number) => buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: 'normal' });
  const fillsOf = (st: ReturnType<typeof build>) => st.gen2.fills.map((f) => `${f.section}/${f.socket}=${f.what}`).sort();
  let lost = 0;
  for (const seed of [1, 2, 3]) {
    // (the default is 0: a world that gives no prop a threat builds exactly what it did)
    const free = build(worldWith(), seed);
    assert.deepEqual(fillsOf(build(worldWith(0, 0), seed)), fillsOf(free), `seed ${seed}: threat 0 is no threat`);
    assert.equal(sig(build(worldWith(0, 0), seed)), sig(free));
    // a prop dearer than any section's budget is never laid, and costs the creatures nothing
    const dear = build(worldWith(99, 99), seed);
    assert.ok(!dear.gen2.fills.some((f) => f.what === 'teapot' || f.what === 'bell' || f.what === 'pebbles'), `seed ${seed}: a 99-threat prop laid`);
    assert.deepEqual(dear.gen2.fills.filter((f) => f.role === 'enemy').map((f) => `${f.section}/${f.socket}=${f.what}`), free.gen2.fills.filter((f) => f.role === 'enemy').map((f) => `${f.section}/${f.socket}=${f.what}`));
    // a teapot of 3 and a bell of 1: every section holds no more threat, props and animals together, than its budget
    const paid = build(worldWith(3, 1), seed);
    assert.deepEqual(validateStage(paid).errors, [], `seed ${seed}`);
    const cost: Record<string, number> = { teapot: 3, bell: 1, spider: 2 };
    for (const s of paid.gen2.sections) {
      const spent = paid.gen2.fills.filter((f) => f.section === s.uid && f.socket !== 'topup' && f.role !== 'tip' && f.what).reduce((t, f) => t + (cost[f.what!] ?? 0), 0);
      assert.ok(spent <= paid.gen2.budget.threat * s.tension + 1e-9, `seed ${seed} ${s.uid}: ${spent} threat in a budget of ${(paid.gen2.budget.threat * s.tension).toFixed(1)}`);
    }
    // (and the teapots really spend it: kettles that hold a teapot hold fewer spiders than with a free one)
    const spiders = (st: ReturnType<typeof build>) =>
      st.gen2.fills.filter((f) => f.socket === 'foe' && f.what && st.gen2.fills.some((g) => g.section === f.section && g.socket === 'pot' && g.what === 'teapot')).length;
    lost += spiders(free) - spiders(paid);
    assert.ok(paid.gen2.fills.some((f) => f.what === 'teapot'), `seed ${seed}: no teapot laid`);
  }
  assert.ok(lost > 0, 'a teapot leaves less for the spiders');
});

test("each roll's theme favours a third to a half of a big world's sections: rolls differ more, every section still comes, no rule broken", () => {
  // a toy world grown to 31 sections (World 5's size): meadows, stump runs, pit hops and spider walks of several makes
  const big: SectionTemplate[] = [...manifest.sections];
  for (let i = 0; i < 6; i++) big.push({ ...meadow, id: `toy-meadow${i}`, pieces: [{ ...meadow.pieces[0], w: [420 + 60 * i, 560 + 60 * i] }] });
  for (let i = 0; i < 8; i++) {
    big.push({
      ...stumps, id: `toy-stumps${i}`, difficulty: 2 + (i % 4),
      pieces: [
        { ...stumps.pieces[0], w: [600 + 40 * i, 800 + 40 * i] },
        { ...stumps.pieces[1], place: { kind: 'on', on: 'bank', at: [0.1, 0.25], h: [30 + 6 * i, 50 + 6 * i] } },
        ...(i % 2 ? [] : [stumps.pieces[2]]),
      ],
      sockets: stumps.sockets.filter((k) => i % 2 === 0 || k.on !== 'b'),
    });
  }
  for (let i = 0; i < 7; i++) {
    big.push({
      ...pitHop, id: `toy-pithop${i}`, teaches: undefined, difficulty: 4 + (i % 4),
      pieces: [pitHop.pieces[0], { ...pitHop.pieces[1], place: { kind: 'pit', after: 'near', jump: i % 3 ? 'jump' : 'double', share: [0.5, 0.9] } }, ...(i % 2 ? [pitHop.pieces[2]] : [])],
      sockets: pitHop.sockets.filter((k) => k.role !== 'tip' && (i % 2 === 1 || k.on !== 'road')),
    });
  }
  for (let i = 0; i < 6; i++) {
    big.push({
      id: `toy-walk${i}`, name: 'spider walk', archetypes: 'any', phases: ['sho', 'ten', 'ketsu'], difficulty: 3 + i, uses: ['spider'],
      pieces: [{ key: 'bank', shape: 'bank', w: [700, 900], place: { kind: 'start' } }, { key: 'up', shape: 'bank', w: [400, 500], place: { kind: 'walk', after: 'bank', dy: i % 2 ? -40 : 40 } }],
      entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'up', kind: 'ground' }, exitDy: i % 2 ? -40 : 40,
      sockets: [{ id: 'foe', role: 'enemy', on: 'bank', t: 0.6, maxThreat: 3 }, { id: 'p', role: 'pickup', on: 'up', t: 0.5, dn: 34, count: 2, span: 100 }],
      mirrorable: true,
    });
  }
  assert.ok(big.length >= 30 && big.length >= THEME.from);
  const world = (themeShare?: number): WorldKit => ({ ...kit, manifest: { ...manifest, sections: big, ...(themeShare !== undefined ? { themeShare } : {}) } });
  const ROLLS = 20;
  const measure = (k: WorldKit) => {
    const mixes: Array<Map<string, number>> = [];
    const acts: Array<ReturnType<typeof profile>> = [];
    const seen = new Set<string>();
    let repeats = 0;
    for (let seed = 1; seed <= ROLLS; seed++) {
      const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: 'normal' });
      assert.deepEqual(validateStage(st).errors, [], `seed ${seed}`);
      assert.deepEqual(st.gen2.errors, [], `seed ${seed}`);
      const t = modelStage(st, MODEL_TYPICAL).total;
      assert.ok(t >= targetSeconds(5, 7, 'stealth') && modelStage(st, MODEL_FAST).total >= fastFloor(5, 7, 'stealth'), `seed ${seed}: ${t.toFixed(0)} s`);
      const m = new Map<string, number>();
      st.gen2.plan.forEach((p, i) => {
        m.set(p.template, (m.get(p.template) ?? 0) + 1);
        seen.add(p.template);
        if (i && st.gen2.plan[i - 1].template === p.template) repeats++;
      });
      mixes.push(m);
      const R = pickRoute('stealth', st).used;
      acts.push(profile(actionTokens(R.br.beats, R.br.total)));
      if (k.manifest.themeShare === undefined) {
        const n = st.gen2.theme!.length / big.length;
        assert.ok(n > 0.15 && n < 0.7, `seed ${seed}: the theme holds ${(n * 100).toFixed(0)}% of the sections`);
      } else assert.equal(st.gen2.theme, undefined);
    }
    const cos = (a: Map<string, number>, b: Map<string, number>) => {
      let d = 0, na = 0, nb = 0;
      for (const [id, v] of a) (d += v * (b.get(id) ?? 0)), (na += v * v);
      for (const v of b.values()) nb += v * v;
      return d / Math.sqrt(na * nb);
    };
    let mix = 0, act = 0, n = 0;
    for (let i = 0; i < ROLLS; i++) for (let j = i + 1; j < ROLLS; j++) (mix += 1 - cos(mixes[i], mixes[j])), (act += 1 - cosine(acts[i], acts[j])), n++;
    return { mix: mix / n, act: act / n, seen, repeats };
  };
  const all = measure(world(1));
  const themed = measure(world());
  assert.ok(themed.mix > all.mix + 0.05, `the section mix: ${themed.mix.toFixed(3)} themed against ${all.mix.toFixed(3)}`);
  assert.ok(themed.act > all.act, `the action 3-grams: ${themed.act.toFixed(3)} themed against ${all.act.toFixed(3)}`);
  // every section the stealth stage can use comes in some roll (the carry room once per stage at most; the rest are open to it)
  const usable = big.filter((t) => t.id !== 'toy-carry');
  assert.deepEqual(usable.filter((t) => !themed.seen.has(t.id)).map((t) => t.id), [], 'sections no roll used');
  // the cooldown still holds: no section twice running
  assert.equal(themed.repeats, 0);
  // a world under THEME.from sections draws from them all, as it did (the toy world's pinned geometry test holds it)
  assert.equal(buildGen2Stage({ config: cfg('5-7', 'stealth'), kit, seed: 1, difficulty: 'normal' }).gen2.theme, undefined);
});

test("Easy's animals are a subset of Normal's: the spacing is decided once, on Normal's plan, and Easy drops from that list", () => {
  const sockets = (st: ReturnType<typeof buildGen2Stage>) => st.gen2.fills.filter((f) => f.role === 'enemy' && f.socket !== 'topup').map((f) => `${f.section}/${f.socket}=${f.what}`);
  for (const [id, type, goal] of [['5-7', 'stealth', 1], ['5-4', 'purge', 12]] as const) {
    for (let seed = 1; seed <= (type === 'stealth' ? 20 : 4); seed++) {
      const n = buildGen2Stage({ config: cfg(id, type, goal), kit, seed, difficulty: 'normal' });
      const e = buildGen2Stage({ config: cfg(id, type, goal), kit, seed, difficulty: 'easy' });
      const what = `${id} seed ${seed}`;
      assert.ok(e.enemies.length <= n.enemies.length, `${what}: Easy ${e.enemies.length} animals, Normal ${n.enemies.length}`);
      const normal = new Set(sockets(n));
      assert.deepEqual(sockets(e).filter((k) => !normal.has(k)), [], `${what}: Easy keeps an animal Normal dropped`);
      assert.deepEqual(validateStage(e).errors.filter((x) => !/not enough enemies/.test(x)), [], what);
      assert.deepEqual(checkStage(e, e.gen2.budget).errors, [], what);
    }
  }
});

/** World 6's hanging pieces on the toy world: a swing over a gap (a liana and the perch it lands on) and a climb to a high ledge */
const swingSec: SectionTemplate = {
  id: 'toy-swing', name: 'swing', archetypes: 'any', phases: ['sho', 'ten', 'ketsu'], difficulty: 5, weight: 4,
  pieces: [
    { key: 'near', shape: 'bank', w: [300, 400], place: { kind: 'start' } },
    { key: 'rope', shape: 'liana', w: 0, place: { kind: 'swing', after: 'near' } },
    { key: 'far', shape: 'bank', w: [500, 700], place: { kind: 'land', after: 'rope' } },
  ],
  entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0,
  sockets: [{ id: 'p', role: 'pickup', on: 'far', t: 0.6, dn: 34 }], mirrorable: true,
};
const climbSec: SectionTemplate = {
  id: 'toy-climb', name: 'climb', archetypes: 'any', phases: ['ki', 'sho', 'ten'], difficulty: 3, weight: 3,
  pieces: [
    { key: 'bank', shape: 'bank', w: [600, 700], place: { kind: 'start' } },
    { key: 'trunk', shape: 'vine', w: 0, place: { kind: 'climb', on: 'bank', at: [0.7, 0.8], h: [240, 260] } },
    { key: 'top', shape: 'branch', w: 260, place: { kind: 'over', on: 'trunk', at: 0, dy: 0 }, main: false },
  ],
  entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'bank', kind: 'ground' }, exitDy: 0,
  sockets: [{ id: 'up', role: 'pickup', on: 'top', t: 0.6, dn: 34, count: 2, span: 100 }], mirrorable: true,
};
const hangWorld = (pit: 'soft' | 'void' = 'void', moves = [...manifest.moves, 'swing' as const, 'climb' as const]): WorldKit => ({
  ...kit, manifest: { ...manifest, pit, moves, sections: [...manifest.sections, swingSec, climbSec] },
});

test('a liana swings by itself and its perch is sized from the release window (Easy 300 ms, Normal 167 ms); a vine climbs', () => {
  // the section alone: the perch past the liana leaves at least the setting's window, and lies beyond any jump (the swing is the way)
  for (const d of ['normal', 'easy'] as const) {
    const b = planBudget(cfg('5-7', 'stealth'), hangWorld().manifest, d);
    for (let i = 1; i <= 5; i++) {
      const L = layLocal(swingSec, b, rngFor(i));
      const [near, rope, far] = ['near', 'rope', 'far'].map((k) => L.pieces.find((p) => p.key === k)!);
      const swing = rope.hang!.swing!;
      assert.ok(swing.amp >= LIANA.amp[0] && swing.amp <= LIANA.amp[1] && swing.period >= LIANA.period[0] && swing.period <= LIANA.period[1]);
      const win = lianaRelease({ x: rope.x, topY: rope.y, bottomY: rope.y + rope.h }, swing, near.y, { x: far.x, y: far.y, w: far.w });
      assert.ok(win >= LIANA.window[d], `${d} roll ${i}: a ${(win * 1000).toFixed(0)} ms release window`);
      assert.ok(far.x - (near.x + near.w) > maxGap(0, true, 1), `${d} roll ${i}: a ${far.x - near.x - near.w} px gap a jump could cross`);
      assert.equal(L.gaps.length, 1);
    }
    // (the same roll, the same liana on Easy and Normal: its swing is the stage's, only the perch moves)
    const nb = planBudget(cfg('5-7', 'stealth'), hangWorld().manifest, 'normal');
    assert.deepEqual(layLocal(swingSec, b, rngFor(7)).pieces[1].hang, layLocal(swingSec, nb, rngFor(7)).pieces[1].hang);
  }
  // built, with nothing under the gaps (a void world on Normal: the swing is the only way over) and on Easy (soft floors)
  let swings = 0;
  let climbs = 0;
  for (const seed of [1, 2, 3]) {
    for (const d of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: hangWorld(), seed, difficulty: d });
      const what = `seed ${seed} ${d}`;
      const res = validateStage(st);
      assert.deepEqual(res.errors, [], what);
      const lianas = ((st.proto as { gen2?: { lianas?: Array<{ vine: number; amp: number; period: number }> } }).gen2?.lianas ?? []);
      const placed = st.gen2.sections.filter((s) => s.template === 'toy-swing');
      assert.equal(lianas.length, placed.length, `${what}: every liana carries its swing`);
      assert.ok(placed.every((s) => !s.mirrored), `${what}: a swing is never flipped`);
      for (const l of lianas) assert.equal(st.vines.find((v) => v.id === l.vine)?.vineType, 'swing_liana');
      swings += placed.length;
      // every climb's high ledge is reached, and only a climb gets that high
      for (const v of st.vines.filter((x) => x.vineType === 'tree_climb')) {
        const top = st.platforms.find((p) => p.y === v.topY && (p.x === v.x || p.x + p.width === v.x))!;
        assert.ok(top && res.reachableIds.includes(top.id), `${what}: the ledge over the vine at ${v.x}`);
        assert.ok(v.bottomY - v.topY > DOUBLE_RISE, `${what}: a ${v.bottomY - v.topY} px climb a double jump could make`);
        climbs++;
      }
    }
  }
  assert.ok(swings > 0 && climbs > 0, `${swings} swings, ${climbs} climbs`);
  // a world whose player can't swing or climb never lays them
  const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: hangWorld('void', manifest.moves), seed: 1, difficulty: 'normal' });
  assert.ok(!st.gen2.sections.some((s) => s.template === 'toy-swing' || s.template === 'toy-climb') && st.vines.length === 0);
  // authoring mistakes are named
  const bad: SectionTemplate = { ...swingSec, pieces: [swingSec.pieces[0], { ...swingSec.pieces[2], place: { kind: 'land', after: 'near' } }] };
  assert.throws(() => layLocal(bad, planBudget(cfg('5-7', 'stealth'), hangWorld().manifest, 'normal'), rngFor(1)), /lands from near, which is not a liana/);
});

test("World 6's water: a section's water gap is water on any world and setting (a life, warned), and a tide rises over a mudflat", () => {
  const creek: SectionTemplate = {
    id: 'toy-creek', name: 'creek', archetypes: 'any', phases: ['sho', 'ten', 'ketsu'], difficulty: 5, weight: 3,
    pieces: [
      { key: 'near', shape: 'bank', w: [300, 400], place: { kind: 'start' } },
      { key: 'far', shape: 'bank', w: [500, 600], place: { kind: 'jump', after: 'near', share: [0.5, 0.7], water: true }, landing: true },
    ],
    entry: { piece: 'near', kind: 'ground' }, exit: { piece: 'far', kind: 'ground' }, exitDy: 0, sockets: [], mirrorable: true,
  };
  const marsh: SectionTemplate = {
    id: 'toy-marsh', name: 'mudflat', archetypes: 'any', phases: ['sho', 'ten'], difficulty: 4, weight: 3,
    pieces: [
      { key: 'bank', shape: 'bank', w: [300, 360], place: { kind: 'start' } },
      { key: 'mud', shape: 'bank', w: [300, 380], place: { kind: 'walk', after: 'bank', dy: 60 } },
      { key: 'out', shape: 'bank', w: [360, 420], place: { kind: 'walk', after: 'mud', dy: -60 } },
    ],
    entry: { piece: 'bank', kind: 'ground' }, exit: { piece: 'out', kind: 'ground' }, exitDy: 0,
    sockets: [{ id: 'foe', role: 'enemy', on: 'mud', t: 0.5, maxThreat: 3 }, { id: 'p', role: 'pickup', on: 'mud', t: 0.5, dn: 34, count: 3, span: 160 }],
    zones: [{ kind: 'tide', on: 'mud', low: [1, 2] }],
    mirrorable: true,
  };
  // (an emitter may lay a zone too: the toy chair lays a web patch over its spot, through the sink)
  const k: WorldKit = {
    ...kit,
    manifest: { ...manifest, sections: [...manifest.sections, creek, marsh] },
    emit: { ...kit.emit, chair: (f, _p, out) => void out.zones.push({ kind: 'web', x0: f.x - 60, x1: f.x + 60, top: f.y - 130, bottom: f.y + 16, baseY: f.y, dir: 1, period: 1, warn: 0, active: 1, offset: 0, force: 0 }) },
  };
  let creeks = 0;
  let tides = 0;
  for (const seed of [1, 2, 3]) {
    for (const d of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: cfg('5-7', 'stealth'), kit: k, seed, difficulty: d });
      const what = `seed ${seed} ${d}`;
      assert.deepEqual(validateStage(st).errors, [], what);
      const wet = st.gen2.sections.filter((s) => s.template === 'toy-creek');
      creeks += wet.length;
      const falls = st.gen2.falls ?? [];
      for (const s of wet) {
        const f = falls.find((g) => g.x0 >= s.x0 && g.x1 <= s.x1)!;
        assert.equal(f.kind, 'water', `${what}: the creek is water on a soft world`);
        // nothing under it, and the water there to fall in
        assert.ok(!st.platforms.some((p) => p.x >= f.x0 && p.x + p.width <= f.x1 && p.y > f.y), `${what}: a floor under the creek at ${f.x0}`);
        assert.ok(st.waterY !== undefined);
        const before = st.proto.hints.filter((h) => h.text === WATER_LINE && h.x < f.x0);
        if (d === 'easy') assert.ok(before.length && f.x0 - before.at(-1)!.x <= WATER_WARN.every * st.gen2.budget.walkSpeed + WATER_WARN.lead + 1, `${what}: water at ${f.x0} unwarned`);
        else assert.ok(before.length, `${what}: the first water is warned`);
      }
      // the world's own falls stay soft
      assert.ok(falls.some((g) => g.kind === 'soft' && g.x1 - g.x0 >= 20));
      // the tides: the low spell outlasts the walk across (lengthened from the section's 1-2 s), banks either side, nothing standing in it
      for (const z of (st.zones ?? []).filter((z) => z.kind === 'tide')) {
        tides++;
        assert.ok(idleTime(z) + z.warn >= tideCrossTime(z.x1 - z.x0) && idleTime(z) >= 2 && z.active <= 3 && z.warn >= 0.9, `${what}: tide at ${z.x0}`);
      }
      for (const z of st.zones ?? []) {
        assert.ok(!st.enemies.some((e) => e.x > z.x0 - 30 && e.x < z.x1 + 30 && e.y > z.top && e.y < z.bottom + 60), `${what}: an animal in the tide at ${z.x0}`);
        assert.ok(!(st.checkpoints ?? []).some((c) => c.x >= z.x0 && c.x <= z.x1 && c.y > z.top && c.y < z.bottom), `${what}: a flag in the tide`);
      }
      const chairs = st.gen2.fills.filter((f) => f.what === 'chair').length;
      assert.equal((st.zones ?? []).filter((z) => z.kind === 'web').length, chairs, `${what}: an emitter's zone reaches the stage`);
    }
  }
  assert.ok(creeks > 0 && tides > 0, `${creeks} creeks, ${tides} tides`);
});
