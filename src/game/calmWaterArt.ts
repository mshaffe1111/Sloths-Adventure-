/**
 * calmWaterArt — the calm, clean water Pokey can swim in (swim.ts), painted from Matt's World 6 water sheet
 * (reference/prop-sheets/w6/water.jpg, row 1: the still strip and the gently rippled strip; row 2: the ripple ring and the bubbles), cut
 * by tools/art/w6/calmwater/cut.py into src/assets/props/w6-calm-water.webp. The strips' ends are cross-faded, so copies meet with no
 * seam.
 *
 * It is the opposite of the deadly water (badWaterArt.ts: murky, choppy, rushing one way with dead leaves riding it): clear grey-teal,
 * still, the light lying on it, the two strips breathing slowly into each other, a few glints. Drawn in two layers: the water behind
 * Pokey (drawCalmWaterBack), and a clear veil in front of him from the waterline down (drawCalmWaterFront), so what is under the water
 * reads as under it, with the ripple ring round him at the top and bubbles when he dives.
 *
 * Both return false until the sheet has loaded; the caller then draws a plain stand-in.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { CalmPool } from './swim.ts';

export const CALM_WATER_URL = new URL('../assets/props/w6-calm-water.webp', import.meta.url).href;
const FRAMES = {
  calm: { x: 0, y: 0, w: 180, h: 43 },
  ripple: { x: 0, y: 45, w: 181, h: 51 },
  ring: { x: 0, y: 98, w: 228, h: 44 },
  bubbles: { x: 0, y: 144, w: 56, h: 150 },
};
/** one repeat of a strip, in world units */
const TILE = 200;
/** the strip's top this far over the water's top (its bright band is the top, seen from the side) */
const OVER = 7;
/** the water under the strips (their bottom row's colour) */
const DEEP = '#3d5656';

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    CALM_WATER_URL,
    () => {
      ready = true;
    },
    () => {
      img = null;
    },
    () => {
      img = null;
      ready = false;
    },
  );
}
/** whether the sheet has loaded (starts the load) */
export function calmWaterReady(): boolean {
  load();
  return ready && !!img;
}

function blit(ctx: CanvasRenderingContext2D, n: keyof typeof FRAMES, x: number, y: number, w: number, h: number) {
  const f = FRAMES[n];
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
}

/** a strip repeated from x0 to x1, its top at `top`, slid `shift` */
function tiled(ctx: CanvasRenderingContext2D, n: 'calm' | 'ripple', x0: number, x1: number, top: number, shift: number) {
  const h = (TILE * FRAMES[n].h) / FRAMES[n].w;
  const s = ((shift % TILE) + TILE) % TILE;
  for (let x = Math.floor((x0 - s) / TILE) * TILE + s - TILE; x < x1; x += TILE - 1) blit(ctx, n, x, top, TILE, h);
  return h;
}

/** the strips, breathing slowly from still to rippled and back, drifting a little to and fro (no current: this water goes nowhere) */
function surface(ctx: CanvasRenderingContext2D, w: CalmPool, time: number) {
  const top = w.surfaceY - OVER;
  const drift = Math.sin(time * 0.35) * 14;
  const mix = 0.5 + 0.5 * Math.sin(time * 0.8);
  const a = ctx.globalAlpha;
  const h = tiled(ctx, 'calm', w.x0, w.x1, top, drift);
  ctx.globalAlpha = a * mix * 0.85;
  tiled(ctx, 'ripple', w.x0, w.x1, top - 2, -drift * 0.7 + 40);
  ctx.globalAlpha = a;
  return h;
}

/** the water behind Pokey: the deep, then the painted top */
export function drawCalmWaterBack(ctx: CanvasRenderingContext2D, w: CalmPool, time: number): boolean {
  if (!calmWaterReady()) return false;
  ctx.save();
  ctx.beginPath();
  ctx.rect(w.x0, w.surfaceY - OVER - 6, w.x1 - w.x0, w.bottomY - w.surfaceY + OVER + 6);
  ctx.clip();
  ctx.fillStyle = DEEP;
  ctx.fillRect(w.x0, w.surfaceY + 20, w.x1 - w.x0, Math.max(0, w.bottomY - w.surfaceY - 20));
  surface(ctx, w, time);
  // a few glints of light on the still top (code-drawn sparkles: STAGE-RULES §4's small touches)
  for (let i = 0; i < 3; i++) {
    const u = (time * 0.11 + i * 0.37) % 1;
    const gx = w.x0 + (w.x1 - w.x0) * ((i * 0.31 + 0.17 + Math.sin(time * 0.2 + i) * 0.05) % 1);
    const k = Math.sin(u * Math.PI);
    ctx.fillStyle = `rgba(240, 252, 255, ${0.75 * k})`;
    ctx.beginPath();
    ctx.ellipse(gx, w.surfaceY - 2, 1.6 + 5 * k, 1.1, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  return true;
}

/** who is in the water, for the ring round him and his bubbles */
export interface Swimmer {
  x: number;
  /** his head's height, for the bubbles */
  headY: number;
  /** 0 floating .. 1 dived */
  under: number;
  /** how hard he is swimming (0..1): the ring spreads wider */
  stroke: number;
}

/**
 * The veil in front of Pokey, from the waterline down: what is under the water (his body, the raft's lower half, a stone on the plate)
 * reads as under it. Then the ripple ring round him and, under, his bubbles rising.
 */
export function drawCalmWaterFront(ctx: CanvasRenderingContext2D, w: CalmPool, time: number, who?: Swimmer): boolean {
  if (!calmWaterReady()) return false;
  ctx.save();
  ctx.beginPath();
  ctx.rect(w.x0, w.surfaceY - OVER - 30, w.x1 - w.x0, w.bottomY - w.surfaceY + OVER + 30);
  ctx.clip();
  ctx.globalAlpha = 0.42;
  ctx.fillStyle = DEEP;
  ctx.fillRect(w.x0, w.surfaceY + 3, w.x1 - w.x0, Math.max(0, w.bottomY - w.surfaceY - 3));
  // the top again, lightly: the waterline crosses him
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.rect(w.x0, w.surfaceY - 1, w.x1 - w.x0, w.bottomY - w.surfaceY + 1);
  ctx.clip();
  surface(ctx, w, time);
  ctx.restore();
  if (who) {
    ctx.save();
    // the ring, spreading and fading round him, once a second (wider when he swims)
    for (let i = 0; i < 2; i++) {
      const u = (time * 0.9 + i * 0.5) % 1;
      const rw = (60 + 60 * who.stroke) * (0.55 + 0.6 * u);
      ctx.globalAlpha = (1 - u) * (0.75 - 0.35 * who.under);
      blit(ctx, 'ring', who.x - rw / 2, w.surfaceY - rw * 0.1, rw, (rw * FRAMES.ring.h) / FRAMES.ring.w);
    }
    if (who.under > 0.3) {
      // bubbles from his nose, rising to the top
      // (the column from his head up to the top, sliding up and fading as it goes, under the top only)
      const bh = Math.max(24, who.headY - w.surfaceY + 12);
      const bw = (bh * FRAMES.bubbles.w) / FRAMES.bubbles.h;
      const u = (time * 1.2) % 1;
      ctx.globalAlpha = Math.min(1, who.under * 1.4) * (1 - u * 0.6);
      ctx.beginPath();
      ctx.rect(w.x0, w.surfaceY, w.x1 - w.x0, w.bottomY - w.surfaceY);
      ctx.clip();
      blit(ctx, 'bubbles', who.x + 8 - bw / 2, who.headY - bh - u * 14, bw, bh);
    }
    ctx.restore();
  }
  return true;
}

/** the stand-in while the sheet loads: a flat clear teal, its top a lighter line */
export function drawCalmWaterPlain(ctx: CanvasRenderingContext2D, w: CalmPool, front: boolean) {
  ctx.save();
  ctx.globalAlpha = front ? 0.4 : 1;
  ctx.fillStyle = DEEP;
  ctx.fillRect(w.x0, w.surfaceY, w.x1 - w.x0, Math.max(0, w.bottomY - w.surfaceY));
  if (!front) {
    ctx.fillStyle = '#9fc4c4';
    ctx.fillRect(w.x0, w.surfaceY - 2, w.x1 - w.x0, 4);
  }
  ctx.restore();
}
