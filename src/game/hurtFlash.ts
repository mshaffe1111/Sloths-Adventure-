/**
 * The hurt flash (polish report AN-6): a creature that has just been hit is drawn washed white for a moment. It used to set
 * ctx.filter = 'brightness(2.2)' at about twenty draw sites, which is slow on phones and silently does nothing where canvas filters are
 * missing (Safari before 18). Here the creature is drawn once onto a small layer the size of its box, the white is laid over only what was drawn
 * ('source-atop'), and the patch is put back onto the scene: the same on every browser, and only for the frames a hit flashes.
 */
/** how white a hit creature goes (0 = not at all, 1 = a flat white silhouette) */
export const HURT_WHITE = 0.62;

// A few small layers, each the size of a creature's box (not the screen), used in turn: a full-screen layer cost a whole-screen texture
// on every flash, and drawing on it again while the scene still held the last copy made the browser copy all of it (several a frame in a
// fight; Duet's second look, 2026-10-30; PERFORMANCE-RULES.md §2.9)
const RING = 4;
const layers: Array<{ cv: HTMLCanvasElement; g: CanvasRenderingContext2D } | null> = [];
let turn = 0;

function layerFor(w: number, h: number): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  turn = (turn + 1) % RING;
  let L = layers[turn];
  if (!L) {
    const cv = document.createElement('canvas');
    const g = cv.getContext('2d');
    if (!g) return null;
    L = layers[turn] = { cv, g };
  }
  // (grown in steps of 64 px, never shrunk, so a creature's box changing a little does not resize it every frame)
  if (L.cv.width < w || L.cv.height < h) {
    L.cv.width = Math.max(L.cv.width, Math.ceil(w / 64) * 64);
    L.cv.height = Math.max(L.cv.height, Math.ceil(h / 64) * 64);
  }
  return L.g;
}

/** the device-pixel box (clamped to the canvas) round a world-space box, under the context's current transform */
export function deviceBox(m: DOMMatrix | { a: number; b: number; c: number; d: number; e: number; f: number }, x: number, y: number, w: number, h: number, cw: number, ch: number) {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const [px, py] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
    xs.push(m.a * px + m.c * py + m.e);
    ys.push(m.b * px + m.d * py + m.f);
  }
  const x0 = Math.max(0, Math.floor(Math.min(...xs)));
  const y0 = Math.max(0, Math.floor(Math.min(...ys)));
  const x1 = Math.min(cw, Math.ceil(Math.max(...xs)));
  const y1 = Math.min(ch, Math.ceil(Math.max(...ys)));
  return { x: x0, y: y0, w: Math.max(0, x1 - x0), h: Math.max(0, y1 - y0) };
}

/**
 * Draw `draw` onto ctx; when `on`, washed white. (x, y, w, h) is a world-space box, under the current transform, that the drawing
 * stays inside: only that patch is cleared, tinted and copied back.
 */
export function withHurtFlash(ctx: CanvasRenderingContext2D, on: boolean, x: number, y: number, w: number, h: number, draw: (c: CanvasRenderingContext2D) => void): void {
  if (!on) {
    draw(ctx);
    return;
  }
  const m = ctx.getTransform();
  const r = deviceBox(m, x, y, w, h, ctx.canvas.width, ctx.canvas.height);
  const l = r.w > 0 && r.h > 0 ? layerFor(r.w, r.h) : null;
  if (!l) {
    draw(ctx);
    return;
  }
  l.save();
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.clearRect(0, 0, r.w, r.h);
  // (the scene's transform, moved so the box's corner is the layer's corner)
  l.setTransform(m.a, m.b, m.c, m.d, m.e - r.x, m.f - r.y);
  l.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
  l.imageSmoothingQuality = ctx.imageSmoothingQuality;
  draw(l);
  l.restore();
  l.save();
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.globalCompositeOperation = 'source-atop';
  l.fillStyle = `rgba(255, 255, 255, ${HURT_WHITE})`;
  l.fillRect(0, 0, r.w, r.h);
  l.restore();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(l.canvas, 0, 0, r.w, r.h, r.x, r.y, r.w, r.h);
  ctx.restore();
}
