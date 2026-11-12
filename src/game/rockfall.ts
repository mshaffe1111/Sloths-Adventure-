/**
 * rockfall — World 4's crumbling cliff (4-1 The Broken Ledge): bits of the broken ledge above keep coming loose. Each drop point lets go
 * of a rock on its own rhythm; first its shadow grows on the rock face below (the warning), then the rock falls and shatters at the
 * bottom. Stopping under an overhang (or simply waiting for it to pass) is always safe: a drop point never lands where the stage puts
 * an overhang, and the warning is long enough to stop from a walk.
 *
 * Pure (no canvas, no engine): the stage builder, the engine and the tests agree on where every rock is.
 */

import { cycle3 } from './clock.ts';

export interface RockDrop {
  /** where it lets go (world px), and the surface it lands on */
  x: number;
  top: number;
  land: number;
  /** seconds between rocks, of which the last `warn` show the shadow first; where in the cycle it starts */
  every: number;
  warn: number;
  offset: number;
  /** falls through open air (a gap in 4-7): no ground under it for a shadow, so the warning is the grit trickling from above */
  air?: boolean;
}

export const ROCK = {
  /** how fast a rock falls (px/s, a steady drop: it is a game, and a rock you can read is fair) */
  speed: 620,
  /** how wide a rock is, for hitting him (px) */
  radius: 22,
  /** how long the shatter shows on the ground (s) */
  shatter: 0.5,
} as const;

export type RockPhase = 'idle' | 'warn' | 'fall' | 'shatter';

/** what a drop point is doing at time t: its phase, how far through it (0..1), and the rock's height while it falls */
export function rockAt(r: RockDrop, t: number): { phase: RockPhase; u: number; y: number } {
  const fallT = Math.max(0.01, (r.land - r.top) / ROCK.speed);
  const warnAt = r.every - r.warn - fallT - ROCK.shatter;
  // the one clock (clock.ts): quiet until warnAt, the shadow for `warn`, then the rock is loose for the rest of the cycle
  const k = cycle3(t, r.offset, r.every, warnAt, r.warn);
  if (k.index === 0) return { phase: 'idle', u: k.into / Math.max(0.01, warnAt), y: r.top };
  if (k.index === 1) return { phase: 'warn', u: k.into / r.warn, y: r.top };
  const f = k.into;
  if (f < fallT) return { phase: 'fall', u: f / fallT, y: r.top + f * ROCK.speed };
  return { phase: 'shatter', u: (f - fallT) / ROCK.shatter, y: r.land };
}

/** does a falling rock hit him now? (his middle x, his feet y, his height) */
export function rockHits(r: RockDrop, t: number, px: number, feetY: number, height: number): boolean {
  const s = rockAt(r, t);
  if (s.phase !== 'fall') return false;
  return Math.abs(px - r.x) < ROCK.radius + 14 && s.y > feetY - height && s.y - ROCK.radius * 2 < feetY;
}

/** the stage builder's check: a drop's cycle leaves time for the warning, the fall and the shatter, with room to spare */
export const rockFits = (r: RockDrop): boolean => r.every - r.warn - (r.land - r.top) / ROCK.speed - ROCK.shatter >= 0.6;
