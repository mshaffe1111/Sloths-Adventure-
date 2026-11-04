/**
 * "Looks the same" (the quality supervisor's review of the overview, 2026-11-04): the move 3-grams read 1-3 and 1-7 as 14% and 10% like 1-1,
 * yet a player meets the same mushroom, tall earth pillar and plank unit again and again in all three (1-1 reads it "MUUU", 1-7 "EMjMj").
 * Matt judges by what he sees, so beside the move similarity the overview shows how alike two stages are in what they are built from:
 *   - the builder's pieces (stage.meta.pieces: highrun, stumps, snakes, rest, ...), each weighted by the share of the stage it spans, and
 *   - the art on the ground: every platform's kind and look (type:style, a mushroom is "bouncy"), weighted by its width.
 * Each half is compared by cosine and the two averaged; a stage with no piece list (hand-built) is compared on its art alone.
 * Variety (evaluate.ts) takes the more alike of moves and look: a stage is only as fresh as its most repeated side (the supervisor, 11-04).
 */
import type { Stage } from '../inspect/stages.ts';

export interface Look { pieces: Map<string, number>; art: Map<string, number> }

/**
 * the art a platform is drawn with. The chase's sections and the canopy crowns over them carry no style: the engine draws them with their
 * own art (engine.ts drawChase: drawChaseSection, drawCrownArt), so they are keyed by that (the supervisor, 11-04: 1-8 read 0-4% alike to
 * everything on an empty style, a gap in the measure, not a fact). Any other platform with no style reads as a branch (platformStyles.ts
 * balanceStyles counts it so).
 */
export function artKey(q: { type: string; style?: string; chase?: boolean; crown?: boolean }): string {
  if (q.chase) return 'chase:bough';
  if (q.crown) return 'chase:crown';
  return `${q.type}:${q.style ?? 'branch'}`;
}

export function lookOf(stage: Stage): Look {
  const pieces = new Map<string, number>();
  const list = ((stage as Stage & { meta?: { pieces?: Array<{ k: string; x0: number; x1: number }> } }).meta?.pieces ?? []);
  for (const p of list) pieces.set(p.k, (pieces.get(p.k) ?? 0) + Math.max(0, p.x1 - p.x0));
  const art = new Map<string, number>();
  for (const q of stage.platforms) {
    const k = artKey(q as Stage['platforms'][number] & { style?: string; chase?: boolean; crown?: boolean });
    art.set(k, (art.get(k) ?? 0) + Math.max(1, q.width));
  }
  return { pieces, art };
}

function cos(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  for (const [k, v] of a) { na += v * v; dot += v * (b.get(k) ?? 0); }
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** how alike two stages look, 0-1 */
export function lookAlike(a: Look, b: Look): number {
  const art = cos(a.art, b.art);
  if (!a.pieces.size || !b.pieces.size) return art;
  return (cos(a.pieces, b.pieces) + art) / 2;
}
