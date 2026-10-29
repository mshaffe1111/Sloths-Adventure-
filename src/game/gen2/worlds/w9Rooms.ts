/**
 * gen2/worlds/w9Rooms — World 9's puzzle-room sections (DESIGN.md B9, B11; STAGE-RULES §3), built from the puzzle kit as it is
 * (puzzleKit.ts: no new piece). The Volcanic Jungle's (reference/STORY-REWRITE.md "World 9", Act III The Iron Road): cooled basalt,
 * the army's iron left along the road, and heat underfoot. The pieces are Matt's Gemini W9 puzzle sheet
 * (src/assets/w6to10/gemini/w9a-puzzle.webp/json): the basalt lever (the kit's lever), the hot plate whose cracks glow when it is
 * pressed (the plate) and the basalt column gate (the gate); the chain plank of the W9/W10 bridges sheet is the lift (w9RoomArt.ts).
 *
 *   w9r-room-bucket  9-3 "Ember Canopy". The army's chain lift: a plank hangs in a pit on the same chain as an iron bucket. Weigh the
 *                    bucket down and the plank rises to the high ledge. On Normal the bucket hangs high (a stone flicked up goes in),
 *                    and the stone has to go in from the plank, or the plank rises without him; Easy's hangs low, a set-down from the plank (World 4's
 *                    squirrel lift, in iron).
 *   w9r-room-plates  9-5 "Vent Riding". A basalt gate sealed until both hot plates by it are pressed at once; then it stays open
 *                    (latched). One plate is up on a basalt shelf too high to climb. So: a stone flicked up onto the shelf's plate,
 *                    then stand on the other. Easy: the shelf's plate alone opens it (one throw).
 *   w9r-room-lift    9-8 "Pell's Thread". The gate stands up on a high ledge and is held open by a plate down on the floor; the
 *                    plank by the lever rides up to the ledge. He can't hold the plate and ride: a stone holds it. So: a stone on the
 *                    plate, onto the plank, the lever, up and through. Easy: the gate stays open once the plate is pressed (latched).
 *
 * Dot's three tiers (the lead's rule, 2026-10-29: Dot is a guide, not a narrator): coming in she names the problem, never the answer
 * (`tips.enter`); after real struggle a nudge that points at the piece (`nudge`); the move itself only on Help (`move`). The nudge and
 * the move ride on the room's tips (`RoomTips.nudge` / `move`, polish-dot's fields) and are listed in W9R_TIERS for the lead's review.
 *
 * None has an enemy socket, none is mirrored (a room reads left to right), each is once a stage and only in its own (W9R_STAGE), and
 * the pipeline keeps a room's join quiet. None can be walked past unsolved: each way on is out of a double jump's reach from anything he
 * can stand on unaided (w9Rooms.test.ts). Nothing in a room can hurt him: every floor is ground (a dip is a hop out), no lava inside.
 */
import type { RoomTips } from '../../puzzleKit.ts';
import type { Difficulty, LocalRoomSpec, SectionPiece, SectionTemplate } from '../types.ts';

// ───────────────────────────── Dot's lines ─────────────────────────────

/** a room's three tiers: on entry the problem, after struggle a nudge at the piece, on Help the move; and the way-on line */
export interface Tiers {
  enter: string;
  nudge: string;
  move: string;
  open: string;
  /** Easy's move, where Easy's room differs */
  moveEasy?: string;
}

/** each room's lines (under 10 words; all new: the lead approves them, LEAD-PLAYBOOK "Dot and in-stage lines") */
export const W9R_TIERS: Record<'bucket' | 'plates' | 'lift', Tiers> = {
  bucket: {
    enter: "That ledge is way too high to jump.",
    nudge: 'The plank and the bucket share one chain.',
    move: 'Stand on the plank. Flick a stone in.',
    moveEasy: 'Stand on the plank. Drop a stone in.',
    open: 'There it goes! Hop on.',
  },
  plates: {
    enter: "Sealed tight. It won't budge for me.",
    nudge: 'Two hot plates. One is up on that shelf.',
    move: 'Flick a stone up there. Then stand on yours.',
    moveEasy: 'Flick a stone up onto the shelf plate.',
    open: 'Open! Through, quick.',
  },
  lift: {
    enter: "The gate's shut, and it's way up there.",
    nudge: "That plate holds it open. You can't stay.",
    move: 'Stone on the plate. Then ride the plank up.',
    moveEasy: 'Step on the plate once. Then ride up.',
    open: 'Gate open. Up you go!',
  },
};
/** every new line, for the lead's review */
export const W9R_NEW_LINES: readonly string[] = Object.values(W9R_TIERS).flatMap((t) => [t.enter, t.nudge, t.move, ...(t.moveEasy ? [t.moveEasy] : []), t.open]);

/** a room's tips: Dot's entry line and the way-on line, with the nudge and the move (polish-dot's RoomTips fields) */
const tipsOf = (t: Tiers, d: Difficulty): RoomTips => {
  const tiers: Record<string, string> = { nudge: t.nudge, move: d === 'easy' ? t.moveEasy ?? t.move : t.move };
  return { enter: t.enter, open: t.open, ...tiers };
};

// ───────────────────────────── helpers ─────────────────────────────

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a room piece's spot along a fixed-width floor, in px (the anchors are fractions of it: widths are settled first, STAGE-RULES §6) */
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });
/** the archetypes a room may sit in (its stage is W9R_STAGE's; the archetype only has to let it in) */
const ANY: SectionTemplate['archetypes'] = ['sprint', 'vine_runner', 'stealth', 'purge', 'relic_hunt', 'harvest', 'rescue'];

// ───────────────────────────── 9-3: the chain lift and its bucket ─────────────────────────────

/** the floor (post, pile, the bucket), the pit the plank hangs in, the high ledge; and the walk back down */
export const BUCKET = {
  floor: 330,
  /** the pit under the plank: a dip, so the plank's top is level with the floor at rest */
  pit: 100,
  dip: 60,
  /** the high ledge over the floor (out of a double jump's reach), and its width */
  rise: 260,
  top: 290,
  /** the stone pile, near the post */
  pile: 110,
  /** the bucket's spot (just short of the pit) and its mouth over the floor: Normal high (a flick up), Easy low (a set-down) */
  bucket: 290,
  mouthHigh: 236,
  mouthLow: 100,
} as const;

const bf = along('floor', BUCKET.floor);
const bp = along('pit', BUCKET.pit);
const bt = along('top', BUCKET.top);

const bucketSpec = (d: Difficulty): LocalRoomSpec => ({
  id: 'bucket',
  left: bf(0),
  right: bt(BUCKET.top),
  above: BUCKET.rise + 200,
  below: BUCKET.dip + 20,
  pieces: [
    { kind: 'reset', id: 'post', at: bf(24) },
    { kind: 'source', id: 'pile', variant: 'stone', at: bf(BUCKET.pile), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'bucket' },
    // (a stone weighs 2: it fills the bucket. Normal's hangs high, so the stone is flicked up into it, and from the plank, or the plank
    // goes up without him; Easy's hangs low, a set-down from the plank)
    { kind: 'basket', id: 'bucket', at: bf(BUCKET.bucket), mouth: d === 'easy' ? BUCKET.mouthLow : BUCKET.mouthHigh, need: 2, drop: 60 },
    { kind: 'lift', id: 'plank', at: bp(BUCKET.pit / 2, -BUCKET.dip), w: BUCKET.pit, rise: BUCKET.rise, by: 'bucket' },
  ],
  exit: 'plank',
  beyond: bt(BUCKET.top / 2),
  ground: ['floor', 'pit'],
  tips: tipsOf(W9R_TIERS.bucket, d),
});

const bucketRoomOf = (d: Difficulty): SectionTemplate => ({
  id: 'w9r-room-bucket',
  name: 'puzzle room: the chain lift (stones in the bucket)',
  archetypes: ANY,
  teaches: 'w9:bucket',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (a stone, onto the plank, flicked up into the bucket, the ride: about 12 s for a first-timer)
  extraSeconds: 12,
  pieces: [
    bank('floor', BUCKET.floor, { kind: 'start' }),
    bank('pit', BUCKET.pit, { kind: 'walk', after: 'floor', dy: BUCKET.dip }),
    // (the high ledge, a whole bank down to the ground past the pit: a wall beside a pit reaches the pit's floor)
    bank('top', BUCKET.top, { kind: 'over', on: 'pit', at: 1, dy: -(BUCKET.dip + BUCKET.rise) }, { main: true }),
    bank('out', [240, 300], { kind: 'walk', after: 'top', dy: BUCKET.rise }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: bucketSpec(d),
  mirrorable: false,
});
export const bucketRoom = bucketRoomOf('normal');
export const bucketRoomEasy = bucketRoomOf('easy');

// ───────────────────────────── 9-5: two hot plates ─────────────────────────────

/** the floor (post, pile, the shelf over it, plate A), floor B a knot up (the gate), and down again */
export const PLATES = {
  floor: 440,
  pile: 90,
  /** the basalt shelf over the floor (out of a double jump's reach), its near end and width; plate B on it */
  shelfX: 190,
  shelfW: 130,
  shelfUp: 230,
  /** plate A on the floor, past where a drop off the shelf would land */
  plateA: 380,
  floorB: 260,
  knot: 40,
  gate: 110,
} as const;

const pf = along('floor', PLATES.floor);
const ps = along('shelf', PLATES.shelfW);
const pb = along('floorB', PLATES.floorB);

const platesSpec = (d: Difficulty): LocalRoomSpec => ({
  id: 'plates',
  left: pf(0),
  right: pb(PLATES.gate + 60),
  above: PLATES.shelfUp + 200,
  below: 40,
  pieces: [
    { kind: 'reset', id: 'post', at: pf(24) },
    { kind: 'source', id: 'pile', variant: 'stone', at: pf(PLATES.pile), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'plateB' },
    { kind: 'plate', id: 'plateB', at: ps(PLATES.shelfW / 2) },
    { kind: 'plate', id: 'plateA', at: pf(PLATES.plateA) },
    // (both pressed at once, then it stays open; Easy: the shelf's plate alone)
    { kind: 'gate', id: 'gate', at: pb(PLATES.gate), open: d === 'easy' ? 'plateB' : { all: ['plateA', 'plateB'] }, latch: true },
  ],
  exit: 'gate',
  beyond: pb(PLATES.gate + 110),
  ground: ['floor', 'shelf'],
  tips: tipsOf(W9R_TIERS.plates, d),
});

const platesRoomOf = (d: Difficulty): SectionTemplate => ({
  id: 'w9r-room-plates',
  name: 'puzzle room: two hot plates (one up on the shelf)',
  archetypes: ANY,
  teaches: 'w9:plates',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (a stone, under the shelf, flicked up, onto the other plate, through: about 12 s for a first-timer)
  extraSeconds: 12,
  pieces: [
    bank('floor', PLATES.floor, { kind: 'start' }),
    { key: 'shelf', shape: 'branch', w: PLATES.shelfW, place: { kind: 'over', on: 'floor', at: PLATES.shelfX / PLATES.floor, dy: -PLATES.shelfUp }, main: false },
    bank('floorB', PLATES.floorB, { kind: 'walk', after: 'floor', dy: -PLATES.knot }),
    bank('out', [200, 240], { kind: 'walk', after: 'floorB', dy: PLATES.knot }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: platesSpec(d),
  mirrorable: false,
});
export const platesRoom = platesRoomOf('normal');
export const platesRoomEasy = platesRoomOf('easy');

// ───────────────────────────── 9-8: the plate that holds the gate ─────────────────────────────

/** the floor (post, pile, the plate, the lever), the pit the plank rides in, the high ledge with the gate; and the walk back down */
export const LIFT = {
  floor: 380,
  pile: 90,
  plate: 220,
  /** the lever at the floor's end, in reach from the plank */
  lever: 352,
  pit: 110,
  dip: 60,
  rise: 260,
  top: 230,
  gate: 120,
} as const;

const lf = along('floor', LIFT.floor);
const lp = along('pit', LIFT.pit);
const lt = along('top', LIFT.top);

const liftSpec = (d: Difficulty): LocalRoomSpec => ({
  id: 'lift',
  left: lf(0),
  right: lt(LIFT.top),
  above: LIFT.rise + 200,
  below: LIFT.dip + 20,
  pieces: [
    { kind: 'reset', id: 'post', at: lf(24) },
    { kind: 'source', id: 'pile', variant: 'stone', at: lf(LIFT.pile), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'plate' },
    { kind: 'plate', id: 'plate', at: lf(LIFT.plate) },
    { kind: 'lever', id: 'lever', at: lf(LIFT.lever) },
    { kind: 'lift', id: 'plank', at: lp(LIFT.pit / 2, -LIFT.dip), w: LIFT.pit, rise: LIFT.rise, by: 'lever' },
    // (open while the plate is pressed; Easy: once pressed, it stays open)
    { kind: 'gate', id: 'gate', at: lt(LIFT.gate), open: 'plate', ...(d === 'easy' ? { latch: true } : {}) },
  ],
  exit: 'gate',
  beyond: lt(LIFT.gate + 90),
  ground: ['floor', 'pit'],
  tips: tipsOf(W9R_TIERS.lift, d),
});

const liftRoomOf = (d: Difficulty): SectionTemplate => ({
  id: 'w9r-room-lift',
  name: 'puzzle room: the plate that holds the gate (a stone, the lever, the plank)',
  archetypes: ANY,
  teaches: 'w9:lift',
  phases: ['sho', 'ten'],
  difficulty: 6,
  maxPerStage: 1,
  weight: 40,
  // (a stone to the plate, onto the plank, the lever, the ride, through: about 14 s for a first-timer)
  extraSeconds: 14,
  pieces: [
    bank('floor', LIFT.floor, { kind: 'start' }),
    bank('pit', LIFT.pit, { kind: 'walk', after: 'floor', dy: LIFT.dip }),
    bank('top', LIFT.top, { kind: 'over', on: 'pit', at: 1, dy: -(LIFT.dip + LIFT.rise) }, { main: true }),
    bank('out', [240, 300], { kind: 'walk', after: 'top', dy: LIFT.rise }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: liftSpec(d),
  mirrorable: false,
});
export const liftRoom = liftRoomOf('normal');
export const liftRoomEasy = liftRoomOf('easy');

// ───────────────────────────── the set ─────────────────────────────

/** World 9's puzzle-room sections */
export const W9_ROOM_SECTIONS: readonly SectionTemplate[] = [bucketRoom, platesRoom, liftRoom];

/** each room's stage (STAGE-RULES §3: 2-3 puzzle moments a world): a stage's kit holds only its own (the World 9 builder may move them) */
export const W9R_STAGE: Record<string, string> = { [bucketRoom.id]: '9-3', [platesRoom.id]: '9-5', [liftRoom.id]: '9-8' };

/** Easy's version of each room (the same section id, so Easy lays Normal's plan) */
const EASY: Record<string, SectionTemplate> = { [bucketRoom.id]: bucketRoomEasy, [platesRoom.id]: platesRoomEasy, [liftRoom.id]: liftRoomEasy };
export const roomFor9 = (t: SectionTemplate, d: Difficulty): SectionTemplate => (d === 'easy' ? EASY[t.id] ?? t : t);

/** the room sections of stage `stage`, Easy's version on Easy */
export function w9RoomsFor(stage: number, difficulty: Difficulty = 'normal'): SectionTemplate[] {
  return W9_ROOM_SECTIONS.filter((s) => W9R_STAGE[s.id] === `9-${stage}`).map((s) => roomFor9(s, difficulty));
}
