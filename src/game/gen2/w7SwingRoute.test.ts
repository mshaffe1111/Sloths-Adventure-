/**
 * World 7's swings are the only way on (STAGE-RULES §6, "a pit or a floor under a liana makes the swing optional"): on 20 rolls of the
 * stand-in stages, Normal and Easy, the inspector's quick route swings on every liana (the fall under a swing climbs back to its own
 * ledge, never on to the perch) and climbs every brown vine (its wall is too high to jump).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage } from './pipeline.ts';
import { cfg7, k7 } from './w7Harness.ts';
import { withW7Swing } from './worlds/w7Swing.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['7-1', 'sprint'], ['7-2', 'vine_runner']];

for (const [id, a] of STAGES) {
  test(`${id}: the quick route swings on every liana, every roll, Normal and Easy`, () => {
    const n = Number(id.split('-')[1]);
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildGen2Stage({ config: cfg7(id, a), kit: withW7Swing(k7(), n, difficulty), seed, difficulty });
        const route = pickRoute(a, st).used.route;
        assert.notEqual(route.traced, 'failed', `${difficulty} ${seed}`);
        const swings = route.segs.filter((s) => s.kind === 'swing');
        for (const v of st.vines.filter((x) => x.vineType === 'swing_liana')) {
          const used = swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40);
          assert.ok(used, `${difficulty} ${seed}: the liana at ${v.x} is walked under, never swung`);
        }
        const climbs = route.segs.filter((s) => s.kind === 'climb');
        for (const v of st.vines.filter((x) => x.vineType === 'tree_climb')) {
          const used = climbs.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40);
          assert.ok(used, `${difficulty} ${seed}: the brown vine at ${v.x} is never climbed`);
        }
      }
    }
  });
}
