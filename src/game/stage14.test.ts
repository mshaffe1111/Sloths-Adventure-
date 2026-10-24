import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import { reachJump } from './physics.ts';
import { ROPE_RISE } from './rope.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 4, id: '1-4', name: 'Up the Kapok', objectiveType: 'ascent', targetCount: 1, timeLimit: 0,
  levelWidth: 3200, levelHeight: 3400, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-4: every roll keeps the plan, climbs from the floor to the crown, and takes two minutes', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-4');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.ok(st.exitTotemY < st.spawnY - 4000, `seed ${s}: a real climb (${st.spawnY - st.exitTotemY} px)`);
    assert.equal(st.exitTotemY, 400);
    assert.equal(st.config.levelHeight, st.spawnY + 120);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
    // checkpoints climb in order
    for (let i = 1; i < st.checkpoints!.length; i++) assert.ok(st.checkpoints![i].y < st.checkpoints![i - 1].y, `seed ${s}`);
  }
});

test('1-4: everything stays inside the tree, nothing overlaps, and the floor runs the whole width (a fall never costs a life)', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-4');
    const W = st.config.levelWidth;
    const floor = st.platforms[0];
    assert.ok(floor.x === 0 && floor.width === W && floor.y === st.spawnY);
    const br = st.platforms.slice(1);
    for (const p of br) assert.ok(p.x >= 0 && p.x + p.width <= W, `seed ${s}: branch ${p.id} at ${p.x}..${p.x + p.width}`);
    for (let i = 0; i < br.length; i++) {
      for (let j = i + 1; j < br.length; j++) {
        const a = br[i], b = br[j];
        const overlapX = a.x < b.x + b.width && b.x < a.x + a.width;
        assert.ok(!overlapX || Math.abs(a.y - b.y) >= 60, `seed ${s}: branches ${a.id} and ${b.id} crowd each other`);
      }
    }
    assert.equal(st.proto.movedPickups, 0, `seed ${s}`);
    assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes }, st.collectibles).length, 0, `seed ${s}`);
  }
});

test('1-4: every rope hangs at grabbing height between two branches of its height, over a gap too wide to jump', () => {
  const two = reachJump(0, true);
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-4');
    assert.ok(st.ropes!.length >= 6, `seed ${s}`);
    for (const r of st.ropes!) {
      const left = st.platforms.find((p) => Math.abs(p.y - r.g0) < 1 && Math.abs(p.x + p.width - 44 - r.x0) < 1);
      const right = st.platforms.find((p) => Math.abs(p.y - r.g1) < 1 && Math.abs(p.x + 44 - r.x1) < 1);
      assert.ok(left && right, `seed ${s}: rope ${r.id} has a branch at each end`);
      assert.equal(r.g0 - r.y, ROPE_RISE);
      assert.ok(right!.x - (left!.x + left!.width) > two, `seed ${s}: rope ${r.id} spans a gap a double jump cannot`);
    }
    // the twist: one rope far longer than the rest
    const spans = st.ropes!.map((r) => r.x1 - r.x0).sort((a, b) => b - a);
    assert.ok(spans[0] > 900 && spans[0] > spans[1] * 1.6, `seed ${s}: the long rope (${spans[0]} vs ${spans[1]})`);
  }
});

test('1-4: every trunk stands on a branch (or the floor) and reaches a branch at its top; the hollow is on a trunk with a seed in it', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-4');
    for (const v of st.vines) {
      assert.ok(st.platforms.some((p) => Math.abs(p.y - (v.bottomY + 6)) < 1 && v.x >= p.x && v.x <= p.x + p.width), `seed ${s}: trunk at ${v.x} stands on nothing`);
      assert.ok(st.platforms.some((p) => Math.abs(p.y - (v.topY + 2)) < 1 && v.x >= p.x && v.x <= p.x + p.width), `seed ${s}: trunk at ${v.x} leads nowhere`);
    }
    const h = st.proto.hollows!;
    assert.equal(h.length, 1);
    assert.ok(st.vines.some((v) => v.x === h[0].x && h[0].y > v.topY && h[0].y < v.bottomY), `seed ${s}: hollow on a trunk`);
    assert.ok(st.collectibles.some((c) => c.type === 'seed' && Math.abs(c.x - h[0].x) < 2 && Math.abs(c.y - h[0].y) < 10), `seed ${s}: a seed in the hollow`);
  }
});
