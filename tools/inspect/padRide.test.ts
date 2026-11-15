// npx tsx --test tools/inspect/padRide.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The bot toys for SINKING PADS (level.md rule 21, ENG-22; before 2-2 lays a pad): fixture stages rolled by gen2 the way the game rolls a
 * listed stage (listed.ts withTestStage, a planted one-seed list, the toy kit with a pad table, World 2's finish), each with ONE pond
 * section over deep water (a fall costs a life), crossed by the middle and child bots on both settings to the shrine:
 *   keep    four small weight pads (1.0 s each on Normal): KEEP-HOPPING, he never stands on a weight pad past its count
 *   rise    a beat row with a stone between (big, stone, big): WAIT-FOR-THE-RISE, at an edge he never hops for a pad that is down or
 *           shivering; he waits until it is up and still
 *   breath  two small beat pads in a row, no stone (470 px: 2.0 s of its 2.4 s up at padFaults pace) (2-2.md's breath: up 1.8 s, shiver 0.6 s, under 0.6 s): CROSS-ON-THE-BREATH, he starts
 *           only when the breath left covers the whole run
 * Each skill is planted: switched off (firsttimer.ts PAD_SKILL), its toy goes red where the same run crossed with it on (the on and off numbers
 * over four variants are pasted in BUILD-22's REPORT).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { padFaults } from '../../src/game/gen2/rideLay.ts';
import { PAD_SKILL } from './firsttimer.ts';
import { crossed, fixtureSeed, padRun, padStage, told, TOY_PADS, type ToyPad } from './padToys.ts';
import type { Setting, Tier } from './tierBots.ts';

const RUNS: Array<[Tier, Setting]> = [['middle', 'normal'], ['middle', 'easy'], ['child', 'normal'], ['child', 'easy']];
/** bot runs a tier for each plant (variants 1..N: his own presses and timing, the fixture's one roll) */
const PLANT_VARIANTS = 4;
const SKILL_OF: Record<ToyPad, keyof typeof PAD_SKILL> = { keep: 'keepHopping', rise: 'waitRise', breath: 'breath' };

for (const row of Object.keys(TOY_PADS) as ToyPad[]) {
  const seed = fixtureSeed(row);
  test(`the ${row} fixture: one pond of sinking pads over deep water, rolled clean and fair (padFaults)`, () => {
    const st = padStage(row, seed);
    assert.equal(st.platforms.filter((p) => p.pad).length, TOY_PADS[row].pads.filter((k) => k !== 'stone').length);
    assert.deepEqual(padFaults(st), []);
    assert.ok(st.rivers?.some((r) => r.speed === 0 && !r.safe), 'still deep water under the pads');
  });
  for (const [tier, setting] of RUNS) {
    test(`${row}: ${tier}, ${setting} crosses the pads and reaches the shrine`, () => {
      const r = padRun(row, tier, setting, seed);
      assert.ok(crossed(r, row), `${tier} ${setting}: ${told(r, row)}`);
    });
  }
  test(`planted: with ${SKILL_OF[row]} off, the ${row} pond takes a bot the skill carries across`, () => {
    // (BUILD-22: over PLANT_VARIANTS runs a tier, the skill-off run fails where the SAME run with the skill on crossed; one run a tier
    // was luck: once the floor-read fault was fixed (padRead), the breath plant went green on variant 1 by arrival timing alone)
    const on = new Map<string, boolean>();
    for (const [tier, setting] of RUNS) for (let v = 1; v <= PLANT_VARIANTS; v++) on.set(`${tier} ${setting} v${v}`, crossed(padRun(row, tier, setting, seed, v), row));
    PAD_SKILL[SKILL_OF[row]] = false;
    const off: string[] = [];
    let failed = 0;
    try {
      for (const [tier, setting] of RUNS) {
        for (let v = 1; v <= PLANT_VARIANTS; v++) {
          const r = padRun(row, tier, setting, seed, v);
          off.push(`${tier} ${setting} v${v}: ${told(r, row)}`);
          if (!crossed(r, row) && on.get(`${tier} ${setting} v${v}`)) failed++;
        }
      }
      assert.ok(failed >= 1, `with ${SKILL_OF[row]} off no run failed that crossed with it on: ${off.join('; ')}`);
    } finally {
      PAD_SKILL[SKILL_OF[row]] = true;
    }
  });
}
