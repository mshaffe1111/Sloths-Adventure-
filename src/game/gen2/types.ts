/**
 * gen2/types — the data shapes of the new stage generator (DESIGN.md). Pure types and a few constants: no engine, no canvas.
 *
 *   WorldManifest     a world's toybox: moves, creatures (threat cost, terrain), props and linked prop pairs, decor sets, its band
 *   SectionTemplate   one hand-authored building block ("chunk"), in LOCAL pixel space: its pieces (platforms), entry and exit anchors,
 *                     tags (archetypes, Kishotenketsu phases), sockets, difficulty, mirrorable; optionally a puzzle room (puzzle kit)
 *   Socket            a slot inside a section, bound to one of its pieces + t along the top + a normal offset (never a fixed x, y)
 *   StageBudget       pass 1: what this stage must be (seconds, difficulty score D, margins, threat budget, quotas)
 *   MissionGraph      pass 2: the stage's beats as nodes (phase, tension, share of the clock, tags it wants)
 *   Placed* / Gen2Stage the result: a GeneratedStage the engine already plays, plus what was built (for tests, the inspector, curation)
 *
 * Coordinates: x grows right, y grows DOWN (the engine's). "dy" in a template is screen dy: negative is up.
 */
import type { Drop, RollVerdict } from './verdicts.types.ts';
import type { Difficulty } from '../difficulty.ts';
import type { Anchor, PieceSpec, RoomSpec } from '../puzzleKit.ts';
import type { GeneratedStage } from '../stageGenerator.ts';
import type { ProtoExtras } from '../protoStage.ts';
import type { Zone } from '../zones.ts';
import type { Collectible, Enemy, EnemyType, LevelConfig, ObjectiveType, Platform, Vine } from '../types.ts';
import type { Rng } from './variety.ts';

export type { Difficulty, Rng };

/** a fixed number, or a range [lo, hi] the roll picks from (uniformly) */
export type Range = number | readonly [number, number];

/** the stage kinds the generator builds (the guardian's lair is always hand-built) */
export type Archetype = Exclude<ObjectiveType, 'boss_lair'>;

/** Kishotenketsu (A1) plus the two book-ends and the breather */
export type Phase = 'start' | 'ki' | 'sho' | 'ten' | 'ketsu' | 'rest' | 'goal';

/** what Pokey can do. walk and jump always; the rest unlock through the game (skills.ts, the worlds' lessons) */
export type Move = 'walk' | 'jump' | 'double' | 'climb' | 'swing' | 'rope' | 'glide' | 'punch' | 'carry' | 'throw' | 'hide' | 'push';

// ───────────────────────────── the world ─────────────────────────────

/** a creature a socket may hold (drawn from the world's bag, paid for from the section's threat budget) */
export interface CreatureDef {
  id: string;
  enemy: EnemyType;
  /** what it costs from a section's threat budget (Gemini: 2 for a beetle, 4 for a cliff hopper) */
  threat: number;
  /** where it can stand: flat ground, a ledge, or in the air (a flier hangs over a stretch) */
  terrain: 'flat' | 'ledge' | 'air';
  /** the shortest patch of ground it may patrol (px) */
  minGround: number;
  /** body size (px) and hit points */
  w: number;
  h: number;
  hp: number;
  /** its feet sit this far under the patch's top (the engine's convention, e.g. World 5's spider at G - 12) */
  footY?: number;
  /** the fields its kind needs beyond the plain Enemy (World 5's spider: hitW, stompable, noThread) */
  extra?: Partial<Enemy>;
  /** Easy keeps it (the world's newest creature always stays on Easy, softened; the rest are paid from the 60% budget) */
  easyFirst?: boolean;
  tags?: string[];
}

/** a world prop a socket may hold (a chair, a cake, a teapot, a humming thread) */
export interface PropDef {
  id: string;
  /** what the sockets ask for */
  tags: string[];
  /** the space it takes along the route (px) and the least gap to another of its kind (Poisson R_min, C2) */
  w: number;
  minApart: number;
  /** a prop that hurts or slows (a cake, a teapot's steam): Easy drops it from sockets marked `easy: 'drop'` */
  hazard?: boolean;
  /** what it costs from a section's threat budget, in the creatures' units (a teapot's steam, the Butler: a prop that acts like an
   *  animal). A socket it would fill holds it only while the section has that much threat left, and it spends it, the way a creature
   *  does, in socket order. Default 0: scenery costs nothing */
  threat?: number;
  /** counts as an action beat for dead time (§2): jumping a thread, dodging steam. Scenery does not */
  beat?: boolean;
  /** the looks it can wear (art keys), rotated by the roll (artRoll.ts rollLook) */
  looks?: string[];
}

/** a linked pair (A7): a source is never placed without its receptor, within [min, max] px of it */
export interface PropPair {
  id: string;
  source: string;
  receptor: string;
  minApart: number;
  maxApart: number;
}

/** a decor set for one job (the garden's bushes, the canopy's moss), rotated by the roll with a cooldown (§4) */
export interface DecorSet {
  id: string;
  job: string;
  /** art keys and their width range */
  items: Array<{ n: string; w: Range }>;
  /** px between items along the ground */
  every: Range;
}

/** how a fall into a gap ends */
export type PitKind = 'soft' | 'water' | 'void';

export interface WorldManifest {
  world: number;
  name: string;
  /** what each stage owns, by stage id (its own beats: a section whose `not` names one is never laid there) */
  owns?: Readonly<Record<string, readonly string[]>>;
  /** the moves a stage of this world may require (on top of walk and jump) */
  moves: Move[];
  /** the world's ground: its top (world y), the bank's depth, the look */
  ground: { y: number; bankH: number; style: NonNullable<Platform['style']> };
  /** a fall: soft pits (a mossy floor and a step out: a miss costs a climb), water (a life), or nothing (a life) */
  pit: PitKind;
  /** how deep a soft pit's floor lies under its lips at most (px): a pit too narrow for wide steps out is shallower, its floor one
   *  plain hop under the far lip (pipeline pitSteps: every dip has a one-jump way out, every step a tread a thumb can land on) */
  pitDepth: number;
  /**
   * World 1's floor families (the planner's floor road, engine-floorroad 4fd9e992; the designer's floor ruling, WORLD-RULEBOOK 9a22b846):
   * each roll draws a hop family by weight. A hop roll (h >= `hopRoll`) keeps every soft pit's floor `shallow` under its lips and leans
   * its ground joins to steps (the route reads hops); a jump roll (h <= `jumpRoll`) lays every soft pit's floor `deep` (past the route's
   * 200 px, so it reads jumps) and leans its joins to pits; a roll between mixes them, slot by slot. The stairs out are pitSteps' own.
   * Absent, the world's pits are `pitDepth` on every roll, as before.
   */
  floorRoll?: { hop: Array<{ range: [number, number]; weight: number }>; shallow: number; deep: number; hopRoll: number; jumpRoll: number;
    /** a catch bough under every gap that is not a pit (a jump between ledges, the canopy's: the designer's ac7a233c, 60-120 px), this far
     *  under the gap's lower lip, reaching from 30 px under the near ledge to 50 px under the far one; one jump back up */
    catchDrop?: number;
    /** the catches' looks, cycled in the order they are laid (['log', 'branch'] alternates); absent, every catch is a branch */
    catchStyles?: ReadonlyArray<'branch' | 'log'> };
  /**
   * World 1's per-roll tempo (the mixer's per-roll draw, w1mix.ts:1072 / spec.ts RollRanges; the designer's measured ranges from old 1-1,
   * 53c0b9960): each roll draws its median gap share (triangular min / mode / max) and its rise band (home, or the hilly break on
   * `hillyShare` of rolls), from its own stream. A section's jump shares are scaled by the roll's median over `gap.centre` (never past
   * `gap.p90`), its rises by the roll's band over `rise.centre`, inside the jump's own limits. The hop family is floorRoll's.
   */
  rollRanges?: { gap: { min: number; mode: number; max: number; p90: number; centre: number }; rise: { home: [number, number]; hilly: [number, number]; hillyShare: number; centre: number } };
  /**
   * The rolled stage graph (NODES.md §4, §6: World 1 first): in place of the one fixed SPINE, a stage of this world rolls one of its
   * archetype's graphs from `list` under its brief (`briefs`, by stage id), then rolls each node's shape and dials. The brief constrains
   * and the roll chooses: the stage's lessons (`lessons`) force its teach nodes, `ends` a finale or a quiet end, `trend` the shapes,
   * `branching` the fork count. Absent, or for a stage with no brief, the stage takes the SPINE, as before.
   */
  graphs?: {
    list: StageGraphDef[];
    briefs: Record<string, GraphBrief>;
    terrains?: string[];
    /** length from the chunk count (CHUNK-POOL-BRIEF step 3), never clock-filling: the stage holds round(its target seconds / this)
     *  sections; a quiet node (the arrival, a rest, a cooldown, the exit) one, the working nodes the rest by their shares. The length
     *  repair still adds or takes a whole section where the modelled clock misses the band */
    chunkSeconds?: number;
    /** the hard no-repeat (STAGE-RULES §0c.2), a construction rule: a section's cap when it names none (World 1: 1) */
    maxPerStage?: number;
    /** the world's content mix (NODES.md §7.3), shares of its content nodes, when a brief names no deal of its own */
    mix?: Readonly<Partial<Record<ContentType, number>>>;
    /** where a content type may stand, as a share of the stage's nodes (V12; 1-1's floating: [0.67, 1]) */
    windows?: Readonly<Partial<Record<ContentType, readonly [number, number]>>>;
    /** the move a content type needs taught first (V3; W1: bounce needs the bounce): never dealt to a node before that move's teach */
    typeNeeds?: Readonly<Partial<Record<ContentType, string>>>;
  };
  /** the vertical corridor clamp (Part 3 §1): the route's ground stays between these world y's; inside `soft` px of an edge the
   *  selector leans toward sections that drift back */
  corridor: { top: number; bottom: number; soft: number };
  /** the world's difficulty band (§1b), in D units; default: bandFor(world) */
  band?: readonly [number, number];
  creatures: CreatureDef[];
  props: PropDef[];
  pairs: PropPair[];
  decor: DecorSet[];
  /** the pickups the world lays (flower variants) */
  flowers: NonNullable<Collectible['botanicalVariant']>[];
  /** the world's building blocks */
  sections: SectionTemplate[];
  /** the share of the sections one roll favours (its theme: pipeline THEME); default THEME.share once the world holds THEME.from
   *  sections or more, else 1 (every roll draws from them all) */
  themeShare?: Range;
  /** px from the spawn that run as one unbroken ground before anything can hurt (Worlds 8-10's safe start, WIP-6: stageGenerator
   *  SAFE_START): the stitcher lays a plain bank after the start section for whatever the runway and the start leave short */
  safeStart?: number;
  /** on Normal a fall at a swing or a glide (a gap under a liana, a glide gap) costs a heart, not a life, and sets him back on the ledge he
   *  left (World 8, Matt 2026-10-31: "hurt, then cost a life"); no pit is laid under them. Easy's stay soft pits */
  heartFalls?: boolean;
  /** the stages of the world gen2 must never build (the signature stage, the guardian's lair) */
  handBuilt: string[];
  /**
   * stage id -> sections every roll of that stage holds once (6-7's water room): placed by the plan, never drawn by weight, at the
   * first slot of the first node they fit (of `phase`, when given) inside the corridor; never swapped out (a roll whose required section fails is rolled again) nor
   * trimmed. A required section that fits no node of the stage is an authoring mistake, and the build says so
   */
  required?: Record<string, Array<{ section: string; phase?: Phase }>>;
  /** mechanic -> the stage that teaches it first (a later stage takes it as known: no tip, and sections that use it are open) */
  lessons?: Record<string, string>;
  /** mechanic -> Dot's line for a 'tip' socket (under 10 words; a new line is marked "(new, needs Matt's approval)" until he says yes) */
  tips?: Record<string, string>;
}

// ───────────────────────────── a section ─────────────────────────────

/** a platform, or one of the two hanging pieces: a `liana` (a swing, placed by `swing`) and a `vine` (a climb, placed by `climb`) */
/** 'hollow': World 1's painted hollow log (w1NewArt.ts), its shell the landing and its inside clear to walk through: its height is the
 *  art's own (hollowLogSize), whatever the section says */
export type PieceShape = 'bank' | 'branch' | 'block' | 'stone' | 'bouncy' | 'liana' | 'vine' | 'hollow';

/**
 * A liana's own swing (Matt, 2026-10-28): it swings by itself, `amp` radians either side of hanging straight down, one there-and-back
 * every `period` seconds on the game clock; the player can't pump it (up and down climb, left and right only turn), and a jump off it
 * carries the vine's velocity at his grip, so letting go is a timing window (pipeline lianaRelease).
 */
export interface LianaSwing {
  amp: number;
  period: number;
}

/**
 * Where a piece goes, relative to another piece of the same section (never a fixed x, y), so the rolls can stretch a piece and the
 * rest follows:
 *   start                the entry piece: its top-left is the section's local (0, 0)
 *   walk                 starts where `after` ends, its top `dy` from `after`'s (0: one long floor; a small step up or down)
 *   jump | double        a gap from the jump envelope: `share` (0..1) of the widest gap the difficulty allows for that rise
 *                        (pipeline maxGap: Easy 0.65, Normal 0.82 of the physical reach, never past what levelCheck accepts)
 *   pit                  a gap at the same height with a pit under it (soft: a floor and a step out); the jump kind decides its width
 *                        (`glide`: the leaf glide's reach, pipeline glideGap; Normal's is past the double jump, so the leaf is the way over;
 *                        its soft pit climbs back to the take-off, as a liana's does, so walking down and out the far side is no way over)
 *   on                   an obstacle standing on `on`'s top, `at` (0..1) along it, `h` px tall (a stump, a block)
 *   over                 a floating ledge over `on`, its left end `at` along it, its top `dy` above (negative) `on`'s top (over a
 *                        vine: `at` 0 is the vine, so `{ on: 'vine', at: 0, dy: 0 }` is a ledge whose left end is the vine's top)
 *   swing                a liana (shape 'liana') hanging past `after`'s end: its anchor `top` px above `after`'s top, `reach` px out
 *                        from the end (what a running jump grabs), swinging by itself (`amp` at most 0.45 rad, `period`: LianaSwing;
 *                        default the engine's, pipeline VINE: 0.45, Normal 2.85 s, Easy 3.3 s). Needs the 'swing' move. A gap with a pit under it runs from `after` to the
 *                        piece that lands from it
 *   land                 a ledge past a liana (`after` names the liana): its near end at `share` of the band where letting go lands
 *                        on it with a release window of at least LIANA.window (Easy 300 ms, Normal 167 ms), `dy` below (+) or above the
 *                        ledge the swing started from. A chain of swings has a perch between every two: liana, land, liana, land
 *                        (levelCheck follows ledge -> liana -> ledge, never liana to liana)
 *   climb                a climbing vine (shape 'vine') standing on `on`, `at` (0..1) along it, `h` px tall. Needs the 'climb' move
 *   rope                 a ledge `gap` px past `after` at its height, a shimmy rope hung across between them (rope.ts: ROPE_RISE over the
 *                        ledges, ROPE_OVERLAP over each): a gap past every jump and glide, so the rope is the way over (World 9's burnt
 *                        bridges, GRAB-BAG.md N8; World 8's rope blooms). Its gap is a liana's: a soft pit climbing back to `after` where
 *                        the world's falls are soft or `soft` says so, World 8 Normal's heart fall where the world asks for them
 * A gap rule (jump, double, pit, land) with `water: true` is water whatever the world's falls (World 6's creeks): nothing is laid under
 * it, the stage has its water line, a fall costs a life on Normal and on Easy alike, and Dot warns before it (WATER_WARN, Matt's rule)
 * A gap rule with `soft: true` has a soft pit under it whatever the world's falls (World 8: in a world whose falls cost a life, its gaps in
 * the dark keep a soft floor, so no jump in the dark is blind)
 */
export type PlaceRule =
  | { kind: 'start' }
  | { kind: 'walk'; after: string; dy?: Range }
  /** `gapPx` (the designer's pixel bands, 11-06: a double's TEACH 195-205, its TEST 205-230): the gap laid in this band exactly, in place of
   *  `share`, never scaled by the roll's tempo or the jump's reach; a band past the reach fails the section by name */
  | { kind: 'jump' | 'double'; after: string; dy?: Range; share?: Range; gapPx?: [number, number]; water?: boolean; soft?: boolean }
  | { kind: 'pit'; after: string; jump: 'jump' | 'double' | 'glide'; share?: Range; gapPx?: [number, number]; water?: boolean; soft?: boolean }
  | { kind: 'on'; on: string; at: Range; h: Range }
  | { kind: 'over'; on: string; at: Range; dy: Range }
  | { kind: 'swing'; after: string; top?: Range; reach?: Range; amp?: Range; period?: Range }
  | { kind: 'land'; after: string; dy?: Range; share?: Range; water?: boolean; soft?: boolean }
  | { kind: 'climb'; on: string; at: Range; h: Range }
  | { kind: 'rope'; after: string; gap: Range; soft?: boolean };

export interface SectionPiece {
  /** the piece's name inside its section (sockets and rooms point at it) */
  key: string;
  /** a BLOCK lands here (NODES.md §8.7 B1-B4): the way on needs the move. 'double': no single jump reaches this piece from anything
   *  before it; 'bounce': no double does, so only the mushroom's bounce lands it. Checked on the laid stage in a teach or test node
   *  (pipeline blockBreaches): a section whose block can be walked round there is swapped, never laid */
  block?: 'double' | 'bounce';
  /** a 'bounce' block's mushroom (the key of the bouncy piece it is reached from): its rise is clamped to the bounce's own reach from
   *  that cap (physics bounceV's rise plus one air jump, x 0.95), never a walk's or a jump's, so a bounce lip can stand 200-225 px up */
  from?: string;
  shape: PieceShape;
  /** width (px) */
  w: Range;
  /** thickness (px): a bank's depth below its top; an `on` block's is its own height */
  h?: number;
  place: PlaceRule;
  style?: Platform['style'];
  /** a landing (a jump lands on it): Easy widens it by EASY_LANDING px on the side the jump comes from */
  landing?: boolean;
  /** part of the main route (what the repair pass may stretch or bridge); a high road's branch is not */
  main?: boolean;
  /**
   * a crumbling ruin tile (World 7, zones.ts CRUMBLE_TILE_W wide, holding crumbleTime(stage) s once stood on): never on the main route
   * and never needed (STAGE-RULES §1: a tile is a shortcut or a hurry; pipeline checkStage proves the stage without its tiles). The
   * section's tiles lie in one crumble zone (its rules: levelCheck's runs of at most CRUMBLE_RUN_MAX, steps of at most CRUMBLE_STEP), so
   * no animal or flag stands on or over them
   */
  crumble?: boolean;
}

/** what a socket can hold */
export type SocketRole =
  | 'enemy'      // a creature from the world's bag, paid from the threat budget
  | 'pickup'     // a flower (or the stage's quota item: cage, relic) on the surface
  | 'arc'        // a petal arc over a jump (half a beat, E1)
  | 'prop'       // a world prop (chair, cake, thread, teapot)
  | 'source'     // the source half of a linked pair (A7): filled only together with its receptor
  | 'receptor'   // the receptor half (names its source in `link`)
  | 'objective'  // the stage's goal item (cage / relic / cocoon): filled from the mission graph's quota
  | 'find'       // a hidden find off the main line (World 1's golden seed: rulebook §4 rule 12), filled once a stage, by the first one met
  | 'flag'       // a checkpoint (rests carry one)
  | 'tip'        // Dot's line about this section's mechanic (the first time it appears: the teaching rule)
  | 'decor';     // scenery only, from the world's decor set

export interface Socket {
  id: string;
  role: SocketRole;
  /** the piece it sits on, how far along its top (0 left end, 1 right end) and how far above it (px, the surface normal) */
  on: string;
  t: Range;
  dn?: number;
  /** what may fill it: props', creatures' or pickups' tags (empty: anything of its role) */
  allow?: string[];
  /** a receptor: its source's socket id (the same section). A source with no receptor is never filled */
  link?: string;
  /** enemy sockets: the most threat it may take */
  maxThreat?: number;
  /** a socket the roll may leave empty (0..1 chance of filling); required sockets have none */
  chance?: number;
  /** on Easy: keep it, drop it, or keep it softened (a slower creature, a longer tell) */
  easy?: 'keep' | 'drop' | 'soften';
  /** only filled in these phases (a twist socket that sleeps in a Ki section) */
  phases?: Phase[];
  /** pickups: how many in a row and over what span (px) */
  count?: number;
  span?: number;
}

/** one sub-block: its versions (each its own pieces and sockets); every version must leave the same piece keys the rest refers to */
export interface SubBlock {
  id: string;
  /** `easy`: the id of the version Easy lays in this one's place (the designer's §8.7 amendment, 11-06: on Easy every double gap block is
   *  a rise, its "easy-" twin, same beats); `easyOnly`: never drawn, laid only as another version's twin */
  versions: Array<{ id: string; pieces: SectionPiece[]; sockets?: Socket[]; weight?: number; easy?: string; easyOnly?: boolean }>;
}

/** a puzzle room inside a section: the puzzle kit's RoomSpec with its anchors on the section's own pieces (by key) */
export interface LocalAnchor {
  on: string;
  at: number;
  dx?: number;
  dy?: number;
}
/** every anchor of a piece (its `at`, a sapling's `to`, a teapot's `trough` points) on the section's pieces by key */
type LocalField<T> = T extends Anchor ? LocalAnchor : T extends readonly Anchor[] ? LocalAnchor[] : T;
/** (and a piece's `vine` names the section's vine piece by key: placeRoom puts the laid vine's id in) */
type Localize<P> = P extends unknown ? { [K in keyof P]: K extends 'vine' ? string : LocalField<P[K]> } : never;
export type LocalPieceSpec = Localize<PieceSpec>;
export interface LocalRoomSpec extends Omit<RoomSpec, 'left' | 'right' | 'beyond' | 'ground' | 'pieces'> {
  left: LocalAnchor;
  right: LocalAnchor;
  beyond: LocalAnchor;
  ground: string[];
  pieces: LocalPieceSpec[];
}

/**
 * A zone a section lays over its own pieces (the engine's zones.ts Zone, placed by piece key):
 *   tide   World 6's mudflat (6-4 Low Tide): the piece `on` is the mud, a bank on each side of it (levelCheck: its neighbours end and
 *          start at its ends); the water rises on a timer and sweeps him back toward where he came from. `low` is the low spell (s,
 *          default TIDE.low), never shorter than the walk across the mud takes (zones.ts tideCrossTime: the pipeline lengthens it);
 *          `warn` (>= 0.9 s), `active` (<= 3 s) and `force` (px/s) default to TIDE's. Its beat on the clock is rolled per use
 *   wind   a gust over the gap a section lays before the piece `on` (World 8's night gusts over the glides): zones.ts's wind, its box from
 *          the take-off lip to the landing with a pad on each side, blowing `dir` (a tailwind, +1, by default: it carries a glide further,
 *          and levelCheck's headwind rule would refuse a glide's gap); `idle` the lull between gusts (s, never under 2), `force` px/s
 *          (<= 160, levelCheck). Its beat is the gust (beats.ts 'wind gust')
 * Nothing stands or flies inside a zone (no animal, no flag: levelCheck), so creature sockets and flags inside one stay empty.
 */
export type SectionZone =
  | { kind: 'tide'; on: string; low?: Range; warn?: number; active?: number; force?: number }
  | { kind: 'wind'; on: string; dir?: 1 | -1; idle?: Range; active?: number; force?: number };

/** a tide zone's defaults (zones.ts tideRecipes): a long low spell, a rise you can see coming, high water */
export const TIDE = { low: [5.6, 7.0], warn: 1.8, active: 2.2, force: 190 } as const;

/** how a section joins its neighbours: on the ground (a walk, a step or a pit between) or from a ledge (a jump) */
export type PortKind = 'ground' | 'ledge';

/** what the section asks of the player, for the time model and the dead-time rule: a beat at local x */
export interface SectionBeat {
  x: number;
  /** the inspector's letters (beats.ts): h hop, J gap jump, V world move, C creature, P carry/throw, S mechanism */
  letter: 'h' | 'J' | 'V' | 'C' | 'P' | 'S';
}

export interface SectionTemplate {
  id: string;
  /** what it is for, in a few words (the inspector's beat name) */
  name: string;
  archetypes: Archetype[] | 'any';
  /** the stages it may be laid in (stage ids, e.g. '1-1'); unset: any stage of its world. The pool is cut to it before anything is
   *  chosen (pipeline stagePool), so no slot, loosened or not, lays another stage's section (the red team, 11-05) */
  feel?: readonly string[];
  /** what it must never serve: never laid in a stage that owns any of these (manifest.owns) */
  not?: readonly string[];
  phases: Phase[];
  /** 1 (gentle) .. 10 (hard): picked when the node's tension, scaled into the stage's band, is near it */
  difficulty: number;
  /** the moves it needs (a section asking for an unlocked move is never picked) */
  needs?: Move[];
  /** the mechanic it shows (a 'tip' socket's line comes the first time a stage meets it) */
  teaches?: string;
  /** mechanics it relies on: it is only picked once each was taught (by an earlier stage, manifest.lessons, or a section before it) */
  uses?: string[];
  /** at most this many in one stage (a puzzle room: 1) */
  maxPerStage?: number;
  pieces: SectionPiece[];
  entry: { piece: string; kind: PortKind };
  exit: { piece: string; kind: PortKind };
  /** about how far the exit sits above (negative) or below the entry: what the corridor clamp steers by */
  exitDy: number;
  sockets: Socket[];
  /**
   * Spelunky's sub-blocks (A5): a stretch of the section with several authored versions, one rolled per use (2 sub-blocks of 3
   * versions and 4 sockets of 3 fillings give 9 x 81 plays of one section). Each version's pieces follow the same place rules; any
   * piece (the section's or a version's) may refer to any other, and they are laid in the order their references allow. Every
   * version of a sub-block must give the piece keys the rest of the section refers to. The roll picks by weight, and a version
   * already used in this world (WorldOnce, preloaded from BuildRequest.usedVersions) waits until the others have had their turn.
   */
  subBlocks?: SubBlock[];
  room?: LocalRoomSpec;
  /** zones it lays over its pieces (a tide over a mudflat, darkness over a hollow) */
  zones?: SectionZone[];
  /** may be flipped left to right (a room never is: it reads left to right; painted light stays upper left) */
  mirrorable: boolean;
  /** how often the bag holds it (default 1) */
  weight?: number;
  /**
   * World 1's floor families (manifest floorRoll): a 'hop' section keeps to the floor road, its gaps hops with the floor near under
   * them; a 'jump' section runs stones or logs over the floor road laid deep under them (more than 200 px, so the route reads jumps),
   * entering and leaving on the ground. The roll's hop family weighs them: a hop roll draws hop sections, a jump roll jump sections. A
   * pit's own floor stays as deep as its steps out allow (pitSteps): the deep floor of a jump run is the section's, not a pit's.
   */
  floor?: 'hop' | 'jump';
  /** a stretch of the stage this section may stand in, as a share of the stage's chunks [from, to] (1-1's boughs, the late reward: the
   *  designer's last third, [0.67, 1]); outside it the section is never drawn */
  window?: [number, number];
  /** the node jobs this section serves (NODES.md §1). Read only in a world with `graphs`: there a section that names its jobs fits only
   *  nodes with one of them (a fork node only a two-road section); a section that names none fits by its phases, as everywhere else */
  jobs?: NodeJob[];
  /** the world's terrain family it belongs to (NODES.md §3: W1's floor and stones, raised logs, mounds, boughs): a node's terrain dial
   *  weighs its own family up */
  terrain?: string;
  /** its content type (NODES.md §7.2; a fork takes its low road's), read by the deal and written into the node code's content letter */
  content?: ContentType | 'structural';
  /** a two-answer twist's answers (NODES.md §8.7 B5): copied into its node's gen2.nodes[].moves */
  answers?: Array<'double' | 'bounce'>;
  /** extra seconds a typical first-timer spends here beyond walking its length (a room, a fight) */
  extraSeconds?: number;
}

// ───────────────────────────── pass 1: the budget ─────────────────────────────

export interface StageBudget {
  id: string;
  world: number;
  stage: number;
  archetype: Archetype;
  difficulty: Difficulty;
  /** D(world, stage) (F2), inside the world's band (§1b) */
  D: number;
  band: readonly [number, number];
  /** 0..1: where D sits in the band (what the sections' difficulty is matched against) */
  heat: number;
  /** the typical player's target, the fast player's floor (stageTime fastFloor, and never under what keeps the inspector's quick
   *  player at 2:00: pipeline QUICK) and the typical player's ceiling */
  seconds: { target: number; fastFloor: number; max: number };
  /** the jump margin (D2, Part 1 §3): the widest required gap is this share of the physical reach */
  margin: number;
  /** a required rise is at most this share of the jump's height */
  riseShare: number;
  /** px added to each landing on Easy (Part 1 §3 "+2 tiles") */
  landingPad: number;
  /** the threat a section of tension 1 may hold (scaled by the node's tension); Easy pays 60% */
  threat: number;
  enemyShare: number;
  /** the stage's goal (config.targetCount) and the items to lay for it (a margin over the goal) */
  /**
   * the stage's goal (config.targetCount, the designed number: it is never changed to what was laid), what levelCheck holds this
   * difficulty to (`check`: Easy's purge/gauntlet goal is easyMode's round(0.6 x goal); otherwise the goal), and what to lay for it
   */
  quota: { goal: number; check: number; lay: number };
  pit: PitKind;
  /** the longest quiet stretch (s) outside a rest (§2 dead time: ~2 s Normal, ~3 s Easy) and the walk speed it is measured at */
  quiet: number;
  walkSpeed: number;
  moves: Move[];
}

// ───────────────────────────── pass 2: the mission graph ─────────────────────────────

export type NodeRole = 'start' | 'teach' | 'develop' | 'rest' | 'twist' | 'climax' | 'goal' | 'alcove';

export interface MissionNode {
  id: string;
  role: NodeRole;
  phase: Phase;
  /** 0..1, the sawtooth (A6): Ki 0.2-0.4, Sho 0.5-0.7, rest 0.1, Ten 0.6-0.85, Ketsu 0.95, goal 0 */
  tension: number;
  /** share of the stage's seconds this node fills (the spine's shares add up to 1) */
  share: number;
  /** tags the node's sections should carry (a stealth stage's 'cover', a vine runner's 'swing') */
  want?: string[];
  /** quota items this node must lay (rescue cages, relics) */
  objectives?: number;
  /** a side branch off this node (Dead Cells' key room, a rescue alcove); phase 1 lays alcoves inline */
  branch?: MissionNode[];
  /** a rest ends with a flag */
  flag?: boolean;
  /** a rolled graph's node (manifest `graphs`): its job, its shape and its dials; a teach node's move */
  job?: NodeJob;
  shape?: NodeShape;
  dials?: NodeDials;
  teaches?: string;
  /** a rolled graph's node with `chunkSeconds`: how many sections it holds */
  count?: number;
  /** a content node's type, from the stage's deal (NODES.md §7.5): its sections are drawn from that type first */
  content?: ContentType;
  /** V19 (NODES.md §8.3): the node after a descent in a trend-up stage's last third must end higher, so it takes rising sections only */
  mustRise?: boolean;
}

/** a node's job (NODES.md §1, §8.0's key): what it asks of the player. The graphs roll arrive to exit; the rest are LATER nodes (§6), or
 *  tags a section may carry for a node's part (cooldown-in-node, choice-reward, reward), all named as the W1 kit names them */
export type NodeJob =
  | 'arrive' | 'teach' | 'practise' | 'fork' | 'rest' | 'flow' | 'combine' | 'climb' | 'descent' | 'twist' | 'test' | 'signature' | 'finale' | 'exit'
  | 'reward' | 'pressure' | 'puzzle' | 'arena' | 'story' | 'preview' | 'change' | 'cooldown-in-node' | 'choice-reward';
/** a node's shape (NODES.md §2) */
export type NodeShape = 'flat' | 'rising' | 'falling' | 'two-road';
/** a node's rolled dials (NODES.md §3): tempo (hurry or patience, even odds), density (climbing through the stage), height (up, level
 *  or down inside the node, from its shape), terrain (a family from the world's list), rating (1-10, the cadence: ramps and cools) */
export interface NodeDials { tempo: 'hurry' | 'patience'; density: 'low' | 'medium' | 'high'; height: 'up' | 'level' | 'down'; terrain?: string; rating: number }
/** a stage graph (NODES.md §4), one of an archetype's several, stored as its node code (§8.4: jobs and shapes, `A T P F R X R S E`) */
export interface StageGraphDef { id: string; archetype: Archetype; code: string }
/** the parts of a stage's brief (WORLD-RULEBOOK §5) the graph reads */
export interface GraphBrief {
  ends: 'quiet' | 'finale';
  trend: 'up' | 'down' | 'level';
  branching: 'none' | 'some' | 'lots';
  /** the moves this stage teaches, in order (a section's `teaches`); absent, the world's `lessons` for this stage */
  teaches?: string[];
  /** the stage's content deal (NODES.md §7.3, 1-1: ground 40, floating 25, climb 20, bounce 15), shares of its content nodes; absent,
   *  the world's mix (`graphs.mix`) */
  deal?: Readonly<Partial<Record<ContentType, number>>>;
  /** the end stands higher than the route where the bough window begins (V19b, 1-1's story promise: "up in the high branches"): the
   *  node that climbs late (after a late descent, or with none the signature) ends above the window's start too */
  endHigh?: boolean;
  /** no fall in this stage costs a life, on Easy or Normal (1-1, where the controls are learned: the lead's ruling R-165.53, R-165.86):
   *  a fall past the bottom anywhere that is not water sets him back on the ledge he left, nothing lost (Gen2Meta.softFalls; the
   *  engine's softOn). The stage's gaps and soft zones are laid exactly as without it */
  softFalls?: boolean;
}
/** a content type (NODES.md §7.2): what fills a content node; `structural` sections (arrive, rest, exit) sit outside the mix */
export type ContentType = 'ground' | 'floating' | 'climb' | 'bounce' | 'rope' | 'crumble' | 'water' | 'hazard' | 'puzzle';

export interface MissionGraph {
  archetype: Archetype;
  /** horizontal stages run right; an ascent runs up (phase 2) */
  flow: 'right' | 'up';
  nodes: MissionNode[];
  /** the rolled graph's id (manifest `graphs`); absent on the SPINE */
  id?: string;
  /** the content deal it was dealt (NODES.md §7.5): content nodes per type */
  deal?: Partial<Record<ContentType, number>>;
}

// ───────────────────────────── pass 3-4: what was placed ─────────────────────────────

export interface PlacedPiece {
  key: string;
  platform: Platform;
  main: boolean;
  landing: boolean;
}

export interface PlacedSection {
  /** the instance's id in the stage (s1, s2...) */
  uid: string;
  template: string;
  node: string;
  phase: Phase;
  tension: number;
  mirrored: boolean;
  /** the world origin of its entry anchor, and its exit anchor */
  entry: { x: number; y: number };
  exit: { x: number; y: number };
  x0: number;
  x1: number;
  pieces: PlacedPiece[];
  /** platforms the stitcher laid before it (a pit's floor and walls, a helper stone) */
  seam: Platform[];
  /** its hanging pieces (lianas and climbing vines), by key; a liana carries its own swing */
  vines: Array<{ key: string; vine: Vine; swing?: LianaSwing; window?: number; gap?: [number, number] }>;
  /** the sockets resolved to world points (filled in pass 4) */
  sockets: Array<{ socket: Socket; x: number; y: number; piece: Platform }>;
  room?: RoomSpec;
  beats: Array<{ x: number; letter: SectionBeat['letter'] }>;
  /** the seconds the time model expects (the walk plus extraSeconds) */
  seconds: number;
}

export interface FilledSocket {
  section: string;
  socket: string;
  role: SocketRole;
  /** what went in (a creature's, prop's or flower's id; empty when the roll left it empty) */
  what: string | null;
  x: number;
  y: number;
  /** a tip whose id named no Dot line: nothing was said (the roll fails by name, pipeline buildGen2Stage) */
  unsaid?: boolean;
}

/**
 * What a world's code does with a filled prop socket (World 5: a chair into W5Extras.chairs). The manifest stays data; the emitters
 * are the one piece of code per world (gen2/worlds/wN.ts), so the engine keeps reading the extras it already plays.
 */
export type PropEmitter = (fill: FilledSocket, prop: PropDef, out: StageSink) => void;

/** where the passes put what they build */
export interface StageSink {
  platforms: Platform[];
  enemies: Enemy[];
  collectibles: Collectible[];
  proto: ProtoExtras;
  /** the world's own extras (World 5: proto.w5), for its emitters */
  extras: Record<string, unknown>;
  /** the stage's zones (zones.ts): the sections' own, and any an emitter lays (a prop's darkness over its span); no animal or flag
   *  is left standing inside one */
  zones: Zone[];
  nextPlatformId: () => number;
  nextCollectibleId: () => number;
  nextEnemyId: () => number;
}

/** one world, ready to build from: the data, and its emitters */
export interface WorldKit {
  manifest: WorldManifest;
  emit?: Record<string, PropEmitter>;
  /** the world's scenery drawer: where the chosen decor set's items go (World 5: proto.w5.decor); default sink.extras.decor */
  decorate?: (items: Array<{ n: string; x: number; y: number; w: number; set: string }>, out: StageSink) => void;
  /** called for every creature the stage lays (a socket's or a purge's top-up): where the world registers its own (World 5: a
   *  sleeping spider into proto.w5.spiders with `doze`, from a creature tagged 'sleeper') */
  spawn?: (e: Enemy, c: CreatureDef, out: StageSink) => void;
}

/** a local repair the validation pass made (D3) */
export interface Repair {
  kind: 'stone' | 'stretch' | 'swap' | 'reroll' | 'length';
  section?: string;
  note: string;
}

/** one slot of a stage's plan: which section, flipped or not, for which node, and how it joins the one before */
export interface PlanSlot {
  template: string;
  mirrored: boolean;
  node: string;
  join: 'walk' | 'step' | 'pit' | 'jump';
  /** the sub-block versions it rolled (sub-block id -> version id), so Easy lays the same ones */
  versions?: Record<string, string>;
  /** the slot's stream salt (a swap at this slot moved it): Easy rolls the slot's geometry from the same stream */
  salt?: number;
  /** a rolled graph's slot filled past its rule (the pool ran out): why */
  loose?: string;
}

/** a key for a sub-block version, as WorldOnce and BuildRequest.usedVersions hold it */
export const versionKey = (template: string, subBlock: string, version: string): string => `${template}/${subBlock}/${version}`;

export interface Gen2Meta {
  /** the seed the shipped layout was built from (the request's, or a re-roll's) */
  seed: number;
  /** the game's road (provenGen2Stage): the seed it was asked for, the seed it played (the first on its walk that both settings lay
   *  cleanly) and how many it tried; only when it walked off the asked seed */
  proven?: { asked: number; used: number; tried: number };
  /** V19's late rise as laid (an up stage): each node after a late descent, the height it had to end above (less 20 px), where it ended */
  rise?: Array<{ node: string; to: number; exitY: number }>;
  /** the section sequence: Easy lays Normal's; curation compares neighbouring stages' plans (C4) */
  plan: PlanSlot[];
  /** whole-stage re-rolls used (0: the first roll passed) */
  rerolls: number;
  repairs: Repair[];
  budget: StageBudget;
  graph: MissionGraph;
  /** a rolled graph's realised node code (NODES.md §8.1-8.2): one token per node, and the stage string they make; the validity rules
   *  it breaks (§8.3, "V5 at token 9: ..."), empty when it is valid. Absent on the SPINE */
  code?: string[];
  codeString?: string;
  codeErrors?: string[];
  /** V19b as stage.ts judges it (storyChecks endAboveWindow, the one window definition): the miss, by name; a stage with an endHigh brief only */
  windowMiss?: string;
  /** a rolled stage's flags against ROLLED_FLAGS (pipeline rolledFlagBreaches), each miss by name */
  flagMiss?: string[];
  /** the brief the rolled graph was rolled under (manifest graphs.briefs) */
  brief?: GraphBrief;
  /** the stage's brief says no fall costs a life (GraphBrief.softFalls): what the engine reads (pipeline.ts softFallStage) */
  softFalls?: true;
  /** each node as laid, for the gates that read the built stage (V18's nodePieces.ts, the stills spots): its token, the x-range its
   *  sections cover, its first block's landing x (NODES.md §8.7) when it has one, and a twist's two answers (B5) */
  nodes?: Array<{ token: string; x0: number; x1: number; block?: number; moves?: Array<'double' | 'bounce'> }>;
  /** a rolled graph's slots filled past their rule because the pool ran out (pipeline layStage: the dealt type, then the job) */
  loosened?: string[];
  /** a rolled graph's required sections that found no node, and why (the roll fails: gen2.errors names them) */
  missing?: string[];
  sections: Array<Pick<PlacedSection, 'uid' | 'template' | 'node' | 'phase' | 'tension' | 'mirrored' | 'x0' | 'x1' | 'seconds'>>;
  fills: FilledSocket[];
  /** the sections the roll's theme favoured (pipeline THEME; absent when it favoured them all) */
  theme?: string[];
  /** the decor sets the roll chose, by job */
  looks: Record<string, string>;
  /** the time model's seconds (typical and fast players) */
  modelled: { typical: number; fast: number };
  /** levelCheck's verdict on the shipped layout */
  errors: string[];
  /** stretches longer than the dead-time cap with nothing interactive (poissonPlace's `unfilled`), [x0, x1] */
  barren: Array<[number, number]>;
  /** the route's gaps and what a fall into each one ends in (soft: a climb out; water or void: a life; a section's `water` gap is water) */
  falls?: Array<{ x0: number; x1: number; y: number; kind: PitKind }>;
  /** the roll's verdicts by setting (R-165.61, ADR-001; pipeline applyVerdicts): the build's own setting, and on an Easy build Normal's
   *  too (Easy lays Normal's plan). 1-1 is judged; every other stage carries every name as `notJudged` (THE BOUNDARY, packet E0a).
   *  `errors` stays, and carries each failed verdict's line (rollErrors) */
  verdicts?: Partial<Record<Difficulty, RollVerdict>>;
  /** every fall on the route as a Drop: what it ends in and how its bottom is drawn (ADR-001 decision 6; from `falls`, which stays) */
  drops?: Drop[];
}

/** the result: the stage the engine plays (GeneratedStage, with the hand-built stages' proto extras), and what gen2 built */
export type Gen2Stage = GeneratedStage & { proto: ProtoExtras; gen2: Gen2Meta };

/** what the pipeline needs to build one stage */
export interface BuildRequest {
  config: LevelConfig;
  kit: WorldKit;
  /** the layout roll: the same roll gives the same stage, on Easy and Normal alike (same layout seed, different rules) */
  seed: number;
  difficulty: Difficulty;
  /** whole-stage re-rolls allowed after local repair fails (LEVEL_ATTEMPTS' role) */
  maxRerolls?: number;
  /**
   * Rules the caller holds a roll to beyond the pipeline's own (R-165.120: the seed list's quiet line, judged on a bot's route by
   * tools/engine/listRules.ts, which the game never ships). The search asks them last, of a roll nothing else refuses, and repairs
   * for them as for its own: a line that names a slot swaps the section there, the rest roll again. A roll they still refuse
   * carries their lines in gen2.errors. Whoever lists a seed under them must check and replay it under them too.
   */
  also?: (st: Gen2Stage, difficulty: Difficulty) => ReadonlyArray<{ line: string; slot?: number }>;
  /** the section ids the stage before this one shipped (its curated roll): kept out while others are left (C4, across stages) */
  recent?: string[];
  /** the sub-block versions (versionKey) the world's earlier stages shipped: each waits until the others have had their turn (C4) */
  usedVersions?: string[];
  /** build this stage's proven plan instead of searching for one (gen2/seedList.ts: the seed list holds each seed's final plan and the
   *  seed it was laid from): one lay and one check, the search's own result; the seed list's --check holds it identical to the search */
  replay?: { seed: number; plan: PlanSlot[]; rerolls: number; foes?: Array<[string, string]> };
  // (`foes`: Normal's kept animals, section/socket -> creature (pipeline keptFoes); given, an Easy replay lays from it with no Normal build)
}

// ───────────────────────────── constants ─────────────────────────────

/** Gemini's margins (Part 1 §3, D2): a required gap is at most this share of the physical jump reach */
export const MARGIN = { easy: 0.65, normal: 0.82 } as const;
/** Easy's wider landings (Part 1 §3's "+2 tiles", in px) */
export const EASY_LANDING = 48;
/** Easy's enemy budget (Part 1 §3: 60%) */
export const EASY_ENEMY_SHARE = 0.6;
/**
 * Water on Easy (Matt, 2026-10-28): Easy's falls on land are soft, but water still costs a life, with a clear warning before it.
 * Dot's warning comes `lead` px before the water's lip (and a sign stands at the edge: Gen2Stage proto.gen2.waterWarnings); on Easy
 * again at every water gap once `every` seconds of walking have passed since the last warning. Normal warns at the first water only.
 */
export const WATER_WARN = { lead: 480, every: 12 } as const;
/** Dot's warning line, when the manifest has none (`tips.water`): Matt's words, approved 2026-10-28 */
/** Dot's warning before gen2 water (Worlds 6-10: Pokey can swim by then, so the deadly water is dirty or fast; Matt approved, 2026-10-29) */
export const WATER_LINE = "Careful! That water's dirty and fast. Flick up and over.";
/** the quiet a stretch may have before it is dead time (§2 / E2) */
export const QUIET = { easy: 3.0, normal: 2.0, rest: 4.0 } as const;
/**
 * Lianas (World 6): the release window a jump off one must leave onto the next perch (s: Easy 300 ms, Normal 167 ms, five frames at
 * 30 fps), and the defaults of the `swing` place rule: how high above the ledge it hangs from, how far out from the ledge's end, and
 * its length (it hangs to 30 px under the ledge at most). Its swing is the engine's (pipeline VINE) unless the section sets one
 */
export const LIANA = {
  window: { easy: 0.3, normal: 0.167 },
  top: [360, 420],
  reach: [160, 190],
  len: 410,
} as const;
