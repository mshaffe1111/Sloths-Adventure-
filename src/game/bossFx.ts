/**
 * The painted boss effects (src/assets/bosses/boss-fx.webp, bossFxData.ts; Hugging Face img2img with the style model, cut by
 * tools/art/hfbosses/bosscut.py): the one warning marker every boss uses (the cracked glowing ring on the ground, the "get out" arrow,
 * the "lands here" arrow, the Prowler's dash trail), each boss's own effects (Crocus Rex's flood water, piranha, mud wave and splash;
 * the Sky Sovereign's storm clouds, lightning, feather darts and gust; the Tarantula Queen's silk ball, web splat, cocoon, venom jet
 * and silk ripple) and the small touches every fight shares (the dust puff and the hit spark, AN-5).
 *
 * While the sheet loads nothing is drawn but the soft code glow under each cue, so a warning is never missing for long; the sheet is
 * asked for as a boss stage starts (warmBossFx).
 */
import { trackAtlas } from './atlasLoader.ts';
import { BOSS_FX } from './bossFxData.ts';

export const BOSS_FX_URL = new URL('../assets/bosses/boss-fx.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, BOSS_FX_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** start loading the sheet (a boss stage, or any stage, asks as it starts: the dust and sparks are everywhere) */
export function warmBossFx() {
  load();
}
export function bossFxReady(): boolean {
  load();
  return ready;
}

export type FxName = keyof typeof BOSS_FX | string;

export interface FxOpts {
  /** the drawn height; left out, it keeps the piece's own shape */
  h?: number;
  /** where (x, y) sits on the piece, as a fraction of its size (0.5, 0.5 = its middle; 0.5, 1 = the middle of its foot) */
  ax?: number;
  ay?: number;
  rot?: number;
  flipX?: boolean;
  alpha?: number;
}

/** one piece, `w` wide, with (x, y) at its anchor; false while the sheet loads or if the piece is missing */
export function drawFx(ctx: CanvasRenderingContext2D, name: FxName, x: number, y: number, w: number, o: FxOpts = {}): boolean {
  const f = BOSS_FX[name];
  if (!f) return false;
  load();
  if (!ready || !img) return false;
  const h = o.h ?? (w * f.h) / f.w;
  const ax = o.ax ?? 0.5;
  const ay = o.ay ?? 0.5;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flipX) ctx.scale(-1, 1);
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -w * ax, -h * ay, w, h);
  ctx.restore();
  return true;
}

/**
 * A piece laid along a run from x0 to x1 (a strip: the flood, the dash trail, the storm bank): the piece is drawn `h` tall and repeated,
 * every other copy mirrored so the joins match, the last copy cut to length. (x0, y) is the run's left end at the piece's `ay`.
 */
export function drawFxRun(ctx: CanvasRenderingContext2D, name: FxName, x0: number, x1: number, y: number, h: number, o: { ay?: number; alpha?: number; offset?: number } = {}): boolean {
  const f = BOSS_FX[name];
  if (!f) return false;
  load();
  if (!ready || !img) return false;
  const len = x1 - x0;
  if (len <= 0.5) return true;
  const tw = (f.w * h) / f.h;
  const top = y - h * (o.ay ?? 0.5);
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
  ctx.beginPath();
  ctx.rect(x0, top - 2, len, h + 4);
  ctx.clip();
  const off = (((o.offset ?? 0) % (tw * 2)) + tw * 2) % (tw * 2);
  for (let k = 0, x = x0 - off; x < x1; k++, x += tw) {
    const flip = k % 2 === 1;
    ctx.save();
    ctx.translate(x + (flip ? tw : 0), top);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, tw + 0.5, h);
    ctx.restore();
  }
  ctx.restore();
  return true;
}

/** a frame of one of the painted strips (dust0..dust7, spark0..spark5) at progress u (0..1) */
export function fxFrame(base: 'dust' | 'spark', u: number): string {
  const n = base === 'dust' ? 8 : 6;
  return `${base}${Math.max(0, Math.min(n - 1, Math.floor(u * n)))}`;
}
