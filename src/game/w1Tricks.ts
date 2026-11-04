/**
 * World 1's combat triangle (R-159.1, plan: reference/plans/R-159.1-combat-triangle.md). Every World 1 animal has one trick, each answered
 * by one move, so the fights stop being the same; each move has one job (the lead's call, 2026-11-04, after the quality supervisor's
 * button-mashing check): punch = get past, stomp = finish or vault, kick = armour.
 *   - the tree snake's coiled lunge ('lunge'): a punch (or a kick) dazes it, harmless, stars over its head; while dazed, more blows do
 *     nothing (the daze is not reset, so mashing cannot hold it down); only a stomp finishes it, or you walk past;
 *   - the boa's armoured coil ('coil'): no blow but a kick ever harms it, in any state: coiled, a punch is "TOUGH!"; mid-attack, a punch
 *     only staggers it back into its coil ("STOPPED!"); a stomp always bounces off; a kick (or air kick; the mega is a punch) sends it rolling as a ball that
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
  /** the stomp vault: a stomp on a lunge snake with jump held springs him like this (px/s up; a plain held stomp is 620, a jump 640),
   *  so with the second jump after it he carries about 405 px, past any jump (a jump and a second jump reach about 313) */
  vaultV: 960,
  /** the vault's gap: past the best plain jump (a full run, a jump off the very edge and the second jump at its top: about 313) by this
   *  much, and its snake this far back from the lip, so the vault clears it with room to spare (the real-engine test proves both) */
  vaultOver: 32,
  vaultLip: 26,
  /** the teaching vault (1-3's first, the lead 2026-11-04: a mechanic's first appearance needs no untold move): its far bank stands this
   *  high, above a jump and its second jump (~185 px) but under the vault's spring alone (~240 px from the snake's back), and this far
   *  past the lip, so the spring with no second flick lands on its top */
  vaultRise: 215,
  vaultRiseGap: 96,
} as const;

/** the stomp vault's gap (px): past any jump, within the vault's reach */
export const vaultGap = (reachJumpDouble: number) => Math.round(reachJumpDouble + TRICK.vaultOver);

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
 *   'stiffen' a blow on a vine snake: no harm, a stiff pole `dazeFor` seconds
 *   'nothing' a blow on a dazed lunge snake or a stiff vine snake: no harm, the stars stay (only a stomp finishes it)
 *   'tough'   a punch (the mega too) on the coiled (or rolling) boa: no harm ("TOUGH!")
 *   'stagger' a punch on the boa mid-attack (its tell, strike or bite): no harm, it is knocked back into its coil ("STOPPED!")
 *   'roll'    a kick or air kick on the boa: the coil breaks and it rolls away as a ball
 *   null      the usual hit (fight.ts resolveMelee): an animal with no trick
 */
export type TrickHit = 'daze' | 'stiffen' | 'nothing' | 'tough' | 'stagger' | 'roll' | null;

export function trickHit(e: Enemy, kind: 'punch' | 'kick' | 'mega'): TrickHit {
  if (!e.trick) return null;
  if (e.trick === 'lunge') return isDazed(e) ? 'nothing' : 'daze';
  // (any blow: from the take-off ledge it is mostly reached in the air, where his punch is the air kick)
  if (e.trick === 'vine') return isDazed(e) ? 'nothing' : 'stiffen';
  if (e.trick === 'coil') {
    if (e.state === 'roll' || e.state === 'rolled') return 'tough';
    // (the lead's rule, one a kid can learn: only a kick or an air kick breaks armour; the mega is a punch)
    if (kind === 'kick') return 'roll';
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

// ---------------------------------------------------------------------------------------------------
// The vine snake ('vine', R-159.1, Matt's option (a)): liana-coloured, hanging on a liana among the others
// ---------------------------------------------------------------------------------------------------

/** its numbers: the tell starts a jump's length away, so it reads from the take-off ledge, never only once he is in the air */
export const VINE_SNAKE = { tellX: 230, tellY: 260, bite: 0.45, height: 170 } as const;

/** a vine snake for a liana: hung `along` px down from the liana's top (its middle), on the liana's swing */
export function makeVineSnake(id: number, v: { id: number; x: number; topY: number; bottomY: number }, along?: number): Enemy {
  const hangLen = along ?? Math.max(60, v.bottomY - v.topY - 110);
  return {
    id, type: 'snake', trick: 'vine', vineId: v.id, hangLen, x: v.x, y: v.topY + hangLen, vx: 0, vy: 0, width: 30, height: 120, hp: 1,
    maxHp: 1, facing: -1, patrolMinX: v.x, patrolMaxX: v.x, attackCooldown: 0, telegraphTimer: 0, isAttacking: false, animTimer: 0,
    hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0, state: 'hang', stateT: 0,
  } as Enemy;
}

/** where it hangs now: on its liana's swing (angle from straight down), `hangLen` down from the top */
export function placeVineSnake(e: Enemy, v: { x: number; topY: number; swingAngle?: number }): void {
  const a = v.swingAngle ?? 0;
  const len = e.hangLen ?? 100;
  e.x = v.x + Math.sin(a) * len;
  e.y = v.topY + Math.cos(a) * len;
}

/** one frame of its watching: it wakes (the tell: eyes open, tongue flicks) once he is within a jump's length, and dozes again after */
export function stepVineSnake(e: Enemy, p: { x: number; y: number }, dt: number): void {
  e.stateT = (e.stateT ?? 0) + dt;
  if (e.state === 'bite') {
    if (e.stateT >= VINE_SNAKE.bite) {
      e.state = 'tell';
      e.stateT = 0;
    }
    return;
  }
  const near = Math.abs(p.x - e.x) < VINE_SNAKE.tellX && Math.abs(p.y - e.y) < VINE_SNAKE.tellY;
  // (it faces him: the straight side of its body stays on the liana, its head toward him)
  if (near) e.facing = p.x >= e.x ? 1 : -1;
  const want = near ? 'tell' : 'hang';
  if (e.state !== want) {
    e.state = want;
    e.stateT = 0;
  }
}

/** is this liana held stiff (its snake punched) right now: straight, still and climbable */
export const vineIsStiff = (enemies: Enemy[], vineId: number) =>
  enemies.some((e) => e.trick === 'vine' && e.vineId === vineId && !e.defeated && (e.stagger ?? 0) > 0);

/** the vine snake awake on this liana, if any (grabbing the liana then is a bite) */
export const vineSnakeAwake = (enemies: Enemy[], vineId: number) =>
  enemies.find((e) => e.trick === 'vine' && e.vineId === vineId && !e.defeated && !((e.stagger ?? 0) > 0));

// ---------------------------------------------------------------------------------------------------
// The bowl gate (R-159.1): the kick's payoff, a switch only the rolling boa presses
// ---------------------------------------------------------------------------------------------------

export interface BowlGate {
  /** the plate (its middle) on the ground, where the ball stops */
  plateX: number;
  groundY: number;
  /** the gate's solid platform (its id) and where it stands */
  gatePlat: number;
  gateX: number;
  /** the boa that bowls it: where it lies coiled (it coils there again if it is lost without pressing the plate) */
  boaId: number;
  coilX: number;
  coilY: number;
  open?: boolean;
  /** seconds since the boa was lost (the respawn waits a moment) */
  lostT?: number;
  /** seconds since it opened (the gate's swing) */
  openT?: number;
}
export const BOWL = { press: 26, respawn: 2.2 } as const;

/** has the rolling boa reached the plate (it stops there and the gate opens) */
export const bowlPressed = (g: BowlGate, e: Enemy) =>
  !g.open && e.id === g.boaId && e.trick === 'coil' && e.state === 'roll' && Math.abs(e.x - g.plateX) < BOWL.press;

/** a fresh coiled boa where the lost one lay (the gate is the way on: it can always be bowled again) */
export function recoil(e: Enemy, g: BowlGate): void {
  Object.assign(e, {
    x: g.coilX, y: g.coilY, vx: 0, vy: 0, hp: 3, defeated: false, koTimer: 0, koLanded: false, koVx: 0, koVy: 0, koSpin: 0, koAngle: 0,
    recoil: 0, stagger: 0, staggerMax: 0, knockVx: 0, hitFlashTimer: 0, state: 'coil', stateT: 0, attackCooldown: 1.5, slideDir: undefined,
  });
}
