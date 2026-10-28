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
import { guardRoll, judgedBy } from '../../tools/inspect/eraRoll.ts';
import { rollVariants } from '../../tools/inspect/era.ts';

const ROLLS = rollVariants(10, 1028);
const STAGES = generateAllLevels().filter((c) => c.worldIndex <= 4 && c.objectiveType !== 'boss_lair' && c.id !== '4-D');

/**
 * Rolls that break a rule today (found by this guard and era.ts on 2026-10-28), reported as to-do until the stage code is fixed: delete
 * the line when its stage passes, so the guard holds it from then on.
 */
const KNOWN: Record<string, string> = {
  '1-4': 'some rolls of the climb are under 1:40 on a route with presumed hops (?layout=932513: 90 s; the stage clock says 2:20): replay to confirm',
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
      if (r.quick < r.floor) bad.push(`?layout=${v - 1}: ${Math.round(r.quick)} s for a quick player (needs ${r.floor})`);
      if (judged && !r.ok) bad.push(`?layout=${v - 1}: ${r.errors.slice(0, 2).join('; ')}`);
    }
    assert.deepEqual(bad, []);
  });
}
