// A rolled stage's forks (the lead's red test #9, 11-06: stageQuality 'one to three forks, apart, not in the opening or the final
// approach' read 1-1 as "0 forks": it counts the old generator's `lanes`, and gen2 lays its fork as a two-road section (its job 'fork',
// NODES V17), never as lanes; on seed 2 the hollow two-way at x 13939-16347). The same line on gen2's own record: one to three fork
// sections, none starting in the first 1000 px or ending in the last 1200, each 600 px past the one before. The old line's fork length,
// 900-1560 px, is the old generator's lane; the designer's two-road sections run 2000-2500 px, and are not held to it.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { w1World } from './worlds/w1.ts';
import { buildPlayStage } from './seedList.ts';
import { provenSeeds } from './seedList.ts';
import { generateAllLevels } from '../worldsData.ts';

// (changed, INT-1-1: judged on the first 24 LISTED seeds, as Play builds them, not raw rolls: on the re-lay only 8 of 24 raw builds were
// clean, under the 12 this needs; a raw roll that is refused is never played)
test('gen2 1-1: one to three forks, apart, not in the opening or the final approach (24 listed seeds, both settings)', () => {
  const c = generateAllLevels().find((l) => l.id === '1-1')!;
  const kit = w1World();
  const forkIds = new Set(kit.manifest.sections.filter((t) => t.jobs?.includes('fork')).map((t) => t.id));
  assert.ok(forkIds.size >= 2, `${forkIds.size} fork sections in the kit`);
  const bad: string[] = [];
  let judged = 0;
  for (const seed of provenSeeds('1-1').slice(0, 24)) for (const difficulty of ['normal', 'easy'] as const) {
    const st = buildPlayStage(c, kit, seed, difficulty);
    assert.deepEqual(st.gen2.errors ?? [], [], `listed seed ${seed} ${difficulty} builds cleanly`);
    judged++;
    const at = `seed ${seed} ${difficulty}`;
    const forks = st.gen2.sections.filter((s) => forkIds.has(s.template)).sort((a, b) => a.x0 - b.x0);
    if (forks.length < 1 || forks.length > 3) bad.push(`${at}: ${forks.length} forks`);
    let prev = st.spawnX + 1000;
    for (const f of forks) {
      if (f.x0 < st.spawnX + 1000) bad.push(`${at}: a fork in the opening (x ${Math.round(f.x0)})`);
      if (f.x1 > st.exitTotemX - 1200) bad.push(`${at}: a fork in the final approach (to x ${Math.round(f.x1)})`);
      if (f.x0 - prev < 600 && f !== forks[0]) bad.push(`${at}: forks side by side (x ${Math.round(f.x0)})`);
      prev = f.x1;
    }
  }
  assert.equal(judged, 48, `${judged} builds judged`);
  assert.deepEqual(bad.slice(0, 10), []);
});
