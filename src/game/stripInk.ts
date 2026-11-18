/**
 * Where a painted backdrop strip's paint starts (INT-3, 11-13: PERFORMANCE-RULES §8.1, the 1-4 sideways drawcheck breach).
 *
 * A middle or near strip is a silhouette of trees over clear air: its top 27-52% of rows are fully transparent (World 1's strips,
 * measured 11-13). The fitted strips (scenery.ts drawFitted) stamped those clear rows every frame anyway, about a screen of drawImage
 * area a set for nothing; up a climb, where the strips cross-fade to the canopy ones, two sets of it (1-4 sideways: 8.02 screens > 7.5).
 * Clear rows drawn under source-over change no pixel, so leaving them out is exact.
 *
 * The rows are measured ONCE, when a strip has decoded (paintedBackdrops.ts), never in a frame: no readback ever runs in the frame path
 * (PERFORMANCE-RULES §2). A strip not measured (a canvas stand-in, no document, the node tests) starts at row 0: drawn whole, as before.
 */

/** rows read back at a time while looking for the first painted one (the search stops at it: about half a strip is read) */
const BAND = 64;
const inks = new WeakMap<object, number>();

/** the first row of `img` (a fraction of its height, 0..1) holding any pixel that is not fully clear; 0 when unknown */
export function inkTop(img: object): number {
  return inks.get(img) ?? 0;
}

/**
 * The fraction of rows from the top that hold no paint at all, from the alpha of `w` x `h` pixels read `rows` at a time by `read(y0, n)`
 * (RGBA bytes of rows y0..y0+n-1). Pure, so the node tests run it on hand-made pixels. A strip with no paint at all reads 0 (drawn whole:
 * never trim what is not understood).
 */
export function firstInkRow(w: number, h: number, read: (y0: number, n: number) => Uint8ClampedArray | null, rows = BAND): number {
  for (let y0 = 0; y0 < h; y0 += rows) {
    const n = Math.min(rows, h - y0);
    const d = read(y0, n);
    if (!d) return 0;
    for (let y = 0; y < n; y++) {
      const base = y * w * 4;
      for (let x = 0; x < w; x++) if (d[base + x * 4 + 3] !== 0) return (y0 + y) / h;
    }
  }
  return 0;
}

/** measure a decoded strip once (paintedBackdrops.ts calls it when a set, a canopy or a reveal has decoded) */
export function measureInk(img: HTMLImageElement): void {
  if (inks.has(img) || typeof document === 'undefined') return;
  const w = img.naturalWidth, h = img.naturalHeight;
  if (!w || !h) return;
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = Math.min(BAND, h);
  const c = cv.getContext('2d', { willReadFrequently: true });
  if (!c) return;
  let ink = 0;
  try {
    ink = firstInkRow(w, h, (y0, n) => {
      c.clearRect(0, 0, w, cv.height);
      // (pixel for pixel: no scaling, so every clear row reads clear and every painted one painted)
      c.drawImage(img, 0, y0, w, n, 0, 0, w, n);
      return c.getImageData(0, 0, w, n).data;
    });
  } catch {
    ink = 0;
  }
  inks.set(img, ink);
  // (its pixels are freed now, not whenever the collector gets to them)
  cv.width = 0;
}

/**
 * The first row of a fitted strip's canvas (scenery.ts makeFit: the strip `d` device rows tall from row `oy`, resampled from `ih`
 * source rows) that can hold paint: `ink` of the way down, less a margin for the resampling filter, which spreads paint up to about two
 * source rows (bicubic enlarging) or a couple of device rows (shrinking). 0 when nothing is known.
 */
export function fitInkRow(ink: number, oy: number, d: number, ih: number): number {
  if (!(ink > 0) || !(d > 0) || !(ih > 0)) return 0;
  const margin = Math.ceil(3 * Math.max(1, d / ih)) + 3;
  return Math.max(0, Math.floor(oy + ink * d) - margin);
}
