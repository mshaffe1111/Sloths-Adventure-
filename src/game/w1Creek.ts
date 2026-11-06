/**
 * World 1's deadly creek: a painted body of murky brown water (src/assets/props/pitwater/w1-creek.webp, made on Hugging Face from World 1's
 * pit-water strip and its own murky depth: tools/art/creek/make.py, the lead's option B, 2026-11-05), and its muddy splash
 * (w1-mud-splash.webp). A stage's drawn water of the deadly or teaching kind in World 1 draws with it (engine.ts, protoStage.ts waterArt):
 * the painted surface and 505 px of depth, tiled left to right and drifting slowly, then its own deepest colour on down to the bed.
 *
 * Both return false until their sheet has loaded (stageSheets.ts 'creek:1' preloads them); the caller then draws the pit water.
 */
import { trackAtlas } from './atlasLoader.ts';

export const W1_CREEK_URL = new URL('../assets/props/pitwater/w1-creek.webp', import.meta.url).href;
export const W1_MUD_SPLASH_URL = new URL('../assets/props/pitwater/w1-mud-splash.webp', import.meta.url).href;

const sheets = new Map<string, { img: HTMLImageElement | null; ready: boolean }>();
function sheet(url: string): HTMLImageElement | null {
  let s = sheets.get(url);
  if (!s) sheets.set(url, (s = { img: null, ready: false }));
  if (!s.img && typeof Image !== 'undefined') {
    const im = new Image();
    const sh = s;
    sh.img = im;
    trackAtlas(im, url, () => { sh.ready = true; }, () => { sh.img = null; }, () => { sh.img = null; sh.ready = false; });
  }
  return s.ready ? s.img : null;
}
/** start both pictures loading; true once both are in */
export function w1CreekReady(): boolean {
  const a = sheet(W1_CREEK_URL), b = sheet(W1_MUD_SPLASH_URL);
  return !!a && !!b;
}

/** one tile, world px: the same scale as World 1's pit-water strip (1024 px to 420), so the surface's ripples are the size they always were */
const TILE = (884 * 420) / 1024;
const TILE_H = (1232 * 420) / 1024;
/** the surface line, under the tile's top (the strip's own: 0.324 of its 256 rows) */
const SURFACE = (83 * 420) / 1024;
/** the body's deepest painted colour (its bottom rows), on down to the bed */
const BED = '#2a1c0e';

/** the creek between x0 and x1, its surface at `waterY`, down to `bottom`; it drifts slowly and bobs, as the pit water does */
export function drawW1Creek(ctx: CanvasRenderingContext2D, x0: number, x1: number, waterY: number, bottom: number, t: number): boolean {
  const img = sheet(W1_CREEK_URL);
  if (!img) return false;
  const top = waterY - SURFACE + Math.sin(t * 1.3) * 1.2;
  if (top >= bottom || x1 <= x0) return true;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top - 4, x1 - x0, bottom - top + 4);
  ctx.clip();
  if (bottom > top + TILE_H - 2) {
    ctx.fillStyle = BED;
    ctx.fillRect(x0, top + TILE_H - 2, x1 - x0, bottom - (top + TILE_H - 2));
  }
  const off = ((t * 9) % TILE + TILE) % TILE;
  for (let x = Math.floor((x0 - off) / TILE) * TILE + off; x < x1; x += TILE) ctx.drawImage(img, x, top, TILE + 0.6, TILE_H);
  ctx.restore();
  return true;
}

/** the muddy splash, `w` wide, its foot at (x, y); false while it loads */
export function drawMudSplash(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, alpha: number): boolean {
  const img = sheet(W1_MUD_SPLASH_URL);
  if (!img) return false;
  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
  ctx.drawImage(img, x - w / 2, y - h, w, h);
  ctx.restore();
  return true;
}
