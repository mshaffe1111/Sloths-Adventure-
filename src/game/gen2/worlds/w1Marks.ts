/**
 * Meeca's marks, as World 1 dresses them (1-5 Where She Walked, 1-5.md beat 0: "her first mark on the trunk at marching height"): every
 * mark of hers is CUT IN A LIVING TRUNK. A kapok stands behind each mark (the plain kapok, set back in the shade like 1-1's canopy
 * trunks, protoArt.ts setDecoTrunks: wide enough to read as a tree, not a climb), and ART's bark patch (the inventory's
 * hf1113/w15-mark-right and -up) is set in it at marching height. The patch is dressing: it stays once he has read it; the pickup is the
 * light on the cut (vectorArt.ts). Her arrow points UP where her road climbs next (a climb rising from the mark's ground just ahead of
 * it), else on along the road. World 1's finish calls it (w1.ts w1Finish): a stage with no marks is left as it was.
 */
import { MARK_RISE, markPatch, ONE_DRESS, type DressPiece } from '../../dressArt.ts';
import type { Collectible, Platform, Vine } from '../../types.ts';

/** the pickup stands this far over its ground (pipeline.ts: a mark's socket `dn`, w1Arc15.ts mark()) */
export const MARK_DN = 34;
/** the trunk behind a mark: its width as a share of a climb trunk's (84 px; protoArt.ts: 1.6-2.6 reads as a kapok, not a climb) and how
 *  far it rises over the ground (out of any view: the upright screen shows about 900 px) */
export const MARK_TRUNK = { w: 1.7, rise: 1400 } as const;
/** a climb this close ahead of a mark (px), rising from its ground, turns her arrow up */
export const MARK_UP_AHEAD = 320;
/** the patch's drawn height (px): its row's pokey_scale x his drawn 89.1 */
const PATCH_H = ONE_DRESS['w15-mark-right'].scale * 89.1;

type MarkStage = {
  collectibles: Collectible[];
  platforms: Platform[];
  vines?: Vine[];
  proto?: { trunks?: Array<{ x: number; topY: number; bottomY: number; w?: number; art?: 'plain' }>; dress?: DressPiece[] };
};

/** does her road climb next: a climb whose foot is on this ground, its trunk within MARK_UP_AHEAD px ahead */
export const marksUp = (st: Pick<MarkStage, 'vines'>, x: number, ground: number): boolean =>
  (st.vines ?? []).some((v) => v.vineType !== 'swing_liana' && v.x > x && v.x - x <= MARK_UP_AHEAD && Math.abs(v.bottomY - ground) <= 30 && ground - v.topY >= 100);

/** dress every mark of hers in the stage: a kapok behind it and the cut in its bark. Returns the stage */
export function dressMarks<T extends MarkStage>(st: T): T {
  const marks = st.collectibles.filter((c) => c.type === 'relic' && c.mark === 'meeca');
  if (!marks.length) return st;
  const proto = (st.proto ??= {});
  const trunks = (proto.trunks ??= []);
  const dress = (proto.dress ??= []);
  for (const m of marks) {
    const ground = m.y + MARK_DN;
    trunks.push({ x: Math.round(m.x), topY: ground - MARK_TRUNK.rise, bottomY: ground + 6, w: MARK_TRUNK.w, art: 'plain' });
    m.arrow = marksUp(st, m.x, ground) ? 'up' : 'on';
    dress.push({ n: markPatch(m.arrow), x: Math.round(m.x), b: Math.round(ground - MARK_RISE + PATCH_H / 2) });
  }
  return st;
}
