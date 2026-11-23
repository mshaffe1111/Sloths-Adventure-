/**
 * columnDress — a painted set piece stood at the foot of every COLUMN of a stage of legs (legs.ts: a leg laid up or down, its frame and its
 * floor), behind the column's ledges (READY-27; 2-7's weir, reference/design/2-7.md Art (4): "the weir: a stepped stone face with white
 * water, the D leg's dressing"). The brief names the piece by its inventory id and its drawn box at Pokey's scale (the catalog's
 * on_screen_px), and how far its foot sits under the floor's top, so the floor drawn over it hides the foot (gen2/columnDressLay.ts lays
 * it; pieces/columnDressPiece.ts draws it on layer 'back'). It is a picture only: never a platform, a petal, a river or a hurt.
 */
import type { LaidLeg } from './gen2/legs.ts';

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
