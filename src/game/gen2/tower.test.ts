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
import { DOUBLE_RISE } from '../physics.ts';
import { MODES } from '../stageModes.ts';
import type { Platform, Vine } from '../types.ts';
import { applyVerdicts, buildGen2Stage, HARD_JOBS, keptFoes, layLocal, layStage, missionGraph, planBudget, rngFor, rollErrors, ROLLED_FLAGS } from './pipeline.ts';
import { packPlan, stageParts, unpackPlan } from './seedList.ts';
import { cfg as runCfg, kit as runKit } from './toyWorld.ts';
import { ARC_CODE, arcKit, gateKit, hopsUp, towerCfg, upKit, upManifest } from './toyTower.ts';
import { fallSeconds, flagFurther, gapCatchY, LEAP, leaps, localExtent, HANG, offEnd, openEnds, walledEnd, reflectLocal, routeAt, routeOf, storeyLimit, TOWER, towerCatches, towerFalls, towerFlagBreaches, stopVines, towerHandOns, towerVineCuts, towerFlags, towerGates, towerSkips, towerVaults, vertical, towerLids, ROOF, overlapRefused } from './tower.ts';
import { climbX, CLIMB_CLEAR, VAULT_GAP } from '../vineTop.ts';
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
  // (a catch bough under each end closes them; a crumbling tile catches nothing)
  const caught = [floor, high, solid(380, 1500, 200, 3), solid(640, 1500, 200, 4)];
  assert.deepEqual(towerFalls('up', caught, 1900, 1280), []);
  assert.equal(towerFalls('up', [floor, high, { ...solid(380, 1500, 200, 3), type: 'fragile' } as Platform, solid(640, 1500, 200, 4)], 1900, 1280).length, 1);
  // (a piece that gives way: sound wood under it inside a trunk section, or it is named; another piece that gives way is no catch)
  const limb = { ...solid(500, 1100, 200, 7), type: 'fragile' } as Platform;
  assert.match(towerFalls('up', [floor, limb], 1900, 1280).join(';'), /^tower: the piece at x 500-700, y 1100 gives way over a 800 px drop \(sound wood within 450\)$/);
  assert.deepEqual(towerFalls('up', [floor, limb, solid(380, 1500, 440, 8)], 1900, 1280), [], 'a short drop over sound wood: kept');
  assert.equal(towerFalls('up', [floor, limb, { ...solid(480, 1300, 240, 9), type: 'fragile' } as Platform], 1900, 1280).length, 2, 'a rotting bough under a rotting bough catches nothing');
  // (an end at the wall is no end: the engine keeps him inside the tower)
  assert.deepEqual(towerFalls('up', [floor, solid(0, 1100, 300, 5), solid(240, 1500, 200, 6)], 1900, 1280), []);
  assert.equal(fallSeconds(0), 0);
  assert.ok(Math.abs(fallSeconds(4 * TOWER.fall) - 2 * fallSeconds(TOWER.fall)) < 1e-9 && fallSeconds(TOWER.fall) > 0.4 && fallSeconds(TOWER.fall) < 1.5, 'a fall is timed from rest');
});

// (ENG-DARK box 18) the engine stands him while his middle hangs at most HANG past an end (11 px on Normal, 16 px with Easy's
// help), and keeps his middle inside [20, width - 20]. An end further in from that line than the hang is a slot he falls down (the
// drafted 3-1 Normal 25's log #48, its left end at x 34, 14 px in: the child fell past it 1850 px); an end nearer is no way off (the
// same lay's Normal 22: a bridge run on to x 1256, 4 px in, read as the way down by the shrine, and all 5 bots stood on its end).
// Planted: offEnd with no hang (any end short of the line is an end), or offEnd as it was (end -/+ 24, null outside the walls).
test('offEnd: an end 14 px in from the wall is a slot he falls down, owed a catch; an end 4 px in, or at the wall, is no way off', () => {
  assert.ok(HANG.fall > 11 && HANG.fall < 12 && HANG.off > 15 && HANG.off < 16, `the engine's hang: ${HANG.fall} / ${HANG.off}`);
  assert.equal(offEnd(34, -1, 1280, HANG.fall), 20, '14 px in: he falls (Normal)');
  assert.equal(offEnd(34, -1, 1280), null, "14 px in: no way off on both settings (Easy's footing holds him)");
  assert.equal(offEnd(24, -1, 1280, HANG.fall), null, '4 px in: he stands at the wall');
  assert.equal(offEnd(1256, 1, 1280, HANG.fall), null, "4 px in at the right wall (Normal 22's bridge): he stands");
  assert.equal(offEnd(1246, 1, 1280, HANG.fall), 1260);
  assert.equal(offEnd(100, -1, 1280), 76);
  assert.equal(offEnd(1200, 1, 1280), 1224);
  assert.equal(offEnd(20, -1, 1280, HANG.fall), null);
  assert.equal(offEnd(0, -1, 1280, HANG.fall), null);
  const floor = solid(0, 1900, 1280, 1);
  const slot = openEnds([floor, solid(34, 1100, 1246, 2)], 1900, TOWER.fall, 1280);
  assert.deepEqual(slot.map((o) => o.x), [20], 'the end 14 px in from the left wall is an open end, read at the wall');
  assert.deepEqual(openEnds([floor, solid(20, 1100, 1260, 3)], 1900, TOWER.fall, 1280), [], 'wall to wall: no end');
  assert.deepEqual(openEnds([floor, solid(24, 1100, 1232, 6)], 1900, TOWER.fall, 1280), [], '4 px in from both walls: no end');
  // (the lay closes it: rule 1 runs the storey on into the wall, no slot left)
  const cs = towerCatches('down', [floor, solid(34, 1100, 600, 4)], [], 1900, 1280);
  assert.ok(cs.some((c) => c.x <= 0 && c.x + c.w >= 34 && c.y === 1100), `the slot at the left wall is closed at its own height: ${JSON.stringify(cs)}`);
});

// (ENG-DARK box 17's rule, its SHAPE: the drafted 3-1 Normal 22's catch #193 laid 17 px from a 90 px log 73 px over it) a turn vine
// at x 500 stops on a catch (408-588, y 753) over its storey (200-460, y 927, under the catch's left end only); a log ending 17 px
// left of the catch's end, 73 px up and 90 px thick, has its body inside his: that end is WALLED, no way off, and off the other end
// he falls past the storey, so towerHandOns names the turn. Without the log, the left end hands him on: kept. Planted: handOn's
// walledEnd filter removed.
test('a walled end is no way off: a catch whose only end over its storey is walled by a log beside it passes its storey (towerHandOns)', () => {
  const turn = [{ x: 500, from: 580, to: 927 }];
  const log = { ...solid(101, 680, 290, 2), height: 90 } as Platform, c = solid(408, 753, 180, 5), storey = solid(200, 927, 260, 3), floor = solid(0, 3000, 1280, 9);
  const named = towerHandOns(turn, [log, c, storey, floor], 1280);
  assert.equal(named.length, 1, `the walled catch is named: ${JSON.stringify(named)}`);
  assert.match(named[0], /the catch at x 408-588, y 753, where the vine at x 500 stops, hands him past its storey at y 927/);
  assert.deepEqual(towerHandOns(turn, [c, storey, floor], 1280), [], 'without the log the left end hands him on');
  assert.equal(walledEnd([log], 408, -1, 753), true, '17 px from a 90 px log 73 px up: walled');
  assert.equal(walledEnd([solid(150, 691, 258, 2)], 408, -1, 753), true, 'flush with a bough 62 px up: walled');
  assert.equal(walledEnd([solid(100, 691, 280, 2)], 408, -1, 753), false, '28 px off: he goes by');
  assert.equal(walledEnd([solid(100, 753, 300, 2)], 408, -1, 753), false, 'level wood: a run on, not a wall');
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

test('towerCatches going down keeps his head room both ways: no bridge under a shelf, no catch just over the storey under it, no run-on across the tower (ENG-DOWNBOT)', () => {
  const W = 1280, FLOOR = 3000;
  /** every catch and every piece it lies across: his body (84 px, tower.ts HEAD) between them, over it or under it */
  const roomy = (base: Platform[], cs: ReturnType<typeof towerCatches>) => {
    const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 200 + k))];
    for (const [k, c] of cs.entries()) for (const q of all) {
      if (q.id === 200 + k || q.x >= c.x + c.w || q.x + q.width <= c.x || Math.abs(q.y - c.y) <= 1) continue;
      assert.ok(Math.abs(q.y - c.y) >= 84, `the catch at x ${c.x}-${c.x + c.w}, y ${c.y} lies ${Math.abs(q.y - c.y)} px from the wood at x ${q.x}-${q.x + q.width}, y ${q.y}`);
    }
    assert.ok(cs.every((c) => c.w < W - 2 * TOWER.wall), 'no catch runs across the tower');
    return all;
  };
  // (a shelf with its open end at x 724; the next wood 70 px under it and 36 px past the end: run on as a bridge, it lay under the shelf)
  const shelf = solid(400, 1000, 300, 1), beside = solid(760, 1070, 200, 2), floor = solid(0, FLOOR, W, 3);
  const a = towerCatches('down', [shelf, beside, floor], [], FLOOR, W);
  assert.deepEqual(towerFalls('down', roomy([shelf, beside, floor], a), FLOOR, W), [], 'every end of the bridge plant is caught');
  // (a shelf's open end over the storey under it, 347 px down (a turn): the band a catch was laid in is 51-60 px over that storey)
  const under = solid(600, 1347, 400, 4);
  const b = towerCatches('down', [shelf, under, floor], [], FLOOR, W);
  assert.ok(b.some((c) => c.x <= 724 && c.x + c.w >= 724), 'the open end is caught');
  assert.deepEqual(towerFalls('down', roomy([shelf, under, floor], b), FLOOR, W), [], 'every end of the band plant is caught');
  // (a 60 px bridge by the left wall: its RIGHT end is near the left wall, and was run on to the right wall, 1,196 px)
  const stub = solid(24, 1000, 60, 5), low = solid(560, 1070, 80, 6);
  const c = towerCatches('down', [stub, low, floor], [], FLOOR, W);
  roomy([stub, low, floor], c);
});

test('going down, an end 19 px in from the wall line is run on into the wall: its slot read off the run it makes, never the run-on alone (ENG-DARK box 26, the drafted 3-1 Easy 6)', () => {
  const W = 1280, FLOOR = 1900;
  // (wood to 1176, a bridge 1176-1241 on it: the bridge's right end steps off onto the wall line, x 1260 (offEnd), where no catch can
  //  lie; the run-on 1241-1280 read alone was 65 px from the wood at 1176, a slot, though the bridge fills that gap: refused, a 1,300 px
  //  blind drop was left)
  const wood = solid(0, 600, 1176, 1), bridge = solid(1176, 600, 65, 2), floor = solid(0, FLOOR, W, 3);
  assert.equal(offEnd(1241, 1, W, HANG.fall), W - 20, 'the plant: the end is a way off, its point on the wall line');
  const cs = towerCatches('down', [wood, bridge, floor], [], FLOOR, W);
  assert.ok(cs.some((c) => c.y === 600 && c.x <= 1241 && c.x + c.w >= W), `run on into the wall: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', [wood, bridge, floor, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))], FLOOR, W), [], 'no blind drop is left');
  // (and a gap of the piece's own, on its far side, is no slot of the run-on's: Easy 34's 59-260 with wood 65 px past its right end,
  //  read as one run with its run-on, lost its run-on 0-59 to a bough under it)
  const short = solid(59, 600, 201, 4), past = solid(325, 600, 955, 5);
  const ds = towerCatches('down', [short, past, floor], [], FLOOR, W);
  assert.ok(ds.some((c) => c.y === 600 && c.x <= 0 && c.x + c.w >= 59), `the left end runs on into the wall: ${JSON.stringify(ds)}`);
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
      const catches = q.seam.filter((p) => p.y > q.entry.y + 30 && p.y < t.from - 30);
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

test("stopVines and towerVineCuts ('a catch crosses a vine'): wood across a climb vine between its top and foot is named, and the vine stops on it; wood it hangs from or ends on is not across it (ENG-DOWNBOT)", () => {
  const vine = (): Vine => ({ id: 1, x: 500, topY: 580, bottomY: 927, swaySpeed: 1.1, swayPhase: 0, vineType: 'tree_climb' }) as Vine;
  const from = solid(200, 580, 300, 1), storey = solid(300, 927, 600, 2), shelf = solid(408, 753, 180, 3);
  // (the turn as laid before: the catch owed under the end, 173 px down, across the vine)
  const v = vine();
  assert.deepEqual(towerVineCuts([v], [from, storey]), [], 'the ledge it hangs from and the storey it ends on are not across it');
  assert.deepEqual(towerVineCuts([v], [from, storey, shelf]), ['tower: a catch crosses a vine: the piece at x 408-588, y 753 lies across the vine at x 500 (y 580-927)']);
  assert.equal(towerVineCuts([v], [from, storey, { ...shelf, x: 300, width: 196 }]).length, 0, 'wood ending 4 px short of the vine is not across it');
  assert.equal(towerVineCuts([{ ...v, vineType: 'swing_liana' } as Vine], [from, storey, shelf]).length, 0, 'a swing liana is not a climb');
  // (the fix: the vine stops ON the highest wood across it)
  const w = vine();
  stopVines([w], [from, storey, solid(408, 840, 180, 4), shelf]);
  assert.equal(w.bottomY, 753);
  assert.deepEqual(towerVineCuts([w], [from, storey, shelf]), []);
});

test("towerHandOns ('a catch hands on to its storey'): a stopped vine's catch whose ends land on its storey is kept; one run on over ALL of its storey, or wall to wall, is named (the lead's ruling on LAY finding 2, ENG-DOWNBOT)", () => {
  const turn = { x: 500, from: 580, to: 927 };
  const from = solid(200, 580, 300, 1), storey = solid(300, 927, 600, 2), low = solid(0, 1280, 1280, 5);
  // (as laid at its best: the catch 180 px wide under the end; off its left end he lands on the storey)
  assert.deepEqual(towerHandOns([turn], [from, storey, low, solid(408, 753, 180, 3)], 1280), []);
  // (the catch run on past both ends of its storey: off either end he lands past it, on the storey below)
  assert.deepEqual(towerHandOns([turn], [from, storey, low, solid(408, 753, 180, 3), solid(250, 753, 158, 4), solid(588, 753, 400, 6)], 1280), ['tower: a catch passes its storey: the catch at x 250-988, y 753, where the vine at x 500 stops, hands him past its storey at y 927 (off its ends he lands at y 1280 and 1280, and never comes down at its storey\'s height)']);
  // (off its end onto wood over the storey, then on off that wood: past the storey (normal 1's 11711 onto 11825, then 12062), or onto it)
  const run = [from, storey, low, solid(408, 753, 180, 3), solid(250, 753, 158, 4), solid(588, 753, 400, 6)];
  assert.equal(towerHandOns([turn], [...run, solid(150, 860, 90, 7)], 1280).length, 1, 'onto 860, then past the storey to 1280');
  assert.deepEqual(towerHandOns([turn], [...run, solid(150, 860, 170, 7)], 1280), [], 'onto 860, then off its right end onto the storey');
  // (run on wall to wall: no way off)
  assert.match(towerHandOns([turn], [from, storey, low, solid(0, 753, 1280, 3)], 1280)[0], /it runs wall to wall: no way off\)$/);
  // (a vine with no catch across it, and a turn going up, are not judged)
  assert.deepEqual(towerHandOns([turn], [from, storey, low], 1280), []);
  assert.deepEqual(towerHandOns([{ x: 500, from: 927, to: 580 }], [from, storey, low, solid(0, 753, 1280, 3)], 1280), []);
});

test("towerCatches going down never bridges a dip's end onto a stopped vine's catch: it would run that catch on past its storey (normal 6's shape, the lead's ruling 1 on LAY finding 2, ENG-DOWNBOT)", () => {
  const W = 1280, FLOOR = 3000;
  // (drafted 3-1 normal 6, 9,000 px up: a dip whose right end (x 781) is 76 px short of the storey and 281 px over it; the vine at
  //  x 1088 comes down beside it onto its own catch, 178 px over the storey; a shelf 64 px over the storey is bridged out from the
  //  dip's left end first, so the storey's bridge under the right end has no head room, and the vine's catch was the next anchor)
  const vine = { id: 1, x: 1088, topY: 895, bottomY: 1246, swaySpeed: 1.1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const dip = solid(634, 965, 123, 1), shelf = solid(290, 1182, 180, 2), own = solid(996, 1068, 180, 3), storey = solid(857, 1246, 251, 4), floor = solid(0, FLOOR, W, 5);
  const base = [dip, shelf, own, storey, floor];
  const cs = towerCatches('down', base, [vine], FLOOR, W);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.ok(!cs.some((c) => Math.abs(c.y - own.y) <= 1 && c.x < own.x && c.x + c.w >= own.x - 2), `no wood run on level with the vine's catch: ${cs.map((c) => `${c.x}-${c.x + c.w}@${c.y}`).join(' ')}`);
  assert.deepEqual(towerHandOns([{ x: 1088, from: 895, to: 1246 }], all, W), [], "the vine's catch hands him on to its storey");
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], "every end is caught, the dip's included");
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

test("going down, his hop's room: no wood within ROOF over a dip's lip or a climb vine's top, and the lay keeps it (ENG-DOWNBOT)", () => {
  // (drafted 3-1 normal 13's shape, 9500 px up: a storey with a dip (near 600-815, far 197-506, the dip's floor 70 px down), a turn
  //  vine hanging at x 171 off the far part's end, and the storey over it, 281 px up, whose left end is open. Today's lay hung a shelf
  //  0-604 108 px over the storey: its end 4 px past the dip's lip, over the vine's top; the kid and the adult stood under it)
  const W = 1280, FLOOR = 1100;
  const upper = solid(185, 382, 584, 1), near = solid(600, 663, 215, 2), far = solid(197, 663, 309, 3), dip = solid(506, 733, 94, 4);
  const next = solid(60, 836, 500, 5), floor = solid(0, FLOOR, W, 6);
  const vine = { id: 1, x: 171, topY: 663, bottomY: 836, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  // (the verdicts, planted: a lid 108 px over the lip, a roof over the vine's top; ROOF px up, neither)
  const lid = solid(424, 555, 180, 7), roof = solid(100, 555, 120, 8);
  const named = towerLids([vine], [upper, near, far, dip, next, floor, lid, roof]);
  assert.equal(named.filter((m) => m.startsWith("tower: a lid over a dip's lip")).length, 1, named.join('; '));
  assert.equal(named.filter((m) => m.startsWith("tower: a roof over a vine's top")).length, 1, named.join('; '));
  assert.deepEqual(towerLids([vine], [upper, near, far, dip, next, floor, solid(424, 663 - ROOF, 180, 7), solid(100, 663 - ROOF, 120, 8)]), [], 'ROOF over: kept');
  // (the lay: the upper storey's open end caught, with nothing in his hop's room and no blind drop)
  const base = [upper, near, far, dip, next, floor];
  const cs = towerCatches('down', base, [vine], FLOOR, W);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 200 + k))];
  assert.ok(cs.length > 0, 'a catch is laid');
  assert.deepEqual(towerLids([vine], all), [], cs.map((c) => `${c.x}-${c.x + c.w}@${c.y}`).join(', '));
  assert.deepEqual(towerFalls('down', all, FLOOR, W), []);
});

test('going down, no slot: a catch beside near-level wood lies flush, a crack from it, or his body and a margin clear (ENG-DOWNBOT)', () => {
  // (drafted 3-1 easy 5's shape, 1189-1602 px down: a storey 253-544 whose right end is open, a climb vine at x 227 down to the
  //  vine-foot storey 207-446 281 px under it, the way on 132 px under that (0-724). A section's gap beside the vine-foot storey's end
  //  keeps its bridge off here (the toy's stand-in for what kept it off on the roll). The lay caught the end with a bough 6 px under
  //  the vine-foot storey and 32 px past its end (478-658; 488-658, 42 px, on fe331023's roll): a gap about his body's width that he
  //  can neither fall through nor read as an end; the kid and the adult went to and fro over it for 20 s until rescued)
  const W = 1280, FLOOR = 2400;
  const base = [solid(253, 1189, 291, 1), solid(207, 1470, 239, 2), solid(0, 1602, 93, 3), solid(93, 1602, 364, 4), solid(457, 1602, 267, 5), solid(0, FLOOR, W, 6)];
  const vine = { id: 1, x: 227, topY: 1189, bottomY: 1470, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const cs = towerCatches('down', base, [vine], FLOOR, W, [{ x0: 446, x1: 600, y: 1470 }]);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 200 + k))];
  // (SLOT in tower.ts: within 8 px in height, a gap of at most 21 px (a crack) or at least 66 (his body, 42, and a 24 px margin))
  const slots: string[] = [];
  for (const a of all) for (const b of all) {
    const gap = b.x - (a.x + a.width);
    if (Math.abs(a.y - b.y) <= 8 && gap > 21 && gap < 66) slots.push(`${a.x}-${a.x + a.width}@${a.y} | ${b.x}-${b.x + b.width}@${b.y} gap ${gap}`);
  }
  const lay = cs.map((c) => `${c.x}-${c.x + c.w}@${c.y}`).join(', ');
  assert.ok(cs.some((c) => c.x < 568 && c.x + c.w > 568 && c.y > 1189 && c.y < 1602), `the open end is caught over the way on: ${lay}`);
  assert.deepEqual(slots, [], lay);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), []);
  assert.deepEqual(towerLids([vine], all), [], lay);
});

// ── ENG-CATCH (R-165.526): going down, a catch or a run-on's own ends land in view, and a catch never passes its storey ──
// (each plant is red on the lay before ENG-CATCH: a keep-out box (a wheel's sweep, towerCatches keepOut) under the overhang stops the
//  next pass catching the piece's own end, as the drafted 3-1's wood did)

test("going down, a catch bough whose own end is a blind drop is laid again so it ends over the wood under it (the drafted 3-1's Easy 1, ENG-CATCH)", () => {
  const W = 1280, FLOOR = 1600;
  // (a shelf's open end at x 724 drops 350 px onto a mat that runs from the wall to x 800; the bough laid under the end (614-794)
  //  steps off at 818, past the mat's end, and drops 427 px, with no wood allowed under it; laid again it ends over the mat)
  const base = [solid(0, 1000, 700, 1), solid(0, 1350, 800, 2), solid(0, FLOOR, W, 3)];
  const cs = towerCatches('down', base, [], FLOOR, W, [], () => 0, () => false, [{ x0: 802, x1: W, y0: 1100, y1: 1590 }]);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.ok(cs.some((c) => c.x <= 724 - 30 && c.x + c.w >= 724 + 30 && c.y > 1000 && c.y < 1300), `the shelf's end is caught: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], "no blind drop is left, off the catch's own end above all");
  assert.ok(cs.every((c) => c.w >= 60), 'every catch keeps a footing');
});

test("going down, a bridge whose far end misses the shelf under it is laid shorter, so it ends over that shelf (the drafted 3-1's seed 5, ENG-CATCH)", () => {
  const W = 1280, FLOOR = 1600;
  // (a shelf's open end at x 724; the wood 200 px under it ends at x 700 and is bridged out under the end, 700-814; its far end steps
  //  off at 838, 8 px past the shelf under it (to 830), and drops 400 px with no wood allowed under it; 700-804 steps off onto it)
  const base = [solid(0, 1000, 700, 1), solid(0, 1200, 700, 2), solid(0, 1400, 830, 3), solid(0, FLOOR, W, 4)];
  const cs = towerCatches('down', base, [], FLOOR, W, [], () => 0, () => false, [{ x0: 832, x1: W, y0: 1210, y1: 1590 }]);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.ok(cs.some((c) => c.y === 1200 && c.x <= 700 && c.x + c.w >= 724 + 30), `the end is bridged from the wood under it: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], "no blind drop is left, off the bridge's own end above all");
});

test("going down, no wood is run on level with a vine's catch, read where the vine will hang, if the run has no way off: it passes the storey (the drafted 3-1's seed 3, ENG-CATCH)", () => {
  const W = 1280, FLOOR = 1900;
  // (the vine comes down from the end of a log (x 467-798, y 1000, 90 px thick) to its storey (x 628-1026, y 1347): laid at x 798, on
  //  the log's face, it hangs 21 px out (climbX), across the catch beside it (x 799-979, y 1062). A shelf's open end over it (x 1117)
  //  was bridged from that catch (979-1207) and run on into the wall: one run from 799 to the wall whose left end walks into the
  //  log's side, so he can never step off it)
  const vine = { id: 1, x: 798, topY: 1000, bottomY: 1347, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const log = { ...solid(467, 1000, 331, 1), height: 90 }, own = solid(799, 1062, 180, 2), storey = solid(628, 1347, 398, 3), shelf = solid(825, 800, 268, 4), floor = solid(0, FLOOR, W, 5);
  const base = [log, own, storey, shelf, floor];
  assert.ok(walledEnd(base, 799, -1, 1062), "the plant: the catch's left end walks into the log's side");
  assert.ok(climbX(vine, base) > own.x + 6, 'the plant: the vine will hang across the catch');
  const cs = towerCatches('down', base, [vine], FLOOR, W);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.deepEqual(towerHandOns([{ x: climbX(vine, all), from: 1000, to: 1347 }], all, W), [], `the vine's catch hands him on to its storey: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], 'and every end is caught');
});

// ── ENG-CATCH-b (R-165.534): going down, a storey's hole never sits under a piece's fall line; a lay with no blind drop is never touched ──

test("going down, a bridge started a hop past a vine's top that misses the end's fall line is no catch: the end gets one of its own (the drafted 3-1's Easy 2 and 4, ENG-CATCH-b)", () => {
  const W = 1280, FLOOR = 1481;
  // (a shelf x 650-919, y 1000, its left end's fall line at x 626; the storey under it ends at x 554, where the turn's vine hangs down
  //  to the floor. Bridged from that storey, the bridge starts a hop past the vine, 654: the hole 554-654 lies under the fall line and
  //  the walk off the shelf's end falls 481 px, past the storey)
  const vine = { id: 1, x: 554, topY: 1256, bottomY: FLOOR, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const shelf = solid(650, 1000, 269, 1), storey = solid(136, 1256, 418, 2), floor = solid(0, FLOOR, W, 3);
  const base = [shelf, storey, floor];
  assert.equal(offEnd(650, -1, W, HANG.fall), 626, "the plant: the shelf's left end falls at x 626, inside the vine's hop");
  const cs = towerCatches('down', base, [vine], FLOOR, W);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.ok(cs.some((c) => c.x <= 626 && c.x + c.w >= 626 && c.y > 1000 && c.y <= 1000 + TOWER.see), `the shelf's end is caught under its fall line: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], 'no blind drop is left');
  assert.equal(new Set(cs.map((c) => `${c.x},${c.y},${c.w}`)).size, cs.length, 'no catch is laid twice');
});

test("going down, no two catches overlap at one height: a later, wider catch takes the place of the one it covers and is trimmed off the storey it runs onto (ENG-CATCH-b's toy, ENG-CATCH-g)", () => {
  const W = 1280, FLOOR = 1481;
  // (the toy above: the mend's catch 536-716 lay over the lay's bridge 654-716 and 18 px over the storey 136-554, all at y 1256: two
  //  planks drawn over each other, an end cap in the middle of a plank)
  const vine = { id: 1, x: 554, topY: 1256, bottomY: FLOOR, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const base = [solid(650, 1000, 269, 1), solid(136, 1256, 418, 2), solid(0, FLOOR, W, 3)];
  const cs = towerCatches('down', base, [vine], FLOOR, W);
  const wood = [...base.map((p) => ({ x: p.x, y: p.y, w: p.width })), ...cs];
  const over = cs.flatMap((c) => wood.filter((q) => q !== c && Math.abs(q.y - c.y) <= 1 && q.x < c.x + c.w && q.x + q.w > c.x).map((q) => `${c.x}-${c.x + c.w} over ${q.x}-${q.x + q.w} at y ${c.y}`));
  assert.deepEqual(over, [], `no catch lies over other wood at its height: ${JSON.stringify(cs)}`);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.ok(cs.some((c) => c.x <= 626 && c.x + c.w >= 626 && c.y > 1000 && c.y <= 1000 + TOWER.see), `the shelf's end is still caught under its fall line: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], 'no blind drop is left');
});

test("going down, a catch that only partly overlaps wood at its height is trimmed to the open span under its fall line, or REFUSED by name when too little is left (ENG-CATCH-g)", () => {
  const W = 1280, FLOOR = 1481;
  const over = (base: Platform[], cs: ReadonlyArray<{ x: number; y: number; w: number }>) => {
    const wood = [...base.map((p) => ({ x: p.x, y: p.y, w: p.width })), ...cs];
    return cs.flatMap((c) => wood.filter((q) => q !== c && Math.abs(q.y - c.y) <= 1 && q.x < c.x + c.w && q.x + q.w > c.x).map((q) => `${c.x}-${c.x + c.w} over ${q.x}-${q.x + q.w}`));
  };
  // (a shelf x 524-924, y 1000, its left end's fall line at x 500; under it, at y 1200, two pieces with a gap under that line)
  assert.equal(offEnd(524, -1, W, HANG.fall), 500, "the plant: the shelf's left end falls at x 500");
  // a gap of 50 px, under MEND.trim: every bough over it at its height is refused, by name, and the end is caught lower down
  const narrow = [solid(524, 1000, 400, 1), solid(200, 1200, 275, 2), solid(525, 1200, 300, 3), solid(0, FLOOR, W, 4)];
  const cn = towerCatches('down', narrow, [], FLOOR, W);
  assert.deepEqual(over(narrow, cn), [], `no catch lies over other wood at its height: ${JSON.stringify(cn)}`);
  assert.ok(overlapRefused.length > 0 && overlapRefused.every((w) => /^overlap: .* lies over .* no open span of 60 px is left under its fall line x 500$/.test(w)), `the bough over the 50 px gap is refused by name: ${JSON.stringify(overlapRefused)}`);
  assert.ok(cn.some((c) => c.x <= 500 && c.x + c.w >= 500 && c.y > 1200), `the end is caught under its fall line, lower down: ${JSON.stringify(cn)}`);
  assert.deepEqual(towerFalls('down', [...narrow, ...cn.map((c, k) => solid(c.x, c.y, c.w, 100 + k))], FLOOR, W), [], 'no blind drop is left');
  // a gap of 60 px: the bough is trimmed to it, joined to the wood either side, none refused
  const fits = [solid(524, 1000, 400, 1), solid(200, 1200, 270, 2), solid(530, 1200, 300, 3), solid(0, FLOOR, W, 4)];
  const cf = towerCatches('down', fits, [], FLOOR, W);
  assert.deepEqual(over(fits, cf), [], `no catch lies over other wood at its height: ${JSON.stringify(cf)}`);
  assert.ok(cf.some((c) => c.x === 470 && c.w === 60 && c.y === 1200), `the bough is trimmed to the open span 470-530: ${JSON.stringify(cf)}`);
  assert.deepEqual(overlapRefused, [], 'none refused');
});

test("going down, a bridge started a hop past a vine's top that reaches the end's fall line is laid as before (a clean lay is never touched, ENG-CATCH-b)", () => {
  const W = 1280, FLOOR = 1481;
  // (the same tower, the shelf moved right: its left end's fall line, x 726, lies past the hop, so the bridge from the storey caught it
  //  before and still does, starting TOWER.hop + 30 px past the vine's top)
  const vine = { id: 1, x: 554, topY: 1256, bottomY: FLOOR, swaySpeed: 1, swayPhase: 0, vineType: 'tree_climb' } as Vine;
  const base = [solid(750, 1000, 269, 1), solid(136, 1256, 418, 2), solid(0, FLOOR, W, 3)];
  const cs = towerCatches('down', base, [vine], FLOOR, W);
  const all = [...base, ...cs.map((c, k) => solid(c.x, c.y, c.w, 100 + k))];
  assert.ok(cs.some((c) => c.y === 1256 && c.x === 554 + TOWER.hop + 30 && c.x + c.w >= 726), `the end is bridged from the storey, a hop past the vine: ${JSON.stringify(cs)}`);
  assert.deepEqual(towerFalls('down', all, FLOOR, W), [], 'no blind drop is left');
});
