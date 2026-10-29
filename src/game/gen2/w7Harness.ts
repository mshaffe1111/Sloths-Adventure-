/**
 * Test helpers for World 7's swing and climb sections (w7Swing.test.ts, w7SwingRoute.test.ts): the real stage configs, and the stages that
 * take the sections built as w7Game.ts would build them once it folds in withW7Swing (the main builder's file: the fold is asked for).
 */
import { generateAllLevels } from '../worldsData.ts';
import type { Difficulty } from '../difficulty.ts';
import { buildGen2Stage } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { w7GameKit } from './worlds/w7Game.ts';
import { W7S_STAGES, withW7Swing } from './worlds/w7Swing.ts';

const LEVELS = generateAllLevels();
export const cfg7 = (id: string) => LEVELS.find((c) => c.id === id)!;
/** the stages that take the swing sections, by id (7-5, 7-9) */
export const SWING_STAGES: readonly string[] = W7S_STAGES.map((n) => `7-${n}`);
/** World 7's kit for a stage with the swing sections folded in */
export const w7SwingKit = (stage: number, d: Difficulty) => withW7Swing(w7GameKit(stage, d), stage, d);

const cache = new Map<string, Gen2Stage>();
export function buildW7(id: string, seed: number, difficulty: 'easy' | 'normal'): Gen2Stage {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) {
    const config = cfg7(id);
    cache.set(k, buildGen2Stage({ config, kit: w7SwingKit(config.miniIndex, difficulty), seed, difficulty }));
  }
  return cache.get(k)!;
}
