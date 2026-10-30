/**
 * w7FaceArt — World 7's bank faces dressed with Matt's painted World 7 set dressing (src/assets/w6to10/props-made w7c and its second look
 * w7c-b), so the deep stone under the floor is not one block repeated down half an upright screen (STAGE-RULES §5b items 2 and 6, QA
 * 2026-10-29): fig roots breaking through under the floor's lip, a sloth statue buried to its chest in the soil.
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
const FRAMES: ReadonlyArray<Record<'figs' | 'statue', F>> = [
  { figs: { x: 0, y: 472, w: 463, h: 403 }, statue: { x: 0, y: 0, w: 253, h: 468 } },
  { figs: { x: 0, y: 456, w: 467, h: 374 }, statue: { x: 0, y: 0, w: 244, h: 452 } },
];
/** about how far apart the pieces stand along a bank (px), and how far under the floor's top the face starts */
const FACE_EVERY = 520;
const FACE_TOP = 64;
/** a tall bank's next row of pieces this far under the one above */
const ROW_EVERY = 300;
/** how much soil an upright view shows under the floor he stands on (DEPTH_BELOW 0.45 of a 900 view), for laying out a bank's rows */
const SOIL_SHOWN = 405;
/** how far in from a bank's ends a piece keeps */
const EDGE = 14;

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
  if (!w7FaceReady() || p.width < 150) return;
  const top = p.y + FACE_TOP;
  // (laid out from the bank alone: its own height, or the soil an upright view shows under a floor, whichever is more. `bottom` is only
  // where the square being painted ends (the ground is painted once into squares), so rows and pieces laid out from it changed from one
  // square to the next and showed cut off at a square's edge, the lead's 2026-10-30 report; it still clips, which only trims what the
  // square doesn't cover)
  const depth = Math.max(p.height, SOIL_SHOWN);
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x + 8, top, p.width - 16, bottom - top);
  ctx.clip();
  // (slots along the bank, from its own left end, so a bank always carries the same pieces; a tall bank, a wall under a high ledge,
  // carries a row more every ROW_EVERY px down it, never the same piece above itself)
  const rows = Math.max(1, Math.min(3, Math.floor((p.y + depth - top) / ROW_EVERY)));
  const narrow = p.width < FACE_EVERY;
  for (let sx = p.x + (narrow ? p.width / 2 - 60 : 60); sx < p.x + p.width - (narrow ? 0 : 120); sx += FACE_EVERY) {
    for (let row = 0; row < rows; row++) {
      const at = Math.round(sx) + row * 7919;
      const r = hash01(at, 3);
      // (a narrow bank, a wall under a ledge, carries a piece only one time in two: never one on every bank in view)
      if (r < (row ? 0.35 : 0.2) || (narrow && hash01(at, 13) < 0.5)) continue;
      const x0 = narrow ? sx - 40 + hash01(at, 5) * 40 : sx + hash01(at, 5) * (FACE_EVERY - 260);
      if (view && (x0 > view.x1 + 260 || x0 < view.x0 - 260)) continue;
      const look = hash01(at, 7) < 0.5 ? 0 : 1;
      const img = imgs[look]!;
      const flip = hash01(at, 9) < 0.5;
      // (fig roots only under the floor's lip; lower down a statue now and then. No fallen column: lying in the soil face with nothing
      // under it, it read as a slab hanging in the air, the lead's QA 2026-10-29)
      if (row > 0 && r < 0.6) continue;
      const kind = row === 0 && r < 0.6 ? 'figs' : 'statue';
      const f = FRAMES[look][kind];
      // fig roots hang from just under the floor's lip; a statue is buried to its chest
      const w = Math.min(kind === 'figs' ? 230 : 110, p.width - 30);
      // (the whole piece inside its bank, EDGE px in from both ends: a piece cut off at the bank's edge left a ruler-straight seam)
      if (p.width < w + 2 * EDGE) continue;
      const x = Math.max(p.x + EDGE, Math.min(p.x + p.width - EDGE - w, x0));
      const h = (w * f.h) / f.w;
      const base = top + row * ROW_EVERY;
      const y = kind === 'figs' ? base - 30 : base + 30;
      ctx.save();
      ctx.translate(x + w / 2, y);
      // (a statue sits IN the soil: a soft dark hollow round it, so it is set into the bank, not pasted on)
      if (kind === 'statue') {
        const g = ctx.createRadialGradient(0, h * 0.55, w * 0.2, 0, h * 0.55, w * 0.95);
        g.addColorStop(0, 'rgba(14, 12, 9, 0.5)');
        g.addColorStop(1, 'rgba(14, 12, 9, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(-w, h * 0.55 - w, w * 2, w * 2);
      }
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(img, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
      ctx.restore();
    }
  }
  ctx.restore();
}
