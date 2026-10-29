/**
 * The hurt flash (polish report AN-6): a creature that has just been hit is drawn washed white for a moment. It used to set
 * ctx.filter = 'brightness(2.2)' at about twenty draw sites, which is slow on phones and silently does nothing where canvas filters are
 * missing (Safari before 18). Here the creature is drawn once onto a shared layer, the white is laid over only what was drawn
 * ('source-atop'), and the patch is put back onto the scene: the same on every browser, and only for the frames a hit flashes.
 */
/** how white a hit creature goes (0 = not at all, 1 = a flat white silhouette) */
export const HURT_WHITE = 0.62;

let layer: HTMLCanvasElement | null = null;
let lctx: CanvasRenderingContext2D | null = null;

function layerFor(w: number, h: number): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!layer) {
    layer = document.createElement('canvas');
    lctx = layer.getContext('2d');
  }
  if (layer.width < w || layer.height < h) {
    layer.width = Math.max(layer.width, w);
    layer.height = Math.max(layer.height, h);
  }
  return lctx;
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
  const l = r.w > 0 && r.h > 0 ? layerFor(ctx.canvas.width, ctx.canvas.height) : null;
  if (!l) {
    draw(ctx);
    return;
  }
  l.save();
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.clearRect(r.x, r.y, r.w, r.h);
  l.setTransform(m);
  l.imageSmoothingEnabled = ctx.imageSmoothingEnabled;
  l.imageSmoothingQuality = ctx.imageSmoothingQuality;
  draw(l);
  l.restore();
  l.save();
  l.setTransform(1, 0, 0, 1, 0, 0);
  l.globalCompositeOperation = 'source-atop';
  l.fillStyle = `rgba(255, 255, 255, ${HURT_WHITE})`;
  l.fillRect(r.x, r.y, r.w, r.h);
  l.restore();
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(l.canvas, r.x, r.y, r.w, r.h, r.x, r.y, r.w, r.h);
  ctx.restore();
}
