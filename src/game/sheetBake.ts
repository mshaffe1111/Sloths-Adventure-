/**
 * A sprite sheet drawn shrunk, drawn from a copy baked at the size it is drawn (PERFORMANCE-RULES.md §2.6, §2.8).
 *
 * Drawn straight from the full-size sheet, a sprite shrunk 2 to 5 times with smoothing 'high' makes the GPU build mipmaps over the whole
 * texture, again each time Chrome drops and re-uploads it; on a slow phone that is where the draw time goes. creatureAnim.ts fixed this
 * for the clip sheets (2026-10-30); this is the same, for any sheet: the first draws note how many device pixels one sheet pixel covers
 * (the largest seen, in eighths, a little over), and where that is under 2/3 the sheet is baked into a plain canvas at that size
 * (smoothing 'high', so the copy looks the same) and drawn from there; one drawn near its own size is never copied. The bake happens
 * only while a stage gets ready (settleSheetBakes), never on a frame of play. (A plain canvas, not createImageBitmap's resize: with that,
 * the creatures went missing on Matt's Pixel, 2026-10-30.)
 */

import { canvasLost } from './canvasLost.ts';

interface Baked {
  im: HTMLImageElement;
  cv: HTMLCanvasElement | null;
  r: number;
  /** the most device px per sheet px seen since the last settle */
  need: number;
  checks: number;
  /** a draw since the last settle needed it bigger than the copy: the sheet itself until the next settle */
  short: boolean;
}
const BAKED = new WeakMap<object, Baked>();
/** every sheet drawn through here, for the settle (the sheets are the modules' own, kept for good anyway) */
const ALL = new Set<Baked>();

/** the scale a sheet is baked at for a need of `n` (device px per sheet px): eighths, a little over, at most full size */
export const bakeScaleFor = (n: number) => Math.min(1, Math.max(1 / 8, Math.ceil(n * 1.1 * 8) / 8));

/** a sheet is only copied when it is drawn at under this scale (shrunk more than 1.5 times) */
const COPY_UNDER = 2 / 3;

function bake(b: Baked, r: number) {
  const im = b.im;
  const w = Math.max(1, Math.round(im.naturalWidth * r));
  const h = Math.max(1, Math.round(im.naturalHeight * r));
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
 * Bake every sheet at the size its draws since the last settle showed it needs (copied only when that is shrunk more than 1.5 times; a
 * copy no longer needed is let go). Baking a big sheet takes long enough to drop a frame, so it is only ever done here, while a stage
 * gets ready under its title card (stageReady.ts, after its second frame): during play drawSheet never bakes. A sheet first drawn in the
 * middle of play draws from itself until the next settle, as does one drawn bigger than its copy.
 */
export function settleSheetBakes() {
  if (typeof document === 'undefined') return;
  for (const b of ALL) {
    if (b.need > 0 && b.im.complete && b.im.naturalWidth) {
      const want = bakeScaleFor(b.need);
      if (b.need >= COPY_UNDER || want >= 1) {
        if (b.cv) b.cv.width = b.cv.height = 0;
        b.cv = null;
        b.r = 1;
      } else if (!b.cv || want !== b.r) bake(b, want);
    }
    b.need = 0;
    b.checks = 0;
    b.short = false;
  }
}

/**
 * drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh), from the copy baked at the size it is drawn when there is one (settleSheetBakes). A
 * sheet still loading, or not an image, is drawn as given.
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
  if (!isImg || !im.complete || !im.naturalWidth || sw <= 0 || sh <= 0) {
    ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }
  let b = BAKED.get(im);
  if (!b) {
    BAKED.set(im, (b = { im, cv: null, r: 1, need: 0, checks: 0, short: false }));
    ALL.add(b);
  }
  // how many device pixels one sheet pixel covers here (looked at for the first 120 draws after a settle, then every 30th)
  if ((b.checks < 120 || b.checks % 30 === 0) && typeof ctx.getTransform === 'function') {
    const m = ctx.getTransform();
    const n = Math.max(Math.abs(dw / sw), Math.abs(dh / sh)) * Math.hypot(m.a, m.b);
    if (n > b.need) b.need = n;
    if (b.cv && n > b.r) b.short = true;
  }
  b.checks++;
  // (a copy the phone took back draws nothing: the sheet itself until the next settle bakes it again)
  if (b.cv && canvasLost(b.cv, 'sheet copy')) {
    b.cv = null;
    b.r = 1;
  }
  if (b.cv && !b.short) {
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
  if (b) ALL.delete(b);
  BAKED.delete(im);
}
