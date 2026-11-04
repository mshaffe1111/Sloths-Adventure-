import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, SNAKE_EASY_13 } from './protoStage.ts';
import { goalHave, withGoals } from './goals.ts';
import { easyStage } from './easyMode.ts';
import { badPickups } from './flowerReach.ts';
import { stepPredator } from './predatorAI.ts';
import type { Enemy, LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 3, id: '1-3', name: 'Branch Snakes', objectiveType: 'purge', targetCount: 10, timeLimit: 0,
  levelWidth: 16900, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);
/** 1-3 as the engine loads it (stageGenerator.ts EASY_BUILT, engine.ts): Normal's share, and on Easy its Easy build, thinned by easyStage */
const shipped = (s: number, easy = false) => {
  const st = withGoals(buildProtoStage(cfg, s, '1-3', easy));
  return easy ? (easyStage(st as never) as unknown as typeof st) : st;
};

test('1-3: every roll keeps the rebuilt plan (seven nodes, reference/plans/1-3-rebuild.md), asks for Matt\'s share of its snakes (its counted goal on Easy), and takes over two minutes for a skilled player, on Normal and Easy', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = shipped(s, easy);
      assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Intro', 'Ramp', 'Spike', 'Rest', 'Counter-melody', 'Climax', 'Cool-down'], `seed ${s}`);
      // (Normal: Matt's share, in his 70-80% band, of snakes all before the shrine; Easy: its counted goal)
      const have = goalHave(st as never)!;
      const goal = withGoals(st).config.targetCount;
      assert.ok(goal >= have * 0.7 && goal <= have * 0.8, `seed ${s}${easy ? ' Easy' : ''}: ${goal} of ${have}`);
      assert.equal(st.enemies.filter((e) => e.x >= st.exitTotemX).length, 0, `seed ${s}`);
      assert.equal(st.easyGoal, SNAKE_EASY_13);
      assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}${easy ? ' Easy' : ''}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
      assert.equal(st.proto.movedPickups, 0, `seed ${s}${easy ? ' Easy' : ''}`);
    }
  }
});

test('1-3: the first snake is asleep on a wide low branch, before any other snake', () => {
  for (const s of SEEDS) {
    const st = shipped(s);
    const first = [...st.enemies].sort((a, b) => a.x - b.x)[0];
    assert.equal(first.asleep, true, `seed ${s}`);
    assert.equal(st.enemies.filter((e) => e.asleep).length, 1);
    const under = st.platforms.find((p) => p.x <= first.x && p.x + p.width >= first.x && Math.abs(p.y - (first.y + 14)) < 2)!;
    assert.ok(under && under.width >= 400 && G - under.y <= 100, `seed ${s}: a wide low branch`);
  }
});

test('1-3: its rope lies over a soft pit (crossable before the rope is learned), every pickup can be reached, and only the climax has real drops (on Easy too, where its falls are put-backs), each no wider than a jump', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = shipped(s, easy);
      assert.ok(st.ropes!.length >= 1);
      for (const r of st.ropes!) {
        const mid = (r.x0 + r.x1) / 2;
        assert.ok(st.platforms.some((p) => p.x <= mid && p.x + p.width >= mid && p.y > G), `seed ${s}: moss under the rope`);
      }
      assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY }, st.collectibles).length, 0);
      const bites = st.proto.beats.filter((b) => /^Climax/.test(b[2]));
      let run0 = -1;
      for (let x = 0; x < st.exitTotemX; x += 10) {
        const floor = st.platforms.some((p) => p.x <= x && p.x + p.width >= x && (p.y >= G - 200 || p.y + p.height >= G));
        if (!floor) {
          assert.ok(bites.some((b) => x >= b[0] && x <= b[1]), `seed ${s}${easy ? ' Easy' : ''}: no floor at ${x}, outside the climax`);
          if (run0 < 0) run0 = x;
          assert.ok(x - run0 <= 140, `seed ${s}: a drop wider than a jump from ${run0}`);
        } else run0 = -1;
      }
    }
  }
});

test('1-3: no snake on a branch outside the split stands over a pit floor he could walk along under it: the ground under its branch is the floor at G, so the way runs over the snakes, not beneath them', () => {
  // (w8-rope2 2026-11-04: one long soft pit under a run of branches was a floor to walk along under them all; the route and the fixed
  // first-timer bot took it, past every snake on the branches, and Matt's goal was out of reach)
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = shipped(s, easy);
      const split = st.proto.beats.find((b) => /^Spike/.test(b[2]))!;
      for (const e of st.enemies) {
        if (e.asleep || (e.x >= split[0] && e.x <= split[1]) || e.y > G - 20) continue;
        const under = st.platforms.filter((p) => p.x <= e.x && p.x + p.width >= e.x && p.y > e.y + 20);
        if (!under.length) continue;
        const top = Math.min(...under.map((p) => p.y));
        assert.ok(top <= G, `seed ${s}${easy ? ' Easy' : ''}: the snake at ${Math.round(e.x)} stands over a floor ${top} deep`);
      }
    }
  }
});

test("1-3: the split's petals are Matt's 70/30: each road 13-17%, the shared way 66-74%, so one play down either road reaches the goal (Matt, 11-04)", () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      const st = shipped(s, easy);
      // (the split itself: under and along the high road, its first branch to the end of its perch)
      const sp = st.proto.beats.find((b) => /^Spike/.test(b[2]))!;
      const hb = st.platforms.filter((p) => p.style === 'branch' && p.x >= sp[0] && p.x < sp[1] && p.y < 470);
      const x0 = Math.min(...hb.map((p) => p.x)), x1 = Math.max(...hb.map((p) => p.x + p.width));
      const pet = st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf');
      const inSplit = pet.filter((c) => c.x >= x0 && c.x < x1);
      const high = inSplit.filter((c) => c.y < 470).length, low = inSplit.length - high, n = pet.length;
      const tag = `seed ${s}${easy ? ' Easy' : ''}: ${high} high, ${low} low of ${n}`;
      for (const road of [high, low]) assert.ok(road >= n * 0.13 && road <= n * 0.17, tag);
      assert.ok(n - high - low >= n * 0.66 && n - high - low <= n * 0.74, tag);
    }
  }
});

test('1-3: whichever road he takes, the goal is in reach by the count, not by luck: goal <= the shared way + the smaller road - 5%, for its snakes (its goal as it loads) and its petals (75%), every roll, Normal and Easy (the lead, 11-04)', () => {
  for (const easy of [false, true]) {
    for (const s of SEEDS) {
      // (as the engine loads it: Normal's share, and on Easy its kept animals and its own goal)
      const st = shipped(s, easy);
      const sp = st.proto.beats.find((b) => /^Spike/.test(b[2]))!;
      const hb = st.platforms.filter((p) => p.style === 'branch' && p.x >= sp[0] && p.x < sp[1] && p.y < 470);
      const x0 = Math.min(...hb.map((p) => p.x)), x1 = Math.max(...hb.map((p) => p.x + p.width));
      const roads = <T extends { x: number; y: number }>(all: T[]) => {
        const inS = all.filter((c) => c.x >= x0 && c.x < x1);
        const high = inS.filter((c) => c.y < 470).length;
        return { n: all.length, shared: all.length - inS.length, small: Math.min(high, inS.length - high) };
      };
      const tag = `seed ${s}${easy ? ' Easy' : ''}`;
      const sn = roads(st.enemies.filter((e) => e.x < st.exitTotemX));
      const goal = st.config.targetCount;
      assert.ok(goal <= sn.shared + sn.small - 0.05 * sn.n, `${tag}: snake goal ${goal}, shared ${sn.shared} + smaller road ${sn.small} of ${sn.n}`);
      const pe = roads(st.collectibles.filter((c) => c.type === 'flower' || c.type === 'leaf'));
      assert.ok(0.75 * pe.n <= pe.shared + pe.small - 0.05 * pe.n, `${tag}: petals, shared ${pe.shared} + smaller road ${pe.small} of ${pe.n}`);
    }
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
