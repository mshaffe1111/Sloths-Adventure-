/**
 * wheelDraw — the water wheel's look (wheel.ts; pieces/wheelPiece.ts calls it on the 'back' layer, behind the jetty, the street and him):
 * World 2's painted noria (ART-W2B, Hugging Face from World 2's own wood pieces; src/assets/props/w2-wheel.webp, w2WheelData.ts).
 *
 *   - The rim and its six spokes: ONE painted picture turned with the wheel, centred on the axle and scaled so its rim's middle line
 *     (frame `r`) is the wheel's R: a spoke points at every bucket floor (the art's spokes at 60 deg, bucket 0 straight down). Its turn is
 *     read off a bucket's own floor (any bucket: the spokes repeat every 1/N turn), so the picture can never drift from the colliders.
 *   - Each bucket: the painted trough, its floor board's top drawn ON the bucket platform's top (art = collider: where his feet are),
 *     level (a gondola), dry on the way up and spilling over the rim's top (the top SPILL_DEG either side of straight up).
 *   - Until the sheet has loaded (it is preloaded with the stage, stageSheets 'w2-wheel'), each bucket's floor is filled plain, so a
 *     bucket he can stand on is never invisible.
 */
import type { Platform } from './types.ts';
import { WHEEL, sweepBox, type Wheel } from './wheel.ts';
import { trackAtlas } from './atlasLoader.ts';
import { W2_WHEEL_FRAMES as F, W2_WHEEL_URL } from './w2WheelData.ts';

/** a bucket spills over the top this far either side of straight up (deg) */
export const SPILL_DEG = 55;
/** how far the painted trough reaches over its floor (px): the walls and the spill */
const OVER = 60;
/** the millrace wall's coping stands this far over the pond's surface (px), and reaches this far under it (behind the water) */
const LIP_UP = 34;
const LIP_DOWN = 70;

let img: HTMLImageElement | null = null;
let ready = false;
/** whether the wheel's sheet has loaded (starts the load) */
export function w2WheelReady(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, W2_WHEEL_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready;
}

/** a bucket at floor-middle (mx, y) on wheel w spills (it is within SPILL_DEG of the top) */
export const spilling = (w: Pick<Wheel, 'cx' | 'cy' | 'R'>, mx: number, y: number): boolean =>
  (w.cy - y) / w.R >= Math.cos((SPILL_DEG * Math.PI) / 180) && Math.abs(mx - w.cx) <= w.R;

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
  if (!seen(box.x0 - WHEEL.pondMargin, box.y0 - OVER, box.x1 + WHEEL.pondMargin, w.cy + w.R + WHEEL.pond + LIP_DOWN)) return;
  if (!w2WheelReady() || !img) {
    ctx.fillStyle = '#6b5440';
    for (const b of buckets) ctx.fillRect(b.x, b.y, b.width, b.height);
    return;
  }
  paintWheel(ctx, img, w, buckets);
}

/** the painted wheel from its loaded sheet `im` (drawWheel's painted path; exported for wheelDraw.test.ts) */
export function paintWheel(ctx: CanvasRenderingContext2D, im: CanvasImageSource, w: Wheel, buckets: readonly Platform[]): void {
  const box = sweepBox(w);
  // the millrace's wooden wall stands in the pond under the wheel (the pond: the sweep and WHEEL.pondMargin each side, its surface
  // WHEEL.pond under the bottom floor; gen2/wheelLay.ts layWheel), LIP_UP over the water, the water drawn over its foot
  const p0 = box.x0 - WHEEL.pondMargin, p1 = box.x1 + WHEEL.pondMargin, surf = w.cy + w.R + WHEEL.pond;
  // the millrace wall: its two halves end to end across the pond (each painted with a post at both ends: they meet at a double post)
  const half = (p1 - p0) / 2, lh = LIP_UP + LIP_DOWN;
  ctx.drawImage(im, F.lip.x, F.lip.y, F.lip.w, F.lip.h, p0, surf - LIP_UP, half, lh);
  ctx.drawImage(im, F.lip.x, F.lip.y, F.lip.w, F.lip.h, p0 + half, surf - LIP_UP, half, lh);
  // the rim and spokes, turned so a spoke meets a bucket floor's middle: (-sin a, cos a) R = (mx - cx, y - cy)
  const b0 = buckets[0];
  const a = b0 ? Math.atan2(-(b0.x + b0.width / 2 - w.cx), b0.y - w.cy) : 0;
  const k = w.R / F.noria.r;
  ctx.save();
  ctx.translate(w.cx, w.cy);
  ctx.rotate(a);
  ctx.drawImage(im, F.noria.x, F.noria.y, F.noria.w, F.noria.h, (-F.noria.w / 2) * k, (-F.noria.h / 2) * k, F.noria.w * k, F.noria.h * k);
  ctx.restore();
  // each bucket: its floor board's top on the platform's top ((ax, ay) on each frame: the floor's left end, top), every frame the same trough
  for (const b of buckets) {
    // the stream pours over the trough's end on the wheel's rising side (toward the jetty, -way): two painted frames, no mirror
    const f = !spilling(w, b.x + b.width / 2, b.y) ? F.bucket : w.way > 0 ? F.bucketSpillL : F.bucketSpillR;
    const s = b.width / F.bucket.floorW;
    ctx.drawImage(im, f.x, f.y, f.w, f.h, b.x - f.ax * s, b.y - f.ay * s, f.w * s, f.h * s);
  }
}
