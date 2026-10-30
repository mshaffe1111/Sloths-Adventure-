/**
 * Test helpers for World 10's swing sections and rooms (w10Swing.test.ts, w10Rooms.test.ts): World 10's kit as the game builds it
 * (w10Game.ts w10GameKit: the main builder's world, ground and lessons, with this branch's swings and rooms folded in), and the stages'
 * configs.
 */
import type { Difficulty } from '../difficulty.ts';
import type { LevelConfig } from '../types.ts';
import type { WorldKit } from './types.ts';
import { w10GameKit } from './worlds/w10Game.ts';

/** World 10's kit for stage `stage` on `difficulty`, as the game builds it */
export const w10StandIn = (stage: number, difficulty: Difficulty = 'normal'): WorldKit => w10GameKit(stage, difficulty);

/** the stages' archetypes (stagePlan.ts) */
export const W10_TYPES: Record<string, LevelConfig['objectiveType']> = {
  '10-1': 'sprint', '10-3': 'stealth', '10-6': 'vine_runner', '10-7': 'purge', '10-9': 'gauntlet',
};

export const cfg10 = (id: string, targetCount = 1): LevelConfig => ({
  worldIndex: 10, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: W10_TYPES[id] ?? 'sprint', targetCount, timeLimit: 0, levelWidth: 4000,
  levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});
