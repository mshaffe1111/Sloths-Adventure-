/**
 * Shared ways to draw the same picture with fewer per-frame canvas calls (PERFORMANCE-RULES §1 and §8.1: gradients and clips a frame).
 * DRESS-27b, 11-23: 2-7's rivers made 4-5 gradients and 21-24 clips a frame (limits 2 and 19). Each helper here leaves the picture
 * exactly as it was: a gradient made once is the same gradient, a picture cut at its own source rect covers the same pixels a clip to
 * that rect let through, and one clip to the intersection of two regions is the same region as two clips in turn.
 */

type Stops = ReadonlyArray<readonly [number, string]>;
/** how many gradients one context keeps before the store starts again (a stage has a handful of rivers; this only bounds it) */
const GRAD_CAP = 96;
const grads = new WeakMap<object, Map<string, CanvasGradient>>();
/**
 * A vertical linear gradient from y0 to y1 with these stops, made once per context and kept. A canvas gradient's points are read in the
 * user space at the moment it paints, not when it was made, so one made at world y0..y1 paints the same under any later camera transform
 * (the sky's cache relies on the same rule, scenery.ts skyGrads).
 */
export function vGradient(ctx: Pick<CanvasRenderingContext2D, 'createLinearGradient'>, y0: number, y1: number, stops: Stops): CanvasGradient {
  let m = grads.get(ctx);
  if (!m) grads.set(ctx, (m = new Map()));
  let key = `${y0},${y1}`;
  for (const [o, c] of stops) key += `|${o}:${c}`;
  let g = m.get(key);
  if (!g) {
    if (m.size >= GRAD_CAP) m.clear();
    g = ctx.createLinearGradient(0, y0, 0, y1);
    for (const [o, c] of stops) g.addColorStop(o, c);
    m.set(key, g);
  }
  return g;
}

/**
 * The part of a picture drawn whole at (x, y, w, h) that falls inside the box bx0..bx1, by0..by1, as drawImage's nine numbers' source and
 * destination (sx, sy, sw, sh in the picture's own pixels iw x ih), or null when nothing of it is inside. Drawing that part is the same
 * as drawing the whole picture under a clip to the box, with no clip.
 */
export function cropToBox(
  x: number, y: number, w: number, h: number, iw: number, ih: number, bx0: number, by0: number, bx1: number, by1: number,
): [number, number, number, number, number, number, number, number] | null {
  const dx0 = Math.max(x, bx0), dx1 = Math.min(x + w, bx1);
  const dy0 = Math.max(y, by0), dy1 = Math.min(y + h, by1);
  if (dx1 <= dx0 || dy1 <= dy0 || w <= 0 || h <= 0) return null;
  const kx = iw / w, ky = ih / h;
  return [(dx0 - x) * kx, (dy0 - y) * ky, (dx1 - dx0) * kx, (dy1 - dy0) * ky, dx0, dy0, dx1 - dx0, dy1 - dy0];
}

/**
 * A polygon cut to an upright box (Sutherland-Hodgman against the box's four sides: the box is convex, so the result is the exact
 * intersection for any simple polygon, concave ones included, at worst with zero-width runs along the box's edge that fill nothing).
 * One clip to the result is the same region as a clip to the box and then a clip to the polygon.
 */
export function polygonInBox(poly: ReadonlyArray<readonly [number, number]>, x0: number, y0: number, x1: number, y1: number): Array<[number, number]> {
  let pts: Array<[number, number]> = poly.map(([x, y]) => [x, y]);
  const sides: Array<[(p: readonly [number, number]) => boolean, (a: readonly [number, number], b: readonly [number, number]) => [number, number]]> = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  for (const [inside, cut] of sides) {
    if (!pts.length) break;
    const out: Array<[number, number]> = [];
    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i], prev = pts[(i + pts.length - 1) % pts.length];
      const ci = inside(cur), pi = inside(prev);
      if (ci) {
        if (!pi) out.push(cut(prev, cur));
        out.push(cur);
      } else if (pi) out.push(cut(prev, cur));
    }
    pts = out;
  }
  return pts;
}
