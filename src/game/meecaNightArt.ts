/**
 * meecaNightArt — the pictures of Meeca's stage (5-M, "On the March North"), from Matt's sheets packed by
 * tools/art/w5puzzle/packmeeca.py into meeca-night.webp (meecaNightData.ts): her sixteen new poses and her pinecone carry, the vine
 * ladder, the knot, the troughs, the baskets, the teapot, the tea stain, the moonflower, the lantern stakes, the cake, Flicker, the
 * Butler, the night camp, the leaf plates, the sapling and the tea pour. Every draw returns false (and draws nothing) until the sheet
 * has loaded, so callers keep a stand-in. The sheet loads with the stage (stageSheets.ts 'meeca-night').
 */
import { trackAtlas } from './atlasLoader.ts';
import { NIGHT_ART, type NightArtName } from './meecaNightData.ts';

export const NIGHT_ART_URL = new URL('../assets/props/meeca-night.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, NIGHT_ART_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}

/** the stage's pictures have loaded (starts the load) */
export function nightArtReady(): boolean {
  load();
  return ready && !!img;
}

/** a picture's size in the game (px) at scale 1 */
export function nightSize(n: NightArtName, scale = 1): { w: number; h: number } {
  const f = NIGHT_ART[n];
  return { w: f.w * f.k * scale, h: f.h * f.k * scale };
}

export interface NightDrawOpts {
  flip?: boolean;
  scale?: number;
  alpha?: number;
  /** turned about the middle of its base (radians) */
  rot?: number;
  /** stretched to this size (px) instead of its own */
  w?: number;
  h?: number;
}

/** draw a picture with the middle of its base (its feet) at (x, bottom). False until the sheet has loaded. */
export function drawNightPiece(ctx: CanvasRenderingContext2D, n: NightArtName, x: number, bottom: number, o: NightDrawOpts = {}): boolean {
  if (!nightArtReady()) return false;
  const f = NIGHT_ART[n];
  const s = f.k * (o.scale ?? 1);
  const w = o.w ?? f.w * s;
  const h = o.h ?? f.h * s;
  const ax = o.w ? w / 2 : f.ax * s;
  ctx.save();
  ctx.translate(x, bottom);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flip) ctx.scale(-1, 1);
  if (o.alpha !== undefined) ctx.globalAlpha *= o.alpha;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -ax, -h, w, h);
  ctx.restore();
  return true;
}

/** a soft glow (the moonflower, a lantern, Flicker's tail): a radial light, added to what is under it */
export function drawGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, a: number) {
  if (a <= 0.01 || r <= 1) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color.replace('A', String(0.55 * a)));
  g.addColorStop(0.45, color.replace('A', String(0.2 * a)));
  g.addColorStop(1, color.replace('A', '0'));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
