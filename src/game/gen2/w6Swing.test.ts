/**
 * World 6's swing stages on gen2 (gen2/worlds/w6Swing.ts and w6Rooms.ts), built through buildGen2Stage on 20 rolls, Normal and Easy, with
 * World 6's own kit (w6.ts w6Kit, w6Finish) and these sections joined (withW6Swing): every roll passes levelCheck (and so
 * puzzleCheck on its rooms), is long enough, keeps every water hop to half a jump at most, never crumbles; 6-3 may hold the root
 * seesaw, 6-6 the dark hollow, 6-7 the water room, 6-1 none.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../stageTime.ts';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage, checkStage, layLocal, maxGap, planBudget, rngFor } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { cfg, M6 } from './w6Harness.ts';
import { W6R_STAGE } from './worlds/w6Rooms.ts';
import { W6_SWING_SECTIONS, withW6Swing } from './worlds/w6Swing.ts';
import { w6Finish, w6Kit } from './worlds/w6.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['6-1', 'vine_runner'], ['6-3', 'vine_runner'], ['6-6', 'sprint'], ['6-7', 'vine_runner']];
const cache = new Map<string, Gen2Stage>();
const build = (id: string, a: LevelConfig['objectiveType'], seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, w6Finish(buildGen2Stage({ config: cfg(id, a), kit: withW6Swing(w6Kit(Number(id.split('-')[1])), Number(id.split('-')[1]), difficulty), seed, difficulty })));
  return cache.get(k)!;
};

test('the sections: each is laid in its own space, 3-8 s of play, level at its ends, its water hops half a jump at most', () => {
  const budget = planBudget(cfg('6-3', 'vine_runner'), M6, 'normal');
  for (const s of W6_SWING_SECTIONS) {
    const keys = new Set(s.pieces.map((p) => p.key));
    for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
    for (let r = 1; r <= 5; r++) {
      const L = layLocal(s, budget, rngFor(r));
      // (a swing's gap is wider than any jump, by design: a liana section may run 300 px longer per liana for the same seconds)
      const lianas = L.pieces.filter((p) => p.shape === 'liana').length;
      assert.ok(L.width >= 600 && L.width <= 1700 + 300 * lianas, `${s.id}: ${L.width} px`);
      assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
      // (a hop over the water is half a jump at most; a gap a liana hangs over is the swing's, wider than any jump)
      const swung = (g: { x0: number; x1: number }) => L.pieces.some((p) => p.shape === 'liana' && p.x >= g.x0 - 1 && p.x <= g.x1 + 1);
      for (const g of L.gaps) if (!swung(g)) assert.ok(g.x1 - g.x0 <= maxGap(0, false, budget.margin) * 0.5 + 1, `${s.id}: a ${g.x1 - g.x0} px hop over water`);
      // (a liana section is never mirrored; a chain has a perch between every two swings: the core throws otherwise)
      if (s.pieces.some((p) => p.shape === 'liana')) assert.equal(s.mirrorable, false, s.id);
    }
  }
});

for (const [id, a] of STAGES) {
  test(`${id} on 20 rolls, Normal and Easy: levelCheck passes, long enough, nothing crumbles, its own room and no other`, () => {
    let withRoom = 0;
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = build(id, a, seed, difficulty);
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `${difficulty} ${seed}`);
        const fast = modelStage(st, MODEL_FAST).total;
        assert.ok(fast >= st.gen2.budget.seconds.fastFloor && fast >= 120, `${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
        assert.ok(!st.platforms.some((p) => p.type === 'fragile'), 'nothing crumbles');
        const rooms = st.gen2.sections.map((s) => s.template).filter((t) => t in W6R_STAGE);
        assert.ok(rooms.length <= 1 && rooms.every((t) => W6R_STAGE[t] === id), `${difficulty} ${seed}: rooms ${rooms}`);
        if (difficulty === 'normal') withRoom += rooms.length;
      }
    }
    // (a stage with a room holds it on some rolls: the roll's theme (pipeline THEME) leaves it out of the rest, so until the core can
    // require a section, curation keeps the rolls that hold it)
    if (Object.values(W6R_STAGE).includes(id)) assert.ok(withRoom >= 3, `${id}: its room in ${withRoom} of 20 rolls`);
  });
}
