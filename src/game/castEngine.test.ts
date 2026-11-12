// The creature kit in the REAL engine (engineCoreHarness.ts: nothing that decides an outcome is replaced). A stage whose data names
// a cast is run by the kit (castPlay.ts); a stage that names none plays as it always has. The arena here is planted into a real
// engine: a safe ledge, a branch with one Golden Tree Snake, a hive hung over it and its vine on the ledge.
import { DT, makeEngine, standOn, step, type Eng } from './engineCoreHarness.ts';
import { GameEngine } from './engine.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleBox } from './dropTrap.ts';
import { LOUD } from './heroNoise.ts';
import { TELL_MIN } from './predators/core.ts';
import type { Enemy, Platform } from './types.ts';

const Y = 500;
const plat = (id: number, x: number, width: number, y = Y): Platform => ({ id, x, y, width, height: 40, type: 'solid' } as Platform);
const TRAPS = [{ id: 1, kind: 'vine' as const, load: 'hive' as const, x: 560, y: Y, loadX: 820, loadY: Y - 210, landY: Y }];
/** a real engine on a World 1 stage, its stage swapped for the arena, its cast started by the engine's own start */
function arena(o: { difficulty?: 'normal' | 'easy'; snake?: Partial<Enemy>; traps?: boolean; stage?: string } = {}): { e: Eng; input: ReturnType<typeof makeEngine>['input']; snake: Enemy; ledge: Platform; branch: Platform } {
  const { e, input } = makeEngine(o.stage ?? '1-3', o.difficulty ?? 'normal');
  const ledge = plat(9001, 200, 420), branch = plat(9002, 640, 360);
  e.platforms.length = 0;
  e.platforms.push(ledge, branch);
  const snake = {
    id: 9500, type: 'snake', x: 820, y: Y - 14, vx: 0, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1, patrolMinX: 660, patrolMaxX: 980,
    attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, ...o.snake,
  } as Enemy;
  e.enemies.length = 0;
  e.enemies.push(snake);
  e.vines.length = 0;
  e.collectibles.length = 0;
  e.proto ??= { hints: [], covers: [], beats: [] };
  e.proto.cast = { kinds: ['snake'], traps: o.traps === false ? [] : TRAPS.map((t) => ({ ...t })) };
  e.startCast();
  e.checkpoint = { x: 260, y: Y };
  standOn(e, ledge, 260);
  e.player.hp = e.player.maxHp;
  return { e, input, snake, ledge, branch };
}
const walkTo = (e: Eng, input: { state: { right: boolean; left: boolean } }, x: number, max = 300) => {
  for (let i = 0; i < max && Math.abs(e.player.x - x) > 6; i++) { input.state.right = e.player.x < x; input.state.left = e.player.x > x; step(e, 1); }
  input.state.right = input.state.left = false;
};
const punch = (e: Eng, input: { state: { punchPressed: boolean } }, n = 14) => { input.state.punchPressed = true; step(e, 1); input.state.punchPressed = false; step(e, n); };

test('no shipped stage changes: a stage that names no cast has none, and its snakes are still predatorAI\'s', () => {
  const { e } = makeEngine('1-3');
  assert.equal(e.cast, null);
  step(e, 30);
  assert.ok(e.enemies.length > 0 && e.enemies.every((q: Enemy) => q.kit === undefined), 'not one of 1-3\'s animals has kit state');
});

test('the engine starts the cast itself, at the stage\'s start, from the stage\'s own data', () => {
  // (no shipped stage names a cast yet, so the data is put on the stage the moment before the engine's own start reads it)
  const P = GameEngine.prototype as unknown as { startCast: (this: Eng) => void };
  const real = P.startCast;
  P.startCast = function (this: Eng) { if (this.proto) this.proto.cast = { kinds: ['snake'], traps: [] }; real.call(this); };
  try {
    const { e } = makeEngine('1-3');
    const snakes = e.enemies.filter((q: Enemy) => q.type === 'snake');
    assert.ok(e.cast && snakes.length > 0 && snakes.every((q: Enemy) => q.kit), 'every snake of the stage is the kit\'s, with no call from the test');
    assert.equal(e.cast.members.length, snakes.length);
    const before = snakes.map((q: Enemy) => q.hp);
    step(e, 60);
    assert.deepEqual(snakes.map((q: Enemy) => q.hp), before);
    assert.ok(snakes.every((q: Enemy) => ['sleep', 'patrol', 'alert', 'rear', 'strike', 'recover'].includes(q.state ?? '')), 'and each shows the kit\'s state');
  } finally {
    P.startCast = real;
  }
});

test('a stage that names a cast: the engine hands those animals to the kit at its start', () => {
  const { e, snake } = arena();
  assert.ok(e.cast && snake.kit, 'the snake is the kit\'s');
  assert.equal(snake.kit!.y, Y, 'standing on its branch');
  step(e, 30);
  assert.ok(snake.x !== 820 && snake.state === 'patrol', 'and the kit is stepping it: it patrols its branch');
});

test('the tell in the real engine: he walks in, it rears for half a second or more before it strikes, and the strike costs a heart', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    const { e, input, snake } = arena({ difficulty, traps: false });
    const hp = e.player.hp;
    let rear = 0, struckAfter = -1;
    for (let i = 0; i < 400 && struckAfter < 0; i++) {
      input.state.right = e.player.x < snake.x - 60;
      step(e, 1);
      if (snake.state === 'rear') rear++;
      if (snake.state === 'strike') struckAfter = rear;
    }
    assert.ok(struckAfter * DT >= TELL_MIN - 1e-9, `${difficulty}: it reared ${(struckAfter * DT).toFixed(2)} s before it struck`);
    input.state.right = false;
    step(e, 12);
    assert.equal(e.player.hp, hp - 1, `${difficulty}: he stood in its reach through the whole rear, and the strike took a heart`);
  }
});

test('punch, in the real engine: a snake at its branch end is knocked off, glides away and counts toward the purge; he is not hurt', () => {
  const { e, input, snake } = arena({ snake: { x: 975, asleep: true }, traps: false });
  const hp = e.player.hp;
  walkTo(e, input, 930);
  e.player.facing = 1;
  punch(e, input);
  assert.ok(snake.kit!.leaving, 'one punch at the branch end: off it goes');
  assert.equal(e.player.enemiesDefeated, 1, 'counted at once, and once');
  step(e, 60);
  assert.deepEqual([snake.defeated, e.player.enemiesDefeated, e.player.hp], [true, 1, hp]);
});

test('the drop trap, in the real engine: a punch on the vine from the ledge, the hive comes down, the snake glides off; no fight, no hurt', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    const { e, input, snake } = arena({ difficulty, snake: { patrolMinX: 760, patrolMaxX: 880 } });
    const hp = e.player.hp;
    const h = handleBox(TRAPS[0]);
    walkTo(e, input, h.x - 26);
    e.player.facing = 1;
    punch(e, input, 4);
    assert.notEqual(e.cast.traps[0].phase, 'set', 'the blow found the vine');
    step(e, 70);
    assert.equal(e.cast.traps[0].phase, 'down');
    assert.deepEqual([snake.defeated, e.player.enemiesDefeated, e.player.hp], [true, 1, hp], difficulty);
  }
});

test('stomp, in the real engine: he lands on it and vaults; it glides off for good and counts, as every ending does (Matt, 11-12)', () => {
  const { e, snake } = arena({ traps: false });
  const hp = e.player.hp;
  Object.assign(e.player, { x: snake.x, y: Y - 90, vx: 0, vy: 200, grounded: false });
  let up = false;
  for (let i = 0; i < 30 && !up; i++) { e.player.x = snake.x; step(e, 1); up = e.player.vy < -300; }
  assert.ok(up, 'he bounces off it');
  assert.ok(snake.kit!.leaving, 'it is gliding off');
  step(e, 60);
  assert.deepEqual([snake.defeated, e.player.enemiesDefeated, e.player.hp], [true, 1, hp]);
});

test("Dot's line for the first trap is the stage's own data, said once: on the first snake a TRAP sends gliding, never for a punch", () => {
  const LINE = 'the story keeper\'s words, as the stage carries them';
  const far = (x: number): Partial<Enemy> => ({ id: 9501, x, patrolMinX: x - 20, patrolMaxX: x + 20 });
  // a punch clears one first: silence (the trap's line is not a knockout's)
  const a = arena({ snake: { x: 975, asleep: true }, traps: false });
  a.e.proto.cast.said = { trap: LINE };
  walkTo(a.e, a.input, 930);
  a.e.player.facing = 1;
  punch(a.e, a.input);
  step(a.e, 60);
  assert.equal(a.e.player.enemiesDefeated, 1);
  assert.notEqual(a.e.stageHint?.text, LINE, 'a punch never says the trap\'s line');
  // a trap clears one: she says it, once
  const b = arena({ snake: { patrolMinX: 760, patrolMaxX: 880 } });
  b.e.proto.cast.said = { trap: LINE };
  const said: string[] = [];
  const guide = b.e.guide.bind(b.e);
  b.e.guide = (t: string, s: number) => { said.push(t); guide(t, s); };
  walkTo(b.e, b.input, handleBox(TRAPS[0]).x - 26);
  b.e.player.facing = 1;
  punch(b.e, b.input, 4);
  step(b.e, 70);
  assert.deepEqual([b.e.player.enemiesDefeated, said.filter((t) => t === LINE).length], [1, 1], 'said as the first trapped snake glides away');
  // a second trap in the same stage: silent
  const s2 = { ...b.snake, ...far(1500), defeated: false, kit: undefined, glide: undefined, koTimer: 0 } as Enemy;
  b.e.platforms.push(plat(9003, 1200, 500));
  b.e.enemies.push(s2);
  b.e.proto.cast.traps.push({ id: 2, kind: 'tendril', load: 'stone', x: 1340, y: Y, loadX: 1500, loadY: Y - 100, landY: Y });
  b.e.startCast();
  b.e.proto.cast.said = { trap: LINE };
  standOn(b.e, b.e.platforms[2], 1310);
  b.e.player.facing = 1;
  punch(b.e, b.input, 4);
  step(b.e, 70);
  assert.deepEqual([s2.defeated, said.filter((t) => t === LINE).length], [true, 1], 'the second trap clears its snake and she says nothing');
});

test('landing noise, in the real engine: where it is taught (World 2) a hard landing beside a sleeper wakes it and a jump\'s does not; in World 1 nothing wakes to it', () => {
  const drop = (from: number, stage: string) => {
    const { e, snake } = arena({ snake: { asleep: true }, traps: false, stage });
    Object.assign(e.player, { x: 600, y: Y - from, vx: 0, vy: 0, grounded: false, jumpsLeft: 0 });
    for (let i = 0; i < 90 && !(e.player.grounded && i > 3); i++) step(e, 1);
    step(e, 2);
    return { landed: e.player.grounded, asleep: snake.kit!.asleep };
  };
  assert.deepEqual(drop(LOUD.landing.soft + 120, '2-1'), { landed: true, asleep: false }, 'World 2, a long drop 220 px from it: it wakes');
  assert.deepEqual(drop(LOUD.landing.soft - 60, '2-1'), { landed: true, asleep: true }, 'a short one: silent');
  assert.deepEqual(drop(LOUD.landing.soft + 120, '1-3'), { landed: true, asleep: true }, 'World 1 teaches traps, not quiet feet: the same long drop wakes nothing');
});

test('back at a flag in the real engine: the snake that was rearing at him stands down', () => {
  const { e, input, snake } = arena({ traps: false });
  for (let i = 0; i < 400 && snake.state !== 'rear'; i++) { input.state.right = e.player.x < snake.x - 60; step(e, 1); }
  assert.equal(snake.state, 'rear');
  input.state.right = false;
  e.respawnAtCheckpoint('hurt');
  assert.equal(snake.kit!.phase, 'rest');
  const hp = e.player.hp;
  step(e, 30);
  assert.equal(e.player.hp, hp, 'and he is not struck at the flag');
});
