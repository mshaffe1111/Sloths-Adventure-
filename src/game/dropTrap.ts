/**
 * dropTrap — a drop trap (GAME-MAP B2): a load hung over an animal's ground, let go by a blow on its handle. One small machine, pure
 * (no canvas, no engine, no rolls):
 *
 *   set  ->  loose (it creaks and sways for `warn`: the tell)  ->  falling  ->  down (it lies where it fell, harmless)
 *
 * The load never hurts him. What it does to an animal is the kit's 'trap' way (predators/core.ts `beat`): everything on the ground it
 * comes down on, within `scare` px, is beaten by it. No stings, no hit shown: the buzz or the thud chases them off (story keeper).
 */
import type { TrapPost } from './castPlay.types.ts';

export const TRAP = {
  /** the handle's box: this wide, from `low` to `high` px over the ground he stands on (a standing punch and a jumping one both find it) */
  handle: { w: 44, low: 8, high: 120 },
  /** seconds it creaks and sways before it lets go (the tell; longer on Easy would only slow him: the load never hurts) */
  warn: 0.3,
  /** it falls at this (px/s²), and no faster than `maxV` */
  g: 1500,
  maxV: 900,
  /** an animal on its ground within this far (px) of where it comes down is chased off (wider than a snake's 105 px strike) */
  scare: 170,
  /** and no more than this far above or below the ground it lands on (px) */
  tall: 60,
} as const;

export type TrapPhase = 'set' | 'loose' | 'falling' | 'down';
export interface TrapState {
  post: TrapPost;
  phase: TrapPhase;
  /** seconds in the phase */
  t: number;
  /** the load's y (its bottom) and speed */
  y: number;
  vy: number;
}

export const newTrap = (post: TrapPost): TrapState => ({ post, phase: 'set', t: 0, y: post.loadY, vy: 0 });

/** the handle's box in the stage */
export const handleBox = (p: TrapPost): { x: number; y: number; w: number; h: number } =>
  ({ x: p.x - TRAP.handle.w / 2, y: p.y - TRAP.handle.high, w: TRAP.handle.w, h: TRAP.handle.high - TRAP.handle.low });

/** a blow landed on its handle: a set trap is let go (true). One that is already going, or down, is not set again */
export function shake(s: TrapState): boolean {
  if (s.phase !== 'set') return false;
  s.phase = 'loose';
  s.t = 0;
  return true;
}

/** one fixed step. True on the step it lands */
export function stepTrap(s: TrapState, dt: number): boolean {
  s.t += dt;
  if (s.phase === 'loose' && s.t >= TRAP.warn) {
    s.phase = 'falling';
    s.t = 0;
  } else if (s.phase === 'falling') {
    s.vy = Math.min(TRAP.maxV, s.vy + TRAP.g * dt);
    s.y += s.vy * dt;
    if (s.y >= s.post.landY) {
      s.y = s.post.landY;
      s.vy = 0;
      s.phase = 'down';
      s.t = 0;
      return true;
    }
  }
  return false;
}

/** is an animal standing at (x, y) chased off by this trap coming down? */
export const scares = (p: TrapPost, x: number, y: number): boolean => Math.abs(x - p.loadX) <= TRAP.scare && Math.abs(y - p.landY) <= TRAP.tall;
