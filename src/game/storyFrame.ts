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
