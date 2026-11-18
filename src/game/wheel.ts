/**
 * wheel — a water wheel that lifts him (2-6 "Up the Bank Houses", reference/design/2-6.md NEW 1; ENG-26): a wheel the river turns, its
 * buckets level on the rim (a gondola), lifting a rider from a jetty at its foot to a street over its top. It never stops; it is slow.
 *
 *   - The wheel: axle (cx, cy), rim R, N buckets each W wide, rim speed V px/s, turning so its TOP moves `way` (the way he travels: he
 *     boards at the foot from the jetty behind the wheel and steps off over the top onto the street ahead). Bucket i is at angle
 *     phi = V t / R + 2 pi i / N + phase from the bottom; its floor's middle is (cx - way R sin phi, cy + R cos phi): the bottom moves BACK
 *     toward the jetty, up the near side, over the top moving `way`, down the far side (reference/specs/sims/wheel26.ts, the flight).
 *   - The jetty stands on the rising (near) side, its top DROP px over the bottom floor, its lip where a bucket's near edge meets that
 *     height: a bucket rises past it without lifting him off it. The street stands on the far side, its top DROP px under the top floor:
 *     at the sweep's edge ('edge'), reaching in over the top so the buckets pass behind it ('in'), or `up` px ABOVE the top floor reached by
 *     a jump off the top ('up').
 *   - Carrying is the engine's one carry rule (engine.ts carryVx, ride.ts RIDE.keep): the piece (pieces/wheelPiece.ts) moves each bucket and
 *     its rider by the bucket's own (dx, dy), as pieces/ridePiece.ts does.
 *
 * Pure (no canvas, no engine). Every number a stage needs is its world's row (gen2/wheelLay.ts WheelRow); nothing here names a stage.
 */

export const WHEEL = {
  /** a lip's top under the bucket floor passing it (px): river.ts LOG_DROP, a log's step down from the bank (2-6.md) */
  drop: 28,
  /** a bucket's floor: its width (px; 2-6.md "buckets 120 px", 1.35 of Pokey's drawn 89.1) and its thickness */
  bucketW: 120,
  bucketH: 16,
  /** the pond's surface under the wheel's bottom floor (px; the flight's pond), how far it reaches past the sweep each side (a miss off a
   *  bucket carries on sideways as it falls: a step off the top at a run's speed lands up to this far out), and its water's depth (nothing
   *  stands under its surface that deep: the lay keeps the room, wheelLay.ts wheelFaults holds it) */
  pond: 160,
  pondMargin: 160,
  pondDepth: 60,
  /** an 'in' or 'up' street's lip: this far past the axle, over the top (px; the flight's STREET_IN_X) */
  streetIn: 20,
} as const;

export interface Wheel {
  cx: number;
  cy: number;
  /** rim radius to a bucket's floor (px) */
  R: number;
  /** buckets */
  N: number;
  /** a bucket's floor width (px) */
  W: number;
  /** rim speed (px/s) */
  V: number;
  /** the way its top moves (and he travels) */
  way: 1 | -1;
  /** bucket 0's angle at t = 0 (rad from the bottom) */
  phase?: number;
  /** what gen2 laid it with (gen2/wheelLay.ts layWheel): its row, its street's kind and height, its jetty's and its street's platform ids
   *  (the fairness check holds them to the flown layout) */
  lay?: { row: string; street: StreetKind; up: number; jetty: number; streetId: number };
}

/** a bucket platform's seat on its wheel (Platform.wheel): the wheel (one object shared by its buckets) and the bucket's index */
export interface WheelSeat {
  w: Wheel;
  i: number;
}

/** one whole turn (s) */
export const turnTime = (w: Pick<Wheel, 'R' | 'V'>): number => (2 * Math.PI * w.R) / w.V;
/** a bucket reaches the same spot every (s) */
export const bucketPeriod = (w: Pick<Wheel, 'R' | 'V' | 'N'>): number => turnTime(w) / w.N;

/** bucket i's angle from the bottom at time t (rad, growing) */
export const bucketAngle = (w: Wheel, i: number, t: number): number => (w.V / w.R) * t + (2 * Math.PI * i) / w.N + (w.phase ?? 0);

/** bucket i's floor at time t: its left end x and its top y (the platform's x, y) */
export function bucketAt(w: Wheel, i: number, t: number): { x: number; y: number } {
  const phi = bucketAngle(w, i, t);
  return { x: w.cx - w.way * w.R * Math.sin(phi) - w.W / 2, y: w.cy + w.R * Math.cos(phi) };
}

/** how far from the axle (px, sideways) a bucket's floor is when it is `drop` px off the bottom or the top */
export const lipOff = (R: number, drop: number = WHEEL.drop): number => Math.sqrt(Math.max(0, 2 * R * drop - drop * drop));

/** where the street stands: at the sweep's edge, in over the top, or `up` px above the top floor */
export type StreetKind = 'edge' | 'in' | 'up';

/** the jetty's lip and the street's lip (x of the end that faces the wheel, y of the top) for a wheel */
export function wheelLips(w: Wheel, street: StreetKind, up = 0): { jettyX: number; jettyY: number; streetX: number; streetY: number } {
  const off = lipOff(w.R) + w.W / 2;
  const jettyX = w.cx - w.way * off, jettyY = w.cy + w.R - WHEEL.drop;
  if (street === 'edge') return { jettyX, jettyY, streetX: w.cx + w.way * off, streetY: w.cy - w.R + WHEEL.drop };
  return { jettyX, jettyY, streetX: w.cx + w.way * WHEEL.streetIn, streetY: street === 'up' ? w.cy - w.R - up : w.cy - w.R + WHEEL.drop };
}

/** the wheel's axle from its jetty's lip (the lay works from the jetty he arrives on) */
export function axleFromJetty(jettyX: number, jettyY: number, R: number, W: number, way: 1 | -1): { cx: number; cy: number } {
  return { cx: jettyX + way * (lipOff(R) + W / 2), cy: jettyY - R + WHEEL.drop };
}

/** the box a bucket's floor sweeps (px): the rim's circle widened by half a bucket each side and its floor's thickness under it */
export function sweepBox(w: Pick<Wheel, 'cx' | 'cy' | 'R' | 'W'>): { x0: number; x1: number; y0: number; y1: number } {
  return { x0: w.cx - w.R - w.W / 2, x1: w.cx + w.R + w.W / 2, y0: w.cy - w.R, y1: w.cy + w.R + WHEEL.bucketH };
}

/**
 * is the point (x, y) inside the space a bucket's floor passes through (between the rim's floors at that height, and that height inside
 * the circle)? For "no other solid in the sweep": a solid whose top crosses a bucket's floor path would knock him out of his bucket.
 * A bucket's floor at height y spans x in [cx - s - W/2, cx + s + W/2] over the near and the far side, s = sqrt(R^2 - (y - cy)^2).
 */
export function inSweep(w: Pick<Wheel, 'cx' | 'cy' | 'R' | 'W'>, x: number, y: number): boolean {
  const dy = y - w.cy;
  if (Math.abs(dy) > w.R) return false;
  const s = Math.sqrt(w.R * w.R - dy * dy);
  // the floor path at this height: the two points (cx +- s), each widened by half a bucket
  return Math.abs(Math.abs(x - w.cx) - s) <= w.W / 2;
}
