/**
 * World 6's swing stages on gen2 (gen2/worlds/w6Swing.ts and w6Rooms.ts), built through buildGen2Stage on 20 rolls, Normal and Easy, with
 * a stand-in World 6 manifest (w6Harness.ts M6) until the world's own (w6.ts) is on this branch: every roll passes levelCheck (and so
 * puzzleCheck on its rooms), is long enough, keeps every water hop to half a jump at most, never crumbles; 6-6 holds the dark hollow,
 * 6-7 the water room, 6-1 neither.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../stageTime.ts';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage, checkStage, layLocal, maxGap, planBudget, rngFor } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { cfg, M6 } from './w6Harness.ts';
import { darkRoom, waterRoom, withW6Rooms } from './worlds/w6Rooms.ts';
import { W6_SWING_SECTIONS } from './worlds/w6Swing.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const kit = withW6Rooms({ manifest: { ...M6, sections: [...W6_SWING_SECTIONS] } });
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['6-1', 'vine_runner'], ['6-3', 'vine_runner'], ['6-6', 'sprint'], ['6-7', 'vine_runner']];
const cache = new Map<string, Gen2Stage>();
const build = (id: string, a: LevelConfig['objectiveType'], seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, buildGen2Stage({ config: cfg(id, a), kit, seed, difficulty }));
  return cache.get(k)!;
};

test('the sections: each is laid in its own space, 3-8 s of play, level at its ends, its water hops half a jump at most', () => {
  const budget = planBudget(cfg('6-3', 'vine_runner'), M6, 'normal');
  for (const s of W6_SWING_SECTIONS) {
    const keys = new Set(s.pieces.map((p) => p.key));
    for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
    for (let r = 1; r <= 5; r++) {
      const L = layLocal(s, budget, rngFor(r));
      assert.ok(L.width >= 600 && L.width <= 1700, `${s.id}: ${L.width} px`);
      assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
      for (const g of L.gaps) assert.ok(g.x1 - g.x0 <= maxGap(0, false, budget.margin) * 0.5 + 1, `${s.id}: a ${g.x1 - g.x0} px hop over water`);
    }
  }
});

for (const [id, a] of STAGES) {
  test(`${id} on 20 rolls, Normal and Easy: levelCheck passes, long enough, nothing crumbles, its own room and no other`, () => {
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = build(id, a, seed, difficulty);
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `${difficulty} ${seed}`);
        const fast = modelStage(st, MODEL_FAST).total;
        assert.ok(fast >= st.gen2.budget.seconds.fastFloor && fast >= 120, `${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
        assert.ok(!st.platforms.some((p) => p.type === 'fragile'), 'nothing crumbles');
        const rooms = st.gen2.sections.map((s) => s.template).filter((t) => t === waterRoom.id || t === darkRoom.id);
        const want = id === '6-7' ? [waterRoom.id] : id === '6-6' ? [darkRoom.id] : [];
        assert.deepEqual(rooms, want, `${difficulty} ${seed}: rooms`);
      }
    }
  });
}
