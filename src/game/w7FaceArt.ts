/**
 * w7FaceArt — World 7's bank faces dressed with Matt's painted World 7 set dressing (src/assets/w6to10/props-made w7c and its second look
 * w7c-b), so the deep stone under the floor is not one block repeated down half an upright screen (STAGE-RULES §5b items 2 and 6, QA
 * 2026-10-29): fig roots breaking through under the floor's lip, a fallen column sunk in the stone, a sloth statue buried to its chest.
 * One piece every FACE_EVERY px or so along a bank, chosen and placed by its spot (the same bank always looks the same), clipped to the
 * bank's face, never over the floor's top band. Pictures only: nothing here is solid.
 *
 * drawW7Face does nothing until the sheets have loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';

export const W7_FACE_URLS = [new URL('../assets/w6to10/props-made/w7c.webp', import.meta.url).href, new URL('../assets/w6to10/props-made/w7c-b.webp', import.meta.url).href] as const;
type F = { x: number; y: number; w: number; h: number };
/** the frames of each look (w7c.json, w7c-b.json) */
const FRAMES: ReadonlyArray<Record<'figs' | 'column' | 'statue', F>> = [
  { figs: { x: 0, y: 472, w: 463, h: 403 }, column: { x: 487, y: 0, w: 457, h: 237 }, statue: { x: 0, y: 0, w: 253, h: 468 } },
  { figs: { x: 0, y: 456, w: 467, h: 374 }, column: { x: 491, y: 0, w: 468, h: 177 }, statue: { x: 0, y: 0, w: 244, h: 452 } },
];
/** about how far apart the pieces stand along a bank (px), and how far under the floor's top the face starts */
const FACE_EVERY = 520;
const FACE_TOP = 64;

const imgs: Array<HTMLImageElement | null> = [null, null];
const ready = [false, false];
function load(i: number) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(
    im,
    W7_FACE_URLS[i],
    () => {
      ready[i] = true;
    },
    () => {
      imgs[i] = null;
    },
    () => {
      imgs[i] = null;
      ready[i] = false;
    },
  );
}
/** whether both sheets have loaded (starts the loads) */
export function w7FaceReady(): boolean {
  load(0);
  load(1);
  return ready[0] && ready[1];
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** the pieces set into one bank's face between view.x0 and view.x1, down to `bottom` */
export function drawW7Face(ctx: CanvasRenderingContext2D, p: Platform, bottom: number, view?: { x0: number; x1: number }) {
  if (!w7FaceReady() || p.width < 260) return;
  const top = p.y + FACE_TOP;
  if (bottom - top < 120) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x + 8, top, p.width - 16, bottom - top);
  ctx.clip();
  // (slots along the bank, from its own left end, so a bank always carries the same pieces)
  for (let sx = p.x + 60; sx < p.x + p.width - 120; sx += FACE_EVERY) {
    const at = Math.round(sx);
    const r = hash01(at, 3);
    if (r < 0.2) continue;
    const x = sx + hash01(at, 5) * (FACE_EVERY - 260);
    if (view && (x > view.x1 + 260 || x < view.x0 - 260)) continue;
    const look = hash01(at, 7) < 0.5 ? 0 : 1;
    const img = imgs[look]!;
    const flip = hash01(at, 9) < 0.5;
    const kind = r < 0.55 ? 'figs' : r < 0.85 ? 'column' : 'statue';
    const f = FRAMES[look][kind];
    // fig roots hang from just under the floor's lip; a column lies sunk a little lower; a statue is buried to its chest
    const w = kind === 'figs' ? 230 : kind === 'column' ? 210 : 110;
    const h = (w * f.h) / f.w;
    const y = kind === 'figs' ? top - 30 : kind === 'column' ? top + 40 + hash01(at, 11) * 50 : top + 30;
    ctx.save();
    ctx.globalAlpha = kind === 'figs' ? 0.95 : 0.85;
    ctx.translate(x + w / 2, y);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
    ctx.restore();
  }
  ctx.restore();
}
