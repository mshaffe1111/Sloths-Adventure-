/**
 * petalSprites — painted drifting petals (2026-10-29, Hugging Face img2img of crops of the game's own painted flowers,
 * tools/art/hazard/petalcut.py): loose petals and small blossoms for the weather of Worlds 2 and 5, World 5's petals drifting through
 * the light, and the petals blown about in Dot's flight. They replace flat code ellipses (Matt 2026-10-29: repeating effects are
 * painted). Nothing is drawn until the sheet has loaded; stagePreload asks for every set before every stage.
 *
 * Sets (ART-22P, 11-18): 'mixed' is the first sheet (every colour), the one drawn where nothing names a set; a world's look names its
 * own (scenery.ts Look.petals: World 2's 'river', lavender water hyacinth and white lily, what 2-2 gathers for the river king's crown).
 * Data only: no line here names a world.
 */
import { trackAtlas } from './atlasLoader.ts';
import { PETALS, RIVER_PETALS, type PetalFrame } from './petalData.ts';
import { drawSheet } from './sheetBake.ts';

export const PETAL_SETS = {
  mixed: { url: new URL('../assets/flora/petals.webp', import.meta.url).href, frames: PETALS },
  river: { url: new URL('../assets/flora/petals-river.webp', import.meta.url).href, frames: RIVER_PETALS },
} satisfies Record<string, { url: string; frames: PetalFrame[] }>;
export type PetalSet = keyof typeof PETAL_SETS;
export const PETAL_SET_IDS = Object.keys(PETAL_SETS) as PetalSet[];

const img: Partial<Record<PetalSet, HTMLImageElement | null>> = {};
const ready: Partial<Record<PetalSet, boolean>> = {};
function load(set: PetalSet) {
  if (img[set] || typeof Image === 'undefined') return;
  const im = new Image();
  img[set] = im;
  trackAtlas(im, PETAL_SETS[set].url, () => { ready[set] = true; }, () => { img[set] = null; }, () => { img[set] = null; ready[set] = false; });
}
/** whether a set's petals have loaded (starts the load); an unknown set is the mixed one */
export function petalsReady(set: string = 'mixed'): boolean {
  const s = petalSet(set);
  load(s);
  return !!ready[s] && !!img[s];
}
/** a set's id, or 'mixed' for an unset or unknown one */
export const petalSet = (set?: string): PetalSet => (set && Object.hasOwn(PETAL_SETS, set) ? (set as PetalSet) : 'mixed');

/**
 * One petal (`c` picks which: any number, the same one for the same c), `size` px across, turned `rot`, tumbling over by `flip` (1 face
 * on, 0 edge on), from `set` (unset: the mixed sheet). False until the sheet has loaded.
 */
export function drawPetal(ctx: CanvasRenderingContext2D, c: number, x: number, y: number, size: number, rot: number, flip: number, alpha: number, set?: string): boolean {
  const s = petalSet(set);
  if (!petalsReady(s) || alpha <= 0.01) return !!img[s] && !!ready[s];
  const frames = PETAL_SETS[s].frames;
  const f = frames[Math.floor(Math.abs(c) * 7919) % frames.length];
  const k = size / Math.max(f.w, f.h);
  ctx.save();
  ctx.globalAlpha *= Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(Math.max(0.2, Math.abs(flip)), 1);
  drawSheet(ctx, img[s]!, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
