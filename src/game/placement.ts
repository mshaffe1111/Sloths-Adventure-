/**
 * placement — composed decoration instead of random scatter.
 *
 * Pure random scatter clumps and overlaps; a grid looks rigid. So decoration is placed the way a gardener would: a few cluster
 * CENTRES spaced by a minimum distance (with a stretch of deliberate negative space left empty), then 3 to 7 members around each
 * centre with a minimum distance between any two members and a varied size (the biggest bloom near the middle, smaller ones
 * thinning out toward the edge). The same seed always gives the same garden, and a strip that wraps (a parallax tile) wraps its
 * distances too, so nothing touches across the seam.
 */
import type { RNG } from './artKit.ts';

export interface Spot {
  x: number;
  y: number;
  /** the size this member should be drawn at (already varied) */
  size: number;
  /** which cluster it belongs to, and its place in it (0 = the lead, biggest) */
  cluster: number;
  k: number;
  /** 0..1 pick to choose a species/colour with, stable per cluster so a cluster reads as one kind of thing */
  tint: number;
}

export interface ClusterOpts {
  /** length of the strip the decoration lives on */
  width: number;
  /** the strip is a tile that repeats: distances wrap around the seam */
  wrap?: boolean;
  /** how many clusters to aim for (fewer are placed if they do not fit) */
  clusters: number;
  /** members per cluster, 3 to 7 by default */
  members?: [number, number];
  /** minimum distance between two cluster centres */
  gap: number;
  /** how far members spread from their centre (x), and the height of the band they sit in (y spread) */
  spread: [number, number];
  /** minimum distance between any two members, in x/y units */
  minDist: number;
  /** size range: the lead member is near the top of it */
  size: [number, number];
  /** the band, in y */
  y: [number, number];
  /** leave at least this much of the strip completely empty in one stretch (a visual rest), when it fits */
  calm?: number;
  /** spans [x0, x1] that must stay empty (the strip's seam, a spot the hero will always cross...) */
  keepClear?: Array<[number, number]>;
}

/** distance between two x positions on a strip, around the seam when it wraps */
export function dx(a: number, b: number, width: number, wrap: boolean): number {
  const d = Math.abs(a - b);
  return wrap ? Math.min(d, width - d) : d;
}

/**
 * Cluster centres by best-candidate sampling: each new centre is the best of a few random candidates (the one farthest from every
 * centre already placed), which is Poisson-disk spacing without the grid look. `blocked` spans never get a centre.
 */
export function clusterCentres(r: RNG, width: number, n: number, gap: number, wrap: boolean, blocked: Array<[number, number]> = []): number[] {
  const centres: number[] = [];
  const inBlocked = (x: number) => blocked.some(([a, b]) => x >= a && x <= b);
  const TRIES = 24;
  for (let i = 0; i < n; i++) {
    let best = -1;
    let bestD = -1;
    for (let t = 0; t < TRIES; t++) {
      const x = r() * width;
      if (inBlocked(x)) continue;
      let d = Infinity;
      for (const c of centres) d = Math.min(d, dx(x, c, width, wrap));
      if (d > bestD) {
        bestD = d;
        best = x;
      }
    }
    if (best < 0 || bestD < gap) break;
    centres.push(best);
  }
  return centres.sort((a, b) => a - b);
}

/** all the spots of a composed garden along a strip */
export function composeClusters(r: RNG, o: ClusterOpts): Spot[] {
  const wrap = !!o.wrap;
  const [mMin, mMax] = o.members ?? [3, 7];
  const keep: Array<[number, number]> = (o.keepClear ?? []).slice();
  // one stretch is held completely empty first, so every strip has a real rest in it
  if (o.calm && o.calm < o.width * 0.7) {
    const c0 = r() * (o.width - o.calm);
    keep.push([c0, c0 + o.calm]);
  }
  const maxSpread = o.spread[0] * 1.25;
  // a centre stays a spread away from a held span, so its members cannot wander into it
  const centreBlock = keep.map(([a, b]): [number, number] => [a - maxSpread, b + maxSpread]);
  const centres = clusterCentres(r, o.width, o.clusters, o.gap, wrap, centreBlock);
  const out: Spot[] = [];
  const clear = (x: number) => !keep.some(([a, b]) => x >= a && x <= b);
  centres.forEach((cx, ci) => {
    const n = mMin + Math.floor(r() * (mMax - mMin + 1));
    const tint = r();
    const spreadX = o.spread[0] * (0.7 + r() * 0.5);
    const members: Spot[] = [];
    for (let k = 0; k < n; k++) {
      let placed = false;
      // dart-throwing inside the cluster's footprint; the lead goes dead centre
      for (let t = 0; t < 30 && !placed; t++) {
        const lead = k === 0;
        const ang = r() * Math.PI * 2;
        const rad = lead ? 0 : (0.35 + 0.65 * Math.sqrt(r())) * spreadX;
        let x = cx + Math.cos(ang) * rad;
        if (wrap) x = ((x % o.width) + o.width) % o.width;
        else if (x < 0 || x > o.width) continue;
        if (!clear(x)) continue;
        const y = o.y[0] + (o.y[1] - o.y[0]) * (lead ? 0.5 : 0.5 + (Math.sin(ang) * rad) / Math.max(1, 2 * o.spread[1]));
        const yy = Math.min(o.y[1], Math.max(o.y[0], y));
        let ok = true;
        for (const m of out.concat(members)) {
          if (Math.hypot(dx(x, m.x, o.width, wrap), yy - m.y) < o.minDist) {
            ok = false;
            break;
          }
        }
        if (!ok) continue;
        // the lead is the biggest; members fade in size with their distance from it
        const near = lead ? 1 : 1 - (rad / Math.max(1, spreadX)) * 0.55;
        const size = o.size[0] + (o.size[1] - o.size[0]) * Math.min(1, near * (0.78 + r() * 0.22));
        members.push({ x, y: yy, size, cluster: ci, k, tint });
        placed = true;
      }
    }
    // a cluster of fewer than three reads as scatter, not a motif: drop it
    if (members.length >= Math.min(3, mMin)) out.push(...members);
  });
  return out;
}

export interface Member {
  x: number;
  y: number;
  /** 0 = the lead (biggest, nearest the middle) .. 1 = the edge of the cluster */
  edge: number;
  k: number;
}

/**
 * One cluster on a surface (a trunk, a ledge): `n` members around (cx, cy) inside an ellipse of half-width `sx` and half-height `sy`,
 * no two closer than `minDist`. Member 0 is the lead and sits in the middle; the rest follow by dart-throwing, so a member that cannot
 * find room is simply left out (the cluster comes back smaller, never overlapping).
 */
export function clusterAround(r: RNG, n: number, cx: number, cy: number, sx: number, sy: number, minDist: number): Member[] {
  const out: Member[] = [];
  for (let k = 0; k < n; k++) {
    for (let t = 0; t < 40; t++) {
      const ang = r() * Math.PI * 2;
      const u = k === 0 ? 0 : 0.3 + 0.7 * Math.sqrt(r());
      const x = cx + Math.cos(ang) * sx * u;
      const y = cy + Math.sin(ang) * sy * u;
      if (out.some((m) => Math.hypot(m.x - x, m.y - y) < minDist)) continue;
      out.push({ x, y, edge: u, k });
      break;
    }
  }
  return out;
}

/**
 * Groups of fliers for a strip of sky: `groups` anchors with at least `gap` between them and `size` members each,
 * so butterflies travel as pairs and trios instead of a uniform sprinkle. Returns, per flier, its group and its offset.
 */
export function flyerGroups(r: RNG, total: number, maxGroup = 3): Array<{ group: number; k: number; ox: number; oy: number }> {
  const out: Array<{ group: number; k: number; ox: number; oy: number }> = [];
  let left = total;
  let g = 0;
  while (left > 0) {
    // pairs are the most natural; a lone one now and then; never more than maxGroup
    const roll = r();
    const n = Math.min(left, roll < 0.25 ? 1 : roll < 0.8 ? 2 : maxGroup);
    for (let k = 0; k < n; k++) out.push({ group: g, k, ox: k === 0 ? 0 : (r() - 0.5) * 70 + (k % 2 ? 46 : -46), oy: k === 0 ? 0 : (r() - 0.5) * 40 });
    left -= n;
    g++;
  }
  return out;
}
