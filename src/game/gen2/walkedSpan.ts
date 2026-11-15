/**
 * The walked span of a piece (ENG-16H 11-14, R-165.246; the lead's packet item 1, level.md rule 22: one engine rule for every stage of every
 * world): the part of a piece every run walks, between the FARTHEST point the leap or hop onto it can set him down and the EARLIEST point
 * the jump off it leaves. A petal laid at a fixed share of its piece (a socket's `t`) could sit where a fluid run never stands: behind
 * where the leap sets him down, or past where he jumps off (1-6, expert Normal seeds 1-40: twelve socket petals each missed in 10-26 of 40
 * runs, 22 sealed doors; ENG-16G's ranked miss list). gen2 lays a pickup socket's petals inside its piece's walked span, and on a piece the
 * leap clears (no span), on the next piece he walks (pipeline.ts fillSockets).
 *
 * Read off the BUILT pieces (the platforms, lianas and asks as laid, never a section's data), by the engine's own flights on the stage's
 * setting (the build runs inside settingDials withSetting):
 * - set down by a liana: the testers' let-go (physics FORWARD_END, the jump held) from the top, middle and foot of its hold;
 * - set down by a jump the route asks (a LocalAsk landing on it): a full run's jump held (and the double, on an ask that is one);
 * - left for a liana: the earliest x a held running hop off it catches that liana at some moment of its swing (canGrabSwing, the vines' clock);
 * - left by a jump the route asks: the earliest x a full run's jump (the double, on an ask that is one) still lands on the ask's far piece.
 * Walked on and off, the span is the whole piece.
 */
import { airStep, canGrabSwing, forwardEndLands, PHYS, SWING, vineAmp, vinePeriod, type AirBody, type SwingVine } from '../physics.ts';
import { dialsKey } from '../settingDials.ts';
import type { Platform, Vine } from '../types.ts';

/** a span narrower than this is no span: he is on it for a stride or less (a petal there is a petal he flies past) */
export const WALKED_MIN = 24;
/** how far a liana or ask may lie from the piece and still be its way on or off (px, the longest leap the lay sets beside a perch) */
const NEAR = 700;
const DT = 1 / 30;

type Ask = { x0: number; x1: number; yTake: number; yLand: number; move: 'single' | 'double' | 'bounce' };
export type SpanStage = { platforms: readonly Platform[]; vines: readonly Vine[]; asks?: readonly Ask[] };

const swinging = (v: Vine) => (v.vineType === 'swing_liana' || v.isSwingingVine) && !v.off;
const sv = (v: Vine): SwingVine => ({ x: v.x, topY: v.topY, bottomY: v.bottomY, swingAmp: v.swingAmp ?? vineAmp(v), swingPeriod: v.swingPeriod, swingPhase: v.swingPhase ?? 0 });
const on = (p: Pick<Platform, 'x' | 'y' | 'width'>, x: number, y: number) => Math.abs(y - p.y) <= 2 && x >= p.x - 2 && x <= p.x + p.width + 2;

/** answers by geometry and the setting's dials (a build re-fills its sockets after each repair; the flights are the same) */
const MEMO = new Map<string, number | boolean | undefined>();
const memo = <T extends number | boolean | undefined>(key: string, f: () => T): T => {
  const k = `${key}|${dialsKey()}`;
  if (MEMO.has(k)) return MEMO.get(k) as T;
  if (MEMO.size > 50_000) MEMO.clear();
  const r = f();
  MEMO.set(k, r);
  return r;
};
const vk = (v: Vine) => [v.x, v.topY, v.bottomY, v.swingAmp ?? vineAmp(v), v.swingPeriod ?? '', v.swingPhase ?? 0].map((n) => (typeof n === 'number' ? n.toFixed(2) : n)).join(',');

/** where the testers' let-go off liana `v` sets him down on `p`, the farthest of its holds (undefined: no hold's let-go lands on it) */
export function lianaTouchdown(v: Vine, p: Pick<Platform, 'x' | 'y' | 'width'>): number | undefined {
  return memo(`td:${vk(v)}:${p.x},${p.y},${p.width}`, () => lianaTouchdownOn(v, p));
}
function lianaTouchdownOn(v: Vine, p: Pick<Platform, 'x' | 'y' | 'width'>): number | undefined {
  const A = sv(v), len = v.bottomY - v.topY;
  let far: number | undefined;
  for (const g of [Math.min(1, SWING.minLen / Math.max(1, len)), 0.7, 0.95]) {
    let at: number | undefined;
    forwardEndLands(A, (c: AirBody, _t: number, prevY: number) => {
      const hit = c.vy >= 0 && prevY <= p.y + 14 && c.y >= p.y && c.x >= p.x && c.x <= p.x + p.width;
      if (hit) at = c.x;
      return hit;
    }, [g]);
    if (at !== undefined) far = Math.max(far ?? -Infinity, at);
  }
  return far;
}

/** where a full run's jump off (x, y) toward +x comes down through height `yLand` (the double at its top when `dbl`) */
export function jumpTouchdown(x: number, y: number, yLand: number, dbl: boolean): number {
  const b = { x, y, vx: PHYS.maxRun, vy: -PHYS.jumpV };
  let used = false;
  for (let i = 1; i < 150; i++) {
    const prevY = b.y;
    if (dbl && !used && b.vy >= 0) { b.vy = -PHYS.doubleV; used = true; }
    airStep(b, DT, 1, true);
    if (b.vy >= 0 && prevY <= yLand && b.y >= yLand) return b.x;
  }
  return x;
}

/** does a held running hop off (x, y) catch liana `v` at some moment of its swing (24 moments of a period)? */
function hopCatches(v: Vine, x: number, y: number): boolean {
  return memo(`hop:${vk(v)}:${x},${y}`, () => hopCatchesAt(v, x, y));
}
function hopCatchesAt(v: Vine, x: number, y: number): boolean {
  const A = sv(v), per = vinePeriod(A);
  for (let k = 0; k < 24; k++) {
    const t0 = (per * k) / 24;
    const b = { x, y, vx: PHYS.maxRun, vy: -PHYS.jumpV };
    for (let i = 1; i < 60; i++) {
      airStep(b, DT, 1, true);
      if (canGrabSwing(b.x, b.y - 30, A, t0 + i * DT)) return true;
      if (b.y > y + 200) break;
    }
  }
  return false;
}

/**
 * The walked span of piece `p` on the built stage: [lo, hi] along its top, and the piece the way off it lands on (`next`: the leap off
 * it, for a piece the leap clears). lo is where the farthest arrival sets him down (its left end when he walks on), hi where the
 * earliest leave takes off (its right end when he walks off).
 */
export function walkedSpan(p: Platform, st: SpanStage): { lo: number; hi: number; next?: Platform } {
  const end = p.x + p.width;
  let lo = p.x, hi = end;
  let next: Platform | undefined;
  // (set down: a liana behind or over it whose let-go lands on it; a jump the route asks onto it)
  for (const v of st.vines) {
    if (!swinging(v) || v.x < p.x - NEAR || v.x > p.x + p.width / 2) continue;
    const t = lianaTouchdown(v, p);
    if (t !== undefined) lo = Math.max(lo, t);
  }
  for (const a of st.asks ?? []) {
    if (!on(p, a.x1, a.yLand) || a.x0 >= a.x1 || a.move === 'bounce') continue;
    lo = Math.max(lo, Math.min(end, jumpTouchdown(a.x0, a.yTake, a.yLand, a.move === 'double')));
  }
  // (left: a liana ahead whose catch is the way on; a jump the route asks off it)
  const ahead = st.vines.filter((v) => swinging(v) && v.x > p.x + p.width / 2 && v.x < end + NEAR && v.bottomY >= p.y - 160 && v.topY < p.y - 60).sort((a, b) => a.x - b.x)[0];
  if (ahead && hopCatches(ahead, end, p.y)) {
    // (the earliest: the nearer he is the more of its swing he catches, so halved down to 8 px between a miss and a catch)
    let a = p.x, b = end;
    if (hopCatches(ahead, a, p.y)) b = a;
    while (b - a > 8) { const m = Math.round((a + b) / 2); if (hopCatches(ahead, m, p.y)) b = m; else a = m; }
    hi = Math.min(hi, b);
  }
  for (const a of st.asks ?? []) {
    if (!on(p, a.x0, a.yTake) || a.x1 <= a.x0 || a.move === 'bounce') continue;
    const dbl = a.move === 'double';
    // (the earliest take-off a full jump still lands on its far piece from: the far piece's near end less the jump's reach)
    const to = st.platforms.find((q) => q !== p && on(q, a.x1, a.yLand));
    const reach = jumpTouchdown(0, a.yTake, a.yLand, dbl);
    hi = Math.min(hi, Math.max(p.x, (to ? to.x : a.x1) + 10 - reach));
    next ??= to;
  }
  // (no span: the piece the way off it sets him down on, the liana's first, then the ask's: the nearest one past this piece a let-go of
  //  that liana lands on)
  if (hi - lo < WALKED_MIN && ahead) {
    const q = st.platforms.filter((r) => r !== p && r.x >= end - 2 && r.x < ahead.x + NEAR && r.type !== 'bouncy').sort((r1, r2) => r1.x - r2.x).find((r) => lianaTouchdown(ahead, r) !== undefined);
    if (q) next = q;
  }
  return { lo, hi, ...(next ? { next } : {}) };
}
