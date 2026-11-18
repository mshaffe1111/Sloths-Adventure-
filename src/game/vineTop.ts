/**
 * The top of a climbing vine (a trunk, `tree_climb`): where the wood he vaults onto stands, read the same way by the engine (the vault,
 * engine.ts) and by the generator's verdict (gen2/tower.ts towerVaults), so the check calls the code the screen calls (D19).
 *
 * Every climbing vine the generator lays stands CLIMB_CLEAR px out in front of the end of the bough it leads up to (pipeline.ts
 * clearClimbs): on the bough's face he hung inside its body. Straight up at the top vaults him onto the wood there (STAGE-RULES §1:
 * straight up always climbs), toward the side with more ledge to land on. Until 11-13 the engine looked for that ledge from 10 px out
 * and stopped at the first miss, so it never saw a cleared vine's bough and vaulted the way he faced: right in a run (by luck), wrong at
 * a tower's turn-back, where he walks in facing away from the storey above (1-4, B14c).
 */
import type { Platform, Vine } from './types.ts';

/** how far a climbing vine stands out in front of the face of the bough it leads up to (px): Pokey's half-width (21) and a little */
export const CLIMB_CLEAR = 26;

/**
 * how far out from a climbing vine the wood at its top may begin and still be a place the straight-up vault lands (px). The vault
 * (engine.ts: up 190 px/s, along 160 px/s from 12 px over the top) lands on wood that begins up to 56 px out (measured on the real
 * engine, vineTop.test.ts); 40 keeps that margin and takes in CLIMB_CLEAR.
 */
export const VAULT_GAP = 40;

/** the vault's own sampling step and the farthest it looks (px) */
const STEP = 10;
const FAR = 200;

/** wood at the height of a vine's top at x (a piece he can stand on there: not broken, not a bounce pad) */
function woodAt(platforms: readonly Platform[], x: number, topY: number): boolean {
  return platforms.some((q) => !q.broken && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width && q.y >= topY - 16 && q.y <= topY + 30);
}

/**
 * How much ledge to land on there is off the top of `v` toward `dir` (px, in steps of 10, at most 200): the wood at the top's height
 * that begins within VAULT_GAP of the vine, measured from where it begins until it ends. Wood that begins further out is not counted:
 * the vault does not reach it. Where wood begins within 10 px this is exactly the old finder's reach.
 */
export function ledgeOut(v: Vine, platforms: readonly Platform[], dir: 1 | -1): number {
  let d = STEP;
  // (the clear gap first: a cleared vine's bough begins CLIMB_CLEAR out)
  while (d <= VAULT_GAP && !woodAt(platforms, v.x + dir * d, v.topY)) d += STEP;
  if (d > VAULT_GAP) return 0;
  let n = 0;
  while (d <= FAR && woodAt(platforms, v.x + dir * d, v.topY)) {
    n += STEP;
    d += STEP;
  }
  return n;
}

/** which way straight up at the top of `v` vaults him: toward the side with more ledge to land on; a tie keeps `facing` */
export function vaultSide(v: Vine, platforms: readonly Platform[], facing: 1 | -1): 1 | -1 {
  const l = ledgeOut(v, platforms, -1), r = ledgeOut(v, platforms, 1);
  return l === r ? facing : r > l ? 1 : -1;
}
