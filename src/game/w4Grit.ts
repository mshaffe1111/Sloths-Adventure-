/**
 * w4Grit — the painted look of World 4's falling rocks (2026-10-29, Matt: "for the falling rocks, it puts squares where it's going to
 * fall... if it's going to constantly have animation, we need to do it right"). Only the look: when a rock warns, falls and shatters is
 * rockfall.ts's (rockAt), and w4Play.ts calls drawRockFx with it.
 *
 * - The grit: painted pebbles and chips (src/assets/props/w4-grit.webp, Hugging Face img2img of the world's own rock pieces,
 *   tools/art/hazard/gritcut.py) patter down onto the spot through the warning, spinning, each its own size, fading in as it falls; each
 *   lands with a little dust puff, hops once and settles, then fades.
 * - The shadow: a soft contact shadow (one pre-rendered sprite, no ring) that grows and darkens as the rock comes, with a faint cloud of
 *   stone dust over it so it reads on dark rock as well as pale.
 * - The rock: the painted rock spinning down, squashed for a moment as it lands, then its painted shards burst out with chips and a
 *   billow of the painted dust (boss-fx.webp's dust strip, tinted to World 4's stone).
 * - Through open air (4-7's gaps): a soft pale column (no hard ends) with the grit and dust streaming down it.
 *
 * Every piece of motion is worked out from the time alone (a hash of the drop and its cycle for the variety), so it is smooth at any
 * frame rate and the same on every replay. Nothing is drawn until the sheets have loaded (stagePreload decodes them first).
 */
import { trackAtlas } from './atlasLoader.ts';
import { drawFx, fxFrame } from './bossFx.ts';
import { ROCK, rockAt, type RockDrop } from './rockfall.ts';
import { drawW4, w4ArtReady, w4Height, type W4Piece } from './w4Art.ts';
import { W4_CHIPS, W4_PEBBLES, type GritFrame } from './w4GritData.ts';

export const W4_GRIT_URL = new URL('../assets/props/w4-grit.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, W4_GRIT_URL, () => { ready = true; }, () => { img = null; }, () => { img = null; ready = false; });
}
/** whether the grit sheet has loaded (starts the load) */
export function w4GritReady(): boolean {
  load();
  return ready && !!img;
}

/** World 4's stone, for the dust (its hue and colour laid on the painted tan dust, which keeps its own light and shade): a cool grey */
const STONE = '#a7b0ba';

/** a steady pseudo-random 0..1 from a few numbers (the same every frame and every replay) */
function rnd(a: number, b: number, c = 0): number {
  const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

function piece(ctx: CanvasRenderingContext2D, f: GritFrame, x: number, y: number, size: number, rot: number, alpha: number, sy = 1) {
  if (alpha <= 0.01) return;
  const k = size / Math.max(f.w, f.h);
  ctx.save();
  ctx.globalAlpha *= Math.min(1, alpha);
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(1, sy);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
}

/** the soft contact shadow: made once, a dark ellipse that fades smoothly to nothing (no edge, no ring) */
let shadowSprite: HTMLCanvasElement | null = null;
function shadow(): HTMLCanvasElement | null {
  if (shadowSprite || typeof document === 'undefined') return shadowSprite;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  if (!g) return null;
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  // (an eased fall-off: a dense middle that thins out gently, so the outside never shows as a line)
  for (let i = 0; i <= 10; i++) {
    const u = i / 10;
    r.addColorStop(u, `rgba(12, 16, 24, ${(0.96 * (1 - u ** 2.4) ** 1.6).toFixed(3)})`);
  }
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  shadowSprite = c;
  return c;
}

/** the soft pale column a rock through open air falls down: made once, faded at its sides and at both ends */
let columnSprite: HTMLCanvasElement | null = null;
function column(): HTMLCanvasElement | null {
  if (columnSprite || typeof document === 'undefined') return columnSprite;
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const g = c.getContext('2d');
  if (!g) return null;
  const d = g.createImageData(64, 256);
  for (let y = 0; y < 256; y++) {
    const v = Math.min(1, y / 70, (255 - y) / 70);
    const ve = v * v * (3 - 2 * v);
    for (let x = 0; x < 64; x++) {
      const h = 1 - Math.abs(x - 31.5) / 32;
      const a = ve * h * h * (3 - 2 * h);
      const i = (y * 64 + x) * 4;
      d.data[i] = 255;
      d.data[i + 1] = 251;
      d.data[i + 2] = 235;
      d.data[i + 3] = Math.round(255 * a);
    }
  }
  g.putImageData(d, 0, 0);
  columnSprite = c;
  return c;
}

/** a puff of World 4's stone dust (the painted dust strip, tinted), `u` through its life, its foot at (x, y) */
function dust(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, u: number, alpha: number, flip = false) {
  if (u < 0 || u >= 1 || alpha <= 0.01) return;
  drawFx(ctx, fxFrame('dust', u), x, y, size, { ay: 0.9, alpha: alpha * Math.min(1, (1 - u) * 2.5, u * 8 + 0.3), flipX: flip, recolor: STONE });
}

/** where one grain of grit is `e` seconds after it let go: falling (spinning), then a hop where it lands, then still; null once gone */
interface Grain {
  x: number;
  y: number;
  rot: number;
  alpha: number;
  /** seconds since it landed (negative while it falls) */
  since: number;
}
const G = 1100;
function grain(seed: number, x0: number, y0: number, land: number, e: number, fadeTop: number): Grain | null {
  if (e < 0) return null;
  const v0 = 60 + 80 * rnd(seed, 1);
  const span = land - y0;
  const tf = (-v0 + Math.sqrt(v0 * v0 + 2 * G * span)) / G;
  const spin = (rnd(seed, 2) - 0.5) * 14;
  const drift = (rnd(seed, 3) - 0.5) * 10;
  if (e < tf) {
    const y = y0 + v0 * e + 0.5 * G * e * e;
    // (fading in over the first stretch of its fall, so nothing pops into being mid-air)
    return { x: x0 + drift * (e / tf), y, rot: seed + spin * e, alpha: Math.min(1, (y - y0) / fadeTop), since: e - tf };
  }
  const s = e - tf;
  const side = rnd(seed, 4) < 0.5 ? -1 : 1;
  const hopT = 0.2 + 0.1 * rnd(seed, 5);
  const hopX = side * (6 + 12 * rnd(seed, 6));
  const hopH = 5 + 7 * rnd(seed, 7);
  const k = Math.min(1, s / hopT);
  const x = x0 + drift + hopX * (1 - (1 - k) * (1 - k));
  const y = land - hopH * 4 * k * (1 - k);
  const rot = seed + spin * tf + spin * 0.4 * Math.min(s, hopT);
  // (still a moment, then gone over half a second)
  const alpha = s < 0.7 ? 1 : Math.max(0, 1 - (s - 0.7) / 0.5);
  if (alpha <= 0) return null;
  return { x, y, rot, alpha, since: s };
}

/** how long since this drop's warning began (s), carried on through the fall, the shatter and the quiet after, so the settled grit and
 *  the dust can finish; and which cycle it is (for the variety) */
function sinceWarn(r: RockDrop, t: number): { e: number; cycle: number } {
  const fallT = Math.max(0.01, (r.land - r.top) / ROCK.speed);
  const s = rockAt(r, t);
  const cycle = Math.floor((t + r.offset) / r.every);
  const idleT = r.every - r.warn - fallT - ROCK.shatter;
  if (s.phase === 'warn') return { e: s.u * r.warn, cycle };
  if (s.phase === 'fall') return { e: r.warn + s.u * fallT, cycle };
  if (s.phase === 'shatter') return { e: r.warn + fallT + s.u * ROCK.shatter, cycle };
  // (idle: the end of the last cycle)
  return { e: r.warn + fallT + ROCK.shatter + s.u * idleT, cycle: cycle - 1 };
}

/** how many grains a warning drops, and when each lets go: more and more as the rock comes */
const GRAINS = 18;
function bornAt(r: RockDrop, k: number, cycle: number): number {
  return r.warn * 0.92 * Math.sqrt((k + 0.4 * rnd(k, cycle, 9)) / GRAINS);
}

/**
 * One drop point's warning, rock and shatter, painted. Drawn in front of the scene (as the old drawRock was). False (and nothing
 * drawn) while the sheets load; stagePreload has them decoded before a World 4 stage starts.
 */
export function drawRockFx(ctx: CanvasRenderingContext2D, r: RockDrop, t: number): boolean {
  if (!w4GritReady() || !w4ArtReady()) return false;
  const s = rockAt(r, t);
  const fallT = Math.max(0.01, (r.land - r.top) / ROCK.speed);
  const { e, cycle } = sinceWarn(r, t);
  const afterHit = e - r.warn - fallT;
  ctx.save();

  if (r.air) drawAirColumn(ctx, r, s.phase === 'warn' ? s.u : s.phase === 'fall' ? 1 - s.u : 0, t);

  // the contact shadow, growing and darkening as the rock comes (and gone the moment it lands)
  const sh = shadow();
  if (!r.air && sh && (s.phase === 'warn' || s.phase === 'fall')) {
    const u = s.phase === 'warn' ? 0.3 + 0.4 * s.u : 0.7 + 0.3 * s.u;
    const w = 56 + 64 * u;
    // (twice over as it nears: one soft sprite tops out at a grey, two read as a real shadow on the dark ledge tops too)
    ctx.globalAlpha = Math.min(1, 0.5 + 0.6 * u);
    ctx.drawImage(sh, r.x - w / 2, r.land - 2 - w * 0.16, w, w * 0.32);
    ctx.globalAlpha = Math.max(0, u - 0.3);
    ctx.drawImage(sh, r.x - w * 0.36, r.land - 2 - w * 0.11, w * 0.72, w * 0.22);
    ctx.globalAlpha = 1;
    // (a faint cloud of stone dust hanging over it: the warning reads on dark rock, where a shadow alone would not)
    for (let k = 0; k < 2; k++) {
      const du = ((t * 0.9 + k * 0.5) % 1);
      dust(ctx, r.x + (k ? 14 : -14), r.land + 2, 40 + 26 * u, du, 0.22 + 0.25 * u, k === 1);
    }
  }

  // the grit: pattering down through the last stretch above the spot (in view on a phone held either way) and from the ledge it
  // breaks from, through the warning; each lands with a puff, hops, settles and fades
  if (!r.air) {
    const span = Math.min(260, r.land - r.top);
    for (let k = 0; k < GRAINS; k++) {
      const b = bornAt(r, k, cycle);
      const seed = k * 13.7 + cycle * 3.1 + r.x * 0.01;
      const x0 = r.x + (rnd(seed, 11) - 0.5) * 34;
      const g = grain(seed, x0, r.land - span, r.land - 3, e - b, 50);
      if (!g) continue;
      drawGrain(ctx, seed, g, k);
      if (g.since >= 0 && g.since < 0.45 && k % 2 === 0) dust(ctx, g.x, r.land + 2, 22 + 10 * rnd(seed, 12), g.since / 0.45, 0.55, k % 4 === 0);
    }
    // (from the ledge it breaks from: a few chips and a wisp of dust, gone before they have fallen far)
    if (s.phase === 'warn') {
      for (let k = 0; k < 6; k++) {
        const b = (k / 6) * r.warn * 0.9;
        const seed = k * 7.3 + cycle * 1.7 + 50;
        const ee = e - b;
        if (ee < 0 || ee > 0.6) continue;
        const y = r.top + 40 * ee + 0.5 * G * ee * ee;
        const a = Math.min(1, ee / 0.1) * Math.max(0, 1 - (y - r.top) / 140);
        piece(ctx, W4_CHIPS[k % W4_CHIPS.length], r.x - 10 + 20 * rnd(seed, 1), y, 6 + 4 * rnd(seed, 2), seed + ee * 9, a);
      }
      dust(ctx, r.x, r.top + 14, 46, (t * 1.1) % 1, 0.25 + 0.3 * s.u);
    }
  } else {
    // through open air: painted pebbles and chips streaming down the column the whole way, spinning (fading in and out at its ends)
    const span = r.land - r.top;
    if (s.phase === 'warn') {
      const n = 10 + Math.round(12 * s.u);
      for (let k = 0; k < n; k++) {
        const seed = k * 5.9 + 31;
        const gy = r.top + ((t * 360 + k * (span / n)) % span);
        const end = Math.min(1, (gy - r.top) / 60, (r.land - gy) / 60);
        if (end <= 0) continue;
        const gx = r.x + Math.sin(k * 2.3) * 11;
        piece(ctx, k % 3 ? W4_CHIPS[k % W4_CHIPS.length] : W4_PEBBLES[k % W4_PEBBLES.length], gx, gy, 6 + 6 * rnd(seed, 1), seed + t * (k % 2 ? 7 : -6), end);
      }
    }
  }

  // the rock: spinning down; on the ground, squashed for a blink before it bursts
  const n: W4Piece = r.x % 2 ? 'rockMoss' : 'rock';
  const w = ROCK.radius * 2.4;
  const h = w4Height(n, w);
  if (s.phase === 'fall') {
    const spin = (cycle % 2 ? 1 : -1) * (2.2 + rnd(r.x, cycle) * 1.2);
    ctx.save();
    ctx.translate(r.x, s.y - h / 2);
    ctx.rotate(s.u * spin);
    // (stretched a touch along its fall as it comes fastest)
    ctx.scale(1 - 0.06 * s.u, 1 + 0.08 * s.u);
    drawW4(ctx, n, 0, h / 2, w);
    ctx.restore();
  }
  if (afterHit >= 0 && afterHit < 0.09) {
    const q = afterHit / 0.09;
    ctx.save();
    ctx.translate(r.x, r.land);
    ctx.scale(1 + 0.3 * Math.sin(Math.PI * q), 1 - 0.32 * Math.sin(Math.PI * q));
    drawW4(ctx, n, 0, 0, w, { alpha: 1 - q * q });
    ctx.restore();
  }

  // the burst: the painted shards fly apart in arcs and tumble, with chips, under a billow of stone dust
  if (afterHit >= 0 && afterHit < 1.1) {
    const a = afterHit;
    // (the dust first, behind the stones: a big billow in the middle and two rolling out to the sides)
    dust(ctx, r.x, r.land + 6, 110, a / 1.0, 0.6);
    dust(ctx, r.x - 18 - 50 * a, r.land + 4, 70, a / 0.9, 0.5, true);
    dust(ctx, r.x + 18 + 50 * a, r.land + 4, 70, a / 0.9, 0.5);
    if (a < ROCK.shatter + 0.25) {
      const u = a / (ROCK.shatter + 0.25);
      // (the big pieces: four of the painted pebbles, the rock's own halves and quarters, bigger than the grit)
      for (let k = 0; k < 4; k++) {
        const dir = k < 2 ? -1 : 1;
        const vx = dir * (60 + 70 * rnd(k, cycle, 21));
        const vy = -(170 + 120 * rnd(k, cycle, 22));
        const x = r.x + (k - 1.5) * 8 + vx * a;
        const y = Math.min(r.land - 8, r.land - 10 + vy * a + 0.5 * G * a * a);
        piece(ctx, W4_PEBBLES[(k * 5 + cycle) % W4_PEBBLES.length], x, y, 18 + 5 * rnd(k, cycle, 23), dir * a * (6 + k), 1 - u * u);
      }
      for (let k = 0; k < 7; k++) {
        const seed = k * 9.1 + cycle * 2.3 + 70;
        const dir = k % 2 ? 1 : -1;
        const vx = dir * (40 + 130 * rnd(seed, 1));
        const vy = -(110 + 200 * rnd(seed, 2));
        const x = r.x + vx * a;
        const y = Math.min(r.land - 2, r.land - 4 + vy * a + 0.5 * G * a * a);
        piece(ctx, k % 3 === 0 ? W4_PEBBLES[(k + cycle) % W4_PEBBLES.length] : W4_CHIPS[(k + cycle) % W4_CHIPS.length], x, y, 7 + 7 * rnd(seed, 3), seed + a * dir * 12, 1 - u * u);
      }
    }
  }
  ctx.restore();
  return true;
}

function drawGrain(ctx: CanvasRenderingContext2D, seed: number, g: Grain, k: number) {
  // (one in three is a whole pebble, the rest chips; sizes from a speck to a small stone)
  const peb = k % 3 === 0;
  const f = peb ? W4_PEBBLES[Math.floor(rnd(seed, 13) * W4_PEBBLES.length)] : W4_CHIPS[Math.floor(rnd(seed, 13) * W4_CHIPS.length)];
  const size = peb ? 8 + 6 * rnd(seed, 14) : 5 + 6 * rnd(seed, 14);
  piece(ctx, f, g.x, g.y - size * 0.35, size, g.rot, g.alpha * (0.85 + 0.15 * rnd(seed, 15)));
}

/** 4-7: a soft pale column down the whole of a rock's path through open air, thickening as it comes (no hard edge anywhere) */
function drawAirColumn(ctx: CanvasRenderingContext2D, r: RockDrop, u: number, t: number) {
  const c = column();
  if (!c || u <= 0) return;
  // (twice over: the pale column has to read against pale mist as well as grey rock, as the old band did)
  const a = 0.3 + 0.35 * u;
  ctx.save();
  ctx.globalAlpha = a * (0.92 + 0.08 * Math.sin(t * 5));
  ctx.drawImage(c, r.x - 40 - 10 * u, r.top + 20, 80 + 20 * u, r.land - r.top - 40);
  ctx.globalAlpha *= 0.5;
  ctx.drawImage(c, r.x - 18, r.top + 40, 36, r.land - r.top - 80);
  ctx.restore();
}

/**
 * A soft contact shadow, `w` x `h` round (cx, cy): the one pre-rendered sprite, dense in the middle and thinning to nothing, so it never
 * shows an edge or a ring (a rock's warning, the Sovereign's and the eagle's shadows sweeping the ledge, a drop's landing spot).
 */
export function drawSoftShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, alpha: number) {
  const sh = shadow();
  if (!sh || alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha *= Math.min(1, alpha);
  ctx.drawImage(sh, cx - w / 2, cy - h / 2, w, h);
  ctx.restore();
}

/** a soft pale column (the air rocks' and 4-7's updrafts' glow): one sprite, faded at its sides and both ends, so it has no edge */
export function drawSoftColumn(ctx: CanvasRenderingContext2D, x: number, top: number, w: number, h: number, alpha: number) {
  const c = column();
  if (!c || alpha <= 0 || h <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.drawImage(c, x, top, w, h);
  ctx.restore();
}

/** the camera nudge as a rock lands near him (0 when it is far): small, and only close by */
export function rockShake(r: RockDrop, px: number, py: number): number {
  const d = Math.hypot(r.x - px, (r.land - py) * 1.5);
  return d > 340 ? 0 : 0.34 * (1 - d / 340);
}

/** the grit sheet re-coloured once per tint (multiplied, its own alpha kept): brown bits of wood and earth from the grey stones */
const tintedGrit = new Map<string, HTMLCanvasElement>();
function gritSheet(tint?: string): CanvasImageSource | null {
  if (!tint) return img;
  const had = tintedGrit.get(tint);
  if (had) return had;
  if (!img || typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext('2d');
  if (!g) return null;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = tint;
  g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(img, 0, 0);
  tintedGrit.set(tint, c);
  return c;
}

/**
 * One painted bit of grit flying loose (a crumbling ledge, a broken pillar, a knock-out's dust: engine.ts particles), any world: a chip
 * or (`c` picks) now and then a pebble, `size` px across, turned `rot`, multiplied by `tint` when given. False until the sheet has loaded.
 */
export function drawGritBit(ctx: CanvasRenderingContext2D, c: number, x: number, y: number, size: number, rot: number, alpha: number, tint?: string): boolean {
  if (!w4GritReady()) return false;
  const src = gritSheet(tint);
  if (!src) return false;
  const n = Math.floor(Math.abs(c) * 1000);
  const f = n % 4 === 0 ? W4_PEBBLES[n % W4_PEBBLES.length] : W4_CHIPS[n % W4_CHIPS.length];
  const k = size / Math.max(f.w, f.h);
  ctx.save();
  ctx.globalAlpha *= Math.max(0, Math.min(1, alpha));
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.drawImage(src, f.x, f.y, f.w, f.h, (-f.w * k) / 2, (-f.h * k) / 2, f.w * k, f.h * k);
  ctx.restore();
  return true;
}
