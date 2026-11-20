// ENG-26b step 6 (reference/design/2-6.md NEW 1-2; ENG-26's water wheel): the meter prices a water wheel ridden from its jetty to its
// street, on ENG-26's wheel toys rolled the game's way (src/game/wheelFixtureStage.ts, the toys' one kit). Each test plants the fault it
// exists for: the route hopping onto the buckets as moving ledges on no clock (the meter refused the stage, 'unpriced platform:moving'),
// the channel gone (the coverage gate and the meter refuse).
import '../../src/game/headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { buildGen2Stage, keptFoes } from '../../src/game/gen2/pipeline.ts';
import { packPlan, plantSeedList } from '../../src/game/gen2/seedList.ts';
import { withFixtureConfig, RealPlay } from '../../src/game/realPlay.ts';
import { w2Finish } from '../../src/game/gen2/worlds/w2.ts';
import { flownKey, stageWheels } from '../../src/game/gen2/wheelLay.ts';
import { WHEEL_FLOWN } from '../../src/game/gen2/wheelFlights.data.ts';
import { turnTime } from '../../src/game/wheel.ts';
import { cfg, fixtureSeed, ID, kitFor, type WheelToy } from '../../src/game/wheelFixtureStage.ts';
import { findRoute } from '../inspect/route.ts';
import { scoreStage, windowBits, wheelChallenges, MOVE_CHANNEL, UnpricedPiece, COVERAGE_KNOWN } from './score.ts';
import { judge, vocabulary, TABLE_FILE, type Table } from './coveragecheck.ts';

const ROOT = path.resolve(import.meta.dirname, '../..');
const TABLE: Table = JSON.parse(fs.readFileSync(path.join(ROOT, TABLE_FILE), 'utf8'));

/** run `fn` with the toy tower of wheel `row` planted as the stage ID, rolled the game's way on `setting` */
function onToy<T>(row: WheelToy, setting: 'normal' | 'easy', fn: (seed: number) => T): T {
  const seed = fixtureSeed(row);
  assert.ok(seed !== null, `no roll lays the ${row} wheel clean`);
  const kit = kitFor(row);
  const st = buildGen2Stage({ config: cfg, kit, seed: seed!, difficulty: setting });
  const dict: string[] = [];
  const packed = packPlan({ seed: st.gen2.seed, rerolls: st.gen2.rerolls, plan: st.gen2.plan, foes: [...keptFoes(st)] }, dict);
  return withTestStage({ [ID]: { kit: () => kit, world: (s, _sq, d) => w2Finish(s as never, d) as typeof s, seeds: [] } }, () => {
    const undo = plantSeedList(ID, { dict, seeds: [seed!], plans: [packed] });
    try { return withFixtureConfig(cfg, () => fn(seed!)); } finally { undo(); }
  });
}

test('THE ROUTE rides a wheel as ONE move, the jetty to the street: never a hop onto a bucket (PLANTED: the old route hopped on and off them)', () => {
  for (const row of ['edge', 'teach', 'top'] as const) onToy(row, 'normal', (seed) => {
    const st: any = new RealPlay(ID, seed).stage;
    const w = stageWheels(st.platforms)[0];
    const route = findRoute(st, [], { steps: true });
    const wheel = route.segs.filter((s) => s.kind === 'wheel');
    assert.equal(wheel.length, 1, `${row}: ${route.segs.map((s) => s.kind).join(' ')}`);
    assert.equal(wheel[0].from?.id, w.lay!.jetty, `${row}: from the jetty`);
    assert.equal(wheel[0].plat?.id, w.lay!.streetId, `${row}: to the street`);
    // (no other move lands on or leaves a bucket: the buckets are no floor of the route's)
    assert.ok(!route.segs.some((s) => s.plat?.wheel || s.from?.wheel), `${row}: a move onto a bucket`);
    // (the time: a wait for a bucket, then the ride up half a turn)
    assert.ok(wheel[0].dt >= turnTime(w) / 2 && wheel[0].dt <= turnTime(w), `${row}: ${wheel[0].dt} s`);
  });
});

test('THE CHANNEL prices the board and the step-off from the flown table, the easiest way; an in-street asks no step-off; both settings', () => {
  for (const row of ['edge', 'teach', 'top'] as const) for (const d of ['normal', 'easy'] as const) onToy(row, d, (seed) => {
    const r = scoreStage(ID, d, seed, new Map());
    assert.ok(r.pieces.includes('move:wheel'), r.pieces.join(' '));
    const st: any = new RealPlay(ID, seed).stage;
    const w = stageWheels(st.platforms)[0];
    const f = WHEEL_FLOWN[flownKey({ R: w.R, V: w.V, N: w.N, W: w.W, street: w.lay!.street, up: w.lay!.up }, d)];
    const board = r.challenges.filter((c) => c.kind === 'wheel-board');
    const off = r.challenges.filter((c) => c.kind === 'wheel-off');
    assert.equal(board.length, 1, `${row} ${d}: ${r.challenges.map((c) => c.kind).join(' ')}`);
    // (every World 2 row boards at every moment, 2-6.md: no timing asked)
    assert.equal(f.board.tap.share, 100);
    assert.equal(board[0].bits, 0, board[0].note);
    if (row === 'teach') assert.equal(off.length, 0, `${row} ${d}: the ride sets him down on an 'in' street`);
    else {
      assert.equal(off.length, 1, `${row} ${d}`);
      assert.ok(Math.abs(off[0].bits - windowBits(turnTime(w), f.step)) < 1e-9, off[0].note);
      assert.ok(off[0].bits > 1.5 && off[0].bits < 4, `${row} ${d}: ${off[0].bits}`);
    }
    for (const c of [...board, ...off]) assert.equal(c.cost, 'soft', 'a miss is the safe pond: back onto the jetty');
  });
});

test('PLANTED: a wheel whose row was never flown is refused by the channel, never priced from a guess', () => {
  onToy('edge', 'normal', (seed) => {
    const st: any = new RealPlay(ID, seed).stage;
    const route = findRoute(st, [], { steps: true });
    const w = stageWheels(st.platforms)[0];
    const was = w.V;
    w.V = was + 1;
    try {
      assert.throws(() => wheelChallenges(st, route, [], 'normal', ID), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'move:wheel');
    } finally { w.V = was; }
  });
});

test('PLANTED: without its channel a stage laying a wheel is refused by the meter and failed by the coverage gate', () => {
  onToy('edge', 'normal', (seed) => {
    const ch = MOVE_CHANNEL as Record<string, string | undefined>;
    const was = ch.wheel;
    delete ch.wheel;
    try {
      assert.throws(() => scoreStage(ID, 'normal', seed, new Map()), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'move:wheel');
    } finally { ch.wheel = was; }
    const pieces = scoreStage(ID, 'normal', seed, new Map()).pieces;
    const uses = new Map(pieces.map((p) => [p, new Set([ID])]));
    const t: Table = { ...TABLE, pieces: { ...TABLE.pieces, 'move:wheel': { ...TABLE.pieces['move:wheel'], channel: null } } };
    const f = judge(vocabulary(), t, [...COVERAGE_KNOWN], uses, []).faults;
    assert.ok(f.some((x) => x.startsWith(`(b) move:wheel on ${ID}: no channel`)), f.join('\n'));
    assert.deepEqual(judge(vocabulary(), TABLE, [...COVERAGE_KNOWN], uses, []).faults.filter((x) => /wheel/i.test(x)), []);
  });
});
