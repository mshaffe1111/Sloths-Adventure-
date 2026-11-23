/**
 * pieces/columnDressPiece — the column dress (columnDress.ts; gen2/columnDressLay.ts lays it; 2-7's weir) on the piece hook: each laid
 * set piece drawn on layer 'back' (behind the platforms, so the column's ledges and its floor stand in front of it) by its inventory id,
 * in its box, when it is near the view. Nothing is drawn until its sheet is in (w2NextArt.ts: no code-drawn stand-in). It never moves and
 * never hurts him.
 */
import type { PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import { DRESS_FOOT, dressFeet, type ColumnDress, type DressFoot } from '../columnDress.ts';
import { drawW2Next, drawW2NextPart } from '../w2NextArt.ts';

/** draws one piece by inventory id in its box; false when its art is not in */
export type DressDraw = (ctx: CanvasRenderingContext2D, art: string, x: number, y: number, w: number, h: number) => boolean;
/** draws a part (px, py, pw, ph) of one piece where the whole piece (x, y, w, h) is drawn; false when its art is not in */
export type DressPartDraw = (ctx: CanvasRenderingContext2D, art: string, x: number, y: number, w: number, h: number, px: number, py: number, pw: number, ph: number) => boolean;
/** the foot band's fade-in: the strips over its top `DRESS_FOOT.fade` px, each this alpha (then the rest at 1) */
const FOOT_FADE = [0.2, 0.45, 0.7, 0.9] as const;

export class ColumnDressPiece implements StagePiece {
  readonly kind = 'columnDress';
  readonly layers: readonly PieceLayer[];
  constructor(
    readonly dress: readonly ColumnDress[],
    private readonly drawArt: DressDraw = drawW2Next,
    /** the climbs standing in a dress (columnDress.ts dressFeet): its foam drawn again over each foot, layer 'world' */
    readonly feet: readonly DressFoot[] = [],
    private readonly drawPart: DressPartDraw = drawW2NextPart,
  ) {
    this.layers = feet.length ? ['back', 'world'] : ['back'];
  }

  step() {}

  draw(ctx: CanvasRenderingContext2D, layer: PieceLayer, host: { view: { x: number; y: number; w: number; h: number; zoom: number } }) {
    const v = host.view;
    const right = v.x + v.w / v.zoom, bottom = v.y + v.h / v.zoom;
    if (layer === 'world') {
      // the falls' white water over each climb's foot (DRESS_FOOT): the band's top fades in by strips, then the rest down to the floor
      for (const f of this.feet) {
        const d = this.dress[f.d];
        const top = f.floor - DRESS_FOOT.rise;
        if (f.x1 < v.x || f.x0 > right || f.floor + DRESS_FOOT.below < v.y || top > bottom) continue;
        const sh = DRESS_FOOT.fade / FOOT_FADE.length;
        const a0 = ctx.globalAlpha;
        for (let coat = 0; coat < DRESS_FOOT.coats; coat++) {
          FOOT_FADE.forEach((a, i) => {
            ctx.globalAlpha = a0 * a;
            this.drawPart(ctx, d.art, d.x, d.y, d.w, d.h, f.x0, top + i * sh, f.x1 - f.x0, sh);
          });
          ctx.globalAlpha = a0;
          this.drawPart(ctx, d.art, d.x, d.y, d.w, d.h, f.x0, top + DRESS_FOOT.fade, f.x1 - f.x0, DRESS_FOOT.rise - DRESS_FOOT.fade + DRESS_FOOT.below);
        }
      }
      return;
    }
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
    return dress?.length ? new ColumnDressPiece(dress, drawW2Next, dressFeet(dress, stage.vines ?? [])) : null;
  },
};
