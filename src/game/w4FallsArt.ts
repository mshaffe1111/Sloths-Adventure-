/**
 * w4FallsArt — World 4's painted waterfalls (the Hugging Face waterfall set, w4FallsData.ts), matched to the soft white falls in the
 * World 4 backdrops. A fall is built from the set on its own box (waterfalls.ts: the box is the push, unchanged): a rock lip along its
 * top edge, falling-water bodies of mixed widths across it scrolling down, white water where it lands, and mist drifting over its
 * foot. Also the wet stone pillar, for 4-3's climb trunks beside the falls (protoArt.ts).
 *
 * Every draw returns false until the sheet has loaded, and its caller then draws the old stand-in.
 */
import { trackAtlas } from './atlasLoader.ts';
import { FALL_FRAMES } from './w4FallsData.ts';

type Piece = keyof typeof FALL_FRAMES;

export const W4_FALLS_URL = new URL('../assets/w4/falls.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
/** the lips with their pour keyed out (bare rock, for a fall that has stopped), cut once the sheet has loaded */
let rocks: Map<Piece, HTMLCanvasElement> | null = null;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W4_FALLS_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; rocks = null; });
}

/** whether the waterfall set has loaded (starts the load) */
export function fallsArtReady(): boolean {
  load();
  return ready && !!img;
}

const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

function blit(ctx: CanvasRenderingContext2D, n: Piece, x: number, y: number, w: number, h: number, flip = false) {
  const f = FALL_FRAMES[n];
  if (!flip) {
    ctx.drawImage(img!, f.x, f.y, f.w, f.h, x, y, w, h);
    return;
  }
  ctx.save();
  ctx.translate(x + w, y);
  ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, w, h);
  ctx.restore();
}

/** the top of every lip, above where its pour starts: kept whole when the pour is taken out */
const ROCK_TOP = 0.28;

/** a lip with its pour taken out: only the blue-grey rock and its dark outline are kept (null where the canvas can't be read) */
function rockOf(n: Piece): HTMLCanvasElement | null {
  if (!rocks) rocks = new Map();
  const had = rocks.get(n);
  if (had) return had;
  if (typeof document === 'undefined') return null;
  const f = FALL_FRAMES[n];
  const cv = document.createElement('canvas');
  cv.width = f.w;
  cv.height = f.h;
  const g = cv.getContext('2d', { willReadFrequently: true });
  if (!g) return null;
  g.drawImage(img!, f.x, f.y, f.w, f.h, 0, 0, f.w, f.h);
  try {
    const d = g.getImageData(0, 0, f.w, f.h);
    const px = d.data;
    for (let i = 0; i < px.length; i += 4) {
      const r = px[i], gg = px[i + 1], b = px[i + 2];
      // (the rock is a darker blue-grey, its outline dark; the pour is pale, white to a light blue, and starts below the rock's pale
      // top, which is kept whole)
      const top = i / 4 / f.w < f.h * ROCK_TOP;
      const rock = top || (b > r + 18 && r < 140 && gg < 165) || r + gg + b < 120;
      if (!rock) px[i + 3] = 0;
    }
    g.putImageData(d, 0, 0);
  } catch {
    return null;
  }
  rocks.set(n, cv);
  return cv;
}

/** the falling water's pieces, drawn at this share of their size in the sheet, and how much each overlaps the next across a fall */
const BODY_SCALE = 0.8;
const BODY_OVERLAP = 0.18;
const BODIES: readonly Piece[] = ['fallNarrow', 'fallMedium', 'fallWide'];
/** px per second the water falls (each body a little faster or slower) */
const FALL_SPEED = 300;
/** the lips: drawn at this share of their size; this share of a lip is above the fall's top edge (its rock), the rest its pour */
const LIP_SCALE = 0.8;
const LIP_ABOVE = 0.45;
const LIPS: readonly Piece[] = ['lip1', 'lip2', 'lip3'];
/** the white water at the foot: this tall, its bottom this far below the fall's foot */
const SPLASH_H = 62;
const SPLASH_DROP = 14;

interface Body { n: Piece; cx: number; w: number; k: number; flip: boolean }
/** the bodies across a fall, the same every frame (from its place): mixed widths, never the same piece twice in a row */
function bodies(x0: number, width: number): Body[] {
  const picks: Array<{ n: Piece; e: number; flip: boolean }> = [];
  let sum = 0;
  let last: Piece | null = null;
  for (let k = 0; sum < width || picks.length === 0; k++) {
    const r = hash(k * 3.1 + x0 * 0.011);
    let n = BODIES[Math.floor(r * BODIES.length)];
    if (n === last) n = BODIES[(BODIES.indexOf(n) + 1) % BODIES.length];
    // (a narrow fall is one narrow body)
    if (k === 0 && width < FALL_FRAMES.fallMedium.w * BODY_SCALE * (1 - BODY_OVERLAP)) n = 'fallNarrow';
    const e = FALL_FRAMES[n].w * BODY_SCALE * (1 - BODY_OVERLAP);
    picks.push({ n, e, flip: hash(k * 5.7 + x0 * 0.003) > 0.5 });
    sum += e;
    last = n;
  }
  // stretched a touch to fill the fall exactly
  const s = width / sum;
  let at = x0;
  return picks.map((p, k) => {
    const cx = at + (p.e * s) / 2;
    at += p.e * s;
    return { n: p.n, cx, w: (p.e * s) / (1 - BODY_OVERLAP), k, flip: p.flip };
  });
}

export interface FallBox { x: number; width: number; top: number; bottom: number }

/**
 * The falling water of a fall: its bodies scrolling down from its top edge to its foot. `flow` 0..1 (a fall easing off thins and fades),
 * `alpha` how solid it is (a curtain he stands behind is see-through). False until the sheet has loaded.
 */
export function drawFallBodies(ctx: CanvasRenderingContext2D, w: FallBox, flow: number, t: number, alpha = 1): boolean {
  if (!fallsArtReady()) return false;
  if (flow <= 0.02) return true;
  ctx.save();
  ctx.beginPath();
  // (clipped top and bottom only: the bodies' ragged spray edges show past the box's sides)
  ctx.rect(w.x - 80, w.top, w.width + 160, w.bottom - w.top);
  ctx.clip();
  ctx.globalAlpha = alpha * Math.min(1, flow * 1.4);
  for (const b of bodies(w.x, w.width)) {
    const f = FALL_FRAMES[b.n];
    const bw = b.w * (0.35 + 0.65 * flow);
    const th = (b.w * f.h) / f.w;
    const speed = FALL_SPEED * (0.85 + 0.3 * hash(b.k * 7.3 + w.x * 0.01));
    const off = (t * speed + hash(b.k * 2.9 + w.x * 0.02) * th) % th;
    // (edge to edge, no overlap: the water is see-through, so an overlap would show as a line across it)
    for (let y = w.top - th + off; y < w.bottom; y += th) blit(ctx, b.n, b.cx - bw / 2, y, bw, th, b.flip);
  }
  ctx.restore();
  return true;
}

/**
 * The rock lips along a fall's top edge, so its water always pours from somewhere: the rock with its pour while it flows, bare rock
 * once it has stopped (the pour fading with `flow`). Drawn over the bodies. False until the sheet has loaded.
 */
export function drawFallLips(ctx: CanvasRenderingContext2D, w: FallBox, flow: number): boolean {
  if (!fallsArtReady()) return false;
  const one = FALL_FRAMES.lip1.w * LIP_SCALE;
  const n = Math.max(1, Math.round(w.width / (one * 0.8)));
  const lw = w.width / n / 0.8;
  for (let k = 0; k < n; k++) {
    const p = LIPS[Math.floor(hash(k * 4.1 + w.x * 0.007) * LIPS.length)];
    const f = FALL_FRAMES[p];
    const lh = (lw * f.h) / f.w;
    const cx = w.x + ((k + 0.5) / n) * w.width;
    const flip = hash(k * 1.3 + w.x * 0.013) > 0.5;
    const x = cx - lw / 2, y = w.top - lh * LIP_ABOVE;
    if (flow < 1) {
      const rock = rockOf(p);
      if (rock) {
        ctx.save();
        if (flip) {
          ctx.translate(x + lw, y);
          ctx.scale(-1, 1);
          ctx.drawImage(rock, 0, 0, lw, lh);
        } else ctx.drawImage(rock, x, y, lw, lh);
        ctx.restore();
      }
    }
    if (flow > 0) {
      ctx.save();
      ctx.globalAlpha *= Math.min(1, flow * 1.5);
      blit(ctx, p, x, y, lw, lh, flip);
      ctx.restore();
    }
  }
  return true;
}

/**
 * Where a fall lands: the white water strips along its foot (their heavy outlines softened by a mist laid over them), mist drifting
 * over it, and on a wide fall a plume of spray rising. False until the sheet has loaded.
 */
export function drawFallFoot(ctx: CanvasRenderingContext2D, w: FallBox, flow: number, t: number): boolean {
  if (!fallsArtReady()) return false;
  if (flow <= 0.02) return true;
  const a = Math.min(1, flow * 1.5);
  ctx.save();
  // the splash strips, side to side, a little wider than the fall
  const sf = FALL_FRAMES.splash1;
  const sw = (SPLASH_H * sf.w) / sf.h;
  const x0 = w.x - 24, x1 = w.x + w.width + 24;
  const n = Math.max(1, Math.round((x1 - x0) / sw));
  const step = (x1 - x0) / n;
  ctx.globalAlpha = a * 0.8;
  for (let k = 0; k < n; k++) {
    const p: Piece = (k + Math.round(w.x / 97)) % 2 ? 'splash2' : 'splash1';
    const h = SPLASH_H * (0.9 + 0.2 * hash(k * 2.2 + w.x * 0.01)) * (0.6 + 0.4 * flow) * (1 + 0.04 * Math.sin(t * 7 + k * 1.9));
    const ww = step * 1.08;
    blit(ctx, p, x0 + k * step - step * 0.04, w.bottom + SPLASH_DROP - h, ww, h, k % 2 === 1);
  }
  // mist over the foot: softens the strips' outlines, and drifts
  const mists: Piece[] = ['mist1', 'mist2'];
  const mw = Math.max(160, Math.min(420, w.width * 0.7));
  const m = Math.max(1, Math.round((x1 - x0) / (mw * 0.6)));
  for (let k = 0; k < m; k++) {
    const p = mists[(k + Math.round(w.x / 131)) % 2];
    const f = FALL_FRAMES[p];
    const mh = (mw * f.h) / f.w;
    const cx = x0 + ((k + 0.5) / m) * (x1 - x0) + Math.sin(t * 0.6 + k * 2.3 + w.x * 0.001) * 18;
    ctx.globalAlpha = a * (0.65 + 0.15 * Math.sin(t * 0.9 + k));
    blit(ctx, p, cx - mw / 2, w.bottom + 24 - mh, mw, mh, k % 2 === 1);
  }
  // a plume of spray rising off a wide fall's foot
  if (w.width > 400) {
    const f = FALL_FRAMES.plume;
    const ph = Math.min(360, (w.bottom - w.top) * 0.45);
    const pw = (ph * f.w) / f.h;
    const cx = w.x + w.width * (0.35 + 0.3 * hash(w.x * 0.01)) + Math.sin(t * 0.5) * 12;
    ctx.globalAlpha = a * 0.35;
    blit(ctx, 'plume', cx - pw / 2, w.bottom + 10 - ph, pw, ph);
  }
  ctx.restore();
  return true;
}

/** the wet stone pillar repeated up a column `w` wide from `bottom` up to `top` (4-3's climb trunks). False until the sheet has loaded. */
export function drawFallsPillar(ctx: CanvasRenderingContext2D, cx: number, w: number, top: number, bottom: number): boolean {
  if (!fallsArtReady()) return false;
  const f = FALL_FRAMES.pillar;
  const th = (w * f.h) / f.w;
  ctx.save();
  ctx.beginPath();
  ctx.rect(cx - w, top, w * 2, bottom - top);
  ctx.clip();
  for (let y = bottom - th; y > top - th; y -= th - 1) blit(ctx, 'pillar', cx - w / 2, y, w, th);
  ctx.restore();
  return true;
}

/**
 * One piece of the waterfall set on its own, `w` wide with its foot's middle at (cx, bottom) (its own shape kept; `h` stretches it), for
 * the small water effects: 4-8's run-off along the shelf (a splash strip). False until the
 * sheet has loaded.
 */
export function drawFallsBit(ctx: CanvasRenderingContext2D, n: 'plume' | 'mist1' | 'mist2' | 'splash1' | 'splash2', cx: number, bottom: number, w: number, o: { h?: number; alpha?: number; flip?: boolean } = {}): boolean {
  if (!fallsArtReady()) return false;
  const f = FALL_FRAMES[n];
  const h = o.h ?? (w * f.h) / f.w;
  ctx.save();
  if (o.alpha !== undefined) ctx.globalAlpha *= Math.max(0, Math.min(1, o.alpha));
  blit(ctx, n, cx - w / 2, bottom - h, w, h, o.flip);
  ctx.restore();
  return true;
}
