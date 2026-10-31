/**
 * bounceArt — the bounce plants, painted on Hugging Face in the kit style (hf-art-ground round 3, 2026-10-29), each world its own (Matt,
 * 2026-10-29): a canopy mushroom, a river lily, a glowing grotto cap, a fern bud, a gold orchid, a swamp pitcher, a stone lotus, a moon
 * flower, an ash cap, an iron thistle. They were drawn in code (spanArt.ts drawBounce), and in 10-1 the toadstool's pale code stalk read as a white bar standing
 * in the water. The cap's top row is the collision line; it squashes about its rim as it breathes. The stalk runs down off the bottom of
 * the view, darkening as it goes down (baked once per species), so it sinks into the gloom instead of standing as a pale pole. The cue
 * is unchanged: the up-arrow above them. One small sheet (bounce.webp, bounceAtlasData.ts), warmed on the first draw.
 */
import { trackAtlas } from './atlasLoader.ts';
import { BOUNCE_FRAMES, BOUNCE_URL, type BounceFrame } from './bounceAtlasData.ts';
import type { Platform } from './types.ts';
import { viewRect, type ViewRect } from './artKit.ts';
import { drawW8BounceLeaf } from './w8DecorArt.ts';

/** the view, kept for the stalk's cull */
const stalkView: ViewRect = { x0: 0, y0: 0, x1: 0, y1: 0 };

/** how far down the stalk darkens (world px) and how dark it ends */
const FADE = { len: 260, dark: 0.62 };

let img: HTMLImageElement | null = null;
let ready = false;
const baked = new Map<string, { fade: HTMLCanvasElement; deep: HTMLCanvasElement } | null>();

/** start the sheet loading; true once it is in */
export function warmBounce(): boolean {
  if (!img && typeof Image !== 'undefined') {
    const im = new Image();
    img = im;
    trackAtlas(im, BOUNCE_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; baked.clear(); });
  }
  return ready && !!img;
}

/** the stalk upright, tiled FADE.len tall and darkening down it (fade), and one repeat at its darkest (deep), at the frame's own scale */
function bake(sp: string, f: BounceFrame, scale: number) {
  if (baked.has(sp)) return baked.get(sp)!;
  if (typeof document === 'undefined') return null;
  const w = f.w, H = Math.ceil(FADE.len / scale);
  const fade = document.createElement('canvas');
  fade.width = w;
  fade.height = H;
  const c = fade.getContext('2d')!;
  for (let y = 0; y < H; y += f.h) c.drawImage(img!, f.x, f.y, f.w, f.h, 0, y, f.w, f.h);
  c.globalCompositeOperation = 'source-atop';
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(8,10,14,0)');
  g.addColorStop(1, `rgba(8,10,14,${FADE.dark})`);
  c.fillStyle = g;
  c.fillRect(0, 0, w, H);
  const deep = document.createElement('canvas');
  deep.width = w;
  deep.height = f.h;
  const d = deep.getContext('2d')!;
  d.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  d.globalCompositeOperation = 'source-atop';
  d.fillStyle = `rgba(8,10,14,${FADE.dark})`;
  d.fillRect(0, 0, w, f.h);
  const out = { fade, deep };
  baked.set(sp, out);
  return out;
}

/**
 * world's bounce plant on platform p, its stalk down to bottomY; variant 1 is drawn mirrored. Only the cue while the sheet loads. `part`:
 * 'plant' the stalk and cap with the ground (it stands behind the painted banks), 'cap' the cap and its cue again over the painted
 * ground (a plant at a bank's end was hidden under the bank's lip: terrain.ts drawBounceCaps)
 */
export function drawBounce(ctx: CanvasRenderingContext2D, p: Platform, world: number, variant: number, time: number, bottomY: number, part: 'plant' | 'cap' = 'plant') {
  const cxp = Math.round(p.x + p.width / 2);
  const topY = Math.round(p.y);
  const sp = BOUNCE_FRAMES[`cap-w${world}`] ? `w${world}` : 'w1';
  const cf = BOUNCE_FRAMES[`cap-${sp}`];
  const sf = BOUNCE_FRAMES[`stalk-${sp}`];
  // (World 8: every other moon flower is the bouncy leaf of Matt's w8b sheet, w8DecorArt.ts)
  const leaf = world === 8 && p.id % 2 === 1 && drawW8BounceLeaf(ctx, p, time, part, bottomY);
  if (!leaf && cf && sf && warmBounce()) {
    const k = (p.width * (cf.span ?? 1.1)) / (cf.w * (cf.cw ?? 1));
    const cw = cf.w * k, ch = cf.h * k;
    const x0 = cxp - (cf.cx ?? 0.5) * cw;
    const rimY = topY + (cf.rim ?? 0.8) * ch;
    // the stalk: under the cap's own short stalk top, as wide as it, down off the view
    const sw = Math.max(6, (cf.sw ?? 0.15) * cw * 1.05);
    const sx = x0 + (cf.sx ?? 0.5) * cw - sw / 2;
    const top = topY + ch - 6;
    const ks = sw / sf.w;
    const b = bake(sp, sf, ks);
    if (part === 'plant' && b && bottomY > top) {
      // only the stretch of the stalk the view shows (a plant high above it still runs its stalk down through it)
      const v = viewRect(ctx, stalkView, 4);
      const fh = Math.min(FADE.len, bottomY - top);
      if (top + fh >= v.y0 && top <= v.y1) ctx.drawImage(b.fade, 0, 0, sf.w, fh / ks, sx, top, sw, fh);
      const step = sf.h * ks - 1;
      let y = top + FADE.len;
      if (v.y0 - sf.h * ks > y) y += Math.floor((v.y0 - sf.h * ks - y) / step) * step;
      const end = Math.min(bottomY, v.y1);
      for (; y < end; y += step) ctx.drawImage(b.deep, sx, y, sw, sf.h * ks);
    }
    // the cap, squashing about its rim
    const squash = 1 + Math.sin(time * 3 + p.id) * 0.05;
    ctx.save();
    ctx.translate(cxp, rimY);
    ctx.scale(variant === 1 ? -1 : 1, squash);
    ctx.translate(-cxp, -rimY);
    ctx.drawImage(img!, cf.x, cf.y, cf.w, cf.h, x0, topY, cw, ch);
    ctx.restore();
  }
  if (part !== 'cap') return;
  // up-arrow hint
  ctx.fillStyle = `rgba(255,255,255,${0.55 + 0.35 * Math.sin(time * 4)})`;
  ctx.beginPath();
  ctx.moveTo(cxp, topY - 24);
  ctx.lineTo(cxp - 7, topY - 14);
  ctx.lineTo(cxp + 7, topY - 14);
  ctx.closePath();
  ctx.fill();
}
