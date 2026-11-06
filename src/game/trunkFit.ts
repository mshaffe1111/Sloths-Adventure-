/**
 * Scenery trunks fitted to the pieces really there: one rule, read by the draw (protoArt.ts setDecoTrunks) and by the mixer as it lays
 * them (mixer/w1mix.ts supports), so a stage's trunks are drawn as they were laid. Pure: no canvas.
 */
import { paintedBank } from './w1Pits.ts';
import type { Platform } from './types.ts';

/** a scenery trunk; `holdY`, where the piece it holds is (a crowned tree rises on over its bough: its top is then not its piece) */
export type DecoTrunk = { x: number; topY: number; bottomY: number; w?: number; art?: 'plain'; holdY?: number };
/** ground a trunk can stand on: a bank of earth, a stone on it (moss_stone), or the floor; never a log, a bough or a plank, which a
 *  trunk passes behind (the lead's review of the E3 stills, 11-05: two trunks ended on a floating log, with no base) */
export const trunkGround = (q: Platform) => !q.broken && q.type !== 'bouncy' && (paintedBank(q) || q.style === 'moss_stone');
/** how far a trunk's foot goes into the surface it stands on (px): a piece's top, a drawn water's surface */
export const FOOT_IN = 6, WATER_IN = 10;

/**
 * Every trunk must have a reason to be there (Matt, 11-05: "If we have ground the whole way down, why do we need to put something over
 * top of it?"). A trunk holds up the piece at its top. If that piece is a bank of earth, its soil already runs down out of sight and holds
 * it, so the trunk is dropped. Otherwise it stands on the first ground or water under its piece, and stops there: never on down over
 * solid ground or through the water to the bottom. Its piece is at `holdY` where the trunk says (a crowned tree, its crown 400 px over its
 * bough: read from its top, the bough itself was taken for its ground and the tree cut off there, the bough left over nothing), else at its
 * top.
 */
export function fitTrunks(trunks: ReadonlyArray<DecoTrunk>, platforms: readonly Platform[], water: ReadonlyArray<{ x0: number; x1: number; y: number }>): DecoTrunk[] {
  const out: DecoTrunk[] = [];
  for (const t of trunks) {
    const at = (q: Platform) => t.x >= q.x - 2 && t.x <= q.x + q.width + 2;
    const from = t.holdY ?? t.topY;
    // (the piece it holds: the one whose underside or body is at its piece's height)
    const held = platforms.find((q) => at(q) && !q.broken && q.y <= from + 4 && q.y + q.height >= from - 4);
    if (held && paintedBank(held)) continue;
    // (the first surface under its piece, the nearest: a piece's top, or a drawn water's surface; the foot a few px into it. Compared by
    // surface, not by the foot so far: a later piece 3 px under the first one found took the foot past it)
    let surf = Infinity, foot = t.bottomY;
    for (const q of platforms) if (at(q) && q !== held && trunkGround(q) && q.y > from + 8 && q.y < surf) { surf = q.y; foot = Math.min(t.bottomY, q.y + FOOT_IN); }
    for (const z of water) if (t.x > z.x0 && t.x < z.x1 && z.y > from + 8 && z.y < surf) { surf = z.y; foot = Math.min(t.bottomY, z.y + WATER_IN); }
    if (foot - t.topY < 20) continue;
    out.push(foot === t.bottomY ? t : { ...t, bottomY: foot });
  }
  return out;
}
