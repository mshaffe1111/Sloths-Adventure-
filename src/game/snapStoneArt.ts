/**
 * snapStoneArt — the SNAP STONE's look (ENG-25; 2-5.md "Art"): World 2's painted river stone with a seam across its front, four frames on
 * one sheet (src/assets/w2-1118/w2-snapstone.webp, ENG-25's Hugging Face job, tools/art/hf25/ship.py): SHUT, OPEN-1, OPEN-2, OPEN-3. The
 * lid, the flat mossy top he stands on, is the same pixels in every frame, so the floor never jumps; the jaw opens a notch a count
 * (counts 1-3, the third ending in the warning's creak) and claps shut on four, the bite. Drawn by pieces/padPiece.ts from its clock.
 */
import { trackAtlas } from './atlasLoader.ts';

/** the sheet: four frames FW x FH, left to right SHUT, OPEN-1, OPEN-2, OPEN-3; the walk line (the flat top under the moss) WALK px down */
export const SNAP_ART = { url: new URL('../assets/w2-1118/w2-snapstone.webp', import.meta.url).href, fw: 240, fh: 138, walk: 6, frames: 4 } as const;
/** drawn this much wider than its floor: the lid's rounded ends hang past the collider, so the flat top he lands on reads as the floor */
export const SNAP_DRAW_W = 1.08;

let img: HTMLImageElement | null | undefined;
let ready = false;
/** start the sheet loading (the pad piece asks at the stage's start, so the first count is painted) */
export function warmSnapStone(): void {
  if (img !== undefined || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, SNAP_ART.url, () => { ready = true; }, () => { img = null; }, () => { img = undefined; ready = false; });
}

/** the frame for a count of the bar: 1-3 open a notch each, 4 (the bite) shut */
export const snapFrame = (count: number, biting: boolean): number => (biting ? 0 : Math.max(1, Math.min(SNAP_ART.frames - 1, count)));

/**
 * One snap stone over the floor (x, y, w: the platform). `count` 1..4 of its bar, `biting` while its clock is 'on', `tell` 0..1 through
 * the warning (a creak: the stone trembles), `into` seconds into the bite (the clap: a short shudder). Returns false until loaded.
 */
export function drawSnapStone(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, count: number, biting: boolean, tell: number, into: number, t: number): boolean {
  warmSnapStone();
  if (!ready || !img) return false;
  const dw = w * SNAP_DRAW_W, k = dw / SNAP_ART.fw, dh = SNAP_ART.fh * k;
  const f = snapFrame(count, biting);
  const shake = biting ? (into < 0.15 ? Math.sin(into * 90) * 2 * (1 - into / 0.15) : 0) : Math.sin(t * 40 + x) * 1.2 * tell;
  ctx.drawImage(img, f * SNAP_ART.fw, 0, SNAP_ART.fw, SNAP_ART.fh, x + w / 2 - dw / 2 + shake, y - SNAP_ART.walk * k, dw, dh);
  return true;
}
