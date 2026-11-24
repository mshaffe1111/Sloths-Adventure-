/**
 * A bank narrower than Pokey (R-165.440, SIDEWALL-FIX, the lead's ruling 11-24: the look follows the collider). The painted ground takes
 * every block 90 px or taller (w1Pits.ts paintedBank, protoArt.ts bankPainted), but it shows a bank against the soil behind only by its
 * lip and its end cap, and a block narrower than his body gets soil fill only: the backdrop's colour, a wall he stops against and cannot
 * see (R-165.434, tools/engine/sideWall.ts). Two such blocks shipped: 1-6's 24 x 345 post under each fragile branch (both sides open on
 * the floor trough) and 8-1's 14 x 224 sliver flush beside the log bank it continues (seed 38747). Each is given a look here, by its shape,
 * never by a stage:
 * - 'joined': flush against a painted bank of the same top and bottom (within 2 px), it is that bank's own end: the painter draws the two
 *   as ONE bank (bankList), so the bank's face and lip end where the collider does.
 * - 'post': standing alone with a side open over his height and its foot on a solid (a floor under it, or its foot sunk in one): drawn as
 *   World 1's tall live post (the inventory's hf678/w1-livepost-tall, 'support', a made thing), from its top to the floor, its shaft the
 *   collider's width (livePostArt.ts), and left out of the painted soil.
 * Only a block he can meet side-on (a side open over his height) is given a look; a narrow bank with both sides closed draws as it always
 * has. A narrow open block with neither shape (floating in the air) keeps the painted bank, and the side-wall check fails it.
 * sideWall.ts reads this same decision, so the check and the screen cannot disagree. Pure geometry; one pass per stage, memoised.
 */
import type { Platform } from './types.ts';
import { paintedBank } from './w1Pits.ts';

/** his body's collider (physics.ts BODY_H; engine.ts's 44 px width) */
export const BODY_H = 48, BODY_W = 44;

export type NarrowLook = { look: 'joined'; into: Platform } | { look: 'post'; floor: number };

/** the longest run of y in [y0, y1) not covered by the given spans */
export function longestOpen(y0: number, y1: number, spans: Array<readonly [number, number]>): number {
  const s = spans.map(([a, b]) => [Math.max(a, y0), Math.min(b, y1)] as const).filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  let best = 0, at = y0;
  for (const [a, b] of s) { if (a > at) best = Math.max(best, a - at); at = Math.max(at, b); }
  return Math.max(best, y1 - at);
}

/** the solids he meets (not a pad, not a broken piece) */
export const solidOf = (p: Platform) => p.type !== 'bouncy' && !p.broken;

/** how far a side of `p` stands open (px of its height with no other solid touching that side) */
export function openSide(p: Platform, solids: readonly Platform[], side: 'left' | 'right'): number {
  const x = side === 'left' ? p.x - 1 : p.x + p.width + 1;
  const spans = solids.filter((q) => q !== p && q.x <= x && q.x + q.width >= x).map((q) => [q.y, q.y + q.height] as const);
  return longestOpen(p.y, p.y + p.height, spans);
}

function lookOf(p: Platform, platforms: readonly Platform[]): NarrowLook | null {
  if (p.width >= BODY_W || !paintedBank(p)) return null;
  // (only a block he can meet side-on: a side open over his height. A narrow bank with both sides closed draws as it always has)
  const solids = platforms.filter(solidOf);
  if (Math.max(openSide(p, solids, 'left'), openSide(p, solids, 'right')) < BODY_H) return null;
  const into = platforms.find((q) => q !== p && q.width >= BODY_W && paintedBank(q) && Math.abs(q.y - p.y) <= 2 && Math.abs(q.y + q.height - (p.y + p.height)) <= 2
    && (Math.abs(q.x + q.width - p.x) <= 2 || Math.abs(p.x + p.width - q.x) <= 2));
  if (into) return { look: 'joined', into };
  // (its foot on a solid: the highest top under its own top by at least his height, at most 2 px under its foot; a post never floats)
  let floor = Infinity;
  for (const q of solids) if (q !== p && q.x < p.x + p.width && q.x + q.width > p.x && q.y >= p.y + BODY_H && q.y <= p.y + p.height + 2) floor = Math.min(floor, q.y);
  return Number.isFinite(floor) ? { look: 'post', floor } : null;
}

const memo = new WeakMap<readonly Platform[], { n: number; looks: Map<Platform, NarrowLook>; posts: Array<{ p: Platform; floor: number }>; banks: Map<number, Platform[]> }>();
function looksFor(platforms: readonly Platform[]) {
  let m = memo.get(platforms);
  if (!m || m.n !== platforms.length) {
    const looks = new Map<Platform, NarrowLook>();
    for (const p of platforms) {
      const l = lookOf(p, platforms);
      if (l) looks.set(p, l);
    }
    const posts: Array<{ p: Platform; floor: number }> = [];
    for (const [p, l] of looks) if (l.look === 'post') posts.push({ p, floor: l.floor });
    m = { n: platforms.length, looks, posts, banks: new Map() };
    memo.set(platforms, m);
  }
  return m;
}

/** the look a narrow painted bank is given here, or null (not narrow, not a painted bank, or neither shape) */
export function narrowLook(p: Platform, platforms: readonly Platform[]): NarrowLook | null {
  return looksFor(platforms).looks.get(p) ?? null;
}

/** the posts among the stage's platforms (each with the floor top it stands on; the same array every frame) */
export function narrowPosts(platforms: readonly Platform[]): ReadonlyArray<{ p: Platform; floor: number }> {
  return looksFor(platforms).posts;
}

/**
 * The painted ground's banks (drawProtoScene's list): a joined sliver merged into the bank it continues (one box, the union of the two),
 * a post left out (livePostArt.ts draws it). The same array back while the stage's banks are unchanged (no allocation a frame).
 */
export function bankList(platforms: readonly Platform[], banks: Platform[]): Platform[] {
  const m = looksFor(platforms);
  if (!m.looks.size) return banks;
  let key = banks.length;
  for (const b of banks) key = (Math.imul(key, 31) + b.id) | 0;
  const hit = m.banks.get(key);
  if (hit) return hit;
  const merged = new Map<Platform, Platform>();
  const out: Platform[] = [];
  for (const b of banks) {
    const l = m.looks.get(b);
    if (l?.look === 'joined') {
      const base = merged.get(l.into) ?? l.into;
      const x0 = Math.min(base.x, b.x), x1 = Math.max(base.x + base.width, b.x + b.width);
      merged.set(l.into, { ...base, x: x0, width: x1 - x0 });
    }
  }
  for (const b of banks) {
    const l = m.looks.get(b);
    if (l) continue;
    out.push(merged.get(b) ?? b);
  }
  if (m.banks.size > 8) m.banks.clear();
  m.banks.set(key, out);
  return out;
}
