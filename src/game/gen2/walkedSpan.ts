/**
 * The walked span of a piece (ENG-16H 11-14, R-165.246; the lead's packet item 1, level.md rule 22: one engine rule for every stage of every
 * world): the part of a piece every run walks, between the FARTHEST point the leap or hop onto it can set him down and the EARLIEST point
 * the jump off it leaves. A petal laid at a fixed share of its piece (a socket's `t`) could sit where a fluid run never stands: behind
 * where the leap sets him down, or past where he jumps off (1-6, expert Normal seeds 1-40: twelve socket petals each missed in 10-26 of 40
 * runs, 22 sealed doors; ENG-16G's ranked miss list). The door counts only the petals inside their piece's walked span (petals.ts
 * markWalked, Collectible.walked; goals.ts goalCounts). It never decides where a petal goes: the lead's ruling INT-10d 11-15, placing by it
 * stripped 13 stages (6-2 73 -> 5); the socket lay and the fill lay as main does.
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

/** (a 'ride' ask, World 2's river: a log hands him onto the bank at its lip, no jump's touchdown; read as a bounce is: skipped) */
type Ask = { x0: number; x1: number; yTake: number; yLand: number; move: 'single' | 'double' | 'bounce' | 'ride' };
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
// (`dk`: the dials' key, read once by the caller: JSON of the dials on every lookup was a quarter of a build, ENG-PETAL)
const memo = <T extends number | boolean | undefined>(key: string, f: () => T, dk: string = dialsKey()): T => {
  const k = `${key}|${dk}`;
  if (MEMO.has(k)) return MEMO.get(k) as T;
  if (MEMO.size > 50_000) MEMO.clear();
  const r = f();
  MEMO.set(k, r);
  return r;
};
const vk = (v: Vine) => [v.x, v.topY, v.bottomY, v.swingAmp ?? vineAmp(v), v.swingPeriod ?? '', v.swingPhase ?? 0].map((n) => (typeof n === 'number' ? n.toFixed(2) : n)).join(',');

/** where the testers' let-go off liana `v` sets him down on `p`, the farthest of its holds (undefined: no hold's let-go lands on it) */
export function lianaTouchdown(v: Vine, p: Pick<Platform, 'x' | 'y' | 'width'>, dk?: string): number | undefined {
  return memo(`td:${vk(v)}:${p.x},${p.y},${p.width}`, () => lianaTouchdownOn(v, p), dk);
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
function hopCatches(v: Vine, x: number, y: number, dk?: string): boolean {
  return memo(`hop:${vk(v)}:${x},${y}`, () => hopCatchesAt(v, x, y), dk);
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
function reach(y: number, yLand: number, dk?: string): number | undefined {
  return memo(`reach:${Math.round(yLand - y)}`, () => {
    const d = jumpTouchdown(0, 0, Math.round(yLand - y), false);
    return d > 0 ? d : undefined;
  }, dk);
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
/** each piece's walked span, by the built pieces' list (the lay, the fill and the built-stage pass ask for the same pieces again: a
 *  quarter of a build, ENG-PETAL), checked against the lists' sizes, the piece's place and the dials, so a changed stage is read again */
const SPAN_CACHE = new WeakMap<readonly Platform[], Map<Platform, { k: string; r: { lo: number; hi: number; next?: Platform } }>>();
export function walkedSpan(p: Platform, st: SpanStage): { lo: number; hi: number; next?: Platform } {
  const dk = dialsKey();
  let m = SPAN_CACHE.get(st.platforms);
  if (!m) SPAN_CACHE.set(st.platforms, (m = new Map()));
  const k = `${st.platforms.length}|${st.vines.length}|${st.asks?.length ?? -1}|${st.away ? 1 : 0}|${p.x},${p.y},${p.width},${p.type}|${dk}`;
  const hit = m.get(p);
  if (hit && hit.k === k) return hit.r;
  const r = walkedSpanOf(p, st, dk);
  m.set(p, { k, r });
  return r;
}
function walkedSpanOf(p: Platform, st: SpanStage, dk: string): { lo: number; hi: number; next?: Platform } {
  const end = p.x + p.width;
  let lo = p.x, hi = end;
  let next: Platform | undefined;
  // (set down: a liana behind or over it whose let-go lands on it; a jump the route asks onto it)
  for (const v of st.vines) {
    if (!swinging(v) || v.x < p.x - NEAR || v.x > p.x + p.width / 2) continue;
    const t = lianaTouchdown(v, p, dk);
    if (t !== undefined) lo = Math.max(lo, t);
  }
  for (const a of st.asks ?? []) {
    if (!on(p, a.x1, a.yLand) || a.x0 >= a.x1 || a.move === 'bounce' || a.move === 'ride') continue;
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
  // (whether every plain run must land on it: a full run's jump off each piece behind it sets him down ON it, none past it; see `touched`)
  let landsOn = false, clears = false;
  for (const o of behind) {
    if (seam(o, p)) continue;
    const r = reach(o.y, p.y, dk);
    if (r === undefined) continue;
    const t = o.x + o.width + r;
    // (a flight that falls short of it is no way on: another piece or a double is)
    if (t < p.x) continue;
    if (t < end) landsOn = true;
    else clears = true;
    lo = Math.max(lo, Math.min(end, t));
  }
  // (left: a liana ahead whose catch is the way on; a jump the route asks off it)
  const ahead = st.vines.filter((v) => swinging(v) && v.x > p.x + p.width / 2 && v.x < end + NEAR && v.bottomY >= p.y - 160 && v.topY < p.y - 60).sort((a, b) => a.x - b.x)[0];
  if (ahead && hopCatches(ahead, end, p.y, dk)) {
    // (the earliest: the nearer he is the more of its swing he catches, so halved down to 8 px between a miss and a catch)
    let a = p.x, b = end;
    if (hopCatches(ahead, a, p.y, dk)) b = a;
    while (b - a > 8) { const m = Math.round((a + b) / 2); if (hopCatches(ahead, m, p.y, dk)) b = m; else a = m; }
    hi = Math.min(hi, b);
  }
  for (const a of st.asks ?? []) {
    if (!on(p, a.x0, a.yTake) || a.x1 <= a.x0 || a.move === 'bounce' || a.move === 'ride') continue;
    const dbl = a.move === 'double';
    // (the earliest take-off a full jump still lands on its far piece from: the far piece's near end less the jump's reach)
    const to = st.platforms.find((q) => q !== p && on(q, a.x1, a.yLand));
    const reach = jumpTouchdown(0, a.yTake, a.yLand, dbl);
    hi = Math.min(hi, Math.max(p.x, (to ? to.x : a.x1) + 10 - reach));
    next ??= to && !st.away?.(to) ? to : undefined;
  }
  // (left by a plain jump: to a piece ahead a full jump off its end reaches, the earliest take-off that still lands on it, never before
  //  the testers' far take-off; walked off across a seam, none)
  const lands = ahead2.filter((q) => !seam(p, q)).map((q) => ({ q, r: reach(p.y, q.y, dk) })).filter((h) => h.r !== undefined && end + h.r! >= h.q.x + 10).sort((a, b) => a.q.x - b.q.x);
  for (const { q, r } of lands) hi = Math.min(hi, Math.max(end - TAKEOFF_FAR, q.x + 10 - r!));
  // (a piece every run must TOUCH is part of the path (the lead's ruling A, 11-15 1:41 PM ET, INT-10c): no plain jump from behind clears it
  //  and a plain jump is the way off, so every run sets down on it and leaves at once (its span inverted). Its whole top is walked: its
  //  socket petals stay where the lay put them, sitting on it. Without this 6-2's pool stones (150-170 px) lost 198 of 201 sockets'
  //  petals, 73 -> 5, and twelve stages ran over Matt's 2-screen rule (petals.test spread))
  if (hi - lo < WALKED_MIN && landsOn && !clears && !ahead && lands.length && !st.away?.(p)) return { lo: p.x, hi: end };
  // (no span: the piece the way off it sets him down on, the liana's first, then the ask's, then the plain jump's: never one off the path)
  if (hi - lo < WALKED_MIN && ahead) {
    const q = st.platforms.filter((r) => r !== p && r.x >= end - 2 && r.x < ahead.x + NEAR && r.type !== 'bouncy' && !st.away?.(r)).sort((r1, r2) => r1.x - r2.x).find((r) => lianaTouchdown(ahead, r, dk) !== undefined);
    if (q) next = q;
  }
  if (hi - lo < WALKED_MIN && !next && lands.length) next = lands[0].q;
  return { lo, hi, ...(next ? { next } : {}) };
}

/** the middle tier's take-off before a piece's edge on a plain jump (px; the median of tools/inspect/firsttimer.ts FT_MIDDLE aimQ, the
 *  testers' own runs, R-165.59) */
export const TAKEOFF_MID = 58;
/** the pickup point over his feet (px): engine.ts collects a petal within 34 px of (x, y - 20) */
const PICK_UP = 20;
/** the shares of a hop's flight a petal goes at: the apex row only (INT-10 measured 1-6 against World 1's built band, 1-3 0.86 and
 *  1-5 1.04 petals an upright screen: the apex with the bank rows 0.95, 35% of screens bare; take-off, apex and touchdown 1.41, over it) */
export const ARC_AT = [0.5] as const;
export type HopArc = { from: Platform; to: Platform; takeoffX: number; landX: number; points: Array<{ x: number; y: number }> };
/**
 * The REQUIRED hops of the built stage and the arc each is flown on (INT-10, 11-15; the lead's ruling 11:10 AM ET: a hop between pieces
 * that every run must take is walked space, so its arc may hold petals, any stage, turned on by its brief: GraphBrief.petalArcs).
 * A hop is required where the way on from a piece to the next piece ahead cannot be walked (a gap wider than a seam, or a rise more than
 * a seam), a full run's jump from the piece reaches that piece, and no liana hangs between them (a swing is not a hop: over a liana gap a
 * jump's curve is not the swing's, BUILD-16b). Its arc is the middle tier's: a full run's jump held, taken off TAKEOFF_MID before the edge
 * (nearer it where that falls short: 20 px into the next piece), down onto the next piece; a flight that does not come down on it is no arc. Its points are where his pickup point is at each ARC_AT
 * share of the flight. Pieces off the path (`away`: a pit's floor, a hurt floor, a catch) are never a hop's ends.
 */
export function hopArcs(st: SpanStage): HopArc[] {
  const dk = dialsKey();
  const foot = st.platforms.filter((q) => footing(q, st)).sort((a, b) => a.x - b.x);
  const out: HopArc[] = [];
  for (const p of foot) {
    const end = p.x + p.width;
    const lands = foot.filter((q) => q !== p && q.x >= end - SEAM && q.x <= end + HOP_NEAR && !seam(p, q)).map((q) => ({ q, r: reach(p.y, q.y, dk) })).filter((h) => h.r !== undefined && end + h.r! >= h.q.x + 10).sort((a, b) => a.q.x - b.q.x);
    const q = lands[0]?.q;
    if (!q) continue;
    // (walked on: a seam, a step no higher than a seam, or a drop he walks off (no gap): not a required hop)
    if (q.x - end <= SEAM && p.y - q.y <= SEAM) continue;
    if (st.vines.some((v) => swinging(v) && v.x > p.x + p.width / 2 && v.x < q.x + q.width / 2)) continue;
    // (the middle tier's aim, or nearer the edge where that aim's jump falls short: a run takes off where the hop is made)
    const r = lands[0].r!;
    const takeoffX = Math.min(end, Math.max(p.x, end - TAKEOFF_MID, q.x + 20 - r));
    const b = { x: takeoffX, y: p.y, vx: PHYS.maxRun, vy: -PHYS.jumpV };
    const path: Array<{ x: number; y: number }> = [{ x: b.x, y: b.y }];
    let landX: number | undefined;
    for (let i = 1; i < 150; i++) {
      const prevY = b.y;
      airStep(b, DT, 1, true);
      path.push({ x: b.x, y: b.y });
      if (b.vy >= 0 && prevY <= q.y && b.y >= q.y) { landX = b.x; break; }
    }
    if (landX === undefined || landX < q.x || landX > q.x + q.width) continue;
    const n = path.length - 1;
    out.push({ from: p, to: q, takeoffX, landX, points: ARC_AT.map((s) => { const k = path[Math.round(s * n)]; return { x: Math.round(k.x), y: Math.round(k.y - PICK_UP) }; }) });
  }
  return out;
}
