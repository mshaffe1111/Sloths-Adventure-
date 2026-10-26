/**
 * realPlay — the real game engine (engine.ts), run one 30 fps frame at a time with no screen, for the tests that must know what the
 * game itself lets Pokey do rather than what a model of it says (the level check, levelCheck.ts, works from a reach model). The stage is
 * built exactly as the game builds it (generateStage with the layout roll), every frame is the engine's own update, and the controls are
 * the pad's: left, right, up, down, jump (held) and punch.
 *
 * The harness only adds two things a player cannot do, both of them shortcuts that change no rule: it can stand Pokey anywhere he could
 * walk to (`stand`, `hang`, `climb`) and it keeps him from being hurt (a rock or a dive costs time, never the way on). A fall into the
 * water, the mist or a pit is noted (`died`) and ends the move instead of sending him back to a flag.
 */
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { generateAllLevels } from './worldsData.ts';
import { setLayoutVariant } from './stageGenerator.ts';
import { newAirDrive } from './physics.ts';
import { newGlide } from './glide.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, InputState, LevelConfig, Platform, PlayerState, Rope, Vine } from './types.ts';

export const DT = 1 / 30;

/** what the thumbs are doing this frame */
export interface Pad {
  left?: boolean;
  right?: boolean;
  /** up on its own (climbing a trunk); a jump presses up too, as the touch flick and the keys do */
  up?: boolean;
  down?: boolean;
  /** jump is held */
  jump?: boolean;
  /** a new jump press this frame (it is held too) */
  press?: boolean;
  punch?: boolean;
  /** a kick this frame: the way a touch flick throws it (-1 left, 1 right), or 0 as a key or button does (the way he steers or faces) */
  kick?: -1 | 0 | 1;
}

/** the pad, with the real input's jump buffer: a press waits 0.16 s to be used (inputEngine.ts) */
class FakeInput {
  state: InputState = {
    left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false,
    kickDir: 0, megaPunchPressed: false, layerSwitchPressed: false, touchJoystickAngle: null, touchJoystickMagnitude: 0,
  };
  source: 'keys' | 'pad' | 'gesture' = 'keys';
  airJumpReady = false;
  kickNear = true;
  onVine = false;
  megaReady = true;
  onFocusLost = null;
  jumpBuffer = 0;
  punchBuffer = 0;
  kickBuffer = 0;
  update(dt: number) {
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= dt;
      if (this.jumpBuffer <= 0) this.state.jumpPressed = false;
    } else this.state.jumpPressed = false;
    if (this.punchBuffer > 0) {
      this.punchBuffer -= dt;
      if (this.punchBuffer <= 0) this.state.punchPressed = false;
    } else this.state.punchPressed = false;
    if (this.kickBuffer > 0) {
      this.kickBuffer -= dt;
      if (this.kickBuffer <= 0) this.state.kickPressed = false;
    } else this.state.kickPressed = false;
    this.state.megaPunchPressed = false;
    this.state.layerSwitchPressed = false;
  }
  triggerHaptic() {}
  clearAll() {
    Object.assign(this.state, { left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false });
    this.jumpBuffer = 0;
    this.punchBuffer = 0;
    this.kickBuffer = 0;
    this.state.kickPressed = false;
    this.state.kickDir = 0;
  }
}

const levels = generateAllLevels();
export const levelConfig = (id: string): LevelConfig => {
  const c = levels.find((l) => l.id === id);
  if (!c) throw new Error(`no stage ${id}`);
  return { ...c, unlocked: true };
};

/** the engine's private parts this harness reads and sets (a test seam: the names are the engine's own) */
type Engine = Record<string, any>;

/** engine work that only paints, sounds or explains: skipped (it changes nothing Pokey can do) */
const COSMETIC = [
  'updateCamera', 'updateSound', 'markWayDodge', 'lessonTick', 'watchForStuck', 'recordPokey', 'spawnSparkBurst', 'spawnJumpDust',
  'spawnDoubleJumpBurst', 'spawnDebrisBurst', 'spawnWaterSplash', 'spawnKickHitBurst', 'spawnClawHitSparks', 'spawnEagleFeatherBurst',
  'addFloatingText',
];

export class RealPlay {
  readonly e: Engine;
  readonly input = new FakeInput();
  readonly stage: GeneratedStage;
  /** a fall into the water, the mist or a pit happened since the last stand/hang */
  died = false;
  /** every line Dot said (the stage hints and the World 4 tips), in order, with where he was */
  readonly said: Array<{ text: string; x: number; y: number; t: number }> = [];
  /** keep him from being hurt (default) */
  safe = true;

  constructor(readonly id: string, readonly seed: number) {
    setLayoutVariant(seed);
    const noop = () => {};
    const e = new GameEngine(headlessCanvas(), levelConfig(id), this.input as never, {
      onProgressUpdate: noop, onVictory: noop, onDefeat: noop, onGameOver: noop,
    } as never) as unknown as Engine;
    setLayoutVariant(null);
    this.e = e;
    this.stage = e.currentStage;
    // (World 5's spiders crouch only in full view on the screen, w5Kit SPIDER5.edge: there the camera is play, not paint, and runs)
    for (const m of COSMETIC) if (!(m === 'updateCamera' && e.w5)) e[m] = noop;
    const guide = e.guide.bind(e);
    e.guide = (text: string, seconds: number) => {
      this.said.push({ text, x: e.player.x, y: e.player.y, t: e.gameTime });
      guide(text, seconds);
    };
    e.loseLife = () => {
      this.died = true;
    };
    e.inputGrace = 0;
  }

  get p(): PlayerState {
    return this.e.player;
  }
  get t(): number {
    return this.e.gameTime;
  }
  set t(v: number) {
    this.e.gameTime = v;
  }
  get platforms(): Platform[] {
    return this.e.platforms;
  }
  get vines(): Vine[] {
    return this.e.vines;
  }
  get ropes(): Rope[] {
    return this.e.ropes;
  }
  get collectibles(): Collectible[] {
    return this.e.collectibles;
  }
  /** World 4's run state (w4Play.ts), when the stage has one */
  get w4(): Engine | null {
    return this.e.w4;
  }
  /** the platform he is standing on (-1: none) */
  get standingOn(): number {
    return this.e.standingOnId;
  }

  /** clear everything a move leaves behind: the controls, the timers that carry over from one frame to the next, the leaf */
  private settle() {
    const e = this.e;
    const p = this.p;
    Object.assign(p, {
      vx: 0, vy: 0, climbing: false, isVineSwinging: false, hanging: false, ducking: false, jumpsLeft: 2, isDoubleJumping: false,
      punching: false, kicking: false, pushing: false, bounce: undefined,
    });
    p.invincibleTimer = this.safe ? 1e9 : 0;
    Object.assign(e, {
      coyoteTimer: 0, jumpBufferTimer: 0, upIntent: 0, climbGrace: 0, climbAssist: 0, climbSideTimer: 0, swingGrace: 0, vineCooldownTimer: 0,
      lastReleasedVineId: -1, launched: false, airDrive: newAirDrive(), glide: newGlide(), inputGrace: 0, ropeCooldown: 0, ropeGrace: 0,
      atk: null, atkQueue: null, standingOnId: -1, isGameOver: false,
    });
    if (e.w4) e.w4.groundY = NaN;
    // (World 5: no silk, sleep or stillness carried over from the last move)
    if (e.w5) e.w5.calm();
    this.input.clearAll();
    this.died = false;
    this.placed = true;
  }
  /** he was just put somewhere: on a stage whose camera runs, the view cuts to him on the next frame (as at a flag) */
  private placed = false;

  /** stand him at (x, y): his feet on the top of a platform there */
  stand(x: number, y: number) {
    this.settle();
    Object.assign(this.p, { x, y, grounded: true });
  }

  /** put him in the air at (x, y), moving (vx, vy) */
  fly(x: number, y: number, vx = 0, vy = 0, jumpsLeft = 1) {
    this.settle();
    Object.assign(this.p, { x, y, vx, vy, grounded: false, jumpsLeft });
  }

  /** on a climbing trunk or vine, at height y */
  climb(v: Vine, y: number) {
    this.settle();
    Object.assign(this.p, { x: v.x, y: Math.max(v.topY - 4, Math.min(v.bottomY + 4, y)), grounded: false, climbing: true });
  }

  /** hanging from a rope at x */
  hang(r: Rope, x: number, y: number) {
    this.settle();
    Object.assign(this.p, { x, y, grounded: false, hanging: true });
    this.e.ropeId = r.id;
  }

  /** swinging on a liana in a given swing state (as caught: see `swingState`) */
  swing(v: Vine, s: { angle: number; omega: number; len: number }) {
    this.settle();
    const p = this.p;
    Object.assign(p, {
      x: v.x + Math.sin(s.angle) * s.len, y: v.topY + Math.cos(s.angle) * s.len, grounded: false, isVineSwinging: true, swingVineId: v.id,
      swingAngle: s.angle, swingAngularVelocity: s.omega, swingLength: s.len,
    });
  }

  swingState(): { angle: number; omega: number; len: number } {
    const p = this.p;
    return { angle: p.swingAngle ?? 0, omega: p.swingAngularVelocity ?? 0, len: p.swingLength ?? 100 };
  }

  /** one frame with these controls */
  frame(pad: Pad = {}) {
    const s = this.input.state;
    s.left = !!pad.left && !pad.right;
    s.right = !!pad.right && !pad.left;
    s.down = !!pad.down;
    s.up = !!pad.up || !!pad.jump || !!pad.press;
    s.jumpHeld = !!pad.jump || !!pad.press;
    if (pad.press) {
      s.jumpPressed = true;
      this.input.jumpBuffer = 0.16;
    }
    if (pad.punch) {
      s.punchPressed = true;
      this.input.punchBuffer = 0.12;
    }
    if (pad.kick !== undefined) {
      s.kickPressed = true;
      s.kickDir = pad.kick;
      this.input.kickBuffer = 0.14;
    }
    if (this.safe) this.p.invincibleTimer = Math.max(this.p.invincibleTimer, 1e9);
    if (this.placed && this.e.w5) {
      const c = this.e.camera;
      c.x = c.targetX = Math.max(0, this.p.x - c.viewportWidth * 0.45);
      c.y = c.targetY = Math.max(0, this.p.y - c.viewportHeight * 0.55);
    }
    this.placed = false;
    this.e.update(DT);
  }

  /**
   * swap the stage for a bare world of these pieces (no wind, no water, no World 4 pieces, no shrine, nothing to pick up), to measure
   * the moves themselves
   */
  bare(platforms: Platform[], vines: Vine[] = [], ropes: Rope[] = []) {
    const e = this.e;
    Object.assign(e, { platforms, vines, ropes, collectibles: [], w4: null, proto: null });
    const st = e.currentStage as GeneratedStage;
    Object.assign(st, { zones: [], waterY: undefined, rivers: [], exitTotemX: 0, checkpoints: [], config: { ...st.config, levelHeight: 100000, levelWidth: 100000 } });
  }

  /** stand still for this many seconds */
  wait(seconds: number) {
    for (let i = 0; i < Math.round(seconds / DT); i++) this.frame();
  }
}
