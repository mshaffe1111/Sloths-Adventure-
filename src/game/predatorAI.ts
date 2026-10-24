/**
 * Ground predator behaviour: ocelot, jaguar, boa, caiman, tayra, night harpy.
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
import { PERSONALITY, SPIDER, roam, speedScale, walkBounds, type BrainEvents, type PlayerRef } from './enemyBrain.ts';

export type { PlayerRef } from './enemyBrain.ts';

/** every ground animal with a brain (see enemyBrain.ts): the tree snake counts, it just is not a hunter of sloths by trade */
export type PredatorType = 'snake' | 'ocelot' | 'jaguar' | 'boa' | 'caiman' | 'tayra' | 'harpy' | 'turtle';

export const isPredator = (t: string): t is PredatorType =>
  t === 'snake' || t === 'ocelot' || t === 'jaguar' || t === 'boa' || t === 'caiman' || t === 'tayra' || t === 'harpy' || t === 'turtle';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PredatorEvents extends BrainEvents {
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
export const FEET: Record<PredatorType, number> = { snake: 14, ocelot: 19, jaguar: 24, boa: 16, caiman: 15, tayra: 15, harpy: 16, turtle: 14 };

/** where each kind sits relative to the walking surface, so spawners and drawings agree */
export const SURFACE_OFFSET = FEET;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const enter = (e: Enemy, s: string) => {
  e.state = s;
  e.stateT = 0;
};

/** the night harpy's attack, in seconds and pixels (exported so the drawing and the tests read the same numbers) */
export const HARPY = { crouch: 0.6, slide: 0.42, slideSpeed: 270, air: 0.36, hop: 52, reachMax: 130, quake: 0.38, dizzy: 1.0, shockFrom: 26, shockTo: 125 };

/** how far the stomp's shockwave has travelled (px each way from the harpy) `t` seconds after it lands */
export const harpyShockReach = (t: number) => HARPY.shockFrom + (HARPY.shockTo - HARPY.shockFrom) * clamp(t / HARPY.quake, 0, 1);

/** the river snapper's timings (s) and reach (px): exported so the drawing and the tests read the same numbers */
export const TURTLE = { windup: 0.5, snap: 0.18, recover: 0.75, reach: 46, shell: 1.8, peek: 0.45, slideSpeed: 380, slideMax: 2.2, dizzy: 1.1 };

/**
 * What a blow does to a snapper (engine.ts hitEnemy): `shell`: it was hit head-on and hides (no harm done); `slide`: its shell is
 * kicked and slides away; `bump`: a punch on the hidden shell only nudges it; `hit`: from behind, or while it is open after a snap or
 * dizzy, the blow lands. A stomp always lands (fight.ts: stomp true).
 */
export function turtleGuard(e: Enemy, attackerX: number, kick: boolean): 'shell' | 'slide' | 'bump' | 'hit' {
  if (e.state === 'shell' || e.state === 'peek') return kick ? 'slide' : 'bump';
  if (e.state === 'slide') return 'bump';
  if (e.state === 'dizzy' || e.state === 'recover') return 'hit';
  const front = (attackerX >= e.x ? 1 : -1) === e.facing;
  return front ? 'shell' : 'hit';
}

/** a simple readable arc: u 0..1 -> height multiplier 0..1..0 */
const arc = (u: number) => 4 * u * (1 - u);

/** a knocked-back animal walks back onto its own ground instead of popping there */
function keepOnGround(e: Enemy, dt: number) {
  const [a, b] = walkBounds(e);
  const lo = a - 14;
  const hi = b + 14;
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

export function stepPredator(e: Enemy, p: PlayerRef, dt: number): PredatorStep {
  const type = e.type as PredatorType;
  const ev: PredatorEvents = {};
  const hurt: Box[] = [];
  if (e.state === undefined) {
    e.groundY = e.y;
    e.speed = Math.abs(e.vx) || 40;
    e.state = type === 'boa' ? 'coil' : type === 'snake' && e.asleep ? 'sleep' : 'patrol';
    e.stateT = 0;
    e.fromX = e.x;
    e.toX = e.x;
    if (type === 'boa') {
      // a coil stays where it lay
      e.patrolMinX = e.x - 12;
      e.patrolMaxX = e.x + 12;
      e.huntMinX = e.patrolMinX;
      e.huntMaxX = e.patrolMaxX;
    }
  }
  const feet = (e.groundY ?? e.y) + FEET[type];
  const dx = p.x - e.x;
  const dist = Math.abs(dx);
  const toward = dx >= 0 ? 1 : -1;
  e.stateT = (e.stateT ?? 0) + dt;
  const t = e.stateT;
  if (e.attackCooldown > 0) e.attackCooldown -= dt;
  const ready = e.attackCooldown <= 0;
  const speed = e.speed ?? 40;

  switch (type) {
    // ---------------------------------------------------------------- snake: shy, then a quick aimed strike
    case 'snake': {
      if (e.wakeT && e.wakeT > 0) e.wakeT = Math.max(0, e.wakeT - dt);
      if (e.state === 'sleep') {
        // asleep: it lies still until he is right beside it on its own branch, then wakes slowly (a moment before it can strike)
        e.vx = 0;
        if (dist < 95 && Math.abs(p.y - feet) < 60) {
          e.asleep = false;
          e.wakeT = 1.1;
          enter(e, 'patrol');
          e.attackCooldown = Math.max(e.attackCooldown, 1.1);
          e.facing = toward;
        }
      } else if (e.state === 'patrol') {
        if (roam(e, p, dt, feet, PERSONALITY.snake, ready, speed, ev)) {
          enter(e, 'rear');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'rear') {
        // it rears up and sways, still tracking him; the aim locks just before the strike
        e.vx = 0;
        if (t < 0.3) e.facing = toward;
        if (t >= 0.38) {
          enter(e, 'strike');
          e.fromX = e.x;
          e.toX = clamp(e.x + e.facing * clamp(dist - 40, 20, 80), ...walkBounds(e));
          ev.launch = true;
        }
      } else if (e.state === 'strike') {
        const T = 0.18;
        const u = clamp(t / T, 0, 1);
        e.x = (e.fromX ?? e.x) + ((e.toX ?? e.x) - (e.fromX ?? e.x)) * (1 - (1 - u) * (1 - u));
        e.vx = e.facing * speed;
        if (u >= 1) {
          enter(e, 'recover');
          e.vx = 0;
          ev.impact = true;
        }
      } else if (e.state === 'recover') {
        e.vx = 0;
        if (t >= 0.55) {
          enter(e, 'patrol');
          e.attackCooldown = 1.3;
        }
      }
      keepOnGround(e, dt);
      hurt.push({ x: e.x - 18, y: e.y - 12, w: 36, h: 22 });
      if (e.state === 'strike') {
        // the head thrown out in front
        hurt.push({ x: e.facing > 0 ? e.x + 8 : e.x - 50, y: e.y - 10, w: 42, h: 20 });
      }
      break;
    }

    // ---------------------------------------------------------------- ocelot: a stalker, then a quick short pounce
    case 'ocelot': {
      if (e.state === 'patrol') {
        if (roam(e, p, dt, feet, PERSONALITY.ocelot, ready, speed, ev)) {
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
          e.toX = clamp(e.x + toward * clamp(dist + 24, 90, 170), ...walkBounds(e));
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
        if (roam(e, p, dt, feet, PERSONALITY.jaguar, ready, speed, ev)) {
          e.facing = toward;
          enter(e, 'windup');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'windup') {
        e.vx = 0;
        e.facing = toward; // keeps its eyes on you while it coils
        if (t >= 0.65) {
          enter(e, 'leap');
          e.fromX = e.x;
          const want = Math.max(80, dist + 20);
          e.toX = clamp(e.x + e.facing * want, ...walkBounds(e));
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
        // it never moves, but it watches: its head follows him once it has noticed
        if (roam(e, p, dt, feet, PERSONALITY.boa, ready, 0, ev)) {
          e.facing = toward;
          enter(e, 'rear');
          ev.telegraph = true;
        }
      } else if (e.state === 'rear') {
        if (t < 0.45) e.facing = toward; // keeps tracking him, then the aim locks
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
        // the same reach both ways (the left side used to be 20px shorter)
        const x0 = e.facing > 0 ? e.x + 10 : e.x - reach - 20;
        hurt.push({ x: x0, y: e.y - 14, w: reach - 10 + 20, h: 26 });
      }
      break;
    }

    // ---------------------------------------------------------------- caiman: slow, then a big lunge and a snap
    case 'turtle': {
      // the river snapper: creeps, pulls its head back (the tell), snaps, and needs a moment to recover. Hit head-on it hides in its
      // shell (engine.ts); a kick sends the shell sliding along the bank, knocking over anything in its way, until it bumps the end of
      // its ground and the turtle climbs out dizzy
      if (e.state === 'shell') {
        e.vx = 0;
        if (t >= TURTLE.shell) enter(e, 'peek');
      } else if (e.state === 'peek') {
        e.vx = 0;
        if (t >= TURTLE.peek) {
          enter(e, 'patrol');
          e.attackCooldown = 1;
        }
      } else if (e.state === 'slide') {
        const dir = (e.slideDir ?? 1) as 1 | -1;
        e.vx = dir * TURTLE.slideSpeed;
        e.x += e.vx * dt;
        const [lo, hi] = walkBounds(e);
        if ((dir > 0 && e.x >= hi) || (dir < 0 && e.x <= lo) || t >= TURTLE.slideMax) {
          e.x = clamp(e.x, lo, hi);
          e.vx = 0;
          enter(e, 'dizzy');
          ev.impact = true;
        }
      } else if (e.state === 'dizzy') {
        e.vx = 0;
        if (t >= TURTLE.dizzy) {
          enter(e, 'patrol');
          e.attackCooldown = 1.2;
        }
      } else if (e.state === 'patrol') {
        if (roam(e, p, dt, feet, PERSONALITY.turtle, ready, speed, ev)) {
          e.facing = toward;
          enter(e, 'windup');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'windup') {
        e.vx = 0;
        if (t < 0.25) e.facing = toward;
        if (t >= TURTLE.windup) {
          enter(e, 'snap');
          ev.launch = true;
        }
      } else if (e.state === 'snap') {
        e.vx = 0;
        if (t >= TURTLE.snap) {
          enter(e, 'recover');
          ev.impact = true;
        }
      } else if (e.state === 'recover') {
        e.vx = 0;
        if (t >= TURTLE.recover) {
          enter(e, 'patrol');
          e.attackCooldown = 1.6;
        }
      }
      if (e.state !== 'slide') keepOnGround(e, dt);
      // the body (not while it hides: a shell sitting still, or one sliding away, does not hurt him), and the head when it snaps
      if (e.state === 'patrol' || e.state === 'windup' || e.state === 'snap' || e.state === 'recover') hurt.push({ x: e.x - 24, y: e.y - 6, w: 48, h: 20 });
      if (e.state === 'snap') hurt.push({ x: e.facing > 0 ? e.x + 20 : e.x - 20 - TURTLE.reach, y: e.y - 10, w: TURTLE.reach, h: 22 });
      break;
    }
    case 'caiman': {
      if (e.state === 'patrol') {
        if (roam(e, p, dt, feet, PERSONALITY.caiman, ready, speed, ev)) {
          e.facing = toward;
          enter(e, 'windup');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'windup') {
        e.vx = 0;
        if (t < 0.4) e.facing = toward;
        if (t >= 0.55) {
          enter(e, 'lunge');
          e.fromX = e.x;
          e.toX = clamp(e.x + e.facing * clamp(dist + 15, 60, 100), ...walkBounds(e));
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
        if (roam(e, p, dt, feet, PERSONALITY.tayra, ready, speed, ev)) {
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
        const v = 235 * speedScale(e, PERSONALITY.tayra.nominal);
        e.x += e.facing * v * dt;
        e.vx = e.facing * v;
        const [wlo, whi] = walkBounds(e);
        const atEdge = (e.facing > 0 && e.x >= whi) || (e.facing < 0 && e.x <= wlo);
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

    // ---------------------------------------------------------------- night harpy: crouch, low slide, leap, stomp and a shockwave
    case 'harpy': {
      if (e.state === 'patrol') {
        if (roam(e, p, dt, feet, PERSONALITY.harpy, ready, speed, ev)) {
          e.facing = toward;
          enter(e, 'crouch');
          e.vx = 0;
          ev.telegraph = true;
        }
      } else if (e.state === 'crouch') {
        // a long, readable crouch: it keeps its eyes on you, then the aim locks for the slide
        e.vx = 0;
        if (t < HARPY.crouch - 0.15) e.facing = toward;
        if (t >= HARPY.crouch) {
          enter(e, 'slide');
          ev.launch = true;
        }
      } else if (e.state === 'slide') {
        const v = HARPY.slideSpeed * speedScale(e, PERSONALITY.harpy.nominal) * (1 - 0.45 * clamp(t / HARPY.slide, 0, 1));
        e.x += e.facing * v * dt;
        e.vx = e.facing * v;
        const [wlo, whi] = walkBounds(e);
        const atEdge = (e.facing > 0 && e.x >= whi) || (e.facing < 0 && e.x <= wlo);
        if (t >= HARPY.slide || atEdge) {
          // it pops up and turns on you for the stomp
          enter(e, 'stomp');
          e.facing = toward;
          e.fromX = e.x;
          e.toX = clamp(e.x + toward * clamp(dist, 30, HARPY.reachMax), ...walkBounds(e));
          e.vx = 0;
        }
      } else if (e.state === 'stomp') {
        // airborne: the wings-up pose is the warning that the shockwave is coming
        const u = clamp(t / HARPY.air, 0, 1);
        e.x = (e.fromX ?? e.x) + ((e.toX ?? e.x) - (e.fromX ?? e.x)) * u;
        e.y = (e.groundY ?? e.y) - HARPY.hop * arc(u);
        e.vx = ((e.toX ?? e.x) - (e.fromX ?? e.x)) / HARPY.air;
        if (u >= 1) {
          e.y = e.groundY ?? e.y;
          e.vx = 0;
          enter(e, 'quake');
          ev.impact = true;
        }
      } else if (e.state === 'quake') {
        e.vx = 0;
        if (t >= HARPY.quake) enter(e, 'recover');
      } else if (e.state === 'recover') {
        // winded from its own stomp: dizzy, and the moment to strike
        e.vx = 0;
        if (t >= HARPY.dizzy) {
          enter(e, 'patrol');
          e.attackCooldown = 1.9;
        }
      }
      keepOnGround(e, dt);
      hurt.push({ x: e.x - 20, y: e.y - 14, w: 40, h: 30 });
      if (e.state === 'slide') {
        // the long low body, out in front
        hurt.push({ x: e.facing > 0 ? e.x - 14 : e.x - 70, y: e.y - 6, w: 84, h: 24 });
      }
      if (e.state === 'quake') {
        const reach = harpyShockReach(t);
        // the shockwave runs along the ground both ways; a jump clears it
        hurt.push({ x: e.x - reach, y: (e.groundY ?? e.y) + FEET.harpy - 15, w: reach * 2, h: 15 });
      }
      break;
    }
  }
  return { ev, hurt };
}

/**
 * The canopy tarantula (a boss's summoned spiderling): it waits perfectly still, then rushes in short bursts with a pause
 * between each. The pause is the moment to stomp it. It never leaves the floor it was dropped on.
 */
export function stepSpider(e: Enemy, p: PlayerRef, dt: number): { hurt: Box[]; ev: BrainEvents } {
  const ev: BrainEvents = {};
  if (e.state !== 'wait' && e.state !== 'run' && e.state !== 'pause') {
    e.state = 'wait';
    e.stateT = 0;
  }
  e.stateT = (e.stateT ?? 0) + dt;
  const t = e.stateT;
  const dx = p.x - e.x;
  const toward: 1 | -1 = dx >= 0 ? 1 : -1;
  const sees = Math.abs(dx) < SPIDER.sense && Math.abs(p.y - (e.y + 12)) < 170;
  const hunting = (e.alertT ?? 0) > 0;
  if (sees) {
    if (!hunting) ev.notice = true;
    e.alertT = 4;
  } else {
    e.alertT = Math.max(0, (e.alertT ?? 0) - dt);
  }
  if (e.state === 'wait') {
    e.vx = 0;
    if ((e.alertT ?? 0) > 0) {
      e.state = 'run';
      e.stateT = 0;
      e.facing = toward;
    }
  } else if (e.state === 'run') {
    e.facing = toward;
    const v = SPIDER.speed * speedScale(e, SPIDER.nominal);
    const nx = Math.max(e.patrolMinX, Math.min(e.patrolMaxX, e.x + toward * v * dt));
    e.vx = nx === e.x ? 0 : toward * v;
    e.x = nx;
    if (t >= SPIDER.burst) {
      e.state = 'pause';
      e.stateT = 0;
      e.vx = 0;
    }
  } else {
    e.vx = 0;
    if (t >= SPIDER.pause) {
      e.state = (e.alertT ?? 0) > 0 ? 'run' : 'wait';
      e.stateT = 0;
    }
  }
  return { hurt: [{ x: e.x - 16, y: e.y - 10, w: 32, h: 20 }], ev };
}
