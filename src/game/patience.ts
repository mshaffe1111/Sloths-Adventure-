/**
 * patience — World 4's quiet rule: some things only happen for someone who is not in a hurry. Grandma said the Heartbloom only opens for
 * people who aren't in a hurry, and "slow is not stopped" about a fern frond that unrolled an inch while nobody watched (World 4's memory).
 *
 * A patience spot has a place to stand. While Pokey stands still there, it fills; when he moves, it stops (a fern frond) or slowly ebbs
 * (the mist rises again). Full, it does its work:
 *   frond  a curled fern frond unrolls into a little leafy bridge (4-1's exit): once unrolled it stays, so nothing is ever undone
 *   mist   the mist settles and the hidden ledges show while it is full (4-6): move and it rises, so the way must be remembered
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on what a spot is doing.
 */

export type PatienceKind = 'frond' | 'mist';

export interface PatienceSpot {
  kind: PatienceKind;
  /** where to stand: his middle within [x0, x1], and his feet within `reach` px above or below `y` */
  x0: number;
  x1: number;
  y: number;
  /** seconds of standing still it takes to fill */
  fill: number;
  /** frond: the platform it becomes (its id), solid only once unrolled */
  platformId?: number;
  /** mist: the ledges it hides (platform ids), solid all along but only seen while the mist is down */
  hides?: number[];
  /**
   * mist: the band of mist this spot settles, across the whole stage (heights: top above bottom). With a band the mist is one bank
   * drawn over everything in it (ledges, trunks), so it does not give the hidden ledges away; without one, a puff over each hidden ledge
   */
  area?: { top: number; bottom: number };
  /** mist: where the view drifts to while he stands here (the middle of the way it shows him), so the whole way fits on a phone */
  view?: { x: number; y: number };
  /** frond: which way it unrolls from the spot (+1: across to the right of x1, -1: to the left of x0) */
  dir?: 1 | -1;
}

export const PATIENCE = {
  /** feet this far above or below the spot still count as standing on it (px) */
  reach: 40,
  /** slower than this (px/s), on the ground, is standing still */
  still: 18,
  /** mist: how fast it rises again while he moves, in fills per second (a quarter of a fill a second: a few steps keep most of it) */
  ebb: 0.25,
  /** how long he must hold still before it starts (s): a sloth that merely pauses mid-run does not set a frond going */
  settle: 0.35,
} as const;

export interface PatienceState {
  /** 0..1 */
  level: number;
  /** seconds he has been still on the spot in a row */
  stillFor: number;
  /** frond: it has unrolled (for good) */
  done: boolean;
}

export const newPatience = (): PatienceState => ({ level: 0, stillFor: 0, done: false });

/** is he standing on the spot? (his middle x, his feet y) */
export function onSpot(s: PatienceSpot, px: number, feetY: number): boolean {
  return px >= s.x0 && px <= s.x1 && Math.abs(feetY - s.y) <= PATIENCE.reach;
}

/** is he standing still? */
export function isStill(p: { vx: number; grounded: boolean }): boolean {
  return p.grounded && Math.abs(p.vx) < PATIENCE.still;
}

/** one frame: returns the new state (the old one is not changed) */
export function stepPatience(s: PatienceSpot, st: PatienceState, here: boolean, still: boolean, dt: number): PatienceState {
  if (st.done) return st;
  const waiting = here && still;
  const stillFor = waiting ? st.stillFor + dt : 0;
  let level = st.level;
  if (waiting && stillFor >= PATIENCE.settle) level = Math.min(1, level + dt / s.fill);
  else if (s.kind === 'mist' && !waiting) level = Math.max(0, level - dt * PATIENCE.ebb);
  // (a frond that has started and is left just stops where it is: slow is not stopped)
  const done = s.kind === 'frond' && level >= 1;
  return { level, stillFor, done };
}

/** frond: is the bridge there to stand on? */
export const frondSolid = (st: PatienceState): boolean => st.done;

/** mist: how clearly the hidden ledges show (0 hidden .. 1 plain). They fade in over the last half of the fill, so a glimpse comes first */
export const mistReveal = (st: PatienceState): number => Math.max(0, Math.min(1, (st.level - 0.5) / 0.5));
