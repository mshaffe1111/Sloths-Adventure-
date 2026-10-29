/**
 * Test helpers for World 10's swing sections and rooms (w10Swing.test.ts, w10SwingRoute.test.ts, w10Rooms.test.ts): a stand-in World 10
 * kit until the main builder's (gen2/worlds/w10.ts, branch gen2-w10) is merged with this one. It is World 6's kit (its animals, props
 * and decor: tags 'hunter', 'quick', 'scenery'), numbered World 10 so the budget sits in World 10's band, with World 6's dry ground
 * sections (no creek, no zone: World 10 has no water) and this branch's swing sections and rooms. Soft falls, as World 6's.
 * Once w10.ts is in, w10Game.ts's kit replaces this in every test here.
 */
import type { Difficulty } from '../difficulty.ts';
import type { LevelConfig } from '../types.ts';
import type { WorldKit } from './types.ts';
import { w6Kit } from './worlds/w6.ts';
import { W6_GROUND_SECTIONS } from './worlds/w6Ground.ts';
import { W10_SWING_SECTIONS, w10SwingFor } from './worlds/w10Swing.ts';
import { w10RoomsFor, W10_ROOM_REQUIRED } from './worlds/w10Rooms.ts';

/** World 6's ground sections a fortress stand-in can use: no creek (water) and no zone (tide) */
const DRY = W6_GROUND_SECTIONS.filter((s) => !JSON.stringify(s.pieces).includes('"water":true') && !s.zones && !(s.subBlocks ?? []).some((b) => JSON.stringify(b).includes('"water":true')));

/** the stand-in World 10 kit for stage `stage` on `difficulty`: dry ground, the swings it takes, its room */
export function w10StandIn(stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = w6Kit(stage === 6 ? 1 : 2);
  const swings = W10_SWING_SECTIONS.filter((s) => w10SwingFor(stage, s.id));
  const rooms = w10RoomsFor(stage, difficulty);
  return {
    ...k,
    manifest: {
      ...k.manifest,
      world: 10,
      name: 'Stormy Highlands (stand-in)',
      sections: [...DRY, ...swings, ...rooms],
      handBuilt: ['10-10'],
      // (World 6's sprint knees and channels are taught by its tide gates, which the stand-in leaves out: taken as known)
      lessons: { ...k.manifest.lessons, 'w6:knees': '10-0', 'w6:channels': '10-0' },
      required: W10_ROOM_REQUIRED,
    },
  };
}

/** the stages' archetypes (stagePlan.ts) */
export const W10_TYPES: Record<string, LevelConfig['objectiveType']> = {
  '10-1': 'sprint', '10-3': 'stealth', '10-6': 'vine_runner', '10-7': 'purge', '10-9': 'gauntlet',
};

export const cfg10 = (id: string, targetCount = 1): LevelConfig => ({
  worldIndex: 10, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: W10_TYPES[id] ?? 'sprint', targetCount, timeLimit: 0, levelWidth: 4000,
  levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});
