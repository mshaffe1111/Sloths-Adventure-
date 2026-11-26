/**
 * LAND-26e, R-165.478 (level.md rules 21 and 28): the bot skill `stepOff` (firsttimer.ts SKILLS), the rideWheel step-off judged from where
 * he stands, planted on 2-6's own stage as castBots plays it (the adult, Easy). With boardWatch on he boards at new moments, some at a
 * bucket's trailing end; the step-off window was flown from the bucket's middle, and from that end the hop falls short of the street.
 * stepOffLands flies his own hop (every thumb lag and hold, the bucket's carry kept) before he goes; behind the middle he settles first.
 *   - way +1 (the wheel turns right): seed 12, the top wheel. Off, he jumps from b5 at off -37 (where the run without boardWatch jumped
 *     from off +36 and made street #47), comes down in a bucket again, round and round to a rescue (t 127.3); on, he refuses the short
 *     hop 4 times (way +1), goes from where it makes the street: the shrine, no rescue.
 *   - way -1 (the wheel turns left): NO real case exists. On 2-6 the only way -1 rescue with stepOff off is adult Easy 13 (bucket #32 b2),
 *     and there stepOff never refuses (0 refusals): it goes by a timing shift (the step-off makes street #29 with a double and he bounces
 *     back into the wheel), not by the skill. Every wheel toy turns left, and the toy search (stepOff on vs off, every tier and variant)
 *     moves no run. The searches: reference/qa-reports/LAND-26/data/stepOff-*.txt and data/rule28/.
 * GREEN with the skill: the shrine, no rescue, no life lost. RED with it off (the plant, boardWatch still on): a rescue.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { castRun } from './castBots.ts';
import { SKILLS } from './firsttimer.ts';

const run = (seed: number, on: boolean) => {
  const was = SKILLS.stepOff;
  SKILLS.stepOff = on;
  try {
    return castRun('adult', 'easy', '2-6', seed);
  } finally {
    SKILLS.stepOff = was;
  }
};
const line = (r: ReturnType<typeof castRun>) => `${r.end} ${r.time} s, rescues ${r.rescues}, lives ${r.lives}`;

test('stepOff ON, way +1 (2-6 adult Easy seed 12, the top wheel): the shrine, no rescue', () => {
  const r = run(12, true);
  assert.equal(r.end, 'shrine', line(r));
  assert.equal(r.rescues, 0, line(r));
  assert.equal(r.lives, 0, line(r));
});
test('stepOff PLANTED OFF, way +1 (2-6 adult Easy seed 12, the top wheel): the step-off falls short, a rescue (RED)', () => {
  const r = run(12, false);
  assert.ok(r.rescues >= 1, `${line(r)}: no rescue with the skill off: the plant is not live`);
});
