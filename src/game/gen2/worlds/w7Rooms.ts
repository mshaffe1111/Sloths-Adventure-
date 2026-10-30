/**
 * gen2/worlds/w7Rooms — World 7's puzzle-room sections (DESIGN.md B9; STAGE-RULES §3), built from the puzzle kit as it is (puzzleKit.ts:
 * no new piece). Dot is gone in World 7, so every room line is Pokey's own thought (STAGE-RULES §1).
 *
 *   w7r-room-seal    7-3 "Ten Chairs". A sealed stone door with a pressure plate before it (Matt's World 7 plate, w7-plates). Pokey's
 *                    weight alone is not enough (3 against the plate's 4), and one fallen stone from the pile is not either (2): two
 *                    stones on the plate open it. Easy (1-2 steps): one stone opens it (the plate needs 2). The door's wall is out of a
 *                    double jump's reach.
 *   w7r-room-lever   7-7 "The Photograph". A stone door wired to a lever AND a plate: pull the lever, carry a stone onto the plate.
 *                    Easy: the lever alone opens it. The lever, the plate and the door stand in a row, so what opens it is in view.
 *
 * None has an enemy socket, none is mirrored (a room reads left to right), each is once a stage and only in its own stage (W7R_STAGE),
 * and neither can be walked past unsolved (the door's wall is the kit's: KIT's gate wall over the door, out of a double jump).
 * What the kit has no art for yet (reported): the stone door (the kit's gate is drawn as its root door; Matt's w7a-puzzle-take2 door and
 * lever, and w7-plates' plate, are cut and waiting to be wired into puzzleArt.ts).
 */
import type { Difficulty, LocalRoomSpec, SectionPiece, SectionTemplate, WorldKit } from '../types.ts';

/**
 * Pokey's room lines (under 10 words). All new: each needs Matt's approval before it ships (STAGE-RULES §1 "Story").
 */
export const W7R_TIPS = {
  // (Normal plays on Tips: a room's first line names the problem, never the answer (polish-dot DOT-2); Easy plays on Help, a nudge)
  sealEnter: "Sealed. This old door won't budge.",
  sealEnterEasy: "Sealed. This old door won't budge.",
  sealHold: "One stone isn't enough. I need another.",
  sealOpen: 'Open! Heavy work for one small sloth.',
  leverEnter: 'Another sealed door. How does this one open?',
  leverEnterEasy: 'Another sealed door. How does this one open?',
  leverHold: 'Now the plate needs a stone.',
  leverOpen: "Both done. The door's open.",
} as const;
export const W7R_NEW_LINES: readonly string[] = Object.values(W7R_TIPS);

/** the rooms' hints, asked for (Matt: only when asked, in steps, never the answer; under 10 words). New lines: each needs his approval */
export const W7R_ROOM_HINTS: Record<string, readonly [string, string]> = {
  seal: ['The plate wants more than me.', 'Those fallen stones are heavy.'],
  lever: ['The door listens to two things.', 'Pull it, then weigh the plate.'],
};

/** floor2 lies this far under floor: a step down while carrying, a hop up out past the door */
export const ROOM_STEP = 40;

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'], o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const along = (on: string, w: number) => (px: number, dy?: number) => ({ on, at: px / w, ...(dy === undefined ? {} : { dy }) });

// ───────────────────────────── 7-3: the sealed door (two stones) ─────────────────────────────

export const SEAL = {
  floor: 360,
  floor2: 420,
  /** the plate's weight: Pokey 3 is not enough, one stone 2 is not, two stones 4 are (Easy: one stone) */
  need: { normal: 4, easy: 2 },
  doorH: 450,
} as const;

const sa = along('floor', SEAL.floor);
const sb = along('floor2', SEAL.floor2);

const sealSpec = (d: Difficulty): LocalRoomSpec => ({
  id: 'seal',
  left: sa(0),
  right: sb(300),
  above: 490,
  below: 20,
  pieces: [
    { kind: 'reset', id: 'post', at: sa(24) },
    { kind: 'source', id: 'pile', variant: 'stone', at: sa(150), look: 'pile' },
    { kind: 'item', id: 'stone1', variant: 'stone', source: 'pile', for: 'plate' },
    ...(d === 'easy' ? [] : [{ kind: 'item' as const, id: 'stone2', variant: 'stone' as const, source: 'pile', for: 'plate' }]),
    { kind: 'plate', id: 'plate', at: sb(110), need: SEAL.need[d] },
    { kind: 'gate', id: 'door', at: sb(270), open: 'plate', h: SEAL.doorH },
  ],
  exit: 'door',
  beyond: sb(380),
  ground: ['floor', 'floor2'],
  tips: {
    enter: d === 'easy' ? W7R_TIPS.sealEnterEasy : W7R_TIPS.sealEnter, // (new, needs Matt's approval)
    ...(d === 'easy' ? {} : { hold: W7R_TIPS.sealHold }), // (new, needs Matt's approval)
    open: W7R_TIPS.sealOpen, // (new, needs Matt's approval)
  },
});

/**
 * The room's floors: floor (the post, the pile), a step DOWN to floor2 (the plate, the door: carrying a stone needs no jump, STAGE-RULES
 * §1, and a step down is a walk), then past the door a hop up and a plinth (the beats after the room: the inspector reads the room as
 * one beat where it starts)
 */
const roomPieces = (floor: number, floor2: number): SectionPiece[] => [
  bank('floor', floor, { kind: 'start' }),
  bank('floor2', floor2, { kind: 'walk', after: 'floor', dy: ROOM_STEP }),
  bank('out', [200, 240], { kind: 'walk', after: 'floor2', dy: -ROOM_STEP }),
  bank('k', [140, 160], { kind: 'walk', after: 'out', dy: -30 }),
  bank('out2', [200, 240], { kind: 'walk', after: 'k', dy: 30 }),
];
const sealPieces = roomPieces(SEAL.floor, SEAL.floor2);

const sealRoomFor = (d: Difficulty): SectionTemplate => ({
  id: 'w7r-room-seal',
  name: 'puzzle room: the sealed door (two stones on the plate)',
  archetypes: ['relic_hunt'],
  teaches: 'w7:seal',
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  // (one stone, the plate stays up; the second; through: about 14 s for a first-timer)
  extraSeconds: 14,
  pieces: sealPieces,
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out2', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: sealSpec(d),
  mirrorable: false,
});
export const sealRoom = sealRoomFor('normal');
export const sealRoomEasy = sealRoomFor('easy');

// ───────────────────────────── 7-7: the lever and the plate ─────────────────────────────

export const LEVER = { floor: 340, floor2: 460, doorH: 450 } as const;
const la = along('floor', LEVER.floor);
const lb = along('floor2', LEVER.floor2);

const leverSpec = (d: Difficulty): LocalRoomSpec => ({
  id: 'lever',
  left: la(0),
  right: lb(340),
  above: 490,
  below: 20,
  pieces: [
    { kind: 'reset', id: 'post', at: la(24) },
    { kind: 'source', id: 'pile', variant: 'stone', at: la(170), look: 'pile' },
    { kind: 'item', id: 'stone', variant: 'stone', source: 'pile', for: 'plate' },
    { kind: 'lever', id: 'lever', at: lb(60) },
    { kind: 'plate', id: 'plate', at: lb(180), need: 2 },
    // (Normal: the lever and a stone on the plate, both; Easy: the lever alone. Standing on the plate himself (3) presses it, but he
    // can't be on it and through the door at once)
    { kind: 'gate', id: 'door', at: lb(310), open: d === 'easy' ? 'lever' : { all: ['lever', 'plate'] }, h: LEVER.doorH },
  ],
  exit: 'door',
  beyond: lb(420),
  ground: ['floor', 'floor2'],
  tips: {
    enter: d === 'easy' ? W7R_TIPS.leverEnterEasy : W7R_TIPS.leverEnter, // (new, needs Matt's approval)
    ...(d === 'easy' ? {} : { hold: W7R_TIPS.leverHold }), // (new, needs Matt's approval)
    open: W7R_TIPS.leverOpen, // (new, needs Matt's approval)
  },
});

const leverRoomFor = (d: Difficulty): SectionTemplate => ({
  id: 'w7r-room-lever',
  name: 'puzzle room: the lever and the plate',
  archetypes: ['relic_hunt'],
  teaches: 'w7:lever',
  phases: ['sho', 'ten'],
  difficulty: 4,
  maxPerStage: 1,
  weight: 40,
  extraSeconds: 12,
  pieces: roomPieces(LEVER.floor, LEVER.floor2),
  entry: { piece: 'floor', kind: 'ground' },
  exit: { piece: 'out2', kind: 'ground' },
  exitDy: 0,
  sockets: [],
  room: leverSpec(d),
  mirrorable: false,
});
export const leverRoom = leverRoomFor('normal');
export const leverRoomEasy = leverRoomFor('easy');

/** World 7's puzzle-room sections (Normal's) */
export const W7_ROOM_SECTIONS: readonly SectionTemplate[] = [sealRoom, leverRoom];

/** each room's stage (w7.ts W7_ROOM_STAGES) */
export const W7R_STAGE: Record<string, string> = { [sealRoom.id]: '7-3', [leverRoom.id]: '7-7' };

/** a stage's kit with its room joined (Easy's version on Easy: the same section id, so the plan is shared) */
export function withW7Rooms(kit: WorldKit, stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  const easy: Record<string, SectionTemplate> = { [sealRoom.id]: sealRoomEasy, [leverRoom.id]: leverRoomEasy };
  const mine = W7_ROOM_SECTIONS.filter((s) => W7R_STAGE[s.id] === `7-${stage}` && !have.has(s.id)).map((s) => (difficulty === 'easy' ? easy[s.id] : s));
  return { ...kit, manifest: { ...M, sections: [...M.sections, ...mine] } };
}
