import { w4Normal } from './w4Normal.ts';
import { groundToFloor } from './groundFloor.ts';
import { teachWater } from './waterTeach.ts';
import { buildKitStage, KIT_STAGE_ID } from './kitStage.ts';
import { addDress, buildProtoStage, HAND_STAGES, protoStageEnabled } from './protoStage.ts';
import { buildGen2ForGame, GEN2_STAGES, isGen2Stage } from './gen2/game.ts';
import { capFlagSpans, heartBy } from './easyMode.ts';
import { dipWayOut } from './dipWayOut.ts';
import type { Difficulty } from './difficulty.ts';
import { buildW2Stage, W2_STAGES } from './w2Stages.ts';
import { DOT_STAGE_ID, dotGeneratedStage } from './dotFlightStage.ts';
import { MEECA_STAGE_ID } from './extraStages.ts';
import { meecaGeneratedStage } from './meecaStage.ts';
import { ctestEnabled, ctestSeed } from './playRecorder.ts';

/** the stage the control test replaces (no story scene before it); its layout is a new mix each run (playRecorder.ts ctestSeed) */
export const CTEST_STAGE_ID = '1-2';
import type {
  LevelConfig,
  Platform,
  Vine,
  Rope,
  Enemy,
  BossEntity,
  Collectible,
  TreeStructure,
  ObjectiveType,
  LaneFork,
} from './types.ts';
import { calculateDifficultyScaling } from './rules.ts';
import { WORLDS_DATA } from './worldsData.ts';
import { ASSIST, easeAssist, reachBounce, reachGlide, reachJump, TAKEOFF_SLACK } from './physics.ts';
import { HANG_DROP, ROPE_MIN_GAP, ROPE_OVERLAP, ROPE_RISE, ropeYAt } from './rope.ts';
import { skillGuaranteedAt, skillHeldAt } from './skills.ts';
import { PICKUP_APART, swingLandings, validateStage } from './levelCheck.ts';
import { LEVEL_ATTEMPTS } from './levelSeeds.ts';
import { bossMaxHp, newBrain } from './bossAI.ts';
import { bossDefForLevel } from './bossDefs.ts';
import { PILLAR } from './sovereignFight.ts';
import { SECRET_GATE_LEVEL } from './secret.ts';
import { addJumpTrails } from './jumpTrails.ts';
import { fixPickups } from './flowerReach.ts';
import { findForStage } from './finds.ts';
import { pieceWidth, zoneRecipes, crumbleTime, CRUMBLE_TILE_W, CRUMBLE_RUN_MAX, CRUMBLE_STEP, type Zone, type ZonePiece } from './zones.ts';
import { balanceStyles, styleFor, type PlatformKind } from './platformStyles.ts';
import { buildYard, type YardVariant } from './stageYards.ts';
import { buildFork, forkDelta, planFork, FORK_MIN_DELTA } from './stageForks.ts';
import { hazardBlocks, jumpEdges } from './stageMetrics.ts';
import { MODEL_FAST, MODEL_TYPICAL, fastFloor, modelStage, targetSeconds } from './stageTime.ts';
import { driftX, logLayout, riverRecipes, LOG_DROP, LOG_HEIGHT, surfaceBelowBank, type RiverRecipe, type RiverZone } from './river.ts';

export interface GeneratedStage {
  config: LevelConfig;
  trees: TreeStructure[];
  platforms: Platform[];
  vines: Vine[];
  /** shimmy ropes across gaps (the engine only lets Pokey use them once he has the skill) */
  ropes?: Rope[];
  enemies: Enemy[];
  boss: BossEntity | null;
  collectibles: Collectible[];
  spawnX: number;
  spawnY: number;
  exitTotemX: number;
  exitTotemY: number;
  daisyX?: number;
  daisyY?: number;
  /** boss levels: the fenced fighting area (the player is kept inside while the boss lives) */
  arena?: { left: number; right: number; floor: number };
  /** mid-level respawn flags (Mario-style) */
  checkpoints?: Array<{ x: number; y: number; reached: boolean }>;
  /** y of the water/pit surface; falling below it costs a life */
  waterY?: number;
  /**
   * water taught before it costs a life (waterTeach.ts, LV-8), on hand-built and old-generator stages: the painted warning sign at the
   * first water (the foot of its post), teaching pools (water under the floor there costs no life: a splash and back to backX, backY),
   * and Dot's warning (said once he passes x, gone once he is past passX) on a stage with no hand-built hints to carry it
   */
  waterSigns?: Array<{ x: number; y: number }>;
  safeWater?: Array<{ x0: number; x1: number; backX: number; backY: number }>;
  waterHint?: { x: number; text: string; passX: number; shown?: boolean };
  /** World 2: rivers with drifting logs (their water, and the surface that is fatal) */
  rivers?: import('./river.ts').RiverZone[];
  /** Worlds 3 and 4: spore clouds and wind gusts that wake on a rhythm (see zones.ts) */
  zones?: import('./zones.ts').Zone[];
  /** the two-lane forks of the stage (see LaneFork): each lane is checked on its own by the validator and timed on its own by stageTime.ts */
  lanes?: LaneFork[];
  /**
   * 4-7: warm air rising out of the mist (the same objects as proto.w4.updrafts): an open leaf in it rises to its top, so the validator
   * lets him ride one up and drift off it onto a ledge (a ledge only the warm air reaches)
   */
  updrafts?: Array<{ x0: number; x1: number; top: number; bottom: number }>;
  /** 4-7: a fall this far below the ground he last stood on is a fall into the mist (w4Play deepFall), so the validator joins no drop deeper */
  deepFall?: number;
  /** Dot's netting flight (dotFlightStage.ts): she flies it, there is no ground, and the engine hands the stage to dotFlightRun.ts */
  dot?: import('./dotFlightStage.ts').DotStage;
  /** one-way ways on that are no jump or climb, for the level check: from a platform to a platform (7-4: the crumble and the slide) */
  links?: Array<{ from: number; to: number }>;
  /** puzzle rooms (puzzleKit.ts, run by puzzlePlay.ts): their pieces and wires, for a hand-built stage or the generator alike */
  kit?: import('./puzzleKit.ts').KitExtras;
  /** the goal Easy keeps: the stage's own quota, before goals.ts raised it to Normal's share of what the stage holds */
  easyGoal?: number;
  /** Normal's goal, set with easyGoal (goals.ts withGoals): Easy scales it to the animals it keeps (easyMode.ts) */
  normalGoal?: number;
  /** Easy's goal before LV-6 (goals.ts withGoals): Easy's goal never goes under it */
  easyToday?: number;
  /** what the generator built (for tests and debugging) */
  meta?: {
    attempt: number;
    chunks: string[];
    width: number;
    recipe?: { core: string; partner: string | null; fork: string };
    /** the pieces in order, with the stretch of the stage each one covers (spacers and flags are not pieces) */
    pieces?: Array<{ k: string; x0: number; x1: number; beat?: string }>;
    /** the stretches built as rests */
    breathers?: Array<[number, number]>;
    /** how the build was timed: the seconds of the layout alone, of what the animals and pickups added, and the route in px */
    timing?: { layoutSeconds: number; decorSeconds: number; route: number };
    /** how many two-lane forks the stage was meant to have (a layout that laid fewer is passed over when another passes too) */
    forksWanted?: number;
    /** a vertical stage: the steps of the climb, in order (the time model adds them up) */
    ascentChain?: Array<{ kind: 'hop' | 'hop2' | 'bounce' | 'swing' | 'climb' | 'cross'; w: number; rise: number }>;
  };
}

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

/** a night harpy only spawns where its patrol patch is at least this wide (it slides and then leaps) */
const HARPY_MIN_GROUND = 140;
const GROUND_H = 90;
/** an arena's animals walk no closer than this to either end of it: a flag, a pit's take-off or a landing may follow right there */
const YARD_PAD = 200;
/** ground baseline and water surface, relative to the level height */
const GROUND_FROM_BOTTOM = 320;
const WATER_FROM_BOTTOM = 170;

type Kind =
  | 'flat' | 'pit' | 'hill' | 'bridge' | 'stones' | 'cliff' | 'bounce'
  | 'ladder' | 'swing' | 'moving' | 'fragile' | 'yard' | 'tower' | 'river' | 'zone'
  | 'valley' | 'rolling' | 'hurdles' | 'terrace' | 'gapbridge' | 'skyhop' | 'islands' | 'canopy'
  | 'ropegap' | 'ropebonus'
  | 'leafdrop' | 'leafbonus'
  | 'pillars' | 'slope' | 'stumps' | 'zigzag' | 'trampoline' | 'causeway' | 'pegs' | 'meadow' | 'ditch' | 'twin'
  | 'yardMound' | 'yardSunken' | 'yardBridge' | 'yardTiers' | 'yardLedges';

/** first mission number (1..100) a piece may appear in: teaches one idea at a time */
const UNLOCK: Record<Kind, number> = {
  flat: 1, pit: 1, hill: 1, yard: 1, bridge: 1, stones: 1, cliff: 2, ladder: 1,
  bounce: 3, swing: 4, moving: 8, fragile: 11, tower: 14, river: 1, zone: 1,
  valley: 1, rolling: 1, hurdles: 1, terrace: 2, gapbridge: 1, skyhop: 1, islands: 1, canopy: 1,
  ropegap: 4, ropebonus: 1,
  // the leaf glide is learned on clearing 4-1: a drop it makes easier from 4-2, one only it can cross from 4-7 (skills.ts)
  leafbonus: 32, leafdrop: 37,
  pillars: 3, slope: 1, stumps: 1, zigzag: 2, trampoline: 3, causeway: 1, pegs: 3, meadow: 1, ditch: 1, twin: 2,
  yardMound: 1, yardSunken: 1, yardBridge: 2, yardTiers: 2, yardLedges: 1,
};

const BASE_WEIGHT: Record<Kind, number> = {
  flat: 1.4, pit: 3, hill: 2, bridge: 1.2, stones: 2.2, cliff: 1.6, bounce: 1.4,
  ladder: 1.3, swing: 1.8, moving: 1.4, fragile: 1.2, yard: 1, tower: 0.8,
  river: 0, // never picked at random: World 2 places its rivers on purpose (see river.ts)
  zone: 0, // likewise Worlds 3 and 4 place their cloud and gust pieces on purpose (see zones.ts)
  valley: 1.6, rolling: 1.6, hurdles: 1.5, terrace: 1.5, gapbridge: 1.4, skyhop: 1.6, islands: 1.6, canopy: 1.6,
  ropegap: 1.5, ropebonus: 1.3,
  leafdrop: 0.5, leafbonus: 0.5,
  pillars: 1.5, slope: 1.5, stumps: 1.5, zigzag: 1.5, trampoline: 1.4, causeway: 1.5, pegs: 1.4, meadow: 1.5, ditch: 1.5, twin: 1.5,
  yardMound: 0.5, yardSunken: 0.5, yardBridge: 0.5, yardTiers: 0.5, yardLedges: 0.5,
};

const OBJ_WEIGHT: Partial<Record<ObjectiveType, Partial<Record<Kind, number>>>> = {
  sprint: { pit: 1.4, bounce: 1.3, moving: 1.3, yard: 0.5, zigzag: 1.3, trampoline: 1.3 },
  harvest: { ladder: 1.6, stones: 1.3, yard: 0.6, canopy: 1.8, skyhop: 1.3, meadow: 2 },
  purge: { yard: 3, yardMound: 5, yardSunken: 4, yardBridge: 4, yardTiers: 4, yardLedges: 4, flat: 0.8, swing: 0.6, meadow: 1.8, rolling: 1.4, valley: 1.3, twin: 1.3, slope: 1.3, pegs: 0.6, pillars: 0.6, zigzag: 0.6 },
  stealth: { bridge: 1.8, cliff: 1.5, yard: 0.7, valley: 1.4, hurdles: 1.3 },
  vine_runner: { swing: 3.2, stones: 1.5, yard: 0.2, pit: 0.7 },
  relic_hunt: { ladder: 2, cliff: 2, tower: 3, bounce: 1.4 },
  rescue: { ladder: 1.5, yard: 1.5, cliff: 1.3, terrace: 1.4, twin: 1.3 },
  gauntlet: { yard: 3.2, yardMound: 5, yardSunken: 4, yardBridge: 4, yardTiers: 4, yardLedges: 4, moving: 1.3, fragile: 1.3, meadow: 1.5, twin: 1.3, pegs: 0.6, pillars: 0.6 },
};

/**
 * Each world leans on the way of moving its chapter is about (stagePlan.ts has the missions; this tilts the pieces inside them): the
 * kapok canopy and its first lianas, hopping the river, the dark hollows, the cliffs above the falls, silk bridges, swinging root to
 * root, the temple's towers and failing floors, the night treetops, stepping stones over the heat, and the thousand steps.
 */
const WORLD_WEIGHT: Record<number, Partial<Record<Kind, number>>> = {
  1: { canopy: 1.5, ladder: 1.4, swing: 1.3, meadow: 1.2 },
  2: { stones: 1.8, islands: 1.8, causeway: 1.6, bridge: 1.4, gapbridge: 1.4 },
  3: { valley: 1.5, ditch: 1.5, cliff: 1.3, stumps: 1.3, bounce: 1.4 },
  4: { cliff: 1.8, terrace: 1.7, skyhop: 1.6, ladder: 1.4, pit: 1.3, leafdrop: 5, leafbonus: 5 },
  5: { bridge: 1.8, gapbridge: 1.6, swing: 1.4, pegs: 1.3 },
  6: { swing: 1.9, ropegap: 1.8, islands: 1.4, stumps: 1.4, pegs: 1.3 },
  7: { tower: 1.8, pillars: 1.8, terrace: 1.5, ladder: 1.4, fragile: 1.6 },
  8: { swing: 1.6, canopy: 1.6, skyhop: 1.5, ropegap: 1.4, leafdrop: 3 },
  9: { stones: 1.6, pillars: 1.6, fragile: 1.4, trampoline: 1.3, terrace: 1.3, leafdrop: 2 },
  10: { terrace: 1.8, ladder: 1.6, cliff: 1.6, zigzag: 1.5, tower: 1.4 },
};

/** the stages whose first act is built around one piece because the story says so */
const STORY_CORE: Record<string, Kind> = { '4-2': 'leafbonus', '4-7': 'leafdrop', '8-6': 'leafdrop' };

/** how taxing a piece is; a spacer of flat ground follows the hard ones */
const INTENSITY: Record<Kind, number> = {
  flat: 0, hill: 0, bridge: 0, ladder: 0, pit: 1, stones: 1, cliff: 1, bounce: 1,
  yard: 1, swing: 2, moving: 2, fragile: 2, tower: 2, river: 1, zone: 1,
  valley: 0, rolling: 0, hurdles: 1, terrace: 1, gapbridge: 1, skyhop: 1, islands: 1, canopy: 0,
  ropegap: 1, ropebonus: 0,
  leafdrop: 2, leafbonus: 1,
  pillars: 1, slope: 0, stumps: 0, zigzag: 1, trampoline: 1, causeway: 0, pegs: 1, meadow: 0, ditch: 0, twin: 0,
  yardMound: 1, yardSunken: 1, yardBridge: 1, yardTiers: 1, yardLedges: 1,
};

/** the pieces that put something in the way: a pit to jump, an animal, a zone, a river, a platform that moves or breaks (a stretch without one is an empty corridor) */
const HAZARD_KIND = new Set<Kind>([
  'pit', 'stones', 'swing', 'moving', 'fragile', 'river', 'zone', 'skyhop', 'islands', 'pillars', 'zigzag', 'trampoline', 'pegs', 'ropegap', 'gapbridge', 'leafdrop',
  'yard', 'yardMound', 'yardSunken', 'yardBridge', 'yardTiers', 'yardLedges',
]);
const YARD_KINDS: Kind[] = ['yardMound', 'yardSunken', 'yardBridge', 'yardTiers', 'yardLedges', 'yard'];
const isYardKind = (k: Kind) => k === 'yard' || k.startsWith('yard');

const FLOWER_VARIANTS = ['orchid', 'hibiscus', 'fern', 'monstera'] as const;

// ---------------------------------------------------------------------------
// Seeded randomness
// ---------------------------------------------------------------------------

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Spot {
  x0: number;
  x1: number;
  y: number;
  /** true for places we must keep clear of enemies (spawn, checkpoints, goal) */
  safe?: boolean;
  /** an enemy yard already placed its own enemies here */
  yard?: boolean;
  /** elevated reward spot: plateaus and ladder tops */
  perch?: boolean;
  /** a side structure the player may skip (ladder tops): nothing required is ever put here */
  optional?: boolean;
}

// ---------------------------------------------------------------------------
// The builder
// ---------------------------------------------------------------------------

export class Gen {
  readonly cfg: LevelConfig;
  readonly m: number;
  readonly d: number;
  readonly world: number;
  /** the layout's random stream (mulberry32); its state is `rs`, so a piece can be tried and taken back (see mark / rewind) */
  rs: number;
  /** two more streams that never touch the layout's: platform styles and flower species */
  ss: number;
  readonly G: number;
  readonly waterY: number;
  readonly safeMode: boolean;
  readonly diff: ReturnType<typeof calculateDifficultyScaling>;

  P: Platform[] = [];
  V: Vine[] = [];
  R: Rope[] = [];
  T: TreeStructure[] = [];
  E: Enemy[] = [];
  C: Collectible[] = [];
  CP: Array<{ x: number; y: number; reached: boolean }> = [];
  /** where the exit totem stands (set once the goal is built): no flier patrols near it */
  exitAt: { x: number; y: number } | null = null;
  spots: Spot[] = [];
  log: string[] = [];
  rivers?: RiverZone[];
  /** World 2: the rivers still to place, in order */
  riverQueue: RiverRecipe[] = [];
  zones?: Zone[];
  /** Worlds 3 and 4: the cloud / gust pieces still to place, in order */
  zoneQueue: ZonePiece[] = [];

  pid = 1;
  vid = 1;
  eid = 1;
  cid = 1;
  tid = 1;

  cx = 0;
  g: number;
  bank: number | null = null;
  /** where the last flag stands (the start counts as one) */
  lastFlagX = 140;
  /** the hero starts here */
  readonly spawnX = 140;

  constructor(cfg: LevelConfig, attempt: number) {
    this.cfg = cfg;
    this.world = cfg.worldIndex;
    this.m = (cfg.worldIndex - 1) * 10 + cfg.miniIndex;
    this.d = (this.m - 1) / 99;
    this.diff = calculateDifficultyScaling(cfg.worldIndex, cfg.miniIndex);
    this.rs = (hashStr(cfg.id) + attempt * 7919) >>> 0;
    this.ss = (hashStr(cfg.id + '#style') + attempt * 104729) >>> 0;
    this.G = cfg.levelHeight - GROUND_FROM_BOTTOM;
    this.waterY = cfg.levelHeight - WATER_FROM_BOTTOM;
    this.g = this.G;
    // later attempts fall back to a gentler layout if a roll was unlucky
    // (a random layout's attempt numbers start at 1000 + variant*31, so its retry index is the remainder: judging by the
    // raw number made every random layout "safe" and left out all swing vines, moving platforms and fragile planks)
    const retry = attempt >= 1000 ? (attempt - 1000) % 31 : attempt;
    this.safeMode = retry >= 5;
  }

  // ---- helpers ----
  rnd(): number {
    this.rs = (this.rs + 0x6d2b79f5) >>> 0;
    let t = this.rs;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  /** the style stream */
  srnd = (): number => {
    this.ss = (this.ss + 0x6d2b79f5) >>> 0;
    let t = this.ss;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  rr(a: number, b: number) { return a + this.rnd() * (b - a); }
  ri(a: number, b: number) { return Math.floor(this.rr(a, b + 1)); }
  chance(p: number) { return this.rnd() < p; }
  lerp(a: number, b: number, t = this.d) { return a + (b - a) * t; }

  /** what each platform is made of, by id (platformStyles.ts balances the styles of the whole stage when it is finished) */
  kindOf = new Map<number, PlatformKind>();

  plat(p: Omit<Platform, 'id' | 'style'> & { style?: Platform['style'] }, kind: PlatformKind = 'ledge'): Platform {
    const full = { id: this.pid++, ...p, style: p.style ?? styleFor(kind, this.world, this.srnd) } as Platform;
    this.kindOf.set(full.id, kind);
    this.P.push(full);
    return full;
  }

  openBank() { if (this.bank === null) this.bank = this.cx; }

  closeBank() {
    if (this.bank !== null && this.cx > this.bank + 1) {
      this.plat({ x: this.bank, y: this.g, width: this.cx - this.bank, height: GROUND_H, type: 'solid'}, 'ground');
    }
    this.bank = null;
  }

  flat(len: number, flags: Partial<Spot> = {}): Spot {
    this.openBank();
    const s: Spot = { x0: this.cx, x1: this.cx + len, y: this.g, ...flags };
    this.spots.push(s);
    this.cx += len;
    return s;
  }

  /** make sure there is at least `n` px of open ground behind the cursor to run up / land on */
  ensure(n: number) {
    this.openBank();
    const have = this.cx - (this.bank ?? this.cx);
    if (have < n) this.flat(n - have);
  }

  up(dh: number) { this.closeBank(); this.g -= dh; this.bank = this.cx; }
  down(dh: number) { this.closeBank(); this.g += dh; this.bank = this.cx; }

  unlocked(k: string): boolean { return (UNLOCK as Record<string, number>)[k] <= this.m; }

  // ---- pickups ----
  /** which flower a row or an arc is made of: one species for the whole row (rolled from the style stream, so the layout's own rolls are not touched) */
  species(): (typeof FLOWER_VARIANTS)[number] {
    return FLOWER_VARIANTS[Math.floor(this.srnd() * FLOWER_VARIANTS.length)];
  }

  /**
   * About six in ten of the loose flowers are left out (2026-10: fewer flowers, for the look and the memory): a flower on its own, or a whole row, is
   * dropped by a hash of where it stands. The arcs over a gap stay (they show the jump), and so do the ones a piece asks for on purpose
   * (`keep`): a harvest's quota rows, the flower in each geyser pocket. A dropped flower still takes its roll, so the layout is unchanged.
   */
  thinned(x: number, y: number): boolean {
    const h = Math.sin(Math.round(x) * 12.9898 + Math.round(y) * 78.233 + this.world * 37.719) * 43758.5453;
    return h - Math.floor(h) < 0.6;
  }

  flower(x: number, y: number, variant: (typeof FLOWER_VARIANTS)[number] = this.species(), keep = false) {
    const v = variant;
    const bobPhase = this.rnd() * Math.PI * 2;
    if (!keep && this.thinned(x, y)) return;
    this.C.push({
      // a harvest gathers flowers only (petals in World 1, night blooms in World 8...): no leaves among them
      id: this.cid++, type: (v === 'fern' || v === 'monstera') && this.cfg.objectiveType !== 'harvest' ? 'leaf' : 'flower',
      botanicalVariant: v, x, y, collected: false, bobPhase,
    });
  }

  /** a low branch over the middle of a stretch of ground with a few flowers on it: a place to hop up to, and ground that is no longer bare */
  overLedge(s: { x0: number; x1: number }, flowers = 3) {
    const len = s.x1 - s.x0;
    if (len < 170 || this.safeMode) return;
    const w = Math.min(this.rr(110, 150), len - 50);
    const rise = this.rr(76, 86);
    const x = (s.x0 + s.x1) / 2 + this.rr(-len * 0.12, len * 0.12);
    this.plat({ x: x - w / 2, y: this.g - rise, width: w, height: 26, type: 'solid' }, 'tier');
    this.row(x - w / 2 + 22, x + w / 2 - 22, this.g - rise - 34, flowers);
  }

  /** a row of flowers: kept or left out whole (see thinned), unless `keep` */
  row(x0: number, x1: number, y: number, n: number, keep = false) {
    const sp = this.species();
    const all = keep || !this.thinned(x0, y);
    for (let i = 0; i < n; i++) {
      const x = n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1);
      if (all) this.flower(x, y, sp, true);
      else this.rnd(); // the dropped flower's roll
    }
  }

  /** an arc of flowers: over a gap it is always kept (it shows the jump); a decorative one (`keep` false) is kept or left out whole */
  arc(x0: number, x1: number, y: number, peak: number, n: number, keep = true) {
    const sp = this.species();
    const all = keep || !this.thinned(x0, y);
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      if (all) this.flower(x0 + (x1 - x0) * u, y - peak * 4 * u * (1 - u), sp, true);
      else this.rnd();
    }
  }

  item(type: Collectible['type'], x: number, y: number) {
    const c: Collectible = { id: this.cid++, type, x, y, collected: false, bobPhase: this.rnd() * Math.PI * 2 };
    if (type === 'cage') c.cageHp = 2;
    this.C.push(c);
  }

  /**
   * The last word on pickups, run when a stage is finished: nothing sits inside a platform (it is lifted out, or a flower that cannot be
   * lifted is dropped) and no two pickups overlap (a flower that lands on another pickup is nudged up once, then dropped). Hearts,
   * power-ups, cages and relics never move or vanish; flowers and leaves give way to them.
   */
  settlePickups(): number {
    const solids = this.P.filter((p) => p.type !== 'drift' && p.type !== 'moving');
    const inside = (x: number, y: number) => solids.find((p) => x >= p.x && x <= p.x + p.width && y > p.y + 2 && y < p.y + p.height - 2);
    const yielding = (c: Collectible) => c.type === 'flower' || c.type === 'leaf';
    const before = this.C.length;
    const lifted: Collectible[] = [];
    for (const c of this.C) {
      if (c.type !== 'exit_totem') {
        for (let t = 0; t < 3; t++) {
          const p = inside(c.x, c.y);
          if (!p) break;
          c.y = p.y - 30;
        }
        if (inside(c.x, c.y) && yielding(c)) continue;
      }
      lifted.push(c);
    }
    const placed: Collectible[] = [];
    const cell = new Map<number, Collectible[]>();
    const near = (c: Collectible) => {
      const k = Math.floor(c.x / PICKUP_APART);
      for (let d = -1; d <= 1; d++) for (const o of cell.get(k + d) ?? []) if (Math.hypot(o.x - c.x, o.y - c.y) < PICKUP_APART) return true;
      return false;
    };
    const put = (c: Collectible) => {
      const k = Math.floor(c.x / PICKUP_APART);
      (cell.get(k) ?? cell.set(k, []).get(k)!).push(c);
      placed.push(c);
    };
    for (const c of lifted) if (c.type === 'exit_totem' || !yielding(c)) put(c);
    const keep = new Set(placed);
    for (const c of lifted) {
      if (keep.has(c)) continue;
      let ok = !near(c);
      for (let t = 0; t < 2 && !ok; t++) {
        c.y -= PICKUP_APART;
        ok = !near(c) && !inside(c.x, c.y);
      }
      if (ok) { put(c); keep.add(c); }
    }
    this.C = this.C.filter((c) => keep.has(c));
    return before - this.C.length;
  }

  // ---- enemies ----
  private baseEnemy(type: Enemy['type'], x: number, y: number, w: number, h: number, hp: number, vx: number): Enemy {
    return {
      id: this.eid++, type, x, y, vx, vy: 0, width: w, height: h, hp, maxHp: hp,
      facing: vx >= 0 ? 1 : -1, patrolMinX: x - 60, patrolMaxX: x + 60, attackCooldown: 2,
      telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false,
      koTimer: 0, behaviorTimer: 0,
    };
  }

  snake(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('snake', x, surface - 14, 38, 22, this.world === 1 ? 1 : 2, (this.world === 1 ? 28 : 36) * this.diff.enemySpeedMultiplier);
    e.patrolMinX = pMin; e.patrolMaxX = pMax;
    this.E.push(e);
  }

  ocelot(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('ocelot', x, surface - 18, 48, 28, 2, -55 * this.diff.enemySpeedMultiplier);
    e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 2.5;
    this.E.push(e);
  }

  jaguar(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('jaguar', x, surface - 24, 64, 38, 3, (this.hash01(x, 3) < 0.5 ? -1 : 1) * 42 * this.diff.enemySpeedMultiplier);
    e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 1.2;
    this.E.push(e);
  }

  boa(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('boa', x, surface - 16, 58, 26, 3, 0);
    e.facing = this.hash01(x, 5) < 0.5 ? -1 : 1;
    e.speed = 1; e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 0.8;
    this.E.push(e);
  }

  caiman(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('caiman', x, surface - 15, 84, 24, 3, (this.hash01(x, 7) < 0.5 ? -1 : 1) * 28 * this.diff.enemySpeedMultiplier);
    e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 1.2;
    this.E.push(e);
  }

  tayra(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('tayra', x, surface - 15, 46, 24, 1, (this.hash01(x, 9) < 0.5 ? -1 : 1) * 70 * this.diff.enemySpeedMultiplier);
    e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 1.0;
    this.E.push(e);
  }

  /** the poison dart frog: sits still on the ground and hurts if touched; a stomp is its answer */
  frog(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('frog', x, surface - 14, 36, 24, 1, 0);
    e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 1.4;
    this.E.push(e);
  }

  /** the night harpy: a ground bruiser that crouches, slides, then leaps and stomps. It needs a long run of ground to slide on. */
  harpy(x: number, surface: number, pMin: number, pMax: number) {
    const e = this.baseEnemy('harpy', x, surface - 16, 48, 36, 2, (this.hash01(x, 13) < 0.5 ? -1 : 1) * 48 * this.diff.enemySpeedMultiplier);
    e.patrolMinX = pMin; e.patrolMaxX = pMax; e.attackCooldown = 1.6;
    this.E.push(e);
  }

  /**
   * Cheap deterministic 0..1 value from a position. Enemy *choice* uses this instead of the level's random
   * stream, so adding new animals never reshuffles the layout of a stage the player already knows.
   */
  hash01(x: number, salt = 0) {
    const v = Math.sin(x * 12.9898 + (this.eid + salt) * 78.233 + this.world * 37.719 + salt * 5.1) * 43758.5453;
    return v - Math.floor(v);
  }

  /** which sloth predator fills a "hard" ground slot in this world: the cast grows as the player moves on */
  private hardKind(h: number): 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra' | 'frog' {
    const table: Record<number, Array<['ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra' | 'frog', number]>> = {
      2: [['ocelot', 0.45], ['caiman', 0.35], ['frog', 0.2]],
      3: [['ocelot', 0.4], ['boa', 0.35], ['frog', 0.25]],
      4: [['ocelot', 0.5], ['tayra', 0.5]],
      5: [['tayra', 0.4], ['boa', 0.3], ['ocelot', 0.3]],
      6: [['caiman', 0.3], ['boa', 0.25], ['ocelot', 0.15], ['jaguar', 0.15], ['frog', 0.15]],
      7: [['jaguar', 0.35], ['ocelot', 0.25], ['boa', 0.2], ['caiman', 0.2]],
      8: [['jaguar', 0.35], ['tayra', 0.3], ['ocelot', 0.2], ['boa', 0.15]],
      9: [['jaguar', 0.3], ['boa', 0.25], ['tayra', 0.2], ['caiman', 0.15], ['ocelot', 0.1]],
      10: [['jaguar', 0.3], ['boa', 0.2], ['tayra', 0.2], ['caiman', 0.15], ['ocelot', 0.15]],
    };
    const row = table[Math.min(10, Math.max(2, this.world))];
    let acc = 0;
    for (const [k, w] of row) {
      acc += w;
      if (h < acc) return k;
    }
    return row[row.length - 1][0];
  }

  /** a ground animal; `prog` (0..1, how far along the stage) makes the hard ones likelier towards the end */
  ground(x: number, surface: number, pMin: number, pMax: number, prog = 0.5) {
    const hard = this.world >= 2 && this.chance(0.3 + this.d * 0.3 + (prog - 0.5) * 0.4);
    if (!hard) {
      // from world 4 a fast tayra sometimes scurries where a snake would have been
      if (this.world >= 4 && this.hash01(x, 11) < 0.22) this.tayra(x, surface, pMin, pMax);
      else this.snake(x, surface, pMin, pMax);
      return;
    }
    // from world 6 a night harpy takes some of the hard slots, on ground long enough to slide and land a stomp on
    if (this.world >= 6 && pMax - pMin >= HARPY_MIN_GROUND && this.hash01(x, 17) < (this.world >= 8 ? 0.3 : 0.2)) {
      this.harpy(x, surface, pMin, pMax);
      return;
    }
    let kind = this.hardKind(this.hash01(x));
    // big leapers / lungers need room to run; on a short ledge send a lighter animal
    if ((kind === 'jaguar' || kind === 'caiman') && pMax - pMin < 80) kind = 'ocelot';
    if (kind === 'frog') this.frog(x, surface, pMin, pMax);
    else if (kind === 'jaguar') this.jaguar(x, surface, pMin, pMax);
    else if (kind === 'boa') this.boa(x, surface, pMin, pMax);
    else if (kind === 'caiman') this.caiman(x, surface, pMin, pMax);
    else if (kind === 'tayra') this.tayra(x, surface, pMin, pMax);
    else this.ocelot(x, surface, pMin, pMax);
  }

  /** can an eagle patrol here: clear of solid ground (its patch of sky is x ± 240) and well away from every flag? */
  skyClear(x: number, homeY: number) {
    const x0 = x - 270, x1 = x + 270, y0 = homeY - 40, y1 = homeY + 40;
    // a zone (cloud, gust, column, web, tide, ruins, darkness) keeps its patch of sky clear of fliers
    if ((this.zones ?? []).some((z) => z.x1 > x0 && z.x0 < x1)) return false;
    if (this.P.some((p) => p.type !== 'bouncy' && p.x < x1 && p.x + p.width > x0 && p.y < y1 && p.y + p.height > y0)) return false;
    if (this.exitAt && Math.abs(this.exitAt.x - x) <= 560 && Math.abs(this.exitAt.y - homeY) <= 560) return false;
    return this.CP.every((c) => Math.abs(c.x - x) > 480 || Math.abs(c.y - homeY) > 520);
  }

  eagle(x: number, homeY: number) {
    const e = this.baseEnemy('eagle', x, homeY, 58, 42, this.world === 1 ? 1 : 2, (this.world === 1 ? 30 : 42) * this.diff.enemySpeedMultiplier);
    e.patrolMinX = x - 240; e.patrolMaxX = x + 240; e.attackCooldown = 4; e.swoopPhase = 'patrol'; e.hoverTimer = 0; e.homeY = homeY;
    this.E.push(e);
  }

  // ---- pieces ----

  /** the early stages' shorter gaps: 1 later on, a fifth less on stage 1-1, easing back to 1 by stage 25 (see easeAssist) */
  gapEase() {
    return 1 - ASSIST.gaps * easeAssist(this.m);
  }

  /** pit width: shorter early, never beyond a comfortable single jump */
  pitW() {
    // never wider than a jump that can start TAKEOFF_SLACK px before the edge
    const r = reachJump(0, false) * 0.95 - TAKEOFF_SLACK;
    const hi = Math.min(r, this.lerp(84, r)) * this.gapEase();
    return this.rr(Math.max(64, hi - 34), Math.max(72, hi));
  }

  /** a horizontal hop between two ledges: a fraction of the jump's reach, but always leaving TAKEOFF_SLACK px of room to take off */
  hopLen(dy: number, fraction: number) {
    const r = reachJump(dy, false);
    return Math.max(36, Math.min(r * fraction, r * 0.95 - TAKEOFF_SLACK) * this.gapEase());
  }

  chunkPit() {
    const wide = !this.safeMode && this.m >= 6 && this.chance(0.35 * this.d + 0.1);
    // a double-jump pit: about half of the double jump's reach, so it is a clear double jump but not a hairline one (it was 60-74%, which a thumb on a phone cannot hit)
    const w = wide ? this.rr(0.42, 0.55) * reachJump(0, true) : this.pitW();
    this.closeBank();
    // the rhythm of a jump: a row to run along, the arc over the gap, a small cluster on the far side
    const px = this.cx;
    this.row(px - 210, px - 100, this.g - 32, 3);
    this.arc(px - 30, px + w + 30, this.g - 36, wide ? 120 : 76, wide ? 5 : 4);
    this.cx += w;
    this.openBank();
    this.flower(px + w + 70, this.g - 34);
    this.flower(px + w + 108, this.g - 52);
    this.flower(px + w + 146, this.g - 34);
    // a landing of its own: the next piece may begin with a step, and a pit is never landed on a sliver
    this.flat(this.rr(110, 150));
    this.log.push(wide ? 'widePit' : 'pit');
  }

  chunkHill() {
    const n = this.ri(2, this.d > 0.4 ? 4 : 3);
    const dh = this.rr(32, 44);
    this.flat(this.rr(120, 200));
    for (let i = 0; i < n; i++) { this.up(dh); this.flat(this.rr(84, 120)); }
    const top = this.flat(this.rr(200, 320));
    if (this.chance(0.6)) { this.row(top.x0 + 40, top.x1 - 40, this.g - 32, 4); } else { this.overLedge(top, 3); }
    for (let i = 0; i < n; i++) { this.down(dh); this.flat(this.rr(84, 120)); }
    this.log.push('hill');
  }

  chunkBridge() {
    const len = this.rr(280, 560);
    this.closeBank();
    this.plat({ x: this.cx, y: this.g, width: len, height: 26, type: 'solid'}, 'bridge');
    this.row(this.cx + 50, this.cx + len - 50, this.g - 32, Math.round(len / 90));
    this.cx += len;
    this.openBank();
    this.log.push('bridge');
  }

  chunkStones() {
    const n = this.ri(2, this.d > 0.3 ? 4 : 3);
    this.closeBank();
    let x = this.cx;
    let prevY = this.g;
    const frac = () => this.rr(0.45, 0.6 + 0.2 * this.d);
    for (let i = 0; i < n; i++) {
      const y = Math.max(this.g + 24, Math.min(this.g + 60, prevY + this.rr(-30, 30)));
      const hop = this.hopLen(prevY - y, frac());
      const w = this.rr(92, 130);
      x += hop;
      const fragile = !this.safeMode && this.world >= 2 && i > 0 && i < n - 1 && this.chance(0.3 * this.d + 0.08);
      this.plat({ x, y, width: w, height: 28, type: fragile ? 'fragile' : 'solid'}, 'ledge');
      this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - this.g, frac());
    this.cx = x;
    this.openBank();
    this.log.push('stones');
  }

  /** wall of earth with a tree against it: climb the vine to the top */
  private cliffUp(H: number) {
    this.flat(this.rr(160, 230));
    const cliffX = this.cx;
    const treeX = cliffX - 18;
    this.closeBank();
    const g1 = this.g;
    const g2 = g1 - H;
    this.g = g2;
    this.bank = cliffX;
    this.plat({ x: treeX - 110, y: g2, width: 160, height: 26, type: 'solid'}, 'ledge');
    const tree: TreeStructure = {
      id: this.tid++, x: treeX, groundY: g1, topY: g2 - 170, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150,
    };
    this.T.push(tree);
    this.V.push({
      id: this.vid++, x: treeX, topY: g2 - 2, bottomY: g1 - 6, swaySpeed: 0.9, swayPhase: this.rnd() * 6,
      vineType: 'tree_climb', treeId: tree.id,
    });
    return { g1, g2 };
  }

  chunkCliff(H = this.rr(205, 285)) {
    const room = this.g - 230;
    H = Math.min(H, room);
    if (H < 150) { this.chunkPit(); return; }
    const { g1 } = this.cliffUp(H);
    const top = this.flat(this.rr(340, 620), { perch: true });
    this.row(top.x0 + 70, top.x1 - 70, this.g - 32, 4);
    this.closeBank();
    this.g = g1;
    this.bank = this.cx;
    this.log.push(`cliff${Math.round(H)}`);
  }

  /**
   * A lookout and a long drop to the ground beyond (the leaf glide, skills.ts). `required`: the far ground is past any jump or double
   * jump, so only the leaf carries him over (built only where everyone has the glide). Otherwise the gap is a fair double jump, and a
   * line of flowers runs on along the glide's path for anyone who opens the leaf. Either way the flowers show the way down.
   */
  chunkLeafDrop(required: boolean) {
    const H = Math.min(this.rr(130, 190), this.g - 230);
    if (H < 110 || this.cfg.secret || (required && !skillGuaranteedAt('glide', this.m))) { this.chunkCliff(); return; }
    const { g1 } = this.cliffUp(H);
    const top = this.flat(this.rr(220, 320), { perch: true });
    const gTop = this.g;
    this.closeBank();
    const dbl = reachJump(-H, true);
    const glide = reachGlide(-H, false);
    // required: well past a double jump (by 18% or 70 px) and well inside a plain glide; otherwise a comfortable double jump
    const lo = required ? Math.max(dbl * 1.18, dbl + 70) : dbl * 0.62;
    const hi = required ? Math.max(lo, Math.min(glide * 0.88, reachGlide(-H, true) * 0.62)) : dbl * 0.74;
    const w = this.rr(lo, hi);
    const x0 = this.cx;
    // the flowers along the glide: a little rise off the edge, then a long gentle slope down (past the landing, for the bonus)
    const span = required ? w : Math.min(glide * 0.85, w + 260);
    const n = required ? 6 : 8;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      this.flower(x0 + 10 + span * u, gTop - 44 - 70 * Math.sin(Math.PI * Math.min(1, u * 2.2)) * (1 - u) + (H - 10) * u, undefined, true);
    }
    this.row(top.x0 + 50, top.x1 - 60, gTop - 32, 3);
    this.cx += w;
    this.g = g1;
    this.openBank();
    this.flat(this.rr(220, 300), { safe: true });
    this.log.push(`${required ? 'leafdrop' : 'leafbonus'}${Math.round(w)}`);
  }

  chunkBounce() {
    const H = this.rr(140, 172);
    this.flat(this.rr(190, 260));
    this.plat({ x: this.cx - 115, y: this.g - 30, width: 70, height: 30, type: 'bouncy' });
    const g1 = this.g;
    this.up(H);
    const top = this.flat(this.rr(300, 480), { perch: true });
    this.row(top.x0 + 60, top.x1 - 60, this.g - 32, 4);
    this.closeBank();
    this.g = g1;
    this.bank = this.cx;
    this.log.push('bounce');
  }

  chunkTower() {
    const room = this.g - 190;
    const h1 = Math.min(this.rr(200, 260), room * 0.5);
    const h2 = Math.min(this.rr(200, 260), room - h1);
    if (h1 < 170 || h2 < 170) { this.chunkCliff(); return; }
    const { g1 } = this.cliffUp(h1);
    const mid = this.flat(this.rr(240, 330));
    this.row(mid.x0 + 40, mid.x1 - 40, this.g - 32, 3);
    // second climb straight from the middle ledge
    this.cx = mid.x1;
    const treeX = this.cx - 18;
    this.closeBank();
    const g2 = this.g;
    const g3 = g2 - h2;
    this.g = g3;
    this.bank = this.cx;
    this.plat({ x: treeX - 110, y: g3, width: 160, height: 26, type: 'solid'}, 'ledge');
    const tree: TreeStructure = { id: this.tid++, x: treeX, groundY: g2, topY: g3 - 170, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    this.T.push(tree);
    this.V.push({ id: this.vid++, x: treeX, topY: g3 - 2, bottomY: g2 - 6, swaySpeed: 0.9, swayPhase: this.rnd() * 6, vineType: 'tree_climb', treeId: tree.id });
    const top = this.flat(this.rr(300, 420), { perch: true });
    this.row(top.x0 + 60, top.x1 - 60, this.g - 32, 3);
    this.closeBank();
    this.g = g2;
    this.bank = this.cx;
    this.flat(this.rr(80, 120));
    this.closeBank();
    this.g = g1;
    this.bank = this.cx;
    this.log.push('tower');
  }

  chunkLadder() {
    const room = this.g - 150;
    const n = Math.max(2, Math.min(this.cfg.levelHeight > 1000 ? 5 : 3, Math.floor(room / 70)));
    const base = this.flat(Math.max(300, n * 70 + 160));
    const x0 = base.x0 + 40;
    let topLedge: Platform | null = null;
    for (let i = 0; i < n; i++) {
      const last = i === n - 1;
      const w = last ? 200 : 120;
      const cx = x0 + 100 + (i % 2) * 130;
      const y = this.g - 68 * (i + 1);
      const fragile = !this.safeMode && i === 1 && this.world >= 2 && this.chance(0.25 * this.d);
      topLedge = this.plat({ x: cx - w / 2, y, width: w, height: 28, type: fragile ? 'fragile' : 'solid'}, 'rung');
      if (!last) this.flower(cx, y - 36);
    }
    if (topLedge) {
      this.spots.push({ x0: topLedge.x, x1: topLedge.x + topLedge.width, y: topLedge.y, perch: true, optional: true, safe: true });
    }
    this.row(base.x0 + 40, base.x1 - 40, this.g - 32, 3);
    this.log.push('ladder');
  }

  chunkSwing() {
    if (this.safeMode) { this.chunkPit(); return; }
    const wMax = this.lerp(270, 400);
    const wMin = 240;
    const topLift = 310;
    // bank we are standing on, as the validator will see it
    const A: Platform = { id: -1, x: this.cx - 220, y: this.g, width: 220, height: GROUND_H, type: 'solid' };
    for (let w = wMax; w >= wMin; w -= 20) {
      const dy = this.chance(0.35) ? this.rr(-24, 24) : 0;
      const B: Platform = { id: -2, x: this.cx + w, y: this.g + dy, width: 240, height: GROUND_H, type: 'solid' };
      const v: Vine = {
        id: 999, x: this.cx + w / 2 + this.rr(-18, 18), topY: this.g - topLift, bottomY: this.g + 30,
        swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true,
      };
      const res = swingLandings(A, v, 1, [A, B], this.waterY);
      if ((res.get(-2) ?? 0) >= 8) {
        this.closeBank();
        this.V.push({ ...v, id: this.vid++, swayPhase: this.rnd() * 6 });
        this.arc(this.cx + 20, this.cx + w - 20, this.g - 90, 60, 4);
        this.cx += w;
        this.g += dy;
        this.openBank();
        this.flat(240);
        this.log.push(`swing${Math.round(w)}`);
        return;
      }
    }
    this.chunkPit();
  }

  chunkMoving() {
    if (this.safeMode) { this.chunkStones(); return; }
    const W = this.rr(380, 500);
    const pw = 130;
    this.closeBank();
    const minX = this.cx + 55;
    const maxX = this.cx + W - 55 - pw;
    const base = (minX + maxX) / 2;
    const range = (maxX - minX) / 2;
    const off = this.rr(0, Math.PI * 2);
    this.plat({
      x: base + Math.sin(off) * range, y: this.g, width: pw, height: 28, type: 'moving',
      moveRange: range, moveSpeed: this.rr(0.8, 1.25), baseX: base, swayOffset: off,
    }, 'ledge');
    this.arc(this.cx + 30, this.cx + W - 30, this.g - 40, 70, 5, false);
    this.cx += W;
    this.openBank();
    this.log.push('moving');
  }

  chunkFragile() {
    if (this.safeMode) { this.chunkStones(); return; }
    // Plank spacing (96 wide + 74-90 gap) is chosen so a plain full running jump from anywhere on a plank lands on the next one.
    const planks = this.ri(3, 5);
    const w = 96;
    this.closeBank();
    let x = this.cx;
    for (let i = 0; i < planks; i++) {
      x += this.rr(74, 90);
      this.plat({ x, y: this.g, width: w, height: 26, type: 'fragile'}, 'plank');
      this.flower(x + w / 2, this.g - 38);
      x += w;
    }
    this.cx = x + this.rr(74, 90);
    this.openBank();
    this.log.push('fragile');
  }


  // ---- more shapes, so no two stages read the same ----

  /** can the ground step down `total` px here without running into the water? */
  roomBelow(total: number) { return this.g + total <= this.G + 96; }

  /** a dip in the ground: steps down, a low flat with flowers, and steps back up */
  chunkValley() {
    const n = this.ri(1, 3);
    const dh = this.rr(30, 44);
    if (!this.roomBelow(n * dh)) { this.chunkHill(); return; }
    this.flat(this.rr(100, 170));
    for (let i = 0; i < n; i++) { this.down(dh); this.flat(this.rr(84, 130)); }
    const bottom = this.flat(this.rr(180, 340));
    this.row(bottom.x0 + 40, bottom.x1 - 40, this.g - 32, 4);
    for (let i = 0; i < n; i++) { this.up(dh); this.flat(this.rr(84, 130)); }
    this.log.push('valley');
  }

  /** gentle rolling ground: little rises and dips, one after the other */
  chunkRolling() {
    const n = this.ri(2, 4);
    this.flat(this.rr(90, 150));
    for (let i = 0; i < n; i++) {
      const dh = this.rr(18, 30);
      const upFirst = this.chance(0.5) || !this.roomBelow(dh);
      const wide = this.rr(80, 150);
      if (upFirst) { this.up(dh); this.flat(wide); this.down(dh); } else { this.down(dh); this.flat(wide); this.up(dh); }
      this.flat(this.rr(60, 120));
    }
    this.log.push('rolling');
  }

  /** low stumps and logs to hop over (never taller than an easy jump) */
  chunkHurdles() {
    const n = this.ri(2, 3);
    this.flat(this.rr(150, 220), { safe: true });
    for (let i = 0; i < n; i++) {
      const h = this.rr(40, 58);
      const w = this.rr(58, 92);
      this.flat(w, { safe: true });
      this.plat({ x: this.cx - w, y: this.g - h, width: w, height: h + 12, type: 'solid'}, 'stump');
      if (this.chance(0.7)) this.flower(this.cx - w / 2, this.g - h - 42);
      this.flat(this.rr(150, 240), { safe: true });
    }
    this.log.push('hurdles');
  }

  /** a stepped plateau: climb two broad steps, walk the top, then a big drop back to the ground */
  chunkTerrace() {
    const steps = this.ri(1, 2);
    const dh = this.rr(54, 72);
    const g1 = this.g;
    if (this.g - steps * dh < 260) { this.chunkHill(); return; }
    this.flat(this.rr(130, 200));
    for (let i = 0; i < steps; i++) { this.up(dh); this.flat(this.rr(130, 190)); }
    const top = this.flat(this.rr(240, 380), { perch: true });
    this.row(top.x0 + 50, top.x1 - 50, this.g - 32, 4);
    this.closeBank();
    this.g = g1;
    this.bank = this.cx;
    this.flat(this.rr(120, 200));
    this.log.push('terrace');
  }

  /** a bridge laid in short sections with hops between them */
  chunkGapBridge() {
    const n = this.ri(2, 3);
    this.closeBank();
    for (let i = 0; i < n; i++) {
      const len = this.rr(150, 260);
      this.plat({ x: this.cx, y: this.g, width: len, height: 26, type: 'solid'}, 'bridge');
      this.row(this.cx + 40, this.cx + len - 40, this.g - 32, 2);
      this.cx += len;
      if (i < n - 1) this.cx += this.hopLen(0, this.rr(0.4, 0.6));
    }
    this.openBank();
    this.log.push('gapBridge');
  }

  /** over a pit: platforms that climb like stairs, then come back down */
  chunkSkyhop() {
    const n = this.ri(3, 5);
    this.closeBank();
    let x = this.cx;
    let prevY = this.g;
    const peak = Math.ceil(n / 2);
    for (let i = 0; i < n; i++) {
      const target = i < peak ? this.g - 42 * (i + 1) : this.g - 42 * (n - i);
      const y = Math.max(this.g - 150, Math.min(this.g - 30, target + this.rr(-8, 8)));
      x += this.hopLen(prevY - y, this.rr(0.5, 0.8));
      const w = this.rr(96, 134);
      this.plat({ x, y, width: w, height: 28, type: 'solid'}, 'step');
      this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - this.g, this.rr(0.5, 0.8));
    this.cx = x;
    this.openBank();
    this.log.push('skyhop');
  }

  /** a wide pit with one or two small islands in it */
  chunkIslands() {
    const n = this.ri(1, 2);
    this.closeBank();
    let x = this.cx;
    let prevY = this.g;
    for (let i = 0; i < n; i++) {
      const w = this.rr(84, 150);
      const y = this.g + this.rr(0, 22);
      x += this.hopLen(prevY - y, this.rr(0.55, 0.85));
      this.plat({ x, y, width: w, height: 28, type: 'solid'}, 'island');
      this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - this.g, this.rr(0.55, 0.85));
    this.cx = x;
    this.openBank();
    this.log.push('islands');
  }

  /** ordinary ground with a trail of branches above it: an optional high route with flowers */
  chunkCanopy() {
    const base = this.flat(this.rr(340, 480));
    const n = this.ri(2, 3);
    let x = base.x0 + this.rr(40, 90);
    let prev: Platform | null = null;
    for (let i = 0; i < n; i++) {
      const w = this.rr(110, 160);
      const y = this.g - this.rr(66, 80) - (i % 2) * this.rr(0, 8);
      if (prev) x = prev.x + prev.width + this.hopLen(prev.y - y, this.rr(0.4, 0.6));
      if (x + w > base.x1 - 20) break;
      prev = this.plat({ x, y, width: w, height: 24, type: 'solid'}, 'canopy');
      this.row(x + 30, x + w - 30, y - 36, 2);
      this.spots.push({ x0: x, x1: x + w, y, perch: true, optional: true, safe: true });
    }
    this.log.push('canopy');
  }

  /** stone columns standing in a pit, at uneven heights */
  chunkPillars() {
    const n = this.ri(3, 5);
    this.closeBank();
    let x = this.cx;
    let prevY = this.g;
    for (let i = 0; i < n; i++) {
      const y = this.g - Math.round(this.rr(0, 64));
      const w = this.rr(64, 96);
      x += this.hopLen(prevY - y, this.rr(0.5, 0.8));
      this.plat({ x, y, width: w, height: 170, type: 'solid'}, 'pillar');
      if (this.chance(0.7)) this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - this.g, this.rr(0.5, 0.8));
    this.cx = x;
    this.openBank();
    this.log.push('pillars');
  }

  /** a ramp of small steps, up or down (the ground wanders, but stays between the treetops and the water) */
  /** a rope across a gap too wide to jump: the only way over is to shimmy (needs the skill; only built where everyone has it) */
  chunkRopeGap() {
    if (this.g - ROPE_RISE < 140 || !skillGuaranteedAt('shimmy', this.m) || this.cfg.secret) { this.chunkPit(); return; }
    this.flat(this.rr(150, 220));
    this.closeBank();
    const gapW = this.rr(ROPE_MIN_GAP, ROPE_MIN_GAP + 150);
    this.addRope(this.cx, gapW, true);
    this.cx += gapW;
    this.openBank();
    this.flat(this.rr(150, 220));
    this.log.push('ropegap');
  }

  /** a gap that can be jumped as usual, with a rope above it and fruit hanging along it for anyone who has learned to shimmy */
  chunkRopeBonus() {
    if (this.g - ROPE_RISE < 140 || this.cfg.secret) { this.chunkPit(); return; }
    this.flat(this.rr(140, 200));
    this.closeBank();
    const w = this.pitW();
    this.addRope(this.cx, w, false);
    this.cx += w;
    this.openBank();
    this.flat(this.rr(140, 200));
    this.log.push('ropebonus');
  }

  /** hang a rope over the gap that starts at `gapStart` and is `gapW` wide, with fruit hanging along it */
  addRope(gapStart: number, gapW: number, required: boolean) {
    const r: Rope = { id: this.R.length + 1, x0: gapStart - ROPE_OVERLAP, x1: gapStart + gapW + ROPE_OVERLAP, y: this.g - ROPE_RISE, g0: this.g, g1: this.g, required };
    this.R.push(r);
    // fruit hangs along the rope, never closer than a pickup's width to its neighbour (a narrow gap holds fewer)
    const n = Math.max(2, Math.floor((gapW + 60) / (PICKUP_APART + 10)));
    for (let i = 0; i < n; i++) {
      const x = gapStart - 30 + ((gapW + 60) * (i + 0.5)) / n;
      this.item('fruit', x, ropeYAt(r, x) + HANG_DROP - 34);
    }
  }

  chunkSlope() {
    const n = this.ri(3, 5);
    const dh = this.rr(18, 26);
    const canDown = this.roomBelow(n * dh);
    const canUp = this.g - n * dh >= this.G - 150;
    const dirUp = canUp && (!canDown || this.chance(0.5));
    if (!canUp && !canDown) { this.chunkHill(); return; }
    this.flat(this.rr(90, 150));
    for (let i = 0; i < n; i++) {
      if (dirUp) this.up(dh); else this.down(dh);
      this.flat(this.rr(70, 110));
    }
    this.flat(this.rr(60, 140));
    this.log.push(dirUp ? 'slopeUp' : 'slopeDown');
  }

  /** a field of low stumps to step and hop over */
  chunkStumps() {
    const n = this.ri(3, 5);
    this.flat(this.rr(110, 160), { safe: true });
    for (let i = 0; i < n; i++) {
      const h = this.rr(24, 36);
      const w = this.rr(50, 76);
      this.flat(w, { safe: true });
      this.plat({ x: this.cx - w, y: this.g - h, width: w, height: h + 12, type: 'solid'}, 'stump');
      this.flat(this.rr(80, 140), { safe: true });
    }
    this.log.push('stumps');
  }

  /** platforms over a pit that alternate high and low */
  chunkZigzag() {
    const n = this.ri(4, 6);
    this.closeBank();
    let x = this.cx;
    let prevY = this.g;
    for (let i = 0; i < n; i++) {
      const y = this.g - (i % 2 === 0 ? this.rr(10, 26) : this.rr(52, 70));
      const w = this.rr(90, 130);
      x += this.hopLen(prevY - y, this.rr(0.5, 0.8));
      this.plat({ x, y, width: w, height: 28, type: 'solid'}, 'step');
      this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - this.g, this.rr(0.5, 0.8));
    this.cx = x;
    this.openBank();
    this.log.push('zigzag');
  }

  /** a wide pit crossed with a mushroom: stand on it, bounce, and fly over */
  chunkTrampoline() {
    this.flat(this.rr(150, 220));
    const r = reachBounce(0, false) * 0.9 - TAKEOFF_SLACK;
    const w = Math.max(150, Math.min(r * this.rr(0.62, 0.9), 330));
    this.plat({ x: this.cx - 70, y: this.g - 30, width: 70, height: 30, type: 'bouncy' });
    this.closeBank();
    this.arc(this.cx - 20, this.cx + w + 20, this.g - 110, 110, 5);
    this.cx += w;
    this.openBank();
    this.flat(this.rr(160, 240));
    this.log.push('trampoline');
  }

  /** a raised stone walkway on the ground, with a step up at each end */
  chunkCauseway() {
    const L = this.rr(300, 460);
    const s = this.flat(60 + L + 60, { safe: true });
    this.plat({ x: s.x0, y: this.g - 30, width: 60, height: 42, type: 'solid'}, 'causeway');
    this.plat({ x: s.x0 + 60, y: this.g - 62, width: L, height: 74, type: 'solid'}, 'causeway');
    this.plat({ x: s.x0 + 60 + L, y: this.g - 30, width: 60, height: 42, type: 'solid'}, 'causeway');
    this.row(s.x0 + 100, s.x0 + 60 + L - 40, this.g - 62 - 34, Math.max(3, Math.round(L / 90)));
    this.log.push('causeway');
  }

  /** narrow stone pegs over a pit (small landings, short hops) */
  chunkPegs() {
    const n = this.ri(3, 5);
    this.closeBank();
    let x = this.cx;
    let prevY = this.g;
    for (let i = 0; i < n; i++) {
      const y = this.g + this.rr(6, 44);
      // a peg is at least 64 px wide; from World 5 a precision beat may use a narrower one (two such landings at most in a stage)
      const narrow = this.narrowLeft > 0 && i > 0 && i < n - 1 && this.chance(0.5);
      if (narrow) this.narrowLeft--;
      const w = narrow ? this.rr(50, 60) : this.rr(66, 84);
      x += this.hopLen(prevY - y, this.rr(0.45, 0.7));
      this.plat({ x, y, width: w, height: 28, type: 'solid'}, 'peg');
      this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - this.g, this.rr(0.45, 0.7));
    this.cx = x;
    this.openBank();
    this.log.push('pegs');
  }

  /** an open meadow with arcs of flowers to run through */
  chunkMeadow() {
    const s = this.flat(this.rr(380, 620));
    const arcs = this.ri(1, 2);
    const seg = (s.x1 - s.x0 - 100) / arcs;
    for (let i = 0; i < arcs; i++) this.arc(s.x0 + 50 + i * seg, s.x0 + 50 + (i + 1) * seg, this.g - 36, this.rr(40, 64), this.ri(5, 7), false);
    this.log.push('meadow');
  }

  /** a ditch with a rope bridge over it: cross on top, or drop in for the flowers at the bottom */
  chunkDitch() {
    // (deep enough that the flowers on the floor hang clear under the 26 px deck of the bridge: they used to sit inside it)
    const depth = this.rr(76, 86);
    if (!this.roomBelow(depth)) { this.chunkGapBridge(); return; }
    this.flat(this.rr(100, 160));
    this.closeBank();
    const L = this.rr(300, 460);
    this.plat({ x: this.cx, y: this.g, width: L, height: 26, type: 'solid'}, 'bridge');
    this.plat({ x: this.cx, y: this.g + depth, width: L, height: GROUND_H, type: 'solid'}, 'ground');
    this.row(this.cx + 50, this.cx + L - 50, this.g + depth - 32, Math.round(L / 100));
    this.cx += L;
    this.openBank();
    this.log.push('ditch');
  }

  /** two plateaus of different heights with a dip between them */
  chunkTwin() {
    const a = this.rr(44, 66);
    const b = this.rr(44, 66);
    if (this.g - Math.max(a, b) < 280) { this.chunkHill(); return; }
    this.flat(this.rr(120, 180));
    this.up(a);
    const t1 = this.flat(this.rr(150, 240), { perch: true });
    this.row(t1.x0 + 40, t1.x1 - 40, this.g - 32, 3);
    this.down(a);
    this.flat(this.rr(120, 220));
    this.up(b);
    const t2 = this.flat(this.rr(150, 240), { perch: true });
    this.row(t2.x0 + 40, t2.x1 - 40, this.g - 32, 3);
    this.down(b);
    this.flat(this.rr(90, 150));
    this.log.push('twin');
  }

  /** World 2: a river between two banks, with logs drifting across it (see river.ts). `rec` says how fast, which way, how wide. */
  chunkRiver(rec: RiverRecipe) {
    this.closeBank();
    const x0 = this.cx;
    const x1 = x0 + rec.width;
    const { count, period } = logLayout(rec);
    const y = this.g + LOG_DROP;
    for (let i = 0; i < count; i++) {
      this.plat({
        x: x0, y, width: rec.logW, height: LOG_HEIGHT, type: 'drift', style: 'log',
        drift: { x0, x1, dir: rec.dir, speed: rec.speed, width: rec.logW, offset: (i * period) / count, baseY: y },
      });
    }
    // fix each log's starting x for game time 0
    for (const p of this.P) if (p.type === 'drift' && p.drift && p.drift.x0 === x0) p.x = driftX(p.drift, 0);
    (this.rivers ??= []).push({ x0, x1, surfaceY: this.g + surfaceBelowBank, dir: rec.dir, speed: rec.speed });
    // flowers float over the water, easy to take from a log
    this.arc(x0 + 40, x1 - 40, this.g - 30, 80, 5);
    this.cx = x1;
    this.openBank();
    this.log.push(`river${rec.dir === 1 ? 'W' : 'A'}${rec.speed}`);
  }


  /**
   * Worlds 3 and 4: a piece with a zone on it (see zones.ts). The ground the zone covers is kept clear of animals (`safe`), and
   * every gap in it is one a plain jump crosses, so waiting out the zone is always a way through.
   */
  chunkZone(p: ZonePiece) {
    const zones = (this.zones ??= []);
    const base = { kind: p.kind, dir: p.dir, period: p.period, warn: p.warn, active: p.active, force: p.force } as const;
    const phase = () => this.rr(0, p.period);
    const g0 = this.g;
    if (p.shape === 'meadow') {
      const s = this.flat(520, { safe: true });
      zones.push({ ...base, x0: s.x0 + 80, x1: s.x1 - 80, top: g0 - 210, bottom: g0 + 12, baseY: g0, offset: phase(), emit: p.kind === 'spore' ? [s.x0 + 150, s.x0 + 260, s.x0 + 370] : undefined });
      this.row(s.x0 + 130, s.x1 - 130, g0 - 40, 5);
      this.log.push(`${p.kind}Meadow`);
      return;
    }
    // ---- Worlds 5 to 8 ----
    if (p.kind === 'web') {
      const len = p.len;
      if (p.shape === 'patch') {
        // sticky ground with a branch over it: slog through for the flowers, or hop up and run along the top
        const run = this.flat(260, { safe: true });
        const s = this.flat(len, { safe: true });
        const land = this.flat(260, { safe: true });
        zones.push({ ...base, x0: s.x0, x1: s.x1, top: g0 - 130, bottom: g0 + 16, baseY: g0, offset: 0 });
        this.plat({ x: s.x0 - 44, y: g0 - 78, width: len + 88, height: 26, type: 'solid'}, 'canopy');
        this.row(s.x0 + 30, s.x1 - 30, g0 - 40, Math.max(2, Math.round(len / 70)));
        this.row(s.x0 + 20, s.x1 - 20, g0 - 120, Math.max(2, Math.round(len / 90)));
        void run; void land;
        this.log.push(`webPatch${len}`);
        return;
      }
      // a web bridge over a gap too wide to jump: it holds, but it is sticky
      this.closeBank();
      const x0 = this.cx;
      this.plat({ x: x0, y: g0, width: len, height: 26, type: 'solid'}, 'bridge');
      zones.push({ ...base, x0, x1: x0 + len, top: g0 - 130, bottom: g0 + 18, baseY: g0, offset: 0, bridge: true });
      this.row(x0 + 50, x0 + len - 50, g0 - 40, Math.max(3, Math.round(len / 80)));
      this.cx = x0 + len;
      this.openBank();
      this.flat(220, { safe: true });
      this.log.push(`webBridge${len}`);
      return;
    }
    if (p.kind === 'tide') {
      // a mudflat the tide floods: cross while it is low
      // the ground has sunk too low for a mudflat below it: climb back up in easy steps first, so the tide section is never dropped
      for (let k = 0; k < 8 && this.g + 70 > this.G + 96; k++) {
        this.flat(170, { safe: true });
        this.up(Math.min(60, this.g + 70 - (this.G + 96)));
      }
      if (!(this.g + 70 <= this.G + 96)) { this.flat(300, { safe: true }); this.log.push('tideSkipped'); return; }
      this.flat(240, { safe: true });
      this.down(70);
      const mud = this.flat(p.len, { safe: true });
      const mudY = this.g;
      zones.push({ ...base, x0: mud.x0, x1: mud.x1, top: mudY - 210, bottom: mudY + 14, baseY: mudY, offset: this.rr(0, p.period) });
      this.row(mud.x0 + 50, mud.x1 - 50, mudY - 36, Math.max(3, Math.round(p.len / 70)));
      this.up(70);
      this.flat(240, { safe: true });
      this.log.push(`tide${p.len}`);
      return;
    }
    if (p.kind === 'crumble') {
      // runs of crumbling ruin tiles over a drop, a solid slab to rest on after every few
      const hold = crumbleTime(this.cfg.miniIndex);
      const stepped = p.count >= 5;
      // a flag first, so a fall off the ruins never costs the whole stretch before them
      this.checkpoint();
      this.flat(180, { safe: true });
      this.closeBank();
      let x = this.cx;
      const startX = x;
      let inRun = 0;
      // (a long ruin has a flag on one of its slabs, and the ruin is two zones around it: a flag never stands inside a zone)
      const segs: Array<[number, number]> = [];
      let segStart = startX;
      let flagged = false;
      for (let i = 0; i < p.count; i++) {
        if (inRun >= CRUMBLE_RUN_MAX) {
          if (!flagged && p.count >= 6 && x - startX >= 400 && x + 160 - this.lastFlagX >= this.flagMin()) {
            this.plat({ x, y: g0, width: 330, height: 26, type: 'solid'}, 'crumble');
            this.CP.push({ x: x + 165, y: g0, reached: false });
            this.lastFlagX = x + 165;
            this.log.push('checkpoint');
            segs.push([segStart, x]);
            x += 330;
            segStart = x;
            flagged = true;
          } else {
            this.plat({ x, y: g0, width: 160, height: 26, type: 'solid'}, 'crumble');
            this.flower(x + 80, g0 - 42);
            x += 160;
          }
          inRun = 0;
        }
        const up = stepped && i % 2 === 1 ? CRUMBLE_STEP : 0;
        this.plat({ x, y: g0 - up, width: CRUMBLE_TILE_W, height: 26, type: 'fragile', crumbleAfter: hold}, 'crumble');
        this.flower(x + CRUMBLE_TILE_W / 2, g0 - up - 42);
        x += CRUMBLE_TILE_W;
        inRun++;
      }
      // a last slab, flush with the ground on the far side
      this.plat({ x, y: g0, width: 160, height: 26, type: 'solid'}, 'crumble');
      x += 160;
      segs.push([segStart, x]);
      for (const [a0, a1] of segs) zones.push({ ...base, x0: a0, x1: a1, top: g0 - 200, bottom: g0 + 40, baseY: g0, offset: 0 });
      this.cx = x;
      this.openBank();
      this.flat(220, { safe: true });
      this.checkpoint();
      this.log.push(`ruins${p.count}`);
      return;
    }
    if (p.kind === 'dark') {
      // a stretch in the dark: a firefly swarm hangs over every gap, and every flower glows a little
      const lights: Array<{ x: number; y: number; r: number }> = [];
      let cut: [number, number] | null = null;
      // a flag before the dark, so a slip in it never costs the whole way here
      this.checkpoint();
      const first = this.flat(260, { safe: true });
      const zx0 = first.x0 + 80;
      const segLen = Math.max(180, (p.len - 520) / Math.max(1, p.count + 1));
      for (let i = 0; i < p.count; i++) {
        this.flat(segLen, { safe: true });
        this.closeBank();
        const w = this.pitW();
        const px = this.cx;
        this.arc(this.cx - 30, this.cx + w + 30, g0 - 36, 80, 4);
        this.cx += w;
        this.openBank();
        lights.push({ x: px + w / 2, y: g0 - 90, r: 190 });
        this.flat(160, { safe: true });
        // a long dark is not one stretch between two flags: a flag, and a lantern over it, after the middle gap
        if (i === Math.floor((p.count - 1) / 2) && p.count >= 2 && this.sinceFlag() > 800 && this.canFlag()) {
          const c0 = this.cx;
          this.checkpoint();
          cut = [c0, this.cx];
          lights.push({ x: c0 + 90, y: g0 - 70, r: 150 });
        }
      }
      const rest = this.flat(Math.max(220, segLen), { safe: true });
      this.row(first.x0 + 120, rest.x1 - 60, g0 - 40, Math.max(4, Math.round(p.len / 130)));
      // a lantern now and then so the dark is never total even where there is no gap
      for (let x = first.x0 + 300; x < rest.x1 - 200; x += 420) lights.push({ x, y: g0 - 70, r: 130 });
      // (a flag never stands in the dark: a flag halfway splits the dark into two stretches that are each one zone)
      const spans: Array<[number, number]> = cut ? [[zx0, cut[0] - 30], [cut[1] + 30, rest.x1 - 40]] : [[zx0, rest.x1 - 40]];
      for (const [a0, a1] of spans) zones.push({ ...base, x0: a0, x1: a1, top: g0 - 800, bottom: g0 + 400, baseY: g0, offset: 0, lights: lights.filter((l) => l.x >= a0 - 200 && l.x <= a1 + 200) });
      this.checkpoint();
      this.log.push(`dark${p.len}g${p.count}`);
      return;
    }
    if (p.kind === 'geyser' || p.kind === 'bolt') {
      // vents / rods in a row (or either side of a gap), each on its own beat, with a safe pocket between every two
      const colW = p.kind === 'geyser' ? 72 : 56;
      const height = p.kind === 'geyser' ? 250 : 560;
      const first = phase();
      const place = (cxm: number, i: number) => {
        zones.push({ ...base, x0: cxm - colW / 2, x1: cxm + colW / 2, top: g0 - height, bottom: g0 + 14, baseY: g0, offset: first + i * p.period * 0.31 });
      };
      if (p.shape === 'gap') {
        const run = this.flat(320, { safe: true });
        this.closeBank();
        const w = this.pitW();
        this.arc(this.cx - 30, this.cx + w + 30, g0 - 36, 80, 4);
        this.cx += w;
        this.openBank();
        const land = this.flat(320, { safe: true });
        place(run.x1 - 120, 0);
        place(land.x0 + 120, 1);
        this.flower(run.x0 + 90, g0 - 40);
        this.flower(land.x1 - 90, g0 - 40);
        this.log.push(`${p.kind}Gap${Math.round(w)}`);
        return;
      }
      const spacing = 210;
      const s = this.flat(330 + p.count * spacing - spacing, { safe: true });
      const startX = s.x0 + 165;
      for (let i = 0; i < p.count; i++) place(startX + i * spacing, i);
      // a flower in each pocket: the reward for waiting in the right place
      for (let i = 0; i <= p.count; i++) this.flower(startX - spacing / 2 + i * spacing, g0 - 40, undefined, true);
      this.log.push(`${p.kind}Row${p.count}`);
      return;
    }
    if (p.shape === 'gap') {
      const run = this.flat(260, { safe: true });
      this.closeBank();
      // a tailwind carries a longer hop; a headwind gets a short one, so the double jump is a way through when the gust is on
      const w = p.kind === 'wind' && p.dir === 1 ? this.rr(0.78, 0.9) * 140 : this.pitW();
      this.arc(this.cx - 30, this.cx + w + 30, g0 - 36, 80, 4);
      this.cx += w;
      this.openBank();
      const land = this.flat(260, { safe: true });
      const pad = p.kind === 'wind' ? 190 : 150;
      zones.push({
        ...base, x0: run.x1 - pad, x1: land.x0 + pad, top: g0 - 230, bottom: g0 + 70, baseY: g0, offset: phase(),
        emit: p.kind === 'spore' ? [run.x1 - 110, land.x0 + 100] : undefined,
      });
      this.log.push(`${p.kind}Gap${Math.round(w)}`);
      return;
    }
    // stepping stones, each with a cloud of its own on a different beat
    this.flat(220, { safe: true });
    this.closeBank();
    let x = this.cx;
    let prevY = g0;
    const y = g0 + 28;
    const first = phase();
    for (let i = 0; i < p.count; i++) {
      const hop = this.hopLen(prevY - y, 0.5);
      const w = 112;
      x += hop;
      this.plat({ x, y, width: w, height: 28, type: 'solid'}, 'island');
      this.flower(x + w / 2, y - 46);
      zones.push({ ...base, x0: x - 20, x1: x + w + 20, top: y - 210, bottom: y + 30, baseY: y, offset: first + i * p.period * 0.37, emit: [x + w / 2] });
      x += w;
      prevY = y;
    }
    x += this.hopLen(prevY - g0, 0.5);
    this.cx = x;
    this.openBank();
    this.flat(220, { safe: true });
    this.log.push(`${p.kind}Stones${p.count}`);
  }

  /** an enemy yard: open ground, a mound, a sunken pit, a log bridge, tiers or a floor with ledges (see stageYards.ts) */
  chunkYard(count = this.ri(2, 1 + Math.ceil(1 + this.d * 3)), variant: YardVariant = 'plain'): string {
    const v = buildYard(this, variant, count);
    this.log.push(`yard${count}${v === 'plain' ? '' : v}`);
    return v === 'plain' ? 'yard' : 'yard' + v[0].toUpperCase() + v.slice(1);
  }

  /** the two-lane forks laid down so far */
  lanes: LaneFork[] = [];
  /** narrow landings (under 64 px) still allowed in this stage: only a deliberate precision beat in World 5 or later may use them */
  narrowLeft = 0;

  /** the pieces laid down so far, in order, each with the stretch of the stage it covers (kept in meta.pieces) */
  pieces: Array<{ k: string; x0: number; x1: number; beat?: string }> = [];

  /** run a piece builder and record the stretch it covers */
  piece(label: string, build: () => string | void) {
    const x0 = this.cx;
    const named = build();
    this.pieces.push({ k: named || label, x0, x1: this.cx });
  }

  chunk(kind: Kind) {
    const runup: Partial<Record<Kind, number>> = { pit: 130, stones: 140, swing: 220, moving: 180, fragile: 170, river: 160, zone: 200, skyhop: 150, islands: 150, gapbridge: 130, pillars: 150, zigzag: 150, pegs: 150 };
    if (runup[kind]) this.ensure(runup[kind]!);
    this.piece(kind, () => this.chunkBody(kind));
  }

  private chunkBody(kind: Kind): string | void {
    switch (kind) {
      case 'flat': { const s = this.flat(this.rr(200, 420)); this.row(s.x0 + 50, s.x1 - 50, this.g - 32, this.ri(2, 4)); this.log.push('flat'); break; }
      case 'pit': this.chunkPit(); break;
      case 'hill': this.chunkHill(); break;
      case 'bridge': this.chunkBridge(); break;
      case 'stones': this.chunkStones(); break;
      case 'cliff': this.chunkCliff(); break;
      case 'leafdrop': this.chunkLeafDrop(true); break;
      case 'leafbonus': this.chunkLeafDrop(false); break;
      case 'bounce': this.chunkBounce(); break;
      case 'ladder': this.chunkLadder(); break;
      case 'swing': this.chunkSwing(); break;
      case 'moving': this.chunkMoving(); break;
      case 'fragile': this.chunkFragile(); break;
      case 'yard': return this.chunkYard();
      case 'yardMound': return this.chunkYard(undefined, 'mound');
      case 'yardSunken': return this.chunkYard(undefined, 'sunken');
      case 'yardBridge': return this.chunkYard(undefined, 'bridge');
      case 'yardTiers': return this.chunkYard(undefined, 'tiers');
      case 'yardLedges': return this.chunkYard(undefined, 'ledges');
      case 'tower': this.chunkTower(); break;
      case 'valley': this.chunkValley(); break;
      case 'rolling': this.chunkRolling(); break;
      case 'hurdles': this.chunkHurdles(); break;
      case 'terrace': this.chunkTerrace(); break;
      case 'gapbridge': this.chunkGapBridge(); break;
      case 'skyhop': this.chunkSkyhop(); break;
      case 'islands': this.chunkIslands(); break;
      case 'canopy': this.chunkCanopy(); break;
      case 'ropegap': this.chunkRopeGap(); break;
      case 'ropebonus': this.chunkRopeBonus(); break;
      case 'pillars': this.chunkPillars(); break;
      case 'slope': this.chunkSlope(); break;
      case 'stumps': this.chunkStumps(); break;
      // (a zigzag is a long hop over a pit that cannot hold a flag, so one is planted just before it)
      case 'zigzag': this.checkpoint(); this.chunkZigzag(); break;
      case 'trampoline': this.chunkTrampoline(); break;
      case 'causeway': this.chunkCauseway(); break;
      case 'pegs': this.chunkPegs(); break;
      case 'meadow': this.chunkMeadow(); break;
      case 'ditch': this.chunkDitch(); break;
      case 'twin': this.chunkTwin(); break;
      case 'zone': this.chunkZone(this.zoneQueue.shift() ?? zoneRecipes(this.world, this.cfg.miniIndex)[0]); break;
      case 'river': this.chunkRiver(this.riverQueue.shift() ?? riverRecipes(this.cfg.miniIndex)[0]); break;
    }
  }

  /** the nearest the next flag may stand to the last one (the first flag stands at least 700 px from the start, the others 900 px apart) */
  flagMin() { return this.CP.length ? 900 : 720; }
  /** distance from the last flag (or the start) to the cursor */
  sinceFlag() { return this.cx - this.lastFlagX; }
  canFlag() { return this.cx + 90 - this.lastFlagX >= this.flagMin(); }

  /** a short breather with a checkpoint flag on it (nothing is built if a flag here would stand too close to the last one) */
  checkpoint(): boolean {
    if (!this.canFlag()) return false;
    const s = this.flat(this.safeMode ? 260 : 310, { safe: true });
    this.CP.push({ x: s.x0 + 90, y: this.g, reached: false });
    this.lastFlagX = s.x0 + 90;
    this.log.push('checkpoint');
    // a low branch beside the flag with a couple of flowers on it: the rest stop is a place, not a strip of ground
    if (!this.safeMode && this.chance(0.9)) {
      this.plat({ x: s.x0 + 168, y: this.g - this.rr(74, 84), width: 112, height: 26, type: 'solid' }, 'tier');
      this.row(s.x0 + 188, s.x0 + 260, this.g - 118, 2);
    }
    return true;
  }

  /** a flag now, with a stretch of ground first if the last flag is too near for one (the flag stands at least `flagMin` px from the last) */
  checkpointNow(): boolean {
    const short = this.flagMin() - (this.cx + 90 - this.lastFlagX);
    if (short > 0) this.flat(short + 12);
    return this.checkpoint();
  }

  /** a flag at x on the ground that stands there now (used by pieces that carry their own flag on a shared platform) */
  flagAt(x: number, y: number) {
    this.CP.push({ x, y, reached: false });
    this.lastFlagX = x;
    this.log.push('checkpoint');
  }

  // ---- trying a piece and taking it back ----
  mark() {
    return {
      P: this.P.length, V: this.V.length, R: this.R.length, T: this.T.length, E: this.E.length, C: this.C.length, CP: this.CP.length,
      spots: this.spots.length, log: this.log.length, pieces: this.pieces.length, lanes: this.lanes.length,
      rivers: this.rivers ? this.rivers.length : -1, zones: this.zones ? this.zones.length : -1,
      riverQueue: this.riverQueue.slice(), zoneQueue: this.zoneQueue.slice(),
      pid: this.pid, vid: this.vid, eid: this.eid, cid: this.cid, tid: this.tid,
      cx: this.cx, g: this.g, bank: this.bank, lastFlagX: this.lastFlagX, rs: this.rs, ss: this.ss, narrowLeft: this.narrowLeft,
    };
  }

  rewind(m: ReturnType<Gen['mark']>) {
    this.P.length = m.P; this.V.length = m.V; this.R.length = m.R; this.T.length = m.T; this.E.length = m.E; this.C.length = m.C; this.CP.length = m.CP;
    this.spots.length = m.spots; this.log.length = m.log; this.pieces.length = m.pieces; this.lanes.length = m.lanes;
    if (m.rivers < 0) this.rivers = undefined; else if (this.rivers) this.rivers.length = m.rivers;
    if (m.zones < 0) this.zones = undefined; else if (this.zones) this.zones.length = m.zones;
    this.riverQueue = m.riverQueue.slice(); this.zoneQueue = m.zoneQueue.slice();
    this.pid = m.pid; this.vid = m.vid; this.eid = m.eid; this.cid = m.cid; this.tid = m.tid;
    this.cx = m.cx; this.g = m.g; this.bank = m.bank; this.lastFlagX = m.lastFlagX; this.rs = m.rs; this.ss = m.ss; this.narrowLeft = m.narrowLeft;
  }

  /** this stage's favourite pieces: a few kinds it uses more than the others, so every stage has its own flavour */
  fav = new Set<Kind>();
  recipe?: { core: string; partner: string | null; fork: string };
  pickFavourites() {
    const pool = (Object.keys(UNLOCK) as Kind[]).filter((k) => UNLOCK[k] <= this.m && k !== 'flat' && k !== 'river' && k !== 'zone' && (k !== 'tower' || this.G >= 560));
    for (let i = 0; i < 4 && pool.length; i++) this.fav.add(pool.splice(Math.floor(this.rnd() * pool.length), 1)[0]);
  }


  // ---- stage recipes: every ordinary stage is about one idea (and a long one is a few acts, each about its own idea) ----
  /** the pieces a recipe may be built on: they demand something of the player, and need no skill the player may lack */
  private recipeOk(k: Kind) {
    return UNLOCK[k] <= this.m && INTENSITY[k] >= 1 && k !== 'river' && k !== 'zone' && k !== 'ropegap' && k !== 'ropebonus' && !isYardKind(k) && (k !== 'tower' || this.G >= 560);
  }

  private weightedFrom(kinds: Kind[]): Kind {
    const w = kinds.map((k) => Math.max(0.05, BASE_WEIGHT[k] * (OBJ_WEIGHT[this.cfg.objectiveType]?.[k] ?? 1) * (this.fav.has(k) ? 2.2 : 1)));
    let r = this.rnd() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < kinds.length; i++) { r -= w[i]; if (r <= 0) return kinds[i]; }
    return kinds[kinds.length - 1];
  }

  /** the idea this stage (or this act of it) is built around; `exclude` are the ideas the earlier acts used */
  pickCore(exclude: Kind[] = []): Kind {
    const obj = this.cfg.objectiveType;
    // a stage the story names for a way of moving is built around it (stagePlan.ts: 4-2 First Glide, 4-7 The Long Drop, 8-6 Glide by Moonlight)
    const story = STORY_CORE[this.cfg.id];
    if (story && !exclude.length && UNLOCK[story] <= this.m && !this.cfg.secret) return story;
    const all = (Object.keys(UNLOCK) as Kind[]).filter((k) => this.recipeOk(k) && !exclude.includes(k));
    if (obj === 'purge' || obj === 'gauntlet') {
      const ys = YARD_KINDS.filter((k) => UNLOCK[k] <= this.m && !exclude.includes(k));
      const pool = ys.length ? ys : YARD_KINDS.filter((k) => UNLOCK[k] <= this.m);
      return pool[Math.floor(this.rnd() * pool.length)];
    }
    if (obj === 'vine_runner' && UNLOCK.swing <= this.m && !exclude.includes('swing')) return 'swing';
    if (obj === 'relic_hunt' || obj === 'rescue') {
      const route = (['cliff', 'bounce', 'tower'] as Kind[]).filter((k) => all.includes(k));
      if (route.length) return route[Math.floor(this.rnd() * route.length)];
    }
    // a piece that has only just been unlocked is what its first stages are for
    const fresh = all.filter((k) => UNLOCK[k] >= this.m - 2 && UNLOCK[k] >= 2);
    if (fresh.length && this.chance(0.8)) return fresh[Math.floor(this.rnd() * fresh.length)];
    return all.length ? this.weightedFrom(all) : 'pit';
  }

  /** the second idea the twist folds in: never as hard as the first one */
  pickPartner(core: Kind): Kind | null {
    const cap = isYardKind(core) || INTENSITY[core] < 2 ? 2 : 1;
    const pool = (Object.keys(UNLOCK) as Kind[]).filter((k) => this.recipeOk(k) && k !== core && INTENSITY[k] <= cap);
    return pool.length ? this.weightedFrom(pool) : null;
  }

  /** an easy, pleasant piece for a breather */
  calmKind(avoid: string = ''): Kind {
    const pool = (['meadow', 'canopy', 'slope', 'valley', 'rolling', 'causeway', 'hill', 'bridge', 'twin', 'ditch'] as Kind[]).filter((k) => UNLOCK[k] <= this.m && k !== avoid && this.pieces[this.pieces.length - 1]?.k !== k);
    return pool[Math.floor(this.rnd() * pool.length)] ?? 'hill';
  }

  /** the side route every stage offers: a ladder to a perch, or (once the rope is known) fruit along a rope */
  pickFork(): Kind {
    return skillGuaranteedAt('shimmy', this.m) && this.chance(0.4) ? 'ropebonus' : 'ladder';
  }

  /** the yard shape this stage has used least so far */
  pickYardKind(): Kind {
    const pool = YARD_KINDS.filter((k) => UNLOCK[k] <= this.m);
    let best = Infinity;
    for (const k of pool) best = Math.min(best, this.used.get(k) ?? 0);
    const least = pool.filter((k) => (this.used.get(k) ?? 0) === best && this.pieces[this.pieces.length - 1]?.k !== k);
    const from = least.length ? least : pool;
    return from[Math.floor(this.rnd() * from.length)];
  }

  /** the width this stage is being built to, how often each kind of piece has been laid and how much of the stage it covers, and whether the stage is overdue a hazard */
  /** how far along the stage is, by the clock of the time model (0..1) */
  progress = 0;
  used = new Map<string, number>();
  lenOf = new Map<string, number>();
  needHazard = false;

  pickKind(last: Kind[], forbid: Kind[] = []): Kind {
    const w: Array<[Kind, number]> = [];
    const prog = this.progress;
    for (const k of Object.keys(UNLOCK) as Kind[]) {
      if (UNLOCK[k] > this.m || forbid.includes(k)) continue;
      if (k === 'flat') continue; // flats come from spacers
      if (k === 'tower' && this.G < 560) continue;
      let wt = BASE_WEIGHT[k] * (OBJ_WEIGHT[this.cfg.objectiveType]?.[k] ?? 1) * (WORLD_WEIGHT[this.world]?.[k] ?? 1);
      if (this.fav.has(k)) wt *= 2.2;
      if (last.includes(k)) wt *= 0.25;
      // variety: the more often a kind has been used, and the more of the stage it already covers, the less likely it is
      wt *= Math.pow(0.55, this.used.get(k) ?? 0);
      // something this stage has not shown yet is welcome: a stage shows at least nine kinds of piece
      if (!this.used.get(k) && this.used.size < 12) wt *= 2.6 + 3 * Math.max(0, 10 * Math.min(1, prog * 1.25) - this.used.size);
      if (this.used.get(k) && this.used.size < 9 && prog > 0.5) wt *= 0.4;
      if ((this.lenOf.get(k) ?? 0) > 0.2 * Math.max(this.cx, 8000)) wt *= 0.1;
      // a stage that has gone a long way without anything in the way gets something in the way
      if (this.needHazard && !HAZARD_KIND.has(k)) wt *= 0.04;
      // the arc of difficulty: easy to begin with, the last third asks the most
      if (prog < 0.22 && INTENSITY[k] >= 2) wt *= 0.4;
      if (prog > 0.62 && INTENSITY[k] >= 1) wt *= 1.6;
      if (prog > 0.62 && INTENSITY[k] === 0) wt *= 0.6;
      if (this.safeMode && INTENSITY[k] > 1) wt *= 0.2;
      w.push([k, wt]);
    }
    let sum = w.reduce((a, [, x]) => a + x, 0);
    let r = this.rnd() * sum;
    for (const [k, x] of w) { r -= x; if (r <= 0) return k; }
    return 'pit';
  }

  /** a light, short piece to fill the ground between the big ideas: never one the stage has just shown, kinds not yet shown first */
  pickLight(last: Kind[]): Kind | null {
    const LIGHT: Kind[] = ['pit', 'hill', 'stones', 'valley', 'rolling', 'hurdles', 'terrace', 'gapbridge', 'skyhop', 'islands', 'canopy', 'slope', 'stumps', 'zigzag', 'trampoline', 'causeway', 'pegs', 'meadow', 'ditch', 'twin', 'pillars', 'bridge', 'cliff'];
    const lastLabel = this.pieces.length ? this.pieces[this.pieces.length - 1].k : '';
    const w: Array<[Kind, number]> = [];
    for (const k of LIGHT) {
      if (UNLOCK[k] > this.m || last.includes(k) || k === lastLabel) continue;
      if (k === 'tower' && this.G < 560) continue;
      let wt = BASE_WEIGHT[k] * (OBJ_WEIGHT[this.cfg.objectiveType]?.[k] ?? 1) * (WORLD_WEIGHT[this.world]?.[k] ?? 1);
      if (this.used.get(k)) wt *= Math.pow(0.4, this.used.get(k) ?? 0); else wt *= 4;
      if ((this.lenOf.get(k) ?? 0) > 0.2 * Math.max(this.cx, 8000)) wt *= 0.1;
      if (this.safeMode && INTENSITY[k] > 1) wt *= 0.2;
      w.push([k, wt]);
    }
    const sum = w.reduce((a, [, x]) => a + x, 0);
    if (sum <= 0) return null;
    let r = this.rnd() * sum;
    for (const [k, x] of w) { r -= x; if (r <= 0) return k; }
    return w[0][0];
  }

  /** the stretches the stage means as rests (the loop records them; the metrics leave them out of the empty-corridor count) */
  breathers: Array<[number, number]> = [];
}

// ---------------------------------------------------------------------------
// Horizontal levels
// ---------------------------------------------------------------------------

type Role = 'intro' | 'shift' | 'develop' | 'side' | 'twist' | 'climax' | 'payoff' | 'breather';

/** how a stage is timed while it is built: the seconds it should take, and the seconds per px the animals, relics and cages added afterwards are expected to cost */
interface Timing { target: number; rho: number; /** the seconds the level list asks for: what decides how many acts and forks the stage has, whatever the clock is aimed at */ nominal?: number }

function buildHorizontal(gen: Gen, timing: Timing): GeneratedStage {
  const cfg = gen.cfg;
  const obj = cfg.objectiveType;
  // World 2's rivers take up room that the stage's fights and pickups also need, so the stage is as much longer as its rivers are wide
  const hasRivers = cfg.worldIndex === 2 && obj !== 'ascent' && obj !== 'boss_lair' && !cfg.secret;
  const zonePieces = [3, 4, 5, 6, 7, 8, 9, 10].includes(cfg.worldIndex) && obj !== 'ascent' && obj !== 'boss_lair' && !cfg.secret ? zoneRecipes(cfg.worldIndex, cfg.miniIndex) : [];
  const T = timing.target;
  gen.narrowLeft = gen.world >= 5 && !gen.safeMode ? 2 : 0;
  const seconds = timing.nominal ?? T;
  // the clock the stage is built by: the time model on what is laid so far, plus what the animals and pickups still to come will cost
  const view = { config: cfg, platforms: gen.P, vines: gen.V, ropes: gen.R, enemies: gen.E, collectibles: gen.C, spawnX: gen.spawnX, exitTotemX: 0, lanes: gen.lanes } as unknown as GeneratedStage & { rivers?: unknown; zones?: unknown };
  const clock = () => {
    view.rivers = gen.rivers;
    view.zones = gen.zones;
    view.exitTotemX = gen.cx;
    return modelStage(view, MODEL_TYPICAL).total + timing.rho * (gen.cx - gen.spawnX);
  };
  /** the goal run (flat, stairs, shrine) at the end costs about this */
  const TAIL = 7;

  gen.pickFavourites();
  // ---- the recipe: one idea per act, introduced safely, developed, twisted, paid off ----
  const recipeOn = obj !== 'ascent' && !cfg.secret;
  const nActs = !recipeOn ? 1 : seconds >= 175 ? 3 : 2;
  const cores: Kind[] = [];
  for (let a = 0; a < nActs; a++) cores.push(gen.pickCore(cores));
  const partners = cores.map((c) => gen.pickPartner(c));
  const side = gen.pickFork();
  for (const c of cores) gen.fav.add(c);
  gen.recipe = { core: cores[0], partner: partners[0], fork: side };

  // ---- opening: safe ground to find your feet ----
  gen.flat(Math.round(gen.rr(520, 700)), { safe: true });
  const spawnX = gen.spawnX;
  const spawnY = gen.g;
  gen.log.push('intro');

  // pieces the objective insists on, spread across the level
  const forced: Array<{ at: number; kind: Kind | 'fork'; fork?: number }> = [];
  const spread = (n: number, kinds: Kind[]) => {
    for (let i = 0; i < n; i++) forced.push({ at: T * ((i + 0.6) / (n + 0.4)) * 0.92, kind: kinds[i % kinds.length] });
  };
  // (only pieces the route runs over: a ladder is a side trip, and an idol left on a skipped ladder could never be fetched back)
  if (obj === 'relic_hunt') spread(gen.cfg.targetCount, gen.G >= 700 ? ['tower', 'cliff', 'terrace', 'bounce'] : ['cliff', 'terrace', 'bounce']);
  if (obj === 'rescue') spread(gen.cfg.targetCount, gen.m >= 2 ? ['cliff', 'terrace', 'bounce'] : ['cliff', 'bounce']);
  // the Vine Swing mission is about swinging: vines are always in it (once vines are unlocked)
  if (obj === 'vine_runner') spread(3 + (seconds >= 175 ? 1 : 0), ['swing']);
  if (obj === 'purge' || obj === 'gauntlet') {
    const yards = Math.ceil((gen.cfg.targetCount + 2) / 3.2);
    for (let i = 0; i < yards; i++) forced.push({ at: T * ((i + 0.5) / (yards + 0.2)) * 0.95, kind: 'yard' });
  }
  // World 2 is the river world: every ordinary stage has the rivers its place in the world calls for (river.ts)
  if (hasRivers) {
    const recs = riverRecipes(cfg.miniIndex);
    gen.riverQueue = recs.slice();
    recs.forEach((_, i) => forced.push({ at: T * ((i + 0.55) / (recs.length + 0.25)) * 0.9, kind: 'river' }));
  }
  // Worlds 3 and 4 have a rule of their own too: spore clouds and wind gusts, taught in order (zones.ts)
  if (zonePieces.length) {
    gen.zoneQueue = zonePieces.slice();
    zonePieces.forEach((_, i) => forced.push({ at: T * ((i + 0.55) / (zonePieces.length + 0.25)) * 0.9, kind: 'zone' }));
  }
  // two-lane forks: one to three by length, in different acts, never side by side
  const nForks = recipeOn ? (seconds < 160 ? 1 : seconds < 205 ? 2 : 3) : 0;
  const forkAt = nForks === 1 ? [0.4] : nForks === 2 ? [0.25, 0.62] : [0.17, 0.46, 0.73];
  const at = (f: number) => T * f;
  forkAt.forEach((f, i) => forced.push({ at: at(f), kind: 'fork', fork: i }));
  forced.sort((a, b) => a.at - b.at);

  // the beats, placed along the stage. Early stages get a gentler arc (no twist, one test), so the first hours stay friendly.
  const script: Array<{ at: number; role: Role; act: number }> = [];
  if (recipeOn) {
    const acts: Array<[number, number]> = nActs === 3 ? [[0, 0.3], [0.33, 0.64], [0.67, 0.94]] : [[0, 0.46], [0.5, 0.94]];
    acts.forEach(([a0, a1], a) => {
      const w = a1 - a0;
      const lastAct = a === nActs - 1;
      script.push({ at: at(a0), role: a === 0 ? 'intro' : 'shift', act: a });
      if (!isYardKind(cores[a])) script.push({ at: at(a0 + (lastAct ? 0.2 : 0.24) * w), role: 'develop', act: a });
      if (a === 0 || (a === 2 && nActs === 3)) script.push({ at: at(a0 + 0.4 * w), role: 'side', act: a });
      if (gen.m >= 3) {
        script.push({ at: at(a0 + (lastAct ? 0.46 : 0.62) * w), role: 'twist', act: a });
        if (lastAct) script.push({ at: at(a0 + 0.66 * w), role: 'climax', act: a });
      }
      script.push({ at: at(a0 + (lastAct ? 0.84 : 0.88) * w), role: lastAct && gen.m >= 3 ? 'payoff' : 'breather', act: a });
    });
    // the breather before the final approach: the rest after the hardest stretch
    script.push({ at: at(0.96), role: 'breather', act: nActs - 1 });
  }
  script.sort((a, b) => a.at - b.at);

  const calmRow = (len: number) => { const s = gen.flat(len); gen.row(s.x0 + 30, s.x1 - 30, gen.g - 32, 3); if (len >= 220 && gen.chance(0.75)) gen.overLedge(s, 2); return s; };
  /** a flag after something hard, so a slip costs one section and not the whole stretch */
  const flagAfterHard = () => { if (gen.sinceFlag() > (finishing() ? 1150 : 750)) gen.checkpoint(); };

  const last: Kind[] = [];
  let hardJustNow = 0;
  let pieces = 0;
  let lastHazardX = spawnX;
  const lastLabel = () => (gen.pieces.length ? gen.pieces[gen.pieces.length - 1].k : '');

  /** lay one piece. Too far from the last flag afterwards (past 1700 px)? Take it back, put a flag first and lay it again: a piece is never left to span two flags' worth of ground */
  const run = (fn: () => void) => {
    const m = gen.mark();
    fn();
    if (gen.sinceFlag() > 1450) {
      gen.rewind(m);
      gen.checkpointNow();
      fn();
    }
  };
  const lay = (kind: Kind, post?: () => void) => {
    // two pieces of one kind never meet
    if (lastLabel() === kind) {
      const f = gen.pickKind(last, [kind, lastLabel() as Kind]);
      run(() => gen.chunk(f));
      account(f);
    }
    const m0 = gen.mark();
    run(() => { gen.chunk(kind); post?.(); });
    // (a yard that fell back to plain ground, or any piece that turned out to be what the one before it was: laid again as something else)
    const n = gen.pieces.length;
    if (n >= 2 && gen.pieces[n - 1].k === gen.pieces[n - 2].k && kind !== 'river' && kind !== 'zone') {
      const dup = gen.pieces[n - 1].k as Kind;
      gen.rewind(m0);
      const f = isYardKind(kind) ? gen.pickYardKind() : gen.pickKind(last, [kind, dup]);
      run(() => gen.chunk(f));
      account(gen.pieces[gen.pieces.length - 1].k === dup ? kind : f);
      return;
    }
    account(kind);
  };
  const account = (k: Kind) => {
    const piece = gen.pieces[gen.pieces.length - 1];
    gen.used.set(piece?.k ?? k, (gen.used.get(piece?.k ?? k) ?? 0) + 1);
    if (piece) gen.lenOf.set(piece.k, (gen.lenOf.get(piece.k) ?? 0) + (piece.x1 - piece.x0));
    if (HAZARD_KIND.has(k) || (piece && piece.k.startsWith('fork'))) lastHazardX = gen.cx;
    pieces++;
    last.push(k);
    if (last.length > 3) last.shift();
  };
  /** a two-lane fork, tried with different shapes until its lanes are far enough apart in time */
  const layFork = (index: number): boolean => {
    for (let tries = 0; tries < 6; tries++) {
      const m = gen.mark();
      // (a retry rolls different numbers: taking a piece back also takes back the stream)
      for (let k = 0; k < tries * 3; k++) gen.rnd();
      const plan = planFork(gen, index + tries, nForks);
      let ok = false;
      run(() => { ok = buildFork(gen, plan, index, tries); });
      if (ok) {
        const f = gen.lanes[gen.lanes.length - 1];
        if (f && forkDelta(gen, f) >= FORK_MIN_DELTA) {
          const piece = gen.pieces[gen.pieces.length - 1];
          if (piece) { piece.beat = `act${Math.min(nActs, 1 + Math.floor((index * nActs) / Math.max(1, nForks)))}`; }
          account('fork' as Kind);
          lastHazardX = gen.cx;
          return true;
        }
      }
      gen.rewind(m);
    }
    return false;
  };

  let payoffDone = false;
  let beatAct = 0;
  let trimmed = false;
  let swingsKept = 0;
  const pending = () => forced.length > 0 || script.length > 0;
  const minPieces = gen.m <= 2 ? 3 : 4;
  const finishing = () => clock() + TAIL >= T * 1.0;
  let now = 0;
  while ((now = clock()) + TAIL < T * 1.02 || pieces < minPieces || pending()) {
    gen.progress = Math.min(1, now / T);
    if (gen.cx > 52000) break;
    // checkpoint cadence
    if (gen.sinceFlag() >= 1000 && gen.canFlag() && now + TAIL < T * 0.97) { gen.checkpoint(); continue; }
    gen.needHazard = gen.cx - lastHazardX > 1250;
    const late = now >= T * 0.9;
    if (late && !trimmed) {
      // out of room: what is still to come but not needed is dropped (a stage is as long as its time calls for, not as long as its list of ideas)
      trimmed = true;
      const lastBreather = script.length ? script.map((sc) => sc.role).lastIndexOf('breather') : -1;
      const keep = script.filter((sc, i) => sc.role === 'payoff' || (i === lastBreather && i === script.length - 1));
      script.length = 0;
      script.push(...keep);
      for (let i = forced.length - 1; i >= 0; i--) {
        const f = forced[i];
        const essential = f.kind === 'river' || f.kind === 'zone' || f.kind === 'fork' || (f.kind === 'swing' && swingsKept++ < 2) || obj === 'relic_hunt' || obj === 'rescue';
        if (!essential) forced.splice(i, 1);
      }
    }

    let kind: Kind;
    let beat: Role | null = null;
    if (forced.length && (now >= forced[0].at || late)) {
      const f = forced.shift()!;
      if (f.kind === 'fork') {
        if (!layFork(f.fork ?? 0)) gen.log.push('forkSkipped');
        else gen.flat(gen.rr(90, 170));
        pieces++;
        continue;
      }
      kind = f.kind === 'yard' ? gen.pickYardKind() : UNLOCK[f.kind] <= gen.m ? f.kind : gen.pickKind(last);
    } else if (script.length && (now >= script[0].at || finishing())) {
      const sc = script.shift()!;
      beat = sc.role;
      const a = Math.min(sc.act, cores.length - 1);
      kind = beat === 'side' ? side : beat === 'breather' ? gen.calmKind() : cores[a];
      if (beat === 'side' && UNLOCK[side] > gen.m) continue;
      // (a yard core is a different yard each time it comes up)
      if (isYardKind(kind) && (gen.used.get(kind) ?? 0) > 0) kind = gen.pickYardKind();
      beatAct = a;
    } else {
      kind = gen.pickKind(last);
    }
    const a = beatAct;

    // yards are never back to back: terrain separates them, so a fight stage still asks you to jump
    if (recipeOn && isYardKind(kind) && isYardKind((last[last.length - 1] ?? 'flat') as Kind) && !beat) {
      const between = gen.pickPartner(kind);
      if (between) {
        gen.checkpoint();
        lay(between);
        gen.log.push('beat:between');
        gen.flat(gen.rr(110, 200));
      }
    }
    // never two hard pieces back to back (the recipe's own twist is the one planned exception)
    if (!beat && hardJustNow > 0 && INTENSITY[kind] >= 2) { kind = gen.chance(0.5) ? 'hill' : 'bridge'; if (UNLOCK[kind] > gen.m) kind = 'hill'; }

    if (beat === 'intro') {
      // the first look at the idea: a flag just behind it, and no animals on it
      gen.checkpoint();
      const from = gen.spots.length;
      lay(kind, () => { for (const sp of gen.spots.slice(from)) if (!sp.perch) sp.safe = true; calmRow(gen.rr(160, 240)); });
      gen.log.push('beat:intro');
    } else if (beat === 'shift') {
      // a new act: a flag, then a new idea
      gen.checkpoint();
      const from = gen.spots.length;
      lay(kind, () => { for (const sp of gen.spots.slice(from)) if (!sp.perch) sp.safe = true; calmRow(gen.rr(140, 200)); });
      gen.log.push('beat:shift');
    } else if (beat === 'twist') {
      gen.checkpoint();
      lay(cores[a]);
      gen.flat(gen.rr(110, 150));
      gen.checkpoint();
      lay(partners[a] ?? gen.pickKind(last));
      gen.log.push('beat:twist');
      flagAfterHard();
    } else if (beat === 'climax') {
      // the hardest stretch: the act's partner idea, then its own idea again, close together
      gen.checkpoint();
      lay(partners[a] ?? gen.pickKind(last));
      gen.flat(gen.rr(100, 140));
      lay(isYardKind(cores[a]) ? gen.pickYardKind() : cores[a]);
      gen.log.push('beat:climax');
      flagAfterHard();
    } else if (beat === 'payoff') {
      gen.checkpoint();
      lay(isYardKind(cores[a]) ? gen.pickYardKind() : cores[a]);
      payoffDone = true;
      gen.log.push('beat:payoff');
      if (!finishing()) gen.checkpoint();
    } else if (beat === 'breather') {
      const b0 = gen.cx;
      lay(kind);
      calmRow(gen.rr(220, 320));
      gen.breathers.push([b0, gen.cx]);
      gen.log.push('beat:breather');
      flagAfterHard();
    } else {
      lay(kind);
      if (beat) gen.log.push('beat:' + beat);
      else if (INTENSITY[kind] >= 2) flagAfterHard();
    }
    hardJustNow = beat === 'twist' || beat === 'climax' || INTENSITY[kind] >= 2 ? 1 : 0;

    // a short, light piece between the big ones: the stage keeps showing something new (nine kinds at least) and the ground between ideas is not just flat
    if (!finishing() && beat !== 'breather' && (gen.used.size < 10 + Math.floor(gen.progress * 2) || (INTENSITY[kind] < 2 && gen.chance(0.3)))) {
      const lk = gen.pickLight(last);
      if (lk) { lay(lk); gen.flat(gen.rr(70, 130)); hardJustNow = 0; }
    }
    // spacer: ground to breathe on
    const spacerP = INTENSITY[kind] >= 1 ? 0.8 : 0.45;
    if (gen.chance(spacerP)) {
      const s = gen.flat(gen.rr(100, INTENSITY[kind] >= 2 ? 300 : 220));
      if (s.x1 - s.x0 >= 170 && gen.chance(0.85)) gen.overLedge(s);
      else if (gen.chance(0.6)) gen.row(s.x0 + 30, s.x1 - 30, gen.g - 32, 3);
      hardJustNow = 0;
    }
  }
  void payoffDone;
  // a stage that still shows fewer than nine kinds of piece gets a short light one or two more before the goal run
  for (let extra = 0; recipeOn && extra < 3 && gen.used.size < 9; extra++) {
    const lk = gen.pickLight(last);
    if (!lk) break;
    lay(lk);
    gen.flat(gen.rr(70, 130));
  }

  // ---- finish: flat run-up, flag, then the goal staircase ----
  if (gen.sinceFlag() > 1050) gen.checkpoint();
  gen.flat(gen.rr(220, 300));
  // (no flag right after the last one: they must stand 900 px apart)
  if (gen.sinceFlag() > 800) gen.checkpoint();
  const steps = gen.ri(3, 6);
  const stepH = gen.rr(28, 40);
  for (let i = 0; i < steps; i++) { gen.up(stepH); gen.flat(gen.rr(64, 90)); }
  const goal = gen.flat(520, { safe: true });
  const exitTotemX = goal.x0 + 260;
  const exitTotemY = gen.g;
  gen.closeBank();
  gen.item('exit_totem', exitTotemX, exitTotemY - 30);
  gen.exitAt = { x: exitTotemX, y: exitTotemY };
  gen.log.push('goal');

  view.exitTotemX = exitTotemX;
  view.rivers = gen.rivers;
  view.zones = gen.zones;
  const layoutSeconds = modelStage(view, MODEL_TYPICAL).total;
  decorate(gen, spawnX);
  balanceStyles(gen.P, gen.kindOf, gen.world);
  // pickups the settling dropped are no longer on their lane
  const alive = new Set(gen.C.map((c) => c.id));
  for (const f of gen.lanes) { f.high.flowers = f.high.flowers.filter((i) => alive.has(i)); f.low.flowers = f.low.flowers.filter((i) => alive.has(i)); }

  const out: GeneratedStage = {
    config: { ...cfg, levelWidth: Math.round(gen.cx) },
    trees: gen.T,
    platforms: gen.P,
    vines: gen.V,
    ropes: gen.R,
    enemies: gen.E,
    boss: null,
    collectibles: gen.C,
    spawnX,
    spawnY,
    exitTotemX,
    exitTotemY,
    checkpoints: gen.CP,
    waterY: gen.waterY,
    ...(gen.rivers ? { rivers: gen.rivers } : {}),
    ...(gen.zones ? { zones: gen.zones } : {}),
    ...(gen.lanes.length ? { lanes: gen.lanes } : {}),
    meta: { attempt: 0, chunks: [], width: 0, breathers: gen.breathers },
  };
  out.meta!.forksWanted = nForks;
  out.meta!.timing = { layoutSeconds, decorSeconds: modelStage(out, MODEL_TYPICAL).total - layoutSeconds, route: exitTotemX - spawnX };
  return out;
}

/** Everything that depends on the finished layout: enemies, fliers, rewards, quotas. */
function decorate(gen: Gen, spawnX: number) {
  const cfg = gen.cfg;
  const obj = cfg.objectiveType;
  const exitX = gen.exitAt ? gen.exitAt.x : gen.cx;
  const prog = (x: number) => Math.max(0, Math.min(1, (x - spawnX) / Math.max(1, exitX - spawnX)));
  /** what belongs to one lane of a fork and no other: it cannot count towards a quota (a player may take the other lane) */
  const laneEnemy = new Set<number>();
  const laneFlower = new Set<number>();
  for (const f of gen.lanes) for (const r of [f.high, f.low]) { r.enemies.forEach((i) => laneEnemy.add(i)); r.flowers.forEach((i) => laneFlower.add(i)); }
  const awayFromSafe = (x: number) =>
    Math.abs(x - spawnX) > 360 && gen.CP.every((c) => Math.abs(c.x - x) > 260) && (!gen.exitAt || Math.abs(gen.exitAt.x - x) > 420);
  // every hop in the stage: an animal's patch stays 120 px clear of a take-off and of a landing
  const edges = jumpEdges(gen.P);
  const EDGE_CLEAR = 124;
  /** a patrol patch cut back so it stays 230 px from the start, every flag and the exit, and clear of every take-off and landing on its own ground (null if too little is left to patrol) */
  const clearPatch = (mid: number, pMin: number, pMax: number, y: number): [number, number] | null => {
    const spots = [spawnX, ...gen.CP.map((c) => c.x), ...(gen.exitAt ? [gen.exitAt.x] : [])];
    for (const x of spots) {
      if (x > pMin - 230 && x < pMax + 230) {
        if (x <= mid) pMin = Math.max(pMin, x + 230); else pMax = Math.min(pMax, x - 230);
      }
    }
    for (const e of edges) {
      if (Math.abs(e.from.y - y) < 5 && e.takeoffX >= pMin && e.from.x <= mid && e.takeoffX - EDGE_CLEAR < pMax) pMax = Math.min(pMax, e.takeoffX - EDGE_CLEAR);
      if (Math.abs(e.to.y - y) < 5 && e.landX <= pMax && e.to.x + e.to.width >= mid && e.landX + EDGE_CLEAR > pMin) pMin = Math.max(pMin, e.landX + EDGE_CLEAR);
    }
    return pMax - pMin >= 70 && mid >= pMin && mid <= pMax ? [pMin, pMax] : null;
  };

  // ---- ordinary ground enemies on suitable flats: sparse at the start, thicker and harder as the stage goes on ----
  const p0: Record<string, number> = {
    sprint: 0.2, harvest: 0.24, purge: 0.55, ascent: 0.3, stealth: 0.12, vine_runner: 0.1,
    relic_hunt: 0.24, rescue: 0.3, gauntlet: 0.62,
  };
  const base = (p0[obj] ?? 0.2) * (gen.m === 1 ? 0.4 : 0.9 + gen.d * 0.9);
  let first = gen.m > 1;
  let pairNext = false;
  for (const s of gen.spots) {
    const len = s.x1 - s.x0;
    if (s.safe || s.yard || s.perch || len < 230) continue;
    const mid = (s.x0 + s.x1) / 2;
    if (!awayFromSafe(mid)) continue;
    const pr = prog(mid);
    // a pair at a set-piece moment: after one animal the next flat often has a partner (more so late on), then a calm stretch
    const pEnemy = pairNext ? 0.85 : base * (0.62 + 0.95 * Math.pow(pr, 1.4));
    if (!first && gen.rnd() > pEnemy) { pairNext = false; continue; }
    const patch = clearPatch(mid, s.x0 + 50, s.x1 - 50, s.y);
    if (!patch) continue;
    first = true;
    gen.ground(mid, s.y, patch[0], patch[1], pr);
    pairNext = !pairNext && pr > 0.45 && gen.chance(0.28 + 0.3 * pr);
  }

  // ---- quota top-ups ----
  const have = (f: (t: string) => boolean) => gen.C.filter((c) => f(c.type)).length;
  const perches = gen.spots.filter((s) => s.perch).sort((a, b) => a.x0 - b.x0);
  const flats = gen.spots.filter((s) => !s.safe && !s.perch && !s.yard && s.x1 - s.x0 >= 180);
  const shared = () => gen.E.filter((e) => !laneEnemy.has(e.id)).length;

  if (obj === 'purge' || obj === 'gauntlet') {
    let guard = 0;
    // wide flats first; if the layout has too few, any open ground of 140 px or more will do
    const wideSpots = gen.spots.filter((s) => !s.yard && !s.perch && !s.safe && s.x1 - s.x0 >= 140);
    const order = [...flats, ...wideSpots.filter((s) => !flats.includes(s))].sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0));
    while (shared() < cfg.targetCount + 2 && guard++ < 400) {
      const s = order[guard % Math.max(1, order.length)];
      if (!s) break;
      let mid = (s.x0 + s.x1) / 2 + gen.rr(-40, 40);
      // animals never stand in a heap: slide along the flat to a spot 130 px clear of the others
      for (let k = 0; k < 6 && gen.E.some((o) => o.type !== 'eagle' && Math.abs(o.x - mid) < 130); k++) {
        mid += (k % 2 ? -1 : 1) * 70 * (1 + Math.floor(k / 2));
      }
      if (mid < s.x0 + 40 || mid > s.x1 - 40) continue;
      if (gen.E.some((o) => o.type !== 'eagle' && Math.abs(o.x - mid) < 130)) continue;
      if (!awayFromSafe(mid)) continue;
      const patch = clearPatch(mid, s.x0 + 40, s.x1 - 40, s.y);
      if (!patch) continue;
      gen.ground(mid, s.y, patch[0], patch[1], prog(mid));
    }
    // still short on a crowded layout: pack the animals a little closer (never closer than 95 px)
    for (let pass = 0; pass < 200 && shared() < cfg.targetCount + 1 && order.length; pass++) {
      const s = order[pass % order.length];
      const mid = s.x0 + 40 + gen.rnd() * Math.max(0, s.x1 - s.x0 - 80);
      if (gen.E.some((o) => o.type !== 'eagle' && Math.abs(o.x - mid) < 95) || !awayFromSafe(mid)) continue;
      const patch = clearPatch(mid, s.x0 + 40, s.x1 - 40, s.y);
      if (!patch) continue;
      gen.ground(mid, s.y, patch[0], patch[1], prog(mid));
    }
  }

  if (obj === 'rescue') {
    const route = perches.filter((s) => !s.optional);
    const pool = route.length >= cfg.targetCount ? route : [...route, ...flats];
    pool.sort((a, b) => a.x0 - b.x0);
    const step = pool.length / cfg.targetCount;
    for (let i = 0; i < cfg.targetCount; i++) {
      const s = pool[Math.min(pool.length - 1, Math.floor(i * step + step / 2))];
      gen.item('cage', (s.x0 + s.x1) / 2, s.y - 26);
    }
  }

  if (obj === 'relic_hunt') {
    const route = perches.filter((s) => !s.optional);
    const pool = route.length >= cfg.targetCount ? route : [...route, ...flats];
    pool.sort((a, b) => a.x0 - b.x0);
    const step = pool.length / cfg.targetCount;
    for (let i = 0; i < cfg.targetCount; i++) {
      const s = pool[Math.min(pool.length - 1, Math.floor(i * step + step / 2))];
      gen.item('relic', (s.x0 + s.x1) / 2, s.y - 26);
    }
  }

  // ---- harvest: the quota can be met on the shared ground whichever lane is taken, and the stage holds about 1.6 times the quota: the surplus is
  // the reward on the longer lanes (the high lane of an ordinary fork, the scenic lane of a reversed one) ----
  const flora = (t: string) => t === 'flower' || t === 'leaf';
  const sharedFlora = () => gen.C.filter((c) => flora(c.type) && !laneFlower.has(c.id)).length;
  if (obj === 'harvest') {
    let guard = 0;
    const pool = [...flats, ...perches];
    while (sharedFlora() < cfg.targetCount + 4 && guard++ < 200 && pool.length) {
      const s = pool[guard % pool.length];
      gen.row(s.x0 + 30, s.x1 - 30, s.y - 32, 4, true);
    }
  }

  // ---- hearts at checkpoints (every other one), one golden heart on a high perch ----
  gen.CP.forEach((c, i) => { if (i % 2 === 1) gen.item('heart', c.x + 120, c.y - 34); });
  const bestPerch = [...perches].sort((a, b) => a.y - b.y)[0];
  if (bestPerch && gen.m >= 3) gen.item('super_heart', (bestPerch.x0 + bestPerch.x1) / 2 + 40, bestPerch.y - 30);
  // power-ups wait on other perches
  const kinds: Collectible['type'][] = ['powerup_speed', 'powerup_magnet', 'powerup_invincible'];
  perches.forEach((s, i) => { if (gen.m >= 3 && i % 3 === 1) gen.item(kinds[(i + gen.world) % 3], (s.x0 + s.x1) / 2 - 40, s.y - 30); });

  // ---- fliers ----
  const wide = cfg.levelWidth;
  // the level is built shorter than its planned width: eagles go along the real ground (up to the exit), or a quota stage could count
  // fliers that wait beyond the exit and can never be reached (the how-many still comes from the planned width, so nothing else shifts)
  const reach = Math.round(gen.cx);
  const nEagles =
    obj === 'stealth' ? 3 + Math.floor(gen.world * 0.45)
    : obj === 'purge' || obj === 'gauntlet' ? 1 + Math.floor(gen.world * 0.3)
    : gen.m < 3 ? 0
    : Math.floor(wide / 2000);
  for (let i = 0; i < nEagles; i++) {
    for (let tries = 0; tries < 20; tries++) {
      const x = gen.rr(1100, Math.max(1101, reach - 1100));
      const homeY = gen.G - gen.rr(230, 270);
      if (gen.CP.every((c) => Math.abs(c.x - x) > 480) && gen.skyClear(x, homeY)) {
        gen.eagle(x, homeY);
        break;
      }
    }
  }

  // ---- no stretch of ground without anything on it for long: an animal (or a flier) goes in the middle of the longest ones ----
  if (obj !== 'ascent') {
    const view = { platforms: gen.P, enemies: gen.E, zones: gen.zones, rivers: gen.rivers, vines: gen.V, ropes: gen.R, lanes: gen.lanes } as unknown as GeneratedStage;
    const inRest = (a: number, b: number) => gen.breathers.some(([x0, x1]) => a >= x0 - 10 && b <= x1 + 10);
    for (let round = 0; round < 8; round++) {
      const blocks = hazardBlocks(view);
      let worst: [number, number] | null = null;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < blocks.length; i++) pts.push([i === 0 ? spawnX : blocks[i - 1][1], blocks[i][0]]);
      for (const [a, b] of pts) if (b - a > 1900 && !inRest(a, b) && (!worst || b - a > worst[1] - worst[0])) worst = [a, b];
      if (!worst) break;
      const [a, b] = worst;
      const mid0 = (a + b) / 2;
      const cand = gen.spots
        .filter((s) => !s.safe && !s.perch && s.x1 - s.x0 >= 150 && s.x0 + 60 > a + 250 && s.x1 - 60 < b - 250 && !gen.breathers.some(([r0, r1]) => s.x1 > r0 - 50 && s.x0 < r1 + 50))
        .sort((m, n) => Math.abs((m.x0 + m.x1) / 2 - mid0) - Math.abs((n.x0 + n.x1) / 2 - mid0));
      let done = false;
      for (const s of cand) {
        const mid = (s.x0 + s.x1) / 2;
        if (!awayFromSafe(mid) || gen.E.some((o) => o.type !== 'eagle' && Math.abs(o.x - mid) < 130)) continue;
        const patch = clearPatch(mid, s.x0 + 40, s.x1 - 40, s.y);
        if (!patch) continue;
        gen.ground(mid, s.y, patch[0], patch[1], prog(mid));
        done = true;
        break;
      }
      if (!done) {
        // no flat to stand an animal on: a flier over the stretch
        for (let k = 0; k < 40 && !done; k++) {
          const x = mid0 + (k % 2 ? 1 : -1) * 90 * Math.ceil(k / 2);
          for (const dy of [250, 170, 330, 120]) {
            const homeY = gen.G - dy + gen.rr(-20, 20);
            if (x > a + 380 && x < b - 380 && gen.CP.every((c) => Math.abs(c.x - x) > 480) && gen.skyClear(x, homeY)) { gen.eagle(x, homeY); done = true; break; }
          }
        }
      }
      if (!done) break;
    }
  }

  // ---- no pickup in a solid or on top of another; a harvest stage then still holds its quota, and the surplus on the lanes ----
  gen.settlePickups();
  if (obj === 'harvest') {
    const pool = [...flats, ...perches];
    const total = () => have(flora);
    // the surplus: rows on the lanes (the longer lane first), up to about 1.6 times the quota
    const goal = Math.ceil(cfg.targetCount * 1.6);
    const longer = gen.lanes.flatMap((f) => {
      const hi = gen.P.filter((p) => f.high.platforms.includes(p.id) && p.width >= 90);
      const lo = gen.spots.filter((s) => s.yard && s.x0 >= f.x0 && s.x1 <= f.x1 && s.x1 - s.x0 >= 200);
      return f.reversed ? [...hi.map((p) => ({ x0: p.x, x1: p.x + p.width, y: p.y })), ...lo] : [...lo, ...hi.map((p) => ({ x0: p.x, x1: p.x + p.width, y: p.y }))];
    });
    for (let guard = 0; guard < 80 && longer.length && total() < goal; guard++) {
      const sp = longer[guard % longer.length];
      gen.row(sp.x0 + 24, sp.x1 - 24, sp.y - 32, 3, true);
      gen.settlePickups();
    }
    for (let guard = 0; guard < 60 && pool.length && (total() < cfg.targetCount + 4 || sharedFlora() < cfg.targetCount + 2); guard++) {
      const sp = pool[guard % pool.length];
      gen.row(sp.x0 + 30, sp.x1 - 30, sp.y - 32, 4, true);
      gen.settlePickups();
    }
    for (let guard = 0; guard < 60 && pool.length && total() < goal; guard++) {
      const sp = pool[guard % pool.length];
      gen.row(sp.x0 + 30, sp.x1 - 30, sp.y - 32, 4, true);
      gen.settlePickups();
    }
  }
}

// ---------------------------------------------------------------------------
// Vertical levels
// ---------------------------------------------------------------------------

function buildAscent(gen: Gen): GeneratedStage {
  const cfg = gen.cfg;
  const W = cfg.levelWidth;
  const H = cfg.levelHeight;
  const floorY = H - 120;
  const summitY = 330;
  gen.g = floorY;

  // wide ground floor so a fall is never fatal
  gen.plat({ x: 0, y: floorY, width: W, height: GROUND_H, type: 'solid'}, 'ground');
  gen.spots.push({ x0: 0, x1: 520, y: floorY, safe: true });
  const spawnX = 200;
  const spawnY = floorY;

  // the first landing sits above the floor; later pieces start from the previous landing
  let cur: Platform = gen.plat({ x: 260, y: floorY - 70, width: 260, height: 28, type: 'solid'}, 'ledge');
  let dir: 1 | -1 = 1;
  // The engine keeps the hero inside [20, W-20], so nothing is built where he cannot stand: every piece first checks there is room on
  // the side it is about to grow towards, and if not, grows the other way (a swing needs the most room, a plain stair the least).
  const MARG = 70;
  const face = (p: Platform, need: number) => {
    const room = dir === 1 ? W - MARG - (p.x + p.width) : p.x - MARG;
    if (room < need) dir = dir === 1 ? -1 : 1;
  };
  const NEED = { stairs: 380, tree: 240, mush: 380, swing: 660, rest: 480, summit: 740 };

  const landings: Platform[] = [cur];
  const chain: NonNullable<NonNullable<GeneratedStage['meta']>['ascentChain']> = [];
  let n = 0;
  while (cur.y > summitY + 80) {
    const roll = gen.rnd();
    const canSwing = !gen.safeMode && gen.m >= 4;
    const room = cur.y - summitY;
    let kind = roll < 0.4 ? 'stairs' : roll < 0.68 ? 'tree' : roll < 0.84 ? 'mush' : canSwing ? 'swing' : 'stairs';
    if ((kind === 'tree' && room < 260) || (kind === 'mush' && room < 200)) kind = 'stairs';

    if (kind === 'stairs') {
      const steps = gen.ri(3, 5);
      for (let i = 0; i < steps && cur.y > summitY + 80; i++) {
        face(cur, NEED.stairs);
        const w = gen.rr(150, 200);
        const rise = gen.rr(58, 72);
        const gap = gen.rr(36, Math.max(40, gen.hopLen(rise, 1)));
        const y = cur.y - rise;
        const x = dir === 1 ? cur.x + cur.width + gap : cur.x - gap - w;
        cur = gen.plat({ x, y, width: w, height: 28, type: gen.chance(0.1 * gen.d) && !gen.safeMode && i > 0 ? 'fragile' : 'solid'}, 'ledge');
        gen.flower(x + w / 2, y - 36);
        chain.push({ kind: 'hop', w, rise });
      }
      gen.log.push('stairs');
    } else if (kind === 'tree') {
      face(cur, NEED.tree);
      const h = Math.min(gen.rr(220, 320), room - 40);
      const vx = dir === 1 ? cur.x + cur.width - 40 : cur.x + 40;
      const topY = cur.y - h;
      const w = 280;
      const bx = dir === 1 ? vx - 70 : vx + 70 - w;
      const tree: TreeStructure = { id: gen.tid++, x: vx, groundY: cur.y, topY: topY - 170, trunkWidth: 70, hasClimbVine: true, canopyRadius: 150 };
      gen.T.push(tree);
      gen.V.push({ id: gen.vid++, x: vx, topY: topY - 2, bottomY: cur.y - 6, swaySpeed: 0.9, swayPhase: gen.rnd() * 6, vineType: 'tree_climb', treeId: tree.id });
      cur = gen.plat({ x: bx, y: topY, width: w, height: 28, type: 'solid'}, 'ledge');
      gen.flower(bx + w / 2, topY - 36);
      chain.push({ kind: 'climb', w, rise: h });
      gen.log.push('tree');
    } else if (kind === 'mush') {
      face(cur, NEED.mush);
      const h = gen.rr(135, 160);
      const mx = dir === 1 ? cur.x + cur.width - 90 : cur.x + 20;
      gen.plat({ x: mx, y: cur.y - 30, width: 70, height: 30, type: 'bouncy' });
      const w = gen.rr(220, 280);
      const gap = gen.rr(30, 70);
      const x = dir === 1 ? mx + 70 + gap : mx - gap - w;
      cur = gen.plat({ x, y: cur.y - h, width: w, height: 28, type: 'solid'}, 'ledge');
      gen.flower(x + w / 2, cur.y - 36);
      chain.push({ kind: 'bounce', w, rise: h });
      gen.log.push('mush');
    } else {
      // swing across a shaft
      face(cur, NEED.swing);
      let done = false;
      for (let wgap = gen.lerp(260, 380); wgap >= 240 && !done; wgap -= 20) {
        const A: Platform = { ...cur, id: -1 };
        const dyUp = gen.rr(0, 40);
        const bw = 240;
        const bx = dir === 1 ? cur.x + cur.width + wgap : cur.x - wgap - bw;
        const B: Platform = { id: -2, x: bx, y: cur.y - dyUp, width: bw, height: 28, type: 'solid' };
        const vx = dir === 1 ? cur.x + cur.width + wgap / 2 : cur.x - wgap / 2;
        const v: Vine = { id: 999, x: vx, topY: cur.y - 310, bottomY: cur.y + 30, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
        const res = swingLandings(A, v, dir, [A, B], H + 400);
        if ((res.get(-2) ?? 0) >= 8) {
          gen.V.push({ ...v, id: gen.vid++, swayPhase: gen.rnd() * 6 });
          cur = gen.plat({ x: bx, y: B.y, width: bw, height: 28, type: 'solid'}, 'ledge');
          chain.push({ kind: 'swing', w: bw, rise: dyUp });
          gen.log.push('swing');
          done = true;
        }
      }
      if (!done) {
        face(cur, NEED.stairs);
        const w = 200;
        const x = dir === 1 ? cur.x + cur.width + 40 : cur.x - 40 - w;
        cur = gen.plat({ x, y: cur.y - 66, width: w, height: 28, type: 'solid'}, 'ledge');
        chain.push({ kind: 'hop', w, rise: 66 });
      }
    }
    landings.push(cur);
    n++;
    // a wide resting ledge now and then, with a checkpoint
    if (n % 3 === 0 && cur.y > summitY + 140) {
      face(cur, NEED.rest);
      const w = 300;
      const rise = gen.rr(40, 64);
      const gap = gen.rr(36, Math.max(40, gen.hopLen(rise, 1)));
      const x = dir === 1 ? cur.x + cur.width + gap : cur.x - gap - w;
      cur = gen.plat({ x, y: cur.y - rise, width: w, height: 28, type: 'solid'}, 'ledge');
      gen.CP.push({ x: cur.x + w / 2, y: cur.y, reached: false });
      gen.spots.push({ x0: cur.x, x1: cur.x + w, y: cur.y, safe: true });
      chain.push({ kind: 'hop', w, rise });
      landings.push(cur);
    }
  }

  // summit
  face(cur, NEED.summit);
  const sw = 520;
  const gap = Math.max(40, gen.hopLen(60, 1));
  const sx = dir === 1 ? cur.x + cur.width + gap : cur.x - gap - sw;
  const summit = gen.plat({ x: sx, y: cur.y - 60, width: sw, height: 40, type: 'solid'}, 'summit');
  chain.push({ kind: 'hop', w: sw, rise: 60 });
  gen.spots.push({ x0: summit.x, x1: summit.x + sw, y: summit.y, safe: true });
  const exitTotemX = summit.x + sw / 2;
  const exitTotemY = summit.y;
  gen.item('exit_totem', exitTotemX, exitTotemY - 30);
  gen.exitAt = { x: exitTotemX, y: exitTotemY };

  // enemies on some landings, power-ups on a couple
  const pE = 0.25 + gen.d * 0.35;
  landings.forEach((l, i) => {
    if (i < 2 || l.width < 190) return;
    // (a flag, and the exit, keep a clear approach of 330 px on either side at every height within reach)
    const mid = l.x + l.width / 2;
    if (gen.CP.some((c) => Math.abs(c.x - mid) < 330 && Math.abs(c.y - l.y) < 440)) return;
    if (Math.abs(exitTotemX - mid) < 330 && Math.abs(exitTotemY - l.y) < 440) return;
    if (Math.abs(spawnX - mid) < 330 && Math.abs(spawnY - l.y) < 440) return;
    if (gen.chance(pE)) gen.ground(l.x + l.width / 2, l.y, l.x + 24, l.x + l.width - 24);
    else if (gen.chance(0.12) && gen.m >= 3) gen.item(gen.chance(0.5) ? 'heart' : 'powerup_magnet', l.x + l.width / 2, l.y - 34);
  });
  const nE = gen.world >= 2 ? Math.floor(gen.world * 0.35) : 0;
  for (let i = 0; i < nE; i++) {
    for (let tries = 0; tries < 24; tries++) {
      const x = gen.rr(W * 0.25, W * 0.75);
      const homeY = floorY - gen.rr(600, Math.max(700, H - 700));
      if (gen.skyClear(x, homeY)) {
        gen.eagle(x, homeY);
        break;
      }
    }
  }

  gen.settlePickups();
  balanceStyles(gen.P, gen.kindOf, gen.world);
  return {
    config: cfg,
    trees: gen.T,
    platforms: gen.P,
    vines: gen.V,
    enemies: gen.E,
    boss: null,
    collectibles: gen.C,
    spawnX,
    spawnY,
    exitTotemX,
    exitTotemY,
    checkpoints: gen.CP.sort((a, b) => a.y - b.y).reverse(),
    meta: { attempt: 0, chunks: [], width: 0, ascentChain: chain },
  };
}

// ---------------------------------------------------------------------------
// Boss arena (hand-built)
// ---------------------------------------------------------------------------

function buildBoss(gen: Gen): GeneratedStage {
  const cfg = gen.cfg;
  const world = WORLDS_DATA[cfg.worldIndex - 1] || WORLDS_DATA[0];
  const def = bossDefForLevel(cfg);
  const floor = 560;
  // the fenced arena: wide enough to dodge in, small enough that a phone screen can show the whole fight
  const left = 760;
  const right = left + (def.arenaW ?? 1080);
  gen.plat({ x: 0, y: floor, width: cfg.levelWidth, height: 80, type: 'solid'}, 'ground');

  // two great trunks are the walls
  for (const tx of [left - 40, right + 40]) {
    const tree: TreeStructure = { id: gen.tid++, x: tx, groundY: floor, topY: 90, trunkWidth: 90, hasClimbVine: true, canopyRadius: 170 };
    gen.T.push(tree);
    gen.V.push({ id: gen.vid++, x: tx, topY: 140, bottomY: 540, swaySpeed: 1.0, swayPhase: tx > 1300 ? 1 : 0, vineType: 'tree_climb', treeId: tree.id });
  }

  // a high perch in the middle and a low branch on each side: somewhere to jump to, never a place to hide
  // (a boss with its own lair lists its own ledges instead)
  const perchList = def.perches ?? [];
  if (perchList.length) {
    for (const pc of perchList) {
      const y = floor - pc.up;
      if (pc.kind === 'bouncy') {
        gen.plat({ x: left + pc.dx, y, width: 70, height: 30, type: 'bouncy' });
      } else if (pc.moving) {
        const base = left + pc.dx;
        gen.plat({ x: base, y, width: pc.w, height: 26, type: 'moving', moveRange: pc.moving.range, moveSpeed: pc.moving.speed, baseX: base, swayOffset: 0}, 'ledge');
      } else gen.plat({ x: left + pc.dx, y, width: pc.w, height: 26, type: 'solid', ...(pc.crack ? { crackFrom: pc.crack } : {})}, 'ledge');
    }
    // a climbing vine down the inside face of the wall trunk (the wall's own vine is just out of reach behind the fence)
    for (const dx of def.climbs ?? []) {
      const wall = gen.T.find((t) => Math.abs(t.x - (left - 40)) < 1);
      gen.V.push({ id: gen.vid++, x: left + dx, topY: floor - (def.climbTop ?? 430), bottomY: floor - 20, swaySpeed: 1.0, swayPhase: 0, vineType: 'tree_climb', ...(wall ? { treeId: wall.id } : {}) });
    }
    // (a boss arena's liana hangs still, physics.ts swingAmp 0: swinging on its own through the arena it caught a player dodging the
    // boss, the Sky Sovereign's dodging bot hit 77 times against 52, 2026-10-28; it is climbed and leapt from as before)
    for (const v of def.vines ?? []) {
      gen.V.push({ id: gen.vid++, x: left + v.dx, topY: floor - v.top, bottomY: floor - v.bottom, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true, swingAmp: 0 });
    }
    // the Sky Sovereign's rock pillars: walls with a top to stand on (sovereignFight.ts; the engine cracks and breaks them)
    if (def.pillars) {
      PILLAR.at.forEach((dx, i) => gen.plat({ x: left + dx - PILLAR.w / 2, y: floor - PILLAR.h, width: PILLAR.w, height: PILLAR.h, type: 'solid', pillar: i }, 'ledge'));
    }
  } else {
    for (const b of [{ x: left + 70, y: 440, w: 200 }, { x: right - 270, y: 440, w: 200 }, { x: (left + right) / 2 - 130, y: 340, w: 260 }]) {
      gen.plat({ x: b.x, y: b.y, width: b.w, height: 26, type: 'solid'}, 'ledge');
    }
  }

  const maxHp = def.hp ?? bossMaxHp(cfg.worldIndex);
  const boss: BossEntity = {
    id: 1, type: 'boss', x: def.startDx !== undefined ? left + def.startDx : right - Math.max(160, def.w / 2 + 40), y: floor - def.h / 2, vx: 0, vy: 0, width: def.w, height: def.h, hp: maxHp, maxHp,
    facing: -1, patrolMinX: left, patrolMaxX: right, attackCooldown: 0, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 0, shieldActive: false, dialogueIntro: world.bossQuote,
    ai: newBrain(),
  };
  if (perchList.length) {
    // a heart on the first ledge and one on the last, where a hero who has been hurt can reach them
    const hearty = perchList.filter((pc) => !pc.noHeart);
    for (const pc of new Set([hearty[0], hearty[hearty.length - 1]])) if (pc) gen.item('heart', left + pc.dx + pc.w / 2, floor - pc.up - 44);
    // and one on top of the last rock pillar
    if (def.pillars) gen.item('heart', left + PILLAR.at[PILLAR.at.length - 1], floor - PILLAR.h - 44);
  } else {
    gen.item('heart', left + 170, 400);
    gen.item('heart', right - 170, 400);
  }

  return {
    config: cfg,
    trees: gen.T,
    platforms: gen.P,
    vines: gen.V,
    enemies: [],
    boss,
    collectibles: gen.C,
    spawnX: left + 90,
    spawnY: floor,
    exitTotemX: cfg.levelWidth - 220,
    exitTotemY: floor,
    ...(cfg.secret ? {} : { daisyX: right + 150, daisyY: floor }),
    arena: { left, right, floor },
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function buildOnce(config: LevelConfig, attempt: number, timing: Timing): GeneratedStage {
  const gen = new Gen(config, attempt);
  let stage: GeneratedStage;
  if (config.objectiveType === 'boss_lair') stage = buildBoss(gen);
  else if (config.objectiveType === 'ascent') stage = buildAscent(gen);
  else stage = buildHorizontal(gen, timing);
  stage.meta = { ...stage.meta, attempt, chunks: gen.log, width: Math.round(stage.config.levelWidth), pieces: gen.pieces, ...(gen.recipe ? { recipe: gen.recipe } : {}) };
  return stage;
}

/** the seconds per px of route that the animals, relics and cages (placed after the layout) are expected to add, to begin with */
const RHO0: Record<string, number> = { purge: 0.0034, gauntlet: 0.0042, rescue: 0.0024, relic_hunt: 0.0024 };

/**
 * Builds a stage. An ordinary stage has to take a first-time player long enough (stageTime.ts: its target seconds for the typical player, a floor
 * for the quick one). The generator builds it by the clock of the time model: it keeps laying pieces until the model says the stage takes as long
 * as asked. What the animals will add is not known until they are placed, so the stage is timed afterwards and, if it came out off, built again
 * with the cost the animals really had. A climb is taller or shorter instead. The same attempt always gives the same stage.
 */
export function buildStage(config: LevelConfig, attempt = 0): GeneratedStage {
  if (config.objectiveType === 'boss_lair' || config.secret) return buildOnce(config, attempt, { target: 0, rho: 0 });
  const tgt = targetSeconds(config.worldIndex, config.miniIndex, config.objectiveType);
  const floorFast = fastFloor(config.worldIndex, config.miniIndex, config.objectiveType);
  const maxT = Math.min(tgt * 1.1, 295);
  const climb = config.objectiveType === 'ascent';
  let best: GeneratedStage | null = null;
  let bestScore = -Infinity;
  let aim = tgt * 1.01;
  let rho = RHO0[config.objectiveType] ?? 0.0018;
  let mult = 1;
  for (let it = 0; it < 5; it++) {
    const cfg = climb ? { ...config, levelHeight: Math.round((config.levelHeight * mult) / 20) * 20 } : config;
    const st = buildOnce(cfg, attempt, { target: aim, rho, nominal: tgt });
    const t = modelStage(st, MODEL_TYPICAL).total;
    const f = modelStage(st, MODEL_FAST).total;
    const ratio = Math.min(t / tgt, f / floorFast);
    const over = t / maxT;
    if (ratio >= 1 && over <= 1) return st;
    // a stage that meets both floors beats one that does not, and among those the one nearest the target wins
    const score = ratio >= 1 ? 10 - over : ratio;
    if (score > bestScore) { best = st; bestScore = score; }
    if (climb) {
      mult *= ratio < 1 ? Math.min(2, Math.max(1.03, (1 / ratio) * 1.05)) : Math.max(0.6, Math.min(0.97, 1.06 / over));
    } else {
      const tm = st.meta?.timing;
      if (tm && tm.route > 0) rho = Math.max(0, Math.min(0.012, tm.decorSeconds / tm.route));
      // the stage ended (t - what the clock said) away from the aim: move the aim by the miss
      aim *= Math.max(0.7, Math.min(1.4, (tgt * 1.03) / t));
    }
  }
  return best!;
}

/** First attempt whose layout passes the validator. Used by the seed script and tests. */
export function findValidAttempt(config: LevelConfig, maxAttempts = 14): { attempt: number; errors: string[] } {
  let errors: string[] = [];
  let fallback = -1;
  for (let a = 0; a < maxAttempts; a++) {
    const st = buildStage(config, a);
    const res = validateStage(st);
    if (res.ok) {
      if (hasItsForks(st)) return { attempt: a, errors: [] };
      if (fallback < 0) fallback = a;
    }
    errors = res.errors;
  }
  return fallback >= 0 ? { attempt: fallback, errors: [] } : { attempt: -1, errors };
}

/** a stage meant to have two-lane forks that has them all (a layout that had to skip one is passed over for another that passes too) */
function hasItsForks(st: GeneratedStage): boolean {
  return (st.lanes?.length ?? 0) >= (st.meta?.forksWanted ?? 0);
}

const known = new Map<string, number>();

/**
 * Layout variant. null = the designed layout shipped in levelSeeds. A number = a fresh layout for every stage, found by
 * trying attempts from that number until the validator passes, so a random stage is always beatable. Boss lairs and the
 * secret stage always keep their designed layout. The same number gives the same layout, so retrying a stage after a fall
 * replays what you just saw.
 */
let layoutVariant: number | null = null;
const variantAttempt = new Map<string, number>();

export function setLayoutVariant(v: number | null) {
  layoutVariant = v;
}
export function getLayoutVariant() {
  return layoutVariant;
}

/** a fresh variant for entering a stage: ?layout=fixed keeps the designed layouts, ?layout=123 replays one, otherwise random */
export function rollLayoutVariant(): number | null {
  try {
    const q = new URLSearchParams(window.location.search).get('layout');
    if (q === 'fixed') return null;
    if (q && Number.isFinite(Number(q))) return Math.abs(Number(q) | 0) + 1;
  } catch {
    /* no window in some test setups */
  }
  return Math.floor(Math.random() * 1_000_000) + 1;
}

const VARIANT_BASE = 1000; // attempts below this are the designed ones

/** the reachable platforms of the layout the variant search last accepted: generateStage reuses them instead of validating the same layout again */
let lastAccepted: { key: string; ids: number[] } | null = null;

/** the attempt number for a random layout of this stage: the first one from this variant's range that passes the validator */
export function variantAttemptFor(config: LevelConfig, variant: number, maxAttempts = 14): number {
  const key = `${config.id}#${variant}`;
  const hit = variantAttempt.get(key);
  if (hit !== undefined) return hit;
  let found = -1;
  let fallback: { a: number; ids: number[] } | null = null;
  for (let k = 0; k < maxAttempts; k++) {
    const a = VARIANT_BASE + variant * 31 + k;
    const st = buildStage(config, a);
    const res = validateStage(st);
    if (res.ok) {
      if (hasItsForks(st)) {
        found = a;
        lastAccepted = { key: `${config.id}@${a}`, ids: res.reachableIds };
        break;
      }
      if (!fallback) fallback = { a, ids: res.reachableIds };
    }
  }
  if (found < 0 && fallback) {
    found = fallback.a;
    lastAccepted = { key: `${config.id}@${fallback.a}`, ids: fallback.ids };
  }
  variantAttempt.set(key, found);
  return found;
}

/** how much longer the first animal of each kind on an old-generator World 1-5 stage takes to strike (LV-14: a safe first meeting) */
export const FIRST_TELL = 1.5;

/**
 * The stage the game plays for a level. `difficulty` matters only for the stages the new generator builds (gen2/game.ts: Easy is
 * laid by the pipeline itself, the same stage under Easy's rules); every other stage is built once and made gentler by
 * easyMode.easyStage, as before.
 */
const flagsCapped = (st: GeneratedStage): GeneratedStage => {
  capFlagSpans(st as never);
  return st;
};

export function generateStage(config: LevelConfig, difficulty: Difficulty = 'normal'): GeneratedStage {
  // the puzzle kit's test room (Matt's test link: ?autostart=1&level=kit, kitStage.ts)
  if (config.id === KIT_STAGE_ID) return buildKitStage(config);
  // the hand-built 1-6 (a test, off by default: protoStage.ts)
  if (config.id === CTEST_STAGE_ID && !config.secret && ctestEnabled()) return buildProtoStage(config, ctestSeed(), 'ctest', difficulty === 'easy');
  // Dot's netting flight, the extra stage after 4-5 (dotFlightStage.ts); it is only in the stage list with the New stages switch on
  if (config.id === DOT_STAGE_ID) return dotGeneratedStage(config, layoutVariant ?? 1);
  if (config.id === MEECA_STAGE_ID) return meecaGeneratedStage(config, layoutVariant ?? 1);
  // the stages built the new way (planned and rolled, protoStage.ts), behind the New stages switch
  // (no more than 4000 px between flags on a hand-built stage: easyMode.ts capFlagSpans, LV-9)
  // (World 4 a little sharper on Normal, Normal only: w4Normal.ts, LV-2)
  if (HAND_STAGES[config.id] && !config.secret && protoStageEnabled()) {
    const st = flagsCapped(buildProtoStage(config, layoutVariant ?? 1, HAND_STAGES[config.id]));
    addMissingFind(st);
    return difficulty === 'normal' ? w4Normal(st) : st;
  }
  // World 2's hand-built stages (w2Stages.ts), three at a time from 2026-10-24
  if (W2_STAGES[config.id] && !config.secret && protoStageEnabled()) {
    const st = flagsCapped(buildW2Stage(config, layoutVariant ?? 1, W2_STAGES[config.id]));
    addMissingFind(st);
    addDress(st, layoutVariant ?? 1);
    return st;
  }
  // the new generator's stages (gen2/game.ts: 5-7 and 5-9): one of the curated rolls, then the shared passes below
  if (isGen2Stage(config)) {
    const stage = buildGen2ForGame(config, difficulty, layoutVariant ?? 1);
    // (Easy's own goal for the stage, as the first-timer kid bot measured it: easyStage sets it, withGoals leaves it)
    const easyGoal = GEN2_STAGES[config.id].easyGoal;
    if (difficulty === 'easy' && easyGoal !== undefined) stage.easyGoal = Math.min(easyGoal, stage.enemies.length);
    // (a heart by every second flag from the second on, as the hand-built stages have (protoStage.ts heartsAtFlags), set where it is
    // clear of the stumps and pickups around the flag (easyMode.ts heartBy): a rolled stage's flag can stand beside anything)
    let cid = Math.max(0, ...stage.collectibles.map((c) => c.id)) + 1;
    [...(stage.checkpoints ?? [])].sort((a, b) => a.x - b.x).forEach((cp, i) => i % 2 === 1 && heartBy(stage, cp, () => cid++));
    const done = finishStage(stage, validateStage(stage).reachableIds);
    // (World 5's dressing sets, once the pickups are all placed, so none is covered: artDress.ts dressSets)
    addDress(done as Parameters<typeof addDress>[0], layoutVariant ?? 1);
    return done;
  }
  let attempt = LEVEL_ATTEMPTS[config.id];
  if (attempt === undefined) {
    // not a shipped level (or the seed table is stale): find a good layout now
    attempt = known.get(config.id) ?? findValidAttempt(config).attempt;
    if (attempt < 0) attempt = 0;
    known.set(config.id, attempt);
  }
  if (layoutVariant !== null && config.objectiveType !== 'boss_lair' && !config.secret && config.id !== SECRET_GATE_LEVEL) {
    const a = variantAttemptFor(config, layoutVariant);
    if (a >= 0) attempt = a; // if no fresh layout passes (never seen in testing), fall back to the designed one
  }
  const stage = buildStage(config, attempt);
  // (a ground block hung over water reaches the floor it is drawn down to: groundFloor.ts, 5-6's wall he walked through into the water)
  groundToFloor(stage);
  // (water taught before it costs a life: waterTeach.ts, LV-8)
  if (!config.secret && config.worldIndex <= 5) teachWater(stage);
  // (LV-14: the first animal of each kind on the stage shows a longer tell, a safe first meeting: 5-8's first ocelot pounced 8 s in)
  if (!config.secret && config.worldIndex <= 5) {
    const seen = new Set<string>();
    for (const e of [...stage.enemies].sort((a, b) => a.x - b.x)) {
      if (seen.has(e.type)) continue;
      seen.add(e.type);
      e.attackCooldown = Math.max(e.attackCooldown, 0) * FIRST_TELL;
    }
  }
  // (5-8's floor under its first stairs gets a short climb out wherever no way back up is near: dipWayOut.ts, LV-11)
  if (config.id === '5-8' && !config.secret) dipWayOut(stage);
  // (the secret gate's stage gets two more platforms from addSecrets, which the stored answer does not know about: it is checked afresh)
  const acceptedIds = lastAccepted && lastAccepted.key === `${config.id}@${attempt}` && config.id !== SECRET_GATE_LEVEL ? lastAccepted.ids : undefined;
  lastAccepted = null;
  return finishStage(stage, acceptedIds ?? validateStage(stage).reachableIds);
}

/** the passes every generated stage gets after its layout is checked (the old generator's and gen2's alike) */
function finishStage<T extends GeneratedStage>(stage: T, reachableIds: number[]): T {
  const config = stage.config;
  addSecrets(stage);
  // flower arcs over the gaps the route crosses that have none, then the finds: a fern is never put beside a trail (and no trail leads to one)
  const beforeTrails = stage.collectibles.length;
  addJumpTrails(stage, reachableIds);
  capHarvest(stage, new Set(stage.collectibles.slice(beforeTrails).map((c) => c.id)));
  addFinds(stage, reachableIds);
  // last: every flower where he can get it (nothing tucked under a branch he walks across, nothing out of reach: flowerReach.ts)
  fixPickups(
    { platforms: stage.platforms, vines: stage.vines, ropes: stage.ropes, waterY: stage.waterY, glide: skillHeldAt('glide', (config.worldIndex - 1) * 10 + config.miniIndex), onRoute: new Set(reachableIds) },
    stage.collectibles,
  );
  return stage;
}

/**
 * A harvest holds no more than about 2.2 times its quota (a long stage's own pieces, and the arcs over its jumps, can lay more than that):
 * flowers on the shared ground are taken out again, evenly along the stage, never a lane's reward or an arc over a jump, and never below
 * the quota and its margin.
 */
function capHarvest(stage: GeneratedStage, keep: Set<number>) {
  const cfg = stage.config;
  if (cfg.objectiveType !== 'harvest') return;
  const isFlora = (c: Collectible) => c.type === 'flower' || c.type === 'leaf';
  const lane = new Set<number>();
  for (const f of stage.lanes ?? []) for (const r of [f.high, f.low]) r.flowers.forEach((i) => lane.add(i));
  const flora = stage.collectibles.filter(isFlora);
  const shared = flora.filter((c) => !lane.has(c.id));
  const spare = shared.filter((c) => !keep.has(c.id));
  const drop = Math.min(flora.length - Math.floor(cfg.targetCount * 2.2), shared.length - (cfg.targetCount + 4), spare.length);
  if (drop <= 0) return;
  const step = spare.length / drop;
  const out = new Set<number>();
  for (let i = 0; i < drop; i++) out.add(spare[Math.min(spare.length - 1, Math.floor(i * step + step / 2))].id);
  stage.collectibles = stage.collectibles.filter((c) => !out.has(c.id));
}

/**
 * Hidden things that are placed after the layout has been checked (they never sit on the main route):
 * stage 7-7 hides the Thorn Gate on a ledge above the start, reached by a mushroom tucked behind the hero.
 */
function addSecrets(stage: GeneratedStage) {
  if (stage.config.id !== SECRET_GATE_LEVEL || stage.config.secret) return;
  const floor = stage.spawnY;
  const mx = Math.max(20, stage.spawnX - 100);
  const ids = stage.platforms.map((p) => p.id);
  let pid = (ids.length ? Math.max(...ids) : 0) + 1;
  const shroom: Platform = { id: pid++, x: mx, y: floor - 30, width: 70, height: 30, type: 'bouncy' } as Platform;
  const ledge: Platform = { id: pid++, x: mx + 60, y: floor - 172, width: 190, height: 26, type: 'solid', style: 'branch' } as Platform;
  stage.platforms.push(shroom, ledge);
  const cids = stage.collectibles.map((c) => c.id);
  stage.collectibles.push({ id: (cids.length ? Math.max(...cids) : 0) + 1, type: 'thorn_gate', x: ledge.x + ledge.width / 2, y: ledge.y - 40, collected: false, bobPhase: 0 });
}

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * A hand-built stage places its own note, keepsake or book where its builder means it to go; one that holds a find its builder does not
 * place (Dot's pocket things, the Notch, the snail: finds.ts EXTRA_FINDS) gets it the generated stages' way, on a platform the level check
 * already reaches, without touching the layout.
 */
export function addMissingFind(stage: GeneratedStage) {
  if (stage.collectibles.some((c) => c.type === 'find')) return;
  addFinds(stage);
}

/**
 * The story finds (notes, books, keepsakes, see finds.ts): one per world in the stages that hold them. Like the secrets they are put
 * in after the layout has been checked, on a platform the player can reach, well away from the start, the flags, the exit and every
 * animal. A hidden find (a book or keepsake) takes one of the higher platforms so it feels like a detour; a note takes a lower one,
 * on the way. The stage's own random numbers are never used, so adding finds does not change any layout.
 */
export function addFinds(stage: GeneratedStage, reachableIds?: number[]) {
  const cfg = stage.config;
  if (cfg.secret || cfg.objectiveType === 'boss_lair') return;
  const find = findForStage(cfg.worldIndex, cfg.miniIndex);
  if (!find) return;
  // (the snail is out in the open, like a note: he is just touched)
  const hidden = find.kind !== 'note' && find.kind !== 'snail';
  const reach = new Set(reachableIds ?? validateStage(stage).reachableIds);
  const cps = (stage.checkpoints ?? []).map((c) => c.x);
  // (World 5's carvings, Meeca's messages cut into trunks 124 wide, are in by now (gen2's finish runs before this): a fern never stands at one)
  const carvings = ((stage as { proto?: { w5?: { carvings?: Array<{ x: number }> } } }).proto?.w5?.carvings ?? []).map((c) => c.x);
  type P = GeneratedStage['platforms'][number];
  const clearOf = (x: number, p: P) =>
    carvings.every((cx) => Math.abs(cx - x) >= 120) &&
    stage.collectibles.every((c) => c.type !== 'relic' || Math.abs(c.x - x) >= 120) &&
    Math.abs(x - stage.spawnX) > 320 &&
    Math.abs(x - stage.exitTotemX) > 320 &&
    cps.every((c) => Math.abs(c - x) > 220) &&
    stage.enemies.every((e) => Math.abs(e.x - x) > 190 || Math.abs(e.y - p.y) > 220) &&
    stage.collectibles.every((c) => c.type === 'exit_totem' || Math.hypot(c.x - x, c.y - (p.y - 26)) > 110);
  const cands: Array<{ p: P; x: number }> = [];
  for (const p of stage.platforms) {
    if (p.broken || p.type !== 'solid' || p.width < 140 || !reach.has(p.id)) continue;
    // every spot along the platform that is clear (a long ground has many; a small ledge has one or two)
    // (never where another block stands in the way: a stump or a hurdle on the same ground is taller than the find hangs)
    const open = (x: number) => !stage.platforms.some((q) => !q.broken && q !== p && q.type !== 'drift' && q.type !== 'moving' && x >= q.x - 16 && x <= q.x + q.width + 16 && q.y < p.y - 26 + 16 && q.y + q.height > p.y - 26 - 16);
    for (let x = p.x + 70; x <= p.x + p.width - 70; x += 80) if (open(x) && clearOf(x, p)) cands.push({ p, x });
  }
  if (!cands.length) return;
  const ys = cands.map((c) => c.p.y).sort((m, n) => m - n);
  // hidden: from the higher third of the spots; a note: from the lower half
  const pool = hidden
    ? cands.filter((c) => c.p.y <= ys[Math.floor((ys.length - 1) / 3)])
    : cands.filter((c) => c.p.y >= ys[Math.floor(ys.length / 2)]);
  pool.sort((m, n) => m.p.id - n.p.id || m.x - n.x);
  const pick = pool[hash32(`${cfg.id}:${find.id}`) % pool.length];
  const cids = stage.collectibles.map((c) => c.id);
  stage.collectibles.push({
    id: (cids.length ? Math.max(...cids) : 0) + 1,
    type: 'find',
    x: pick.x,
    y: pick.p.y - 26,
    collected: false,
    bobPhase: 0,
    findId: find.id,
    hidden,
  });
}
