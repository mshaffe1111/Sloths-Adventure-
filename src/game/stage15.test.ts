import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, PETAL_GOAL_15 } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import { reachJump, JUMP_RISE } from './physics.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 5, id: '1-5', name: 'More Petals', objectiveType: 'harvest', targetCount: 33, timeLimit: 0,
  levelWidth: 16100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-5: every roll keeps the plan, asks for 90 petals out of about one and a half times that, and takes two minutes', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.config.targetCount, PETAL_GOAL_15);
    const petals = st.collectibles.filter((c) => c.type === 'flower').length;
    assert.ok(petals >= PETAL_GOAL_15 * 1.4 && petals <= PETAL_GOAL_15 * 1.6, `seed ${s}: ${petals} petals`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}`);
    assert.equal(st.proto.movedPickups, 0, `seed ${s}`);
    assert.equal(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY }, st.collectibles).length, 0, `seed ${s}`);
  }
});

test('1-5: the test asks for every move so far: a climb, a rope, a double jump, a bounce and a punch', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    const [x0, x1] = st.proto.beats.find((b) => b[2].startsWith('Test'))!;
    const inside = (x: number) => x >= x0 && x <= x1;
    assert.ok(st.vines.some((v) => v.vineType === 'tree_climb' && inside(v.x)), `seed ${s}: a climb`);
    assert.ok(st.ropes!.some((r) => inside(r.x0)), `seed ${s}: a rope`);
    assert.ok(st.platforms.some((p) => p.type === 'bouncy' && inside(p.x)), `seed ${s}: a bounce`);
    assert.ok(st.enemies.some((e) => inside(e.x)), `seed ${s}: something to punch`);
    // petals higher than one jump reaches, over gaps only a double jump crosses
    const high = st.collectibles.filter((c) => c.type === 'flower' && inside(c.x) && G - c.y > JUMP_RISE + 20 + 34 && !st.platforms.some((p) => p.y < G - 20 && c.x >= p.x - 40 && c.x <= p.x + p.width + 40));
    assert.ok(high.length >= 3, `seed ${s}: double-jump petals (${high.length})`);
  }
});

test('1-5: creaking branches hold petals over safe ground (never needed to get through), the keepsake hides in a fern up a tree, a seed waits for the glide', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    const creaky = st.platforms.filter((p) => p.type === 'fragile');
    assert.ok(creaky.length >= 8, `seed ${s}`);
    for (const p of creaky) {
      const mid = p.x + p.width / 2;
      assert.ok(st.platforms.some((q) => q.y === G && q.x <= mid && q.x + q.width >= mid), `seed ${s}: ground under the creaking branch at ${p.x}`);
    }
    const fern = st.collectibles.filter((c) => c.type === 'find');
    assert.equal(fern.length, 1);
    assert.equal(fern[0].findId, 'w1_keepsake');
    assert.equal(fern[0].hidden, true);
    assert.ok(G - fern[0].y > 200, `seed ${s}: up a tree`);
    // the far seed: past a double jump from the lookout, inside a glide
    const seeds = st.collectibles.filter((c) => c.type === 'seed');
    const far = seeds.find((c) => !st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - c.x) < 260));
    assert.ok(far, `seed ${s}: a glide seed`);
    const lookout = st.platforms.filter((p) => p.y === 300 && p.x < far!.x).sort((a, b) => b.x - a.x)[0];
    const ledge = st.platforms.find((p) => far!.x >= p.x && far!.x <= p.x + p.width && Math.abs(p.y - (far!.y + 34)) < 2)!;
    const gap = ledge.x - (lookout.x + lookout.width);
    assert.ok(gap > reachJump(lookout.y - ledge.y, true) * 1.15, `seed ${s}: a double jump falls short (${gap})`);
  }
});
