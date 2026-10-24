/**
 * venomFang — World 1's boss, rebuilt (2026-10-24) as the gentlest fight in the game.
 *
 * He lies coiled at the far end of the Mushroom Hollow and has one real move, the stage plan's "low lunge that sweeps the floor":
 * he rears back and hisses (his eyes glow and a line flashes along the floor), then his head shoots along the ground to the other
 * end of the hollow. Pokey dodges by getting off the floor (the climbing trunk, the stump, the hanging liana); the head slams down
 * and lies there dazed, at Pokey's height, and that is the moment to drop down and punch it. Each opening takes two hits, then he
 * pulls back. Phase 2 adds little snakes dropped from the canopy (1-9's move), phase 3 makes the stump crack under a hero who waits
 * on it (1-8's move).
 *
 * This file is the geometry: where the coil, the neck and the head are at every moment, worked out from what the boss brain is
 * doing. The drawing (venomRig.ts), the hurt boxes and the punch target all come from here, so what you see is what hurts.
 * Pure: no canvas. Local frame: x forward (the way he faces), y up from the floor (negative is up on the screen).
 */
import type { BossEntity } from './types.ts';
import { VENOM2_FRAMES, VENOM2_PX } from './venom2AtlasData.ts';

export const VF = {
  /** the drawing scale: world units per atlas px is S / VENOM2_PX */
  S: 0.68,
  /** the head's front stops this far short of the far fence (room to stand in front of it) */
  inset: 12,
  /** the lunge (s): the dive and the slide along the floor */
  act: 0.75,
  /** the head dives from its reared height to the floor in this share of the lunge, then slides */
  dive: 0.14,
  /** after the opening he drags his head home over this long (s), the last part lifting it */
  retract: 0.85,
  /** what hurts during the lunge, above the floor: the neck, and the head */
  neckHurt: 48,
  headHurt: 92,
} as const;

export type CoilPose = 'calm' | 'slump';
export type HeadPose = 'calm' | 'hiss' | 'strike' | 'snap' | 'dazed' | 'hurt' | 'angry' | 'defeated';

export interface VenomPose {
  coil: CoilPose;
  head: HeadPose;
  /** where the neck joins the head (world) */
  jx: number;
  jy: number;
  /** the spine of the neck, from the coil to the head (world points) */
  spine: Array<[number, number]>;
  /** 0..1: the warning line along the floor (the lunge is coming), and where it runs to */
  warn: number;
  warnTo: number;
  /** a little shake of the head (the wind-up, the roar) */
  shake: number;
}

const unit = (n: number) => (n * VF.S) / VENOM2_PX;

/** the neck thickness in world units (as thick as the stub that leaves the coil, and the heads' own necks) */
export const NECK = 50;

/** where the neck leaves a coil, in the local frame, and which way */
export function coilCut(c: CoilPose): { x: number; y: number; dx: number; dy: number } {
  const f = VENOM2_FRAMES['coil_' + c];
  return { x: unit((f.nx ?? f.ax) - f.ax), y: unit((f.ny ?? 0) - f.ay), dx: f.dx ?? 0, dy: f.dy ?? -1 };
}

/** a flat head (strike, dazed): how far its front reaches past the join, and how far its jaw hangs below it */
export function flatHead(h: 'strike' | 'dazed'): { ahead: number; below: number } {
  const f = VENOM2_FRAMES['head_' + h];
  return { ahead: unit(f.w - f.ax), below: unit(f.h - f.ay) };
}

/** the height above the floor where the neck comes clear of a coil (local y) */
export function coilTop(c: CoilPose): number {
  const f = VENOM2_FRAMES['coil_' + c];
  return unit((f.top ?? f.ay) - f.ay);
}

/** the raised head's join in the local frame (resting, it sways gently) */
function raised(time: number, lift = 0): { x: number; y: number } {
  const c = coilCut('calm');
  return { x: c.x + 10 + Math.sin(time * 1.3) * 6, y: -262 - lift + Math.sin(time * 1.9) * 5 };
}
/** reared back for the lunge */
function reared(): { x: number; y: number } {
  const c = coilCut('calm');
  return { x: c.x - 44, y: -288 };
}

/** where the head's front ends up after a lunge (world x), for a boss at bx facing f in an arena */
export function lungeReach(f: number, left: number, right: number): number {
  return f < 0 ? left + VF.inset : right - VF.inset;
}

/** the point where the neck meets the floor during a lunge (local), and the first tip position */
function floorFoot(): { x: number; y: number } {
  const c = coilCut('calm');
  return { x: c.x + 250, y: -NECK / 2 };
}

const ease = (u: number) => u * u * (3 - 2 * u);
const easeOut = (u: number) => 1 - (1 - u) * (1 - u) * (1 - u);
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** a cubic from a (leaving along da) to b (arriving along db), as points */
function curve(ax: number, ay: number, dax: number, day: number, bx: number, by: number, dbx: number, dby: number, n = 18): Array<[number, number]> {
  const L = Math.hypot(bx - ax, by - ay) * 0.45 + 10;
  const p1x = ax + dax * L;
  const p1y = ay + day * L;
  const p2x = bx - dbx * L;
  const p2y = by - dby * L;
  const out: Array<[number, number]> = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const m = 1 - t;
    out.push([
      m * m * m * ax + 3 * m * m * t * p1x + 3 * m * t * t * p2x + t * t * t * bx,
      m * m * m * ay + 3 * m * m * t * p1y + 3 * m * t * t * p2y + t * t * t * by,
    ]);
  }
  return out;
}

function headDir(h: HeadPose): { dx: number; dy: number } {
  const f = VENOM2_FRAMES['head_' + h];
  return { dx: f.dx ?? 0.35, dy: f.dy ?? -0.94 };
}

/**
 * Everything about his body this moment. `reach` is the world x the head's front goes to (set when the lunge is wound up);
 * the result is in world coordinates.
 */
export function venomPose(b: BossEntity, floor: number, time: number): VenomPose {
  const br = b.ai;
  const f = b.facing < 0 ? -1 : 1;
  const st = br?.state ?? 'idle';
  const mv = br?.move ?? null;
  const t = br?.t ?? 0;
  const reach = br?.d.reach ?? b.x + f * 600;
  const angry = b.phase >= 2;
  let coil: CoilPose = 'calm';
  let head: HeadPose = angry ? 'angry' : 'calm';
  let shake = 0;
  let warn = 0;
  // the join, local; and for the head on the floor, the front of the head (world x)
  let jx: number;
  let jy: number;
  let onFloor = false;

  const lunging = mv === 'sweep';
  const foot = floorFoot();
  const strike = flatHead('strike');
  const dazed = flatHead('dazed');
  // the head lies flat: its join, local, from the world x of its front
  const flatJoin = (tip: number, h: 'strike' | 'dazed') => {
    const fh = h === 'strike' ? strike : dazed;
    return { x: (tip - b.x) * f - fh.ahead, y: -fh.below };
  };
  const startTip = b.x + f * (foot.x + strike.ahead + 20);

  if (st === 'dying') {
    coil = 'slump';
    head = 'defeated';
    const c = coilCut('slump');
    jx = c.x + 40;
    jy = c.y - 30;
  } else if (lunging && st === 'tell') {
    head = 'hiss';
    const u = Math.min(1, t / 0.5);
    const r = raised(time);
    const rr = reared();
    jx = lerp(r.x, rr.x, ease(u));
    jy = lerp(r.y, rr.y, ease(u));
    shake = 2 + 3 * u;
    warn = Math.min(1, t / 0.35);
  } else if (lunging && st === 'act') {
    head = 'strike';
    const u = Math.min(1, t / VF.act);
    if (u < VF.dive) {
      // the dive: from reared up to the floor in front of the coil
      const k = ease(u / VF.dive);
      const land = flatJoin(startTip, 'strike');
      const rr = reared();
      jx = lerp(rr.x, land.x, k);
      jy = lerp(rr.y, land.y, k);
    } else {
      const k = easeOut((u - VF.dive) / (1 - VF.dive));
      const tip = lerp(startTip, reach, k);
      const j = flatJoin(tip, 'strike');
      jx = j.x;
      jy = j.y;
      onFloor = true;
    }
  } else if (lunging && st === 'rec') {
    head = 'dazed';
    const j = flatJoin(reach, 'dazed');
    jx = j.x;
    jy = j.y;
    onFloor = true;
  } else if (lunging && st === 'idle' && t < VF.retract) {
    // dragging the head home along the floor, then lifting it
    const u = t / VF.retract;
    if (u < 0.7) {
      head = 'dazed';
      const tip = lerp(reach, startTip, ease(u / 0.7));
      const j = flatJoin(tip, 'dazed');
      jx = j.x;
      jy = j.y;
      onFloor = true;
    } else {
      const k = ease((u - 0.7) / 0.3);
      const from = flatJoin(startTip, 'dazed');
      const r = raised(time);
      jx = lerp(from.x, r.x, k);
      jy = lerp(from.y, r.y, k);
    }
  } else if (st === 'roar') {
    head = br?.roarReason === 'phase' ? 'angry' : 'hiss';
    const r = raised(time, 30);
    jx = r.x;
    jy = r.y;
    shake = 3;
  } else if (mv === 'call' && (st === 'tell' || st === 'act')) {
    // calling the little snakes: rears up high and shakes the canopy
    head = st === 'tell' ? 'hiss' : 'snap';
    const r = raised(time, 40 * Math.min(1, t / 0.3));
    jx = r.x;
    jy = r.y;
    shake = st === 'act' ? 5 : 2;
  } else {
    const r = raised(time);
    jx = r.x;
    jy = r.y;
  }
  if (b.hitFlashTimer > 0.05 && !onFloor && st !== 'dying') head = 'hurt';

  // the spine, local, then to the world
  const c = coilCut(coil);
  const hd = headDir(head);
  let local: Array<[number, number]>;
  if (onFloor) {
    // up out of the coil, down to the floor, and along it to the head
    // up out of the ring leaning forward, over the front of the coil and down: one wide arch, no hook at the hole
    const bend = curve(c.x, c.y, 0.32, -0.95, foot.x, foot.y, 1, 0, 16);
    local = [...bend];
    const endX = jx;
    const steps = Math.max(1, Math.ceil(Math.abs(endX - foot.x) / 40));
    for (let i = 1; i <= steps; i++) local.push([lerp(foot.x, endX, i / steps), lerp(foot.y, jy, i / steps)]);
  } else {
    local = curve(c.x, c.y, c.dx, c.dy, jx, jy, hd.dx, hd.dy);
  }
  const spine = local.map(([x, y]) => [b.x + f * x, floor + y] as [number, number]);
  const sx = shake ? Math.sin(time * 47) * shake : 0;
  const warnTo = reach;
  return { coil, head, jx: b.x + f * jx + sx, jy: floor + jy, spine, warn, warnTo, shake };
}

/** the boxes that hurt during the lunge: the neck along the floor and the head (world), none at other times */
export function venomHurt(b: BossEntity, floor: number, time: number): Array<{ x: number; y: number; w: number; h: number }> {
  const br = b.ai;
  if (!br || br.move !== 'sweep' || br.state !== 'act') return [];
  const p = venomPose(b, floor, time);
  const f = b.facing < 0 ? -1 : 1;
  const tip = p.jx + f * flatHead('strike').ahead;
  // the body runs from the coil's front to the head: under the arch of the neck is no hiding place
  const foot = b.x + f * (b.width / 2 - 10);
  // during the dive the head is still coming down by the coil: only the head itself
  const out: Array<{ x: number; y: number; w: number; h: number }> = [];
  const hx0 = Math.min(p.jx, tip);
  const hx1 = Math.max(p.jx, tip);
  if (p.jy > floor - 80) {
    out.push({ x: hx0, y: floor - VF.headHurt, w: hx1 - hx0, h: VF.headHurt });
    const nx0 = Math.min(foot, p.jx);
    const nx1 = Math.max(foot, p.jx);
    if (nx1 - nx0 > 4) out.push({ x: nx0, y: floor - VF.neckHurt, w: nx1 - nx0, h: VF.neckHurt });
  }
  return out;
}

/** the punch target: the dazed head on the floor after a lunge; the raised head (out of reach) at other times */
export function venomWeak(b: BossEntity, floor: number): { x: number; y: number; w: number; h: number } | null {
  const p = venomPose(b, floor, 0);
  const f = b.facing < 0 ? -1 : 1;
  if (b.ai?.move === 'sweep' && b.ai.state === 'rec') {
    const tip = p.jx + f * flatHead('dazed').ahead;
    const x0 = Math.min(p.jx, tip);
    const x1 = Math.max(p.jx, tip);
    return { x: x0 - 6, y: floor - 96, w: x1 - x0 + 12, h: 96 };
  }
  const r = 60;
  return { x: p.jx + f * 50 - r, y: p.jy - 70 - r, w: r * 2, h: r * 2 };
}
