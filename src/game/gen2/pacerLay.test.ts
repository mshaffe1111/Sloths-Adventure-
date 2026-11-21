// The PACER (pacer.ts, gen2/pacerLay.ts, pieces/pacerPiece.ts; 2-7's mail boat, reference/design/2-7.md NEW 1), proven on the
// out-and-back toy (gen2/toyHome.ts): laid from the race leg by the design's rule on every roll and both settings, planted RED when its
// time breaks either bound or a river on the leg has no flown row; put back level with him plus the margin's share on a respawn; and
// raced by the bots: the careful middle player (SKILLS.race) ahead of it, the ride-only player (SKILLS.rideOnly) behind.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { HOME_CODE, homeKit } from './toyHome.ts';
import { layPacer } from './pacerLay.ts';
import { W2_RACE, W2_RIVERS } from './worlds/w2.ts';
import { middleAt, pacerFaults, pacerOff, pacerReplace, pacerX } from '../pacer.ts';
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
      // (it sets off at the home leg's start, the column's foot, and docks at the exit; it runs left, the way home)
      assert.equal(P.dir, -1, at);
      assert.equal(P.x0, home.x1, at);
      assert.equal(P.x1, st.exitTotemX, at);
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
  // (a respawn at a flag a third of the way home: level with him plus the margin's share of the way left)
  const flag = P.x0 + (P.x1 - P.x0) / 3;
  Object.assign(player, { x: flag, y: P.yMin + 60 });
  piece.respawn(host);
  const left = P.middle - middleAt(P, flag);
  assert.ok(Math.abs(P.seconds - piece.clock! - (left * P.seconds) / P.middle) < 1e-6, 'its time left is his careful-middle time left, scaled by its own rate');
  assert.ok(Math.abs(piece.clock! - pacerReplace(P, flag)) < 1e-9);
  assert.ok(Math.abs(pacerReplace(P, P.x0)) < 1e-9);
  // (planted, the lead's ruling 11-21: a respawn near the dock keeps the floor's margin, 2 s on Normal; the share alone left it none)
  assert.equal(P.floor, W2_RACE.floor.normal);
  // (a flag a fifth from the dock: the share there is under the floor, the ride-only bound over it: the floor holds)
  const late = P.x1 - (P.x1 - P.x0) / 5;
  const lateLeft = P.middle - middleAt(P, late);
  const most = (P.rideOnly - P.under) / P.middle - 1;
  assert.ok(lateLeft * (P.seconds / P.middle - 1) < P.floor && lateLeft * most > P.floor, `the late flag: share ${lateLeft * (P.seconds / P.middle - 1)} < 2 < bound ${lateLeft * most}`);
  assert.ok(Math.abs(P.seconds - pacerReplace(P, late) - (lateLeft + P.floor)) < 1e-6, 'a respawn a fifth from the dock: his time left + 2 s');
  assert.ok(Math.abs(pacerReplace({ ...P, floor: 0 }, late) - (P.seconds - (lateLeft * P.seconds) / P.middle)) < 1e-6, 'RED without the floor: the share alone');
  // (at the dock the ride-only bound has no room: the floor gives way to it, so letting the current carry him never wins after a fall)
  const dockSide = P.x1 - (P.x1 - P.x0) / 50;
  const dockLeft = P.middle - middleAt(P, dockSide);
  assert.ok(P.seconds - pacerReplace(P, dockSide) <= dockLeft * (1 + most) + 1e-6, 'near the dock: never past the ride-only bound');
  assert.ok(P.seconds - pacerReplace({ ...P, under: -1e9 }, dockSide) > dockLeft * (1 + most) + 1e-6, 'RED without the bound: the floor alone passes it');
  assert.equal(build(2, 'easy').pacer!.floor, W2_RACE.floor.easy);
  // (a respawn back before the race leg: it waits at the start again)
  Object.assign(player, { x: P.x0 + 300, y: P.yMin - 400 });
  piece.respawn(host);
  assert.equal(piece.clock, null);
  // (he reaches the dock before it: won, never a fail; a verdict stands through a later respawn)
  Object.assign(player, { x: P.x0 - 10, y: P.yMin + 60 });
  piece.step(1 / 30, host);
  Object.assign(player, { x: P.x1 + 20 });
  piece.step(1 / 30, host);
  assert.deepEqual(piece.verdict, { won: true, boat: P.seconds, him: 0 });
  piece.respawn(host);
  assert.equal(piece.verdict!.won, true);
});

test('pacer race (the bots): the careful middle player (SKILLS.race) beats it on every roll, both settings; the ride-only player never does', async () => {
  const { homeRun } = await import('../../../tools/inspect/homeToys.ts');
  const { SKILLS } = await import('../../../tools/inspect/firsttimer.ts');
  const race = (setting: 'normal' | 'easy', seed: number) => {
    let piece: PacerPiece | undefined;
    const r = homeRun('middle', setting, seed, 1, { onFrame: (sim: { e: unknown }) => { piece ??= ((sim.e as { pieces: unknown[] }).pieces.find((q) => (q as PacerPiece).kind === 'pacer') as PacerPiece | undefined); } } as never);
    assert.equal(r.end, 'shrine', `${setting} seed ${seed}: finishes`);
    return piece!.verdict!;
  };
  for (const setting of ['normal', 'easy'] as const) for (const seed of [1, 2, 3]) {
    const v = race(setting, seed);
    assert.ok(v.won, `middle ${setting} seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
  }
  const was = { race: SKILLS.race, rideOnly: SKILLS.rideOnly };
  try {
    Object.assign(SKILLS, { race: false, rideOnly: true });
    for (const setting of ['normal', 'easy'] as const) for (const seed of [1, 2, 3]) {
      const v = race(setting, seed);
      assert.ok(!v.won, `ride-only ${setting} seed ${seed}: ${v.him} s against the boat's ${v.boat} s`);
    }
  } finally {
    Object.assign(SKILLS, was);
  }
});
