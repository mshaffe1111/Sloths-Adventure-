/**
 * wheelDraw — the water wheel's look (wheel.ts; pieces/wheelPiece.ts calls it), the ONE function the painted wheel replaces (ART-W2B:
 * the noria's rim and spokes, its bucket in a dry and a spilling frame, the millrace lip; reference/qa-reports/ENG-26/REPORT.md "Art").
 *
 * Until that art lands this draws PLACEHOLDER code shapes, and only a toy lays a wheel (STAGE-RULES §4: a look that changes a major part of
 * the screen is painted; 2-6 is not built before its art). The shapes are the wheel's real geometry: the rim through the bucket floors,
 * a spoke to each bucket, each bucket a trough standing on its floor (the platform's top, where his feet are), so a still reads true.
 */
import type { Platform } from './types.ts';
import { sweepBox, type Wheel } from './wheel.ts';

/** a bucket trough's wall height over its floor (px): about his knees (Pokey's drawn 89.1 px, heroSprite.ts) */
const WALL = 34;

/**
 * draw one wheel and its buckets (world px, behind him). `buckets` are its bucket platforms, already moved to `t` by the piece;
 * `seen` says whether a box is on screen (a wheel wholly off screen draws nothing)
 */
export function drawWheel(
  ctx: CanvasRenderingContext2D,
  w: Wheel,
  buckets: readonly Platform[],
  seen: (x0: number, y0: number, x1: number, y1: number) => boolean,
): void {
  const box = sweepBox(w);
  if (!seen(box.x0, box.y0 - WALL, box.x1, box.y1)) return;
  ctx.save();
  // the rim and the spokes (dark wet wood)
  ctx.strokeStyle = '#4a3322';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(w.cx, w.cy, w.R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 7;
  ctx.beginPath();
  for (const b of buckets) {
    ctx.moveTo(w.cx, w.cy);
    ctx.lineTo(b.x + b.width / 2, b.y);
  }
  ctx.stroke();
  // the hub
  ctx.fillStyle = '#2f2015';
  ctx.beginPath();
  ctx.arc(w.cx, w.cy, 16, 0, Math.PI * 2);
  ctx.fill();
  // each bucket: a trough standing on its floor, open at the top
  for (const b of buckets) {
    ctx.fillStyle = '#7a5532';
    ctx.fillRect(b.x, b.y - WALL, b.width, WALL);
    ctx.fillStyle = '#5b3d22';
    ctx.fillRect(b.x, b.y, b.width, b.height);
    ctx.fillRect(b.x, b.y - WALL, 8, WALL);
    ctx.fillRect(b.x + b.width - 8, b.y - WALL, 8, WALL);
  }
  ctx.restore();
}
