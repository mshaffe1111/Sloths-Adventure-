/**
 * Water and swim research (2026-11-05): measures swimming in the REAL engine (RealPlay, 30 fps) in 6-7's root well, the room
 * as w6Swim.test.ts lays it, and the well's size on all 16 shipped 6-7 rolls.
 * Run: npx tsx reference/research/water-swim-2026-11-05/measure/swim-measure.ts
 * Prints measured numbers only. Nothing here changes the game.
 */
import '../../../../src/game/headlessDom.ts';
import { KIT, type Anchor } from '../../../../src/game/puzzleKit.ts';
import { KitPlay } from '../../../../src/game/puzzlePlay.ts';
import { G } from '../../../../src/game/protoStage.ts';
import { RealPlay, type Pad } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
import { GEN2_SEEDS } from '../../../../src/game/gen2/seeds.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { resolveStage } from '../../../../tools/gen2/curate.ts';
import { roomStage, RUNWAY } from '../../../../src/game/gen2/w6Harness.ts';
import { RAFT_RISE, waterRoom } from '../../../../src/game/gen2/worlds/w6Rooms.ts';
import { kitPools, SWIM, type CalmPool } from '../../../../src/game/swim.ts';
import { PHYS } from '../../../../src/game/physics.ts';

const DT = 1 / 30;
const BODY = SWIM.half * 2; // his width against a bank (swim.ts SWIM.half, engine.ts's wall half)

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
const walkTo = (sim: RealPlay, x: number, tol = 8) => {
  for (let i = 0; i < 600 && Math.abs(sim.p.x - x) > tol; i++) sim.frame(sim.p.x < x ? { right: true } : { left: true });
  sim.frame();
};
const holdUntil = (sim: RealPlay, pad: Pad, done: () => boolean, s = 6) => {
  let n = 0;
  for (; n < s * 30; n++) {
    if (done()) return n;
    sim.frame(pad);
  }
  return done() ? n : -1;
};
const at = (st: ReturnType<typeof roomStage>, id: string) => {
  const pc = st.room.pieces.find((p) => p.id === `s1-${id}`) as { at: Anchor };
  const pl = st.platforms.find((p) => p.id === pc.at.on)!;
  return pl.x + pc.at.at * pl.width + (pc.at.dx ?? 0);
};

async function main() {
  console.log(`# swim-measure (real engine, RealPlay, dt = 1/30 s), run at ${new Date().toISOString()}`);
  const { sim, kit, st } = play(844, 390);
  const pl = (id: number) => st.platforms.find((p) => p.id === id)!;
  const floorA = pl(st.room.left.on);
  const floor2 = pl(st.room.beyond.on);
  const well = st.platforms.find((p) => p.id === (st.room.pieces.find((q) => q.id === 's1-plate') as { at: Anchor }).at.on)!;
  const pools = () => sim.e.calmPools() as CalmPool[];

  // 1. run speed on floor A: from a stand, hold right 1.0 s, then measure 0.5 s of steady run
  sim.stand(floorA.x + 20, floorA.y);
  sim.wait(0.3);
  for (let i = 0; i < 12; i++) sim.frame({ right: true });
  const rx0 = sim.p.x;
  for (let i = 0; i < 6; i++) sim.frame({ right: true });
  const runPxS = (sim.p.x - rx0) / (6 * DT);
  console.log(`run: measured ${runPxS.toFixed(0)} px/s over 0.2 s of held right (PHYS.maxRun = ${PHYS.maxRun})`);

  // 2. raise the water (the wheel)
  sim.wait(0.4);
  walkTo(sim, at(st, 'sluice') - 30);
  sim.wait(0.3);
  sim.frame({ right: true });
  sim.frame();
  sim.frame({ punch: true });
  sim.frame();
  sim.wait(RAFT_RISE / KIT.windSpeed + 1);
  const water = pools()[0];
  console.log(`well: ${well.width} px wide (${(well.width / BODY).toFixed(1)} body widths of ${BODY} px); water up: ${water.x1 - water.x0} px wide, ${water.bottomY - water.surfaceY} px deep (SWIM.minDepth ${SWIM.minDepth})`);
  console.log(`banks: floor A top ${floorA.y}, floor B top ${floor2.y}, water top ${water.surfaceY}: climb-out ${water.surfaceY - floorA.y} / ${water.surfaceY - floor2.y} px over the water (SWIM.climbOut ${SWIM.climbOut})`);

  // 3. in: the first-swim moment (no steering)
  let n = holdUntil(sim, { right: true }, () => !!sim.p.swim);
  const firstFrames = holdUntil(sim, { right: true }, () => sim.p.swim?.first === undefined, 4);
  console.log(`first swim: in after ${n} frames; the no-steer moment lasted ${(firstFrames * DT).toFixed(2)} s (SWIM.firstFor ${SWIM.firstFor})`);
  sim.wait(1);

  // 4. a full width crossing: from the left bank's side, swim right until out on floor B
  walkTo(sim, water.x0 + 30);
  sim.wait(0.5);
  const cx0 = sim.p.x;
  let frames = 0;
  let vmax = 0;
  const yOff: number[] = [];
  for (; frames < 300 && sim.p.swim; frames++) {
    sim.frame({ right: true });
    vmax = Math.max(vmax, sim.p.vx);
    if (sim.p.swim) yOff.push(sim.p.y - water.surfaceY);
  }
  console.log(`crossing: ${(sim.p.x - cx0).toFixed(0)} px from x=${cx0.toFixed(0)} in ${(frames * DT).toFixed(2)} s, out on ${sim.standingOn === floor2.id ? 'floor B' : 'id ' + sim.standingOn}; top swim speed ${vmax.toFixed(0)} px/s = ${(vmax / PHYS.maxRun).toFixed(2)} of a run`);
  console.log(`  feet under the top while swimming: ${Math.min(...yOff).toFixed(0)}-${Math.max(...yOff).toFixed(0)} px; hurt box is 38 px tall (fight.ts:260), so its top is ${(Math.min(...yOff) - 38).toFixed(0)} px under the water line`);

  // 5. back in; the dive: hold down until he comes up by himself
  walkTo(sim, floor2.x + 40);
  holdUntil(sim, { left: true }, () => !!sim.p.swim);
  sim.wait(1);
  let under = 0;
  let deepest = 0;
  let upAt = -1;
  for (let i = 0; i < 30 * 8; i++) {
    sim.frame({ down: true });
    const u = sim.p.swim?.under ?? 0;
    deepest = Math.max(deepest, u);
    if (u > 0.05) under++;
    if (under > 0 && u < 0.05 && upAt < 0) upAt = i;
  }
  console.log(`dive, down held 8 s: under (under > 0.05) for ${(under * DT).toFixed(2)} s, deepest ${deepest.toFixed(2)} of the dive (${SWIM.dive} px); back at the top by himself at ${(upAt * DT).toFixed(2)} s (SWIM.diveFor ${SWIM.diveFor})`);
  // let go of down: release, then a fresh 1 s dive and the time to the top after letting go
  sim.wait(1);
  for (let i = 0; i < 30; i++) sim.frame({ down: true });
  let k = 0;
  for (; k < 120 && (sim.p.swim?.under ?? 0) > 0.05; k++) sim.frame();
  console.log(`after a 1 s dive, let go: back at the top in ${(k * DT).toFixed(2)} s`);
  // a flick up out
  let leapT = 0;
  sim.frame({ press: true, right: true } as Pad);
  console.log(`flick up: swim ${sim.p.swim ? 'still' : 'ended'}, vy ${sim.p.vy.toFixed(0)} px/s (PHYS.jumpV ${PHYS.jumpV})`);
  leapT = holdUntil(sim, { right: true, jump: true }, () => sim.standingOn === floor2.id, 3);
  console.log(`  landed on floor B after ${(leapT * DT).toFixed(2)} s; died: ${sim.died}, hp ${sim.p.hp}/${sim.p.maxHp}`);

  // 6. the shipped 6-7 rolls: the well's water, up, on all 16
  const key = Object.keys(GEN2_SEEDS).find((kk) => GEN2_SEEDS[kk].stage === '6-7')!;
  const ent = GEN2_SEEDS[key];
  const stage = await resolveStage(key, ent.kit);
  const rows: string[] = [];
  for (const s of ent.seeds) {
    const b = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty: 'normal', recent: ent.recent });
    const kp = new KitPlay(b.kit!, b.platforms, { world: 6, stage: 7, vines: b.vines, collectibles: b.collectibles });
    const raft = kp.rooms[0].lifts[0];
    raft.plat.y = raft.baseY - raft.spec.rise;
    const pls = kitPools(kp, b.platforms);
    const lw = b.config.levelWidth;
    for (const p of pls) rows.push(`seed ${s.seed}: water ${p.x1 - p.x0} px wide x ${p.bottomY - p.surfaceY} px deep at x ${p.x0}-${p.x1} of ${lw} (${((p.x1 - p.x0) / lw * 100).toFixed(1)}% of the stage); swim time across at ${SWIM.speed} px/s = ${((p.x1 - p.x0) / SWIM.speed).toFixed(1)} s`);
  }
  console.log(`6-7 shipped rolls (${ent.seeds.length}):`);
  for (const r of rows) console.log('  ' + r);
}
if (!process.argv.includes("--rules") && !process.argv.includes("--speed")) main();

/** the rules run against the 16 shipped 6-7 rolls: beat time, lips, landing aprons, and the nearest deadly water (an open column) */
export async function rulesOn67() {
  const key = Object.keys(GEN2_SEEDS).find((kk) => GEN2_SEEDS[kk].stage === '6-7')!;
  const ent = GEN2_SEEDS[key];
  const stage = await resolveStage(key, ent.kit);
  console.log('# rules R4 (beat <= 14 s Normal), R6 (lip <= 70 px; apron >= 114 px = 3 body widths), R2 (deadly water within one 844 px screen)');
  for (const s of ent.seeds) {
    const b = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: s.seed, difficulty: 'normal', recent: ent.recent });
    const kp = new KitPlay(b.kit!, b.platforms, { world: 6, stage: 7, vines: b.vines, collectibles: b.collectibles });
    const raft = kp.rooms[0].lifts[0];
    raft.plat.y = raft.baseY - raft.spec.rise;
    const w = kitPools(kp, b.platforms)[0];
    const solids = b.platforms.filter((p) => p.type === 'solid' && !p.broken);
    const bankL = solids.find((p) => Math.abs(p.x + p.width - w.x0) < 2 && p.y < w.surfaceY);
    const bankR = solids.find((p) => Math.abs(p.x - w.x1) < 2 && p.y < w.surfaceY);
    // an open column: nothing to stand on anywhere under (a fall there meets the stage's dirty water, waterY)
    const open = (x: number) => !b.platforms.some((p) => x >= p.x && x <= p.x + p.width && p.y > (b.waterY ?? 1e9) - 900);
    let nearest = Infinity;
    for (let x = 0; x < b.config.levelWidth; x += 10) if (open(x)) nearest = Math.min(nearest, x < w.x0 ? w.x0 - x : x > w.x1 ? x - w.x1 : 0);
    const beat = (w.x1 - w.x0) / SWIM.speed;
    console.log(`seed ${s.seed}: beat ${beat.toFixed(1)} s ${beat <= 14 ? 'PASS' : 'FAIL'}; lips L ${bankL ? w.surfaceY - bankL.y : '?'} / R ${bankR ? w.surfaceY - bankR.y : '?'} px; aprons L ${bankL?.width ?? '?'} / R ${bankR?.width ?? '?'} px ${(bankL?.width ?? 0) >= 114 && (bankR?.width ?? 0) >= 114 ? 'PASS' : 'FAIL'}; waterY ${b.waterY}; nearest open column to the well ${nearest === Infinity ? 'none' : nearest + ' px'} ${nearest <= 844 ? '(deadly water within a screen: R2 flag)' : ''}`);
  }
}
if (process.argv.includes('--rules')) rulesOn67();

/**
 * The key idea run against the real engine: what a faster swim does in 6-7's real well. SWIM.speed is overridden in memory only for
 * this run (the game is unchanged). For each speed: the crossing time, whether swimming into the far bank still climbs out (the bank
 * check is a +-8 px touch window, swim.ts:51-52, 190-191: at 30 fps a fast swimmer moves more than that a frame), and the acceleration.
 */
export function speedTrial() {
  console.log('# speed trial (SWIM.speed overridden in memory; acc scaled with it so the time to top speed stays 1/6 s)');
  const base = { speed: SWIM.speed, acc: SWIM.acc, dec: SWIM.dec };
  for (const mult of [0.53, 1.0, 1.25, 1.5, 1.8]) {
    const sp = Math.round(PHYS.maxRun * mult);
    Object.assign(SWIM as unknown as Record<string, number>, { speed: sp, acc: base.acc * sp / base.speed, dec: base.dec * sp / base.speed });
    const { sim, kit, st } = play(844, 390);
    const pl = (id: number) => st.platforms.find((p) => p.id === id)!;
    const floor2 = pl(st.room.beyond.on);
    kit.rooms[0].levers[0].on = true;
    sim.wait(RAFT_RISE / KIT.windSpeed + 1);
    const water = (sim.e.calmPools() as CalmPool[])[0];
    sim.stand(water.x0 - 30, pl(st.room.left.on).y);
    holdUntil(sim, { right: true }, () => !!sim.p.swim);
    sim.wait(SWIM.firstFor + 0.2);
    // swim left to the near bank's face first so every trial starts at the same spot
    walkTo(sim, water.x0 + 30);
    sim.wait(0.4);
    const x0 = sim.p.x;
    let f = 0;
    let stuck = 0;
    let lastX = sim.p.x;
    for (; f < 300 && sim.p.swim; f++) {
      sim.frame({ right: true });
      if (Math.abs(sim.p.x - lastX) < 0.5) stuck++;
      lastX = sim.p.x;
    }
    const out = !sim.p.swim && sim.standingOn === floor2.id;
    console.log(`x${mult.toFixed(2)} of a run = ${sp} px/s (${(sp / 30).toFixed(1)} px a frame): ${out ? 'climbed out onto floor B' : 'did NOT climb out'} after ${(f / 30).toFixed(2)} s from x=${x0.toFixed(0)}; frames pinned against the bank ${stuck}`);
  }
  Object.assign(SWIM as unknown as Record<string, number>, base);
}
if (process.argv.includes('--speed')) speedTrial();
