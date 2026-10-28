import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, SNAKE_GOAL_13 } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import { stepPredator } from './predatorAI.ts';
import type { Enemy, LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 3, id: '1-3', name: 'Branch Snakes', objectiveType: 'purge', targetCount: 10, timeLimit: 0,
  levelWidth: 16900, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-3: every roll keeps the plan, asks for 16 snakes out of about one and a half times that, and takes two minutes', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-3');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.config.targetCount, SNAKE_GOAL_13);
    const before = st.enemies.filter((e) => e.x < st.exitTotemX).length;
    assert.ok(before >= SNAKE_GOAL_13 * 1.3, `seed ${s}: ${before} snakes before the exit`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}`);
    assert.equal(st.proto.movedPickups, 0, `seed ${s}`);
  }
});

test('1-3: the first snake is asleep on a wide low branch, before any other snake', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-3');
    const first = [...st.enemies].sort((a, b) => a.x - b.x)[0];
    assert.equal(first.asleep, true, `seed ${s}`);
    assert.equal(st.enemies.filter((e) => e.asleep).length, 1);
    const under = st.platforms.find((p) => p.x <= first.x && p.x + p.width >= first.x && Math.abs(p.y - (first.y + 14)) < 2)!;
    assert.ok(under && under.width >= 400 && G - under.y <= 100, `seed ${s}: a wide low branch`);
  }
});

test('1-3: every rope lies over a soft pit (crossable before the rope is learned), every pickup can be reached, nothing costs a life', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-3');
    assert.ok(st.ropes!.length >= 2);
    for (const r of st.ropes!) {
      const mid = (r.x0 + r.x1) / 2;
      assert.ok(st.platforms.some((p) => p.x <= mid && p.x + p.width >= mid && p.y > G), `seed ${s}: moss under the rope`);
    }
    assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY }, st.collectibles).length, 0);
    // (or a wall standing on the ground, that a mushroom bounces him up: w1Sections.ts bounceWall, highLeaps)
    for (let x = 0; x < st.exitTotemX; x += 20) assert.ok(st.platforms.some((p) => p.x <= x && p.x + p.width >= x && (p.y >= G - 200 || p.y + p.height >= G)), `seed ${s}: no floor at ${x}`);
  }
});

test('a sleeping snake lies still until he is beside it, then waits a moment before it can strike', () => {
  const e = { id: 1, type: 'snake', x: 500, y: 566, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: 1, patrolMinX: 470, patrolMaxX: 530, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, asleep: true } as Enemy;
  for (let i = 0; i < 60; i++) stepPredator(e, { x: 700, y: 580 }, 1 / 30);
  assert.equal(e.state, 'sleep');
  assert.equal(e.x, 500);
  stepPredator(e, { x: 420, y: 580 }, 1 / 30);
  assert.equal(e.state, 'patrol');
  assert.ok(e.attackCooldown >= 1);
  assert.equal(e.facing, -1);
});
