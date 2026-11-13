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
import { applyVerdicts, buildGen2Stage, keptFoes, layLocal, layStage, missionGraph, planBudget, rngFor, rollErrors, ROLLED_FLAGS } from './pipeline.ts';
import { packPlan, stageParts, unpackPlan } from './seedList.ts';
import { cfg as runCfg, kit as runKit } from './toyWorld.ts';
import { hopsUp, towerCfg, upKit, upManifest } from './toyTower.ts';
import { fallSeconds, gapCatchY, LEAP, leaps, localExtent, openEnds, reflectLocal, routeAt, routeOf, storeyLimit, TOWER, towerCatches, towerFalls, towerSkips, vertical } from './tower.ts';
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
  // (an end at the wall is no end: the engine keeps him inside the tower)
  assert.deepEqual(towerFalls('up', [floor, solid(0, 1100, 300, 5), solid(240, 1500, 200, 6)], 1900, 1280), []);
  assert.equal(fallSeconds(0), 0);
  assert.ok(Math.abs(fallSeconds(4 * TOWER.fall) - 2 * fallSeconds(TOWER.fall)) < 1e-9 && fallSeconds(TOWER.fall) > 0.4 && fallSeconds(TOWER.fall) < 1.5, 'a fall is timed from rest');
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
      const catches = q.seam.filter((p) => p.y > q.entry.y + 30 && p.y < t.from - 30);
      if (catches.length) withCatch++;
      for (const p of [...q.pieces.map((pp) => pp.platform), ...catches]) assert.ok(t.from - p.y >= TOWER.turn, `up ${seed} ${q.uid}: the piece at x ${p.x}, y ${p.y} is ${t.from - p.y} px over the ledge at y ${t.from} (a turn: ${TOWER.turn})`);
    });
  }
  assert.ok(withCatch >= 3, `sections with a catch under their entry were turned (${withCatch})`);
});

test('levelCheck: a tower\'s flags are in order when each is further on by its travel, though x runs both ways', () => {
  // (the fixture going up as a stage of another kind, travel up by its data: levelCheck's flag order is asked of it)
  const st = buildGen2Stage({ config: towerCfg(ID, 'sprint', 'up'), kit: upKit, seed: 2, difficulty: 'normal' });
  assert.deepEqual(st.gen2.errors ?? [], []);
  const cps = st.checkpoints ?? [];
  assert.ok(cps.length >= 6);
  assert.ok(cps.some((c, k) => k > 0 && c.x <= cps[k - 1].x), 'its flags run back in x on the storeys that run left');
  for (let k = 1; k < cps.length; k++) assert.ok(MODES.up.further(cps[k], cps[k - 1]), `flag ${k} is higher than the one before: the engine takes it`);
  assert.ok(!validateStage(st).errors.includes('checkpoints are out of order'));
  // (planted: the same flags in the wrong order are still refused)
  const wrong = { ...st, checkpoints: [...cps].reverse() };
  assert.ok(validateStage(wrong).errors.includes('checkpoints are out of order'), 'a flag that is no further on is out of order');
  // (and a run's rule has not moved: flags that go back in x are out of order)
  const run = buildGen2Stage({ config: runCfg('5-1', 'sprint'), kit: runKit, seed: 3, difficulty: 'normal' });
  if ((run.checkpoints ?? []).length >= 2) assert.ok(validateStage({ ...run, checkpoints: [...run.checkpoints!].reverse() }).errors.includes('checkpoints are out of order'));
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
  assert.equal(routeAt(R, 5000, 300), R.length, 'past the top: the whole way');
});

test("the flag rule's numbers are Matt's on a tower too (ROLLED_FLAGS, the one definition)", () => {
  assert.deepEqual({ ...ROLLED_FLAGS }, { first: 700, min: 900, max: 4000, lethal: 2300, last: 2000, before: 2400, clear: 1500 });
});
