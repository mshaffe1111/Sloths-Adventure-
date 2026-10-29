/**
 * risingTide — 6-8 Stilt Climb: the dirty, fast tide comes in under Pokey as he climbs (World 6's special stage, w6Stages.ts).
 *
 * The tide is the stage's water line (GeneratedStage.waterY, drawn with Matt's painted dirty water: badWaterArt.ts), moving up. It
 * turns once he is up the first stilt root: first a churn he can see and hear (the warning), then it rises by itself. It waits about
 * `band` px under him (more than a row of the climb: a miss that drops one row lands on dry root): when he gets further ahead it speeds up to `catch`, so it never drops out of the picture; within `close` px
 * of his feet it only creeps, so a player stopped to work out the way on has a long while (Normal about 40 s, Easy nearly two minutes). It stops (slack water) while he stands at a flag or on a shelf the stage holds it for
 * (the first liana's), and for `hold` s after he leaves. Through the spring tide it rises a little faster. Below the line the water
 * costs a life like any dirty water (engine.ts: Matt, 2026-10-29, on Easy too), and he starts again at his flag with the water
 * `under` px below it, waiting `wait` s.
 *
 * So it pushes the pace and never punishes a careful player: only a long stop between flags lets it reach him (w6Stages.test.ts proves a careful player is never caught, on both settings).
 *
 * Pure: the engine steps it (engine.ts updateTide) and the tests run it on their own.
 */

export interface TideSetting {
  /** its own rise (px/s), and through the spring tide */
  speed: number;
  spring: number;
  /** how far under him it waits (px) before it speeds up, and how fast it catches up then (px/s) */
  band: number;
  catch: number;
  /** close under him (px) it only creeps (px/s): a player working out the way on has a long while, and still sees it coming */
  close: number;
  creep: number;
  /** slack water: how long (s) it stays stopped after he leaves a flag or a held shelf */
  hold: number;
  /** the churn before it first rises (s) */
  warn: number;
  /** after he loses a life: how far under his flag it starts again (px), and how long it waits (s) */
  under: number;
  wait: number;
  /** the warning line: the water this close under him (px; inside `close`, so only a stop between flags brings it) */
  near: number;
  /**
   * it comes in surges, not a steady creep: every `every` s a surge of `len` s at `up` times its own rise, and between them `down`
   * times it (on average its own rise: len * up + (every - len) * down = every). Only its own rise surges; catching up and creeping don't
   */
  surge: { every: number; len: number; up: number; down: number };
}

export const TIDE: Record<'normal' | 'easy', TideSetting> = {
  normal: { speed: 24, spring: 31, band: 400, catch: 90, close: 320, creep: 6, hold: 6, warn: 2, under: 560, wait: 3, near: 280, surge: { every: 4, len: 1.4, up: 2, down: (4 - 1.4 * 2) / (4 - 1.4) } },
  easy: { speed: 16, spring: 21, band: 460, catch: 60, close: 380, creep: 3, hold: 10, warn: 3, under: 640, wait: 5, near: 340, surge: { every: 5, len: 1.6, up: 2, down: (5 - 1.6 * 2) / (5 - 1.6) } },
};

export interface TidePlan {
  /** where the water stands before it turns (the mudflat's edge) */
  low: number;
  /** it turns once his feet are above this */
  turnAbove: number;
  /** the spring tide: while he is above this it rises at `spring` */
  springAbove: number;
  /** the shelves it holds for while he stands on them (besides the flags): the first liana's */
  holds: Array<{ x0: number; x1: number; y: number }>;
}

export interface TideState {
  /** the water line (world y: smaller is higher) */
  y: number;
  /** turned yet */
  on: boolean;
  /** seconds of churn left before it first rises */
  warn: number;
  /** seconds of slack water left */
  hold: number;
  /** where it is in its surge (s, 0 to surge.every) */
  beat: number;
}

export function newTide(plan: TidePlan): TideState {
  return { y: plan.low, on: false, warn: 0, hold: 0, beat: 0 };
}

/** is it surging now (in the first `surge.len` s of its beat)? */
export const surging = (s: TideState, set: TideSetting): boolean => s.on && s.warn <= 0 && s.hold <= 0 && s.beat < set.surge.len;

/** how fast it rises with him `gap` px above it, his feet at `feet`, `beat` s into its surge */
export function tideSpeed(plan: TidePlan, set: TideSetting, gap: number, feet: number, beat = set.surge.len): number {
  const own = (feet < plan.springAbove ? set.spring : set.speed) * (beat < set.surge.len ? set.surge.up : set.surge.down);
  if (gap > set.band) return Math.max(own, set.catch);
  return gap < set.close ? set.creep : own;
}

/**
 * Step the tide `dt` s with his feet at `feet`. `resting`: he stands at a flag or on a held shelf (slack water). Returns 'turned' on
 * the frame it turns (the engine's churn, rumble and the line), 'surge' on the frame a surge starts (a pulse of foam and splashes).
 */
export function stepTide(s: TideState, plan: TidePlan, set: TideSetting, dt: number, feet: number, resting: boolean): 'turned' | 'surge' | null {
  if (!s.on) {
    if (feet >= plan.turnAbove) return null;
    s.on = true;
    s.warn = set.warn;
    return 'turned';
  }
  if (s.warn > 0) {
    s.warn = Math.max(0, s.warn - dt);
    return null;
  }
  if (resting) {
    s.hold = set.hold;
    return null;
  }
  if (s.hold > 0) {
    s.hold = Math.max(0, s.hold - dt);
    return null;
  }
  const was = s.beat;
  s.beat = (s.beat + dt) % set.surge.every;
  s.y -= tideSpeed(plan, set, s.y - feet, feet, s.beat) * dt;
  return s.beat < was ? 'surge' : null;
}

/** start again at a flag: the water `under` px below it (never higher than it was), waiting a moment; at the start, as it began */
export function restartTide(s: TideState, plan: TidePlan, set: TideSetting, flagY: number): void {
  if (flagY >= plan.turnAbove) {
    s.y = plan.low;
    s.on = false;
    s.warn = 0;
    s.hold = 0;
    return;
  }
  s.y = Math.max(s.y, flagY + set.under);
  s.hold = set.wait;
  s.warn = 0;
}

/** is he standing on one of the plan's held shelves (feet on it, within its ends)? */
export function onHeld(plan: TidePlan, x: number, feet: number, grounded: boolean): boolean {
  return grounded && plan.holds.some((h) => Math.abs(feet - h.y) < 6 && x >= h.x0 && x <= h.x1);
}
