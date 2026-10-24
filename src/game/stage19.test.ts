import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, GUARD_GOAL_19 } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 9, id: '1-9', name: "The Boa's Branches", objectiveType: 'gauntlet', targetCount: 14, timeLimit: 0,
  levelWidth: 18100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-9: every roll keeps the plan, asks for 16 with about one and a half times that to fight, and takes two minutes', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-9');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.config.targetCount, GUARD_GOAL_19);
    const total = st.enemies.filter((e) => e.x < st.exitTotemX).length + st.proto.ring!.waves.flat().length;
    assert.ok(total >= GUARD_GOAL_19 * 1.4, `seed ${s}: ${total} to fight`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}`);
    assert.equal(st.proto.movedPickups, 0, `seed ${s}`);
    assert.equal(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY }, st.collectibles).length, 0, `seed ${s}`);
  }
});

test('1-9: the first guards are boas coiled on wide branches over soft moss, before any other animal', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-9');
    const first = [...st.enemies].sort((a, b) => a.x - b.x)[0];
    assert.equal(first.type, 'boa', `seed ${s}`);
    const under = st.platforms.find((p) => first.x >= p.x && first.x <= p.x + p.width && Math.abs(p.y - (first.y + 16)) < 2)!;
    assert.ok(under && under.width >= 500 && under.y < G, `seed ${s}: a wide branch`);
    assert.ok(st.platforms.some((p) => p.y > G && first.x >= p.x && first.x <= p.x + p.width), `seed ${s}: moss below`);
  }
});

test('1-9: the ring is walled at its far end (too high to jump), its drops land on real surfaces, and a sleeping guard keeps a seed', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-9');
    const ring = st.proto.ring!;
    const wall = st.platforms.find((p) => p.id === ring.wallId)!;
    assert.ok(wall && G - wall.y > 300 && wall.x >= ring.x1 - 1, `seed ${s}: the wall`);
    assert.equal(ring.waves.length, 2);
    for (const d of ring.waves.flat()) {
      assert.ok(st.platforms.some((p) => d.x >= p.x && d.x <= p.x + p.width && Math.abs(p.y - d.surface) < 1), `seed ${s}: a drop at ${d.x} lands on nothing`);
      assert.ok(d.x > ring.x0 && d.x < ring.x1);
    }
    assert.ok(st.enemies.some((e) => e.asleep), `seed ${s}: the sleeping guard`);
    assert.ok(st.collectibles.some((c) => c.type === 'seed'), `seed ${s}`);
  }
});
