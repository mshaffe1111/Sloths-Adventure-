/**
 * Room for help (R-165.62's help ladder, w1.relay.test (b)): every rise on a no-lethal stage is one a single jump climbs, a mushroom 20-60 px
 * from its face gives, or has the flat ground before it for the ladder's stair. ONE definition, read by the relay test and by the seed
 * list's judge (tools/engine/listRules.ts helpRoomBreaches): POLISH-9b (R-165.228) found 4 Easy layouts POLISH-7's relist listed that this
 * test refused, because the judge did not ask it. Pure: it reads a built stage's geometry. Moved here unchanged from the test.
 */
import type { DropSite } from './verdicts.types.ts';

// ───────────────────────── the flown numbers (reach.md §2, bands.md §2 and §5; A2's frozen stair) ─────────────────────────
/** one jump crosses a level gap up to 246 px at any timing, both settings (reach.md §2 "Single, hold": design to 246) */
export const SINGLE_GAP = 246;
/** the highest top one jump climbs: a block (50 px or taller) / a thin top (reach.md §2 "Single, hold") */
export const CLIMB = { block: 123, thin: 117 } as const;
export const BLOCK_H = 50;
/** a mushroom gives the rise when its edge is 20-60 px from the face (bands.md §2 "Bounce teach", §5) */
export const MUSHROOM_EDGE = [20, 60] as const;
/** A2's stair, frozen for C1 (packet C1 "Frozen inputs") */
export const STAIR = { face: 60, tread: 80, top: 160 } as const;
/** the rocks a rise needs, and the flat ground they stand on */
export const stairRocks = (rise: number): number => Math.max(1, Math.ceil((rise - STAIR.face) / STAIR.face));
export const stairRoom = (rise: number): number => STAIR.tread * (stairRocks(rise) - 1) + STAIR.top;

// ───────────────────────── the judges (pure: they read a built stage's geometry) ─────────────────────────
export type Plat = { x: number; y: number; width: number; height: number; type: string; broken?: boolean };
export type Drop = { x0: number; x1: number; lipY: number; ends: { kind: string }; site?: DropSite };
export type Sec = { template: string; x0: number; x1: number };
/** the parts of a built stage these judges read */
export interface Laid { platforms: readonly Plat[]; gen2: { drops?: readonly Drop[]; sections: readonly Sec[] } }

export const solidOf = (st: Laid) => st.platforms.filter((p) => p.type !== 'bouncy' && !p.broken);
export const bouncyOf = (st: Laid) => st.platforms.filter((p) => p.type === 'bouncy').sort((a, b) => a.x - b.x);
const R = Math.round;

/** a rise: a solid top whose face he comes at from lower ground (the least rise any top within a single gap behind it gives) */
export interface Rise {
  x: number; top: number; rise: number; thin: boolean; climb: number;
  /** the flat, pit-free ground before the face, and the stair's need */
  room: number; need: number; why: string;
  /** a mushroom on the take-off floor before the face: its near (left) edge and its edge's distance from the face */
  mushroom?: { x: number; edgeToFace: number; given: boolean };
}
export function risesOf(st: Laid): Rise[] {
  const S = solidOf(st), B = bouncyOf(st), out: Rise[] = [];
  for (const P of S) {
    const face = P.x;
    // (the tops behind the face, within a single gap of it, not far overhead: the least rise among them; one level or above: no rise)
    const behind = S.filter((q) => q !== P && q.x < face && q.x + q.width > face - SINGLE_GAP && q.y >= P.y - 250);
    if (!behind.length) continue;
    const rise = Math.min(...behind.map((q) => q.y - P.y));
    if (rise <= 2) continue;
    const floorY = P.y + rise;
    const thin = P.height < BLOCK_H, climb = thin ? CLIMB.thin : CLIMB.block;
    // (the ground right at the face, at the take-off top; then left along joined pieces at that top until a gap)
    const at = (x: number) => S.filter((q) => q !== P && Math.abs(q.y - floorY) <= 2 && q.x < x && q.x + q.width >= x - 1);
    let x0 = face, why = '';
    if (!at(face).length) why = 'a gap in front of the face';
    else for (let g = at(x0); g.length; g = at(x0)) x0 = Math.min(...g.map((q) => q.x));
    // (anything standing on that ground in the span (a stone, a stump, a mushroom) cuts the flat run short)
    let cut = x0;
    for (const q of st.platforms) {
      if (q === P || q.x >= face || q.x + q.width <= x0) continue;
      if (q.y < floorY - 2 && q.y + q.height >= floorY - 2) cut = Math.max(cut, q.x + q.width);
    }
    const room = why ? 0 : Math.max(0, face - cut);
    if (!why && cut > x0) why = 'something stands on the ground before the face';
    else if (!why && x0 > face - stairRoom(rise)) why = 'a gap before the stair fits';
    const m = B.filter((b) => b.x < face && Math.abs(b.y + b.height - floorY) <= 4 && face - (b.x + b.width) <= 250).pop();
    const edge = m ? R(face - (m.x + m.width)) : 0;
    out.push({
      x: R(face), top: R(P.y), rise: R(rise), thin, climb, room: R(room), need: stairRoom(rise), why,
      ...(m ? { mushroom: { x: R(m.x), edgeToFace: edge, given: edge >= MUSHROOM_EDGE[0] && edge <= MUSHROOM_EDGE[1] } } : {}),
    });
  }
  return out;
}
/** (b)'s rule for one rise */
export const riseFits = (r: Rise): 'single' | 'mushroom' | 'room' | 'no' =>
  r.rise <= r.climb ? 'single' : r.mushroom?.given ? 'mushroom' : r.room >= r.need ? 'room' : 'no';

/** the rises a stage gives no room for help at, in words (the relay test's (b) line) */
export function roomBreaches(st: Laid): string[] {
  return risesOf(st).filter((r) => riseFits(r) === 'no').map((r) => `rise at x ${r.x}, ${r.rise} px${r.thin ? ' (thin)' : ''}: room ${r.room} px of ${r.need}${r.why ? ` (${r.why})` : ''}${r.mushroom ? `; mushroom edge ${r.mushroom.edgeToFace} px from the face, off 20-60` : ''}`);
}
