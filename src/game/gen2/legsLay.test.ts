// A stage of LEGS (R-165.196): the lay across mixed travel (pipeline.ts layStage, legs.ts), on the fixture world (toyLegs.ts).
// No stage of the game is built here; the fixture's id is the test's own.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { towerCfg } from './toyTower.ts';
import { DOWN_CODE, legsKit, MIXED_CODE, UP_CODE } from './toyLegs.ts';
import { WALL } from './legs.ts';
import { TOWER } from './tower.ts';
import { validateStage } from '../levelCheck.ts';
import { flyTower, withTowerSim } from '../../../tools/engine/towerFly.ts';

const ID = '5-95';
const build = (code: string, seed: number, difficulty: 'normal' | 'easy' = 'normal') => buildGen2Stage({ config: towerCfg(ID, 'sprint'), kit: legsKit(ID, code), seed, difficulty });
const errorsOf = (st: ReturnType<typeof build>) => [...(st.gen2.errors ?? []), ...validateStage(st).errors.map((e) => `levelCheck: ${e}`)];

test('legs lay: a graph with no leg mark is a run, laid as ever: no node names a travel, no route is kept', () => {
  const st = build('A P M R X R S E', 1);
  assert.equal(st.gen2.graph.nodes.some((n) => n.travel), false);
  assert.equal(st.gen2.tower, undefined);
  assert.equal(st.config.travel, undefined);
});

test('legs lay: each node keeps its leg through the brief\'s rules (a quiet brief drops the finale and the rest before the exit)', () => {
  const st = build('A P /U U^ C R /R M R S R L E', 1);
  const nodes = st.gen2.graph.nodes.map((n) => `${n.job}:${n.travel ?? '-'}`);
  assert.deepEqual(nodes, ['arrive:-', 'practise:-', 'climb:up', 'combine:up', 'rest:up', 'flow:right', 'rest:right', 'signature:right', 'exit:right']);
});

for (const [name, code, want] of [['up', UP_CODE, ['right', 'up', 'right']], ['down', DOWN_CODE, ['right', 'down', 'right']], ['mixed', MIXED_CODE, ['right', 'down', 'right', 'up', 'right']]] as const) {
  test(`legs lay: the ${name} fixture is laid leg by leg, clean on 6 seeds and both settings, the same stage from the same seed`, () => {
    for (let seed = 1; seed <= 6; seed++) {
      const st = build(code, seed);
      assert.deepEqual(errorsOf(st), [], `seed ${seed}`);
      const T = st.gen2.tower!;
      assert.equal(T.flow, 'legs');
      assert.deepEqual(T.legs!.map((g) => g.travel), want);
      // (the legs hold every section, in order, none twice)
      assert.equal(T.legs![0].i0, 0);
      T.legs!.forEach((g, k) => assert.equal(g.i0, k ? T.legs![k - 1].i1 : 0));
      assert.equal(T.legs![T.legs!.length - 1].i1, st.gen2.sections.length);
      // (the stage ends on a leg laid right: it names no travel, as a run, and the totem is its furthest piece's)
      assert.equal(st.config.travel, undefined);
      assert.deepEqual(build(code, seed).platforms, st.platforms);
      const easy = build(code, seed, 'easy');
      assert.deepEqual(errorsOf(easy), [], `seed ${seed} easy`);
      assert.deepEqual(easy.gen2.plan.map((p) => p.template), st.gen2.plan.map((p) => p.template), 'Easy lays Normal\'s sections');
    }
  });
}

test('legs lay: a column up stands where he left the run: a doorway behind him, walls to its top, a floor under it, a ledge out over the far wall', () => {
  for (let seed = 1; seed <= 6; seed++) {
    const st = build(UP_CODE, seed);
    const [run, col, on] = st.gen2.tower!.legs!;
    const F = col.frame!;
    const way = st.gen2.tower!.route.legs;
    const before = way[run.i1 - 1], first = way[on.i0];
    // (it begins at the tip of the ledge he leaves, the vine's room and the wall's kept behind it)
    assert.equal(F.x0, before.exit.x - TOWER.wall - TOWER.vineIn);
    assert.equal(F.x1 - F.x0, TOWER.width);
    const wallsL = st.platforms.filter((p) => p.x === F.x0 - WALL.w && p.width === WALL.w), wallsR = st.platforms.filter((p) => p.x === F.x1 && p.width === WALL.w && p.height > 100);
    assert.equal(wallsL.length, 1, 'one wall behind him');
    assert.equal(wallsR.length, 1, 'one wall ahead');
    // (the doorway: the wall behind him hangs a storey's clearance over the ledge he walks in on, and reaches past any jump off the top)
    assert.equal(wallsL[0].y + wallsL[0].height, before.exit.y - TOWER.clear);
    assert.ok(wallsL[0].y <= col.y0 - WALL.over);
    // (the floor: plain ground from that ledge to the far wall, at its height)
    assert.ok(st.platforms.some((p) => p.y === before.exit.y && p.x === before.exit.x && p.x + p.width === F.x1), 'the column\'s floor');
    // (the way out: the far wall ends at the ledge he leaves by, and the next leg begins at its outer face, at that height)
    const ledge = st.platforms.find((p) => p.height <= 30 && p.x < F.x1 && p.x + p.width === F.x1 + WALL.w);
    assert.ok(ledge, 'the ledge out, over the wall');
    assert.equal(wallsR[0].y, ledge.y);
    assert.equal(on.ground, ledge.y, 'the next leg stands on the ledge\'s height');
    assert.ok(first.entry.x >= F.x1 + WALL.w);
    // (every section of the leg lies inside the column, a wall's keep from each side)
    for (const q of way.slice(col.i0, col.i1)) assert.ok(q.x0 >= F.x0 + TOWER.wall - 1 && q.x1 <= F.x1 - TOWER.wall + 1, `${q.uid} inside the column`);
    // (and the column climbs: its top stands over the ledge he came in on by every turn it holds)
    assert.ok(col.turns!.length >= 2 && col.turns!.every((t) => t.to < t.from));
    assert.ok(ledge.y < before.exit.y - 2 * TOWER.turn);
  }
});

test('legs lay: a way down is a shaft under the ledge he leaves: walls, a floor wall to wall, and a doorway out at its foot', () => {
  for (let seed = 1; seed <= 6; seed++) {
    const st = build(DOWN_CODE, seed);
    const [run, col, on] = st.gen2.tower!.legs!;
    const F = col.frame!;
    const way = st.gen2.tower!.route.legs;
    const before = way[run.i1 - 1], first = way[on.i0];
    assert.equal(F.x0, before.exit.x, 'the shaft begins at the tip of the ledge he leaves');
    const floor = st.platforms.find((p) => p.y === col.floorY && p.x === F.x0 && p.width === TOWER.width + WALL.w);
    assert.ok(floor, 'the floor, wall to wall and out through the doorway');
    assert.ok(col.floorY! > before.exit.y + 2 * TOWER.turn, 'it comes down');
    // (the wall ahead ends a storey's clearance over the floor: the doorway; the one behind him reaches the floor)
    const ahead = st.platforms.filter((p) => p.x === F.x1 && p.width === WALL.w), behind = st.platforms.filter((p) => p.x === F.x0 - WALL.w && p.width === WALL.w);
    assert.equal(ahead.length, 1);
    assert.equal(ahead[0].y + ahead[0].height, col.floorY! - TOWER.clear);
    assert.equal(behind.length, 1);
    assert.equal(behind[0].y + behind[0].height, col.floorY);
    assert.equal(on.ground, col.floorY, 'the next leg stands on the shaft\'s floor');
    assert.ok(first.entry.x >= F.x1 + WALL.w);
    assert.ok(col.turns!.every((t) => t.to > t.from));
  }
});

test('legs lay: the run after a column stands on its own ground: its corridor is measured from where it begins', () => {
  for (let seed = 1; seed <= 6; seed++) {
    const st = build(UP_CODE, seed);
    const M = legsKit(ID, UP_CODE).manifest;
    const on = st.gen2.tower!.legs![2];
    const way = st.gen2.tower!.route.legs;
    const y = on.ground!;
    // (every section of the leg ends inside the corridor moved to the leg's own ground: the run's own stray line, 20 px past it)
    for (const q of way.slice(on.i0, on.i1)) assert.ok(q.exit.y >= y - (M.ground.y - M.corridor.top) - 20 && q.exit.y <= y + (M.corridor.bottom - M.ground.y) + 20, `${q.uid} at ${q.exit.y}, ground ${y}`);
  }
});

test('legs lay: a plain flyer in the real engine walks the run, climbs the column, leaves over its wall and reaches the shrine', () => {
  for (const seed of [1, 2]) {
    const f = withTowerSim(towerCfg(ID, 'sprint'), legsKit(ID, UP_CODE), seed, 'normal', (sim) => flyTower(sim, 400));
    assert.equal(f.end, 'shrine', `seed ${seed}: ${JSON.stringify(f.at)}`);
    assert.equal(f.legs, f.of);
    assert.equal(f.falls, 0);
  }
});

test('legs lay (planted): with the column\'s first vine cut the flyer is stranded at its foot: the vine is the way up', () => {
  let foot = 0;
  const f = withTowerSim(towerCfg(ID, 'sprint'), legsKit(ID, UP_CODE), 1, 'normal', (sim) => {
    const T = (sim.stage as unknown as { gen2: { tower: { legs: Array<{ i1: number; turns?: Array<{ x: number }> }> } } }).gen2.tower;
    foot = T.legs[0].i1;
    const x = T.legs[1].turns![0].x;
    const k = sim.vines.findIndex((v) => v.x === x);
    assert.ok(k >= 0);
    sim.vines.splice(k, 1);
    return flyTower(sim, 120);
  });
  assert.notEqual(f.end, 'shrine');
  assert.equal(f.legs, foot, `he finished the run before the column and no more (${f.legs} sections)`);
});
