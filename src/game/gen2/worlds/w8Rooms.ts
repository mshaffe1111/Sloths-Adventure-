/**
 * gen2/worlds/w8Rooms — World 8's puzzle-room sections (DESIGN.md B9; STAGE-RULES §3), built from the puzzle kit as it is (no new piece),
 * on World 6's proven geometry (w6Rooms.ts: each room's numbers are those its real-engine test plays), dressed for the treetops with
 * Matt's w8a-puzzle sheet (lever, plate, door) once the art hook-up draws it.
 *
 *   w8r-room-hollow   8-1 "As the Light Goes" (The fireflies will show the way). A dark hollow in the trunk under a bough too high to
 *                     jump; the knots up out of it show only in the firefly's light (the kit's `glow` and `ledge`), four of them (World
 *                     6's dark room has three). At the top a moonflower opens in his light and lights the whole hollow. The hollow's
 *                     floor is soft ground with a step out (never a life).
 *   w8r-room-hammock  8-2 "Night Blooms". A leaf hammock hangs by a lever's rope: pulled, it rises to a high fork where the seed stones
 *                     lie; let go, it drops. The leaf door past the dip opens with a stone on its plate AND the hammock down (its rope
 *                     runs through the door's latch). So: pull the lever, ride up, take a stone, drop to the plate, climb out, let the
 *                     lever go, through. Three steps on Normal; Easy's door listens to the plate alone (two).
 *   w8r-room-seesaw   8-5 "Next Branch". A branch seesaw before a bough too high to jump: his own weight tips it; one stone on the near end
 *                     is too light, two hold it. Carry both, walk up the plank, hop to the bough (World 1 and 6-3 taught the seesaw).
 *
 * None has an enemy socket, none is mirrored, each is once a stage and only in its own (W8R_STAGE), and none can be walked past unsolved.
 */
import type { Difficulty, LocalRoomSpec, SectionPiece, SectionTemplate } from '../types.ts';
import { W8_LESSON } from './w8.ts';
import { DARK as W6_DARK_ROOM, SEESAW, WATER, RAFT_RISE } from './w6Rooms.ts';

/** the rooms' lines (under 10 words). All new: each needs Matt's approval */
export const W8R_NEW_LINES: readonly string[] = [
  'Too high. The firefly will find the knots.',
  'A knot! It only shows in the light.',
  'A moonflower! Now the whole hollow glows.',
  "The hammock's rope holds that leaf door shut.",
  'Seed stones up there! The plate is below.',
  'Hammock down, door open. Through!',
  'That leaf door needs a weight on its plate.',
  'Too high. That branch tips, though.',
  'One stone is not enough. Try two.',
  'It holds! Up the branch you go.',
];

/** the rooms' hints, asked for (only when asked, in steps, never the answer). New lines: each needs his approval */
export const W8R_ROOM_HINTS: Record<string, readonly [string, string]> = {
  hollow: ['The firefly goes where you go.', 'Walk slowly at the edge. Look up.'],
  hammock: ['What does the lever lift?', 'The door hates a raised hammock.'],
  seesaw: ['Which end goes down when you stand there?', 'You are heavier than one stone.'],
};

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });

// ───────────────────────────── 8-1: the dark hollow, four knots ─────────────────────────────

export const HOLLOW = {
  ...W6_DARK_ROOM,
  /** one more knot than World 6's: the hollow 130 px wider, the bough 70 px higher */
  hollow: W6_DARK_ROOM.hollow + 130,
  bankUp: W6_DARK_ROOM.bankUp + 70,
} as const;

const he = along('floorE', HOLLOW.floorE);
const hh = along('hollow', HOLLOW.hollow);
const hb = along('bank', HOLLOW.bankW);

export const hollowRoomSpec: LocalRoomSpec = {
  id: 'hollow',
  left: he(4),
  right: hb(140),
  above: 510,
  below: HOLLOW.down + 50,
  pieces: [
    { kind: 'reset', id: 'post', at: he(20) },
    { kind: 'glow', id: 'firefly', r: HOLLOW.glow },
    // (World 6's knots, 70 px apart in height and 130 across, and a fourth)
    { kind: 'ledge', id: 'stepA', at: hh(60, -200), w: 100 },
    { kind: 'ledge', id: 'stepB', at: hh(190, -270), w: 100 },
    { kind: 'ledge', id: 'stepC', at: hh(320, -340), w: 100 },
    { kind: 'ledge', id: 'stepD', at: hh(450, -410), w: 100 },
    { kind: 'moonflower', id: 'moon', at: hb(200), r: 900 },
  ],
  exit: 'moon',
  beyond: hb(80),
  ground: ['floorE'],
  tips: {
    enter: 'Too high. The firefly will find the knots.', // (new, needs Matt's approval)
    lit: 'A knot! It only shows in the light.', // (new, needs Matt's approval)
    open: 'A moonflower! Now the whole hollow glows.', // (new, needs Matt's approval)
  },
};

export const hollowRoom: SectionTemplate = {
  id: 'w8r-room-hollow',
  name: 'puzzle room: the dark hollow (the firefly finds the knots)',
  archetypes: ['sprint'],
  teaches: 'w8:firefly-knots',
  // (after the stage's first dark stretch, whose tip teaches the dark: the room's dark comes second)
  uses: [W8_LESSON.dark],
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  extraSeconds: 12,
  pieces: [
    bank('floorE', HOLLOW.floorE, { kind: 'start' }),
    bank('hollow', HOLLOW.hollow, { kind: 'walk', after: 'floorE', dy: HOLLOW.down }),
    { key: 'step', shape: 'block', w: HOLLOW.stepW, h: HOLLOW.step, place: { kind: 'on', on: 'hollow', at: 0, h: HOLLOW.step }, style: 'moss_stone' },
    bank('bank', HOLLOW.bankW, { kind: 'over', on: 'hollow', at: 1, dy: -(HOLLOW.down + HOLLOW.bankUp) }, { main: true }),
    // (two steps down, so no drop is a whole fall: the route leaves the room level with where it came in)
    bank('mid', [200, 240], { kind: 'walk', after: 'bank', dy: Math.round(HOLLOW.bankUp / 2) }),
    bank('out', [240, 280], { kind: 'walk', after: 'mid', dy: HOLLOW.bankUp - Math.round(HOLLOW.bankUp / 2) }),
  ],
  entry: { piece: 'floorE', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  // (the dark over the hollow, floor E to the bough's far end: no lights of its own, the room's firefly is the light)
  sockets: [
    { id: 'darkFrom', role: 'prop', on: 'floorE', t: 0, allow: ['darkFrom'], easy: 'keep' },
    { id: 'darkTo', role: 'prop', on: 'bank', t: 1, allow: ['darkToBare'], easy: 'keep' },
  ],
  room: hollowRoomSpec,
  mirrorable: false,
};

// ───────────────────────────── 8-2: the leaf hammock ─────────────────────────────

const wa = along('floor', WATER.floorA);
const ww = along('well', WATER.well);
const wb = along('floor2', WATER.floorB);
const ws = along('shelf', WATER.shelfW);

export const hammockRoomSpec: LocalRoomSpec = {
  id: 'hammock',
  left: wa(0),
  right: wb(160),
  above: 490,
  below: WATER.dip + 20,
  pieces: [
    { kind: 'reset', id: 'post', at: wa(24) },
    { kind: 'lever', id: 'rope', at: wa(WATER.floorA - 18) },
    { kind: 'lift', id: 'hammock', at: ww(WATER.raftW / 2 + 4, -WATER.raftDy), w: WATER.raftW, rise: RAFT_RISE, by: 'rope' },
    { kind: 'source', id: 'pile', variant: 'stone', at: ws(46), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'plate' },
    { kind: 'plate', id: 'plate', at: ww(240) },
    { kind: 'gate', id: 'door', at: wb(120), open: { all: ['plate', { not: 'rope' }] }, h: WATER.doorH, look: 'woven' },
  ],
  exit: 'door',
  beyond: wb(230),
  ground: ['floor', 'well', 'floor2', 'shelf'],
  tips: {
    enter: "The hammock's rope holds that leaf door shut.", // (new, needs Matt's approval)
    hold: 'Seed stones up there! The plate is below.', // (new, needs Matt's approval)
    open: 'Hammock down, door open. Through!', // (new, needs Matt's approval)
  },
};

export const hammockRoom: SectionTemplate = {
  id: 'w8r-room-hammock',
  name: 'puzzle room: the leaf hammock (lever, stone, plate)',
  archetypes: ['harvest'],
  teaches: 'w8:hammock',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
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
  room: hammockRoomSpec,
  mirrorable: false,
};

/** Easy's hammock room: the same section, the door listens to the plate alone (two steps) */
export const hammockRoomSpecEasy: LocalRoomSpec = {
  ...hammockRoomSpec,
  pieces: hammockRoomSpec.pieces.map((p) => (p.kind === 'gate' ? { ...p, open: 'plate' } : p)),
  tips: { ...hammockRoomSpec.tips, enter: 'That leaf door needs a weight on its plate.' }, // (new, needs Matt's approval)
};
export const hammockRoomEasy: SectionTemplate = { ...hammockRoom, room: hammockRoomSpecEasy };

// ───────────────────────────── 8-5: the branch seesaw ─────────────────────────────

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
    { kind: 'source', id: 'pile', variant: 'stone', at: sf(130), look: 'pile' },
    { kind: 'item', id: 'stone1', variant: 'stone', source: 'pile', for: 'branch' },
    { kind: 'item', id: 'stone2', variant: 'stone', source: 'pile', for: 'branch' },
    { kind: 'seesaw', id: 'branch', at: { on: 'dip', at: 0.5, dy: -SEESAW.dip }, w: SEESAW.plank, rise: SEESAW.rise, rest: -1 },
  ],
  exit: 'branch',
  beyond: sb(120),
  ground: ['floor', 'dip'],
  tips: {
    enter: 'Too high. That branch tips, though.', // (new, needs Matt's approval)
    hold: 'One stone is not enough. Try two.', // (World 6's line, needs Matt's approval)
    open: 'It holds! Up the branch you go.', // (new, needs Matt's approval)
  },
};

export const seesawRoom: SectionTemplate = {
  id: 'w8r-room-seesaw',
  name: 'puzzle room: the branch seesaw (two stones)',
  archetypes: ['vine_runner'],
  teaches: 'w8:two-stones',
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  extraSeconds: 14,
  pieces: [
    bank('floor', SEESAW.floor, { kind: 'start' }),
    bank('dip', SEESAW.plank, { kind: 'walk', after: 'floor', dy: SEESAW.dip }),
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

/** World 8's puzzle-room sections */
export const W8_ROOM_SECTIONS: readonly SectionTemplate[] = [hollowRoom, hammockRoom, seesawRoom];

/** each room's stage (2-3 puzzle moments a world) */
export const W8R_STAGE: Record<string, string> = { [hollowRoom.id]: '8-1', [hammockRoom.id]: '8-2', [seesawRoom.id]: '8-5' };
export const W8_ROOM_STAGES = ['8-1', '8-2', '8-5'] as const;

/** the room sections of stage `stage`, Easy's version on Easy */
export function w8RoomsFor(stage: number, difficulty: Difficulty = 'normal'): SectionTemplate[] {
  return W8_ROOM_SECTIONS.filter((s) => W8R_STAGE[s.id] === `8-${stage}`).map((s) => (difficulty === 'easy' && s === hammockRoom ? hammockRoomEasy : s));
}
