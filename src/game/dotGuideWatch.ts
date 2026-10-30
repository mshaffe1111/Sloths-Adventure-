/**
 * What Dot's guide notices about Pokey (the new look): the moves he does (a move tip closes when he does it), whether he is in danger
 * right now (no new line starts then), and when he is struggling (one short help line). Pure: it reads a GuideView a frame at a time.
 */
import type { MoveId } from './dotGuide.ts';
import type { GuideView } from './dotGuideView.ts';
import { dotText } from './dotLines.ts';

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
export type DeathCause = 'fall' | 'foe' | 'other' | 'water' | 'crumble' | 'gapWide' | 'vine' | 'pushLog';

export const STRUGGLE = {
  /** two deaths this close together count as the same spot (px) */
  spotDx: 180,
  spotDy: 240,
  /** stuck is back and forth with no progress (STAGE-RULES §3, DOT-11), never a clock: this many turns of direction in a row */
  turns: 6,
  /** a turn counts once he has gone this far the one way (px): a twitch of the thumb is not a turn */
  turnPx: 40,
  /** progress: this far further right, or this far higher, than his best so far */
  progressDx: 60,
  progressDy: 80,
  /** the stuck help comes at most this often */
  stuckEveryMs: 45000,
  /** kicks in a row with nothing to kick */
  kicks: 3,
} as const;

/** the help lines: Matt's approved words (dotLines.ts, the help.* lines) */
export const STRUGGLE_LINES: Record<StruggleKind | `death-${DeathCause}`, string> = {
  'death-fall': dotText('help.twice.gap', 'Flick up a little before the edge.'),
  'death-foe': dotText('help.twice.foe', 'Tap to punch it before it gets close.'),
  'death-other': dotText('help.twice.generic', 'That spot again. Slow down and look first.'),
  'death-water': dotText('help.twice.water', 'Wait for the log, then flick up.'),
  'death-crumble': dotText('help.twice.crumble', 'Shaky branches drop. Keep moving!'),
  'death-gapWide': dotText('help.twice.gapWide', 'Flick up again midair for the far side.'),
  'death-vine': dotText('help.twice.vine', 'Slide straight up. It always climbs.'),
  'death-pushLog': dotText('help.pushLog', 'Slide into the log and keep holding.'),
  death: dotText('help.twice.generic', 'That spot again. Slow down and look first.'),
  stuck: dotText('help.stuck15', 'This way, Pokey! Try over here.'),
  kicks: dotText('help.kickAir', 'Kicking the air? Slide your thumb to run.'),
};
/**
 * The help after a second death in one spot, by what got him (DOT-10). On Tips the plain three (a fall, an animal, anything else); on
 * Help the specific line for the cause, the log first (Easy players lost the most lives at "Push the log").
 */
export function deathLine(cause: DeathCause, specific: boolean): string {
  if (!specific) return STRUGGLE_LINES[cause === 'fall' ? 'death-fall' : cause === 'foe' ? 'death-foe' : 'death-other'];
  return STRUGGLE_LINES[`death-${cause}`];
}

export class StruggleWatch {
  private deaths: { x: number; y: number }[] = [];
  private helpedSpots: { x: number; y: number }[] = [];
  private bestX = -Infinity;
  private bestY = Infinity;
  private lastStuckAt = -Infinity;
  private clock = 0;
  private airKicks = 0;
  /** back and forth: the way he last went, where he turned last, and the turns in a row with no progress */
  private dir = 0;
  private turnX = NaN;
  private turns = 0;

  /** a new run of the stage, or a respawn: progress counts from here */
  restart(x: number, y: number): void {
    this.bestX = x;
    this.bestY = y;
    this.airKicks = 0;
    this.turns = 0;
    this.dir = 0;
    this.turnX = x;
  }

  /** he lost a life at (x, y) */
  death(x: number, y: number, cause: DeathCause, specific = false): StruggleHelp | null {
    const same = this.deaths.some((d) => Math.abs(d.x - x) < STRUGGLE.spotDx && Math.abs(d.y - y) < STRUGGLE.spotDy);
    this.deaths.push({ x, y });
    if (!same) return null;
    // once per spot
    if (this.helpedSpots.some((d) => Math.abs(d.x - x) < STRUGGLE.spotDx && Math.abs(d.y - y) < STRUGGLE.spotDy)) return null;
    this.helpedSpots.push({ x, y });
    return { kind: 'death', cause, key: `struggle:death:${Math.round(x / 100)}`, text: deathLine(cause, specific) };
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

  /**
   * A frame of play: is he getting anywhere? Stuck is going back and forth with no progress (STRUGGLE.turns turns of direction), never
   * time alone: a player standing still to think is not stuck (DOT-11).
   */
  step(dtMs: number, x: number, y: number): StruggleHelp | null {
    this.clock += dtMs;
    if (x > this.bestX + STRUGGLE.progressDx || y < this.bestY - STRUGGLE.progressDy) {
      this.bestX = Math.max(this.bestX, x);
      this.bestY = Math.min(this.bestY, y);
      this.turns = 0;
      return null;
    }
    if (Number.isNaN(this.turnX)) this.turnX = x;
    // (turnX: the far point of his run this way; a turn is turnPx back the other way from it)
    if (this.dir === 0) {
      if (Math.abs(x - this.turnX) >= STRUGGLE.turnPx) {
        this.dir = x > this.turnX ? 1 : -1;
        this.turnX = x;
      }
    } else if ((x - this.turnX) * this.dir > 0) this.turnX = x;
    else if ((this.turnX - x) * this.dir >= STRUGGLE.turnPx) {
      this.turns++;
      this.dir = -this.dir;
      this.turnX = x;
    }
    if (this.turns < STRUGGLE.turns || this.clock - this.lastStuckAt < STRUGGLE.stuckEveryMs) return null;
    this.turns = 0;
    this.lastStuckAt = this.clock;
    return { kind: 'stuck', key: `struggle:stuck:${Math.round(this.clock / 1000)}`, text: STRUGGLE_LINES.stuck };
  }
}
