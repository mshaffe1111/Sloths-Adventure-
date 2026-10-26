/**
 * bossBot — a scripted player for the boss fights, for the tests that ask whether a person can win them (bossFair.test.ts). It plays the
 * real engine through bossPlay.ts with the pad's controls only, and it is no perfect player: it sees a wind-up or an opening only after a
 * person's reaction time (plus a random extra), its taps come at a thumb's pace and register when the finger lifts, and its jumps take
 * the flick's moment to register.
 *
 * What it does is split in two. A tactic (one per boss, at the bottom) looks at what the bot has noticed and picks a goal: stand there,
 * get onto that ledge, jump now, hit that spot. The driver turns the goal into thumbs, frame by frame, with the engine's own physics
 * doing the rest (it never sets where Pokey is).
 */
import { BossPlay, DT } from './bossPlay.ts';
import type { Pad } from './bossPlay.ts';
import type { Platform } from './types.ts';
import { PROWLER_POOLS, POOL_HALF } from './prowlerPools.ts';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Ledge {
  id: number;
  x0: number;
  x1: number;
  y: number;
  plat: Platform;
}

export type Goal =
  | { kind: 'stand'; x: number; ledge: Ledge | null }
  | { kind: 'hit'; spot: Rect; ledge?: Ledge | null }
  | { kind: 'hop'; dbl: boolean; dir?: -1 | 0 | 1 }
  | { kind: 'climb'; x: number; y: number }
  | { kind: 'duck' };

export interface BotOpts {
  /** seconds from a wind-up starting to the bot acting on it */
  react: number;
  /** seconds from an opening starting to the bot going for it (the fairness rule allows 0.8) */
  reactOpen: number;
  /** a random extra 0..jitter s on every reaction */
  jitter: number;
  /** seconds between taps when it mashes punch (a thumb manages about five a second) */
  tapGap: number;
  /** seconds between deciding to tap and the punch registering (a tap is read when the finger lifts) */
  tapLag: number;
  /** the same for a flick up (a jump is read once the flick has gone far enough) */
  jumpLag: number;
  rnd: () => number;
}

export const HUMAN: Omit<BotOpts, 'rnd'> = { react: 0.4, reactOpen: 0.55, jitter: 0.25, tapGap: 0.2, tapLag: 0.1, jumpLag: 0.07 };

/** a small seeded random (mulberry32) */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** what the bot believes the boss is doing: the state it has noticed, and when that state really began */
export interface Belief {
  state: string;
  move: string | null;
  since: number;
}

export type Tactic = (bot: BossBot) => Goal;

/** the strike boxes, relative to his feet facing right (fight.ts): a punch on the ground, the jump kick in the air */
const GROUND = { x0: 8, x1: 60, y0: -54, y1: -8 };
const AIR = { x0: 6, x1: 74, y0: -54, y1: 20 };

export class BossBot {
  readonly sim: BossPlay;
  readonly o: BotOpts;
  readonly ledges: Ledge[];
  belief: Belief = { state: 'roar', move: null, since: 0 };
  private pending: Array<{ at: number; b: Belief }> = [];
  private lastState = '';
  private lastMove: string | null = null;
  /** the controls queued to register later (the tap and flick lags) */
  private queued: Array<{ at: number; what: 'punch' | 'press' }> = [];
  private nextTap = 0;
  /** frames since he left the ground on a jump the driver made, and whether the second jump is spent */
  private air = -1;
  private dblDone = false;
  private wantDbl = false;
  private releaseFrame = false;
  private kicked = false;
  /** a jump is under way toward this ledge */
  private jumpFor: Ledge | null = null;
  goal: Goal = { kind: 'stand', x: 0, ledge: null };
  readonly log: string[] = [];

  constructor(sim: BossPlay, readonly tactic: Tactic, o: Partial<BotOpts> & { rnd: () => number }) {
    this.sim = sim;
    this.o = { ...HUMAN, ...o };
    const a = sim.arena;
    this.ledges = sim.e.platforms
      .filter((pl: Platform) => pl.y < a.floor - 10 && pl.x < a.right && pl.x + pl.width > a.left)
      .map((pl: Platform) => ({ id: pl.id, x0: pl.x, x1: pl.x + pl.width, y: pl.y, plat: pl }));
  }

  get p() {
    return this.sim.p;
  }
  get floor() {
    return this.sim.arena.floor;
  }

  /** a ledge with its current span (a moving one is where it is now) */
  live(l: Ledge): Ledge {
    return { ...l, x0: l.plat.x, x1: l.plat.x + l.plat.width, y: l.plat.y };
  }

  /** the ledge he stands on (null: the floor, or in the air) */
  get on(): Ledge | null {
    if (!this.p.grounded) return null;
    const id = this.sim.e.standingOnId;
    const l = this.ledges.find((q) => q.id === id);
    return l ? this.live(l) : null;
  }

  /** a ledge by its distance from the left fence (its left end) */
  ledgeAt(dx: number): Ledge {
    const a = this.sim.arena;
    const l = this.ledges.reduce((best, q) => (Math.abs(q.x0 - a.left - dx) < Math.abs(best.x0 - a.left - dx) ? q : best));
    return this.live(l);
  }

  private reaction(open: boolean) {
    return (open ? this.o.reactOpen : this.o.react) + this.o.rnd() * this.o.jitter;
  }

  /** watch the boss; a change is noticed only after a reaction time */
  private perceive() {
    const br = this.sim.boss.ai!;
    const t = this.sim.t;
    if (br.state !== this.lastState || br.move !== this.lastMove) {
      const open = this.sim.open;
      this.pending.push({ at: t + this.reaction(open), b: { state: br.state, move: br.move, since: t } });
      this.lastState = br.state;
      this.lastMove = br.move;
    }
    // (what is noticed is the newest thing that has had time to sink in: a stun right after an attack is not stuck behind it)
    const due = this.pending.filter((q) => q.at <= t);
    if (due.length) {
      this.belief = due[due.length - 1].b;
      this.pending = this.pending.filter((q) => q.at > t && q.b.since > this.belief.since);
    }
  }

  /** one frame: notice, choose, act */
  step() {
    this.perceive();
    this.goal = this.tactic(this);
    const pad = this.drive(this.goal);
    // what was decided a moment ago registers now
    const t = this.sim.t;
    for (let i = this.queued.length - 1; i >= 0; i--) {
      const q = this.queued[i];
      if (q.at > t + 1e-6) continue;
      if (q.what === 'punch') pad.punch = true;
      else {
        pad.press = true;
        pad.jump = true;
      }
      this.queued.splice(i, 1);
    }
    this.sim.frame(pad);
    if (!this.p.grounded && !this.p.climbing && this.air >= 0) this.air++;
    // back on his feet (not the moment between deciding to jump and the flick registering)
    if ((this.p.grounded || this.p.climbing) && !pad.press && !this.queued.some((q) => q.what === 'press')) {
      this.air = -1;
      this.dblDone = false;
      this.wantDbl = false;
      this.kicked = false;
      this.jumpFor = null;
    }
  }

  private tap() {
    const t = this.sim.t;
    if (t < this.nextTap) return;
    this.nextTap = t + this.o.tapGap * (0.85 + 0.3 * this.o.rnd());
    this.queued.push({ at: t + this.o.tapLag, what: 'punch' });
  }

  private flick(dbl: boolean) {
    if (this.queued.some((q) => q.what === 'press')) return;
    this.queued.push({ at: this.sim.t + this.o.jumpLag, what: 'press' });
    this.air = 0;
    this.wantDbl = dbl;
    this.dblDone = false;
  }

  /** the second jump, near the top of the first (a thumb lifts and flicks again) */
  private airControl(pad: Pad) {
    const p = this.p;
    if (p.grounded || p.climbing || this.air < 0) return;
    if (this.wantDbl && !this.dblDone && p.jumpsLeft > 0 && p.vy > -140) {
      if (!this.releaseFrame) {
        this.releaseFrame = true;
        pad.jump = false;
        return;
      }
      this.releaseFrame = false;
      this.dblDone = true;
      this.queued.push({ at: this.sim.t + this.o.jumpLag, what: 'press' });
    }
  }

  /** run toward x on whatever he is on; true once there */
  private runTo(pad: Pad, x: number, tol = 10): boolean {
    const dx = x - this.p.x;
    if (Math.abs(dx) <= tol) {
      // brake: a short tap the other way if he is still sliding
      if (Math.abs(this.p.vx) > 120) {
        if (this.p.vx > 0) pad.left = true;
        else pad.right = true;
      }
      return true;
    }
    if (dx > 0) pad.right = true;
    else pad.left = true;
    return false;
  }

  /** get onto a ledge (null: the floor) at x */
  private goStand(pad: Pad, x: number, target: Ledge | null) {
    const p = this.p;
    const on = this.on;
    if (p.climbing) {
      // off the trunk: step off sideways toward where he is going
      if (x > p.x) pad.right = true;
      else pad.left = true;
      return;
    }
    if (!p.grounded) {
      // in the air: steer, and take the second jump if the ledge is still above him
      const want = this.jumpFor ? Math.max(this.jumpFor.x0 + 26, Math.min(this.jumpFor.x1 - 26, x)) : x;
      if (Math.abs(want - p.x) > 6) {
        if (want > p.x) pad.right = true;
        else pad.left = true;
      }
      // (only a jump of his own is held: holding up after stepping off a trunk would grab it again)
      if (this.air >= 0) pad.jump = true;
      this.airControl(pad);
      return;
    }
    if (!target) {
      if (!on) {
        this.runTo(pad, x);
        return;
      }
      // off the ledge: walk off its nearer end toward x
      const inside = x > on.x0 - 24 && x < on.x1 + 24;
      const exit = inside ? (x - on.x0 < on.x1 - x ? on.x0 - 40 : on.x1 + 40) : x;
      this.runTo(pad, exit);
      return;
    }
    const L = this.live(target);
    if (on && on.id === L.id) {
      this.runTo(pad, Math.max(L.x0 + 22, Math.min(L.x1 - 22, x)));
      return;
    }
    const from = on ? on.y : this.floor;
    const rise = from - L.y;
    // too high to jump to from here (a double jump lifts his feet about 165, and a ledge's top is caught 14 below the feet): go by a
    // ledge in between
    if (rise > 172) {
      const step = this.ledges
        .map((l) => this.live(l))
        .filter((l) => l.id !== L.id && from - l.y > 20 && from - l.y <= 150 && L.y < l.y && l.y - L.y <= 150)
        .sort((a, b) => Math.abs((a.x0 + a.x1) / 2 - p.x) - Math.abs((b.x0 + b.x1) / 2 - p.x))[0];
      if (step) this.goStand(pad, (step.x0 + step.x1) / 2, step);
      return;
    }
    const under = p.x > L.x0 + 18 && p.x < L.x1 - 18;
    if (under && (!on || rise > 0)) {
      // jump straight up through it (a ledge is only solid from above)
      this.jumpFor = L;
      this.flick(rise > 80);
      pad.jump = true;
      return;
    }
    if (!on) {
      // from the floor: under it first
      this.runTo(pad, Math.max(L.x0 + 30, Math.min(L.x1 - 30, x)), 6);
      return;
    }
    // from another ledge: run to its end and jump across
    const dir = (L.x0 + L.x1) / 2 > p.x ? 1 : -1;
    const edge = dir > 0 ? on.x1 - 10 : on.x0 + 10;
    if (dir > 0 ? p.x >= edge : p.x <= edge) {
      this.jumpFor = L;
      this.flick(rise > 40 || Math.max(L.x0 - on.x1, on.x0 - L.x1) > 120);
      pad.jump = true;
    }
    if (dir > 0) pad.right = true;
    else pad.left = true;
  }

  /** a spot can be hit from his feet at y with the punch on the ground */
  private groundReach(s: Rect, feet: number): boolean {
    return s.y + s.h > feet + GROUND.y0 + 6 && s.y < feet + GROUND.y1 - 6;
  }

  /** where to stand to hit it facing the right way, and whether he is there */
  private hitX(s: Rect, box: { x0: number; x1: number }): { x: number; ok: boolean; face: 1 | -1 } {
    const px = this.p.x;
    const cx = s.x + s.w / 2;
    const face: 1 | -1 = cx >= px ? 1 : -1;
    const lo = face > 0 ? px + box.x0 : px - box.x1;
    const hi = face > 0 ? px + box.x1 : px - box.x0;
    const ok = lo < s.x + s.w - 12 && hi > s.x + 12;
    // stand just outside it facing in, or where he is if he is in it already
    const x = face > 0 ? Math.min(px, s.x - box.x0 + 4 - 20) : Math.max(px, s.x + s.w + box.x0 - 4 + 20);
    return { x: ok ? px : Math.max(s.x - 30, Math.min(s.x + s.w + 30, x)), ok, face };
  }

  /** note, for the opening under way, when the bot noticed it and when it stood where a hit lands (the fairness numbers) */
  private mark(s: Rect, ok: boolean) {
    const o = this.sim.cur;
    const spot = this.sim.open ? this.sim.spot : null;
    if (!o || !spot || s !== spot && (s.x !== spot.x || s.y !== spot.y)) return;
    if (o.seen < 0) o.seen = this.sim.t - o.t0;
    if (ok && o.reach < 0) o.reach = this.sim.t - o.t0 - o.seen;
  }

  private goHit(pad: Pad, s: Rect, ledge: Ledge | null) {
    const p = this.p;
    this.mark(s, false);
    if (p.climbing || (p.grounded && (this.on?.id ?? -1) !== (ledge?.id ?? -1))) {
      this.goStand(pad, s.x + s.w / 2, ledge);
      return;
    }
    const feet = ledge ? this.live(ledge).y : this.floor;
    if (p.grounded && this.groundReach(s, feet)) {
      const h = this.hitX(s, GROUND);
      this.mark(s, h.ok);
      if (h.ok) {
        if (h.face > 0) pad.right = true;
        else pad.left = true;
        this.tap();
      } else this.runTo(pad, h.x, 4);
      return;
    }
    const h = this.hitX(s, AIR);
    if (p.grounded) {
      if (h.ok) {
        // how high his feet must get for the jump kick to meet it
        const need = s.y + s.h - AIR.y0 - 8;
        this.flick(feet - need > 92);
        pad.jump = true;
      } else this.runTo(pad, h.x, 6);
      return;
    }
    // in the air: kick when the kick will meet it
    if (this.air >= 0) pad.jump = true;
    if (Math.abs(h.x - p.x) > 4) {
      if (h.x > p.x) pad.right = true;
      else pad.left = true;
    } else if (h.face > 0) pad.right = true;
    else pad.left = true;
    this.airControl(pad);
    const inY = p.y + AIR.y0 < s.y + s.h - 8 && p.y + AIR.y1 > s.y + 8;
    if (h.ok && inY) this.mark(s, true);
    if (h.ok && inY && !this.kicked) {
      this.kicked = true;
      this.queued.push({ at: this.sim.t + this.o.tapLag * 0.5, what: 'punch' });
    }
  }

  drive(g: Goal): Pad {
    const pad: Pad = {};
    const p = this.p;
    if (p.isVineSwinging) {
      // caught a liana on the way past: let go (down and a flick), toward where he was going
      const tx = g.kind === 'stand' || g.kind === 'climb' ? g.x : g.kind === 'hit' ? g.spot.x + g.spot.w / 2 : p.x;
      pad.down = true;
      if (tx > p.x + 4) pad.right = true;
      else if (tx < p.x - 4) pad.left = true;
      if (!this.queued.some((q) => q.what === 'press')) this.queued.push({ at: this.sim.t + this.o.jumpLag, what: 'press' });
      return pad;
    }
    switch (g.kind) {
      case 'stand':
        this.goStand(pad, g.x, g.ledge);
        break;
      case 'hit':
        this.goHit(pad, g.spot, g.ledge ?? null);
        break;
      case 'hop':
        if (p.grounded) this.flick(g.dbl);
        else this.airControl(pad);
        pad.jump = true;
        if (g.dir) pad[g.dir > 0 ? 'right' : 'left'] = true;
        break;
      case 'climb':
        if (!p.climbing) {
          if (!p.grounded) pad.up = true;
          else if (this.runTo(pad, g.x, 8)) pad.up = true;
        } else if (p.y > g.y + 6) pad.up = true;
        else if (p.y < g.y - 16) pad.down = true;
        break;
      case 'duck':
        pad.down = true;
        break;
    }
    return pad;
  }

  /** play until the boss is beaten, he is out of lives, or the time runs out; how long it took */
  play(maxSeconds = 600): { won: boolean; seconds: number; hurt: number; lives: number } {
    const t0 = this.sim.t;
    while (this.sim.t - t0 < maxSeconds && !this.sim.beaten && !this.sim.lost) this.step();
    return { won: this.sim.beaten, seconds: this.sim.t - t0, hurt: this.sim.hurt.length, lives: this.sim.e.lives };
  }
}

/** the bot's own world: what it knows about where things are */
const nearMinion = (bot: BossBot, range = 130): Rect | null => {
  const p = bot.p;
  for (const e of bot.sim.e.enemies) {
    if (e.defeated || e.id < 9000 || (e.koTimer ?? 0) > 0) continue;
    if (Math.abs(e.x - p.x) < range && Math.abs(e.y - p.y) < 60) return { x: e.x - e.width / 2, y: e.y - e.height / 2, w: e.width, h: e.height };
  }
  return null;
};

const believesOpen = (bot: BossBot) => (bot.belief.state === 'rec' || bot.belief.state === 'stun') && bot.sim.open;

// ───────────────────────────── the tactics ─────────────────────────────

/**
 * Venom Fang: stand by the stump; when he rears back get onto it (the wall vine in the last phase, when the stump cracks), and when his
 * dazed head is down, drop and punch it. Little snakes are punched when they come close.
 */
export const venomTactic: Tactic = (bot) => {
  const a = bot.sim.arena;
  const stump = bot.ledgeAt(330);
  const b = bot.sim.boss;
  const phase3 = b.phase >= 3;
  const vineX = a.left + 20;
  const bl = bot.belief;
  if ((bl.state === 'tell' || bl.state === 'act') && bl.move === 'sweep') {
    if (phase3 || bot.p.climbing) return { kind: 'climb', x: vineX, y: a.floor - 260 };
    return { kind: 'stand', x: (stump.x0 + stump.x1) / 2, ledge: stump };
  }
  if (believesOpen(bot)) return { kind: 'hit', spot: bot.sim.spot! };
  const m = nearMinion(bot);
  if (m && !bot.p.climbing) return { kind: 'hit', spot: m };
  if (bot.p.climbing && bot.sim.boss.ai!.state !== 'rec') return { kind: 'climb', x: vineX, y: a.floor - 260 };
  return phase3 ? { kind: 'stand', x: vineX + 60, ledge: null } : { kind: 'stand', x: (stump.x0 + stump.x1) / 2, ledge: null };
};

/**
 * Crocus Rex: keep a middle distance on the floor. Jump the tail whip, get up onto a high boardwalk from a roll, jump the mud waves, step
 * off a geyser mark, and keep out of the flood. In an opening, go and hit the glowing head.
 */
export const crocTactic: Tactic = (bot) => {
  const a = bot.sim.arena;
  const b = bot.sim.boss;
  const p = bot.p;
  const bl = bot.belief;
  const flood = b.phase >= 3 ? 215 : 0;
  const safeX = (x: number) => Math.max(a.left + flood + 20, Math.min(a.right - flood - 20, x));
  // a shock wave coming along the floor: hop it
  for (const h of bot.sim.e.hazards) {
    if (h.kind !== 'shock' || h.warn > 0) continue;
    const toward = Math.sign(p.x - h.x) === Math.sign(h.vx);
    const eta = Math.abs(p.x - h.x) / Math.max(1, Math.abs(h.vx));
    if (toward && eta < 0.32 && eta > 0.05 && !bot.on) return { kind: 'hop', dbl: false };
  }
  // a geyser marked under him: step off it
  for (const h of bot.sim.e.hazards) {
    if (h.kind === 'column' && h.warn > 0 && Math.abs(h.x - p.x) < 60 && !bot.on) {
      return { kind: 'stand', x: safeX(p.x + (p.x < h.x ? -110 : 110)), ledge: null };
    }
  }
  if (believesOpen(bot)) {
    // the head is low enough in a stun to punch from the boardwalk by the fence
    return { kind: 'hit', spot: bot.sim.spot! };
  }
  if ((bl.state === 'tell' || bl.state === 'act') && bl.move === 'deathRoll') {
    // up onto the nearest high boardwalk
    // (the one on his way, by the wall he will crash into: the opening is there)
    const high = bot.ledges.map((l) => bot.live(l)).filter((l) => a.floor - l.y > 160);
    const ahead = high.filter((l) => Math.sign((l.x0 + l.x1) / 2 - b.x) === b.facing);
    const best = (ahead.length ? ahead : high).sort((l1, l2) => Math.abs((l1.x0 + l1.x1) / 2 - p.x) - Math.abs((l2.x0 + l2.x1) / 2 - p.x))[0];
    return { kind: 'stand', x: (best.x0 + best.x1) / 2, ledge: best };
  }
  if (bl.state === 'tell' && bl.move === 'tailWhip') {
    // out of its reach, or over it
    const dist = Math.abs(p.x - b.x);
    const tLeft = b.telegraphTimer;
    const out = safeX(b.x + Math.sign(p.x - b.x || 1) * 470);
    // too close to the fence to back off: jump it
    if (Math.abs(out - b.x) < 440 && dist < 440 && tLeft < 0.12) return { kind: 'hop', dbl: true };
    return { kind: 'stand', x: out, ledge: null };
  }
  if (bl.state === 'act' && bl.move === 'tailWhip' && !p.grounded) return { kind: 'hop', dbl: true };
  // otherwise: on the floor, a little out of the tail's reach
  if (bot.on && bot.sim.boss.ai!.state === 'act') return { kind: 'stand', x: p.x, ledge: bot.on };
  const side = p.x < b.x ? -1 : 1;
  let x = safeX(b.x + side * 330);
  if (Math.abs(x - b.x) < 300) x = safeX(b.x - side * 330);
  return { kind: 'stand', x, ledge: null };
};

/**
 * Shadow Prowler: stand with a moon pool at his back (the shadow step then comes out in the light), run from a pounce, back off a claw
 * combo, get up on the high shelf from a dash. In an opening, go for the glow.
 */
export const prowlerTactic: Tactic = (bot) => {
  const a = bot.sim.arena;
  const b = bot.sim.boss;
  const p = bot.p;
  const bl = bot.belief;
  const br = b.ai!;
  for (const h of bot.sim.e.hazards) {
    if (h.kind !== 'shock' || h.warn > 0) continue;
    const toward = Math.sign(p.x - h.x) === Math.sign(h.vx);
    const eta = Math.abs(p.x - h.x) / Math.max(1, Math.abs(h.vx));
    if (toward && eta < 0.32 && eta > 0.05 && !bot.on) return { kind: 'hop', dbl: false };
  }
  if (believesOpen(bot)) return { kind: 'hit', spot: bot.sim.spot! };
  if ((bl.state === 'tell' || bl.state === 'act') && bl.move === 'streak') {
    // up on the nearest shelf (or, already in the air, over him)
    if (bot.on) return { kind: 'stand', x: p.x, ledge: bot.on };
    const near = bot.ledges.map((l) => bot.live(l)).sort((l1, l2) => Math.abs((l1.x0 + l1.x1) / 2 - p.x) - Math.abs((l2.x0 + l2.x1) / 2 - p.x))[0];
    return { kind: 'stand', x: Math.max(near.x0 + 30, Math.min(near.x1 - 30, p.x)), ledge: near };
  }
  if (bl.state === 'tell' && bl.move === 'pounce') {
    // run from where he will land
    const away = p.x < b.x ? -1 : 1;
    let x = p.x + away * 320;
    if (x < a.left + 30 || x > a.right - 30) x = p.x - away * 320;
    return { kind: 'stand', x, ledge: null };
  }
  if (bl.state === 'tell' && bl.move === 'clawCombo') {
    const away = p.x < b.x ? -1 : 1;
    return { kind: 'stand', x: Math.max(a.left + 20, Math.min(a.right - 20, b.x + away * 520)), ledge: null };
  }
  if (bl.state === 'act' && bl.move === 'clawCombo') {
    const away = p.x < b.x ? -1 : 1;
    return { kind: 'stand', x: Math.max(a.left + 20, Math.min(a.right - 20, b.x + away * 540)), ledge: null };
  }
  if ((bl.state === 'tell' || bl.state === 'act') && bl.move === 'shadowStep' && br.state === 'act' && !br.d.crashed) {
    // he came out of the dark beside him: jump the slash
    return { kind: 'hop', dbl: true };
  }
  if (bot.on && br.state === 'act') return { kind: 'stand', x: p.x, ledge: bot.on };
  // otherwise: on the floor with a moon pool behind him, on the side away from the boss
  const side = b.x > p.x ? -1 : 1;
  const spots = PROWLER_POOLS.map((dx) => a.left + dx - side * 215).filter((x) => x > a.left + 30 && x < a.right - 30);
  let x = spots.sort((u, v) => Math.abs(u - p.x) - Math.abs(v - p.x))[0] ?? p.x;
  if (Math.abs(x - b.x) < 260) x = spots.find((s) => Math.abs(s - b.x) >= 260) ?? x;
  void POOL_HALF;
  return { kind: 'stand', x, ledge: null };
};

export const TACTICS: Record<string, Tactic> = { '1-10': venomTactic, '2-10': crocTactic, '3-10': prowlerTactic };

export { DT };
