// The bots know a drop trap from the stage's cast data, on ANY stage (P13, 11-12: firsttimer.ts castPlan). A real engine on a stage that
// is not 1-3 (2-2: no stage id, seed or x is the bot's), its ground swapped for a planted arena: a ledge, a branch with a Golden Tree
// Snake, a hive hung over it, its vine on the ledge. Told of traps, he walks to the vine, punches it, and the snake glides off, no hit;
// a trap over no animal he passes; one he was never told of he does not use; a trap he meets from the far side (the animal before the
// handle) is not the safe way, and he leaves it (a behaviour check: the walk's own punch meets the animal first, so it passes without castPlan's
// direction rule too; the rule is kept for a handle and an animal both in reach).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_MIDDLE, freshPhone, rng, stillCoverNear, type FirstTimer } from './firsttimer.ts';
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

// A way DOWN's own route (towerRoute.ts, ENG-W3a's skills, toys ENG-DOWNBOT; no stage's numbers). (1) A turn whose vine stands just past
// his ledge's end goes straight down it: a corner in the air level with the ledge read as a gap to jump, and he jumped past the vine and
// fell two storeys. A climb tower keeps its across-then-up corners. (2) A leg that drops with no vine walks off the end of each ledge and
// lands on the one under it, ledge by ledge: never the straight line from the entry to the exit, which runs through the ledges between.
test('a way down: the route turns straight down a turn vine, and drops ledge by ledge off each ledge\'s end', async () => {
  const { towerCorners } = await import('./towerRoute.ts');
  const turned = (flow?: string) => ({
    gen2: { plan: [{}, { join: 'turn' }], tower: { ...(flow ? { flow } : {}), route: { legs: [{ entry: { x: 100, y: 500 }, exit: { x: 700, y: 500 } }, { entry: { x: 760, y: 900 }, exit: { x: 200, y: 900 } }], spawn: { x: 100, y: 500 } }, turns: [{ x: 760, from: 500, to: 900 }] } },
    vines: [{ x: 760, topY: 500, bottomY: 900, vineType: 'tree_climb' }],
  });
  const at = (c: { x: number; y: number }[], x: number, y: number) => c.findIndex((p) => Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1);
  const down = towerCorners(turned('down') as never, { x: 100, y: 500 })!;
  assert.equal(at(down, 760, 500), -1, `a corner in the air at the vine level with the ledge (a gap to jump): ${JSON.stringify(down)}`);
  assert.equal(at(down, 760, 900), at(down, 700, 500) + 1, `the turn is not straight down from the ledge's end: ${JSON.stringify(down)}`);
  const up = towerCorners(turned() as never, { x: 100, y: 500 })!;
  assert.ok(at(up, 760, 500) >= 0, `a climb tower lost its across corner: ${JSON.stringify(up)}`);
  // (2) four ledges stepping down, the floor under them; the leg from the top one's to the floor's
  const plat = (x: number, y: number, width: number) => ({ x, y, width, type: 'solid' });
  const platforms = [plat(0, 500, 400), plat(300, 700, 500), plat(60, 900, 440), plat(0, 1100, 1000)];
  const stair = { gen2: { plan: [{}], tower: { flow: 'down', route: { legs: [{ entry: { x: 100, y: 500 }, exit: { x: 100, y: 1100 } }], spawn: { x: 100, y: 500 } }, turns: [] } }, vines: [], platforms };
  const c = towerCorners(stair as never, { x: 100, y: 500 })!;
  // (no stretch of the way passes down through a ledge's top: each drop leaves from past a ledge's end)
  for (let i = 0; i + 1 < c.length; i++) {
    const a = c[i], b = c[i + 1];
    if (b.y - a.y <= 60) continue;
    const through = platforms.find((p) => p.y > a.y + 4 && p.y < b.y - 4 && [a.x + ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y)].some((x) => x > p.x && x < p.x + p.width));
    assert.equal(through, undefined, `the way drops through the ledge at y ${through?.y} from (${a.x}, ${a.y}) to (${b.x}, ${b.y}): ${JSON.stringify(c)}`);
  }
  for (const p of platforms.slice(1)) assert.ok(c.some((q) => Math.abs(q.y - p.y) < 1 && q.x >= p.x && q.x <= p.x + p.width), `he never lands on the ledge at y ${p.y}: ${JSON.stringify(c)}`);
  // (3) the leg's exit short of its wood's end (the lay ran the storey on past it toward the turn's vine): the way walks the wood to
  // its end, then down the vine; never a slant from the exit down to the vine's foot under the wood he stands on (the bots stood
  // over it, 'the way on is 105 px down', rescued: ENG-DOWNBOT, the drafted way down)
  const runOn = [plat(0, 500, 700), plat(700, 500, 300), plat(0, 900, 1100)];
  const ranOn = { gen2: { plan: [{}, { join: 'turn' }], tower: { flow: 'down', route: { legs: [{ entry: { x: 100, y: 500 }, exit: { x: 700, y: 500 } }, { entry: { x: 1050, y: 900 }, exit: { x: 200, y: 900 } }], spawn: { x: 100, y: 500 } }, turns: [{ x: 1030, from: 500, to: 900 }] } },
    vines: [{ x: 1030, topY: 500, bottomY: 900, vineType: 'tree_climb' }], platforms: runOn };
  const r = towerCorners(ranOn as never, { x: 100, y: 500 })!;
  for (const [cs, wood] of [[r, runOn], [c, platforms]] as const) for (let i = 0; i + 1 < cs.length; i++) {
    const a = cs[i], b = cs[i + 1];
    if (b.y - a.y <= 60) continue;
    // (40 px under the height it leaves, the way is in the air or at the wood's very end (he steps off it there, 16 px: under half his
    //  body), never under that wood)
    const xm = a.x + ((b.x - a.x) * 40) / (b.y - a.y);
    const over = wood.find((p) => Math.abs(p.y - a.y) <= 4 && xm > p.x + 16 && xm < p.x + p.width - 16);
    assert.equal(over, undefined, `the way runs under the wood he stands on (${over?.x}-${(over?.x ?? 0) + (over?.width ?? 0)} @${over?.y}) from (${a.x}, ${a.y}) to (${b.x}, ${b.y}): ${JSON.stringify(cs)}`);
  }
  assert.ok(r.some((q) => q.y === 500 && q.x >= 960 && q.x <= 1000), `he never walks the wood to its end by the vine: ${JSON.stringify(r)}`);
});

// A way DOWN in the real engine (firsttimer.ts, ENG-W3a's skills; toys ENG-DOWNBOT, no stage's numbers: a carrier stage, its ground
// swapped for thin ledges and its gen2 for a down tower's). Each bot, a few thumbs each, on the stage's own route (towerRoutePts).
const thin = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 24, type: 'solid' } as Platform);
function downArena(o: { who: FirstTimer; k: number; platforms: Platform[]; vines?: Array<{ x: number; topY: number; bottomY: number }>; route: Array<{ x: number; y: number }>; at: { x: number; y: number }; cap?: number; seen: (sim: { p: { x: number; y: number; grounded: boolean; climbing?: boolean }; standingOn: number | null }) => void }) {
  freshPhone(o.who.setting);
  setDifficulty(o.who.setting);
  Math.random = rng(o.k);
  const run = new FirstTimerRun('2-2', 1, o.who, { route: o.route, cap: o.cap ?? 12, onFrame: (sim) => o.seen(sim as never) });
  const e = (run as any).e; // eslint-disable-line @typescript-eslint/no-explicit-any
  e.platforms.length = 0;
  e.platforms.push(...o.platforms);
  e.enemies.length = 0;
  e.vines.length = 0;
  (o.vines ?? []).forEach((v, i) => e.vines.push({ id: 9700 + i, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb', ...v }));
  e.collectibles.length = 0;
  e.hazards.length = 0;
  e.proto.cast = { kinds: [], traps: [] };
  e.proto.hints = [];
  e.startCast();
  // (deep enough for a fall of two storeys, and no water, pit or hurt floor of the carrier's)
  e.currentStage.config.levelHeight = 2400;
  Object.assign(e.currentStage, { waterY: undefined, rivers: [], safeWater: [], heartFalls: [] });
  if (e.proto) e.proto.water = [];
  (run as any).sim.stage.gen2 = { tower: { flow: 'down' } }; // eslint-disable-line @typescript-eslint/no-explicit-any
  (run as any).onTower = true; // eslint-disable-line @typescript-eslint/no-explicit-any
  (run as any).sim.stand(o.at.x, o.at.y); // eslint-disable-line @typescript-eslint/no-explicit-any
  e.player.hp = e.player.maxHp;
  return run.play();
}
const ALL = async () => { const m = await import('./firsttimer.ts'); return [m.FT_KID, m.FT_ADULT, m.FT_CHILD, m.FT_CHILD_EASY, m.FT_MIDDLE, m.FT_MIDDLE_EASY, m.FT_EXPERT]; };

// (the turn's vine stands 20 px past his ledge's end and goes down to a narrow catch, the storey on; nothing else under it for 1,000
//  px. Straight down takes the vine (STAGE-RULES §1); without the press he hopped off the end past the vine and fell two storeys)
test('a way down: at a turn vine whose top stands at his ledge\'s end, he presses down onto it and climbs down to the storey on', async () => {
  const miss: string[] = [];
  for (const who of await ALL()) for (let k = 1; k <= 3; k++) {
    let deep = false, on = false;
    downArena({
      who, k, at: { x: 300, y: 500 },
      platforms: [thin(9001, 0, 500, 620), thin(9002, 580, 900, 160), thin(9003, -400, 1900, 3000)],
      vines: [{ x: 640, topY: 500, bottomY: 900 }],
      route: [...Array.from({ length: 9 }, (_, i) => ({ x: 300 + i * 40, y: 500 })), ...Array.from({ length: 10 }, (_, i) => ({ x: 640, y: 540 + i * 40 })), { x: 680, y: 900 }, { x: 720, y: 900 }],
      seen: (sim) => { if (on) return; if (sim.p.y > 1000) deep = true; if (sim.p.grounded && sim.standingOn === 9002) on = true; },
    });
    if (deep || !on) miss.push(`${who.name}${who.setting === 'easy' ? ' easy' : ''} thumb ${k}: ${deep ? 'fell past the catch' : 'never on the storey on'}`);
  }
  assert.deepEqual(miss, []);
});

// (he stands on wide wood that lies OVER the way on: the way goes down under it and comes out past its right end. He walks off the
//  end where the way comes out; he stood over the way, turning, until rescued: the drafted way down's catches run on over the storey
//  under them, 'in a dip 173 px deep, the way on is 178 px down', ENG-DOWNBOT)
test('a way down: on wood over the way on, he walks off its end where the way comes out from under it', async () => {
  const miss: string[] = [];
  for (const who of await ALL()) for (let k = 1; k <= 3; k++) {
    let off: number | null = null;
    downArena({
      who, k, at: { x: 400, y: 500 },
      platforms: [thin(9001, 100, 500, 700), thin(9002, 300, 760, 300), thin(9003, -400, 1100, 3000)],
      route: [...Array.from({ length: 6 }, (_, i) => ({ x: 400 + i * 40, y: 760 })), ...Array.from({ length: 12 }, (_, i) => ({ x: 640 + i * 40, y: 1100 }))],
      seen: (sim) => { if (off === null && sim.p.y > 510) off = sim.p.x; },
    });
    // (which end: 10 px under the wood he is still by the end he left, a little steer back in the air allowed)
    if (off === null || off < 700) miss.push(`${who.name}${who.setting === 'easy' ? ' easy' : ''} thumb ${k}: ${off === null ? 'never left the wood' : `off at x ${Math.round(off)}, not its right end`}`);
  }
  assert.deepEqual(miss, []);
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
