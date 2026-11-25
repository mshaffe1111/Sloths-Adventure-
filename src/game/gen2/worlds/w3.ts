/**
 * gen2/worlds/w3 — World 3, the Mossy Grotto, for the new generator (ENG-W3a, 11-23; WORLD-3-PLAN F1): the world's kit every World 3
 * level is rolled from (stageTable.ts kit 'w3', listed.ts KITS), its look by world data, its cast rows and the placeholder way DOWN its
 * first stage is drafted on. WORLD DATA (generalitycheck EXEMPT): every fact here is World 3's; the code that reads it names no stage.
 *
 * THE WORLD'S RULE (WORLD-3-PLAN §1, GAME-MAP §4): the grotto goes DOWN. Its first stage travels down (its draft row's `travel`), laid
 * storey under storey by gen2's one lay (pipeline.ts layStage, tower.ts): every drop's landing in view before he commits (tower.ts
 * towerFalls, TOWER.see; D46: no blind fall), the lay's vine climbed down where a storey turns. Its falls are soft (a miss costs a storey, never
 * a life). The dark, the glowworms that wake below, the spore puffs are World 3's next pieces (ENG-DARK, ENG-SPORE): none is laid here.
 *
 * THE ART (the inventory, src/game/art/inventory/w3.json, reference/art/CATALOG-MASTER.csv): every piece the kit lays is drawn by World
 * 3's painted kit (src/assets/kits/w3.webp: the bank's top strip, fill and end; the branch shelf; the boulder), as the engine draws them
 * for world 3 (terrain.ts footingsFor). W3_ART names the inventory rows; w3.test.ts holds every one in the World 3 inventory, usable,
 * in game and inside its scale against Pokey (89.1 px, R-165.107), and every rolled piece drawn by World 3's own art.
 *   - a ledge: World 3's stone bank (its top strip on the ledge's top, its soil fill under it), 320-420 px: 3.6-4.7 Pokeys to land on;
 *   - a shelf: World 3's branch shelf, 200-300 px (2.2-3.4 Pokeys), the plan's S/M shelves (WORLD-3-PLAN §3 batch 1: 120/200/320) until
 *     the painted stone shelves land (W3-ART-1: w3-new#shelf-long/short are packed, never loaded);
 *   - a drop: 110-150 px, under two of his heights (a fall of 200 px or less makes no noise, heroNoise.ts), the next shelf 8-20 px past
 *     the end: he steps off and lands.
 *
 * THE CAST (predators/world3.ts, the kit's creature rows: castPlay.ts runs a kind a brief names in `cast`): the OCELOT, the prowler,
 * and the JAGUAR, which waits above. Their bodies are the ones Worlds 6-8 lay (w6.ts:114-115). Rows only: the draft's way down casts
 * none (castRows: a brief that names no cast lays from the whole list, so no brick of the way down has an animal socket).
 */
import { G } from '../../protoStage.ts';
import { DARK_EMIT, DARK_GLOW_PROPS, darkEnds } from '../dark.ts';
import type { CreatureDef, SectionTemplate, WorldKit, WorldManifest } from '../types.ts';
import { W1_KIT } from './w1.ts';

/** World 3's ground: the floor line (the bottom of the way down), a ledge's depth and how deep a soft fall's bed lies */
export const W3_GROUND = { y: G, bankH: 90, pitDepth: 130 } as const;

/**
 * The inventory rows World 3's pieces are drawn as (src/game/art/inventory/w3.json; the engine's World 3 kit painter draws them for
 * world 3): by the piece's job. w3.test.ts holds each row in the World 3 file, usable, in game and in scale.
 */
export const W3_ART = {
  /** a stone ledge: its top strip, its soil fill, its end face (w3.webp kit frames) */
  bank: ['w3#bank', 'w3#fill', 'w3#bankEnd', 'w3#fill0', 'w3#fill1', 'w3#fill2', 'w3#fill3'],
  /** a shelf he drops onto: the kit's branch / plank (w3.webp) */
  shelf: ['w3#branch'],
  /** a rock: the kit's low boulder (w3.webp) */
  rock: ['w3#boulder'],
  /** the grotto's lamps and ferns at a ledge (w3-props.webp) */
  glow: ['w3-props#glowLit', 'w3-props#mushrooms'],
  fern: ['w3-props#fern', 'w3-props#mossCurtain'],
} as const;

/** the lessons World 3's way down teaches (a section's `teaches`): going down a vine */
export const W3_LESSON = { down: 'down' } as const;

/**
 * Dot's words in World 3's kit: the story keeper's only (level.md rule 17). None yet: the keeper writes 3-1's lines with its build; a
 * brick that teaches carries no tip until then (the tip socket is the build's).
 */
export const W3_TIPS: Record<string, string> = {};

/**
 * World 3's cast rows (predators/world3.ts OCELOT and JAGUAR, run by the creature kit when a brief casts them): bodies as Worlds 6-8 lay
 * them (w6.ts:114-115). The first a lesson meets is the build's (level.md rule 7); nothing here is a stage's.
 */
export const W3_CAST: readonly CreatureDef[] = [
  { id: 'ocelot', enemy: 'ocelot', threat: 3, terrain: 'flat', minGround: 220, w: 48, h: 28, hp: 2, footY: 18, tags: ['cast', 'topup'] },
  { id: 'jaguar', enemy: 'jaguar', threat: 5, terrain: 'flat', minGround: 300, w: 64, h: 38, hp: 3, footY: 24, tags: ['cast'] },
];

// ───────────────────────────── the way down (the draft's placeholder bricks) ─────────────────────────────
// (3-1's build designs its arc on its own kit over this one, as 2-1's did over World 2's; until then the draft row rolls these: a ledge,
//  drops, a walk along a shelf; where a storey turns, the lay's own vine takes him down. No socket here lays an animal or a tip)

/** the arrival, a rest, the goal: a stone ledge with a flag (at the bottom of the way down it is the grotto floor) */
export const w3Ledge: SectionTemplate = {
  id: 'w3-ledge',
  name: 'ledge',
  archetypes: 'any',
  phases: ['start', 'rest', 'goal'],
  difficulty: 1,
  pieces: [{ key: 'ledge', shape: 'bank', w: [320, 420], place: { kind: 'start' } }],
  entry: { piece: 'ledge', kind: 'ground' },
  exit: { piece: 'ledge', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'ledge', t: [0.3, 0.6], dn: 34, count: 3, span: 160, allow: ['pickups'] },
    { id: 'flag', role: 'flag', on: 'ledge', t: 0.75 },
  ],
  mirrorable: false,
};

/** two drops down onto shelves: he steps off the end and lands on the next, 8-20 px across (a walk-off lands; a soft drop, 3-1's idea) */
export const w3Drops: SectionTemplate = {
  id: 'w3-drops',
  name: 'drops down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3,
  pieces: [
    { key: 'a', shape: 'branch', w: [200, 260], place: { kind: 'start' } },
    { key: 'b', shape: 'branch', w: [200, 250], place: { kind: 'jump', after: 'a', dy: [110, 150], gapPx: [8, 20] }, landing: true },
    { key: 'c', shape: 'branch', w: [200, 260], place: { kind: 'jump', after: 'b', dy: [110, 150], gapPx: [8, 20] }, landing: true },
  ],
  entry: { piece: 'a', kind: 'ledge' },
  exit: { piece: 'c', kind: 'ledge' },
  exitDy: 260,
  // (in the dark: a glowworm over every landing, asleep until he stops at a rim; gen2/dark.ts, ENG-DARK)
  sockets: [...darkEnds('a', 'c', 'glow'), { id: 'petal', role: 'pickup', on: 'b', t: 0.5, dn: 34 }, { id: 'flag', role: 'flag', on: 'c', t: 0.6 }],
  mirrorable: false,
};

/** a walk along a shelf and a hop to the next, level */
export const w3Walk: SectionTemplate = {
  id: 'w3-walk',
  name: 'shelf walk',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 2,
  pieces: [
    { key: 'near', shape: 'branch', w: [200, 240], place: { kind: 'start' } },
    { key: 'far', shape: 'branch', w: [300, 380], place: { kind: 'jump', after: 'near', dy: 0, share: [0.45, 0.7] }, landing: true },
  ],
  entry: { piece: 'near', kind: 'ledge' },
  exit: { piece: 'far', kind: 'ledge' },
  exitDy: 0,
  sockets: [{ id: 'petals', role: 'pickup', on: 'far', t: 0.4, dn: 34, count: 2, span: 90 }, { id: 'flag', role: 'flag', on: 'far', t: 0.75 }],
  mirrorable: false,
};

/** the way down's bricks, in the order a pool reads them */
export const W3_DOWN: readonly SectionTemplate[] = [w3Ledge, w3Drops, w3Walk];

// ───────────────────────────── the manifest and the kit ─────────────────────────────

/**
 * World 3's manifest. The planner's tempo (rollRanges) is World 1's measured one until a World 3 level is flown on its own (the builder's
 * dial). Moves: everything Worlds 1-2 taught. Lessons: World 1's moves where World 1 taught them.
 */
export function w3Manifest(): WorldManifest {
  return {
    world: 3, name: 'Mossy Grotto',
    moves: ['double', 'climb', 'swing'],
    ground: { y: W3_GROUND.y, bankH: W3_GROUND.bankH, style: 'log' },
    pit: 'soft', pitDepth: W3_GROUND.pitDepth,
    rollRanges: W1_KIT.rollRanges,
    corridor: { top: G - 260, bottom: G + 60, soft: 80 },
    themeShare: [1, 1],
    creatures: [...W3_CAST], props: [...DARK_GLOW_PROPS], pairs: [], decor: [],
    flowers: ['orchid', 'hibiscus'],
    sections: [...W3_DOWN],
    handBuilt: [],
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6' },
    tips: W3_TIPS,
    required: {},
  };
}

/** World 3's kit: its manifest, and the dark's emitters (gen2/dark.ts: the glowworms' stretch; the spores come with their own piece) */
export function w3World(): WorldKit {
  return { manifest: w3Manifest(), emit: { ...DARK_EMIT } };
}
