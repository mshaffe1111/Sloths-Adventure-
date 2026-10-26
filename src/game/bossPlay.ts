/**
 * bossPlay — the real game engine (engine.ts) running a boss fight one 30 fps frame at a time with no screen, for the tests that must know
 * whether a person can really win it (bossFair.test.ts). The stage is built as the game builds it, every frame is the engine's own update
 * (with the game loop's hitstop and slow motion), and the controls are the pad's: left, right, up, down, jump (held), a new jump press, punch.
 * Nothing is faked for the hero: he is hurt, loses lives and respawns as in the game.
 *
 * It also logs every opening the boss gives (the weak point glowing): when it opened, where Pokey and the spot were, and how long it lasted.
 */
import { headlessScreen } from './bossPlayDom.ts';
import { GameEngine } from './engine.ts';
import { generateAllLevels } from './worldsData.ts';
import { reloadDifficulty, DIFFICULTY_KEY } from './difficulty.ts';
import { EASY_OPEN_MUL, openLeft, opensSoon, weakOpen, weakRect } from './bossAI.ts';
import type { BossDef } from './bossAI.ts';
import type { BossEntity, InputState, LevelConfig, PlayerState } from './types.ts';

export const DT = 1 / 30;

/** what the thumbs are doing this frame */
export interface Pad {
  left?: boolean;
  right?: boolean;
  up?: boolean;
  down?: boolean;
  /** jump is held */
  jump?: boolean;
  /** a new jump press this frame (it is held too) */
  press?: boolean;
  punch?: boolean;
}

/** the pad, with the real input's buffers: a jump press waits 0.16 s to be used, a punch 0.12 s (inputEngine.ts) */
class FakeInput {
  state: InputState = {
    left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false, kickPressed: false,
    kickDir: 0, megaPunchPressed: false, layerSwitchPressed: false, touchJoystickAngle: null, touchJoystickMagnitude: 0,
  };
  source: 'keys' | 'pad' | 'gesture' = 'gesture';
  airJumpReady = false;
  kickNear = true;
  onVine = false;
  megaReady = true;
  onFocusLost = null;
  jumpBuffer = 0;
  punchBuffer = 0;
  update(dt: number) {
    if (this.jumpBuffer > 0) {
      this.jumpBuffer -= dt;
      if (this.jumpBuffer <= 0) this.state.jumpPressed = false;
    } else this.state.jumpPressed = false;
    if (this.punchBuffer > 0) {
      this.punchBuffer -= dt;
      if (this.punchBuffer <= 0) this.state.punchPressed = false;
    } else this.state.punchPressed = false;
    this.state.kickPressed = false;
    this.state.megaPunchPressed = false;
    this.state.layerSwitchPressed = false;
  }
  triggerHaptic() {}
  clearAll() {
    Object.assign(this.state, { left: false, right: false, up: false, down: false, jumpPressed: false, jumpHeld: false, punchPressed: false });
    this.jumpBuffer = 0;
    this.punchBuffer = 0;
  }
}

const levels = generateAllLevels();
const levelConfig = (id: string): LevelConfig => {
  const c = levels.find((l) => l.id === id);
  if (!c) throw new Error(`no stage ${id}`);
  return { ...c, unlocked: true };
};

/** one opening the boss gave: the weak point glowing */
export interface Opening {
  /** the move it followed ('stun' when it was a crash or a stagger) */
  move: string;
  state: 'rec' | 'stun';
  /** game time it opened, and how long it stayed open (s) */
  t0: number;
  dur: number;
  /** where Pokey's feet were when it opened, and the spot then */
  px: number;
  py: number;
  spot: { x: number; y: number; w: number; h: number };
  /** hit points it took */
  taken: number;
  /** seconds from it opening to the first hit that landed in it (-1: none) */
  firstHit: number;
  /** how long it would have stayed open untouched (a boss that has taken its fill pulls back early) */
  full: number;
  /** it was cut short by a new phase or the last hit, not by its own end */
  cut: boolean;
  /** seconds from the bot noticing it to standing where a hit lands (bossBot.ts; -1: never got there) */
  reach: number;
  /** seconds from it opening to the bot noticing it */
  seen: number;
  /** the weak point was warming up (the warning glow) in the frame before it opened */
  warned: boolean;
  /** frames it was open, and frames of those the glowing spot was wholly off the screen */
  frames: number;
  offscreen: number;
}

/** one wind-up: when it began, how long it lasted, and whether the boss was on the screen as it began */
export interface Tell {
  move: string;
  t0: number;
  dur: number;
  onScreen: boolean;
}

/** the engine's private parts this harness reads and sets (a test seam: the names are the engine's own) */
type Engine = Record<string, any>;

/** engine work that only paints or sounds: skipped (it changes nothing in the fight) */
const COSMETIC = ['updateSound', 'spawnSparkBurst', 'spawnJumpDust', 'spawnDoubleJumpBurst', 'spawnDebrisBurst', 'spawnKickHitBurst', 'spawnClawHitSparks', 'recordPokey'];

export class BossPlay {
  readonly e: Engine;
  readonly input = new FakeInput();
  readonly openings: Opening[] = [];
  readonly tells: Tell[] = [];
  /** Dot's lines, and when */
  readonly guides: Array<{ t: number; text: string }> = [];
  /** every hit point the hero lost, and the game time */
  readonly hurt: number[] = [];
  /** the boss went down */
  won = false;
  lost = false;
  cur: Opening | null = null;
  private hp0 = 0;

  constructor(readonly id: string, readonly easy = false, screen: { w: number; h: number } = { w: 844, h: 390 }) {
    try {
      // (a first meeting: Dot's tips not heard yet)
      localStorage.clear();
      localStorage.setItem(DIFFICULTY_KEY, easy ? 'easy' : 'normal');
    } catch {
      /* no storage */
    }
    reloadDifficulty();
    const noop = () => {};
    const e = new GameEngine(headlessScreen(screen.w, screen.h), levelConfig(id), this.input as never, {
      onProgressUpdate: noop, onVictory: () => (this.won = true), onDefeat: () => (this.lost = true), onGameOver: noop,
    } as never) as unknown as Engine;
    this.e = e;
    for (const m of COSMETIC) e[m] = noop;
    const say = e.guide.bind(e);
    e.guide = (text: string, s: number) => {
      this.guides.push({ t: e.gameTime, text });
      say(text, s);
    };
    e.inputGrace = 0;
    e.introT = 99;
    this.hp0 = e.player.hp;
  }

  get p(): PlayerState {
    return this.e.player;
  }
  get boss(): BossEntity {
    return this.e.boss;
  }
  get def(): BossDef {
    return this.e.bossDef;
  }
  get arena(): { left: number; right: number; floor: number } {
    return this.e.currentStage.arena;
  }
  get t(): number {
    return this.e.gameTime;
  }
  get beaten(): boolean {
    return !!this.boss.defeated || this.boss.ai?.state === 'dying';
  }
  /** the weak point now, and whether it is glowing */
  get spot() {
    return weakRect(this.boss, this.def, this.arena.floor);
  }
  get open(): boolean {
    return weakOpen(this.boss, this.def) && this.boss.ai?.state !== 'dying';
  }

  /** skip the entrance (the first meeting's long one is a cut scene: nothing can happen in it) */
  skipEntrance() {
    const e = this.e;
    while (e.entrance || !e.entranceDone) {
      this.frame();
      if (e.gameTime > 30) throw new Error('the entrance never ended');
    }
  }

  /** one frame with these controls, as the game loop runs it (a hitstop holds the world; a giant's last hit plays slowly) */
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
    const e = this.e;
    const hpBefore = e.player.hp;
    const livesBefore = e.lives;
    if (e.hitstopTimer > 0) e.hitstopTimer -= DT;
    else {
      let sdt = DT * (e.speedScale ?? 1);
      if (e.slowMoLeft > 0) {
        e.slowMoLeft -= DT;
        sdt *= 0.3;
      }
      e.update(sdt);
    }
    const lostHp = e.lives < livesBefore ? hpBefore : Math.max(0, hpBefore - e.player.hp);
    for (let i = 0; i < lostHp; i++) this.hurt.push(e.gameTime);
    this.watch();
  }

  /** note the openings as they come and go */
  private soon = false;
  private lastState = '';
  private watch() {
    const b = this.boss;
    const st = b.ai?.state ?? '';
    const last = this.tells[this.tells.length - 1];
    if (st === 'tell' && this.lastState !== 'tell') {
      const c = this.e.camera;
      const onScreen = b.x + b.width / 2 > c.x && b.x - b.width / 2 < c.x + c.viewportWidth;
      this.tells.push({ move: b.ai!.move ?? '?', t0: this.t, dur: 0, onScreen });
    } else if (st === 'tell' && last) last.dur = this.t - last.t0 + DT;
    this.lastState = st;
    const soon = opensSoon(b, this.def);
    const open = this.open && !this.beaten;
    if (open && this.cur) {
      const c = this.e.camera;
      const s = this.spot!;
      this.cur.frames++;
      if (!(s.x + s.w > c.x && s.x < c.x + c.viewportWidth && s.y + s.h > c.y && s.y < c.y + c.viewportHeight)) this.cur.offscreen++;
    }
    if (open && !this.cur) {
      const st = b.ai!.state as 'rec' | 'stun';
      this.cur = { move: st === 'stun' ? `${b.ai!.move ?? '?'}:stun` : b.ai!.move ?? '?', state: st, t0: this.t, dur: 0, px: this.p.x, py: this.p.y, spot: { ...this.spot! }, taken: 0, firstHit: -1, full: openLeft(b, this.def, this.easy ? EASY_OPEN_MUL : 1) + DT, cut: false, reach: -1, seen: -1, warned: this.soon, frames: 0, offscreen: 0 };
      this.hp0 = b.hp;
    } else if (open && this.cur) {
      // a recovery that turns into a stun (or the other way) is still one opening
      this.cur.dur = this.t - this.cur.t0;
      this.cur.taken = this.hp0 - b.hp;
      if (this.cur.taken > 0 && this.cur.firstHit < 0) this.cur.firstHit = this.cur.dur;
    } else if (!open && this.cur) {
      this.cur.dur = this.t - this.cur.t0;
      this.cur.taken = this.hp0 - b.hp;
      if (this.cur.taken > 0 && this.cur.firstHit < 0) this.cur.firstHit = this.cur.dur;
      this.cur.cut = b.ai!.state === 'roar' || b.ai!.state === 'dying' || b.hp <= 0;
      this.openings.push(this.cur);
      this.cur = null;
    }
    this.soon = soon;
  }

  /** stand still for this many seconds */
  wait(seconds: number) {
    for (let i = 0; i < Math.round(seconds / DT); i++) this.frame();
  }
}
