/**
 * The gen2 hook-up (DESIGN.md B10 piece G, gen2/game.ts): 5-7 and 5-9 are built by the new generator through the game's own entry
 * (generateStage on the difficulty played, then withGoals and, on Easy, easyStage), one of the 16 curated rolls per layout number;
 * every shipped roll, on both difficulties, passes the stage checker and the Easy hold check as it is played; Easy is not softened
 * twice; the layout memory never deals the roll just played; the old generator has no 5-7 or 5-9 left.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { generateStage, setLayoutVariant, type GeneratedStage } from '../stageGenerator.ts';
import { easyStage } from '../easyMode.ts';
import { withGoals } from '../goals.ts';
import { easyHoldCheck, validateStage } from '../levelCheck.ts';
import { LEVEL_ATTEMPTS } from '../levelSeeds.ts';
import { forgetLayout, lastLayout, layoutForEntry, savedLayout } from '../layoutMemory.ts';
import { stageSheets } from '../stageSheets.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { LevelConfig } from '../types.ts';
import { GEN2_STAGES, gen2SeedFor, gen2SeedIndex, gen2Water, isGen2Stage } from './game.ts';
import { buildGen2Stage, FLAG_SPAN } from './pipeline.ts';
import { GEN2_SEEDS } from './seeds.ts';
import type { Gen2Stage } from './types.ts';
import { W6_ROOM_STAGES } from './worlds/w6.ts';

const levels = generateAllLevels();
const lv = (id: string): LevelConfig => ({ ...levels.find((l) => l.id === id)!, unlocked: true });
type Played = GeneratedStage & { gen2?: Gen2Stage['gen2']; proto?: Gen2Stage['proto'] };

/** the stage as the engine builds it on entry (engine.ts): the layout number, then the build on the difficulty, the goals, Easy */
function played(id: string, variant: number, easy: boolean): Played {
  setLayoutVariant(variant);
  try {
    const st = withGoals(generateStage(lv(id), easy ? 'easy' : 'normal'));
    return (easy ? easyStage(st) : st) as Played;
  } finally {
    setLayoutVariant(null);
  }
}

test('gen2 builds 5-7, 5-9 and World 6 but 6-8 (5-8 and 6-8 stay the old way), each from the kit its 16 shipped rolls were curated on', () => {
  assert.deepEqual(Object.keys(GEN2_STAGES).sort(), ['5-7', '5-9', '6-1', '6-2', '6-3', '6-4', '6-5', '6-6', '6-7', '6-9']);
  assert.equal(isGen2Stage(lv('5-8')), false);
  assert.equal(isGen2Stage(lv('6-8')), false);
  for (const id of Object.keys(GEN2_STAGES)) {
    const e = GEN2_SEEDS[id];
    assert.ok(e, `${id}: no curated rolls in seeds.ts`);
    assert.equal(e.seeds.length, 16, `${id}: 16 shipped rolls (Matt, 2026-10-28)`);
    assert.equal(e.kit, GEN2_STAGES[id].kitName, `${id}: the game's kit is the one the rolls were curated on`);
    assert.ok(e.diversity.shipped >= 0.35, `${id}: the shipped rolls differ (${e.diversity.shipped})`);
    // (the old generator's path is gone: new replaces old)
    assert.equal(LEVEL_ATTEMPTS[id], undefined, `${id}: the old generator's seed is deleted`);
  }
});

test('the layout number picks a shipped roll: the same number the same stage, the 16 numbers in a row all 16 rolls', () => {
  for (const id of Object.keys(GEN2_STAGES)) {
    const seen = new Set<number>();
    for (let v = 1000; v < 1016; v++) seen.add(gen2SeedFor(id, v).seed);
    assert.equal(seen.size, 16, `${id}: 16 numbers in a row deal every roll`);
    const a = played(id, 77, false);
    const b = played(id, 77, false);
    assert.equal(JSON.stringify(a.platforms), JSON.stringify(b.platforms), `${id}: a retry keeps the roll`);
    assert.equal(a.gen2!.seed, gen2SeedFor(id, 77).layoutSeed, `${id}: it is the roll the curation checked`);
  }
});

test('every shipped roll, Normal and Easy, as the game plays it: the checker passes, Easy needs no full hold, the goal is fair', () => {
  for (const id of Object.keys(GEN2_STAGES)) {
    const n = GEN2_SEEDS[id].seeds.length;
    for (let i = 0; i < n; i++) {
      for (const easy of [false, true]) {
        const st = played(id, i, easy);
        const at = `${id} roll ${i} (${easy ? 'Easy' : 'Normal'})`;
        assert.equal(gen2SeedIndex(id, i), i);
        assert.equal(st.gen2!.budget.difficulty, easy ? 'easy' : 'normal', at);
        assert.deepEqual(validateStage(st).errors, [], at);
        if (easy) assert.deepEqual(easyHoldCheck(st), [], `${at}: a ~70% hold finishes it`);
        if (st.config.worldIndex === 5) assert.ok(st.proto?.w5, `${at}: World 5's extras reach the engine`);
        if (st.config.worldIndex === 6) assert.ok((st.proto?.gen2 as { w6?: unknown } | undefined)?.w6, `${at}: World 6's extras reach the engine`);
        // (a gauntlet's goal: Normal's share of what the stage holds, Easy's lower; every animal it counts stands before the shrine)
        if (st.config.objectiveType === 'gauntlet') {
          const before = st.enemies.filter((e) => e.x <= st.exitTotemX + 35).length;
          assert.ok(st.config.targetCount <= before, `${at}: goal ${st.config.targetCount}, ${before} animals before the shrine`);
          assert.ok(st.config.targetCount <= Math.round(before * 0.8), `${at}: the goal asks for at most 80% of the animals`);
          // (Easy's goal as the kid first-timer measured it: game.ts easyGoal)
          if (easy && GEN2_STAGES[id].easyGoal !== undefined) assert.equal(st.config.targetCount, GEN2_STAGES[id].easyGoal, `${at}: Easy's measured goal`);
        }
        // (never more than FLAG_SPAN.max px between flags, the start and the shrine: pipeline.ts; a heart by every second flag, and on
        // Easy by every flag)
        const cps = [...(st.checkpoints ?? [])].sort((p, q) => p.x - q.x);
        let prev = st.spawnX;
        for (const c of [...cps, { x: st.exitTotemX }]) { assert.ok(c.x - prev <= FLAG_SPAN.max, `${at}: ${c.x - prev} px with no flag`); prev = c.x; }
        const heartBy = (c: { x: number; y: number }) => st.collectibles.some((h) => h.type === 'heart' && Math.abs(h.x - c.x) < 260 && Math.abs(h.y - c.y) < 260);
        cps.forEach((c, k) => (easy || k % 2 === 1) && assert.ok(heartBy(c), `${at}: no heart by the flag at ${c.x}`));
      }
    }
  }
});

test('Easy is not softened twice: easyStage leaves gen2\'s animals and ledges as the pipeline laid them, and keeps the goal and hearts', () => {
  for (const id of Object.keys(GEN2_STAGES)) {
    setLayoutVariant(3);
    const raw = withGoals(generateStage(lv(id), 'easy')) as Played;
    const normal = withGoals(generateStage(lv(id), 'normal')) as Played;
    setLayoutVariant(null);
    const enemies = raw.enemies.map((e) => `${e.type}@${e.x}:${e.attackCooldown}`);
    const platforms = raw.platforms.length;
    const goal = raw.easyGoal;
    const st = easyStage(raw) as Played;
    assert.deepEqual(st.enemies.map((e) => `${e.type}@${e.x}:${e.attackCooldown}`), enemies, `${id}: no animal cut, no second longer tell`);
    assert.ok(st.platforms.length >= platforms && st.platforms.length <= platforms + 2, `${id}: no stones laid over gen2's Easy jumps`);
    // (a swing stage holds a handful of animals: Easy keeps the first of each kind, so it can hold as many)
    if (normal.enemies.length >= 6) assert.ok(st.enemies.length < normal.enemies.length, `${id}: Easy holds fewer animals than Normal (the pipeline's share)`);
    else assert.ok(st.enemies.length <= normal.enemies.length, `${id}: Easy never holds more animals than Normal`);
    if (goal !== undefined) assert.equal(st.config.targetCount, goal, `${id}: Easy's own goal`);
    // a gen2 stage built for Normal cannot be made Easy afterwards: it is built again for Easy
    assert.throws(() => easyStage(normal), /built for Normal/);
  }
});

test('the layout memory: a retry keeps the roll, and after a clear the next roll is never the roll just played', () => {
  const m = new Map<string, string>();
  const mem = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
  let a = 11;
  const roll = () => (a = (a * 48271) % 2147483647) % 1_000_000 + 1;
  for (const id of Object.keys(GEN2_STAGES)) {
    for (let round = 0; round < 40; round++) {
      const before = layoutForEntry(lv(id), mem, roll, false)!;
      assert.equal(layoutForEntry(lv(id), mem, roll, false), before, `${id}: a retry keeps the roll`);
      forgetLayout(id, mem);
      assert.equal(lastLayout(id, mem), before);
      assert.equal(savedLayout(id, mem), null);
      const next = layoutForEntry(lv(id), mem, roll, false)!;
      assert.notEqual(gen2SeedIndex(id, next), gen2SeedIndex(id, before), `${id}: the roll just played came back`);
      forgetLayout(id, mem);
    }
  }
});

test("a gen2 stage loads World 5's sheets before it starts: the kit, its dressing, the spiders, and 5-9's puzzle pieces", () => {
  const on = { hand: true, paint: true, ctest: false };
  assert.deepEqual(stageSheets(lv('5-7'), on), ['kit:1', 'kit:5', 'w5-props', 'foe:spider', 'perch']);
  assert.deepEqual(stageSheets(lv('5-9'), on), ['kit:1', 'kit:5', 'w5-props', 'foe:spider', 'kit-pieces', 'perch']);
  // (with or without the hand-built switch: gen2 is the only 5-7 there is)
  assert.deepEqual(stageSheets(lv('5-7'), { ...on, hand: false }), stageSheets(lv('5-7'), on));
});

test("a World 6 gen2 stage loads World 6's kit, the kit pieces for its room, and its water's signs and painted water", () => {
  const on = { hand: true, paint: true, ctest: false };
  for (const id of Object.keys(GEN2_STAGES).filter((k) => k.startsWith('6-'))) {
    const sheets = stageSheets(lv(id), on);
    assert.deepEqual(sheets.slice(0, 2), ['kit:1', 'kit:6'], id);
    assert.equal(sheets.includes('kit-pieces'), (W6_ROOM_STAGES as readonly string[]).includes(id), `${id}: the kit pieces exactly when it has a room`);
    // (the water signs and the dirty, fast water have sheets of their own: stageSheets.ts water-signs, bad-water)
    assert.equal(sheets.includes('water-signs'), gen2Water(id), `${id}: the water signs exactly when it has water`);
    assert.equal(sheets.includes('bad-water'), gen2Water(id), `${id}: the dirty water exactly when it has water`);
    assert.deepEqual(stageSheets(lv(id), { ...on, hand: false }), sheets, `${id}: whatever the hand-built switch`);
  }
});

test('every shipped roll holds the clip-sheet animals its sheet list loads, and a water sign exactly where there is water', () => {
  const on = { hand: true, paint: true, ctest: false };
  for (const id of Object.keys(GEN2_STAGES)) {
    const anims = stageSheets(lv(id), on).filter((k) => k.startsWith('anim:')).map((k) => k.slice(5));
    for (let i = 0; i < GEN2_SEEDS[id].seeds.length; i += 5) {
      const st = played(id, i, false);
      // (World 5: the jumping spiders in every roll; a sheet listed is an animal the roll holds)
      if (id.startsWith('5-')) assert.ok(st.enemies.some((e) => e.type === 'spider'), `${id} roll ${i}: spiders`);
      for (const a of anims) assert.ok(st.enemies.some((e) => e.type === a), `${id} roll ${i}: no ${a} for its sheet`);
      // (World 5's pits are soft: no water. World 6's creeks: a sign at the first, Dot's line before it)
      const water = (st.gen2?.falls ?? []).some((f) => f.kind === 'water');
      assert.equal(st.waterY !== undefined, water, `${id} roll ${i}: the water line`);
      assert.equal((st.proto?.gen2?.waterWarnings?.length ?? 0) > 0, water, `${id} roll ${i}: the water signs`);
    }
  }
});

test('the pipeline\'s flags: on 30 raw rolls of each gen2 stage, Normal and Easy, never more than FLAG_SPAN.max px without one, and every flag clear of the animals', () => {
  for (const id of Object.keys(GEN2_STAGES)) {
    for (let seed = 1; seed <= 30; seed++) {
      for (const difficulty of ['normal', 'easy'] as const) {
        const st = buildGen2Stage({ config: lv(id), kit: GEN2_STAGES[id].kit(difficulty), seed, difficulty });
        const xs = [st.spawnX, ...(st.checkpoints ?? []).map((c) => c.x).sort((p, q) => p - q), st.exitTotemX];
        for (let k = 1; k < xs.length; k++) assert.ok(xs[k] - xs[k - 1] <= FLAG_SPAN.max, `${id} seed ${seed} ${difficulty}: ${xs[k] - xs[k - 1]} px from ${xs[k - 1]} with no flag`);
        assert.deepEqual(validateStage(st).errors.filter((e) => /safe spot|flag|checkpoint/.test(e)), [], `${id} seed ${seed} ${difficulty}`);
      }
    }
  }
});
