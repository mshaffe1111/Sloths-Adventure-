/**
 * How long Pokey takes to get to one of the Sky Sovereign's openings (4-10), with the game's own run, jump, double jump and leaf at 30 fps
 * (physics.ts PHYS, glide.ts GLIDE). Matt's rule (2026-10-26): an opening has to stay open for the time it takes to reach it from where a
 * player would be after dodging, plus 0.8 s to see it and react, plus 0.6 s to land the hit (OPENING_RULE).
 *
 * heroReach tries every way of getting there with up to two jumps (each with or without a double jump, the leaf held on the way down)
 * and returns the quickest. Rocks are walls with a top to stand on, as in the engine: walking into one stops him, a lip within 26 px of
 * his feet is hoisted onto, and a top is landed on from above. Heights are px above the floor (up is +).
 */
import { PHYS } from './physics.ts';
import { GLIDE } from './glide.ts';

export const OPENING_RULE = { react: 0.8, hit: 0.6 } as const;

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** a rock: its middle, width and height above the floor */
export interface Rock {
  x: number;
  w: number;
  h: number;
}

export type ReachGoal =
  /** a jab lands on this box (x across, y and h up from the floor); `boxAt`, when given, is where the box is t s after he sets off (a
   * boss that comes to him), and `box` is only where it starts */
  | { kind: 'punch'; box: Box; boxAt?: (t: number) => Box }
  /** his feet come down on this box from above (a stomp; with the leaf open if `leaf`) */
  | { kind: 'stomp'; box: Box; leaf?: boolean };

const DT = 1 / 30;
const HALF = 19;
// the jab: 8 to 64 px in front of him, 8 to 54 px above his feet (fight.ts MOVES.jab at full reach)
const JAB = { x0: 8, x1: 64, y0: 8, y1: 54 };

interface Body {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  glideT: number;
  glideLeft: number;
  gliding: boolean;
}

const overlap = (a0: number, a1: number, b0: number, b1: number) => a0 < b1 && a1 > b0;

function reached(b: Body, goal: ReachGoal, prevY: number, t: number): boolean {
  const g = goal.kind === 'punch' && goal.boxAt ? goal.boxAt(t) : goal.box;
  if (goal.kind === 'punch') {
    // facing the box (he turns at once), the jab reaches it
    const right = g.x + g.w / 2 >= b.x;
    const x0 = right ? b.x + JAB.x0 : b.x - JAB.x1;
    const x1 = right ? b.x + JAB.x1 : b.x - JAB.x0;
    return overlap(x0, x1, g.x, g.x + g.w) && overlap(b.y + JAB.y0, b.y + JAB.y1, g.y, g.y + g.h);
  }
  // the engine's stomp on a boss (engine.ts stompBoss): falling, feet came from the top band and are in the box now
  const top = g.y + g.h;
  if (b.vy >= 0 || Math.abs(b.x - (g.x + g.w / 2)) > g.w / 2 + 14) return false;
  if (prevY < top - g.h * 0.6 || b.y > top + 6 || b.y < top - g.h - 20) return false;
  return !goal.leaf || b.gliding;
}

/**
 * The quickest time (s) from standing at `fromX` (feet at `fromUp`) until the goal is met, or Infinity. `plan` jumps: the frames to run
 * before each jump and before each double jump (-1: none).
 */
function trial(fromX: number, fromUp: number, goal: ReachGoal, rocks: readonly Rock[], plan: number[], aimX: number, maxT: number): number {
  const b: Body = { x: fromX, y: fromUp, vx: 0, vy: 0, grounded: true, glideT: 0, glideLeft: GLIDE.maxTime, gliding: false };
  let seq = 0;
  let wait = plan[0];
  let dbl = -1;
  let doubled = false;
  for (let f = 0; f * DT <= maxT; f++) {
    const prevY = b.y;
    const mv = goal.kind === 'punch' && goal.boxAt ? goal.boxAt(f * DT) : null;
    const dx = (mv ? mv.x + mv.w / 2 : aimX) - b.x;
    const dir = Math.abs(dx) < 3 ? 0 : dx > 0 ? 1 : -1;
    if (b.grounded) {
      b.glideLeft = GLIDE.maxTime;
      b.gliding = false;
      if (seq < 2 && wait >= 0 && plan[seq * 2] >= 0 && wait-- <= 0) {
        b.vy = PHYS.jumpV;
        b.grounded = false;
        dbl = plan[seq * 2 + 1];
        doubled = false;
        seq++;
        wait = seq < 2 ? plan[seq * 2] : -1;
      } else {
        const want = dir * PHYS.maxRun;
        const acc = (Math.sign(want - b.vx) === -Math.sign(b.vx) && b.vx !== 0 ? PHYS.groundDec : PHYS.groundAcc) * DT;
        b.vx = Math.abs(want - b.vx) <= acc ? want : b.vx + Math.sign(want - b.vx) * acc;
      }
    }
    if (!b.grounded) {
      if (!doubled && dbl >= 0 && dbl-- <= 0) {
        b.vy = PHYS.doubleV;
        doubled = true;
      }
      // steer, gravity (Jump held the whole way: the hang at the top and the leaf on the way down)
      if (dir !== 0) {
        if (dir * b.vx < PHYS.maxRun) b.vx = dir * Math.min(PHYS.maxRun, dir * b.vx + PHYS.airAcc * DT);
      } else b.vx = Math.abs(b.vx) <= PHYS.airStop * DT ? 0 : b.vx - Math.sign(b.vx) * PHYS.airStop * DT;
      let g = b.vy > 0 ? PHYS.gravUp : PHYS.gravDown;
      if (Math.abs(b.vy) < 90) g *= 0.72;
      b.vy = Math.max(-PHYS.maxFall, b.vy - g * DT);
      if (b.vy >= GLIDE.refillUp) b.glideLeft = GLIDE.maxTime;
      b.glideT = b.vy < -GLIDE.minFall ? b.glideT + DT : 0;
      b.gliding = b.glideT >= GLIDE.onset && b.glideLeft > 0;
      if (b.gliding) {
        b.glideLeft = Math.max(0, b.glideLeft - DT);
        if (b.vy < -GLIDE.fallSpeed) b.vy = Math.min(-GLIDE.fallSpeed, b.vy + GLIDE.brake * DT);
      }
    }
    const px = b.x;
    b.x += b.vx * DT;
    b.y += b.grounded ? 0 : b.vy * DT;
    // rocks: walls, lips and tops
    let floor = 0;
    for (const r of rocks) {
      const x0 = r.x - r.w / 2;
      const x1 = r.x + r.w / 2;
      if (b.x + HALF > x0 && b.x - HALF < x1 && b.y < r.h - 1) {
        if (b.y >= r.h - 26 && b.vy <= 120) {
          b.y = r.h;
          b.vy = 0;
        } else {
          b.x = px <= r.x ? x0 - HALF : x1 + HALF;
          b.vx = 0;
        }
      }
      if (b.x + 11 > x0 && b.x - 11 < x1 && b.y >= r.h - 1) floor = Math.max(floor, r.h);
    }
    if (b.y <= floor && (b.vy <= 0 || b.grounded)) {
      b.y = floor;
      b.vy = 0;
      b.grounded = true;
    } else if (b.y > floor + 0.5) b.grounded = false;
    if (reached(b, goal, prevY, (f + 1) * DT)) return (f + 1) * DT;
  }
  return Infinity;
}

/** the quickest way there: running, and up to two jumps (each maybe doubled), leaf held on the way down */
export function heroReach(fromX: number, fromUp: number, goal: ReachGoal, rocks: readonly Rock[] = [], maxT = 4): number {
  // (he heads for where the box is when he sets off; a box that comes to him only shortens it)
  const aim = goal.box.x + goal.box.w / 2;
  let best = trial(fromX, fromUp, goal, rocks, [-1, -1, -1, -1], aim, maxT);
  const waits = [0, 2, 4, 6, 8, 10, 12, 15, 18, 22, 26, 30];
  const dbls = [-1, 4, 6, 8, 10, 12, 15, 18];
  const waits2 = [-1, 0, 2, 4, 8];
  for (const w1 of waits) {
    for (const d1 of dbls) {
      for (const w2 of waits2) {
        for (const d2 of w2 < 0 ? [-1] : dbls) {
          if (w1 * DT >= best) continue;
          const t = trial(fromX, fromUp, goal, rocks, [w1, d1, w2, d2], aim, Math.min(maxT, best));
          if (t < best) best = t;
        }
      }
    }
  }
  return best;
}

/** how long an opening has to stay open under Matt's rule, for a reach that takes `reach` s */
export const openingNeeds = (reach: number) => reach + OPENING_RULE.react + OPENING_RULE.hit;
