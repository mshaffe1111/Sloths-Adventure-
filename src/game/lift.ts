/**
 * World 2's rope-and-basket lift (2-7 The Mailman's Route): a basket on a rope that rides between a low stop and a high one, waiting at
 * each end so he can step on and off. Pure (no canvas, no engine), so the stage builder, the checker, the engine and the tests agree on
 * where the basket is at any moment.
 */

export interface LiftInfo {
  /** the basket floor's height at the top stop and at the bottom stop (y grows downward: top < bottom) */
  top: number;
  bottom: number;
  /** px per second while it moves */
  speed: number;
  /** seconds it waits at each stop */
  wait: number;
  /** seconds into the cycle at game time 0 (it starts waiting at the bottom) */
  phase: number;
  /** the crane stands on the right of the shaft (the upper ground is to the right: a lift going up) */
  postRight?: boolean;
  /** World 9's moving logs (gen2 place `raft`, GRAB-BAG.md N1-N3): a pumice raft or a charred log bobbing on the lava's heat draught, or a
   *  hex piston column, or an ember slab that sinks while he stands on it (`sink`: its own motion, engine.ts, not this cycle); drawn by w9BobArt.ts, not as a basket lift, and read by the inspector as a timed hop (a raft, a log) or a ride (a piston) */
  bob?: 'raft' | 'log' | 'piston' | 'sink';
}

/** seconds for one round trip: wait at the bottom, ride up, wait at the top, ride down */
export const liftCycle = (l: LiftInfo) => 2 * ((l.bottom - l.top) / l.speed + l.wait);

/** the basket floor's height at game time t (eased at each end, so it starts and stops gently) */
export function liftY(l: LiftInfo, t: number): number {
  const ride = (l.bottom - l.top) / l.speed;
  const T = liftCycle(l);
  const u = (((t + l.phase) % T) + T) % T;
  const ease = (k: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.max(0, Math.min(1, k)));
  if (u < l.wait) return l.bottom;
  if (u < l.wait + ride) return l.bottom - (l.bottom - l.top) * ease((u - l.wait) / ride);
  if (u < 2 * l.wait + ride) return l.top;
  return l.top + (l.bottom - l.top) * ease((u - 2 * l.wait - ride) / ride);
}

/** seconds left of its still spell at the top stop (0 when it is not resting there): a moving log a jump can still land on in time */
export function liftTopLeft(l: LiftInfo, t: number): number {
  const ride = (l.bottom - l.top) / l.speed;
  const T = liftCycle(l);
  const u = (((t + l.phase) % T) + T) % T;
  const a = l.wait + ride;
  return u >= a && u < a + l.wait ? a + l.wait - u : 0;
}

/** rising, and this close to its top stop (s): on its way up to where a jump lands on it */
export function liftRisingIn(l: LiftInfo, t: number): number {
  const ride = (l.bottom - l.top) / l.speed;
  const T = liftCycle(l);
  const u = (((t + l.phase) % T) + T) % T;
  return u >= l.wait && u < l.wait + ride ? l.wait + ride - u : Infinity;
}

/** the basket is resting at a stop (0 = moving, 1 = at the top, -1 = at the bottom) */
export function liftStop(l: LiftInfo, t: number): -1 | 0 | 1 {
  const y = liftY(l, t);
  return y <= l.top + 0.5 ? 1 : y >= l.bottom - 0.5 ? -1 : 0;
}

/** a floor his feet can meet: where it is, and whether it moves (a lift's basket, a sliding ledge) */
export interface FloorLike {
  x: number;
  y: number;
  width: number;
  type: string;
}

/**
 * Of the floors his feet meet this frame (in stage order), the one he stands on. Usually the first; but where two meet him level, or
 * near enough (a basket at its bottom stop sits flush on the path under it, and on its last frames down it is a frame's fall above it),
 * the one under his middle wins, and a moving one over a still one: he is in the basket, not on the ground beneath it. Without this the
 * stage order decided, and a basket built after the path under it (every lift going up in 2-7) rose empty, leaving him on the path.
 */
export function pickFloor<T extends FloorLike>(floors: readonly T[], px: number): T | undefined {
  const first = floors[0];
  if (!first || floors.length === 1) return first;
  const top = Math.min(...floors.map((f) => f.y));
  const rank = (f: T) => (px >= f.x && px <= f.x + f.width ? 2 : 0) + (f.type === 'moving' ? 1 : 0);
  let best = first;
  for (const f of floors) if (f.y <= top + FLOOR_TIE && rank(f) > rank(best)) best = f;
  return best;
}

/** floors this close in height count as level for pickFloor (px): more than a frame's fall from rest at 30 fps (2500 / 30² ≈ 2.8) */
export const FLOOR_TIE = 6;
