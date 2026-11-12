// The bots know a drop trap from the stage's cast data, on ANY stage (P13, 11-12: firsttimer.ts castPlan). A real engine on a stage that
// is not 1-3 (2-2: no stage id, seed or x is the bot's), its ground swapped for a planted arena: a ledge, a branch with a Golden Tree
// Snake, a hive hung over it, its vine on the ledge. Told of traps, he walks to the vine, punches it, and the snake glides off, no hit;
// a trap over no animal he passes; one he was never told of he does not use; a trap he meets from the far side (the animal before the
// handle) is not the safe way, and he leaves it (a behaviour check: the walk's own punch meets the animal first, so it passes without castPlan's
// direction rule too; the rule is kept for a handle and an animal both in reach).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FirstTimerRun, FT_MIDDLE, freshPhone, rng } from './firsttimer.ts';
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
