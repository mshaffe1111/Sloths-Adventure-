import type { Rope } from './types.ts';

/** Shimmy ropes: the numbers shared by the engine, the drawing, the level builder and the beatability check. */

/** how far the rope sags in the middle (px) */
export const ROPE_SAG = 12;
/** how fast Pokey creeps along a rope (px/s): well under his running speed, so a crossing feels deliberate */
export const ROPE_SPEED = 120;
/** from the rope down to his feet while hanging (his arms are raised: the painted jump_up pose is 94 px tall) */
export const HANG_DROP = 86;
/** while he hangs, what he picks up is measured from this far above his feet (his middle: a bloom just under the rope is at his arms) */
export const HANG_PICK = 50;
/** how far above his feet his hands reach when he jumps (px) */
export const HAND_REACH = 70;
/** how high above the ledges a rope is hung: a normal jump (rise 88 at the least) puts his hands on it with room to spare */
export const ROPE_RISE = 146;
/** the rope's ends reach this far over the ledges, so letting go at an end drops him onto solid ground */
export const ROPE_OVERLAP = 44;
/** how far past a rope's end (over the ledge, beside its post) a jump still catches it (px); he is slid onto the rope's end */
export const ROPE_GRAB = 40;
/** a required rope is caught falling when he last stood on its own ledge, within this far of its ends (px): the jump was for it */
export const ROPE_FROM = 300;
/** how fast he slides onto a rope caught past its end (px/s): 40 px in about 3 frames, not one jump */
export const ROPE_SLIDE = 420;
/** the shortest gap worth a rope: wider than a double jump can clear (313 px at best), with margin */
export const ROPE_MIN_GAP = 370;

/** the rope's height at x (it sags a little between its ends) */
export function ropeYAt(r: Rope, x: number): number {
  const t = Math.max(0, Math.min(1, (x - r.x0) / Math.max(1, r.x1 - r.x0)));
  return r.y + ROPE_SAG * 4 * t * (1 - t);
}
