/**
 * Movement tuning for Slomatt, shared by the engine and the level generator so every
 * generated jump is guaranteed reachable. Units: px, px/s, px/s^2, seconds.
 * Feel target: snappy and precise (quick start/stop, variable jump height).
 */
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
}

const reachCache = new Map<string, number>();

/**
 * Furthest horizontal distance covered by the time the feet come down through a
 * surface `dy` px above the launch point (negative dy = a drop). -1 if the
 * surface is never reached. Pure number crunching, memoised.
 */
export function flightReach(dy: number, o: FlightOpts): number {
  const key = `${Math.round(dy / 2)}|${o.v0}|${o.vx}|${o.dbl}|${o.dt}`;
  const hit = reachCache.get(key);
  if (hit !== undefined) return hit;
  const target = -dy;
  const tries = o.dbl ? Array.from({ length: 36 }, (_, i) => i * o.dt * (1 / 30 / o.dt)) : [-1];
  let best = -1;
  for (const tD of tries) {
    const b: AirBody = { x: 0, y: 0, vx: o.vx, vy: -o.v0 };
    let t = 0;
    let doubled = !o.dbl;
    for (let i = 0; i < 400; i++) {
      if (!doubled && t >= tD - 1e-9) {
        b.vy = -PHYS.doubleV;
        doubled = true;
      }
      const prev = b.y;
      airStep(b, o.dt, 1, false);
      t += o.dt;
      if (b.vy >= 0 && prev <= target + 14 && b.y >= target) {
        if (b.x > best) best = b.x;
        break;
      }
      if (b.y > target + 400) break;
    }
  }
  reachCache.set(key, best);
  return best;
}

/** Worst case over both tick rates. */
export function reachMin(dy: number, v0: number, vx: number, dbl: boolean): number {
  let m = Infinity;
  for (const dt of SIM_DTS) m = Math.min(m, flightReach(dy, { v0, vx, dbl, dt }));
  return m;
}

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
  return Math.abs(x - v.x) < SWING.grabX && y >= v.topY - 15 && y <= v.bottomY + 30;
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

export function swingStep(s: SwingState, v: SwingVine, dt: number, steer: -1 | 0 | 1, climb: -1 | 0 | 1 = 0) {
  s.omega += ((-SWING.g / Math.max(50, s.len)) * Math.sin(s.angle)) * dt;
  s.omega += steer * SWING.steer * dt;
  s.omega *= Math.pow(SWING.damp, dt * 60);
  s.angle = Math.max(-SWING.maxAngle, Math.min(SWING.maxAngle, s.angle + s.omega * dt));
  if (climb < 0) s.len = Math.max(60, s.len - 150 * dt);
  else if (climb > 0) s.len = Math.min(v.bottomY - v.topY, s.len + 150 * dt);
  const tang = s.omega * s.len;
  return {
    x: v.x + Math.sin(s.angle) * s.len,
    y: v.topY + Math.cos(s.angle) * s.len,
    vx: Math.cos(s.angle) * tang,
    vy: -Math.sin(s.angle) * tang,
  };
}

/** Velocity after letting go with a jump ("Tarzan leap"). */
export function tarzanLaunch(vx: number, vy: number, dir: -1 | 1) {
  const speed = Math.max(SWING.leapMin, Math.min(SWING.leapMax, Math.abs(vx) * 1.15 + 120));
  return {
    vx: dir * speed,
    vy: Math.max(SWING.leapVyMin, Math.min(-PHYS.vineReleaseV, vy - 300)),
  };
}
