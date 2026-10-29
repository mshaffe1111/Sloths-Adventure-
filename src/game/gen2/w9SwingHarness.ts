/**
 * Test helpers for World 9's swing sections and rooms (w9Swing.test.ts, w9SwingRoute.test.ts, w9Rooms.test.ts).
 *
 * Until the World 9 builder's kit (gen2/worlds/w9.ts, w9Game.ts, branch gen2-w9) is on this branch, the swings are built on a stand-in:
 * World 6's kit (its creatures, props and ground) as World 9 (its band), with World 9's falls (pit 'void': the lava on Normal, Easy's
 * all soft), every creek dry, none of World 6's own lianas or rooms, and these sections joined. Once w9Game.ts lands the tests build on
 * w9GameKit instead and this stand-in is deleted.
 */
import { addKitPlatforms, type RoomSpec } from '../puzzleKit.ts';
import { G } from '../protoStage.ts';
import type { Difficulty } from '../difficulty.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { LevelConfig, Platform } from '../types.ts';
import { layLocal, placeRoom, planBudget, rngFor } from './pipeline.ts';
import type { PlaceRule, SectionTemplate, WorldKit, WorldManifest } from './types.ts';
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

/** a stand-in World 9 manifest for laying a room alone (what planBudget reads) */
export const M9: WorldManifest = {
  world: 9, name: 'Volcanic Jungle (stand-in)', moves: ['double', 'swing', 'climb', 'glide'], ground: { y: G, bankH: 90, style: 'log' }, pit: 'void', pitDepth: 110,
  corridor: { top: G - 160, bottom: G + 80, soft: 60 }, creatures: [], props: [], pairs: [], decor: [], flowers: ['orchid'], sections: [],
  handBuilt: ['9-2', '9-7', '9-10'],
};

export const RUNWAY = 700;
/** the room's section laid alone, between a runway and a bank past it, its kit pieces added (`keep`: a room with pieces taken out) */
export function roomStage9(tpl: SectionTemplate, d: Difficulty, keep: (p: RoomSpec['pieces'][number]) => boolean = () => true): GeneratedStage & { room: RoomSpec } {
  const L = layLocal(tpl, planBudget(cfg9('9-3', 'vine_runner'), M9, d), rngFor(1), false);
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
    config: { ...cfg9('9-3', 'sprint'), levelWidth: end.x + 640, levelHeight: base + 100 },
    trees: [], platforms: plats, vines: [], ropes: [], enemies: [], boss: null,
    collectibles: [{ id: 1, type: 'exit_totem', x: exitX, y: end.y - 30, collected: false, bobPhase: 0 }],
    spawnX: 140, spawnY: G, exitTotemX: exitX, exitTotemY: end.y, checkpoints: [], kit: { rooms: [room] }, room,
  } as unknown as GeneratedStage & { room: RoomSpec };
}
