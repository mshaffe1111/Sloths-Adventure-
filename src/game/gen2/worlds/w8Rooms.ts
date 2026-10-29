/**
 * gen2/worlds/w8Rooms — World 8's puzzle-room sections (DESIGN.md B9, B11; STAGE-RULES §3), built from the puzzle kit as it is
 * (puzzleKit.ts: no new piece). The story is the Twilight Treetops' (reference/STORY-REWRITE.md "World 8"): the light gone, the
 * fireflies out, Pokey's lantern, and the tree doors of the canopy. The pieces are Matt's Gemini W8 puzzle sheet
 * (reference/prop-sheets/gemini-batch-2026-10-28/w8a-puzzle.jpg, cut as src/assets/w6to10/gemini/w8a-puzzle.webp/json): the
 * glow-mushroom pad (the kit's plate: 'plate-up', 'plate-down'), the bark door in its trunk (the gate: 'door-closed', 'door-open') and the
 * branch-lever stump (the lever: 'lever-up', 'lever-down', for a later room).
 *
 *   w8r-room-pads   8-3 "Long Swings". A bark door in a trunk opens only while both glow pads by it glow (both pressed: no latch).
 *                   The pinecones lie up on a high bough, too high to jump; the branch steps up to it show only in Pokey's lantern
 *                   (the kit's `glow` and `ledge`, World 6's dark-room numbers). He is one weight on one pad: a pinecone on one pad and
 *                   himself on the other opens the door only while he stands there. So: up the steps, a pinecone down to the first
 *                   pad, up again, a second to the other pad, through. Three steps on Normal; Easy's door listens to one pad (two
 *                   steps: padsRoomEasy).
 *   w8r-room-moon   8-5 "Next Branch". A bark door that opens for a moonflower: its bud hangs high over a stump, out of the reach of
 *                   any light lying on the floor (Pokey's lantern is not a light for it: the room has no glow). The glowcaps grow by
 *                   the door. Carry one to the stump's foot and flick it up onto the stump: its light reaches the bud, the moonflower
 *                   opens, the door opens (the high glow room of 3-2, World 3's carried light, in the kit's own pieces). Easy: the
 *                   bud hangs lower on its stem, so a glowcap set down under it is enough (two steps: moonRoomEasy).
 *
 * None has an enemy socket, none is mirrored (a room reads left to right), each is once a stage (and only in its own stage: W8R_STAGE),
 * and the pipeline keeps a room's join quiet (no pit beside it). None can be walked past unsolved: each bark door stands on its floor and
 * its trunk over it is out of a double jump's reach from anything he can stand on unaided. Nothing in either room can hurt him (every
 * floor is ground; a miss is a hop back down). Each room lays its own dark (W8S_PROP darkFrom / darkToBare, w8Swing.ts: no fireflies,
 * the room's own lights: the lantern's glow, the glowcap, the open moonflower), so a kit holds w8Swing's props: withW8Swing.
 * Dot's lines are new: each needs Matt's approval.
 */
import type { Difficulty, LocalRoomSpec, SectionPiece, SectionTemplate, WorldKit } from '../types.ts';

// ───────────────────────────── Dot's lines ─────────────────────────────

/**
 * The rooms' lines (under 10 words). All new: each needs Matt's approval before it ships (STAGE-RULES §1 "Story").
 *   pads   the door, explained as he comes in (Normal, Easy); a pinecone in his hands; the door open
 *   moon   the door, explained as he comes in; a glowcap in his hands; the moonflower open
 */
export const W8R_NEW_LINES: readonly string[] = [
  'That bark door needs both glow pads glowing.',
  'That bark door needs its glow pad pressed.',
  "Pinecones! Heavy enough for a pad, I bet.",
  'Both pads glowing. Through, quick!',
  'That door only opens for a moonflower.',
  'Glowcaps glow. Moonflowers love a glow.',
  'It opened! And so did the door.',
];

/** the rooms' hints, asked for (Matt: only when asked, in steps, never the answer; under 10 words). New lines: each needs his approval */
export const W8R_ROOM_HINTS: Record<string, readonly [string, string]> = {
  pads: ['Your lantern finds the way up.', 'You can only stand on one pad.'],
  moon: ['Your lantern is not the right light.', 'A flick up throws what you carry.'],
};

// ───────────────────────────── helpers ─────────────────────────────

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a room piece's spot along a fixed-width floor, in px (the anchors are fractions of it: widths are settled first, STAGE-RULES §6) */
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });
/** a room's own dark, its two ends on its first and last pieces (w8Swing.ts's props, with no fireflies: the room's own lights) */
const roomDark = (from: string, to: string): SectionTemplate['sockets'] => [
  { id: 'darkFrom', role: 'prop', on: from, t: 0, allow: ['w8sDarkFrom'], easy: 'keep' },
  { id: 'darkTo', role: 'prop', on: to, t: 1, allow: ['w8sDarkToBare'], easy: 'keep' },
];

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
  above: 520,
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
    enter: 'That bark door needs both glow pads glowing.', // (new, needs Matt's approval)
    hold: "Pinecones! Heavy enough for a pad, I bet.", // (new, needs Matt's approval)
    open: 'Both pads glowing. Through, quick!', // (new, needs Matt's approval)
  },
};

export const padsRoom: SectionTemplate = {
  id: 'w8r-room-pads',
  name: 'puzzle room: two glow pads (the bark door)',
  archetypes: ['vine_runner'],
  teaches: 'w8:pads',
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
  tips: { ...padsRoomSpec.tips, enter: 'That bark door needs its glow pad pressed.' }, // (new, needs Matt's approval)
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
  above: 560,
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
    enter: 'That door only opens for a moonflower.', // (new, needs Matt's approval)
    hold: 'Glowcaps glow. Moonflowers love a glow.', // (new, needs Matt's approval)
    open: 'It opened! And so did the door.', // (new, needs Matt's approval)
  },
};

export const moonRoom: SectionTemplate = {
  id: 'w8r-room-moon',
  name: 'puzzle room: the moonflower door (a glowcap thrown up)',
  archetypes: ['vine_runner'],
  teaches: 'w8:moonflower',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (a glowcap, carried to the stump, flicked up, the bud opens, through: about 12 s for a first-timer)
  extraSeconds: 12,
  pieces: [
    bank('floor', MOON.floor, { kind: 'start' }),
    { key: 'stump', shape: 'block', w: MOON.stumpW, h: MOON.stumpUp, place: { kind: 'on', on: 'floor', at: MOON.stumpX / (MOON.floor - MOON.stumpW), h: MOON.stumpUp }, style: 'moss_stone' },
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

// ───────────────────────────── the set ─────────────────────────────

/** World 8's puzzle-room sections */
export const W8_ROOM_SECTIONS: readonly SectionTemplate[] = [padsRoom, moonRoom];

/** each room's stage (STAGE-RULES §3: 2-3 puzzle moments a world): a stage's kit holds only its own */
export const W8R_STAGE: Record<string, string> = { [padsRoom.id]: '8-3', [moonRoom.id]: '8-5' };

/** Easy's version of a room (the same section id, so the plan is shared) */
const EASY: Record<string, SectionTemplate> = { [padsRoom.id]: padsRoomEasy, [moonRoom.id]: moonRoomEasy };
export const roomFor = (t: SectionTemplate, d: Difficulty): SectionTemplate => (d === 'easy' ? EASY[t.id] ?? t : t);

/**
 * A World 8 kit for stage `stage` (8-3: 3) with that stage's room joined, none for a stage with no room, Easy's version of a room on
 * Easy. The world's own manifest (w8.ts) stays as it is: w8Game.ts folds the lists together and sets `required` (W8_REQUIRED).
 */
export function withW8Rooms(kit: WorldKit, stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  const mine = W8_ROOM_SECTIONS.filter((s) => W8R_STAGE[s.id] === `8-${stage}` && !have.has(s.id)).map((s) => roomFor(s, difficulty));
  return { ...kit, manifest: { ...M, sections: [...M.sections, ...mine] } };
}

/** each stage's room on every roll (WorldManifest.required, DESIGN.md B11 "Required sections"), for w8Game.ts */
export const W8_REQUIRED: Record<string, Array<{ section: string }>> = Object.fromEntries(W8_ROOM_SECTIONS.map((s) => [W8R_STAGE[s.id], [{ section: s.id }]]));
