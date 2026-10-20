import type {
  LevelConfig,
  PlayerState,
  Enemy,
  BossEntity,
  Collectible,
  Platform,
  Vine,
  Rope,
  Camera,
  Particle,
  FloatingText,
} from './types.ts';
import { WORLDS_DATA } from './worldsData.ts';
import type { StageStats } from './badges.ts';
import { loadCosmetic } from './badgeStore.ts';
import { setHeroCoat } from './heroSprite.ts';
import { generateStage, GeneratedStage } from './stageGenerator.ts';
import { coachWanted, firstJumpSpot, markCoachDone, TouchCoach, type CoachStep } from './touchCoach.ts';
import { controlStyle } from './controlPrefs.ts';
import { ASSIST, PHYS, easeAssist, swingGrab, swingStep, tarzanLaunch } from './physics.ts';
import { HAND_REACH, HANG_DROP, ROPE_SPEED, ropeYAt } from './rope.ts';
import { drawRopes } from './ropeArt.ts';
import { learnedSkills, type SkillId } from './skills.ts';
import { renderScenery, renderOverlay, setWeatherAvoid, lookFor } from './scenery.ts';
import { polishEnabled, polishTier, setPolishTier, pskip, rigFor, drawGroundShadow, drawBackGlow, drawLit, drawBloom, type Rig } from './polish.ts';
import { setSceneSeed, rollSceneSeed, getSceneSeed } from './sceneSeed.ts';
import { drawEagleSprite } from './eagleSprite.ts';
import { startDive, stepDive, stepGlide } from './harpyDive.ts';
import { drawJennifurSprite, jennifurSpriteReady } from './jennifurSprite.ts';
import { drawSnakeSprite } from './snakeSprite.ts';
import { drawTayraSprite } from './tayraSprite.ts';
import { drawOcelotSprite } from './ocelotSprite.ts';
import { drawBoaSprite } from './boaSprite.ts';
import { drawSpiderSprite } from './spiderSprite.ts';
import { drawFrogSprite } from './frogSprite.ts';
import { drawCaimanSprite } from './caimanSprite.ts';
import { drawJaguarSprite } from './jaguarSprite.ts';
import { renderWorldObjects, drawWater } from './terrain.ts';
import { driftX, LOG_DROP, DRIFT_CATCH } from './river.ts';
import { zoneEffect, windPush, zoneDrag, columnHit, inZone, DROWSY_SPEED, DROWSY_JUMP, DROWSY_LINGER } from './zones.ts';
import { drawZoneBases, drawZoneEffects, drawDrowsyVeil, drawCrumbleTiles, drawDarkness } from './zoneArt.ts';
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
  atExitDoor,
  atSealedDoor,
} from './rules.ts';
import { InputEngine } from './inputEngine.ts';
import { sound } from './audio.ts';
import { FIND_BY_ID } from './finds.ts';
import { bossMaterial, materialFor } from '../audio/combat.ts';
import { FEET, endStagger, isPredator, staggerPredator, stepPredator, stepSpider } from './predatorAI.ts';
import { assignTerritories, keepOnLedge, separateHunters, walkBounds } from './enemyBrain.ts';
import {
  applyHit, bodyRect, canCancel, chooseMove, contactPoint, headRect, hurtRect, isCommitted, koLaunch, moveBox, moveLength, MOVES, phaseAt,
  playerHurtRect, rectsOverlap, resolveMelee, stompSpec, stompTest, swingPose, sweptBox, TRAITS,
  type AttackWant, type MoveId, type MoveSpec, type Rect,
} from './fight.ts';
import { drawJaguar, drawBoa, drawCaiman, drawTayra } from './predators.ts';
import { drawEntrance, entranceBeat, takeEntranceLength } from './bossEntrance.ts';
import { drawLairBack, drawLairFront, drawLairObjects, drawLairWorld, lairOwnsScene } from './lairArt.ts';
import { bodyHurts, hazardBox, interruptBoss, stepBoss, stepHazards, vulnerability, weakOpen, weakRect } from './bossAI.ts';
import type { BossCtx, BossDef, BossHazard } from './bossAI.ts';
import { bossDefForLevel } from './bossDefs.ts';
import { maxHearts } from './secret.ts';
import { drawBossFighter, drawHazards } from './bossArt.ts';

/** How many world units tall the screen shows. */
/** how long Slomatt crouches beside a Hush Fern before it gives up what it hides */
const FIND_SEARCH_SECONDS = 0.9;

const WORLD_VIEW_H = 540;
/** world units across a portrait screen */
const PORTRAIT_VIEW_W = 440; // was 360: only ~270 units of warning ahead of the hero in portrait
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
  /** the stage ended (won or lost): what happened, for the Trophy Room. Sent just before onVictory / onDefeat. */
  onStageStats?: (stats: StageStats) => void;
  onLivesChange?: (lives: number, maxLives: number) => void;
  /** the game loop failed over and over: the app should leave the stage */
  onFatal?: () => void;
  onBossEncounter?: (boss: BossEntity) => void;
  /** Slomatt stepped through the hidden Thorn Gate */
  onSecret?: () => void;
  /** Slomatt picked up a note, book or keepsake (see finds.ts); the app shows it */
  onFind?: (findId: string) => void;
  /** the boss bar: sent only when something on it changes */
  /** the first-stage lesson moved to a new step (or ended): the app shows or clears the hint */
  onCoach?: (step: CoachStep) => void;
  onBossUpdate?: (info: { name: string; hp: number; maxHp: number; phase: number; hits?: number; color?: string; entering?: boolean } | null) => void;
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
  private ropes: Rope[];
  /** the skills Slomatt has (worked out from the stages he has cleared) */
  private skills: Set<SkillId>;
  private ropeCooldown = 0;
  private ropeGrace = 0;
  private ropeId = -1;
  private enemies: Enemy[];
  private boss: BossEntity | null;
  private collectibles: Collectible[];

  // --- boss fight (rules in bossAI.ts / bossDefs.ts) ---
  private hazards: BossHazard[] = [];
  private bossDef: BossDef | null = null;
  private bossCtx: BossCtx | null = null;
  private bossIntro = false;
  /** a giant's entrance while it plays (the fight and the player wait) */
  private entrance: { t: number; total: number; roared: boolean; named: boolean } | null = null;
  private entranceDone = false;
  /** real seconds of slow motion still to play (the last hit on a giant) */
  private slowMoLeft = 0;
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
  private readonly frameIntervalMs: number = 1000 / 30; // 33.33ms fixed 30 FPS
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
  private riverHinted = false;
  /** World 3: seconds of drowsiness left (spore clouds), and how strongly the screen shows it */
  private drowsy = 0;
  private drowsyShow = 0;
  private zzzTimer = 0;
  /** World 4: the push the wind adds to the hero this frame, px/s */
  private windV = 0;
  /** Worlds 5 and 6: what webs and the mudflat do to run speed and jump this frame (1 = nothing) */
  private dragSpeed = 1;
  private dragJump = 1;
  /** World 8: how dark it is on screen, 0..1 */
  private darkShow = 0;
  private zoneHinted: Record<string, boolean> = {};
  /** true while rising from a mushroom/vine launch (those must not be cut short like a jump) */
  private launched = false;
  private runScore: number = 0;
  // what happened this stage, for badges
  private statLivesLost = 0;
  private statHeartsLost = 0;
  private statStomps = 0;
  private statMaxStompChain = 0;
  private statMaxCombo = 0;
  private statKills: Record<string, number> = {};
  private statSeen = new Set<string>();
  private seenCheck = 0;
  // the reward Slomatt wears
  private trailOn = false;
  private trailT = 0;
  private barrierMsgCooldown = 0;
  private comboCount: number = 0;
  private comboResetTimer: number = 0;
  /** the first-stage lesson for a new touch player (see touchCoach.ts), when there is one */
  private coach: TouchCoach | null = null;
  private coachWasGrounded = true;
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
  private atkQueue: { want: AttackWant; ttl: number; face: number } | null = null;
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
  /** after grabbing a trunk, the press that grabbed it is not also a leap or a hop off */
  private climbGrace = 0;
  /** how long a sideways push has been held, with no up or down, while on a trunk */
  private climbSideTimer = 0;
  /** a jump / up press a moment ago: touching a trunk in the next instant still grabs it */
  private upIntent = 0;
  /** a quick flick that grabbed a trunk keeps the climb going for a moment, so one flick is enough to get on */
  private climbAssist = 0;
  /** same for a liana: the jump press that caught it is not also the leap off it */
  private swingGrace = 0;
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
    const cosmetic = loadCosmetic();
    setHeroCoat(cosmetic.coat);
    this.trailOn = cosmetic.trail;
    try {
      this.debugBoxes = new URLSearchParams(window.location.search).get('hitboxes') === '1';
    } catch {
      /* no window.location in some test setups */
    }

    // every stage load rolls a fresh look for the backdrop and ground (the layout itself does not change)
    setSceneSeed(rollSceneSeed());

    // Generate Stage data
    this.currentStage = generateStage(config);
    if (import.meta.env?.DEV) (window as unknown as { __engine?: unknown }).__engine = this; // dev-only debug handle
    this.platforms = this.currentStage.platforms;
    this.vines = this.currentStage.vines;
    this.ropes = this.currentStage.ropes ?? [];
    this.skills = learnedSkills(config.id);
    this.enemies = this.currentStage.enemies;
    // hunters may chase past their own patch, but only along ground that is really there
    assignTerritories(this.enemies, this.platforms, (e) => e.y + (isPredator(e.type) ? FEET[e.type] : 0));
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
    if (this.quality >= 2 || pskip('gov')) return;
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
      // the sparkle goes first (bloom, rim light, wind, then all of the polish), and only then the resolution
      if (polishEnabled() && polishTier() < 2) setPolishTier(polishTier() + 1);
      else {
        this.quality++;
        this.resizeCanvas();
      }
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
    // (a boss fight in a tall, narrow window may show some sky above the arena rather than crop the fight to the level's height)
    const bossFight = !!this.currentStage?.arena && portrait;
    this.zoom = Math.max(base * dolly * this.bossZoom, bossFight ? 0.4 : h / levelH);
    this.camera.viewportWidth = w / this.zoom;
    this.camera.viewportHeight = h / this.zoom;
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.lastRenderTime = this.lastTime;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    const cfg = this.currentStage.config;
    if (coachWanted(cfg.id, cfg.secret)) {
      this.coach = new TouchCoach(controlStyle(), (st) => this.callbacks.onCoach?.(st), markCoachDone);
      this.coach.setCourse(this.player.x, firstJumpSpot(this.platforms, this.player.x, this.player.y));
    }
    sound.setTempo(1); // a boss fight that was enraged must not restart at the enraged speed
    sound.playLevelStart();
    this.loop(this.lastTime);
  }

  /** a note, book or keepsake is picked up: a burst, a line of text, and the app opens it */
  private collectFind(c: Collectible) {
    c.collected = true;
    this.runScore += 300;
    sound.playRelicFound();
    this.spawnSparkBurst(c.x, c.y, '#fde68a');
    this.addFloatingText(`FOUND: ${FIND_BY_ID[c.findId ?? '']?.title ?? 'a find'}`, c.x, c.y - 34, '#fde68a');
    if (c.findId) this.callbacks.onFind?.(c.findId);
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

    // 30 FPS cap: one steady 30 fps rhythm (every other frame on a 60 Hz screen) looks smoother than a
    // frame rate that wobbles between 30 and 60.
    const elapsed = now - this.lastRenderTime;
    // a vsync that lands a hair early (33.2 ms) still counts, or every fourth frame would be skipped and run at 50 ms
    if (elapsed < this.frameIntervalMs - 2) {
      return;
    }
    this.lastRenderTime = elapsed < this.frameIntervalMs + 2 ? now : now - (elapsed % this.frameIntervalMs);

    const dt = Math.min(elapsed / 1000, 0.05);

    try {
      if (!this.isPaused) {
        if (this.hitstopTimer > 0) {
          // Hitstop freeze: the world holds for a few ticks; keep the camera shake settling
          this.hitstopTimer -= dt;
          this.camera.trauma = Math.max(0, this.camera.trauma - dt * 2.5);
        } else {
          // the killing blow of a giant plays in slow motion (real time runs the clock down)
          let sdt = dt;
          if (this.slowMoLeft > 0) {
            this.slowMoLeft -= dt;
            sdt = dt * 0.3;
          }
          this.update(sdt);
        }
      }

      this.render();
      this.failStreak = 0;
    } catch (err) {
      // one bad frame must not freeze the game; a frame that fails over and over ends the stage cleanly
      console.error('frame error', err);
      if (++this.failStreak >= 20) {
        this.stop();
        this.callbacks.onFatal?.();
      }
    }
  };
  private failStreak = 0;

  /**
   * Main Physics & Simulation Tick (30 FPS)
   */
  private update(dt: number) {
    this.gameTime += dt;
    if (this.introT < INTRO_ZOOM_SECS) {
      this.introT += dt;
      this.applyZoom();
    }
    if (this.stepEntrance(dt)) return;
    this.input.update(dt);

    const p = this.player;
    const groundedBefore = p.grounded;
    const vyBefore = p.vy;

    if (this.coach && !this.coach.done) {
      this.coach.update(dt, p.x, this.coachWasGrounded && !p.grounded && p.vy < -200);
      this.coachWasGrounded = p.grounded;
    }

    // --- Moving platforms: slide on a sine path and carry whoever stands on them ---
    for (const plat of this.platforms) {
      if (plat.type !== 'moving' || plat.broken) continue;
      const nx = (plat.baseX ?? plat.x) + Math.sin(this.gameTime * (plat.moveSpeed ?? 1) + (plat.swayOffset ?? 0)) * (plat.moveRange ?? 0);
      const dx = nx - plat.x;
      plat.x = nx;
      if (p.grounded && this.standingOnId === plat.id) p.x += dx;
    }

    // --- Drifting logs (World 2 rivers): slide with the current, carry whoever rides them, hand a rider over to the bank ---
    for (const plat of this.platforms) {
      if (plat.type !== 'drift' || !plat.drift || plat.broken) continue;
      const d = plat.drift;
      const nx = driftX(d, this.gameTime);
      // a log that wraps from one end of the river to the other must not drag its rider across the whole window
      const dx = Math.abs(nx - plat.x) > d.width * 2 ? 0 : nx - plat.x;
      plat.x = nx;
      if (p.grounded && this.standingOnId === plat.id) {
        p.x += dx;
        // carried under a bank: step up onto it instead of riding into the wall
        if (p.x > d.x1 || p.x < d.x0) {
          p.x = p.x > d.x1 ? d.x1 + 6 : d.x0 - 6;
          p.y = d.baseY - LOG_DROP;
          p.vy = 0;
        }
      }
    }
    if (!this.riverHinted && this.currentStage.rivers?.length) {
      const r0 = this.currentStage.rivers[0];
      if (p.x > r0.x0 - 380 && p.x < r0.x1) {
        this.riverHinted = true;
        this.addFloatingText('LOGS DRIFT! HOP ON AND RIDE', p.x, p.y - 90, '#7dd3fc');
      }
    }

    // --- Spore clouds and wind gusts (Worlds 3 and 4, see zones.ts) ---
    const zones = this.currentStage.zones;
    if (zones?.length) {
      const bodyY = p.y - 30;
      if (zoneEffect(zones, 'spore', p.x, bodyY, this.gameTime).strength > 0.2) {
        if (this.drowsy <= 0) {
          if (!this.zoneHinted.sleepy) this.addFloatingText('SLEEPY SPORES...', p.x, p.y - 80, '#c4b5fd');
          this.zoneHinted.sleepy = true;
          this.zzzTimer = 0.3;
        }
        this.drowsy = DROWSY_LINGER;
      } else if (this.drowsy > 0) {
        this.drowsy -= dt;
      }
      this.windV = windPush(zones, p.x, bodyY, this.gameTime, p.grounded);
      const drag = zoneDrag(zones, p.x, bodyY, this.gameTime);
      this.dragSpeed = drag.speed;
      this.dragJump = drag.jump;
      if (drag.speed < 0.5 && !this.zoneHinted.stuck && zones.some((z) => z.kind === 'web' && inZone(z, p.x, bodyY))) {
        this.zoneHinted.stuck = true;
        this.addFloatingText('STUCK IN THE WEB!', p.x, p.y - 80, '#e2e8f0');
      }
      // lava geysers and lightning (Worlds 9 and 10): a firing column burns whoever stands in it
      const hot = columnHit(zones, p.x - 14, p.y - 64, 28, 64, this.gameTime);
      if (hot && p.invincibleTimer <= 0) {
        this.damagePlayer(1);
        this.camera.trauma = Math.min(1, this.camera.trauma + 0.3);
      }
      // the first time a zone of each kind is close, say what it is (once a session)
      for (const z of zones) {
        if (this.zoneHinted[z.kind] || p.x < z.x0 - 420 || p.x > z.x1) continue;
        this.zoneHinted[z.kind] = true;
        const hint: Record<string, [string, string]> = {
          web: ['STICKY WEBS SLOW YOU. GO ABOVE THEM OR PUSH THROUGH', '#e2e8f0'],
          tide: ['THE TIDE RISES ON A BEAT. CROSS WHILE IT IS LOW', '#7dd3fc'],
          dark: ['IT IS DARK. FOLLOW THE FIREFLIES', '#fde68a'],
          crumble: ['THESE TILES CRUMBLE. KEEP MOVING', '#fdba74'],
          spore: ['SPORES PUFF ON A BEAT. WAIT FOR THEM TO CLEAR', '#c4b5fd'],
          wind: ['GUSTS BLOW ON A BEAT. WATCH THE LEAVES', '#99f6e4'],
          geyser: ['VENTS ERUPT ON A BEAT. STAND BETWEEN THEM', '#fdba74'],
          bolt: ['LIGHTNING STRIKES WHERE THE RODS CHARGE', '#bae6fd'],
        };
        this.addFloatingText(hint[z.kind][0], p.x, p.y - 100, hint[z.kind][1]);
      }
    } else {
      this.windV = 0;
      this.dragSpeed = 1;
      this.dragJump = 1;
      if (this.drowsy > 0) this.drowsy -= dt;
    }
    {
      // World 8: the dark fades in as you reach a dark stretch and out as you leave it
      let want = 0;
      for (const z of zones ?? []) {
        if (z.kind !== 'dark') continue;
        const out = Math.max(z.x0 - p.x, p.x - z.x1, 0);
        want = Math.max(want, Math.max(0, 1 - out / 220));
      }
      this.darkShow += (want - this.darkShow) * Math.min(1, dt * 3);
    }
    this.drowsyShow += ((this.drowsy > 0 ? 1 : 0) - this.drowsyShow) * Math.min(1, dt * 4);
    if (this.drowsy > 0) {
      this.zzzTimer -= dt;
      if (this.zzzTimer <= 0) {
        this.zzzTimer = 0.9;
        this.particles.push({ x: p.x + p.facing * 14, y: p.y - 62, vx: p.facing * 12, vy: -30, color: '#ddd6fe', size: 3, life: 0.9, maxLife: 0.9, type: 'star' });
        this.addFloatingText('z', p.x + p.facing * 16, p.y - 66, '#ddd6fe');
      }
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
          this.runScore += 300;
          this.knockOut(e, e.x >= p.x ? 1 : -1, 'STAR K.O.! +300');
          this.spawnDebrisBurst(e.x, e.y, '#facc15');
        }
      }
    }

    if (this.comboCount > this.statMaxCombo) this.statMaxCombo = this.comboCount;
    // the sparkle trail reward: stardust drifting off Slomatt as he moves
    if (this.trailOn && Math.abs(this.player.vx) > 40 && (this.trailT += dt) > 0.04) {
      this.trailT = 0;
      const pl = this.player;
      const hues = ['#fbbf24', '#f9a8d4', '#6ee7b7', '#fde047'];
      this.particles.push({
        x: pl.x - pl.facing * (6 + Math.random() * 10),
        y: pl.y - 8 - Math.random() * 38,
        vx: -pl.facing * (10 + Math.random() * 30),
        vy: -10 - Math.random() * 40,
        color: hues[Math.floor(Math.random() * hues.length)],
        size: 4.2 + Math.random() * 3.6,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        type: 'star',
      });
    }
    // creatures that came on screen (the journal's "met" list)
    if ((this.seenCheck += dt) > 0.4) {
      this.seenCheck = 0;
      const cam = this.camera;
      for (const e of this.enemies) {
        if (e.defeated || e.type === 'boss' || e.type === 'ant_hazard' || this.statSeen.has(e.type)) continue;
        if (e.x > cam.x - 60 && e.x < cam.x + cam.viewportWidth + 60 && e.y > cam.y - 60 && e.y < cam.y + cam.viewportHeight + 60) this.statSeen.add(e.type);
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
        if (Math.abs(p.x - v.x) < (p.climbing ? 60 : 54) && p.y >= v.topY - 12 && p.y <= v.bottomY + 25) {
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
    // a flick up is a jump press and an up press at once, and a thumb lifts again quickly: remember it for a moment
    // so a jump that touches a trunk grabs it even if the thumb has already left the glass
    if (this.input.state.jumpPressed) this.upIntent = 0.35;
    else this.upIntent = Math.max(0, this.upIntent - dt);
    const wantGrab = this.input.state.up || this.upIntent > 0 || (!p.grounded && this.input.state.down);
    const onRope = this.updateRope(dt);
    if (onRope) {
      // hanging from a rope: updateRope has done all the moving
    } else if (nearTreeVine && (p.climbing || wantGrab)) {
      if (!p.climbing) {
        sound.playVineGrab();
        // the press that grabbed the trunk must not also leap off it or hop away with a drifting thumb
        this.climbGrace = 0.3;
        this.climbSideTimer = 0;
        this.upIntent = 0;
        this.jumpBufferTimer = 0;
        this.climbAssist = 0.45;
      }
      if (this.input.state.down) this.climbAssist = 0;
      else if (this.input.state.up) this.climbAssist = Math.max(this.climbAssist, 0.25);
      else this.climbAssist = Math.max(0, this.climbAssist - dt);
      this.climbGrace = Math.max(0, this.climbGrace - dt);
      if (this.climbGrace > 0) this.input.state.jumpPressed = false;
      // a sideways push only lets go once it is clearly deliberate: held, and not while climbing up or down
      const sideHeld = this.input.state.left || this.input.state.right;
      const vertHeld = this.input.state.up || this.input.state.down || this.climbAssist > 0;
      this.climbSideTimer = sideHeld && !vertHeld && this.climbGrace <= 0 ? this.climbSideTimer + dt : 0;
      p.climbing = true;
      p.isVineSwinging = false;
      p.grounded = false;
      p.vx = 0;
      p.vy = 0;
      p.x = nearTreeVine.x; // snap smoothly to tree trunk vine

      // Climb Up / Down
      if (this.input.state.up || this.climbAssist > 0) {
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
      if (p.y <= nearTreeVine.topY + 12 && (this.input.state.up || this.climbAssist > 0 || this.input.state.jumpPressed || this.input.state.left || this.input.state.right)) {
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
      // Natural Exit D: Steer away with Left / Right (held on purpose) -> Natural graceful hop off trunk!
      else if (this.climbSideTimer >= 0.2) {
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
        this.swingGrace = 0.25;
        this.input.state.jumpPressed = false;
        this.jumpBufferTimer = 0;
        sound.playVineGrab();
      }

      if (p.isVineSwinging && nearSwingVine) {
        this.swingGrace = Math.max(0, this.swingGrace - dt);
        if (this.swingGrace > 0) this.input.state.jumpPressed = false;
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

          const speedMult = (p.activePowerUp === 'speed' ? 1.4 : 1.0) * (this.slowTimer > 0 ? 0.45 : 1) * (this.drowsy > 0 ? DROWSY_SPEED : 1) * this.dragSpeed;
          const maxSpeed = PHYS.maxRun * speedMult * this.attackMoveMul();
          const dir = this.inputGrace > 0 ? 0 : this.input.state.left ? -1 : this.input.state.right ? 1 : 0;
          if (dir !== 0) {
            if (!this.facingLocked()) p.facing = dir as 1 | -1;
            const reversing = Math.sign(p.vx) === -dir && Math.abs(p.vx) > 20;
            const acc = (p.grounded ? PHYS.groundAcc : PHYS.airAcc) * speedMult + (reversing ? (p.grounded ? PHYS.turnBonus : PHYS.airTurn) : 0);
            if (dir * p.vx < maxSpeed) {
              p.vx += dir * acc * dt;
              if (dir * p.vx > maxSpeed) p.vx = dir * maxSpeed;
            } else {
              // launched faster than run speed (vine release, bounce): bleed off gently
              p.vx -= dir * (this.atk && p.grounded ? PHYS.groundDec : PHYS.airDec) * dt;
            }
          } else {
            const dec = p.grounded ? PHYS.groundDec : PHYS.airStop;
            if (Math.abs(p.vx) <= dec * dt) p.vx = 0;
            else p.vx -= Math.sign(p.vx) * dec * dt;
          }
        }

        const assist = this.assistNow();
        if (p.grounded) {
          this.coyoteTimer = PHYS.coyote + ASSIST.coyote * assist;
        } else {
          this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        }

        if (this.jumpBufferTimer > 0) {
          this.jumpBufferTimer -= dt;
        }

        if (this.input.state.jumpPressed) {
          if (p.grounded || this.coyoteTimer > 0) {
            p.vy = -PHYS.jumpV * (this.drowsy > 0 ? DROWSY_JUMP : 1) * this.dragJump;
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
            p.vy = -PHYS.doubleV * (1 + ASSIST.doubleJump * assist) * (this.drowsy > 0 ? DROWSY_JUMP : 1) * this.dragJump;
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
            this.jumpBufferTimer = PHYS.buffer + ASSIST.buffer * assist;
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

        p.x += (p.vx + this.windV) * dt;
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
      if (!p.climbing && !p.isVineSwinging && !p.hanging) {
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
      if (!p.climbing && !p.isVineSwinging && !p.hanging) {
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
      const assist = this.assistNow();
      const playerFeet = p.y;
      const playerPrevFeet = p.y - p.vy * dt;

      for (const plat of p.hanging ? [] : this.platforms) {
        if (plat.broken) continue;
        // a log is only there between its banks; the part hidden under a bank is not standable
        if (plat.type === 'drift' && plat.drift && (p.x < plat.drift.x0 || p.x > plat.drift.x1)) continue;

        // Check if player is horizontally within platform (generous width tolerance)
        // How far the player's CENTRE may hang past a ledge and still count as standing on it. It was 0.48 (21 px), which left
        // Slomatt standing in mid-air with most of his body off the cliff. 0.26 (about 11 px) keeps a foot on the ledge.
        const side = plat.type === 'drift' ? DRIFT_CATCH.side : 0.26 + ASSIST.landSide * assist;
        const catchDrop = plat.type === 'drift' ? DRIFT_CATCH.drop : 14 + ASSIST.catchDrop * assist;
        if (p.x + p.width * side > plat.x && p.x - p.width * side < plat.x + plat.width) {
          // Check landing from above
          if (p.vy >= 0 && playerPrevFeet <= plat.y + catchDrop && playerFeet >= plat.y) {
            p.y = plat.y;
            const landV = p.vy; // how hard he came down: the squash below follows it
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

            // Squash on landing: a hop settles lightly, a long drop flattens him more
            if (p.squashY > 0.9) {
              const hard = Math.max(0, Math.min(1, landV / PHYS.maxFall));
              p.squashX = 1.1 + 0.15 * hard;
              p.squashY = 0.9 - 0.17 * hard;
            }

            // Bouncy mushroom interaction
            if (plat.type === 'bouncy') this.bounceOff();

            // Fragile branch interaction
            if (plat.type === 'fragile') {
              if (plat.fragileTimer === undefined) {
                plat.fragileTimer = plat.crumbleAfter ?? 1.1; // generous 1.1s before breaking (ruin tiles set their own)
                if (plat.crumbleAfter !== undefined && !this.zoneHinted.crumble) {
                  this.zoneHinted.crumble = true;
                  this.addFloatingText('IT CRUMBLES! KEEP MOVING', p.x, p.y - 80, '#fdba74');
                }
              }
            }
            break;
          }
        }
      }

      // Pits and water: falling below the surface costs a life (Mario-style)
      const waterY = this.currentStage.waterY;
      const river = this.currentStage.rivers?.find((r) => p.x > r.x0 && p.x < r.x1);
      if (river && p.y > river.surfaceY + 8 && !this.isGameOver) {
        this.spawnWaterSplash(p.x, river.surfaceY);
        sound.playWhoosh();
        sound.playHitImpact(true);
        this.addFloatingText('SPLASH!', p.x, river.surfaceY - 40, '#7dd3fc');
        this.loseLife('water');
      } else if (waterY !== undefined && p.y > waterY + 20 && !this.isGameOver) {
        this.spawnWaterSplash(p.x, waterY);
        sound.playWhoosh();
        sound.playHitImpact(true);
        this.addFloatingText('SPLASH!', p.x, waterY - 40, '#7dd3fc');
        this.loseLife('water');
      } else if (p.y > this.currentStage.config.levelHeight + 120 && !this.isGameOver) {
        sound.playPlayerHurt();
        this.loseLife('pit');
      }

      // Checkpoints
      for (const cp of this.currentStage.checkpoints ?? []) {
        if (!cp.reached && Math.abs(p.x - cp.x) < 70 && p.y > cp.y - 150 && p.y < cp.y + 40) {
          cp.reached = true;
          // a flag touched while backtracking never replaces a later one (a tall climb goes up, a run goes right)
          const further = this.currentStage.config.objectiveType === 'ascent' ? cp.y < this.checkpoint.y : cp.x > this.checkpoint.x;
          if (further) this.checkpoint = { x: cp.x, y: cp.y };
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
      if (e.type === 'eagle') {
        // Harpy Eagle aerial trajectory & swoop attack cycle (fair, telegraphed, and easy to hit!)
        e.behaviorTimer += dt;
        if (!e.swoopPhase) e.swoopPhase = 'patrol';

        if (e.swoopPhase === 'patrol') {
          // Aerial patrol
          e.x += e.vx * dt;
          if (e.x < e.patrolMinX || e.x > e.patrolMaxX) {
            e.vx = Math.abs(e.vx) * (e.x < e.patrolMinX ? 1 : -1);
            e.facing = e.vx > 0 ? 1 : -1;
          }
          if (e.attackCooldown > 0) e.attackCooldown -= dt;

          // Spot player and initiate telegraphed swoop warning (never beyond its own patch of sky, never straight after a swoop)
          const home = (e.patrolMinX + e.patrolMaxX) / 2;
          if (e.attackCooldown <= 0 && Math.abs(e.x - p.x) < 260 && Math.abs(p.x - home) < (e.patrolMaxX - e.patrolMinX) / 2 + 300) {
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
            e.dive = undefined;
          }
        } else if (e.swoopPhase === 'swoop') {
          // A homing strafing run (harpyDive.ts): it follows the player's body, locks its line a beat before contact, then glides low
          if (!e.dive) e.dive = startDive(e, p);
          const prevX = e.x;
          const step = stepDive(e, e.dive, p, dt);
          e.facing = e.dive.vx >= 0 ? 1 : -1;
          void prevX;

          if (checkAABBCollision(...this.pBox(), e.x - 24, e.y - 18, 48, 36)) {
            if (p.ducking) {
              // Successfully ducked under swoop!
              this.addFloatingText('DUCKED! SLICK!', p.x, p.y - 40, '#86efac');
              sound.playWhoosh();
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.4;
              e.isAttacking = false;
              e.dive = undefined;
            } else {
              this.damagePlayer(1);
              e.swoopPhase = 'hover';
              e.hoverTimer = 1.0;
              e.isAttacking = false;
              e.dive = undefined;
            }
          } else if (step.done === 'passed') {
            // flew past: it settles into a low glide where it can be hit
            e.swoopPhase = 'hover';
            e.hoverTimer = 1.4;
            e.isAttacking = false;
            e.dive = undefined;
            this.addFloatingText('VULNERABLE!', e.x, e.y - 25, '#fde047');
          } else if (step.done === 'timeout') {
            // the player ran off: it gives up and climbs away
            e.swoopPhase = 'ascend';
            e.isAttacking = false;
            e.dive = undefined;
          }
        } else if (e.swoopPhase === 'hover') {
          // VULNERABLE LOW GLIDE: it faces Slomatt and settles at his height, within reach of a punch or kick
          e.hoverTimer = (e.hoverTimer ?? 1.4) - dt;
          e.facing = stepGlide(e, p, dt);
          if (e.hoverTimer <= 0) {
            e.swoopPhase = 'ascend';
          }
        } else if (e.swoopPhase === 'ascend') {
          // Gently ascend back to sky patrol
          e.y -= 110 * dt;
          // glide back toward its post while climbing
          const post = (e.patrolMinX + e.patrolMaxX) / 2;
          const toward = post > e.x ? 1 : -1;
          e.x += toward * Math.min(70, Math.abs(post - e.x)) * dt * 2;
          e.facing = toward;
          if (e.y <= (e.homeY ?? 310)) {
            e.y = e.homeY ?? 310;
            e.swoopPhase = 'patrol';
            e.attackCooldown = 4.0;
            e.facing = e.vx > 0 ? 1 : -1;
          }
        }
      } else if (isPredator(e.type)) {
        // Ground animals (snake, ocelot, jaguar, boa, caiman, tayra) each hunt in their own way (enemyBrain.ts), then
        // attack: telegraph -> committed attack -> vulnerable recovery
        const step = stepPredator(e, { x: p.x, y: p.y, facing: p.facing, ducking: p.ducking }, dt);
        // the tree snake has no call of its own: it hisses like the boa
        const call = e.type === 'snake' ? 'boa' : e.type;
        if (e.type === 'snake') {
          // the painted/vector snake reads these two flags for its red warning ring and its strike cycle
          e.isAttacking = e.state === 'rear' || e.state === 'strike';
          e.telegraphTimer = e.state === 'rear' ? Math.max(0, 0.38 - (e.stateT ?? 0)) : 0;
        }
        if (step.ev.notice) this.addFloatingText('?', e.x, e.y - (e.type === 'boa' ? 46 : 34), '#fde047');
        if (step.ev.telegraph) {
          sound.playPredator(call, 0);
          this.addFloatingText('!', e.x, e.y - (e.type === 'boa' ? 46 : 34), '#f97316');
        }
        if (step.ev.launch) sound.playPredator(call, 1);
        if (step.ev.impact) {
          sound.playPredator(call, 2);
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
        // a spiderling waits, then rushes in short bursts with a pause between (the pause is the moment to stomp it)
        e.animTimer += dt;
        const step = stepSpider(e, { x: p.x, y: p.y }, dt);
        if (step.ev.notice) this.addFloatingText('?', e.x, e.y - 30, '#fde047');
        for (const h of step.hurt) {
          if (checkAABBCollision(...this.pBox(), h.x, h.y, h.w, h.h)) {
            this.damagePlayer(1);
            break;
          }
        }
      } else if (e.type === 'frog') {
        // Poison frog hopping
        e.animTimer += dt;
        if (checkAABBCollision(...this.pBox(), e.x - 12, e.y - 10, 24, 20)) {
          this.damagePlayer(1);
        }
      }
    }

    separateHunters(this.enemies, dt);
    for (const e of this.enemies) if (!e.defeated && isPredator(e.type)) keepOnLedge(e);

    // --- Boss fight ---
    if (this.boss && this.bossDef && !this.boss.defeated) this.updateBoss(dt);
    if (this.clangCd > 0) this.clangCd -= dt;
    if (this.slowTimer > 0) this.slowTimer -= dt;

    // --- Collectibles Magnet Attraction (when Nectar Magnet power-up is active) ---
    if (p.activePowerUp === 'magnet') {
      for (const c of this.collectibles) {
        if (c.collected || c.type === 'cage' || c.type === 'exit_totem' || c.type === 'thorn_gate' || c.type === 'find') continue;
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

      if (c.type === 'find') {
        if (!c.hidden) {
          // a Keeper's Bell: just touch it
          if (distance2D(p.x, p.y - 20, c.x, c.y) < 40) this.collectFind(c);
          continue;
        }
        // a Hush Fern: crouch beside it for a moment and it gives something up; stand up and the search slowly fades
        const close = Math.abs(p.x - c.x) < 54 && Math.abs(p.y - (c.y + 26)) < 26 && p.grounded;
        c.near = close && !p.ducking;
        if (close && p.ducking) c.search = Math.min(1, (c.search ?? 0) + dt / FIND_SEARCH_SECONDS);
        else if ((c.search ?? 0) > 0) c.search = Math.max(0, (c.search ?? 0) - dt * 1.6);
        if ((c.search ?? 0) >= 1) this.collectFind(c);
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

    if (this.barrierMsgCooldown > 0) this.barrierMsgCooldown -= dt;
    // Interactive Exit Totem / Sacred Portal Encounter
    if (!this.exitTotemReached && this.currentStage.exitTotemX > 0) {
      // the door only counts when his body is really at it (rules.atExitDoor): level with it on the screen, past it, or
      // on another floor does not win. A sealed door stops him at its near side.
      const doorX = this.currentStage.exitTotemX;
      const doorY = this.currentStage.exitTotemY;
      if (isExitUnlocked ? atExitDoor(p, doorX, doorY) : atSealedDoor(p, doorX, doorY)) {
        if (isExitUnlocked) {
          this.exitTotemReached = true;
          sound.playVictory();
          this.spawnSparkBurst(this.currentStage.exitTotemX, p.y - 30, '#34d399');
          this.addFloatingText('SANCTUARY UNLOCKED! VICTORY!', p.x, p.y - 60, '#34d399');
        } else {
          // Push player back gently from sealed barrier and show clear reminder
          p.x = this.currentStage.exitTotemX - 35;
          p.vx = -140;
          if (this.barrierMsgCooldown <= 0) {
          this.barrierMsgCooldown = 1.2;
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
              : `🔒 Finish the goal to open the shrine!`;
          this.addFloatingText(msg, this.currentStage.exitTotemX - 40, p.y - 45, '#f87171');
          }
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
        objType === 'boss_lair' ? (bossDefeated ? 1 : 0) : currentProgress / Math.max(1, this.currentStage.config.targetCount),
        this.statLivesLost
      );

      this.callbacks.onStageStats?.(this.buildStats(true, stars));
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
    // the stage is over (game over / victory screen up): no heartbeat, and the screen's own music intensity stands
    if (this.isGameOver) {
      sound.setLowHealth(false);
      return;
    }
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

  /**
   * A boss with its own lair makes an entrance (see bossEntrance.ts): everything else holds still while the screen goes dark,
   * the eyes open, the boss is revealed, roars and its name lands. Returns true while it plays.
   */
  private stepEntrance(dt: number): boolean {
    const b = this.boss;
    const def = this.bossDef;
    if (!b || !def?.lair || b.defeated || !b.ai) return false;
    if (!this.entrance) {
      if (this.entranceDone) return false;
      this.entrance = { t: 0, total: takeEntranceLength(this.currentStage.config.id), roared: false, named: false };
      this.bossIntro = true; // the usual first roar is part of the entrance instead
      b.ai.alpha = 0;
      this.reportBoss();
    }
    const en = this.entrance;
    en.t += dt;
    const beat = entranceBeat(en.t, en.total);
    b.ai.alpha = beat.reveal;
    const world = this.currentStage.config.worldIndex;
    if (beat.roaring && !en.roared) {
      en.roared = true;
      sound.playBossRoar(world);
      this.camera.trauma = Math.max(this.camera.trauma, 0.85);
    }
    if (beat.nameAlpha > 0.5 && beat.nameIn < 0.06 && !en.named) {
      en.named = true;
      sound.playHitImpact(true, bossMaterial(world));
      this.camera.trauma = Math.max(this.camera.trauma, 0.5);
    }
    // a low rumble while it is revealed
    if (beat.reveal > 0.02 && beat.reveal < 0.98) this.camera.trauma = Math.max(this.camera.trauma, 0.22);
    this.camera.trauma = Math.max(0, this.camera.trauma - dt * 1.6);
    this.bossFrame(dt);
    this.updateCamera(dt);
    if (en.t >= en.total) {
      this.entrance = null;
      this.entranceDone = true;
      b.ai.alpha = 1;
      b.ai.state = 'roar';
      b.ai.t = 0;
      b.ai.hold = 0.35;
      b.ai.roarReason = 'enter';
      this.reportBoss();
    }
    return true;
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
      def.onPhase?.(b.phase, b, c);
      sound.playBossRoar(this.currentStage.config.worldIndex);
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
    const entering = !!this.entrance;
    const sig = `${b.hp}|${b.phase}|${b.defeated ? 1 : 0}|${entering ? 1 : 0}`;
    if (sig === this.bossSig) return;
    this.bossSig = sig;
    this.callbacks.onBossUpdate(b.defeated ? null : { name: def.name, hp: b.hp, maxHp: b.maxHp, phase: b.phase, hits: def.hits, color: def.color, entering });
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
    // in a tall narrow window the arena is wider than the screen: the boss makes its entrance close enough to be seen
    if (portrait && b.ai?.state === 'roar' && b.ai.roarReason === 'enter') b.x = Math.min(b.x, p.x + 540);
    let base = portrait ? Math.max(w / PORTRAIT_VIEW_W, h / levelH) : h / WORLD_VIEW_H;
    base = Math.max(0.5, Math.min(1.8, base));
    const baseViewW = w / base;
    const need = Math.abs(p.x - b.x) + 440 + Math.max(0, b.width - 140) * 0.6;
    // upright, the hero stays a readable size: the view never opens wider than ~720 units (the boss's head, the part you hit, is on the hero's side)
    const widest = portrait ? Math.max(baseViewW, 720) : arena.right - arena.left + 200;
    const want = Math.max(baseViewW, Math.min(need, widest));
    // the killing blow pushes the camera in
    const target = Math.max(0.4, (baseViewW / want) * (this.slowMoLeft > 0 ? 1.3 : 1));
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
    const face = inp.kickPressed ? inp.kickDir : 0;
    inp.megaPunchPressed = false;
    inp.kickPressed = false;
    inp.kickDir = 0;
    inp.punchPressed = false;
    // a press is remembered for most of a swing, so mashing during a miss still throws the next one the moment the last ends
    if (want) this.atkQueue = { want, ttl: 0.32, face };
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
        this.startAttack(q.want, q.face);
      }
    }
    this.syncAttackPose();
  }

  private startAttack(want: AttackWant, face = 0) {
    const p = this.player;
    const inp = this.input.state;
    const id = chooseMove(want, !p.grounded, this.lastPunch, this.chainTimer > 0);
    const move = MOVES[id];
    if (inp.left && !inp.right) p.facing = -1;
    else if (inp.right && !inp.left) p.facing = 1;
    else if (face) p.facing = face > 0 ? 1 : -1; // a flicked kick goes the way the thumb flicked
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
      const wr = this.bossDef ? weakRect(b, this.bossDef, this.currentStage.arena?.floor ?? 560) : null;
      if (rectsOverlap(box, hr) || (wr && rectsOverlap(box, wr))) {
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
    let vul = vulnerability(b);

    // roaring or dying: nothing gets through
    if (vul === 'closed') {
      this.hitstopTimer = Math.max(this.hitstopTimer, 0.03);
      sound.playHitImpact(false, 'armor');
      return;
    }

    // a giant has one weak point, up high: the body only clangs, and even the weak point is guarded unless it is glowing
    const wr = def ? weakRect(b, def, this.currentStage.arena?.floor ?? 560) : null;
    if (wr) {
      const onWeak = rectsOverlap(box, wr);
      if (!onWeak) {
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.04);
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(cp.x, cp.y, '#e2e8f0');
        if (this.clangCd <= 0) {
          this.clangCd = 0.6;
          this.addFloatingText(def?.aimText ?? 'TOO TOUGH! AIM HIGH', cp.x, cp.y - 30, '#cbd5e1');
        }
        return;
      }
      if (!weakOpen(b)) {
        // the head is covered while it is moving or attacking: a heavy blow can still rattle it, a light one clangs
        if (vul === 'open') vul = 'armored';
      }
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
      // a heavy blow rattles the boss; a second one in quick succession breaks the attack
      const broke = def ? interruptBoss(b, def, c) : false;
      if (!broke) {
        // it shrugged it off (poise held): the blow still counts, but for half
        // (a covered weak point takes nothing: the glow is the only time it hurts)
        const chip = def?.weak ? 0 : Math.max(1, Math.ceil(m.bossDamage / 2));
        b.hp = Math.max(0, b.hp - chip);
        b.hitFlashTimer = 0.1;
        this.hitstopTimer = Math.max(this.hitstopTimer, 0.05);
        sound.playHitImpact(false, 'armor');
        this.spawnSparkBurst(cp.x, cp.y, '#fde68a');
        if (this.clangCd <= 0) {
          this.clangCd = 0.45;
          this.addFloatingText('RATTLED!', b.x, b.y - b.height * 0.7, '#fde68a');
        }
        if (b.hp <= 0) this.startBossDeath(b);
        return;
      }
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
    if (this.bossDef?.lair) this.slowMoLeft = 1.2; // a giant's last hit plays in slow motion, the camera pushing in
    this.camera.trauma = 1;
    this.addFloatingText('K.O.!', b.x, b.y - b.height, '#fde047');
    this.spawnDebrisBurst(b.x, b.y, '#fde047');
  }

  /** an animal is beaten: it is launched away in its own style instead of vanishing */
  /** what happened this stage, for the Trophy Room */
  private buildStats(win: boolean, stars: number): StageStats {
    let floraTotal = 0;
    let floraCollected = 0;
    for (const c of this.collectibles) {
      if (c.type === 'flower' || c.type === 'leaf' || c.type === 'fruit') {
        floraTotal++;
        if (c.collected) floraCollected++;
      }
    }
    return {
      win,
      stars,
      livesLost: this.statLivesLost,
      heartsLost: this.statHeartsLost,
      floraTotal,
      floraCollected,
      timeSec: this.gameTime,
      timeLimit: this.currentStage.config.timeLimit,
      maxStompChain: this.statMaxStompChain,
      maxCombo: this.statMaxCombo,
      stomps: this.statStomps,
      kills: { ...this.statKills },
      seen: Array.from(this.statSeen),
    };
  }

  private knockOut(e: Enemy, dir: 1 | -1, label: string) {
    const p = this.player;
    e.defeated = true;
    if (e.id < 9000 && e.type !== 'boss' && e.type !== 'ant_hazard') this.statKills[e.type] = (this.statKills[e.type] ?? 0) + 1;
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
      if (e.type !== 'eagle') {
        const [lo, hi] = walkBounds(e);
        e.x = Math.max(lo - 14, Math.min(hi + 14, e.x));
      }
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
      this.statStomps++;
      this.statMaxStompChain = Math.max(this.statMaxStompChain, this.stompChain);
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

  /** let go of a rope (hurt, respawn, or a deliberate drop); `cooldown` is how long before it can be grabbed again */
  private letGoOfRope(cooldown: number) {
    const p = this.player;
    if (!p.hanging) return;
    p.hanging = false;
    this.ropeCooldown = cooldown;
  }

  /**
   * Shimmy ropes. Returns true while Slomatt is hanging from one (and this has done all his moving for the frame).
   * Grab: jump up so his hands reach the rope (or press Up under it). Move: Left/Right at a deliberate creep.
   * Let go: Down drops him, Jump hops off, and walking off either end lets go onto the ledge there.
   */
  private updateRope(dt: number): boolean {
    const p = this.player;
    this.ropeCooldown = Math.max(0, this.ropeCooldown - dt);
    if (!this.ropes.length || !this.skills.has('shimmy')) {
      if (p.hanging) p.hanging = false;
      return false;
    }
    const inp = this.input.state;
    let rope: Rope | undefined = p.hanging ? this.ropes.find((r) => r.id === this.ropeId) : undefined;

    if (!rope) {
      p.hanging = false;
      if (this.ropeCooldown > 0 || p.grounded || p.climbing || p.isVineSwinging || this.isGameOver) return false;
      const handY = p.y - HAND_REACH;
      for (const r of this.ropes) {
        if (p.x < r.x0 - 8 || p.x > r.x1 + 8) continue;
        const ry = ropeYAt(r, p.x);
        // his hands are on the rope: rising through it, or falling past it with Up held
        if (handY > ry - 12 && handY < ry + 30 && (p.vy < 40 || inp.up || this.upIntent > 0)) {
          rope = r;
          break;
        }
      }
      if (!rope) return false;
      // grab
      this.ropeId = rope.id;
      p.hanging = true;
      p.climbing = false;
      p.isVineSwinging = false;
      p.ducking = false;
      p.vx = 0;
      p.vy = 0;
      p.jumpsLeft = 1;
      p.isDoubleJumping = false;
      p.somersaultAngle = 0;
      this.ropeGrace = 0.25; // the press that got him up there must not also let go
      this.inputGrace = 0;
      inp.jumpPressed = false;
      this.jumpBufferTimer = 0;
      this.upIntent = 0;
      p.squashX = 1.12;
      p.squashY = 0.9;
      sound.playVineGrab();
      this.spawnSparkBurst(p.x, p.y - HAND_REACH, '#fde68a');
    }

    // hanging
    this.ropeGrace = Math.max(0, this.ropeGrace - dt);
    if (this.ropeGrace > 0) inp.jumpPressed = false;
    const dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
    p.grounded = false;
    p.vy = 0;
    p.vx = dir * ROPE_SPEED;
    if (dir !== 0) p.facing = dir as 1 | -1;
    p.x += p.vx * dt;
    p.walkCycle += Math.abs(p.vx) * dt * 0.08;
    const atEnd = p.x <= rope.x0 || p.x >= rope.x1;
    p.x = Math.max(rope.x0, Math.min(rope.x1, p.x));
    p.y = ropeYAt(rope, p.x) + HANG_DROP;

    // let go
    const off = (vx: number, vy: number, cool: number) => {
      p.hanging = false;
      this.ropeCooldown = cool;
      p.vx = vx;
      p.vy = vy;
    };
    if (inp.jumpPressed && this.ropeGrace <= 0) {
      inp.jumpPressed = false;
      const jd = dir !== 0 ? dir : p.facing;
      p.facing = jd as 1 | -1;
      off(jd * 230, -PHYS.jumpV * 0.82, 0.35);
      p.jumpsLeft = 1;
      this.launched = true;
      p.squashX = 0.8;
      p.squashY = 1.25;
      sound.playJump();
      this.spawnJumpDust(p.x, p.y);
      return false;
    }
    if (inp.down && this.ropeGrace <= 0) {
      off(0, 60, 0.4);
      p.jumpsLeft = 1;
      this.addFloatingText('DROP', p.x, p.y - 30, '#94a3b8');
      return false;
    }
    if (atEnd && dir !== 0 && ((dir < 0 && p.x <= rope.x0) || (dir > 0 && p.x >= rope.x1))) {
      // walked off the end: he lets go over the ledge and lands on it
      off(dir * 90, 0, 0.3);
      p.jumpsLeft = 2;
      return false;
    }
    return true;
  }

  private damagePlayer(amount: number) {
    const p = this.player;
    if (this.isGameOver || p.invincibleTimer > 0 || this.stompGrace > 0) return;

    this.statHeartsLost += amount;
    p.hp = Math.max(0, p.hp - amount);
    p.invincibleTimer = 1.2; // 1.2s invulnerability
    p.squashX = 1.3;
    p.squashY = 0.7; // hurt flinch
    this.letGoOfRope(0.6);
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
    this.statLivesLost++;
    this.callbacks.onLivesChange?.(this.lives, this.maxLives);
    if (this.lives <= 0) {
      this.isGameOver = true;
      sound.playDefeat();
      this.callbacks.onStageStats?.(this.buildStats(false, 0));
      this.callbacks.onDefeat(this.runScore);
      return;
    }
    this.hazards.length = 0;
    this.slowTimer = 0;
    this.drowsy = 0;
    this.drowsyShow = 0;
    this.windV = 0;
    this.dragSpeed = 1;
    this.dragJump = 1;
    // planks that crumbled since the checkpoint come back, or a respawn could leave a gap nobody can cross
    for (const pl of this.platforms) {
      if (pl.type === 'fragile') {
        pl.broken = false;
        pl.fragileTimer = undefined;
      }
    }
    // a liana that was mid-swing stops swinging
    for (const v of this.vines) {
      if (v.isSwingingVine) v.isSwingingVine = false;
    }
    // every animal loses its lock on him: whatever got him goes back to its business (it re-notices if he is still in range)
    for (const e of this.enemies) e.alertT = 0;
    p.hp = p.maxHp;
    p.x = this.checkpoint.x;
    p.y = this.checkpoint.y;
    p.vx = 0;
    p.vy = 0;
    p.grounded = false;
    p.climbing = false;
    p.isVineSwinging = false;
    this.letGoOfRope(0.5);
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

  /**
   * World 2 rivers. Before the platforms: the water body between the banks, with streaks that show the flow.
   * After them (`over`): a translucent sheet across the lower half of every log, so the logs sit in the water, not on it.
   */
  private drawRivers(ctx: CanvasRenderingContext2D, world: (typeof WORLDS_DATA)[number], over: boolean) {
    const rivers = this.currentStage.rivers;
    if (!rivers?.length) return;
    const cam = this.camera;
    const t = this.gameTime;
    const bottom = cam.y + cam.viewportHeight + 40;
    for (const r of rivers) {
      if (r.x1 < cam.x - 40 || r.x0 > cam.x + cam.viewportWidth + 40) continue;
      const a = Math.max(r.x0, cam.x - 20);
      const b = Math.min(r.x1, cam.x + cam.viewportWidth + 20);
      ctx.save();
      ctx.beginPath();
      ctx.rect(r.x0, r.surfaceY - 30, r.x1 - r.x0, bottom - r.surfaceY + 30);
      ctx.clip();
      const wave = (x: number) => r.surfaceY + Math.sin(x * 0.03 + t * 2.2 * r.dir) * 2.5 + Math.sin(x * 0.07 - t * 1.5 * r.dir) * 1.5;
      if (!over) {
        drawWater(ctx, world.id, a, b, r.surfaceY, bottom, t);
        // the current: pale streaks sliding along the surface the way the logs go
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        const span = 140;
        for (let k = Math.floor(a / span) - 1; k < b / span + 1; k++) {
          for (let row = 0; row < 3; row++) {
            const sx = (((k * span + row * 47 + t * r.speed * r.dir) % (r.x1 - r.x0 + span)) + (r.x1 - r.x0 + span)) % (r.x1 - r.x0 + span);
            const x = r.x0 + sx - span * 0.5;
            const y = wave(x) + 7 + row * 9;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + r.dir * 26, y);
            ctx.stroke();
          }
        }
      } else {
        const g = ctx.createLinearGradient(0, r.surfaceY, 0, r.surfaceY + 60);
        g.addColorStop(0, 'rgba(56, 148, 168, 0.55)');
        g.addColorStop(1, 'rgba(24, 90, 120, 0.8)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(a, bottom);
        ctx.lineTo(a, wave(a));
        for (let x = a; x <= b + 12; x += 12) ctx.lineTo(x, wave(x));
        ctx.lineTo(b, bottom);
        ctx.closePath();
        ctx.fill();
        // foam where the logs cut the surface
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = a; x <= b + 12; x += 12) {
          if (x === a) ctx.moveTo(x, wave(x));
          else ctx.lineTo(x, wave(x));
        }
        ctx.stroke();
      }
      ctx.restore();
    }
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
    const maxY = this.currentStage.config.levelHeight - vh;
    // a normal stage never shows past its top; a boss arena in a tall window may (the sky simply continues)
    this.camera.y = Math.max(this.currentStage.arena ? Math.min(0, maxY) : 0, Math.min(maxY, this.camera.y));
  }

  /** how much early-stage help is in force on this stage (1 on stage 1-1, fading to 0 by stage 25) */
  private assistNow(): number {
    const c = this.currentStage.config;
    return easeAssist((c.worldIndex - 1) * 10 + c.miniIndex);
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
    // a boss with its own lair: either the backdrop is darkened and re-lit, or (lairOwnsScene) the lair paints all of it itself
    const lair = this.currentStage.arena && this.bossDef?.lair ? this.bossDef.lair : null;
    const ownScene = !!lair && lairOwnsScene(lair);
    if (!ownScene) renderScenery(ctx, world.id, this.camera.x, this.camera.y, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime, this.quality > 0);
    const lairView = { x: this.camera.x, y: this.camera.y, vw: this.camera.viewportWidth, vh: this.camera.viewportHeight };
    if (lair && this.currentStage.arena) drawLairBack(ctx, lair, lairView, this.currentStage.arena, this.gameTime, this.boss?.x ?? this.currentStage.arena.right);

    // the secret Hollow is a dusk of purple thorn-light
    if (this.currentStage.config.secret) {
      ctx.fillStyle = 'rgba(46, 16, 101, 0.5)';
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }

    // 2. Render In-World Game Elements with Camera Transform
    ctx.save();
    ctx.translate(-Math.round(this.camera.x) + shakeX, -Math.round(this.camera.y) + shakeY);

    this.drawWaterAndFlags(ctx, world);
    this.drawRivers(ctx, world, false);

    // Render In-World Trees, Vines and Platforms
    if (ownScene && lair) drawLairObjects(ctx, lair, this.platforms, this.vines, this.currentStage.trees, this.camera, this.gameTime);
    else renderWorldObjects(
      ctx,
      world.id,
      this.platforms,
      this.vines,
      this.currentStage.trees,
      this.camera,
      this.gameTime
    );

    this.drawRivers(ctx, world, true);
    drawCrumbleTiles(ctx, this.platforms, { x: this.camera.x, y: this.camera.y, w: this.camera.viewportWidth, h: this.camera.viewportHeight }, this.gameTime);
    drawZoneBases(ctx, this.currentStage.zones, { x: this.camera.x, y: this.camera.y, w: this.camera.viewportWidth, h: this.camera.viewportHeight }, this.gameTime);
    if (lair && this.currentStage.arena) drawLairWorld(ctx, lair, this.currentStage.arena, lairView, this.gameTime);

    // Shimmy ropes (behind the hero)
    if (this.ropes.length) {
      drawRopes(ctx, this.ropes, this.gameTime, {
        hangingId: this.player.hanging ? this.ropeId : undefined,
        canGrab: this.skills.has('shimmy'),
        px: this.player.x,
        py: this.player.y,
        pGrounded: this.player.grounded,
      });
    }

    // Render Collectibles
    this.collectibles.forEach((item) => {
      drawCollectible(ctx, item, this.gameTime, this.currentStage.config.worldIndex, this.currentStage.config.miniIndex);
    });

    // Render Jennifur if present in level
    if (this.currentStage.daisyX !== undefined && this.currentStage.daisyY !== undefined) {
      // the painted Jennifur (scared while she is held, cheering once rescued), else the vector one
      let paintedJen = false;
      if (jennifurSpriteReady()) {
        ctx.save();
        ctx.translate(this.currentStage.daisyX, this.currentStage.daisyY);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        paintedJen = drawJennifurSprite(ctx, this.daisyRescued ? 'cheer' : 'scared', this.gameTime, 0.8);
        ctx.restore();
      }
      if (!paintedJen) {
        drawGirlfriendDaisy(
          ctx,
          this.currentStage.daisyX,
          this.currentStage.daisyY,
          this.gameTime,
          this.daisyRescued
        );
      }
    }

    // polish prototype: this stage's lighting rig (null when the switch is off)
    const rig: Rig | null = polishEnabled() && polishTier() < 2 ? rigFor(lookFor(world.id), world.id, getSceneSeed()) : null;
    if (rig) {
      // fliers throw a shadow on the ground below them (walkers already carry their own)
      for (const e of this.enemies) {
        if (e.defeated || e.type !== 'eagle') continue;
        drawGroundShadow(ctx, rig, this.platforms, e.x, e.y + e.height * 0.5, e.width * 0.45, 0.8);
      }
    }

    // Render Enemies
    this.enemies.forEach((enemy) => {
      if (enemy.defeated && enemy.koTimer > (enemy.koLife ?? 0)) return;
      const draw = () => {
        if (enemy.type === 'snake') {
          if (!drawSnakeSprite(ctx, enemy, this.gameTime)) drawTreeSnake(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'eagle') {
          if (!drawEagleSprite(ctx, enemy, this.gameTime)) drawHarpyEagle(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'ocelot') {
          if (!drawOcelotSprite(ctx, enemy, this.gameTime)) drawOcelot(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'jaguar') {
          if (!drawJaguarSprite(ctx, enemy, this.gameTime)) drawJaguar(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'boa') {
          if (!drawBoaSprite(ctx, enemy, this.gameTime)) drawBoa(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'caiman') {
          if (!drawCaimanSprite(ctx, enemy, this.gameTime)) drawCaiman(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'tayra') {
          if (!drawTayraSprite(ctx, enemy, this.gameTime)) drawTayra(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'frog') {
          if (!drawFrogSprite(ctx, enemy, this.gameTime)) drawHazardEntity(ctx, enemy, this.gameTime);
        } else if (enemy.type === 'spider') {
          if (!drawSpiderSprite(ctx, enemy, this.gameTime, this.player.x)) drawHazardEntity(ctx, enemy, this.gameTime);
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
    if (rig) {
      const hp = this.player;
      drawGroundShadow(ctx, rig, this.platforms, hp.x, hp.y, 30 * (hp.ducking ? 1.3 : 1.05));
      drawBackGlow(ctx, rig, hp.x, hp.y - 38, 78, 0.13);
      if (this.quality === 0 && polishTier() === 0 && !pskip('lit')) drawLit(ctx, rig, dpr * this.zoom, hp.x, hp.y, (c) => drawHeroSloth(c, hp, this.gameTime));
      else drawHeroSloth(ctx, hp, this.gameTime);
    } else drawHeroSloth(ctx, this.player, this.gameTime);
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
      const r = pt.size * (pt.life / pt.maxLife);
      if (pt.type === 'star') {
        // a four-pointed sparkle
        const k = r * 1.7;
        ctx.moveTo(pt.x, pt.y - k);
        ctx.quadraticCurveTo(pt.x, pt.y, pt.x + k, pt.y);
        ctx.quadraticCurveTo(pt.x, pt.y, pt.x, pt.y + k);
        ctx.quadraticCurveTo(pt.x, pt.y, pt.x - k, pt.y);
        ctx.quadraticCurveTo(pt.x, pt.y, pt.x, pt.y - k);
      } else {
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
      }
      ctx.fill();
    });

    drawZoneEffects(ctx, this.currentStage.zones, { x: this.camera.x, y: this.camera.y, w: this.camera.viewportWidth, h: this.camera.viewportHeight }, this.gameTime);

    // Render Floating Combat Texts
    ctx.textAlign = 'center';
    ctx.font = 'bold 15px Fredoka, sans-serif';
    this.floatingTexts.forEach((ft) => {
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    });

    ctx.restore(); // end world transform

    // 3. Render Foreground Foliage (Framing screen edges)
    setWeatherAvoid(this.player.x - this.camera.x, this.player.y - 28 - this.camera.y);
    if (lair) drawLairFront(ctx, lair, lairView, this.gameTime);
    else renderOverlay(ctx, world.id, this.camera.x, this.camera.viewportWidth, this.camera.viewportHeight, this.gameTime, this.quality > 0);
    if (rig && this.quality === 0 && polishTier() === 0) drawBloom(ctx, rig, this.camera.viewportWidth, this.camera.viewportHeight);
    drawDrowsyVeil(ctx, this.camera.viewportWidth, this.camera.viewportHeight, this.drowsyShow, this.gameTime);
    if (this.darkShow > 0.01) {
      const cx0 = this.camera.x;
      const cy0 = this.camera.y;
      const lights: Array<{ x: number; y: number; r: number }> = [];
      for (const z of this.currentStage.zones ?? []) {
        if (z.kind !== 'dark' || !z.lights || z.x1 < cx0 - 300 || z.x0 > cx0 + this.camera.viewportWidth + 300) continue;
        for (const l of z.lights) lights.push({ x: l.x - cx0, y: l.y - cy0, r: l.r });
      }
      // every flower and leaf glows a little, so a reward is never lost in the dark
      for (const c of this.collectibles) {
        if (c.collected || (c.type !== 'flower' && c.type !== 'leaf')) continue;
        if (c.x < cx0 - 80 || c.x > cx0 + this.camera.viewportWidth + 80) continue;
        lights.push({ x: c.x - cx0, y: c.y - cy0, r: 62 });
      }
      drawDarkness(ctx, this.camera.viewportWidth, this.camera.viewportHeight, this.darkShow, { x: this.player.x - cx0, y: this.player.y - 30 - cy0 }, lights, this.gameTime);
    }
    if (this.respawnFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.respawnFlash / 0.6 * 0.7})`;
      ctx.fillRect(0, 0, this.camera.viewportWidth, this.camera.viewportHeight);
    }

    if (this.entrance && this.boss && this.bossDef && this.currentStage.arena) {
      const head = weakRect(this.boss, this.bossDef, this.currentStage.arena.floor);
      drawEntrance(
        ctx,
        {
          vw: this.camera.viewportWidth,
          vh: this.camera.viewportHeight,
          eyeX: head ? head.x + head.w / 2 - this.camera.x : this.camera.viewportWidth / 2,
          eyeY: head ? head.y + head.h / 2 - this.camera.y : this.camera.viewportHeight / 2,
          name: this.bossDef.name,
          color: this.bossDef.color,
          eyeRgb: this.bossDef.entrance?.eye,
          darkRgb: this.bossDef.entrance?.dark,
        },
        entranceBeat(this.entrance.t, this.entrance.total),
        this.gameTime
      );
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
