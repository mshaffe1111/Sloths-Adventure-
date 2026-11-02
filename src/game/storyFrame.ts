/** storyFrame — how a story picture is framed on the phone: the close-up cap and the lift that keeps feet clear of the words (ST-1) */
import { CEL_K } from './storyCels.ts';

/** a story figure never draws above this many device pixels per pixel of its cel (polish report ST-1: they came out 3.6x, soft) */
export const MAX_CEL_MAG = 1.5;
/**
 * The camera's zoom, held down so the largest figure draws at no more than MAX_CEL_MAG times its cel, but never below the picture's own
 * framing (1): `dev` is device pixels per scene unit, `actorScale` the largest figure's own scale. With today's cels (CEL_K) a phone held
 * sideways is already past the cap at 1, so its close-ups hold the plain framing until the cels are repainted larger (ST-1's art part:
 * a smaller CEL_K gives the close-ups their room back by itself).
 */
export function capStoryZoom(z: number, dev: number, actorScale = 1): number {
  // (measured against the old sheets' size on purpose: the shots were framed under this cap, and letting the repainted cels zoom in
  // further cut heads off at the top of the picture)
  const room = MAX_CEL_MAG / Math.max(1e-6, dev * CEL_K * actorScale);
  return Math.min(z, Math.max(1, room));
}
/**
 * How far the picture is raised (a share of its height) so the ground the figures stand on is at or above `feetMax` of the view (the top
 * of the words box laid over a sideways screen): `gy` is where the ground falls in the view, unraised. Never below `lift`, at most 0.32.
 */
export function liftForFeet(gy: number, h: number, feetMax: number, lift: number): number {
  return Math.min(0.32, Math.max(lift, (gy - feetMax * h) / h));
}

/**
 * A beaten guardian lies low, and its painted card frame is drawn 24 units under the ground line (the old vector drawings' shadow
 * offset): on a defeat card it sank behind the words box, half of it upright and nearly all of it sideways, where the camera may lift
 * the picture only so far (R-1.1, 2026-11-02; Crocus Rex, "he must read"). It moves back up the scene just far enough that its bottom
 * clears the box (`boxTop`, the line the box's top sets, also in a close shot that does not lift the picture), as if lying a little
 * further off; a guardian that already shows is untouched.
 */
/** how far below its feet a painted guardian's card frame reaches, per unit of actor scale (the boss case: 0.62 x the 24-unit drop, and
 * a little for the frame's own shadow) */
const BEATEN_DROP = 0.62 * 24 + 6;

export function clearOfBox<A extends { kind: string; beaten?: boolean; seq?: unknown; y?: number; scale?: number }>(
  a: A, ground: number, h: number, fy: number, z: number, vh: number, lift: number, feetMax: number, sink = 5,
): A {
  if (a.kind !== 'boss' || !a.beaten || a.seq || feetMax >= 1) return a;
  const footY = (a.y ?? ground) * h;
  const bottom = footY + sink + BEATEN_DROP * 3 * (a.scale ?? 1);
  const visible = fy + ((feetMax + lift) * vh - vh / 2) / z;
  const raise = bottom - visible;
  return raise > 0 ? { ...a, y: (footY - raise) / h } : a;
}
