/**
 * Movement tuning for Pokey, shared by the engine and the level generator so every
 * generated jump is guaranteed reachable. Units: px, px/s, px/s^2, seconds.
 * Feel target: snappy and precise (quick start/stop, variable jump height).
 */
import { GLIDE } from './glide.ts';

export const PHYS = {
  maxRun: 285,
  groundAcc: 2600,
  groundDec: 3400,
  turnBonus: 2200,
  airAcc: 1700,
  airDec: 520,
  airStop: 1300, // letting go of the steer in mid-air: stop within a body's width, not 70 px later
  airTurn: 900,  // extra push when reversing in mid-air

  jumpV: 640,      // ground jump launch speed
  doubleV: 540,    // second jump launch speed
  cutV: 230,       // upward speed cap when jump is released early (tap = short hop)
  gravUp: 1900,
  gravDown: 2500,
  maxFall: 950,
  coyote: 0.1,
  buffer: 0.12,
  bounceV: 830,    // mushroom bounce
  treeLeapV: 600,
  treeHopV: 330,
  vineReleaseV: 560,
  hurtKnockV: 420,
} as const;

/**
 * How much extra help the early stages give, 0..1: full on stage 1-1, easing away to nothing by stage 25 (world 3-5). It is a ramp, not a switch,
 * so the game gets harder only as fast as people get better at it. `m` is the stage's number in the whole game, 1..100.
 */
export function easeAssist(m: number): number {
  return Math.max(0, Math.min(1, 1 - (m - 1) / 24));
}
/** the early-stage help, as the numbers it changes: longer to still jump after leaving a ledge, a longer memory for a jump pressed just early, a stronger second jump, and a wider landing */
export const ASSIST = {
  coyote: 0.08,
  buffer: 0.1,
  doubleJump: 0.12,
  landSide: 0.1,
  catchDrop: 6,
  /** level pieces (gaps between ledges, pits) are this much shorter on stage 1-1 */
  gaps: 0.2,
} as const;

/**
 * Keeping going in the air (touch only, see jumpHelp.ts). A thumb that lifts between the two jumps must not stop Pokey in mid-air, and a
 * jump from a standstill may lean the way he faces. `drive` is the way he is being carried (0 = none); pushing back brakes him, and
 * after that the old stop-when-you-let-go is back until the next take-off.
 */
export interface AirDrive {
  /** the way a forward push from the second jump carries him (0: nothing does, and letting go of the thumb stops him as it always did) */
  drive: -1 | 0 | 1;
  /** carried by that push rather than by the thumb: held to a gentler speed until the thumb steers */
  lean: boolean;
}
/** the forward push of a second jump is this share of his run speed */
export const LEAN_SPEED = 0.75;
export const newAirDrive = (): AirDrive => ({ drive: 0, lean: false });

/**
 * At a jump or double jump. A plain jump is exactly what it always was (nothing carries him: lift the thumb and he stops, so he can land
 * on a small platform). Only a second jump taken with nothing steering him pushes forward, the way he faces, when `lean` is allowed.
 */
export function airTakeOff(st: AirDrive, steer: -1 | 0 | 1, facing: -1 | 1, second: boolean, lean: boolean) {
  if (second && lean && steer === 0) {
    st.drive = facing;
    st.lean = true;
  } else {
    st.drive = 0;
    st.lean = false;
  }
}

/** each frame in the air: the direction to steer him this frame, given the thumb's own push (0 when it is off the glass). A thumb that steers, or ducks, takes over from the push at once. */
export function airCarry(st: AirDrive, steer: -1 | 0 | 1, down: boolean): -1 | 0 | 1 {
  if (st.drive === 0) return steer;
  if (down || steer !== 0) {
    st.drive = 0;
    st.lean = false;
    return steer;
  }
  return st.drive;
}

const apex = (v: number, g: number) => (v * v) / (2 * g);

/** Maximum rise of a single full jump (px). */
export const JUMP_RISE = apex(PHYS.jumpV, PHYS.gravUp); // ~108
/** Maximum rise of jump + double jump at apex (px). */
export const DOUBLE_RISE = JUMP_RISE + apex(PHYS.doubleV, PHYS.gravUp); // ~185
/** Airtime of a full single jump landing at the same height (s). */
export const JUMP_AIRTIME = PHYS.jumpV / PHYS.gravUp + Math.sqrt((2 * JUMP_RISE) / PHYS.gravDown);

/**
 * Conservative limits the generator keeps to (about 80% of the true maximum, so a
 * normal player has margin and does not need frame-perfect inputs).
 */
export const SAFE = {
  /** max rise to a platform with one jump */
  rise1: Math.floor(JUMP_RISE * 0.82),
  /** max rise needing a double jump */
  rise2: Math.floor(DOUBLE_RISE * 0.82),
  /** max horizontal gap on equal height with one jump */
  gap1: Math.floor(PHYS.maxRun * JUMP_AIRTIME * 0.78),
  /** max horizontal gap with a double jump */
  gap2: Math.floor(PHYS.maxRun * (JUMP_AIRTIME + 0.42) * 0.74),
  /** max drop that is always survivable and re-landable */
  drop: 420,
};

// ---------------------------------------------------------------------------
// Shared simulation helpers. The engine and the level validator both use these,
// so a level that validates is a level the real game lets you finish.
// ---------------------------------------------------------------------------

/** The game now simulates at a fixed 60 Hz; 30 is still checked so levels stay passable at either step. */
export const SIM_DTS = [1 / 30, 1 / 60] as const;

/**
 * How far BEFORE the edge a player may have to take off for any required jump, at the very least (px). A gap that needs the
 * jump to start within a few pixels of the edge is a gap players fall into; every gap the generator builds or the validator
 * accepts leaves at least this much room.
 */
export const TAKEOFF_SLACK = 70;

/** Player half-width used for landing on platforms (0.48 * 44). */
export const LAND_HALF = 21;

export interface AirBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

/** One airborne tick, in the same order the engine does it (steer, gravity, move). */
export function airStep(b: AirBody, dt: number, dir: -1 | 0 | 1, hold = false) {
  if (dir !== 0) {
    if (dir * b.vx < PHYS.maxRun) {
      b.vx += dir * PHYS.airAcc * dt;
      if (dir * b.vx > PHYS.maxRun) b.vx = dir * PHYS.maxRun;
    } else {
      b.vx -= dir * PHYS.airDec * dt;
    }
  } else {
    const dec = PHYS.airDec * dt;
    if (Math.abs(b.vx) <= dec) b.vx = 0;
    else b.vx -= Math.sign(b.vx) * dec;
  }
  let g = b.vy < 0 ? PHYS.gravUp : PHYS.gravDown;
  if (hold && Math.abs(b.vy) < 90) g *= 0.72;
  b.vy += g * dt;
  if (b.vy > PHYS.maxFall) b.vy = PHYS.maxFall;
  b.x += b.vx * dt;
  b.y += b.vy * dt;
}

export interface FlightOpts {
  /** launch speed (positive = up) */
  v0: number;
  /** horizontal speed at launch */
  vx: number;
  /** allow one double jump at the best moment */
  dbl: boolean;
  dt: number;
  /** open the leaf on the way down (glide.ts), as the engine does while Jump is held */
  glide?: boolean;
}

/**
 * Memo of flight reaches. One table per (launch speed, run speed, double jump, tick): a typed array indexed by the height difference
 * in 2 px steps (a plain number lookup: the validator asks tens of thousands of times per stage, and string keys were its biggest
 * cost). Every height is simulated at the middle of its 2 px step, so the same height always gets the same reach whatever was asked
 * before it (the old memo let the first height that fell in a step decide, which made a layout depend on what had been generated
 * earlier in the session).
 */
const REACH_OFFSET = 4096;
const REACH_SIZE = REACH_OFFSET * 2 + 1;
interface ReachTable { v0: number; vx: number; dbl: boolean; dt: number; glide: boolean; vals: Float64Array; far: Map<number, number> }
const reachTables: ReachTable[] = [];

function reachTable(v0: number, vx: number, dbl: boolean, dt: number, glide = false): ReachTable {
  for (let i = 0; i < reachTables.length; i++) {
    const t = reachTables[i];
    if (t.v0 === v0 && t.vx === vx && t.dbl === dbl && t.dt === dt && t.glide === glide) return t;
  }
  const t: ReachTable = { v0, vx, dbl, dt, glide, vals: new Float64Array(REACH_SIZE).fill(NaN), far: new Map() };
  reachTables.push(t);
  return t;
}

/** the value for this height difference, simulating it the first time a 2 px step is asked for */
function reachAt(t: ReachTable, dy: number): number {
  const step = Math.round(dy / 2);
  const i = step + REACH_OFFSET;
  if (i >= 0 && i < REACH_SIZE) {
    const hit = t.vals[i];
    if (hit === hit) return hit;
    const v = simulateReach(step * 2, t.v0, t.vx, t.dbl, t.dt, t.glide);
    t.vals[i] = v;
    return v;
  }
  const hit = t.far.get(step);
  if (hit !== undefined) return hit;
  const v = simulateReach(step * 2, t.v0, t.vx, t.dbl, t.dt, t.glide);
  t.far.set(step, v);
  return v;
}

/**
 * Furthest horizontal distance covered by the time the feet come down through a
 * surface `dy` px above the launch point (negative dy = a drop). -1 if the
 * surface is never reached. Pure number crunching, memoised.
 */
export function flightReach(dy: number, o: FlightOpts): number {
  return reachAt(reachTable(o.v0, o.vx, o.dbl, o.dt, !!o.glide), dy);
}

function simulateReach(dy: number, v0: number, vx: number, dbl: boolean, dt: number, glide = false): number {
  const o: FlightOpts = { v0, vx, dbl, dt, glide };
  const target = -dy;
  const tries = o.dbl ? Array.from({ length: 36 }, (_, i) => i * o.dt * (1 / 30 / o.dt)) : [-1];
  let best = -1;
  for (const tD of tries) {
    const b: AirBody = { x: 0, y: 0, vx: o.vx, vy: -o.v0 };
    let t = 0;
    let doubled = !o.dbl;
    // the leaf: the same rules as the engine (glide.ts), with Jump held the whole way down
    let fallT = 0;
    let left: number = GLIDE.maxTime;
    for (let i = 0; i < 600; i++) {
      if (!doubled && t >= tD - 1e-9) {
        b.vy = -PHYS.doubleV;
        doubled = true;
      }
      const prev = b.y;
      if (glide) {
        // airStep's steer and gravity, then the leaf's brake, then the move (the engine's order)
        const x0 = b.x, y0 = b.y;
        airStep(b, o.dt, 1, false);
        b.x = x0;
        b.y = y0;
        if (b.vy <= -GLIDE.refillUp) left = GLIDE.maxTime;
        fallT = b.vy > GLIDE.minFall ? fallT + o.dt : 0;
        if (fallT >= GLIDE.onset && left > 0) {
          left = Math.max(0, left - o.dt);
          if (b.vy > GLIDE.fallSpeed) b.vy = Math.max(GLIDE.fallSpeed, b.vy - GLIDE.brake * o.dt);
        }
        b.x += b.vx * o.dt;
        b.y += b.vy * o.dt;
      } else airStep(b, o.dt, 1, false);
      t += o.dt;
      if (b.vy >= 0 && prev <= target + 14 && b.y >= target) {
        if (b.x > best) best = b.x;
        break;
      }
      if (b.y > target + 400) break;
    }
  }
  return best;
}

const dropReachCache = new Map<number, number>();

/**
 * An upper bound on how far any jump, double jump or mushroom bounce can carry the player horizontally when it lands up to `maxDrop`
 * px below the take-off (or anywhere higher). The validator uses it to skip platform pairs that are too far apart to ever join. It
 * simulates on its own and never touches the memo above, so asking for it changes no other result.
 */
export function maxDropReach(maxDrop: number): number {
  const key = Math.ceil(Math.max(0, maxDrop) / 80);
  const hit = dropReachCache.get(key);
  if (hit !== undefined) return hit;
  let best = 0;
  // (reach grows with the drop by well under 0.35 px per px, so sampling every 80 px and adding 32 px of margin covers the gaps between samples)
  for (let d = 0; d <= key + 1; d++) {
    for (const dt of SIM_DTS) {
      for (const dbl of [false, true]) {
        best = Math.max(best, simulateReach(-d * 80, PHYS.jumpV, PHYS.maxRun, dbl, dt), simulateReach(-d * 80, PHYS.bounceV, PHYS.maxRun, dbl, dt));
      }
    }
  }
  best += 32;
  dropReachCache.set(key, best);
  return best;
}

/** Worst case over both tick rates. */
export function reachMin(dy: number, v0: number, vx: number, dbl: boolean): number {
  let m = Infinity;
  for (let i = 0; i < SIM_DTS.length; i++) m = Math.min(m, reachAt(reachTable(v0, vx, dbl, SIM_DTS[i]), dy));
  return m;
}

/** Worst case over both tick rates, gliding down on the leaf (Leaf Glide, from the stage that guarantees it). */
export function reachMinGlide(dy: number, v0: number, dbl: boolean): number {
  let m = Infinity;
  for (let i = 0; i < SIM_DTS.length; i++) m = Math.min(m, reachAt(reachTable(v0, PHYS.maxRun, dbl, SIM_DTS[i], true), dy));
  return m;
}
/** Max horizontal gap for a jump or double jump with the leaf open on the way down. dy > 0 = target is higher. */
export const reachGlide = (dy: number, dbl: boolean) => reachMinGlide(dy, PHYS.jumpV, dbl);
export const reachBounceGlide = (dy: number, dbl: boolean) => reachMinGlide(dy, PHYS.bounceV, dbl);

/** Max horizontal gap for a normal jump / double jump / mushroom bounce. dy > 0 = target is higher. */
export const reachJump = (dy: number, dbl: boolean) => reachMin(dy, PHYS.jumpV, PHYS.maxRun, dbl);
export const reachBounce = (dy: number, dbl: boolean) => reachMin(dy, PHYS.bounceV, PHYS.maxRun, dbl);

// ---- Swinging lianas -------------------------------------------------------

export const SWING = {
  g: 1600,
  steer: 4.8,
  damp: 0.993, // per 1/60 s
  maxAngle: 1.18,
  minLen: 80,
  /** px/s he climbs up or slides down a swinging vine while up or down is held */
  climb: 150,
  grabX: 48,
  leapMin: 340,
  leapMax: 520,
  leapVyMin: -760,
} as const;

export interface SwingVine {
  x: number;
  topY: number;
  bottomY: number;
}

export interface SwingState {
  angle: number;
  omega: number;
  len: number;
}

/** Can a body at (x, y) grab this liana? */
export function canGrabSwing(x: number, y: number, v: SwingVine): boolean {
  return Math.abs(x - v.x) < TIMED.grabX && y >= v.topY - 15 && y <= v.bottomY + 30;
}

/** Start swinging from the body's actual position and velocity (no teleport). */
export function swingGrab(b: AirBody, v: SwingVine): SwingState {
  const dx = b.x - v.x;
  const dy = Math.max(b.y - v.topY, SWING.minLen * 0.6);
  const len = Math.max(SWING.minLen, Math.min(v.bottomY - v.topY - 10, Math.hypot(dx, dy)));
  const angle = Math.max(-SWING.maxAngle, Math.min(SWING.maxAngle, Math.atan2(dx, dy)));
  const omega = (b.vx * Math.cos(angle) - b.vy * Math.sin(angle)) / len;
  return { angle, omega, len };
}

/**
 * The timed swing (Matt, 2026-10-24): a vine swings by itself, at the same height and the same rhythm every time, and the only thing
 * the player decides is WHEN to let go. Holding a direction no longer pumps it and sliding up no longer shortens it (together they let
 * Pokey whip himself almost to the top of the screen). `TIMED` holds the numbers; Easy (difficulty.ts) widens the sweet spot and slows
 * the rhythm a little. Pure and shared by the engine, the stage builder and the reachability checks, so they always agree.
 */
export const TIMED = {
  /** seconds for one full swing there and back, whatever the vine's length */
  period: 1.9,
  /** how far the swing goes either side of hanging straight down (radians, about 46 degrees) */
  amp: 0.8,
  /** how fast a grab that is too small or too big settles to `amp` (rad/s^2 of push, and the share of speed taken off per second) */
  settle: 3.2,
  trim: 2.5,
  /** the sweet spot: moving toward the next vine, between these angles past straight down (radians; negative = still behind it) */
  sweetFrom: -0.12,
  sweetTo: 0.72,
  /** how close (px) a flying body's hands must come to a vine to catch it */
  grabX: 60,
};

/** Easy or Normal for the swing: called by the engine when a stage starts (and by the tests) */
export function setTimedSwing(easy: boolean) {
  TIMED.period = easy ? 2.2 : 1.9;
  TIMED.sweetFrom = easy ? -0.32 : -0.12;
  TIMED.sweetTo = easy ? 0.95 : 0.72;
  TIMED.grabX = easy ? 76 : 60;
}

/** how big a swing is (radians either side) from where it is and how fast it moves, on the timed rhythm */
export function timedAmp(angle: number, omega: number): number {
  const w = (2 * Math.PI) / TIMED.period;
  const c = 1 - Math.cos(angle) + (omega * omega) / (2 * w * w);
  return Math.acos(Math.max(-1, Math.min(1, 1 - c)));
}

/**
 * One step of a swing. `steer` is only a hint for which way to start a swing from a dead hang (the way he faces); `climb` is ignored:
 * the vine keeps the length it was grabbed at.
 */
export function swingStep(s: SwingState, v: SwingVine, dt: number, steer: -1 | 0 | 1, climb: -1 | 0 | 1 = 0) {
  const w = (2 * Math.PI) / TIMED.period;
  s.omega += -w * w * Math.sin(s.angle) * dt;
  const amp = timedAmp(s.angle, s.omega);
  if (amp < TIMED.amp - 0.01) {
    const dir = Math.abs(s.omega) > 0.05 ? Math.sign(s.omega) : steer || 1;
    s.omega += dir * TIMED.settle * dt;
  } else if (amp > TIMED.amp + 0.02) {
    s.omega *= 1 - Math.min(0.5, TIMED.trim * dt);
  }
  s.angle = Math.max(-1.05, Math.min(1.05, s.angle + s.omega * dt));
  // straight up or down on a vine always climbs it (a stage rule): up shortens his hold, down lets him slide lower. The timed swing
  // keeps its rhythm at any length, so climbing never spoils the sweet spot (lost in the timed swing of 2026-10-24, restored 10-25)
  s.len += climb * SWING.climb * dt;
  s.len = Math.max(SWING.minLen, Math.min(v.bottomY - v.topY, s.len));
  const tang = s.omega * s.len;
  return {
    x: v.x + Math.sin(s.angle) * s.len,
    y: v.topY + Math.cos(s.angle) * s.len,
    vx: Math.cos(s.angle) * tang,
    vy: -Math.sin(s.angle) * tang,
  };
}

/** is this the moment to let go toward `dir`? (moving that way, between just behind straight down and most of the way up the front) */
export function inSweetSpot(s: SwingState, dir: -1 | 1): boolean {
  const moving = Math.sign(s.omega) === dir && Math.abs(s.omega) > 0.2;
  const a = s.angle * dir;
  return moving && a >= TIMED.sweetFrom && a <= TIMED.sweetTo;
}

/**
 * Letting go. In the sweet spot it is the old Tarzan leap toward `dir` (forward and up, enough to reach the next vine). Anywhere else he
 * simply flies off the way the vine was carrying him, with a small hop: on the backswing he goes backward, at the top he drops.
 */
export function timedLaunch(s: SwingState, dir: -1 | 1): { vx: number; vy: number; sweet: boolean } {
  const tang = s.omega * s.len;
  const vx = Math.cos(s.angle) * tang;
  const vy = -Math.sin(s.angle) * tang;
  if (inSweetSpot(s, dir)) {
    const l = tarzanLaunch(vx, vy, dir);
    return { ...l, sweet: true };
  }
  // anywhere else he only lets go: a small hop off the vine with part of its speed, never a fling up the screen or back the way he came
  return { vx: Math.max(-300, Math.min(300, vx * 0.6)), vy: Math.max(vy * 0.6, -260) - 120, sweet: false };
}

/**
 * Forgiveness for letting go (2026-10-25). Testers let go at the FORWARD END of the swing, the natural moment, which is just past the
 * sweet spot: they dropped almost straight down, or kept swinging. So:
 *  - `late`: a press up to this long after the sweet spot ended, while he is still well out in front, is the leap the sweet spot gave;
 *  - `early`: a press while he swings forward but has not reached it yet waits (this long at most) and leaps when he gets there.
 */
export const RELEASE = { late: 0.36, early: 0.32, lateFrom: 0.3, earlyFrom: -0.7 };

/**
 * what a press to let go toward `dir` does now: 'sweet' (leap), 'late' (leap as from the sweet spot just passed), 'early' (hold the press
 * until the sweet spot) or 'now' (let go as he is: a hop off the way the vine carries him). `sinceSweet` is how long ago the swing was
 * last in its sweet spot for `dir` (Infinity if not this swing).
 */
export function releaseCall(s: SwingState, dir: -1 | 1, sinceSweet: number): 'sweet' | 'late' | 'early' | 'now' {
  if (inSweetSpot(s, dir)) return 'sweet';
  const a = s.angle * dir;
  if (sinceSweet <= RELEASE.late && a >= RELEASE.lateFrom) return 'late';
  if (Math.sign(s.omega) === dir && a >= RELEASE.earlyFrom && a < TIMED.sweetFrom) return 'early';
  return 'now';
}

/** Velocity after letting go with a jump ("Tarzan leap"). */
export function tarzanLaunch(vx: number, vy: number, dir: -1 | 1) {
  const speed = Math.max(SWING.leapMin, Math.min(SWING.leapMax, Math.abs(vx) * 1.15 + 120));
  return {
    vx: dir * speed,
    vy: Math.max(SWING.leapVyMin, Math.min(-PHYS.vineReleaseV, vy - 300)),
  };
}

/** which way a hit knocks him: away from where it came from (`fromX`), or back the way he faces when that is not known */
export function knockDir(px: number, facing: -1 | 1, fromX?: number): -1 | 1 {
  if (fromX === undefined || !Number.isFinite(fromX) || Math.abs(px - fromX) < 1) return (facing === 1 ? -1 : 1);
  return px > fromX ? 1 : -1;
}
