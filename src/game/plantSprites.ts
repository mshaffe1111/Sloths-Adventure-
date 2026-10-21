/**
 * Painted foliage-plant pickups. About half of the collectibles are "leaf" pickups (the fern and monstera variants); they used to be
 * a single vector leaf, which stood out next to the painted flowers. These are the painted cartoon foliage plants (cut out of the
 * sheets, nos. 17-32 and 49-64): monsteras, calatheas, alocasias, ferns, crotons, bromeliads and so on.
 *
 * Like the flowers, each world has a pool of twelve that fit its mood, each stage takes its own window of four from it, and a
 * pickup's id picks one so neighbours differ. A switch like the other painted art: `?plants=sprite|classic`,
 * `localStorage.sloth_plants = 'classic'`. It draws nothing until the atlas has loaded and then returns false so the caller can
 * fall back to the vector leaf.
 */
import { trackAtlas } from './atlasLoader.ts';
import { PLANT_FRAMES } from './plantAtlasData.ts';

export const DEFAULT_SPRITE_PLANTS = true;

/** each world's pool of twelve plants (sheet numbers): the first six are its signature plants, the last six the wider family */
export const WORLD_PLANTS: Record<number, number[]> = {
  // 1 canopy meadow: fresh, bright greens
  1: [29, 52, 58, 24, 25, 27, 17, 22, 60, 54, 28, 21],
  // 2 river: big wet leaves
  2: [24, 26, 29, 50, 52, 58, 61, 63, 25, 27, 17, 64],
  // 3 spore caves: pale, silvery, odd
  3: [20, 31, 55, 64, 19, 28, 59, 22, 26, 53, 23, 49],
  // 4 cliffs: bromeliads, staghorns and ferns
  4: [23, 21, 29, 54, 51, 31, 58, 60, 52, 25, 27, 64],
  // 5 web thicket: pinks and purples
  5: [19, 28, 56, 57, 32, 30, 49, 20, 22, 55, 64, 18],
  // 6 mudflat: dark swamp leaves
  6: [26, 50, 61, 63, 53, 51, 24, 29, 25, 58, 60, 52],
  // 7 ruins: warm amber and gold
  7: [18, 62, 23, 32, 57, 21, 30, 49, 51, 60, 29, 17],
  // 8 dusk caves: purples and deep greens
  8: [56, 19, 28, 53, 63, 26, 50, 55, 64, 31, 20, 57],
  // 9 volcano: fire colours
  9: [18, 21, 30, 23, 62, 32, 56, 57, 19, 28, 51, 49],
  // 10 storm: cool and pale
  10: [31, 55, 64, 20, 17, 49, 59, 22, 52, 26, 63, 53],
};

/** the four plants a stage carries: a window of the world's pool that moves 3 along each stage, and 2 more each time round */
export function stagePlants(world: number, mini: number): number[] {
  const pool = WORLD_PLANTS[world] ?? WORLD_PLANTS[1];
  const m = Math.max(1, mini) - 1;
  const start = (m * 3 + Math.floor(m / 4) * 2) % pool.length;
  return [0, 1, 2, 3].map((i) => pool[(start + i) % pool.length]);
}

/** which plant (sheet number) a pickup is, in a given stage */
export function plantFor(world: number, mini: number, id: number): number {
  const set = stagePlants(world, mini);
  return set[Math.abs(id) % set.length];
}

let enabled: boolean | null = null;
function isEnabled(): boolean {
  if (enabled !== null) return enabled;
  let v = DEFAULT_SPRITE_PLANTS;
  try {
    const q = new URLSearchParams(location.search).get('plants');
    if (q === 'sprite') v = true;
    else if (q === 'classic') v = false;
    else if (localStorage.getItem('sloth_plants') === 'classic') v = false;
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
  trackAtlas(img, new URL('../assets/flora/plants-atlas.webp', import.meta.url).href, () => { ready = true; }, () => { atlas = null; });
}

/** the painted plant box: how many world units on its longest side (the pickup code then scales it 1.4x, like the flowers) */
export const PLANT_SIZE = 28;

/** true when the painted plants are on and loaded (starts the load the first time it is asked) */
export function plantsPainted(): boolean {
  if (!isEnabled()) return false;
  load();
  return ready && !!atlas;
}

/** draws the plant centred on the origin; false when the sprite is off or not loaded yet */
export function drawPlantSprite(ctx: CanvasRenderingContext2D, world: number, mini: number, id: number, sway: number): boolean {
  if (!isEnabled()) return false;
  load();
  if (!ready || !atlas) return false;
  const f = PLANT_FRAMES['p' + plantFor(world, mini, id)];
  if (!f) return false;
  const k = PLANT_SIZE / Math.max(f.w, f.h);
  ctx.save();
  ctx.rotate(sway);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(atlas, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

/**
 * draws sheet plant `num` standing on (x, y) (bottom centre), `size` world units on its longest side. For scenery: the pickups
 * draw their plant centred at 28 units, so a backdrop shrub is drawn two or three times that and hazed, never at pickup size.
 * False when the sprite is off or not loaded yet.
 */
export function drawPlantAt(ctx: CanvasRenderingContext2D, num: number, x: number, y: number, size: number, flip = false): boolean {
  if (!plantsPainted() || !atlas) return false;
  const f = PLANT_FRAMES['p' + num];
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
