/**
 * World 7's swing and climb sections (gen2/worlds/w7Swing.ts), each laid alone on 30 rolls, Normal and Easy, and built into a stage through
 * buildGen2Stage on 20 rolls with the stand-in World 7 kit (w7Harness.ts, until the world's own w7.ts is merged): each section is
 * 600-1700 px (+370 a liana), level at its ends, its hops a half of a jump at most; every roll passes levelCheck, is long enough, and
 * nothing crumbles. Pokey's line is short (World 7: Dot is away, STAGE-RULES §1).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../stageTime.ts';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage, checkStage, layLocal, maxGap, planBudget, rngFor } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { cfg7, k7, M7 } from './w7Harness.ts';
import { W7_SWING_SECTIONS, W7_VINES, W7S_NEW_LINES, withW7Swing } from './worlds/w7Swing.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['7-1', 'sprint'], ['7-2', 'vine_runner']];
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test('the sections: each is laid in its own space, 600-1700 px (+370 a liana), level at its ends, its hops half a jump at most', () => {
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfg7('7-2', 'vine_runner'), M7, d);
    for (const s of W7_SWING_SECTIONS) {
      const keys = new Set(s.pieces.map((p) => p.key));
      for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      for (let r = 1; r <= 30; r++) {
        const L = layLocal(s, budget, rngFor(r));
        const lianas = L.pieces.filter((p) => p.shape === 'liana').length;
        assert.ok(L.width >= 600 && L.width <= 1700 + 370 * lianas, `${s.id}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
        const swung = (g: { x0: number; x1: number }) => L.pieces.some((p) => p.shape === 'liana' && p.x >= g.x0 - 1 && p.x <= g.x1 + 1);
        for (const g of L.gaps) if (!swung(g)) assert.ok(g.x1 - g.x0 <= Math.max(60, maxGap(0, false, budget.margin) * 0.5) + 1, `${s.id}: a ${g.x1 - g.x0} px hop`);
        // (a liana section is never mirrored, nor one with a tip: its line must come before what it teaches)
        if (s.pieces.some((p) => p.shape === 'liana') || s.sockets.some((k) => k.role === 'tip')) assert.equal(s.mirrorable, false, s.id);
      }
    }
  }
  // (the brown vines are taught by one section, the first climb; every other climb waits for it)
  assert.deepEqual(W7_SWING_SECTIONS.filter((s) => s.teaches === W7_VINES).map((s) => s.id), ['w7s-vine-wall']);
  for (const s of W7_SWING_SECTIONS) if (s.pieces.some((p) => p.shape === 'vine') && s.teaches !== W7_VINES) assert.ok(s.uses?.includes(W7_VINES), `${s.id} uses the brown vines`);
  // (nothing here crumbles: World 7's crumbling floors are w7Ground's, never required)
  for (const s of W7_SWING_SECTIONS) assert.ok(!s.zones?.length, `${s.id}: no zone`);
  for (const l of W7S_NEW_LINES) assert.ok(words(l) < 10, l);
});

const cache = new Map<string, Gen2Stage>();
export const buildW7 = (id: string, a: LevelConfig['objectiveType'], seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, buildGen2Stage({ config: cfg7(id, a), kit: withW7Swing(k7(), Number(id.split('-')[1]), difficulty), seed, difficulty }));
  return cache.get(k)!;
};

for (const [id, a] of STAGES) {
  test(`${id} (stand-in kit) on 20 rolls, Normal and Easy: levelCheck passes, long enough, nothing crumbles, Pokey's line before the first climb`, () => {
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildW7(id, a, seed, difficulty);
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `${difficulty} ${seed}`);
        const fast = modelStage(st, MODEL_FAST).total;
        assert.ok(fast >= st.gen2.budget.seconds.fastFloor && fast >= 120, `${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
        assert.ok(!st.platforms.some((p) => p.type === 'fragile'), 'nothing crumbles');
        // (a climb before the lesson would be untaught: the first vine section is the one that teaches it)
        const climbs = st.gen2.sections.filter((s) => W7_SWING_SECTIONS.find((t) => t.id === s.template)?.pieces.some((p) => p.shape === 'vine'));
        if (climbs.length) assert.equal(climbs[0].template, 'w7s-vine-wall', `${difficulty} ${seed}: the first climb is the taught one`);
      }
    }
  });
}
