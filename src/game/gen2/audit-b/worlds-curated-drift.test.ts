// AUDIT-B (2026-11-11, ENGINE-AUDIT-B.md B-03). FAILING ON PURPOSE.
// seeds.test.ts holds a curated roll to "the layout the curation checked" (its seed and its section plan), but only on the FIRST stage's
// 16 rolls and on rolls 0 and 15 of every other stage ("so the suite stays quick"). This is the same assertion on every shipped roll of
// 8-5 and 8-6: several no longer build the sections that were curated (measured, look-alike-checked and bot-walked), and nothing fails.
// Run: npx tsx --test src/game/gen2/audit-b/worlds-curated-drift.test.ts   (about 3 minutes)
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../headlessDom.ts';
import { buildGen2Stage } from '../pipeline.ts';
import { GEN2_SEEDS } from '../seeds.ts';
import { resolveStage } from '../../../../tools/gen2/curate.ts';

for (const id of ['8-5', '8-6']) {
  test(`${id}: every shipped roll builds the sections that were curated (seeds.test.ts's own line, all 16 rolls)`, async () => {
    const e = GEN2_SEEDS[id];
    const stage = await resolveStage(id, e.kit);
    const moved: string[] = [];
    e.seeds.forEach((s, i) => {
      const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty: 'normal', recent: e.recent });
      const now = st.gen2.plan.map((p) => `${p.template}${p.mirrored ? '~' : ''}`).join(' ').split(' '), was = s.sections.split(' ');
      const k = now.findIndex((t, j) => t !== was[j]);
      if (now.join(' ') !== s.sections) moved.push(`roll ${i} (seed ${s.seed}): slot ${k + 1} was ${was[k]}, is ${now[k]}; ${now.filter((t, j) => t !== was[j]).length} of ${Math.max(now.length, was.length)} slots differ`);
      else if (Math.abs(st.gen2.modelled.fast - s.model.fast) > 0.05) moved.push(`roll ${i} (seed ${s.seed}): same sections, but the fast clock is ${st.gen2.modelled.fast} s, curated ${s.model.fast} s (its geometry or animals moved)`);
    });
    assert.deepEqual(moved, [], `${moved.length} of ${e.seeds.length} shipped rolls are not the stage that was curated`);
  });
}
