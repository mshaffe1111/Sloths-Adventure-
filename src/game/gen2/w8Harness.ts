/**
 * Test helpers for World 8's gen2 swing sections and rooms (w8Swing.test.ts, w8SwingRoute.test.ts, w8Rooms.test.ts): a stand-in World 8
 * kit until the world's own (gen2/worlds/w8.ts, the main World 8 builder's) is on this branch, and a room's section laid alone on a stage
 * for the validator and the real engine (World 6's, w6Harness.ts roomStage, on World 8's numbers).
 */
import { G } from '../protoStage.ts';
import type { Difficulty } from '../difficulty.ts';
import type { RoomSpec } from '../puzzleKit.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { LevelConfig } from '../types.ts';
import type { CreatureDef, PropDef, SectionTemplate, WorldKit, WorldManifest } from './types.ts';
import { roomStage as w6RoomStage } from './w6Harness.ts';
import { W8_REQUIRED } from './worlds/w8Rooms.ts';
import { W8S_TAG, withW8Swing } from './worlds/w8Swing.ts';

/** stand-in night animals with the tags the swing sections ask for (World 6's bodies) */
const CREATURES: CreatureDef[] = [
  { id: 'frog', enemy: 'frog', threat: 1.5, terrain: 'flat', minGround: 120, w: 36, h: 24, hp: 1, footY: 14, tags: ['frog', W8S_TAG.small, 'topup'] },
  { id: 'tayra', enemy: 'tayra', threat: 2.5, terrain: 'flat', minGround: 200, w: 46, h: 24, hp: 1, footY: 15, tags: ['tayra', W8S_TAG.small, W8S_TAG.hunter, 'topup'] },
  { id: 'ocelot', enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['ocelot', W8S_TAG.hunter, 'topup'] },
];
const PROPS: PropDef[] = [{ id: 'moss', tags: [W8S_TAG.scenery], w: 80, minApart: 300 }];

/** a stand-in World 8 manifest: what planBudget and the pipeline read (the world's own is gen2/worlds/w8.ts, on the main builder's branch) */
export const M8: WorldManifest = {
  world: 8,
  name: 'Twilight Treetops',
  moves: ['double', 'punch', 'swing', 'climb', 'rope', 'glide'],
  ground: { y: G, bankH: 90, style: 'log' },
  pit: 'soft',
  pitDepth: 110,
  corridor: { top: G - 160, bottom: G + 80, soft: 60 },
  creatures: CREATURES,
  props: PROPS,
  pairs: [],
  decor: [],
  flowers: ['orchid'],
  sections: [],
  handBuilt: ['8-10'],
};
/** the stand-in kit for stage `stage` with the swing sections and its room, the room required on every roll (as w6Game.ts does) */
export const w8StandInKit = (stage: number, difficulty: Difficulty = 'normal'): WorldKit => {
  const k = withW8Swing({ manifest: M8 }, stage, difficulty);
  return { ...k, manifest: { ...k.manifest, required: W8_REQUIRED } };
};

export const cfg = (id: string, objectiveType: LevelConfig['objectiveType']): LevelConfig => ({
  worldIndex: 8, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType, targetCount: 1, timeLimit: 0, levelWidth: 4000, levelHeight: 900,
  description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});

export { RUNWAY } from './w6Harness.ts';
/** the room's section laid alone, between a runway and a bank past it, its kit pieces added (`keep`: a room with pieces taken out) */
export const roomStage = (tpl: SectionTemplate, d: Difficulty, keep?: (p: RoomSpec['pieces'][number]) => boolean): GeneratedStage & { room: RoomSpec } => w6RoomStage(tpl, d, keep);
