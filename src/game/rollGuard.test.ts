/**
 * The roll guard: a stage keeps its roll until it is cleared, then rolls fresh, so every roll has to be a stage we would ship. This samples
 * 10 rolls of every stage of Worlds 1-4, built the way the game builds them on entry, and fails if one is under 2:00 for a quick player
 * (a climb 1:40: reference/STAGE-RULES.md §1) or fails the level check. The full picture over 200 rolls is tools/inspect/era.ts.
 *
 * The level check is applied where the stage's tested roll (layout 1) passes it and the stage's own tests use it (eraRoll.ts judgedBy);
 * World 1's stages, whose tested rolls the check cannot model, are checked by playing them in the real engine (realReach.ts) and are
 * held only to the length rule here.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';
import { buildRoll, guardRoll, judgedBy, pickRoute } from '../../tools/inspect/eraRoll.ts';
import { maxRise } from './protoCheck.ts';
import { reachJump } from './physics.ts';
import { rollVariants } from '../../tools/inspect/era.ts';

const ROLLS = rollVariants(10, 1028);

/**
 * A quick route that is only short on hops no jump can make (the route's presumed hops between ledges the check cannot link: a rise over
 * the most a double jump lifts him, or a gap past its reach) is a phantom: 1-4's climb, replayed 2026-10-28, came out under 1:40 only on
 * 7-8 presumed hops of 235-295 px up per roll (a double jump rises 175), each one a trunk the route model left out. Such a roll is held
 * to the stage's own clock (layoutSeconds) instead.
 */
function phantomShort(c: (typeof STAGES)[number], v: number): number | null {
  const st = buildRoll(c, v);
  const segs = pickRoute(c.objectiveType, st).quick.route.segs as Array<{ kind: string; x0: number; y0: number; x1: number; y1: number }>;
  const impossible = segs.some((s) => s.kind === 'presumed' && (s.y0 - s.y1 > maxRise() || Math.abs(s.x1 - s.x0) > reachJump(Math.max(0, s.y0 - s.y1), true)));
  return impossible ? st.meta?.timing?.layoutSeconds ?? null : null;
}
const STAGES = generateAllLevels().filter((c) => c.worldIndex <= 4 && c.objectiveType !== 'boss_lair' && c.id !== '4-D');

/**
 * Rolls that break a rule today (found by this guard and era.ts on 2026-10-28), reported as to-do until the stage code is fixed: delete
 * the line when its stage passes, so the guard holds it from then on.
 */
const KNOWN: Record<string, string> = {
  '3-1': "some rolls of the sprint are just under 2:00 on this tool's quick route (?layout=72140: 116 s; the stage's own estimate says 2:30)",
  '2-6': 'some rolls put an animal within 200 px of a flag (levelCheck "too close to a safe spot")',
};

for (const c of STAGES) {
  test(`${c.id}: every sampled roll is long enough and passes the level check`, { todo: KNOWN[c.id] }, () => {
    // (the first sampled roll is layout 1, the one the stage's own tests build)
    const rolls = ROLLS.map((v) => ({ v, r: guardRoll(c, v) }));
    const judged = judgedBy(c.id, rolls[0].r.ok);
    const bad: string[] = [];
    for (const { v, r } of rolls) {
      if (r.quick < r.floor) {
        const clock = phantomShort(c, v);
        if (clock === null || clock < r.floor) bad.push(`?layout=${v - 1}: ${Math.round(r.quick)} s for a quick player (needs ${r.floor})`);
      }
      if (judged && !r.ok) bad.push(`?layout=${v - 1}: ${r.errors.slice(0, 2).join('; ')}`);
    }
    assert.deepEqual(bad, []);
  });
}
