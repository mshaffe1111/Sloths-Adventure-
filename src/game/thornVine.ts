/**
 * thornVine — World 3's sleeping thorn vines (3-5 Sleeping Vines, 3-8): old vines hanging from the cave roof, asleep. Grandma always
 * said they were asleep. One of them moved.
 *
 * Each vine dozes on a fixed rhythm: asleep, then it stirs (an eye cracks open: the warning), then it looks (both eyes open). Anyone
 * moving within its reach while it looks is lashed: Pokey loses a heart unless he is out of reach by the time the lash lands. Standing
 * still, or ducking, while it looks is safe, and it dozes off again. Because the rhythm never changes and the warning is long, a vine
 * can always be passed while it sleeps, or waited out standing still: the grotto's lesson again, stop and listen.
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on what a vine is doing at any moment.
 */

export interface ThornVine {
  /** where it hangs (world px), the roof it hangs from, and the bottom of its bud */
  x: number;
  top: number;
  bud: number;
  /** how far either side of it the lash reaches (px) */
  reach: number;
  /** how far below the bud it reaches (px; VINE.below when unset). 3-8's vines hang over the lianas' gaps, where he flies far below */
  below?: number;
  /** seconds asleep, stirring (the warning), and looking, per cycle */
  sleep: number;
  stir: number;
  look: number;
  /** seconds into the cycle at game time 0 (neighbours are staggered) */
  offset: number;
  /**
   * 3-5's awake vine (the puzzle kit's pebble lure, 2026-10-28): it never sleeps (sleep and stir 0: always looking), so the only way past
   * is a noise it turns to (a pebble thrown past it, a bell). Its lash swats him back out of its reach without costing a heart: a puzzle
   * never costs a life.
   */
  awake?: boolean;
}

export type VinePhase = 'sleep' | 'stir' | 'look';

export const VINE = {
  /** the lash: from the moment it sees him to the moment it lands (s), and how long it stays out */
  windup: 0.3,
  out: 0.45,
  /** moving: faster than this (px/s) on the ground, or off the ground at all */
  still: 25,
  /** how low his feet can be under the bud and still be lashed (a vine over a pit cannot reach down into it) */
  below: 140,
} as const;

export const vinePeriod = (v: Pick<ThornVine, 'sleep' | 'stir' | 'look'>) => v.sleep + v.stir + v.look;

/** what a vine is doing at time t, and how far through that it is (0..1) */
export function vinePhase(v: ThornVine, t: number): { phase: VinePhase; u: number } {
  const T = vinePeriod(v);
  const c = (((t + v.offset) % T) + T) % T;
  if (c < v.sleep) return { phase: 'sleep', u: c / v.sleep };
  if (c < v.sleep + v.stir) return { phase: 'stir', u: (c - v.sleep) / v.stir };
  return { phase: 'look', u: (c - v.sleep - v.stir) / v.look };
}

/** is he in a vine's reach (beside it, and not far below its bud)? */
export function inReach(v: ThornVine, px: number, feetY: number): boolean {
  return Math.abs(px - v.x) < v.reach && feetY > v.bud && feetY < v.bud + (v.below ?? VINE.below);
}

/** does a vine that is looking see him? (moving within its reach) */
export function vineSees(v: ThornVine, t: number, p: { x: number; y: number; vx: number; grounded: boolean; ducking?: boolean; swinging?: boolean }, listening = false): boolean {
  if (vinePhase(v, t).phase !== 'look') return false;
  // a vine listening to the puzzle kit's noise (noise.ts: a stone landing, a bell) has turned toward it and sees nothing else
  if (listening) return false;
  if (!inReach(v, p.x, p.y)) return false;
  if (p.ducking) return false;
  // a sloth hanging on a liana is the stillest thing in the forest, however it swings: an old vine does not see him there (3-8: wait
  // on the liana while the vine looks, and leap while it sleeps)
  if (p.swinging) return false;
  return !p.grounded || Math.abs(p.vx) > VINE.still;
}

/** the longest a player can be made to wait standing still before the vine sleeps again (for the stage's timing) */
export const vineWait = (v: Pick<ThornVine, 'stir' | 'look'>) => v.stir + v.look;
