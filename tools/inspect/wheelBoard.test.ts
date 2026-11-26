/**
 * LAND-26d, R-165.478 (level.md rule 21): the bot skill `boardWatch` (firsttimer.ts SKILLS), the rideWheel board judge, planted EACH WAY
 * the wheel turns. Stopped on the jetty nearer its lip than the board was flown (wheelFlights.ts BOARD_BACK), a blind tap hop can carry
 * past the bucket's end; with boardWatch he hops only when his own hop comes down inside a bucket (hopBoards), waiting up to one bucket
 * period, as a person who has watched the wheel does.
 *   - way -1 (the wheel turns left): the 'great' toy (tools/inspect/wheelToys.ts), child Normal v1. Off, he slides to 9 px from the left
 *     lip and hops blind (t 16.23), misses the bucket and falls into the pond; on, he waits and is in a bucket at t 16.70, no pond.
 *   - way +1 (the wheel turns right): 2-6's own row, seed 1, child Normal v2, the top wheel. Off, he stops 17 px short of the lip and
 *     hops without looking, in b0 at its end, off it: 2 scrambles; on, none.
 * GREEN with the skill: no pond, no scramble on that wheel. RED with it off (the plant): the pond (way -1), 2 scrambles (way +1).
 * The traces: reference/qa-reports/LAND-26/data/boardWatch-*.txt.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import { kitLib26, STAGE_26 } from '../../src/game/gen2/worlds/w2Arc26.ts';
import { SKILLS } from './firsttimer.ts';
import { rowWheelRuns, runLine, type PlantedRow } from './rowWheels.ts';
import { fixtureSeed, wheelCrossing, wheelRun } from './wheelToys.ts';

const ROW: PlantedRow = { stage: STAGE_26, kit: kitLib26, world: w2Finish as never };

const withBoardWatch = <T>(on: boolean, f: () => T): T => {
  const was = SKILLS.boardWatch;
  SKILLS.boardWatch = on;
  try {
    return f();
  } finally {
    SKILLS.boardWatch = was;
  }
};

/** the toy's wheel turns left: read from the built stage (rule 27), not its data */
const toyWay = (seed: number): number => {
  let way = 0;
  wheelRun('great', 'child', 'normal', seed, 1, { onFrame: (sim) => { way ||= sim.platforms.find((p) => p.wheel)?.wheel?.w.way ?? 0; } });
  return way;
};

const toy = (on: boolean) => {
  const seed = fixtureSeed('great');
  assert.ok(seed !== null, 'great: no clean seed');
  return { seed: seed!, way: toyWay(seed!), ...withBoardWatch(on, () => wheelCrossing('great', 'child', 'normal', seed!, 1)) };
};

const top = (on: boolean) => {
  const [r] = withBoardWatch(on, () => rowWheelRuns(ROW, 1, [['child', 'normal']], [2]));
  const c = r.wheels.find((w) => w.row === 'top');
  assert.ok(c, `${runLine(r)}: no top wheel`);
  return { line: runLine(r), ...c! };
};

test('boardWatch ON, way -1 (the great toy, child Normal v1): he waits for a bucket, no pond, no scramble', () => {
  const c = toy(true);
  assert.equal(c.way, -1, 'the toy wheel turns left');
  assert.equal(c.pond, 0, `seed ${c.seed}: fell in the pond`);
  assert.equal(c.scrambles, 0, `seed ${c.seed}: ${c.scrambles} scrambles`);
  assert.ok(c.seconds !== null, `seed ${c.seed}: never across`);
});

test('boardWatch PLANTED OFF, way -1 (the great toy, child Normal v1): the blind hop from near the lip falls in the pond (RED)', () => {
  const c = toy(false);
  assert.ok(c.pond >= 1, `seed ${c.seed}: no pond with the skill off (sc${c.scrambles} pd${c.pond} ${c.seconds}s): the plant is not live`);
});

test("boardWatch ON, way +1 (2-6's row seed 1, child Normal v2, the top wheel): no scramble, no pond", () => {
  const c = top(true);
  assert.equal(c.way, 1, `${c.line}: the top wheel turns right`);
  assert.equal(c.pond, 0, c.line);
  assert.equal(c.scrambles, 0, c.line);
});

test("boardWatch PLANTED OFF, way +1 (2-6's row seed 1, child Normal v2, the top wheel): the blind hop scrambles (RED)", () => {
  const c = top(false);
  assert.ok(c.scrambles >= 2, `${c.line}: ${c.scrambles} scrambles with the skill off: the plant is not live`);
});
