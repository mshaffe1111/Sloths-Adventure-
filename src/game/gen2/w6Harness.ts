/**
 * Test helpers for World 6's gen2 pieces (w6Rooms.test.ts, w6Swing.test.ts): a stand-in World 6 manifest until the world's own
 * (gen2/worlds/w6.ts) is on this branch, and a room's section laid alone on a stage for the validator and the real engine.
 */
import { addKitPlatforms, type RoomSpec } from '../puzzleKit.ts';
import { G } from '../protoStage.ts';
import type { Difficulty } from '../difficulty.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { LevelConfig, Platform } from '../types.ts';
import { layLocal, placeRoom, planBudget, rngFor } from './pipeline.ts';
import type { SectionTemplate, WorldManifest } from './types.ts';

/** a stand-in World 6 manifest (the world's own is gen2/worlds/w6.ts, written on its own branch): what planBudget reads */
export const M6: WorldManifest = {
  world: 6, name: 'Deep Mangrove', moves: ['double', 'swing', 'climb'], ground: { y: G, bankH: 90, style: 'log' }, pit: 'water', pitDepth: 110,
  corridor: { top: G - 160, bottom: G + 80, soft: 60 }, creatures: [], props: [], pairs: [], decor: [], flowers: ['orchid'], sections: [],
  handBuilt: ['6-8', '6-10'],
};
export const cfg = (id: string, objectiveType: LevelConfig['objectiveType']): LevelConfig => ({
  worldIndex: 6, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType, targetCount: 1, timeLimit: 0, levelWidth: 4000, levelHeight: 900,
  description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
});

export const RUNWAY = 700;
/** the room's section laid alone, between a runway and a bank past it, its kit pieces added (`keep`: a room with pieces taken out) */
export function roomStage(tpl: SectionTemplate, d: Difficulty, keep: (p: RoomSpec['pieces'][number]) => boolean = () => true): GeneratedStage & { room: RoomSpec } {
  const L = layLocal(tpl, planBudget(cfg('6-7', 'vine_runner'), M6, d), rngFor(1), false);
  const base = G + 400;
  const plats: Platform[] = [{ id: 1, x: 0, y: G, width: RUNWAY, height: base - G, type: 'solid', style: 'log' }];
  const ids = new Map<string, number>();
  for (const lp of L.pieces) {
    const id = plats.length + 1;
    ids.set(lp.key, id);
    const bank = lp.shape === 'bank';
    plats.push({ id, x: RUNWAY + lp.x, y: G + lp.y, width: lp.w, height: bank ? base - (G + lp.y) : lp.shape === 'branch' ? 24 : lp.h, type: 'solid', style: bank ? 'log' : 'moss_stone' });
  }
  const end: Platform = { id: plats.length + 1, x: RUNWAY + L.exit.x, y: G + L.exit.y, width: 600, height: base - (G + L.exit.y), type: 'solid', style: 'log' };
  plats.push(end);
  const room = placeRoom(tpl.room!, 's1', (k) => ids.get(k)!);
  room.pieces = room.pieces.filter(keep);
  addKitPlatforms(plats, { rooms: [room] });
  const exitX = end.x + 300;
  return {
    config: { ...cfg('6-7', 'sprint'), levelWidth: end.x + 640, levelHeight: base + 100 },
    trees: [], platforms: plats, vines: [], ropes: [], enemies: [], boss: null,
    collectibles: [{ id: 1, type: 'exit_totem', x: exitX, y: end.y - 30, collected: false, bobPhase: 0 }],
    spawnX: 140, spawnY: G, exitTotemX: exitX, exitTotemY: end.y, checkpoints: [], kit: { rooms: [room] }, room,
  } as unknown as GeneratedStage & { room: RoomSpec };
}

