/**
 * 2-6's wheels ridden by the tier bots on the stage's own row (ENG-26d; level.md rules 21 and 23; the readiness list's last item): the
 * draft row (src/game/gen2/worlds/w2Arc26.ts, the design's node string laid by gen2, not listed) planted as Play rolls a listed row and
 * played by every tier on its settings, both variants, each of its five wheels tallied (wheelCrossings.ts), both ways round.
 * GREEN with the skill: every run reaches the shrine with no life lost; no fall into any wheel's pond; each wheel crossed jetty to street in
 * under one turn of it, at most one scramble a wheel. RED with it off (the plant, SKILLS.rideWheel = false): every tier scrambles.
 * BUILD-26 points ROW at 2-6's real row when it lays it (its real bricks replace the draft's); the checks stay.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { turnTime } from '../../src/game/wheel.ts';
import { w2Finish, W2_WHEELS } from '../../src/game/gen2/worlds/w2.ts';
import { kitLib26, STAGE_26 } from '../../src/game/gen2/worlds/w2Arc26.ts';
import { scoreStage } from '../difficulty/score.ts';
import { SKILLS } from './firsttimer.ts';
import { rowWheelRuns, runLine, TIER_RUNS, withPlantedRow, type PlantedRow } from './rowWheels.ts';

const ROW: PlantedRow = { stage: STAGE_26, kit: kitLib26, world: w2Finish as never };
/** the wheels he meets going up, by row (2-6.md: beat 1 the teach, 5 the edge, 8 the jump off the top, 10 the bounce's edge, 12 the great) */
const MET = ['teach', 'edge', 'top', 'edge', 'great'];

test("rideWheel ON, 2-6's row: every tier reaches the shrine, rides every wheel both ways round, no pond, across inside a turn", () => {
  const runs = rowWheelRuns(ROW, 1);
  assert.equal(runs.length, TIER_RUNS.length * 2);
  let met = 0, crossed = 0;
  const ways = new Set<number>();
  for (const r of runs) {
    const what = runLine(r);
    assert.equal(r.run.end, 'shrine', what);
    assert.equal(r.run.lives, 0, what);
    assert.deepEqual(r.wheels.map((c) => c.row), MET, what);
    for (const c of r.wheels) {
      met++;
      ways.add(c.way);
      assert.equal(c.pond, 0, `${what}: fell in ${c.row}'s pond`);
      assert.ok(c.scrambles <= 1, `${what}: ${c.scrambles} scrambles on ${c.row}`);
      if (c.seconds === null) continue;
      crossed++;
      const row = W2_WHEELS[c.row as keyof typeof W2_WHEELS];
      const turn = turnTime({ R: row.R, V: r.setting === 'easy' ? row.easyV : row.V });
      assert.ok(c.seconds < turn, `${what}: ${c.row} took ${c.seconds} s (a turn is ${turn.toFixed(1)} s)`);
    }
  }
  assert.deepEqual([...ways].sort(), [-1, 1], 'wheels turning both ways round');
  // (a wheel is passed uncrossed only where the harness's stuck rescue set him past it; one such on seed 1, child Easy v1, the edge wheel)
  assert.ok(crossed >= met - 2, `${crossed} of ${met} wheel meetings crossed`);
});

test('PLANTED: rideWheel OFF, every tier scrambles bucket to bucket on 2-6\'s row instead of riding (RED)', () => {
  SKILLS.rideWheel = false;
  try {
    const runs = rowWheelRuns(ROW, 1);
    for (const [tier, setting] of TIER_RUNS) {
      const mine = runs.filter((r) => r.tier === tier && r.setting === setting);
      assert.ok(mine.some((r) => r.wheels.some((c) => c.scrambles > 0)), `${tier} ${setting}: rode every wheel with the skill off`);
    }
    const scrambles = runs.reduce((s, r) => s + r.wheels.reduce((t, c) => t + c.scrambles, 0), 0);
    assert.ok(scrambles >= runs.length * 5, `${scrambles} scrambles over ${runs.length} runs with the skill off`);
  } finally {
    SKILLS.rideWheel = true;
  }
});

test("the meter's wheel channel prices every wheel on 2-6's row: a board each (every moment boards: 0 bits), a step-off each but the 'in' streets", () => {
  withPlantedRow(ROW, 1, () => {
    for (const d of ['normal', 'easy'] as const) {
      const r = scoreStage(STAGE_26, d, 1, new Map());
      assert.ok(r.pieces.includes('move:wheel'), r.pieces.join(' '));
      const board = r.challenges.filter((c) => c.kind === 'wheel-board'), off = r.challenges.filter((c) => c.kind === 'wheel-off');
      assert.equal(board.length, MET.length, `${d}: ${board.length} boards`);
      assert.ok(board.every((c) => c.bits === 0), `${d}: ${board.map((c) => c.note).join(' | ')}`);
      // (the teach and the great wheel set him down on an 'in' street; the edge, the top and the bounce's edge ask a step-off)
      assert.equal(off.length, MET.filter((m) => W2_WHEELS[m as keyof typeof W2_WHEELS].street !== 'in').length, `${d}: ${off.length} step-offs`);
      for (const c of off) assert.ok(c.bits > 1.5 && c.bits < 4 && c.cost === 'soft', `${d}: ${c.note} ${c.bits}`);
    }
  });
});

// (seeds 28 and 20: the trunkCatch plant's GREEN half, below; ENG-26u, LAND-26)
test("the tower's turns, 2-6's row: the middle and the expert finish with NO rescue, seeds 1, 2, 20 and 28 (ENG-26e)", () => {
  for (const seed of [1, 2, 20, 28]) {
    const runs = rowWheelRuns(ROW, seed, TIER_RUNS.filter(([t]) => t !== 'child'));
    for (const r of runs) assert.equal(r.run.rescues, 0, `seed ${seed} ${runLine(r)} (stuck ${JSON.stringify(r.run.stuck.filter((s) => s.rescued))})`);
  }
});

// (ENG-26u, 11-24: seed 1 no longer meets the flick since the floorAt merge (0 rescues with the skill off); seed 28 does, the same way: a
// ground double onto a trunk, the second press 0.3-0.4 s on, FELL BACK, again and again to a rescue (middle Easy v1 at x 89, through-house;
// middle Normal v1 and v2). Off: 3 rescues; on: 0 (the test above). The bar is the old one. b26u/trunkCatch-*.txt)
// (LAND-26, R-165.472, on release 4's bots (CI-15) and the World 2 finish's dry porch gaps: seed 28 no longer bites (0 rescues off), so
// the plant moves to a live case found over seeds 1-40 on 2-6's row: seed 20, off: middle Normal v1 'a trunk beside him, the way on is 138
// px up' at x 88 (the crest) to a rescue, v2 the same at x 437, middle Easy v2 at x 1612 (the millpond, 140 px up): 3 rescues; on: 0. 31 of
// seeds 1-40 cost a rescue with it off and none with it on, so trunkCatch stays. data/trunk-1-40-W.txt)
test('PLANTED: trunkCatch OFF, a double that grabs a trunk or turn vine straight off the ground flicks him off it: rescues come back (RED)', () => {
  SKILLS.trunkCatch = false;
  try {
    const runs = rowWheelRuns(ROW, 20, TIER_RUNS.filter(([t]) => t !== 'child'));
    const n = runs.reduce((a, r) => a + r.run.rescues, 0);
    assert.ok(n >= 2, `with the jump running on after the catch, rescues return (${n}: ${runs.map((r) => `${r.tier} ${r.setting} v${r.v} ${r.run.rescues}`).join(', ')})`);
  } finally {
    SKILLS.trunkCatch = true;
  }
});
