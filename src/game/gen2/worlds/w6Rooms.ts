/**
 * gen2/worlds/w6Rooms — World 6's puzzle-room sections (DESIGN.md B9; STAGE-RULES §3), built from the puzzle kit as it is (puzzleKit.ts:
 * no new piece). The story is the Deep Mangrove's (reference/STORY-REWRITE.md "World 6"): roots standing up out of black water, the water
 * that rises and falls, the roots going dark, and what Dot leaves for Pokey to find.
 *
 *   w6r-room-water   6-7 "Through the Roots" (Raise the water, lower the water, and find what Dot left you). A sluice wheel by the root
 *                    well works the water: turned on, the water rises and the raft in the well floats up with it, level with a high
 *                    root shelf; turned off, the water drains and the raft sinks. Dot's root-stone waits on the shelf. The root door past
 *                    the well opens only with the stone on its plate AND the water down (high water swells the root door shut). So:
 *                    raise the water, ride the raft up, take the stone, drop down with it to the plate, climb out, lower the water,
 *                    through. Three steps (Normal's 2-3); the water never costs a life (the well's floor is ground: a dip, a hop out).
 *   w6r-room-seesaw  6-3 "Root to Root" (Keep swinging. The water is watching). A root seesaw before a bank too high to jump: at rest
 *                    its near end lies down level with the floor and its far end stands a step up, a step from the bank's top, but his
 *                    own weight on the far end tips it down. One root-stone on the near end is too light to hold it (2 against his 3);
 *                    two are enough. Carry both from the pile, walk up the plank, hop to the bank. (World 1 taught the seesaw.)
 *   w6r-room-dark    6-6 "Lights in the Roots" (The roots go dark. Let the firefly light the way). A dark root hollow under a bank too
 *                    high to jump; the root steps up out of it show only in the firefly's light (the kit's `glow` and `ledge`, Meeca's
 *                    last path, whose numbers her real-engine test proves). At the top a moonflower opens in his light and lights the
 *                    whole hollow. The hollow's floor is soft ground with a step out (never a life).
 *
 * None has an enemy socket, none is mirrored (a room reads left to right), each is once a stage (and only in its own stage: W6R_STAGE),
 * and the pipeline keeps a room's join quiet (no pit beside it). None can be walked past unsolved: the water room's root door stands on
 * the floor and its wall is out of a double jump's reach from anything he can stand on unaided; the dark and seesaw rooms' banks are too
 * high to jump.
 *
 * What the kit has no art for yet (reported): the water itself (the kit's lift is drawn as a plank; the well wants black water rising
 * and falling with it, and the raft), the sluice wheel (a lever today), and the dark over the hollow (the engine's `dark` zone: gen2's
 * StageSink has no zones yet, so `W6_DARK_ROOMS` names the sections the hook-up darkens). Dot's lines are new: each needs Matt's approval.
 */
import type { LocalRoomSpec, SectionPiece, SectionTemplate, WorldKit } from '../types.ts';

// ───────────────────────────── Dot's lines ─────────────────────────────

/**
 * The rooms' lines (under 10 words). All new: each needs Matt's approval before it ships (STAGE-RULES §1 "Story").
 *   water   the root door, explained as he comes in; the stone in his hands; the door open
 *   dark    the bank too high, explained; the first step the firefly finds; the moonflower open
 */
export const W6R_NEW_LINES: readonly string[] = [
  'High water swells that root door shut.',
  "I left you my root-stone! Plate's below.",
  'Water down, door open. Through!',
  "Too high. Stay close to the firefly, Pokey.",
  'A step! It only shows in the light.',
  'A moonflower. Now we can see everything.',
  "Too high. That root tips, though.",
  'One stone is not enough. Try two.',
  'It holds! Up the root you go.',
];

/** the rooms' hints, asked for (Matt: only when asked, in steps, never the answer; under 10 words). New lines: each needs his approval */
export const W6R_ROOM_HINTS: Record<string, readonly [string, string]> = {
  water: ['What floats when the water comes up?', 'The door hates high water.'],
  dark: ['The firefly goes where you go.', 'Walk slowly at the edge. Look up.'],
  seesaw: ['Which end goes down when you stand there?', 'You are heavier than one stone.'],
};

// ───────────────────────────── helpers ─────────────────────────────

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a room piece's spot along a fixed-width floor, in px (the anchors are fractions of it: widths are settled first, STAGE-RULES §6) */
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });

// ───────────────────────────── 6-7: raise the water, lower the water ─────────────────────────────

/** floor A (the wheel and the post, the shelf over its far end), the well (a dip WATER_DIP down), floor B (the root door) */
export const WATER = {
  floorA: 220,
  well: 330,
  floorB: 300,
  /** the well's floor under the floors (a hop down, a hop out) */
  dip: 80,
  /** the root shelf over floor A's far end: its top this far over the floors (out of a double jump's reach), and its width */
  shelfUp: 230,
  shelfW: 130,
  /** the raft: its plank this far over the well's floor when the water is down, its width, and how far it rises (to the shelf) */
  raftDy: 40,
  raftW: 110,
  /** the root door's whole height (out of a double jump from the raft risen) */
  doorH: 450,
} as const;
/** the raft's rise: from its low spot in the well to the shelf's top */
export const RAFT_RISE = WATER.dip - WATER.raftDy + WATER.shelfUp;

const wa = along('floor', WATER.floorA);
const ww = along('well', WATER.well);
const wb = along('floor2', WATER.floorB);
const ws = along('shelf', WATER.shelfW);

export const waterRoomSpec: LocalRoomSpec = {
  id: 'water',
  left: wa(0),
  right: wb(160),
  above: 490,
  below: WATER.dip + 20,
  pieces: [
    { kind: 'reset', id: 'post', at: wa(24) },
    // (the sluice wheel at the well's lip: in reach from the floor, and from the raft down in the well beside it)
    { kind: 'lever', id: 'sluice', at: wa(WATER.floorA - 18) },
    // (the raft in the well, against floor A: the water up, it floats level with the shelf; down, it rests a hop over the well's floor)
    { kind: 'lift', id: 'raft', at: ww(WATER.raftW / 2 + 4, -WATER.raftDy), w: WATER.raftW, rise: RAFT_RISE, by: 'sluice' },
    // (Dot's root-stone on the shelf: a pile of them, so a dropped one comes back)
    { kind: 'source', id: 'pile', variant: 'stone', at: ws(46), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'plate' },
    { kind: 'plate', id: 'plate', at: ww(240) },
    // (open only with the stone on the plate and the water down; standing on the plate himself, it shuts as he steps off)
    { kind: 'gate', id: 'door', at: wb(120), open: { all: ['plate', { not: 'sluice' }] }, h: WATER.doorH, look: 'roots' },
  ],
  exit: 'door',
  beyond: wb(230),
  ground: ['floor', 'well', 'floor2', 'shelf'],
  tips: {
    enter: 'High water swells that root door shut.', // (new, needs Matt's approval)
    hold: "I left you my root-stone! Plate's below.", // (new, needs Matt's approval)
    open: 'Water down, door open. Through!', // (new, needs Matt's approval)
  },
};

export const waterRoom: SectionTemplate = {
  id: 'w6r-room-water',
  name: 'puzzle room: raise the water, lower the water (the root well)',
  archetypes: ['vine_runner'],
  teaches: 'w6:raft',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (wheel, raft up, stone, down to the plate, out, wheel, through: about 18 s for a first-timer)
  extraSeconds: 18,
  pieces: [
    bank('floor', WATER.floorA, { kind: 'start' }),
    bank('well', WATER.well, { kind: 'walk', after: 'floor', dy: WATER.dip }),
    bank('floor2', WATER.floorB, { kind: 'walk', after: 'well', dy: -WATER.dip }),
    { key: 'shelf', shape: 'branch', w: WATER.shelfW, place: { kind: 'over', on: 'floor', at: (WATER.floorA - WATER.shelfW) / WATER.floorA, dy: -WATER.shelfUp }, main: false },
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'floor2', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: waterRoomSpec,
  mirrorable: false,
};

// ───────────────────────────── 6-3: the root seesaw ─────────────────────────────

/** the floor (the post, the pile), the dip the seesaw lies in, the high bank past it, the walk back down */
export const SEESAW = {
  floor: 300,
  /** the dip under the plank (its ends' tops level with the floor when down: protoStage.ts 1-6's SEE.pit) */
  dip: 60,
  plank: 260,
  /** the raised end over the floor, and the bank over the floor (out of a double jump's reach; a step from the raised end) */
  rise: 110,
  bankUp: 260,
  bankW: 380,
} as const;

const sf = along('floor', SEESAW.floor);
const sb = along('bank', SEESAW.bankW);

export const seesawRoomSpec: LocalRoomSpec = {
  id: 'seesaw',
  left: sf(0),
  right: sb(60),
  above: 460,
  below: SEESAW.dip + 10,
  pieces: [
    { kind: 'reset', id: 'post', at: sf(20) },
    // (two root-stones from the pile: one weighs 2, Pokey 3; two hold the near end down under him)
    { kind: 'source', id: 'pile', variant: 'stone', at: sf(130), look: 'pile' },
    { kind: 'item', id: 'stone1', variant: 'stone', source: 'pile', for: 'root' },
    { kind: 'item', id: 'stone2', variant: 'stone', source: 'pile', for: 'root' },
    // (at rest the near end is down: what is carried walks straight onto it)
    { kind: 'seesaw', id: 'root', at: { on: 'dip', at: 0.5, dy: -SEESAW.dip }, w: SEESAW.plank, rise: SEESAW.rise, rest: -1 },
  ],
  exit: 'root',
  beyond: sb(120),
  ground: ['floor', 'dip'],
  tips: {
    enter: 'Too high. That root tips, though.', // (new, needs Matt's approval)
    hold: 'One stone is not enough. Try two.', // (new, needs Matt's approval)
    open: 'It holds! Up the root you go.', // (new, needs Matt's approval)
  },
};

export const seesawRoom: SectionTemplate = {
  id: 'w6r-room-seesaw',
  name: 'puzzle room: the root seesaw (two stones)',
  archetypes: ['vine_runner'],
  teaches: 'w6:two-stones',
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  // (one stone, the plank tips under him; the second; up and over: about 14 s for a first-timer)
  extraSeconds: 14,
  pieces: [
    bank('floor', SEESAW.floor, { kind: 'start' }),
    bank('dip', SEESAW.plank, { kind: 'walk', after: 'floor', dy: SEESAW.dip }),
    // (the bank, a whole bank down to the ground past the dip: a wall beside a pit reaches the pit's floor)
    bank('bank', SEESAW.bankW, { kind: 'over', on: 'dip', at: 1, dy: -(SEESAW.dip + SEESAW.bankUp) }, { main: true }),
    bank('out', [240, 300], { kind: 'walk', after: 'bank', dy: SEESAW.bankUp }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: seesawRoomSpec,
  mirrorable: false,
};

// ───────────────────────────── 6-6: the dark hollow and the firefly ─────────────────────────────

/** floor E (the post), the hollow (soft ground PIT_DOWN under it, a step out at its near end), the high bank, the walk back down */
export const DARK = {
  floorE: 170,
  hollow: 400,
  /** the hollow's floor under floor E, and the step out of it */
  down: 150,
  step: 75,
  stepW: 70,
  /** the bank past the hollow, over floor E (out of a double jump's reach) */
  bankUp: 250,
  bankW: 420,
  /** the firefly's light (Meeca's: 170) */
  glow: 170,
} as const;

const de = along('floorE', DARK.floorE);
const dh = along('hollow', DARK.hollow);
const db = along('bank', DARK.bankW);

export const darkRoomSpec: LocalRoomSpec = {
  id: 'dark',
  left: de(4),
  right: db(140),
  above: 440,
  below: DARK.down + 50,
  pieces: [
    { kind: 'reset', id: 'post', at: de(20) },
    { kind: 'glow', id: 'firefly', r: DARK.glow },
    // (Meeca's three steps, 70 px apart in height and 130 across: each only in the light, the first in reach of floor E's end)
    { kind: 'ledge', id: 'stepA', at: dh(60, -200), w: 100 },
    { kind: 'ledge', id: 'stepB', at: dh(190, -270), w: 100 },
    { kind: 'ledge', id: 'stepC', at: dh(320, -340), w: 100 },
    // (out of the firefly's reach from the last step: it opens as he comes up onto the bank, and lights the hollow)
    { kind: 'moonflower', id: 'moon', at: db(200), r: 900 },
  ],
  exit: 'moon',
  beyond: db(80),
  ground: ['floorE'],
  tips: {
    enter: 'Too high. Stay close to the firefly, Pokey.', // (new, needs Matt's approval)
    lit: 'A step! It only shows in the light.', // (new, needs Matt's approval)
    open: 'A moonflower. Now we can see everything.', // (new, needs Matt's approval)
  },
};

export const darkRoom: SectionTemplate = {
  id: 'w6r-room-dark',
  name: 'puzzle room: the dark hollow (the firefly lights the steps)',
  archetypes: ['sprint'],
  teaches: 'w6:firefly-steps',
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  // (the steps found one by one in the light: about 10 s for a first-timer)
  extraSeconds: 10,
  pieces: [
    bank('floorE', DARK.floorE, { kind: 'start' }),
    bank('hollow', DARK.hollow, { kind: 'walk', after: 'floorE', dy: DARK.down }),
    // (the step out of the hollow at its near end: one plain hop up, then one to floor E)
    { key: 'step', shape: 'block', w: DARK.stepW, h: DARK.step, place: { kind: 'on', on: 'hollow', at: 0, h: DARK.step }, style: 'moss_stone' },
    // (the high bank, a whole bank down to the ground: a wall beside a pit reaches the pit's floor, STAGE-RULES §6)
    bank('bank', DARK.bankW, { kind: 'over', on: 'hollow', at: 1, dy: -(DARK.down + DARK.bankUp) }, { main: true }),
    // (and down again to floor E's height: the route leaves the room level with where it came in)
    bank('out', [260, 320], { kind: 'walk', after: 'bank', dy: DARK.bankUp }),
  ],
  entry: { piece: 'floorE', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: darkRoomSpec,
  mirrorable: false,
};

// ───────────────────────────── the set ─────────────────────────────

/** World 6's puzzle-room sections */
export const W6_ROOM_SECTIONS: readonly SectionTemplate[] = [waterRoom, darkRoom, seesawRoom];

/** the sections the hook-up darkens (the engine's `dark` zone over each, with no lights of its own: the room's firefly is the light) */
export const W6_DARK_ROOMS: readonly string[] = [darkRoom.id];

/** each room's stage (STAGE-RULES §3: 2-3 puzzle moments a world; w6.ts W6_ROOM_STAGES): a stage's kit holds only its own */
export const W6R_STAGE: Record<string, string> = { [seesawRoom.id]: '6-3', [darkRoom.id]: '6-6', [waterRoom.id]: '6-7' };

/**
 * World 6's kit for stage `stage` (6-3: 3) with that stage's room joined, none for a stage with no room (the world's own manifest,
 * gen2/worlds/w6.ts, stays as it is: the lead folds the lists together)
 */
export function withW6Rooms(kit: WorldKit, stage: number): WorldKit {
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  const mine = W6_ROOM_SECTIONS.filter((s) => W6R_STAGE[s.id] === `6-${stage}` && !have.has(s.id));
  return { ...kit, manifest: { ...M, sections: [...M.sections, ...mine] } };
}
