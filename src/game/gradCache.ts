/**
 * Gradients whose stops and span do not change from frame to frame, created once per context and reused (PERFORMANCE-RULES §8: a
 * gradient made every frame is a per-frame allocation and counts against drawcheck's gradients limit).
 *
 * A CanvasGradient keeps its own line (x0,y0 to x1,y1) in the user space of whatever transform is current when it fills, so the same
 * object filled under the same transform paints exactly what a fresh one would. Callers whose span moves with the camera build it once
 * at the origin and fill translated (protoArt.ts drawWallChunks).
 *
 * The cache is per context (an offscreen canvas has its own) and small: it is emptied when it passes MAX entries, so a caller whose key
 * does change every frame costs a miss, never a leak.
 */
const MAX = 48;
const caches = new WeakMap<CanvasRenderingContext2D, Map<string, CanvasGradient>>();

export function cachedLinearGradient(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: readonly (readonly [number, string])[],
): CanvasGradient {
  let m = caches.get(ctx);
  if (!m) caches.set(ctx, (m = new Map()));
  let key = `${x0},${y0},${x1},${y1}`;
  for (const [o, c] of stops) key += `|${o}:${c}`;
  let g = m.get(key);
  if (!g) {
    if (m.size >= MAX) m.clear();
    g = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [o, c] of stops) g.addColorStop(o, c);
    m.set(key, g);
  }
  return g;
}
