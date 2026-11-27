/**
 * LAND-26d, R-165.478 (level.md rule 21): the bot skill `boardWatch` (firsttimer.ts SKILLS), the rideWheel board judge, planted EACH WAY
 * the wheel turns. Stopped on the jetty nearer its lip than the board was flown (wheelFlights.ts BOARD_BACK), a blind tap hop can carry
 * past the bucket's end; with boardWatch he hops only when his own hop comes down inside a bucket (hopBoards), waiting up to one bucket
 * period, as a person who has watched the wheel does.
 *   - way -1 (the wheel turns left): the 'great' toy (tools/inspect/wheelToys.ts), child Normal v1. Off, he slides to 9 px from the left
 *     lip and hops blind (t 16.23), misses the bucket and falls into the pond; on, he waits and is in a bucket at t 16.70, no pond.
 *   - way +1 (the wheel turns right): 2-6's own row, seed 29, the child on Easy as castBots plays it (castRun's who), the top wheel
 *     (re-planted 11-27 by INT-R5-c, the lead's ruling 2: the old row, seed 1 child Normal v2 tier bot, went dead after ENG-THUMB C14
 *     1457e1daf: 0 scrambles with the skill off). The wheel is found by what the bot does, never by an x: the way +1 wheel on whose
 *     jetty boardWatch HELD him (he waited for a bucket that takes his hop) and on which, with it off, he scrambles most. Off: 2
 *     scrambles there; on: he waits (95 frames), none. The wait is what tells the skill from a timing shift: the search's other
 *     scramble hits (adult Normal 5, child Easy v1 77) lost their scrambles with no wait on that wheel. The search over 2-6's 100
 *     seeds: reference/qa-reports/INT-R5/replant/ (board-1-100.txt, cast-*.txt, searchCast.ts).
 * GREEN with the skill: no pond, no scramble on that wheel. RED with it off (the plant): the pond (way -1), 2 scrambles (way +1).
 * The traces: reference/qa-reports/LAND-26/data/boardWatch-*.txt.
 */
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { STAGE_26 } from '../../src/game/gen2/worlds/w2Arc26.ts';
import { FirstTimerRun, SKILLS, firstTimer } from './firsttimer.ts';
import { CAST_BOTS } from './castBots.ts';
import { wheelTally } from './wheelCrossings.ts';
import { fixtureSeed, wheelCrossing, wheelRun } from './wheelToys.ts';

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

/** the way +1 row: 2-6's listed seed 29, the cast child on Easy (castRun's who, as castBots plays it), every wheel tallied, and the
 *  frames boardWatch held him on each wheel's jetty (wheelBoardWait still set after pad: he waits for a bucket that takes his hop) */
const ROW_SEED = 29;
type W = { cy: number; lay?: { jetty: number } };
const castWheels = (on: boolean) => {
  type R = { sim: { platforms: Array<{ wheel?: { w: W } }>; standingOn: number }; wheelBoardWait: number };
  const P = FirstTimerRun.prototype as unknown as { pad: (this: R, ...a: unknown[]) => unknown };
  const pad = P.pad;
  const waits = new Map<number, number>();
  P.pad = function (...a) {
    const out = pad.apply(this, a);
    if (this.wheelBoardWait >= 0) {
      const w = this.sim.platforms.find((p) => p.wheel?.w.lay?.jetty === this.sim.standingOn)?.wheel?.w;
      if (w) waits.set(w.cy, (waits.get(w.cy) ?? 0) + 1);
    }
    return out;
  };
  try {
    return withBoardWatch(on, () => {
      const t = wheelTally();
      let order: number[] = [];
      const r = firstTimer(STAGE_26, ROW_SEED, CAST_BOTS.child.easy!, { cap: 1200, dotSetting: true, onFrame: (sim) => {
        t.onFrame(sim);
        // (the wheels lowest first, as wheelTally orders them)
        if (!order.length) order = [...new Set(sim.platforms.flatMap((p) => (p.wheel ? [(p.wheel.w as unknown as W).cy] : [])))].sort((x, y) => y - x);
      } });
      const wheels = t.crossings().map((c, k) => ({ ...c, waits: waits.get(order[k]) ?? 0 }));
      return { line: `seed ${ROW_SEED} child easy: ${r.end} ${r.time} s, rescues ${r.rescues} | ${wheels.map((c, k) => `#${k} ${c.row}${c.way > 0 ? 'R' : 'L'} sc${c.scrambles} pd${c.pond} wt${c.waits}`).join(', ')}`, wheels };
    });
  } finally {
    P.pad = pad;
  }
};
let both: { on: ReturnType<typeof castWheels>; off: ReturnType<typeof castWheels> } | null = null;
/** the wheel, by what the bot does: of the way +1 wheels on whose jetty boardWatch held him, the one he scrambles most on with it off */
const top = () => {
  both ??= { on: castWheels(true), off: castWheels(false) };
  const { on, off } = both;
  assert.equal(on.wheels.length, off.wheels.length, `${on.line} || ${off.line}: the wheels differ`);
  const held = on.wheels.map((c, k) => k).filter((k) => on.wheels[k].way === 1 && on.wheels[k].waits > 0);
  assert.ok(held.length > 0, `${on.line}: boardWatch held him on no way +1 jetty: this is not the skill's row (re-plant)`);
  const k = held.reduce((a, b) => (off.wheels[b].scrambles > off.wheels[a].scrambles ? b : a));
  return { k, on: { line: on.line, ...on.wheels[k] }, off: { line: off.line, ...off.wheels[k] } };
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

test(`boardWatch ON, way +1 (2-6's row seed ${ROW_SEED}, the cast child on Easy, the wheel it holds him at): no scramble, no pond`, () => {
  const { k, on: c } = top();
  assert.equal(c.way, 1, `${c.line}: wheel #${k} turns right`);
  assert.equal(c.pond, 0, c.line);
  assert.equal(c.scrambles, 0, c.line);
});

test(`boardWatch PLANTED OFF, way +1 (2-6's row seed ${ROW_SEED}, the cast child on Easy, the same wheel): the blind hop scrambles (RED)`, () => {
  const { k, off: c } = top();
  assert.ok(c.scrambles >= 2, `${c.line}: wheel #${k}: ${c.scrambles} scrambles with the skill off: the plant is not live`);
});
