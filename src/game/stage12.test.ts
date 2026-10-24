import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, PETAL_GOAL_12 } from './protoStage.ts';
import { badPickups } from './flowerReach.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 2, id: '1-2', name: 'The Petal Trail', objectiveType: 'harvest', targetCount: 33, timeLimit: 0,
  levelWidth: 16200, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 20 }, (_, i) => 1 + i * 41);

test('1-2: every roll keeps the plan (learn, test, twist, finish), asks for 80 petals and holds about half again as many, and takes two minutes', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-2');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Learn', 'Test', 'Twist', 'Finish'], `seed ${s}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
    const petals = st.collectibles.filter((c) => c.type === 'flower').length;
    assert.equal(st.config.targetCount, PETAL_GOAL_12);
    assert.ok(petals >= PETAL_GOAL_12 * 1.4 && petals <= PETAL_GOAL_12 * 1.7, `seed ${s}: ${petals} petals`);
    assert.ok(st.meta!.timing!.layoutSeconds >= EXPERT_SECONDS - 15, `seed ${s}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s`);
    assert.ok(st.proto.covers.length >= 1, `seed ${s}: the hidden shelf behind leaves`);
    // World 1's note is on that shelf (a hand-built stage has to place its own find)
    const note = st.collectibles.find((c) => c.type === 'find');
    assert.equal(note?.findId, 'w1_note', `seed ${s}`);
    const cv = st.proto.covers[0];
    assert.ok(note!.x >= cv.x && note!.x <= cv.x + cv.w && note!.y >= cv.y - 40 && note!.y <= cv.y + cv.h, `seed ${s}: the note sits behind the leaves`);
    assert.equal(st.proto.movedPickups, 0, `seed ${s}: the plan put every petal where he can get it (nothing for the safety pass to move)`);
  }
});

test('1-2: every petal can be reached, and the floor runs the whole way (nothing costs a life)', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-2');
    assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines, waterY: st.waterY }, st.collectibles).map((c) => `${Math.round(c.x)},${Math.round(c.y)}`), [], `seed ${s}`);
    assert.ok(st.platforms.every((p) => p.y < (st.waterY ?? 730)), `seed ${s}`);
    for (let x = 0; x < st.exitTotemX; x += 20) {
      assert.ok(st.platforms.some((p) => p.x <= x && p.x + p.width >= x && p.y >= G - 200), `seed ${s}: no floor at x ${x}`);
    }
  }
});

test('1-2: the twist swaps the trail between the branches and the floor: three mushrooms up', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-2');
    const tw = st.proto.beats.find((b) => b[2].startsWith('Twist'))!;
    const ups = st.platforms.filter((p) => p.type === 'bouncy' && p.x >= tw[0] && p.x <= tw[1]).length;
    assert.equal(ups, 3, `seed ${s}`);
  }
});
