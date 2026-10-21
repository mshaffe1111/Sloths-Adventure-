/**
 * Shared bits for the lair painters: a tiny repeatable random, and soft light blobs. Glow is stamped from small pre-drawn radial sprites
 * with drawImage, never shadowBlur, so a lair costs next to nothing on a phone.
 */

/** a tiny repeatable random so set pieces do not jitter from frame to frame */
export function rand(i: number): number {
  const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

const sprites = new Map<string, HTMLCanvasElement>();

function blob(rgb: string): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  let c = sprites.get(rgb);
  if (!c) {
    c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    if (!g) return null;
    const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, `rgba(${rgb},1)`);
    rg.addColorStop(0.45, `rgba(${rgb},0.5)`);
    rg.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = rg;
    g.fillRect(0, 0, 64, 64);
    sprites.set(rgb, c);
  }
  return c;
}

/** a soft blob of `rgb` ("r,g,b") stretched to w x h, centred on x, y, at `alpha` */
export function stamp(ctx: CanvasRenderingContext2D, rgb: string, x: number, y: number, w: number, h: number, alpha: number) {
  if (alpha <= 0.01) return;
  const s = blob(rgb);
  if (!s) return;
  const old = ctx.globalAlpha;
  ctx.globalAlpha = old * Math.min(1, alpha);
  ctx.drawImage(s, x - w / 2, y - h / 2, w, h);
  ctx.globalAlpha = old;
}
