/**
 * LAND-26e, R-165.478 (level.md rules 21 and 28): the bot skill `stepOff` (firsttimer.ts SKILLS), the rideWheel step-off judged from where
 * he stands, planted on 2-6's own stage as castBots plays it (the adult, Easy). With boardWatch on he boards at new moments, some at a
 * bucket's trailing end; the step-off window was flown from the bucket's middle, and from that end the hop falls short of the street.
 * stepOffLands flies his own hop (every thumb lag and hold, the bucket's carry kept) before he goes; behind the middle he settles first.
 *   - way +1 (the wheel turns right): seed 39 (re-planted 11-27 by INT-R5-c, the lead's ruling 2: the old row, seed 12, went dead after
 *     ENG-THUMB C14 1457e1daf: off, no rescue; on, 8 refusals, the same run). The row is held by what the bot does, never by an x: ON,
 *     stepOff refuses the short way +1 hop (6 times) and he goes from where it makes the street: the shrine, no rescue; OFF, he rides
 *     a way +1 bucket (#52 b4) past the street and is rescued (t 117.7). Seed 56 also rescues off, but ON it never refuses: a timing
 *     shift, not the skill, so it is not a plant. The search: reference/qa-reports/INT-R5/replant/step-1-100.txt, step-where.txt.
 *   - way -1 (the wheel turns left): NO real case exists. On 2-6 the only way -1 rescue with stepOff off is adult Easy 13 (bucket #32 b2),
 *     and there stepOff never refuses (0 refusals): it goes by a timing shift (the step-off makes street #29 with a double and he bounces
 *     back into the wheel), not by the skill. Every wheel toy turns left, and the toy search (stepOff on vs off, every tier and variant,
 *     70 runs) changes no scramble and no pond: 65 runs equal, 5 move in time only (at most 0.3 s). The searches: reference/qa-reports/LAND-26/data/stepOff-*.txt and data/rule28/.
 * GREEN with the skill: the shrine, no rescue, no life lost. RED with it off (the plant, boardWatch still on): a rescue.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { castRun } from './castBots.ts';
import { FirstTimerRun, SKILLS } from './firsttimer.ts';

/** the row: found by the search over 2-6's 100 listed seeds (adult Easy), the one case where the skill itself makes the difference */
const SEED = 39;

type Watched = { refusals: number[]; rescues: Array<{ way: number | null }> };
/** a castRun with stepOff `on`, watching what the bot does: each step-off stepOffLands refuses (the wheel's way) and, for each rescue,
 *  the way of the last wheel bucket he stood in before it */
const run = (seed: number, on: boolean) => {
  type R = { sim: { platforms: Array<{ id: number; wheel?: { w: { way: number } } }>; standingOn: number | null } };
  const P = FirstTimerRun.prototype as unknown as Record<'pad' | 'rescue' | 'stepOffLands', (this: R, ...a: unknown[]) => unknown>;
  const was = SKILLS.stepOff, pad = P.pad, rescue = P.rescue, lands = P.stepOffLands;
  const seen: Watched = { refusals: [], rescues: [] };
  let lastWay: number | null = null;
  P.pad = function (...a) {
    const q = this.sim.platforms.find((x) => x.id === this.sim.standingOn);
    if (q?.wheel) lastWay = q.wheel.w.way;
    return pad.apply(this, a);
  };
  P.rescue = function (...a) {
    const ok = rescue.apply(this, a);
    if (ok) seen.rescues.push({ way: lastWay });
    return ok;
  };
  P.stepOffLands = function (...a) {
    const ok = lands.apply(this, a);
    if (!ok) seen.refusals.push((a[0] as { way: number }).way);
    return ok;
  };
  SKILLS.stepOff = on;
  try {
    return { ...castRun('adult', 'easy', '2-6', seed), seen };
  } finally {
    SKILLS.stepOff = was;
    P.pad = pad;
    P.rescue = rescue;
    P.stepOffLands = lands;
  }
};
const line = (r: ReturnType<typeof run>) =>
  `seed ${r.seed}: ${r.end} ${r.time} s, rescues ${r.rescues}, lives ${r.lives}, refusals ${r.seen.refusals.length} (ways ${[...new Set(r.seen.refusals)].join(',') || '-'}), rescues after a bucket of way ${r.seen.rescues.map((x) => x.way ?? 'none').join(',') || '-'}`;

test(`stepOff ON, way +1 (2-6 adult Easy seed ${SEED}): it refuses the short hop off a way +1 bucket, then the shrine, no rescue`, () => {
  const r = run(SEED, true);
  assert.ok(r.seen.refusals.some((w) => w === 1), `${line(r)}: the skill never refused a way +1 step-off: this is not the skill's row (re-plant)`);
  assert.equal(r.end, 'shrine', line(r));
  assert.equal(r.rescues, 0, line(r));
  assert.equal(r.lives, 0, line(r));
});
test(`stepOff PLANTED OFF, way +1 (2-6 adult Easy seed ${SEED}): the step-off off a way +1 bucket falls short, a rescue (RED)`, () => {
  const r = run(SEED, false);
  assert.ok(r.rescues >= 1, `${line(r)}: no rescue with the skill off: the plant is not live`);
  assert.ok(r.seen.rescues.some((x) => x.way === 1), `${line(r)}: no rescue follows a way +1 bucket: the plant is not the step-off`);
});
