/**
 * kitStage — the puzzle kit's test room (Matt's test link: ?autostart=1&level=kit): three small puzzle rooms in a row on World 1's
 * forest floor, each taught in order and each narrow and tall enough to fit an upright phone as well as a sideways one.
 *
 *   1. CARRY   an acorn tree and a knot plate: carry the acorn onto the plate and the vine gate opens (while it stays there);
 *   2. LURE    two plates far apart (the gate wants both): set the cake on the far plate, the beetle walks onto it, eats, falls asleep
 *              there, and then Pokey stands on the near one. The gate latches open;
 *   3. THROW   the counterweight: a basket hangs high on a pulley over the lift by the cliff. Throw the acorn up into it (flick up), the
 *              lift rises with Pokey on it, and he steps off onto the cliff and the Exit Shrine.
 *
 * Every piece is placed relative to the platform it sits on (puzzleKit.ts Anchor); the platforms here are the room's ground. Each room
 * has a signpost at its door: a tap on it starts the room again.
 */
import { addKitPlatforms, kitPlatId, type Anchor, type KitExtras, type RoomSpec } from './puzzleKit.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform } from './types.ts';
import type { ProtoExtras } from './protoStage.ts';

export const KIT_STAGE_ID = 'kit';
/** the forest floor's top, and how deep a bank of it is */
const G = 580;
const BANK = 90;
const W = 2950;
/** the cliff room 3's lift climbs, over the floor */
export const KIT_CLIFF = 260;

export function kitStageConfig(): LevelConfig {
  return {
    worldIndex: 1,
    miniIndex: 13,
    id: KIT_STAGE_ID,
    name: 'Puzzle Test Room',
    objectiveType: 'sprint',
    targetCount: 1,
    timeLimit: 0,
    levelWidth: W,
    levelHeight: 900,
    description: 'Three little puzzles: carry, lure and throw.',
    unlocked: true,
    completed: false,
    stars: 0,
    highScore: 0,
    bestTime: 0,
  };
}

/** the test room's rooms, over its platforms (floor, the lift's well, the cliff) */
export function kitRooms(floor: Platform, well: Platform, cliff: Platform): KitExtras {
  // (a spot on the floor at world x, as an anchor: 0..1 along the floor's top)
  const on = (p: Platform, x: number, dy = 0): Anchor => ({ on: p.id, at: (x - p.x) / p.width, ...(dy ? { dy } : {}) });
  const carry: RoomSpec = {
    id: 'carry',
    left: on(floor, 420), right: on(floor, 940), above: 380, below: 60,
    pieces: [
      { kind: 'reset', id: 'post1', at: on(floor, 452) },
      { kind: 'source', id: 'oak1', variant: 'acorn', at: on(floor, 548), look: 'tree' },
      { kind: 'item', id: 'acorn1', variant: 'acorn', source: 'oak1', for: 'plate1' },
      { kind: 'plate', id: 'plate1', at: on(floor, 730) },
      { kind: 'gate', id: 'gate1', at: on(floor, 900), open: 'plate1' },
    ],
    exit: 'gate1',
    beyond: on(floor, 980),
    ground: [floor.id],
    tips: {
      enter: 'The plate opens the gate. Fetch the acorn!',
      hold: 'Hands full! Tap on the plate to drop it.',
      open: 'The gate is open!',
    },
  };
  const lure: RoomSpec = {
    id: 'lure',
    left: on(floor, 1120), right: on(floor, 1800), above: 380, below: 60,
    pieces: [
      { kind: 'reset', id: 'post2', at: on(floor, 1150) },
      { kind: 'plate', id: 'plateA', at: on(floor, 1222) },
      { kind: 'source', id: 'tray2', variant: 'cake', at: on(floor, 1400), look: 'pile' },
      { kind: 'item', id: 'cake2', variant: 'cake', source: 'tray2', for: 'plateB' },
      { kind: 'plate', id: 'plateB', at: on(floor, 1582) },
      { kind: 'beetle', id: 'beetle2', at: on(floor, 1690) },
      { kind: 'gate', id: 'gate2', at: on(floor, 1764), open: { all: ['plateA', 'plateB'] }, latch: true },
    ],
    exit: 'gate2',
    beyond: on(floor, 1840),
    ground: [floor.id],
    tips: {
      enter: 'Two plates, one sloth. Beetles love cake!',
      hold: 'Set the cake on the far plate.',
      stuck: 'Asleep in the wrong spot. Tap the signpost.',
      open: 'Both plates down. Through you go!',
    },
  };
  const throwRoom: RoomSpec = {
    id: 'throw',
    left: on(floor, 1960), right: { on: cliff.id, at: 0, dx: 80 }, above: 420, below: 90,
    pieces: [
      { kind: 'reset', id: 'post3', at: on(floor, 1990) },
      { kind: 'source', id: 'oak3', variant: 'acorn', at: on(floor, 2030), look: 'tree' },
      { kind: 'item', id: 'acorn3', variant: 'acorn', source: 'oak3', for: 'basket3' },
      { kind: 'basket', id: 'basket3', at: on(floor, 2196), mouth: 236, need: 1, drop: 130 },
      { kind: 'lift', id: 'lift3', at: { on: well.id, at: 0.5, dy: G - well.y }, w: well.width, rise: KIT_CLIFF, by: 'basket3' },
    ],
    exit: 'lift3',
    beyond: { on: cliff.id, at: 0.15 },
    ground: [floor.id, well.id],
    tips: {
      enter: 'Fill the basket to raise the lift.',
      hold: 'Stand on the lift. Flick up to throw!',
      open: 'Up she goes! Ride the lift.',
    },
  };
  return { rooms: [carry, lure, throwRoom] };
}

export function buildKitStage(config: LevelConfig): GeneratedStage & { proto: ProtoExtras } {
  let pid = 1;
  const P: Platform[] = [];
  const bank = (x0: number, x1: number, y: number, h = BANK): Platform => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: h, type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  const floor = bank(0, 2240, G);
  // the lift's well: its plank rests flush with the floor, over a shallow pit a hop deep
  const well = bank(2240, 2340, G + 60);
  const cliff = bank(2340, W, G - KIT_CLIFF, KIT_CLIFF + BANK);
  const kit = kitRooms(floor, well, cliff);
  // (the lift's plank is one of the ground a thrown thing may rest on)
  kit.rooms[2].ground.push(kitPlatId(2, 'lift3', 0));
  addKitPlatforms(P, kit);
  const exitX = 2800;
  let cid = 1;
  const C: Collectible[] = [];
  // a few flowers on the way, so the floor between the rooms is not bare
  for (const x of [240, 300, 1010, 1060, 1870]) C.push({ id: cid++, type: 'flower', botanicalVariant: 'orchid', x, y: G - 34, collected: false, bobPhase: x * 0.031 });
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: cliff.y - 30, collected: false, bobPhase: 0 });
  return {
    config: { ...config, levelWidth: W, levelHeight: Math.max(config.levelHeight, 900) },
    trees: [],
    platforms: P,
    vines: [],
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: cliff.y,
    checkpoints: [{ x: 1080, y: G, reached: false }, { x: 1900, y: G, reached: false }],
    zones: [],
    kit,
    meta: { attempt: 1, chunks: [], width: W },
    proto: { hints: [], covers: [], beats: [[420, 940, 'carry'], [1120, 1800, 'lure'], [1960, 2440, 'throw']] },
  };
}
