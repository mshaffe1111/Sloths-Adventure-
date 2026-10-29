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

/** a piece re-coloured once per tint (multiplied by `tint`, its own alpha kept): the pale pennant cloths take their colours this way */
const tinted = new Map<string, HTMLCanvasElement>();
function tintedPiece(name: FxName, tint: string): HTMLCanvasElement | null {
  const key = `${name}|${tint}`;
  const hit = tinted.get(key);
  if (hit) return hit;
  const f = BOSS_FX[name];
  if (!f || !ready || !img || typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = f.w;
  c.height = f.h;
  const g = c.getContext('2d');
  if (!g) return null;
  g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = tint;
  g.fillRect(0, 0, f.w, f.h);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  tinted.set(key, c);
  return c;
}

/**
 * A piece drawn `w` x `h` from its left middle at (x, y), cut into upright slices that each ride `wave(u)` (u = 0 at the left edge,
 * 1 at the right): a cloth streaming in the wind. `tint` multiplies its colour. False while the sheet loads.
 */
export function drawFxWave(ctx: CanvasRenderingContext2D, name: FxName, x: number, y: number, w: number, h: number, wave: (u: number) => number, tint?: string): boolean {
  const f = BOSS_FX[name];
  if (!f) return false;
  load();
  if (!ready || !img) return false;
  const src = tint ? tintedPiece(name, tint) : null;
  const N = 14;
  for (let i = 0; i < N; i++) {
    const u0 = i / N;
    const sw = f.w / N;
    const sx = src ? u0 * f.w : f.x + u0 * f.w;
    const sy = src ? 0 : f.y;
    const dy = wave(u0 + 0.5 / N);
    ctx.drawImage(src ?? img, sx, sy, sw + (i < N - 1 ? 1 : 0), f.h, x + u0 * w, y - h / 2 + dy, w / N + 0.6, h);
  }
  return true;
}

/**
 * A long piece laid along a path (the Sky Sovereign's screech wave along its arc): each point is [x, y, u], u being where along the
 * piece (0..1) that point takes its paint from, so a path broken into runs (where a rock shelters) still shows one wave. Each step is a
 * slice turned to the path, `thick` across. False while the sheet loads.
 */
export function drawFxAlong(ctx: CanvasRenderingContext2D, name: FxName, pts: Array<[number, number, number]>, thick: number): boolean {
  const f = BOSS_FX[name];
  if (!f) return false;
  load();
  if (!ready || !img) return false;
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0, u0] = pts[i];
    const [x1, y1, u1] = pts[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len < 0.5) continue;
    const a = Math.min(u0, u1);
    const sw = Math.max(1, Math.abs(u1 - u0) * f.w);
    ctx.save();
    ctx.translate(x0, y0);
    ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
    ctx.drawImage(img, f.x + a * f.w, f.y, sw, f.h, -0.5, -thick / 2, len + 1, thick);
    ctx.restore();
  }
  return true;
}
