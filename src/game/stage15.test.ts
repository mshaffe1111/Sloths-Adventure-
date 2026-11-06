import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS } from './protoStage.ts';
import { specFor } from './mixer/stages.ts';
import { modelAll } from './stageTime.ts';
import { badPickups } from './flowerReach.ts';
import { reachJump, JUMP_RISE } from './physics.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 5, id: '1-5', name: 'More Petals', objectiveType: 'harvest', targetCount: 33, timeLimit: 0,
  levelWidth: 16100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

// 1-5 is built by the level engine from its spec (mixer/stages.ts SPEC_15): the old builder's tests are kept promise for promise on the
// mixed stage (engine-core, 11-05). The old stage asked for petals; the mixed 1-5 is a relic hunt for Meeca's marks (stagePlan.ts), so its
// goal promises are made of its marks. Where the old test named the old stage's shape (its four beats, the ground line G, the lookout at
// y 300), the new one names the spec's own (its nodes, its test nodes, the death line, the ledge before the seed).
const SPEC = specFor('1-5')!;
const marks = (st: { collectibles: Array<{ type: string; mark?: string }> }) => st.collectibles.filter((c) => c.type === 'relic' && c.mark === 'meeca');
const deathOf = (st: { waterY?: number; config: LevelConfig }) => st.waterY ?? st.config.levelHeight;

test('1-5: every roll keeps the plan (the spec\'s nodes in order), asks for its goal out of about one and a half times that, and takes two minutes', () => {
  // (Normal's plan: a node laid on Easy only is not on it)
  const jobs = [...new Set(SPEC.nodes.filter((n) => !n.lay?.easyOnly).map((n) => n.job))];
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    assert.deepEqual([...new Set(st.proto.beats.map((b) => b[2].split(':')[0]))], jobs, `seed ${s}`);
    const goal = st.normalGoal ?? st.config.targetCount;
    const held = marks(st).length;
    assert.ok(held >= goal * 1.4 && held <= goal * 1.6, `seed ${s}: ${held} marks for a goal of ${goal}`);
    const fast = modelAll(st).fast.total;
    assert.ok(fast >= EXPERT_SECONDS - 15, `seed ${s}: ${fast.toFixed(0)} s`);
    assert.equal(st.proto.movedPickups ?? 0, 0, `seed ${s}`);
    assert.equal(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY }, st.collectibles).length, 0, `seed ${s}`);
  }
});

test('1-5: the test asks for every move so far: a climb, a double jump and a bounce (the rope and the punch: the next test)', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    const tests = st.proto.beats.filter((b) => b[2].startsWith('test '));
    assert.ok(tests.length, `seed ${s}: no test node`);
    const inside = (x: number) => tests.some(([x0, x1]) => x >= x0 && x <= x1);
    assert.ok(st.vines.some((v) => v.vineType === 'tree_climb' && inside(v.x)), `seed ${s}: a climb`);
    assert.ok(st.platforms.some((p) => p.type === 'bouncy' && inside(p.x)), `seed ${s}: a bounce`);
    // pickups higher than one jump reaches from the piece under them, with nothing to stand on near them: double-jump pickups
    const high = st.collectibles.filter((c) => (c.type === 'flower' || c.type === 'relic') && inside(c.x) && (() => {
      const under = st.platforms.filter((p) => c.x >= p.x && c.x <= p.x + p.width && p.y > c.y).sort((a, b) => a.y - b.y)[0];
      return !!under && under.y - c.y > JUMP_RISE + 20 + 34 && !st.platforms.some((p) => p !== under && p.y < under.y - 20 && p.y > c.y - 20 && c.x >= p.x - 40 && c.x <= p.x + p.width + 40);
    })());
    assert.ok(high.length >= 3, `seed ${s}: double-jump pickups (${high.length})`);
  }
});

// (the lead, 11-06 9:21 AM, and the designer: the mixer has no rope idea and no punch idea, and gets no new beat (it is being retired). The
// promise stays, run and reported as a known failure by name, carried to 1-5's move to gen2 (the designer's rope-gap spec is on file))
test('1-5: the test asks for a rope and a punch', { todo: "known: the mixer's library has no rope or punch idea; carried to 1-5's gen2 move (lead 11-06 9:21 AM)" }, () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    const tests = st.proto.beats.filter((b) => b[2].startsWith('test '));
    const inside = (x: number) => tests.some(([x0, x1]) => x >= x0 && x <= x1);
    assert.ok((st.ropes ?? []).some((r) => inside(r.x0)), `seed ${s}: a rope`);
    assert.ok(st.enemies.some((e) => inside(e.x)), `seed ${s}: something to punch`);
  }
});

test('1-5: creaking branches over safe ground, the keepsake hides in a fern up a tree, a seed waits for the glide', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-5');
    const death = deathOf(st);
    const creaky = st.platforms.filter((p) => p.type === 'fragile');
    assert.ok(creaky.length >= 8, `seed ${s}`);
    for (const p of creaky) {
      const mid = p.x + p.width / 2;
      assert.ok(st.platforms.some((q) => q !== p && q.type !== 'fragile' && q.y > p.y && q.y < death && q.x <= mid && q.x + q.width >= mid), `seed ${s}: nothing safe under the creaking branch at ${p.x}`);
    }
    const fern = st.collectibles.filter((c) => c.type === 'find');
    assert.equal(fern.length, 1, `seed ${s}`);
    assert.equal(fern[0].findId, 'w1_keepsake');
    assert.equal(fern[0].hidden, true);
    const floor = st.platforms.filter((p) => fern[0].x >= p.x && fern[0].x <= p.x + p.width && p.y > fern[0].y).sort((a, b) => b.y - a.y)[0];
    assert.ok(floor && floor.y - fern[0].y > 200, `seed ${s}: up a tree`);
    // the far seed: past a double jump from the ledge before it, inside a glide
    const far = st.collectibles.find((c) => c.type === 'seed' && !st.platforms.some((p) => p.type === 'bouncy' && Math.abs(p.x - c.x) < 260));
    assert.ok(far, `seed ${s}: a glide seed`);
    const ledge = st.platforms.find((p) => far!.x >= p.x && far!.x <= p.x + p.width && Math.abs(p.y - (far!.y + 34)) < 2)!;
    const lookout = st.platforms.filter((p) => p.type === 'solid' && p.x + p.width < ledge.x && p.y <= ledge.y).sort((a, b) => b.x + b.width - (a.x + a.width))[0];
    const gap = ledge.x - (lookout.x + lookout.width);
    assert.ok(gap > reachJump(lookout.y - ledge.y, true) * 1.15, `seed ${s}: a double jump falls short (${gap})`);
  }
});
