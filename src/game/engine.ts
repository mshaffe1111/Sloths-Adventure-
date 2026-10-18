import type {
  LevelConfig,
  PlayerState,
  Enemy,
  BossEntity,
  Collectible,
  Platform,
  Vine,
  Camera,
  Particle,
  FloatingText,
} from './types.ts';
import { WORLDS_DATA } from './worldsData.ts';
import { generateStage, GeneratedStage } from './stageGenerator.ts';
import { PHYS, swingGrab, swingStep, tarzanLaunch } from './physics.ts';
import { renderScenery, renderOverlay } from './scenery.ts';
import { renderWorldObjects, drawWater } from './terrain.ts';
import {
  drawHeroSloth,
  drawTreeSnake,
  drawHarpyEagle,
  drawOcelot,
  drawHazardEntity,
  drawGirlfriendDaisy,
  drawCollectible,
} from './vectorArt.ts';
import {
  checkAABBCollision,
  distance2D,
  isObjectiveComplete,
  calculateLevelStars,
  calculateHitScore,
} from './rules.ts';
import { InputEngine } from './inputEngine.ts';
import { sound } from './audio.ts';
import { bossMaterial, materialFor } from '../audio/combat.ts';
import { endStagger, isPredator, staggerPredator, stepPredator } from './predatorAI.ts';
import {
  applyHit, bodyRect, canCancel, chooseMove, contactPoint, headRect, hurtRect, isCommitted, koLaunch, moveBox, moveLength, MOVES, phaseAt,
  playerHurtRect, rectsOverlap, resolveMelee, stompSpec, stompTest, swingPose, sweptBox, TRAITS,
  type AttackWant, type MoveId, type MoveSpec, type Rect,
} from './fight.ts';
import { drawJaguar, drawBoa, drawCaiman, drawTayra } from './predators.ts';
import { bodyHurts, hazardBox, interruptBoss, stepBoss, stepHazards, vulnerability } from './bossAI.ts';
import type { BossCtx, BossDef, BossHazard } from './bossAI.ts';
import { bossDefForLevel } from './bossDefs.ts';
import { maxHearts } from './secret.ts';
import { drawBossFighter, drawHazards } from './bossArt.ts';

/** How many world units tall the screen shows. */
const WORLD_VIEW_H = 540;
/** world units across a portrait screen */
const PORTRAIT_VIEW_W = 360;
/** the play-start dolly-in: begins at this fraction of the final zoom and settles over this long */
const INTRO_ZOOM_FROM = 0.78;
const INTRO_ZOOM_SECS = 1.3;

export interface GameEngineCallbacks {
  onProgressUpdate: (
    current: number,
    target: number,
    score: number,
    hp: number,
    distanceRatio?: number,
    activePowerUp?: 'speed' | 'invincible' | 'magnet' | null,
    powerUpTimer?: number
  ) => void;
  onVictory: (stars: number, timeSec: number, score: number) => void;
  onDefeat: (score: number) => void;
  onLivesChange?: (lives: number, maxLives: number) => void;
  onBossEncounter?: (boss: BossEntity) => void;
  /** Slomatt stepped through the hidden Thorn Gate */
  onSecret?: () => void;
  /** the boss bar: sent only when something on it changes */
  onBossUpdate?: (info: { name: string; hp: number; maxHp: number; phase: number } | null) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private input: InputEngine;
  private callbacks: GameEngineCallbacks;

  private currentStage: GeneratedStage;
  private player: PlayerState;
  private platforms: Platform[];
  private vines: Vine[];
  private enemies: Enemy[];
  private boss: BossEntity | null;
  private collectibles: Collectible[];

  // --- boss fight (rules in bossAI.ts / bossDefs.ts) ---
  private hazards: BossHazard[] = [];
  private bossDef: BossDef | null = null;
  private bossCtx: BossCtx | null = null;
  private bossIntro = false;
  private bossSig = '';
  private clangCd = 0;
  /** seconds the player is stuck in web or goo (he runs slower) */
  private slowTimer = 0;
  private minionSeq = 0;
  /** 1 = normal; below 1 pulls the camera back so the boss and Slomatt both stay in view */
  private bossZoom = 1;

  private camera: Camera;
  /** screen pixels per world unit */
  private zoom = 1;
  /** css size of the canvas, and the seconds since play began (drives the zoom-in) */
  private viewCssW = 0;
  private viewCssH = 0;
  private introT = 0;
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private animFrameId: number | null = null;
  private lastTime: number = 0;
  private lastRenderTime: number = 0;
  /** the longest slice the simulation takes in one go (frames longer than this are cut into equal parts) */
  private readonly STEP = 1 / 60;
  /** seconds of real time not yet simulated */
  private acc = 0;
  private lastPausedRender = 0;
  /**
   * Automatic quality: 0 = full, 1 = lighter resolution, 2 = lightest. Only ever steps down, and only when the
   * screen genuinely cannot keep up (the simulation itself never changes).
   */
  private quality = 0;
  private perfFrames = 0;
  private warmupMs = 1000;
  private perfMs = 0;

  private hitstopTimer: number = 0;
  private gameTime: number = 0;
  private standingOnId: number = -1;
  /** true while rising from a mushroom/vine launch (those must not be cut short like a jump) */
  private launched = false;
  private runScore: number = 0;
  private comboCount: number = 0;
  private comboResetTimer: number = 0;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private lives: number = 3;
  private readonly maxLives: number = 3;
  private checkpoint = { x: 0, y: 0 };
  private respawnFlash = 0;
  /** Seconds at the start of a stage / after a respawn where run input is ignored, so Slomatt is dropped in standing still. */
  private inputGrace = 0.5;

  // --- fight system (see fight.ts) ---
  /** the attack being played: which move, how far into it, which animals it has already hit */
  private atk: { move: MoveSpec; t: number; id: number; connected: boolean; lunged: boolean; hits: Set<number>; sounded: boolean } | null = null;
  private atkQueue: { want: AttackWant; ttl: number } | null = null;
  private lastPunch: MoveId | null = null;
  private chainTimer = 0;
  private swingId = 0;
  private megaCooldown = 0;
  /** after a stomp, a short breather where nothing can hurt Slomatt (the thing he landed on is not a threat any more) */
  private stompGrace = 0;
  /** stomps in a row without touching the ground */
  private stompChain = 0;
  /** ?hitboxes=1 draws every hit and hurt box, so you can see exactly what the game is judging */
  private debugBoxes = false;
  private dbgHurt: Rect[] = [];
  private dbgStrike: Rect | null = null;

  private exitTotemReached: boolean = false;
  private daisyRescued: boolean = false;
  private isGameOver: boolean = false;
  private nearTreeVine: Vine | null = null;
  private nearSwingVine: Vine | null = null;
  private vineCooldownTimer: number = 0;
  private lastReleasedVineId: number = -1;
  private wasQuotaMet: boolean = false;
  private treeClimbAudioTimer: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    config: LevelConfig,
    input: InputEngine,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Could not get Canvas2D context');
    this.ctx = ctx;
    this.input = input;
    this.callbacks = callbacks;
    try {
      this.debugBoxes = new URLSearchParams(window.location.search).get('hitboxes') === '1';
    } catch {
      /* no window.location in some test setups */
    }

    // Generate Stage data
    this.currentStage = generateStage(config);
    if (import.meta.env?.DEV) (window as unknown as { __engine?: unknown }).__engine = this; // dev-only debug handle
    this.platforms = this.currentStage.platforms;
    this.vines = this.currentStage.vines;
    this.enemies = this.currentStage.enemies;
    this.boss = this.currentStage.boss;
    if (this.boss) this.bossDef = bossDefForLevel(config);
    this.collectibles = this.currentStage.collectibles;
    this.checkpoint = { x: this.currentStage.spawnX, y: this.currentStage.spawnY };

    // Initialize Hero Sloth
    this.player = {
      x: this.currentStage.spawnX,
      y: this.currentStage.spawnY,
      vx: 0,
      vy: 0,
      width: 44,
      height: 48,
      facing: 1,
      grounded: true,
      climbing: false,
      ducking: false,
      punching: false,
      punchTimer: 0,
      punchType: 'normal',
      kicking: false,
      kickTimer: 0,
      attackType: 'none',
      jumpsLeft: 2,
      isDoubleJumping: false,
      somersaultAngle: 0,
      megaCharge: 1.0,
      hp: maxHearts(),
      maxHp: maxHearts(),
      fruitsCollected: 0,
      relicsFound: 0,
      crittersRescued: 0,
      enemiesDefeated: 0,
      invincibleTimer: 0,
      walkCycle: 0,
      squashX: 1,
      squashY: 1,
      targetScaleX: 1,
      targetScaleY: 1,
    };

    // Initialize Camera
    this.camera = {
      x: Math.max(0, this.player.x - 300),
      y: Math.max(0, this.player.y - 300),
      targetX: this.player.x - 300,
      targetY: this.player.y - 300,
      zoom: 1.0,
      targetZoom: 1.0,
      trauma: 0,
      viewportWidth: canvas.width,
      viewportHeight: canvas.height,
    };

    this.resizeCanvas();
    window.addEventListener('resize', this.handleResize);

  }

  private handleResize = () => {
    this.resizeCanvas();
  };

  /** device pixels per css pixel to draw at: sharp by default, lighter when the screen is struggling */
  private renderDpr(): number {
    const native = window.devicePixelRatio || 1;
    const cap = [2, 1.5, 1][this.quality] ?? 1;
    return Math.max(1, Math.min(native, cap));
  }

  /** watch real frame times; if the screen cannot hold ~50 fps for a moment, step quality down one notch */
  private watchPerformance(elapsedMs: number) {
    if (this.quality >= 2) return;
    // the first moments of a stage build caches and warm up the JIT; do not judge them
    if (this.warmupMs > 0) {
      this.warmupMs -= elapsedMs;
      return;
    }
    this.perfFrames++;
    this.perfMs += elapsedMs;
    if (this.perfMs < 1200) return;
    const avg = this.perfMs / this.perfFrames;
    this.perfFrames = 0;
    this.perfMs = 0;
    // a 60 Hz screen averages ~16.7 ms, 120 Hz ~8.3 ms. Slower than ~20 ms means it is dropping frames.
    if (avg > 20) {
      this.quality++;
      this.resizeCanvas();
    }
  }

  public resizeCanvas() {
    const dpr = this.renderDpr();
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = Math.floor(w * dpr);
    this.canvas.height = Math.floor(h * dpr);
    this.viewCssW = w;
    this.viewCssH = h;
    this.applyZoom();
  }

  /**
   * How much of the world fits on screen.
   *  landscape: the world is always about WORLD_VIEW_H tall, so a hero is the same share of the screen on a phone,
   *             a tablet and a desktop (like a store platformer).
   *  portrait:  the screen is narrow, so fit a fixed width of world instead (never taller than the level itself).
   * When play begins the camera dollies in from a wider shot to this framing.
   */
  private applyZoom() {
    const w = this.viewCssW;
    const h = this.viewCssH;
    if (!w || !h) return;
    const levelH = this.currentStage?.config.levelHeight ?? 900;
    const portrait = h > w;
    let base = portrait ? Math.max(w / PORTRAIT_VIEW_W, h / levelH) : h / WORLD_VIEW_H;
    base = Math.max(0.5, Math.min(1.8, base));
    const t = Math.min(1, this.introT / INTRO_ZOOM_SECS);
    const ease = 1 - Math.pow(1 - t, 3);
    const dolly = INTRO_ZOOM_FROM + (1 - INTRO_ZOOM_FROM) * ease;
    // never show more height than the level has
    this.zoom = Math.max(base * dolly * this.bossZoom, h / levelH);
    this.camera.viewportWidth = w / this.zoom;
    this.camera.viewportHeight = h / this.zoom;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastRenderTime = this.lastTime;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    sound.playLevelStart();
    this.loop(this.lastTime);
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastTime = performance.now();
    this.lastRenderTime = this.lastTime;
    this.acc = 0;
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    window.removeEventListener('resize', this.handleResize);
    sound.setLowHealth(false);
  }

  private loop = (now: number) => {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(this.loop);

    // Real time since the last frame. A long stall (tab in the background, a slow frame) is capped so the
    // game never lurches ahead.
    const elapsed = Math.min(now - this.lastRenderTime, 100);
    this.lastRenderTime = now;

    if (this.isPaused) {
      this.acc = 0;
      // nothing moves while paused, so a slow refresh is plenty (it also repaints after a resize)
      if (now - this.lastPausedRender > 100) {
        this.lastPausedRender = now;
        this.render();
      }
      return;
    }

    this.watchPerformance(elapsed);

    // Every frame advances the game by exactly the time that really passed, so motion stays smooth on any
    // screen (60, 90, 120 or 144 Hz, even when frame times wobble). A long frame is cut into equal slices of
    // at most 1/60 s, so physics never takes a step bigger than the one the level validator checked.
    const dt = Math.min(elapsed / 1000, 0.05);
    const slices = Math.max(1, Math.ceil(dt / this.STEP - 1e-6));
    const h = dt / slices;
    for (let i = 0; i < slices; i++) {
      if (this.hitstopTimer > 0) {
        // Hitstop freeze: the world holds for a few ticks; keep the camera shake settling
        this.hitstopTimer -= h;
        this.camera.trauma = Math.max(0, this.camera.trauma - h * 2.5);
      } else {
        this.update(h);
      }
    }
    this.render();
  };

  /**
   * Main Physics & Simulation Tick (one slice of at most 1/60 s)
   */
  private update(dt: number) {
    this.gameTime += dt;
    if (this.introT < INTRO_ZOOM_SECS) {
      this.introT += dt;
      this.applyZoom();
    }
    this.input.update(dt);

    const p = this.player;
    const groundedBefore = p.grounded;
    const vyBefore = p.vy;

    // --- Moving platforms: slide on a sine path and carry whoever stands on them ---
    for (const plat of this.platforms) {
      if (plat.type !== 'moving' || plat.broken) continue;
      const nx = (plat.baseX ?? plat.x) + Math.sin(this.gameTime * (plat.moveSpeed ?? 1) + (plat.swayOffset ?? 0)) * (plat.moveRange ?? 0);
      const dx = nx - plat.x;
      plat.x = nx;
      if (p.grounded && this.standingOnId === plat.id) p.x += dx;
    }

    // --- Invincibility Timer ---
    if (p.invincibleTimer > 0) {
      p.invincibleTimer -= dt;
    }

    // --- Active Power-Up Timer & Special State Effects ---
    if (p.powerUpTimer && p.powerUpTimer > 0) {
      p.powerUpTimer -= dt;
      if (p.powerUpTimer <= 0) {
        p.activePowerUp = null;
        p.powerUpTimer = 0;
        this.addFloatingText('POWER-UP EXPIRED', p.x, p.y - 45, '#94a3b8');
      }
    }

    if (p.activePowerUp === 'invincible') {
      p.invincibleTimer = 0.5; // continuous invulnerability while active
      // Knock out enemies on contact
      for (const e of this.enemies) {
        if (e.defeated) continue;
        if (distance2D(p.x, p.y - 20, e.x, e.y) < 54) {
          e.hp = 0;
          this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.2);
          this.knockOut(e, e.x >= p.x ? 1 : -1, 'STAR K.O.! +300');
          this.spawnDebrisBurst(e.x, e.y, '#facc15');
        }
      }
    }

    // --- Combo Reset Timer ---
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // --- Vine Re-grab Cooldown & Scratch Audio Timers ---
    if (this.vineCooldownTimer > 0) {
      this.vineCooldownTimer -= dt;
      if (this.vineCooldownTimer <= 0) {
        this.lastReleasedVineId = -1;
      }
    }
    if (this.treeClimbAudioTimer > 0) {
      this.treeClimbAudioTimer -= dt;
    }

    this.respawnFlash = Math.max(0, this.respawnFlash - dt);
    this.inputGrace = Math.max(0, this.inputGrace - dt);

    // --- Camera Trauma Shake Decay ---
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.2);

    // --- Squash & Stretch Restoration ---
    p.squashX += (p.targetScaleX - p.squashX) * Math.min(1, dt * 14);
    p.squashY += (p.targetScaleY - p.squashY) * Math.min(1, dt * 14);

    // --- Dynamic Rainforest Tree Climbing & Vine Swinging Mechanics ---
    let nearTreeVine: Vine | null = null;
    let nearSwingVine: Vine | null = null;

    for (const v of this.vines) {
      // A liana we are already swinging on stays ours however far it carries us
      if (p.isVineSwinging && v.id === p.swingVineId) {
        nearSwingVine = v;
        break;
      }
      // Prevent instant magnetic re-grabbing when jumping off a vine!
      if (this.vineCooldownTimer > 0 && v.id === this.lastReleasedVineId) {
        continue;
      }

      if (v.vineType === 'tree_climb') {
        if (Math.abs(p.x - v.x) < 42 && p.y >= v.topY - 12 && p.y <= v.bottomY + 25) {
          nearTreeVine = v;
          break;
        }
      } else {
        if (Math.abs(p.x - v.x) < 48 && p.y >= v.topY - 15 && p.y <= v.bottomY + 30) {
          nearSwingVine = v;
          break;
        }
      }
    }
    this.nearTreeVine = nearTreeVine;
    this.nearSwingVine = nearSwingVine;

    // 1. TREE CLIMBING LOGIC (Vertical vines on tree trunks)
    if (nearTreeVine && (p.climbing || this.input.state.up || (!p.grounded && this.input.state.down))) {
      if (!p.climbing) {
        sound.playVineGrab();
      }
      p.climbing = true;
      p.isVineSwinging = false;
      p.grounded = false;
      p.vx = 0;
      p.vy = 0;
      p.x = nearTreeVine.x; // snap smoothly to tree trunk vine

      // Climb Up / Down
      if (this.input.state.up) {
        p.y = Math.max(nearTreeVine.topY - 4, p.y - 220 * dt);
        if (this.treeClimbAudioTimer <= 0) {
          sound.playTreeClimb();
          this.treeClimbAudioTimer = 0.18;
        }
      } else if (this.input.state.down) {
        p.y = Math.min(nearTreeVine.bottomY + 4, p.y + 220 * dt);
        if (this.treeClimbAudioTimer <= 0) {
          sound.playTreeClimb();
          this.treeClimbAudioTimer = 0.18;
        }
      }

      // Natural Exit A: Reached the Top of the Tree -> Vault onto Branch Platform!
      if (p.y <= nearTreeVine.topY + 12 && (this.input.state.up || this.input.state.jumpPressed || this.input.state.left || this.input.state.right)) {
        p.climbing = false;
        this.vineCooldownTimer = 0.35;
        this.lastReleasedVineId = nearTreeVine.id;
        this.input.state.jumpPressed = false;
        p.y = nearTreeVine.topY - 12;
        p.vy = -190;
        p.vx = (this.input.state.left ? -1 : this.input.state.right ? 1 : p.facing) * 160;
        p.grounded = true;
        p.jumpsLeft = 2;
        sound.playJump();
        this.spawnSparkBurst(p.x, p.y, '#34d399');
        this.addFloatingText('CANOPY REACHED!', p.x, p.y - 40, '#4ade80');
      }
      // Natural Exit B: Reached the Ground -> Step off smoothly!
      else if (p.y >= nearTreeVine.bottomY - 8 && this.input.state.down) {
        p.climbing = false;
        this.vineCooldownTimer = 0.30;
        this.lastReleasedVineId = nearTreeVine.id;
        p.grounded = true;
        p.vy = 0;
      }
      // Natural Exit C: Deliberate Jump off Tree Trunk!
      else if (this.input.state.jumpPressed) {
        p.climbing = false;
        this.input.state.jumpPressed = false;
        this.vineCooldownTimer = 0.42; // Prevent immediate re-grab!
        this.lastReleasedVineId = nearTreeVine.id;

        const jumpDir = this.input.state.left ? -1 : this.input.state.right ? 1 : p.facing;
        p.facing = jumpDir as 1 | -1;
        p.vx = jumpDir * 330;
        p.vy = -PHYS.treeLeapV;
        this.launched = true;
        p.jumpsLeft = 2; // Gives double-jump in air for full player control!
        p.isDoubleJumping = false;
        p.somersaultAngle = 0;
        p.squashX = 0.8;
        p.squashY = 1.3;

        sound.playJump();
        this.spawnSparkBurst(p.x, p.y, '#34d399');
        this.addFloatingText('TREE LEAP!', p.x, p.y - 45, '#4ade80');
      }
      // Natural Exit D: Steer away with Left / Right -> Natural graceful hop off trunk!
      else if (this.input.state.left || this.input.state.right) {
        const steerDir = this.input.state.left ? -1 : 1;
        p.climbing = false;
        this.vineCooldownTimer = 0.35;
        this.lastReleasedVineId = nearTreeVine.id;
        p.facing = steerDir;
        p.vx = steerDir * 240;
        p.vy = -PHYS.treeHopV;
        this.launched = true;
        p.jumpsLeft = 2;
        sound.playJump();
      }
    } else {
      if (p.climbing && !nearTreeVine) {
        p.climbing = false;
      }

      // 2. SWINGING LIANA LOGIC (Chasms & ravines)
      if (
        nearSwingVine &&
        !p.isVineSwinging &&
        !p.grounded &&
        (this.input.state.up || Math.abs(p.vx) > 25 || this.input.state.left || this.input.state.right) &&
        (this.vineCooldownTimer <= 0 || nearSwingVine.id !== this.lastReleasedVineId)
      ) {
        p.isVineSwinging = true;
        p.climbing = false;
        p.swingVineId = nearSwingVine.id;
        {
          const sw = swingGrab({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }, nearSwingVine);
          p.swingLength = sw.len;
          p.swingAngle = sw.angle;
          p.swingAngularVelocity = sw.omega;
        }
        p.jumpsLeft = 2;
        p.isDoubleJumping = false;
        p.somersaultAngle = 0;
        sound.playVineGrab();
      }

      if (p.isVineSwinging && nearSwingVine) {
        p.grounded = false;
        p.somersaultAngle = 0;
        p.jumpsLeft = 2;

        {
          const sw = { angle: p.swingAngle || 0, omega: p.swingAngularVelocity || 0, len: p.swingLength || 100 };
          if (this.input.state.right) p.facing = 1;
          if (this.input.state.left) p.facing = -1;
          const steer = (this.input.state.right ? 1 : 0) - (this.input.state.left ? 1 : 0);
          const climb = this.input.state.up ? -1 : this.input.state.down ? 1 : 0;
          const r = swingStep(sw, nearSwingVine, dt, steer as -1 | 0 | 1, climb as -1 | 0 | 1);
          p.swingAngle = sw.angle;
          p.swingAngularVelocity = sw.omega;
          p.swingLength = sw.len;
          p.x = r.x;
          p.y = r.y;
          p.vx = r.vx;
          p.vy = r.vy;
          nearSwingVine.swingAngle = sw.angle;
          nearSwingVine.isSwingingVine = true;
        }

        // --- NATURAL SWING EXIT 1: DROP / LET GO (Holding Down + Jump, or Down at low speed) ---
        if (this.input.state.down && this.input.state.jumpPressed) {
          p.isVineSwinging = false;
          nearSwingVine.isSwingingVine = false;
          this.input.state.jumpPressed = false;
          this.vineCooldownTimer = 0.45; // Prevent re-grab!
          this.lastReleasedVineId = nearSwingVine.id;

          const dropDir = this.input.state.left ? -1 : this.input.state.right ? 1 : p.facing;
          p.facing = dropDir as 1 | -1;
          p.vx = dropDir * 140;
          p.vy = 80;
          p.jumpsLeft = 2;
          this.addFloatingText('DROP', p.x, p.y - 30, '#94a3b8');
        }
        // --- NATURAL SWING EXIT 2: HEROIC TARZAN LEAP (Jump button Pressed) ---
        else if (this.input.state.jumpPressed) {
          p.isVineSwinging = false;
          nearSwingVine.isSwingingVine = false;
          this.input.state.jumpPressed = false;
          this.vineCooldownTimer = 0.50; // Guaranteed window to fly free from the vine!
          this.lastReleasedVineId = nearSwingVine.id;

          // Prioritize active player steer direction, then physical swing momentum
          const releaseDir = this.input.state.right
            ? 1
            : this.input.state.left
            ? -1
            : (Math.sin(p.swingAngle) > 0.05 ? 1 : Math.sin(p.swingAngle) < -0.05 ? -1 : p.facing);

          p.facing = releaseDir as 1 | -1;
          // Forward boost + heroic upward arc (capped so a big swing cannot rocket you off the map)
          {
            const l = tarzanLaunch(p.vx, p.vy, releaseDir as 1 | -1);
            p.vx = l.vx;
            p.vy = l.vy;
            this.launched = true;
          }
          p.jumpsLeft = 2; // Full air control - player can double jump mid-air!
          p.isDoubleJumping = false;
          p.somersaultAngle = 0;
          p.squashX = 0.72;
          p.squashY = 1.38;

          sound.playJump();
          this.spawnSparkBurst(p.x, p.y, '#34d399');
          this.addFloatingText('TARZAN LEAP!', p.x, p.y - 45, '#34d399');
        }
        // --- NATURAL SWING EXIT 3: AUTOMATIC PLATFORM LANDING ---
        else {
          for (const plat of this.platforms) {
            if (p.x >= plat.x - 10 && p.x <= plat.x + plat.width + 10) {
              if (Math.abs(p.y - plat.y) < 14 && p.vy >= 0) {
                p.isVineSwinging = false;
                nearSwingVine.isSwingingVine = false;
                p.grounded = true;
                p.y = plat.y;
                p.vy = 0;
                this.vineCooldownTimer = 0.40;
                this.lastReleasedVineId = nearSwingVine.id;
                this.spawnJumpDust(p.x, p.y);
                break;
              }
            }
          }
        }
      } else {
        if (p.isVineSwinging) {
          p.isVineSwinging = false;
        }

        // --- Standard Ground / Aerial Movement ---
        if (this.input.state.down && p.grounded) {
          p.ducking = true;
          if (Math.abs(p.vx) <= PHYS.groundDec * dt) p.vx = 0;
          else p.vx -= Math.sign(p.vx) * PHYS.groundDec * dt;
        } else {
          p.ducking = false;

          const speedMult = (p.activePowerUp === 'speed' ? 1.4 : 1.0) * (this.slowTimer > 0 ? 0.45 : 1);
          const maxSpeed = PHYS.maxRun * speedMult * this.attackMoveMul();
          const dir = this.inputGrace > 0 ? 0 : this.input.state.left ? -1 : this.input.state.right ? 1 : 0;
          if (dir !== 0) {
            if (!this.facingLocked()) p.facing = dir as 1 | -1;
            const turning = p.grounded && Math.sign(p.vx) === -dir && Math.abs(p.vx) > 20;
            const acc = (p.grounded ? PHYS.groundAcc : PHYS.airAcc) * speedMult + (turning ? PHYS.turnBonus : 0);
            if (dir * p.vx < maxSpeed) {
              p.vx += dir * acc * dt;
              if (dir * p.vx > maxSpeed) p.vx = dir * maxSpeed;
            } else {
              // launched faster than run speed (vine release, bounce): bleed off gently
              p.vx -= dir * (this.atk && p.grounded ? PHYS.groundDec : PHYS.airDec) * dt;
            }
          } else {
            const dec = p.grounded ? PHYS.groundDec : PHYS.airDec;
            if (Math.abs(p.vx) <= dec * dt) p.vx = 0;
            else p.vx -= Math.sign(p.vx) * dec * dt;
          }
        }

        if (p.grounded) {
          this.coyoteTimer = PHYS.coyote;
        } else {
          this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        }

        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer -= dt;
        }

        if (this.input.state.jumpPressed) {
          if (p.grounded || this.coyoteTimer > 0) {
            p.vy = -PHYS.jumpV;
            p.grounded = false;
            p.jumpsLeft = 1;
            p.isDoubleJumping = false;
            p.somersaultAngle = 0;
            this.coyoteTimer = 0;
            this.jumpBufferTimer = 0;
            this.input.state.jumpPressed = false;
            p.squashX = 0.82;
            p.squashY = 1.28;
            sound.playJump();
            this.spawnJumpDust(p.x, p.y);
          } else if (p.jumpsLeft > 0 && !p.climbing) {
            p.vy = -PHYS.doubleV;
            p.jumpsLeft = 0;
            p.isDoubleJumping = true;
            p.somersaultAngle = 0;
            this.jumpBufferTimer = 0;
            this.input.state.jumpPressed = false;
            p.squashX = 0.80;
            p.squashY = 1.32;
            sound.playDoubleJump();
            this.addFloatingText('DOUBLE JUMP!', p.x, p.y - 40, '#4ade80');
            this.spawnDoubleJumpBurst(p.x, p.y);
          } else {
            this.jumpBufferTimer = PHYS.buffer;
            this.input.state.jumpPressed = false;
          }
        }

        if (p.isDoubleJumping) {
          p.somersaultAngle += p.facing * dt * 14;
        }

        // Variable jump height: releasing early cuts the ascent (tap = hop, hold = full)
        if (p.vy >= 0) this.launched = false;
        if (!this.input.state.jumpHeld && p.vy < -PHYS.cutV && !this.launched) {
          p.vy = -PHYS.cutV;
        }

        // Gravity: lighter going up, heavier coming down, a touch of hang at the apex
        let gravity = p.vy < 0 ? PHYS.gravUp : PHYS.gravDown;
        if (Math.abs(p.vy) < 90 && this.input.state.jumpHeld) gravity *= 0.72;
        p.vy += gravity * dt;
        if (p.vy > PHYS.maxFall) p.vy = PHYS.maxFall;

        p.x += p.vx * dt;
        p.y += p.vy * dt;
      }
    }

      // Walk cycle animation
      if (p.grounded && Math.abs(p.vx) > 10) {
        p.walkCycle += Math.abs(p.vx) * dt * 0.08;
      }

      // Clamp horizontal level bounds (safely stops player right at the victory shrine altar)
      const maxX = this.currentStage.exitTotemX > 0 && this.currentStage.config.objectiveType !== 'ascent'
        ? this.currentStage.exitTotemX + 35
        : this.currentStage.config.levelWidth - 20;
      p.x = Math.max(20, Math.min(maxX, p.x));

      // --- Solid ground blocks: walls you cannot walk through (Mario-style) ---
      if (!p.climbing && !p.isVineSwinging) {
        const half = 19;
        const prevX = p.x - p.vx * dt;
        for (const plat of this.platforms) {
          if (plat.broken || plat.type !== 'solid' || plat.height < 50) continue;
          if (p.y <= plat.y + 6) continue; // standing on, or above, the top
          if (p.x + half <= plat.x || p.x - half >= plat.x + plat.width) continue;
          const fromLeft = prevX + half <= plat.x + 2;
          const fromRight = prevX - half >= plat.x + plat.width - 2;
          if (!fromLeft && !fromRight) continue;
          if (p.y <= plat.y + 26 && p.vy >= -120) {
            // caught the lip of the ledge: hoist up onto it
            p.y = plat.y;
            p.vy = 0;
            continue;
          }
          p.x = fromLeft ? plat.x - half : plat.x + plat.width + half;
          if (fromLeft && p.vx > 0) p.vx = 0;
          if (fromRight && p.vx < 0) p.vx = 0;
        }
      }

      // Mushrooms spring you up when you run into them, not only when you land on them
      if (!p.climbing && !p.isVineSwinging) {
        for (const plat of this.platforms) {
          if (plat.type !== 'bouncy' || plat.broken) continue;
          if (p.x + 12 > plat.x && p.x - 12 < plat.x + plat.width && p.y > plat.y && p.y <= plat.y + plat.height + 8 && p.vy >= -100) {
            p.y = plat.y;
            this.bounceOff();
            break;
          }
        }
      }

      // --- Platform Collisions (with generous edge forgiveness) ---
      p.grounded = false;
      this.standingOnId = -1;
      const playerFeet = p.y;
      const playerPrevFeet = p.y - p.vy * dt;

      for (const plat of this.platforms) {
        if (plat.broken) continue;

        // Check if player is horizontally within platform (generous width tolerance)
        if (p.x + p.width * 0.48 > plat.x && p.x - p.width * 0.48 < plat.x + plat.width) {
          // Check landing from above
          if (p.vy >= 0 && playerPrevFeet <= plat.y + 14 && playerFeet >= plat.y) {
            p.y = plat.y;
            p.vy = 0;
            p.grounded = true;
            this.standingOnId = plat.id;
            p.jumpsLeft = 2; // Restore double jump capability on landing
            p.isDoubleJumping = false;
            p.somersaultAngle = 0;

            // Jump Buffering: If jump was tapped just before landing, instantly jump!
            if (this.jumpBufferTimer > 0) {
              this.jumpBufferTimer = 0;
              p.vy = -PHYS.jumpV;
              p.grounded = false;
              p.jumpsLeft = 1;
              p.squashX = 0.82;
              p.squashY = 1.28;
              sound.playJump();
              this.spawnJumpDust(p.x, p.y);
              break;
            }

            // Squash on landing
            if (p.squashY > 0.9) {
              p.squashX = 1.18;
              p.squashY = 0.82;
            }

            // Bouncy mushroom interaction
            if (plat.type === 'bouncy') this.bounceOff();

            // Fragile branch interaction
            if (plat.type === 'fragile') {
              if (plat.fragileTimer === undefined) {
                plat.fragileTimer = 1.1; // generous 1.1s before breaking
              }
            }
            break;
          }
        }
      }

      // Pits and water: falling below the surface costs a life (Mario-style)
      const waterY = this.currentStage.waterY;
      if (waterY !== undefined && p.y > waterY + 20 && !this.isGameOver) {
        this.spawnWaterSplash(p.x, waterY);
        sound.playHitImpact(true);
        this.addFloatingText('SPLASH!', p.x, waterY - 40, '#7dd3fc');
        this.loseLife('water');
      } else if (p.y > this.currentStage.config.levelHeight + 120 && !this.isGameOver) {
        this.loseLife('pit');
      }

      // Checkpoints
      for (const cp of this.currentStage.checkpoints ?? []) {
        if (!cp.reached && Math.abs(p.x - cp.x) < 70 && p.y > cp.y - 150 && p.y < cp.y + 40) {
          cp.reached = true;
          this.checkpoint = { x: cp.x, y: cp.y };
          this.addFloatingText('CHECKPOINT!', cp.x, cp.y - 90, '#fde047');
          this.spawnSparkBurst(cp.x, cp.y - 40, '#fde047');
          sound.playCheckpoint();
        }
      }

    // --- Fragile Platform Decay ---
    for (const plat of this.platforms) {
      if (plat.type === 'fragile' && plat.fragileTimer !== undefined && plat.fragileTimer > 0) {
        plat.fragileTimer -= dt;
        if (plat.fragileTimer <= 0) {
          plat.broken = true;
          this.spawnDebrisBurst(plat.x + plat.width * 0.5, plat.y, '#a16207');
          sound.playHitImpact(true);
        }
      }
    }

    // --- Attacks: wind-up, strike, follow-through (see fight.ts) ---
    this.updateAttack(dt);
    this.resolveStomps(dt);

    // --- Enemy Behavior & AI ---
    for (const e of this.enemies) {
      if (e.defeated) {
        this.updateKo(e, dt);
        continue;
      }

      if (e.hitFlashTimer > 0) e.hitFlashTimer -= dt;
      // a hit animal flinches, slides back and may stand dazed (no moves, no damage) for a moment
      if (this.reactToHits(e, dt)) continue;

      // Distinct enemy movement & attack policies:
      if (e.type === 'snake') {
        // Snake patrols branch, lunges when Sloth is near
        e.x += e.vx * dt;
        if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
          e.vx = -e.vx;
          e.facing = e.vx > 0 ? 1 : -1;
        }

        const distToPlayer = distance2D(e.x, e.y, p.x, p.y);
        if (distToPlayer < 120 && Math.abs(e.y - p.y) < 30) {
          e.telegraphTimer = 0.4;
          e.isAttacking = true;
        } else {
          e.isAttacking = false;
          e.telegraphTimer = 0;
        }

        // Contact damage with player
        if (!isObjectiveComplete(this.currentStage.config.objectiveType, 0, 0, false, false)) {
          if (checkAABBCollision(...this.pBox(), e.x - 18, e.y - 12, 36, 22)) {
            this.damagePlayer(1);
          }
        }
      } else if (e.type === 'eagle') {
        // Harpy Eagle aerial trajectory & swoop attack cycle (fair, telegraphed, and easy to hit!)
        e.behaviorTimer += dt;
        if (!e.swoopPhase) e.swoopPhase = 'patrol';

        if (e.swoopPhase === 'patrol') {
          // Aerial patrol
          e.x += e.vx * dt;
          if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
            e.vx = -e.vx;
            e.facing = e.vx > 0 ? 1 : -1;
          }

          // Spot player and initiate telegraphed swoop warning
          if (Math.abs(e.x - p.x) < 260) {
            e.swoopPhase = 'telegraph';
            e.telegraphTimer = 0.8; // 0.8s clear visual/sound telegraph!
            sound.playEagleScreech();
            this.addFloatingText('!', e.x, e.y - 30, '#f59e0b');
          }
        } else if (e.swoopPhase === 'telegraph') {
          // Warning windup: eagle slows and flares wings
          e.telegraphTimer -= dt;
          e.facing = p.x > e.x ? 1 : -1;
          if (e.telegraphTimer <= 0) {
            e.swoopPhase = 'swoop';
            e.isAttacking = true;
          }
        } else if (e.swoopPhase === 'swoop') {
          // Swoop down at gentle readable speed (165 px/s)
          const diveSpeed = 165;
          const targetY = Math.min((e.homeY ?? 310) + 190, p.y - 10);
          const dx = p.x - e.x;
          const dy = targetY - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist > 15) {
            e.x += (dx / dist) * diveSpeed * dt;
            e.y += (dy / dist) * diveSpeed * dt;
          }

          // Check collision with player
          if (checkAABBCollision(...this.pBox(), e.x - 24, e.y - 18, 48, 36)) {
            if (p.ducking) {
              // Successfully ducked under swoop!
              this.addFloatingText('DUCKED! SLICK!', p.x, p.y - 40, '#86efac');
              sound.playWhoosh();
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.4;
              e.isAttacking = false;
            } else {
              this.damagePlayer(1);
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.0;
              e.isAttacking = false;
            }
          }

          // Reached swoop low point: enter vulnerable low hover glide!
          if (e.y >= targetY - 15 || dist <= 20) {
            e.swoopPhase = 'hover';
            e.hoverTimer = 1.4; // 1.4s of vulnerable low glide!
            e.isAttacking = false;
            this.addFloatingText('VULNERABLE!', e.x, e.y - 25, '#fde047');
          }
        } else if (e.swoopPhase === 'hover') {
          // VULNERABLE LOW HOVER / GLIDE: Easy to hit!
          e.hoverTimer = (e.hoverTimer ?? 1.4) - dt;
          e.x += e.facing * 50 * dt;
          e.y += Math.sin(this.gameTime * 5) * 8 * dt;

          if (e.hoverTimer <= 0) {
            e.swoopPhase = 'ascend';
          }
        } else if (e.swoopPhase === 'ascend') {
          // Gently ascend back to sky patrol
          e.y -= 110 * dt;
          e.x += e.facing * 40 * dt;
          if (e.y <= (e.homeY ?? 310)) {
            e.y = e.homeY ?? 310;
            e.swoopPhase = 'patrol';
            e.attackCooldown = 4.0;
          }
        }
      } else if (isPredator(e.type)) {
        // Ground predators (ocelot, jaguar, boa, caiman, tayra): telegraph -> committed attack -> vulnerable recovery
        const step = stepPredator(e, { x: p.x, y: p.y }, dt);
        if (step.ev.telegraph) {
          sound.playPredator(e.type, 0);
          this.addFloatingText('!', e.x, e.y - (e.type === 'boa' ? 46 : 34), '#f97316');
        }
        if (step.ev.launch) sound.playPredator(e.type, 1);
        if (step.ev.impact) {
          sound.playPredator(e.type, 2);
          if (e.type === 'jaguar' || e.type === 'caiman') {
            this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.22);
          }
          if (e.type === 'jaguar' || e.type === 'tayra') this.spawnDebrisBurst(e.x, e.y + 22, '#a16207');
        }
        if (this.debugBoxes) this.dbgHurt.push(...step.hurt);
        for (const h of step.hurt) {
          if (checkAABBCollision(...this.pBox(), h.x, h.y, h.w, h.h)) {
            this.damagePlayer(1);
            break;
          }
        }
      } else if (e.type === 'spider') {
        // a spiderling scuttles straight at Slomatt
        e.animTimer += dt;
        const dir = p.x < e.x ? -1 : 1;
        e.facing = dir;
        e.x = Math.max(e.patrolMinX, Math.min(e.patrolMaxX, e.x + dir * 80 * dt));
        if (checkAABBCollision(...this.pBox(), e.x - 16, e.y - 10, 32, 20)) this.damagePlayer(1);
      } else if (e.type === 'frog') {
        // Poison frog hopping
        e.animTimer += dt;
        if (checkAABBCollision(...this.pBox(), e.x - 12, e.y - 10, 24, 20)) {
          this.damagePlayer(1);
        }
      }
    }

    // --- Boss fight ---
    if (this.boss && this.bossDef && !this.boss.defeated) this.updateBoss(dt);
    if (this.clangCd > 0) this.clangCd -= dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;

    // --- Collectibles Magnet Attraction (when Nectar Magnet power-up is active) ---
    if (p.activePowerUp === 'magnet') {
      for (const c of this.collectibles) {
        if (c.collected || c.type === 'cage' || c.type === 'exit_totem' || c.type === 'thorn_gate') continue;
        const dist = distance2D(p.x, p.y - 20, c.x, c.y);
        if (dist < 260 && dist > 10) {
          const pullSpeed = 460 * dt;
          c.x += ((p.x - c.x) / dist) * pullSpeed;
          c.y += ((p.y - 20 - c.y) / dist) * pullSpeed;
        }
      }
    }

    // --- Collectibles Pickup & Objectives ---
    for (const c of this.collectibles) {
      if (c.collected) continue;

      if (c.type === 'cage') {
        // Cage is freed when punched (handled in executePunchHitbox)
        continue;
      }

      if (c.type === 'exit_totem') {
        // Handled below after objective quota check to guarantee quota locking
        continue;
      }

      if (c.type === 'thorn_gate') {
        // the hidden gate: stepping into it leaves this stage for Thornbark's Hollow
        if (distance2D(p.x, p.y - 20, c.x, c.y) < 46 && !this.isGameOver) {
          c.collected = true;
          this.isGameOver = true;
          this.camera.trauma = 0.7;
          this.spawnSparkBurst(c.x, c.y, '#a78bfa');
          this.addFloatingText('THE THORN GATE OPENS...', c.x, c.y - 30, '#c4b5fd');
          sound.playBossRoar(this.currentStage.config.worldIndex);
          this.callbacks.onSecret?.();
        }
        continue;
      }

      const dist = distance2D(p.x, p.y - 20, c.x, c.y);
      if (dist < 34) {
        c.collected = true;

        if (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit') {
          p.fruitsCollected++;
          this.comboCount++;
          this.comboResetTimer = 2.5;
          this.runScore += 100;

          if (c.type === 'flower') {
            sound.playFlowerPickup(this.comboCount);
          } else {
            sound.playLeafPickup();
          }

          const pColor = c.type === 'flower' ? '#f43f5e' : '#4ade80';
          this.spawnSparkBurst(c.x, c.y, pColor);
          const txt = c.botanicalVariant === 'orchid' ? '+100 ORCHID!'
            : c.botanicalVariant === 'monstera' ? '+100 MONSTERA!'
            : c.botanicalVariant === 'hibiscus' ? '+100 HIBISCUS!'
            : c.botanicalVariant === 'fern' ? '+100 FERN!'
            : '+100 FLORA!';
          this.addFloatingText(txt, c.x, c.y - 20, pColor);

          if (this.comboCount > 1) {
            const comboBonus = this.comboCount * 50;
            this.runScore += comboBonus;
            this.addFloatingText(`${this.comboCount}x COMBO! +${comboBonus}`, c.x, c.y - 42, '#facc15');
          }
        } else if (c.type === 'relic') {
          p.relicsFound++;
          this.runScore += 500;
          sound.playRelicFound();
          this.spawnSparkBurst(c.x, c.y, '#38bdf8');
          this.addFloatingText('JUNGLE IDOL! +500', c.x, c.y - 30, '#38bdf8');
        } else if (c.type === 'heart') {
          p.hp = Math.min(p.maxHp, p.hp + 1);
          sound.playHeartPickup();
          this.spawnSparkBurst(c.x, c.y, '#f43f5e');
          this.addFloatingText('+1 HP RESTORED', c.x, c.y - 20, '#f43f5e');
        } else if (c.type === 'super_heart') {
          p.hp = p.maxHp;
          p.invincibleTimer = 3.5;
          sound.playSuperHeart();
          this.spawnSparkBurst(c.x, c.y, '#facc15');
          this.addFloatingText('MAX HP RESTORED + SHIELD!', c.x, c.y - 30, '#facc15');
        } else if (c.type === 'powerup_speed') {
          p.activePowerUp = 'speed';
          p.powerUpTimer = 10.0;
          p.maxPowerUpTimer = 10.0;
          sound.playPowerUp('speed');
          this.spawnSparkBurst(c.x, c.y, '#34d399');
          this.addFloatingText('⚡ CHEETAH SPEED (10s)!', c.x, c.y - 35, '#34d399');
        } else if (c.type === 'powerup_invincible') {
          p.activePowerUp = 'invincible';
          p.powerUpTimer = 8.0;
          p.maxPowerUpTimer = 8.0;
          sound.playPowerUp('invincible');
          this.spawnSparkBurst(c.x, c.y, '#facc15');
          this.addFloatingText('⭐ SOLAR INVINCIBLE (8s)!', c.x, c.y - 35, '#facc15');
        } else if (c.type === 'powerup_magnet') {
          p.activePowerUp = 'magnet';
          p.powerUpTimer = 12.0;
          p.maxPowerUpTimer = 12.0;
          sound.playPowerUp('magnet');
          this.spawnSparkBurst(c.x, c.y, '#38bdf8');
          this.addFloatingText('🧲 NECTAR MAGNET (12s)!', c.x, c.y - 35, '#38bdf8');
        }
      }
    }

    // --- Check Objective Completion ---
    let currentProgress = 0;
    const objType = this.currentStage.config.objectiveType;

    switch (objType) {
      case 'harvest':
        currentProgress = p.fruitsCollected;
        break;
      case 'purge':
        currentProgress = p.enemiesDefeated;
        break;
      case 'relic_hunt':
        currentProgress = p.relicsFound;
        break;
      case 'rescue':
        currentProgress = p.crittersRescued;
        break;
      case 'gauntlet':
        currentProgress = p.enemiesDefeated;
        break;
      default:
        currentProgress = this.exitTotemReached ? 1 : 0;
    }

    const isQuotaType =
      objType === 'harvest' ||
      objType === 'purge' ||
      objType === 'relic_hunt' ||
      objType === 'rescue' ||
      objType === 'gauntlet';

    const quotaMet = currentProgress >= this.currentStage.config.targetCount;
    const isExitUnlocked = !isQuotaType || quotaMet;

    // Trigger celebration announcement once quota is fulfilled!
    if (isQuotaType && quotaMet && !this.wasQuotaMet) {
      this.wasQuotaMet = true;
      sound.playShrineUnlocked();
      this.spawnSparkBurst(p.x, p.y - 40, '#facc15');
      this.addFloatingText('✨ SHRINE UNSEALED! ENTER TO CLEAR! ✨', p.x, p.y - 65, '#facc15');
      this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.25);
    }

    // Update Exit Totem locked visual in collectibles list
    const exitItem = this.collectibles.find((c) => c.type === 'exit_totem');
    if (exitItem) {
      exitItem.isLocked = !isExitUnlocked;
    }

    // Interactive Exit Totem / Sacred Portal Encounter
    if (!this.exitTotemReached && this.currentStage.exitTotemX > 0) {
      if (p.x >= this.currentStage.exitTotemX - 25) {
        if (isExitUnlocked) {
          this.exitTotemReached = true;
          sound.playVictory();
          this.spawnSparkBurst(this.currentStage.exitTotemX, p.y - 30, '#34d399');
          this.addFloatingText('SANCTUARY UNLOCKED! VICTORY!', p.x, p.y - 60, '#34d399');
        } else {
          // Push player back gently from sealed barrier and show clear reminder
          p.x = this.currentStage.exitTotemX - 35;
          p.vx = -140;
          const remaining = this.currentStage.config.targetCount - currentProgress;
          const msg =
            objType === 'harvest'
              ? `🔒 Need ${remaining} more Flora!`
              : objType === 'purge'
              ? `🔒 Defeat ${remaining} more Beasts!`
              : objType === 'rescue'
              ? `🔒 Free ${remaining} more Critters!`
              : objType === 'relic_hunt'
              ? `🔒 Find ${remaining} more Idols!`
              : `🔒 Complete Mission Quota!`;
          this.addFloatingText(msg, this.currentStage.exitTotemX - 40, p.y - 45, '#f87171');
        }
      }
    }

    const bossDefeated = this.boss ? this.boss.defeated : false;
    const isWin = isObjectiveComplete(
      objType,
      currentProgress,
      this.currentStage.config.targetCount,
      this.exitTotemReached,
      bossDefeated
    );

    if (isWin && !this.isGameOver) {
      this.isGameOver = true;
      const stars = calculateLevelStars(
        this.gameTime,
        this.currentStage.config.timeLimit,
        p.hp / p.maxHp,
        currentProgress / Math.max(1, this.currentStage.config.targetCount)
      );

      this.callbacks.onVictory(stars, Math.round(this.gameTime), this.runScore);
    }

    // --- Particle System Update ---
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 300 * dt; // gravity
    }

    // --- Floating Texts Update ---
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }
      ft.y -= 35 * dt;
    }

    // --- Camera Tracking ---
    this.bossFrame(dt);
    this.updateCamera(dt);

    // Calculate progress ratio across the level
    const totalDist = Math.max(1, (this.currentStage.exitTotemX || this.currentStage.config.levelWidth) - 140);
    const distTraveled = Math.max(0, p.x - 140);
    const distanceRatio = Math.min(1.0, distTraveled / totalDist);

    // Notify HUD
    this.callbacks.onProgressUpdate(
      currentProgress,
      this.currentStage.config.targetCount,
      this.runScore,
      p.hp,
      distanceRatio,
      p.activePowerUp,
      p.powerUpTimer
    );

    this.updateSound(dt, groundedBefore, vyBefore, distanceRatio);
  }

  /** landings, footsteps and the music's intensity (calm while exploring, fuller near danger) */
  private soundTimer = 0;
  private stepDist = 0;
  private updateSound(dt: number, groundedBefore: boolean, vyBefore: number, progress: number) {
    const p = this.player;
    if (p.grounded && !groundedBefore && vyBefore > 140 && !p.climbing && !p.isVineSwinging) {
      sound.playLand(Math.min(1, vyBefore / 700));
    }
    // footsteps: one leaf-crunch every few body-lengths on the ground
    if (p.grounded && !p.climbing && Math.abs(p.vx) > 25) {
      this.stepDist += Math.abs(p.vx) * dt;
      if (this.stepDist > 52) {
        this.stepDist = 0;
        sound.playStep();
      }
    } else if (!p.grounded) {
      this.stepDist = 26;
    }

    this.soundTimer -= dt;
    if (this.soundTimer > 0) return;
    this.soundTimer = 0.25;
    let v = 0.3 + 0.25 * progress;
    let near = 9999;
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const d = Math.hypot(e.x - p.x, (e.y - p.y) * 0.6);
      if (d < near) near = d;
    }
    if (near < 460) v += 0.32 * (1 - near / 460);
    if (this.boss && !this.boss.defeated) {
      const b = this.boss;
      v = 0.55 + 0.4 * (1 - Math.max(0, b.hp) / Math.max(1, b.maxHp)) + (b.telegraphTimer > 0 ? 0.08 : 0);
    }
    if (p.activePowerUp === 'invincible' || p.activePowerUp === 'speed') v = Math.max(v, 0.95);
    sound.setIntensity(Math.min(1, v));
    sound.setLowHealth(this.lives <= 1 && p.hp <= 1);
  }

  // ===========================================================================================
  // The boss fight (rules live in bossAI.ts and bossDefs.ts; this is the part that touches the world)
  // ===========================================================================================

  /** what the boss may ask of the world this tick */
  private bossContext(): BossCtx {
    const p = this.player;
    const arena = this.currentStage.arena ?? { left: 0, right: this.currentStage.config.levelWidth, floor: 560 };
    if (!this.bossCtx) {
      const world = this.currentStage.config.worldIndex;
      this.bossCtx = {
        px: p.x,
        py: p.y,
        pGrounded: p.grounded,
        pDucking: p.ducking,
        arena,
        rnd: Math.random,
        hazards: this.hazards,
        minionsAlive: 0,
        spawnMinion: (kind, x, y) => this.spawnMinion(kind, x, y),
        shake: (a) => {
          this.camera.trauma = Math.min(1, Math.max(this.camera.trauma, a));
        },
        roar: () => sound.playBossRoar(world),
        thud: (heavy) => sound.playHitImpact(heavy ?? true, bossMaterial(world)),
        debris: (x, y, color) => this.spawnDebrisBurst(x, y, color),
        text: (msg, x, y, color) => this.addFloatingText(msg, x, y, color),
      };
    }
    const c = this.bossCtx;
    c.px = p.x;
    c.py = p.y;
    c.pGrounded = p.grounded;
    c.pDucking = p.ducking;
    c.arena = arena;
    let alive = 0;
    for (const e of this.enemies) if (e.id >= 9000 && !e.defeated) alive++;
    c.minionsAlive = alive;
    return c;
  }

  /** a summoned animal joins the fight */
  private spawnMinion(kind: 'spider' | 'snake' | 'ocelot' | 'frog' | 'eagle' | 'tayra', x: number, y: number) {
    const arena = this.currentStage.arena;
    if (!arena) return;
    const f = arena.floor;
    const id = 9000 + this.minionSeq++;
    const mk = (w: number, h: number, hp: number, oy: number, vx: number): Enemy => ({
      id, type: kind, x, y: f - oy, vx, vy: 0, width: w, height: h, hp, maxHp: hp, facing: vx >= 0 ? 1 : -1,
      patrolMinX: arena.left + 30, patrolMaxX: arena.right - 30, attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    });
    let e: Enemy;
    if (kind === 'ocelot') e = mk(48, 28, 2, 18, x < (arena.left + arena.right) / 2 ? 55 : -55);
    else if (kind === 'tayra') e = mk(46, 26, 1, 15, 70);
    else if (kind === 'spider') {
      e = mk(34, 22, 1, 12, 0);
      (e as unknown as { noThread: boolean }).noThread = true;
    } else e = mk(38, 22, 1, 14, 30);
    e.x = Math.max(arena.left + 30, Math.min(arena.right - 30, x));
    this.enemies.push(e);
    this.spawnDebrisBurst(e.x, f - 10, '#e5e7eb');
  }

  private updateBoss(dt: number) {
    const b = this.boss!;
    const def = this.bossDef!;
    const br = b.ai;
    if (!br) return;
    const p = this.player;
    const c = this.bossContext();
    const world = this.currentStage.config.worldIndex;
    if (b.hitFlashTimer > 0) b.hitFlashTimer -= dt;
    b.behaviorTimer += dt;

    if (!this.bossIntro) {
      this.bossIntro = true;
      sound.playBossRoar(world);
      this.camera.trauma = Math.max(this.camera.trauma, 0.5);
    }

    if (br.state === 'dying') {
      this.stepBossDeath(b, def, dt);
      return;
    }

    const prevPhase = b.phase;
    const prevState = br.state;
    stepBoss(b, def, c, dt);

    if (b.phase !== prevPhase) {
      if (b.phase === 3) {
        sound.setTempo(1.08);
        this.addFloatingText('PHASE 3: ENRAGED!', b.x, b.y - b.height, '#ef4444');
      } else {
        sound.setTempo(1.04);
        this.addFloatingText('PHASE 2: SPEED UP!', b.x, b.y - b.height, '#f97316');
      }
    }
    if (br.state === 'tell' && prevState !== 'tell') sound.playPredator('jaguar', 0);
    if (br.state === 'act' && prevState !== 'act') sound.playWhoosh();
    if (br.state === 'stun' && prevState !== 'stun') this.hitstopTimer = Math.max(this.hitstopTimer, 0.08);

    stepHazards(this.hazards, c.arena, dt, {
      land: (x, y, heavy, color) => {
        this.camera.trauma = Math.min(1, Math.max(this.camera.trauma, heavy ? 0.4 : 0.2));
        sound.playHitImpact(heavy, bossMaterial(world));
        this.spawnDebrisBurst(x, y - 6, color);
      },
    });

    // ---- what hurts Slomatt ----
    const boxes: Rect[] = [];
    if (bodyHurts(b)) boxes.push({ x: b.x - b.width / 2, y: b.y - b.height / 2, w: b.width, h: b.height });
    for (const r of br.hurt) boxes.push(r);
    const hz: Array<{ r: Rect; h: BossHazard }> = [];
    for (const h of this.hazards) {
      const r = hazardBox(h);
      if (r) hz.push({ r, h });
    }
    if (this.debugBoxes) {
      for (const r of boxes) this.dbgHurt.push(r);
      for (const z of hz) this.dbgHurt.push(z.r);
    }
    const pb = this.pBox();
    for (const r of boxes) {
      if (checkAABBCollision(...pb, r.x, r.y, r.w, r.h)) {
        this.damagePlayer(1);
        break;
      }
    }
    for (const { r, h } of hz) {
      if (!checkAABBCollision(...pb, r.x, r.y, r.w, r.h)) continue;
      if (h.eff === 'slow') {
        if (this.slowTimer <= 0) this.addFloatingText('STUCK!', p.x, p.y - 50, '#e2e8f0');
        this.slowTimer = Math.max(this.slowTimer, h.kind === 'puddle' ? 0.4 : 2.5);
        if (h.kind !== 'puddle') h.spent = true;
      }
      if (h.dmg > 0 && p.invincibleTimer <= 0 && this.stompGrace <= 0) {
        this.damagePlayer(h.dmg);
        if (h.kind === 'glob' || h.kind === 'bolt' || h.kind === 'web') h.spent = true;
        if (h.kind === 'bolt' || h.kind === 'glob') h.life = 0;
      }
    }

    this.reportBoss();
  }

  private stepBossDeath(b: BossEntity, def: BossDef, dt: number) {
    const br = b.ai!;
    br.t += dt;
    br.air += (0 - br.air) * Math.min(1, dt * 5);
    b.y = (this.currentStage.arena?.floor ?? 560) - b.height / 2 - br.air;
    if (Math.random() < dt * 14) this.spawnDebrisBurst(b.x + (Math.random() - 0.5) * def.w, b.y + (Math.random() - 0.5) * def.h, '#fde68a');
    if (br.t > 0.2) this.camera.trauma = Math.max(this.camera.trauma, 0.35);
    if (br.t >= 2.0) {
      b.defeated = true;
      this.daisyRescued = true;
      sound.playBossVictory();
      this.camera.trauma = 0.9;
      this.addFloatingText(this.currentStage.config.secret ? 'THORNBARK IS FREE!' : 'VICTORY! JENNIFUR IS SAVED!', b.x, b.y - 70, '#ec4899');
      this.spawnDebrisBurst(b.x, b.y, '#dc2626');
    }
    this.reportBoss();
  }

  /** tell the HUD about the boss, only when its bar would change */
  private reportBoss() {
    const b = this.boss;
    const def = this.bossDef;
    if (!b || !def || !this.callbacks.onBossUpdate) return;
    const sig = `${b.hp}|${b.phase}|${b.defeated ? 1 : 0}`;
    if (sig === this.bossSig) return;
    this.bossSig = sig;
    this.callbacks.onBossUpdate(b.defeated ? null : { name: def.name, hp: b.hp, maxHp: b.maxHp, phase: b.phase });
  }

  /** while the boss lives the fight is fenced in, and the camera follows both fighters */
  private bossFrame(dt: number) {
    const b = this.boss;
    const arena = this.currentStage.arena;
    if (!b || !arena || b.defeated) {
      if (this.bossZoom !== 1) {
        this.bossZoom = 1;
        this.applyZoom();
      }
      return;
    }
    const p = this.player;
    if (p.x < arena.left + 14) {
      p.x = arena.left + 14;
      if (p.vx < 0) p.vx = 0;
    } else if (p.x > arena.right - 14) {
      p.x = arena.right - 14;
      if (p.vx > 0) p.vx = 0;
    }
    // pull back just far enough that both of them fit
    const w = this.viewCssW;
    const h = this.viewCssH;
    if (!w || !h) return;
    const levelH = this.currentStage.config.levelHeight;
    const portrait = h > w;
    let base = portrait ? Math.max(w / PORTRAIT_VIEW_W, h / levelH) : h / WORLD_VIEW_H;
    base = Math.max(0.5, Math.min(1.8, base));
    const baseViewW = w / base;
    const need = Math.abs(p.x - b.x) + 440;
    const want = Math.max(baseViewW, Math.min(need, arena.right - arena.left + 200));
    const target = Math.max(0.4, baseViewW / want);
    const prev = this.bossZoom;
    this.bossZoom += (target - this.bossZoom) * Math.min(1, dt * 2.2);
    if (Math.abs(this.bossZoom - prev) > 0.001) this.applyZoom();
  }

  // ===========================================================================================
  // The fight system (rules live in fight.ts; this is the part that touches the world)
  // ===========================================================================================

  /** world rect of Slomatt's hurt box, as the four numbers checkAABBCollision wants */
  private pBox(): [number, number, number, number] {
    const r = playerHurtRect(this.player);
    return [r.x, r.y, r.w, r.h];
  }

  /** while winding up or striking he cannot turn around; the follow-through can */
  private facingLocked(): boolean {
    const a = this.atk;
    return !!a && phaseAt(a.move, a.t) !== 'recovery' && phaseAt(a.move, a.t) !== 'done';
  }

  /** the share of his running speed he keeps while a move plays on the ground (1 in the air) */
  private attackMoveMul(): number {
    const a = this.atk;
    if (!a || !this.player.grounded) return 1;
    const m = a.move;
    const t = a.t;
    if (t < m.startup + m.active) return m.moveMul;
    const u = Math.min(1, (t - m.startup - m.active) / m.recovery);
    return m.moveMul + (1 - m.moveMul) * u;
  }

  /** read the attack buttons, advance the current move, start or chain the next one */
  private updateAttack(dt: number) {
    const p = this.player;
    const inp = this.input.state;
    if (this.megaCooldown > 0) this.megaCooldown -= dt;
    if (this.chainTimer > 0) this.chainTimer -= dt;
    if (p.grounded) this.stompChain = 0;

    let want: AttackWant | null = null;
    if (inp.megaPunchPressed) want = 'mega';
    else if (inp.kickPressed) want = 'kick';
    else if (inp.punchPressed) want = 'punch';
    inp.megaPunchPressed = false;
    inp.kickPressed = false;
    inp.punchPressed = false;
    if (want) this.atkQueue = { want, ttl: 0.2 };
    else if (this.atkQueue) {
      this.atkQueue.ttl -= dt;
      if (this.atkQueue.ttl <= 0) this.atkQueue = null;
    }

    const a0 = this.atk;
    if (a0) {
      const t0 = a0.t;
      a0.t += dt;
      if (!a0.sounded && a0.t >= a0.move.startup) {
        a0.sounded = true;
        this.onStrikeBegin(a0.move);
      }
      this.strike(a0, t0, a0.t);
      if (a0.t >= moveLength(a0.move)) this.endAttack();
    }

    if (this.atkQueue) {
      const q = this.atkQueue;
      const a = this.atk;
      if (q.want === 'mega' && this.megaCooldown > 0) {
        this.atkQueue = null;
      } else if (!a || canCancel(a.move, a.t, a.connected)) {
        this.atkQueue = null;
        if (a) this.endAttack();
        this.startAttack(q.want);
      }
    }
    this.syncAttackPose();
  }

  private startAttack(want: AttackWant) {
    const p = this.player;
    const inp = this.input.state;
    const id = chooseMove(want, !p.grounded, this.lastPunch, this.chainTimer > 0);
    const move = MOVES[id];
    if (inp.left && !inp.right) p.facing = -1;
    else if (inp.right && !inp.left) p.facing = 1;
    if (id === 'mega') this.megaCooldown = 1.0;
    this.chainTimer = 0;
    this.atk = { move, t: 0, id: ++this.swingId, connected: false, lunged: false, hits: new Set(), sounded: false };
  }

  private endAttack() {
    const a = this.atk;
    if (!a) return;
    const id = a.move.id;
    this.lastPunch = id === 'jab' || id === 'cross' ? id : null;
    this.chainTimer = this.lastPunch ? 0.35 : 0;
    this.atk = null;
  }

  /** the strike starts: the swoosh, the step forward, the shake of a mega punch */
  private onStrikeBegin(m: MoveSpec) {
    const p = this.player;
    if (m.kind === 'punch') sound.playPunch();
    else if (m.kind === 'kick') sound.playKick();
    else {
      sound.playMegaPunch();
      this.camera.trauma = Math.min(1, this.camera.trauma + 0.4);
      this.addFloatingText('MEGA PUNCH!', p.x, p.y - 50, '#fde047');
    }
    if (m.lunge && p.grounded) p.vx = Math.max(-380, Math.min(380, p.vx + p.facing * m.lunge));
  }

  /** copy the move's progress into the player state the drawing reads */
  private syncAttackPose() {
    const p = this.player;
    const a = this.atk;
    if (!a) {
      p.punching = false;
      p.kicking = false;
      p.attackType = 'none';
      p.swingCock = 0;
      p.swingReach = 0;
      return;
    }
    const m = a.move;
    p.punching = m.kind !== 'kick';
    p.kicking = m.kind === 'kick';
    p.attackType = m.kind;
    p.punchType = m.kind === 'mega' ? 'mega' : 'normal';
    const left = Math.max(0.001, moveLength(m) - a.t);
    p.punchTimer = left;
    p.kickTimer = left;
    const sp = swingPose(m, a.t);
    p.swingCock = sp.cock;
    p.swingReach = sp.reach;
  }

  /** test everything the strike zone covered since the last tick against animals, the boss and cages (each once per swing) */
  private strike(a: NonNullable<GameEngine['atk']>, t0: number, t1: number) {
    const p = this.player;
    const m = a.move;
    const box = sweptBox(m, t0, t1, { x: p.x, y: p.y, facing: p.facing });
    if (box) this.dbgStrike = box;
    if (!box) return;

    for (const e of this.enemies) {
      if (e.defeated || a.hits.has(e.id)) continue;
      const hr = hurtRect(e);
      if (!rectsOverlap(box, hr)) continue;
      a.hits.add(e.id);
      this.hitEnemy(e, m, box, hr, a);
    }

    const b = this.boss;
    if (b && !b.defeated && !a.hits.has(-1)) {
      const hr = hurtRect(b);
      if (rectsOverlap(box, hr)) {
        a.hits.add(-1);
        a.connected = true;
        this.hitBoss(b, m, box, hr);
      }
    }

    for (const c of this.collectibles) {
      if (c.type !== 'cage' || c.collected || a.hits.has(1_000_000 + c.id)) continue;
      const cr: Rect = { x: c.x - 24, y: c.y - 26, w: 48, h: 52 };
      if (!rectsOverlap(box, cr)) continue;
      a.hits.add(1_000_000 + c.id);
      a.connected = true;
      c.cageHp = (c.cageHp ?? 2) - m.damage;
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.04);
      sound.playHitImpact(true, 'chitin');
      this.spawnDebrisBurst(c.x, c.y, '#ca8a04');
      if (c.cageHp <= 0) {
        c.collected = true;
        p.crittersRescued++;
        this.runScore += 400;
        sound.playCritterRescued();
        this.addFloatingText('RESCUED! +400', c.x, c.y - 30, '#c084fc');
      } else {
        this.addFloatingText('CRACK!', c.x, c.y - 20, '#fef08a');
      }
    }
  }

  private hitEnemy(e: Enemy, m: MoveSpec, box: Rect, hr: Rect, a: NonNullable<GameEngine['atk']>) {
    const p = this.player;
    const dir: 1 | -1 = m.kind === 'mega' ? (e.x >= p.x ? 1 : -1) : p.facing;
    const wasCommitted = isCommitted(e);
    const res = resolveMelee(e, m, dir);
    applyHit(e, res);
    a.connected = true;
    const cp = contactPoint(box, hr);
    const kick = m.kind === 'kick';

    // weight: the game freezes a moment, the screen shakes, and the blow sounds like what it hit
    this.hitstopTimer = Math.max(this.hitstopTimer, res.killed ? m.hitstop * 1.5 : m.hitstop);
    this.camera.trauma = Math.min(1, this.camera.trauma + m.shake * (res.armored ? 0.5 : 1));
    sound.playHitImpact(m.heavy || res.killed, materialFor(e.type));
    if (kick) this.spawnKickHitBurst(cp.x, cp.y);
    else this.spawnClawHitSparks(cp.x, cp.y, m.heavy);
    if (m.heavy) p.vx -= p.facing * 45; // a heavy blow pushes back on him a little too

    this.comboCount++;
    this.comboResetTimer = 2.0;
    const pts = calculateHitScore(e.type, m.kind === 'mega', this.comboCount) * (kick ? 2 : 1);
    this.runScore += pts;

    // a kick from the air bounces him off the animal, ready to go again
    if (m.id === 'airKick') {
      p.vy = -420;
      p.jumpsLeft = Math.max(p.jumpsLeft, 1);
      p.isDoubleJumping = false;
      this.launched = true;
    }

    if (e.type === 'eagle') {
      this.spawnEagleFeatherBurst(e.x, e.y);
      if (!res.killed && res.interrupt) {
        e.swoopPhase = 'hover';
        e.hoverTimer = 0.9;
        e.isAttacking = false;
      }
    }

    if (res.killed) {
      this.knockOut(e, dir, `+${pts}`);
      return;
    }
    if (res.interrupt && isPredator(e.type)) staggerPredator(e);
    const label = res.armored ? 'TOUGH!' : wasCommitted ? 'STOPPED!' : this.comboCount >= 3 ? `${this.comboCount} HITS!` : 'HIT!';
    this.addFloatingText(label, e.x, e.y - 24, res.armored ? '#cbd5e1' : '#fef08a');
  }

  private hitBoss(b: BossEntity, m: MoveSpec, box: Rect, hr: Rect) {
    const world = this.currentStage.config.worldIndex;
    const def = this.bossDef;
    const c = this.bossContext();
    const cp = contactPoint(box, hr);
    const vul = vulnerability(b);

    // roaring or dying: nothing gets through
    if (vul === 'closed') {
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.03);
      sound.playHitImpact(false, 'armor');
      return;
    }

    if (vul === 'armored') {
      if (!m.heavy) {
        // a light hit bounces off a boss that is mid-attack: wait for the opening
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.04);
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(cp.x, cp.y, '#e2e8f0');
        if (this.clangCd <= 0) {
          this.clangCd = 0.45;
          this.addFloatingText('CLANG!', b.x, b.y - b.height * 0.7, '#cbd5e1');
        }
        return;
      }
      // a heavy blow breaks the attack
      if (def) interruptBoss(b, def, c);
    }

    let dmg = m.bossDamage;
    const crit = vul === 'stunned';
    if (crit) dmg = Math.ceil(dmg * 1.5);
    b.hp = Math.max(0, b.hp - dmg);
    b.hitFlashTimer = 0.15;
    this.hitstopTimer = Math.max(this.hitstopTimer, m.hitstop + 0.02);
    this.camera.trauma = Math.min(1, this.camera.trauma + 0.4);
    sound.playHitImpact(true, bossMaterial(world));
    if (m.kind === 'kick') this.spawnKickHitBurst(cp.x, cp.y);
    else this.spawnClawHitSparks(cp.x, cp.y, true);
    this.comboCount++;
    this.comboResetTimer = 2.0;
    const pts = calculateHitScore('boss', m.kind === 'mega', this.comboCount) * (m.kind === 'kick' ? 2 : 1);
    this.runScore += pts;
    this.addFloatingText(crit ? `CRITICAL! +${pts}` : `BOSS HIT! +${pts}`, b.x, b.y - b.height * 0.7, crit ? '#fb923c' : '#facc15');
    if (b.hp <= 0) this.startBossDeath(b);
  }

  /** the last hit: the boss does not vanish, it falls apart */
  private startBossDeath(b: BossEntity) {
    const br = b.ai;
    if (br) {
      br.state = 'dying';
      br.t = 0;
      br.hurt = [];
      br.move = null;
      br.alpha = 1;
    }
    b.telegraphTimer = 0;
    b.isAttacking = false;
    this.hazards.length = 0;
    for (const e of this.enemies) if (!e.defeated && e.id >= 9000) this.knockOut(e, e.x >= b.x ? 1 : -1, 'FREE!');
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.3);
    this.camera.trauma = 1;
    this.addFloatingText('K.O.!', b.x, b.y - b.height, '#fde047');
    this.spawnDebrisBurst(b.x, b.y, '#fde047');
  }

  /** an animal is beaten: it is launched away in its own style instead of vanishing */
  private knockOut(e: Enemy, dir: 1 | -1, label: string) {
    const p = this.player;
    e.defeated = true;
    e.koTimer = 0;
    e.koAngle = 0;
    e.koLanded = false;
    p.enemiesDefeated++;
    if (e.groundY === undefined) e.groundY = e.y;
    if (isPredator(e.type)) staggerPredator(e); // open crouch pose, then the hop and flop
    const ko = koLaunch(e, dir);
    e.koVx = ko.vx;
    e.koVy = ko.vy;
    e.koSpin = ko.spin;
    e.koLife = ko.life;
    sound.playEnemyDefeated(e.type);
    this.hitstopTimer = Math.max(this.hitstopTimer, 0.1);
    this.addFloatingText(label, e.x, e.y - 25, '#86efac');
    this.spawnDebrisBurst(e.x, e.y, e.type === 'eagle' ? '#f59e0b' : '#22c55e');
  }

  /** a knocked-out animal tumbles (small), drops (flyers) or hops and flops belly-up (big), then fades */
  private updateKo(e: Enemy, dt: number) {
    e.koTimer += dt;
    const style = TRAITS[e.type].ko;
    e.koVy = (e.koVy ?? 0) + 1500 * dt;
    e.x += (e.koVx ?? 0) * dt;
    e.y += e.koVy * dt;
    const spin = e.koSpin ?? 0;
    e.koAngle = style === 'flop' ? Math.max(-Math.PI, Math.min(Math.PI, spin * e.koTimer)) : spin * e.koTimer;
    if (style === 'flop' && e.groundY !== undefined && e.y >= e.groundY && (e.koVy ?? 0) > 0) {
      e.y = e.groundY;
      e.koVy = 0;
      e.koVx = (e.koVx ?? 0) * 0.3;
      if (!e.koLanded) {
        e.koLanded = true;
        this.camera.trauma = Math.min(1, this.camera.trauma + 0.15);
        this.spawnDebrisBurst(e.x, e.y + 20, '#a16207');
      }
    }
  }

  /** an animal that is hit flinches, slides back, and (if the hit was strong enough) stands dazed; returns true while dazed */
  private reactToHits(e: Enemy, dt: number): boolean {
    if (e.recoil) e.recoil = Math.max(0, e.recoil - dt / 0.24);
    if (e.knockVx) {
      e.x += e.knockVx * dt;
      e.knockVx *= Math.exp(-dt * 9);
      if (Math.abs(e.knockVx) < 8) e.knockVx = 0;
      if (e.type !== 'eagle') e.x = Math.max(e.patrolMinX - 14, Math.min(e.patrolMaxX + 14, e.x));
    }
    if ((e.stagger ?? 0) > 0) {
      e.stagger = (e.stagger ?? 0) - dt;
      if (isPredator(e.type)) {
        e.stateT = (e.stateT ?? 0) + dt;
        if ((e.stagger ?? 0) <= 0) endStagger(e);
      }
      return true;
    }
    return false;
  }

  /** landing on an animal's back from above: it takes damage and Slomatt bounces; armored backs just bounce him */
  private resolveStomps(dt: number) {
    const p = this.player;
    if (this.stompGrace > 0) this.stompGrace -= dt;
    if (p.climbing || p.isVineSwinging || p.grounded) return;
    const prevFeet = p.y - p.vy * dt;
    const diving = this.input.state.down;
    for (const e of this.enemies) {
      if (e.defeated) continue;
      const r = stompTest({ x: p.x, y: p.y, vy: p.vy }, prevFeet, e, diving);
      if (!r) continue;
      this.stompGrace = 0.3;
      p.jumpsLeft = Math.max(p.jumpsLeft, 1);
      p.isDoubleJumping = false;
      this.launched = true;
      p.squashX = 1.3;
      p.squashY = 0.7;
      const head = headRect(e);
      if (r.kind === 'bounce') {
        p.vy = -430;
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(p.x, head.y, '#cbd5e1');
        this.addFloatingText('ARMORED!', e.x, head.y - 14, '#cbd5e1');
        return;
      }
      const dir: 1 | -1 = p.vx >= 0 ? 1 : -1;
      const hs = stompSpec(r.damage);
      const wasCommitted = isCommitted(e);
      const res = resolveMelee(e, hs, dir);
      applyHit(e, res);
      p.vy = r.damage >= 2 ? -700 : this.input.state.jumpHeld ? -620 : -460;
      this.stompChain++;
      this.hitstopTimer = Math.max(this.hitstopTimer, res.killed ? 0.1 : 0.06);
      this.camera.trauma = Math.min(1, this.camera.trauma + (r.damage >= 2 ? 0.35 : 0.18));
      sound.playHitImpact(r.damage >= 2 || res.killed, materialFor(e.type));
      this.spawnDebrisBurst(p.x, head.y, '#fde68a');
      this.comboCount++;
      this.comboResetTimer = 2.0;
      const pts = calculateHitScore(e.type, false, this.comboCount) * (1 + Math.min(3, this.stompChain - 1));
      this.runScore += pts;
      if (e.type === 'eagle') this.spawnEagleFeatherBurst(e.x, e.y);
      if (res.killed) {
        this.knockOut(e, dir, `STOMP${this.stompChain > 1 ? ` x${this.stompChain}` : ''}! +${pts}`);
      } else {
        if (res.interrupt && isPredator(e.type)) staggerPredator(e);
        if (e.type === 'eagle' && res.interrupt) {
          e.swoopPhase = 'hover';
          e.hoverTimer = 0.9;
          e.isAttacking = false;
        }
        this.addFloatingText(wasCommitted && res.interrupt ? 'STOMPED!' : 'STOMP!', e.x, head.y - 14, '#fde68a');
      }
      return;
    }
  }

  /** draw an animal with its hit reaction: leaning away and squashed after a blow, or tumbling and fading when beaten */
  private drawWithReaction(ctx: CanvasRenderingContext2D, e: Enemy, draw: () => void) {
    const recoil = e.recoil ?? 0;
    if (!e.defeated && recoil < 0.02) {
      draw();
      return;
    }
    const b = bodyRect(e);
    const cx = b.x + b.w / 2;
    const feet = b.y + b.h;
    ctx.save();
    if (e.defeated) {
      const cy = b.y + b.h / 2;
      const life = e.koLife ?? 0.8;
      ctx.globalAlpha = 1 - Math.max(0, Math.min(1, (e.koTimer - (life - 0.3)) / 0.3));
      ctx.translate(cx, cy);
      ctx.rotate(e.koAngle ?? 0);
      ctx.translate(-cx, -cy);
    } else {
      ctx.translate(cx, feet);
      ctx.rotate((e.recoilDir ?? 1) * 0.24 * recoil);
      ctx.scale(1 + 0.12 * recoil, 1 - 0.16 * recoil);
      ctx.translate(-cx, -feet);
    }
    draw();
    ctx.restore();
  }

  /** ?hitboxes=1: draw what the game judges, so a hit that looks wrong can be seen */
  private drawHitboxes(ctx: CanvasRenderingContext2D) {
    const p = this.player;
    const stroke = (r: Rect, color: string, fill?: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      if (fill) {
        ctx.fillStyle = fill;
        ctx.fillRect(r.x, r.y, r.w, r.h);
      }
      ctx.strokeRect(r.x, r.y, r.w, r.h);
    };
    ctx.save();
    stroke(playerHurtRect(p), '#22d3ee');
    if (this.atk) {
      const a = this.atk;
      const now = moveBox(a.move, a.t, { x: p.x, y: p.y, facing: p.facing });
      if (now) stroke(now, '#ef4444', 'rgba(239,68,68,0.28)');
      else if (this.dbgStrike) stroke(this.dbgStrike, 'rgba(239,68,68,0.35)');
    } else if (this.dbgStrike) {
      stroke(this.dbgStrike, 'rgba(239,68,68,0.25)');
    }
    for (const e of this.enemies) {
      if (e.defeated) continue;
      stroke(hurtRect(e), '#4ade80');
      stroke(headRect(e), '#60a5fa');
    }
    if (this.boss && !this.boss.defeated) stroke(hurtRect(this.boss), '#4ade80');
    ctx.setLineDash([4, 3]);
    for (const r of this.dbgHurt) stroke(r, '#fb923c');
    ctx.restore();
    this.dbgHurt = [];
  }

  private damagePlayer(amount: number) {
    const p = this.player;
    if (p.invincibleTimer > 0 || this.stompGrace > 0) return;

    p.hp = Math.max(0, p.hp - amount);
    p.invincibleTimer = 1.2; // 1.2s invulnerability
    p.squashX = 1.3;
    p.squashY = 0.7; // hurt flinch
    p.vy = -PHYS.hurtKnockV;     // small knockup
    p.vx = -p.facing * 180;
    this.camera.trauma = Math.min(1.0, this.camera.trauma + 0.5);
    sound.playPlayerHurt();
    this.addFloatingText(`-${amount} HP`, p.x, p.y - 45, '#ef4444');

    if (p.hp <= 0 && !this.isGameOver) {
      this.loseLife('hurt');
    }
  }

  /** Lose a life and respawn at the last checkpoint, or end the run when none are left. */
  private bounceOff() {
    const p = this.player;
    p.vy = -PHYS.bounceV;
    this.launched = true;
    p.grounded = false;
    p.jumpsLeft = 1;
    p.isDoubleJumping = false;
    p.squashX = 0.78;
    p.squashY = 1.38;
    sound.playJump();
    this.addFloatingText('BOING!', p.x, p.y - 40, '#facc15');
    this.spawnSparkBurst(p.x, p.y, '#facc15');
  }

  private loseLife(reason: 'water' | 'pit' | 'hurt') {
    const p = this.player;
    this.lives -= 1;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    if (this.lives <= 0) {
      this.isGameOver = true;
      sound.playDefeat();
      this.callbacks.onDefeat(this.runScore);
      return;
    }
    this.hazards.length = 0;
    this.slowTimer = 0;
    p.hp = p.maxHp;
    p.x = this.checkpoint.x;
    p.y = this.checkpoint.y;
    p.vx = 0;
    p.vy = 0;
    p.grounded = false;
    p.climbing = false;
    p.isVineSwinging = false;
    p.jumpsLeft = 2;
    p.invincibleTimer = 2.0;
    this.respawnFlash = 0.6;
    this.inputGrace = 0.35;
    this.camera.x = Math.max(0, p.x - this.camera.viewportWidth * 0.45);
    this.camera.y = Math.max(0, p.y - this.camera.viewportHeight * 0.55);
    this.camera.targetX = this.camera.x;
    this.camera.targetY = this.camera.y;
    this.addFloatingText(
      reason === 'hurt' ? 'TRY AGAIN!' : 'OH NO!',
      p.x,
      p.y - 60,
      '#fca5a5'
    );
    if (reason !== 'hurt') this.addFloatingText(`${this.lives} ${this.lives === 1 ? 'LIFE' : 'LIVES'} LEFT`, p.x, p.y - 84, '#fde68a');
  }

  /** Pit water (behind the ground banks) and checkpoint flags. */
  private drawWaterAndFlags(ctx: CanvasRenderingContext2D, world: (typeof WORLDS_DATA)[number]) {
    const waterY = this.currentStage.waterY;
    const t = this.gameTime;
    const x0 = this.camera.x - 20;
    const x1 = this.camera.x + this.camera.viewportWidth + 20;
    if (waterY !== undefined) {
      const bottom = this.camera.y + this.camera.viewportHeight + 40;
      drawWater(ctx, world.id, x0, x1, waterY, bottom, t);
    }
    for (const cp of this.currentStage.checkpoints ?? []) {
      if (cp.x < x0 - 80 || cp.x > x1 + 80) continue;
      ctx.save();
      ctx.translate(cp.x, cp.y);
      ctx.strokeStyle = '#6b4423';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -78);
      ctx.stroke();
      const wave = Math.sin(t * 5) * 4;
      ctx.fillStyle = cp.reached ? '#fde047' : '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(2, -76);
      ctx.quadraticCurveTo(26, -80 + wave, 46, -66 + wave * 0.6);
      ctx.quadraticCurveTo(26, -58 + wave, 2, -52);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = cp.reached ? '#f59e0b' : '#9ca3af';
      ctx.beginPath();
      ctx.arc(22, -66 + wave * 0.5, 5, 0, Math.PI * 2);
      ctx.fill();
      if (cp.reached) {
        const g = ctx.createRadialGradient(0, -60, 4, 0, -60, 60);
        g.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
        g.addColorStop(1, 'rgba(253, 224, 71, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, -60, 60, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private spawnWaterSplash(x: number, y: number) {
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
      const sp = 160 + Math.random() * 260;
      this.particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        color: Math.random() < 0.5 ? '#bae6fd' : '#ffffff',
        size: 3 + Math.random() * 4, life: 0.8, maxLife: 0.8, type: 'water',
      });
    }
  }

  /**
   * Camera Controller with lookahead and trauma screen shake
   */
  private updateCamera(dt: number) {
    const p = this.player;
    const { viewportWidth: vw, viewportHeight: vh } = this.camera;

    // Look-ahead tracking
    const lookAhead = p.facing * 90;
    this.camera.targetX = p.x - vw * 0.45 + lookAhead;
    this.camera.targetY = p.y - vh * 0.55;
    const bs = this.boss;
    if (bs && !bs.defeated && this.currentStage.arena) {
      // frame both fighters, but never let Slomatt slip off the edge
      let tx = (p.x + bs.x) / 2 - vw / 2;
      tx = Math.max(p.x + 70 - vw, Math.min(p.x - 70, tx));
      this.camera.targetX = tx;
      this.camera.targetY = Math.min(this.camera.targetY, this.currentStage.arena.floor - vh * 0.7);
    }

    // Smooth damp camera
    const smoothFactor = Math.min(1, dt * 6.5);
    this.camera.x += (this.camera.targetX - this.camera.x) * smoothFactor;
    this.camera.y += (this.camera.targetY - this.camera.y) * smoothFactor;

    // Clamp camera within stage bounds
    this.camera.x = Math.max(0, Math.min(this.currentStage.config.levelWidth - vw, this.camera.x));
    this.camera.y = Math.max(0, Math.min(this.currentStage.config.levelHeight - vh, this.camera.y));
  }

  /**
   * Main Render Pass
   */
  public render() {
    const ctx = this.ctx;
    const dpr = this.renderDpr();
    const world = WORLDS_DATA[this.currentStage.config.worldIndex - 1] || WORLDS_DATA[0];

    ctx.save();
    ctx.scale(dpr * this.zoom, dpr * this.zoom);

    // Clean viewport clearing to prevent any screen flicker or ghosting
    ctx.clearRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);

    // Apply Screen Shake (Trauma squared for punchy feel)
    const shakeMag = this.camera.trauma * this.camera.trauma * 16;
    const shakeX = (Math.random() - 0.5) * shakeMag;
    const shakeY = (Math.random() - 0.5) * shakeMag;

    // 1. Render Multi-Layer Parallax Background
    renderScenery(ctx, world.id, this.camera.x, this.camera.y, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime, this.quality > 0);

    // the secret Hollow is a dusk of purple thorn-light
    if (this.currentStage.config.secret) {
      ctx.fillStyle = 'rgba(46, 16, 101, 0.5)';
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }

    // 2. Render In-World Game Elements with Camera Transform
    ctx.save();
    // snap the camera to whole device pixels (not whole world units), so it never beats against the hero's motion
    const snap = dpr * this.zoom;
    ctx.translate(-Math.round(this.camera.x * snap) / snap + shakeX, -Math.round(this.camera.y * snap) / snap + shakeY);

    this.drawWaterAndFlags(ctx, world);

    // Render In-World Trees, Vines and Platforms
    renderWorldObjects(
      ctx,
      world.id,
      this.platforms,
      this.vines,
      this.currentStage.trees,
      this.camera,
      this.gameTime
    );

    // Render Collectibles
    this.collectibles.forEach((item) => {
      drawCollectible(ctx, item, this.gameTime);
    });

    // Render Jennifur if present in level
    if (this.currentStage.daisyX !== undefined && this.currentStage.daisyY !== undefined) {
      drawGirlfriendDaisy(
        ctx,
        this.currentStage.daisyX,
        this.currentStage.daisyY,
        this.gameTime,
        this.daisyRescued
      );
    }

    // Render Enemies
    this.enemies.forEach((enemy) => {
      if (enemy.defeated && enemy.koTimer > (enemy.koLife ?? 0)) return;
      const draw = () => {
        if (enemy.type === 'snake') {
          drawTreeSnake(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'eagle') {
          drawHarpyEagle(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'ocelot') {
          drawOcelot(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'jaguar') {
          drawJaguar(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'boa') {
          drawBoa(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'caiman') {
          drawCaiman(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'tayra') {
          drawTayra(ctx, enemy, this.gameTime);
        } else {
          drawHazardEntity(ctx, enemy, this.gameTime);
        }
      };
      this.drawWithReaction(ctx, enemy, draw);
    });

    // Render Boss
    if (this.boss && !this.boss.defeated && this.bossDef) {
      drawBossFighter(ctx, this.boss, this.bossDef, this.gameTime, this.currentStage.config.worldIndex, this.currentStage.arena?.floor ?? 560);
    }

    // Render Hero Sloth
    drawHeroSloth(ctx, this.player, this.gameTime);
    // the boss's attacks go over him, so a warning is never hidden behind Slomatt
    if (this.boss && !this.boss.defeated && this.hazards.length) drawHazards(ctx, this.hazards, this.gameTime);
    if (this.debugBoxes) this.drawHitboxes(ctx);

    // Contextual Action Badges (Climb Tree / Swing Liana / Jump Off)
    const p = this.player;
    if (this.nearTreeVine && !p.climbing && p.grounded) {
      const bob = Math.sin(this.gameTime * 6) * 4;
      ctx.save();
      ctx.translate(p.x, p.y - 75 + bob);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-64, -14, 128, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('[W / UP] CLIMB TREE', 0, 0);
      ctx.restore();
    } else if (p.climbing) {
      const bob = Math.sin(this.gameTime * 6) * 3;
      ctx.save();
      ctx.translate(p.x, p.y - 72 + bob);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-66, -14, 132, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LEAP: [SPACE / RIGHT]', 0, 0);
      ctx.restore();
    } else if (p.isVineSwinging) {
      const bob = Math.sin(this.gameTime * 8) * 3;
      ctx.save();
      ctx.translate(p.x, p.y - 65 + bob);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.roundRect(-68, -14, 136, 26, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TARZAN: [SPACE] JUMP', 0, 0);
      ctx.restore();
    }

    // Render Particles
    this.particles.forEach((pt) => {
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size * (pt.life / pt.maxLife), 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Floating Combat Texts
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px Fredoka, sans-serif';
    this.floatingTexts.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore(); // end world transform

    // 3. Render Foreground Foliage (Framing screen edges)
    renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime, this.quality > 0);
    if (this.respawnFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.respawnFlash / 0.6 * 0.7})`;
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }

    ctx.restore(); // end DPR transform
  }

  // --- Juice Helpers ---
  private addFloatingText(text: string, x: number, y: number, color: string) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      life: 0.8,
      maxLife: 0.8,
      scale: 1,
    });
  }

  private spawnSparkBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 3 + Math.random() * 3,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        type: 'spark',
      });
    }
  }

  private spawnClawHitSparks(x: number, y: number, isMega: boolean) {
    const count = isMega ? 16 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 120 + Math.random() * 180;
      this.particles.push({
        x,
        y,
        vx: (this.player.facing * spd * 0.8) + (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 120,
        color: isMega ? '#fef08a' : '#86efac',
        size: 3.5,
        life: 0.35,
        maxLife: 0.35,
        type: 'spark',
      });
    }
  }

  private spawnDebrisBurst(x: number, y: number, color: string) {
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 180,
        vy: -80 - Math.random() * 160,
        color,
        size: 3 + Math.random() * 4,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        type: 'leaf',
      });
    }
  }

  private spawnJumpDust(x: number, y: number) {
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 40,
        color: '#e2f1e7',
        size: 2.5,
        life: 0.25,
        maxLife: 0.25,
        type: 'smoke',
      });
    }
  }

  private spawnDoubleJumpBurst(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const spd = 70 + Math.random() * 90;
      this.particles.push({
        x: x + Math.cos(angle) * 12,
        y: y + Math.sin(angle) * 8,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd + 40,
        color: i % 2 === 0 ? '#4ade80' : '#86efac',
        size: 3.5,
        life: 0.45,
        maxLife: 0.45,
        type: 'leaf',
      });
    }
  }

  private spawnKickHitBurst(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.random() - 0.5) * Math.PI;
      const spd = 140 + Math.random() * 190;
      this.particles.push({
        x,
        y,
        vx: (this.player.facing * spd * 0.9) + (Math.random() - 0.5) * 60,
        vy: (Math.random() - 0.5) * 140,
        color: i % 2 === 0 ? '#f97316' : '#fde047',
        size: 4,
        life: 0.38,
        maxLife: 0.38,
        type: 'spark',
      });
    }
  }

  private spawnEagleFeatherBurst(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = (Math.random() - 0.5) * Math.PI * 2;
      const spd = 50 + Math.random() * 120;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 24,
        y: y + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 35,
        color: i % 3 === 0 ? '#f8fafc' : i % 3 === 1 ? '#64748b' : '#f59e0b',
        size: 4,
        life: 0.6,
        maxLife: 0.6,
        type: 'leaf',
      });
    }
  }
}
