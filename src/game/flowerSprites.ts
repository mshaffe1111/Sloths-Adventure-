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
  // 1 the trail through the kapok canopy: bright and friendly (heliconia, anthurium, allamanda, hot lips, canna, red passion flower)
  1: [68, 74, 76, 85, 86, 96, 87, 71, 83, 70, 94, 90],
  // 2 the river village, where the king wants flowers for his crown: showy gingers and water-lovers
  2: [87, 72, 79, 83, 78, 71, 86, 68, 90, 74, 76, 84],
  // 3 the grotto in the dark: odd ones, and pale ones that seem to glow
  3: [66, 88, 73, 91, 75, 80, 89, 95, 69, 65, 79, 72],
  // 4 the cliffs above the falls: climbers and hanging flowers (the jade vine, the clock vine, the hanging lobster claws)
  4: [67, 94, 90, 82, 89, 84, 70, 76, 93, 95, 92, 69],
  // 5 the Orchid Sanctuary, the loveliest place on the road: orchids, all twelve
  5: [93, 81, 95, 75, 91, 73, 89, 88, 69, 82, 84, 70],
  // 6 the mangrove: rot flowers, the bucket orchid, and pale lilies on black water
  6: [65, 66, 88, 79, 72, 78, 71, 83, 85, 80, 91, 75],
  // 7 the temple ruins: amber and gold, thin and stubborn between the stones
  7: [77, 76, 94, 86, 68, 71, 78, 87, 96, 74, 83, 92],
  // 8 the treetops at night: pale night blooms by firefly light
  8: [79, 91, 75, 72, 80, 95, 89, 81, 84, 73, 82, 69],
  // 9 the volcano: fire (the flame vine first)
  9: [92, 77, 85, 86, 96, 74, 83, 71, 87, 68, 65, 94],
  // 10 the storm on the mountain: cool and pale, the few that turn to face the tower
  10: [81, 84, 95, 89, 91, 70, 73, 75, 79, 82, 80, 93],
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
export const FLOWER_SIZE = 25;

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

/** true when the painted flowers are on and loaded (starts the load the first time it is asked) */
export function flowersPainted(): boolean {
  if (!isEnabled()) return false;
  load();
  return ready && !!atlas;
}

/** draws sheet flower `num` standing on (x, y) (bottom centre), `size` world units on its longest side, for scenery. False when off or not loaded. */
export function drawFlowerAt(ctx: CanvasRenderingContext2D, num: number, x: number, y: number, size: number, flip = false): boolean {
  if (!flowersPainted() || !atlas) return false;
  const f = FLOWER_FRAMES['f' + num];
  if (!f) return false;
  const k = size / Math.max(f.w, f.h);
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, -f.h * k, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
