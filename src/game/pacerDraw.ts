/**
 * pacerDraw — the pacer's look (pieces/pacerPiece.ts): its painted frames by inventory id (Pacer.art, the world's PacerRow.art: 2-7's
 * mail boat, w2-next#mailBoat and #mailBoatB, two rowing frames, w2NextArt.ts), on its lane: the hull's waterline on the lane's
 * surface, bow first the way it runs (the art's bow points left). Waiting, it holds its first frame; running, it rows. Nothing is
 * drawn until its sheet is in: no code-drawn stand-in (the lead's rule for a shipped stage).
 */
import type { Pacer } from './pacer.ts';
import { drawW2Next, w2NextFrame, W2_NEXT_SCALE } from './w2NextArt.ts';

/** s a rowing frame holds (two frames: a stroke every 0.7 s) */
export const PACER_STROKE = 0.35;
/** the share of a boat frame's height down to its waterline (measured from the cut's alpha and its water's blue, 11-21: the ripples
 *  start at 0.80, the hull meets the water at 0.85) */
export const PACER_WATERLINE = 0.85;

/** the frame it shows `clock` s after it set off (0: waiting, the first frame) */
export const pacerFrame = (p: Pacer, clock: number): string => p.art[clock > 0 ? Math.floor(clock / PACER_STROKE) % p.art.length : 0];

/** its box at `x` on its lane (world px): the frame's size at the sheet's scale, its waterline on the lane */
export function pacerBox(p: Pacer, x: number, clock: number): { x: number; y: number; w: number; h: number } | undefined {
  const f = w2NextFrame(pacerFrame(p, clock));
  if (!f) return undefined;
  const w = f.w / W2_NEXT_SCALE, h = f.h / W2_NEXT_SCALE;
  return { x: x - w / 2, y: p.lane - h * PACER_WATERLINE, w, h };
}

export function drawPacer(ctx: CanvasRenderingContext2D, p: Pacer, x: number, clock: number, view: { x: number; y: number; w: number; h: number; zoom: number }): void {
  const b = pacerBox(p, x, clock);
  if (!b) return;
  // (off screen by more than its own length: nothing to draw)
  if (b.x > view.x + view.w / view.zoom + b.w || b.x + b.w < view.x - b.w) return;
  drawW2Next(ctx, pacerFrame(p, clock), b.x, b.y, b.w, b.h, p.dir > 0);
}
