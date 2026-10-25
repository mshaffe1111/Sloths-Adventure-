/**
 * waterfalls — World 4's falls that Pokey can turn off (4-3 Waterfall Steps). A pouring fall pushes him down and holds him back, so the
 * steps under it cannot be climbed. Three ways past one:
 *   plug   roll a boulder (a pushable platform) into the stream's channel above: the fall dries to a trickle while it sits there
 *   surge  a fall that pours and eases on its own rhythm: wait in the cave behind it for the quiet spell (it warns as it eases)
 *   pool   a fall that feeds a pool, where a log floats: while it pours the log rides high enough to reach the next ledge, and once the
 *          fall is plugged the pool drains and the log sinks. So the order matters: ride the log up first, then plug the fall.
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on how much each fall is pouring.
 */

export interface Waterfall {
  id: number;
  /** the falling water's left edge and width, and its top and bottom (world px) */
  x: number;
  width: number;
  top: number;
  bottom: number;
  /** the boulder that stops it once it sits in the channel: its platform id, and the x its left edge must reach */
  plug?: { platformId: number; atX: number };
  /** a fall on its own rhythm: seconds pouring, easing (the warning), and quiet, and where in the cycle it starts */
  surge?: { pour: number; ease: number; quiet: number; offset: number };
  /**
   * a curtain of water pouring over the path from the cliff above, with a hollow behind it (4-5): standing in it hides him from the
   * Sovereign and the lookouts (W4Play.behindFall), and it neither pushes him nor holds him back. Drawn in front of him.
   */
  veil?: boolean;
}

/** a pool a fall keeps full, and the log that floats on it (a platform that rises and sinks with the water) */
export interface Pool {
  fedBy: number;
  platformId: number;
  /** the log's top when the pool is full, and when it has drained */
  fullY: number;
  emptyY: number;
}

export const FALLS = {
  /** px/s added to his fall speed each second while he is in pouring water, and the most it can push */
  push: 2600,
  maxDown: 520,
  /** how much of his walking speed is left while he stands in pouring water */
  wade: 0.35,
  /** seconds a plugged fall takes to dry up, and to start again when the plug is moved */
  dry: 1.2,
  /** seconds a pool takes to drain or refill, all the way */
  drain: 2.5,
  /** below this a fall is a trickle: it pushes nobody */
  trickle: 0.15,
} as const;

/** is a fall's boulder sitting in its channel? (the boulder's left edge at or past the slot) */
export function plugged(w: Waterfall, platformX: (id: number) => number | undefined): boolean {
  if (!w.plug) return false;
  const x = platformX(w.plug.platformId);
  return x !== undefined && x >= w.plug.atX - 2;
}

/** a surge fall's own pour at time t, 0..1: full while pouring, easing down, then quiet (ramps back up fast) */
export function surgeFlow(s: NonNullable<Waterfall['surge']>, t: number): number {
  const T = s.pour + s.ease + s.quiet;
  const c = (((t + s.offset) % T) + T) % T;
  if (c < s.pour) return Math.min(1, c / 0.4); // (it roars back in over the first 0.4 s)
  if (c < s.pour + s.ease) return 1 - (c - s.pour) / s.ease;
  return 0;
}

/** the next value of a fall's flow (0 dry .. 1 pouring): it eases toward what its plug and rhythm ask for */
export function stepFlow(w: Waterfall, flow: number, isPlugged: boolean, t: number, dt: number): number {
  if (w.surge && !w.plug) return surgeFlow(w.surge, t);
  const want = isPlugged ? 0 : 1;
  const step = dt / FALLS.dry;
  return want > flow ? Math.min(want, flow + step) : Math.max(want, flow - step);
}

/** the next water level of a pool (0 drained .. 1 full): it follows its fall, slowly */
export function stepPool(level: number, fallFlow: number, dt: number): number {
  const want = fallFlow > FALLS.trickle ? 1 : 0;
  const step = dt / FALLS.drain;
  return want > level ? Math.min(want, level + step) : Math.max(want, level - step);
}

/** where a pool's floating log sits at a water level */
export const poolLogY = (p: Pool, level: number): number => p.emptyY + (p.fullY - p.emptyY) * level;

/** is he inside a fall's water? (his middle x, his feet y, his height) */
export function inFall(w: Waterfall, px: number, feetY: number, height: number): boolean {
  return px > w.x && px < w.x + w.width && feetY > w.top && feetY - height < w.bottom;
}

/** what pouring water does to him this frame: his new vertical and sideways speed (a trickle does nothing) */
export function fallPush(flow: number, v: { vx: number; vy: number; grounded: boolean }, dt: number): { vx: number; vy: number } {
  if (flow <= FALLS.trickle) return { vx: v.vx, vy: v.vy };
  const vx = v.grounded ? v.vx * (1 - (1 - FALLS.wade) * flow) : v.vx;
  const vy = v.grounded ? v.vy : Math.min(FALLS.maxDown * flow, v.vy + FALLS.push * flow * dt);
  return { vx, vy };
}
