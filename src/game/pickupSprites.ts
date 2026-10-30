/**
 * pickupSprites — the painted keepsakes as things to pick up in a stage (cut out of their parchment by scripts/item-cutout.py, about 96 px):
 * Meeca's petals in World 1's harvests, Grandma's things in World 3's searches, Meeca's messages in World 5's, the lieutenant's thread in
 * World 9's (stagePlan.ts says which). Small and loaded only when first drawn; until then the drawn pickup stands in.
 */
import { drawSheet } from './sheetBake.ts';

// (no bundler under the test runner, so no glob: nothing is painted there and the drawn pickups are what get tested)
let FILES: Record<string, string> = {};
try {
  FILES = import.meta.glob('../assets/pickups/*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
} catch {
  FILES = {};
}

const imgs = new Map<string, HTMLImageElement | null>();

function img(name: string): HTMLImageElement | null {
  if (imgs.has(name)) {
    const im = imgs.get(name)!;
    return im && im.complete && im.naturalWidth > 0 ? im : null;
  }
  const url = FILES[`../assets/pickups/${name}.webp`];
  if (!url || typeof Image === 'undefined') {
    imgs.set(name, null);
    return null;
  }
  const im = new Image();
  im.decoding = 'async';
  im.onerror = () => imgs.set(name, null);
  im.src = url;
  imgs.set(name, im);
  return null;
}

/** draws pickup `name` centred on the origin, `size` world units on its longest side; false when it is not (yet) loaded */
export function drawPickup(ctx: CanvasRenderingContext2D, name: string, size: number, tilt = 0): boolean {
  const im = img(name);
  if (!im) return false;
  const k = size / Math.max(im.naturalWidth, im.naturalHeight);
  const w = im.naturalWidth * k;
  const h = im.naturalHeight * k;
  ctx.save();
  if (tilt) ctx.rotate(tilt);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  drawSheet(ctx, im, 0, 0, im.naturalWidth, im.naturalHeight, -w / 2, -h / 2, w, h);
  ctx.restore();
  return true;
}
