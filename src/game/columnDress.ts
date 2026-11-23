/**
 * columnDress — a painted set piece stood at the foot of every COLUMN of a stage of legs (legs.ts: a leg laid up or down, its frame and its
 * floor), behind the column's ledges (READY-27; 2-7's weir, reference/design/2-7.md Art (4): "the weir: a stepped stone face with white
 * water, the D leg's dressing"). The brief names the piece by its inventory id and its drawn box at Pokey's scale (the catalog's
 * on_screen_px), and how far its foot sits under the floor's top, so the floor drawn over it hides the foot (gen2/columnDressLay.ts lays
 * it; pieces/columnDressPiece.ts draws it on layer 'back'). It is a picture only: never a platform, a petal, a river or a hurt.
 */
import type { LaidLeg } from './gen2/legs.ts';
import type { Vine } from './types.ts';

/** a brief's column dress (GraphBrief.columnDress): what stands at every column's foot */
export interface ColumnDressSpec {
  /** the piece's inventory id (2-7: w2-next#weir) */
  art: string;
  /** its drawn box (world px): the catalog's on_screen_px for the piece */
  w: number;
  h: number;
  /** how far its foot sits under the column floor's top (world px): the floor, drawn after it, hides its foot */
  sink: number;
}

/** one laid: the piece's inventory id and its box (world px, top-left) */
export interface ColumnDress {
  art: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** the laid legs that are columns: a frame and a floor */
export const dressedColumns = (legs: readonly LaidLeg[]): LaidLeg[] => legs.filter((l) => !!l.frame && l.floorY !== undefined);

/** where `spec` stands in a column: its middle on the column's middle, its foot `spec.sink` under the floor's top */
export function dressAt(spec: ColumnDressSpec, leg: LaidLeg): ColumnDress {
  const mid = (leg.frame!.x0 + leg.frame!.x1) / 2;
  return { art: spec.art, x: Math.round(mid - spec.w / 2), y: leg.floorY! + spec.sink - spec.h, w: spec.w, h: spec.h };
}

/** what is wrong with the laid dress against the stage's columns, by name (empty: one per column, inside it, its foot where `spec` says) */
export function columnDressFaults(dress: readonly ColumnDress[], legs: readonly LaidLeg[], spec: ColumnDressSpec): string[] {
  const cols = dressedColumns(legs);
  const out: string[] = [];
  if (dress.length !== cols.length) out.push(`column dress: ${dress.length} laid for ${cols.length} columns`);
  cols.forEach((c, i) => {
    const d = dress[i];
    if (!d) return;
    if (d.art !== spec.art || d.w !== spec.w || d.h !== spec.h) out.push(`column dress ${i}: ${d.art} ${d.w}x${d.h} is not the brief's ${spec.art} ${spec.w}x${spec.h}`);
    if (d.x < c.frame!.x0 || d.x + d.w > c.frame!.x1) out.push(`column dress ${i}: ${d.x}..${d.x + d.w} is outside its column ${c.frame!.x0}..${c.frame!.x1}`);
    if (Math.abs(d.y + d.h - (c.floorY! + spec.sink)) > 0.5) out.push(`column dress ${i}: its foot at ${d.y + d.h} is not ${spec.sink} px under the floor at ${c.floorY}`);
  });
  return out;
}

/**
 * The falls' white water over the foot of a climb that stands in a dress (DRESS-27, R-165.415: 2-7's climbing pole stood in the weir's
 * pool in front of the falls, a bare trunk in the water that read as a stray post). The dress's own painted foam and pool, from `rise` px
 * over the column's floor down to it, are drawn again IN FRONT of the climb (pieces/columnDressPiece.ts, layer 'world', behind Pokey),
 * over the pole's own width only (`half` px each side: protoArt.ts draws a climb 84 px wide), the top `fade` px fading in: the pole stands
 * in the falls' white water, part of the weir. Nothing is drawn beside the pole (the same picture twice over its see-through pool would
 * thicken it there). No new art; it moves nothing. `reach`: a climb's foot this far over the dress's foot or less stands in it. `below`:
 * the band runs on under the floor's walk line to the painted ground's grass top (10 px down, measured on 2-7's stills), so the pole's foot
 * in the see-through pool is under the water there, not a bare stub between the foam and the grass. `coats`: drawn once (twice thickened
 * the pool over the pole into a darker box with hard sides).
 */
export const DRESS_FOOT = { rise: 64, below: 10, fade: 24, half: 42, reach: 80, coats: 1 } as const;

/** one climb's foot in a dress: which dress, the band's span (world px) and the floor it stands on */
export interface DressFoot {
  d: number;
  x0: number;
  x1: number;
  floor: number;
}

/** the climbs (straight up/down: 'tree_climb') whose foot stands on a dressed column's floor inside the dress's box */
export function dressFeet(dress: readonly ColumnDress[], climbs: readonly Pick<Vine, 'x' | 'bottomY' | 'vineType'>[]): DressFoot[] {
  const out: DressFoot[] = [];
  dress.forEach((d, i) => {
    for (const v of climbs) {
      if (v.vineType !== 'tree_climb' || v.x < d.x || v.x > d.x + d.w) continue;
      if (v.bottomY > d.y + d.h || v.bottomY < d.y + d.h - DRESS_FOOT.reach) continue;
      out.push({ d: i, x0: Math.max(d.x, v.x - DRESS_FOOT.half), x1: Math.min(d.x + d.w, v.x + DRESS_FOOT.half), floor: v.bottomY });
    }
  });
  return out;
}
