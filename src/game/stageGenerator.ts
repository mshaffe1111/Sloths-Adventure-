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
} from './types.ts';
import { calculateDifficultyScaling } from './rules.ts';
import { WORLDS_DATA } from './worldsData.ts';
import { reachBounce, reachJump, TAKEOFF_SLACK } from './physics.ts';
import { HANG_DROP, ROPE_MIN_GAP, ROPE_OVERLAP, ROPE_RISE, ropeYAt } from './rope.ts';
import { skillGuaranteedAt } from './skills.ts';
import { swingLandings, validateStage } from './levelCheck.ts';
import { LEVEL_ATTEMPTS } from './levelSeeds.ts';
import { bossMaxHp, newBrain } from './bossAI.ts';
import { bossDefForLevel } from './bossDefs.ts';
import { SECRET_GATE_LEVEL } from './secret.ts';
import { driftX, logLayout, riverRecipes, LOG_DROP, LOG_HEIGHT, surfaceBelowBank, type RiverRecipe, type RiverZone } from './river.ts';

export interface GeneratedStage {
  config: LevelConfig;
  trees: TreeStructure[];
  platforms: Platform[];
  vines: Vine[];
  /** shimmy ropes across gaps (the engine only lets Slomatt use them once he has the skill) */
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
  /** World 2: rivers with drifting logs (their water, and the surface that is fatal) */
  rivers?: import('./river.ts').RiverZone[];
  /** what the generator built (for tests and debugging) */
  meta?: { attempt: number; chunks: string[]; width: number; recipe?: { core: string; partner: string | null; fork: string } };
}

// ---------------------------------------------------------------------------
// Tuning
// ---------------------------------------------------------------------------

const GROUND_H = 90;
/** ground baseline and water surface, relative to the level height */
const GROUND_FROM_BOTTOM = 320;
const WATER_FROM_BOTTOM = 170;

type Kind =
  | 'flat' | 'pit' | 'hill' | 'bridge' | 'stones' | 'cliff' | 'bounce'
  | 'ladder' | 'swing' | 'moving' | 'fragile' | 'yard' | 'tower' | 'river'
  | 'valley' | 'rolling' | 'hurdles' | 'terrace' | 'gapbridge' | 'skyhop' | 'islands' | 'canopy'
  | 'ropegap' | 'ropebonus'
  | 'pillars' | 'slope' | 'stumps' | 'zigzag' | 'trampoline' | 'causeway' | 'pegs' | 'meadow' | 'ditch' | 'twin';

/** first mission number (1..100) a piece may appear in: teaches one idea at a time */
const UNLOCK: Record<Kind, number> = {
  flat: 1, pit: 1, hill: 1, yard: 1, bridge: 1, stones: 1, cliff: 2, ladder: 1,
  bounce: 3, swing: 4, moving: 8, fragile: 11, tower: 14, river: 1,
  valley: 1, rolling: 1, hurdles: 1, terrace: 2, gapbridge: 1, skyhop: 1, islands: 1, canopy: 1,
  ropegap: 4, ropebonus: 1,
  pillars: 3, slope: 1, stumps: 1, zigzag: 2, trampoline: 3, causeway: 1, pegs: 3, meadow: 1, ditch: 1, twin: 2,
};

const BASE_WEIGHT: Record<Kind, number> = {
  flat: 1.4, pit: 3, hill: 2, bridge: 1.2, stones: 2.2, cliff: 1.6, bounce: 1.4,
  ladder: 1.3, swing: 1.8, moving: 1.4, fragile: 1.2, yard: 1, tower: 0.8,
  river: 0, // never picked at random: World 2 places its rivers on purpose (see river.ts)
  valley: 1.6, rolling: 1.6, hurdles: 1.5, terrace: 1.5, gapbridge: 1.4, skyhop: 1.6, islands: 1.6, canopy: 1.6,
  ropegap: 1.5, ropebonus: 1.3,
  pillars: 1.5, slope: 1.5, stumps: 1.5, zigzag: 1.5, trampoline: 1.4, causeway: 1.5, pegs: 1.4, meadow: 1.5, ditch: 1.5, twin: 1.5,
};

const OBJ_WEIGHT: Partial<Record<ObjectiveType, Partial<Record<Kind, number>>>> = {
  sprint: { pit: 1.4, bounce: 1.3, moving: 1.3, yard: 0.5, zigzag: 1.3, trampoline: 1.3 },
  harvest: { ladder: 1.6, stones: 1.3, yard: 0.6, canopy: 1.8, skyhop: 1.3, meadow: 2 },
  purge: { yard: 3, flat: 0.8, swing: 0.6, meadow: 1.8, rolling: 1.4, valley: 1.3, twin: 1.3, slope: 1.3, pegs: 0.6, pillars: 0.6, zigzag: 0.6 },
  stealth: { bridge: 1.8, cliff: 1.5, yard: 0.7, valley: 1.4, hurdles: 1.3 },
  vine_runner: { swing: 3.2, stones: 1.5, yard: 0.2, pit: 0.7 },
  relic_hunt: { ladder: 2, cliff: 2, tower: 3, bounce: 1.4 },
  rescue: { ladder: 1.5, yard: 1.5, cliff: 1.3, terrace: 1.4, twin: 1.3 },
  gauntlet: { yard: 3.2, moving: 1.3, fragile: 1.3, meadow: 1.5, twin: 1.3, pegs: 0.6, pillars: 0.6 },
};

/** how taxing a piece is; a spacer of flat ground follows the hard ones */
const INTENSITY: Record<Kind, number> = {
  flat: 0, hill: 0, bridge: 0, ladder: 0, pit: 1, stones: 1, cliff: 1, bounce: 1,
  yard: 1, swing: 2, moving: 2, fragile: 2, tower: 2, river: 1,
  valley: 0, rolling: 0, hurdles: 1, terrace: 1, gapbridge: 1, skyhop: 1, islands: 1, canopy: 0,
  ropegap: 1, ropebonus: 0,
  pillars: 1, slope: 0, stumps: 0, zigzag: 1, trampoline: 1, causeway: 0, pegs: 1, meadow: 0, ditch: 0, twin: 0,
};

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

class Gen {
  readonly cfg: LevelConfig;
  readonly m: number;
  readonly d: number;
  readonly world: number;
  readonly rnd: () => number;
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
  spots: Spot[] = [];
  log: string[] = [];
  rivers?: RiverZone[];
  /** World 2: the rivers still to place, in order */
  riverQueue: RiverRecipe[] = [];

  pid = 1;
  vid = 1;
  eid = 1;
  cid = 1;
  tid = 1;

  cx = 0;
  g: number;
  bank: number | null = null;
  lastCp = 0;

  constructor(cfg: LevelConfig, attempt: number) {
    this.cfg = cfg;
    this.world = cfg.worldIndex;
    this.m = (cfg.worldIndex - 1) * 10 + cfg.miniIndex;
    this.d = (this.m - 1) / 99;
    this.diff = calculateDifficultyScaling(cfg.worldIndex, cfg.miniIndex);
    this.rnd = mulberry32(hashStr(cfg.id) + attempt * 7919);
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
  rr(a: number, b: number) { return a + this.rnd() * (b - a); }
  ri(a: number, b: number) { return Math.floor(this.rr(a, b + 1)); }
  chance(p: number) { return this.rnd() < p; }
  lerp(a: number, b: number, t = this.d) { return a + (b - a) * t; }

  plat(p: Omit<Platform, 'id'>): Platform {
    const full = { id: this.pid++, ...p } as Platform;
    this.P.push(full);
    return full;
  }

  openBank() { if (this.bank === null) this.bank = this.cx; }

  closeBank() {
    if (this.bank !== null && this.cx > this.bank + 1) {
      this.plat({ x: this.bank, y: this.g, width: this.cx - this.bank, height: GROUND_H, type: 'solid', style: 'log' });
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

  // ---- pickups ----
  flower(x: number, y: number) {
    const v = FLOWER_VARIANTS[Math.floor(this.rnd() * FLOWER_VARIANTS.length)];
    this.C.push({
      id: this.cid++, type: v === 'fern' || v === 'monstera' ? 'leaf' : 'flower',
      botanicalVariant: v, x, y, collected: false, bobPhase: this.rnd() * Math.PI * 2,
    });
  }

  row(x0: number, x1: number, y: number, n: number) {
    for (let i = 0; i < n; i++) this.flower(n === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * i) / (n - 1), y);
  }

  arc(x0: number, x1: number, y: number, peak: number, n: number) {
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n;
      this.flower(x0 + (x1 - x0) * u, y - peak * 4 * u * (1 - u));
    }
  }

  item(type: Collectible['type'], x: number, y: number) {
    const c: Collectible = { id: this.cid++, type, x, y, collected: false, bobPhase: this.rnd() * Math.PI * 2 };
    if (type === 'cage') c.cageHp = 2;
    this.C.push(c);
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

  /**
   * Cheap deterministic 0..1 value from a position. Enemy *choice* uses this instead of the level's random
   * stream, so adding new animals never reshuffles the layout of a stage the player already knows.
   */
  hash01(x: number, salt = 0) {
    const v = Math.sin(x * 12.9898 + (this.eid + salt) * 78.233 + this.world * 37.719 + salt * 5.1) * 43758.5453;
    return v - Math.floor(v);
  }

  /** which sloth predator fills a "hard" ground slot in this world: the cast grows as the player moves on */
  private hardKind(h: number): 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra' {
    const table: Record<number, Array<['ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra', number]>> = {
      2: [['ocelot', 0.6], ['caiman', 0.4]],
      3: [['ocelot', 0.55], ['boa', 0.45]],
      4: [['ocelot', 0.5], ['tayra', 0.5]],
      5: [['tayra', 0.4], ['boa', 0.3], ['ocelot', 0.3]],
      6: [['caiman', 0.35], ['boa', 0.3], ['ocelot', 0.2], ['jaguar', 0.15]],
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

  ground(x: number, surface: number, pMin: number, pMax: number) {
    const hard = this.world >= 2 && this.chance(0.35 + this.d * 0.3);
    if (!hard) {
      // from world 4 a fast tayra sometimes scurries where a snake would have been
      if (this.world >= 4 && this.hash01(x, 11) < 0.22) this.tayra(x, surface, pMin, pMax);
      else this.snake(x, surface, pMin, pMax);
      return;
    }
    let kind = this.hardKind(this.hash01(x));
    // big leapers / lungers need room to run; on a short ledge send a lighter animal
    if ((kind === 'jaguar' || kind === 'caiman') && pMax - pMin < 80) kind = 'ocelot';
    if (kind === 'jaguar') this.jaguar(x, surface, pMin, pMax);
    else if (kind === 'boa') this.boa(x, surface, pMin, pMax);
    else if (kind === 'caiman') this.caiman(x, surface, pMin, pMax);
    else if (kind === 'tayra') this.tayra(x, surface, pMin, pMax);
    else this.ocelot(x, surface, pMin, pMax);
  }

  /** can an eagle patrol here: clear of solid ground (its patch of sky is x ± 240) and well away from every flag? */
  skyClear(x: number, homeY: number) {
    const x0 = x - 270, x1 = x + 270, y0 = homeY - 40, y1 = homeY + 40;
    if (this.P.some((p) => p.type !== 'bouncy' && p.x < x1 && p.x + p.width > x0 && p.y < y1 && p.y + p.height > y0)) return false;
    return this.CP.every((c) => Math.abs(c.x - x) > 480 || Math.abs(c.y - homeY) > 520);
  }

  eagle(x: number, homeY: number) {
    const e = this.baseEnemy('eagle', x, homeY, 58, 42, this.world === 1 ? 1 : 2, (this.world === 1 ? 30 : 42) * this.diff.enemySpeedMultiplier);
    e.patrolMinX = x - 240; e.patrolMaxX = x + 240; e.attackCooldown = 4; e.swoopPhase = 'patrol'; e.hoverTimer = 0; e.homeY = homeY;
    this.E.push(e);
  }

  // ---- pieces ----

  /** pit width: shorter early, never beyond a comfortable single jump */
  pitW() {
    // never wider than a jump that can start TAKEOFF_SLACK px before the edge
    const r = reachJump(0, false) * 0.95 - TAKEOFF_SLACK;
    const hi = Math.min(r, this.lerp(84, r));
    return this.rr(Math.max(64, hi - 34), Math.max(72, hi));
  }

  /** a horizontal hop between two ledges: a fraction of the jump's reach, but always leaving TAKEOFF_SLACK px of room to take off */
  hopLen(dy: number, fraction: number) {
    const r = reachJump(dy, false);
    return Math.max(36, Math.min(r * fraction, r * 0.95 - TAKEOFF_SLACK));
  }

  chunkPit() {
    const wide = !this.safeMode && this.m >= 6 && this.chance(0.35 * this.d + 0.1);
    const w = wide ? this.rr(0.6, 0.74) * reachJump(0, true) : this.pitW();
    this.closeBank();
    this.arc(this.cx - 30, this.cx + w + 30, this.g - 36, wide ? 120 : 76, wide ? 5 : 4);
    this.cx += w;
    this.openBank();
    this.log.push(wide ? 'widePit' : 'pit');
  }

  chunkHill() {
    const n = this.ri(2, this.d > 0.4 ? 4 : 3);
    const dh = this.rr(32, 44);
    this.flat(this.rr(120, 200));
    for (let i = 0; i < n; i++) { this.up(dh); this.flat(this.rr(84, 120)); }
    const top = this.flat(this.rr(160, 300));
    this.row(top.x0 + 40, top.x1 - 40, this.g - 32, 4);
    for (let i = 0; i < n; i++) { this.down(dh); this.flat(this.rr(84, 120)); }
    this.log.push('hill');
  }

  chunkBridge() {
    const len = this.rr(280, 560);
    this.closeBank();
    this.plat({ x: this.cx, y: this.g, width: len, height: 26, type: 'solid', style: 'canopy_bridge' });
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
      this.plat({ x, y, width: w, height: 28, type: fragile ? 'fragile' : 'solid', style: this.chance(0.5) ? 'log' : 'moss_stone' });
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
    this.plat({ x: treeX - 110, y: g2, width: 160, height: 26, type: 'solid', style: 'branch' });
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
    this.plat({ x: treeX - 110, y: g3, width: 160, height: 26, type: 'solid', style: 'branch' });
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
      topLedge = this.plat({ x: cx - w / 2, y, width: w, height: 28, type: fragile ? 'fragile' : 'solid', style: 'branch' });
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
      moveRange: range, moveSpeed: this.rr(0.8, 1.25), baseX: base, swayOffset: off, style: 'branch',
    });
    this.arc(this.cx + 30, this.cx + W - 30, this.g - 40, 70, 5);
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
      this.plat({ x, y: this.g, width: w, height: 26, type: 'fragile', style: 'branch' });
      this.flower(x + w / 2, this.g - 38);
      x += w;
    }
    this.cx = x + this.rr(74, 90);
    this.openBank();
    this.log.push('fragile');
  }


  // ---- more shapes, so no two stages read the same ----

  /** can the ground step down `total` px here without running into the water? */
  private roomBelow(total: number) { return this.g + total <= this.G + 96; }

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
      this.plat({ x: this.cx - w, y: this.g - h, width: w, height: h + 12, type: 'solid', style: this.chance(0.5) ? 'log' : 'moss_stone' });
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
      this.plat({ x: this.cx, y: this.g, width: len, height: 26, type: 'solid', style: 'canopy_bridge' });
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
      this.plat({ x, y, width: w, height: 28, type: 'solid', style: this.chance(0.5) ? 'log' : 'branch' });
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
      this.plat({ x, y, width: w, height: 28, type: 'solid', style: this.chance(0.5) ? 'moss_stone' : 'log' });
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
      prev = this.plat({ x, y, width: w, height: 24, type: 'solid', style: 'branch' });
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
      this.plat({ x, y, width: w, height: 170, type: 'solid', style: 'ruin' });
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
    this.arc(this.cx - 30, this.cx + w + 30, this.g - 36, 76, 4);
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
    const n = Math.max(3, Math.round(gapW / 110));
    for (let i = 0; i < n; i++) {
      const x = gapStart + 30 + ((gapW - 60) * (i + 0.5)) / n;
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
      this.plat({ x: this.cx - w, y: this.g - h, width: w, height: h + 12, type: 'solid', style: 'log' });
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
      this.plat({ x, y, width: w, height: 28, type: 'solid', style: this.chance(0.5) ? 'branch' : 'log' });
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
    this.plat({ x: s.x0, y: this.g - 30, width: 60, height: 42, type: 'solid', style: 'ruin' });
    this.plat({ x: s.x0 + 60, y: this.g - 62, width: L, height: 74, type: 'solid', style: 'ruin' });
    this.plat({ x: s.x0 + 60 + L, y: this.g - 30, width: 60, height: 42, type: 'solid', style: 'ruin' });
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
      const w = this.rr(56, 72);
      x += this.hopLen(prevY - y, this.rr(0.45, 0.7));
      this.plat({ x, y, width: w, height: 28, type: 'solid', style: 'moss_stone' });
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
    for (let i = 0; i < arcs; i++) this.arc(s.x0 + 50 + i * seg, s.x0 + 50 + (i + 1) * seg, this.g - 36, this.rr(40, 64), this.ri(5, 7));
    this.log.push('meadow');
  }

  /** a ditch with a rope bridge over it: cross on top, or drop in for the flowers at the bottom */
  chunkDitch() {
    const depth = this.rr(54, 70);
    if (!this.roomBelow(depth)) { this.chunkGapBridge(); return; }
    this.flat(this.rr(100, 160));
    this.closeBank();
    const L = this.rr(300, 460);
    this.plat({ x: this.cx, y: this.g, width: L, height: 26, type: 'solid', style: 'canopy_bridge' });
    this.plat({ x: this.cx, y: this.g + depth, width: L, height: GROUND_H, type: 'solid', style: 'log' });
    this.row(this.cx + 50, this.cx + L - 50, this.g + depth - 34, Math.round(L / 100));
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

  chunkYard(count = this.ri(2, 1 + Math.ceil(1 + this.d * 3))) {
    const len = 330 + count * 110;
    const s = this.flat(len, { yard: true });
    const inner = len - 150;
    const seg = inner / count;
    for (let i = 0; i < count; i++) {
      const a = s.x0 + 75 + i * seg + 8;
      const b = s.x0 + 75 + (i + 1) * seg - 8;
      this.ground((a + b) / 2, this.g, a, b);
    }
    if (this.chance(0.5)) {
      this.plat({ x: s.x0 + len / 2 - 70, y: this.g - 92, width: 140, height: 26, type: 'solid', style: 'branch' });
      this.flower(s.x0 + len / 2, this.g - 128);
    }
    this.log.push(`yard${count}`);
  }

  chunk(kind: Kind) {
    const runup: Partial<Record<Kind, number>> = { pit: 130, stones: 140, swing: 220, moving: 180, fragile: 170, river: 160, skyhop: 150, islands: 150, gapbridge: 130, pillars: 150, zigzag: 150, pegs: 150 };
    if (runup[kind]) this.ensure(runup[kind]!);
    switch (kind) {
      case 'flat': { const s = this.flat(this.rr(200, 420)); this.row(s.x0 + 50, s.x1 - 50, this.g - 32, this.ri(2, 4)); this.log.push('flat'); break; }
      case 'pit': this.chunkPit(); break;
      case 'hill': this.chunkHill(); break;
      case 'bridge': this.chunkBridge(); break;
      case 'stones': this.chunkStones(); break;
      case 'cliff': this.chunkCliff(); break;
      case 'bounce': this.chunkBounce(); break;
      case 'ladder': this.chunkLadder(); break;
      case 'swing': this.chunkSwing(); break;
      case 'moving': this.chunkMoving(); break;
      case 'fragile': this.chunkFragile(); break;
      case 'yard': this.chunkYard(); break;
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
      case 'zigzag': this.chunkZigzag(); break;
      case 'trampoline': this.chunkTrampoline(); break;
      case 'causeway': this.chunkCauseway(); break;
      case 'pegs': this.chunkPegs(); break;
      case 'meadow': this.chunkMeadow(); break;
      case 'ditch': this.chunkDitch(); break;
      case 'twin': this.chunkTwin(); break;
      case 'river': this.chunkRiver(this.riverQueue.shift() ?? riverRecipes(this.cfg.miniIndex)[0]); break;
    }
  }

  /** a short breather with a checkpoint flag on it */
  checkpoint() {
    const s = this.flat(260, { safe: true });
    this.CP.push({ x: s.x0 + 90, y: this.g, reached: false });
    this.lastCp = this.cx;
    this.log.push('checkpoint');
  }

  /** this stage's favourite pieces: a few kinds it uses more than the others, so every stage has its own flavour */
  fav = new Set<Kind>();
  recipe?: { core: string; partner: string | null; fork: string };
  pickFavourites() {
    const pool = (Object.keys(UNLOCK) as Kind[]).filter((k) => UNLOCK[k] <= this.m && k !== 'flat' && k !== 'river' && (k !== 'tower' || this.G >= 560));
    for (let i = 0; i < 4 && pool.length; i++) this.fav.add(pool.splice(Math.floor(this.rnd() * pool.length), 1)[0]);
  }


  // ---- stage recipes: every ordinary stage is about one idea ----
  /** the pieces a recipe may be built on: they demand something of the player, and need no skill the player may lack */
  private recipeOk(k: Kind) {
    return UNLOCK[k] <= this.m && INTENSITY[k] >= 1 && k !== 'river' && k !== 'ropegap' && k !== 'ropebonus' && k !== 'yard' && (k !== 'tower' || this.G >= 560);
  }

  private weightedFrom(kinds: Kind[]): Kind {
    const w = kinds.map((k) => Math.max(0.05, BASE_WEIGHT[k] * (OBJ_WEIGHT[this.cfg.objectiveType]?.[k] ?? 1) * (this.fav.has(k) ? 2.2 : 1)));
    let r = this.rnd() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < kinds.length; i++) { r -= w[i]; if (r <= 0) return kinds[i]; }
    return kinds[kinds.length - 1];
  }

  /** the idea this stage is built around */
  pickCore(): Kind {
    const obj = this.cfg.objectiveType;
    const all = (Object.keys(UNLOCK) as Kind[]).filter((k) => this.recipeOk(k));
    if (obj === 'purge' || obj === 'gauntlet') return 'yard';
    if (obj === 'vine_runner' && UNLOCK.swing <= this.m) return 'swing';
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
    const cap = core === 'yard' || INTENSITY[core] < 2 ? 2 : 1;
    const pool = (Object.keys(UNLOCK) as Kind[]).filter((k) => this.recipeOk(k) && k !== core && INTENSITY[k] <= cap);
    return pool.length ? this.weightedFrom(pool) : null;
  }

  /** an easy, pleasant piece for a breather */
  calmKind(): Kind {
    const pool = (['meadow', 'canopy', 'slope', 'valley', 'rolling', 'causeway', 'hill', 'bridge'] as Kind[]).filter((k) => UNLOCK[k] <= this.m);
    return pool[Math.floor(this.rnd() * pool.length)] ?? 'hill';
  }

  /** the side route every stage offers: a ladder to a perch, or (once the rope is known) fruit along a rope */
  pickFork(): Kind {
    return skillGuaranteedAt('shimmy', this.m) && this.chance(0.4) ? 'ropebonus' : 'ladder';
  }

  pickKind(last: Kind[], forbid: Kind[] = []): Kind {
    const w: Array<[Kind, number]> = [];
    for (const k of Object.keys(UNLOCK) as Kind[]) {
      if (UNLOCK[k] > this.m || forbid.includes(k)) continue;
      if (k === 'flat') continue; // flats come from spacers
      if (k === 'tower' && this.G < 560) continue;
      let wt = BASE_WEIGHT[k] * (OBJ_WEIGHT[this.cfg.objectiveType]?.[k] ?? 1);
      if (this.fav.has(k)) wt *= 2.2;
      if (last.includes(k)) wt *= 0.25;
      if (this.safeMode && INTENSITY[k] > 1) wt *= 0.2;
      w.push([k, wt]);
    }
    let sum = w.reduce((a, [, x]) => a + x, 0);
    let r = this.rnd() * sum;
    for (const [k, x] of w) { r -= x; if (r <= 0) return k; }
    return 'pit';
  }
}

// ---------------------------------------------------------------------------
// Horizontal levels
// ---------------------------------------------------------------------------

function buildHorizontal(gen: Gen): GeneratedStage {
  const cfg = gen.cfg;
  const obj = cfg.objectiveType;
  // World 2's rivers take up room that the stage's fights and pickups also need, so the stage is as much longer as its rivers are wide
  const hasRivers = cfg.worldIndex === 2 && obj !== 'ascent' && obj !== 'boss_lair' && !cfg.secret;
  // each stage is a little longer or shorter than its siblings, and opens differently
  const widthJitter = cfg.secret ? 1 : gen.rr(0.94, 1.14);
  const targetW = Math.round(cfg.levelWidth * widthJitter) + (hasRivers ? riverRecipes(cfg.miniIndex).reduce((a, r) => a + r.width, 0) : 0);

  gen.pickFavourites();
  // ---- the recipe: one idea, introduced safely, developed, twisted, paid off ----
  const core = gen.pickCore();
  const partner = gen.pickPartner(core);
  const fork = gen.pickFork();
  gen.fav.add(core);
  gen.recipe = { core, partner, fork };
  const recipeOn = obj !== 'ascent' && !cfg.secret;

  // ---- opening: safe ground to find your feet ----
  gen.flat(Math.round(gen.rr(480, 720)), { safe: true });
  const spawnX = 140;
  const spawnY = gen.g;
  gen.log.push('intro');

  // pieces the objective insists on, spread across the level
  const forced: Array<{ at: number; kind: Kind; count?: number }> = [];
  const spread = (n: number, kinds: Kind[]) => {
    for (let i = 0; i < n; i++) forced.push({ at: targetW * ((i + 0.6) / (n + 0.4)) * 0.92, kind: kinds[i % kinds.length] });
  };
  // (only pieces the route runs over: a ladder is a side trip, and an idol left on a skipped ladder could never be fetched back)
  if (obj === 'relic_hunt') spread(gen.cfg.targetCount, gen.G >= 700 ? ['tower', 'cliff', 'bounce'] : ['cliff', 'bounce']);
  if (obj === 'rescue') spread(gen.cfg.targetCount, ['cliff', 'bounce']);
  // the Vine Swing mission is about swinging: three vines are always in it (once vines are unlocked)
  if (obj === 'vine_runner') spread(3, ['swing']);
  if (obj === 'purge' || obj === 'gauntlet') {
    const yards = Math.ceil((gen.cfg.targetCount + 2) / 2.6);
    for (let i = 0; i < yards; i++) forced.push({ at: targetW * ((i + 0.5) / (yards + 0.2)) * 0.95, kind: 'yard' });
  }
  // World 2 is the river world: every ordinary stage has the rivers its place in the world calls for (river.ts)
  if (hasRivers) {
    const recs = riverRecipes(cfg.miniIndex);
    gen.riverQueue = recs.slice();
    recs.forEach((_, i) => forced.push({ at: targetW * ((i + 0.55) / (recs.length + 0.25)) * 0.9, kind: 'river' }));
  }
  forced.sort((a, b) => a.at - b.at);

  // the beats, placed along the stage. Early stages get a gentler arc (no twist, one test), so the first hours stay friendly.
  type Role = 'intro' | 'develop' | 'fork' | 'twist' | 'breather' | 'payoff';
  const endZone = 1500;
  const span = Math.max(2200, targetW - endZone - 700);
  const at = (f: number) => 700 + span * f;
  const script: Array<{ at: number; role: Role }> = [];
  if (recipeOn) {
    script.push({ at: 0, role: 'intro' });
    if (core !== 'yard') script.push({ at: at(0.3), role: 'develop' });
    script.push({ at: at(0.4), role: 'fork' });
    if (gen.m >= 3) {
      if (core !== 'yard') script.push({ at: at(0.52), role: 'develop' });
      if (partner) script.push({ at: at(0.63), role: 'twist' });
      script.push({ at: at(0.73), role: 'breather' });
      script.push({ at: at(0.84), role: 'payoff' });
    } else {
      script.push({ at: at(0.72), role: 'breather' });
    }
  }
  // a stage only has room for so many pieces (about 1,250 px each, forced ones included): drop the least important beats
  // first, so the ones that remain are really placed and the stage does not grow to fit them
  {
    const weight = (r: Role) => (r === 'twist' ? 2 : 1);
    let room = Math.max(2, Math.round((targetW - endZone - 600) / 1250) + 2 - forced.length);
    const drop: Role[] = ['develop', 'develop', 'breather', 'fork', 'twist'];
    const total = () => script.reduce((a, b) => a + weight(b.role), 0);
    for (const r of drop) {
      if (total() <= room) break;
      const i = script.map((b) => b.role).lastIndexOf(r);
      if (i >= 0) script.splice(i, 1);
    }
    room = 0;
  }
  const calmRow = (len: number) => { const s = gen.flat(len); gen.row(s.x0 + 30, s.x1 - 30, gen.g - 32, 3); return s; };
  /** a flag after something hard, so a slip costs one section and not the whole stretch */
  const flagAfterHard = () => { if (gen.cx - gen.lastCp > 650 && gen.cx < targetW - endZone) gen.checkpoint(); };

  const last: Kind[] = [];
  let hardJustNow = 0;
  let pieces = 0;
  let payoffDone = false;
  // (at least four pieces, so even a short stage is a little journey and not one hill)
  while (gen.cx < targetW - endZone || pieces < (gen.m <= 2 ? 3 : 4)) {
    // checkpoint cadence
    if (gen.cx - gen.lastCp > 1000) { gen.checkpoint(); continue; }

    let kind: Kind;
    let beat: Role | null = null;
    if (forced.length && gen.cx >= forced[0].at) {
      const f = forced.shift()!;
      kind = UNLOCK[f.kind] <= gen.m ? f.kind : gen.pickKind(last);
    } else if (script.length && gen.cx >= script[0].at) {
      beat = script.shift()!.role;
      kind = beat === 'fork' ? fork : beat === 'breather' ? gen.calmKind() : core;
    } else {
      kind = gen.pickKind(last);
    }
    // yards are never back to back: terrain separates them, so a fight stage still asks you to jump
    if (recipeOn && kind === 'yard' && last[last.length - 1] === 'yard' && !beat) {
      const between = gen.pickPartner('yard');
      if (between) {
        if (gen.cx - gen.lastCp > 700) gen.checkpoint();
        gen.chunk(between);
        gen.log.push('beat:between');
        pieces++;
        last.push(between);
        if (last.length > 3) last.shift();
        gen.flat(gen.rr(110, 200));
        if (gen.cx - gen.lastCp > 700) gen.checkpoint();
      }
    }
    // never two hard pieces back to back (the recipe's own twist is the one planned exception)
    if (!beat && hardJustNow > 0 && INTENSITY[kind] >= 2) { kind = gen.chance(0.5) ? 'hill' : 'bridge'; if (UNLOCK[kind] > gen.m) kind = 'hill'; }

    if (beat === 'intro') {
      // the first look at the idea: a flag just behind it, and no animals on it
      if (gen.cx - gen.lastCp > 700) gen.checkpoint();
      const from = gen.spots.length;
      if (kind === 'yard') gen.chunkYard(1); else gen.chunk(kind);
      for (const sp of gen.spots.slice(from)) if (!sp.perch) sp.safe = true;
      calmRow(gen.rr(160, 240));
      gen.log.push('beat:intro');
    } else if (beat === 'twist') {
      if (gen.cx - gen.lastCp > 500) gen.checkpoint();
      gen.chunk(core);
      gen.flat(gen.rr(110, 150));
      if (gen.cx - gen.lastCp > 1000) gen.checkpoint();
      gen.chunk(partner!);
      gen.log.push('beat:twist');
      flagAfterHard();
    } else if (beat === 'payoff') {
      if (gen.cx - gen.lastCp > 700) gen.checkpoint();
      gen.chunk(core);
      payoffDone = true;
      gen.log.push('beat:payoff');
      if (gen.cx - gen.lastCp > 400 && gen.cx < targetW - 700) gen.checkpoint();
    } else if (beat === 'breather') {
      gen.chunk(kind);
      calmRow(gen.rr(220, 320));
      gen.log.push('beat:breather');
      flagAfterHard();
    } else {
      gen.chunk(kind);
      if (beat) gen.log.push('beat:' + beat);
      else if (INTENSITY[kind] >= 2) flagAfterHard();
    }
    pieces++;
    last.push(kind);
    if (last.length > 3) last.shift();
    hardJustNow = beat === 'twist' || INTENSITY[kind] >= 2 ? 1 : 0;

    // spacer: ground to breathe on
    const spacerP = INTENSITY[kind] >= 1 ? 0.9 : 0.55;
    if (gen.chance(spacerP)) {
      const s = gen.flat(gen.rr(110, INTENSITY[kind] >= 2 ? 360 : 260));
      if (gen.chance(0.6)) gen.row(s.x0 + 30, s.x1 - 30, gen.g - 32, 3);
      hardJustNow = 0;
    }
  }

  // a short stage can end before its payoff came due: it still gets one
  if (recipeOn && gen.m >= 3 && !payoffDone) {
    if (gen.cx - gen.lastCp > 600) gen.checkpoint();
    gen.chunk(core);
    gen.log.push('beat:payoff');
  }

  // ---- finish: flat run-up, flag, then the goal staircase ----
  gen.flat(gen.rr(220, 300));
  // (no second flag right after the last one: they were sometimes under 500 px apart)
  if (gen.cx - gen.lastCp > 900) gen.checkpoint();
  const steps = gen.ri(3, 6);
  const stepH = gen.rr(28, 40);
  for (let i = 0; i < steps; i++) { gen.up(stepH); gen.flat(gen.rr(64, 90)); }
  const goal = gen.flat(520, { safe: true });
  const exitTotemX = goal.x0 + 260;
  const exitTotemY = gen.g;
  gen.closeBank();
  gen.item('exit_totem', exitTotemX, exitTotemY - 30);
  gen.log.push('goal');

  decorate(gen, spawnX);

  return {
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
  };
}

/** Everything that depends on the finished layout: enemies, fliers, rewards, quotas. */
function decorate(gen: Gen, spawnX: number) {
  const cfg = gen.cfg;
  const obj = cfg.objectiveType;
  const awayFromSafe = (x: number) =>
    Math.abs(x - spawnX) > 360 && gen.CP.every((c) => Math.abs(c.x - x) > 260);

  // ---- ordinary ground enemies on suitable flats ----
  const p0: Record<string, number> = {
    sprint: 0.16, harvest: 0.2, purge: 0.5, ascent: 0.3, stealth: 0.1, vine_runner: 0.07,
    relic_hunt: 0.2, rescue: 0.28, gauntlet: 0.6,
  };
  const pEnemy = (p0[obj] ?? 0.2) * (gen.m === 1 ? 0.4 : 0.7 + gen.d * 0.8);
  let first = gen.m > 1;
  for (const s of gen.spots) {
    const len = s.x1 - s.x0;
    if (s.safe || s.yard || s.perch || len < 260) continue;
    const mid = (s.x0 + s.x1) / 2;
    if (!awayFromSafe(mid)) continue;
    if (!first && gen.rnd() > pEnemy) continue;
    first = true;
    gen.ground(mid, s.y, s.x0 + 50, s.x1 - 50);
  }

  // ---- quota top-ups ----
  const have = (f: (t: string) => boolean) => gen.C.filter((c) => f(c.type)).length;
  const perches = gen.spots.filter((s) => s.perch).sort((a, b) => a.x0 - b.x0);
  const flats = gen.spots.filter((s) => !s.safe && !s.perch && !s.yard && s.x1 - s.x0 >= 180);

  if (obj === 'purge' || obj === 'gauntlet') {
    let guard = 0;
    // wide flats first; if the layout has too few, any open ground of 140 px or more will do
    const wideSpots = gen.spots.filter((s) => !s.yard && !s.perch && !s.safe && s.x1 - s.x0 >= 140);
    const order = [...flats, ...wideSpots.filter((s) => !flats.includes(s))].sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0));
    while (gen.E.length < cfg.targetCount + 2 && guard++ < 400) {
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
      gen.ground(mid, s.y, s.x0 + 40, s.x1 - 40);
    }
    // still short on a crowded layout: pack the animals a little closer (never closer than 95 px)
    for (let pass = 0; pass < 200 && gen.E.length < cfg.targetCount + 1 && order.length; pass++) {
      const s = order[pass % order.length];
      const mid = s.x0 + 40 + gen.rnd() * Math.max(0, s.x1 - s.x0 - 80);
      if (gen.E.some((o) => o.type !== 'eagle' && Math.abs(o.x - mid) < 95) || !awayFromSafe(mid)) continue;
      gen.ground(mid, s.y, s.x0 + 40, s.x1 - 40);
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

  if (obj === 'harvest') {
    let guard = 0;
    const pool = [...flats, ...perches];
    while (have((t) => t === 'flower' || t === 'leaf') < cfg.targetCount + 4 && guard++ < 200 && pool.length) {
      const s = pool[guard % pool.length];
      gen.row(s.x0 + 30, s.x1 - 30, s.y - 32, 4);
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
  const nEagles =
    obj === 'stealth' ? 2 + Math.floor(gen.world * 0.4)
    : obj === 'purge' || obj === 'gauntlet' ? 1 + Math.floor(gen.world * 0.3)
    : gen.m < 3 ? 0
    : Math.floor(wide / 2200);
  for (let i = 0; i < nEagles; i++) {
    for (let tries = 0; tries < 20; tries++) {
      const x = gen.rr(1100, wide - 1100);
      const homeY = gen.G - gen.rr(230, 270);
      if (gen.CP.every((c) => Math.abs(c.x - x) > 480) && gen.skyClear(x, homeY)) {
        gen.eagle(x, homeY);
        break;
      }
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
  gen.plat({ x: 0, y: floorY, width: W, height: GROUND_H, type: 'solid', style: 'log' });
  gen.spots.push({ x0: 0, x1: 520, y: floorY, safe: true });
  const spawnX = 200;
  const spawnY = floorY;

  // the first landing sits above the floor; later pieces start from the previous landing
  let cur: Platform = gen.plat({ x: 260, y: floorY - 70, width: 260, height: 28, type: 'solid', style: 'branch' });
  let dir: 1 | -1 = 1;
  const flip = (p: Platform) => {
    if (dir === 1 && p.x + p.width > W - 420) dir = -1;
    else if (dir === -1 && p.x < 420) dir = 1;
  };

  const landings: Platform[] = [cur];
  let n = 0;
  while (cur.y > summitY + 80) {
    flip(cur);
    const roll = gen.rnd();
    const canSwing = !gen.safeMode && gen.m >= 4;
    const room = cur.y - summitY;
    let kind = roll < 0.4 ? 'stairs' : roll < 0.68 ? 'tree' : roll < 0.84 ? 'mush' : canSwing ? 'swing' : 'stairs';
    if ((kind === 'tree' && room < 260) || (kind === 'mush' && room < 200)) kind = 'stairs';

    if (kind === 'stairs') {
      const steps = gen.ri(3, 5);
      for (let i = 0; i < steps && cur.y > summitY + 80; i++) {
        const w = gen.rr(150, 200);
        const rise = gen.rr(58, 72);
        const gap = gen.rr(36, Math.max(40, gen.hopLen(rise, 1)));
        const y = cur.y - rise;
        const x = dir === 1 ? cur.x + cur.width + gap : cur.x - gap - w;
        cur = gen.plat({ x, y, width: w, height: 28, type: gen.chance(0.1 * gen.d) && !gen.safeMode && i > 0 ? 'fragile' : 'solid', style: 'branch' });
        gen.flower(x + w / 2, y - 36);
        flip(cur);
      }
      gen.log.push('stairs');
    } else if (kind === 'tree') {
      const h = Math.min(gen.rr(220, 320), room - 40);
      const vx = dir === 1 ? cur.x + cur.width - 40 : cur.x + 40;
      const topY = cur.y - h;
      const w = 280;
      const bx = dir === 1 ? vx - 70 : vx + 70 - w;
      const tree: TreeStructure = { id: gen.tid++, x: vx, groundY: cur.y, topY: topY - 170, trunkWidth: 70, hasClimbVine: true, canopyRadius: 150 };
      gen.T.push(tree);
      gen.V.push({ id: gen.vid++, x: vx, topY: topY - 2, bottomY: cur.y - 6, swaySpeed: 0.9, swayPhase: gen.rnd() * 6, vineType: 'tree_climb', treeId: tree.id });
      cur = gen.plat({ x: bx, y: topY, width: w, height: 28, type: 'solid', style: 'branch' });
      gen.flower(bx + w / 2, topY - 36);
      gen.log.push('tree');
    } else if (kind === 'mush') {
      const h = gen.rr(135, 160);
      const mx = dir === 1 ? cur.x + cur.width - 90 : cur.x + 20;
      gen.plat({ x: mx, y: cur.y - 30, width: 70, height: 30, type: 'bouncy' });
      const w = gen.rr(220, 280);
      const gap = gen.rr(30, 70);
      const x = dir === 1 ? mx + 70 + gap : mx - gap - w;
      cur = gen.plat({ x, y: cur.y - h, width: w, height: 28, type: 'solid', style: 'branch' });
      gen.flower(x + w / 2, cur.y - 36);
      gen.log.push('mush');
    } else {
      // swing across a shaft
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
          cur = gen.plat({ x: bx, y: B.y, width: bw, height: 28, type: 'solid', style: 'branch' });
          gen.log.push('swing');
          done = true;
        }
      }
      if (!done) {
        const w = 200;
        const x = dir === 1 ? cur.x + cur.width + 40 : cur.x - 40 - w;
        cur = gen.plat({ x, y: cur.y - 66, width: w, height: 28, type: 'solid', style: 'branch' });
      }
    }
    landings.push(cur);
    n++;
    // a wide resting ledge now and then, with a checkpoint
    if (n % 3 === 0 && cur.y > summitY + 140) {
      const w = 300;
      const rise = gen.rr(40, 64);
      const gap = gen.rr(36, Math.max(40, gen.hopLen(rise, 1)));
      const x = dir === 1 ? cur.x + cur.width + gap : cur.x - gap - w;
      cur = gen.plat({ x, y: cur.y - rise, width: w, height: 28, type: 'solid', style: 'branch' });
      gen.CP.push({ x: cur.x + w / 2, y: cur.y, reached: false });
      gen.spots.push({ x0: cur.x, x1: cur.x + w, y: cur.y, safe: true });
      landings.push(cur);
    }
  }

  // summit
  flip(cur);
  const sw = 520;
  const gap = Math.max(40, gen.hopLen(60, 1));
  const sx = Math.max(60, Math.min(W - sw - 60, dir === 1 ? cur.x + cur.width + gap : cur.x - gap - sw));
  const summit = gen.plat({ x: sx, y: cur.y - 60, width: sw, height: 40, type: 'solid', style: 'log' });
  gen.spots.push({ x0: summit.x, x1: summit.x + sw, y: summit.y, safe: true });
  const exitTotemX = summit.x + sw / 2;
  const exitTotemY = summit.y;
  gen.item('exit_totem', exitTotemX, exitTotemY - 30);

  // enemies on some landings, power-ups on a couple
  const pE = 0.25 + gen.d * 0.35;
  landings.forEach((l, i) => {
    if (i < 2 || l.width < 190) return;
    if (gen.CP.some((c) => Math.abs(c.x - (l.x + l.width / 2)) < 240)) return;
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
  gen.plat({ x: 0, y: floor, width: cfg.levelWidth, height: 80, type: 'solid', style: 'log' });

  // two great trunks are the walls
  for (const tx of [left - 40, right + 40]) {
    const tree: TreeStructure = { id: gen.tid++, x: tx, groundY: floor, topY: 90, trunkWidth: 90, hasClimbVine: true, canopyRadius: 170 };
    gen.T.push(tree);
    gen.V.push({ id: gen.vid++, x: tx, topY: 140, bottomY: 540, swaySpeed: 1.0, swayPhase: tx > 1300 ? 1 : 0, vineType: 'tree_climb', treeId: tree.id });
  }

  // a high perch in the middle and a low branch on each side: somewhere to jump to, never a place to hide
  for (const b of [{ x: left + 70, y: 440, w: 200 }, { x: right - 270, y: 440, w: 200 }, { x: (left + right) / 2 - 130, y: 340, w: 260 }]) {
    gen.plat({ x: b.x, y: b.y, width: b.w, height: 26, type: 'solid', style: 'branch' });
  }

  const maxHp = def.hp ?? bossMaxHp(cfg.worldIndex);
  const boss: BossEntity = {
    id: 1, type: 'boss', x: right - Math.max(160, def.w / 2 + 40), y: floor - def.h / 2, vx: 0, vy: 0, width: def.w, height: def.h, hp: maxHp, maxHp,
    facing: -1, patrolMinX: left, patrolMaxX: right, attackCooldown: 0, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 0, shieldActive: false, dialogueIntro: world.bossQuote, dialogueDefeat: 'Nooo! Defeated by a sloth...!',
    ai: newBrain(),
  };
  gen.item('heart', left + 170, 400);
  gen.item('heart', right - 170, 400);

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

export function buildStage(config: LevelConfig, attempt = 0): GeneratedStage {
  const gen = new Gen(config, attempt);
  let stage: GeneratedStage;
  if (config.objectiveType === 'boss_lair') stage = buildBoss(gen);
  else if (config.objectiveType === 'ascent') stage = buildAscent(gen);
  else stage = buildHorizontal(gen);
  stage.meta = { attempt, chunks: gen.log, width: Math.round(stage.config.levelWidth), ...(gen.recipe ? { recipe: gen.recipe } : {}) };
  return stage;
}

/** First attempt whose layout passes the validator. Used by the seed script and tests. */
export function findValidAttempt(config: LevelConfig, maxAttempts = 14): { attempt: number; errors: string[] } {
  let errors: string[] = [];
  for (let a = 0; a < maxAttempts; a++) {
    const res = validateStage(buildStage(config, a));
    if (res.ok) return { attempt: a, errors: [] };
    errors = res.errors;
  }
  return { attempt: -1, errors };
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

/** the attempt number for a random layout of this stage: the first one from this variant's range that passes the validator */
export function variantAttemptFor(config: LevelConfig, variant: number, maxAttempts = 14): number {
  const key = `${config.id}#${variant}`;
  const hit = variantAttempt.get(key);
  if (hit !== undefined) return hit;
  let found = -1;
  for (let k = 0; k < maxAttempts; k++) {
    const a = VARIANT_BASE + variant * 31 + k;
    if (validateStage(buildStage(config, a)).ok) {
      found = a;
      break;
    }
  }
  variantAttempt.set(key, found);
  return found;
}

export function generateStage(config: LevelConfig): GeneratedStage {
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
  addSecrets(stage);
  return stage;
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
