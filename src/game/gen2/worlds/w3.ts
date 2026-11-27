/**
 * gen2/worlds/w3 — World 3, the Mossy Grotto, for the new generator (ENG-W3a, 11-23; WORLD-3-PLAN F1): the world's kit every World 3
 * level is rolled from (stageTable.ts kit 'w3', listed.ts KITS), its look by world data, its cast rows and the placeholder way DOWN its
 * first stage is drafted on. WORLD DATA (generalitycheck EXEMPT): every fact here is World 3's; the code that reads it names no stage.
 *
 * THE WORLD'S RULE (WORLD-3-PLAN §1, GAME-MAP §4): the grotto goes DOWN. Its first stage travels down (its draft row's `travel`), laid
 * storey under storey by gen2's one lay (pipeline.ts layStage, tower.ts): every drop's landing in view before he commits (tower.ts
 * towerFalls, TOWER.see; D46: no blind fall), the lay's vine climbed down where a storey turns. Its falls are soft (a miss costs a storey, never
 * a life). The dark, the glowworms that wake below, the spore puffs are World 3's pieces (ENG-DARK, ENG-SPORE); a node code asks them by
 * W3_HAZARDS (below).
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
import type { HazardDef, HazardLay } from '../nodeAsks.ts';
import type { CreatureDef, NodeJob, SectionTemplate, Socket, WorldKit, WorldManifest } from '../types.ts';
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

// ───────────────────────────── the level bricks (KIT-W3b, R-165.505) ─────────────────────────────
// (World 3's LEVEL stages, the ones that go along and not down: the bricks a level code's nodes ask for, each World 3's own. A level stage
//  cannot borrow World 1-2's sections: they ask for the double, carry World 1's tips and leave 6-11 s quiet lines (AUDIT-W3 finding 4))

/** the World 3 stages laid ALONG (not a tower): a level brick is in their pools and no other (its `feel`), so the towers' rolls never move */
export const W3_LEVEL_STAGES = ['3-2', '3-3', '3-6', '3-7', '3-8', '3-9'] as const;

/** the node jobs a level brick with an animal serves: never a teach (the first of a kind is the build's, level.md rule 7) */
const PROWL_JOBS: NodeJob[] = ['practise', 'test', 'combine', 'twist', 'signature'];

/** the ocelot's floor (px): past its minGround (W3_CAST 220) and its sight ahead (240), so it prowls the floor and he stands still on it */
const PROWL_FLOOR: [number, number] = [540, 620];

/** an ocelot socket: World 3's prowler and nothing else (the jaguar waits above, threat 5), softened on Easy */
const ocelotAt = (id: string, on: string, t: [number, number]): Socket => ({ id, role: 'enemy', on, t, dn: 0, allow: ['ocelot'], maxThreat: 3, easy: 'soften' });

/**
 * THE OCELOT'S GROUND (3-2's and 3-3's ocelot beats on a ground node, AUDIT-W3 'ocelot sockets laid 0'): a stone bank, a step down onto
 * the long stone floor the ocelot prowls, a step back up. He walks in, sees it, and stands still until it loses him (OCELOT beatenBy
 * still) or slips past while its back is turned. Plain steps only (56 px, under a single's reach): nothing asks for the double.
 */
export const w3ProwlFloor: SectionTemplate = {
  id: 'w3-prowl-floor',
  name: "the ocelot's floor",
  feel: W3_LEVEL_STAGES, archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 3, needs: ['jump'], jobs: PROWL_JOBS, content: 'ground', maxPerStage: 4,
  pieces: [
    { key: 'in', shape: 'bank', w: [300, 340], place: { kind: 'start' } },
    { key: 'floor', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'in', dy: [50, 56] } },
    { key: 'out', shape: 'bank', w: [280, 320], place: { kind: 'walk', after: 'floor', dy: [-56, -50] } },
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'in', t: [0.3, 0.5], dn: 34, count: 2, span: 90, allow: ['pickups'] },
    ocelotAt('ocelot', 'floor', [0.4, 0.5]),
    { id: 'petal', role: 'pickup', on: 'out', t: 0.35, dn: 34 },
    // (a flag that falls in the brick stands on its exit bank, never on a floor: a safe spot within SAFE_APPROACH, levelCheck.ts,
    //  takes an ocelot's patch away, pipeline.ts patchFor)
    { id: 'flag', role: 'flag', on: 'out', t: 0.7 },
  ],
  mirrorable: false,
};

/**
 * THE TWO FLOORS (an ocelot beat that asks two or more, 3-2's C and 3-3's C: '&ocelot*2'): two stone floors, a step up between them, an
 * ocelot's socket on each (the node's ask fills them up to its count, nodeAsks.ts 'threat'). The step is the stand-still spot: one floor
 * at a time.
 */
export const w3ProwlPair: SectionTemplate = {
  id: 'w3-prowl-pair',
  name: 'two ocelot floors',
  feel: W3_LEVEL_STAGES, archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 4, needs: ['jump'], jobs: PROWL_JOBS, content: 'ground', maxPerStage: 3,
  pieces: [
    { key: 'in', shape: 'bank', w: [280, 320], place: { kind: 'start' } },
    { key: 'low', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'in', dy: [50, 56] } },
    { key: 'high', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'low', dy: [-56, -50] } },
    { key: 'out', shape: 'bank', w: [260, 300], place: { kind: 'walk', after: 'high', dy: [0, 0] } },
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    { id: 'petals', role: 'pickup', on: 'in', t: [0.3, 0.5], dn: 34, count: 2, span: 90, allow: ['pickups'] },
    ocelotAt('ocelot1', 'low', [0.4, 0.5]),
    ocelotAt('ocelot2', 'high', [0.3, 0.4]),
    { id: 'petal', role: 'pickup', on: 'out', t: 0.35, dn: 34 },
    // (a flag that falls in the brick stands on its exit bank, never on a floor: a safe spot within SAFE_APPROACH, levelCheck.ts,
    //  takes an ocelot's patch away, pipeline.ts patchFor)
    { id: 'flag', role: 'flag', on: 'out', t: 0.7 },
  ],
  mirrorable: false,
};

/** the climb out of the ocelot's floor (px): two Pokeys up the vine (89.1 px each), past a plain jump's rise, so the vine is the way */
const PROWL_CLIMB_H = 180;
/** the plain step down from the climb's entry bank onto the ocelot's floor (px; 0.61 of Pokey): the walk off the shelf lands at the entry's
 *  height, the vine's height less this step, so the brick leaves where it came in */
const PROWL_STEP = 54;

/**
 * THE CLIMB OUT (3-2's climb beats with an ocelot, P(c) 'Pc1&<:&ocelot*1' and X(c) 'Xc1&<:#dark:&ocelot*1'; AUDIT-W3 'ocelot*1: laid
 * 0' x11): the ocelot prowls the stone floor at the vine's foot; he stands still until its back is turned, slips past, climbs the vine
 * (World 3's climb, drawn as the kit's trunk) onto a branch shelf and walks off it down onto the exit bank (a walk, never a jump: only a
 * jump's dy is scaled by the rise, R-165.524). Plain jumps only. `dark`: the dark stretch over the whole brick, a glowworm at its end.
 */
function prowlClimb(dark: boolean, high = false): SectionTemplate {
  const top = high ? 'ledge' : 'shelf';
  return {
    id: `w3-prowl-climb${high ? '-high' : ''}${dark ? '-dark' : ''}`,
    name: `the climb out${high ? ' and up' : ''}${dark ? ', in the dark' : ''}`,
    feel: W3_LEVEL_STAGES, archetypes: 'any',
    phases: ['sho', 'ten', 'ketsu'],
    difficulty: dark ? 4 : 3, needs: ['climb'], jobs: PROWL_JOBS, content: 'climb', maxPerStage: 3,
    pieces: [
      { key: 'in', shape: 'bank', w: [280, 320], place: { kind: 'start' } },
      { key: 'foot', shape: 'bank', w: PROWL_FLOOR, place: { kind: 'walk', after: 'in', dy: PROWL_STEP } },
      { key: 'vine', shape: 'vine', w: 0, place: { kind: 'climb', on: 'foot', at: 1, h: PROWL_CLIMB_H } },
      { key: 'shelf', shape: 'branch', w: [220, 260], place: { kind: 'over', on: 'vine', at: 0, dy: 0 }, main: true },
      // (`high`: a plain step up off the shelf onto a higher branch, and the walk off is from there)
      ...(high ? [{ key: 'ledge', shape: 'branch' as const, w: [200, 240] as [number, number], place: { kind: 'walk' as const, after: 'shelf', dy: -PROWL_STEP } }] : []),
      { key: 'out', shape: 'bank', w: [280, 320], place: { kind: 'walk', after: top, dy: PROWL_CLIMB_H - PROWL_STEP + (high ? PROWL_STEP : 0) } },
    ],
    entry: { piece: 'in', kind: 'ground' },
    exit: { piece: 'out', kind: 'ground' },
    exitDy: 0,
    sockets: [
      ...(dark ? darkEnds('in', 'out', 'glow') : []),
      ocelotAt('ocelot', 'foot', [0.3, 0.45]),
      { id: 'petals', role: 'pickup', on: top, t: [0.4, 0.6], dn: 34, count: 2, span: 90, allow: ['pickups'] },
      { id: 'petal', role: 'pickup', on: 'out', t: 0.35, dn: 34 },
      // (a flag that falls in the brick stands on its exit bank, never at the ocelot's floor: pipeline.ts patchFor, SAFE_APPROACH)
      { id: 'flag', role: 'flag', on: 'out', t: 0.7 },
    ],
    mirrorable: false,
  };
}
export const w3ProwlClimb: SectionTemplate = prowlClimb(false);
export const w3ProwlClimbDark: SectionTemplate = prowlClimb(true);
export const w3ProwlClimbHigh: SectionTemplate = prowlClimb(false, true);
export const w3ProwlClimbHighDark: SectionTemplate = prowlClimb(true, true);
/** the climb bricks (a climb node takes two: two shapes, so its second is World 3's own, not a World 1-2 stand-in) */
export const W3_CLIMBS: readonly SectionTemplate[] = [w3ProwlClimb, w3ProwlClimbDark, w3ProwlClimbHigh, w3ProwlClimbHighDark];

/** a brick in the dark (3-2's '#dark' beats on the ocelot's ground, 'Cg1&>:#dark:&ocelot*2'): the dark stretch from its entry to its exit,
 *  a glowworm at its end (gen2/dark.ts darkEnds); a node that asks #dark draws it (pipeline: a section that lays the node's hazard) */
const inTheDark = (s: SectionTemplate, name: string): SectionTemplate => ({
  ...s, id: `${s.id}-dark`, name, difficulty: s.difficulty + 1, sockets: [...darkEnds(s.entry.piece, s.exit.piece, 'glow'), ...s.sockets],
});
export const w3ProwlFloorDark: SectionTemplate = inTheDark(w3ProwlFloor, "the ocelot's floor, in the dark");
export const w3ProwlPairDark: SectionTemplate = inTheDark(w3ProwlPair, 'two ocelot floors, in the dark');

/** World 3's level bricks, in the order a pool reads them (the ocelot's ground, the climb out; the root rope next, ENG-ROOT) */
export const W3_LEVEL: readonly SectionTemplate[] = [w3ProwlFloor, w3ProwlPair, w3ProwlFloorDark, w3ProwlPairDark, ...W3_CLIMBS];
// ───────────────────────────── the hazards a node code may ask ─────────────────────────────

/** the puff's clock (the spore piece, gen2/spore.ts: a section's SectionZone 'spore' lays its cloud on zones.ts SPORE's beat) */
const PUFF: HazardLay = { zone: 'spore', zones: ['spore'] };

/**
 * WORLD 3's HAZARD REGISTRY (nodeAsks.ts hazardRegistry, ENG-ASKS R-165.501; ENG-ASKS-b): the ids and named clocks a World 3 node code
 * may ask (`:#id`, `:#id@clock`), each by the bricks that lay it. The deal draws a section that lays it, or the roll fails by name.
 *   - #dark: the glowworms' dark (gen2/dark.ts), laid by a section's dark ends (darkEnds: its 'darkFrom' prop), read as a 'dark' zone;
 *   - @puff: the spore puff's clock (#dark@puff: the dark with a puff on its shelf, its light on the puff's beat; #spore@puff);
 *   - #spore: the spore puff itself, by its zone brick;
 *   - #soft@moon: a soft fall on the moon's clock. NO BRICK LAYS THE MOON YET (ENG-MOON builds it): the row is registered so the ask is
 *     refused by name ('no section in the pool lays @moon') until a section with a 'moon' zone is in the pool; ENG-MOON sets the zone.
 * NOT YET: #vine and #thornvine@doze wait for ENG-VINE (until then a code that asks them is refused '... is not a registered hazard').
 */
export const W3_HAZARDS: readonly HazardDef[] = [
  { id: 'dark', zone: 'dark', props: ['darkFrom'], clocks: { puff: PUFF } },
  { id: 'spore', ...PUFF, clocks: { puff: PUFF } },
  { id: 'soft', clocks: { moon: { zone: 'moon', zones: ['moon'] } } },
];

// ───────────────────────────── the manifest and the kit ─────────────────────────────

/**
 * World 3's manifest. The planner's tempo (rollRanges) is World 1's measured one until a World 3 level is flown on its own (the builder's
 * dial). Moves: everything Worlds 1-2 taught. Lessons: World 1's moves where World 1 taught them.
 */
export function w3Manifest(): WorldManifest {
  return {
    world: 3, name: 'Mossy Grotto',
    // (the rope: World 1 taught it at 1-3; 3-2's roof root is crept on it, hangsNeed in pipeline.ts)
    moves: ['double', 'climb', 'swing', 'rope'],
    ground: { y: W3_GROUND.y, bankH: W3_GROUND.bankH, style: 'log' },
    pit: 'soft', pitDepth: W3_GROUND.pitDepth,
    rollRanges: W1_KIT.rollRanges,
    corridor: { top: G - 260, bottom: G + 60, soft: 80 },
    themeShare: [1, 1],
    creatures: [...W3_CAST], props: [...DARK_GLOW_PROPS], pairs: [], decor: [],
    flowers: ['orchid', 'hibiscus'],
    sections: [...W3_DOWN, ...W3_LEVEL],
    handBuilt: [],
    lessons: { jump: '1-1', double: '1-1', bounce: '1-1', climb: '1-4', creak: '1-5', swing: '1-6' },
    tips: W3_TIPS,
    required: {},
    hazards: W3_HAZARDS,
  };
}

/** World 3's kit: its manifest, and the dark's emitters (gen2/dark.ts: the glowworms' stretch; the spores come with their own piece) */
export function w3World(): WorldKit {
  return { manifest: w3Manifest(), emit: { ...DARK_EMIT } };
}
