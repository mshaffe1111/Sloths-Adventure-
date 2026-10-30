/**
 * waterSign — the warning sign at the water's edge (gen2 proto.gen2.waterWarnings): carved wood with three water lines cut into its
 * board, no words (hf-art-ground 2026-10-29, polish report VI-13: the first, comic-outlined signs clashed with the painted kits). World
 * 5's is the garden one (silver wood, silk and an orchid); Worlds 6-10 (and any other world) the jungle one (brown wood and vine). Each
 * has a rattled frame, the board knocked on its nail: as Pokey comes up to a sign it rattles for a moment (signRattle), so the warning
 * catches the eye. One small sheet (water-signs.webp, waterSignData.ts), loaded with a stage that has water (stageSheets.ts
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

/** which sign a world stands: World 5's garden sign, the jungle sign everywhere else; `rattled` its knocked frame */
export const waterSignFor = (world: number, rattled = false): string => `${world === 5 ? 'sign-w5' : 'sign-jungle'}${rattled ? '-rattle' : ''}`;

/** how long a sign rattles once he comes near (s), and how fast its board knocks (frames a second) */
export const SIGN_RATTLE = { for: 0.7, rate: 9 };
/** whether a sign he came near `since` seconds ago shows its rattled frame now (undefined: he has not come near) */
export function signRattle(since: number | undefined): boolean {
  if (since === undefined || since < 0 || since > SIGN_RATTLE.for) return false;
  return Math.floor(since * SIGN_RATTLE.rate) % 2 === 0;
}

/** a sign with the foot of its post at (x, y); false while its sheet loads (the caller draws a plain post) */
export function drawWaterSign(ctx: CanvasRenderingContext2D, world: number, x: number, y: number, rattled = false): boolean {
  if (!warmWaterSigns()) return false;
  const f = WATER_SIGN_FRAMES[waterSignFor(world, rattled)];
  const k = WATER_SIGN_H / f.h;
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
  return true;
}
