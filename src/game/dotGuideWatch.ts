/**
 * What Dot's guide notices about Pokey (the new look): the moves he does (a move tip closes when he does it), whether he is in danger
 * right now (no new line starts then), and when he is struggling (one short help line). Pure: it reads a GuideView a frame at a time.
 */
import type { MoveId } from './dotGuide.ts';
import type { GuideView } from './dotGuideView.ts';
import { dotText } from './dotLines.ts';

const MOVES: readonly MoveId[] = ['run', 'jump', 'double', 'grab', 'climb', 'leap', 'glide', 'punch', 'kick', 'crouch', 'push'];

/** counts each move as it happens (the rising edge of what the engine shows), so a tip knows when its move is done */
export class MoveWatch {
  private counts: Record<MoveId, number> = Object.fromEntries(MOVES.map((m) => [m, 0])) as Record<MoveId, number>;
  private was = { air: false, dbl: false, held: false, climbing: false, swinging: false, glide: false, attack: 'none' as GuideView['attack'], duck: false, push: false };
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
export type DeathCause = 'fall' | 'foe' | 'other';

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
  death: dotText('help.twice.generic', 'That spot again. Slow down and look first.'),
  stuck: dotText('help.stuck15', 'This way, Pokey! Try over here.'),
  stuck2: dotText('help.stuck30', 'Still stuck? Follow my arrow.'),
  kicks: dotText('help.kickAir', 'Kicking the air? Slide your thumb to run.'),
};

export class StruggleWatch {
  private deaths: { x: number; y: number }[] = [];
  private helpedSpots: { x: number; y: number }[] = [];
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
    const same = this.deaths.some((d) => Math.abs(d.x - x) < STRUGGLE.spotDx && Math.abs(d.y - y) < STRUGGLE.spotDy);
    this.deaths.push({ x, y });
    if (!same) return null;
    // once per spot
    if (this.helpedSpots.some((d) => Math.abs(d.x - x) < STRUGGLE.spotDx && Math.abs(d.y - y) < STRUGGLE.spotDy)) return null;
    this.helpedSpots.push({ x, y });
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
