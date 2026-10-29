/**
 * w10Art — World 10's painted dressing on the gen2 stages (proto.gen2.w10, gen2/worlds/w10.ts): the banners, braziers, weapon racks,
 * cages and crate stacks that stand along the fortress walls, and the crate stacks he hides behind in 10-3 Thunder (the watcher's
 * bushes). Two looks of every piece, Matt's Gemini sheet (w10c-set-dressing) and the HF img2img sheet (w10alt), picked by the spot, so
 * neighbours differ. Pictures only: nothing here is solid. Every draw returns false (or does nothing) until both sheets have loaded.
 *
 * Light: the props are painted evenly lit; the storm keeps them a little darker than the walls they stand on (a cool multiply), and a
 * brazier's flame is its own light (a small warm glow, a light source).
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Bush } from './watcher.ts';
import { W10ALT_FRAMES, W10ALT_URL, W10C_FRAMES, W10C_URL, type W10Frame } from './w10PropsData.ts';

export const W10_ART_URLS: readonly string[] = [W10C_URL, W10ALT_URL];
const FRAMES: ReadonlyArray<Record<string, W10Frame>> = [W10C_FRAMES, W10ALT_FRAMES];
/** the game's piece names to the sheets' (the HF sheet's end in -b) */
const NAME: Record<string, string> = { banner: 'banner', brazier: 'brazier', rack: 'weapon-rack', cage: 'cage', crates: 'crates', barrels: 'crates', spout: 'spout' };

const imgs: Array<HTMLImageElement | null> = [null, null];
const ready = [false, false];
function load(i: number) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(im, W10_ART_URLS[i], () => (ready[i] = true), () => (imgs[i] = null), () => ((imgs[i] = null), (ready[i] = false)));
}
/** whether both sheets have loaded (starts the loads) */
export function w10ArtReady(): boolean {
  load(0);
  load(1);
  return ready[0] && ready[1];
}

const hash = (x: number, s: number): number => {
  const v = Math.sin(x * 12.9898 + s * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** one piece, `w` wide, its foot's middle at (x, b); the look (0 Gemini, 1 HF) from the spot */
function piece(ctx: CanvasRenderingContext2D, n: string, x: number, b: number, w: number, flip: boolean, look: number): boolean {
  const name = NAME[n] ?? n;
  const f = FRAMES[look][look === 1 ? `${name}-b` : name] ?? FRAMES[0][name];
  const img = imgs[FRAMES[look][look === 1 ? `${name}-b` : name] ? look : 0];
  if (!f || !img) return false;
  const k = w / f.w;
  ctx.save();
  ctx.translate(x, b + 2);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
  ctx.restore();
  return true;
}

export interface W10Dressing {
  scenery?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
  decor?: Array<{ n: string; x: number; b: number; w: number; flip?: boolean }>;
}

/** the dressing along the walls, behind Pokey: the decor sets and the sockets' scenery, only what is on screen */
export function drawW10Dressing(ctx: CanvasRenderingContext2D, d: W10Dressing, view: { x0: number; x1: number }, t: number): void {
  if (!w10ArtReady()) return;
  for (const it of [...(d.decor ?? []), ...(d.scenery ?? [])]) {
    if (it.x + it.w < view.x0 - 60 || it.x - it.w > view.x1 + 60) continue;
    const look = hash(it.x, 3) < 0.5 ? 0 : 1;
    if (!piece(ctx, it.n, it.x, it.b, it.w, !!it.flip, look)) continue;
    // a brazier's flame is a light: a small warm glow over it that breathes
    if (it.n === 'brazier') {
      const f = FRAMES[look][look === 1 ? 'brazier-b' : 'brazier'];
      const k = it.w / f.w;
      const cy = it.b - f.ay * k * 0.86;
      const r = it.w * (0.9 + 0.08 * Math.sin(t * 5.3 + it.x));
      const g = ctx.createRadialGradient(it.x, cy, 0, it.x, cy, r);
      g.addColorStop(0, 'rgba(190, 255, 210, 0.22)');
      g.addColorStop(1, 'rgba(190, 255, 210, 0)');
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = g;
      ctx.fillRect(it.x - r, cy - r, r * 2, r * 2);
      ctx.restore();
    }
  }
}

/**
 * A crate stack he hides behind (10-3 Thunder: the watcher's bush), drawn in front of him: the stack's width is the hiding place's; while
 * he is behind it, it shows a little see-through so he can be seen crouching there; it jolts when he bumps in (`rustle`).
 */
export function drawW10Hide(ctx: CanvasRenderingContext2D, b: Bush, inside: boolean, rustle: number, _t: number): boolean {
  if (!w10ArtReady()) return false;
  const look = hash(b.x, 7) < 0.5 ? 0 : 1;
  ctx.save();
  if (inside) ctx.globalAlpha = 0.78;
  const jolt = rustle > 0 ? Math.sin(rustle * 40) * 2 * rustle : 0;
  const ok = piece(ctx, 'crates', b.x + b.w / 2 + jolt, b.y, b.w, hash(b.x, 9) < 0.5, look);
  ctx.restore();
  return ok;
}
