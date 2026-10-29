/**
 * Test helpers for World 7's swing sections and puzzle rooms (w7Swing.test.ts, w7SwingRoute.test.ts, w7Rooms.test.ts): a stand-in World 7
 * manifest until the world's own (gen2/worlds/w7.ts, the main builder's branch gen2-w7) is merged here, and a kit with only these sections.
 */
import { G } from '../protoStage.ts';
import type { LevelConfig } from '../types.ts';
import type { WorldKit, WorldManifest } from './types.ts';
import { W6_CREATURES } from './worlds/w6.ts';

/** a stand-in World 7 manifest: what planBudget and the build read (the prowlers World 3 taught, a soft fall, the swing and climb) */
export const M7: WorldManifest = {
  world: 7, name: 'Ancient Ruins', moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'], ground: { y: G, bankH: 90, style: 'moss_stone' }, pit: 'soft', pitDepth: 110,
  corridor: { top: G - 160, bottom: G + 80, soft: 60 }, creatures: W6_CREATURES.filter((c) => c.id === 'ocelot' || c.id === 'jaguar'), props: [], pairs: [], decor: [],
  flowers: ['orchid'], sections: [], handBuilt: ['7-10'], lessons: { ocelot: '3-9', jaguar: '3-9' },
};
export const cfg7 = (id: string, objectiveType: LevelConfig['objectiveType']): LevelConfig => ({
  worldIndex: 7, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType, targetCount: 1, timeLimit: 0, levelWidth: 4000, levelHeight: 900,
  description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});
/** the stand-in kit: World 7's manifest and nothing else (the swing sections join it with withW7Swing) */
export const k7 = (): WorldKit => ({ manifest: M7 });
