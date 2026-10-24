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

/** the basket is resting at a stop (0 = moving, 1 = at the top, -1 = at the bottom) */
export function liftStop(l: LiftInfo, t: number): -1 | 0 | 1 {
  const y = liftY(l, t);
  return y <= l.top + 0.5 ? 1 : y >= l.bottom - 0.5 ? -1 : 0;
}
