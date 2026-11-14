// The bots know a drop trap from the stage's cast data, on ANY stage (P13, 11-12: firsttimer.ts castPlan). A real engine on a stage that
// is not 1-3 (2-2: no stage id, seed or x is the bot's), its ground swapped for a planted arena: a ledge, a branch with a Golden Tree
// Snake, a hive hung over it, its vine on the ledge. Told of traps, he walks to the vine, punches it, and the snake glides off, no hit;
// a trap over no animal he passes; one he was never told of he does not use; a trap he meets from the far side (the animal before the
// handle) is not the safe way, and he leaves it (a behaviour check: the walk's own punch meets the animal first, so it passes without castPlan's
// direction rule too; the rule is kept for a handle and an animal both in reach).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_MIDDLE, freshPhone, rng } from './firsttimer.ts';
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
