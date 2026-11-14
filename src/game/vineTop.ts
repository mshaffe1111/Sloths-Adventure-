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

/**
 * The least ledge a climbing vine's top keeps between where he tops out and any OPEN end of the ledge there (px): his grab reach 54 and
 * half his body 22, rounded up (FIX-14, R-165.206; the bots read an edge 80 px ahead). With less, the vault (or the first step after it)
 * the short way takes him off the end: 1-4's fork, "281 px down", and the crown's sure vine 20 px from its bough's end.
 */
export const TOP_ROOM = 80;

/** how far lasting wood past a ledge's end may rise (a step up, a wall) or drop (a step down) and the end still be no walk-off (px; wood
 *  that gives, a creak's bough, is a fall waiting: it closes nothing) */
const STEP_UP = 60;
const STEP_DOWN = 40;

/** a piece he can stand on that stays (not broken, not a bounce pad, not one that gives: a creak's bough or a crumble) */
const lasting = (q: Platform): boolean => !q.broken && q.type !== 'bouncy' && q.type !== 'fragile' && !q.creak && !q.crumbleAfter;

export interface TopRoom {
  /** the merged ledge at the vine's top (touching pieces at its height are one ledge) */
  x0: number;
  x1: number;
  /** the vine stands over the ledge (it tops out ON it), or in front of its face (CLIMB_CLEAR: only the far end is ahead of him) */
  on: boolean;
  /** room from the vine to each end, and whether that end is open (a drop: no stage edge, no wood just past it at about its height) */
  left: number;
  right: number;
  openLeft: boolean;
  openRight: boolean;
}

/**
 * The ledge at the top of `v` and the room to each of its ends (null when no lasting wood is at its top within VAULT_GAP: a field's
 * gate, a vine to nowhere, which other checks own). `width` is the stage's: an end at its edge is a wall, never a walk-off.
 */
export function topRoom(v: Vine, platforms: readonly Platform[], width: number): TopRoom | null {
  const at = platforms.filter((q) => lasting(q) && Math.abs(q.y - v.topY) <= 2);
  const seed = at.find((q) => v.x >= q.x - 2 && v.x <= q.x + q.width + 2)
    ?? at.find((q) => (q.x > v.x && q.x - v.x <= VAULT_GAP) || (q.x + q.width < v.x && v.x - (q.x + q.width) <= VAULT_GAP));
  if (!seed) return null;
  let x0 = seed.x, x1 = seed.x + seed.width;
  for (let grew = true; grew; ) {
    grew = false;
    for (const q of at) {
      if (q.x < x0 && q.x + q.width >= x0 - 2) { x0 = q.x; grew = true; }
      if (q.x + q.width > x1 && q.x <= x1 + 2) { x1 = q.x + q.width; grew = true; }
    }
  }
  const open = (e: number, d: 1 | -1): boolean => {
    if (d < 0 ? e <= 2 : e >= width - 2) return false;
    const x = e + d * 4;
    return !platforms.some((q) => lasting(q) && x >= q.x && x <= q.x + q.width && q.y >= v.topY - STEP_UP && q.y <= v.topY + STEP_DOWN);
  };
  const on = v.x >= x0 - 2 && v.x <= x1 + 2;
  return { x0, x1, on, left: v.x - x0, right: x1 - v.x, openLeft: open(x0, -1), openRight: open(x1, 1) };
}

/**
 * What is short at the top of `v` (null when it keeps TOP_ROOM to every open end he can reach): over the ledge, both ends; in front of
 * a bough's face (CLIMB_CLEAR), its far end (the near end is the face he climbed beside, the vine still in his hands).
 */
export function topRoomShort(v: Vine, platforms: readonly Platform[], width: number): string | null {
  const t = topRoom(v, platforms, width);
  if (!t) return null;
  const short: string[] = [];
  const far = (d: 1 | -1) => (t.on ? true : d > 0 ? t.x0 > v.x : t.x1 < v.x);
  if (t.openLeft && far(-1) && t.left < TOP_ROOM) short.push(`${Math.round(t.left)} px to the open left end ${Math.round(t.x0)}`);
  if (t.openRight && far(1) && t.right < TOP_ROOM) short.push(`${Math.round(t.right)} px to the open right end ${Math.round(t.x1)}`);
  return short.length ? `the vine at ${Math.round(v.x)} tops out at ${v.topY} on ${Math.round(t.x0)}..${Math.round(t.x1)}: ${short.join(', ')}` : null;
}
