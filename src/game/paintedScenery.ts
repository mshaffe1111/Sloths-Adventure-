/**
 * paintedScenery — the supplied painted plants and flowers, used as backdrop dressing.
 *
 * The 32 painted flowers and 32 painted plants used to appear only as pickups. Here they stand in the scenery too, but sparsely, as the lead
 * of a cluster, and never looking like a pickup: a backdrop shrub is drawn two to three times the size of a pickup, sits in the haze
 * (a veil of the world's own haze colour is laid over it), and moves with the parallax, not with the world. The art is loaded early
 * (menus bake their vistas first), and a bake that finds it not ready simply keeps the vector foliage.
 */
import { getScratch } from './scratch.ts';
import { rgba } from './artKit.ts';
import { plantsPainted, drawPlantAt, WORLD_PLANTS } from './plantSprites.ts';
import { flowersPainted, drawFlowerAt, WORLD_FLOWERS } from './flowerSprites.ts';

/** start loading both atlases (idempotent) */
export function warmFloraArt() {
  plantsPainted();
  flowersPainted();
}
export function floraArtReady(): boolean {
  return plantsPainted() && flowersPainted();
}

/** the plants and flowers that belong in a world's scenery: its six signature species */
export function sceneryPlants(world: number): number[] {
  return (WORLD_PLANTS[world] ?? WORLD_PLANTS[1]).slice(0, 6);
}
export function sceneryFlowers(world: number): number[] {
  return (WORLD_FLOWERS[world] ?? WORLD_FLOWERS[1]).slice(0, 6);
}

/**
 * paint one painted plant or flower into a baked layer, standing on (x, baseY), `size` units on its longest side, laid in the haze.
 * False when the art is not ready (the caller draws its vector foliage instead).
 */
export function paintShrub(target: CanvasRenderingContext2D, kind: 'plant' | 'flower', num: number, x: number, baseY: number, size: number, hazeCol: string, haze: number, flip = false): boolean {
  if (!(kind === 'plant' ? plantsPainted() : flowersPainted())) return false;
  const k = target.getTransform().a || 1;
  const pad = size * 0.2;
  const cw = Math.ceil((size * 1.3 + pad * 2) * k);
  const ch = Math.ceil((size * 1.1 + pad * 2) * k);
  const [tmp, c] = getScratch(cw, ch);
  c.save();
  c.scale(k, k);
  const ok = kind === 'plant' ? drawPlantAt(c, num, (size * 1.3 + pad * 2) / 2, size * 1.1 + pad, size, flip) : drawFlowerAt(c, num, (size * 1.3 + pad * 2) / 2, size * 1.1 + pad, size, flip);
  c.restore();
  if (!ok) return false;
  c.save();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.globalCompositeOperation = 'source-atop';
  c.fillStyle = rgba(hazeCol, haze);
  c.fillRect(0, 0, cw, ch);
  c.restore();
  target.drawImage(tmp, 0, 0, cw, ch, x - (size * 1.3 + pad * 2) / 2, baseY - size * 1.1 - pad, cw / k, ch / k);
  return true;
}

/**
 * The painted flowers and plants growing along the ground of a stage (2026-10, Matt's ask: his flowers and plants in place of the drawn
 * ones). They stand at play depth, so they must never pass for a pickup: they stand on their base instead of floating, carry no gold
 * rim, and sit a shade darker than the pickups. Each is cut once into a small shaded canvas (about 100 px) and drawn from that.
 */
const groundCache = new Map<string, HTMLCanvasElement | null>();
const GROUND_PX = 96;
function groundSprite(kind: 'plant' | 'flower', num: number): HTMLCanvasElement | null {
  const key = kind + num;
  const hit = groundCache.get(key);
  if (hit !== undefined) return hit;
  if (!(kind === 'plant' ? plantsPainted() : flowersPainted()) || typeof document === 'undefined') return null; // not cached: asked again once loaded
  const c = document.createElement('canvas');
  c.width = Math.ceil(GROUND_PX * 1.3);
  c.height = Math.ceil(GROUND_PX * 1.06);
  const g = c.getContext('2d');
  if (!g) return null;
  const ok = kind === 'plant' ? drawPlantAt(g, num, c.width / 2, c.height - 1, GROUND_PX) : drawFlowerAt(g, num, c.width / 2, c.height - 1, GROUND_PX);
  if (!ok) {
    groundCache.set(key, null);
    return null;
  }
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = 'rgba(16, 30, 22, 0.24)';
  g.fillRect(0, 0, c.width, c.height);
  groundCache.set(key, c);
  return c;
}

/** the flowers and plants of a world that grow along its ground: its six signature species of each */
export function groundFlora(world: number, kind: 'plant' | 'flower'): number[] {
  return kind === 'plant' ? sceneryPlants(world) : sceneryFlowers(world);
}

/** draw a painted flower or plant standing on (x, y), `size` units tall-ish; false when the art is not loaded (draw something else) */
export function drawGroundFlora(ctx: CanvasRenderingContext2D, kind: 'plant' | 'flower', num: number, x: number, y: number, size: number, flip = false): boolean {
  const spr = groundSprite(kind, num);
  if (!spr) return false;
  const k = size / GROUND_PX;
  const w = spr.width * k;
  const h = spr.height * k;
  if (flip) {
    ctx.save();
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(spr, -w / 2, y - h, w, h);
    ctx.restore();
  } else ctx.drawImage(spr, x - w / 2, y - h, w, h);
  return true;
}

// the art starts loading as soon as the game does, so by the time a stage bakes its backdrop (a second or two later) it is ready
if (typeof window !== 'undefined') warmFloraArt();
