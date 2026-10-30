/**
 * A sprite sheet drawn shrunk, drawn from a copy baked at the size it is drawn (PERFORMANCE-RULES.md §2.6, §2.8).
 *
 * Drawn straight from the full-size sheet, a sprite shrunk 2 to 5 times with smoothing 'high' makes the GPU build mipmaps over the whole
 * texture, again each time Chrome drops and re-uploads it; on a slow phone that is where the draw time goes. creatureAnim.ts fixed this
 * for the clip sheets (2026-10-30); this is the same, for any sheet: the first draws note how many device pixels one sheet pixel covers
 * (the largest seen, in eighths, a little over), and once that is under 2/3 the sheet is baked once into a plain canvas at that size
 * (smoothing 'high', so the copy looks the same) and drawn from there. A later draw that needs it bigger bakes it again, bigger; one
 * drawn near its own size is never copied. (A plain canvas, not createImageBitmap's resize: with that, the creatures went missing on
 * Matt's Pixel, 2026-10-30.)
 */

interface Baked {
  cv: HTMLCanvasElement | null;
  r: number;
  need: number;
  checks: number;
}
const BAKED = new WeakMap<object, Baked>();

/** the scale a sheet is baked at for a need of `n` (device px per sheet px): eighths, a little over, at most full size */
export const bakeScaleFor = (n: number) => Math.min(1, Math.max(1 / 8, Math.ceil(n * 1.1 * 8) / 8));

/** a sheet is only copied when it is drawn at under this scale (shrunk more than 1.5 times) */
const COPY_UNDER = 2 / 3;

function bake(b: Baked, im: HTMLImageElement | HTMLCanvasElement, r: number) {
  const iw = (im as HTMLImageElement).naturalWidth || im.width;
  const ih = (im as HTMLImageElement).naturalHeight || im.height;
  const w = Math.max(1, Math.round(iw * r));
  const h = Math.max(1, Math.round(ih * r));
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d');
  if (!g) return;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(im, 0, 0, w, h);
  if (b.cv) b.cv.width = b.cv.height = 0;
  b.cv = cv;
  b.r = r;
}

/**
 * drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh), from the copy baked at the size it is drawn when the sheet is drawn shrunk. A sheet
 * still loading, or not an image, is drawn as given.
 */
export function drawSheet(
  ctx: CanvasRenderingContext2D,
  im: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) {
  const isImg = typeof HTMLImageElement !== 'undefined' && im instanceof HTMLImageElement;
  if (!isImg || !im.complete || !im.naturalWidth || typeof document === 'undefined' || sw <= 0 || sh <= 0) {
    ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }
  let b = BAKED.get(im);
  if (!b) BAKED.set(im, (b = { cv: null, r: 1, need: 0, checks: 0 }));
  // how many device pixels one sheet pixel covers here (looked at for the first 120 draws, then every 30th)
  if ((b.checks < 120 || b.checks % 30 === 0) && typeof ctx.getTransform === 'function') {
    const m = ctx.getTransform();
    const n = Math.max(Math.abs(dw / sw), Math.abs(dh / sh)) * Math.hypot(m.a, m.b);
    if (n > b.need) b.need = n;
    const want = bakeScaleFor(b.need);
    if (want >= COPY_UNDER || b.need >= COPY_UNDER) {
      // drawn near its own size somewhere: the sheet itself
      if (b.cv) b.cv.width = b.cv.height = 0;
      b.cv = null;
      b.r = 1;
    } else if (b.checks >= 8 && (!b.cv || want > b.r || (b.checks === 120 && want < b.r))) bake(b, im, want);
  }
  b.checks++;
  if (b.cv) {
    // (half a baked pixel in from the frame's edge, so a neighbour frame never bleeds in; the place it lands moves in by the same
    // amount, so the sprite keeps its exact size and place)
    const r = b.r;
    const bw = sw * r;
    const bh = sh * r;
    const ex = bw > 2 ? 0.5 : 0;
    const ey = bh > 2 ? 0.5 : 0;
    const kx = dw / bw;
    const ky = dh / bh;
    ctx.drawImage(b.cv, sx * r + ex, sy * r + ey, bw - 2 * ex, bh - 2 * ey, dx + ex * kx, dy + ey * ky, dw - 2 * ex * kx, dh - 2 * ey * ky);
  } else ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
}

/** let a sheet's baked copy go (the sheet itself was let go) */
export function dropSheetBake(im: object) {
  const b = BAKED.get(im);
  if (b?.cv) b.cv.width = b.cv.height = 0;
  BAKED.delete(im);
}
