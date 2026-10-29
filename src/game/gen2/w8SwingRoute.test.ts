/**
 * World 8's swings are the only way on (STAGE-RULES §6, "a pit or a floor under a liana makes the swing optional"): on every roll of 8-3
 * and 8-5, Normal and Easy, the inspector's quick route swings on every liana: the soft pit under a swing climbs back to the swing's own
 * bough (pipeline backPit), never on to the perch.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg, w8StandInKit } from './w8Harness.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['8-3', 'vine_runner'], ['8-5', 'vine_runner']];

for (const [id, a] of STAGES) {
  test(`${id}: the quick route swings on every liana, every roll, Normal and Easy (no walking under one through its pit)`, () => {
    const n = Number(id.split('-')[1]);
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildGen2Stage({ config: cfg(id, a), kit: w8StandInKit(n, difficulty), seed, difficulty });
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
