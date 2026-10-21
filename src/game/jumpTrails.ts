/**
 * Flower trails over jumps. A row of flowers curving over a gap is the oldest signpost in a platformer: it shows where to jump from, how
 * high, and where to land (Mario's coins do the same). The stage builder already lays arcs inside many of its pieces, but not over every
 * gap (about half of them, and only a quarter in Worlds 5 and 6), so this goes over the finished stage and adds an arc wherever a gap on
 * the route has none.
 *
 * What it will not do: lead anywhere off the route. The hidden Hush Fern must stay hidden, so these arcs only ever sit over gaps the
 * route already crosses, never toward a side platform, and the finds are placed after them so a fern is never put beside a trail.
 * Nothing here uses the stage's random numbers (the layout does not change); the same stage always gets the same arcs.
 */
import type { Collectible, Platform } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';

/** gaps this wide (px, edge to edge) get an arc: narrower is a step, wider is not a jump the route asks for */
export const TRAIL_MIN_GAP = 100;
export const TRAIL_MAX_GAP = 420;
/** no pickup closer than this to another (the checker's own rule is 36) */
const APART = 44;
const VARIANTS = ['orchid', 'hibiscus', 'fern', 'monstera'] as const;

function hash32(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export interface TrailGap {
  /** the left platform's right edge, and the right platform's left edge */
  x0: number;
  x1: number;
  /** the tops of the two sides */
  y0: number;
  y1: number;
}

const isFixed = (p: Platform) => !p.broken && p.type !== 'moving' && p.type !== 'drift';

/**
 * The gaps the route crosses on foot: between a stretch of solid ground (and what stands on it) and the next solid ground to its right,
 * with nothing that moves, breaks, bounces or hangs (vines, ropes, logs, zones) in between, since those are crossed their own way.
 */
export function routeGaps(stage: GeneratedStage, reachable: Set<number>): TrailGap[] {
  const solids = stage.platforms.filter((p) => p.type === 'solid' && isFixed(p) && reachable.has(p.id)).sort((a, b) => a.x - b.x);
  const gaps: TrailGap[] = [];
  if (!solids.length) return gaps;
  const forks = stage.lanes ?? [];
  let reach = solids[0].x + solids[0].width;
  let reachY = solids[0].y;
  for (let i = 1; i < solids.length; i++) {
    const q = solids[i];
    const w = q.x - reach;
    if (w >= TRAIL_MIN_GAP && w <= TRAIL_MAX_GAP) {
      const x0 = reach;
      const x1 = q.x;
      const odd =
        stage.platforms.some((p) => !p.broken && p.type !== 'solid' && p.x < x1 + 40 && p.x + p.width > x0 - 40) ||
        stage.vines.some((v) => v.x > x0 - 60 && v.x < x1 + 60) ||
        (stage.ropes ?? []).some((r) => Math.min(r.x0, r.x1) < x1 + 40 && Math.max(r.x0, r.x1) > x0 - 40) ||
        (stage.zones ?? []).some((z) => z.x0 < x1 + 40 && z.x1 > x0 - 40) ||
        (stage.rivers ?? []).some((r) => r.x0 < x1 + 40 && r.x1 > x0 - 40) ||
        forks.some((f) => x1 > f.x0 - 20 && x0 < f.x1 + 20);
      // a gap a step either way in height is a jump; a wall or a cliff edge is something else
      const dy = q.y - reachY;
      if (!odd && dy > -170 && dy < 150) gaps.push({ x0, x1, y0: reachY, y1: q.y });
    }
    if (q.x + q.width > reach) {
      reach = q.x + q.width;
      reachY = q.y;
    }
  }
  return gaps;
}

/** does a flower or leaf already hang over this gap? */
function hasArc(stage: GeneratedStage, g: TrailGap): boolean {
  const top = Math.min(g.y0, g.y1);
  return stage.collectibles.some((c) => (c.type === 'flower' || c.type === 'leaf') && c.x > g.x0 - 30 && c.x < g.x1 + 30 && c.y < top + 20 && c.y > top - 260);
}

/** the flowers of one arc over a gap: from a step before the edge to a step after the far edge, rising to a peak over the middle */
export function arcFor(g: TrailGap, species: Collectible['botanicalVariant'], firstId: number): Collectible[] {
  const w = g.x1 - g.x0;
  const n = Math.max(3, Math.min(5, Math.round(w / 55) + 1));
  const peak = Math.max(56, Math.min(108, w * 0.34));
  const xa = g.x0 - 18;
  const xb = g.x1 + 18;
  const out: Collectible[] = [];
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    // the line from one edge's top to the other's, lifted 44 px, with a rise over the middle that is the jump's own curve
    const line = g.y0 + (g.y1 - g.y0) * u;
    out.push({
      id: firstId + i,
      type: species === 'fern' || species === 'monstera' ? 'leaf' : 'flower',
      botanicalVariant: species,
      x: xa + (xb - xa) * u,
      y: line - 44 - peak * 4 * u * (1 - u),
      collected: false,
      bobPhase: (hash32(`${firstId}:${i}`) % 628) / 100,
    });
  }
  return out;
}

/** add an arc over every route gap that has none. Returns how many arcs were added. */
export function addJumpTrails(stage: GeneratedStage, reachableIds: number[]): number {
  const cfg = stage.config;
  if (cfg.secret || cfg.objectiveType === 'boss_lair' || cfg.objectiveType === 'ascent') return 0;
  const reach = new Set(reachableIds);
  const solids = stage.platforms.filter((p) => !p.broken && p.type !== 'drift' && p.type !== 'moving');
  const insideSolid = (x: number, y: number) => solids.some((p) => x > p.x - 8 && x < p.x + p.width + 8 && y > p.y - 6 && y < p.y + p.height + 8);
  let nextId = stage.collectibles.reduce((m, c) => Math.max(m, c.id), 0) + 1;
  let added = 0;
  for (const g of routeGaps(stage, reach)) {
    if (hasArc(stage, g)) continue;
    const species = VARIANTS[hash32(`${cfg.id}:${Math.round(g.x0)}`) % VARIANTS.length];
    const arc = arcFor(g, species, nextId).filter(
      (c) => !insideSolid(c.x, c.y) && stage.collectibles.every((o) => Math.hypot(o.x - c.x, o.y - c.y) >= APART),
    );
    // an arc with fewer than three left would read as litter, not a path
    if (arc.length < 3) continue;
    stage.collectibles.push(...arc);
    nextId += arc.length + 1;
    added++;
  }
  return added;
}
