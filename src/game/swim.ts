/**
 * swim — Pokey swims (World 6 on: the story's Deep Mangrove, where he learns). Two kinds of water from World 6 on:
 *   deadly    dirty or fast (the stage's pit water and its rivers, painted with badWaterArt.ts): a fall into it still costs a life, as it
 *             always has (engine.ts); Dot: "Careful! That water's dirty and fast. Flick up and over."
 *   calm      clean, still water (calmWaterArt.ts, painted from Matt's World 6 water sheet): never costs a life. He floats at its top,
 *             treads water when still, swims left and right with the same thumb, dives a little with down, and gets out by moving into
 *             a bank (he climbs out onto it) or with a flick up (a full leap, never the short hop of a tap).
 * Today the calm water is 6-7's root well (gen2/worlds/w6Rooms.ts): a raft lift with `water` set (puzzleKit.ts) floats in it, and the
 * water's top rides just under the raft's plank, up to the well's lip. The first time he swims, a short moment plays (the `first` sheet:
 * a splash and a flail, then the grin) and he says what calm water is (Dot is away by 6-7).
 *
 * Carrying something (puzzlePlay.ts) he does not swim: it is heavy, so he walks the bottom (the well is shallower than he is tall).
 * Everything here is pure: the engine (engine.ts swimMove, swimCheck) applies it to Pokey once a 30 fps frame.
 */
import type { KitPlay } from './puzzlePlay.ts';
import { PHYS } from './physics.ts';
import type { Platform } from './types.ts';

/** a body of calm water: from x0 to x1, its top at surfaceY, its floor at bottomY */
export interface CalmPool {
  x0: number;
  x1: number;
  surfaceY: number;
  bottomY: number;
}

export const SWIM = {
  /** water shallower than this is waded, not swum (px) */
  minDepth: 56,
  /** floating, his feet are this far under the top (the tread pose's waterline is this far over its feet: heroSwim.ts) */
  float: 46,
  /** falling in, he starts swimming once his feet are this far under the top */
  enter: 18,
  /** swimming speed and how quickly he gets to it and stops (px/s, px/s^2): about half a run, so the water feels like water */
  speed: 150,
  acc: 900,
  dec: 650,
  /** the bob back to floating: a soft spring, a little bouncy (per s^2, per s) */
  spring: 70,
  damp: 9,
  /** a fall into the water loses this share of its speed at the splash */
  splash: 0.35,
  /** holding down dives this much deeper (as the floor allows), and he comes up by himself after this long (s): no breath to watch */
  dive: 40,
  diveFor: 3,
  /** a flick up: a full jump out of the water (a leap, never cut short by a quick thumb) */
  leapV: PHYS.jumpV,
  /** moving into a bank whose top is up to this far over the water's top climbs out onto it */
  climbOut: 70,
  /** his half-width against a bank (engine.ts's wall half) and how close to it counts as touching */
  half: 19,
  touch: 8,
  /**
   * the first-swim moment, s: the splash and a beat under it (`firstPause`, the first frame of the `first` sheet: the flail), then the
   * sheet's 6 frames at 6 a second (the flail turns into the grin) and a beat on the grin. His line comes after the pause (`firstLine`)
   */
  firstFor: 2.1,
  firstPause: 0.5,
  firstLine: 0.6,
} as const;

/**
 * The first swim's lines (under 10 words each; new, each needs Matt's approval: STAGE-RULES §1 "Story"). 6-7 is in the second half of
 * World 6, where Dot is away (wayside.ts dotPresent), so they are Pokey's own: the guide shows them as his. The first comes as the moment
 * plays, telling the clean, calm water from the dirty kind; the second when it is over, how to get out.
 */
export const SWIM_LINES = {
  first: 'Clean, calm water. I can swim in this!', // (new, needs Matt's approval)
  out: 'Swim to the edge, or flick up and out.', // (new, needs Matt's approval)
} as const;
/** how long the first line shows before the second */
export const SWIM_FIRST_LINE = 3.2;

/**
 * The camera in calm water (engine.ts): it eases in on him, so a kid sees him swim (his arms, his head out of the water) even in a puzzle
 * room's pulled-back framing; further in for the first-swim moment. Times the usual zoom, reached at `ease` per second.
 */
export const SWIM_CAM = { first: 1.5, swim: 1.2, ease: 2.5 } as const;

/** the calm water of a stage's puzzle rooms: each raft lift with `water` set, filling the platform it is anchored on (6-7's well) */
export function kitPools(kit: KitPlay | null | undefined, platforms: readonly Platform[]): CalmPool[] {
  if (!kit) return [];
  const out: CalmPool[] = [];
  for (const r of kit.rooms) {
    for (const l of r.lifts) {
      if (l.spec.water === undefined) continue;
      const floor = platforms.find((p) => p.id === l.spec.at.on);
      if (!floor) continue;
      // (the water's top just under the plank: the raft floats; never over the well's lip)
      const surfaceY = Math.max(floor.y - l.spec.water, l.plat.y + RAFT_SITS);
      out.push({ x0: floor.x, x1: floor.x + floor.width, surfaceY, bottomY: floor.y });
    }
  }
  return out;
}
/** how far the raft's plank top stands over the water */
export const RAFT_SITS = 6;

/** the calm water at x, if it is deep enough to swim */
export function poolAt(pools: readonly CalmPool[], x: number): CalmPool | undefined {
  return pools.find((w) => x > w.x0 + 2 && x < w.x1 - 2);
}
export const deepEnough = (w: CalmPool) => w.bottomY - w.surfaceY >= SWIM.minDepth;

/** whether he starts swimming this frame: deep calm water, his feet far enough in, not rising out of it, and free hands */
export function startsSwim(w: CalmPool | undefined, feetY: number, vy: number, busy: boolean): w is CalmPool {
  return !!w && !busy && deepEnough(w) && feetY >= w.surfaceY + SWIM.enter && vy >= 0;
}

/** where he floats (his feet), diving `under` (0..1) of the way down, never through the floor */
export function floatY(w: CalmPool, under: number): number {
  return Math.min(w.bottomY - 3, w.surfaceY + SWIM.float + SWIM.dive * under);
}

export interface SwimBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
}
export interface SwimPad {
  steer: -1 | 0 | 1;
  down: boolean;
  jump: boolean;
}
export interface SwimState {
  /** seconds he has held a dive (he comes up by himself after SWIM.diveFor, until down is let go) */
  diveT: number;
  /** seconds left of the first-swim moment: no steering until it is over */
  firstLeft: number;
}

/**
 * One frame of swimming: steering, the bob to the top (or the dive), and the ways out. Moves `b` (x, y, vx, vy, facing) and says what
 * happened: 'swim' (still in), 'leap' (a flick up: he is in the air at a full jump), 'out' (moving into a bank: he is standing on its top,
 * at `bank`).
 */
export function swimStep(b: SwimBody, st: SwimState, w: CalmPool, pad: SwimPad, dt: number, platforms: readonly Platform[]): { kind: 'swim' | 'leap' | 'out'; bank?: Platform } {
  const beat = st.firstLeft > 0;
  st.firstLeft = Math.max(0, st.firstLeft - dt);
  const steer = beat ? 0 : pad.steer;
  if (!beat && pad.jump) {
    b.vy = -SWIM.leapV;
    st.diveT = 0;
    return { kind: 'leap' };
  }
  if (steer !== 0) {
    b.facing = steer;
    // out onto a bank he swims into: its face in front of him, its top a short climb over the water's (not under his feet)
    const bank = bankAhead(platforms, b.x, steer, w);
    if (bank) {
      b.x = steer > 0 ? bank.x + SWIM.half - 4 : bank.x + bank.width - SWIM.half + 4;
      b.y = bank.y;
      b.vx = steer * 60;
      b.vy = 0;
      st.diveT = 0;
      return { kind: 'out', bank };
    }
    const turning = Math.sign(b.vx) === -steer;
    b.vx += steer * SWIM.acc * (turning ? 1.6 : 1) * dt;
    if (Math.abs(b.vx) > SWIM.speed) b.vx = Math.sign(b.vx) * SWIM.speed;
  } else {
    const dec = SWIM.dec * dt;
    b.vx = Math.abs(b.vx) <= dec ? 0 : b.vx - Math.sign(b.vx) * dec;
  }
  // the dive: down held, until he has been under long enough; then up by himself until down is let go
  const diving = !beat && pad.down && st.diveT < SWIM.diveFor;
  st.diveT = pad.down ? st.diveT + dt : 0;
  const target = floatY(w, diving ? 1 : 0);
  b.vy += ((target - b.y) * SWIM.spring - b.vy * SWIM.damp) * dt;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
  // (never through the floor, never up out of the water by the bob alone)
  if (b.y > w.bottomY - 2) {
    b.y = w.bottomY - 2;
    b.vy = Math.min(0, b.vy);
  }
  if (b.y < w.surfaceY + SWIM.enter) {
    b.y = w.surfaceY + SWIM.enter;
    b.vy = Math.max(0, b.vy);
  }
  return { kind: 'swim' };
}

/** the bank in front of him (way `dir`) he can climb out onto: a solid face he touches, its top over his feet and close over the water */
export function bankAhead(platforms: readonly Platform[], x: number, dir: 1 | -1, w: CalmPool): Platform | undefined {
  return platforms.find((p) => {
    if (p.broken || p.type !== 'solid') return false;
    const gap = dir > 0 ? p.x - (x + SWIM.half) : x - SWIM.half - (p.x + p.width);
    if (gap < -SWIM.touch || gap > SWIM.touch) return false;
    return p.y < w.surfaceY + SWIM.float - 4 && p.y >= w.surfaceY - SWIM.climbOut && p.y + p.height > w.surfaceY;
  });
}

/** how far under he is, 0 (floating) to 1 (dived as deep as the dive goes), for the drawing */
export function underOf(w: CalmPool, y: number): number {
  return Math.max(0, Math.min(1, (y - (w.surfaceY + SWIM.float)) / SWIM.dive));
}
