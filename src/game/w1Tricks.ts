/**
 * World 1's combat triangle (R-159.1, plan: reference/plans/R-159.1-combat-triangle.md). Every World 1 animal has one trick, each answered
 * by one move, so the fights stop being the same; each move has one job (the lead's call, 2026-11-04, after the quality supervisor's
 * button-mashing check): punch = get past, stomp = finish or vault, kick = armour.
 *   - the tree snake's coiled lunge ('lunge'): a punch (or a kick) dazes it, harmless, stars over its head; while dazed, more blows do
 *     nothing (the daze is not reset, so mashing cannot hold it down); only a stomp finishes it, or you walk past;
 *   - the boa's armoured coil ('coil'): no blow but a kick ever harms it, in any state: coiled, a punch is "TOUGH!"; mid-attack, a punch
 *     only staggers it back into its coil ("STOPPED!"); a stomp always bounces off; a kick (or the mega) sends it rolling as a ball that
 *     bowls over what it meets and trips a switch, the only way it goes out;
 *   - the vine snake ('vine'): hangs among the lianas; a punch stiffens it into a pole for a moment.
 * Only animals that carry `trick` behave this way: World 1's placements set it (stage data), so no other world changes.
 * Pure functions only: the engine plays what these decide (engine.ts hitEnemy, the stomp, predatorAI.ts).
 */
import type { Enemy } from './types.ts';

export type Trick = 'lunge' | 'coil' | 'vine';

/** the numbers (s, px/s): Normal, and Easy where Easy differs (STAGE-RULES §0.5: Easy stays a cruise, longer tells and stuns) */
export const TRICK = {
  /** a punched lunge snake stays dazed this long */
  daze: 1.5,
  dazeEasy: 2.0,
  /** the stars flicker for the last part of the daze: it is waking */
  flicker: 0.3,
  /** the lunge snake's tell (it rears and sways before it strikes): the research's half second; today's snake rears 0.38 s */
  tell: 0.5,
  tellEasy: 0.8,
  /** a punched vine snake is a stiff pole this long */
  stiff: 1.5,
  stiffEasy: 2.0,
  /** the kicked boa rolls this fast, for at most this long */
  rollSpeed: 360,
  rollMax: 3.2,
} as const;

/** the boa lying in its coil (its tell, strike and bite are its attack: a punch then staggers it back into the coil) */
const COILED = new Set(['coil', 'sleep', 'recover']);
export const isCoiled = (e: Enemy) => e.trick === 'coil' && (e.state === undefined || COILED.has(e.state));

/** dazed (a lunge snake) or stiff (a vine snake) right now */
export const isDazed = (e: Enemy) => (e.stagger ?? 0) > 0 && (e.trick === 'lunge' || e.trick === 'vine');

/** the daze or stiffness for this difficulty */
export const dazeFor = (trick: Trick, easy: boolean) =>
  trick === 'vine' ? (easy ? TRICK.stiffEasy : TRICK.stiff) : easy ? TRICK.dazeEasy : TRICK.daze;
export const tellFor = (easy: boolean) => (easy ? TRICK.tellEasy : TRICK.tell);

/**
 * What a blow does to a trick animal, before the usual hit rules:
 *   'daze'    a punch or kick on an awake lunge snake: no harm, dazed `dazeFor` seconds (stars)
 *   'stiffen' a punch on a vine snake: no harm, a stiff pole `dazeFor` seconds
 *   'nothing' a blow on a dazed lunge snake or a stiff vine snake: no harm, the stars stay (only a stomp finishes it)
 *   'tough'   a punch on the coiled (or rolling) boa: no harm ("TOUGH!")
 *   'stagger' a punch on the boa mid-attack (its tell, strike or bite): no harm, it is knocked back into its coil ("STOPPED!")
 *   'roll'    a kick or the mega on the boa: the coil breaks and it rolls away as a ball
 *   null      the usual hit (fight.ts resolveMelee): an animal with no trick
 */
export type TrickHit = 'daze' | 'stiffen' | 'nothing' | 'tough' | 'stagger' | 'roll' | null;

export function trickHit(e: Enemy, kind: 'punch' | 'kick' | 'mega'): TrickHit {
  if (!e.trick) return null;
  if (e.trick === 'lunge') return isDazed(e) ? 'nothing' : 'daze';
  if (e.trick === 'vine') return isDazed(e) ? 'nothing' : kind === 'punch' ? 'stiffen' : 'daze';
  if (e.trick === 'coil') {
    if (e.state === 'roll' || e.state === 'rolled') return 'tough';
    if (kind !== 'punch') return 'roll';
    return isCoiled(e) ? 'tough' : 'stagger';
  }
  return null;
}

/** a stomp on the boa bounces off ("ARMORED!"), in every state; every other trick animal takes a stomp as usual (it finishes a dazed snake) */
export const trickStompBounces = (e: Enemy) => e.trick === 'coil';

/** the stars over a dazed snake: how many show this frame (all of them, then every other one in the last `flicker` seconds) */
export function starsShown(e: Enemy, t: number): number {
  const left = e.stagger ?? 0;
  if (left <= 0) return 0;
  if (left > TRICK.flicker) return 5;
  return Math.floor(t * 12) % 2 === 0 ? 5 : 0;
}

/** World 1's animals get their tricks as the stage loads (engine.ts): every snake the lunge, every boa the armoured coil. A trick already
 *  placed (a vine snake) is kept. Only World 1: no other world's animal is touched. */
export function tagWorld1(enemies: Enemy[], worldIndex: number): void {
  if (worldIndex !== 1) return;
  for (const e of enemies) {
    if (e.trick) continue;
    if (e.type === 'snake') e.trick = 'lunge';
    else if (e.type === 'boa') e.trick = 'coil';
  }
}
