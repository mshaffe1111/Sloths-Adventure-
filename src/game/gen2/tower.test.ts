/**
 * A stage laid UP (R-165.170 piece 1, the ascent lay): gen2's one lay (pipeline.ts layStage) builds a tower storey over storey for an
 * ascent, proven on a FIXTURE (toyTower.ts), never on a stage of the game. Every roll is clean by its own verdicts and by levelCheck,
 * is the same roll again from its seed and from its packed plan (the seed list's replay), and Easy is Normal's tower. tower.ts's pure
 * pieces are held one by one. Each rule here has a planted fault that turns it red: reference/qa-reports/FA/planted-faults.py.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { validateStage } from '../levelCheck.ts';
import { MODEL_FAST, MODEL_TYPICAL, modelStage, walkSpeed } from '../stageTime.ts';
import { DOUBLE_RISE, WALL_H } from '../physics.ts';
import { MODES } from '../stageModes.ts';
import type { Platform, Vine } from '../types.ts';
import { applyVerdicts, buildGen2Stage, HARD_JOBS, keptFoes, layLocal, layStage, missionGraph, planBudget, rngFor, rollErrors, ROLLED_FLAGS } from './pipeline.ts';
import { packPlan, stageParts, unpackPlan } from './seedList.ts';
import { landingsOf } from './landings.ts';
import { isWaterFloor, waterFloors } from './wheelLay.ts';
import type { RiverZone } from '../river.ts';
import { LAND_FLIGHTS } from './landFlights.data.ts';
import { cfg as runCfg, kit as runKit } from './toyWorld.ts';
import { ARC_CODE, arcKit, gateKit, hopsUp, towerCfg, upKit, upManifest } from './toyTower.ts';
import { fallSeconds, flagFurther, gapCatchY, LEAP, leaps, localExtent, openEnds, reflectLocal, routeAt, routeOf, runX, storeyLimit, TOWER, towerCatches, towerFalls, towerFlagBreaches, towerFlags, towerGateRoofs, towerGates, gateBand, towerSkips, towerVaults, vertical, walkOff } from './tower.ts';
import { CLIMB_CLEAR, VAULT_GAP } from '../vineTop.ts';
import type { Gen2Stage } from './types.ts';

const ID = '5-93';
const SEEDS = Array.from({ length: 12 }, (_, k) => k + 1);
const SETTINGS = ['normal', 'easy'] as const;
const upCfg = () => towerCfg(ID, 'ascent');
const built = new Map<string, Gen2Stage>();
/** the fixture going up, one build a seed and setting for the whole file */
const up = (seed: number, difficulty: 'normal' | 'easy' = 'normal'): Gen2Stage => {
  const k = `${seed} ${difficulty}`;
  if (!built.has(k)) built.set(k, buildGen2Stage({ config: upCfg(), kit: upKit, seed, difficulty }));
  return built.get(k)!;
};
const solid = (x: number, y: number, width: number, id = 1): Platform => ({ id, x, y, width, height: 24, type: 'solid' }) as Platform;

test('an ascent has a graph and it is laid up; a run names no flow and is laid right, with nothing of a tower on it', () => {
  const b = planBudget(upCfg(), upManifest, 'normal');
  assert.equal(b.flow, 'up', 'an ascent is laid up by its kind');
  assert.equal(missionGraph(b, upManifest, 1).flow, 'up');
  assert.equal(planBudget(towerCfg(ID, 'sprint', 'down'), upManifest, 'normal').flow, 'down', "a stage's data says it travels down");
  assert.equal(planBudget(towerCfg(ID, 'sprint', 'up'), upManifest, 'normal').flow, 'up', "and up, whatever its kind");
  // (a run: the budget names no flow, the graph runs right, and the built stage carries no travel and no tower)
  const rb = planBudget(runCfg('5-1', 'sprint'), runKit.manifest, 'normal');
  assert.equal('flow' in rb, false, 'a run names no flow (its budget is the one it always was)');
  assert.equal(missionGraph(rb, runKit.manifest, 1).flow, 'right');
  const run = buildGen2Stage({ config: runCfg('5-1', 'sprint'), kit: runKit, seed: 3, difficulty: 'normal' });
  assert.equal(run.config.travel, undefined);
  assert.equal(run.gen2.tower, undefined);
  assert.ok(!run.gen2.plan.some((p) => p.join === 'turn'), 'a run has no turn');
  assert.equal(vertical('right'), false);
});

test('the fixture tower rolls clean going up on 12 seeds, both settings: its own verdicts and levelCheck', () => {
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = up(seed, d);
    assert.deepEqual(st.gen2.errors ?? [], [], `up ${d} ${seed}`);
    const v = validateStage(st);
    assert.deepEqual(v.errors, [], `levelCheck, up ${d} ${seed}`);
    assert.equal(st.config.travel, 'up', 'the engine is told which way is on');
    assert.equal(st.gen2.graph.flow, 'up');
  }
});

test('a tower is a tower: it climbs many storeys inside its width, under the camera top, and its shrine stands at the top', () => {
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = up(seed, d);
    const T = st.gen2.tower!;
    assert.equal(st.config.levelWidth, T.width);
    assert.equal(T.width, TOWER.width, "the fixture names no width: the tower's own");
    for (const p of st.platforms) assert.ok(p.x >= 0 && p.x + p.width <= T.width, `up ${d} ${seed}: the piece at x ${p.x}-${p.x + p.width} is inside the tower`);
    const top = Math.min(...st.platforms.map((p) => p.y), ...st.vines.map((v) => v.topY));
    assert.ok(top >= 200, `up ${d} ${seed}: nothing is laid over the camera's top (top ${top})`);
    const turns = st.gen2.plan.filter((p) => p.join === 'turn').length;
    assert.ok(turns >= 8, `up ${d} ${seed}: ${turns} storeys`);
    assert.ok(st.spawnY - st.exitTotemY >= turns * TOWER.turn, `up ${d} ${seed}: the shrine is ${st.spawnY - st.exitTotemY} px over the start`);
    // (the shrine is the highest thing he stands on: nothing is laid over the summit)
    const summit = st.platforms.find((p) => st.exitTotemX >= p.x && st.exitTotemX <= p.x + p.width && Math.abs(p.y - st.exitTotemY) < 60);
    assert.ok(summit, `up ${d} ${seed}: the totem stands on a piece`);
    assert.ok(st.platforms.every((p) => p.y >= summit!.y - 1), `up ${d} ${seed}: nothing stands over the summit`);
    // (the floor is ground wall to wall: a fall from the first storeys lands, never leaves the tower)
    const floor = st.platforms.filter((p) => Math.abs(p.y - T.floorY) <= 1).sort((a, b) => a.x - b.x);
    let reach = 0;
    for (const p of floor) if (p.x <= reach + 1) reach = Math.max(reach, p.x + p.width);
    assert.ok(reach >= T.width - 1, `up ${d} ${seed}: the floor runs to x ${reach} of ${T.width}`);
  }
});

test('a storey is a climb: every turn rises more than any jump, on a vine that joins the two storeys', () => {
  for (const seed of SEEDS) {
    const st = up(seed);
    const R = st.gen2.tower!.route;
    let turns = 0;
    st.gen2.plan.forEach((slot, k) => {
      if (slot.join !== 'turn') return;
      turns++;
      const leg = R.legs[k], before = k ? R.legs[k - 1].exit : R.spawn;
      const rise = before.y - leg.entry.y;
      assert.ok(rise >= TOWER.turn, `up ${seed} slot ${k}: the turn rises ${rise} px (at least ${TOWER.turn})`);
      assert.ok(rise > DOUBLE_RISE + 30, 'no jump climbs a storey: the vine is the way');
      const vine = st.vines.find((v: Vine) => v.vineType === 'tree_climb' && Math.abs(v.topY - leg.entry.y) <= 30 && v.bottomY >= before.y - 30 && Math.abs(v.x - leg.entry.x) <= 80);
      assert.ok(vine, `up ${seed} slot ${k}: a climbing vine joins y ${before.y} to y ${leg.entry.y} by x ${leg.entry.x}`);
      // (the stage names the turn where its vine stands, after the vine was moved off the ledge's face: the bots and the verdicts read it)
      const t = st.gen2.tower!.turns[turns - 1];
      assert.deepEqual([t.x, t.to, t.from], [vine!.x, leg.entry.y, before.y], `up ${seed} slot ${k}: the turn is recorded where its vine is`);
    });
    assert.ok(turns > 0);
    const all = st.gen2.tower!.turns.length;
    assert.ok(all === turns || all === turns + 1, `the sections' turns, and the last vine to the shrine where its ledge is a storey up (${all} of ${turns})`);
  }
});

test('the same seed is the same tower; another seed is another; and its packed plan lays it again (the seed list replay)', () => {
  for (const seed of [1, 5, 9]) {
    const a = up(seed);
    const b = buildGen2Stage({ config: upCfg(), kit: upKit, seed, difficulty: 'normal' });
    assert.deepEqual(stageParts(b), stageParts(a), `seed ${seed} twice`);
    const dict: string[] = [];
    const packed = packPlan({ seed: a.gen2.seed, rerolls: a.gen2.rerolls, plan: a.gen2.plan, foes: [...keptFoes(a)] }, dict);
    const replay = unpackPlan(packed, dict);
    assert.ok(replay.plan.some((p) => p.join === 'turn'), 'the packed plan keeps its turns');
    assert.deepEqual(replay.plan.map((p) => p.join), a.gen2.plan.map((p) => p.join));
    for (const d of SETTINGS) {
      const again = buildGen2Stage({ config: upCfg(), kit: upKit, seed, difficulty: d, replay });
      assert.deepEqual(again.gen2.errors ?? [], [], `replay ${d} ${seed}`);
      assert.deepEqual(stageParts(again), stageParts(up(seed, d)), `replay ${d} ${seed} is the search's own tower`);
    }
  }
  assert.notDeepEqual(stageParts(up(1)).platforms, stageParts(up(2)).platforms);
});

test("Easy is Normal's tower: the same sections in the same order, no more animals, its flags kept", () => {
  for (const seed of SEEDS) {
    const n = up(seed), e = up(seed, 'easy');
    // (where a storey turns is the lay's geometry, and Easy's landings are wider: the turns may fall a section apart, never the sections)
    assert.deepEqual(e.gen2.plan.map((p) => p.template), n.gen2.plan.map((p) => p.template), `seed ${seed}`);
    assert.ok(e.enemies.length <= n.enemies.length, `seed ${seed}: Easy has ${e.enemies.length} animals, Normal ${n.enemies.length}`);
    assert.ok((e.checkpoints ?? []).length >= (n.checkpoints ?? []).length - 1, `seed ${seed}: Easy keeps its flags`);
  }
});

test('reflectLocal: a storey that runs left is the section mirrored about its entry, every height kept', () => {
  const b = planBudget(upCfg(), upManifest, 'normal');
  const L = layLocal(hopsUp, b, rngFor(7, 11, 0), false, { pickRng: rngFor(7, 19, 0) });
  const M = reflectLocal(L);
  assert.deepEqual({ ...M.exit, x: -M.exit.x }, L.exit, 'the exit is as far on and as high');
  assert.equal(M.exit.y, L.exit.y, 'a rise is still a rise');
  assert.ok(L.exit.y < 0, 'the fixture section climbs');
  L.pieces.forEach((p, k) => {
    const q = M.pieces[k];
    assert.equal(q.y, p.y);
    assert.equal(q.w, p.w);
    assert.equal(Math.abs(q.x + q.w + p.x), 0, 'its far end is where its near end was, mirrored');
  });
  L.gaps.forEach((g, k) => assert.deepEqual([M.gaps[k].x0, M.gaps[k].x1], [-g.x1, -g.x0]));
  const eL = localExtent(L, 90), eM = localExtent(M, 90);
  assert.deepEqual([eM.x0, eM.x1, eM.low, eM.high].map((v) => v || 0), [-eL.x1, -eL.x0, eL.low, eL.high].map((v) => v || 0));
  assert.ok(eM.x1 <= 0 && eM.x0 < 0, 'it lies left of its entry');
  assert.deepEqual(reflectLocal(M).pieces.map((p) => [p.x || 0, p.y]), L.pieces.map((p) => [p.x || 0, p.y]), 'twice is itself');
});

test('storeyLimit: a storey keeps a double jump, his body and a margin clear of what it is laid over (or under)', () => {
  const below = [solid(100, 1000, 300)];
  // (going up over [150, 350]: its entry at or above 1000 - clear - what it reaches under its entry)
  assert.equal(storeyLimit('up', 150, 350, 24, 0, below, []), 1000 - TOWER.clear - 24);
  assert.ok(TOWER.clear > DOUBLE_RISE + 48, 'no double jump from the storey under it lands on it, with his body between');
  assert.equal(storeyLimit('up', 500, 700, 24, 0, below, []), Infinity, 'nothing laid in the span: no limit');
  assert.equal(storeyLimit('up', 150, 350, 24, 0, below, [{ id: 1, x: 200, topY: 700, bottomY: 1000 } as Vine]), 700 - TOWER.clear - 24, "a vine's top counts");
  assert.equal(storeyLimit('down', 150, 350, 24, 60, below, []), 1024 + TOWER.clear + 60, 'going down: under its underside, its own tops clear');
  assert.equal(storeyLimit('down', 500, 700, 24, 0, below, []), -Infinity);
});

test('in a built tower no storey is skipped: with any one turn\'s vine gone, the summit is out of reach', () => {
  // (what storeyLimit, TOWER.turn and the catches keep: no jump, no catch bough and no step climbs from a storey to the next; the
  // vine is the only way, so the stage is played storey by storey in the order it was laid)
  for (const seed of [1, 2, 3]) {
    const st = up(seed);
    const R = st.gen2.tower!.route;
    let n = 0;
    st.gen2.plan.forEach((slot, k) => {
      if (slot.join !== 'turn' || k % 3 !== seed % 3) return;
      const leg = R.legs[k], before = k ? R.legs[k - 1].exit : R.spawn;
      const vine = st.vines.find((v: Vine) => v.vineType === 'tree_climb' && Math.abs(v.topY - leg.entry.y) <= 30 && v.bottomY >= before.y - 30 && Math.abs(v.x - leg.entry.x) <= 80)!;
      const cut = validateStage({ ...st, vines: st.vines.filter((v) => v !== vine) });
      assert.ok(cut.errors.some((e) => /exit|shrine|totem/i.test(e) && /reach/i.test(e)), `up ${seed}: without the vine into slot ${k} (y ${before.y} to y ${leg.entry.y}) the shrine is still reached: ${cut.errors.slice(0, 2).join('; ') || 'no error'}`);
      n++;
    });
    assert.ok(n >= 5, `seed ${seed}: ${n} turns cut`);
  }
});

test('towerFalls: going up, a step off any end is caught by sound wood within a trunk section; a planted hole is named', () => {
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = up(seed, d);
    const T = st.gen2.tower!;
    assert.deepEqual(towerFalls('up', st.platforms, T.floorY, T.width), [], `up ${d} ${seed}`);
  }
  // (planted: a bough alone, 900 px over the floor, nothing under its ends)
  const floor = solid(0, 1900, 1280, 1), high = solid(500, 1100, 200, 2);
  const miss = towerFalls('up', [floor, high], 1900, 1280);
  assert.equal(miss.length, 2, 'both ends');
  assert.match(miss[0], /tower: a fall off the piece at x 500-700, y 1100 drops 800 px \(sound wood within 450\)/);
  assert.equal(openEnds([floor, high], 1900, TOWER.fall, 1280).length, 2);
  // (planted, ENG-26g: a catch bough under each end catches a STEP off it, but a running walk-off carries him on past it, 182 px out at
  // 400 px down: named as a running walk-off, both ends; boughs out under where the run comes down close them; a crumbling tile catches
  // nothing)
  const stepOnly = [floor, high, solid(380, 1500, 200, 3), solid(640, 1500, 200, 4)];
  const runs = towerFalls('up', stepOnly, 1900, 1280);
  assert.equal(runs.length, 2, `a step off each end is caught, the run off it is not: ${runs}`);
  assert.match(runs.join(';'), /^tower: a running walk-off off the piece at x 500-700, y 1100 drops 800 px \(sound wood within 450\);tower: a running walk-off off the piece at x 500-700, y 1100 drops 800 px/);
  assert.equal(openEnds(stepOnly, 1900, TOWER.fall, 1280).filter((e) => e.run).length, 2);
  assert.ok(Math.abs(runX(700, 1, 400, 1280) - 700 - 182) < 10 && Math.abs(500 - runX(500, -1, 400, 1280) - 182) < 10, 'the run comes down about 182 px out at 400 px down');
  const caught = [floor, high, solid(280, 1500, 300, 3), solid(640, 1500, 300, 4)];
  assert.deepEqual(towerFalls('up', caught, 1900, 1280), []);
  assert.equal(towerFalls('up', [floor, high, { ...solid(280, 1500, 300, 3), type: 'fragile' } as Platform, solid(640, 1500, 300, 4)], 1900, 1280).length, 1);
  // (a piece that gives way: sound wood under it inside a trunk section, or it is named; another piece that gives way is no catch)
  const limb = { ...solid(500, 1100, 200, 7), type: 'fragile' } as Platform;
  assert.match(towerFalls('up', [floor, limb], 1900, 1280).join(';'), /^tower: the piece at x 500-700, y 1100 gives way over a 800 px drop \(sound wood within 450\)$/);
  assert.deepEqual(towerFalls('up', [floor, limb, solid(380, 1500, 440, 8)], 1900, 1280), [], 'a short drop over sound wood: kept');
  assert.equal(towerFalls('up', [floor, limb, { ...solid(480, 1300, 240, 9), type: 'fragile' } as Platform], 1900, 1280).length, 2, 'a rotting bough under a rotting bough catches nothing');
  // (an end at the wall is no end: the engine keeps him inside the tower)
  assert.deepEqual(towerFalls('up', [floor, solid(0, 1100, 300, 5), solid(240, 1500, 300, 6)], 1900, 1280), []);
  // (and the run is held by the tower's sides: off an end 100 px from a wall it slides down the wall, at x 20 / width - 20, onto
  // wood that reaches the wall's clamp, LAND_SIDE inside it; wood stopping short of it lets him fall past)
  assert.equal(runX(1180, 1, 400, 1280), 1260);
  assert.deepEqual(walkOff([floor, solid(980, 1100, 200, 5), solid(1150, 1400, 130, 6)], solid(980, 1100, 200, 5), 1, 1280), { x: 1260, y: 1400 });
  assert.equal(walkOff([floor, solid(980, 1100, 200, 5), solid(1150, 1400, 90, 6)], solid(980, 1100, 200, 5), 1, 1280)?.y, 1900);
  // (a wall in the way, a solid piece WALL_H or taller met from the side: he slides down its face onto the wood under it, or is hoisted
  // onto it when his feet are within the hoist of its top)
  const ledge = solid(300, 1100, 200, 5);
  assert.deepEqual(walkOff([floor, ledge, { ...solid(560, 1000, 60, 6), height: 400 }, solid(300, 1450, 280, 7)], ledge, 1, 1280), { x: 541, y: 1450 });
  assert.equal(walkOff([floor, ledge, { ...solid(560, 1106, 60, 6), height: 200 }], ledge, 1, 1280)?.y, 1106);
  // (a river's water takes him by his middle, strictly inside its ends (river.ts riverAt): a run held at the wall, x 20, falls past
  // water that starts at x 30 (2-6's wheel pond, ENG-26g), and lands in water that starts at x 10)
  const nook = solid(114, 1100, 160, 5);
  assert.equal(walkOff([floor, nook, ...waterFloors([{ x0: 30, x1: 830, surfaceY: 1290 } as RiverZone])], nook, -1, 1280)?.y, 1900);
  assert.equal(walkOff([floor, nook, ...waterFloors([{ x0: 10, x1: 830, surfaceY: 1290 } as RiverZone])], nook, -1, 1280)?.y, 1290);
  assert.ok(isWaterFloor(waterFloors([{ x0: 0, x1: 10, surfaceY: 0 } as RiverZone])[0]) && !isWaterFloor(ledge));
  // (a mushroom's cap is no landing: it bounces him on along the flown bounce at a run, and where that comes down is judged)
  const cap = { ...solid(560, 1200, 60, 6), height: 30, type: 'bouncy' } as Platform;
  assert.equal(walkOff([floor, ledge, cap], ledge, 1, 1280)?.y, 1900, 'bounced on past everything: the floor');
  const on = walkOff([floor, ledge, cap, solid(700, 1300, 300, 7)], ledge, 1, 1280);
  assert.ok(on?.y === 1300 && on.x > 760, `the bounce comes down on the wood past the cap (${JSON.stringify(on)})`);
  assert.equal(towerFalls('up', [floor, ledge, cap, solid(100, 1400, 440, 8)], 1900, 1280).filter((l) => l.startsWith('tower: a running walk-off off the piece at x 300-500')).length, 1, 'a cap under the run is named, not counted as wood');
  assert.equal(fallSeconds(0), 0);
  assert.ok(Math.abs(fallSeconds(4 * TOWER.fall) - 2 * fallSeconds(TOWER.fall)) < 1e-9 && fallSeconds(TOWER.fall) > 0.4 && fallSeconds(TOWER.fall) < 1.5, 'a fall is timed from rest');
});

test('a running walk-off off any end of a built tower lands on sound wood within a trunk section (landings.ts Landings.walk, the engine\'s flown walk; every roll, both settings)', () => {
  // (ENG-26g, planted: before the judge flew the run, 24/24 of these rolls had an end whose step was caught and whose run fell 480-700
  // px or out of the tower. Judged here by the landing judge's own flights, not by tower.ts: the two must agree. An end whose run reaches
  // a side of the tower is the engine's wall's (walkOff, the planted cases above): Landings.walk has no wall)
  assert.deepEqual(LAND_FLIGHTS.easy.walk, LAND_FLIGHTS.normal.walk, 'a walk-off is the same flight on both settings (tower.ts flies the one path)');
  let ends = 0, walled = 0;
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = up(seed, d);
    const T = st.gen2.tower!;
    const L = landingsOf(st.platforms, d);
    const bad: string[] = [];
    for (const p of st.platforms) {
      if (p.type !== 'solid' || p.y >= T.floorY - 1) continue;
      L.walk(p).forEach((w, k) => {
        const side = k === 0 ? 1 : -1, end = side > 0 ? p.x + p.width : p.x;
        const at = runX(end, side, TOWER.fall, T.width);
        if (end + side * 24 < 20 || end + side * 24 > T.width - 20 || at <= 20 || at >= T.width - 20) return;
        // (a wall in the run's way, a solid piece WALL_H or taller beside his fall: Landings.walk stops the flight there; walkOff flies on
        // down it, judged by its planted cases above and by towerFalls)
        if (!w.piece && st.platforms.some((q) => q !== p && q.type === 'solid' && q.height >= WALL_H && q.y < p.y + TOWER.fall && q.y + q.height > p.y && (side > 0 ? q.x >= end - 2 && q.x < at + 30 : q.x + q.width <= end + 2 && q.x + q.width > at - 30))) { walled++; return; }
        ends++;
        const drop = w.piece ? w.piece.y - p.y : Infinity;
        if (drop > TOWER.fall) bad.push(`x ${p.x}-${p.x + p.width}, y ${p.y} ${side > 0 ? 'right' : 'left'}: ${Math.round(drop)} px`);
      });
    }
    assert.deepEqual(bad, [], `up ${d} ${seed}`);
  }
  assert.ok(ends > 500 && walled < ends / 10, `${ends} ends run off (${walled} met a wall)`);
});

test('towerCatches: every open end of a planted tower is given a catch, and no catch lets a jump climb a storey', () => {
  const floor = solid(0, 3000, 1280, 1);
  const storeys = [solid(300, 2400, 400, 2), solid(500, 1800, 400, 3), solid(300, 1200, 400, 4)];
  const turns = [{ x: 320, from: 3000, to: 2400 }, { x: 520, from: 2400, to: 1800 }, { x: 320, from: 1800, to: 1200 }];
  const level = (p: Platform) => p.id - 1;
  const before = towerFalls('up', [floor, ...storeys], 3000, 1280);
  assert.ok(before.length >= 4, `the planted tower has open ends (${before.length})`);
  const cs = towerCatches('up', [floor, ...storeys], [], 3000, 1280, [], level);
  assert.ok(cs.length > 0);
  const all = [floor, ...storeys, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.deepEqual(towerFalls('up', all, 3000, 1280), [], 'nothing is left to fall from');
  assert.deepEqual(towerSkips(turns, all), [], 'and no storey is climbed by its catches');
  // (each catch is of a storey: the one whose wood it runs on, or the one it hangs under; never across other wood at his chest)
  for (const c of cs) {
    assert.ok(c.level >= 0 && c.level <= 3);
    for (const q of [floor, ...storeys]) if (q.x < c.x + c.w && q.x + q.width > c.x && Math.abs(q.y - c.y) > 1) assert.ok(Math.abs(q.y - c.y) >= 84, `the catch at x ${c.x}, y ${c.y} keeps his body clear of the wood at y ${q.y}`);
  }
});

test("leaps: the tower's jump model says yes to everything the engine flies, and no to a turn", () => {
  const a = solid(0, 1000, 300);
  assert.ok(leaps(a, solid(300, 1000 - 214, 200)), 'the flown climb of a double jump onto a lip (214 px, reach.md §2)');
  assert.ok(LEAP.up >= 214 + 5 && LEAP.up < TOWER.turn, "a turn's rise is out of any jump, with the flown climb inside the model");
  assert.ok(!leaps(a, solid(300, 1000 - TOWER.turn, 200)), 'a turn is never jumped');
  assert.ok(leaps(a, solid(300 + 136, 1000 - 150, 60)), '150 px up across 136 px (the ladder the fixture rolled, below)');
  assert.ok(!leaps(a, solid(300 + 500, 1000 - 150, 60)), 'not across 500 px');
  assert.ok(leaps(a, solid(620, 1300, 200)), 'a fall carries');
  assert.ok(leaps(solid(400, 1000, 100), a), 'and it reads both ways across');
});

test('towerSkips: a planted ladder (a catch bough in reach of a hop\'s catch) is named; without it the vine is the only way', () => {
  // (the fixture's own roll, seed 3, before catches were laid by storey: a bough 116 px over the storey he leaves, a hop's catch 150
  // px up and 136 px across from it, and the hop's landing a hop over that: three jumps past the vine and two sections)
  const leaves = solid(471, 5829, 695, 1);
  const first = solid(114, 5548, 240, 2), hop = solid(414, 5493, 225, 3), top = solid(699, 5426, 202, 4);
  const hopCatch = solid(639, 5563, 60, 5), bough = solid(835, 5713, 180, 6);
  const turns = [{ x: 88, from: 5829, to: 5548 }];
  assert.deepEqual(towerSkips(turns, [leaves, first, hop, top, hopCatch]), [], 'the storey over him is a turn up: no jump');
  const miss = towerSkips(turns, [leaves, first, hop, top, hopCatch, bough]);
  assert.equal(miss.length, 1);
  assert.match(miss[0], /^tower: the storey at y 5548 is reached from y 5829 by jumps alone \(onto the piece at x 414-639, y 5493\): the vine at x 88 is not the only way up$/);
  // (a way down is not judged here)
  assert.deepEqual(towerSkips([{ x: 88, from: 5548, to: 5829 }], [leaves, first, hop, top, hopCatch, bough]), []);
});

test("a section's gap catches are its own wood: its extent reaches down to them, so a storey clears what it is laid over by them too", () => {
  const b = planBudget(upCfg(), upManifest, 'normal');
  const L = layLocal(hopsUp, b, rngFor(7, 11, 0), false, { pickRng: rngFor(7, 19, 0) });
  const e = localExtent(L, 90);
  const ys = L.gaps.map((g) => gapCatchY(g)).filter((y): y is number => y !== undefined);
  assert.ok(ys.length >= 1, 'the fixture hops have a catch under a gap');
  assert.equal(e.hang, Math.max(...ys));
  assert.ok(e.hang >= TOWER.hop && e.low >= e.hang + 24, `its lowest catch's top ${e.hang} px under its entry, its extent ${e.low}`);
  assert.equal(gapCatchY({ x0: 0, x1: 40, y: 0, lo: 0 }), undefined, 'a slot too narrow to fall in has none');
  assert.equal(gapCatchY({ x0: 0, x1: 90, y: 0, lo: 0, water: true }), undefined, 'nor a water gap');
  assert.equal(gapCatchY({ x0: 0, x1: 90, y: -60, lo: 0 }), TOWER.hop, 'one hop under the lower lip');
  // (in every built tower: no hop's catch lies inside a jump of the storey its section was turned up from)
  for (const seed of SEEDS) {
    const st = up(seed);
    assert.deepEqual(towerSkips(st.gen2.tower!.turns, st.platforms), [], `up ${seed}`);
  }
});

test('a built tower with a catch gone, or a ladder added, is refused by name: the verdicts are judged and fail the roll', () => {
  const req = { config: upCfg(), kit: upKit, seed: 4, difficulty: 'normal' as const };
  const st = up(4);
  assert.equal(st.gen2.towerMiss, undefined, 'the clean roll has no miss');
  // (a catch gone: take away, one at a time, a piece no leg's stretch holds, until a fall is left open)
  const legs = st.gen2.tower!.route.legs;
  const own = (p: Platform) => legs.some((g) => p.x + p.width > g.x0 + 2 && p.x < g.x1 - 2 && p.y >= Math.min(g.entry.y, g.exit.y) - 2 && p.y <= Math.max(g.entry.y, g.exit.y) + 2);
  const T = st.gen2.tower!;
  const gone = st.platforms.find((p) => !own(p) && p.y < T.floorY - 1 && towerFalls('up', st.platforms.filter((q) => q !== p), T.floorY, T.width).length > 0);
  assert.ok(gone, 'some catch is the only thing under an open end');
  const open: Gen2Stage = { ...st, platforms: st.platforms.filter((q) => q !== gone), gen2: { ...st.gen2, towerMiss: undefined, flagMiss: undefined, errors: [] } };
  applyVerdicts(open, req);
  assert.ok(open.gen2.towerMiss?.some((l) => /^tower: a fall off the piece at /.test(l)), `the fall is named: ${open.gen2.towerMiss}`);
  assert.ok(rollErrors(open.gen2).some((l) => /^tower: a fall off the piece at /.test(l)), 'and it fails the roll');
  // (a ladder added: a bough a jump over the ledge the third turn leaves, a jump under the storey it climbs to)
  const t = T.turns[2];
  const mid = Math.round((t.from + t.to) / 2);
  const rungs = [solid(0, mid, T.width, 9001)];
  const skipped: Gen2Stage = { ...st, platforms: [...st.platforms, ...rungs], gen2: { ...st.gen2, towerMiss: undefined, flagMiss: undefined, errors: [] } };
  applyVerdicts(skipped, req);
  assert.ok(skipped.gen2.towerMiss?.some((l) => /by jumps alone/.test(l) && l.includes(`the vine at x ${t.x} is not the only way up`)), `the skip is named: ${skipped.gen2.towerMiss}`);
  assert.ok(rollErrors(skipped.gen2).some((l) => /by jumps alone/.test(l)));
});

test('every piece of a storey, its hops\' catch boughs included, lies a turn or more over the ledge its vine stands on', () => {
  // (the lay's own record, layStage: a section's pieces and its seam, which holds its gaps' catches)
  // (seed 21: its turn at y 3317 is laid on ahead with nothing under the new storey, so only this rule lifts its hop's catch)
  let withCatch = 0;
  for (const seed of [...SEEDS, 21]) {
    const st = up(seed);
    assert.deepEqual(st.gen2.errors ?? [], [], `up ${seed}`);
    const b = planBudget(upCfg(), upManifest, 'normal');
    const laid = layStage(b, missionGraph(b, upManifest, st.gen2.seed), upKit, st.gen2.seed, { plan: st.gen2.plan });
    let ti = 0;
    laid.sections.forEach((q, k) => {
      if (laid.plan[k].join !== 'turn') return;
      const t = laid.tower!.turns[ti++];
      // (its hops' catch boughs: lip to lip under a gap between two of its own pieces. A tower catch bough filed in its seam, laid where
      // a running walk-off off one of its ends comes down, is of the storey `fair` reads it as, and towerSkips judges it with all the wood)
      const own = q.pieces.map((pp) => pp.platform);
      const lips = (p: Platform) => own.some((a) => Math.abs(a.x + a.width - p.x) <= 2) && own.some((b) => Math.abs(b.x - (p.x + p.width)) <= 2);
      const catches = q.seam.filter((p) => p.y > q.entry.y + 30 && p.y < t.from - 30 && lips(p));
      if (catches.length) withCatch++;
      for (const p of [...q.pieces.map((pp) => pp.platform), ...catches]) assert.ok(t.from - p.y >= TOWER.turn, `up ${seed} ${q.uid}: the piece at x ${p.x}, y ${p.y} is ${t.from - p.y} px over the ledge at y ${t.from} (a turn: ${TOWER.turn})`);
    });
  }
  assert.ok(withCatch >= 3, `sections with a catch under their entry were turned (${withCatch})`);
});

test("levelCheck: a tower's flags are in order when each is further ALONG THE ROUTE, though x runs both ways and a storey may hold two", () => {
  for (const st of [up(2), buildGen2Stage({ config: towerCfg(ID, 'sprint', 'up'), kit: upKit, seed: 2, difficulty: 'normal' })]) {
    assert.deepEqual(st.gen2.errors ?? [], []);
    const cps = st.checkpoints ?? [];
    const R = st.gen2.tower!.route;
    assert.ok(cps.length >= 6);
    assert.ok(cps.some((c, k) => k > 0 && c.x <= cps[k - 1].x), 'its flags run back in x on the storeys that run left');
    for (let k = 1; k < cps.length; k++) {
      assert.ok(routeAt(R, cps[k].x, cps[k].y) > routeAt(R, cps[k - 1].x, cps[k - 1].y), `flag ${k} is further along the way than the one before`);
      assert.ok(flagFurther(st, MODES.up, cps[k], cps[k - 1]) && !flagFurther(st, MODES.up, cps[k - 1], cps[k]), `flag ${k}: the engine takes it, and never goes back to the one before`);
    }
    assert.ok(!validateStage(st).errors.includes('checkpoints are out of order'));
    // (planted: the same flags in the wrong order are refused, on an ascent too)
    assert.ok(validateStage({ ...st, checkpoints: [...cps].reverse() }).errors.includes('checkpoints are out of order'), 'a flag that is no further on is out of order');
  }
  // (and a run's rule has not moved: flags that go back in x are out of order, and its order is its travel mode's)
  const run = buildGen2Stage({ config: runCfg('5-1', 'sprint'), kit: runKit, seed: 3, difficulty: 'normal' });
  assert.ok((run.checkpoints ?? []).length >= 2, 'the run has flags');
  assert.ok(validateStage({ ...run, checkpoints: [...run.checkpoints!].reverse() }).errors.includes('checkpoints are out of order'));
  assert.equal(flagFurther(run, MODES.right, { x: 500, y: 0 }, { x: 400, y: 900 }), true, 'a run: by x, as its mode says');
  assert.equal(flagFurther(run, MODES.right, { x: 400, y: 0 }, { x: 500, y: 0 }), false);
});

test('flagFurther: two flags on one storey both count, in the order he meets them (height calls neither further)', () => {
  // (a storey that runs LEFT along y 700 after a climb: flag a at x 800, flag b at x 400, further on though further left and no higher)
  const legs = [
    { uid: 's1', entry: { x: 200, y: 1000 }, exit: { x: 900, y: 1000 }, x0: 200, x1: 900 },
    { uid: 's2', entry: { x: 860, y: 700 }, exit: { x: 100, y: 700 }, x0: 100, x1: 860 },
  ];
  const st = { gen2: { tower: { route: routeOf('up', legs, { x: 100, y: 1000 }, { x: 150, y: 400 }) } } };
  const a = { x: 800, y: 700 }, b = { x: 400, y: 700 }, spawn = { x: 100, y: 1000 };
  assert.equal(MODES.up.further(b, a), false, 'by height the second flag is no further on: the old answer');
  assert.equal(flagFurther(st, MODES.up, b, a), true, 'along the route it is');
  assert.equal(flagFurther(st, MODES.up, a, b), false, 'and a flag touched going back never replaces it');
  assert.equal(flagFurther(st, MODES.up, a, spawn), true, 'the first flag is further on than the spawn');
  assert.equal(flagFurther(st, MODES.up, a, a), false, 'a flag is not further on than itself');
  // (a stage with no route: its travel mode's answer)
  assert.equal(flagFurther({}, MODES.up, b, a), false);
  assert.equal(flagFurther({}, MODES.up, { x: 0, y: 600 }, a), true);
});

const RULE = { first: 700, min: 900, max: 4000, last: 2000, before: 2400, clear: 1500 };
/** a hand-built tower's route: `n` storeys 1,000 px long, 300 px apart, each turned back over the last */
const zigzag = (n: number) => {
  const legs = Array.from({ length: n }, (_, k) => {
    const y = 5000 - 300 * k, right = k % 2 === 0;
    return { uid: `s${k + 1}`, entry: { x: right ? 140 : 1140, y }, exit: { x: right ? 1140 : 140, y }, x0: 140, x1: 1140 };
  });
  const last = legs[n - 1];
  return routeOf('up', legs, { x: 140, y: 5000 }, { x: last.exit.x, y: last.exit.y - 300 });
};
const storeySpots = (n: number) => Array.from({ length: n }, (_, k) => ({ x0: 240, x1: 1040, y: 5000 - 300 * k }));

test("towerFlags: Matt's flag rule measured along the climb: a flag before each hard node, none close, no span over the cap, the last near the exit", () => {
  const R = zigzag(12);
  assert.equal(R.length, 12 * 1000 + 12 * 300, '15,600 px of way: 12 storeys and 12 climbs');
  // (hard nodes begin 6,000 and 13,000 px along: the span rule alone, which steps from the start, lays no flag 1,500-2,400 px before
  // the first of them (its flags fall at about 1,980, 3,500 and 5,480): only the hard node's own flag does)
  const hard = [6000, 10 * 1300];
  const spanOnly = towerFlags(R, storeySpots(12), [], RULE).map((f) => f.s);
  assert.ok(!spanOnly.some((s) => s <= hard[0] - RULE.clear && s >= hard[0] - RULE.before), `the planted case: the span rule's flags ${spanOnly.map(Math.round)} miss the window before ${hard[0]}`);
  const flags = towerFlags(R, storeySpots(12), hard, RULE);
  const ss = flags.map((f) => f.s);
  assert.deepEqual([...ss].sort((a, b) => a - b), ss, 'in the order he meets them');
  for (const h of hard) assert.ok(ss.some((s) => s <= h - RULE.clear && s >= h - RULE.before), `a flag ${RULE.clear}-${RULE.before} px of way before the hard node at ${h}: ${ss}`);
  assert.ok(ss[0] >= RULE.first, `the first ${ss[0]} px on`);
  for (let k = 1; k < ss.length; k++) assert.ok(ss[k] - ss[k - 1] >= RULE.min && ss[k] - ss[k - 1] <= RULE.max, `${ss[k] - ss[k - 1]} px of way between flags ${k} and ${k + 1}`);
  assert.ok(ss[0] <= RULE.max && R.length - ss[ss.length - 1] <= RULE.last, `the last ${R.length - ss[ss.length - 1]} px from the exit`);
  assert.deepEqual(towerFlagBreaches(R, flags, hard.map((s, k) => ({ id: `n${k}`, s })), RULE), [], 'and the verdict keeps what the pass laid');
  // (each stands on a spot, at its storey's height; two may share a storey: the measure is the way, not the height)
  for (const f of flags) assert.ok(storeySpots(12).some((sp) => sp.y === f.y && f.x >= sp.x0 && f.x <= sp.x1));
  // (measured by x, the old way, this tower would need no flag at all: its exit is 0 px to the right of its spawn)
  assert.ok(flags.length >= 5 && Math.abs(R.exit.x - R.spawn.x) < RULE.first, `${flags.length} flags on a tower whose x span is ${Math.abs(R.exit.x - R.spawn.x)} px`);
  // (a spot that is blocked, a wind's path or the like, is never stood on)
  const open = towerFlags(R, storeySpots(12), hard, RULE, (_x, y) => y === flags[0].y);
  assert.ok(open.every((f) => f.y !== flags[0].y));
  // (with no hard node the span rule alone lays them)
  const plain = towerFlags(R, storeySpots(12), [], RULE).map((f) => f.s);
  for (let k = 1; k < plain.length; k++) assert.ok(plain[k] - plain[k - 1] <= RULE.max && plain[k] - plain[k - 1] >= RULE.min);
  assert.ok(plain.length >= 4);
});

test('towerFlagBreaches, both ways (planted): none, too early, too far apart, a hard node with none before it, too far from the exit', () => {
  const R = zigzag(12);
  const at = (s: number) => { const k = Math.floor(s / 1300), d = s - k * 1300, right = k % 2 === 0; return { x: right ? 140 + d : 1140 - d, y: 5000 - 300 * k }; };
  const good = [1000, 4000, 7000, 10000, 13000, 14500].map(at);
  assert.deepEqual(towerFlagBreaches(R, good, [{ id: 'X', s: 9000 }], RULE), []);
  assert.deepEqual(towerFlagBreaches(R, [], [], RULE), ['flags: none']);
  assert.match(towerFlagBreaches(R, [at(400), ...good.slice(1)], [], RULE).join(';'), /flags: the first 400 px of way from the start \(at least 700\)/);
  assert.match(towerFlagBreaches(R, [good[0], ...good.slice(2)], [], RULE).join(';'), /flags: 6000 px of way apart after the flag at x 1140, y 5000 \(900-4000\)/);
  assert.match(towerFlagBreaches(R, [good[0], at(1500), ...good.slice(1)], [], RULE).join(';'), /flags: 500 px of way apart/);
  assert.match(towerFlagBreaches(R, good, [{ id: 'X', s: 6800 }], RULE).join(';'), /flags: none before the hard node X, 6800 px along the way \(within 2400 px\)/);
  assert.deepEqual(towerFlagBreaches(R, good, [{ id: 'X', s: 7100 }], RULE), [], 'a flag 100 px before it: kept');
  assert.match(towerFlagBreaches(R, good.slice(0, 5), [], RULE).join(';'), /flags: the last 2600 px of way from the exit \(within 2000\)/);
  // (the same flags given out of order are the same flags: the measure orders them)
  assert.deepEqual(towerFlagBreaches(R, [...good].reverse(), [{ id: 'X', s: 9000 }], RULE), []);
});

test("the time model walks a tower's route, not its width, and every roll is two minutes or more for a quick player", () => {
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = up(seed, d);
    const R = st.gen2.tower!.route;
    const m = modelStage(st, MODEL_TYPICAL);
    assert.ok(R.walk > 8 * st.config.levelWidth, `up ${d} ${seed}: he walks ${Math.round(R.walk)} px of storeys, many times the tower's ${st.config.levelWidth} px width`);
    assert.ok(m.total >= R.walk / walkSpeed(MODEL_TYPICAL), `up ${d} ${seed}: the model's ${Math.round(m.total)} s holds the walk of every storey (${Math.round(R.walk / walkSpeed(MODEL_TYPICAL))} s)`);
    assert.ok(modelStage(st, MODEL_FAST).total >= 120, `up ${d} ${seed}: a quick player takes ${Math.round(modelStage(st, MODEL_FAST).total)} s (STAGE-RULES §1: at least 2 minutes on every roll)`);
    // (and each beat carries its own seconds: its walk and its climbs)
    for (const q of st.gen2.sections) assert.ok(q.seconds > 0, `up ${d} ${seed}: ${q.uid} has seconds`);
  }
});

test('the route measure: a run is its x; a tower adds what he walks and climbs, storey by storey, never back', () => {
  const run = routeOf('right', [{ uid: 's1', entry: { x: 300, y: 500 }, exit: { x: 900, y: 500 }, x0: 300, x1: 900 }], { x: 100, y: 500 }, { x: 1200, y: 500 });
  assert.equal(routeAt(run, 640, 77), 540, "a run: x from the spawn, whatever the height (nothing a run's rules read moves)");
  // (two storeys: right along y 1000, a 300 px climb at x 900, then back left along y 700)
  const legs = [
    { uid: 's1', entry: { x: 200, y: 1000 }, exit: { x: 900, y: 1000 }, x0: 200, x1: 900 },
    { uid: 's2', entry: { x: 860, y: 700 }, exit: { x: 300, y: 700 }, x0: 300, x1: 860 },
  ];
  const R = routeOf('up', legs, { x: 100, y: 1000 }, { x: 250, y: 400 });
  assert.equal(R.legs[0].s0, 100);
  assert.equal(R.legs[1].s0, 100 + 700 + 40 + 300, 'the turn: 40 px back and 300 px up');
  assert.equal(R.legs[1].join, 340);
  assert.equal(R.length, 1140 + 560 + 50 + 300);
  assert.equal(R.walk, 100 + 700 + 40 + 560 + 50, 'what he walks: every px across, none of the climb');
  assert.equal(routeAt(R, 500, 1000), 400, 'on the first storey');
  assert.equal(routeAt(R, 500, 700), 1140 + 360, 'the same x one storey up is 1,100 px of way further on');
  assert.ok(routeAt(R, 400, 700) > routeAt(R, 800, 700), 'on a storey that runs left, further left is further on');
  // (a place off a leg's ends belongs to the storey at its height, never to the one over it that shares its x)
  assert.equal(routeAt(R, 100, 1000), 0, 'the spawn, left of the first section, is the start of the way');
  assert.equal(routeAt(R, 150, 1000), 50, 'and the runway is walked to it');
  assert.equal(routeAt(R, 950, 1000), 800, "a run-on past the first storey's end is that storey's end");
  assert.equal(routeAt(R, 950, 700), 1140 - 90, "and one 90 px behind the second storey's entry is 90 px short of it");
  assert.equal(routeAt(R, 2000, 700), 800, 'never short of the storey before');
});

test('a tower with a rolled graph (a designed arc) rolls clean: the same beats in the graph\'s order on every roll, a flag before every hard node along the climb', () => {
  const ARC = '5-94';
  const beats = ARC_CODE.split(' ').length;
  let hardSeen = 0;
  for (const d of SETTINGS) for (const seed of [1, 2, 3, 4, 5, 6]) {
    const st = buildGen2Stage({ config: towerCfg(ARC, 'ascent'), kit: arcKit(ARC), seed, difficulty: d });
    assert.deepEqual(st.gen2.errors ?? [], [], `arc ${d} ${seed}`);
    assert.deepEqual(validateStage(st).errors, [], `levelCheck, arc ${d} ${seed}`);
    assert.equal(st.gen2.graph.flow, 'up');
    assert.equal(st.gen2.graph.nodes.length, beats, 'the graph is the arc, node for node');
    // (the beats in order: each section's node is its graph's, never out of turn)
    const order = st.gen2.graph.nodes.map((n) => n.id);
    const at = st.gen2.sections.map((q) => order.indexOf(q.node));
    assert.deepEqual([...at].sort((a, b) => a - b), at, `arc ${d} ${seed}: the sections follow the graph`);
    assert.deepEqual([...new Set(at)], order.map((_n, k) => k), 'and every beat is laid');
    // (Matt's flag rule on the path, D49: a flag before each hard node, within `before` px of WAY ahead of it)
    const R = st.gen2.tower!.route;
    const hard = new Set(st.gen2.graph.nodes.filter((n) => n.job && HARD_JOBS.has(n.job)).map((n) => n.id));
    const seen = new Set<string>();
    const hs = st.gen2.sections.flatMap((q, k) => (hard.has(q.node) && !seen.has(q.node) && seen.add(q.node) ? [R.legs[k].s0] : []));
    assert.equal(hs.length, 5, 'the teach, the test, the twist, the signature and the combine');
    const fl = (st.checkpoints ?? []).map((c) => routeAt(R, c.x, c.y));
    for (const h of hs) {
      if (h < ROLLED_FLAGS.first + ROLLED_FLAGS.clear) continue; // (the spawn is its restart)
      hardSeen++;
      assert.ok(fl.some((f) => f <= h + 150 && f >= h - ROLLED_FLAGS.before), `arc ${d} ${seed}: a flag within ${ROLLED_FLAGS.before} px of way before the hard node at ${Math.round(h)} (flags ${fl.map(Math.round)})`);
    }
    assert.ok(fl[0] >= ROLLED_FLAGS.first && fl[0] <= ROLLED_FLAGS.max);
    for (let k = 1; k < fl.length; k++) assert.ok(fl[k] - fl[k - 1] >= ROLLED_FLAGS.min && fl[k] - fl[k - 1] <= ROLLED_FLAGS.max, `arc ${d} ${seed}: ${Math.round(fl[k] - fl[k - 1])} px of way between flags`);
    assert.ok(R.length - fl[fl.length - 1] <= ROLLED_FLAGS.last);
    // (by x this tower's flags would be 0-1,100 px apart, and the rule unreadable: the way is what is measured)
    assert.ok(R.length > 10 * st.config.levelWidth);
  }
  assert.ok(hardSeen >= 40, `hard nodes judged: ${hardSeen}`);
});

test('along the climb: no animal in the opening seconds of the way, and the quiet stretches are px of way', () => {
  let foes = 0;
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = up(seed, d);
    const R = st.gen2.tower!.route;
    const open = 5 * st.gen2.budget.walkSpeed;
    for (const e of st.enemies) {
      foes++;
      assert.ok(routeAt(R, e.x, e.y) >= open, `up ${d} ${seed}: the animal at x ${e.x}, y ${e.y} is ${Math.round(routeAt(R, e.x, e.y))} px along the way (the opening: ${Math.round(open)})`);
    }
    for (const [a, b] of st.gen2.barren) assert.ok(a >= 0 && b <= R.length + 1 && b > a, `up ${d} ${seed}: the quiet stretch ${a}-${b} is on the way (0-${Math.round(R.length)})`);
  }
  assert.ok(foes >= 3, `animals judged: ${foes}`);
});

test('a stage whose brief asks (GraphBrief.tags) has every laid piece tagged with its section and key; any other stage carries no tag', () => {
  const ARC = '5-94';
  const kit = arcKit(ARC);
  const briefs = kit.manifest.graphs!.briefs;
  const tagKit = { ...kit, manifest: { ...kit.manifest, graphs: { ...kit.manifest.graphs!, briefs: { [ARC]: { ...briefs[ARC], tags: true } } } } };
  const plain = buildGen2Stage({ config: towerCfg(ARC, 'ascent'), kit, seed: 2, difficulty: 'normal' });
  const tagged = buildGen2Stage({ config: towerCfg(ARC, 'ascent'), kit: tagKit, seed: 2, difficulty: 'normal' });
  const tagOf = (o: object) => (o as { tag?: string }).tag;
  assert.ok(plain.platforms.every((p) => tagOf(p) === undefined) && plain.vines.every((v) => tagOf(v) === undefined), 'not asked: the built stage is as it always was');
  const uids = new Set(tagged.gen2.sections.map((q) => q.uid));
  const tags = [...tagged.platforms, ...tagged.vines].map(tagOf).filter((t): t is string => !!t);
  assert.ok(tags.length >= 30, `${tags.length} pieces tagged`);
  for (const t of tags) assert.ok(/^s\d+:[\w-]+$/.test(t) && uids.has(t.split(':')[0]), `the tag ${t} is <section uid>:<piece key>`);
  for (const q of tagged.gen2.sections) assert.ok(tags.some((t) => t.startsWith(`${q.uid}:`)), `${q.uid} (${q.template}) has its pieces tagged`);
  assert.ok(tags.includes('s2:foot') && tags.includes('s2:vine') && tags.includes('s2:top'), "the teach brick's foot, vine and top are found by key");
  // (the tags are the only difference: the same stage, piece for piece)
  assert.deepEqual(tagged.platforms.map((p) => [p.x, p.y, p.width]), plain.platforms.map((p) => [p.x, p.y, p.width]));
});

test('towerGateRoofs (planted, ENG-26n, 1-4 cause C): the lay\'s wood over a gate, up to the storey its way on climbs to, across its section\'s full width', () => {
  // (1-4 Easy seed 10, gen2 19018, as laid on t-build-26 30570b384: s17's gate 481-841 @3342 over its foot 295-1027 @3702 (gateRun out
  // at both ends); its way on, the vine x 786, climbs to s18:b 360-760 @3061; the lay ran s18:b on to the wall, 760-1280 @3061, so every
  // inch of the gate was under wood 281 px up (LEAP.up is 221: towerGates' reach did not see it) and three bots stood on it 30 s and more)
  const gate = solid(481, 3342, 360, 1), foot = solid(295, 3702, 732, 2), next = solid(360, 3061, 400, 3);
  const vine = (x: number, id: number): Vine => ({ id, x, topY: 3342, bottomY: 3702, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' }) as Vine;
  const way: Vine = { id: 9, x: 786, topY: 3061, bottomY: 3342, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const V = [vine(541, 5), vine(621, 6), vine(701, 7), vine(781, 8), way];
  const own = [gate, foot];
  assert.deepEqual(gateBand(gate, own, V), { x0: 295, x1: 1027, y0: 3053, y1: 3372 }, 'its band: the foot\'s full width, from just under its level up to its way on\'s top');
  const bridge = solid(760, 3061, 520, 4);
  assert.deepEqual(towerGateRoofs([{ g: gate, own }], [bridge], V), ['tower: the shut gate at x 481-841, y 3342 has the lay\'s wood in its band (x 295-1027, y 3053-3372): the piece at x 760-1280, y 3061'], 'the bridge over it: refused by name');
  // (the next section's own bough over it is not the lay's; the lay's wood past the foot's end, or a storey up, or under its level, is clear)
  assert.deepEqual(towerGateRoofs([{ g: gate, own }], [], [...V, { ...way }]), []);
  assert.deepEqual(towerGateRoofs([{ g: gate, own }], [solid(1030, 3061, 250, 10), solid(300, 2740, 700, 11), solid(843, 3441, 180, 12)], V), []);
  // (over the gate's foot past the bough, gateRun's run-out: inside the band, though a hop across from the bough is all it is)
  assert.equal(towerGateRoofs([{ g: gate, own }], [solid(900, 3200, 100, 13)], V).length, 1);
  // (with no way on yet, the band reaches a hop over it: LEAP.up)
  assert.equal(gateBand(gate, own, V.slice(0, 4)).y0, 3342 - LEAP.up - 8);
});

test('towerGates (planted, B14\'s case): a bough the lay ran on beside a shut gate is one hop from a field vine\'s top; without it the gate holds', () => {
  // (1-4's seed 1: the gate bough 514-954 at y 4809 over its field's foot, vines hung under it; the lay's run-ons 0-514 and 1054-1280
  // at the same height)
  const gate = solid(514, 4809, 440, 1), foot = solid(400, 5209, 700, 2), next = solid(300, 4809 - 281, 500, 3);
  const vine = (x: number, id: number): Vine => ({ id, x, topY: 4809, bottomY: 5209, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' }) as Vine;
  const field = [vine(600, 1), vine(680, 2), vine(760, 3)];
  const way: Vine = { id: 9, x: 900, topY: 4809 - 281, bottomY: 4809, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  assert.deepEqual(towerGates([gate], [gate, foot, next], [...field, way]), [], 'the gate alone, the next storey a turn over it: it holds');
  const left = solid(0, 4809, 514, 4), right = solid(1054, 4809, 226, 5);
  const miss = towerGates([gate], [gate, foot, next, left, right], [...field, way]);
  assert.equal(miss.length, 1);
  assert.match(miss[0], /^tower: the shut gate at x 514-954, y 4809 is passed without opening it: the piece at x 0-514, y 4809 is reached by a hop from the top of the vine at x 600$/);
  assert.match(towerGates([gate], [gate, foot, next, right], [...field, way]).join(';'), /the piece at x 1054-1280, y 4809 is reached by a hop/, 'a hop past its far end too');
  // (a shelf a little under its level, or a bough a jump over it, is a way round as well; one far under it is not)
  assert.equal(towerGates([gate], [gate, foot, next, solid(960, 4809 + 20, 180, 6)], field).length, 1);
  assert.equal(towerGates([gate], [gate, foot, next, solid(1000, 4809 - 150, 180, 7)], field).length, 1);
  assert.deepEqual(towerGates([gate], [gate, foot, next, solid(960, 4809 + 200, 180, 8)], field), []);
  // (the vine that stands ON the gate is held down with it: its top is no way round)
  assert.deepEqual(towerGates([gate], [gate, foot, next], [way]), []);
  assert.deepEqual(towerGates([], [gate, foot, next, left, right], field), [], 'no sealed piece: nothing is judged');
});

test('towerCatches leaves a gate alone: a sealed piece is never run on, and no catch of another piece is laid level with it or a hop from it', () => {
  const floor = solid(0, 3000, 1280, 1), gate = solid(500, 2000, 300, 2), high = solid(900, 1900, 150, 3);
  const level = (p: Platform) => (p.id === 1 ? 0 : 1), sealed = (p: Platform) => p.id === 2;
  const byGate = (c: { x: number; y: number; w: number }) => c.y <= gate.y + 30 && c.y >= gate.y - LEAP.up && Math.max(0, c.x - (gate.x + gate.width), gate.x - (c.x + c.w)) <= 400;
  // (the gate alone, 1,000 px over the floor: unsealed, the lay runs it on to the walls; sealed, it lays nothing, and its falls are named)
  const open = towerCatches('up', [floor, gate], [], 3000, 1280, [], level);
  assert.ok(open.some((c) => c.y === gate.y), 'not sealed: the piece is run on at its own height (the planted case)');
  const kept = towerCatches('up', [floor, gate], [], 3000, 1280, [], level, sealed);
  assert.deepEqual(kept.filter(byGate), [], `sealed: nothing by the gate (${JSON.stringify(kept)})`);
  assert.equal(towerFalls('up', [floor, gate, ...kept.map((c, k) => solid(c.x, c.y, c.w, 50 + k))], 3000, 1280).length, 2, "and its two ends' falls are named: its own section owes the wood under them");
  // (another piece near it, 100 px higher: its catch is never run on over the gate nor hung beside it)
  const near = towerCatches('up', [floor, gate, high], [], 3000, 1280, [], level, sealed);
  assert.deepEqual(near.filter(byGate), [], `nothing of the other piece's by the gate (${JSON.stringify(near)})`);
  assert.ok(towerCatches('up', [floor, gate, high], [], 3000, 1280, [], level).some(byGate), 'unsealed, the same lay does put wood there (the planted case)');
});

test('towerCatches (planted, ENG-26p): an end that steps off just past a kept-out box is caught by a bough slid clear of the box, never left to fall', () => {
  // (gateKit Easy seed 4 on t-build-26 43c4c6776: the bridge 1068-1199 @4720 stepped off at x 1044, 9 px past gate 28's band edge 1035;
  // the centred bough 954-1134 lay in the band, so the fall went 647 px. The same shape here: a box whose right edge is 14 px short of
  // where he comes down off the piece's right end, and no wood under him within the limit)
  const floor = solid(0, 3000, 1280, 1), p = solid(600, 2000, 200, 2);
  const box = { x0: 0, x1: 810, y0: 1900, y1: 2600 };
  const ex = p.x + p.width + 24;
  const cs = towerCatches('up', [floor, p], [], 3000, 1280, [], () => 0, () => false, [box]);
  const under = cs.find((c) => c.x <= ex && c.x + c.w >= ex && c.y > p.y && c.y - p.y <= TOWER.fall);
  assert.ok(under, `the right end is caught (${JSON.stringify(cs)})`);
  assert.equal(under!.x, box.x1, 'slid to the box\'s edge, not centred into it');
  assert.deepEqual(cs.filter((c) => c.x < box.x1 && c.x + c.w > box.x0 && c.y >= box.y0 && c.y <= box.y1), [], 'and nothing of it lies in the box');
  // (the planted case: with no box the bough is centred where he comes down, as before)
  const free = towerCatches('up', [floor, p], [], 3000, 1280, [], () => 0, () => false, []);
  assert.ok(free.some((c) => c.x === ex - TOWER.catchW / 2 || (c.y === p.y && c.x === p.x + p.width)), `no box: laid as before (${JSON.stringify(free)})`);
});

test('a sealed piece (a gate bough) in a built tower: nothing of the lay lies beside it, and the way on is a vine standing on it', () => {
  let gatesSeen = 0;
  for (const d of SETTINGS) for (const seed of SEEDS) {
    const st = buildGen2Stage({ config: upCfg(), kit: gateKit, seed, difficulty: d });
    assert.deepEqual(st.gen2.errors ?? [], [], `gates ${d} ${seed}`);
    const T = st.gen2.tower!;
    const gates = (T.sealed ?? []).map((id) => st.platforms.find((p) => p.id === id)!);
    assert.deepEqual(towerGates(gates, st.platforms, st.vines), []);
    for (const g of gates) {
      gatesSeen++;
      // (no wood but its own within a hop of it at its level: 300 px is far more than a hop off a vine's top needs)
      for (const p of st.platforms) if (p !== g && p.y <= g.y + 30 && p.y >= g.y - 200) assert.ok(Math.max(p.x - (g.x + g.width), g.x - (p.x + p.width)) > 300, `gates ${d} ${seed}: the piece at x ${p.x}-${p.x + p.width}, y ${p.y} lies by the gate at x ${g.x}-${g.x + g.width}, y ${g.y}`);
      // (the way on: a turn whose vine stands on the gate bough)
      const t = T.turns.find((q) => q.from === g.y && q.x >= g.x - 4 && q.x <= g.x + g.width + 4);
      assert.ok(t && t.to <= g.y - TOWER.turn, `gates ${d} ${seed}: a vine stands on the gate at y ${g.y} and climbs a turn (${JSON.stringify(t)})`);
    }
  }
  assert.ok(gatesSeen >= 12, `gate boughs laid and judged: ${gatesSeen}`);
  // (an unsealed tower names no gates and is laid as before)
  assert.equal(up(1).gen2.tower!.sealed, undefined);
});

test("the flag rule's numbers are Matt's on a tower too (ROLLED_FLAGS, the one definition)", () => {
  assert.deepEqual({ ...ROLLED_FLAGS }, { first: 700, min: 900, max: 4000, lethal: 2300, last: 2000, before: 2400, clear: 1500 });
});

test('towerVaults: straight up at a vine\'s top must land on wood whichever way he faces; 1-4\'s turn-back as laid passes, and a planted bough out of the vault\'s reach, or none at all, is named (B14c, 11-13)', () => {
  // (1-4 Easy, library14 seed 1, t-b14@cbe090f0: the storey 640-1197, the turn's vine at 1179, the storey above back left from 1153)
  const vine = (x: number): Vine => ({ id: 1, x, topY: 7320, bottomY: 7601, swaySpeed: 1.1, swayPhase: 0, vineType: 'tree_climb' }) as Vine;
  const foot = solid(640, 7601, 557, 2);
  assert.deepEqual(towerVaults([vine(1179)], [foot, solid(853, 7320, 300, 3)]), [], 'as laid: cleared CLIMB_CLEAR off its bough, the vault lands');
  assert.equal(1179 - 1153, CLIMB_CLEAR);
  // (planted: the bough above ends further back than the vault carries him; and a vine whose top has no wood at all)
  const far = towerVaults([vine(1179)], [foot, solid(853, 7320, 1179 - VAULT_GAP - 11 - 853, 3)]);
  assert.equal(far.length, 1, `named: ${far}`);
  assert.match(far[0], /^tower: straight up at the top of the vine at x 1179 \(y 7320\), facing (right|left), vaults him (right|left) onto no wood$/);
  assert.equal(towerVaults([vine(1179)], [foot]).length, 1);
});

test('a built tower whose turn vine stands out of the vault\'s reach of the storey above is refused by name and fails the roll', () => {
  const req = { config: upCfg(), kit: upKit, seed: 4, difficulty: 'normal' as const };
  const st = up(4);
  assert.equal(st.gen2.towerMiss, undefined, 'the clean roll has no miss');
  const T = st.gen2.tower!;
  const t = T.turns[0];
  // (the turn's vine moved VAULT_GAP further away from the bough it leads up to: straight up at its top no longer lands on it)
  const v = st.vines.find((q) => q.vineType === 'tree_climb' && q.x === t.x && q.topY === Math.min(t.from, t.to))!;
  assert.ok(v, 'the turn\'s vine is where the meta says it stands');
  const bough = st.platforms.find((q) => Math.abs(q.y - v.topY) <= 2 && (Math.abs(q.x - v.x) <= CLIMB_CLEAR + 2 || Math.abs(q.x + q.width - v.x) <= CLIMB_CLEAR + 2))!;
  const away = bough.x > v.x ? -1 : 1;
  const moved: Gen2Stage = { ...st, vines: st.vines.map((q) => (q === v ? { ...q, x: q.x + away * VAULT_GAP } : q)), gen2: { ...st.gen2, towerMiss: undefined, flagMiss: undefined, errors: [] } };
  applyVerdicts(moved, req);
  assert.ok(moved.gen2.towerMiss?.some((l) => l.startsWith(`tower: straight up at the top of the vine at x ${v.x + away * VAULT_GAP} `)), `named: ${moved.gen2.towerMiss}`);
  assert.ok(rollErrors(moved.gen2).some((l) => /onto no wood$/.test(l)), 'and it fails the roll');
});
