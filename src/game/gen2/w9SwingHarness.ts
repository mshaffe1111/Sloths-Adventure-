/**
 * Test helpers for World 9's swing sections and rooms (w9Swing.test.ts, w9SwingRoute.test.ts, w9Rooms.test.ts).
 *
 * Until the World 9 builder's kit (gen2/worlds/w9.ts, w9Game.ts, branch gen2-w9) is on this branch, the swings are built on a stand-in:
 * World 6's kit (its creatures, props and ground) as World 9 (its band), with World 9's falls (pit 'void': the lava on Normal, Easy's
 * all soft), every creek dry, none of World 6's own lianas or rooms, and these sections joined. Once w9Game.ts lands the tests build on
 * w9GameKit instead and this stand-in is deleted.
 */
import type { Difficulty } from '../difficulty.ts';
import type { LevelConfig } from '../types.ts';
import type { PlaceRule, SectionTemplate, WorldKit } from './types.ts';
import { w6Kit } from './worlds/w6.ts';
import { W6_SWING_SECTIONS } from './worlds/w6Swing.ts';
import { W9_SWING_SECTIONS } from './worlds/w9Swing.ts';

export const cfg9 = (id: string, objectiveType: LevelConfig['objectiveType']): LevelConfig => ({
  worldIndex: 9, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType, targetCount: 1, timeLimit: 0, levelWidth: 4000, levelHeight: 900,
  description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});

const dry = (s: SectionTemplate): SectionTemplate => ({
  ...s,
  pieces: s.pieces.map((p) => ('water' in p.place && p.place.water ? { ...p, place: { ...p.place, water: false } as PlaceRule } : p)),
});

/** the stand-in World 9 kit for stage `stage` with the swing sections (and `extra`, the rooms) joined */
export function w9StandIn(stage: number, _difficulty: Difficulty = 'normal', extra: readonly SectionTemplate[] = []): WorldKit {
  const k = w6Kit(2);
  const M = k.manifest;
  const ground = [...M.sections, ...W6_SWING_SECTIONS].filter((s) => !s.room && !s.pieces.some((p) => p.shape === 'liana' || p.shape === 'vine') && !s.zones?.length && !s.sockets.some((q) => q.allow?.includes('watch')));
  return {
    ...k,
    manifest: {
      ...M,
      world: 9,
      name: 'Volcanic Jungle (stand-in)',
      pit: 'void',
      handBuilt: ['9-2', '9-7', '9-10'],
      sections: [...ground.map(dry), ...W9_SWING_SECTIONS, ...extra],
      required: { [`9-${stage}`]: extra.map((s) => ({ section: s.id })) },
    },
  };
}
