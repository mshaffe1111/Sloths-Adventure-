/**
 * pieces/columnDressPiece — the column dress (columnDress.ts; gen2/columnDressLay.ts lays it; 2-7's weir) on the piece hook: each laid
 * set piece drawn on layer 'back' (behind the platforms, so the column's ledges and its floor stand in front of it) by its inventory id,
 * in its box, when it is near the view. Nothing is drawn until its sheet is in (w2NextArt.ts: no code-drawn stand-in). It never moves and
 * never hurts him.
 */
import type { PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { ColumnDress } from '../columnDress.ts';
import { drawW2Next } from '../w2NextArt.ts';

/** draws one piece by inventory id in its box; false when its art is not in */
export type DressDraw = (ctx: CanvasRenderingContext2D, art: string, x: number, y: number, w: number, h: number) => boolean;

export class ColumnDressPiece implements StagePiece {
  readonly kind = 'columnDress';
  readonly layers: readonly PieceLayer[] = ['back'];
  constructor(readonly dress: readonly ColumnDress[], private readonly drawArt: DressDraw = drawW2Next) {}

  step() {}

  draw(ctx: CanvasRenderingContext2D, _layer: PieceLayer, host: { view: { x: number; y: number; w: number; h: number; zoom: number } }) {
    const v = host.view;
    const right = v.x + v.w / v.zoom, bottom = v.y + v.h / v.zoom;
    for (const d of this.dress) {
      if (d.x + d.w < v.x || d.x > right || d.y + d.h < v.y || d.y > bottom) continue;
      this.drawArt(ctx, d.art, d.x, d.y, d.w, d.h);
    }
  }
}

export const COLUMN_DRESS_PIECE: PieceKind = {
  id: 'columnDress',
  start(stage) {
    const dress = stage.columnDress;
    return dress?.length ? new ColumnDressPiece(dress) : null;
  },
};
