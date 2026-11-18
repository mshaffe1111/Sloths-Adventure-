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
  /** the hung load's distance from its handle (px): under the least he would stand in the animal's reach; over the most the load is
   *  off an upright phone's screen from the handle (about 425 px of stage across, him a third of the way in: measured on stills) */
  reach: [140, 190],
  /** a pickup this near the load's line or the handle's (px), at their height, stands in front of the trap: its glow hides the prop */
  clear: 50,
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

/** a 'limb' trap's limb has given way (gen2/creak.ts): it falls at once (its creak was the tell). One already going, or down, stays */
export function limbGone(s: TrapState): boolean {
  if (s.phase !== 'set' || s.post.kind !== 'limb') return false;
  s.phase = 'falling';
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

/**
 * What is wrong with a stage's traps, in words (none: they may be laid). A trap must be in plain view before it can be used, and worth
 * using: it has its handle; an animal's patch runs under its load, on the ground it lands on; the load is TRAP.reach from the handle;
 * and no pickup stands in front of the load (from its top down to its ground) or on the handle. `animals`: as the stage holds them
 * (y their middle). A stage's builder asks this for every stage that names a cast (gen2/pipeline.ts)
 */
export function trapFaults(
  traps: readonly TrapPost[], pickups: ReadonlyArray<{ x: number; y: number }>,
  animals: ReadonlyArray<{ x: number; y: number; patrolMinX: number; patrolMaxX: number }>,
): string[] {
  const bad: string[] = [];
  for (const p of traps) {
    if (p.kind === 'limb') {
      bad.push(...limbFaults(p, animals));
      continue;
    }
    if (!Number.isFinite(p.x) || !Number.isFinite(p.loadX)) {
      bad.push(`trap.no-handle: the load at x ${Math.round(p.loadX)} has no handle`);
      continue;
    }
    const at = `the trap at x ${Math.round(p.x)}`;
    if (!animals.some((a) => a.patrolMinX <= p.loadX && a.patrolMaxX >= p.loadX && Math.abs(a.y - p.landY) <= TRAP.tall)) bad.push(`trap.over-nothing: ${at} hangs its load over no animal's ground`);
    const d = Math.abs(p.loadX - p.x);
    if (d < TRAP.reach[0] || d > TRAP.reach[1]) bad.push(`trap.reach: ${at} has its load ${Math.round(d)} px from its handle (${TRAP.reach[0]}-${TRAP.reach[1]})`);
    const hid = pickups.find((c) =>
      (Math.abs(c.x - p.loadX) <= TRAP.clear && c.y >= p.loadY - 80 && c.y <= p.landY) || (Math.abs(c.x - p.x) <= TRAP.clear && c.y >= p.y - TRAP.handle.high - 20 && c.y <= p.y));
    if (hid) bad.push(`trap.hidden: ${at} has a pickup at x ${Math.round(hid.x)} in front of it`);
  }
  return bad;
}

/**
 * A 'limb' trap's rules: an animal stands on the ground the limb comes down on, within TRAP.scare of where it lands (so riding it down
 * chases it off), and none under the limb itself (it lands BESIDE the animal, never on it: nobody is hurt, and he lands with it).
 */
function limbFaults(p: TrapPost, animals: ReadonlyArray<{ x: number; y: number; patrolMinX: number; patrolMaxX: number }>): string[] {
  const at = `the falling limb at x ${Math.round(p.loadX)}`;
  if (p.limb === undefined || !p.w) return [`trap.no-limb: ${at} names no creaky limb`];
  const on = animals.filter((a) => Math.abs(a.y - p.landY) <= TRAP.tall);
  const bad: string[] = [];
  if (!on.some((a) => Math.min(Math.abs(a.patrolMinX - p.loadX), Math.abs(a.patrolMaxX - p.loadX)) <= TRAP.scare || (a.patrolMinX <= p.loadX && a.patrolMaxX >= p.loadX))) bad.push(`trap.over-nothing: ${at} comes down beside no animal`);
  const x0 = p.loadX - p.w / 2, x1 = p.loadX + p.w / 2;
  if (on.some((a) => a.patrolMinX < x1 && a.patrolMaxX > x0)) bad.push(`trap.limb-on: ${at} comes down ON an animal's ground (it must land beside it)`);
  return bad;
}
