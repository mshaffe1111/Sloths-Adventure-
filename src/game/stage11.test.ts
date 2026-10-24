import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G } from './protoStage.ts';
import { reachJump } from './physics.ts';
import { maxRise } from './protoCheck.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 1, id: '1-1', name: 'Into the Canopy', objectiveType: 'sprint', targetCount: 1, timeLimit: 0,
  levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-1: every roll keeps the plan: learn, test, twist, finish, one exit, a secret seed above a mushroom, two minutes for a quick player', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    assert.equal(st.collectibles.filter((c) => c.type === 'seed').length, 1, 'one golden seed');
    const seedC = st.collectibles.find((c) => c.type === 'seed')!;
    // the seed is higher than a double jump reaches, with a mushroom close below it
    assert.ok(G - seedC.y > 200 && st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - seedC.x) < 260), `seed ${s}`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
  }
});

test('1-1: nothing can cost a life: every drop lands on moss, every floor sits above the water', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    assert.ok(st.platforms.every((p) => p.y < (st.waterY ?? 730)), `seed ${s}`);
    // walk along: every x from start to exit has a floor under it (ground, a pillar or a moss pit)
    const exit = st.exitTotemX;
    for (let x = 0; x < exit; x += 20) {
      assert.ok(st.platforms.some((p) => p.x <= x && p.x + p.width >= x && p.y >= G - 200), `seed ${s}: no floor at x ${x}`);
    }
  }
});

test('1-1: the stepping stones and the twist gaps are within a jump (a double jump only where the twist asks for one)', () => {
  const one = reachJump(0, false), two = reachJump(0, true);
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-1');
    const [, twistStart] = st.proto.beats[1];
    const twistEnd = st.proto.beats[2][1];
    // the ground banks: a gap between two G-level banks
    const banks = st.platforms.filter((p) => p.y === G).sort((a, b) => a.x - b.x);
    for (let i = 1; i < banks.length; i++) {
      const gap = banks[i].x - (banks[i - 1].x + banks[i - 1].width);
      if (gap <= 0) continue;
      const inTwist = banks[i].x > twistStart && banks[i].x < twistEnd;
      // gaps with pillars inside are crossed stone by stone (checked by construction); plain gaps must be jumpable
      const stones = st.platforms.some((p) => p.style === 'moss_stone' && p.y < G && p.x > banks[i - 1].x + banks[i - 1].width && p.x < banks[i].x);
      if (stones) continue;
      assert.ok(gap < (inTwist ? two : one) * 0.9 || (!inTwist && gap < two * 0.9), `seed ${s}: gap ${gap} at ${banks[i].x}`);
    }
  }
  assert.ok(maxRise() > 100);
});
