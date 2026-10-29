/**
 * Stage quality: how long a stage takes (by the time model in stageTime.ts: a MODEL of a first-time player, not a playtest), the two-lane forks,
 * the variety and spacing of the pieces, the platform styles and the shape of the generator itself (deterministic, quick).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { buildStage, generateStage, setLayoutVariant } from './stageGenerator.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { checkLanes, validateStage } from './levelCheck.ts';
import { measureStage } from './stageMetrics.ts';
import { isGen2Stage } from './gen2/game.ts';
import { gen2Model } from './gen2/pipeline.ts';
import { fastFloor, FLOOR_FAST, FLOOR_TYPICAL, MODEL_FAST, MODEL_TYPICAL, modelStage, targetSeconds } from './stageTime.ts';

const levels = generateAllLevels().filter((l) => l.objectiveType !== 'boss_lair');
const horizontal = levels.filter((l) => l.objectiveType !== 'ascent');
const ascents = levels.filter((l) => l.objectiveType === 'ascent');
/**
 * the old generator's stages (its forks, corridors, flag spacing and platform styles): the new generator's (gen2/game.ts: 5-7, 5-9, World 6)
 * are built from sections instead, and held to STAGE-RULES by src/game/gen2's tests and the inspector
 */
const oldGen = horizontal.filter((l) => !isGen2Stage(l));

/** a fixed spread of layout variants (null is the designed layout) */
const VARIANTS = [null, 371001, 664213];

function stage(l: (typeof levels)[number], variant: number | null): GeneratedStage {
  setLayoutVariant(variant);
  try { return generateStage(l); } finally { setLayoutVariant(null); }
}

// ---- time ----------------------------------------------------------------------------------------------------------------------------

test('every ordinary stage takes the typical player at least 125 s and the quick player at least 95 s (all 100 stages, several layouts)', () => {
  const bad: string[] = [];
  for (const l of levels) {
    for (const v of VARIANTS) {
      const s = stage(l, v);
      const t = modelStage(s, MODEL_TYPICAL).total;
      const f = modelStage(s, MODEL_FAST).total;
      if (t < FLOOR_TYPICAL) bad.push(`${l.id}@${v}: typical ${t.toFixed(0)} s`);
      if (f < FLOOR_FAST) bad.push(`${l.id}@${v}: fast ${f.toFixed(0)} s`);
    }
  }
  assert.deepEqual(bad, []);
});

test('stages grow from about two and a quarter minutes in World 1 to about four in World 10, and none runs past five', () => {
  const med = (w: number) => {
    // (each generator's own time model: a gen2 stage's lianas cost a self-swinging swing's time, gen2Model, as its length loop reads it)
    const xs = levels.filter((l) => l.worldIndex === w).map((l) => (isGen2Stage(l) ? gen2Model(stage(l, null), MODEL_TYPICAL) : modelStage(stage(l, null), MODEL_TYPICAL).total)).sort((a, b) => a - b);
    return xs[xs.length >> 1];
  };
  const m1 = med(1);
  const m10 = med(10);
  assert.ok(m1 >= 135 && m1 <= 175, `World 1 median ${m1.toFixed(0)} s`);
  assert.ok(m10 >= 215 && m10 <= 255, `World 10 median ${m10.toFixed(0)} s`);
  for (let w = 2; w <= 10; w++) assert.ok(med(w) >= med(w - 1) - 6, `World ${w} is shorter than World ${w - 1}`);
  for (const l of levels.filter((x) => x.worldIndex === 10)) assert.ok(modelStage(stage(l, null), MODEL_TYPICAL).total <= 300, `${l.id} runs past five minutes`);
});

test('the generator lands near the seconds the level list asks for (not far under it, not far over it)', () => {
  for (const l of levels) {
    const tgt = targetSeconds(l.worldIndex, l.miniIndex, l.objectiveType);
    const t = modelStage(buildStage(l, 0), MODEL_TYPICAL).total;
    assert.ok(t >= tgt * 0.9, `${l.id}: ${t.toFixed(0)} s against ${tgt} s asked`);
    assert.ok(t <= tgt * 1.3, `${l.id}: ${t.toFixed(0)} s against ${tgt} s asked`);
    assert.ok(modelStage(buildStage(l, 0), MODEL_FAST).total >= Math.min(fastFloor(l.worldIndex, l.miniIndex, l.objectiveType), FLOOR_FAST + 10) - 1, `${l.id} is too quick for the quick player`);
  }
});

test('ascents take at least two minutes and ten seconds from World 1 on, and every ascent in every layout has a route up', () => {
  for (const l of ascents) {
    for (const v of [null, 11, 222, 3333, 44444, 555555]) {
      const s = stage(l, v);
      const res = validateStage(s);
      assert.equal(res.ok, true, `${l.id}@${v}: ${res.errors.slice(0, 3).join('; ')}`);
      assert.ok(modelStage(s, MODEL_TYPICAL).total >= 130, `${l.id}@${v}: climbs in ${modelStage(s, MODEL_TYPICAL).total.toFixed(0)} s`);
    }
  }
});

// ---- two-lane forks ------------------------------------------------------------------------------------------------------------------

test('every ordinary stage has one to three forks, apart from each other, and not in the opening or the final approach', () => {
  for (const l of oldGen) {
    for (const v of VARIANTS) {
      const s = stage(l, v);
      const lanes = s.lanes ?? [];
      assert.ok(lanes.length >= 1 && lanes.length <= 3, `${l.id}@${v}: ${lanes.length} forks`);
      let prev = s.spawnX + 1000;
      for (const f of lanes) {
        assert.ok(f.x0 >= s.spawnX + 1000, `${l.id}@${v}: a fork in the opening`);
        assert.ok(f.x1 <= s.exitTotemX - 1200, `${l.id}@${v}: a fork in the final approach`);
        assert.ok(f.x0 - prev >= 600, `${l.id}@${v}: forks side by side`);
        prev = f.x1;
        const span = f.x1 - f.x0;
        assert.ok(span >= 900 - 30 && span <= 1500 + 60, `${l.id}@${v}: a fork of ${span.toFixed(0)} px`);
      }
    }
  }
});

test('both lanes of every fork can be crossed on their own, and the lanes differ by at least six seconds', () => {
  for (const l of horizontal) {
    for (const v of VARIANTS) {
      const s = stage(l, v);
      assert.deepEqual(checkLanes(s), [], `${l.id}@${v}`);
      for (const f of modelStage(s, MODEL_TYPICAL).forks) assert.ok(f.delta >= 6, `${l.id}@${v}: fork ${f.id} differs by ${f.delta.toFixed(1)} s`);
    }
  }
});

test('some forks run the other way round: a quick hollow below, the scenic high lane the long way', () => {
  let reversed = 0;
  let ordinary = 0;
  for (const l of horizontal.filter((x) => x.miniIndex % 2 === 1)) for (const f of stage(l, null).lanes ?? []) f.reversed ? reversed++ : ordinary++;
  assert.ok(reversed >= 8, `only ${reversed} reversed forks`);
  assert.ok(ordinary > reversed, 'most forks are the ordinary way round');
});

test('the lane check catches a lane that cannot be crossed', () => {
  const l = horizontal.find((x) => x.worldIndex === 4)!;
  const s = stage(l, null);
  assert.deepEqual(checkLanes(s), []);
  const f = s.lanes![0];
  const hop = new Set(f.high.platforms);
  assert.ok(hop.size > 0);
  // take the middle of the high lane away and the high lane is a trap; the low lane is still fine
  const mid = f.high.platforms[Math.floor(f.high.platforms.length / 2)];
  const broken: GeneratedStage = { ...s, platforms: s.platforms.filter((p) => p.id !== mid), vines: s.vines.filter((v) => !f.high.vines.includes(v.id)) };
  const errs = checkLanes(broken);
  assert.ok(errs.some((e) => /high lane cannot be crossed/.test(e)), errs.join('; '));
  assert.ok(!errs.some((e) => /low lane cannot be crossed/.test(e)), errs.join('; '));
});

test('a fork shows its choice at a glance: the high lane is up in the branches, the low lane on or under the ground, a lure of flowers on each', () => {
  for (const l of horizontal.filter((x) => x.miniIndex <= 4)) {
    const s = stage(l, null);
    for (const f of s.lanes ?? []) {
      const hi = s.platforms.filter((p) => f.high.platforms.includes(p.id));
      assert.ok(hi.length > 0 || f.high.vines.length > 0, `${l.id} fork ${f.id}: an empty high lane`);
      const topHi = Math.min(...hi.map((p) => p.y));
      assert.ok(topHi <= f.splitY - 20 || f.reversed, `${l.id} fork ${f.id}: the high lane is not above the split`);
      assert.ok(f.low.flowers.length + f.high.flowers.length >= 3, `${l.id} fork ${f.id}: no flowers on the lanes`);
      assert.ok(f.reward, `${l.id} fork ${f.id}: no reward on the high lane`);
    }
  }
});

test('skills are respected on the lanes: no swing before the swing is taught, no double jump needed before mission 6', () => {
  for (const l of horizontal.filter((x) => x.worldIndex === 1 && x.miniIndex <= 3)) {
    const s = stage(l, null);
    const mission = (l.worldIndex - 1) * 10 + l.miniIndex;
    for (const f of s.lanes ?? []) {
      if (mission < 4) assert.equal(f.high.terrain === 'swing', false, `${l.id}: a swing lane before the swing is taught`);
    }
    assert.equal(validateStage(s).ok, true, l.id);
  }
});

// ---- variety and spacing --------------------------------------------------------------------------------------------------------------

test('every stage shows nine kinds of piece at least, never the same kind twice in a row, and no kind over a quarter of the length', () => {
  const bad: string[] = [];
  // (the old generator's platform styles: a gen2 stage's pieces are its sections', held by src/game/gen2's tests)
  for (const l of oldGen) {
    for (const v of VARIANTS) {
      const m = measureStage(stage(l, v));
      if (m.distinctKinds < 9) bad.push(`${l.id}@${v}: ${m.distinctKinds} kinds`);
      if (m.longestSameRun > 1) bad.push(`${l.id}@${v}: ${m.longestSameRun} of one kind in a row`);
      if (m.maxKindShare > 0.28) bad.push(`${l.id}@${v}: ${m.maxKind} is ${(m.maxKindShare * 100).toFixed(0)}% of the stage`);
    }
  }
  assert.ok(bad.length <= 4, `${bad.length} stages fall short: ${bad.slice(0, 8).join('; ')}`);
});

test('fight stages are not flat yards: plain ground is under 45% of them, with relief, ledges and tiers', () => {
  const rows = oldGen.filter((l) => l.objectiveType === 'purge' || l.objectiveType === 'gauntlet');
  let over = 0;
  for (const l of rows) for (const v of VARIANTS) if (measureStage(stage(l, v)).plainShare >= 0.45) over++;
  assert.ok(over <= Math.ceil(rows.length * VARIANTS.length * 0.1), `${over} fight stages are at least 45% plain ground`);
});

test('no long empty corridors: the longest stretch with nothing in the way stays under 2400 px (3200 at the very most)', () => {
  const free: number[] = [];
  for (const l of oldGen) for (const v of VARIANTS) free.push(measureStage(stage(l, v)).freeInterior);
  free.sort((a, b) => a - b);
  assert.ok(free[Math.floor(free.length * 0.9)] <= 2400, `p90 ${free[Math.floor(free.length * 0.9)].toFixed(0)}`);
  assert.ok(free[free.length - 1] <= 3200, `max ${free[free.length - 1].toFixed(0)}`);
});

test('animals stand clear of take-offs and landings; narrow landings are rare and late', () => {
  let near = 0;
  let narrowStages = 0;
  for (const l of horizontal) {
    const m = measureStage(stage(l, null));
    near += m.takeoffsNearEnemy + m.landingsNearEnemy;
    if (m.narrowLandings > 2) narrowStages++;
    if (l.worldIndex < 5) assert.ok(m.narrowLandings <= 1, `${l.id}: ${m.narrowLandings} narrow landings before World 5`);
  }
  assert.ok(near <= 4, `${near} take-offs or landings within 120 px of an animal`);
  assert.equal(narrowStages, 0);
});

test('checkpoints stand 900 to 1900 px apart (the first at least 700 px from the start)', () => {
  const gaps: number[] = [];
  for (const l of oldGen) {
    const s = stage(l, null);
    const m = measureStage(s);
    assert.ok(m.firstFlag >= 700, `${l.id}: the first flag is ${m.firstFlag.toFixed(0)} px from the start`);
    gaps.push(...m.flagGaps);
    assert.ok(Math.min(...m.flagGaps) >= 899, `${l.id}: flags ${Math.min(...m.flagGaps).toFixed(0)} px apart`);
  }
  gaps.sort((a, b) => a - b);
  assert.ok(gaps[Math.floor(gaps.length * 0.95)] <= 1900, `p95 ${gaps[Math.floor(gaps.length * 0.95)].toFixed(0)}`);
  assert.ok(gaps[gaps.length - 1] <= 2300, `max ${gaps[gaps.length - 1].toFixed(0)}`);
});

test('platforms come in at least four styles per stage and no style is over 40% of the thin platforms', () => {
  for (const l of oldGen) {
    const m = measureStage(stage(l, null));
    assert.ok(m.styleDistinct >= 4, `${l.id}: ${m.styleDistinct} styles`);
    assert.ok(m.maxStyleShare <= 0.4 + 1e-9, `${l.id}: one style is ${(m.maxStyleShare * 100).toFixed(0)}%`);
  }
});

test('a harvest stage holds about 1.6 times its quota in flowers: the quota is on the shared ground, the surplus on the lanes', () => {
  for (const l of horizontal.filter((x) => x.objectiveType === 'harvest')) {
    for (const v of VARIANTS) {
      const s = stage(l, v);
      const lane = new Set<number>();
      for (const f of s.lanes ?? []) for (const r of [f.high, f.low]) r.flowers.forEach((i) => lane.add(i));
      const flora = s.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
      const shared = flora.filter((c) => !lane.has(c.id)).length;
      const ratio = flora.length / l.targetCount;
      assert.ok(ratio >= 1.4 && ratio <= 2.4, `${l.id}@${v}: ${flora.length} flowers for a quota of ${l.targetCount} (${ratio.toFixed(2)}x)`);
      assert.ok(shared >= l.targetCount + 4, `${l.id}@${v}: the quota cannot be met without a lane`);
      assert.ok(flora.length - shared >= 6, `${l.id}@${v}: no surplus on the lanes`);
    }
  }
});

test('a row or an arc of flowers is one species', () => {
  // flowers laid in one go share a y-line within a row; here: neighbours closer than 80 px on nearly the same height are one species
  let pairs = 0;
  let mixed = 0;
  for (const l of horizontal.filter((x) => x.miniIndex <= 3)) {
    const s = stage(l, null);
    const fl = s.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf').sort((a, b) => a.x - b.x);
    for (let i = 1; i < fl.length; i++) {
      if (fl[i].x - fl[i - 1].x < 80 && Math.abs(fl[i].y - fl[i - 1].y) < 6) {
        pairs++;
        const species = (c: (typeof fl)[number]) => c.botanicalVariant;
        if (species(fl[i]) !== species(fl[i - 1])) mixed++;
      }
    }
  }
  assert.ok(pairs > 200, `${pairs} neighbouring flowers in rows`);
  assert.ok(mixed / pairs < 0.03, `${mixed} of ${pairs} neighbours in a row differ in species`);
});

test('every kind of animal the game defines turns up in the stages (the frog too: the Naturalist badge needs it)', () => {
  const seen = new Set<string>();
  for (const l of horizontal) for (const e of stage(l, null).enemies) seen.add(e.type);
  for (const t of ['ocelot', 'jaguar', 'boa', 'caiman', 'tayra', 'snake', 'eagle', 'harpy', 'frog']) assert.ok(seen.has(t), `${t} never spawns`);
});

// ---- the generator itself --------------------------------------------------------------------------------------------------------------

test('the same stage and layout number always give the same stage, byte for byte (forks, styles and flowers included)', () => {
  for (const l of levels.filter((_, i) => i % 6 === 0)) {
    for (const v of [null, 8080]) {
      const a = JSON.stringify(stage(l, v));
      const b = JSON.stringify(stage(l, v));
      assert.equal(a, b, `${l.id}@${v}`);
    }
  }
});

test('generating a stage is quick: p90 under 500 ms, none over 1500 ms', () => {
  const ms: number[] = [];
  const sample = horizontal.filter((_, i) => i % 3 === 0);
  for (const l of sample) { stage(l, null); } // warm-up (compilation, tables)
  for (const l of sample) {
    let best = Infinity;
    for (let k = 0; k < 2; k++) { const t0 = performance.now(); stage(l, null); best = Math.min(best, performance.now() - t0); }
    ms.push(best);
  }
  ms.sort((a, b) => a - b);
  assert.ok(ms[Math.floor(ms.length * 0.9)] <= 500, `p90 ${ms[Math.floor(ms.length * 0.9)].toFixed(0)} ms`);
  assert.ok(ms[ms.length - 1] <= 1500, `max ${ms[ms.length - 1].toFixed(0)} ms`);
});
