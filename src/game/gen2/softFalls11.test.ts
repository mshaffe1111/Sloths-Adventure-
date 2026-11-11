// No fall in 1-1 costs a life, on Easy or Normal (R-165.86): the rule as stage data. The 1-1 brief's `softFalls` (types.ts GraphBrief,
// worlds/w1.ts) reaches the built stage (Gen2Meta.softFalls) and the engine asks softFallStage (pipeline.ts) as these tests do.
// Laid on the 11-10 play window's seeds; planted without the brief's word (origin/main's 1-1); and proof nothing else moved: 1-1's
// own ground, zones and floorless-gap verdicts with and without the word, and 1-2's and 8-3 Normal's lay against origin/main's.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import '../headlessDom.ts';
import { buildGen2Stage, softFallStage } from './pipeline.ts';
import { buildPlayStage } from './seedList.ts';
import { floorlessGaps } from './promises11.ts';
import { PROVEN_SEEDS } from './provenSeeds.ts';
import { w1Finish, w1World } from './worlds/w1.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Gen2Stage, WorldKit } from './types.ts';

const cfg = (id: string) => ({ ...generateAllLevels().find((l) => l.id === id)!, unlocked: true });
/**
 * the first 16 listed seeds of the re-laid 1-1 (4106, the first run, among them). Changed, INT-1-1: these were the 11-10 play window's
 * seeds (reference/qa-reports/window-2026-11-10), which are no longer listed and no longer build on the re-lay
 */
const WINDOW = PROVEN_SEEDS['1-1'].seeds.slice(0, 16);

/** World 1's kit as it was before the 1-1 brief said `softFalls` (origin/main's) */
function kitWithout(): WorldKit {
  const k = w1World();
  const { softFalls: _, ...brief } = k.manifest.graphs!.briefs['1-1'];
  return { ...k, manifest: { ...k.manifest, graphs: { ...k.manifest.graphs!, briefs: { ...k.manifest.graphs!.briefs, '1-1': brief } } } };
}

/** the gaps a fall into is NOT a soft set-back: not water, the stage not soft as a whole, and no soft zone over the gap */
function hardFalls(st: Gen2Stage): Array<[number, number]> {
  if (softFallStage(st)) return [];
  const soft = (st.heartFalls ?? []).filter((z) => z.soft);
  return (st.gen2.falls ?? []).filter((f) => f.kind !== 'water' && !soft.some((z) => f.x0 >= z.x0 - 4 && f.x1 <= z.x1 + 4)).map((f) => [f.x0, f.x1]);
}

for (const setting of ['normal', 'easy'] as const) {
  test(`1-1 ${setting}: on the first 16 listed seeds a fall into any gap that is not water is a soft set-back, and water stays water`, () => {
    for (const seed of WINDOW) {
      const st = w1Finish(buildPlayStage(cfg('1-1'), w1World(), seed, setting));
      assert.equal(st.gen2.seed, seed, `seed ${seed} is laid as listed`);
      assert.ok((st.gen2.falls ?? []).length >= 10, `seed ${seed} lays gaps`);
      assert.deepEqual(hardFalls(st), [], `seed ${seed}: gaps that still cost a life`);
      // (the word turns no water gap soft: the engine's water checks come before the fall check, and no zone is added for it)
      assert.equal(st.gen2.softFalls, true);
      assert.ok((st.heartFalls ?? []).every((z) => z.soft), `seed ${seed}: 1-1's zones are the level blocks' soft ones only`);
    }
  });
}

test('planted: without the brief\'s word (origin/main\'s 1-1) the same check finds gaps that cost a life, on Normal and on Easy', () => {
  for (const setting of ['normal', 'easy'] as const) {
    for (const seed of WINDOW.slice(0, 4)) {
      const st = w1Finish(buildPlayStage(cfg('1-1'), kitWithout(), seed, setting));
      assert.equal(softFallStage(st), false);
      assert.ok(hardFalls(st).length >= 3, `${setting} seed ${seed}: ${hardFalls(st).length} gaps outside a soft zone`);
    }
  }
});

test('the word lays nothing: 1-1\'s ground, zones and floorless-gap verdicts are the same with and without it (listed seeds and raw rolls)', () => {
  const same = (a: Gen2Stage, b: Gen2Stage, what: string) => {
    assert.deepEqual(a.platforms, b.platforms, `${what}: the ground`);
    assert.deepEqual(a.heartFalls, b.heartFalls, `${what}: the soft zones`);
    assert.deepEqual(a.gen2.falls, b.gen2.falls, `${what}: the gaps`);
    assert.deepEqual(floorlessGaps(a), floorlessGaps(b), `${what}: floorlessGaps`);
  };
  for (const setting of ['normal', 'easy'] as const) {
    for (const seed of WINDOW.slice(0, 4)) same(buildPlayStage(cfg('1-1'), w1World(), seed, setting), buildPlayStage(cfg('1-1'), kitWithout(), seed, setting), `listed ${seed} ${setting}`);
    // (raw rolls, as tools/engine/seedlist.ts tries them before its filter: listed or not)
    for (const seed of [1, 2, 3, 4, 5, 6]) same(buildGen2Stage({ config: cfg('1-1'), kit: w1World(), seed, difficulty: setting }), buildGen2Stage({ config: cfg('1-1'), kit: kitWithout(), seed, difficulty: setting }), `roll ${seed} ${setting}`);
  }
});

test('floorlessGaps does not read the word: an unmarked floorless gap is still a breach on a stage that has it (planted)', () => {
  const P = (id: number, x: number) => ({ id, x, y: 700, width: 600, height: 300, type: 'solid' as const, style: 'moss_stone' as const });
  const st = { platforms: [P(1, 0), P(2, 800)], gen2: { softFalls: true } };
  assert.equal(softFallStage(st), true);
  assert.equal(floorlessGaps(st).length, 1);
});

// origin/main at 181d2846 (sha256 of the stage's platforms, heartFalls and gen2.falls, first 16 hex)
const MAIN: Record<string, string[]> = {
  '1-2': ['67ccc8de6ae51e0f', 'fdedeb5a9f36c723', 'b14540d0e57c4a4a'],
  '8-3': ['d7097751a77b9452', 'daacff5017ec0ef8', 'fcfa0af041aee16c'],
};
for (const [id, pins] of Object.entries(MAIN)) {
  test(`${id} Normal lays the same ground, gaps and heartFalls as origin/main, byte for byte (layouts 1-3), and is not a soft-fall stage`, () => {
    pins.forEach((pin, i) => {
      setLayoutVariant(i + 1);
      const st = generateStage(cfg(id), 'normal') as ReturnType<typeof generateStage> & { gen2?: { falls?: unknown } };
      setLayoutVariant(null);
      assert.equal(softFallStage(st), false);
      if (id === '8-3') assert.ok((st.heartFalls ?? []).some((z) => !z.soft), 'World 8 Normal keeps its heart falls');
      assert.equal(createHash('sha256').update(JSON.stringify({ platforms: st.platforms, heartFalls: st.heartFalls ?? null, falls: st.gen2?.falls ?? null })).digest('hex').slice(0, 16), pin, `${id} layout ${i + 1}`);
    });
  });
}
