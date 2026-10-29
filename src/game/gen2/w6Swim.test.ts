/**
 * Swimming (swim.ts) in 6-7's root well (gen2/worlds/w6Rooms.ts), in the real engine, upright and sideways:
 *   the water down is a wade (he stands on the well's floor); the wheel raises it to the well's lip and he swims in it
 *   the first time, the first-swim moment (no steering while it plays) and Dot's two lines; it never plays again that stage
 *   he floats, treads, swims both ways at about half a run, dives a little with down and comes up by himself
 *   he climbs out by swimming into either bank, and by a flick up; it never costs a life, and the deadly water still does
 *   carrying the root-stone he walks the bottom (the existing water room test carries it to the plate through the water)
 * And swim.ts on its own: where he floats, a dive never goes through the floor, the bank he can climb onto, and the lines' length.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { KIT, type Anchor } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { G } from '../protoStage.ts';
import { RealPlay, type Pad } from '../realPlay.ts';
import { setDifficulty } from '../difficulty.ts';
import { GEN2_SEEDS } from './seeds.ts';
import { buildGen2Stage } from './pipeline.ts';
import { resolveStage } from '../../../tools/gen2/curate.ts';
import { roomStage, RUNWAY } from './w6Harness.ts';
import { RAFT_RISE, WATER, waterRoom, W6_SWIM_STAGES } from './worlds/w6Rooms.ts';
import { bankAhead, floatY, kitPools, poolAt, RAFT_SITS, startsSwim, SWIM, SWIM_FIRST_LINE, SWIM_LINES, swimStep, type CalmPool } from '../swim.ts';
import { swimFrame } from '../heroSwim.ts';
import type { Platform } from '../types.ts';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test('swim.ts: he floats a set depth under the top, a dive stops at the floor, shallow water is waded, the lines are short', () => {
  const w: CalmPool = { x0: 0, x1: 300, surfaceY: 100, bottomY: 172 };
  assert.equal(floatY(w, 0), 100 + SWIM.float);
  assert.equal(floatY(w, 1), 172 - 3, 'the dive never goes through the floor');
  const deep = (): CalmPool => w;
  assert.ok(startsSwim(deep(), 100 + SWIM.enter, 200, false));
  assert.ok(!startsSwim(deep(), 100 + SWIM.enter, -50, false), 'not while rising out of it');
  assert.ok(!startsSwim(deep(), 100 + SWIM.enter, 0, true), 'not with his hands full');
  const shallow: CalmPool = { x0: 0, x1: 300, surfaceY: 100, bottomY: 100 + SWIM.minDepth - 1 };
  assert.ok(!startsSwim(shallow, 150, 0, false), 'too shallow: a wade');
  assert.equal(poolAt([w], 150), w);
  assert.equal(poolAt([w], 301), undefined);
  // a bank: its face touching him, its top over his feet and close over the water's; never the floor under him
  const bank: Platform = { id: 9, x: 300, y: 92, width: 200, height: 300, type: 'solid' };
  const floor: Platform = { id: 8, x: 0, y: 172, width: 300, height: 200, type: 'solid' };
  assert.equal(bankAhead([floor, bank], 300 - SWIM.half, 1, w), bank);
  assert.equal(bankAhead([floor, bank], 300 - SWIM.half, -1, w), undefined);
  assert.equal(bankAhead([floor, { ...bank, y: 100 - SWIM.climbOut - 1 }], 300 - SWIM.half, 1, w), undefined, 'too high over the water');
  // a frame of the first-swim moment: no steering, no leap
  const b = { x: 150, y: floatY(w, 0), vx: 0, vy: 0, facing: 1 as const };
  const st = { diveT: 0, firstLeft: SWIM.firstFor };
  assert.equal(swimStep(b, st, w, { steer: 1, down: false, jump: true }, 1 / 30, [floor, bank]).kind, 'swim');
  assert.equal(b.vx, 0);
  for (const l of Object.values(SWIM_LINES)) assert.ok(words(l) < 10, l);
  // the drawing: the first moment while it plays, the dive, the crawl, treading
  assert.equal(swimFrame({ vx: 0, swim: { surfaceY: 0, under: 0, first: 0.5 } }, 0).move, 'first');
  assert.equal(swimFrame({ vx: 0, swim: { surfaceY: 0, under: 0.8 } }, 0).move, 'under');
  assert.equal(swimFrame({ vx: 120, swim: { surfaceY: 0, under: 0 } }, 0).move, 'surf');
  assert.equal(swimFrame({ vx: 0, swim: { surfaceY: 0, under: 0 } }, 0).move, 'tread');
});

test("6-7's shipped rolls: the well holds calm water, down a wade and up to its lip, never over the floors; 6-7 loads the swim sheets", async () => {
  assert.deepEqual(W6_SWIM_STAGES, ['6-7']);
  const key = Object.keys(GEN2_SEEDS).find((k) => GEN2_SEEDS[k].stage === '6-7')!;
  const e = GEN2_SEEDS[key];
  assert.equal(e.seeds.length, 16);
  const stage = await resolveStage(key, e.kit);
  for (const s of [e.seeds[0], e.seeds[e.seeds.length - 1]]) {
    const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty: 'normal', recent: e.recent });
    const kp = new KitPlay(st.kit!, st.platforms, { world: 6, stage: 7, vines: st.vines, collectibles: st.collectibles });
    const pools = kitPools(kp, st.platforms);
    assert.equal(pools.length, 1, `seed ${s.seed}: one well of calm water`);
    const w = pools[0];
    const raft = kp.rooms[0].lifts[0];
    assert.equal(w.surfaceY, raft.plat.y + RAFT_SITS, 'down: its top just under the raft');
    assert.ok(w.bottomY - w.surfaceY < SWIM.minDepth, 'down: a wade');
    // (the raft risen: the water stops at the well's lip, under both floors)
    raft.plat.y = raft.baseY - raft.spec.rise;
    const up = kitPools(kp, st.platforms)[0];
    assert.equal(up.bottomY - up.surfaceY, WATER.dip - WATER.lip, 'up: to the lip');
    const floors = kp.rooms[0].spec.ground.map((id) => st.platforms.find((p) => p.id === id)!).filter((p) => p.y < up.bottomY && p.x + p.width >= up.x0 - 1 && p.x <= up.x1 + 1);
    assert.ok(floors.length >= 2 && floors.every((f) => up.surfaceY > f.y), 'never over the floors either side');
    assert.ok(up.bottomY - up.surfaceY >= SWIM.minDepth, 'up: deep enough to swim');
  }
});

// ───────────────────────────── in the real engine ─────────────────────────────

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

function play(w: number, h: number) {
  setDifficulty('normal');
  const st = roomStage(waterRoom, 'normal');
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 6, stage: 7, vines: e.vines, collectibles: e.collectibles });
  Object.assign(e, { kit: kp, enemies: [] });
  e.currentStage.kit = st.kit;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  sim.safe = false;
  sim.stand(RUNWAY - 120, G);
  sim.frame();
  return { sim, kit: kp, st };
}
/** his swim state now (read through a call, so one assert does not narrow the next) */
const swim = (sim: RealPlay) => sim.p.swim;
const walkTo = (sim: RealPlay, x: number, tol = 8) => {
  for (let i = 0; i < 600 && Math.abs(sim.p.x - x) > tol; i++) sim.frame(sim.p.x < x ? { right: true } : { left: true });
  sim.frame();
};
/** hold this pad until `done` (at most `s` seconds); true if it came */
const holdUntil = (sim: RealPlay, pad: Pad, done: () => boolean, s = 4) => {
  for (let i = 0; i < s * 30; i++) {
    if (done()) return true;
    sim.frame(pad);
  }
  return done();
};
const at = (st: ReturnType<typeof roomStage>, id: string) => {
  const pc = st.room.pieces.find((p) => p.id === `s1-${id}`) as { at: Anchor };
  const pl = st.platforms.find((p) => p.id === pc.at.on)!;
  return pl.x + pc.at.at * pl.width + (pc.at.dx ?? 0);
};

for (const [name, w, h] of SCREENS) {
  test(`the root well in the real engine (${name}): a wade, then the water up, the first swim, swimming, diving, out by either bank and by a flick`, () => {
    const { sim, kit, st } = play(w, h);
    const r = kit.rooms[0];
    const lever = r.levers[0];
    const pl = (id: number) => st.platforms.find((p) => p.id === id)!;
    const floorA = pl(st.room.left.on);
    const floor2 = pl(st.room.beyond.on);
    const well = st.platforms.find((p) => p.id === (st.room.pieces.find((q) => q.id === 's1-plate') as { at: Anchor }).at.on)!;
    const pools = () => sim.e.calmPools() as CalmPool[];
    const said = () => sim.said.map((s) => s.text);

    // the water down: a wade. Off floor A's end into the well, he stands on its floor, no swimming
    walkTo(sim, well.x + 160);
    sim.wait(0.5);
    assert.equal(sim.standingOn, well.id, 'standing on the well floor');
    assert.equal(swim(sim), undefined, 'the water down is a wade');
    assert.ok(pools()[0].bottomY - pools()[0].surfaceY < SWIM.minDepth);
    // back up onto floor A (a hop) and the wheel: the water fills the well to its lip
    assert.ok(holdUntil(sim, { left: true, press: true }, () => sim.standingOn === floorA.id), 'out onto floor A');
    sim.wait(0.5);
    walkTo(sim, at(st, 'sluice') - 30);
    sim.wait(0.3);
    sim.frame({ right: true });
    sim.frame();
    sim.frame({ punch: true });
    sim.frame();
    assert.equal(lever.on, true, 'the wheel turned: the water rises');
    sim.wait(RAFT_RISE / KIT.windSpeed + 1);
    const water = pools()[0];
    assert.equal(water.surfaceY, well.y - (WATER.dip - WATER.lip), 'up to the well\'s lip, no higher');
    assert.ok(water.surfaceY > floorA.y && water.surfaceY > floor2.y, 'never over the floors');

    // in: the first swim. The moment plays (no steering), Dot's first line
    const before = said().length;
    assert.ok(holdUntil(sim, { right: true }, () => !!swim(sim)), 'into the water: swimming');
    assert.notEqual(swim(sim)!.first, undefined, 'the first-swim moment');
    assert.equal(said()[before], SWIM_LINES.first);
    const x0 = sim.p.x;
    for (let i = 0; i < 15; i++) sim.frame({ right: true });
    assert.ok(Math.abs(sim.p.x - x0) < 6, `no steering during the moment (${(sim.p.x - x0).toFixed(1)})`);
    sim.wait(SWIM.firstFor);
    assert.equal(swim(sim)?.first, undefined, 'the moment is over');
    sim.wait(SWIM_FIRST_LINE);
    assert.ok(said().includes(SWIM_LINES.out), "Dot's second line: how to get out");
    // floating, treading still at the top
    assert.ok(Math.abs(sim.p.y - (water.surfaceY + SWIM.float)) < 3, `floating (${(sim.p.y - water.surfaceY).toFixed(1)} under)`);
    assert.equal(sim.p.vx, 0);
    // swimming both ways at about half a run
    walkTo(sim, well.x + 90);
    for (let i = 0; i < 15; i++) sim.frame({ right: true });
    assert.ok(sim.p.vx > 120 && sim.p.vx <= SWIM.speed, `swims right (${sim.p.vx.toFixed(0)})`);
    assert.ok(swim(sim), 'still swimming');
    for (let i = 0; i < 15; i++) sim.frame({ left: true });
    assert.ok(sim.p.vx < -120 && sim.p.facing === -1, 'and left');
    sim.wait(0.5);
    // a dive: down held takes him under; he comes up by himself after a while, down still held
    for (let i = 0; i < 30; i++) sim.frame({ down: true });
    assert.ok(swim(sim)!.under > 0.5, `under (${swim(sim)!.under.toFixed(2)})`);
    assert.ok(sim.p.y < well.y, 'never through the floor');
    for (let i = 0; i < 30 * (SWIM.diveFor + 1); i++) sim.frame({ down: true });
    assert.ok(swim(sim)!.under < 0.2, 'up by himself');
    sim.wait(1);

    // out to the right: swimming into floor B climbs out onto it
    assert.ok(holdUntil(sim, { right: true }, () => sim.standingOn === floor2.id && !swim(sim)), 'out onto floor B by swimming into it');
    assert.equal(sim.p.y, floor2.y);
    // back in (no first moment again), and out to the left onto floor A the same way
    walkTo(sim, floor2.x + 40);
    assert.ok(holdUntil(sim, { left: true }, () => !!swim(sim)), 'back in');
    assert.equal(swim(sim)!.first, undefined, 'the first-swim moment plays once');
    assert.equal(said().filter((s) => s === SWIM_LINES.first).length, 1);
    assert.ok(holdUntil(sim, { left: true }, () => sim.standingOn === floorA.id && !swim(sim), 6), 'out onto floor A by swimming into it');
    // in again, and out with a flick up toward floor B
    walkTo(sim, floorA.x + floorA.width + 70);
    assert.ok(holdUntil(sim, {}, () => !!swim(sim)));
    walkTo(sim, floor2.x - 60);
    assert.ok(swim(sim));
    sim.frame({ right: true, press: true });
    assert.equal(swim(sim), undefined, 'a flick up leaps out');
    assert.ok(sim.p.vy < -500, 'a full leap');
    assert.ok(holdUntil(sim, { right: true, jump: true }, () => sim.standingOn === floor2.id, 3), 'and onto floor B');
    // none of it cost a life or a heart
    assert.equal(sim.died, false);
    assert.equal(sim.p.hp, sim.p.maxHp);
  });
}

test('the deadly water still costs a life, beside calm water that never does', () => {
  const { sim, st } = play(844, 390);
  // the runway's far end is a drop into the stage's own water (World 6's dirty, fast water: waterY)
  const runway = st.platforms[0];
  sim.e.currentStage.waterY = G + 300;
  runway.width = RUNWAY - 200;
  sim.stand(runway.x + runway.width - 40, G);
  holdUntil(sim, { right: true }, () => sim.died, 3);
  assert.equal(sim.died, true, 'into the dirty water: a life');
  assert.equal(swim(sim), undefined, 'and no swimming in it');
});

test('carrying the root-stone he never swims: it is heavy, he walks the bottom', () => {
  const { sim, kit, st } = play(390, 844);
  const r = kit.rooms[0];
  const raft = r.lifts[0];
  const well = st.platforms.find((p) => p.id === (st.room.pieces.find((q) => q.id === 's1-plate') as { at: Anchor }).at.on)!;
  // the water up (the wheel), then up on the raft risen with the stone in his hands, and down into the water
  r.levers[0].on = true;
  sim.wait(RAFT_RISE / KIT.windSpeed + 1);
  sim.stand(at(st, 'pile') + 40, raft.plat.y);
  sim.frame({ left: true });
  sim.frame();
  sim.frame({ punch: true });
  sim.frame();
  assert.ok(kit.holding, 'holding the stone');
  walkTo(sim, at(st, 'plate') - 40);
  sim.wait(0.6);
  assert.ok(kit.holding);
  assert.equal(swim(sim), undefined, 'no swimming with the stone');
  assert.equal(sim.standingOn, well.id, 'on the bottom');
  // set down, he floats up
  sim.frame({ right: true });
  sim.frame();
  sim.frame({ punch: true });
  sim.wait(0.8);
  assert.ok(!kit.holding);
  assert.ok(swim(sim), 'hands free: swimming');
  assert.equal(sim.died, false);
});
