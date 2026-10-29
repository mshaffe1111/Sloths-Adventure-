/**
 * waterSign — the warning sign at the water's edge (gen2 proto.gen2.waterWarnings), painted 2026-10-28 with the style model: no words,
 * a wave on its board. World 5's is the garden one (silver wood, silk and an orchid); Worlds 6-10 (and any other world) the jungle one
 * (brown wood and vine). One small sheet (water-signs.webp, waterSignData.ts), loaded with a stage that has water (stageSheets.ts
 * 'water-signs') and let go with its world like every other sheet (atlasLoader.ts).
 */
import { trackAtlas } from './atlasLoader.ts';
import { WATER_SIGN_FRAMES, WATER_SIGN_URL } from './waterSignData.ts';

/** how tall the sign stands, world px (Pokey is about 86): it has to read at a glance on a phone held either way */
export const WATER_SIGN_H = 96;

let img: HTMLImageElement | null = null;
let ready = false;

/** start the sheet loading; true once it is in */
export function warmWaterSigns(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, WATER_SIGN_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

/** which sign a world's `i`th water stands: World 5's garden sign, the jungle sign everywhere else; each painted twice, taken in turn */
export const waterSignFor = (world: number, i = 0): string => `${world === 5 ? 'sign-w5' : 'sign-jungle'}${i % 2 ? '-b' : ''}`;

/** the `i`th sign of the stage with the foot of its post at (x, y); false while its sheet loads (the caller draws a plain post) */
export function drawWaterSign(ctx: CanvasRenderingContext2D, world: number, x: number, y: number, i = 0): boolean {
  if (!warmWaterSigns()) return false;
  const f = WATER_SIGN_FRAMES[waterSignFor(world, i)];
  const k = WATER_SIGN_H / f.h;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
  return true;
}
