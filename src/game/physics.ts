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
  bounceV: 830,    // mushroom bounce
  treeLeapV: 600,
  treeHopV: 330,
  vineReleaseV: 560,
  hurtKnockV: 420,
} as const;

/**
 * Jump forgiveness for 30 fps touch, by difficulty, on every stage (Matt's Gemini research, reference/GEMINI-PCG-RESEARCH.md part 3,
 * and reference/GEMINI-LEDGER.md G1-G4; Matt 2026-10-28: "people may not be able to jump short, do long jumps"). Timed in seconds of
 * game time, never frames, so a dropped frame eats none of it. The early-stage help (ASSIST) still adds on top on the first stages.
 *   coyote:  he may still jump this long after walking off a ledge (s)
 *   buffer:  a jump pressed this long before he lands fires as he lands (s); the touch input keeps a press as long, plus a frame
 *   landPx:  a falling foot that misses an edge by up to this much lands on it, nudged on (px)
 *   mantle:  the lip's hoist takes him onto a face whose top is up to this far over his feet (px); generous already, so unchanged
 */
export const FORGIVE = {
  normal: { coyote: 0.133, buffer: 0.133, landPx: 8, mantle: 26 },
  easy: { coyote: 0.167, buffer: 0.2, landPx: 12, mantle: 26 },
} as const;
export type Forgive = (typeof FORGIVE)['normal' | 'easy'];

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

/**
 * The second jump's launch speed (px/s, up is negative), given his speed now and the second jump's own (`v2`, positive). It adds its
 * height to what the first jump still had in it, so a double flick climbs the same however quickly the second flick follows the first.
 * It used to REPLACE his speed, so a second flick 70 ms after the first (still rising at 510 px/s) threw away nearly all of the first
 * jump and the pair rose 104 px, against 165 for one a third of a second later: a tall stump one double flick cleared, the next
 * (thumbed a little quicker) did not (QA, World 5, v198, 2026-10-26). Rising, the two add as energies (v^2 + v2^2), which tops out at
 * exactly the height a second jump at the first's peak reaches (DOUBLE_RISE), and gets there sooner, so no gap is crossed that was not
 * before. Falling, it is the second jump's own speed, as it always was.
 */
export function secondJumpV(vy: number, v2: number): number {
  return vy < 0 ? -Math.hypot(vy, v2) : -v2;
}

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
/**
 * Easy's jump: a thumb that lets go early (a ~70% hold, Matt's Gemini research G8: "no Easy gap may need a full hold"). Modelled as a
 * launch that rises `share` of a full jump's height (the engine's early release caps the rise the same way, PHYS.cutV); the second jump
 * is as it is.
 */
export const EASY_HOLD = 0.7;
export const reachJumpHeld = (dy: number, dbl: boolean, share = EASY_HOLD) => reachMin(dy, Math.round(PHYS.jumpV * Math.sqrt(share)), PHYS.maxRun, dbl);

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
  /** this vine's own swing (the self-swing, below): radians either side; 0 hangs still. Default `TIMED.amp`; the stage fits it (swingSetup) */
  swingAmp?: number;
  /** seconds for one swing there and back. Default `TIMED.period` (Normal 2.85, Easy 3.3) */
  swingPeriod?: number;
  /** where in its swing it is at clock 0, as a share of a period (0..1). Default 0; the stage sets it (swingSetup) */
  swingPhase?: number;
}

export interface SwingState {
  angle: number;
  omega: number;
  len: number;
  /**
   * the vine's swing clock (seconds) at this state. A state made without one (a test's or a check's "he is here, moving this way")
   * takes the moment of the vine's swing that matches it on its first step (swingClockAt).
   */
  t?: number;
  /** the vine's swing, radians either side (what the sweet spot and the let-go are measured against); `TIMED.amp` when not known */
  amp?: number;
}

/**
 * Can a body at (x, y) grab this liana? At clock `t` the vine hangs at its swing's angle there, and he catches it within `TIMED.grabX` of
 * the line it makes; with no clock it is the line it swings through hanging straight down (the checks' "a jump timed for the vine":
 * a ledge jump can always wait for the vine to come past).
 */
export function canGrabSwing(x: number, y: number, v: SwingVine, t?: number): boolean {
  const a = t === undefined ? 0 : vineAngle(v, t);
  if (a === 0) return Math.abs(x - v.x) < TIMED.grabX && y >= v.topY - 15 && y <= v.bottomY + 30;
  const dx = x - v.x;
  const dy = y - v.topY;
  const along = dx * Math.sin(a) + dy * Math.cos(a);
  const across = dx * Math.cos(a) - dy * Math.sin(a);
  return Math.abs(across) < TIMED.grabX && along >= -15 && along <= v.bottomY - v.topY + 30;
}

/**
 * Catch a liana. With the vine's clock `t` (the engine's), he takes hold of it where it is: the vine is never pulled about by the catch,
 * his hands go onto it at his height. With no clock (the checks, the tests), the vine is taken to be where he meets it, moving the way he
 * moves (a jump timed for the vine).
 */
export function swingGrab(b: AirBody, v: SwingVine, t?: number): SwingState {
  const dx = b.x - v.x;
  const dy = Math.max(b.y - v.topY, SWING.minLen * 0.6);
  const most = Math.max(SWING.minLen, v.bottomY - v.topY - 10);
  if (t !== undefined) {
    const angle = vineAngle(v, t);
    const along = dx * Math.sin(angle) + dy * Math.cos(angle);
    return { angle, omega: vineOmega(v, t), len: Math.max(SWING.minLen, Math.min(most, along)), t, amp: vineAmp(v) };
  }
  const len = Math.max(SWING.minLen, Math.min(most, Math.hypot(dx, dy)));
  const amp = vineAmp(v);
  const angle = Math.max(-amp, Math.min(amp, Math.atan2(dx, dy)));
  const omega = (b.vx * Math.cos(angle) - b.vy * Math.sin(angle)) / len;
  const at = swingClockAt(v, angle, omega);
  return { angle: vineAngle(v, at), omega: vineOmega(v, at), len, t: at, amp };
}

/**
 * The self-swing (Matt, 2026-10-28, a hotfix after an iPhone tester's "the vines swing wildly"; Donkey Kong Country's ropes): every
 * swinging vine swings on its own, all the time, with or without him on it: a fixed swing (`swingAmp` either side, one `swingPeriod`
 * there and back) worked out from the game's clock, never pushed by forces, so no frame rate, stall or thumb can change it. On it, up and
 * down climb (his grip moves along the vine, the swing does not change), left and right only turn him the way he will leap, and the one
 * choice is when to let go: he leaves with the vine's speed at his grip (the leap, timedLaunch).
 * `TIMED` holds the default numbers; Easy (difficulty.ts) widens the sweet spot and slows the rhythm a little. Pure and shared by the
 * engine, the stage builders and the reach checks, so they always agree.
 */
export const TIMED = {
  /**
   * seconds for one full swing there and back, whatever the vine's length. Matt (2026-10-28, after the first preview): slower, about
   * one and a half times the old 1.9 s
   */
  period: 2.85,
  /**
   * the most a vine swings either side of hanging straight down (radians, about 26 degrees; Matt: calmer, it was 0.8). A vine whose
   * neighbour hangs close swings less, so their swings never meet (swingSetup)
   */
  amp: 0.45,
  /**
   * the sweet spot: moving toward the next vine, between these shares of the vine's swing past straight down (negative = still behind
   * it; 1 = the front of the swing)
   */
  sweetFrom: -0.15,
  sweetTo: 0.9,
  /** how close (px) a flying body's hands must come to a vine to catch it */
  grabX: 60,
};

/** Easy or Normal for the swing: called by the engine when a stage starts (and by the tests) */
export function setTimedSwing(easy: boolean) {
  TIMED.period = easy ? 3.3 : 2.85;
  TIMED.sweetFrom = easy ? -0.4 : -0.15;
  TIMED.sweetTo = easy ? 1.2 : 0.9;
  TIMED.grabX = easy ? 76 : 60;
}

export const vineAmp = (v: SwingVine): number => v.swingAmp ?? TIMED.amp;
export const vinePeriod = (v: SwingVine): number => v.swingPeriod ?? TIMED.period;
/** the vine's angle (radians, + = its foot out to the right) at swing clock `t` */
export function vineAngle(v: SwingVine, t: number): number {
  const a = vineAmp(v);
  return a === 0 ? 0 : a * Math.sin(2 * Math.PI * (t / vinePeriod(v) + (v.swingPhase ?? 0)));
}
/** how fast it turns (rad/s) at swing clock `t` */
export function vineOmega(v: SwingVine, t: number): number {
  const T = vinePeriod(v);
  return vineAmp(v) * ((2 * Math.PI) / T) * Math.cos(2 * Math.PI * (t / T + (v.swingPhase ?? 0)));
}
/** the swing clock (0 .. one period) at which the vine is at `angle`, turning the way `omega` turns (+ when it is still) */
export function swingClockAt(v: SwingVine, angle: number, omega: number): number {
  const a = vineAmp(v);
  const T = vinePeriod(v);
  const s = a === 0 ? 0 : Math.asin(Math.max(-1, Math.min(1, angle / a)));
  const ph = omega >= 0 ? s : Math.PI - s;
  const u = ph / (2 * Math.PI) - (v.swingPhase ?? 0);
  return (((u % 1) + 1) % 1) * T;
}

/** two lianas a leap apart (the next one to the right, within this far and this much higher or lower at the top) are a chain */
export const CHAIN = { dx: 560, dTop: 200 };
export const isChain = (A: SwingVine, B: SwingVine) => B.x > A.x && B.x - A.x < CHAIN.dx && Math.abs(B.topY - A.topY) < CHAIN.dTop;

/**
 * Neighbouring swings never meet (Matt, 2026-10-28): how far (px) Pokey's body reaches either side of the vine he hangs on, and the gap
 * kept between his body at the front of one vine's swing and the next vine at the back of its own.
 */
export const SWING_CLEAR = { body: 30, margin: 20 };
/** how far a vine's foot swings out either side (px) */
export const swingReach = (v: SwingVine): number => (v.bottomY - v.topY) * Math.sin(vineAmp(v));
/** do two vines hang side by side (their heights overlap), so that their swings could meet? */
const sideBySide = (a: SwingVine, b: SwingVine) => a.topY < b.bottomY + 40 && b.topY < a.bottomY + 40;
/** the clear space (px) between the two vines' swings, with Pokey hanging at the front of either: 0 or more is apart */
export function swingClearance(a: SwingVine, b: SwingVine): number {
  return Math.abs(b.x - a.x) - swingReach(a) - swingReach(b) - SWING_CLEAR.body - SWING_CLEAR.margin;
}

/**
 * Each swinging vine's own swing, for a stage (only what an author has not set). Its size: the most it can swing (`TIMED.amp`) or less,
 * so that it takes at most half the clear space to each neighbour hanging beside it and their swings never meet, at any moment of either
 * (swingClearance). Its place in the swing: the next liana of a chain swings `chainPhase` of a swing ahead of the one before it (the
 * offset that gives the widest moment to leap across, never in step with it), any other a golden share of a swing on from the one before,
 * so a row of vines never moves as one. Deterministic from the stage and its roll. Climbing vines hang still. Called by the engine when
 * a stage starts (and by the test harness and the checks).
 */
export function swingSetup(vines: Array<SwingVine & { vineType?: string }>) {
  const sw = vines.filter((v) => v.vineType !== 'tree_climb').sort((a, b) => a.x - b.x || a.topY - b.topY);
  for (const v of sw) {
    if (v.swingAmp !== undefined) continue;
    const L = Math.max(1, v.bottomY - v.topY);
    let room = L * Math.sin(TIMED.amp);
    for (const w of sw) {
      if (w === v || !sideBySide(v, w)) continue;
      room = Math.min(room, (Math.abs(w.x - v.x) - SWING_CLEAR.body - SWING_CLEAR.margin) / 2);
    }
    v.swingAmp = room <= 0 ? 0 : Math.min(TIMED.amp, Math.asin(Math.min(1, room / L)));
  }
  sw.forEach((v, i) => {
    if (v.swingPhase !== undefined) return;
    const A = i > 0 ? sw[i - 1] : undefined;
    const base = A?.swingPhase ?? 0;
    v.swingPhase = A && isChain(A, v) ? (base + chainPhase(A, v)) % 1 : (base + 0.618034) % 1;
  });
}

/** the moments of a vine's swing a check tries the next vine at (any phase a stage can give it) */
export const PHASES = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
/** B as it swings relative to A with B `d` of a swing ahead (the checks try every one) */
export const phased = <V extends SwingVine>(A: SwingVine, B: V, d: number): V => ({ ...B, swingPhase: (A.swingPhase ?? 0) + d });

/** how big a swing is (radians either side) from where it is and how fast it moves, on the timed rhythm */
export function timedAmp(angle: number, omega: number): number {
  const w = (2 * Math.PI) / TIMED.period;
  const c = 1 - Math.cos(angle) + (omega * omega) / (2 * w * w);
  return Math.acos(Math.max(-1, Math.min(1, 1 - c)));
}

/**
 * One step of a swing: the vine's clock moves on `dt` and the vine is where its self-swing puts it then (nothing he does changes it).
 * `steer` is not used (left and right only turn him); `climb` moves his grip along it: up (-1) shortens his hold, down (+1) lets him
 * slide lower (straight up or down on a vine always climbs it, a stage rule).
 */
export function swingStep(s: SwingState, v: SwingVine, dt: number, steer: -1 | 0 | 1, climb: -1 | 0 | 1 = 0) {
  void steer;
  if (s.t === undefined) s.t = swingClockAt(v, s.angle, s.omega);
  s.t += dt;
  s.angle = vineAngle(v, s.t);
  s.omega = vineOmega(v, s.t);
  s.amp = vineAmp(v);
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

/**
 * The automatic landing from a swing (engine.ts NATURAL SWING EXIT 3), checked while his feet are over a platform on the way down. Does
 * it set him down on it? Only when he plausibly wants off. On 1-6, climbing down a liana lowered his feet past the corner of the raised
 * ledge beside it, and it set him down there in the middle of a pump, which players read as the vine letting go (QA, 2026-10-26). So:
 *  - a platform under the vine's hanging point, his feet within 14 px of its top (he climbed down onto it, and they would otherwise
 *    sink into it): 'land', as before;
 *  - a ledge out to one side: when he holds down and toward it together for `heldS`, from up to `reach` px above its top ('step' when he is above
 *    it: he steps off and drops onto it); or with his thumb off the steering for `idleS`, his feet within 14 px, near the end of the
 *    swing's stroke (`apexOmega`), where the swing slows and turns.
 * A sideways steer on its own is never getting off: a thumb pumping the swing holds toward the ledge for half of every stroke, and the
 * first version, which stepped off on a steer toward it, stepped QA's pumping bot off at the first pump after a climb down (v192).
 * `dy`: his feet below the platform's top (px; negative = above it).
 */
export const SWING_LAND = {
  /** slower than this share of the swing's top speed (at the bottom) is the end of a stroke */
  apexShare: 0.38,
  /** px above a ledge's top that holding down and toward it steps off onto it */
  reach: 40,
  /** seconds with no steer held before a hands-off landing (a pumping thumb passes through no steer between strokes) */
  idleS: 0.3,
  /**
   * seconds down and the same sideways steer must be held together, against the swing's motion, to get off that way: a thumb pumping
   * the swing turns round with it every stroke (a beat late at most, about a third of a second), and its count starts again
   */
  heldS: 0.5,
};
export interface SwingHands {
  /** the sideways steer held */
  steer: -1 | 0 | 1;
  /** down is held (climbing down) */
  down: boolean;
  /** seconds since a sideways steer was last held */
  idle: number;
  /** seconds down and this same steer have been held together against the swing (engine.ts swingDownHeld) */
  held: number;
}
export function swingLanding(
  s: { angle: number; omega: number; amp?: number },
  vineX: number,
  plat: { x: number; width: number },
  hands: SwingHands,
  dy: number,
): 'land' | 'step' | null {
  if (dy >= 14) return null;
  if (vineX >= plat.x - 10 && vineX <= plat.x + plat.width + 10) return dy > -14 ? 'land' : null;
  const side = plat.x + plat.width / 2 < vineX ? -1 : 1;
  if (hands.steer === side && hands.down && hands.held >= SWING_LAND.heldS) return dy > -14 ? 'land' : dy > -SWING_LAND.reach ? 'step' : null;
  if (hands.steer !== 0 || hands.idle < SWING_LAND.idleS) return null;
  const top = (s.amp ?? TIMED.amp) * ((2 * Math.PI) / TIMED.period);
  return dy > -14 && Math.abs(s.omega) < SWING_LAND.apexShare * top ? 'land' : null;
}

/** is this the moment to let go toward `dir`? (moving that way, between just behind straight down and most of the way up the front) */
export function inSweetSpot(s: SwingState, dir: -1 | 1): boolean {
  const amp = s.amp ?? TIMED.amp;
  // (a vine hanging still, its neighbours too close for it to swing: any moment is the moment)
  if (amp < 0.05) return true;
  const top = amp * ((2 * Math.PI) / TIMED.period);
  const moving = Math.sign(s.omega) === dir && Math.abs(s.omega) > 0.075 * top;
  const a = (s.angle * dir) / amp;
  return moving && a >= TIMED.sweetFrom && a <= TIMED.sweetTo;
}

/**
 * Letting go. In the sweet spot it is the old Tarzan leap toward `dir` (forward and up, enough to reach the next vine). Anywhere else he
 * simply flies off the way the vine was carrying him, with a small hop: on the backswing he goes backward, at the top he drops.
 * `leaned`: the flick that let go leaned toward `dir` (touchGestures.ts leanSlant). Then, out of the sweet spot, he still hops that way
 * (at least `LEAN_HOP`), never the way the vine was going against the flick: a flick up and left on a swing going right flew him right
 * (QA, 1-6 v192).
 */
export const LEAN_HOP = 130;
export function timedLaunch(s: SwingState, dir: -1 | 1, leaned = false): { vx: number; vy: number; sweet: boolean } {
  const tang = s.omega * s.len;
  const vx = Math.cos(s.angle) * tang;
  const vy = -Math.sin(s.angle) * tang;
  if (inSweetSpot(s, dir)) {
    const l = tarzanLaunch(vx, vy, dir);
    return { ...l, sweet: true };
  }
  // anywhere else he only lets go: a small hop off the vine with part of its speed, never a fling up the screen or back the way he came
  const hopVx = leaned ? dir * Math.min(300, Math.max(LEAN_HOP, dir * vx * 0.6)) : Math.max(-300, Math.min(300, vx * 0.6));
  return { vx: hopVx, vy: Math.max(vy * 0.6, -260) - 120, sweet: false };
}

/**
 * Forgiveness for letting go (2026-10-25). Testers let go at the FORWARD END of the swing, the natural moment, which is just past the
 * sweet spot: they dropped almost straight down, or kept swinging. So:
 *  - `late`: a press up to this long after the sweet spot ended, while he is still well out in front, is the leap the sweet spot gave;
 *  - `early`: a press while he swings forward but has not reached it yet waits (this long at most) and leaps when he gets there.
 */
export const RELEASE = { late: 0.36, early: 0.32, lateFrom: 0.375, earlyFrom: -0.875 };

/**
 * what a press to let go toward `dir` does now: 'sweet' (leap), 'late' (leap as from the sweet spot just passed), 'early' (hold the press
 * until the sweet spot) or 'now' (let go as he is: a hop off the way the vine carries him). `sinceSweet` is how long ago the swing was
 * last in its sweet spot for `dir` (Infinity if not this swing).
 */
export function releaseCall(s: SwingState, dir: -1 | 1, sinceSweet: number): 'sweet' | 'late' | 'early' | 'now' {
  if (inSweetSpot(s, dir)) return 'sweet';
  // (as shares of the vine's swing, like the sweet spot)
  const a = (s.angle * dir) / (s.amp ?? TIMED.amp);
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

/** the flights a let-go can make: the jump held, a flick, and the second jump at a few moments */
export const LETGO_FLIGHTS: ReadonlyArray<{ held: number; dbl: number }> = [
  { held: 99, dbl: 99 }, { held: 7, dbl: 99 }, { held: 99, dbl: 0.15 }, { held: 99, dbl: 0.3 }, { held: 99, dbl: 0.45 },
];

/**
 * ms of ONE swing on A in which a press to let go toward +x gets him there (`hits`, asked every frame of the flight with the vines'
 * clock), as the engine plays a press (engine.ts and RELEASE): in the sweet spot he leaps; a beat early the press waits for it; a beat
 * late it is the sweet spot's leap; anywhere else a hop off the vine. Caught near the bottom of the vine and higher up: the worse counts.
 */
export function pressWindow(
  A: SwingVine,
  hits: (c: AirBody, t: number, prevY: number) => boolean,
  flights: ReadonlyArray<{ held: number; dbl: number }> = LETGO_FLIGHTS,
  grips: readonly number[] = [0.7, 0.95],
): number {
  const DT = 1 / 30;
  const len = A.bottomY - A.topY;
  const n = Math.round(vinePeriod(A) / DT);
  let worst = Infinity;
  for (const g of grips) {
    const s0 = swingGrab({ x: A.x - 40, y: A.topY + Math.min(len * g, len - 20), vx: 300, vy: 100 }, A);
    // two swings and a bit of states: the presses are the second swing (the first gives "since the sweet spot")
    const st: Array<{ s: SwingState; r: { x: number; y: number }; sweet: boolean }> = [];
    for (let k = 0; k < 2 * n + 20; k++) {
      const r = swingStep(s0, A, DT, 1, 0);
      st.push({ s: { ...s0 }, r, sweet: inSweetSpot(s0, 1) });
    }
    let lastSweet = -1e9;
    let snap: SwingState | null = null;
    for (let k = 0; k < n; k++) if (st[k].sweet) { lastSweet = k; snap = st[k].s; }
    let ok = 0;
    for (let k = n; k < 2 * n; k++) {
      if (st[k].sweet) { lastSweet = k; snap = st[k].s; }
      const call = releaseCall(st[k].s, 1, (k - lastSweet) * DT);
      let at = k, from: SwingState = st[k].s;
      if (call === 'late' && snap) from = snap;
      if (call === 'early') {
        let m = k;
        while (m < k + Math.round(RELEASE.early / DT) && !st[m].sweet) m++;
        at = m;
        from = st[m].s;
      }
      const l = timedLaunch(from, 1);
      let made = false;
      for (const f of flights) {
        const c: AirBody = { x: st[at].r.x, y: st[at].r.y, vx: l.vx, vy: l.vy };
        let t = 0, used = false;
        for (let i = 1; i <= 90 && !made; i++) {
          if (!used && t >= f.dbl) {
            c.vy = -PHYS.doubleV;
            used = true;
          }
          const prevY = c.y;
          airStep(c, DT, 1, i <= f.held);
          t += DT;
          if (hits(c, st[at].s.t! + t, prevY)) made = true;
          if (c.y > A.bottomY + 500) break;
        }
        if (made) break;
      }
      if (made) ok++;
    }
    worst = Math.min(worst, ok * DT * 1000);
  }
  return worst;
}

const chainCache = new Map<string, number>();
/**
 * How far ahead in its swing (a share of a period) the next liana of a chain swings: the offset that gives the widest moment in A's swing
 * to leap across and catch B (pressWindow, the jump held or flicked), never less than a tenth of a swing either way (Matt: never in step).
 * Pure and cached: the stage's phases and the checks use the same answer.
 */
export function chainPhase(A: SwingVine, B: SwingVine): number {
  const key = `${A.x},${A.topY},${A.bottomY},${vineAmp(A)},${B.x},${B.topY},${B.bottomY},${vineAmp(B)},${TIMED.period},${TIMED.grabX},${TIMED.sweetFrom},${TIMED.sweetTo}`;
  const known = chainCache.get(key);
  if (known !== undefined) return known;
  const a: SwingVine = { x: A.x, topY: A.topY, bottomY: A.bottomY, swingAmp: vineAmp(A), swingPeriod: A.swingPeriod, swingPhase: 0 };
  let best = 0.25, bestW = -1;
  for (let k = 2; k <= 14; k++) {
    const b: SwingVine = { x: B.x, topY: B.topY, bottomY: B.bottomY, swingAmp: vineAmp(B), swingPeriod: B.swingPeriod, swingPhase: k / 16 };
    const w = pressWindow(a, (c, t) => canGrabSwing(c.x, c.y, b, t), LETGO_FLIGHTS.slice(0, 2));
    if (w > bestW + 1e-6) {
      bestW = w;
      best = k / 16;
    }
  }
  chainCache.set(key, best);
  return best;
}

/** which way a hit knocks him: away from where it came from (`fromX`), or back the way he faces when that is not known */
export function knockDir(px: number, facing: -1 | 1, fromX?: number): -1 | 1 {
  if (fromX === undefined || !Number.isFinite(fromX) || Math.abs(px - fromX) < 1) return (facing === 1 ? -1 : 1);
  return px > fromX ? 1 : -1;
}

/**
 * is a solid block (one 50 px tall or more) a wall beside him, at his feet's height? Not while he stands on it or above its top, nor
 * when he is wholly under it (a boulder up on a shelf over his head): only then can he bump into it, or push it (engine.ts)
 */
export function blockBeside(feetY: number, height: number, block: { y: number; height: number }): boolean {
  return feetY > block.y + 6 && feetY - height < block.y + block.height;
}
