/**
 * stageArt — the painted pieces every stage shows (hf-art-stage, 2026-10-29; polish report VI-9, VI-10, VI-12, VI-16), made on Hugging
 * Face by img2img from the game's own painted art (tools/art/hfbatch/stagestarts.py, make_stage_spec.py, stagecut.py):
 *   assets/props/stage-art.webp   the checkpoint post (unlit, lit), the heart, the crowned heart, the three power-ups, the Thorn Gate
 *                                 (shut, open), the Hush Fern and the Keeper's Bell (plain, lit) and 4-8's netting (whole, torn)
 *   assets/props/gates/w<N>.webp  each world's exit gate, shut and open
 *   assets/props/pitwater/w<N>.webp  pit water for Worlds 1, 3, 4 and 5: the surface strip and its shine (World 2 has its painted
 *                                 rivers, Worlds 6-10 the dirty, fast water: badWaterArt.ts)
 * The shared sheet is small and kept; a world's gate and water are let go with its world (atlasLoader.ts). All are preloaded with the
 * stage (stageSheets.ts 'stage-art', 'gate:<w>', 'pit-water:<w>'). Every draw returns false until its sheet is in.
 * Code adds only small touches: a soft glow behind what is lit, a pulse, the pennant's flutter and a short bounce when it is reached.
 */
import { trackAtlas } from './atlasLoader.ts';
import { bakeStep, viewRect, type ViewRect } from './artKit.ts';
import { GATE_FRAMES, PIT_WATER, STAGE_ART_FRAMES, type ArtFrame, type StageArtName } from './stageArtData.ts';

export const STAGE_ART_URL = new URL('../assets/props/stage-art.webp', import.meta.url).href;
const GATE_URLS: Record<number, string> = {
  1: new URL('../assets/props/gates/w1.webp', import.meta.url).href,
  2: new URL('../assets/props/gates/w2.webp', import.meta.url).href,
  3: new URL('../assets/props/gates/w3.webp', import.meta.url).href,
  4: new URL('../assets/props/gates/w4.webp', import.meta.url).href,
  5: new URL('../assets/props/gates/w5.webp', import.meta.url).href,
  6: new URL('../assets/props/gates/w6.webp', import.meta.url).href,
  7: new URL('../assets/props/gates/w7.webp', import.meta.url).href,
  8: new URL('../assets/props/gates/w8.webp', import.meta.url).href,
  9: new URL('../assets/props/gates/w9.webp', import.meta.url).href,
  10: new URL('../assets/props/gates/w10.webp', import.meta.url).href,
};
const WATER_URLS: Record<number, string> = {
  1: new URL('../assets/props/pitwater/w1.webp', import.meta.url).href,
  3: new URL('../assets/props/pitwater/w3.webp', import.meta.url).href,
  4: new URL('../assets/props/pitwater/w4.webp', import.meta.url).href,
  5: new URL('../assets/props/pitwater/w5.webp', import.meta.url).href,
};
/** the world whose gate is drawn (the secret Hollow and anything past World 10 use World 10's) */
export const gateWorld = (world: number): number => Math.max(1, Math.min(10, world));
export const gateUrl = (world: number): string => GATE_URLS[gateWorld(world)];
/** the painted pit water's sheet for a world, if it has one (Worlds 1, 3, 4, 5) */
export const pitWaterUrl = (world: number): string | undefined => WATER_URLS[world];

interface Sheet {
  url: string;
  img: HTMLImageElement | null;
  ready: boolean;
}
const sheets = new Map<string, Sheet>();
function sheetFor(url: string, perWorld: boolean): HTMLImageElement | null {
  let s = sheets.get(url);
  if (!s) {
    s = { url, img: null, ready: false };
    sheets.set(url, s);
  }
  if (!s.img && typeof Image !== 'undefined') {
    const im = new Image();
    const sh = s;
    sh.img = im;
    trackAtlas(
      im,
      url,
      () => {
        sh.ready = true;
      },
      () => {
        sh.img = null;
      },
      perWorld
        ? () => {
            sh.img = null;
            sh.ready = false;
          }
        : undefined,
    );
  }
  return s.ready ? s.img : null;
}
/** start each sheet loading; true once it is in */
export const stageArtReady = (): boolean => !!sheetFor(STAGE_ART_URL, false);
export const gateArtReady = (world: number): boolean => !!sheetFor(gateUrl(world), true);
export const pitWaterReady = (world: number): boolean => {
  const u = pitWaterUrl(world);
  return !!u && !!sheetFor(u, true);
};

/** draw frame `f` of `img` with its anchor at (x, y), `h` world px tall (width follows); `flip` mirrors it */
function blitAt(ctx: CanvasRenderingContext2D, img: HTMLImageElement, f: ArtFrame, x: number, y: number, h: number, flip = false) {
  const k = h / f.h;
  if (flip) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img, f.x, f.y, f.w, f.h, -f.ax * k, -f.ay * k, f.w * k, f.h * k);
    ctx.restore();
    return;
  }
  ctx.drawImage(img, f.x, f.y, f.w, f.h, x - f.ax * k, y - f.ay * k, f.w * k, f.h * k);
}

// ───────── soft glows (a small code touch: one round light, painted once and kept) ─────────
const glows = new Map<string, HTMLCanvasElement>();
function glow(ctx: CanvasRenderingContext2D, rgb: string, x: number, y: number, r: number, a: number) {
  if (a <= 0.01 || typeof document === 'undefined') return;
  let cv = glows.get(rgb);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = cv.height = 128;
    const g = cv.getContext('2d');
    if (g) {
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, `rgba(${rgb},0.85)`);
      gr.addColorStop(0.45, `rgba(${rgb},0.32)`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    }
    glows.set(rgb, cv);
  }
  ctx.save();
  ctx.globalAlpha *= a;
  ctx.drawImage(cv, x - r, y - r, 2 * r, 2 * r);
  ctx.restore();
}

function piece(n: StageArtName): [HTMLImageElement, ArtFrame] | null {
  const img = sheetFor(STAGE_ART_URL, false);
  return img ? [img, STAGE_ART_FRAMES[n]] : null;
}

// ───────────────────────────── the checkpoint ─────────────────────────────
/** how tall the checkpoint post stands (world px; Pokey is about 86) */
export const FLAG_H = 122;
/** the view, kept for the checkpoint's cull */
const flagView: ViewRect = { x0: 0, y0: 0, x1: 0, y1: 0 };
/** when each checkpoint was first seen reached (by its x), for its bounce */
const reachedAt = new Map<number, number>();

/**
 * A checkpoint, its post's foot at (x, ground): unlit until reached, then lit, with a warm glow, its leaf pennant fluttering (the
 * painted pennant drawn in thin upright slices, each nudged on a wave that grows toward its tip) and a short bounce as it lights.
 */
export function drawCheckpointArt(ctx: CanvasRenderingContext2D, x: number, ground: number, reached: boolean, t: number): boolean {
  const p = piece(reached ? 'flagLit' : 'flagUnlit');
  if (!p) return false;
  // off the view (above or below it: an ascent's checkpoints stand one over another, and each is ~25 slices): nothing to draw
  const v = viewRect(ctx, flagView, 90);
  if (ground < v.y0 || ground - FLAG_H > v.y1 || x + FLAG_H < v.x0 || x - FLAG_H > v.x1) return true;
  const [img, f] = p;
  const k = FLAG_H / f.h;
  let bounce = 0;
  if (reached) {
    if (!reachedAt.has(x)) reachedAt.set(x, t);
    const u = t - reachedAt.get(x)!;
    // (a hop and two settling bobs over 0.6 s)
    if (u >= 0 && u < 0.6) bounce = Math.sin((u / 0.6) * Math.PI * 3) * (1 - u / 0.6) * 10;
    glow(ctx, '255,214,110', x + (f.w * 0.3 - f.ax) * k, ground - FLAG_H * 0.72 - bounce, 64, 0.65 + 0.12 * Math.sin(t * 2.6));
  } else reachedAt.delete(x);
  const left = x - f.ax * k;
  const top = ground - f.ay * k - bounce;
  // the post and pennant come from the flag baked at its drawn size (sheet px x b in the bake), or from the sheet while that can't be made
  const bk = flagBake(ctx, img, f, reached, k);
  const src: CanvasImageSource = bk ? bk.cv : img;
  const b = bk ? bk.cv.width / f.w : 1;
  const ox = bk ? 0 : f.x;
  const oy = bk ? 0 : f.y;
  const sh = bk ? bk.cv.height : f.h;
  // the post (left of the pennant) as it is
  const poleW = f.px ?? f.ax + 6;
  ctx.drawImage(src, ox, oy, poleW * b, sh, left, top, poleW * k, f.h * k);
  // the pennant in slices: lit it flutters, unlit it only stirs
  const amp = reached ? 3.2 : 0.9;
  const sl = 8;
  for (let sx = poleW; sx < f.w; sx += sl) {
    const w = Math.min(sl, f.w - sx);
    const u = (sx - poleW) / (f.w - poleW);
    const dy = Math.sin(t * (reached ? 7 : 2.2) - u * 5 + x * 0.01) * amp * u;
    // (the last slice's hair of overlap would run past the bake's edge: kept inside it)
    const sw = bk ? Math.min(w + 0.6, f.w - sx) : w + 0.6;
    ctx.drawImage(src, ox + sx * b, oy, sw * b, sh, left + sx * k, top + dy, sw * k, f.h * k);
  }
  return true;
}

/**
 * The checkpoint (unlit and lit) baked once at the size it covers on screen (FLAG_H world px times the canvas scale, on artKit's
 * bakeStep ladder): the 384 px sheet frame was shrunk 1.4-2x on the post and every pennant slice, every frame. Remade only when the sheet or the scale
 * changes.
 */
const flagBakes: Array<{ img: HTMLImageElement | null; k: number; cv: HTMLCanvasElement } | null> = [null, null];
function flagBake(ctx: CanvasRenderingContext2D, img: HTMLImageElement, f: ArtFrame, lit: boolean, k: number) {
  if (typeof document === 'undefined' || typeof ctx.getTransform !== 'function') return null;
  const m = ctx.getTransform();
  return flagBakeAt(img, f, lit, Math.hypot(m.a, m.b) * k);
}
function flagBakeAt(img: HTMLImageElement, f: ArtFrame, lit: boolean, scale: number) {
  if (typeof document === 'undefined') return null;
  const dk = bakeStep(scale);
  // (already as small as the sheet itself: drawn straight from the sheet)
  if (dk >= 1) return null;
  const i = lit ? 1 : 0;
  let e = flagBakes[i];
  if (e && e.img === img && e.k === dk) return e;
  const cv = e?.cv ?? document.createElement('canvas');
  cv.width = Math.ceil(f.w * dk);
  cv.height = Math.ceil(f.h * dk);
  const g = cv.getContext('2d');
  if (!g) return null;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, cv.width, cv.height);
  e = { img, k: dk, cv };
  flagBakes[i] = e;
  return e;
}

// ───────────────────────────── pickups ─────────────────────────────
const PICKUP: Record<string, { n: StageArtName; h: number; glow: string; pulse: number }> = {
  heart: { n: 'heart', h: 30, glow: '255,140,170', pulse: 5 },
  super_heart: { n: 'superHeart', h: 38, glow: '255,214,90', pulse: 6 },
  powerup_speed: { n: 'speed', h: 34, glow: '80,240,180', pulse: 8 },
  powerup_invincible: { n: 'shield', h: 36, glow: '255,214,80', pulse: 9 },
  powerup_magnet: { n: 'magnet', h: 32, glow: '130,170,255', pulse: 6 },
};
/** a heart, crowned heart or power-up, painted, centred on the origin (drawCollectible's frame), breathing in its own light */
export function drawPickupArt(ctx: CanvasRenderingContext2D, type: string, t: number, phase: number): boolean {
  const d = PICKUP[type];
  if (!d) return false;
  const p = piece(d.n);
  if (!p) return false;
  const s = Math.sin(t * d.pulse + phase) * 0.07 + 0.95;
  glow(ctx, d.glow, 0, 0, d.h * 0.85, 0.55 + 0.2 * Math.sin(t * d.pulse + phase));
  ctx.save();
  ctx.scale(s, s);
  blitAt(ctx, p[0], p[1], 0, 0, d.h);
  ctx.restore();
  return true;
}

// ───────────────────────────── the Thorn Gate ─────────────────────────────
/** the hidden Thorn Gate (7-7), centred on the origin: its brambles shut until he steps in, then torn open on its violet light */
export function drawThornGateArt(ctx: CanvasRenderingContext2D, t: number, open: boolean): boolean {
  const p = piece(open ? 'thornOpen' : 'thornShut');
  if (!p) return false;
  const pulse = 0.65 + 0.35 * Math.sin(t * 3);
  glow(ctx, '170,120,250', 0, 0, open ? 70 : 54, (open ? 0.9 : 0.55) * pulse);
  blitAt(ctx, p[0], p[1], 0, 0, open ? 92 : 86);
  return true;
}

// ───────────────────────────── the story finds ─────────────────────────────
/** a Hush Fern (its foot at (0, ground)), its lit take breathing over the plain one, a shiver now and then and while searched */
export function drawFernArt(ctx: CanvasRenderingContext2D, ground: number, t: number, id: number, search: number): boolean {
  const a = piece('fern');
  const b = piece('fernLit');
  if (!a || !b) return false;
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.4 + id);
  const rustle = Math.max(0, Math.sin(t * 1.1 + id * 2.3) - 0.78) / 0.22;
  const shake = (search > 0 ? Math.sin(t * 38) * 0.035 * search : 0) + Math.sin(t * 31) * 0.028 * rustle + Math.sin(t * 1.6 + id) * 0.02;
  glow(ctx, '255,230,140', 0, ground - 30, 50, 0.25 + 0.2 * breathe + 0.4 * search);
  ctx.save();
  ctx.translate(0, ground);
  ctx.transform(1, 0, shake, 1, 0, 0);
  const h = 68;
  blitAt(ctx, a[0], a[1], 0, 0, h);
  ctx.globalAlpha *= Math.min(1, 0.25 + 0.45 * breathe + search);
  blitAt(ctx, b[0], b[1], 0, 0, h);
  ctx.restore();
  return true;
}

/** a Keeper's Bell (its stem's foot at (0, ground)), swaying, its lit take breathing over it */
export function drawBellArt(ctx: CanvasRenderingContext2D, ground: number, t: number, id: number): boolean {
  const a = piece('bell');
  const b = piece('bellLit');
  if (!a || !b) return false;
  const breathe = 0.5 + 0.5 * Math.sin(t * 2.2 + id);
  const h = 70;
  glow(ctx, '255,210,230', 0, ground - h * 0.55, 40, 0.35 + 0.25 * breathe);
  ctx.save();
  ctx.translate(0, ground);
  ctx.rotate(Math.sin(t * 2 + id) * 0.06);
  blitAt(ctx, a[0], a[1], 0, 0, h);
  ctx.globalAlpha *= 0.2 + 0.5 * breathe;
  blitAt(ctx, b[0], b[1], 0, 0, h);
  ctx.restore();
  return true;
}

// ───────────────────────────── 4-8's netting ─────────────────────────────
/**
 * the old netting pegged over a nest, its pegs' feet on `floor` either side of x, `w` world px wide (snug over the nest's bowl): whole,
 * torn (after the first blow), falling away (gone 0..1)
 */
export function drawNetArt(ctx: CanvasRenderingContext2D, x: number, floor: number, torn: boolean, gone: number, t: number, w = 150): boolean {
  if (gone >= 1) return true;
  const p = piece(torn ? 'netTorn' : 'netWhole');
  if (!p) return false;
  ctx.save();
  ctx.globalAlpha *= 1 - gone;
  const shake = torn && gone === 0 ? Math.sin(t * 30) * 1.2 : 0;
  blitAt(ctx, p[0], p[1], x + shake, floor + gone * gone * 120, (w * p[1].h) / p[1].w);
  ctx.restore();
  return true;
}

// ───────────────────────────── the exit gate ─────────────────────────────
/** how tall the exit gate stands (world px) */
export const GATE_H = 250;
/**
 * A world's exit gate with its foot's middle at (0, ground): shut while the stage's goal is not done, open after, warm light breathing
 * out of the way through.
 */
export function drawGateArt(ctx: CanvasRenderingContext2D, world: number, ground: number, locked: boolean, t: number): boolean {
  const g = GATE_FRAMES[gateWorld(world)];
  const img = g ? sheetFor(gateUrl(world), true) : null;
  if (!img) return false;
  const f = locked ? g.shut : g.open;
  if (!locked) glow(ctx, '255,222,140', 0, ground - GATE_H * 0.42, GATE_H * 0.42, 0.55 + 0.15 * Math.sin(t * 2.2));
  blitAt(ctx, img, f, 0, ground, GATE_H);
  if (!locked) {
    // (motes drifting up out of the way through)
    ctx.save();
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 6; i++) {
      const ph = (t * 0.4 + i * 0.17) % 1;
      ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.8;
      ctx.beginPath();
      ctx.arc(Math.sin(i * 2.1 + t * 0.8) * 30, ground - 40 - ph * GATE_H * 0.6, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  return true;
}

// ───────────────────────────── pit water ─────────────────────────────
/** one repeat of the water strip, world px */
const TILE = 420;
/**
 * The strip and its shine baked once at the size a tile covers on screen (TILE world px times the canvas scale, on artKit's bakeStep
 * ladder, so a tile is never enlarged and a zoom inside one step bakes nothing): the 1024 px sheet was shrunk with the main canvas's high-quality filter on every tile, every frame. Kept for
 * one sheet at a time, made again only when the sheet or the scale changes (a new world, a quality step, the camera's zoom).
 */
const pitBake = { img: null as HTMLImageElement | null, k: 0, strip: null as HTMLCanvasElement | null, shine: null as HTMLCanvasElement | null };
function bakeRow(cv: HTMLCanvasElement | null, img: HTMLImageElement, f: ArtFrame, w: number, h: number): HTMLCanvasElement {
  const c = cv ?? document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (g) {
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, f.x, f.y, f.w, f.h, 0, 0, w, h);
  }
  return c;
}
function pitRows(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: (typeof PIT_WATER)[number]): [CanvasImageSource, CanvasImageSource, boolean] {
  if (typeof document === 'undefined' || typeof ctx.getTransform !== 'function') return [img, img, false];
  const m = ctx.getTransform();
  return pitRowsAt(img, w, Math.hypot(m.a, m.b));
}
function pitRowsAt(img: HTMLImageElement, w: (typeof PIT_WATER)[number], scale: number): [CanvasImageSource, CanvasImageSource, boolean] {
  const k = bakeStep(scale);
  // already as small as the sheet itself (or smaller): drawn straight from the sheet
  if (TILE * k >= w.strip.w) return [img, img, false];
  if (pitBake.img !== img || pitBake.k !== k) {
    const bw = Math.ceil(TILE * k);
    const bh = Math.ceil((bw * w.strip.h) / w.strip.w);
    pitBake.strip = bakeRow(pitBake.strip, img, w.strip, bw, bh);
    pitBake.shine = bakeRow(pitBake.shine, img, w.shine, bw, bh);
    pitBake.img = img;
    pitBake.k = k;
  }
  return [pitBake.strip as HTMLCanvasElement, pitBake.shine as HTMLCanvasElement, true];
}
/** one row of tiles from x0 to x1, slid by `shift` (`f`: the frame on the sheet, or null for a baked row) */
function pitRow(ctx: CanvasRenderingContext2D, src: CanvasImageSource, f: ArtFrame | null, shift: number, x0: number, x1: number, y: number, h: number) {
  const s = ((shift % TILE) + TILE) % TILE;
  for (let x = Math.floor((x0 - s) / TILE) * TILE + s; x < x1; x += TILE - 1) {
    if (f) ctx.drawImage(src, f.x, f.y, f.w, f.h, x, y, TILE, h);
    else ctx.drawImage(src, x, y, TILE, h);
  }
}
/**
 * Worlds 1, 3, 4 and 5's painted pit water between x0 and x1, from its surface `waterY` down to `bottom`: the strip drifting slowly, its
 * deep colour under it, and its shine sliding the other way and breathing. False while its sheet loads (or for another world).
 */
export function drawPitWater(ctx: CanvasRenderingContext2D, world: number, x0: number, x1: number, waterY: number, bottom: number, t: number): boolean {
  const u = pitWaterUrl(world);
  if (!u) return false;
  const img = sheetFor(u, true);
  if (!img) return false;
  const w = PIT_WATER[world];
  const th = (TILE * w.strip.h) / w.strip.w;
  const top = waterY - th * w.surface + Math.sin(t * 1.3) * 1.2;
  // all of it below the view: nothing to draw
  if (top - 4 >= bottom || x1 <= x0) return true;
  const [strip, shine, baked] = pitRows(ctx, img, w);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top - 4, x1 - x0, bottom - top + 4);
  ctx.clip();
  ctx.fillStyle = w.deep;
  ctx.fillRect(x0, top + th - 2, x1 - x0, Math.max(0, bottom - (top + th - 2)));
  pitRow(ctx, strip, baked ? null : w.strip, t * 9, x0, x1, top, th);
  ctx.globalAlpha = 0.55 + 0.3 * Math.sin(t * 1.7);
  pitRow(ctx, shine, baked ? null : w.shine, -t * 16, x0, x1, top, th);
  ctx.globalAlpha = 1;
  ctx.restore();
  return true;
}

/**
 * Bake the checkpoint flags (unlit and lit) and, for Worlds 1, 3, 4 and 5, the pit water, for a view drawn at `scale` device px a world
 * unit, before play (stageReady): each bake costs 6-20 ms on a slow phone, too much for a frame of play. Sheets not yet loaded are skipped.
 * `stampOn`: the canvas that will show them (the game's), so each is uploaded to the GPU before play as well.
 */
export function warmStageArt(world: number, scale: number, stampOn?: CanvasRenderingContext2D): void {
  const made: CanvasImageSource[] = [];
  const flags = sheetFor(STAGE_ART_URL, false);
  if (flags) {
    for (const lit of [false, true]) {
      const f = STAGE_ART_FRAMES[lit ? 'flagLit' : 'flagUnlit'];
      const b = flagBakeAt(flags, f, lit, scale * (FLAG_H / f.h));
      made.push(b ? b.cv : flags);
    }
  }
  const u = pitWaterUrl(world);
  const water = u ? sheetFor(u, true) : null;
  if (water) made.push(...pitRowsAt(water, PIT_WATER[world], scale).slice(0, 2) as CanvasImageSource[]);
  // (a 1x1 stamp of each in a corner, so its upload to the GPU happens now too: PERFORMANCE-RULES §2.12)
  if (stampOn) {
    stampOn.save();
    stampOn.setTransform(1, 0, 0, 1, 0, 0);
    for (const c of made) stampOn.drawImage(c, 0, 0, 1, 1);
    stampOn.restore();
  }
}
