/**
 * World 6's swings are the only way on (the lead, 2026-10-28; Matt on Meeca's stage: "climbing is unneeded because you can just run
 * straight across the bottom"): on every roll of 6-1, 6-3, 6-6 and 6-7, Normal and Easy, the inspector's quick route swings on every
 * liana: the gap under a swing is black water (the core's water gap), never a soft pit to walk out of on the far side.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg } from './w6Harness.ts';
import { withW6Swing } from './worlds/w6Swing.ts';
import { w6Finish, w6Kit } from './worlds/w6.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['6-1', 'vine_runner'], ['6-3', 'vine_runner'], ['6-6', 'sprint'], ['6-7', 'vine_runner']];

for (const [id, a] of STAGES) {
  test(`${id}: the quick route swings on every liana, every roll, Normal and Easy (no walking under one through its pit)`, () => {
    const n = Number(id.split('-')[1]);
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = w6Finish(buildGen2Stage({ config: cfg(id, a), kit: withW6Swing(w6Kit(n), n, difficulty), seed, difficulty }));
        const route = pickRoute(a, st).used.route;
        assert.notEqual(route.traced, 'failed', `${difficulty} ${seed}`);
        const swings = route.segs.filter((s) => s.kind === 'swing');
        for (const v of st.vines.filter((x) => x.vineType === 'swing_liana')) {
          const used = swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40);
          assert.ok(used, `${difficulty} ${seed}: the liana at ${v.x} is walked under, never swung`);
        }
      }
    }
  });
}
