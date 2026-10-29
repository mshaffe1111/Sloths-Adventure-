/**
 * protoCheck — the physics checks the planned-stage builder (protoStage.ts) runs on every piece it rolls, using the same physics as the
 * engine (physics.ts). A piece whose numbers fail is rolled again, so a stage never reaches a player with a swing that cannot be made.
 *
 * The vines swing on their own (physics.ts, the self-swing), all on one clock. A jump from a ledge can wait for the vine, so it is
 * checked against the line the vine swings through hanging straight down (canGrabSwing with no clock); a leap from one vine to the next
 * cannot choose the next vine's moment, so it is checked against where the next vine's swing has it when he gets there (the swing's
 * clock carried through the flight). A pair is checked at the swings the stage gives two vines side by side (physics.ts swingSetup: each
 * swings only as far as keeps their swings apart, and the next one is `chainPhase` of a swing ahead).
 */

/**
 * how far forward in its swing he is, as a share of the vine's swing (1: the front). The checks' moments were set in radians for the old
 * swing of 0.8 either side (a sine of 0.5 there is 0.65 of the way to its front): they are shares of whatever the vine swings now.
 */
const share = (s: { angle: number; amp?: number }) => s.angle / Math.max(0.01, s.amp ?? TIMED.amp);

/** A and B with the swings the stage would give them side by side (an author's own sizes kept) */
function pair(A: Vine, B: Vine): [Vine, Vine] {
  const a = { ...A }, b = { ...B };
  swingSetup([a, b]);
  return [a, b];
}
import { PHYS, TIMED, airStep, canGrabSwing, inSweetSpot, swingGrab, swingSetup, swingStep, timedLaunch, type AirBody } from './physics.ts';
import type { Platform, Vine } from './types.ts';

const DT = 1 / 30;
/**
 * the frames of a swing the checks watch: 90 at the old swing (a swing and a half at 1.9 s), half as many again now the swing is one
 * and a half times slower (2026-10-28), so a window's seconds mean what they did: the same share of the swing, in its own time
 */
const SPAN = () => 135;

/** the highest a double jump lifts his feet (px), at either tick rate and the best moment for the second jump */
export function maxRise(): number {
  let best = 0;
  for (const dt of [1 / 30, 1 / 60]) {
    for (let tD = 0.05; tD < 0.6; tD += 0.01) {
      const b: AirBody = { x: 0, y: 0, vx: 0, vy: -PHYS.jumpV };
      let t = 0, used = false, top = 0;
      for (let i = 0; i < 300; i++) {
        if (!used && t >= tD) { b.vy = -PHYS.doubleV; used = true; }
        airStep(b, dt, 0);
        t += dt;
        top = Math.min(top, b.y);
        if (used && b.vy > 0) break;
      }
      best = Math.max(best, -top);
    }
  }
  return best;
}

/** a running jump off a ledge (edge at `edgeX`, surface `y`), taken anywhere in the last 90 px, with or without the second jump: can it grab the liana? */
export function jumpGrab(edgeX: number, y: number, v: Vine): number {
  let ok = 0;
  for (let back = 10; back <= 90; back += 10) {
    for (const tD of [99, 0.15, 0.25, 0.35]) {
      const b: AirBody = { x: edgeX - back, y, vx: PHYS.maxRun, vy: -PHYS.jumpV };
      let t = 0, used = false, hit = false;
      for (let i = 0; i < 70 && !hit; i++) {
        if (!used && t >= tD) { b.vy = -PHYS.doubleV; used = true; }
        airStep(b, DT, 1);
        t += DT;
        if (canGrabSwing(b.x, b.y, v)) hit = true;
        if (b.y > y + 400) break;
      }
      if (hit) { ok++; break; }
    }
  }
  return ok; // out of 9 take-off spots
}

/** the swing on A entered the way a jump or an earlier liana brings him in */
function enter(A: Vine): { s: ReturnType<typeof swingGrab> } {
  const len = A.bottomY - A.topY;
  return { s: swingGrab({ x: A.x - 40, y: A.topY + Math.min(len * 0.7, len - 20), vx: 300, vy: 100 }, A) };
}

/**
 * seconds of a swing on A during which letting go (holding toward B, with the double jump if it helps) catches B. `wind` (px/s, + to the
 * right) is a gust blowing at full strength the whole flight, as the engine adds it in the air (zones.ts windPush): 0 is the calm.
 */
export function catchWindow(A0: Vine, B0: Vine, wind = 0): number {
  const [A, B1] = pair(A0, B0);
  return catchWindowAt(A, B1, wind);
}
function catchWindowAt(A: Vine, B: Vine, wind: number): number {
  const { s } = enter(A);
  let ok = 0;
  for (let k = 0; k < SPAN(); k++) {
    const r = swingStep(s, A, DT, 1, 0);
    if (share(s) <= 0.0625) continue;
    const l = timedLaunch(s, 1);
    let hit = false;
    for (const tD of [99, 0.15, 0.3, 0.45]) {
      const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
      let t = 0, used = false;
      for (let i = 0; i < 60 && !hit; i++) {
        if (!used && t >= tD) { c.vy = -PHYS.doubleV; used = true; }
        airStep(c, DT, 1);
        c.x += wind * DT;
        t += DT;
        if (canGrabSwing(c.x, c.y, B, s.t! + t)) hit = true;
      }
      if (hit) break;
    }
    if (hit) ok++;
  }
  return ok * DT;
}

/** the swing state on B when he arrives from A (the first release of A that catches B), or null */
function arriveFrom(A0: Vine, B0: Vine, wind = 0) {
  const [A, B1] = pair(A0, B0);
  const B = B1;
  const { s } = enter(A);
  for (let k = 0; k < SPAN(); k++) {
    const r = swingStep(s, A, DT, 1, 0);
    if (share(s) <= 0.25) continue;
    const l = timedLaunch(s, 1);
    const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
    for (let i = 1; i <= 60; i++) {
      airStep(c, DT, 1);
      c.x += wind * DT;
      if (canGrabSwing(c.x, c.y, B, s.t! + i * DT)) return { s: swingGrab(c, B, s.t! + i * DT), B };
    }
  }
  return null;
}

/** how many release moments (30 Hz) of a swing on B land him on `to`; the swing is entered from A, or from a jump when A is null (`wind` as in catchWindow) */
export function landWindow(A: Vine | null, B0: Vine, to: Platform, wind = 0): number {
  const got = A ? arriveFrom(A, B0, wind) : { s: enter(B0).s, B: B0 };
  if (!got) return -1;
  const { s: sb, B } = got;
  let ok = 0;
  for (let k = 0; k < SPAN(); k++) {
    const r = swingStep(sb, B, DT, 1, 0);
    if (share(sb) <= 0.0625) continue;
    const l = timedLaunch(sb, 1);
    let landed = false;
    for (const tD of [99, 0.2, 0.4]) {
      const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
      let t = 0, used = false;
      for (let i = 0; i < 90; i++) {
        if (!used && t >= tD) { c.vy = -PHYS.doubleV; used = true; }
        const prevY = c.y;
        airStep(c, DT, 1);
        c.x += wind * DT;
        t += DT;
        if (c.vy >= 0 && prevY <= to.y + 14 && c.y >= to.y && c.x > to.x + 10 && c.x < to.x + to.width) { landed = true; break; }
        if (c.y > 900) break;
      }
      if (landed) break;
    }
    if (landed) ok++;
  }
  return ok;
}

/**
 * The let-go most players make: the moment the swing passes forward through `at` (sin of the angle). Does it catch B both when they
 * just let go and when they add the second jump on the way? (A next vine hung too low is flown clean over by an early, high leap.)
 */
export function earlyCatch(A0: Vine, B0: Vine, at = 0.5, wind = 0): boolean {
  const [A, B1] = pair(A0, B0);
  return earlyCatchAt(A, B1, at, wind);
}
function earlyCatchAt(A: Vine, B: Vine, at: number, wind: number): boolean {
  const { s } = enter(A);
  for (let k = 0; k < SPAN(); k++) {
    const r = swingStep(s, A, DT, 1, 0);
    if (share(s) < Math.asin(at) / 0.8 || s.omega <= 0) continue;
    const l = timedLaunch(s, 1);
    for (const tD of [99, 0.3]) {
      const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
      let t = 0, used = false, hit = false;
      for (let i = 0; i < 60 && !hit; i++) {
        if (!used && t >= tD) { c.vy = -PHYS.doubleV; used = true; }
        airStep(c, DT, 1);
        c.x += wind * DT;
        t += DT;
        if (canGrabSwing(c.x, c.y, B, s.t! + t)) hit = true;
      }
      if (!hit) return false;
    }
    return true;
  }
  return false;
}

/**
 * the band of heights his feet pass through within `reach` of x = cx, over every sweet-spot leap from A that catches B (3-8 hangs a
 * thorn vine there: its bud just above the band, its reach down through it). Null when no leap catches B.
 */
export function leapBand(A0: Vine, B0: Vine, cx: number, reach: number): [number, number] | null {
  const [A, B1] = pair(A0, B0);
  return leapBandAt(A, B1, cx, reach);
}
function leapBandAt(A: Vine, B: Vine, cx: number, reach: number): [number, number] | null {
  const { s } = enter(A);
  let lo = Infinity, hi = -Infinity;
  for (let k = 0; k < Math.round(SPAN() * 150 / 90); k++) {
    const r = swingStep(s, A, DT, 1, 0);
    if (k < Math.round(SPAN() / 2) || !inSweetSpot(s, 1)) continue;
    const l = timedLaunch(s, 1);
    const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
    let a = Infinity, b = -Infinity, hit = false;
    for (let i = 1; i <= 60 && !hit; i++) {
      airStep(c, DT, 1);
      if (Math.abs(c.x - cx) < reach) { a = Math.min(a, c.y); b = Math.max(b, c.y); }
      if (canGrabSwing(c.x, c.y, B, s.t! + i * DT)) hit = true;
    }
    if (hit && a < Infinity) { lo = Math.min(lo, a); hi = Math.max(hi, b); }
  }
  return lo < Infinity ? [lo, hi] : null;
}

/**
 * A closer look than jumpGrab, for a vine that must stay out of reach: every take-off spot on the ground [x0, x1] at height `y` (2 px
 * apart), running toward the vine at full speed or standing, with the second jump at any moment or none, at 30 and 60 frames a second.
 * Does any of them come within grabbing reach of the vine? (4-4's tied-up knot vine, and the vine after it.)
 */
export function jumpReaches(x0: number, x1: number, y: number, v: Vine): boolean {
  for (const dt of [1 / 30, 1 / 60]) {
    for (let from = Math.max(x0, v.x - 420); from <= Math.min(x1, v.x + 420); from += 2) {
      const dir: -1 | 1 = v.x >= from ? 1 : -1;
      for (const run of [PHYS.maxRun, 0]) {
        for (const tD of [99, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5]) {
          const b: AirBody = { x: from, y, vx: dir * run, vy: -PHYS.jumpV };
          let t = 0, used = false;
          for (let i = 0; i < 4 / dt; i++) {
            if (!used && t >= tD) { b.vy = -PHYS.doubleV; used = true; }
            airStep(b, dt, dir);
            t += dt;
            if (canGrabSwing(b.x, b.y, v)) return true;
            if (b.y > y + 300) break;
          }
        }
      }
    }
  }
  return false;
}
