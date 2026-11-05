/**
 * Bobbing crates (the designer's library, reference/engine/cp2/mechanics-exist.md "Bobbing crates"; the lead's piece 3, for Worlds 2, 6
 * and 10): wooden crates floating on still water, a crossing that needs timing. Each crate bobs on the water, then on its own cycle tips
 * (World 2's painted crate-down, the tell, STAGE-RULES §0b.7: a breaking thing shows it before it goes), sinks under for a moment, and
 * comes back up. Stand on one too long, or hop onto one going under, and he is in the water. The patience-and-hurry piece of a water
 * world (STAGE-RULES §0b.3): wait for the next crate to come up, then go before yours goes down.
 *
 * Behaviour reused (cited): a 'moving' platform carried as the lift carries him (engine.ts "Moving platforms" loop, the rider moved by
 * dy; lift.ts pickFloor); under the water it is `broken`, so the engine's floor check passes through it (engine.ts "Platform
 * Collisions": `if (plat.broken) return false`) and the stage's own water takes him (its river or water zone: river.ts, a teaching
 * river's `safe`). Its rest and bob are on the game clock, so every roll plays the same. Pure: no canvas here (pieces.ts draws it).
 */
import type { Platform } from '../types.ts';

export interface CrateInfo {
  /** the water's surface (y) it floats on */
  surfaceY: number;
  /** its top when it floats at rest (y): it rides this far over the water */
  restY: number;
  /** seconds for one whole cycle: afloat, tipping, under, coming back up */
  period: number;
  /** where in its cycle it is at game time 0 (0..1) */
  phase: number;
  /** the cycle's parts, as shares of the period: bobbing afloat, then tipping (the tell, still standable), then under */
  afloat: number;
  tip: number;
  under: number;
}

/** the tuned numbers, Normal and Easy (measured: piecesCrate.test.ts) */
export const CRATE = {
  /** its top (px): about a lily pad's (2-2's 124-144 after QA) on Easy; a little narrower on Normal */
  width: { normal: 110, easy: 136 },
  /** seconds a whole cycle takes */
  period: { normal: 4.2, easy: 5.6 },
  /** the shares: afloat / tipping / under (the rest of the cycle it comes back up) */
  afloat: { normal: 0.6, easy: 0.66 },
  tip: 0.16,
  under: { normal: 0.17, easy: 0.12 },
  /** how high its top rides over the water afloat (px: about 40% of the painted crate shows, as a crate floats; 22 read as a tray), how far it bobs (+-px), and how deep it goes under (px under the surface) */
  ride: 40,
  bob: 4,
  deep: 70,
  /** how far the tip sinks it before it goes (px) */
  tipSink: 14,
  /** the next crate of a row is this share of a cycle behind (a wave along the row: the one ahead is up as the one he is on goes) */
  stagger: 0.27,
};

export type CrateState = 'afloat' | 'tip' | 'under' | 'rise';
/** where the crate is in its cycle at game time t, and how far into that part (0..1) */
export function crateState(c: CrateInfo, t: number): { s: CrateState; k: number } {
  const u = ((((t / c.period + c.phase) % 1) + 1) % 1);
  if (u < c.afloat) return { s: 'afloat', k: u / c.afloat };
  if (u < c.afloat + c.tip) return { s: 'tip', k: (u - c.afloat) / c.tip };
  if (u < c.afloat + c.tip + c.under) return { s: 'under', k: (u - c.afloat - c.tip) / c.under };
  return { s: 'rise', k: (u - c.afloat - c.tip - c.under) / (1 - c.afloat - c.tip - c.under) };
}

/** its top at game time t (y) */
export function crateY(c: CrateInfo, t: number): number {
  const { s, k } = crateState(c, t);
  const deep = c.surfaceY + CRATE.deep;
  if (s === 'afloat') return c.restY + CRATE.bob * Math.sin(2 * Math.PI * k * 2);
  if (s === 'tip') return c.restY + CRATE.tipSink * k * k;
  if (s === 'under') return c.restY + CRATE.tipSink + (deep - c.restY - CRATE.tipSink) * Math.min(1, k * 3);
  return deep + (c.restY - deep) * (0.5 - 0.5 * Math.cos(Math.PI * k));
}
/** whether it can be stood on at game time t: afloat, tipping, and once its top is back over the water */
export function crateStandable(c: CrateInfo, t: number): boolean {
  const { s } = crateState(c, t);
  return s === 'afloat' || s === 'tip' || (s === 'rise' && crateY(c, t) <= c.surfaceY - 6);
}

/**
 * A row of `n` crates across still water from x0 to x1 (the banks' facing edges, the water's surface `surfaceY`), evenly spaced, each
 * `stagger` of a cycle behind the one before. Null when the water is the wrong width for n crates (each gap a short hop: 30-45% of a
 * plain jump's reach, as 2-2's lily ponds after QA).
 */
export function crateRow(o: { x0: number; x1: number; surfaceY: number; n: number; easy: boolean; phase?: number }): Array<Omit<Platform, 'id'>> | null {
  const set = o.easy ? 'easy' : 'normal';
  const w = CRATE.width[set];
  const gap = (o.x1 - o.x0 - o.n * w) / (o.n + 1);
  if (gap < 50 || gap > 85) return null;
  const out: Array<Omit<Platform, 'id'>> = [];
  for (let i = 0; i < o.n; i++) {
    const x = Math.round(o.x0 + gap + i * (w + gap));
    const c: CrateInfo = { surfaceY: o.surfaceY, restY: o.surfaceY - CRATE.ride, period: CRATE.period[set], phase: (((o.phase ?? 0) - i * CRATE.stagger) % 1 + 1) % 1,
      afloat: CRATE.afloat[set], tip: CRATE.tip, under: CRATE.under[set] };
    out.push({ x, y: c.restY, width: w, height: 24, type: 'moving', art: 'crate', crate: c });
  }
  return out;
}

/** the engine's frame step: where it is now, whether it can be stood on, how far it moved (to carry the rider) */
const moved = { dx: 0, dy: 0 };
export function stepCrate(p: Platform, t: number): { dx: number; dy: number } {
  const c = p.crate!;
  const y = crateY(c, t);
  moved.dx = 0;
  moved.dy = y - p.y;
  p.y = y;
  p.broken = !crateStandable(c, t);
  if (p.broken) moved.dy = 0;
  return moved;
}

/** the painted cells' measures (pieces.json crate-up 163 x 136, crate-down 171 x 151, read off their alpha): crate-up's body runs from
 *  x 3 to 156, its front rim (where he stands) at y 12; crate-down tips its top 16 px lower at the right */
export const CRATE_CELL = { up: { w: 163, h: 136, left: 3, right: 156, top: 12 }, down: { w: 171, h: 151, left: 6, right: 164, top: 22 } } as const;
