/**
 * w810FaceArt — Worlds 8-10's bank faces set with pieces painted into each world's own soil (hf-art-ground 2026-10-30, the W8-10
 * inventory: their tall faces were one plain texture, where World 6 has roots in its soil and World 7 statues): World 8's hollows,
 * glowing fungus and roots, World 9's ember veins, obsidian and fossils, World 10's buried girders, chains and old masonry. Each was
 * painted on Hugging Face into a square of the world's own soil and feathered out to nothing at its edges (tools/art/hfground/
 * packface810b.py), so it sinks into the face with no pasted edge. One piece every FACE_EVERY units or so along a bank, chosen by its
 * spot (the same bank always looks the same), whole inside the bank, under the floor's top band.
 *
 * Drawn inside the ground's own pass (protoArt.ts, beside World 7's drawW7Face), which the ground's squares bake: nothing here is drawn
 * live per frame. drawW810Face does nothing until the sheet has loaded (its arrival re-bakes the squares, atlasLoader's sheet epoch).
 */
import { trackAtlas } from './atlasLoader.ts';
import { FACE810_FRAMES, FACE810_URL } from './w810FaceData.ts';
import type { Platform } from './types.ts';

/** about how far apart the pieces stand along a bank, how far under the floor's top the face starts, and how wide a piece is drawn */
const FACE_EVERY = 640;
const FACE_TOP = 70;
const FACE_W = 190;
/** how far in from a bank's ends a piece keeps */
const EDGE = 40;

let img: HTMLImageElement | null = null;
let ready = false;
/** start the sheet loading; true once it is in */
export function w810FaceReady(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, FACE810_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
  }
  return ready && !!img;
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** the pieces set into one bank's face (world `w`, 8-10) between view.x0 and view.x1, down to `bottom` */
export function drawW810Face(ctx: CanvasRenderingContext2D, w: number, p: Platform, bottom: number, view?: { x0: number; x1: number }) {
  const frames = FACE810_FRAMES[w];
  if (!frames?.length || p.width < FACE_W + 2 * EDGE || !w810FaceReady()) return;
  const top = p.y + FACE_TOP;
  if (bottom - top < FACE_W * 0.8) return;
  for (let sx = p.x + EDGE; sx + FACE_W <= p.x + p.width - EDGE; sx += FACE_EVERY) {
    const at = Math.round(sx);
    // (one slot in three left bare, so the pieces never run like a pattern along a long bank)
    if (hash01(at, 3) < 0.33) continue;
    const x = Math.min(p.x + p.width - EDGE - FACE_W, sx + hash01(at, 5) * Math.max(0, FACE_EVERY - FACE_W - 2 * EDGE));
    if (view && (x > view.x1 + 40 || x + FACE_W < view.x0 - 40)) continue;
    const f = frames[Math.floor(hash01(at, 7) * frames.length) % frames.length];
    const y = top + hash01(at, 11) * Math.min(60, Math.max(0, bottom - top - FACE_W));
    ctx.save();
    ctx.translate(x + FACE_W / 2, y);
    if (hash01(at, 9) < 0.5) ctx.scale(-1, 1);
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, -FACE_W / 2, 0, FACE_W, (FACE_W * f.h) / f.w);
    ctx.restore();
  }
}
