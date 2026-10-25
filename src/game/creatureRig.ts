/**
 * Creature body engine.
 *
 * Enemies in the game are plain data (x, y, facing, a few AI flags). This module gives their *drawing*
 * a real body underneath, so nothing just floats or slides:
 *
 *  - Kinematics: velocity is measured from how the creature actually moved between frames, so the rig
 *    follows whatever the game logic does (patrol, pounce, swoop, boss walk) without being told.
 *  - Two-bone IK limbs (hip -> knee -> foot).
 *  - A planted-foot gait: feet are pinned to the ground in world space and only step when the body has
 *    moved far enough away, in coordinated groups (trot pairs, spider tetrapods, ...).
 *  - Follow-the-leader chains (snake spine) and pinned verlet chains (tails).
 *  - Damped springs for secondary motion (head, ears, turning, squash).
 *
 * It is visual only. It never writes back to the enemy, so it can't change physics or fairness.
 * Coordinates: canvas style, +y is down. "Local" space is the creature's own frame with +x = forward.
 */
import type { Enemy } from './types.ts';

export interface V2 {
  x: number;
  y: number;
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const u = clamp(t, 0, 1);
  return u * u * (3 - 2 * u);
};
/** Frame-rate independent exponential approach. */
export const damp = (cur: number, target: number, rate: number, dt: number) => lerp(cur, target, 1 - Math.exp(-rate * dt));

// ---------------------------------------------------------------------------------------------
// Springs
// ---------------------------------------------------------------------------------------------

/** Damped spring toward a target. k = stiffness, c = damping. Sub-stepped so it stays stable at 20fps. */
export class Spring {
  x: number;
  v = 0;
  constructor(x = 0) {
    this.x = x;
  }
  step(target: number, k: number, c: number, dt: number) {
    const n = Math.max(1, Math.ceil(dt / 0.008));
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      const a = k * (target - this.x) - c * this.v;
      this.v += a * h;
      this.x += this.v * h;
    }
    return this.x;
  }
  kick(dv: number) {
    this.v += dv;
  }
  snap(x: number) {
    this.x = x;
    this.v = 0;
  }
}

// ---------------------------------------------------------------------------------------------
// Two-bone IK
// ---------------------------------------------------------------------------------------------

export interface IKResult {
  /** knee / elbow */
  kx: number;
  ky: number;
  /** foot actually reached (clamped to the limb's reach) */
  fx: number;
  fy: number;
}

/**
 * Solve a two-bone limb from hip (hx,hy) toward (tx,ty).
 * bend: +1 / -1 picks which side the knee points; 0 picks whichever puts the knee higher on screen.
 */
export function ik2(hx: number, hy: number, tx: number, ty: number, l1: number, l2: number, bend: 1 | -1 | 0): IKResult {
  let dx = tx - hx;
  let dy = ty - hy;
  let d = Math.hypot(dx, dy);
  const maxR = (l1 + l2) * 0.999;
  const minR = Math.abs(l1 - l2) * 1.001 + 0.001;
  if (d < 0.0001) {
    dx = 0;
    dy = 0.0001;
    d = 0.0001;
  }
  const dd = clamp(d, minR, maxR);
  const ux = dx / d;
  const uy = dy / d;
  const fx = hx + ux * dd;
  const fy = hy + uy * dd;
  const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const mx = hx + ux * a;
  const my = hy + uy * a;
  const k1x = mx + -uy * h;
  const k1y = my + ux * h;
  const k2x = mx - -uy * h;
  const k2y = my - ux * h;
  let kx: number;
  let ky: number;
  if (bend === 1) {
    kx = k1x;
    ky = k1y;
  } else if (bend === -1) {
    kx = k2x;
    ky = k2y;
  } else if (k1y <= k2y) {
    kx = k1x;
    ky = k1y;
  } else {
    kx = k2x;
    ky = k2y;
  }
  return { kx, ky, fx, fy };
}

// ---------------------------------------------------------------------------------------------
// Per-creature body state (kinematics measured from the draw calls)
// ---------------------------------------------------------------------------------------------

export interface Body {
  key: string;
  /** world position this frame */
  wx: number;
  wy: number;
  /** smoothed world velocity, px/s */
  vx: number;
  vy: number;
  /** speed along the facing direction (negative = backing up) */
  fv: number;
  /** seconds since the previous draw (0 on a repeated / paused frame) */
  dt: number;
  /** game time of this draw */
  t: number;
  /** seconds this rig has existed */
  age: number;
  facing: 1 | -1;
  /** smoothed facing (-1..1): drawn as the horizontal scale so turns are a quick squash-flip, not a pop */
  fs: number;
  fsSpring: Spring;
  /** true for the one frame where facing changed; planted feet / chains should be mirrored about wx */
  turned: boolean;
  /** true on the first frame, or after the creature jumped somewhere else (respawn, new stage) */
  fresh: boolean;
  /** creature-specific rig state, created lazily by the creature */
  rig: unknown;
  seen: number;
}

const BODIES = new Map<string, Body>();
let lastPrune = 0;

export function bodyFor(kind: string, enemy: Enemy, time: number): Body {
  const key = `${kind}:${enemy.rigKey ?? ''}${enemy.id}`;
  const sc = enemy.rigScale ?? 1;
  const wx = (enemy.wx ?? enemy.x) / sc;
  const wy = (enemy.wy ?? enemy.y) / sc;
  let b = BODIES.get(key);
  if (b && time < b.t - 0.5) {
    // game time restarted (new stage): throw the old rig away
    BODIES.delete(key);
    b = undefined;
  }
  if (!b) {
    b = {
      key, wx, wy, vx: 0, vy: 0, fv: 0, dt: 0, t: time, age: 0, facing: enemy.facing,
      fs: enemy.facing, fsSpring: new Spring(enemy.facing), turned: false, fresh: true, rig: null, seen: time,
    };
    BODIES.set(key, b);
  } else {
    const dt = time - b.t;
    if (dt <= 0) {
      b.dt = 0;
      b.fresh = false;
    } else {
      const step = Math.hypot(wx - b.wx, wy - b.wy);
      if (step > 220 / sc || dt > 1.0) {
        // teleported (respawn / checkpoint reload): restart cleanly from here
        b.vx = 0;
        b.vy = 0;
        b.fresh = true;
        b.dt = Math.min(dt, 0.05);
        b.rig = null;
      } else {
        const d = Math.min(dt, 0.06);
        const rvx = (wx - b.wx) / dt;
        const rvy = (wy - b.wy) / dt;
        const k = 1 - Math.exp(-16 * d);
        b.vx += (rvx - b.vx) * k;
        b.vy += (rvy - b.vy) * k;
        b.dt = d;
        b.fresh = false;
      }
      b.age += b.dt;
      b.t = time;
    }
    b.wx = wx;
    b.wy = wy;
  }
  b.turned = false;
  if (b.fresh) {
    b.facing = enemy.facing;
    b.fsSpring.snap(enemy.facing);
  } else if (enemy.facing !== b.facing) {
    b.facing = enemy.facing;
    b.turned = true;
  }
  if (b.dt > 0) b.fs = b.fsSpring.step(b.facing, 420, 40, b.dt);
  b.fv = b.vx * b.facing;
  b.seen = time;
  // game time starts again at 0 every stage: without this the prune would wait for the new stage to outlast the old one's clock
  if (time < lastPrune) lastPrune = time;
  if (time - lastPrune > 3) {
    lastPrune = time;
    // (a body last seen "in the future" belongs to an earlier stage's clock)
    for (const [k, v] of BODIES) if (time - v.seen > 4 || v.seen > time + 0.5) BODIES.delete(k);
  }
  return b;
}

/** Mirror world-space points about the creature's centre (call when `body.turned`). */
export function mirrorAbout(wx: number, pts: V2[]) {
  for (const p of pts) p.x = 2 * wx - p.x;
}

/** how many bodies are kept (for the test) */
export const bodyCount = (): number => BODIES.size;

/** Test / reset hook. */
export function resetBodies() {
  BODIES.clear();
  lastPrune = 0;
}

// ---------------------------------------------------------------------------------------------
// Planted-foot gait
// ---------------------------------------------------------------------------------------------

export interface LegSpec {
  /** hip anchor in local space (+x forward) */
  hx: number;
  hy: number;
  l1: number;
  l2: number;
  /** knee direction; 0 = knee up */
  bend: 1 | -1 | 0;
  /** legs in the same group step together */
  group: number;
  /** how far ahead of / behind the hip the foot likes to rest, local x */
  restX: number;
}

export class Leg {
  spec: LegSpec;
  /** foot in WORLD space */
  fx = 0;
  fy = 0;
  planted = true;
  t = 0;
  sx = 0;
  sy = 0;
  /** where the foot was relative to the hip when the swing began (the swing is carried along with the body) */
  srx = 0;
  /** how far through its swing, 0..1 (0 when planted); handy for the body to bob with */
  swing = 0;
  constructor(spec: LegSpec) {
    this.spec = spec;
  }
}

export interface GaitOpts {
  /** foot lands when it is this far (px) behind its rest spot */
  stepDist: number;
  stepHeight: number;
  /** swing time at standstill / at full speed */
  slow: number;
  fast: number;
  /** world y of the ground under the creature */
  groundY: number;
  /** legs are off the ground (pounce / dive): feet are driven by the caller instead */
  airborne?: boolean;
  /** limit on how far the foot target leads the hip, px */
  maxLead?: number;
}

export class Gait {
  legs: Leg[];
  groups: number;
  private placed = false;
  constructor(specs: LegSpec[]) {
    this.legs = specs.map((s) => new Leg(s));
    this.groups = specs.reduce((m, s) => Math.max(m, s.group), 0) + 1;
  }

  /** hip position for leg i in world space, given the body anchor and facing */
  hipWorld(i: number, b: Body, bodyDy = 0): V2 {
    const s = this.legs[i].spec;
    return { x: b.wx + b.facing * s.hx, y: b.wy + s.hy + bodyDy };
  }

  /** the creature turned around: swing every foot to the other side of the body */
  mirror(wx: number) {
    for (const l of this.legs) {
      l.fx = 2 * wx - l.fx;
      l.sx = 2 * wx - l.sx;
      l.srx = -l.srx;
    }
  }

  /** local-space foot for drawing, relative to the creature's origin */
  footLocal(i: number, b: Body): V2 {
    const l = this.legs[i];
    return { x: (l.fx - b.wx) * b.facing, y: l.fy - b.wy };
  }

  /** where (relative to the hip, x) a foot should land: its resting spot plus a lead into the motion, kept inside the leg's reach */
  private landRel(l: Leg, b: Body, h: V2, lead: number, groundY: number) {
    const reach = (l.spec.l1 + l.spec.l2) * 0.95;
    const vert = groundY - h.y;
    const slack = Math.sqrt(Math.max(0, reach * reach - vert * vert));
    return clamp(b.facing * l.spec.restX + lead * 1.6, -slack * 0.8, slack * 0.8);
  }

  /** put every foot at its resting spot on the ground (first frame, or right after a leap) */
  plant(b: Body, groundY: number, bodyDy = 0) {
    for (let i = 0; i < this.legs.length; i++) {
      const h = this.hipWorld(i, b, bodyDy);
      const l = this.legs[i];
      l.fx = h.x + b.facing * l.spec.restX;
      l.fy = groundY;
      l.planted = true;
      l.t = 0;
      l.swing = 0;
    }
    this.placed = true;
  }

  update(b: Body, o: GaitOpts, bodyDy = 0) {
    const dt = b.dt;
    const speed = Math.abs(b.vx);
    if (!this.placed || b.fresh) {
      this.plant(b, o.groundY, bodyDy);
      return;
    }
    if (dt <= 0) return;
    const lead = clamp(b.vx * 0.12, -(o.maxLead ?? 14), o.maxLead ?? 14);
    const swingDur = lerp(o.slow, o.fast, clamp(speed / 150, 0, 1));

    if (o.airborne) {
      // let the caller pose the feet; keep bookkeeping sane
      for (const l of this.legs) {
        l.planted = true;
        l.swing = 0;
      }
      return;
    }

    // advance legs that are mid-step
    for (let i = 0; i < this.legs.length; i++) {
      const l = this.legs[i];
      if (l.planted) continue;
      const h = this.hipWorld(i, b, bodyDy);
      const trel = this.landRel(l, b, h, lead, o.groundY);
      const tx = h.x + trel;
      l.t += dt / swingDur;
      const u = smooth(l.t);
      l.fx = h.x + lerp(l.srx, trel, u);
      l.fy = lerp(l.sy, o.groundY, u) - Math.sin(Math.PI * clamp(l.t, 0, 1)) * o.stepHeight;
      l.swing = clamp(l.t, 0, 1);
      if (l.t >= 1) {
        l.planted = true;
        l.fx = tx;
        l.fy = o.groundY;
        l.swing = 0;
      }
    }

    // a foot about to run out of leg steps right now, even if the other group is still in the air
    for (let i = 0; i < this.legs.length; i++) {
      const l = this.legs[i];
      if (!l.planted) continue;
      const h = this.hipWorld(i, b, bodyDy);
      const reach = l.spec.l1 + l.spec.l2;
      if (Math.hypot(l.fx - h.x, l.fy - h.y) > reach * 0.93) {
        l.planted = false;
        l.t = 0;
        l.sx = l.fx;
        l.sy = l.fy;
        l.srx = l.fx - h.x;
      }
    }

    // decide whether a new group of feet should start stepping
    if (this.legs.some((l) => !l.planted)) return;
    const idle = speed < 6;
    let bestGroup = -1;
    let bestNeed = 0;
    for (let g = 0; g < this.groups; g++) {
      let need = 0;
      for (let i = 0; i < this.legs.length; i++) {
        const l = this.legs[i];
        if (l.spec.group !== g) continue;
        const h = this.hipWorld(i, b, bodyDy);
        const ideal = h.x + this.landRel(l, b, h, lead, o.groundY);
        const off = Math.abs(l.fx - ideal);
        const n = off / (idle ? o.stepDist * 0.7 : o.stepDist);
        if (n > need) need = n;
      }
      if (need > bestNeed) {
        bestNeed = need;
        bestGroup = g;
      }
    }
    if (bestGroup >= 0 && bestNeed >= 1) {
      for (let i = 0; i < this.legs.length; i++) {
        const l = this.legs[i];
        if (l.spec.group !== bestGroup) continue;
        const h = this.hipWorld(i, b, bodyDy);
        l.planted = false;
        l.t = 0;
        l.sx = l.fx;
        l.sy = l.fy;
        l.srx = l.fx - h.x;
      }
    }
  }

  /** solve every leg's IK in local space; returns knee + foot per leg */
  solve(b: Body, bodyDy = 0, override?: (i: number) => V2 | null): IKResult[] {
    return this.legs.map((l, i) => {
      const s = l.spec;
      const o = override?.(i);
      const fl = o ?? { x: (l.fx - b.wx) * b.facing, y: l.fy - b.wy };
      return ik2(s.hx, s.hy + bodyDy, fl.x, fl.y, s.l1, s.l2, s.bend);
    });
  }
}

// ---------------------------------------------------------------------------------------------
// Chains
// ---------------------------------------------------------------------------------------------

/**
 * Follow-the-leader chain in WORLD space: point 0 is the head and is placed by the caller,
 * every other point drags behind it at a fixed spacing and eases toward a target shape.
 */
export class FollowChain {
  pts: V2[];
  seg: number;
  constructor(n: number, seg: number, ox: number, oy: number) {
    this.seg = seg;
    this.pts = [];
    for (let i = 0; i < n; i++) this.pts.push({ x: ox - i * seg, y: oy });
  }
  reset(targets: V2[]) {
    for (let i = 0; i < this.pts.length; i++) {
      this.pts[i].x = targets[i].x;
      this.pts[i].y = targets[i].y;
    }
  }
  /**
   * @param head world position of point 0
   * @param targets world-space rest shape (same length) the body relaxes toward
   * @param rate how quickly points are pulled back to the rest shape (higher = stiffer)
   * @param floor world y points may not go below (per-point via floorAt)
   */
  update(head: V2, targets: V2[], rate: (i: number) => number, dt: number, floorAt?: (i: number) => number) {
    const p = this.pts;
    p[0].x = head.x;
    p[0].y = head.y;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 1; i < p.length; i++) {
        const a = p[i - 1];
        const q = p[i];
        let dx = q.x - a.x;
        let dy = q.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        dx /= d;
        dy /= d;
        // follow: keep spacing
        let nx = a.x + dx * this.seg;
        let ny = a.y + dy * this.seg;
        if (pass === 0) {
          const k = 1 - Math.exp(-rate(i) * Math.max(dt, 0.001));
          nx = lerp(nx, targets[i].x, k);
          ny = lerp(ny, targets[i].y, k);
        }
        if (floorAt) ny = Math.min(ny, floorAt(i));
        // restore spacing after the pull
        const ex = nx - a.x;
        const ey = ny - a.y;
        const ed = Math.hypot(ex, ey) || 0.0001;
        q.x = a.x + (ex / ed) * this.seg;
        q.y = a.y + (ey / ed) * this.seg;
        if (floorAt && q.y > floorAt(i)) q.y = floorAt(i);
      }
    }
  }
}

/** Pinned verlet chain (tails): root is fixed by the caller, the rest swings with inertia. */
export class VerletChain {
  pts: V2[];
  prev: V2[];
  seg: number;
  constructor(n: number, seg: number, ox: number, oy: number) {
    this.seg = seg;
    this.pts = [];
    this.prev = [];
    for (let i = 0; i < n; i++) {
      this.pts.push({ x: ox - i * seg, y: oy });
      this.prev.push({ x: ox - i * seg, y: oy });
    }
  }
  reset(targets: V2[]) {
    for (let i = 0; i < this.pts.length; i++) {
      this.pts[i].x = this.prev[i].x = targets[i].x;
      this.pts[i].y = this.prev[i].y = targets[i].y;
    }
  }
  /** @param rest world-space rest shape; stiff 0..1 per second pull toward it */
  update(root: V2, rest: V2[], stiff: number, damping: number, gravity: number, dt: number) {
    const n = Math.max(1, Math.ceil(dt / 0.016));
    const h = dt / n;
    for (let s = 0; s < n; s++) {
      this.pts[0].x = root.x;
      this.pts[0].y = root.y;
      this.prev[0].x = root.x;
      this.prev[0].y = root.y;
      for (let i = 1; i < this.pts.length; i++) {
        const p = this.pts[i];
        const q = this.prev[i];
        const vx = (p.x - q.x) * Math.exp(-damping * h);
        const vy = (p.y - q.y) * Math.exp(-damping * h);
        q.x = p.x;
        q.y = p.y;
        const w = stiff * (i / this.pts.length + 0.15);
        p.x += vx + (rest[i].x - p.x) * w * h * 8;
        p.y += vy + (rest[i].y - p.y) * w * h * 8 + gravity * h * h;
      }
      for (let it = 0; it < 3; it++) {
        for (let i = 1; i < this.pts.length; i++) {
          const a = this.pts[i - 1];
          const b = this.pts[i];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.0001;
          const f = (d - this.seg) / d;
          if (i === 1) {
            b.x -= dx * f;
            b.y -= dy * f;
          } else {
            a.x += dx * f * 0.5;
            a.y += dy * f * 0.5;
            b.x -= dx * f * 0.5;
            b.y -= dy * f * 0.5;
          }
        }
      }
    }
  }
}

/** Tapered, round-capped limb stroke through a list of points (used for legs, wings' bones, tails). */
export function strokePath(
  ctx: CanvasRenderingContext2D,
  pts: V2[],
  w0: number,
  w1: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const n = pts.length - 1;
  for (let i = 0; i < n; i++) {
    ctx.lineWidth = lerp(w0, w1, i / Math.max(1, n - 1));
    ctx.beginPath();
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
    ctx.stroke();
  }
}
