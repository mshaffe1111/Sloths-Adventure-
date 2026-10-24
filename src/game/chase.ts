/**
 * chase — 1-8 The Long Branch: the branch collapses behind Pokey and he must keep moving (World 1's special stage, Act I's set piece).
 *
 * Past the calm start the collapse sets off behind him. Its front moves a little slower than he runs, so anyone who keeps moving
 * stays ahead; when he gets far ahead it speeds up (the pressure never lets go), and when he stops, fights or misses a jump it closes
 * in. Every section of branch behind the front breaks and falls; the few sections just ahead of it crack first, the warning. Caught
 * (the front reaches him) or off the branch, he loses a heart and starts again at the last flag with the branch whole again (Matt's
 * choice, 2026-10-24), and the collapse waits a moment before it sets off again.
 *
 * Pure: the engine steps it and draws it (engine.ts); chase.test.ts checks the rules.
 */

export interface ChasePlan {
  /** where the collapse sets off (he passes this x), and where it stops (the last liana: the shrine is beyond it) */
  start: number;
  end: number;
  /** from here the collapse goes faster (the end of the branch: it breaks for good) */
  finalFrom: number;
}

export const CHASE = {
  /** its speed with him close (px/s): his run is 285, so a player who keeps going pulls away */
  base: 230,
  /** its speed at most, when he is far ahead */
  max: 420,
  /** how far ahead he can get before it speeds up, and over how much more it reaches full speed */
  band: 560,
  ramp: 500,
  /** faster on the last stretch */
  final: 60,
  /** how far behind him it starts (px), at the start and after a restart */
  behind: 520,
  /** after a restart it waits this long (s) before it sets off again */
  hold: 1.6,
  /** the sections this far ahead of the front crack (the warning) */
  crackAhead: 300,
  /** caught: the front within this of him (px) */
  catchAt: 24,
} as const;

export interface ChaseState {
  /** the collapse front (world x): everything left of it has fallen */
  front: number;
  active: boolean;
  /** seconds it still waits before moving */
  hold: number;
}

export function newChase(plan: ChasePlan): ChaseState {
  return { front: plan.start - CHASE.behind, active: false, hold: 0 };
}

/** how fast the front moves with him `gap` px ahead of it, at x */
export function chaseSpeed(plan: ChasePlan, gap: number, x: number): number {
  const k = Math.max(0, Math.min(1, (gap - CHASE.band) / CHASE.ramp));
  return CHASE.base + (CHASE.max - CHASE.base) * k + (x >= plan.finalFrom ? CHASE.final : 0);
}

/** step the collapse with him at x */
export function stepChase(s: ChaseState, plan: ChasePlan, dt: number, x: number): void {
  if (!s.active) {
    if (x >= plan.start) {
      s.active = true;
      s.front = Math.min(s.front, x - CHASE.behind);
    }
    return;
  }
  if (s.hold > 0) {
    s.hold = Math.max(0, s.hold - dt);
    return;
  }
  s.front = Math.min(plan.end, s.front + chaseSpeed(plan, x - s.front, s.front) * dt);
}

/** has the front reached him? */
export function caught(s: ChaseState, x: number): boolean {
  return s.active && x - s.front < CHASE.catchAt;
}

/** start again at a flag: the front well behind it, waiting a moment (and not set off at all if the flag is before the chase) */
export function restartAt(s: ChaseState, plan: ChasePlan, flagX: number): void {
  s.front = flagX - CHASE.behind;
  s.active = flagX >= plan.start;
  s.hold = CHASE.hold;
}

/** what a section of branch looks like: fallen (behind the front), cracking (just ahead of it), or whole */
export function sectionState(s: ChaseState, x0: number, x1: number): 'fallen' | 'cracked' | 'whole' {
  if (!s.active) return 'whole';
  if (x1 <= s.front) return 'fallen';
  if (x0 <= s.front + CHASE.crackAhead) return 'cracked';
  return 'whole';
}
