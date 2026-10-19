/**
 * The harpy's dive, as a pure step so the game and the tests fly the very same bird.
 *
 * The old dive flew to a fixed height under its own post, so it bottomed out in the same spot above the ground whatever the
 * player did. This one is a homing strafing run: it aims at where the player's body IS (plus a short lead for a running player),
 * steers toward it with a limited turn rate, then LOCKS its heading a beat before contact so a jump or a duck at the last
 * moment still dodges it. After the pass it settles into a low glide at the player's own height, where a punch or kick reaches it.
 */

export interface DiveState {
  /** current velocity, px/s */
  vx: number;
  vy: number;
  /** seconds since the dive began */
  t: number;
  /** heading frozen (no more steering) */
  locked: boolean;
}

export const DIVE = {
  startSpeed: 160,
  topSpeed: 300,
  accel: 230,
  /** rad/s the bird can swing its heading while it is still homing */
  turnRate: 3.4,
  /** it commits to its line this far from the target ... */
  lockDist: 120,
  /** ... or this long after the dive began */
  lockTime: 1.25,
  /** it gives up the run after this long (the player ran off): it climbs away instead */
  maxTime: 2.6,
  /** how far past the player (after locking) it keeps flying before it settles low */
  passDist: 150,
  /** seconds of lead on a moving player */
  lead: 0.2,
} as const;

/** where the bird aims: the player's body (feet minus half a body), led a little in the direction of travel */
export function aimPoint(p: { x: number; y: number; vx: number }) {
  return { x: p.x + p.vx * DIVE.lead, y: p.y - 28 };
}

export function startDive(e: { x: number; y: number }, p: { x: number; y: number; vx: number }): DiveState {
  const a = aimPoint(p);
  const d = Math.hypot(a.x - e.x, a.y - e.y) || 1;
  return { vx: ((a.x - e.x) / d) * DIVE.startSpeed, vy: ((a.y - e.y) / d) * DIVE.startSpeed, t: 0, locked: false };
}

const wrap = (a: number) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

export interface DiveStep {
  /** the dive is over: settle into the low glide (or climb away when it timed out) */
  done: false | 'passed' | 'timeout';
}

/** advance the bird one tick of its dive (mutates `e` and `s`) */
export function stepDive(e: { x: number; y: number }, s: DiveState, p: { x: number; y: number; vx: number }, dt: number): DiveStep {
  s.t += dt;
  const a = aimPoint(p);
  const dx = a.x - e.x;
  const dy = a.y - e.y;
  const dist = Math.hypot(dx, dy);
  if (!s.locked && (dist < DIVE.lockDist || s.t > DIVE.lockTime)) s.locked = true;

  let speed = Math.min(DIVE.topSpeed, Math.hypot(s.vx, s.vy) + DIVE.accel * dt);
  if (!s.locked) {
    const cur = Math.atan2(s.vy, s.vx);
    const want = Math.atan2(dy, dx);
    const turn = Math.max(-DIVE.turnRate * dt, Math.min(DIVE.turnRate * dt, wrap(want - cur)));
    const h = cur + turn;
    s.vx = Math.cos(h) * speed;
    s.vy = Math.sin(h) * speed;
  } else {
    const k = speed / (Math.hypot(s.vx, s.vy) || 1);
    s.vx *= k;
    s.vy *= k;
  }
  e.x += s.vx * dt;
  e.y += s.vy * dt;
  // never below the player's feet: it is a bird, not a mole
  const floor = p.y - 6;
  if (e.y > floor) {
    e.y = floor;
    if (s.vy > 0) s.vy = 0;
  }

  // passed the player (locked, and now moving away from them): it settles into the glide
  if (s.locked) {
    const away = (e.x - p.x) * s.vx > 0 && Math.abs(e.x - p.x) > DIVE.passDist;
    if (away) return { done: 'passed' };
  }
  if (s.t > DIVE.maxTime) return { done: 'timeout' };
  return { done: false };
}

/** the low glide after a pass: face the player, drift toward them and settle at their body height, so a punch or kick can reach */
export function stepGlide(e: { x: number; y: number }, p: { x: number; y: number }, dt: number): 1 | -1 {
  const toward: 1 | -1 = p.x >= e.x ? 1 : -1;
  const gap = Math.abs(p.x - e.x);
  if (gap > 80) e.x += toward * Math.min(90, (gap - 80) * 2 + 30) * dt;
  const wantY = p.y - 30;
  e.y += (wantY - e.y) * Math.min(1, 4 * dt);
  return toward;
}
