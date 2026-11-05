/**
 * The slung log (the designer's library, reference/engine/cp2/mechanics-exist.md "Slung log"; the lead's piece 2): a log hung on two
 * ropes from a bough overhead, swinging side to side across a gap. He rides it over and steps off at the far end of its swing. It is the
 * pendulum kin of the moving platform (R-164.9: it lets 2-7 teach moving platforms).
 *
 * The two ropes are the same length and tied the same distance apart on the bough as on the log, so the log stays level as it swings
 * (a parallelogram): every point of it travels the same arc, radius `len`, round its own tie. The swing runs on the game clock (as the
 * lianas' self-swing does, physics.ts vineAngle), never on forces, so a rider cannot pump it and every roll plays the same.
 *
 * Behaviour reused from the engine (cited): it is a 'moving' platform (types.ts Platform.type), carried and stood on as the lift is
 * (engine.ts "Moving platforms" loop: plat.y set from liftY, the rider carried by dy; lift.ts pickFloor puts him on it over a still
 * floor); its x span is given to the reach checks as baseX +- moveRange (levelCheck.ts ext, flowerReach.ts, stageMetrics.ts), the
 * same fields the sine sliders use (stageGenerator.ts:924). Pure: no canvas here (slingArt.ts draws it).
 */
import type { Platform } from '../types.ts';

export interface SlingInfo {
  /** the log's left x and its top y when it hangs straight down (the bottom of its swing) */
  restX: number;
  restY: number;
  /** the ropes' length, tie to the top of the log's rope stub (px) */
  len: number;
  /** the swing's size (radians each way) */
  amp: number;
  /** seconds for one full swing, there and back */
  period: number;
  /** where in its swing it is at game time 0 (radians) */
  phase: number;
  /** the top of the bough the ropes are tied over (y) */
  tieY: number;
}

/** the log's tilt from straight down at game time t (radians; + swings right) */
export const slingAngle = (s: SlingInfo, t: number) => s.amp * Math.sin((2 * Math.PI * t) / s.period + s.phase);

/** where the log's top-left is at game time t (written into `out`: no allocation per frame, PERFORMANCE-RULES §3.1) */
export function slingAt(s: SlingInfo, t: number, out: { x: number; y: number }): { x: number; y: number } {
  const a = slingAngle(s, t);
  out.x = s.restX + s.len * Math.sin(a);
  out.y = s.restY - s.len * (1 - Math.cos(a));
  return out;
}

/** how far the log reaches each way from its rest x (px): what the reach checks are given as moveRange */
export const slingReach = (s: SlingInfo) => s.len * Math.sin(s.amp);
/** how much higher it rides at the ends of its swing than at the bottom (px) */
export const slingRise = (s: SlingInfo) => s.len * (1 - Math.cos(s.amp));
/** its fastest (at the bottom of the swing, px/s) */
export const slingTopSpeed = (s: SlingInfo) => (s.amp * s.len * 2 * Math.PI) / s.period;

/** the slung log's tuned numbers, Normal and Easy (each a measured choice: sling.test.ts) */
export const SLING = {
  /** the log's walkable top on Normal / Easy (px): Easy's landings about 1.25 times Normal's (the designer's pacing ruling A) */
  width: { normal: 180, easy: 225 },
  /** seconds a full swing takes: slower than a liana's 2.85 s (physics.ts), a heavy log; Easy slower still, as Easy's lianas (3.3 s) */
  period: { normal: 3.4, easy: 4.0 },
  /** the swing, each way (rad) */
  amp: 0.42,
  /** the ropes (px): long enough to read as hanging from the canopy, short enough that the bough stays on a phone held sideways (390 tall) */
  len: 230,
  /** the log's rest top under the banks' (px): it rides up 20 px at the ends of its swing, so it meets each bank a short step down */
  drop: 40,
  /** how close its ends come to each bank at the ends of its swing (px): the measured board and dismount windows (sling.test.ts) */
  near: [30, 90] as [number, number],
};

/**
 * A slung log over the gap between two banks' facing edges (x0 the near bank's right edge, x1 the far bank's left edge, both tops at
 * `bankY`): it hangs centred over the gap from two limbs, its rest top `drop` under the banks', and swings so its ends come
 * within `near` px of each bank. What holds it up is laid with it: a limb from each bank's kapok (real boughs, World 1's kit paints them),
 * one rope over each, and the two kapoks (the stage's scenery trunks, ProtoExtras.trunks, the same shape the mixer's supports() makes), so nothing
 * stands in the gap behind the swing and nothing floats.
 *
 * Returns null when the gap is the wrong size for it (too narrow: it would knock into the banks; too wide: the ends of its swing are out
 * of a short hop).
 */
export function slungLog(o: { x0: number; x1: number; bankY: number; easy: boolean; phase?: number; drop?: number }): {
  log: Omit<Platform, 'id'>; boughs: Array<Omit<Platform, 'id'>>; trunks: Array<{ x: number; topY: number; bottomY: number; w: number }>;
} | null {
  const w = o.easy ? SLING.width.easy : SLING.width.normal;
  const period = o.easy ? SLING.period.easy : SLING.period.normal;
  const gap = o.x1 - o.x0;
  const len = SLING.len;
  const amp = SLING.amp;
  const reach = len * Math.sin(amp);
  // at the ends of its swing the log's end is `near` from the bank: room to land on it, never inside the bank
  const near = (gap - w) / 2 - reach;
  if (near < SLING.near[0] || near > SLING.near[1]) return null;
  const restX = Math.round(o.x0 + (gap - w) / 2);
  const restY = o.bankY + (o.drop ?? SLING.drop);
  const s: SlingInfo = { restX, restY, len, amp, period, phase: o.phase ?? 0, tieY: Math.round(restY - len - STUB * logScale(w)) };
  const log: Omit<Platform, 'id'> = {
    x: restX, y: restY, width: w, height: 30, type: 'moving', style: 'log', art: 'sling', sling: s,
    baseX: restX, moveRange: Math.round(reach), moveSpeed: (2 * Math.PI) / period, swayOffset: s.phase,
  };
  // (a limb from each bank's kapok reaching out over the gap, one rope tied over each limb's top: two short limbs at their painted
  // size, not one long one, whose painted bromeliad stretched into a smear 5 times its width; stills 11-05)
  const k = logScale(w);
  const tieL = restX + (LOG_CELL.ropes[0] - LOG_CELL.left) * k, tieR = restX + (LOG_CELL.ropes[1] - LOG_CELL.left) * k;
  const boughs: Array<Omit<Platform, 'id'>> = [
    { x: Math.round(o.x0 - 90), y: s.tieY, width: Math.round(tieL + BOUGH_PAST - (o.x0 - 90)), height: 24, type: 'solid', style: 'branch' },
    { x: Math.round(tieR - BOUGH_PAST), y: s.tieY, width: Math.round(o.x1 + 90 - (tieR - BOUGH_PAST)), height: 24, type: 'solid', style: 'branch' },
  ];
  const trunk = (x: number) => ({ x: Math.round(x), topY: Math.round(s.tieY - 400), bottomY: Math.round(o.bankY + 30), w: 1.15 });
  return { log, boughs, trunks: [trunk(o.x0 - 50), trunk(o.x1 + 50)] };
}

/** how far each limb reaches past its rope's tie (px) */
const BOUGH_PAST = 40;

/** the painted cell's measures (src/assets/pieces/pieces.json 'slung-log', 487 x 186, read off its alpha by the packer's check):
 *  the log's walkable top runs from x 20 to 475 at y 62; the ropes' stubs leave the cell's top at x 49 and 434.5, 13 wide */
export const LOG_CELL = { w: 487, h: 186, top: 62, left: 20, right: 475, ropes: [49, 434.5], ropeW: 13 } as const;
const LOG_TOP_W = LOG_CELL.right - LOG_CELL.left;
/** the stubs' height over the log's top in the cell (the ropes run from the cell's top edge) */
const STUB = LOG_CELL.top;

/** the scale the log's picture is drawn at for a platform this wide */
export const logScale = (width: number) => width / LOG_TOP_W;

/** the two rope ties on the bough and the two rope ends on the log, where it is now (for the art and the support test; the same two
 *  objects every call, no allocation per frame) */
const ends = [{ tx: 0, ty: 0, ex: 0, ey: 0 }, { tx: 0, ty: 0, ex: 0, ey: 0 }];
export function slingRopes(p: Platform, s: SlingInfo): ReadonlyArray<{ tx: number; ty: number; ex: number; ey: number }> {
  const k = logScale(p.width);
  for (let i = 0; i < 2; i++) {
    const ox = (LOG_CELL.ropes[i] - LOG_CELL.left) * k;
    const e = ends[i];
    e.tx = s.restX + ox;
    e.ty = s.tieY;
    e.ex = p.x + ox;
    e.ey = p.y - STUB * k;
  }
  return ends;
}

/** the engine's frame step for a slung log: where it is now, and how far it moved (to carry the rider, as the lift does) */
const at = { x: 0, y: 0 };
const moved = { dx: 0, dy: 0 };
export function stepSling(p: Platform, t: number): { dx: number; dy: number } {
  slingAt(p.sling!, t, at);
  moved.dx = at.x - p.x;
  moved.dy = at.y - p.y;
  p.x = at.x;
  p.y = at.y;
  return moved;
}
