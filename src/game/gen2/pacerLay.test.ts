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
import { pacerFaults, pacerMargin, pacerOff, pacerX } from '../pacer.ts';
import { EASE_MIN, EASE_PEAK, PacerPiece } from '../pieces/pacerPiece.ts';
import { DOWN_SECS } from '../physics.ts';

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
      // planted RED: a boat no slower than the careful middle (he cannot win), and one slower than the ride-only less 2 s (riding wins)
      assert.match(pacerFaults({ ...P, seconds: P.middle }, W2_RACE.under).join('\n'), /is not over the careful middle's .*: he cannot win the race/, at);
      assert.match(pacerFaults({ ...P, seconds: P.rideOnly - 1 }, W2_RACE.under).join('\n'), /is over the ride-only .* less 2 s: letting the current carry him wins/, at);
    }
  }
  // (2-7's own table, the design's margins as shares of the careful middle's time (the lead's ruling, 11-21): Normal 7% (2-7.md's +3 s on
  // its 42 s home leg), Easy 10% (+5 s on its 47.8 s Easy leg); under 2 s; the boat's two rowing frames)
  assert.deepEqual([W2_RACE.margin, W2_RACE.under, W2_RACE.bank], [{ normal: 0.07, easy: 0.1 }, 2, 272]);
  assert.deepEqual(W2_RACE.art, ['w2-next#mailBoat', 'w2-next#mailBoatB']);
});

test('pacer (planted): a river on the race leg that no flown row matches is refused by name, and a stage with no race leg lays none', () => {
  const st = build(1);
  const { long: _long, ...flown } = W2_RACE.rivers;
  const r = layPacer(st, { ...W2_RACE, rivers: flown }, W2_RIVERS, false);
  assert.equal(r.pacer, undefined);
  assert.match(r.problems.join('\n'), /pacer: the river at x \d+-\d+ \(80 px\/s, logs 240 px\) matches no flown row/);
  assert.deepEqual(layPacer({ ...st, gen2: { ...st.gen2, tower: undefined } } as never, W2_RACE, W2_RIVERS, false).problems, ['pacer: no run leg laid after a column to race on']);
});

test('pacer: it waits, sets off as he steps onto the race leg, docks, and a fall never pays: a respawn puts him on his first pass\'s margin less the beat, and the excess back at the fall is eased off', () => {
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
  // (the lead's rulings (ENG-27s, D112; the strict hold, ENG-27t): a fall never pays race time. He walks the leg at a steady pace (half
  //  again the boat's: ahead of it; then 0.9 of it: behind) and falls 0.4 of the way home; the respawn at a flag at 0.3 puts his margin there at the one he
  //  had when he FIRST passed the flag, less the life-lost beat (DOWN_SECS), and the boat runs on while he is in the air (it waits for no
  //  one). Back at the fall's x standing, with a margin better than at the fall, the boat owes exactly the excess and eases it off: once
  //  the ease ends his margin there is the fall's, never better. RED on Option A's code (16698b8a1's piece: the respawn kept exactly the
  //  margin at the fall and held the boat level with him in the air). The grid's invariant (every 2-7 row, every bot):
  //  tools/inspect/pacerRespawn.test.ts)
  const flag = P.x0 + (P.x1 - P.x0) * 0.3;
  const fellAt = P.x0 + (P.x1 - P.x0) * 0.4;
  const bucket = (x: number) => Math.floor(Math.max(0, (x - P.x0) * P.dir) / 16);
  for (const pace of [1.5, 0.9]) {
    const at = `pace ${pace}x the boat's`;
    const q = new PacerPiece(P);
    const me = { x: P.x0 + P.dir * 10, y: P.yMin + 60, grounded: true };
    const h = { player: me } as never;
    q.step(1 / 30, h);
    assert.equal(q.clock, 0, `${at}: it sets off`);
    const v = (P.dir * pace * Math.abs(P.x1 - P.x0)) / P.seconds / 30;
    let first: number | null = null;
    while ((fellAt - me.x) * P.dir > 0) {
      if (first === null && bucket(me.x) >= bucket(flag)) first = pacerMargin(P, me.x, q.clock!);
      q.step(1 / 30, h);
      me.x += v;
    }
    // (the last frame before the life is lost: the world holds through the beat, so this is his margin at the fall)
    q.step(1 / 30, h);
    const fallX = me.x;
    const had = pacerMargin(P, fallX, q.clock! - 1 / 30);
    assert.ok(Math.sign(had) === (pace > 1 ? 1 : -1), `${at}: he was ${pace > 1 ? 'ahead' : 'behind'} at the fall (${had} s)`);
    Object.assign(me, { x: flag, grounded: false });
    q.respawn(h);
    assert.ok(Math.abs(pacerMargin(P, flag, q.clock!) - (first! - DOWN_SECS)) < 1e-9, `${at}: the respawn puts his margin at the first pass's ${first} s less the beat, not the fall's ${had} s (${pacerMargin(P, flag, q.clock!)} s)`);
    // (in the air after the respawn, drifting on: the boat runs on at its pace, a frame's dt a frame)
    const c = q.clock!;
    for (let i = 0; i < 10; i++) { me.x += P.dir * 4; q.step(1 / 30, h); }
    assert.ok(Math.abs(q.clock! - c - 10 / 30) < 1e-9, `${at}: in the air the boat runs on (${q.clock! - c} s in 10 frames)`);
    assert.equal(q.owed, 0, `${at}: nothing owed in the air`);
    // (back at the fall's x standing, faster than he walked it: his margin there beats the fall's, so the boat owes exactly the excess)
    Object.assign(me, { x: fallX, grounded: true });
    const tBack = q.clock!;
    const back = pacerMargin(P, fallX, tBack);
    assert.ok(back > had + 0.5, `${at}: the premise: back at the fall he is ${back - had} s better off than at the fall (it would pay)`);
    q.step(1 / 30, h);
    assert.ok(Math.abs(q.clock! + q.owed - (tBack + 1 / 30 + (back - had))) < 1e-9, `${at}: the boat owes exactly the ${back - had} s excess`);
    assert.ok(q.owed > 0 && q.clock! - tBack - 1 / 30 < (back - had) / 2, `${at}: and eases it off, never a snap (${q.clock! - tBack - 1 / 30} s made up in the first frame)`);
    // (he stands there: the ease drains within its named length, and then his margin is the fall's, less the time he stood, never better)
    let n = 1;
    const len = Math.max(EASE_MIN, (2 * (back - had)) / EASE_PEAK);
    while (q.owed > 0 && n < len * 30 + 2) { q.step(1 / 30, h); n++; }
    assert.equal(q.owed, 0, `${at}: the ease drains within its ${len} s`);
    assert.ok(Math.abs(pacerMargin(P, fallX, q.clock!) - (had - n / 30)) < 1e-9, `${at}: after the ease his margin at the fall's x is the fall's ${had} s less the ${n / 30} s he stood (${pacerMargin(P, fallX, q.clock!)} s)`);
  }
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
type RaceRun = { v: NonNullable<PacerPiece['verdict']> };
async function raceRun(setting: 'normal' | 'easy', seed: number, rideOnly: boolean): Promise<RaceRun> {
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  const { SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
  const was = { race: SKILLS.race, rideOnly: SKILLS.rideOnly };
  let piece: PacerPiece | undefined;
  try {
    if (rideOnly) Object.assign(SKILLS, { race: false, rideOnly: true });
    const r = homeRun('middle', setting, seed, 1, { onFrame: (sim: { e: unknown }) => {
      const e = sim.e as { pieces: unknown[]; lives: number; player: { x: number; y: number } };
      piece ??= e.pieces.find((q) => (q as PacerPiece).kind === 'pacer') as PacerPiece | undefined;
    } } as never);
    assert.equal(r.end, 'shrine', `${setting} seed ${seed}: finishes`);
  } finally {
    Object.assign(SKILLS, was);
  }
  return { v: piece!.verdict! };
}
for (const setting of ['normal', 'easy'] as const) {
  for (const seed of [1, 2, 3]) {
    test(`pacer race (the bots): the careful middle player (SKILLS.race) beats it, ${setting} seed ${seed}`, async () => {
      const { v } = await raceRun(setting, seed, false);
      assert.ok(v.won, `middle ${setting} seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
    });
    // (a fall neither costs nor pays race time (the lead's ruling, Option A, D112), so letting the current carry him never wins, fall
    //  or none: the last-crossing exemption that let two ride-only runs win by a fall's pay is deleted with the floor, ENG-27k)
    test(`pacer race (the bots): the ride-only player never wins, ${setting} seed ${seed}`, async () => {
      const { v } = await raceRun(setting, seed, true);
      assert.ok(!v.won, `ride-only ${setting} seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
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

// (the racing hop off a log is judged as it is flown, SKILLS.raceSure (firsttimer.ts, the race leg's hop off a log running his way):
//  the far bank within 80 px of the log's end was taken with no landing check, and the press drew its own hold (holdQ, as short as a
//  frame), so a tap off the log's front came down 19 px short of a bank 28 px up. Planted on the exact falls (level.md rule 21, RED
//  with the skill off): home middle Normal seed 2 fell at x 10683, 6551 and 3959, post Normal seed 5 at x 12371 (ENG-27k traced all
//  ten of the two losing rows' falls: k/falls-*-27k.txt; RED and GREEN here: ENG-27/l/falls-*-27l.txt, ENG-27l)
test('bot (planted): the racing hop off a log lands where it was judged to, so the bank 28 px up is reached, not fallen short of; RED without it', async () => {
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  const { SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
  const falls = (seed: number, code: string, on: boolean) => {
    const was = SKILLS.raceSure;
    const at: number[] = [];
    let piece: PacerPiece | undefined, lives: number | undefined;
    try {
      SKILLS.raceSure = on;
      homeRun('middle', 'normal', seed, 1, { onFrame: (sim: { e: unknown }) => {
        const e = sim.e as { pieces: unknown[]; lives: number; player: { x: number } };
        piece ??= e.pieces.find((q) => (q as PacerPiece).kind === 'pacer') as PacerPiece | undefined;
        if (lives !== undefined && e.lives < lives && piece && piece.clock !== null) at.push(Math.round(e.player.x));
        lives = e.lives;
      } } as never, code);
    } finally {
      SKILLS.raceSure = was;
    }
    return at;
  };
  for (const [seed, code, xs] of [[2, HOME_CODE, [10683, 6551, 3959]], [5, POST_CODE, [12371]]] as const) {
    const on = falls(seed, code, true), off = falls(seed, code, false);
    for (const x of xs) {
      assert.ok(off.some((f) => Math.abs(f - x) < 30), `RED: without the skill seed ${seed} falls short at x ${x} (falls ${off.join(', ')})`);
      assert.ok(!on.some((f) => Math.abs(f - x) < 30), `seed ${seed}: no fall short of the bank at x ${x} (falls ${on.join(', ')})`);
    }
  }
});
