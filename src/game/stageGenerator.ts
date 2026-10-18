import type {
  LevelConfig,
  Platform,
  Vine,
  Enemy,
  BossEntity,
  Collectible,
  TreeStructure,
  ObjectiveType,
} from './types.ts';
import { calculateDifficultyScaling } from './rules.ts';
import { WORLDS_DATA } from './worldsData.ts';
import { reachJump } from './physics.ts';
import { swingLandings, validateStage } from './levelCheck.ts';
import { LEVEL_ATTEMPTS } from './levelSeeds.ts';

export interface GeneratedStage {
  config: LevelConfig;
  trees: TreeStructure[];
  platforms: Platform[];
  vines: Vine[];
  enemies: Enemy[];
  boss: BossEntity | null;
  collectibles: Collectible[];
  spawnX: number;
  spawnY: number;
  exitTotemX: number;
  exitTotemY: number;
  daisyX?: number;
  daisyY?: number;
  /** mid-level respawn flags (Mario-style) */
  checkpoints?: Array<{ x: number; y: number; reached: boolean }>;
  /** y of the water/pit surface; falling below it costs a life */
  waterY?: number;
  /** what the generator built (for tests and debugging) */
  meta?: { attempt: number; chunks: string[]; width: number };
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
  | 'ladder' | 'swing' | 'moving' | 'fragile' | 'yard' | 'tower';

/** first mission number (1..100) a piece may appear in: teaches one idea at a time */
const UNLOCK: Record<Kind, number> = {
  flat: 1, pit: 1, hill: 1, yard: 1, bridge: 2, stones: 2, cliff: 2, ladder: 2,
  bounce: 3, swing: 4, moving: 8, fragile: 11, tower: 14,
};

const BASE_WEIGHT: Record<Kind, number> = {
  flat: 1.4, pit: 3, hill: 2, bridge: 1.2, stones: 2.2, cliff: 1.6, bounce: 1.4,
  ladder: 1.3, swing: 1.8, moving: 1.4, fragile: 1.2, yard: 1, tower: 0.8,
};

const OBJ_WEIGHT: Partial<Record<ObjectiveType, Partial<Record<Kind, number>>>> = {
  sprint: { pit: 1.4, bounce: 1.3, moving: 1.3, yard: 0.5 },
  harvest: { ladder: 1.6, stones: 1.3, yard: 0.6 },
  purge: { yard: 3, flat: 0.8, swing: 0.6 },
  stealth: { bridge: 1.8, cliff: 1.5, yard: 0.7 },
  vine_runner: { swing: 3.2, stones: 1.5, yard: 0.2, pit: 0.7 },
  relic_hunt: { ladder: 2, cliff: 2, tower: 3, bounce: 1.4 },
  rescue: { ladder: 1.5, yard: 1.5, cliff: 1.3 },
  gauntlet: { yard: 3.2, moving: 1.3, fragile: 1.3 },
};

/** how taxing a piece is; a spacer of flat ground follows the hard ones */
const INTENSITY: Record<Kind, number> = {
  flat: 0, hill: 0, bridge: 0, ladder: 0, pit: 1, stones: 1, cliff: 1, bounce: 1,
  yard: 1, swing: 2, moving: 2, fragile: 2, tower: 2,
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
  T: TreeStructure[] = [];
  E: Enemy[] = [];
  C: Collectible[] = [];
  CP: Array<{ x: number; y: number; reached: boolean }> = [];
  spots: Spot[] = [];
  log: string[] = [];

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
    this.safeMode = attempt >= 5;
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

  ground(x: number, surface: number, pMin: number, pMax: number) {
    if (this.world >= 2 && this.chance(0.35 + this.d * 0.3)) this.ocelot(x, surface, pMin, pMax);
    else this.snake(x, surface, pMin, pMax);
  }

  eagle(x: number, homeY: number) {
    const e = this.baseEnemy('eagle', x, homeY, 58, 42, this.world === 1 ? 1 : 2, (this.world === 1 ? 30 : 42) * this.diff.enemySpeedMultiplier);
    e.patrolMinX = x - 240; e.patrolMaxX = x + 240; e.attackCooldown = 4; e.swoopPhase = 'patrol'; e.hoverTimer = 0; e.homeY = homeY;
    this.E.push(e);
  }

  // ---- pieces ----

  /** pit width: shorter early, never beyond a comfortable single jump */
  pitW() {
    const r = reachJump(0, false);
    const hi = Math.min(0.8 * r, this.lerp(100, 0.8 * r));
    return this.rr(Math.max(72, hi - 34), hi);
  }

  chunkPit() {
    const wide = !this.safeMode && this.m >= 6 && this.chance(0.35 * this.d + 0.1);
    const w = wide ? this.rr(0.62, 0.78) * reachJump(0, true) : this.pitW();
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
      const y = Math.max(this.g + 30, Math.min(this.g + 80, prevY + this.rr(-35, 35)));
      const hop = Math.max(60, reachJump(prevY - y, false) * frac());
      const w = this.rr(92, 130);
      x += hop;
      const fragile = !this.safeMode && this.world >= 2 && i > 0 && i < n - 1 && this.chance(0.3 * this.d + 0.08);
      this.plat({ x, y, width: w, height: 28, type: fragile ? 'fragile' : 'solid', style: this.chance(0.5) ? 'log' : 'moss_stone' });
      this.flower(x + w / 2, y - 42);
      x += w;
      prevY = y;
    }
    x += Math.max(60, reachJump(prevY - this.g, false) * frac());
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
      this.spots.push({ x0: topLedge.x, x1: topLedge.x + topLedge.width, y: topLedge.y, perch: true, safe: true });
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
      if ((res.get(-2) ?? 0) >= 3) {
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
    const runup: Partial<Record<Kind, number>> = { pit: 130, stones: 140, swing: 220, moving: 180, fragile: 170 };
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
    }
  }

  /** a short breather with a checkpoint flag on it */
  checkpoint() {
    const s = this.flat(260, { safe: true });
    this.CP.push({ x: s.x0 + 90, y: this.g, reached: false });
    this.lastCp = this.cx;
    this.log.push('checkpoint');
  }

  pickKind(last: Kind[], forbid: Kind[] = []): Kind {
    const w: Array<[Kind, number]> = [];
    for (const k of Object.keys(UNLOCK) as Kind[]) {
      if (UNLOCK[k] > this.m || forbid.includes(k)) continue;
      if (k === 'flat') continue; // flats come from spacers
      if (k === 'tower' && this.G < 560) continue;
      let wt = BASE_WEIGHT[k] * (OBJ_WEIGHT[this.cfg.objectiveType]?.[k] ?? 1);
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
  const targetW = cfg.levelWidth;
  const obj = cfg.objectiveType;

  // ---- opening: safe ground to find your feet ----
  gen.flat(620, { safe: true });
  const spawnX = 140;
  const spawnY = gen.g;
  gen.log.push('intro');

  // pieces the objective insists on, spread across the level
  const forced: Array<{ at: number; kind: Kind; count?: number }> = [];
  const spread = (n: number, kinds: Kind[]) => {
    for (let i = 0; i < n; i++) forced.push({ at: targetW * ((i + 0.6) / (n + 0.4)) * 0.92, kind: kinds[i % kinds.length] });
  };
  if (obj === 'relic_hunt') spread(gen.cfg.targetCount, gen.G >= 700 ? ['tower', 'ladder', 'cliff'] : ['ladder', 'cliff']);
  if (obj === 'rescue') spread(gen.cfg.targetCount, ['ladder', 'cliff', 'bounce']);
  if (obj === 'purge' || obj === 'gauntlet') {
    const yards = Math.ceil((gen.cfg.targetCount + 2) / 2.6);
    for (let i = 0; i < yards; i++) forced.push({ at: targetW * ((i + 0.5) / (yards + 0.2)) * 0.95, kind: 'yard' });
  }
  forced.sort((a, b) => a.at - b.at);

  const last: Kind[] = [];
  let hardJustNow = 0;
  const endZone = 1500;
  while (gen.cx < targetW - endZone) {
    // checkpoint cadence
    if (gen.cx - gen.lastCp > 1200) { gen.checkpoint(); continue; }

    let kind: Kind;
    if (forced.length && gen.cx >= forced[0].at) {
      const f = forced.shift()!;
      kind = UNLOCK[f.kind] <= gen.m ? f.kind : gen.pickKind(last);
    } else {
      kind = gen.pickKind(last);
    }
    // never two hard pieces back to back
    if (hardJustNow > 0 && INTENSITY[kind] >= 2) { kind = gen.chance(0.5) ? 'hill' : 'bridge'; if (UNLOCK[kind] > gen.m) kind = 'hill'; }

    gen.chunk(kind);
    last.push(kind);
    if (last.length > 3) last.shift();
    hardJustNow = INTENSITY[kind] >= 2 ? 1 : 0;

    // spacer: ground to breathe on
    const spacerP = INTENSITY[kind] >= 1 ? 0.9 : 0.55;
    if (gen.chance(spacerP)) {
      const s = gen.flat(gen.rr(110, INTENSITY[kind] >= 2 ? 360 : 260));
      if (gen.chance(0.6)) gen.row(s.x0 + 30, s.x1 - 30, gen.g - 32, 3);
      hardJustNow = 0;
    }
  }

  // ---- finish: flat run-up, flag, then the goal staircase ----
  gen.flat(gen.rr(220, 300));
  gen.checkpoint();
  const steps = 5;
  for (let i = 0; i < steps; i++) { gen.up(34); gen.flat(72); }
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
    enemies: gen.E,
    boss: null,
    collectibles: gen.C,
    spawnX,
    spawnY,
    exitTotemX,
    exitTotemY,
    checkpoints: gen.CP,
    waterY: gen.waterY,
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
    const order = [...flats].sort((a, b) => (b.x1 - b.x0) - (a.x1 - a.x0));
    while (gen.E.length < cfg.targetCount + 2 && guard++ < 400) {
      const s = order[guard % Math.max(1, order.length)];
      if (!s) break;
      const mid = (s.x0 + s.x1) / 2 + gen.rr(-40, 40);
      if (!awayFromSafe(mid)) continue;
      gen.ground(mid, s.y, s.x0 + 40, s.x1 - 40);
    }
  }

  if (obj === 'rescue') {
    const pool = perches.length >= cfg.targetCount ? perches : [...perches, ...flats];
    pool.sort((a, b) => a.x0 - b.x0);
    const step = pool.length / cfg.targetCount;
    for (let i = 0; i < cfg.targetCount; i++) {
      const s = pool[Math.min(pool.length - 1, Math.floor(i * step + step / 2))];
      gen.item('cage', (s.x0 + s.x1) / 2, s.y - 26);
    }
  }

  if (obj === 'relic_hunt') {
    const pool = perches.length >= cfg.targetCount ? perches : [...perches, ...flats];
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
      if (gen.CP.every((c) => Math.abs(c.x - x) > 480)) {
        gen.eagle(x, gen.G - gen.rr(230, 270));
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
        const gap = gen.rr(50, 96);
        const y = cur.y - gen.rr(58, 72);
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
        if ((res.get(-2) ?? 0) >= 3) {
          gen.V.push({ ...v, id: gen.vid++, swayPhase: gen.rnd() * 6 });
          cur = gen.plat({ x: bx, y: B.y, width: bw, height: 28, type: 'solid', style: 'branch' });
          gen.log.push('swing');
          done = true;
        }
      }
      if (!done) {
        const w = 200;
        const x = dir === 1 ? cur.x + cur.width + 70 : cur.x - 70 - w;
        cur = gen.plat({ x, y: cur.y - 66, width: w, height: 28, type: 'solid', style: 'branch' });
      }
    }
    landings.push(cur);
    n++;
    // a wide resting ledge now and then, with a checkpoint
    if (n % 3 === 0 && cur.y > summitY + 140) {
      const w = 300;
      const gap = gen.rr(50, 90);
      const x = dir === 1 ? cur.x + cur.width + gap : cur.x - gap - w;
      cur = gen.plat({ x, y: cur.y - gen.rr(40, 64), width: w, height: 28, type: 'solid', style: 'branch' });
      gen.CP.push({ x: cur.x + w / 2, y: cur.y, reached: false });
      gen.spots.push({ x0: cur.x, x1: cur.x + w, y: cur.y, safe: true });
      landings.push(cur);
    }
  }

  // summit
  flip(cur);
  const sw = 520;
  const gap = 70;
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
  for (let i = 0; i < nE; i++) gen.eagle(gen.rr(W * 0.25, W * 0.75), floorY - gen.rr(600, Math.max(700, H - 700)));

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
  const floor = 560;
  gen.plat({ x: 0, y: floor, width: cfg.levelWidth, height: 80, type: 'solid', style: 'log' });

  for (const tx of [420, 1380]) {
    const tree: TreeStructure = { id: gen.tid++, x: tx, groundY: floor, topY: 110, trunkWidth: 80, hasClimbVine: true, canopyRadius: 160 };
    gen.T.push(tree);
    gen.V.push({ id: gen.vid++, x: tx, topY: 140, bottomY: 540, swaySpeed: 1.0, swayPhase: tx > 800 ? 1 : 0, vineType: 'tree_climb', treeId: tree.id });
  }
  gen.V.push({ id: gen.vid++, x: 880, topY: 130, bottomY: 480, swaySpeed: 1.2, swayPhase: 0.5, vineType: 'swing_liana', isSwingingVine: true });

  for (const b of [{ x: 310, y: 420, w: 240 }, { x: 750, y: 350, w: 260 }, { x: 1260, y: 420, w: 240 }]) {
    gen.plat({ x: b.x, y: b.y, width: b.w, height: 28, type: 'solid', style: 'branch' });
  }
  gen.plat({ x: 180, y: 530, width: 70, height: 30, type: 'bouncy' });
  gen.plat({ x: 1620, y: 530, width: 70, height: 30, type: 'bouncy' });

  const maxHp = 10 + cfg.worldIndex * 4;
  const boss: BossEntity = {
    id: 1, type: 'boss', x: 1200, y: 510, vx: -40, vy: 0, width: 60, height: 70, hp: maxHp, maxHp,
    facing: -1, patrolMinX: 300, patrolMaxX: 1700, attackCooldown: 2.5, telegraphTimer: 0, isAttacking: false,
    animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, phase: 1, phaseMax: 3,
    specialAttackTimer: 4, shieldActive: false, dialogueIntro: world.bossQuote, dialogueDefeat: 'Nooo! Defeated by a sloth...!',
  };
  gen.item('heart', 400, 380);
  gen.item('heart', 1350, 380);

  return {
    config: cfg,
    trees: gen.T,
    platforms: gen.P,
    vines: gen.V,
    enemies: [],
    boss,
    collectibles: gen.C,
    spawnX: 140,
    spawnY: floor,
    exitTotemX: cfg.levelWidth - 220,
    exitTotemY: floor,
    daisyX: 1800,
    daisyY: 490,
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
  stage.meta = { attempt, chunks: gen.log, width: Math.round(stage.config.levelWidth) };
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

export function generateStage(config: LevelConfig): GeneratedStage {
  let attempt = LEVEL_ATTEMPTS[config.id];
  if (attempt === undefined) {
    // not a shipped level (or the seed table is stale): find a good layout now
    attempt = known.get(config.id) ?? findValidAttempt(config).attempt;
    if (attempt < 0) attempt = 0;
    known.set(config.id, attempt);
  }
  return buildStage(config, attempt);
}
