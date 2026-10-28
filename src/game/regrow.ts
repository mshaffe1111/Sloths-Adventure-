/**
 * regrow — when a crumbled platform (a broken log, a fragile plank, a ruin tile) grows back (Matt, 2026-10-28): breaking one is a
 * penalty, so it comes back only after REGROW.min to REGROW.max seconds (each platform its own fixed time in that range), and only while
 * it is off screen, so it never pops back in view, and never where Pokey is. Crumbling platforms are never needed to finish a stage
 * (levelCheck.ts treats them so), so the long wait costs time, never the way on.
 *
 * Pure: the engine asks it each frame (engine.ts, the fragile platforms' step).
 */

export const REGROW = {
  min: 30,
  max: 35,
  /** off screen means this far (px) clear of every edge of the view */
  margin: 80,
} as const;

/** how long this platform takes to grow back (s): a fixed share of the range by its id, so it is the same every time */
export function regrowDelay(id: number): number {
  const u = (((id * 2654435761) >>> 0) % 1000) / 1000;
  return REGROW.min + (REGROW.max - REGROW.min) * u;
}

export interface ViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** is a platform's box wholly out of the view (with the margin) */
export function offScreen(p: { x: number; y: number; width: number; height: number }, v: ViewBox, margin: number = REGROW.margin): boolean {
  return p.x + p.width < v.x - margin || p.x > v.x + v.w + margin || p.y + p.height < v.y - margin || p.y > v.y + v.h + margin;
}

/**
 * May a crumbled platform grow back now: its time has come, it is off screen, and he is not where it would appear.
 * `regrowAt`: the game time it may come back from (set when it broke: the time it broke plus regrowDelay).
 */
export function mayRegrow(
  p: { x: number; y: number; width: number; height: number; regrowAt?: number },
  t: number,
  view: ViewBox,
  hero: { x: number; y: number },
): boolean {
  if (p.regrowAt === undefined || t < p.regrowAt) return false;
  const inside = hero.x + 20 > p.x && hero.x - 20 < p.x + p.width && hero.y > p.y - 70 && hero.y < p.y + p.height + 10;
  return !inside && offScreen(p, view);
}
