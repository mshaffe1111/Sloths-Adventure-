/**
 * rubbleArt — painted ground clutter that replaces code-drawn dressing that read as hazards (2026-10-29, CLEAN-SWEEP S2): World 9's
 * obsidian (black code spikes) and World 10's broken iron thorns (dark code shards). Neither hurts Pokey, so they are painted as what they
 * are and look harmless: low rounded lumps of glassy obsidian, and rusty iron junk lying flat and half buried (Hugging Face img2img,
 * tools/art/hazard/cleancut.py). The sheet starts loading with the game, like the painted flora, so it is in before a stage bakes its
 * scenery; until then the slot keeps the shared decoration.
 */
import { trackAtlas } from './atlasLoader.ts';
import { IRON_JUNK, OBSIDIAN, type RubbleFrame } from './rubbleData.ts';

export const RUBBLE_URL = new URL('../assets/props/rubble.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, RUBBLE_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
export function rubbleReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece of clutter `kind` (picked by `r`, 0..1), `size` across, its foot on the ground at (x, y); false until the sheet has loaded */
export function drawRubble(ctx: CanvasRenderingContext2D, kind: 'obsidian' | 'ironthorn', x: number, y: number, size: number, r: number, flip: boolean): boolean {
  if (!rubbleReady()) return false;
  const list: RubbleFrame[] = kind === 'obsidian' ? OBSIDIAN : IRON_JUNK;
  const f = list[Math.floor(r * list.length) % list.length];
  const k = size / Math.max(f.w, f.h);
  const w = f.w * k, h = f.h * k;
  ctx.save();
  ctx.translate(x, y + 3);
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, -h, w, h);
  ctx.restore();
  return true;
}

if (typeof window !== 'undefined') load();
