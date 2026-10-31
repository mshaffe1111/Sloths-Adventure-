/**
 * gen2/worlds/w8Rooms — World 8's puzzle-room sections (DESIGN.md B9, B11; STAGE-RULES §3), built from the puzzle kit as it is
 * (puzzleKit.ts: no new piece). The story is the Twilight Treetops' (reference/STORY-REWRITE.md "World 8"): the light gone, the
 * fireflies out, Pokey's lantern, and the tree doors of the canopy. The pieces are Matt's Gemini W8 puzzle sheet
 * (reference/prop-sheets/gemini-batch-2026-10-28/w8a-puzzle.jpg, cut as src/assets/w6to10/gemini/w8a-puzzle.webp/json), drawn once the
 * art hook-up draws it: the branch-lever stump (the kit's lever: 'lever-up', 'lever-down'), the glow-mushroom pad (the plate:
 * 'plate-up', 'plate-down') and the bark door in its trunk (the gate: 'door-closed', 'door-open'). Between them the three rooms use every
 * cell of the sheet.
 *
 *   w8r-room-hammock  8-2 "Night Blooms" (World 6's water room's proven numbers: w6Rooms.ts). A leaf hammock hangs by the lever stump's
 *                     rope: pulled, it rises to a high fork where the seed stones lie; let go, it drops. The door past the dip opens with
 *                     a stone on its glow pad AND the hammock down (its rope runs through the door's latch). So: pull the lever, ride
 *                     up, take a stone, drop to the pad, climb out, let the lever go, through. Three steps on Normal; Easy's door listens
 *                     to the pad alone (two).
 *   w8r-room-pads     8-3 "Long Swings". A bark door opens only while both glow pads by it glow (both pressed: no latch). The pinecones
 *                     lie up on a high bough, too high to jump; the branch steps up to it show only in Pokey's lantern (the kit's `glow`
 *                     and `ledge`, World 6's dark-room numbers). He is one weight on one pad: a pinecone on one pad and himself on the
 *                     other opens the door only while he stands there. So: up the steps, a pinecone down to the first pad, up again, a
 *                     second to the other, through. Three steps on Normal; Easy's door listens to one pad (two steps).
 *   w8r-room-moon     8-5 "Next Branch". A bark door that opens for a moonflower: its bud hangs high over a stump, out of the reach of any
 *                     light lying on the floor (Pokey's lantern is not a light for it: the room has no glow). The glowcaps grow by the
 *                     door. Carry one to the stump's foot and flick it up onto the stump: its light reaches the bud, the moonflower
 *                     opens, the door opens (3-2's high glow room, World 3's carried light, in the kit's own pieces). Easy: the bud hangs
 *                     lower on its stem, so a glowcap set down by the stump is enough (two steps).
 *
 * (The swing builder's rooms replaced the main build's 8-1 dark hollow and 8-5 branch seesaw, 2026-10-29: those were World 6's 6-6 and
 * 6-3 rooms again, and STAGE-RULES §3 asks 2-3 puzzle moments a world. The dark is taught by 8-1's dark stretches.)
 *
 * None has an enemy socket, none is mirrored (a room reads left to right), each is once a stage and only in its own (W8R_STAGE), and the
 * pipeline keeps a room's join quiet. None can be walked past unsolved: each door stands on its floor and the trunk over it is out of a
 * double jump's reach from anything he can stand on unaided. Nothing in any room can hurt him (every floor is ground; a miss is a hop
 * back down). The pads and moon rooms lay their own dark (World 6's dark props, w6Swing.ts, registered by w8.ts: no fireflies, the
 * room's own lights: the lantern's glow, the glowcap, the open moonflower), after the stage's first dark stretch has taught it.
 */
import type { Difficulty, LocalRoomSpec, SectionPiece, SectionTemplate } from '../types.ts';
import { W8_LESSON } from './w8.ts';
import { RAFT_RISE, WATER } from './w6Rooms.ts';

/**
 * The rooms' lines (under 10 words). All new: each needs Matt's approval before it ships (STAGE-RULES §1 "Story"). Dot is a guide, not a
 * narrator (the lead's review, 2026-10-29): coming in she only notices the door is shut, and with a thing in his hands she only remarks
 * on it; nothing names the next step (the hints, asked for, come later and in steps).
 *   hammock  the door shut; a stone in his hands; the door open
 *   pads     the door shut; a pinecone in his hands; the door open
 *   moon     the door shut; a glowcap in his hands; the moonflower open
 */
export const W8R_NEW_LINES: readonly string[] = [
  'Shut tight.',
  'A seed stone. Heavy!',
  'Hammock down, door open. Through!',
  "That door won't budge.",
  'Got a pinecone.',
  'Both pads glowing. Through, quick!',
  'Hm. Shut.',
  'Ooh, it glows.',
  'It opened! And so did the door.',
];

/** the rooms' hints, asked for (Matt: only when asked, in steps, never the answer; under 10 words). New lines: each needs his approval */
export const W8R_ROOM_HINTS: Record<string, readonly [string, string]> = {
  hammock: ['What does the lever lift?', 'The door hates a raised hammock.'],
  pads: ['Your lantern finds the way up.', 'You can only stand on one pad.'],
  moon: ['Your lantern is not the right light.', 'A flick up throws what you carry.'],
};

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a room piece's spot along a fixed-width floor, in px (the anchors are fractions of it: widths are settled first, STAGE-RULES §6) */
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });
/** a room's own dark, its two ends on its first and last pieces (World 6's dark props, w6Swing.ts, with no fireflies: the room's own lights) */
const roomDark = (from: string, to: string): SectionTemplate['sockets'] => [
  { id: 'darkFrom', role: 'prop', on: from, t: 0, allow: ['darkFrom'], easy: 'keep' },
  { id: 'darkTo', role: 'prop', on: to, t: 1, allow: ['darkToBare'], easy: 'keep' },
];

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
    enter: 'Shut tight.', // (new, needs Matt's approval)
    hold: 'A seed stone. Heavy!', // (new, needs Matt's approval)
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
  tips: hammockRoomSpec.tips,
};
export const hammockRoomEasy: SectionTemplate = { ...hammockRoom, room: hammockRoomSpecEasy };

// ───────────────────────────── 8-3: two glow pads ─────────────────────────────

/** the floor (post, the lantern steps, the pads), the high bough over it (the pinecones), floor B a knot up (the bark door) */
export const PADS = {
  floor: 610,
  /** the lantern steps up to the bough (World 6's dark room: 70-80 px up and 130 across each, 100 wide) */
  stepA: { x: 100, up: 80 },
  stepB: { x: 225, up: 155 },
  stepW: 100,
  /** the bough: its near end, its width, its top over the floor (out of a double jump's reach) */
  boughX: 290,
  boughW: 130,
  boughUp: 230,
  /** the two glow pads (their middles), past where a drop off the bough lands */
  padA: 465,
  padB: 557,
  /** floor B, a knot up past the floor; the bark door on it, its trunk's whole height (out of a double jump from the bough) */
  floorB: 300,
  knot: 40,
  door: 100,
  doorH: 470,
  /** the lantern's reach (World 6's firefly: 170) */
  glow: 170,
} as const;

const pf = along('floor', PADS.floor);
const pb = along('floorB', PADS.floorB);
const pt = along('bough', PADS.boughW);

export const padsRoomSpec: LocalRoomSpec = {
  id: 'pads',
  left: pf(0),
  right: pb(PADS.door + 60),
  above: 330,
  below: 40,
  pieces: [
    { kind: 'reset', id: 'post', at: pf(24) },
    // (Pokey's lantern: the branch steps show only in its light)
    { kind: 'glow', id: 'lantern', r: PADS.glow },
    { kind: 'ledge', id: 'stepA', at: pf(PADS.stepA.x, -PADS.stepA.up), w: PADS.stepW },
    { kind: 'ledge', id: 'stepB', at: pf(PADS.stepB.x, -PADS.stepB.up), w: PADS.stepW },
    // (the pinecones on the bough: a pile, so a dropped one comes back)
    { kind: 'source', id: 'pile', variant: 'pinecone', at: pt(50), look: 'pile' },
    { kind: 'item', id: 'cone1', variant: 'pinecone', source: 'pile', for: 'padA' },
    { kind: 'item', id: 'cone2', variant: 'pinecone', source: 'pile', for: 'padB' },
    { kind: 'plate', id: 'padA', at: pf(PADS.padA) },
    { kind: 'plate', id: 'padB', at: pf(PADS.padB) },
    // (open only while both pads are pressed: standing on one himself, it shuts as he steps off)
    { kind: 'gate', id: 'door', at: pb(PADS.door), open: { all: ['padA', 'padB'] }, h: PADS.doorH, look: 'roots' },
  ],
  exit: 'door',
  beyond: pb(PADS.door + 110),
  ground: ['floor', 'bough'],
  tips: {
    enter: "That door won't budge.", // (new, needs Matt's approval)
    hold: 'Got a pinecone.', // (new, needs Matt's approval)
    open: 'Both pads glowing. Through, quick!', // (new, needs Matt's approval)
  },
};

export const padsRoom: SectionTemplate = {
  id: 'w8r-room-pads',
  name: 'puzzle room: two glow pads (the bark door)',
  archetypes: ['vine_runner'],
  teaches: 'w8:pads',
  // (its dark comes after the stage's first dark stretch, whose tip teaches the dark)
  uses: [W8_LESSON.dark],
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (up the lantern steps, a pinecone down, up again, the second, through: about 18 s for a first-timer)
  extraSeconds: 18,
  pieces: [
    bank('floor', PADS.floor, { kind: 'start' }),
    { key: 'bough', shape: 'branch', w: PADS.boughW, place: { kind: 'over', on: 'floor', at: PADS.boughX / PADS.floor, dy: -PADS.boughUp }, main: false },
    bank('floorB', PADS.floorB, { kind: 'walk', after: 'floor', dy: -PADS.knot }),
    // (and down again past the door, level with where the room began)
    bank('out', [200, 240], { kind: 'walk', after: 'floorB', dy: PADS.knot }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: roomDark('floor', 'floorB'),
  room: padsRoomSpec,
  mirrorable: false,
};

/**
 * Easy's pads room (1-2 step puzzles on Easy, STAGE-RULES §1): the same section, the same pieces in the same places, but the bark door
 * listens to the first pad alone. Two steps: up the lantern steps, a pinecone down to the pad. The section id is the same, so Easy lays
 * Normal's plan.
 */
export const padsRoomSpecEasy: LocalRoomSpec = {
  ...padsRoomSpec,
  pieces: padsRoomSpec.pieces.map((p) => (p.kind === 'gate' ? { ...p, open: 'padA' } : p)),
  tips: padsRoomSpec.tips,
};
export const padsRoomEasy: SectionTemplate = { ...padsRoom, room: padsRoomSpecEasy };

// ───────────────────────────── 8-5: the moonflower door ─────────────────────────────

/** the floor (post, the glowcap patch, the stump, the bough with the bud over it), floor B a knot up (the bark door) */
export const MOON = {
  floor: 600,
  /** the glowcap patch (near the post) */
  patch: 90,
  /** the stump: a block a hop high, its near end and width (a glowcap flicked up from its foot lands on its top) */
  stumpX: 330,
  stumpW: 150,
  stumpUp: 110,
  /** the bough over the stump, its near end, width and top over the floor; the bud on it */
  boughX: 340,
  boughW: 140,
  boughUp: 290,
  bud: 30,
  /** Easy: the bud hangs this far down from the bough on its stem (a glowcap on the floor under it reaches it) */
  hangEasy: 110,
  /** floor B, a knot up; the bark door on it, its trunk's whole height */
  floorB: 300,
  knot: 40,
  door: 120,
  doorH: 470,
  /** the moonflower's light, open */
  moonR: 700,
} as const;

const mf = along('floor', MOON.floor);
const mb = along('floorB', MOON.floorB);
const mt = along('bough', MOON.boughW);

export const moonRoomSpec: LocalRoomSpec = {
  id: 'moon',
  left: mf(0),
  right: mb(MOON.door + 60),
  above: 400,
  below: 40,
  pieces: [
    { kind: 'reset', id: 'post', at: mf(24) },
    // (the glowcaps: a patch, so a lost one grows back)
    { kind: 'source', id: 'patch', variant: 'mushroom', at: mf(MOON.patch), look: 'pile' },
    { kind: 'item', id: 'cap', variant: 'mushroom', source: 'patch', for: 'moon' },
    // (the bud on the high bough: out of any light lying on the floor, in the light of a glowcap on the stump)
    { kind: 'moonflower', id: 'moon', at: mt(MOON.bud), r: MOON.moonR },
    { kind: 'gate', id: 'door', at: mb(MOON.door), open: 'moon', h: MOON.doorH, look: 'roots' },
  ],
  exit: 'door',
  beyond: mb(MOON.door + 110),
  ground: ['floor', 'stump'],
  tips: {
    enter: 'Hm. Shut.', // (new, needs Matt's approval)
    hold: 'Ooh, it glows.', // (new, needs Matt's approval)
    open: 'It opened! And so did the door.', // (new, needs Matt's approval)
  },
};

export const moonRoom: SectionTemplate = {
  id: 'w8r-room-moon',
  name: 'puzzle room: the moonflower door (a glowcap thrown up)',
  archetypes: ['vine_runner'],
  teaches: 'w8:moonflower',
  uses: [W8_LESSON.dark],
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (a glowcap, carried to the stump, flicked up, the bud opens, through: about 12 s for a first-timer)
  extraSeconds: 12,
  pieces: [
    bank('floor', MOON.floor, { kind: 'start' }),
    // (a trunk stump: drawn as the world's own boughs, its trunk down to their feet)
    { key: 'stump', shape: 'bank', w: MOON.stumpW, h: MOON.stumpUp, place: { kind: 'on', on: 'floor', at: MOON.stumpX / (MOON.floor - MOON.stumpW), h: MOON.stumpUp } },
    { key: 'bough', shape: 'branch', w: MOON.boughW, place: { kind: 'over', on: 'floor', at: MOON.boughX / MOON.floor, dy: -MOON.boughUp }, main: false },
    bank('floorB', MOON.floorB, { kind: 'walk', after: 'floor', dy: -MOON.knot }),
    bank('out', [200, 240], { kind: 'walk', after: 'floorB', dy: MOON.knot }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: roomDark('floor', 'floorB'),
  room: moonRoomSpec,
  mirrorable: false,
};

/** Easy's moonflower room: the same section and pieces; the bud hangs lower on its stem, so a glowcap set down under it opens it (two steps) */
export const moonRoomSpecEasy: LocalRoomSpec = {
  ...moonRoomSpec,
  pieces: moonRoomSpec.pieces.map((p) => (p.kind === 'moonflower' ? { ...p, at: { ...p.at, dy: MOON.hangEasy } } : p)),
};
export const moonRoomEasy: SectionTemplate = { ...moonRoom, room: moonRoomSpecEasy };

// ───────────────────────────── 8-1: the roost loft ─────────────────────────────

/**
 * w8r-room-loft  8-1 "As the Light Goes" (2026-10-31, Matt: "Let's give World 8 a puzzle room"; 8-1's own theme, not on every roll). A bark
 *                door, and its branch lever up on the roost loft, a bough too high for any jump. The way up is a vine ladder rolled up under
 *                the loft and tied with a silk knot. So: take a pebble from the pile, flick it up at the knot (it snaps, the ladder unrolls),
 *                climb, pull the lever, drop down, through. Three steps on Normal (a throw, a climb, a lever); Easy's door opens when the
 *                knot snaps (two: the ladder still unrolls, the lever is not needed). The kit's knot and ladder (meecaStage.ts's room 3) with
 *                World 8's lever and door, a puzzle of its own: what holds the ladder up, and what is the ladder for.
 */
/** 8-1's loft theme (w8Sections.ts W8_THEME.loft: the same key) */
export const LOFT_THEME = 'w8:loft';
export const LOFT = {
  floor: 660,
  /** the loft: a bough over the floor, its left end at `x`, `up` px over the floor (DOUBLE_RISE ~185 + the hero: out of any jump's reach) */
  x: 60,
  w: 200,
  up: 250,
  /** the vine ladder down the loft's right end (just past it, as meecaStage's hangs before its cliff) */
  ladderX: 274,
  /** the knot: just past the loft's end, by the rolled ladder, high over the floor (a flick up from under it reaches it; under the loft
   *  itself the bough would stop the pebble) */
  knotX: 282,
  knotUp: 238,
  /** the seed pods' pile, under the loft (he carries a pod right to the knot and throws it the way he walks), and the door: the room is
   *  compact so the pile, the knot and the door share one view, upright too (the lead's phone check, 2026-10-31) */
  pileX: 190,
  doorX: 520,
  /** the door's wall: taller than the loft, so nothing jumps it from up there */
  doorH: 380,
  floorB: 220,
} as const;
const la = along('floor', LOFT.floor);
const lb = along('floorB', LOFT.floorB);
const ll = along('loft', LOFT.w);

export const loftRoomSpec: LocalRoomSpec = {
  id: 'loft',
  left: la(0),
  right: lb(100),
  above: 470,
  below: 90,
  pieces: [
    { kind: 'reset', id: 'post', at: la(24) },
    { kind: 'source', id: 'pile', variant: 'pebble', at: la(LOFT.pileX), look: 'pile' },
    { kind: 'item', id: 'pebble', variant: 'pebble', source: 'pile', for: 'knot' },
    { kind: 'knot', id: 'knot', at: la(LOFT.knotX, -LOFT.knotUp) },
    { kind: 'ladder', id: 'ladder', at: ll(LOFT.w), vine: 'ladderV', open: 'knot' },
    { kind: 'lever', id: 'lever', at: ll(LOFT.w * 0.55) },
    { kind: 'gate', id: 'door', at: la(LOFT.doorX), open: 'lever', latch: true, h: LOFT.doorH, look: 'woven' },
  ],
  exit: 'door',
  beyond: lb(180),
  ground: ['floor', 'floorB', 'loft'],
  tips: {
    enter: 'Locked. And something tied up there.', // (new, needs Matt's approval)
    hold: 'A pebble. Good for throwing.', // (new, needs Matt's approval)
    open: 'Door open. Down and through!', // (new, needs Matt's approval)
  },
};

export const loftRoom: SectionTemplate = {
  id: 'w8r-room-loft',
  name: 'puzzle room: the roost loft (knot, ladder, lever)',
  archetypes: 'any',
  teaches: 'w8:loft-room',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (a pebble, a throw or two, the climb, the lever, back down and through: about 16 s for a first-timer)
  extraSeconds: 16,
  pieces: [
    bank('floor', LOFT.floor, { kind: 'start' }),
    { key: 'loft', shape: 'branch', style: 'roost_branch', w: LOFT.w, place: { kind: 'over', on: 'floor', at: LOFT.x / LOFT.floor, dy: -LOFT.up }, main: false },
    { key: 'ladderV', shape: 'vine', w: 0, place: { kind: 'climb', on: 'floor', at: LOFT.ladderX / LOFT.floor, h: LOFT.up + 6 } },
    bank('floorB', LOFT.floorB, { kind: 'walk', after: 'floor', dy: 0 }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'floorB', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: loftRoomSpec,
  mirrorable: false,
};

/** Easy's loft: the door opens when the knot snaps (two steps; the ladder still unrolls) */
export const loftRoomSpecEasy: LocalRoomSpec = { ...loftRoomSpec, pieces: loftRoomSpec.pieces.map((p) => (p.kind === 'gate' ? { ...p, open: 'knot' } : p)) };
export const loftRoomEasy: SectionTemplate = { ...loftRoom, room: loftRoomSpecEasy };

// ───────────────────────────── the set ─────────────────────────────

/** World 8's puzzle-room sections */
export const W8_ROOM_SECTIONS: readonly SectionTemplate[] = [hammockRoom, padsRoom, moonRoom];

/** each room's stage (STAGE-RULES §3: 2-3 puzzle moments a world): a stage's kit holds only its own */
export const W8R_STAGE: Record<string, string> = { [hammockRoom.id]: '8-2', [padsRoom.id]: '8-3', [moonRoom.id]: '8-5' };
export const W8_ROOM_STAGES = ['8-2', '8-3', '8-5'] as const;

/** Easy's version of each room (the same section id, so Easy lays Normal's plan) */
const EASY: Record<string, SectionTemplate> = { [hammockRoom.id]: hammockRoomEasy, [padsRoom.id]: padsRoomEasy, [moonRoom.id]: moonRoomEasy, [loftRoom.id]: loftRoomEasy };
export const roomFor = (t: SectionTemplate, d: Difficulty): SectionTemplate => (d === 'easy' ? EASY[t.id] ?? t : t);

/** the room sections of stage `stage`, Easy's version on Easy */
export function w8RoomsFor(stage: number, difficulty: Difficulty = 'normal'): SectionTemplate[] {
  // (8-1's roost loft is its own theme's, not on every roll: w8Sections.ts W8_THEME.loft)
  const own = stage === 1 ? [{ ...roomFor(loftRoom, difficulty), uses: [LOFT_THEME] }] : [];
  return [...W8_ROOM_SECTIONS.filter((s) => W8R_STAGE[s.id] === `8-${stage}`).map((s) => roomFor(s, difficulty)), ...own];
}
