/**
 * vineField — the vine field (1-4.md "The vine field", R-165.177; F15's FEEL-LATTICE.md): many short climbs hung side by side, and how
 * Pokey's two hands work among them. A piece of the engine for any stage (no stage ids here): a climb is in a field when its piece says
 * so (`Vine.field`), and every number lives on that piece, so a stage tunes its own field.
 *
 * Matt's control rule (11-12, 10:32 PM ET), no new controls: "you start with one climbing vine. If you go towards another vine, then he
 * hangs on with both hands... If you do it again towards the new vine, he'll let go of the previous vine, go to the new vine."
 *   - one hand on A, a push toward a field vine B within reach (`reach`) that hangs at his height: both hands (A and B);
 *   - both hands, a push toward either: he keeps that one and lets go of the other (one hand again, on it);
 *   - a push with no vine there: as on any climb (held, it hops him off; a jump leaps off).
 * Speeds (times the climb's own speed, vinePair.ts climbSpeedOf: 220 px/s on a single, unchanged): one hand up 1x, down a slide
 * (`slide`); two hands up `twoUp` (Matt's 1.6x), down `twoDown` (slow). Under a fruit cluster on a vine he holds, climbing up pushes it
 * up its vine at `push` (one hand) or `pushTwo` (two hands), and down is never a slide; at the vine's top it tears free and drops.
 *
 * Pure: the engine (engine.ts, the climb) calls these with its own state; tests call them straight (vineField.test.ts).
 */
import type { Vine } from './types.ts';
import { climbSpeedOf } from './vinePair.ts';

/** a field vine's numbers: reach (px between two vines' lines for both hands) and its speeds (times its climb speed) */
export interface FieldFeel {
  reach: number;
  slide: number;
  twoUp: number;
  twoDown: number;
  push: number;
  pushTwo: number;
}

/** 1-4.md and FEEL-LATTICE.md §3-7: vines 70-90 px apart are in reach; slide 2x (the room's sign tries 1.6x); two hands 1.6x up, 0.5x
 *  down; pushing 0.6x, 1.0x on two hands */
export const FIELD_FEEL: Readonly<FieldFeel> = { reach: 90, slide: 2, twoUp: 1.6, twoDown: 0.5, push: 0.6, pushTwo: 1 };

/** a field vine's feel: its piece's own numbers over the defaults */
export function feelOf(v: Pick<Vine, 'field'>): FieldFeel {
  return v.field === true || !v.field ? FIELD_FEEL : { ...FIELD_FEEL, ...v.field };
}

/** which vines he holds: `a` always, `b` too on two hands */
export interface Hands {
  a: Vine;
  b: Vine | null;
}

/** whether he can hold `v` at feet height `y` (its span, with the climb's own few px of give: engine.ts clamps topY - 4 .. bottomY + 4) */
const spans = (v: Vine, y: number) => y >= v.topY - 4 && y <= v.bottomY + 4;

/**
 * The field vine nearest `from` on side `dir` (-1 left, 1 right) within its reach that hangs at his height, or null. `skip` is a vine he
 * already holds (it is never the one reached for).
 */
export function neighbour(from: Vine, dir: -1 | 1, y: number, vines: readonly Vine[], skip?: Vine | null): Vine | null {
  if (!from.field) return null;
  const reach = feelOf(from).reach;
  let best: Vine | null = null;
  for (const v of vines) {
    if (v === from || v === skip || !v.field || v.off || v.vineType !== 'tree_climb') continue;
    const d = (v.x - from.x) * dir;
    if (d <= 0 || d > reach || !spans(v, y)) continue;
    if (!best || d < (best.x - from.x) * dir) best = v;
  }
  return best;
}

/**
 * A push toward `dir` while climbing (Matt's rule). Returns the new hands, or null when there is nothing there to take (the push is an
 * ordinary sideways push: held, it hops him off).
 */
export function stepHands(h: Hands, dir: -1 | 1, y: number, vines: readonly Vine[]): Hands | null {
  if (h.b) {
    // both hands: keep the one he pushes toward, let go of the other
    const [l, r] = h.a.x < h.b.x ? [h.a, h.b] : [h.b, h.a];
    return { a: dir < 0 ? l : r, b: null };
  }
  const n = neighbour(h.a, dir, y, vines);
  return n ? { a: h.a, b: n } : null;
}

/** where he hangs: on one vine's line, or between the two */
export const handsX = (h: Hands): number => (h.b ? (h.a.x + h.b.x) / 2 : h.a.x);

/**
 * The hands after a move to feet height `y`: a vine whose span he has left lets go (the other keeps him: a short vine runs out under a
 * long one). Null when neither spans him (the engine's own top and bottom exits come first, so this is the end of a field vine).
 */
export function keepHands(h: Hands, y: number): Hands | null {
  if (!h.b) return h;
  const a = spans(h.a, y), b = spans(h.b, y);
  if (a && b) return h;
  if (a) return { a: h.a, b: null };
  if (b) return { a: h.b, b: null };
  return null;
}

/** the span he can climb on these hands (both hands: where both hang) */
export function handsSpan(h: Hands): { top: number; bottom: number } {
  return h.b ? { top: Math.max(h.a.topY, h.b.topY), bottom: Math.min(h.a.bottomY, h.b.bottomY) } : { top: h.a.topY, bottom: h.a.bottomY };
}

/** his speed on these hands (px/s, up or down), pushing a cluster or not. Off a field, the climb's own speed both ways */
export function handsSpeed(h: Hands, up: boolean, pushing: boolean): number {
  const base = climbSpeedOf(h.a);
  if (!h.a.field) return base;
  const f = feelOf(h.a);
  if (up) return base * (pushing ? (h.b ? f.pushTwo : f.push) : h.b ? f.twoUp : 1);
  // (under a cluster, no slide: FEEL-LATTICE §7)
  return base * (h.b ? f.twoDown : pushing ? 1 : f.slide);
}

/** a fruit cluster snagged on a field vine (1-4.md option A): `y` its bottom, `h` its height; it falls once torn free at the vine's top */
export interface VineCluster {
  id: number;
  vine: number;
  y: number;
  h: number;
  /** torn free: falling (vy px/s), then gone */
  falling?: boolean;
  vy?: number;
  gone?: boolean;
}

/** how far above his feet his reaching hands are while climbing (px; his drawn height is 89.1: heroSprite.ts, LESSONS D41) */
export const HANDS_UP = 78;

/** the snagged cluster on a vine he holds that his hands are under now (within `slack` px), or null */
export function clusterAbove(h: Hands, y: number, clusters: readonly VineCluster[], slack = 2): VineCluster | null {
  let best: VineCluster | null = null;
  for (const c of clusters) {
    if (c.falling || c.gone || (c.vine !== h.a.id && c.vine !== h.b?.id)) continue;
    const gap = y - HANDS_UP - c.y;
    if (gap > slack || gap < -40) continue;
    if (!best || c.y > best.y) best = c;
  }
  return best;
}

/**
 * Pushes: with his hands at `y - HANDS_UP` after a climb up, every snagged cluster on a held vine whose bottom is above his hands is
 * pushed up to them; one that reaches its vine's top tears free (returned, it falls from here). His feet never pass under a cluster's
 * bottom by more than HANDS_UP: the engine climbs at handsSpeed(.., pushing) while one is above.
 */
export function pushClusters(h: Hands, y: number, clusters: VineCluster[]): VineCluster[] {
  const torn: VineCluster[] = [];
  const hands = y - HANDS_UP;
  for (const c of clusters) {
    if (c.falling || c.gone) continue;
    const v = c.vine === h.a.id ? h.a : c.vine === h.b?.id ? h.b : null;
    // (only one his hands have come up to: its bottom between his hands and his feet; one wholly below him is not his)
    if (!v || c.y <= hands || c.y - c.h >= y) continue;
    c.y = hands;
    if (c.y - c.h <= v.topY) {
      c.falling = true;
      c.vy = 0;
      torn.push(c);
    }
  }
  return torn;
}

/** the lowest his feet may go on these hands: on top of a snagged cluster below him on a held vine (it is snagged: he cannot pass it) */
export function floorUnder(h: Hands, y: number, clusters: readonly VineCluster[]): number {
  let lo = Infinity;
  for (const c of clusters) {
    if (c.falling || c.gone || (c.vine !== h.a.id && c.vine !== h.b?.id)) continue;
    const top = c.y - c.h;
    if (top >= y - 0.5) lo = Math.min(lo, top);
  }
  return lo;
}

/** a torn cluster's fall, a frame (gravity; gone below `floor`) */
export function fallCluster(c: VineCluster, dt: number, floor: number) {
  if (!c.falling || c.gone) return;
  c.vy = (c.vy ?? 0) + 1400 * dt;
  c.y += c.vy * dt;
  if (c.y - c.h > floor + 60) c.gone = true;
}
