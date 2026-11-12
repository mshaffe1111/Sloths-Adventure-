/**
 * stillness — Pokey's signature move (MAP-REVISIONS §1): hold still and the hunters that look for movement lose him.
 *
 * Two parts, both pure (no canvas, no engine):
 *   - the state: he is still when he is on the ground under a small speed, or holding a vine without climbing it, and has been for the
 *     calm-in time. Never in the air. `calm` (0..1) is the tell the art lane draws (the moss creeping in); a step breaks it at once.
 *   - the watcher contract any predator reads (an eagle's shadow, a gaze sweep, a night hunter): it sees MOVEMENT inside its cone or
 *     shadow. A still Pokey inside cover is unseen by all of them; a still Pokey in the open is seen only by a watcher that `seesStill`.
 *
 * The numbers are data (STILLNESS), one set a setting; Easy is never harder.
 */

export interface StillSetting {
  /** under this speed he is not moving (px/s): the same line the thorn vines draw (thornVine.ts VINE.still) */
  speed: number;
  /** how long he must hold still before he is hidden (s): the time the tell takes to come all the way in */
  calmIn: number;
}

export const STILLNESS: Record<'normal' | 'easy', StillSetting> = {
  normal: { speed: 25, calmIn: 0.5 },
  easy: { speed: 25, calmIn: 0.35 },
};

/** what stillness reads of him on a frame */
export interface StillBody {
  vx: number;
  vy: number;
  grounded: boolean;
  /** holding a vine or a rope (a liana's swing may carry him: that is the vine moving, not him) */
  holding: boolean;
}

export interface StillState {
  /** seconds he has held still */
  held: number;
}

export const newStill = (): StillState => ({ held: 0 });

/** is he moving on this frame? In the air, always; on a vine, when he climbs; on the ground, at a walk or more */
export const moving = (p: StillBody, set: StillSetting): boolean =>
  p.holding ? Math.abs(p.vy) >= set.speed : !p.grounded || Math.abs(p.vx) >= set.speed;

/** one fixed step: the hold grows while he is still and is gone the frame he moves */
export function stepStill(s: StillState, p: StillBody, dt: number, set: StillSetting): StillState {
  s.held = moving(p, set) ? 0 : s.held + dt;
  return s;
}

/** the tell, 0..1: how far the calm has come in */
export const calm = (s: StillState, set: StillSetting): number => Math.min(1, s.held / set.calmIn);

/** still enough to be lost by a hunter */
export const isStill = (s: StillState, set: StillSetting): boolean => s.held >= set.calmIn;

/** how a predator looks. Default: it looks for movement */
export interface Watcher {
  /** it sees him in the open even when he is still (World 1's eagle: only a bush hides him; World 5's spiders, which sense touch) */
  seesStill?: boolean;
}

/**
 * Does a watcher see him this frame? `inSight`: he is inside its cone or under its shadow (the watcher's own geometry). `still`:
 * isStill. `covered`: inCover. Movement in sight is always seen, in cover too (the leaves shake).
 */
export const watcherSees = (w: Watcher, inSight: boolean, still: boolean, covered: boolean): boolean =>
  inSight && (!still || (!covered && !!w.seesStill));

/** a place that hides a still sloth (a bush, a bank of moss): on the ground with its bottom on the surface `y`, or hanging with its top at `y` */
export interface Cover {
  x: number;
  w: number;
  y: number;
  hanging?: boolean;
  /** dressing only: not a hiding place */
  secret?: boolean;
}

/** is he inside cover? (the same place the bush hide uses, watcher.ts `hidden`; whether he is still is the state's business) */
export function inCover(covers: readonly Cover[], p: { x: number; y: number; grounded: boolean; holding: boolean }): boolean {
  for (const c of covers) {
    if (c.secret || p.x < c.x + 10 || p.x > c.x + c.w - 10) continue;
    if (c.hanging ? p.holding && p.y > c.y && p.y < c.y + 150 : p.grounded && Math.abs(p.y - c.y) < 10) return true;
  }
  return false;
}
