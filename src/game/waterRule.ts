/**
 * waterRule — the water rule W3 (reference/engine/ENGINE-SPEC.md on engine-spec, da0e5ba4, "Water and swimming ruled from the
 * research"): each kind of water reads at a glance. Calm water swims and never costs a life (swim.ts); dirty or fast water costs a
 * life. The two never share one screen. The research measured 6-7 failing it on all 16 rolls (WATER-SWIM.md M10, research-water-swim
 * f549a124: deadly water 483-634 px from the calm well).
 *
 * One measure for every builder: gen2's placement keeps to it as it lays (pipeline.ts layDry), and the gate
 * (tools/validate/watercheck.ts) holds every built stage to it, 16 rolls x Normal and Easy.
 *
 *   calm     the calm water of a stage's puzzle rooms (swim.ts kitPools: each raft lift with `water` set fills the platform it is
 *            anchored on, 6-7's well). Read from the stage's room specs, so no KitPlay is needed.
 *   deadly   an open column: the stage has deadly water under it (waterY, engine.ts: a fall past waterY + 20 costs a life) and nothing
 *            at all is laid at that x, so a fall there meets the water and the water is drawn there; and every river that is not a
 *            teaching river (river.ts RiverZone.safe).
 *   screen   W3_SCREEN: how much world a sideways phone shows. The spec's "844 px" is the phone's width in CSS px; the engine shows a
 *            world WORLD_VIEW_H (540) tall sideways (engine.ts applyZoom), so an 844 x 390 phone shows 844 x 540 / 390 = 1,169 world
 *            px, and Matt's Pixel (998 x 448 sideways, tools/qa/meecaVisible.cjs) 1,203. Two things closer than that can be on one
 *            screen at once; further apart they never are. So the rule's own words ("never share one screen") are kept with 1,203,
 *            which also keeps the spec's > 844.
 *
 * The rule's exception ("unless a drawn bank divides them and the stage has already shown both, with Pokey's 'two waters' line") is
 * not built: no stage has that line (it would need Matt's approval), so there is no case for it to pass. Pure: no canvas, no engine.
 */
import type { Platform } from './types.ts';

/** the engine's sideways view height in world px (engine.ts WORLD_VIEW_H; waterRule.test.ts holds the two together) */
export const VIEW_H = 540;
/** Matt's phone sideways, CSS px (tools/qa/meecaVisible.cjs: "Matt's Pixel", 448 x 998 upright) */
export const WIDEST_PHONE = { w: 998, h: 448 } as const;
/** the widest world span one sideways screen shows (px): deadly water must be further than this from any calm pool */
export const W3_SCREEN = Math.ceil((VIEW_H * WIDEST_PHONE.w) / WIDEST_PHONE.h);
/** the spec's number (ENGINE-SPEC W3, the research's M10): kept as the floor the screen must stay over */
export const W3_SPEC_PX = 844;

export interface Span {
  x0: number;
  x1: number;
}

interface LiftLike {
  kind: string;
  water?: number;
  at?: { on: number | string };
}
interface StageLike {
  platforms: readonly Platform[];
  waterY?: number;
  rivers?: ReadonlyArray<{ x0: number; x1: number; safe?: unknown }>;
  kit?: { rooms: ReadonlyArray<{ pieces: readonly unknown[] }> } | null;
  config: { levelWidth: number };
}

/** the calm pools of a stage's rooms (swim.ts kitPools, from the specs): the span of each raft-with-water's floor */
export function calmSpans(rooms: ReadonlyArray<{ pieces: readonly unknown[] }> | undefined, platforms: readonly Platform[]): Span[] {
  const out: Span[] = [];
  for (const r of rooms ?? []) {
    for (const pc of r.pieces as LiftLike[]) {
      if (pc.kind !== 'lift' || pc.water === undefined || !pc.at) continue;
      const floor = platforms.find((p) => p.id === pc.at!.on);
      if (floor) out.push({ x0: floor.x, x1: floor.x + floor.width });
    }
  }
  return out;
}

/** the x (every `step` px) where nothing is laid: with deadly water under the stage, a fall there meets it */
export function openColumns(platforms: readonly Platform[], width: number, step = 10): number[] {
  const spans = platforms.map((p) => [p.x, p.x + p.width] as const).sort((a, b) => a[0] - b[0]);
  const out: number[] = [];
  let k = 0;
  let reach = -Infinity;
  for (let x = 0; x <= width; x += step) {
    while (k < spans.length && spans[k][0] <= x) reach = Math.max(reach, spans[k++][1]);
    if (x > reach) out.push(x);
  }
  return out;
}

/** the gap between x and a span (0 inside it) */
export const distTo = (x: number, s: Span) => (x < s.x0 ? s.x0 - x : x > s.x1 ? x - s.x1 : 0);

export interface W3Miss {
  pool: Span;
  /** the nearest deadly water to the pool (px, edge to edge) and where it is */
  dist: number;
  at: number;
  what: 'open column' | 'river';
}

/** each calm pool with deadly water within W3_SCREEN of it (the nearest one), or none */
export function w3Misses(st: StageLike, screen = W3_SCREEN): W3Miss[] {
  const pools = calmSpans(st.kit?.rooms, st.platforms);
  if (!pools.length) return [];
  const deadly: Array<{ x: number; what: W3Miss['what'] }> = [];
  if (st.waterY !== undefined) for (const x of openColumns(st.platforms, st.config.levelWidth)) deadly.push({ x, what: 'open column' });
  for (const r of st.rivers ?? []) if (!r.safe) for (let x = r.x0; x <= r.x1; x += 10) deadly.push({ x, what: 'river' });
  const out: W3Miss[] = [];
  for (const pool of pools) {
    let best: W3Miss | null = null;
    for (const d of deadly) {
      const dist = distTo(d.x, pool);
      if (dist <= screen && (!best || dist < best.dist)) best = { pool, dist, at: d.x, what: d.what };
    }
    if (best) out.push(best);
  }
  return out;
}
