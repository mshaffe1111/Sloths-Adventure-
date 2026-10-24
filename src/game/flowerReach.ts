/**
 * flowerReach — every flower, fruit and leaf in a stage must be somewhere Pokey can actually get to (Matt, 2026-10-23: flowers were
 * placed under branches over a pit, where nothing stands close enough to jump to them).
 *
 * A pickup is reachable when, from something he can stand on, hang from or swing on, it is within jumping height (a double jump, or a
 * mushroom's bounce) and close enough sideways. Platforms are jump-through from below in this game (they only catch him landing from
 * above), so a branch overhead never blocks a jump; the only question is whether there is something under or beside the flower to
 * jump from. An unreachable pickup is not deleted (a stage may need a number of them): it moves onto the nearest place he can stand.
 */
import type { Collectible, Platform, Rope, Vine } from './types.ts';
import { reachBounce, reachBounceGlide, reachGlide, reachJump } from './physics.ts';

/** the pickup is taken when it is within 34 px of a point 20 px above his feet (engine.ts) */
const PICK = 34;
const BODY = 20;
/** nothing further than this from a surface is ever in reach (cheap early skip) */
const FAR = 1100;
/** how far out (radians) a swing can be counted on to carry him before he lets go */
const SWING_REACH = 0.95;

export interface ReachWorld {
  platforms: Platform[];
  vines: Vine[];
  ropes?: Rope[];
  /** anything at or below this is under the water or the pit (not somewhere to stand) */
  waterY?: number;
  /** he has the leaf glide in this stage (skills.ts) */
  glide?: boolean;
  /** the platforms the stage checker found he can get onto (levelCheck.ts); when given, only these count as somewhere to jump from */
  onRoute?: Set<number>;
}

const dry = (w: ReachWorld, p: Platform) => w.waterY === undefined || p.y < w.waterY;

function spanOf(p: Platform): [number, number] {
  if (p.type === 'drift' && p.drift) return [p.drift.x0, p.drift.x1];
  if (p.type === 'moving' && p.moveRange) return [p.x - p.moveRange, p.x + p.width + p.moveRange];
  return [p.x, p.x + p.width];
}
const outside = (x: number, a: number, b: number) => (x < a ? a - x : x > b ? x - b : 0);

/** how far sideways a jump off this surface carries him by the time his feet come down through `dy` px above it (-1: never that high) */
function flight(w: ReachWorld, p: Platform, dy: number): number {
  let r = Math.max(reachJump(dy, true), p.type === 'bouncy' ? reachBounce(dy, true) : -1);
  if (w.glide) r = Math.max(r, reachGlide(dy, true), p.type === 'bouncy' ? reachBounceGlide(dy, true) : -1);
  return r;
}

/**
 * Can Pokey get to a pickup at (x, y) and live? Two things must hold. Some jump (or double jump, mushroom bounce, or glide where he has
 * the leaf) off something he can stand on passes close enough to it; and from there he can still come down on something solid. The
 * second half is what catches the flower hung under a branch over a pit: a jump can reach it, but only by falling into the water.
 * A vine or rope beside it also counts (he climbs or swings to it, and it carries him on).
 */
export function reachable(w: ReachWorld, x: number, y: number): boolean {
  // a swinging vine: he can let go anywhere along the swing, so its sweep is a ledge in the air to jump from (the let-go flowers)
  const air: Platform[] = [];
  for (const v of w.vines) {
    if (v.vineType === 'tree_climb') {
      if (Math.abs(x - v.x) <= 60 && y >= v.topY - PICK - BODY && y <= v.bottomY + BODY) return true;
    } else {
      const len = v.bottomY - v.topY;
      if (y >= v.topY && Math.hypot(x - v.x, y - v.topY) <= len + 40) return true;
      const sw = len * Math.sin(SWING_REACH);
      air.push({ id: -1, x: v.x - sw, y: v.topY + len * Math.cos(SWING_REACH) + 40, width: sw * 2, height: 1, type: 'solid' });
    }
  }
  for (const r of w.ropes ?? []) {
    if (x >= Math.min(r.x0, r.x1) - 30 && x <= Math.max(r.x0, r.x1) + 30 && y >= r.y - 20 && y <= r.y + 90) return true;
  }
  // the height his feet must pass for the pickup: anywhere from 34 px below this to 34 px above it does
  const feet = y + BODY;
  let get = false;
  for (const p of air.length ? [...w.platforms, ...air] : w.platforms) {
    if (!dry(w, p) || (w.onRoute && p.id >= 0 && !w.onRoute.has(p.id))) continue;
    const [a, b] = spanOf(p);
    const dx = outside(x, a, b);
    if (dx > FAR) continue;
    const r = flight(w, p, p.y - feet - PICK);
    if (r >= 0 && dx <= r + PICK) { get = true; break; }
  }
  if (!get) return false;
  // and afterwards somewhere to come down: a surface at or below his feet that a plain jump from here would still reach
  for (const p of w.platforms) {
    if (!dry(w, p) || p.broken) continue;
    if (p.y < feet - PICK) continue;
    const [a, b] = spanOf(p);
    const dx = outside(x, a, b);
    if (dx > FAR) continue;
    const r = Math.max(reachJump(feet - p.y, false), w.glide ? reachGlide(feet - p.y, false) : -1);
    if (dx === 0 || (r >= 0 && dx <= r + PICK)) return true;
  }
  return false;
}

/** pickups closer than this read as one (levelCheck.ts uses 36; the trails keep 44) */
const APART = 40;
const SIT = 34;

/**
 * A platform this pickup is tucked under: it sits within the platform's span, below its top, closer under it than Pokey is tall. From on
 * top he passes over it out of reach, and from below he would have to walk through the branch to get it (Matt, 2026-10-23: "flowers
 * below platforms that you're going across").
 */
function tuckedUnder(w: ReachWorld, x: number, y: number): Platform | undefined {
  let best: Platform | undefined;
  for (const p of w.platforms) {
    if (p.broken || p.type === 'drift' || p.type === 'moving' || !dry(w, p)) continue;
    if (x < p.x - 6 || x > p.x + p.width + 6) continue;
    if (y <= p.y - 12 || y >= p.y + p.height + 44) continue;
    if (!best || p.y < best.y) best = p;
  }
  return best;
}

function clear(items: Collectible[], self: Collectible, x: number, y: number): boolean {
  return items.every((o) => o === self || o.collected || Math.hypot(o.x - x, o.y - y) >= APART);
}

/** a free spot on top of this platform, as near x as there is one */
function onTop(items: Collectible[], self: Collectible, p: Platform, x: number): { x: number; y: number } | null {
  const lo = p.x + 16, hi = p.x + p.width - 16;
  if (hi < lo) return null;
  const x0 = Math.max(lo, Math.min(hi, x));
  for (let k = 0; k <= 12; k++) {
    for (const s of k ? [1, -1] : [1]) {
      const cx = x0 + s * k * 22;
      if (cx < lo || cx > hi) continue;
      if (clear(items, self, cx, p.y - SIT)) return { x: cx, y: p.y - SIT };
    }
  }
  return null;
}

/** the nearest place he can stand: the top of a platform on the route, beside x if it can be */
function standSpot(w: ReachWorld, items: Collectible[], self: Collectible): { x: number; y: number } | null {
  const cands = w.platforms
    .filter((p) => !p.broken && p.type !== 'fragile' && p.type !== 'drift' && p.type !== 'moving' && dry(w, p) && (!w.onRoute || w.onRoute.has(p.id)))
    .map((p) => ({ p, d: outside(self.x, p.x, p.x + p.width) * 1.5 + Math.abs(p.y - SIT - self.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 8);
  for (const { p } of cands) {
    const s = onTop(items, self, p, self.x);
    if (s && reachable(w, s.x, s.y) && !tuckedUnder(w, s.x, s.y)) return s;
  }
  return null;
}

/**
 * Put every flower, fruit and leaf where Pokey can get it: one tucked under a platform goes up onto its top (where he walks), and one
 * nothing can reach moves to the nearest place he can stand. Nothing is removed, so a stage's flower count is unchanged. Returns how
 * many moved.
 */
export function fixPickups(w: ReachWorld, items: Collectible[]): number {
  let moved = 0;
  for (const c of items) {
    if (c.type !== 'flower' && c.type !== 'fruit' && c.type !== 'leaf') continue;
    const over = tuckedUnder(w, c.x, c.y);
    if (over) {
      const s = onTop(items, c, over, c.x);
      if (s && reachable(w, s.x, s.y) && !tuckedUnder(w, s.x, s.y)) {
        c.x = s.x;
        c.y = s.y;
        joinRow(items, c);
        moved++;
        continue;
      }
    }
    if (!over && reachable(w, c.x, c.y)) continue;
    const s = standSpot(w, items, c);
    if (!s) continue;
    c.x = s.x;
    c.y = s.y;
    joinRow(items, c);
    moved++;
  }
  return moved;
}

/** a moved flower joins the row it lands in: it takes the species of a neighbour on the same line (a row is one species) */
function joinRow(items: Collectible[], c: Collectible) {
  if (c.type === 'fruit') return;
  const n = items.find((o) => o !== c && (o.type === 'flower' || o.type === 'leaf') && Math.abs(o.y - c.y) < 6 && Math.abs(o.x - c.x) < 80);
  if (!n) return;
  c.type = n.type;
  c.botanicalVariant = n.botanicalVariant;
}

/** what is still wrong (for tests): pickups tucked under a platform, or out of reach */
export function badPickups(w: ReachWorld, items: Collectible[]): Collectible[] {
  return items.filter((c) => (c.type === 'flower' || c.type === 'fruit' || c.type === 'leaf') && (!!tuckedUnder(w, c.x, c.y) || !reachable(w, c.x, c.y)));
}
