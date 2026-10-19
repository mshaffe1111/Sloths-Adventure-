/**
 * Ground predator behaviour: ocelot, jaguar, boa, caiman, tayra.
 *
 * One small state machine per animal, pure data in / data out (no engine, no canvas), so the game, the
 * dev harness and the unit tests all run exactly the same logic.
 *
 * Every attack follows the same fair rhythm the player can learn:
 *   patrol -> TELEGRAPH (a clear, readable wind-up) -> ATTACK (committed, fast) -> RECOVER (vulnerable) -> cooldown
 *
 * The drawing side (predators.ts / creatures.ts) reads `state` and `stateT` and poses the body to match.
 */
import type { Enemy } from './types.ts';

export type PredatorType = 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra';

export const isPredator = (t: string): t is PredatorType =>
  t === 'ocelot' || t === 'jaguar' || t === 'boa' || t === 'caiman' || t === 'tayra';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PredatorEvents {
  /** the telegraph just started (play a warning sound, show "!") */
  telegraph?: boolean;
  /** the attack just launched */
  launch?: boolean;
  /** it just came down / clamped shut (dust, shake) */
  impact?: boolean;
}

export interface PredatorStep {
  ev: PredatorEvents;
  /** world-space boxes that hurt the player this frame */
  hurt: Box[];
}

/** distance from an enemy's origin down to its feet, per kind (matches the drawing's ground line) */
export const FEET: Record<PredatorType, number> = { ocelot: 19, jaguar: 24, boa: 16, caiman: 15, tayra: 15 };

/** where each kind sits relative to the walking surface, so spawners and drawings agree */
export const SURFACE_OFFSET = FEET;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const enter = (e: Enemy, s: string) => {
  e.state = s;
  e.stateT = 0;
};

/** a simple readable arc: u 0..1 -> height multiplier 0..1..0 */
const arc = (u: number) => 4 * u * (1 - u);

function patrol(e: Enemy, dt: number, speed: number) {
  const f = e.facing;
  e.x += f * speed * dt;
  if (e.x < e.patrolMinX) e.facing = 1;
  else if (e.x > e.patrolMaxX) e.facing = -1;
  e.vx = e.facing * speed;
}

/** a knocked-back animal walks back onto its own stretch of ground instead of popping there */
function keepOnGround(e: Enemy, dt: number) {
  const lo = e.patrolMinX - 14;
  const hi = e.patrolMaxX + 14;
  if (e.x < lo) e.x += Math.min(lo - e.x, 140 * dt);
  else if (e.x > hi) e.x -= Math.min(e.x - hi, 140 * dt);
}

/**
 * A hit that interrupts: the animal comes down from whatever it was doing and stands in its open "recover" pose.
 * The game keeps it there (not calling stepPredator) until the stagger runs out.
 */
export function staggerPredator(e: Enemy): void {
  e.y = e.groundY ?? e.y;
  e.vx = 0;
  enter(e, 'recover');
}

/** the stagger is over: back to walking (or lying coiled), with a breather before it attacks again */
export function endStagger(e: Enemy): void {
  enter(e, e.type === 'boa' ? 'coil' : 'patrol');
  e.attackCooldown = Math.max(e.attackCooldown, 1.0);
}

export interface PlayerRef {
  x: number;
  /** feet */
  y: number;
}

export function stepPredator(e: Enemy, p: PlayerRef, dt: number): PredatorStep {
  const type = e.type as PredatorType;
  const ev: PredatorEvents = {};
  const hurt: Box[] = [];
  if (e.state === undefined) {
    e.groundY = e.y;
    e.speed = Math.abs(e.vx) || 40;
    e.state = type === 'boa' ? 'coil' : 'patrol';
    e.stateT = 0;
    e.fromX = e.x;
    e.toX = e.x;
    if (type === 'boa') {
      // a coil stays where it lay
      e.patrolMinX = e.x - 12;
      e.patrolMaxX = e.x + 12;
    }
  }
  const feet = (e.groundY ?? e.y) + FEET[type];
  const level = Math.abs(p.y - feet) < 70;
  const dx = p.x - e.x;
  const dist = Math.abs(dx);
  const toward = dx >= 0 ? 1 : -1;
  e.stateT = (e.stateT ?? 0) + dt;
  const t = e.stateT;
  if (e.attackCooldown > 0) e.attackCooldown -= dt;
  const ready = e.attackCooldown <= 0;
  const speed = e.speed ?? 40;

  switch (type) {
    // ---------------------------------------------------------------- ocelot: a quick short pounce
    case 'ocelot': {
      if (e.state === 'patrol') {
        patrol(e, dt, speed);
        if (ready && dist < 180 && level) {
          e.facing = toward;
          enter(e, 'windup');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'windup') {
        // a short, readable crouch before the pounce (the pounce itself is only 0.36 s)
        e.vx = 0;
        e.facing = toward;
        if (t >= 0.38) {
          enter(e, 'leap');
          e.fromX = e.x;
          e.toX = clamp(e.x + toward * clamp(dist + 24, 90, 170), e.patrolMinX, e.patrolMaxX);
          ev.launch = true;
        }
      } else if (e.state === 'leap') {
        const T = 0.36;
        const u = clamp(t / T, 0, 1);
        e.x = (e.fromX ?? e.x) + ((e.toX ?? e.x) - (e.fromX ?? e.x)) * u;
        e.y = (e.groundY ?? e.y) - 26 * arc(u);
        e.vx = e.facing * speed * 2.5;
        if (u >= 1) {
          e.y = e.groundY ?? e.y;
          enter(e, 'recover');
          ev.impact = true;
        }
      } else if (e.state === 'recover') {
        e.vx = 0;
        if (t > 0.4) {
          enter(e, 'patrol');
          e.attackCooldown = 1.6;
        }
      }
      keepOnGround(e, dt);
      hurt.push({ x: e.x - 22, y: e.y - 14, w: 44, h: 28 });
      break;
    }

    // ---------------------------------------------------------------- jaguar: crouch, big leap, land heavy
    case 'jaguar': {
      if (e.state === 'patrol') {
        patrol(e, dt, speed);
        if (ready && dist < 250 && level) {
          e.facing = toward;
          enter(e, 'windup');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'windup') {
        e.vx = 0;
        e.facing = toward; // keeps its eyes on you while it coils
        if (t >= 0.7) {
          enter(e, 'leap');
          e.fromX = e.x;
          const want = Math.max(80, dist);
          e.toX = clamp(e.x + e.facing * want, e.patrolMinX, e.patrolMaxX);
          ev.launch = true;
        }
      } else if (e.state === 'leap') {
        const T = 0.58;
        const u = clamp(t / T, 0, 1);
        e.x = (e.fromX ?? e.x) + ((e.toX ?? e.x) - (e.fromX ?? e.x)) * u;
        e.y = (e.groundY ?? e.y) - 62 * arc(u);
        e.vx = ((e.toX ?? e.x) - (e.fromX ?? e.x)) / T;
        if (u >= 1) {
          e.y = e.groundY ?? e.y;
          enter(e, 'recover');
          e.vx = 0;
          ev.impact = true;
        }
      } else if (e.state === 'recover') {
        e.vx = 0;
        if (t > 0.95) {
          enter(e, 'patrol');
          e.attackCooldown = 2.2;
        }
      }
      keepOnGround(e, dt);
      hurt.push({ x: e.x - 30, y: e.y - 14, w: 60, h: 38 });
      break;
    }

    // ---------------------------------------------------------------- boa: ambush from a coil
    case 'boa': {
      e.vx = 0;
      if (e.state === 'coil') {
        if (ready && dist < 175 && level) {
          e.facing = toward;
          enter(e, 'rear');
          ev.telegraph = true;
        }
      } else if (e.state === 'rear') {
        if (t >= 0.6) {
          enter(e, 'strike');
          ev.launch = true;
        }
      } else if (e.state === 'strike') {
        if (t >= 0.2) {
          enter(e, 'bite');
          ev.impact = true;
        }
      } else if (e.state === 'bite') {
        if (t >= 0.22) enter(e, 'recover');
      } else if (e.state === 'recover') {
        if (t >= 0.8) {
          enter(e, 'coil');
          e.attackCooldown = 1.1;
        }
      }
      keepOnGround(e, dt);
      hurt.push({ x: e.x - 26, y: e.y - 8, w: 52, h: 24 });
      if (e.state === 'strike' || e.state === 'bite') {
        const reach = e.state === 'strike' ? 28 + 100 * clamp(t / 0.2, 0, 1) : 128;
        const x0 = e.facing > 0 ? e.x + 10 : e.x - reach;
        hurt.push({ x: x0, y: e.y - 14, w: reach - 10 + 20, h: 26 });
      }
      break;
    }

    // ---------------------------------------------------------------- caiman: slow, then a big lunge and a snap
    case 'caiman': {
      if (e.state === 'patrol') {
        patrol(e, dt, speed);
        if (ready && dist < 150 && level) {
          e.facing = toward;
          enter(e, 'windup');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'windup') {
        e.vx = 0;
        if (t >= 0.55) {
          enter(e, 'lunge');
          e.fromX = e.x;
          e.toX = clamp(e.x + e.facing * 70, e.patrolMinX, e.patrolMaxX);
          ev.launch = true;
        }
      } else if (e.state === 'lunge') {
        const T = 0.26;
        const u = clamp(t / T, 0, 1);
        e.x = (e.fromX ?? e.x) + ((e.toX ?? e.x) - (e.fromX ?? e.x)) * (1 - (1 - u) * (1 - u));
        e.vx = (((e.toX ?? e.x) - (e.fromX ?? e.x)) / T) * (1 - u) * 2;
        if (u >= 1) {
          enter(e, 'bite');
          e.vx = 0;
          ev.impact = true;
        }
      } else if (e.state === 'bite') {
        e.vx = 0;
        if (t >= 0.2) enter(e, 'recover');
      } else if (e.state === 'recover') {
        e.vx = 0;
        if (t >= 0.95) {
          enter(e, 'patrol');
          e.attackCooldown = 2;
        }
      }
      keepOnGround(e, dt);
      // body and the closed jaws (the head sticks out in front)
      hurt.push({ x: e.facing > 0 ? e.x - 36 : e.x - 46, y: e.y - 8, w: 82, h: 23 });
      if (e.state === 'lunge' || e.state === 'bite') {
        const x0 = e.facing > 0 ? e.x + 40 : e.x - 40 - 30;
        hurt.push({ x: x0, y: e.y - 18, w: 30, h: 32 });
      }
      break;
    }

    // ---------------------------------------------------------------- tayra: stands up to sniff, then a fast low dash
    case 'tayra': {
      if (e.state === 'patrol') {
        patrol(e, dt, speed);
        if (ready && dist < 240 && level) {
          e.facing = toward;
          enter(e, 'alert');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'alert') {
        e.vx = 0;
        e.facing = toward;
        if (t >= 0.42) {
          enter(e, 'dash');
          ev.launch = true;
        }
      } else if (e.state === 'dash') {
        const v = 235;
        e.x += e.facing * v * dt;
        e.vx = e.facing * v;
        const atEdge = (e.facing > 0 && e.x >= e.patrolMaxX) || (e.facing < 0 && e.x <= e.patrolMinX);
        if (t >= 0.55 || atEdge) {
          enter(e, 'recover');
          ev.impact = true;
        }
      } else if (e.state === 'recover') {
        // skids to a stop
        e.vx = e.facing * Math.max(0, 140 * (1 - t / 0.35));
        e.x += e.vx * dt;
        if (t >= 0.6) {
          enter(e, 'patrol');
          e.attackCooldown = 1.7;
        }
      }
      keepOnGround(e, dt);
      hurt.push({ x: e.x - 24, y: e.y - 8, w: 48, h: 22 });
      break;
    }
  }
  return { ev, hurt };
}
