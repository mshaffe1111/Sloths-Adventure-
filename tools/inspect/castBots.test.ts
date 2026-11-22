// The bots know a drop trap from the stage's cast data, on ANY stage (P13, 11-12: firsttimer.ts castPlan). A real engine on a stage that
// is not 1-3 (2-2: no stage id, seed or x is the bot's), its ground swapped for a planted arena: a ledge, a branch with a Golden Tree
// Snake, a hive hung over it, its vine on the ledge. Told of traps, he walks to the vine, punches it, and the snake glides off, no hit;
// a trap over no animal he passes; one he was never told of he does not use; a trap he meets from the far side (the animal before the
// handle) is not the safe way, and he leaves it (a behaviour check: the walk's own punch meets the animal first, so it passes without castPlan's
// direction rule too; the rule is kept for a handle and an animal both in reach).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_MIDDLE, freshPhone, rng, stillCoverNear } from './firsttimer.ts';
import { eagleOver } from '../../src/game/gen2/worlds/w1Cast.ts';
import { floorSeconds, runHolds, stageFloor } from './castBots.ts';
import { setDifficulty } from '../../src/game/difficulty.ts';
import type { Enemy, Platform } from '../../src/game/types.ts';

const Y = 500;
const plat = (id: number, x: number, width: number): Platform => ({ id, x, y: Y, width, height: 400, type: 'solid' } as Platform);
const TRAP = { id: 1, kind: 'vine' as const, load: 'hive' as const, x: 560, y: Y, loadX: 820, loadY: Y - 210, landY: Y };

function arena(o: { told: boolean; snake: boolean; from?: 'left' | 'right'; at?: number }): { run: FirstTimerRun; e: any; snake: Enemy | null } { // eslint-disable-line @typescript-eslint/no-explicit-any
  freshPhone('normal');
  setDifficulty('normal');
  Math.random = rng(7);
  const right = o.from !== 'right';
  // (the route as the inspector gives one: a point every 40 px)
  const pts = Array.from({ length: 33 }, (_, i) => ({ x: 250 + i * 40, y: Y }));
  const route = right ? pts : pts.reverse();
  const run = new FirstTimerRun('2-2', 1, FT_MIDDLE, { route, cap: 14 });
  const e = (run as any).e; // eslint-disable-line @typescript-eslint/no-explicit-any
  e.platforms.length = 0;
  e.platforms.push(plat(9001, 0, 620), plat(9002, 640, 360), plat(9003, 1020, 900));
  const snake = o.snake ? ({
    id: 9500, type: 'snake', x: 820, y: Y - 14, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: 760, patrolMaxX: 880,
    attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
  } as Enemy) : null;
  e.enemies.length = 0;
  if (snake) e.enemies.push(snake);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.hazards.length = 0;
  e.proto.cast = { kinds: ['snake'], traps: [{ ...TRAP }] };
  e.proto.hints = [];
  e.startCast();
  (run as any).sim.stand(o.at ?? (right ? 250 : 1400), Y); // eslint-disable-line @typescript-eslint/no-explicit-any
  e.player.hp = e.player.maxHp;
  if (o.told) (run as any).learned.add('trap'); // eslint-disable-line @typescript-eslint/no-explicit-any
  return { run, e, snake };
}

test('told of traps, he uses one whose load hangs over an animal: he walks to the handle, punches it, the snake glides off, no hit', () => {
  const { run, e, snake } = arena({ told: true, snake: true });
  run.play();
  assert.notEqual(e.cast.traps[0].phase, 'set', 'he sprang it');
  assert.equal(snake!.kit!.beatenBy, 'trap');
  assert.ok(snake!.defeated || snake!.kit!.leaving);
  assert.equal(run.harms.length, 0, 'not a hit: the handle stands outside the strike');
});

test('a trap over no animal he passes (it is not worth using)', () => {
  const { run, e } = arena({ told: true, snake: false });
  run.play();
  assert.equal(e.cast.traps[0].phase, 'set');
  assert.ok(run.sim.p.x > 900, 'he walked on past it');
});

test('never told of traps, he does not use one (he knows nothing the stage has not told him)', () => {
  const { run, e } = arena({ told: false, snake: true });
  run.play();
  assert.equal(e.cast.traps[0].phase, 'set');
});

test('coming the other way along the branch he meets the animal before the handle: the trap is not the safe way, and he leaves it', () => {
  const { run, e } = arena({ told: true, snake: true, from: 'right' });
  run.play();
  // (he deals with the snake by the walk's own punch or hop; never a walk past it to reach the vine)
  assert.notEqual(e.cast.members[0].s.beatenBy, 'trap');
});

test('his thumb carried him past the handle he meant to punch: he walks back to it and springs it (W1C\'s trace, 1-3 seed 1)', () => {
  // (he picked this trap, then ran on 60 px past where he stands to punch it: the goal is kept, so he turns back for it)
  const { run, e, snake } = arena({ told: true, snake: true, at: 600 });
  (run as any).trapGoal = e.cast.traps[0].post; // eslint-disable-line @typescript-eslint/no-explicit-any
  run.play();
  assert.notEqual(e.cast.traps[0].phase, 'set', 'he went back and sprang it');
  assert.equal(snake!.kit!.beatenBy, 'trap');
});

test('(behaviour check, not a planted test: the stall needs the real roll, A/B in REPORT) a tier bot at a bank\'s 51 px face on a cast stage hops it', async () => {
  const { FT_CHILD } = await import('./firsttimer.ts');
  let rescued = 0;
  for (let k = 1; k <= 12; k++) {
  freshPhone('normal');
  setDifficulty('normal');
  Math.random = rng(k);
  const pts = Array.from({ length: 33 }, (_, i) => ({ x: 250 + i * 40, y: Y }));
  const run = new FirstTimerRun('2-2', 1, FT_CHILD, { route: pts, cap: 30 });
  const e = (run as any).e; // eslint-disable-line @typescript-eslint/no-explicit-any
  e.platforms.length = 0;
  // (1-3 seed 3 at x 3968: a bank, then the next bank 51 px up, its face a wall: no floor runs on under the step)
  e.platforms.push(plat(9001, 0, 520), { id: 9004, x: 520, y: Y - 51, width: 1500, height: 451, type: 'solid', style: 'moss_stone' } as Platform);
  e.enemies.length = 0;
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.hazards.length = 0;
  e.proto.cast = { kinds: ['snake'], traps: [] };
  e.proto.hints = [];
  e.startCast();
  (run as any).sim.stand(250, Y); // eslint-disable-line @typescript-eslint/no-explicit-any
  run.play();
  rescued += run.rescues;
  }
  assert.equal(rescued, 0, 'no rescue at the face, over 12 thumbs');
});

// The way on through a tower leg that goes DOWN before it goes up (FIX-14, R-165.206; 1-4's rotten fork: off the entry ledge onto a
// floor 200 px under it, then up a vine that stands on that floor). The bots' route went along the ENTRY's height to the vine and up it,
// floating 200 px over the floor; from the floor the way on never read as up and he paced round the vine's foot (castBots 4/32 on the
// fork). A toy leg, no stage's: the route must go down to the vine's foot before it goes up, and never hang in the air at the entry's
// height over the vine. A vine whose foot is at the entry's height (an ordinary climb) still goes straight up.
test('the tower route goes down to a sunk vine\'s foot before it climbs (a down-then-up leg)', async () => {
  const { towerCorners } = await import('./towerRoute.ts');
  const leg = (vineFoot: number) => ({
    gen2: { plan: [{}], tower: { route: { legs: [{ entry: { x: 0, y: 1000 }, exit: { x: 420, y: 760 } }], spawn: { x: 0, y: 1000 } }, turns: [] } },
    vines: [{ x: 300, topY: 760, bottomY: vineFoot, vineType: 'tree_climb' }],
  });
  const sunk = towerCorners(leg(1200) as never, { x: 0, y: 1000 })!;
  const at = (c: { x: number; y: number }[], x: number, y: number) => c.findIndex((p) => Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1);
  const foot = at(sunk, 300, 1200), top = at(sunk, 300, 760);
  assert.ok(foot >= 0, `no corner at the sunk vine's foot (300, 1200): ${JSON.stringify(sunk)}`);
  assert.ok(top > foot, `the climb does not follow the foot: ${JSON.stringify(sunk)}`);
  // (and the climb is up from the foot, never from the air at the entry's height)
  assert.ok(sunk[top - 1].y > 1000 + 60, `the climb starts in the air at y ${sunk[top - 1].y}: ${JSON.stringify(sunk)}`);
  const plain = towerCorners(leg(1000) as never, { x: 0, y: 1000 })!;
  assert.ok(at(plain, 300, 1000) >= 0 && at(plain, 300, 760) === at(plain, 300, 1000) + 1, `an ordinary climb is no longer straight up: ${JSON.stringify(plain)}`);
});

// (BUILD-26c, 2-6: a leg that starts at the top of the turn just climbed has no corner at its entry, 26 px past the vine: off the vine he
// lands past it and went BACK for it, down the climb's hole (child Easy 2, 8 times, rescued) or off the lip into the shaft (expert
// Normal 1, about 8 s). Planted: the base (fd3ce98b1) keeps the corner. An entry well away from the vine keeps its corner)
test('the tower route goes on from a turn\'s top along the leg, never back to an entry beside the vine', async () => {
  const { towerCorners } = await import('./towerRoute.ts');
  const tower = (entryX: number) => ({
    gen2: { plan: [{ join: 'turn' }], tower: { route: { legs: [{ entry: { x: entryX, y: 700 }, exit: { x: 100, y: 700 } }], spawn: { x: 900, y: 1000 } }, turns: [{ x: 600, from: 1000, to: 700 }] } },
    vines: [{ x: 600, topY: 700, bottomY: 1000, vineType: 'tree_climb' }],
  });
  const at = (c: { x: number; y: number }[], x: number, y: number) => c.findIndex((p) => Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1);
  const beside = towerCorners(tower(626) as never, { x: 900, y: 1000 })!;
  const top = at(beside, 600, 700);
  assert.ok(top >= 0, `no corner at the vine's top: ${JSON.stringify(beside)}`);
  assert.equal(at(beside, 626, 700), -1, `a corner at the entry beside the vine (he goes back for it): ${JSON.stringify(beside)}`);
  assert.deepEqual(beside[top + 1], { x: 100, y: 700 }, `from the vine's top the way is not straight on along the leg: ${JSON.stringify(beside)}`);
  const away = towerCorners(tower(400) as never, { x: 900, y: 1000 })!;
  assert.ok(at(away, 400, 700) === at(away, 600, 700) + 1, `an entry 200 px from the vine lost its corner: ${JSON.stringify(away)}`);
});

// (BUILD-26g, 1-4 Easy 10, C: up a vine onto a floor at 781, the leg's exit back at 481, the next turn's vine 5 px PAST the arrival at
// 786. The strict span kept the walk out to 481 and back over the same bough; Progress flipped between the two ways and he stood turning
// for 23 s, rescued. A vine within GRAB_REACH of the span is taken from where he stands. Planted: the base line (c99352a65) keeps 481.
// A vine well past the arrival (200 px) is a real way back past it, and the exit keeps its corner)
test("the tower route takes a turn's vine a hand's reach past the arrival straight, never out to the exit and back", async () => {
  const { noOutAndBack } = await import('./towerRoute.ts');
  const way = (dx: number) => noOutAndBack([{ x: 781, y: 1000 }, { x: 781, y: 700 }, { x: 481, y: 700 }, { x: 781 + dx, y: 700 }, { x: 781 + dx, y: 400 }]);
  assert.equal(way(5).findIndex((p) => p.x === 481), -1, `out to 481 and back for a vine 5 px past the arrival: ${JSON.stringify(way(5))}`);
  assert.ok(way(200).some((p) => p.x === 481), `a vine 200 px past the arrival lost the exit's corner: ${JSON.stringify(way(200))}`);
  assert.equal(way(-100).findIndex((p) => p.x === 481), -1, 'a vine inside the span still goes straight to it');
});

// (BUILD-26g, 1-4 A/B, kid Normal 7: a hop off r1 fell short onto the floor 80 px under the raised row; the tower's "stopped first"
// meant {} but KID and ADULT's held steer re-armed its late lift-off every frame (thumbify, R-165.59), so he ran on under the row and
// off the floor's end, 281 px down, rescued. A 1-4 s3 copy, y less 9000: the stop is a lift the thumb makes once. Planted: the stop
// is not meant (the base, c99352a65): he runs off the end on every roll)
test('under a raised row on a tower, KID stops (one late lift-off), hops up and never runs off the floor under it', async () => {
  const { FirstTimerRun, FT_KID, FT_ADULT } = await import('./firsttimer.ts');
  const plats = [
    { id: 1, x: 364, y: 987, width: 110, height: 24, type: 'solid' },
    { id: 2, x: 634, y: 987, width: 110, height: 24, type: 'solid' },
    { id: 3, x: 744, y: 987, width: 110, height: 24, type: 'solid' },
    { id: 4, x: 854, y: 987, width: 200, height: 24, type: 'solid' },
    { id: 5, x: 334, y: 1067, width: 640, height: 24, type: 'solid' },
    { id: 6, x: 900, y: 706, width: 500, height: 24, type: 'solid' },
    { id: 9, x: 0, y: 1348, width: 2000, height: 100, type: 'solid' },
  ];
  const vine = { id: 5, x: 1036, topY: 706, bottomY: 987, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
  const route = [
    ...Array.from({ length: 27 }, (_, i) => ({ x: 400 + i * 24, y: 987 })),
    ...Array.from({ length: 12 }, (_, i) => ({ x: 1036, y: 987 - i * 24 })),
    ...Array.from({ length: 14 }, (_, i) => ({ x: 1036 + i * 24, y: 706 })),
  ];
  const low = (who: typeof FT_KID, seed: number, plant: boolean) => {
    let lo = 0;
    const run = new FirstTimerRun('1-1', seed, { ...who, look: 0 }, { route, cap: 14, rescueAfter: 100, onFrame: (s: { p: { y: number } }) => { lo = Math.max(lo, s.p.y); } });
    run.sim.bare(plats as never, [vine as never]);
    // (landed short on the floor under r2, running right with the steer held, as at 15.87 s in eng26o/trace-a-b.txt)
    run.sim.stand(687, 1067);
    run.sim.p.vx = 268;
    run.sim.p.facing = 1;
    const r = run as unknown as { lastSteer: number; onTower: boolean };
    r.lastSteer = 1;
    r.onTower = true;
    if (plant) Object.defineProperty(run, 'stopMeant', { get: () => false, set: () => undefined });
    run.prog.relocate(run.sim.p);
    run.play();
    return Math.round(lo);
  };
  for (const seed of [1, 2, 3]) {
    assert.ok(low(FT_KID, seed, false) < 1100, `kid roll ${seed} ran off the floor under the row (lowest y ${low(FT_KID, seed, false)})`);
    assert.ok(low(FT_ADULT, seed, false) < 1100, `adult roll ${seed} ran off the floor under the row`);
    assert.ok(low(FT_KID, seed, true) > 1300, `PLANT: with the stop not meant the kid (roll ${seed}) still stays up (lowest y ${low(FT_KID, seed, true)})`);
  }
});

// (STAGE-RULES.md:77: "at least 2 minutes for a quick player, on every roll ... Climbs count 20 s short". castBots held every stage to a
//  flat 120 s, so 1-4 (a climb) failed the rule's own 100 s: the floor is read from eraRoll.ts RULES and isClimb, R-165.206, D19)
test('the length floor is the stage rule\'s: a climb at 105 s holds, a run stage at 105 s does not (STAGE-RULES.md:77)', () => {
  assert.equal(floorSeconds(true), 100);
  assert.equal(floorSeconds(false), 120);
  assert.ok(runHolds({ pass: true, time: 105 }, floorSeconds(true)), 'a climb at 105 s');
  assert.ok(!runHolds({ pass: true, time: 105 }, floorSeconds(false)), 'a run stage at 105 s');
  assert.ok(!runHolds({ pass: false, time: 300 }, floorSeconds(true)), 'a run that did not reach the shrine never holds');
  // (the real stages, read as the rules read them: 1-4 climbs the kapok, 1-5 runs her road)
  assert.equal(stageFloor('1-4'), 100);
  assert.equal(stageFloor('1-5'), 120);
});

// (ENG-E2, 1-7 NEW 10: bots that hold still in cover) The kit's eagle over a stretch (w1Cast.ts eagleOver, no proto.watch): told how to
// hide, the bot goes still in the nearest cover on its screech (a moss carpet here) and is never taken; never told, he walks on in the
// open and is. Planted: the base bot (t-eng-e1@f573675b) hid only from the old watcher, so told or not it was taken on the kit's eagle.
/** one frame as FirstTimerRun.play runs it (its pad, the frame, its bookkeeping after: a jump ends there) */
const step = (run: FirstTimerRun): void => {
  const r = run as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  r.sim.frame(r.pad());
  r.frames++;
  r.after();
};
function eagleArena(told: boolean, seed: number): { run: FirstTimerRun; e: any; hp0: number } { // eslint-disable-line @typescript-eslint/no-explicit-any
  freshPhone('normal');
  setDifficulty('normal');
  Math.random = rng(seed);
  const pts = Array.from({ length: 41 }, (_, i) => ({ x: 250 + i * 40, y: Y }));
  const run = new FirstTimerRun('2-2', 1, FT_MIDDLE, { route: pts, cap: 22 });
  const e = (run as any).e; // eslint-disable-line @typescript-eslint/no-explicit-any
  e.platforms.length = 0;
  e.platforms.push(plat(9001, 0, 2600));
  e.enemies.length = 0;
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.hazards.length = 0;
  e.proto.bushes = [{ x: 700, w: 346, y: Y, kind: 'moss' }, { x: 1250, w: 169, y: Y, kind: 'mossPatch' }];
  // (it looks from the far end toward him, so its gaze meets a walker: one going its way outruns it)
  e.enemies.push({ ...eagleOver({ x0: 300, x1: 1500, calm: [6, 6] }, Y, 9600), facing: -1 });
  e.proto.cast = { kinds: ['eagle'], traps: [] };
  e.proto.hints = [];
  e.startCast();
  (run as any).sim.stand(250, Y); // eslint-disable-line @typescript-eslint/no-explicit-any
  e.player.hp = e.player.maxHp;
  if (told) (run as any).learned.add('hide'); // eslint-disable-line @typescript-eslint/no-explicit-any
  return { run, e, hp0: e.player.hp };
}

test('told how to hide, on the kit eagle\'s screech the bot goes still in the nearest cover (a moss carpet) and is never taken', () => {
  for (const seed of [1, 2, 3]) {
    const { run, e, hp0 } = eagleArena(true, seed);
    let stillInMoss = 0;
    for (let i = 0; i < 18 * 30; i++) {
      step(run);
      if (e.cast.calmNow(false) >= 1 && e.cast.sweepers[0].s.phase === 'hunt') stillInMoss++;
    }
    assert.equal(e.player.hp, hp0, `seed ${seed}: never taken (hp ${e.player.hp} of ${hp0})`);
    assert.ok(stillInMoss > 15, `seed ${seed}: he was still in cover while it looked (${stillInMoss} frames)`);
  }
});

test('never told how to hide, the bot walks on in the open under the kit eagle and is taken (the stage must teach it)', () => {
  const { run, e, hp0 } = eagleArena(false, 1);
  for (let i = 0; i < 18 * 30; i++) step(run);
  assert.ok(e.player.hp < hp0, `taken (hp ${e.player.hp} of ${hp0})`);
});

test('the cover a bot heads for: the nearest ground cover at his level, never hanging moss or a hollow\'s dressing', () => {
  const covers = [{ x: 100, w: 110, y: Y }, { x: 700, w: 346, y: Y }, { x: 300, w: 173, y: Y - 200, hanging: true }, { x: 260, w: 110, y: Y, secret: true }];
  assert.equal(stillCoverNear(covers, 320, Y)?.x, 100);
  assert.equal(stillCoverNear(covers, 600, Y)?.x, 700);
  assert.equal(stillCoverNear(covers, 800, Y)?.x, 700, 'inside it');
  assert.equal(stillCoverNear(covers, 2000, Y), null, 'none within 600 px');
});

test('castBots --input: touch drives the touch layer (its minimum hold), pad the Jump button (PAD_HOP_MS), fake stays the default (FIX-284)', async () => {
  const { realInputOf } = await import('./castBots.ts');
  const { PAD_HOP_MS } = await import('../../src/game/padControl.ts');
  assert.equal(realInputOf('touch'), true);
  assert.equal(realInputOf('pad'), PAD_HOP_MS);
  assert.equal(realInputOf('fake'), undefined);
});

// (BUILD-26c: a tower whose trace SUCCEEDS still takes its own route: 2-6's trace ('extended') slanted each turn's climb through the
// floors and the kid and adult stood under the slant, 0/40 on both settings. Planted: the base (fd3ce98b1) took it only on 'failed')
test('a tower takes its own laid route even when the inspector traces it; a stage that is no tower keeps its trace', async () => {
  const { takesTowerRoute } = await import('./firsttimer.ts');
  const tower = {
    gen2: { plan: [{ join: 'turn' }], tower: { route: { legs: [{ entry: { x: 400, y: 700 }, exit: { x: 100, y: 700 } }], spawn: { x: 900, y: 1000 } }, turns: [{ x: 600, from: 1000, to: 700 }] } },
    vines: [{ x: 600, topY: 700, bottomY: 1000, vineType: 'tree_climb' }],
  };
  const spawn = { x: 900, y: 1000 };
  assert.ok(takesTowerRoute(tower as never, spawn, 'extended'), 'a traced tower follows the trace');
  assert.ok(takesTowerRoute(tower as never, spawn, 'failed'), 'an untraced tower');
  assert.ok(!takesTowerRoute({ gen2: { plan: [] } } as never, spawn, 'extended'), 'a stage that is no tower left its trace');
});

// At a climbing vine's foot with no ledge over him, the tier bot's jump for the way up goes toward the vine (or straight up), never his
// facing: a jump away from a trunk never grabs it (engine.ts wantGrab). 2-6 child Normal 3, 5, 7, 8, 18 (BUILD-26d, traced): he came
// along the edge-wheel turn's ledge (x 225-465) going LEFT (way -1) and decided at x 235, 15 px left of its vine (x 250): the route's
// far point inside the 16 px dead band, so the jump fell back to way -1 and he doubled left off the ledge's end onto the street 351 px
// down, 8 times, rescued. The toy (BUILD-26e) decides from that frame's own state: 14 px left of the vine, way -1, no look delay (mid-run,
// as on landing there). The plant (the skill taken away) must drop to the street, or the toy no longer shows the fault.
test('at a climbing vine\'s foot, come in going away from it, the tier bot jumps for the vine and climbs: never off the ledge\'s end', async () => {
  const { FirstTimerRun, FT_CHILD } = await import('./firsttimer.ts');
  const plats = [
    { id: 1, x: 225, y: 1000, width: 240, height: 24, type: 'solid' },
    { id: 2, x: 0, y: 495, width: 1300, height: 24, type: 'solid' },
    { id: 3, x: 0, y: 1351, width: 1300, height: 100, type: 'solid' },
  ];
  const vine = { id: 1, x: 250, topY: 495, bottomY: 1000, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
  const route = [
    ...Array.from({ length: 9 }, (_, i) => ({ x: 440 - i * 24, y: 1000 })),
    ...Array.from({ length: 22 }, (_, i) => ({ x: 250, y: 1000 - i * 24 })),
    ...Array.from({ length: 11 }, (_, i) => ({ x: 250 + i * 24, y: 495 })),
  ];
  const play = (plant: boolean) => {
    let low = 0;
    const run = new FirstTimerRun('1-1', 1, { ...FT_CHILD, look: 0 }, { route, cap: 12, rescueAfter: 100, onFrame: (s: { p: { y: number } }) => { low = Math.max(low, s.p.y); } });
    run.sim.bare(plats as never, [vine as never]);
    run.sim.stand(236, 1000);
    run.sim.p.facing = -1;
    (run as unknown as { way: number }).way = -1;
    if (plant) (run as unknown as { climbUpVine: () => undefined }).climbUpVine = () => undefined;
    run.prog.relocate(run.sim.p);
    run.play();
    return { x: Math.round(run.sim.p.x), y: Math.round(run.sim.p.y), low: Math.round(low) };
  };
  const up = play(false);
  assert.ok(up.y < 600 && up.low < 1100, `he climbs the vine to the floor over it and never drops to the street (ends ${up.x},${up.y}, lowest y ${up.low})`);
  const planted = play(true);
  assert.ok(planted.low > 1300, `PLANT: with the skill taken away he doubles off the ledge's end onto the street (lowest y ${planted.low})`);
});

test('fallen from a leg to the floor 379 px under it, Progress rewinds to the way up: he walks to the vine and climbs, never hops under the leg (BUILD-26f, 2-6 adult N 26)', async () => {
  const { FirstTimerRun, FT_ADULT } = await import('./firsttimer.ts');
  // (2-6 Normal seed 26's ground there, 3118 px higher: the floor #28/#35/#36/#84 at y 1000, its seams opened to 40 px gaps so he hops
  //  along it as he did there (every hop took `off` under 260 in the air: b26f/dbgOff.txt), the leg #37/#38/#39 at y 621
  //  with the dips #41/#42 at 691 between them, the climbing vine V#6 from the floor to the leg, here at the
  //  leg's right end 790 px from him (x 1900; there 1587, 480 px), so no hop of his drifts him to it; b26e/win.mts)
  const plats = [
    { id: 1, x: 400, y: 1000, width: 425, height: 100, type: 'solid' },
    { id: 28, x: 825, y: 1000, width: 280, height: 24, type: 'solid' },
    { id: 35, x: 1145, y: 1000, width: 220, height: 24, type: 'solid' },
    { id: 36, x: 1405, y: 1000, width: 200, height: 24, type: 'solid' },
    { id: 90, x: 0, y: 1400, width: 2000, height: 100, type: 'solid' },
    { id: 84, x: 1605, y: 1000, width: 395, height: 24, type: 'solid' },
    { id: 37, x: 1321, y: 621, width: 594, height: 24, type: 'solid' },
    { id: 38, x: 1029, y: 621, width: 200, height: 24, type: 'solid' },
    { id: 39, x: 744, y: 621, width: 200, height: 24, type: 'solid' },
    { id: 41, x: 1229, y: 691, width: 92, height: 24, type: 'solid' },
    { id: 42, x: 944, y: 691, width: 85, height: 24, type: 'solid' },
  ];
  const vine = { id: 6, x: 1900, topY: 621, bottomY: 1000, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
  const legY = (x: number) => (x > 1229 && x < 1321) || (x > 944 && x < 1029) ? 691 : 621;
  const floor = Array.from({ length: 62 }, (_, i) => ({ x: 430 + i * 24, y: 1000 }));
  const climb = Array.from({ length: 16 }, (_, i) => ({ x: 1900, y: 1000 - i * 24 }));
  const leg = Array.from({ length: 47 }, (_, i) => ({ x: 1876 - i * 24, y: legY(1876 - i * 24) }));
  const route = [...floor, ...climb, ...leg];
  const at = floor.length + climb.length + leg.findIndex((q) => q.x < 1170);
  const back = floor.length + climb.length;
  const play = (plant: boolean) => {
    let top = 9999, frames = 0, rewound = -1;
    // eslint-disable-next-line prefer-const
    let run: InstanceType<typeof FirstTimerRun>;
    const onFrame = (s: { p: { y: number } }) => {
      top = Math.min(top, s.p.y);
      frames++;
      if (rewound < 0 && run.prog.cur < back) rewound = frames / 30;
    };
    run = new FirstTimerRun('1-1', 1, { ...FT_ADULT, look: 0 }, { route, cap: 20, rescueAfter: 100, onFrame });
    run.sim.bare(plats as never, [vine as never]);
    run.sim.stand(1109, 1000);
    run.sim.p.facing = 1;
    if (plant) (run.prog as unknown as { under: () => boolean }).under = () => false;
    // (his place along the way is still on the leg over his head, as Progress kept it after the fall: #38's point at x ~1167)
    run.prog.cur = run.prog.hi = run.prog.best = at;
    run.play();
    return { x: Math.round(run.sim.p.x), y: Math.round(run.sim.p.y), top: Math.round(top), rewound, rescues: (run as unknown as { rescueXs: number[] }).rescueXs.length };
  };
  // (the fix: Progress goes back to the floor within 1.5 s whatever his hops do, and he walks to the vine and climbs onto the leg)
  const up = play(false);
  // (1.5 s: the rewind waits out 0.5 s of the clock and his first hop; 1.23 s on the fix, 4.5 s on 2f188c552)
  assert.ok(up.rewound >= 0 && up.rewound <= 1.5, `his place along the way goes back to the floor within 1.5 s (at ${up.rewound} s)`);
  assert.ok(up.top < 700 && up.rescues === 0, `he climbs the vine onto the leg, no rescue (ends ${up.x},${up.y}, highest y ${up.top}, rescues ${up.rescues})`);
  // (the plant: every hop resets the fall-back clock in the air, so it stays on the leg while he hops under it. Here a still moment
  //  between hops lets the old rewind fire late (about 5.6 s); on 2-6 none came, and he hopped 19.6 s to a rescue)
  const planted = play(true);
  assert.ok(planted.rewound < 0 || planted.rewound > 2.5, `PLANT: with the rewind taken away his place stays on the leg through his hops (back at ${planted.rewound} s)`);
});

test('at a lip where the floor goes on a hop UP with no face (a thin bough starting at the lip), a late press is made on the run: he jumps, never walks off under it (BUILD-26j, 1-4 child Easy 37)', async () => {
  const { FirstTimerRun, FT_CHILD_EASY } = await import('./firsttimer.ts');
  // (1-4 Easy 37's lip, y less 1684: #44 360-760 @1000, #45 starts AT its lip 40 px up; #45 runs on far past the way's end so only
  //  the lip is measured; the way as C reads it, one slant from the vine top to the far vine)
  const plats = [
    { id: 44, x: 360, y: 1000, width: 400, height: 16, type: 'solid' },
    { id: 45, x: -428, y: 960, width: 788, height: 16, type: 'solid' },
    { id: 9, x: -1000, y: 1348, width: 3000, height: 100, type: 'solid' },
  ];
  const route = Array.from({ length: 30 }, (_, i) => ({ x: 786 - i * 24, y: 1000 - (40 * i * 24) / 696 })).filter((q) => q.x >= 90);
  const leaves = (seed: number, plant: boolean) => {
    let g = true, vy: number | null = null;
    const run = new FirstTimerRun('1-1', seed, { ...FT_CHILD_EASY, look: 0 }, { route, cap: 6, rescueAfter: 100, onFrame: (s: { p: { grounded: boolean; vy: number } }) => {
      if (g && !s.p.grounded && vy === null) vy = s.p.vy;
      g = s.p.grounded;
    } });
    run.sim.bare(plats as never, []);
    run.sim.stand(700, 1000);
    run.sim.p.facing = -1;
    const r = run as unknown as { lastSteer: number; edgePlan: () => { how: string }; stepUpAtLip: unknown };
    r.lastSteer = -1;
    // (every edge drawn late unless it is a run: the walk-off the rule is for)
    const ep = r.edgePlan.bind(run);
    r.edgePlan = () => { const e = ep(); if (e.how !== 'run') e.how = 'late'; return e; };
    if (plant) r.stepUpAtLip = () => null;
    run.prog.relocate(run.sim.p);
    run.play();
    return vy ?? 0;
  };
  let walked = 0;
  for (const seed of [1, 2, 3, 4, 5, 6]) {
    assert.ok(leaves(seed, false) < 0, `roll ${seed}: he left the lip without a press (vy ${leaves(seed, false)})`);
    if (leaves(seed, true) > 0) walked++;
  }
  assert.ok(walked >= 3, `PLANT: with stepUpAtLip off he still pressed at the lip in ${6 - walked} of 6 rolls (expected walk-offs)`);
});

test('knocked off a vine field to its floor, the rewind takes the way he can reach (his floor, or up the vine at his feet), never a leg under that floor; with none, the points under him (BUILD-26k, 1-4 child N 8 and 14)', async () => {
  const { Progress } = await import('./firsttimer.ts');
  const { FigPush } = await import('./figPush.ts');
  // (1-4 child Normal seed 14's way there, its route points as built: the leg at y ~2684 under the field (542-1190), up to the
  //  field's floor at x 1190 and back left along it at y 2363 to x 890, up the field vine at x 890 to its top at 1923, along the vine
  //  tops to x 448; he lands on the floor at x 565 after a pod's knock, the field vine at x 570 (1923-2363) at his feet)
  const pts: { x: number; y: number }[] = [];
  for (let x = 542; x <= 1190; x += 23) pts.push({ x, y: 2684 - (x - 542) * 0.06 });
  for (let y = 2621; y >= 2363; y -= 23) pts.push({ x: 1190, y });
  for (let x = 1167; x >= 890; x -= 23) pts.push({ x, y: 2363 });
  for (let y = 2340; y >= 1923; y -= 23) pts.push({ x: 890, y });
  for (let x = 867; x >= 448; x -= 23) pts.push({ x, y: 1923 });
  const p = { x: 565, y: 2363 };
  const at = (climb?: { x: number; topY: number }, keep = (_q: { x: number; y: number }) => true) => {
    const pr = new Progress(pts.filter(keep));
    pr.relocate(p, true, Infinity, climb);
    return pr.pts[pr.cur];
  };
  // RED on 9f8b81346 (ranked by distance alone: the leg's point at 542,2684, 321 px under the floor he stands on)
  const q = at({ x: 570, topY: 1923 });
  assert.ok(q.y <= p.y + 80 && q.y >= 1923 - 40, `the rewind took ${Math.round(q.x)},${Math.round(q.y)}: under the floor he stands on`);
  // (no vine at his feet: still the way along his own floor, x 890-1167 at y 2363)
  const f = at(undefined);
  assert.ok(Math.abs(f.y - p.y) <= 80, `with no vine: ${Math.round(f.x)},${Math.round(f.y)}`);
  // (the other arm: nothing he can reach from where he stands, so the points under him, as before)
  const u = at(undefined, (r) => r.y > 2500);
  assert.ok(u.y > 2500, `with nothing reachable it must fall back to the points under him: ${Math.round(u.x)},${Math.round(u.y)}`);
  // the knock's own frame takes him off the vine: read on any frame, it is a hit for the next few seconds, never a missed climb
  const fp = new FigPush(0.45);
  assert.equal(fp.knockedRecently(10), false);
  fp.sawKnock(1.2, 10);
  assert.equal(fp.knockedRecently(12), true);
  assert.equal(fp.knockedRecently(17), false);
  fp.sawKnock(0, 20);
  assert.equal(fp.knockedRecently(21), false);
});

test('a vine field\'s work that gets nowhere (no fig freed, no gate opened, no step on) runs the no-progress clock: a stall on a vine ends in a rescue and a stuck spot, never a silent cap (BUILD-26l, 1-4 adult N 39)', async () => {
  const { FirstTimerRun, FT_ADULT } = await import('./firsttimer.ts');
  // (a floor, a climbing vine to a top with no way on, the way going on along a ledge far off and out of reach: he climbs to the
  //  vine's top and holds it. The figs' work is stood in by one that never ends and moves nothing, as 1-4 adult N 39's shuffle
  //  between the field vines 591/631 under a shut gate: FigPush.busy true every frame, every clock off, to the 1200 s cap)
  const plats = [
    { id: 1, x: 0, y: 1000, width: 900, height: 100, type: 'solid' },
    { id: 2, x: 1500, y: 300, width: 600, height: 24, type: 'solid' },
  ];
  const vine = { id: 6, x: 600, topY: 500, bottomY: 1000, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
  const route = [
    ...Array.from({ length: 12 }, (_, i) => ({ x: 330 + i * 24, y: 1000 })),
    ...Array.from({ length: 21 }, (_, i) => ({ x: 600, y: 1000 - i * 24 })),
    ...Array.from({ length: 30 }, (_, i) => ({ x: 1520 + i * 18, y: 300 })),
  ];
  const play = (busy: boolean) => {
    const run = new FirstTimerRun('1-1', 1, { ...FT_ADULT, look: 0 }, { route, cap: 90 });
    run.sim.bare(plats as never, [vine as never]);
    run.sim.stand(560, 1000);
    run.sim.p.facing = 1;
    const fig = { busy: () => busy, changedAt: -1e9, step: () => null, sawKnock() {}, knockedRecently: () => false };
    (run as unknown as { figs: unknown }).figs = fig;
    let held = 0;
    (run as unknown as { opts: { onFrame?: (s: { p: { climbing: boolean } }) => void } }).opts.onFrame = (s) => { if (s.p.climbing) held++; };
    run.prog.relocate(run.sim.p);
    run.play();
    const r = run as unknown as { rescueXs: number[]; stuck: { what: string; rescued: boolean }[]; t: number };
    return { rescues: r.rescueXs.length, stuck: r.stuck.length, held: held / 30, t: r.t };
  };
  const work = play(true);
  assert.ok(work.held > 20, `he climbed and held the vine (held ${work.held.toFixed(1)} s)`);
  assert.ok(work.rescues >= 1 && work.stuck >= 1, `the stall on the vine ended in a rescue and a stuck spot (rescues ${work.rescues}, stuck ${work.stuck}, t ${work.t.toFixed(1)})`);
  // (the same stall with no figs' work at all: the clock ran as it always did)
  const none = play(false);
  assert.ok(none.rescues >= 1, `with no figs' work the stall ends in a rescue (rescues ${none.rescues})`);
});

test('a pod\'s tell on the vine he holds, a free vine on both sides: he steps toward the fig he is going for, never away from it (BUILD-26l, 1-4 adult N 32, middle N 14)', async () => {
  const { FigPush } = await import('./figPush.ts');
  // (field vines 43/44/45 at x 420/500/580 and 48 at 740, the fig he is going for on 48; he holds 44 alone; a pod tells on 44)
  const vine = (id: number, x: number) => ({ id, x, topY: 3800, bottomY: 4700, field: true, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' });
  const vines = [vine(43, 420), vine(44, 500), vine(45, 580), vine(46, 660), vine(48, 740)];
  const fig = { id: 7, vine: 48, y: 4067, falling: false, gone: false };
  const pod = { id: 1, vine: 44, x: 500, top: 3800, land: 4700, cost: 'hit', clock: 'c', shift: 0 };
  const view = (dir: number) => ({
    hands: { a: vines[1], b: null }, clusters: [fig], vines,
    field: { gates: [], pods: [pod], blocksTop: () => true, capY: () => 0 },
    clock: { read: () => ({ phase: 'warn', u: 0.5, into: 0, cycle: dir }) },
  });
  const p = { x: 500, y: 4300, climbing: true };
  const fp = new FigPush(0);
  (fp as unknown as { target: unknown }).target = fig;
  let pad: { left?: boolean; right?: boolean } | null = null;
  for (let i = 0; i < 3 && !(pad?.left || pad?.right); i++) pad = fp.step(view(1) as never, p as never, 10 + i / 30) as never;
  assert.ok(pad?.right && !pad.left, `the dodge stepped ${JSON.stringify(pad)}: away from the fig on vine 48 to his right`);
});
