// The PACER (pacer.ts, gen2/pacerLay.ts, pieces/pacerPiece.ts; 2-7's mail boat, reference/design/2-7.md NEW 1), proven on the
// out-and-back toy (gen2/toyHome.ts): laid from the race leg by the design's rule on every roll and both settings, planted RED when its
// time breaks either bound or a river on the leg has no flown row; put back level with him plus the margin's share on a respawn; and
// raced by the bots: the careful middle player (SKILLS.race) ahead of it, the ride-only player (SKILLS.rideOnly) behind.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { HOME_CODE, POST_CODE, homeKit } from './toyHome.ts';
import { layPacer, pacerShoreFaults } from './pacerLay.ts';
import { PACER_SHORE, pacerLength } from '../pacerDraw.ts';
import { W2_RACE, W2_RIVERS } from './worlds/w2.ts';
import { middleAt, pacerFaults, pacerOff, pacerReplace, pacerX, riversLeft, type Pacer } from '../pacer.ts';
import { PacerPiece } from '../pieces/pacerPiece.ts';

const ID = '2-97';
const build = (seed: number, difficulty: 'normal' | 'easy' = 'normal') => buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, HOME_CODE), seed, difficulty });

test('pacer: laid on the race leg by the design\'s rule, every roll and both settings; RED when its time breaks either bound', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const st = build(seed, difficulty);
      const at = `${difficulty} seed ${seed}`;
      assert.deepEqual(st.gen2.errors, [], at);
      const P = st.pacer!;
      assert.ok(P, `${at}: a pacer`);
      const home = st.gen2.tower!.legs!.at(-1)!;
      // (it runs left, the way home: it waits in the home leg's first river that holds it whole and docks in its last before the exit, each
      //  seen over its river's water (the lead's ruling 11-21, ENG-27d); planted RED: today's lay before it, the column's foot and the exit,
      //  both on land)
      assert.equal(P.dir, -1, at);
      const len = pacerLength(P.art)!;
      const leg = (st.rivers ?? []).filter((r) => r.x0 >= home.x0 - 1 && r.x1 <= home.x1 + 1 && r.surfaceY >= home.y0 - 60).sort((a, b) => b.x0 - a.x0);
      const holds = leg.filter((r) => r.x1 - r.x0 >= len + 2 * PACER_SHORE);
      assert.ok(holds.length >= 2, `${at}: rivers to wait and dock in`);
      assert.equal(P.x0, holds[0].x0, `${at}: its bow waits at the first river's far bank`);
      assert.equal(P.x1, holds.at(-1)!.x0, `${at}: its bow docks at the last river's far bank`);
      assert.ok(P.x0 < home.x1 && P.x1 > st.exitTotemX!, `${at}: inside the leg, short of the exit`);
      assert.deepEqual(pacerShoreFaults(P, len, leg), [], at);
      assert.deepEqual(pacerShoreFaults({ x0: home.x1, x1: st.exitTotemX!, dir: P.dir }, len, leg).map((m) => m.replace(/ \(x \d+\)/, '')), [
        `pacer: where it waits its ${Math.round(len)} px hull is not wholly over one river's water: the child must see it`,
        `pacer: where it docks its ${Math.round(len)} px hull is not wholly over one river's water: the child must see it`,
      ], `${at}: RED on the column's foot and the exit`);
      // (the rule: the careful middle's time + the setting's SHARE of it, never over the ride-only's less 2 s; the toy races on World 2's
      // own table, the share the same on any leg's length)
      const share = difficulty === 'easy' ? W2_RACE.margin.easy : W2_RACE.margin.normal;
      assert.ok(Math.abs(P.seconds - Math.min(P.middle * (1 + share), P.rideOnly - W2_RACE.under)) < 0.02, `${at}: ${P.seconds} s against ${P.middle} s x ${1 + share}`);
      assert.ok(P.middle < P.seconds && P.seconds <= P.rideOnly - W2_RACE.under, `${at}: ${P.middle} < ${P.seconds} <= ${P.rideOnly} - 2`);
      assert.deepEqual(pacerFaults(P, W2_RACE.under), [], at);
      // (the middle's marks run from 0 at the start to its whole time at the dock, never back)
      assert.equal(middleAt(P, P.x0), 0, at);
      assert.ok(Math.abs(middleAt(P, P.x1) - P.middle) < 0.02, at);
      for (let i = 1; i < P.marks.length; i++) assert.ok(P.marks[i][1] >= P.marks[i - 1][1] && (P.marks[i][0] - P.marks[i - 1][0]) * P.dir >= 0, `${at}: mark ${i}`);
      // planted RED: a boat no slower than the careful middle (he cannot win), and one slower than the ride-only less 2 s (riding wins)
      assert.match(pacerFaults({ ...P, seconds: P.middle }, W2_RACE.under).join('\n'), /is not over the careful middle's .*: he cannot win the race/, at);
      assert.match(pacerFaults({ ...P, seconds: P.rideOnly - 1 }, W2_RACE.under).join('\n'), /is over the ride-only .* less 2 s: letting the current carry him wins/, at);
    }
  }
  // (2-7's own table, the design's margins as shares of the careful middle's time (the lead's ruling, 11-21): Normal 7% (2-7.md's +3 s on
  // its 42 s home leg), Easy 10% (+5 s on its 47.8 s Easy leg); under 2 s; the boat's two rowing frames)
  assert.deepEqual([W2_RACE.margin, W2_RACE.under, W2_RACE.bank, W2_RACE.floor], [{ normal: 0.07, easy: 0.1 }, 2, 272, { normal: 2, easy: 3 }]);
  assert.deepEqual(W2_RACE.art, ['w2-next#mailBoat', 'w2-next#mailBoatB']);
});

// (the lead's ruling (1), 11-21, ENG-27f: after a fall the floor counts each crossing he must still make from where he respawns (a fall
//  that sends him a river back costs that river's log wait again: post Normal seed 4 respawned two crossings out with the one floor's
//  2 s, and the re-crossing's log wait cost 2.8 s over the flown marks), never more than a clean run's margin (a fall must never pay),
//  never less than the one floor; the ride-only bound still caps it except on the last crossing. Planted RED both ways: the old single
//  floor gives two crossings out 2.0 s, where the cap allows 2.29; per crossing alone, the first river's respawn got 11.7 s, a clean
//  run 6.6)
test('pacer (planted): after a fall the floor counts each crossing left, never more than a clean run\'s margin, post Normal seed 4', () => {
  const P = buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, POST_CODE), seed: 4, difficulty: 'normal' }).pacer!;
  const margin = (q: Pacer, x: number) => q.seconds - pacerReplace(q, x) - (q.middle - middleAt(q, x));
  const share = P.seconds / P.middle - 1, most = (P.rideOnly - P.under) / P.middle - 1, clean = P.seconds - P.middle;
  // (each far bank is a crossing made: the marks are x0, then each crossing's near and far bank, the dock last)
  assert.equal(riversLeft(P, P.x0), (P.marks.length - 1) / 2);
  assert.equal(riversLeft(P, P.x1), 0);
  // (two crossings out: the bank before the river before the last, as a flag there stands)
  const two = P.marks.at(-4)![0] - P.dir * 80, twoLeft = P.middle - middleAt(P, two);
  assert.equal(riversLeft(P, two), 2);
  const want2 = Math.max(twoLeft * share, Math.min(2 * P.floor, twoLeft * most, clean));
  assert.ok(want2 > P.floor + 0.2, `two crossings out the rule gives ${want2} s, over the one floor`);
  assert.ok(Math.abs(margin(P, two) - want2) < 1e-6, `two crossings out: ${margin(P, two)} s, want ${want2} (RED on the one floor: ${P.floor})`);
  // (the first river's respawn, ten crossings out: never more than a clean run's margin)
  const early = P.marks[1][0] + P.dir * 60;
  assert.ok(riversLeft(P, early) >= 8 && (P.middle - middleAt(P, early)) * most > clean, 'early: per crossing and the cap alone are over a clean run');
  assert.ok(Math.abs(margin(P, early) - clean) < 1e-6, `early: ${margin(P, early)} s, a clean run's ${clean} (RED per crossing alone: 12.6 here)`);
  // (every respawn on the leg keeps at least the one floor (on the last crossing whole, ruling A), and never more than a clean run)
  for (let i = 1; i < P.marks.length; i++) {
    const x = P.marks[i][0] - P.dir * 30, left = P.middle - middleAt(P, x);
    const m = margin(P, x);
    assert.ok(m <= Math.max(clean, left * share) + 1e-6, `x ${x}: ${m} s, over a clean run's ${clean}`);
    if (riversLeft(P, x) <= 1 || left * most >= P.floor) assert.ok(m >= Math.min(P.floor, P.seconds - left) - 1e-6, `x ${x}: ${m} s, under the floor`);
  }
});

test('pacer (planted): a river on the race leg that no flown row matches is refused by name, and a stage with no race leg lays none', () => {
  const st = build(1);
  const { long: _long, ...flown } = W2_RACE.rivers;
  const r = layPacer(st, { ...W2_RACE, rivers: flown }, W2_RIVERS, false);
  assert.equal(r.pacer, undefined);
  assert.match(r.problems.join('\n'), /pacer: the river at x \d+-\d+ \(80 px\/s, logs 240 px\) matches no flown row/);
  assert.deepEqual(layPacer({ ...st, gen2: { ...st.gen2, tower: undefined } } as never, W2_RACE, W2_RIVERS, false).problems, ['pacer: no run leg laid after a column to race on']);
});

test('pacer: it waits, sets off as he steps onto the race leg, docks, and on a respawn is put back level with him plus the margin\'s share', () => {
  const st = build(2);
  const P = st.pacer!;
  const player = { x: P.x0 + 200, y: P.yMin - 400 } as { x: number; y: number };
  const host = { player } as never;
  const piece = new PacerPiece(P);
  // (on the out leg, over the race leg's start: it waits)
  piece.step(1 / 30, host);
  assert.equal(piece.clock, null);
  assert.equal(piece.x, P.x0);
  // (on the race leg past its start: it sets off and runs at one steady speed)
  Object.assign(player, { x: P.x0 - 10, y: P.yMin + 60 });
  assert.ok(pacerOff(P, player.x, player.y));
  piece.step(1 / 30, host);
  for (let i = 0; i < 300; i++) piece.step(1 / 30, host);
  assert.ok(Math.abs(piece.clock! - 10) < 1e-6);
  assert.ok(Math.abs(piece.x - pacerX(P, 10)) < 1e-6 && piece.x < P.x0);
  // (a respawn at a flag a third of the way home: level with him plus the margin's share of the way left, or the floor for each crossing
  //  left where that is more, within the ride-only bound and a clean run's margin (the lead's ruling (1), 11-21, ENG-27f))
  const flag = P.x0 + (P.x1 - P.x0) / 3;
  Object.assign(player, { x: flag, y: P.yMin + 60 });
  piece.respawn(host);
  const left = P.middle - middleAt(P, flag);
  const keep = Math.max(left * (P.seconds / P.middle - 1), Math.min(riversLeft(P, flag) * P.floor, left * ((P.rideOnly - P.under) / P.middle - 1), P.seconds - P.middle));
  assert.ok(riversLeft(P, flag) > 1, 'a third of the way home is not the last crossing');
  assert.ok(Math.abs(P.seconds - piece.clock! - left - keep) < 1e-6, 'its time left is his careful-middle time left and the margin the rule keeps');
  assert.ok(Math.abs(piece.clock! - pacerReplace(P, flag)) < 1e-9);
  assert.ok(Math.abs(pacerReplace(P, P.x0)) < 1e-9);
  // (planted, the lead's ruling 11-21: a respawn near the dock keeps the floor's margin, 2 s on Normal; the share alone left it none)
  assert.equal(P.floor, W2_RACE.floor.normal);
  // (a flag a fifth from the dock: the share there is under the floor, the ride-only bound over it: the floor holds)
  const late = P.x1 - (P.x1 - P.x0) / 5;
  const lateLeft = P.middle - middleAt(P, late);
  const most = (P.rideOnly - P.under) / P.middle - 1;
  assert.ok(lateLeft * (P.seconds / P.middle - 1) < P.floor && lateLeft * most > P.floor, `the late flag: share ${lateLeft * (P.seconds / P.middle - 1)} < 2 < bound ${lateLeft * most}`);
  // (the floor for each crossing left there, within the bound and a clean run's margin: ruling (1), ENG-27f)
  const lateKeep = Math.max(P.floor, Math.min(riversLeft(P, late) * P.floor, lateLeft * most, P.seconds - P.middle));
  assert.ok(Math.abs(P.seconds - pacerReplace(P, late) - (lateLeft + lateKeep)) < 1e-6, `a respawn a fifth from the dock: his time left + ${lateKeep} s (${riversLeft(P, late)} crossings left)`);
  assert.ok(Math.abs(pacerReplace({ ...P, floor: 0 }, late) - (P.seconds - (lateLeft * P.seconds) / P.middle)) < 1e-6, 'RED without the floor: the share alone');
  // (the lead's ruling A, 11-21: on the LAST crossing (no river left between him and the dock's) the floor holds whole: the floor is the
  //  child's safety net after a fall. Planted RED on the cap there (before ENG-27e the ride-only bound cut it to ~1 s near the dock))
  const share = P.seconds / P.middle - 1;
  const lastFar = P.marks.at(-3)![0], lastNear = P.marks.at(-2)![0];
  const onLast = lastNear - P.dir * 80; // (the bank before the last river, as a flag there would stand)
  const lastLeft = P.middle - middleAt(P, onLast);
  assert.ok((onLast - lastFar) * P.dir >= 0 && lastLeft * most < P.floor, `on the last crossing the bound (${lastLeft * most}) is under the floor`);
  assert.ok(Math.abs(P.seconds - pacerReplace(P, onLast) - (lastLeft + Math.max(lastLeft * share, P.floor))) < 1e-6, 'on the last crossing: his time left + the floor, uncapped');
  const capped = P.seconds - Math.max(0, P.seconds - lastLeft - Math.max(lastLeft * share, Math.min(P.floor, lastLeft * most)));
  assert.ok(P.seconds - pacerReplace(P, onLast) > capped + 0.5, 'RED with the cap: the floor cut to the ride-only share');
  // (farther out, before the last crossing, the ride-only bound still caps the floor (the lead's 11:13 AM ruling stands there))
  const before = lastFar - P.dir * 40;
  const beforeLeft = P.middle - middleAt(P, before);
  if (beforeLeft * most < P.floor) assert.ok(Math.abs(P.seconds - pacerReplace(P, before) - (beforeLeft + Math.max(beforeLeft * share, beforeLeft * most))) < 1e-6, 'before the last crossing: capped by the ride-only bound');
  assert.equal(build(2, 'easy').pacer!.floor, W2_RACE.floor.easy);
  // (a docked boat stays docked: the race is decided, no later fall rewinds it (ruling A (i); planted RED: before ENG-27e a fall after the
  //  dock put it back level with him and the race ran again, post Normal seeds 1 and 3's ride-only runs))
  const was = piece.clock;
  piece.clock = P.seconds + 3;
  Object.assign(player, { x: flag, y: P.yMin + 60 });
  piece.respawn(host);
  assert.equal(piece.clock, P.seconds + 3, 'docked: a fall after the dock does not race it again');
  piece.clock = was;
  // (a respawn back before the race leg: it waits at the start again)
  Object.assign(player, { x: P.x0 + 300, y: P.yMin - 400 });
  piece.respawn(host);
  assert.equal(piece.clock, null);
  // (he reaches the dock before it: won, never a fail; a verdict stands through a later respawn)
  Object.assign(player, { x: P.x0 - 10, y: P.yMin + 60 });
  piece.step(1 / 30, host);
  // (judged at the dock line itself, the far bank it docks at (ENG-27d): 20 px short of it on the water is not there yet)
  Object.assign(player, { x: P.x1 + 20 });
  piece.step(1 / 30, host);
  assert.equal(piece.verdict as unknown, null, 'short of the dock line: no verdict yet');
  Object.assign(player, { x: P.x1 });
  piece.step(1 / 30, host);
  assert.deepEqual(piece.verdict, { won: true, boat: P.seconds, him: 0.1 });
  piece.respawn(host);
  assert.equal(piece.verdict!.won, true);
});

// (the race with the bots: every claim is its own test, so one miss never hides another (ENG-27d's run stopped at its first assertion
//  and the ride-only claim after it never ran; the lead 11-21))
type RaceRun = { v: NonNullable<PacerPiece['verdict']>; lastFall: boolean };
async function raceRun(setting: 'normal' | 'easy', seed: number, rideOnly: boolean): Promise<RaceRun> {
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  const { SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
  const was = { race: SKILLS.race, rideOnly: SKILLS.rideOnly };
  let piece: PacerPiece | undefined, lives: number | undefined, lastFall = false;
  try {
    if (rideOnly) Object.assign(SKILLS, { race: false, rideOnly: true });
    const r = homeRun('middle', setting, seed, 1, { onFrame: (sim: { e: unknown }) => {
      const e = sim.e as { pieces: unknown[]; lives: number; player: { x: number; y: number } };
      piece ??= e.pieces.find((q) => (q as PacerPiece).kind === 'pacer') as PacerPiece | undefined;
      // (a fall on the race leg's last crossing: a life lost past the far bank of the river before the last)
      if (piece && lives !== undefined && e.lives < lives && e.player.y >= piece.pacer.yMin && (e.player.x - piece.pacer.marks.at(-3)![0]) * piece.pacer.dir >= 0) lastFall = true;
      lives = e.lives;
    } } as never);
    assert.equal(r.end, 'shrine', `${setting} seed ${seed}: finishes`);
  } finally {
    Object.assign(SKILLS, was);
  }
  return { v: piece!.verdict!, lastFall };
}
for (const setting of ['normal', 'easy'] as const) {
  for (const seed of [1, 2, 3]) {
    test(`pacer race (the bots): the careful middle player (SKILLS.race) beats it, ${setting} seed ${seed}`, async () => {
      const { v } = await raceRun(setting, seed, false);
      assert.ok(v.won, `middle ${setting} seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
    });
    // (the floor is the child's safety net after a fall, and on the last crossing it holds whole (the lead's ruling A, 11-21); the
    //  ride-only bot checks the race is never won WITHOUT effort, and falling in is not winning without effort: a run with a fall on the
    //  last crossing is no test of it, so it is named, not judged)
    test(`pacer race (the bots): the ride-only player never wins without a fall on the last crossing, ${setting} seed ${seed}`, async (t) => {
      const { v, lastFall } = await raceRun(setting, seed, true);
      if (lastFall) t.diagnostic(`ride-only ${setting} seed ${seed}: fell on the last crossing (${v.won ? 'won' : 'lost'}, ${v.him} s against ${v.boat} s): not judged`);
      assert.ok(lastFall || !v.won, `ride-only ${setting} seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
    });
  }
}

// (the bot reads a gap from where he takes off, SKILLS.fromTakeoff (firsttimer.ts jumpFor): a press made before the lip needs the
//  ground to the lip as well as the gap, so a single that cannot carry it is a double. Planted on the toy's own water (level.md rule 21:
//  RED with the skill off): post Normal seed 5's middle took a single from 157 px before a 133 px safe pond and was splashed back eight
//  times there (x 6591), and lost the race by 8.3 s; seed 4's took a single from 107 px back on a log toward a bank 77 px past its
//  front, came down on the log's end and walked off it into the water (x 2856), and lost by 0.7 s. ENG-27f)
for (const seed of [4, 5]) {
  test(`bot: he reads a gap from where he takes off, and the careful middle player wins post Normal seed ${seed} (its RED: firsttimer.test's laid pond)`, async () => {
    const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
    const { SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
    const race = (on: boolean) => {
      const was = { ...SKILLS };
      let piece: PacerPiece | undefined;
      try {
        // (the boarding hop off: with it on he wins both races either way (post Normal 5 by 8.1 s with the take-off read, 1.0 s
        //  without), so the two misses this skill was planted on are read where they happen, the boarding of a log left as it was, ENG-27g)
        Object.assign(SKILLS, { fromTakeoff: on, boardLog: false });
        homeRun('middle', 'normal', seed, 1, { onFrame: (sim: { e: unknown }) => {
          piece ??= (sim.e as { pieces: unknown[] }).pieces.find((q) => (q as PacerPiece).kind === 'pacer') as PacerPiece | undefined;
        } } as never, POST_CODE);
      } finally {
        Object.assign(SKILLS, was);
      }
      return piece!.verdict!;
    };
    // (the RED half is re-planted on its cause laid explicitly, tools/inspect/firsttimer.test.ts 'a jump from a STAND over a laid pond'
    //  (a stand 165 px before a 133 px pond; a stand 107 px back on a log 72 px short of the bank; each a single with the skill off): the
    //  merged ground (t-eng-ground, groundStack) took away the descent pools these races stood on, so here he wins without it (97.9 s vs
    //  100.76; 100.5 vs 103.44, ENG-27i). The lead's ruling 11-21, ENG-27j: never loosen; re-plant where the cause is laid)
    const v = race(true);
    assert.ok(v.won, `post Normal seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
  });
}

// (the bot boards a log by a hop, SKILLS.boardLog (firsttimer.ts): a log drifting his way that is still mostly under the bank's lip is no
//  floor ahead until he can stop on it. Planted on the toy's own race leg (level.md rule 21: RED with the skill off): home Easy seed 1's
//  middle ran off the lip at full speed onto a log 64 px out of 240, came down near its front and ran off it into the water, three of
//  the race's four lives lost, and lost the race by 0.9 s (trace-27g.txt 5, ENG-27g)
test('bot (planted): a log drifting his way, still mostly under the lip, is boarded by a hop, so the careful middle player wins home Easy seed 1; RED without it', async () => {
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  const { SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
  const race = (on: boolean) => {
    const was = SKILLS.boardLog;
    let piece: PacerPiece | undefined;
    try {
      SKILLS.boardLog = on;
      homeRun('middle', 'easy', 1, 1, { onFrame: (sim: { e: unknown }) => {
        piece ??= (sim.e as { pieces: unknown[] }).pieces.find((q) => (q as PacerPiece).kind === 'pacer') as PacerPiece | undefined;
      } } as never);
    } finally {
      SKILLS.boardLog = was;
    }
    return piece!.verdict!;
  };
  const v = race(true), off = race(false);
  assert.ok(v.won, `home Easy seed 1: ${v.him} s against the boat's ${v.boat} s`);
  assert.ok(!off.won, `RED: without the skill the plant must lose (${off.him} s against ${off.boat} s)`);
});
