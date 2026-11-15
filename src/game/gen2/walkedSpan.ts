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

/** the testers' FAR take-off: how far before a piece's edge a fluid run may leave it on a plain jump (px; the expert's 95th aim, the
 *  tier calibration from the testers' own runs, tools/inspect/firsttimer.ts FT_EXPERT aimQ, R-165.59). A run takes off between this far
 *  before the edge and the edge (ENG-PETAL 11-14: 1-6's creaky-landing:out, the expert left 131 px before its end, past the petal) */
export const TAKEOFF_FAR = 131;
/** a seam this narrow, the tops this close, is walked across, not jumped (px) */
const SEAM = 10;
/** how far a plain jump's take-off may lie behind a piece, or its landing ahead of it, and still be its way on or off (px) */
const HOP_NEAR = 460;

type Ask = { x0: number; x1: number; yTake: number; yLand: number; move: 'single' | 'double' | 'bounce' };
/**
 * The built stage as the walked path reads it. `away`: the pieces OFF the path (ENG-PETAL 11-14, R-165.246; petals.ts offPath, the
 * stage's own record of its falls): a soft pit's floor or stair below its lower lip, a hurt floor, a catch. He stands on one only after a
 * miss, so none is ever a way on, a way off or the piece a cleared piece's petals move to.
 */
export type SpanStage = { platforms: readonly Platform[]; vines: readonly Vine[]; asks?: readonly Ask[]; away?: (p: Platform) => boolean };
/** the jumps the route asks, by built stage (pipeline.ts laidAsks reads it): the petal fill on the finished stage reads the same ones */
export const LAID_ASKS = new WeakMap<object, readonly Ask[]>();

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

/** the plain jumps' reach: where a full run's jump held off (0, y) comes down through `yLand` (none: it never gets that high) */
function reach(y: number, yLand: number): number | undefined {
  return memo(`reach:${Math.round(yLand - y)}`, () => {
    const d = jumpTouchdown(0, 0, Math.round(yLand - y), false);
    return d > 0 ? d : undefined;
  });
}
/** a piece a plain jump stands him on: firm, not swinging or moving, not off the path */
const footing = (q: Platform, st: SpanStage) => !q.broken && (q.type === 'solid' || q.type === 'fragile') && !st.away?.(q);
/** a walk across a seam: the next piece's top meets this one's end */
const seam = (a: Pick<Platform, 'x' | 'y' | 'width'>, b: Pick<Platform, 'x' | 'y'>) => Math.abs(b.x - (a.x + a.width)) <= SEAM && Math.abs(b.y - a.y) <= SEAM;

/**
 * The walked span of piece `p` on the built stage: [lo, hi] along its top, and the piece the way off it lands on (`next`: the leap off
 * it, for a piece the leap clears). lo is where the farthest arrival sets him down (its left end when he walks on), hi where the
 * earliest leave takes off (its right end when he walks off).
 *
 * The ONE walked-path model (ENG-PETAL 11-14, R-165.246; the lead's packet item 1, level.md rule 22: every stage of every world). The
 * gen2 socket lay (pipeline.ts fillSockets) and the petal fill (petals.ts fillGaps) both read it. Besides the lianas and the jumps the
 * route asks, the PLAIN jumps a fluid run takes from piece to piece (1-6, the expert's sealed doors: hop-ups, rests and chain links he
 * clears in the air, a landing set down past the span, a take-off before it; ENG-16I's classes A, B, D):
 *   - set down by a plain jump: from any piece behind it on the path, a full run's jump held from that piece's end (the farthest a
 *     run's flight carries him); a flight that comes down past the piece clears it;
 *   - left by a plain jump: to any piece ahead of it on the path, the earliest take-off that still lands on it, and never earlier than
 *     TAKEOFF_FAR before the edge (where the testers leave);
 *   - a seam walked across is no jump; a piece off the path (`away`) is no way on or off, and never `next` (class C: a pit's floor).
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
  // (set down by a plain jump: a full run's jump held off the end of a piece behind it; walked on across a seam, none)
  const behind: Platform[] = [];
  const ahead2: Platform[] = [];
  for (const o of st.platforms) {
    if (o === p || !footing(o, st)) continue;
    const oEnd = o.x + o.width;
    if (o.x < p.x && oEnd <= p.x + SEAM && oEnd >= p.x - HOP_NEAR) behind.push(o);
    else if (o.x >= end - SEAM && o.x <= end + HOP_NEAR) ahead2.push(o);
  }
  for (const o of behind) {
    if (seam(o, p)) continue;
    const r = reach(o.y, p.y);
    if (r === undefined) continue;
    const t = o.x + o.width + r;
    // (a flight that falls short of it is no way on: another piece or a double is)
    if (t < p.x) continue;
    lo = Math.max(lo, Math.min(end, t));
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
    next ??= to && !st.away?.(to) ? to : undefined;
  }
  // (left by a plain jump: to a piece ahead a full jump off its end reaches, the earliest take-off that still lands on it, never before
  //  the testers' far take-off; walked off across a seam, none)
  const lands = ahead2.filter((q) => !seam(p, q)).map((q) => ({ q, r: reach(p.y, q.y) })).filter((h) => h.r !== undefined && end + h.r! >= h.q.x + 10).sort((a, b) => a.q.x - b.q.x);
  for (const { q, r } of lands) hi = Math.min(hi, Math.max(end - TAKEOFF_FAR, q.x + 10 - r!));
  // (no span: the piece the way off it sets him down on, the liana's first, then the ask's, then the plain jump's: never one off the path)
  if (hi - lo < WALKED_MIN && ahead) {
    const q = st.platforms.filter((r) => r !== p && r.x >= end - 2 && r.x < ahead.x + NEAR && r.type !== 'bouncy' && !st.away?.(r)).sort((r1, r2) => r1.x - r2.x).find((r) => lianaTouchdown(ahead, r) !== undefined);
    if (q) next = q;
  }
  if (hi - lo < WALKED_MIN && !next && lands.length) next = lands[0].q;
  return { lo, hi, ...(next ? { next } : {}) };
}

/** how many pieces forward a cleared piece's petals may move (a chain of pieces he clears, one after another) */
const HOPS = 6;
/**
 * The piece a petal laid on `p` goes on, and its walked span: `p` when he walks it; on a piece he clears in the air (no span), the next
 * piece the way off it sets him down on, and on, until one is walked. Undefined: none within HOPS (no petal: never one he flies past).
 */
export function walkedPiece(p: Platform, st: SpanStage): { piece: Platform; lo: number; hi: number } | undefined {
  const seen = new Set<Platform>();
  let q: Platform | undefined = p;
  for (let k = 0; q && k <= HOPS && !seen.has(q); k++) {
    seen.add(q);
    if (st.away?.(q)) return undefined;
    const ws = walkedSpan(q, st);
    if (ws.hi - ws.lo >= WALKED_MIN) return { piece: q, lo: ws.lo, hi: ws.hi };
    q = ws.next;
  }
  return undefined;
}
