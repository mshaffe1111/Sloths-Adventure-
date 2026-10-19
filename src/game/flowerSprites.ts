/**
 * Painted flower pickups. The collectible flowers used to be little vector blooms; these are the painted cartoon flowers (cut out of
 * the sheets, nos. 65-96) so a pickup looks like it belongs in the painted world around it.
 *
 * Each world has a pool of species that fit its mood (so World 9's pickups are fire-coloured and World 8's are dusk
 * purples), each stage takes its own four from it, and a pickup's id picks one so neighbours in a row differ. Like the painted creatures it is a switch:
 * `?flowers=sprite|classic`, `localStorage.sloth_flowers = 'classic'`. It draws nothing until the atlas has loaded (the vector
 * bloom shows meanwhile) and returns false so the caller can fall back.
 */
import { trackAtlas } from './atlasLoader.ts';
import { FLOWER_FRAMES } from './flowerAtlasData.ts';

export const DEFAULT_SPRITE_FLOWERS = true;

/**
 * Each world has a pool of twelve flowers that fit its mood: the first six are its signature species, the last six are the wider
 * family. A stage takes its own window of four from the pool, so no two stages of a world carry the same mix and the whole set of
 * 32 painted flowers turns up across the game.
 */
export const WORLD_FLOWERS: Record<number, number[]> = {
  // 1 canopy meadow: bright, friendly
  1: [93, 74, 96, 76, 68, 90, 70, 84, 87, 92, 86, 94],
  // 2 river: water-lovers and gingers
  2: [79, 72, 83, 71, 78, 87, 68, 90, 84, 74, 96, 76],
  // 3 spore caves: odd and glowing
  3: [66, 85, 88, 73, 89, 80, 75, 91, 69, 95, 81, 82],
  // 4 cliffs: hanging and climbing
  4: [67, 91, 76, 93, 70, 95, 89, 75, 96, 68, 92, 94],
  // 5 web thicket: pinks and purples
  5: [69, 73, 80, 89, 82, 95, 84, 81, 93, 70, 85, 88],
  // 6 mudflat: swamp blooms
  6: [88, 79, 66, 65, 85, 72, 75, 91, 71, 78, 83, 77],
  // 7 ruins: warm amber and gold
  7: [78, 86, 76, 87, 71, 83, 94, 92, 68, 77, 90, 96],
  // 8 dusk caves: purples and magentas
  8: [82, 69, 80, 89, 73, 81, 95, 93, 70, 84, 75, 91],
  // 9 volcano: fire
  9: [77, 86, 87, 68, 92, 94, 96, 74, 65, 90, 71, 78],
  // 10 storm: cool and pale
  10: [81, 84, 95, 75, 70, 91, 93, 82, 69, 73, 89, 80],
};

/** the four flowers a stage carries (sheet numbers): a window of the world's pool that moves 3 along each stage, and 2 more each time round */
export function stageFlowers(world: number, mini: number): number[] {
  const pool = WORLD_FLOWERS[world] ?? WORLD_FLOWERS[1];
  const m = Math.max(1, mini) - 1;
  const start = (m * 3 + Math.floor(m / 4) * 2) % pool.length;
  return [0, 1, 2, 3].map((i) => pool[(start + i) % pool.length]);
}

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

/** which flower (sheet number) a pickup is, in a given stage */
export function flowerFor(world: number, mini: number, id: number): number {
  const set = stageFlowers(world, mini);
  return set[Math.abs(id) % set.length];
}

/** the painted flower box: how many world units on its longest side */
export const FLOWER_SIZE = 46;

/** draws the flower centred on the origin; false when the sprite is off or not loaded yet */
export function drawFlowerSprite(ctx: CanvasRenderingContext2D, world: number, mini: number, id: number, sway: number): boolean {
  if (!isEnabled()) return false;
  load();
  if (!ready || !atlas) return false;
  const f = FLOWER_FRAMES['f' + flowerFor(world, mini, id)];
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
