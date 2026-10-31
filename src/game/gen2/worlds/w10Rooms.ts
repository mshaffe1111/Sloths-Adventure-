/**
 * gen2/worlds/w10Rooms — World 10's puzzle-room sections (DESIGN.md B9, B11; STAGE-RULES §3), built from the puzzle kit as it is
 * (puzzleKit.ts: no new piece). The Stormy Highlands Fortress (reference/STORY-REWRITE.md "World 10"): iron, rain, portcullises, the
 * fallen rubble of the walls. The pieces are World 10's own painted sheet (src/assets/w6to10/props-made/w10a.webp: the iron lever on its
 * block, the stone pressure plate, the portcullis down and up), drawn by w10PuzzleArt.ts; the kit's own art stands in until it loads.
 *
 *   w10r-room-hoist  10-1 "The Door Made for Him". A hoist up the rampart: a plank in a pit by the wall, a basket hung high over it on the
 *                    hoist's rope. A stone thrown up into the basket (from the plank: a flick up throws up) weighs the plank up to the wall
 *                    walk, too high to jump. On Normal the rubble lies in a guard alcove behind a portcullis, and the iron lever by it
 *                    raises it: lever, stone, throw. Easy (1-2 steps): no alcove, and the basket hangs low enough to drop a stone in from
 *                    the plank (World 1's knot pulley, whose numbers the kit's real-engine tests prove).
 *   w10r-room-beam   10-3 "Thunder". A beam on a pivot in a dip before a wall too high to jump (World 6's root seesaw's proven numbers): at
 *                    rest its near end lies down and its far end stands a step from the wall's top, but his own weight on the far end tips
 *                    it down. One stone is too light to hold it (2 against his 3); two are enough. Easy the same (two carries: two steps).
 *   w10r-room-gate   10-7 "The Walls". A portcullis that opens only with a stone on its plate AND the iron lever pulled; the lever stands up
 *                    on a crate stack (a hop to the crate, a hop to the scaffold), the plate on the floor, so the two halves of the answer
 *                    are in different places and the portcullis between shows which way. Easy: the lever alone (a hop up, a pull).
 *
 * World 10 is the climb Pokey makes alone (Dot goes ahead along the netting in the world's first scene: wayside.ts dotPresent). So every
 * room line is his own thought, short and flat (reference/VOICE.md: scared, he holds on and the lines go shorter; he never says the
 * answer). On entry a line only names the problem; carrying, it remarks on the thing; open, it is done.
 *
 * None has an enemy socket, none is mirrored (a room reads left to right), each is once a stage and only in its own stage (W10R_STAGE),
 * and none can be walked past unsolved: the hoist's and the beam's walls are out of a double jump's reach from anything he can stand on
 * unaided, and the gate's portcullis stands on its floor with the kit's wall over it. Nothing in any room can hurt him (every floor is
 * ground; a miss is a hop back down), and every carry path is a walk (a step down at most; no jump while carrying: STAGE-RULES §1).
 */
import type { Difficulty, LocalRoomSpec, SectionPiece, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';

/**
 * Pokey's room lines (under 10 words). Approved by the lead, 2026-10-29 (LEAD-PLAYBOOK "Dot and in-stage lines").
 */
export const W10R_TIPS = {
  hoistEnter: 'Too high to climb. In this rain, too.',
  hoistEnterNormal: "Too high. And the rubble's locked away.",
  hoistHold: 'Heavy. Good.',
  hoistOpen: "Going up. I won't look down.",
  beamEnter: "That wall's taller than me. Most things are.",
  beamHold: "A stone. That'll do.",
  beamOpen: 'It holds. Up I go, then.',
  gateEnter: 'Shut. Locks on everything here.',
  gateHold: 'Rubble. Part of a wall, once.',
  gateOpen: 'Open. Through, before it changes its mind.',
} as const;
export const W10R_NEW_LINES: readonly string[] = Object.values(W10R_TIPS);

/** the rooms' hints, asked for (Matt: only when asked, in steps, never the answer; under 10 words). New lines: the lead approves them */
export const W10R_ROOM_HINTS: Record<string, readonly [string, string]> = {
  hoist: ['The cage pulls the grate up.', 'A flick up throws what I hold.'],
  beam: ['Which end goes down when I stand there?', "I'm heavier than one stone."],
  gate: ['That gate wants two things.', 'Something up on those crates.'],
};

// ───────────────────────────── helpers ─────────────────────────────

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a room piece's spot along a fixed-width floor, in px (the anchors are fractions of it: widths are settled first, STAGE-RULES §6) */
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });

// ───────────────────────────── 10-1: the hoist ─────────────────────────────

/** the floor (post, lever, alcove portcullis, rubble, basket), the hoist pit (the plank), the wall walk, the walk back down */
export const HOIST = {
  floor: 420,
  /** the plank's pit: its floor under the floor, and its width (World 1's knot pulley: 60 down, 100 wide) */
  pit: 100,
  dip: 60,
  /** the wall walk over the floor (out of a double jump's reach), its width */
  rise: 260,
  wall: 240,
  /** the alcove: the lever, its portcullis and the rubble behind it (Normal) */
  lever: 95,
  door: 180,
  doorH: 450,
  pile: 290,
  /** the basket over the pit's near lip: its mouth over the floor and how far its rope lets it drop. High (Normal: thrown up into, World
   *  1's high basket) or low (Easy: dropped in from the plank) */
  basketHigh: { mouth: 236, drop: 130 },
  basketLow: { mouth: 100, drop: 60 },
} as const;

const hf = along('floor', HOIST.floor);
const hw = along('wall', HOIST.wall);

const hoistSpec = (d: Difficulty): LocalRoomSpec => {
  const basket = d === 'easy' ? HOIST.basketLow : HOIST.basketHigh;
  return {
    id: 'hoist',
    left: hf(0),
    right: hw(200),
    above: 500,
    below: HOIST.dip + 30,
    pieces: [
      { kind: 'reset', id: 'post', at: hf(24) },
      // (Normal: the rubble in the guard alcove, behind the portcullis the lever raises)
      ...(d === 'easy' ? [] : [
        { kind: 'lever' as const, id: 'lever', at: hf(HOIST.lever) },
        { kind: 'gate' as const, id: 'alcove', at: hf(HOIST.door), open: 'lever', h: HOIST.doorH },
      ]),
      // (fallen rubble: a pile, so a dropped stone comes back)
      { kind: 'source', id: 'pile', variant: 'stone', at: hf(HOIST.pile), look: 'pile' },
      // (a stone weighs 2: alone it fills the basket)
      { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'basket' },
      { kind: 'basket', id: 'basket', at: hf(HOIST.floor - 40), mouth: basket.mouth, need: 2, drop: basket.drop },
      { kind: 'lift', id: 'hoist', at: { on: 'pit', at: 0.5, dy: -HOIST.dip }, w: HOIST.pit, rise: HOIST.rise, by: 'basket' },
    ],
    exit: 'hoist',
    beyond: hw(HOIST.wall / 2),
    ground: ['floor', 'pit'],
    tips: {
      enter: d === 'easy' ? W10R_TIPS.hoistEnter : W10R_TIPS.hoistEnterNormal,
      hold: W10R_TIPS.hoistHold,
      open: W10R_TIPS.hoistOpen,
    },
  };
};

const hoistPieces: SectionPiece[] = [
  bank('floor', HOIST.floor, { kind: 'start' }),
  bank('pit', HOIST.pit, { kind: 'walk', after: 'floor', dy: HOIST.dip }),
  // (the wall walk, a whole bank down to the ground: a wall beside a pit reaches the pit's floor, STAGE-RULES §6. An `over` piece: a
  // `walk` rise is clamped to a hop)
  bank('wall', HOIST.wall, { kind: 'over', on: 'pit', at: 1, dy: -(HOIST.dip + HOIST.rise) }, { main: true }),
  // (a merlon on the wall walk, a hop up, then down again to the floor's height in two drops: the route leaves the room level with where
  // it came in, and keeps a hop: the inspector reads the room as one beat where it starts, so a plain walk out read as 4-6 s quiet on 10-1)
  bank('merlon', [90, 100], { kind: 'walk', after: 'wall', dy: -40 }),
  bank('down', [120, 140], { kind: 'walk', after: 'merlon', dy: HOIST.rise / 2 + 40 }),
  bank('out', [200, 240], { kind: 'walk', after: 'down', dy: HOIST.rise / 2 }),
];

const hoist = (d: Difficulty): SectionTemplate => ({
  id: 'w10r-room-hoist',
  name: 'puzzle room: the hoist up the rampart (a stone in its basket)',
  archetypes: ['sprint'],
  teaches: 'w10:hoist',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (lever, through, a stone, onto the plank, the throw, up: about 16 s for a first-timer)
  // (the same on Easy: Easy lays Normal's plan, so the length loop must see the same room)
  extraSeconds: 16,
  pieces: hoistPieces,
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  // (a flag's spot early on the way out, so a rest flag never stands at the end of it, by the next section's chasm: w10.test.ts)
  sockets: [{ id: 'flag', role: 'flag', on: 'out', t: 0.3 }],
  room: hoistSpec(d),
  mirrorable: false,
});
export const hoistRoom = hoist('normal');
export const hoistRoomEasy = hoist('easy');

// ───────────────────────────── 10-3: the beam ─────────────────────────────

/** the floor (the post, the rubble), the dip the beam lies in, the wall past it, the walk back down (World 6's root seesaw's numbers) */
export const BEAM = {
  floor: 300,
  dip: 60,
  plank: 260,
  /** the raised end over the floor, and the wall over the floor (out of a double jump's reach; a step from the raised end) */
  rise: 110,
  wallUp: 260,
  wallW: 380,
} as const;

const bf = along('floor', BEAM.floor);
const bw = along('wall', BEAM.wallW);

export const beamRoomSpec: LocalRoomSpec = {
  id: 'beam',
  left: bf(0),
  right: bw(60),
  above: 460,
  below: BEAM.dip + 10,
  pieces: [
    { kind: 'reset', id: 'post', at: bf(20) },
    // (two stones from the rubble: one weighs 2, Pokey 3; two hold the near end down under him)
    { kind: 'source', id: 'pile', variant: 'stone', at: bf(130), look: 'pile' },
    { kind: 'item', id: 'stone1', variant: 'stone', source: 'pile', for: 'beam' },
    { kind: 'item', id: 'stone2', variant: 'stone', source: 'pile', for: 'beam' },
    // (at rest the near end is down: what is carried walks straight onto it)
    { kind: 'seesaw', id: 'beam', at: { on: 'dip', at: 0.5, dy: -BEAM.dip }, w: BEAM.plank, rise: BEAM.rise, rest: -1 },
  ],
  exit: 'beam',
  beyond: bw(120),
  ground: ['floor', 'dip'],
  tips: { enter: W10R_TIPS.beamEnter, hold: W10R_TIPS.beamHold, open: W10R_TIPS.beamOpen },
};

export const beamRoom: SectionTemplate = {
  id: 'w10r-room-beam',
  name: 'puzzle room: the beam on the battlements (two stones)',
  archetypes: ['stealth'],
  teaches: 'w10:beam',
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  // (one stone, the beam tips under him; the second; up and over: about 14 s for a first-timer)
  extraSeconds: 14,
  pieces: [
    bank('floor', BEAM.floor, { kind: 'start' }),
    bank('dip', BEAM.plank, { kind: 'walk', after: 'floor', dy: BEAM.dip }),
    // (the wall, a whole bank down to the ground past the dip)
    bank('wall', BEAM.wallW, { kind: 'over', on: 'dip', at: 1, dy: -(BEAM.dip + BEAM.wallUp) }, { main: true }),
    bank('down', [130, 150], { kind: 'walk', after: 'wall', dy: BEAM.wallUp / 2 }),
    bank('out', [220, 260], { kind: 'walk', after: 'down', dy: BEAM.wallUp / 2 }),
  ],
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [{ id: 'flag', role: 'flag', on: 'out', t: 0.3 }],
  room: beamRoomSpec,
  mirrorable: false,
};

// ───────────────────────────── 10-7: the gatehouse ─────────────────────────────

/** the floor (post, crate stack and scaffold with the lever, rubble, plate, portcullis), floor B a step down past it */
export const GATE = {
  floor: 660,
  /** the crate: a block a hop high (its near end, width, height), and the scaffold over the floor past it (a hop up from the crate) */
  crateX: 90,
  crateW: 130,
  crateUp: 70,
  scafX: 220,
  scafW: 110,
  scafUp: 150,
  /** the rubble past the scaffold, so the carry to the plate is a plain walk (no crate in the way: no jump while carrying) */
  pile: 350,
  /** the plate 160 px short of the portcullis, and the portcullis 80 px short of the floor's end (closer, the check finds no way through
   *  with a stone on the plate, 2026-10-29) */
  plate: 420,
  door: 580,
  doorH: 450,
  /** floor B: a step down past the floor (a carry walks down a step), and its width */
  step: 30,
  floorB: 170,
} as const;

const gf = along('floor', GATE.floor);
const gs = along('scaffold', GATE.scafW);
const gb = along('floorB', GATE.floorB);

const gateSpec = (d: Difficulty): LocalRoomSpec => ({
  id: 'gate',
  left: gf(0),
  right: gb(60),
  above: 500,
  below: 40,
  pieces: [
    { kind: 'reset', id: 'post', at: gf(24) },
    { kind: 'source', id: 'pile', variant: 'stone', at: gf(GATE.pile), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'plate' },
    // (the iron lever up on the scaffold, over the crate stack)
    { kind: 'lever', id: 'lever', at: gs(GATE.scafW / 2) },
    { kind: 'plate', id: 'plate', at: gf(GATE.plate) },
    // (Normal: the plate weighed AND the lever pulled; standing on the plate himself, it shuts as he steps off. Easy: the lever alone)
    { kind: 'gate', id: 'door', at: gf(GATE.door), open: d === 'easy' ? 'lever' : { all: ['plate', 'lever'] }, h: GATE.doorH },
  ],
  exit: 'door',
  beyond: gb(130),
  ground: ['floor', 'crate', 'scaffold'],
  tips: {
    enter: W10R_TIPS.gateEnter,
    ...(d === 'easy' ? {} : { hold: W10R_TIPS.gateHold }),
    open: W10R_TIPS.gateOpen,
  },
});

const gatePieces: SectionPiece[] = [
  bank('floor', GATE.floor, { kind: 'start' }),
  // (a crate stack: a block a hop high on the floor)
  { key: 'crate', shape: 'block', w: GATE.crateW, h: GATE.crateUp, place: { kind: 'on', on: 'floor', at: GATE.crateX / (GATE.floor - GATE.crateW), h: GATE.crateUp } },
  // (the scaffold over the floor past the crate: a hop up from the crate's top)
  { key: 'scaffold', shape: 'branch', w: GATE.scafW, place: { kind: 'over', on: 'floor', at: GATE.scafX / GATE.floor, dy: -GATE.scafUp }, main: false },
  bank('floorB', GATE.floorB, { kind: 'walk', after: 'floor', dy: GATE.step }),
  // (a knee past the portcullis: the inspector reads the room as one beat where it starts, so a plain walk out read as 4 s quiet)
  bank('knee', [90, 100], { kind: 'walk', after: 'floorB', dy: -40 }),
  bank('out', [200, 240], { kind: 'walk', after: 'knee', dy: 40 }),
];

const gate = (d: Difficulty): SectionTemplate => ({
  id: 'w10r-room-gate',
  name: 'puzzle room: the gatehouse (a stone on the plate and the lever up on the crates)',
  archetypes: ['purge'],
  teaches: 'w10:gatehouse',
  phases: ['sho', 'ten'],
  difficulty: 5,
  maxPerStage: 1,
  weight: 40,
  // (up the crates, the lever, down, a stone to the plate, through: about 14 s for a first-timer)
  extraSeconds: 14,
  pieces: gatePieces,
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: GATE.step,
  sockets: [{ id: 'flag', role: 'flag', on: 'out', t: 0.3 }],
  room: gateSpec(d),
  mirrorable: false,
});
export const gateRoom = gate('normal');
export const gateRoomEasy = gate('easy');

// ───────────────────────────── the set ─────────────────────────────

/** World 10's puzzle-room sections (Normal's; Easy's have the same ids: roomFor) */
export const W10_ROOM_SECTIONS: readonly SectionTemplate[] = [hoistRoom, beamRoom, gateRoom];

/** each room's stage (STAGE-RULES §3: 2-3 puzzle moments a world): a stage's kit holds only its own */
export const W10R_STAGE: Record<string, string> = { [hoistRoom.id]: '10-1', [beamRoom.id]: '10-3', [gateRoom.id]: '10-7' };
export const W10_ROOM_STAGES = ['10-1', '10-3', '10-7'] as const;

/** each stage's room, on every roll (WorldManifest.required: placed by the plan, never swapped or trimmed) */
export const W10_ROOM_REQUIRED: NonNullable<WorldManifest['required']> = Object.fromEntries(
  W10_ROOM_SECTIONS.map((s) => [W10R_STAGE[s.id], [{ section: s.id }]]),
);

/** Easy's version of each room (the same section id, so Easy lays Normal's plan) */
const EASY: Record<string, SectionTemplate> = { [hoistRoom.id]: hoistRoomEasy, [gateRoom.id]: gateRoomEasy };
export const roomFor = (t: SectionTemplate, d: Difficulty): SectionTemplate => (d === 'easy' ? EASY[t.id] ?? t : t);

/** the room sections of stage `stage`, Easy's version on Easy */
export function w10RoomsFor(stage: number, difficulty: Difficulty = 'normal'): SectionTemplate[] {
  return W10_ROOM_SECTIONS.filter((s) => W10R_STAGE[s.id] === `10-${stage}`).map((s) => roomFor(s, difficulty));
}

/**
 * World 10's kit for stage `stage` with that stage's room joined (none for a stage with no room), Easy's version on Easy. The world's own
 * manifest (gen2/worlds/w10.ts) stays as it is: w10Game.ts folds this in and sets `required` (W10_ROOM_REQUIRED).
 */
export function withW10Rooms(kit: WorldKit, stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  const mine = w10RoomsFor(stage, difficulty).filter((s) => !have.has(s.id));
  return { ...kit, manifest: { ...M, sections: [...M.sections, ...mine] } };
}
