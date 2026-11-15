/**
 * w6WheelArt — World 6's painted sluice wheels, a lever's own look (ENG-W2, the lead's ruling 8:50 PM ET 11-14): the root-grown wheel on
 * its crank from Matt's water-room sheet (gemini/w6b-water-room-take2 `sluice-wheel`, w6PropsData.ts W6_WATER_FRAMES) and its second
 * take (props-made/w6balt `sluice-wheel-b`). A kit lever whose spec names `looks` (puzzleKit.ts) is drawn as one of them, picked by the
 * lever's x (a fresh roll may show the other: STAGE-RULES §4), `WHEEL_H` tall (the catalog's 1.57 x Pokey's 89.1 px, in scale), its
 * foot on the lever's ground; turned (the lever on), it is drawn mirrored, the crank on the other side. Until its sheet has loaded the
 * caller draws the kit's lever. Preloaded with the stage (stagePreload 'w6-wheels', stageSheets: a room whose lever names a look).
 */
import { trackAtlas } from './atlasLoader.ts';
import { W6_WATER_FRAMES, W6_WATER_URL } from './w6PropsData.ts';

const BALT_URL = new URL('../assets/w6to10/props-made/w6balt.webp', import.meta.url).href;
/** the two sheets the wheels are on (stagePreload decodes them before the stage starts) */
export const W6_WHEEL_URLS: readonly string[] = [W6_WATER_URL, BALT_URL];

/** a wheel's frame on its sheet (anchored at the middle of its foot); `sluice-wheel-b` as props-made/w6balt.json gives it (w6WheelArt.test.ts) */
export const W6_WHEELS = {
  'sluice-wheel': { sheet: 0, ...W6_WATER_FRAMES['sluice-wheel'] },
  'sluice-wheel-b': { sheet: 1, x: 443, y: 0, w: 322, h: 417, ax: 160.5, ay: 417 },
} as const;
export type W6Wheel = keyof typeof W6_WHEELS;
export const isW6Wheel = (n: string): n is W6Wheel => Object.hasOwn(W6_WHEELS, n);

/** how tall a wheel is drawn (px): the catalog's scale for it (1.57 x Pokey's 89.1 px drawn height) */
export const WHEEL_H = 140;

const imgs: Array<HTMLImageElement | null> = [null, null];
const ready = [false, false];
function load(i: 0 | 1) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(im, W6_WHEEL_URLS[i], () => { ready[i] = true; }, () => { imgs[i] = null; }, () => { imgs[i] = null; ready[i] = false; });
}
/** whether both sheets have loaded (starts the loads) */
export function w6WheelsReady(): boolean {
  load(0);
  load(1);
  return ready[0] && ready[1];
}

/** which of `looks` a lever at `x` shows: the same lever always the same, two levers apart often different */
export function wheelFor(looks: readonly string[], x: number): W6Wheel | undefined {
  const ok = looks.filter(isW6Wheel);
  if (!ok.length) return undefined;
  const h = Math.abs(Math.round(x * 2654435761)) >>> 0;
  return ok[h % ok.length];
}

/** the wheel `n`, the middle of its foot at (x, bottom), turned (mirrored) when `on`; false until its sheet has loaded */
export function drawW6Wheel(ctx: CanvasRenderingContext2D, n: W6Wheel, x: number, bottom: number, on: boolean): boolean {
  if (!w6WheelsReady()) return false;
  const f = W6_WHEELS[n];
  const s = WHEEL_H / f.h;
  ctx.save();
  ctx.translate(x, bottom);
  if (on) ctx.scale(-1, 1);
  ctx.drawImage(imgs[f.sheet]!, f.x, f.y, f.w, f.h, -f.ax * s, -f.ay * s, f.w * s, f.h * s);
  ctx.restore();
  return true;
}
