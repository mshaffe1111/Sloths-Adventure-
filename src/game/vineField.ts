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
  /** torn free: the sound wood it comes down on (y), set as it tears (clusterLand); unset, it falls out of the world */
  land?: number;
  /** torn free: how far it has bounced out of its column (px, away from his body; it never falls through his hands) */
  dx?: number;
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
export function pushClusters(h: Hands, y: number, clusters: VineCluster[], topOf: (v: Vine, h: number, y: number) => number = (v) => v.topY): VineCluster[] {
  const torn: VineCluster[] = [];
  const hands = y - HANDS_UP;
  for (const c of clusters) {
    if (c.falling || c.gone) continue;
    const v = c.vine === h.a.id ? h.a : c.vine === h.b?.id ? h.b : null;
    // (only one his hands have come up to: its bottom between his hands and his feet; one wholly below him is not his)
    if (!v || c.y <= hands || c.y - c.h >= y) continue;
    c.y = hands;
    if (c.y - c.h <= topOf(v, c.h, c.y)) {
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

/**
 * A torn cluster's fall, a frame (gravity). It comes down on `c.land` (the sound wood under its column, clusterLand) and is gone there:
 * true on the frame it lands (the engine thumps it down as a drop-trap load: castPlay.ts loadLands). With no land it is gone below
 * `floor`, as LATTICE's room had it. It bounces out of its column, away from `fromX` (his middle), by CLUSTER_OUT over its first fall,
 * so a cluster he pushed free never falls through him (it is his own push: it never hurts him, 1-4.md beat 9 "What falls on me can help me").
 */
export function fallCluster(c: VineCluster, dt: number, floor: number, fromX?: number, colX?: number): boolean {
  if (!c.falling || c.gone) return false;
  c.vy = (c.vy ?? 0) + 1400 * dt;
  c.y += c.vy * dt;
  if (fromX !== undefined && colX !== undefined) {
    const dir = colX >= fromX ? 1 : -1;
    c.dx = dir * Math.min(CLUSTER_OUT, Math.abs(c.dx ?? 0) + 240 * dt);
  }
  if (c.land !== undefined && c.y >= c.land) {
    c.y = c.land;
    c.gone = true;
    return true;
  }
  if (c.y - c.h > floor + 60) c.gone = true;
  return false;
}

/** how far a torn cluster bounces out of its column as it falls (px): past his body's half width on the vine (POD.hands is 26) */
export const CLUSTER_OUT = 34;

/** the sound wood a cluster torn at `y` on vine `v` comes down on: the highest standable top under it in its column (a shut gate's
 *  bough is no footing), or undefined when none is */
export function clusterLand(v: Vine, y: number, platforms: readonly { x: number; y: number; width: number; broken?: boolean; id?: number }[], skip?: ReadonlySet<number>): number | undefined {
  let best: number | undefined;
  for (const q of platforms) {
    if (q.broken || (q.id !== undefined && skip?.has(q.id))) continue;
    if (v.x < q.x - CLUSTER_OUT || v.x > q.x + q.width + CLUSTER_OUT || q.y <= y) continue;
    if (best === undefined || q.y < best) best = q.y;
  }
  return best;
}

// ───────────────────────────── the cluster gate (1-4.md engine piece 7) ─────────────────────────────

/**
 * A bough shut by fruit (1-4.md option A, "Lift the bough"): the clusters snagged on the field vines under it weigh it down. Shut, it
 * sags (its far end down by GATE.sag, less a notch for each cluster freed) and is NO footing: it cannot be stood on, and a climb up a
 * vine whose top is at it stops there (no vault onto a bough that is not there to stand on). Each cluster pushed free lifts it a notch;
 * on the last it springs open, level and sound. His order: the clusters are freed in any order. The way up from it is the stage's.
 */
export interface ClusterGate {
  id: number;
  /** the bough's platform id */
  platform: number;
  /** the clusters that hold it down, by id */
  clusters: number[];
  /** which end is the far one, the end that sags (-1 its left end, 1 its right): the end away from where he climbs up to it */
  far: -1 | 1;
  /** the ways up FROM the bough (vine ids: a climb standing on it), held down with it while it is shut (off, and not drawn: a way he
   *  could hop to from a field vine's top would let him round the gate), let up when it opens */
  ways?: number[];
  /** plain boughs at its height that touch it (platform ids): held with it while it is shut (no footing, not drawn), so a hop off a
   *  field vine's top never lands at the gate's height round the gate; whole again when it opens */
  with?: number[];
}

export const GATE = {
  /** how far the far end sags with every cluster on (px; the near end stays put) */
  sag: 56,
  /** seconds a notch takes to lift, and the spring open on the last */
  lift: 0.3,
  spring: 0.45,
  /** a vine's top this near a shut gate's bough (px, up or down) is under it: the climb stops short of the vault */
  under: 30,
  /** a shut gate is a lid from below, met by his DRAWN head (Matt, 11-14: "on Pokey's head as a collision thing with the platform... his
   *  shoulders... just enough to get the fruit up"): rising under it, on a climb or a jump, his feet stop `head` px under the bough's DRAWN
   *  underside. `head` is his drawn height (heroSprite.ts HERO_UNITS 66 x HERO_SPRITE_SCALE 1.35 = 89.1, LESSONS D41); `depth` is the
   *  painted bough's underside under its walk line, a share of its walk span (w14-roughbough.webp: the median opaque underside, row 115,
   *  is 73 px under its walk line 42 on a 576 px walk span), so his head meets the wood the player sees, sagged as drawn */
  head: 89,
  depth: 73 / 576,
  /** a fig under a shut bough tears free this near its full push (px): the slope between his two hands' lines under a sagging bough */
  slack: 8,
  /** and this far past either end of its bough (px: his body's half width, so a leap from an end vine cannot round it) */
  lidSide: 22,
  /** seconds a gate's thorn tangle shudders as a fig locks in, and takes to pull back off the bough after the last */
  settle: 0.4,
  pull: 0.7,
} as const;

/** how many of a gate's clusters are still snagged */
export const gateLeft = (g: ClusterGate, clusters: readonly VineCluster[]): number =>
  g.clusters.filter((id) => clusters.some((c) => c.id === id && !c.falling && !c.gone)).length;

/** is the gate shut (a cluster is still on it)? */
export const gateShut = (g: ClusterGate, clusters: readonly VineCluster[]): boolean => gateLeft(g, clusters) > 0;

/** how far its far end sags now (px): GATE.sag at full load, a notch less for each freed, none once open */
export const gateSag = (g: ClusterGate, clusters: readonly VineCluster[]): number =>
  g.clusters.length ? (GATE.sag * gateLeft(g, clusters)) / g.clusters.length : 0;

/**
 * The stage as it is once every fig gate is open (every cluster freed): each gate's bough, the boughs held with it and the ways up from
 * it whole again, as fieldPlay.ts lets them up on the last cluster. A copy: the stage passed in is not changed. What a tool walks when
 * it asks where he goes on a field stage (the gates' own fairness is gateFaults'), as a puzzle room's stage is walked solved.
 */
export function gatesOpened<S extends { platforms: readonly { id: number; broken?: boolean }[]; vines: readonly Vine[]; gates?: readonly ClusterGate[] }>(st: S): S {
  if (!st.gates?.length) return st;
  const boughs = new Set<number>();
  const ways = new Set<number>();
  for (const g of st.gates) {
    boughs.add(g.platform);
    for (const id of g.with ?? []) boughs.add(id);
    for (const id of g.ways ?? []) ways.add(id);
  }
  return {
    ...st,
    platforms: st.platforms.map((q) => (boughs.has(q.id) ? { ...q, broken: false } : q)),
    vines: st.vines.map((v) => (ways.has(v.id) ? { ...v, off: false } : v)),
  };
}

/** the shut gate over a vine's top (its bough within GATE.under of the top, over the vine's line), or null */
export function gateOver(v: Vine, gates: readonly ClusterGate[], clusters: readonly VineCluster[], platforms: readonly { id: number; x: number; y: number; width: number }[]): ClusterGate | null {
  for (const g of gates) {
    const b = platforms.find((q) => q.id === g.platform);
    if (!b || v.x < b.x - 4 || v.x > b.x + b.width + 4 || Math.abs(b.y - v.topY) > GATE.under) continue;
    if (gateShut(g, clusters)) return g;
  }
  return null;
}

/**
 * What is wrong with a stage's gates, in words (none: they may be laid): its bough is in the stage; each of its clusters is in the
 * stage, on a field vine whose top is at the bough (pushed up its vine, it tears free AT the bough); no cluster holds two gates.
 */
export function gateFaults(gates: readonly ClusterGate[], clusters: readonly VineCluster[], vines: readonly Vine[], platforms: readonly { id: number; x: number; y: number; width: number }[]): string[] {
  const out: string[] = [];
  const held = new Map<number, number>();
  for (const g of gates) {
    const b = platforms.find((q) => q.id === g.platform);
    if (!b) out.push(`gate ${g.id}: its bough ${g.platform} is not in the stage`);
    if (!g.clusters.length) out.push(`gate ${g.id}: no cluster holds it`);
    for (const id of g.clusters) {
      if (held.has(id)) out.push(`cluster ${id}: holds gates ${held.get(id)} and ${g.id}`);
      held.set(id, g.id);
      const c = clusters.find((q) => q.id === id);
      if (!c) {
        out.push(`gate ${g.id}: its cluster ${id} is not in the stage`);
        continue;
      }
      const v = vines.find((q) => q.id === c.vine);
      if (!v || !v.field) out.push(`cluster ${id}: not on a field vine`);
      else if (b && (v.x < b.x - 4 || v.x > b.x + b.width + 4 || Math.abs(b.y - v.topY) > GATE.under)) out.push(`cluster ${id}: its vine ${v.id} does not reach gate ${g.id}'s bough`);
    }
  }
  return out;
}

/**
 * Petals on a paired stretch hang BETWEEN the pair (R-165.229, Matt 11-14: "you can't collect petals doing two arms"; "maybe we put two
 * fruits... side by side, so it shows there's a benefit"): a petal on a field vine's line moves to the middle of that vine and its
 * nearest field vine in reach (FIELD_FEEL.reach) over the same height, a vine no pod falls down first. A two-hand hang there takes it;
 * one hand passes 40 px by. Run last, after every pickup is placed (stageGenerator.ts finishStage).
 */
export function pairPetals(items: Array<{ type: string; x: number; y: number }>, vines: readonly Vine[], podded: ReadonlySet<number>): number {
  const field = vines.filter((v) => v.field);
  let moved = 0;
  if (!field.length) return 0;
  for (const c of items) {
    if (c.type !== 'flower') continue;
    // (on its line: within 12 px of it, as a trail laid along a climb leaves it; his pickup reach is 38 px, his hands 40 px off a line)
    const on = field.find((v) => Math.abs(v.x - c.x) <= 12 && c.y >= v.topY && c.y <= v.bottomY);
    if (!on) continue;
    const mates = field.filter((v) => v !== on && Math.abs(v.x - on.x) <= FIELD_FEEL.reach && c.y >= v.topY + 10 && c.y <= v.bottomY - 10);
    if (!mates.length) continue;
    mates.sort((a, b) => Number(podded.has(a.id)) - Number(podded.has(b.id)) || Math.abs(a.x - on.x) - Math.abs(b.x - on.x) || b.x - a.x);
    c.x = (on.x + mates[0].x) / 2;
    moved++;
  }
  return moved;
}
