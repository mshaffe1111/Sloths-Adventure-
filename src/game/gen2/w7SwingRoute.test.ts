/**
 * World 7's swings are the only way on (STAGE-RULES §6, "a pit or a floor under a liana makes the swing optional"): on 20 rolls of the
 * stages that take them (7-5, 7-9), Normal and Easy, the inspector's quick route swings on every liana (the fall under a swing climbs back to its own
 * ledge, never on to the perch) and climbs every brown vine (its wall is too high to jump).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildW7, cfg7, SWING_STAGES } from './w7Harness.ts';
import { W7_SWING_SECTIONS } from './worlds/w7Swing.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const MINE = new Set(W7_SWING_SECTIONS.map((s) => s.id));

for (const id of SWING_STAGES) {
  test(`${id}: the quick route swings on every liana and climbs every brown vine of these sections, every roll, Normal and Easy`, () => {
    const a = cfg7(id).objectiveType;
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildW7(id, seed, difficulty);
        const route = pickRoute(a, st).used.route;
        const mine = (x: number) => st.gen2.sections.some((s) => MINE.has(s.template) && x >= s.x0 - 5 && x <= s.x1 + 5);
        assert.notEqual(route.traced, 'failed', `${difficulty} ${seed}`);
        const swings = route.segs.filter((s) => s.kind === 'swing');
        for (const v of st.vines.filter((x) => x.vineType === 'swing_liana' && mine(x.x))) {
          const used = swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40);
          assert.ok(used, `${difficulty} ${seed}: the liana at ${v.x} is walked under, never swung`);
        }
        const climbs = route.segs.filter((s) => s.kind === 'climb');
        for (const v of st.vines.filter((x) => x.vineType === 'tree_climb' && mine(x.x))) {
          const used = climbs.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40);
          assert.ok(used, `${difficulty} ${seed}: the brown vine at ${v.x} is never climbed`);
        }
      }
    }
  });
}
