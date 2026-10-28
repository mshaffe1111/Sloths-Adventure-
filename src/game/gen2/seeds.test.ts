/**
 * The guard on the curated seeds (DESIGN.md B8): every seed a stage ships still builds, on Normal and on Easy, with the entry's `recent`,
 * into a stage that passes levelCheck (puzzleCheck through it), on the layout the curation checked. All of the first stage's seeds,
 * two of every other's (spread through its list), so the suite stays quick. The same guard runs on the toy world's table
 * (tools/gen2/toySeeds.ts), the curation tool's own proof, so it holds before World 5's real sections ship.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { validateStage } from '../levelCheck.ts';
import { buildGen2Stage } from './pipeline.ts';
import { GEN2_SEEDS, type Gen2StageSeeds } from './seeds.ts';
import { resolveStage } from '../../../tools/gen2/curate.ts';
import { TOY_SEEDS } from '../../../tools/gen2/toySeeds.ts';

async function guard(table: Record<string, Gen2StageSeeds>, what: string) {
  const keys = Object.keys(table);
  for (const [k, key] of keys.entries()) {
    const e = table[key];
    const stage = await resolveStage(key);
    assert.equal(stage.config.id, e.stage, `${what} ${key}: the entry is for ${e.stage}`);
    assert.ok(e.seeds.length > 0, `${what} ${key}: no seeds`);
    assert.equal(new Set(e.seeds.map((s) => s.seed)).size, e.seeds.length, `${what} ${key}: a seed twice`);
    const n = e.seeds.length;
    const idx = k === 0 ? e.seeds.map((_, i) => i) : [...new Set([0, n - 1])];
    for (const i of idx) {
      const s = e.seeds[i];
      for (const difficulty of ['normal', 'easy'] as const) {
        const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty, recent: e.recent });
        assert.deepEqual(validateStage(st).errors, [], `${what} ${key} seed ${s.seed} (${difficulty})`);
        if (difficulty === 'normal') {
          assert.equal(st.gen2.seed, s.layoutSeed, `${what} ${key} seed ${s.seed}: it built from another roll than the one checked`);
          assert.equal(st.gen2.plan.map((p) => `${p.template}${p.mirrored ? '~' : ''}`).join(' '), s.sections, `${what} ${key} seed ${s.seed}: the sections changed since curation (re-run tools/gen2/curate.ts)`);
        }
      }
    }
  }
}

test('every shipped gen2 seed still builds and passes levelCheck, on the layout that was curated', async () => {
  await guard(GEN2_SEEDS, 'GEN2_SEEDS');
});

test("the toy world's curated seeds (the tool's proof) still build and pass levelCheck", async () => {
  assert.ok(Object.keys(TOY_SEEDS).length >= 2, 'the toy table holds the tool run');
  for (const e of Object.values(TOY_SEEDS)) assert.equal(e.seeds.length, 16, `${e.stage}: 16 shipped`);
  await guard(TOY_SEEDS, 'TOY_SEEDS');
});
