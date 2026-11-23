/**
 * columnDressLay — the brief's column dress (columnDress.ts; 2-7's weir) laid on a built stage of legs: one at the foot of every column,
 * its middle on the column's middle, its foot sunk into the floor by the spec. A column narrower than the piece is refused by name (the
 * piece is never laid over the column's walls); a stage with no column lays none. It reads the laid legs only and moves nothing.
 */
import { columnDressFaults, dressAt, dressedColumns, type ColumnDress, type ColumnDressSpec } from '../columnDress.ts';
import type { LaidLeg } from './legs.ts';

export function layColumnDress(legs: readonly LaidLeg[], spec: ColumnDressSpec): { dress?: ColumnDress[]; problems: string[] } {
  const cols = dressedColumns(legs);
  const narrow = cols.find((c) => c.frame!.x1 - c.frame!.x0 < spec.w);
  if (narrow) return { problems: [`column dress: ${spec.art} is ${spec.w} px wide and the column at x ${Math.round(narrow.frame!.x0)} holds ${Math.round(narrow.frame!.x1 - narrow.frame!.x0)} px`] };
  if (!cols.length) return { problems: [] };
  const dress = cols.map((c) => dressAt(spec, c));
  return { dress, problems: columnDressFaults(dress, legs, spec) };
}
