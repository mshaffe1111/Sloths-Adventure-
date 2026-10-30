/**
 * kitStage — the puzzle kit's test room (Matt's test link: ?autostart=1&level=kit): small puzzle rooms in a row on World 1's forest
 * floor, each taught in order and each narrow and tall enough to fit an upright phone as well as a sideways one.
 *
 * Phase 1:
 *   1. CARRY   an acorn tree and a knot plate: carry the acorn onto the plate and the vine gate opens (while it stays there);
 *   2. LURE    two plates far apart (the gate wants both): set the cake on the far plate, the beetle walks onto it, eats, falls asleep
 *              there, and then Pokey stands on the near one. The gate latches open;
 *   3. THROW   the counterweight: a basket hangs high on a pulley over the lift by the cliff. Throw the acorn up into it (flick up), the
 *              lift rises with Pokey on it, and he steps off onto the cliff.
 * Phase 2a (2026-10-28), down off the cliff:
 *   4. SEESAW  a bank too high to jump: push the hollow log onto the seesaw's near end, and the far end stays up under him as a step;
 *   5. BELL    an old thorn vine wakes over the path on its beat: ring the bell (a tap, or a pebble thrown at it), or throw a pebble
 *              down the path, and it turns to the noise for a while;
 *   6. LIGHT   a dark hollow: carry the glowing mushroom to the foot of the bank and set it down; its light finds a hidden ledge (and a
 *              carved fern mark) and wakes the glowworms;
 *   7. WIND    a shuttered gust lane: open the shutter (the lever by the lift) and the gusts spin the pinwheel, which winds the rope lift
 *              up with him on it;
 *   8. SLUICE  a river standing still behind its sluice: pull the lever and the current runs and the logs drift across (pull it
 *              again to stop a log where you want it);
 *   9. TRADE   a capuchin on its stump holds a stone: bring it a mango (a tap by it while carrying), it drops the stone, and the stone on
 *              the plate opens the gate to the Exit Shrine.
 *
 * Every piece is placed relative to the platform it sits on (puzzleKit.ts Anchor); the platforms here are the room's ground. Each room
 * has a signpost at its door: a tap on it starts the room again. `&room=<id>` on the test link (?autostart=1&level=kit&room=seesaw)
 * starts Pokey at the door of that room (App.tsx, setKitStart).
 */
import { addKitPlatforms, kitPlatId, type Anchor, type KitExtras, type RoomSpec } from './puzzleKit.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform } from './types.ts';
import type { ProtoExtras } from './protoStage.ts';
import type { Zone } from './zones.ts';
import { driftX, gapFor, logLayout, LOG_HEIGHT, surfaceBelowBank, LOG_DROP, type RiverZone } from './river.ts';
import type { ThornVine } from './thornVine.ts';

export const KIT_STAGE_ID = 'kit';
/** the forest floor's top, and how deep a bank of it is */
const G = 580;
const BANK = 90;
const W = 8400;
/** the cliff room 3's lift climbs, over the floor */
export const KIT_CLIFF = 260;

/** where each phase 2a room starts (world x), for the tests and the screenshots */
export const KIT_ROOMS = { seesaw: 2800, bell: 3820, light: 4700, wind: 5560, sluice: 6560, trade: 7520 } as const;

/** where each room's door is (world x, all on the floor's height), for `&room=` */
export const KIT_DOORS: Record<string, number> = {
  carry: 380, lure: 1080, throw: 1900, seesaw: KIT_ROOMS.seesaw - 50, bell: KIT_ROOMS.bell - 60, light: KIT_ROOMS.light - 40,
  wind: KIT_ROOMS.wind - 40, sluice: KIT_ROOMS.sluice - 40, trade: KIT_ROOMS.trade - 60,
};
let startRoom: string | null = null;
/** the test link's `&room=`: the next build of the test room starts Pokey at that room's door (null: at the start) */
export function setKitStart(room: string | null): void {
  startRoom = room && room in KIT_DOORS ? room : null;
}

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
    description: 'Little puzzles: carry, lure, throw, seesaw, bell, light, wind, sluice and trade.',
    unlocked: true,
    completed: false,
    stars: 0,
    highScore: 0,
    bestTime: 0,
  };
}

/** the platforms phase 2a's rooms sit on */
export interface KitGround2 {
  floorB: Platform;
  pitB: Platform;
  bankB: Platform;
  floorC: Platform;
  bankC: Platform;
  floorD: Platform;
  well: Platform;
  cliffD: Platform;
  floorE: Platform;
  farE: Platform;
  floorF: Platform;
}

// (a spot on a platform at world x, as an anchor: 0..1 along its top)
const on = (p: Platform, x: number, dy = 0): Anchor => ({ on: p.id, at: (x - p.x) / p.width, ...(dy ? { dy } : {}) });

/** the test room's first three rooms, over its platforms (floor, the lift's well, the cliff) */
export function kitRooms(floor: Platform, well: Platform, cliff: Platform): KitExtras {
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
      enter: "The gate's shut. Hmm, that stone plate.",
      hold: 'Hands full! Tap to set it down.',
      nudge: 'Something heavy for the plate?',
      move: 'Fetch the acorn. Set it on the plate.',
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
      enter: 'Two plates. One of me.',
      hold: 'Tap to set it down.',
      nudge: 'That beetle looks hungry.',
      move: 'Set the cake on the far plate.',
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
      enter: "The lift won't rise. Hmm, that basket.",
      hold: 'Stand on the lift. Flick up to throw!',
      nudge: 'That basket looks empty.',
      move: 'Fill the basket to raise the lift.',
      open: 'Up she goes! Ride the lift.',
    },
  };
  return { rooms: [carry, lure, throwRoom] };
}

/** the seesaw room's numbers: the pivot, the plank, its rise, and the bank past it (too high to jump from the floor or the log) */
export const SEESAW = { pivot: 3220, w: 320, rise: 110, bank: 270, logW: 140, logH: 60 } as const;

/** phase 2a's rooms (KIT_ROOMS), over their ground */
export function kitRooms2(g: KitGround2): RoomSpec[] {
  const R = KIT_ROOMS;
  const seesaw: RoomSpec = {
    id: 'seesaw',
    left: on(g.floorB, R.seesaw), right: { on: g.bankB.id, at: 0, dx: 60 }, above: 420, below: 60,
    pieces: [
      { kind: 'reset', id: 'post4', at: on(g.floorB, R.seesaw + 24) },
      { kind: 'seesaw', id: 'see4', at: on(g.pitB, SEESAW.pivot, -110), w: SEESAW.w, rise: SEESAW.rise, rest: -1 },
    ],
    exit: 'see4',
    beyond: { on: g.bankB.id, at: 0.3 },
    ground: [g.floorB.id, g.pitB.id],
    tips: {
      enter: 'Too high! That seesaw, though.',
      nudge: 'That log looks heavy.',
      move: 'Weigh the near end of the seesaw down.',
      open: 'The log holds it! Up the plank you go.',
    },
  };
  const bell: RoomSpec = {
    id: 'bell',
    left: on(g.floorC, R.bell), right: on(g.floorC, R.bell + 640), above: 420, below: 60,
    pieces: [
      { kind: 'reset', id: 'post5', at: on(g.floorC, R.bell + 24) },
      { kind: 'source', id: 'pile5', variant: 'pebble', at: on(g.floorC, R.bell + 110), look: 'pile' },
      { kind: 'item', id: 'pebble5', variant: 'pebble', source: 'pile5' },
      { kind: 'bell', id: 'bell5', at: on(g.floorC, R.bell + 210) },
    ],
    exit: 'bell5',
    beyond: on(g.floorC, R.bell + 600),
    ground: [g.floorC.id],
    tips: {
      enter: 'That old vine is wide awake.',
      hold: 'Pebbles clack when they land.',
      nudge: 'That bell looks loud.',
      move: 'Ring the bell. The vine turns to look.',
    },
  };
  const light: RoomSpec = {
    id: 'light',
    left: on(g.floorD, R.light), right: { on: g.bankC.id, at: 0, dx: 80 }, above: 440, below: 60,
    pieces: [
      { kind: 'reset', id: 'post6', at: on(g.floorD, R.light + 24) },
      { kind: 'source', id: 'patch6', variant: 'mushroom', at: on(g.floorD, R.light + 120), look: 'pile' },
      { kind: 'item', id: 'shroom6', variant: 'mushroom', source: 'patch6', for: 'ledge6' },
      { kind: 'mark', id: 'mark6', at: on(g.floorD, R.light + 410), look: 'fernStone' },
      { kind: 'ledge', id: 'ledge6', at: on(g.floorD, R.light + 470, -125), w: 120 },
    ],
    exit: 'ledge6',
    beyond: { on: g.bankC.id, at: 0.4 },
    ground: [g.floorD.id],
    tips: {
      enter: "So dark! Can't see a thing.",
      hold: 'Tap to set it down.',
      nudge: 'That mushroom glows.',
      move: 'Carry the mushroom. Its light finds ledges.',
      open: 'A ledge in the light!',
    },
  };
  const wind: RoomSpec = {
    id: 'wind',
    left: on(g.floorE, R.wind), right: { on: g.cliffD.id, at: 0, dx: 80 }, above: 440, below: 90,
    pieces: [
      { kind: 'reset', id: 'post7', at: on(g.floorE, R.wind + 24) },
      { kind: 'shutter', id: 'shut7', at: on(g.floorE, R.wind + 110), zone: 0, open: 'lever7' },
      { kind: 'pinwheel', id: 'pin7', at: on(g.floorE, R.wind + 300) },
      { kind: 'lever', id: 'lever7', at: on(g.floorE, R.wind + 530) },
      { kind: 'lift', id: 'lift7', at: { on: g.well.id, at: 0.5, dy: G - g.well.y }, w: g.well.width, rise: KIT_CLIFF, by: 'pin7', hold: true },
    ],
    exit: 'lift7',
    beyond: { on: g.cliffD.id, at: 0.2 },
    ground: [g.floorE.id, g.well.id],
    tips: {
      enter: 'The lift needs winding. No wind in here.',
      nudge: 'That shutter holds the wind back.',
      move: 'Open the shutter. The pinwheel winds the lift.',
      open: 'Wound right up!',
    },
  };
  const sluice: RoomSpec = {
    id: 'sluice',
    left: on(g.floorF, R.sluice), right: { on: g.farE.id, at: 0, dx: 80 }, above: 420, below: 120,
    pieces: [
      { kind: 'reset', id: 'post8', at: on(g.floorF, R.sluice + 24) },
      { kind: 'lever', id: 'lever8', at: on(g.floorF, R.sluice + 130) },
      { kind: 'sluice', id: 'sluice8', at: on(g.floorF, g.floorF.x + g.floorF.width - 40), river: 0, open: 'lever8', opened: 'with', shut: 'still' },
    ],
    exit: 'sluice8',
    beyond: { on: g.farE.id, at: 0.2 },
    ground: [g.floorF.id],
    tips: {
      enter: "The river's still. No logs drift.",
      nudge: 'That lever works the sluice.',
      move: 'Pull the lever to let it run!',
      open: 'The logs are drifting! Pull it again to stop one.',
    },
  };
  const trade: RoomSpec = {
    id: 'trade',
    left: on(g.farE, R.trade), right: on(g.farE, R.trade + 640), above: 420, below: 60,
    pieces: [
      { kind: 'reset', id: 'post9', at: on(g.farE, R.trade + 24) },
      { kind: 'source', id: 'tree9', variant: 'mango', at: on(g.farE, R.trade + 120), look: 'pile' },
      { kind: 'item', id: 'mango9', variant: 'mango', source: 'tree9', for: 'monkey9' },
      { kind: 'trader', id: 'monkey9', at: on(g.farE, R.trade + 320), wants: 'mango' },
      { kind: 'item', id: 'stone9', variant: 'stone', with: 'monkey9', for: 'plate9' },
      // (a stone weighs 2: the mango, 1, is too light to hold it down)
      { kind: 'plate', id: 'plate9', at: on(g.farE, R.trade + 470), need: 2 },
      { kind: 'gate', id: 'gate9', at: on(g.farE, R.trade + 590), open: 'plate9' },
    ],
    exit: 'gate9',
    beyond: on(g.farE, R.trade + 680),
    ground: [g.farE.id],
    tips: {
      enter: 'The capuchin has our stone!',
      nudge: 'Hmm. It looks hungry.',
      move: 'Bring it a mango. Tap by it.',
      hold: 'Tap by the capuchin to offer it.',
      open: 'The gate is open!',
    },
  };
  return [seesaw, bell, light, wind, sluice, trade];
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
  const cliff = bank(2340, 2700, G - KIT_CLIFF, KIT_CLIFF + BANK);
  const R = KIT_ROOMS;
  // phase 2a: down off the cliff onto the floor again
  // (the seesaw stands over a shallow pit, so each of its ends is the only ground where it is: his weight is always on it)
  const floorB = bank(2700, SEESAW.pivot - SEESAW.w / 2, G);
  const pitB = bank(floorB.x + floorB.width, SEESAW.pivot + SEESAW.w / 2, G + 110);
  const bankB = bank(pitB.x + pitB.width, 3700, G - SEESAW.bank, SEESAW.bank + BANK);
  const floorC = bank(3700, R.light + 20, G);
  // (the light room's floor, and the bank past the hidden ledge: 230 up, a jump only from the ledge)
  const floorD = bank(R.light + 20, R.light + 540, G);
  const bankC = bank(floorD.x + floorD.width, R.wind - 60, G - 230, 230 + BANK);
  const floorE = bank(R.wind - 60, R.wind + 560, G);
  const well2 = bank(R.wind + 560, R.wind + 660, G + 60);
  const cliffD = bank(R.wind + 660, R.sluice - 60, G - KIT_CLIFF, KIT_CLIFF + BANK);
  // the river room: a bank, the river (its logs), the far bank (the trade room's ground and the shrine's)
  const floorF = bank(R.sluice - 60, R.sluice + 220, G);
  const rx0 = floorF.x + floorF.width;
  const dir = 1 as const;
  const speed = 80;
  const logW = 150;
  const gap = Math.round(gapFor(dir, speed));
  const width = 3 * (logW + gap) - logW;
  const rx1 = rx0 + width;
  const farE = bank(rx1, W, G);
  const { count, period } = logLayout({ dir, speed, logW, gap, width });
  const logY = G + surfaceBelowBank - LOG_DROP - LOG_HEIGHT / 2;
  for (let i = 0; i < count; i++) {
    const p: Platform = {
      id: pid++, x: rx0, y: logY, width: logW, height: LOG_HEIGHT, type: 'drift', style: 'log',
      drift: { x0: rx0, x1: rx1, dir, speed, width: logW, offset: (i * period) / count, baseY: logY },
    };
    p.x = driftX(p.drift!, 0);
    P.push(p);
  }
  const rivers: RiverZone[] = [{ x0: rx0, x1: rx1, surfaceY: G + surfaceBelowBank, dir, speed, safe: { backX: rx0 - 70, backY: G } }];
  // the seesaw room's hollow log: short and low (a step to nothing), pushed along the floor onto the seesaw's near end
  P.push({
    id: pid++, x: R.seesaw + 100, y: G - SEESAW.logH, width: SEESAW.logW, height: SEESAW.logH, type: 'solid', style: 'log',
    push: { min: R.seesaw + 60, max: SEESAW.pivot - 10 },
  });
  const kit = kitRooms(floor, well, cliff);
  kit.rooms.push(...kitRooms2({ floorB, pitB, bankB, floorC, bankC, floorD, well: well2, cliffD, floorE, farE, floorF }));
  // (the lift's plank is one of the ground a thrown thing may rest on)
  kit.rooms[2].ground.push(kitPlatId(2, 'lift3', 0));
  kit.rooms[6].ground.push(kitPlatId(6, 'lift7', 0));
  addKitPlatforms(P, kit);
  // the wind room's gust lane (zone 0: its shutter opens and shuts it), over the pinwheel; and the light room's dark, with its glowworms
  const zones: Zone[] = [
    { kind: 'wind', x0: R.wind + 150, x1: R.wind + 440, top: G - 420, bottom: G, baseY: G, dir: 1, period: 5.6, warn: 1.1, active: 2.2, offset: 0, force: 120 },
    {
      kind: 'dark', x0: R.light - 40, x1: bankC.x + 240, top: G - 700, bottom: G + 200, baseY: G, dir: 1, period: 1, warn: 0, active: 1, offset: 0, force: 0,
      lights: [
        { x: R.light + 200, y: G - 260, r: 200, sleep: true, id: 1 },
        { x: R.light + 420, y: G - 300, r: 200, sleep: true, id: 2 },
        { x: bankC.x + 120, y: G - 420, r: 220, sleep: true, id: 3 },
      ],
    },
  ];
  // the bell room's old thorn vine, over the path past the bell (asleep, then it stirs and looks, on a long beat)
  const thorns: ThornVine[] = [{ x: R.bell + 430, top: G - 470, bud: G - 112, reach: 105, sleep: 4.5, stir: 1.4, look: 2.4, offset: 0 }];
  const exitX = 8250;
  let cid = 1;
  const C: Collectible[] = [];
  // a few flowers on the way, so the floor between the rooms is not bare
  for (const x of [240, 300, 1010, 1060, 1870, 2760, 3760, 5520, 6440]) {
    const y = x === 6440 ? cliffD.y - 34 : G - 34;
    C.push({ id: cid++, type: 'flower', botanicalVariant: 'orchid', x, y, collected: false, bobPhase: x * 0.031 });
  }
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });
  return {
    config: { ...config, levelWidth: W, levelHeight: Math.max(config.levelHeight, 900) },
    trees: [],
    platforms: P,
    vines: [],
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: startRoom ? KIT_DOORS[startRoom] : 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: G,
    checkpoints: [
      { x: 1080, y: G, reached: false }, { x: 1900, y: G, reached: false }, { x: 2760, y: G, reached: false }, { x: 3760, y: G, reached: false },
      { x: R.light - 60, y: G, reached: false }, { x: R.wind - 20, y: G, reached: false }, { x: R.sluice - 20, y: G, reached: false }, { x: R.trade - 40, y: G, reached: false },
    ],
    zones,
    rivers,
    kit,
    meta: { attempt: 1, chunks: [], width: W },
    proto: {
      hints: [], covers: [], thorns,
      beats: [[420, 940, 'carry'], [1120, 1800, 'lure'], [1960, 2440, 'throw'], [R.seesaw, 3700, 'seesaw'], [R.bell, R.bell + 640, 'bell'], [R.light, R.light + 800, 'light'], [R.wind, R.wind + 800, 'wind'], [R.sluice, R.sluice + 900, 'sluice'], [R.trade, R.trade + 700, 'trade']],
    },
  };
}
