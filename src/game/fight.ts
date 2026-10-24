/**
 * The fight system: how Pokey's attacks are timed, where they hit, and how each animal reacts.
 *
 * Pure data in / data out (no canvas, no engine, no audio), so the game, the debug overlay and the unit tests
 * all run the very same rules.
 *
 * Every attack has three parts you can see and learn:
 *   startup   the wind-up (the claw is pulled back; nothing can be hit yet)
 *   active    the strike (a hit box sweeps forward; this is the only time it can connect)
 *   recovery  the follow-through (open to a counter, but the next attack can cancel into it after a hit)
 *
 * Enemies get a body-shaped hurt box, a head zone for stomps, and a few traits that decide what a hit does:
 * small animals are knocked flying, big ones have "committed-attack armor" (a light hit only makes them flinch
 * while they leap or lunge; a heavy hit interrupts them), and armored ones bounce a stomp off.
 */
import type { Enemy, EnemyType } from './types.ts';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const rectsOverlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/** the middle of the overlap of two rects: where a spark should appear */
export function contactPoint(a: Rect, b: Rect): { x: number; y: number } {
  const x0 = Math.max(a.x, b.x);
  const x1 = Math.min(a.x + a.w, b.x + b.w);
  const y0 = Math.max(a.y, b.y);
  const y1 = Math.min(a.y + a.h, b.y + b.h);
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
}

const union = (a: Rect, b: Rect): Rect => {
  const x0 = Math.min(a.x, b.x);
  const y0 = Math.min(a.y, b.y);
  return { x: x0, y: y0, w: Math.max(a.x + a.w, b.x + b.w) - x0, h: Math.max(a.y + a.h, b.y + b.h) - y0 };
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

// ---------------------------------------------------------------------------------------------------
// Pokey's moves
// ---------------------------------------------------------------------------------------------------

export type MoveId = 'jab' | 'cross' | 'hook' | 'mega' | 'kick' | 'airKick';
export type AttackWant = 'punch' | 'kick' | 'mega';

export interface MoveSpec {
  id: MoveId;
  /** which family it is: drives the pose, the sound and the chain */
  kind: 'punch' | 'kick' | 'mega';
  startup: number;
  active: number;
  recovery: number;
  /** damage to an enemy, and to a boss */
  damage: number;
  bossDamage: number;
  /**
   * The strike zone relative to Pokey's feet, facing right (x forward, y up is negative).
   * It grows from `from` at the start of the active frames to `to` at the end.
   */
  from: Rect;
  to: Rect;
  /** sideways shove on the enemy (px/s), seconds it is staggered, how long the game freezes on impact, screen shake */
  knock: number;
  stun: number;
  hitstop: number;
  shake: number;
  /** a forward step Pokey takes as the strike starts (px/s) */
  lunge: number;
  /** how much of his running speed he keeps while this move plays on the ground */
  moveMul: number;
  /** a heavy move interrupts big animals mid-attack and can knock them down */
  heavy: boolean;
}

export const MOVES: Record<MoveId, MoveSpec> = {
  jab: {
    id: 'jab', kind: 'punch', startup: 0.06, active: 0.08, recovery: 0.14,
    damage: 1, bossDamage: 1,
    from: { x: 8, y: -54, w: 30, h: 46 }, to: { x: 8, y: -54, w: 56, h: 46 },
    knock: 130, stun: 0.24, hitstop: 0.045, shake: 0.12, lunge: 60, moveMul: 0.85, heavy: false,
  },
  cross: {
    id: 'cross', kind: 'punch', startup: 0.05, active: 0.08, recovery: 0.14,
    damage: 1, bossDamage: 1,
    from: { x: 8, y: -54, w: 34, h: 46 }, to: { x: 8, y: -54, w: 64, h: 46 },
    knock: 170, stun: 0.28, hitstop: 0.05, shake: 0.14, lunge: 90, moveMul: 0.8, heavy: false,
  },
  hook: {
    id: 'hook', kind: 'punch', startup: 0.1, active: 0.09, recovery: 0.22,
    damage: 2, bossDamage: 2,
    from: { x: 4, y: -62, w: 44, h: 54 }, to: { x: 4, y: -62, w: 76, h: 54 },
    knock: 340, stun: 0.5, hitstop: 0.09, shake: 0.4, lunge: 150, moveMul: 0.55, heavy: true,
  },
  mega: {
    id: 'mega', kind: 'mega', startup: 0.18, active: 0.12, recovery: 0.26,
    damage: 3, bossDamage: 2,
    from: { x: -44, y: -74, w: 88, h: 78 }, to: { x: -98, y: -78, w: 196, h: 86 },
    knock: 460, stun: 0.7, hitstop: 0.11, shake: 0.55, lunge: 0, moveMul: 0.3, heavy: true,
  },
  kick: {
    id: 'kick', kind: 'kick', startup: 0.08, active: 0.1, recovery: 0.17,
    damage: 2, bossDamage: 2,
    from: { x: 8, y: -44, w: 40, h: 40 }, to: { x: 8, y: -44, w: 76, h: 40 },
    knock: 320, stun: 0.45, hitstop: 0.08, shake: 0.3, lunge: 140, moveMul: 0.6, heavy: true,
  },
  airKick: {
    id: 'airKick', kind: 'kick', startup: 0.05, active: 0.22, recovery: 0.1,
    damage: 2, bossDamage: 2,
    from: { x: 4, y: -54, w: 46, h: 72 }, to: { x: 4, y: -56, w: 74, h: 78 },
    knock: 260, stun: 0.4, hitstop: 0.07, shake: 0.25, lunge: 0, moveMul: 1, heavy: true,
  },
};

export const moveLength = (m: MoveSpec) => m.startup + m.active + m.recovery;

export type Phase = 'startup' | 'active' | 'recovery' | 'done';

export function phaseAt(m: MoveSpec, t: number): Phase {
  if (t < m.startup) return 'startup';
  if (t < m.startup + m.active) return 'active';
  if (t < moveLength(m)) return 'recovery';
  return 'done';
}

export interface Pose {
  x: number;
  /** feet */
  y: number;
  facing: 1 | -1;
}

const place = (r: Rect, p: Pose): Rect => ({ x: p.facing > 0 ? p.x + r.x : p.x - r.x - r.w, y: p.y + r.y, w: r.w, h: r.h });

/** the strike zone in the world at time t of a move, or null when it is not in its active frames */
export function moveBox(m: MoveSpec, t: number, p: Pose): Rect | null {
  if (phaseAt(m, t) !== 'active') return null;
  const u = clamp((t - m.startup) / m.active, 0, 1);
  const e = 1 - (1 - u) * (1 - u); // the strike snaps out fast, then eases
  return place({ x: lerp(m.from.x, m.to.x, e), y: lerp(m.from.y, m.to.y, e), w: lerp(m.from.w, m.to.w, e), h: lerp(m.from.h, m.to.h, e) }, p);
}

/**
 * Everything the strike zone covered between two moments (t0 to t1): a slow frame rate can never skip over
 * an enemy that the claw visibly passed through. Null when the move was not active in that stretch.
 */
export function sweptBox(m: MoveSpec, t0: number, t1: number, p: Pose): Rect | null {
  const a = clamp(Math.min(t0, t1), m.startup, m.startup + m.active);
  const b = clamp(Math.max(t0, t1), m.startup, m.startup + m.active);
  if (t1 < m.startup || t0 >= m.startup + m.active) return null;
  const A = moveBox(m, a, p) ?? moveBox(m, a + 1e-6, p);
  const B = moveBox(m, Math.min(b, m.startup + m.active - 1e-6), p);
  if (A && B) return union(A, B);
  return A ?? B;
}

/** how far the claw/foot is drawn pulled back (cock) and thrust out (reach), each 0..1, for the hero art */
export function swingPose(m: MoveSpec, t: number): { cock: number; reach: number } {
  const ph = phaseAt(m, t);
  if (ph === 'startup') return { cock: clamp(t / m.startup, 0, 1), reach: 0 };
  if (ph === 'active') {
    const u = clamp((t - m.startup) / m.active, 0, 1);
    return { cock: 1 - Math.min(1, u * 2.2), reach: Math.min(1, 0.35 + u * 1.3) };
  }
  if (ph === 'recovery') {
    const u = clamp((t - m.startup - m.active) / m.recovery, 0, 1);
    return { cock: 0, reach: 1 - u * u };
  }
  return { cock: 0, reach: 0 };
}

/** the next move when an attack button is pressed (chain: jab, cross, hook; kick and mega stand alone) */
export function chooseMove(want: AttackWant, airborne: boolean, prev: MoveId | null, chainOpen: boolean): MoveId {
  if (want === 'mega') return 'mega';
  if (want === 'kick') return airborne ? 'airKick' : 'kick';
  // in the air a tap is a jump kick too: a thumb can tap far more easily than flick while jumping, and the kick reaches flyers
  if (want === 'punch' && airborne) return 'airKick';
  if (chainOpen && prev === 'jab') return 'cross';
  if (chainOpen && prev === 'cross') return 'hook';
  return 'jab';
}

/**
 * Can a buffered button start the next move now? After a hit, the follow-through can be cancelled a third of
 * the way in; a swing that hit nothing must be played out in full (so whiffing costs you).
 */
export function canCancel(m: MoveSpec, t: number, connected: boolean): boolean {
  if (t >= moveLength(m)) return true;
  if (!connected) return false;
  return t >= m.startup + m.active + m.recovery * 0.35;
}

// ---------------------------------------------------------------------------------------------------
// Enemies
// ---------------------------------------------------------------------------------------------------

export type KoStyle = 'launch' | 'fall' | 'flop';

export interface Traits {
  /** true: a stomp hurts it. 'armored': you bounce off its back and it takes nothing. false: stomping is not a move against this one */
  stomp: boolean | 'armored';
  /** committed attacks (leap, lunge, strike) shrug off light hits */
  armor: boolean;
  /** 0..1: how much of the shove and the stagger is soaked up */
  knockResist: number;
  stunResist: number;
  ko: KoStyle;
  /** how much bigger than its drawn body the strike zone treats it (a little generosity) */
  grow: number;
}

export const TRAITS: Record<EnemyType, Traits> = {
  snake: { stomp: true, armor: false, knockResist: 0, stunResist: 0, ko: 'launch', grow: 5 },
  eagle: { stomp: true, armor: false, knockResist: 0.3, stunResist: 0, ko: 'fall', grow: 4 },
  ocelot: { stomp: true, armor: false, knockResist: 0.1, stunResist: 0.1, ko: 'launch', grow: 4 },
  jaguar: { stomp: true, armor: true, knockResist: 0.55, stunResist: 0.2, ko: 'flop', grow: 3 },
  boa: { stomp: true, armor: true, knockResist: 0.7, stunResist: 0.2, ko: 'flop', grow: 3 },
  caiman: { stomp: 'armored', armor: true, knockResist: 0.8, stunResist: 0.25, ko: 'flop', grow: 3 },
  turtle: { stomp: true, armor: false, knockResist: 0.3, stunResist: 0, ko: 'flop', grow: 4 },
  tayra: { stomp: true, armor: false, knockResist: 0, stunResist: 0, ko: 'launch', grow: 5 },
  harpy: { stomp: true, armor: true, knockResist: 0.4, stunResist: 0.1, ko: 'flop', grow: 4 },
  frog: { stomp: true, armor: false, knockResist: 0, stunResist: 0, ko: 'launch', grow: 5 },
  spider: { stomp: false, armor: false, knockResist: 0, stunResist: 0, ko: 'launch', grow: 5 },
  ant_hazard: { stomp: false, armor: false, knockResist: 0, stunResist: 0, ko: 'launch', grow: 5 },
  boss: { stomp: false, armor: true, knockResist: 1, stunResist: 1, ko: 'flop', grow: 8 },
};

/** distance from an animal's origin down to its feet (the same ground line the drawings use) */
const FEET: Partial<Record<EnemyType, number>> = { ocelot: 19, jaguar: 24, boa: 16, caiman: 15, tayra: 15, harpy: 16 };

/** the drawn body, as a rect (no generosity) */
export function bodyRect(e: Enemy): Rect {
  const feet = FEET[e.type];
  if (feet !== undefined) return { x: e.x - e.width / 2, y: e.y + feet - e.height, w: e.width, h: e.height };
  return { x: e.x - e.width / 2, y: e.y - e.height / 2, w: e.width, h: e.height };
}

/** where a strike can land on this animal: its body, a little generous so a swing that looks like a hit is one */
export function hurtRect(e: Enemy): Rect {
  const b = bodyRect(e);
  const g = TRAITS[e.type].grow;
  return { x: b.x - g, y: b.y - g, w: b.w + g * 2, h: b.h + g * 2 };
}

/** the top of its back or head: where a falling Pokey counts as landing on it */
export function headRect(e: Enemy): Rect {
  const b = bodyRect(e);
  return { x: b.x - 6, y: b.y - 8, w: b.w + 12, h: b.h * 0.5 + 8 };
}

/** Pokey's own hurt box: a little smaller than the picture, and lower when ducking (so ducking under a swoop is real) */
export function playerHurtRect(p: { x: number; y: number; ducking?: boolean }): Rect {
  const h = p.ducking ? 24 : 38;
  return { x: p.x - 13, y: p.y - h, w: 26, h };
}

const COMMITTED = new Set(['windup', 'rear', 'alert', 'leap', 'lunge', 'strike', 'bite', 'dash']);

/** is this animal in the middle of an attack it has committed to? */
export function isCommitted(e: Enemy): boolean {
  if (e.type === 'eagle') return e.swoopPhase === 'swoop';
  return e.state !== undefined && COMMITTED.has(e.state);
}

export interface HitResult {
  damage: number;
  /** seconds of stagger (0 = it only flinches and carries on with what it was doing) */
  stagger: number;
  /** sideways shove, px/s, signed (positive = to the right) */
  knock: number;
  interrupt: boolean;
  /** the hit that finished it */
  killed: boolean;
  /** a committed attack shrugged this off */
  armored: boolean;
}

/** what a melee move does to an enemy, given which way Pokey faces (does not change the enemy) */
export type HitSpec = Pick<MoveSpec, 'damage' | 'knock' | 'stun' | 'heavy'>;

/** a stomp as a hit: a dive (holding down) does double damage and counts as heavy */
export const stompSpec = (damage: number): HitSpec => ({ damage, knock: 0, stun: 0.5, heavy: damage >= 2 });

export function resolveMelee(e: Enemy, m: HitSpec, dir: 1 | -1): HitResult {
  const tr = TRAITS[e.type];
  const damage = m.damage;
  const killed = e.hp - damage <= 0;
  const armored = tr.armor && isCommitted(e) && !m.heavy && !killed;
  const interrupt = !armored;
  return {
    damage,
    stagger: interrupt ? m.stun * (1 - tr.stunResist) : 0,
    knock: dir * m.knock * (interrupt ? 1 - tr.knockResist : (1 - tr.knockResist) * 0.15),
    interrupt,
    killed,
    armored,
  };
}

export type StompResult = null | { kind: 'stomp'; damage: number } | { kind: 'bounce' };

/**
 * Is Pokey landing on this animal? He has to be falling, his feet have to cross its head zone this frame
 * (from above), and he has to be over it. Holding down while falling is a dive: double damage.
 */
export function stompTest(p: { x: number; y: number; vy: number }, prevFeet: number, e: Enemy, diving = false): StompResult {
  const tr = TRAITS[e.type];
  if (tr.stomp === false) return null;
  if (p.vy <= 40) return null;
  const head = headRect(e);
  // (a little wider than the head, and down to the ground: a tester landing on low snakes "on top" kept getting bitten, 2026-10-23)
  const overX = Math.abs(p.x - (head.x + head.w / 2)) < head.w / 2 + 14;
  if (!overX) return null;
  // feet came from above the head's top and are now inside the zone
  const fromAbove = prevFeet <= head.y + head.h * 0.55;
  const inside = p.y >= head.y - 4 && p.y <= head.y + head.h + 18;
  if (!fromAbove || !inside) return null;
  if (tr.stomp === 'armored') return { kind: 'bounce' };
  return { kind: 'stomp', damage: diving ? 2 : 1 };
}

// ---------------------------------------------------------------------------------------------------
// Applying a hit
// ---------------------------------------------------------------------------------------------------

/** change the enemy the way a hit result says (hp, stagger, shove, flinch). The engine then plays the effects. */
export function applyHit(e: Enemy, r: HitResult): void {
  e.hp -= r.damage;
  e.hitFlashTimer = 0.18;
  e.recoil = 1;
  if (r.knock !== 0) e.recoilDir = r.knock > 0 ? 1 : -1;
  if (r.interrupt && !r.killed) {
    e.stagger = Math.max(e.stagger ?? 0, r.stagger);
    e.staggerMax = e.stagger;
  }
  e.knockVx = (e.knockVx ?? 0) + r.knock;
}

export interface KoLaunch {
  vx: number;
  vy: number;
  spin: number;
  life: number;
}

/** how a defeated animal leaves: small ones are launched and tumble, flyers drop, big ones hop and flop belly-up */
export function koLaunch(e: Enemy, dir: 1 | -1): KoLaunch {
  const tr = TRAITS[e.type];
  if (tr.ko === 'fall') return { vx: dir * 110, vy: -140, spin: dir * 5, life: 1.0 };
  if (tr.ko === 'flop') return { vx: dir * 55, vy: -230, spin: dir * 6.4, life: 1.25 };
  return { vx: dir * 230, vy: -360, spin: dir * 10, life: 0.8 };
}

/** an upward-looking test helper: do the numbers say this animal dies in n hits of this move? */
export function hitsToDefeat(hp: number, damage: number): number {
  return Math.ceil(hp / Math.max(1, damage));
}
