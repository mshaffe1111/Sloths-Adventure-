/**
 * bossAtk — the bosses' painted attacks (2026-10-29, Hugging Face img2img of plain-shape starts, tools/art/hazard/bosscut.py): the
 * columns that erupt out of the floor (a lava geyser, a bramble of thorns, stone spikes, a crystal cluster, silk strands, the croc rising),
 * the things that fall or fly (stalactite spikes, a bat, clubs, thorn darts, globs of lava, mud and venom, embers, a rock), the puddles
 * they leave, and the long ones (a flame jet, a thorny vine whip, an energy beam, a spear thrust, flames along the ground, a lava strip).
 * They replace the code shapes bossArt.ts drew (Matt 2026-10-29: repeating effects are painted); the code stays only as the stand-in for
 * the moment before the sheet has loaded (stagePreload asks for it on every stage).
 */
import { trackAtlas } from './atlasLoader.ts';
import { BOSS_ATK } from './bossAtkData.ts';

export const BOSS_ATK_URL = new URL('../assets/bosses/boss-atk.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, BOSS_ATK_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** start loading the sheet; whether it has loaded */
export function bossAtkReady(): boolean {
  load();
  return ready && !!img;
}

export type AtkName = keyof typeof BOSS_ATK | string;

/**
 * One piece, `w` wide (its own shape kept unless `h` is given), with (x, y) at its anchor (`ax`, `ay`: fractions of its size; 0.5, 1 is
 * the middle of its foot), turned `rot`, mirrored with `flipX`. False while the sheet loads or if the piece is missing.
 */
export function drawAtk(ctx: CanvasRenderingContext2D, name: AtkName, x: number, y: number, w: number, o: { h?: number; ax?: number; ay?: number; rot?: number; flipX?: boolean; alpha?: number } = {}): boolean {
  const f = BOSS_ATK[name];
  if (!f || !bossAtkReady()) return false;
  const h = o.h ?? (w * f.h) / f.w;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
  ctx.translate(x, y);
  if (o.rot) ctx.rotate(o.rot);
  if (o.flipX) ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w * (o.ax ?? 0.5), -h * (o.ay ?? 0.5), w, h);
  ctx.restore();
  return true;
}

/** a piece's height at width w (0 when it is missing) */
export function atkHeight(name: AtkName, w: number): number {
  const f = BOSS_ATK[name];
  return f ? (w * f.h) / f.w : 0;
}

/**
 * A long piece laid along the floor from x0 to x1 with its foot at `foot`, `h` tall: repeated, every other copy mirrored so the joins
 * match, clipped to the run, sliding by `offset` (flames along the ground, a lava strip). False while the sheet loads.
 */
export function drawAtkRun(ctx: CanvasRenderingContext2D, name: AtkName, x0: number, x1: number, foot: number, h: number, o: { offset?: number; alpha?: number } = {}): boolean {
  const f = BOSS_ATK[name];
  if (!f || !bossAtkReady()) return false;
  if (x1 - x0 <= 0.5) return true;
  const tw = (f.w * h) / f.h;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
  ctx.beginPath();
  ctx.rect(x0, foot - h - 4, x1 - x0, h + 8);
  ctx.clip();
  const off = (((o.offset ?? 0) % (tw * 2)) + tw * 2) % (tw * 2);
  for (let k = 0, x = x0 - off; x < x1; k++, x += tw) {
    ctx.save();
    ctx.translate(x + (k % 2 ? tw : 0), foot - h);
    if (k % 2) ctx.scale(-1, 1);
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, tw + 0.5, h);
    ctx.restore();
  }
  ctx.restore();
  return true;
}
