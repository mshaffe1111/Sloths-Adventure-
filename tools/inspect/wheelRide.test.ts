/**
 * ENG-26 NEW 2 (reference/design/2-6.md; level.md rule 21): the bot skill `rideWheel` (firsttimer.ts SKILLS) on the wheel toys
 * (tools/inspect/wheelToys.ts: a wheel laid by gen2 in a toy tower on World 2's ground, rolled the game's way), every tier on its settings:
 *   - 'sparse': the street at the sweep's edge, five buckets (too far apart to scramble up): board, ride, hop off as the bucket comes level;
 *   - 'top': the street 80 px over the top bucket (Easy 60): board, ride, jump off the very top.
 * GREEN with the skill: every run rides it, no scramble out of a bucket and no fall into the pond, across in about half a turn.
 * RED with it off (the plant): he treats the buckets as ledges, scrambling bucket to bucket and falling in the pond, every tier.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SKILLS } from './firsttimer.ts';
import { fixtureSeed, TOY_WHEELS, wheelCrossing, type WheelToy } from './wheelToys.ts';
import { turnTime } from '../../src/game/wheel.ts';

const RUNS = [['kid', 'easy'], ['kid', 'normal'], ['child', 'easy'], ['child', 'normal'], ['middle', 'normal'], ['middle', 'easy'], ['expert', 'normal']] as const;
const VARIANTS = [1, 2];
const ROWS: WheelToy[] = ['sparse', 'top'];

const cross = (row: WheelToy) => {
  const seed = fixtureSeed(row);
  assert.ok(seed !== null, `${row}: no clean seed`);
  return RUNS.flatMap(([tier, setting]) => VARIANTS.map((v) => ({ tier, setting, v, ...wheelCrossing(row, tier, setting, seed!, v) })));
};

test('rideWheel ON: every tier boards, rides and steps off the wheel: no scramble, no pond, across in about half a turn', () => {
  for (const row of ROWS) {
    const R = TOY_WHEELS[row];
    for (const c of cross(row)) {
      const what = `${row} ${c.tier} ${c.setting} v${c.v}`;
      assert.equal(c.run.end, 'shrine', what);
      assert.equal(c.scrambles, 0, `${what}: left a bucket ${c.scrambles} times other than onto the street`);
      assert.equal(c.pond, 0, `${what}: fell in the pond ${c.pond} times`);
      assert.ok(c.seconds !== null, `${what}: never crossed`);
      // (half a turn from the foot to the top, and the board and the step-off: well inside one whole turn)
      const turn = turnTime({ R: R.R, V: c.setting === 'easy' ? R.easyV : R.V });
      assert.ok(c.seconds! < turn, `${what}: ${c.seconds} s across (a turn is ${turn.toFixed(1)} s)`);
    }
  }
});

test('PLANTED: rideWheel OFF, every tier scrambles bucket to bucket instead of riding (RED)', () => {
  SKILLS.rideWheel = false;
  try {
    for (const row of ROWS) {
      const all = cross(row);
      for (const [tier, setting] of RUNS) {
        const mine = all.filter((c) => c.tier === tier && c.setting === setting);
        assert.ok(mine.some((c) => c.scrambles > 0), `${row} ${tier} ${setting}: rode it with the skill off (${JSON.stringify(mine.map((c) => c.scrambles))})`);
      }
      const scrambles = all.reduce((s, c) => s + c.scrambles, 0);
      assert.ok(scrambles >= all.length * 2, `${row}: ${scrambles} scrambles over ${all.length} runs with the skill off`);
    }
  } finally {
    SKILLS.rideWheel = true;
  }
});

/**
 * BUILD-26w (SKILLS.wheelWay, the lead's GO): a bucket carries him 180 px round the hub and the route's line runs through the hub, out of
 * the tracker's 160 px reach, so its point was left at the hub. Off the step-off onto the street that stale point lay behind him: his way
 * turned back mid-air and on the street the 'way on is below' rule hopped him back into the wheel. GREEN with the skill: 2-6 adult Easy 90
 * steps off the edge wheel onto its street and goes on, no rescue. RED with it off (the plant): back into the wheel, to a rescue.
 */
test('wheelWay: off a wheel onto its street he goes on, never back into the wheel (2-6 adult Easy 90); PLANTED off: rescued', async () => {
  const { firstTimer } = await import('./firsttimer.ts');
  const { CAST_BOTS } = await import('./castBots.ts');
  const run = (on: boolean) => {
    SKILLS.wheelWay = on;
    try {
      return firstTimer('2-6', 90, CAST_BOTS.adult.easy, { cap: 1200, dotSetting: true });
    } finally {
      SKILLS.wheelWay = true;
    }
  };
  const on = run(true);
  assert.equal(on.end, 'shrine', 'wheelWay on: 2-6 adult Easy 90 reaches the shrine');
  assert.equal(on.rescues, 0, `wheelWay on: ${on.rescues} rescues`);
  const off = run(false);
  assert.ok(off.rescues >= 1, `PLANTED wheelWay off: ${off.rescues} rescues (the plant must still catch the stale way)`);
});
