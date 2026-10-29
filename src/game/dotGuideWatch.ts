/**
 * What Dot's guide notices about Pokey (the new look): the moves he does (a move tip closes when he does it), whether he is in danger
 * right now (no new line starts then), and when he is struggling (one short help line). Pure: it reads a GuideView a frame at a time.
 */
import type { MoveId, TopicId } from './dotGuide.ts';
import type { GuidePlatform, GuideView } from './dotGuideView.ts';
import { dotText } from './dotLines.ts';
import { reachJump } from './physics.ts';

const MOVES: readonly MoveId[] = ['run', 'jump', 'double', 'grab', 'climb', 'leap', 'glide', 'punch', 'kick', 'crouch', 'push', 'bounce'];
/** a mushroom's spring launches him faster than any jump can (PHYS.bounceV 830 against jumpV 640): past this, it was a bounce */
export const BOUNCE_VY = -740;

/** counts each move as it happens (the rising edge of what the engine shows), so a tip knows when its move is done */
export class MoveWatch {
  private counts: Record<MoveId, number> = Object.fromEntries(MOVES.map((m) => [m, 0])) as Record<MoveId, number>;
  private was = { vy: 0, air: false, dbl: false, held: false, climbing: false, swinging: false, glide: false, attack: 'none' as GuideView['attack'], duck: false, push: false };
  private runPx = 0;
  private lastX = NaN;
  private climbFrom = -Infinity;
  /** a kick just happened, and whether there was anything to kick (the struggle watch reads it) */
  kicked: null | { near: boolean } = null;

  count(m: MoveId): number {
    return this.counts[m];
  }

  /** for the tests and the stage start */
  reset(): void {
    for (const m of MOVES) this.counts[m] = 0;
    this.runPx = 0;
    this.lastX = NaN;
  }

  step(v: GuideView): void {
    const w = this.was;
    const c = this.counts;
    this.kicked = null;
    const held = v.climbing || v.swinging || v.hanging;
    const air = !v.grounded && !held;
    // a jump: leaving the ground going up (not dropping off an edge, not letting go of a vine: that is a leap)
    if (air && !w.air && v.vy < -60 && !w.swinging && !w.held) c.jump++;
    // a bounce: flung up off a mushroom (a jump never goes this fast), from the ground or landing on it from the air
    if (v.vy < BOUNCE_VY && w.vy > -300 && !held) c.bounce++;
    if (v.doubleJumping && !w.dbl) c.double++;
    if (held && !w.held) c.grab++;
    // climbing counts once he has gone up a little way on a trunk
    if (v.climbing && !w.climbing) this.climbFrom = v.py;
    if (v.climbing && this.climbFrom - v.py > 30) {
      c.climb++;
      this.climbFrom = -Infinity;
    }
    if (w.swinging && !v.swinging && air) c.leap++;
    if (v.gliding && !w.glide) c.glide++;
    if (v.attack !== w.attack && v.attack !== 'none') {
      if (v.attack === 'kick') {
        c.kick++;
        this.kicked = { near: v.kickNear };
      } else c.punch++;
    }
    if (v.ducking && !w.duck) c.crouch++;
    if (v.pushing && !w.push) c.push++;
    // running: 150 px of his own steering on the ground
    if (!Number.isNaN(this.lastX) && v.grounded && Math.abs(v.vx) > 60) {
      const d = Math.abs(v.px - this.lastX);
      if (d < 60) this.runPx += d;
      if (this.runPx >= 150) {
        c.run++;
        this.runPx = 0;
      }
    }
    this.lastX = v.px;
    w.vy = v.vy;
    w.air = air;
    w.dbl = v.doubleJumping;
    w.held = held;
    w.climbing = v.climbing;
    w.swinging = v.swinging;
    w.glide = v.gliding;
    w.attack = v.attack;
    w.duck = v.ducking;
    w.push = v.pushing;
  }
}

/** how close is "at hand" (the same distances the lesson cards wait for: lessons.ts CARD_SAFE) */
export const DANGER = { foeDx: 190, foeDy: 150, hazard: 240, fallVy: 260 } as const;

/** Pokey is in danger: hurt, falling, an animal at hand or something on its way to him. No new line starts then (except a warning). */
export function inDanger(v: GuideView): boolean {
  if (v.hurt) return true;
  const held = v.climbing || v.swinging || v.hanging;
  if (!v.grounded && !held && !v.gliding && v.vy > DANGER.fallVy) return true;
  const cx = v.px + v.pw / 2;
  for (let i = 0; i < v.enemies.length; i++) {
    const e = v.enemies[i];
    if (e.defeated) continue;
    if (Math.abs(e.x - cx) < DANGER.foeDx && Math.abs(e.y - v.py) < DANGER.foeDy) return true;
  }
  for (let i = 0; i < v.hazards.length; i++) {
    const h = v.hazards[i];
    if (Math.hypot(h.x - cx, h.y - (v.py - v.ph / 2)) < DANGER.hazard) return true;
  }
  return false;
}

// ───────────────────────────── noticing a struggling player ─────────────────────────────

export type StruggleKind = 'death' | 'stuck' | 'kicks';
export interface StruggleHelp {
  kind: StruggleKind;
  key: string;
  text: string;
  /** what got him, for a death */
  cause?: DeathCause;
}
/**
 * What got him (DOT-10): the plain three ('fall', 'foe', 'other') and the specific ones DeathWatch tells apart, each with its own approved
 * help line (dotLinesData.ts help.*), so drowning twice at a river is not told "Flick up a little before the edge."
 */
export type DeathCause =
  | 'fall' | 'foe' | 'other'
  | 'pushLog' | 'pushLog2' | 'river' | 'riverRide' | 'water' | 'crumble' | 'swingGrab' | 'swingLeap' | 'vine' | 'gapWide' | 'runStop'
  | 'shortHops' | 'turnBack';

export const STRUGGLE = {
  /** two deaths this close together count as the same spot (px) */
  spotDx: 180,
  spotDy: 240,
  /** no progress for this long while a thumb is on the glass (ms of play) */
  stuckMs: 15000,
  /** progress: this far further right, or this far higher, than his best so far */
  progressDx: 60,
  progressDy: 80,
  /** the stuck help comes at most this often */
  stuckEveryMs: 45000,
  /** kicks in a row with nothing to kick */
  kicks: 3,
} as const;

/** the help lines: Matt's approved words (dotLines.ts, the help.* lines) */
export const STRUGGLE_LINES: Record<StruggleKind | `death-${DeathCause}` | 'stuck2', string> = {
  'death-fall': dotText('help.twice.gap', 'Flick up a little before the edge.'),
  'death-foe': dotText('help.twice.foe', 'Tap to punch it before it gets close.'),
  'death-other': dotText('help.twice.generic', 'That spot again. Slow down and look first.'),
  'death-pushLog': dotText('help.pushLog', 'Slide into the log and keep holding.'),
  'death-pushLog2': dotText('help.pushLog2', 'Push it to the wall, then hop up.'),
  'death-river': dotText('help.riverLogs', 'Wait for the log, then flick up onto it.'),
  'death-riverRide': dotText('help.riverRide', 'Stay on the log till it reaches the bank.'),
  'death-water': dotText('help.twice.water', 'Wait for the log, then flick up.'),
  'death-crumble': dotText('help.twice.crumble', 'Shaky branches drop. Keep moving!'),
  'death-swingGrab': dotText('help.swingGrab', 'Flick up into the vine to grab it.'),
  'death-swingLeap': dotText('help.swingLeap', 'Flick up at the front of the swing.'),
  'death-vine': dotText('help.twice.vine', 'Slide straight up. It always climbs.'),
  'death-gapWide': dotText('help.twice.gapWide', 'Flick up again midair for the far side.'),
  'death-runStop': dotText('help.runStop', 'Lift your thumb to stop.'),
  'death-shortHops': dotText('help.shortHops', 'Flick up beside each stump to hop.'),
  'death-turnBack': dotText('help.turnBack', 'Slide the other way to turn back.'),
  death: dotText('help.twice.generic', 'That spot again. Slow down and look first.'),
  stuck: dotText('help.stuck15', 'This way, Pokey! Try over here.'),
  stuck2: dotText('help.stuck30', 'Still stuck? Follow my arrow.'),
  kicks: dotText('help.kickAir', 'Kicking the air? Slide your thumb to run.'),
};

/** what Dot's ring points at for each death's help */
export const DEATH_TOPIC: Partial<Record<DeathCause, TopicId>> = {
  fall: 'gap', gapWide: 'gap', runStop: 'gap', shortHops: 'gap', foe: 'foe', pushLog: 'log', pushLog2: 'log', river: 'water',
  riverRide: 'water', water: 'moving', crumble: 'crumble', swingGrab: 'vine', swingLeap: 'vine', vine: 'trunk', turnBack: 'controls',
};

/** how recent a hold or a perch must be to be what he fell from (ms of play) */
export const DEATH_RECENT = { swing: 1500, climb: 1500, fragile: 1500, drift: 2500 } as const;
/** how near a thing counts as where he died (px) */
export const DEATH_NEAR = { push: 450, drift: 420, moving: 320, vine: 170, short: 140 } as const;

const standing = (v: GuideView, pl: GuidePlatform) => v.px >= pl.x - 4 && v.px <= pl.x + pl.width + 4 && Math.abs(v.py - pl.y) < 8;

/**
 * Remembers, a frame at a time, what he last stood on and held (DOT-10), and on a lost life names what got him. Pure: it reads a GuideView,
 * and is run by Dot's guide (DotGuide.tsx perceive) and the first-timer bot alike.
 */
export class DeathWatch {
  private t = 0;
  private swingAt = -Infinity;
  private climbAt = -Infinity;
  private fragileAt = -Infinity;
  private driftAt = -Infinity;
  /** he jumped since he last stood on something */
  private jumped = false;
  /** the speed he left the ground at */
  private offVx = 0;
  private wasGrounded = true;
  /** the last thing he stood on */
  private ground: GuidePlatform | null = null;
  private x = 0;
  private y = 0;
  private facing: 1 | -1 = 1;

  reset(): void {
    this.swingAt = this.climbAt = this.fragileAt = this.driftAt = -Infinity;
    this.jumped = false;
    this.ground = null;
    this.wasGrounded = true;
  }

  /** a frame of play, while he is alive */
  step(v: GuideView, dtMs: number): void {
    this.t += dtMs;
    if (v.hp <= 0 || v.py >= v.levelH - 10) return;
    this.x = v.px;
    this.y = v.py;
    this.facing = v.facing;
    if (v.swinging) this.swingAt = this.t;
    if (v.climbing || v.hanging) this.climbAt = this.t;
    if (v.grounded) {
      this.jumped = false;
      for (const pl of v.platforms) {
        if (pl.broken || !standing(v, pl)) continue;
        this.ground = pl;
        if (pl.type === 'fragile') this.fragileAt = this.t;
        if (pl.type === 'drift') this.driftAt = this.t;
      }
    } else if (this.wasGrounded) {
      this.offVx = v.vx;
      if (v.vy < -60) this.jumped = true;
    } else if (v.vy < -60 && !v.swinging && !v.climbing) this.jumped = true;
    this.wasGrounded = v.grounded;
  }

  /** where he was last alive */
  get at(): { x: number; y: number } {
    return { x: this.x, y: this.y };
  }

  /** he just lost a life: what got him (`base`: the plain reading, a fall, an animal or something else; `v`: this frame's view) */
  cause(v: GuideView, base: 'fall' | 'foe' | 'other'): DeathCause {
    const x = this.x;
    const ago = (at: number) => this.t - at;
    const near = (pl: GuidePlatform, d: number) => pl.x - d <= x && x <= pl.x + pl.width + d;
    const hit = v.lostTo === 'hurt' || base === 'foe';
    if (hit) {
      // an animal behind him: he was facing away from what got him
      let best: { dx: number } | null = null;
      for (const e of v.enemies) {
        if (e.defeated || Math.abs(e.y - this.y) > 160) continue;
        const dx = e.x - x;
        if (Math.abs(dx) < 150 && (!best || Math.abs(dx) < Math.abs(best.dx))) best = { dx };
      }
      if (best && Math.abs(best.dx) > 12 && Math.sign(best.dx) !== this.facing) return 'turnBack';
      return base === 'foe' ? 'foe' : 'other';
    }
    // the push log: the spot where Easy players lost the most lives (12 since 2026-10-26)
    if (v.platforms.some((pl) => pl.push && pl.push.min - DEATH_NEAR.push <= x && x <= pl.push.max + pl.width + DEATH_NEAR.push)) return 'pushLog';
    if (v.lostTo === 'water' && v.platforms.some((pl) => pl.type === 'drift' && near(pl, DEATH_NEAR.drift))) return ago(this.driftAt) < DEATH_RECENT.drift ? 'riverRide' : 'river';
    if (ago(this.fragileAt) < DEATH_RECENT.fragile) return 'crumble';
    if (ago(this.swingAt) < DEATH_RECENT.swing) return 'swingLeap';
    if (ago(this.climbAt) < DEATH_RECENT.climb) return 'vine';
    if (this.jumped && v.vines.some((vn) => vn.vineType !== 'tree_climb' && Math.abs(vn.x - x) < DEATH_NEAR.vine && this.y > vn.topY - 40)) return 'swingGrab';
    if (v.lostTo === 'water' && v.platforms.some((pl) => pl.type === 'moving' && !pl.broken && near(pl, DEATH_NEAR.moving))) return 'water';
    if (base !== 'fall' && v.lostTo !== 'water' && v.lostTo !== 'pit') return base;
    // a fall: walked off the edge at a run, a row of little stumps, or a gap wider than one jump
    if (!this.jumped && Math.abs(this.offVx) > 120) return 'runStop';
    const g = this.ground;
    if (g) {
      const dir = this.facing;
      const edge = dir > 0 ? g.x + g.width : g.x;
      let next: GuidePlatform | null = null;
      let gap = Infinity;
      for (const pl of v.platforms) {
        if (pl === g || pl.broken || Math.abs(pl.y - g.y) > 200) continue;
        const d = dir > 0 ? pl.x - edge : edge - (pl.x + pl.width);
        if (d > 0 && d < gap) {
          gap = d;
          next = pl;
        }
      }
      if (next) {
        if (g.width < DEATH_NEAR.short && next.width < DEATH_NEAR.short) return 'shortHops';
        if (gap > reachJump(g.y - next.y, false) * 0.9) return 'gapWide';
      }
    }
    return 'fall';
  }
}

export class StruggleWatch {
  private deaths: { x: number; y: number }[] = [];
  private helpedSpots: { x: number; y: number; n: number }[] = [];
  private bestX = -Infinity;
  private bestY = Infinity;
  private stillMs = 0;
  private lastStuckAt = -Infinity;
  private clock = 0;
  private airKicks = 0;
  private stuckTimes = 0;

  /** a new run of the stage, or a respawn: progress counts from here */
  restart(x: number, y: number): void {
    this.bestX = x;
    this.bestY = y;
    this.stillMs = 0;
    this.airKicks = 0;
  }

  /** he lost a life at (x, y) */
  death(x: number, y: number, cause: DeathCause): StruggleHelp | null {
    const at = (d: { x: number; y: number }) => Math.abs(d.x - x) < STRUGGLE.spotDx && Math.abs(d.y - y) < STRUGGLE.spotDy;
    const same = this.deaths.filter(at).length;
    this.deaths.push({ x, y });
    if (!same) return null;
    // once per spot (the push log twice: its first step, then two deaths later its second, DOT-10)
    const helped = this.helpedSpots.find(at);
    if (helped) {
      if (cause !== 'pushLog' || helped.n !== 1 || same < 3) return null;
      helped.n++;
      return { kind: 'death', cause: 'pushLog2', key: `struggle:death2:${Math.round(x / 100)}`, text: STRUGGLE_LINES['death-pushLog2'] };
    }
    this.helpedSpots.push({ x, y, n: 1 });
    return { kind: 'death', cause, key: `struggle:death:${Math.round(x / 100)}`, text: STRUGGLE_LINES[`death-${cause}`] };
  }

  /** a kick: three in a row with nothing in reach is a thumb that meant to run */
  kick(near: boolean): StruggleHelp | null {
    if (near) {
      this.airKicks = 0;
      return null;
    }
    this.airKicks++;
    if (this.airKicks < STRUGGLE.kicks) return null;
    this.airKicks = 0;
    return { kind: 'kicks', key: `struggle:kicks:${Math.round(this.clock / 1000)}`, text: STRUGGLE_LINES.kicks };
  }

  /** he did something on purpose that is not a kick (ran, jumped): the kicks were not "in a row" */
  otherMove(): void {
    this.airKicks = 0;
  }

  /** a frame of play: is he getting anywhere? `touching`: a thumb is on the glass (he is trying, not putting the phone down) */
  step(dtMs: number, x: number, y: number, touching: boolean): StruggleHelp | null {
    this.clock += dtMs;
    if (x > this.bestX + STRUGGLE.progressDx || y < this.bestY - STRUGGLE.progressDy) {
      this.bestX = Math.max(this.bestX, x);
      this.bestY = Math.min(this.bestY, y);
      this.stillMs = 0;
      this.stuckTimes = 0;
      return null;
    }
    if (!touching) return null;
    this.stillMs += dtMs;
    // (the second help comes 15 s after the first if he is still stuck; after that, at most every 45 s)
    if (this.stillMs < STRUGGLE.stuckMs || (this.stuckTimes !== 1 && this.clock - this.lastStuckAt < STRUGGLE.stuckEveryMs)) return null;
    // (the second time in a row without getting anywhere, she says to follow her arrow)
    const again = this.stuckTimes === 1;
    this.stuckTimes++;
    this.lastStuckAt = this.clock;
    this.stillMs = 0;
    return { kind: 'stuck', key: `struggle:stuck:${Math.round(this.clock / 1000)}`, text: again ? STRUGGLE_LINES.stuck2 : STRUGGLE_LINES.stuck };
  }
}
