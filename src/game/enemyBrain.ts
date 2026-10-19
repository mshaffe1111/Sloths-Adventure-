/**
 * Enemy personalities: how each animal notices Slomatt and goes after him.
 *
 * Pure numbers and small functions (no engine, no canvas), so the game, the dev harness and the unit tests all run the
 * same rules. predatorAI.ts holds the attack moves; this file decides what an animal does BEFORE it attacks:
 *
 *   calm patrol  ->  NOTICE (a "?")  ->  hunt in its own way  ->  attack when in range  ->  lose interest after a while
 *
 * Every animal hunts in its own real-world way (see `trait`). A hunter never leaves its own patch of ground: the
 * patrol range the stage generator gave it is also its territory, so it cannot walk off a ledge after you.
 */
import type { Enemy, Platform } from './types.ts';

export type BrainType = 'snake' | 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra';

export const isBrainType = (t: string): t is BrainType =>
  t === 'snake' || t === 'ocelot' || t === 'jaguar' || t === 'boa' || t === 'caiman' || t === 'tayra';

export interface PlayerRef {
  x: number;
  /** feet */
  y: number;
  /** which way the player faces (used by stalkers that creep up when watched less) */
  facing?: 1 | -1;
  ducking?: boolean;
}

export interface Personality {
  /** one line for the Jungle Journal: how this animal behaves */
  trait: string;
  /** how far it notices Slomatt in front of it, and behind it (px) */
  sense: number;
  senseBack: number;
  /** it starts its attack from this far away (px) */
  engage: number;
  /** hunting speed in px/s at normal difficulty; 0 = it never walks up to you (an ambusher) */
  chase: number;
  /** while it waits to attack again, it paces this far from you (px) */
  keep: number;
  /** seconds without sensing him before it loses interest */
  giveUp: number;
  /** its normal patrol speed (px/s): difficulty scales the whole animal by (actual speed / this) */
  nominal: number;
  /** a shy animal backs away at this speed (px/s) until it is within `engage` of you, then it strikes */
  shy?: number;
  /** how far past its patrol patch it will chase you, if there is ground (px each side) */
  reach: number;
  /** a stalker moves at this fraction of its speed while Slomatt is facing it (it creeps up when his back is turned) */
  watched?: number;
}

export const PERSONALITY: Record<BrainType, Personality> = {
  snake: {
    trait: 'Shy. It backs away from you and only strikes when you get close, or when it has nowhere left to go.',
    sense: 200, senseBack: 90, engage: 105, chase: 0, keep: 0, giveUp: 1.5, nominal: 32, reach: 0, shy: 30,
  },
  ocelot: {
    trait: 'A stalker. It creeps up while your back is turned, slows when you face it, then pounces.',
    sense: 240, senseBack: 150, engage: 150, chase: 95, keep: 105, giveUp: 3, nominal: 55, reach: 150, watched: 0.3,
  },
  jaguar: {
    trait: 'Fast and powerful. It charges the moment it spots you and leaps from a long way off.',
    sense: 340, senseBack: 220, engage: 230, chase: 150, keep: 160, giveUp: 4, nominal: 42, reach: 220,
  },
  boa: {
    trait: 'A patient ambusher. It lies still and watches you, then strikes with a very long reach.',
    sense: 280, senseBack: 280, engage: 150, chase: 0, keep: 0, giveUp: 2, nominal: 40, reach: 0,
  },
  caiman: {
    trait: 'A lurker. Slow on land, it creeps closer and then lunges with an explosive snap. It gives up easily.',
    sense: 230, senseBack: 120, engage: 125, chase: 42, keep: 95, giveUp: 2.5, nominal: 28, reach: 90,
  },
  tayra: {
    trait: 'Relentless. Fast and agile, it runs you down and does not give up the chase.',
    sense: 340, senseBack: 240, engage: 160, chase: 135, keep: 110, giveUp: 6, nominal: 70, reach: 220,
  },
};

/** the spider is not a sloth predator: it waits on its web and rushes in short bursts */
export const SPIDER = {
  trait: 'Waits perfectly still, then rushes in short bursts with a pause between. Stomp it in the pause.',
  sense: 430,
  burst: 0.45,
  speed: 150,
  pause: 0.32,
  nominal: 80,
};

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** harder or easier difficulty makes the whole animal faster or slower, in the same ratio as its patrol */
export function speedScale(e: Enemy, nominal: number): number {
  const s = e.speed ?? nominal;
  return clamp(s / nominal, 0.6, 1.5);
}

/** where this animal may be right now: its own patch while calm, its whole hunting ground once it has locked on */
export function walkBounds(e: Enemy): [number, number] {
  if ((e.alertT ?? 0) > 0 && e.huntMinX !== undefined && e.huntMaxX !== undefined) return [e.huntMinX, e.huntMaxX];
  return [e.patrolMinX, e.patrolMaxX];
}

/** the unbroken solid ground that reaches `x` at height `feetY`: platforms at that height that touch each other */
export function groundRun(
  platforms: ReadonlyArray<Pick<Platform, 'x' | 'y' | 'width' | 'type' | 'broken'>>,
  x: number,
  feetY: number,
): [number, number] | null {
  const level = platforms.filter((q) => q.type === 'solid' && !q.broken && Math.abs(q.y - feetY) <= 4).sort((a, b) => a.x - b.x);
  const here = level.find((q) => x >= q.x - 1 && x <= q.x + q.width + 1);
  if (!here) return null;
  let lo = here.x;
  let hi = here.x + here.width;
  for (let grew = true; grew; ) {
    grew = false;
    for (const q of level) {
      if (q.x < lo - 2 && q.x + q.width >= lo - 2) {
        lo = q.x;
        grew = true;
      }
      if (q.x + q.width > hi + 2 && q.x <= hi + 2) {
        hi = q.x + q.width;
        grew = true;
      }
    }
  }
  return [lo, hi];
}

/**
 * Give every hunter its hunting ground: its own patch plus `reach` px each side, never past the edge of the ground it
 * stands on (a small margin keeps it off the very lip). Done once when a stage loads.
 */
export function assignTerritories(
  enemies: Enemy[],
  platforms: ReadonlyArray<Pick<Platform, 'x' | 'y' | 'width' | 'type' | 'broken'>>,
  feetOf: (e: Enemy) => number,
): void {
  for (const e of enemies) {
    if (!isBrainType(e.type)) continue;
    const reach = PERSONALITY[e.type].reach;
    e.huntMinX = e.patrolMinX;
    e.huntMaxX = e.patrolMaxX;
    const run = groundRun(platforms, e.x, feetOf(e));
    if (run) {
      e.edgeMinX = run[0] + 8;
      e.edgeMaxX = run[1] - 8;
    }
    if (reach <= 0 || !run) continue;
    e.huntMinX = Math.min(e.patrolMinX, Math.max(run[0] + 16, e.patrolMinX - reach));
    e.huntMaxX = Math.max(e.patrolMaxX, Math.min(run[1] - 16, e.patrolMaxX + reach));
  }
}

/** the last word on position: an animal is never left standing past the edge of its ground (knockback, leaps, odd patrol ranges) */
export function keepOnLedge(e: Enemy): void {
  if (e.edgeMinX === undefined || e.edgeMaxX === undefined) return;
  e.x = clamp(e.x, e.edgeMinX, e.edgeMaxX);
}

/** two hunters at the same spot would stand inside each other: ease them apart while neither is mid-attack */
export function separateHunters(enemies: Enemy[], dt: number): void {
  const calm = (e: Enemy) => !e.defeated && (e.alertT ?? 0) > 0 && (e.state === 'patrol' || e.state === 'recover');
  for (let i = 0; i < enemies.length; i++) {
    const a = enemies[i];
    if (!isBrainType(a.type) || !calm(a)) continue;
    for (let j = i + 1; j < enemies.length; j++) {
      const b = enemies[j];
      if (!isBrainType(b.type) || !calm(b)) continue;
      const gap = Math.min(a.width, b.width) * 0.6;
      const dx = b.x - a.x;
      if (Math.abs(dx) >= gap || Math.abs(b.y - a.y) > 40) continue;
      const dir = dx === 0 ? (a.id % 2 ? 1 : -1) : Math.sign(dx);
      const push = Math.min(70 * dt, (gap - Math.abs(dx)) / 2 + 0.5);
      const [alo, ahi] = walkBounds(a);
      const [blo, bhi] = walkBounds(b);
      a.x = clamp(a.x - dir * push, alo, ahi);
      b.x = clamp(b.x + dir * push, blo, bhi);
    }
  }
}

export interface BrainEvents {
  /** it has just noticed Slomatt (show a "?") */
  notice?: boolean;
}

/** a calm walk along its own patch of ground, turning at each end */
export function patrolWalk(e: Enemy, dt: number, speed: number): void {
  e.x += e.facing * speed * dt;
  if (e.x < e.patrolMinX) e.facing = 1;
  else if (e.x > e.patrolMaxX) e.facing = -1;
  e.vx = e.facing * speed;
}

/**
 * The walking part of every ground animal: patrol while calm, hunt once it has noticed the player.
 * Returns true on the frame its attack should start (it is close enough, level with him and ready).
 */
export function roam(
  e: Enemy,
  p: PlayerRef,
  dt: number,
  feet: number,
  pers: Personality,
  ready: boolean,
  patrolSpeed: number,
  ev: BrainEvents,
): boolean {
  const dx = p.x - e.x;
  const dist = Math.abs(dx);
  const toward: 1 | -1 = dx >= 0 ? 1 : -1;
  const dy = p.y - feet;
  const level = Math.abs(dy) < 70;

  // ---- senses: further in front than behind, and a ducking sloth is harder to notice
  let radius = toward === e.facing ? pers.sense : pers.senseBack;
  if (p.ducking) radius *= 0.65;
  // once it has locked on, it keeps tracking him from anywhere around it
  if ((e.alertT ?? 0) > 0) radius = Math.max(radius, pers.sense * 1.2);
  const sees = dist < radius && Math.abs(dy) < 170;
  if (sees) {
    if (!((e.alertT ?? 0) > 0)) ev.notice = true;
    e.alertT = pers.giveUp;
  } else {
    e.alertT = Math.max(0, (e.alertT ?? 0) - dt);
  }

  if (!((e.alertT ?? 0) > 0)) {
    patrolWalk(e, dt, patrolSpeed);
    return false;
  }

  // ---- hunting
  e.facing = toward;
  if (ready && level && dist < pers.engage) {
    e.vx = 0;
    return true;
  }
  const k = speedScale(e, pers.nominal);
  let v = 0;
  if (pers.shy !== undefined) {
    // a shy animal gives ground while it can
    if (dist < pers.sense) v = -toward * pers.shy * k;
  } else if (pers.chase > 0) {
    let sp = pers.chase * k;
    if (pers.watched !== undefined && p.facing === -toward) sp *= pers.watched;
    if (ready) {
      // close the gap until it is in range (and stop under a ledge rather than walk through him)
      v = dist > pers.engage * 0.9 ? toward * sp : 0;
    } else if (dist > pers.keep + 25) v = toward * sp;
    else if (dist < pers.keep - 25) v = -toward * sp * 0.6;
  }
  const [lo, hi] = walkBounds(e);
  const nx = clamp(e.x + v * dt, lo, hi);
  e.vx = nx === e.x ? 0 : v;
  e.x = nx;
  return false;
}
