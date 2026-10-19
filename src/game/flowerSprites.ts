/**
 * Painted flower pickups. The collectible flowers used to be little vector blooms; these are the painted cartoon flowers (cut out of
 * the sheets, nos. 65-96) so a pickup looks like it belongs in the painted world around it.
 *
 * Each world has its own handful of species that fit its mood (so World 9's pickups are fire-coloured and World 8's are dusk
 * purples), and a pickup's id picks one so neighbours in a row differ. Like the painted creatures it is a switch:
 * `?flowers=sprite|classic`, `localStorage.sloth_flowers = 'classic'`. It draws nothing until the atlas has loaded (the vector
 * bloom shows meanwhile) and returns false so the caller can fall back.
 */
import { trackAtlas } from './atlasLoader.ts';
import { FLOWER_FRAMES } from './flowerAtlasData.ts';

export const DEFAULT_SPRITE_FLOWERS = true;

/** which painted flowers (by sheet number) each world draws from */
export const WORLD_FLOWERS: Record<number, number[]> = {
  // 1 canopy meadow: bright, friendly
  1: [93, 74, 96, 76, 68, 90],
  // 2 river: water-lovers and gingers
  2: [79, 72, 83, 71, 78, 87],
  // 3 spore caves: odd and glowing
  3: [66, 85, 88, 73, 89, 80],
  // 4 cliffs: hanging and climbing
  4: [67, 91, 76, 93, 70, 95],
  // 5 web thicket: pinks and purples
  5: [69, 73, 80, 89, 82, 95],
  // 6 mudflat: swamp blooms
  6: [88, 79, 66, 65, 85, 72],
  // 7 ruins: warm amber and gold
  7: [78, 86, 76, 87, 71, 83],
  // 8 dusk caves: purples and magentas
  8: [82, 69, 80, 89, 73, 81],
  // 9 volcano: fire
  9: [77, 86, 87, 68, 92, 94],
  // 10 storm: cool and pale
  10: [81, 84, 95, 75, 70, 91],
};

let enabled: boolean | null = null;
function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_FLOWERS;
  try {
    const q = new URLSearchParams(location.search).get('flowers');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_flowers') === 'classic') v = false;
  } catch {
    /* no window or storage: keep the default */
  }
  enabled = v;
  return v;
}

let atlas: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (atlas || typeof Image === 'undefined') return;
  const img = new Image();
  atlas = img;
  trackAtlas(img, new URL('../assets/flora/flowers-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}

/** which flower (sheet number) a pickup is, in a given world */
export function flowerFor(world: number, id: number): number {
  const set = WORLD_FLOWERS[world] ?? WORLD_FLOWERS[1];
  return set[Math.abs(id) % set.length];
}

/** the painted flower box: how many world units on its longest side */
export const FLOWER_SIZE = 46;

/** draws the flower centred on the origin; false when the sprite is off or not loaded yet */
export function drawFlowerSprite(ctx: CanvasRenderingContext2D, world: number, id: number, sway: number): boolean {
  if (!isEnabled()) return false;
  load();
  if (!ready || !atlas) return false;
  const f = FLOWER_FRAMES['f' + flowerFor(world, id)];
  if (!f) return false;
  const k = FLOWER_SIZE / Math.max(f.w, f.h);
  ctx.save();
  ctx.rotate(sway);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
