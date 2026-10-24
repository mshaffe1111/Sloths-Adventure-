/**
 * w3Art — Matt's World 3 sheets (2026-10-24): the grotto pieces (glowworm threads lit and asleep, a stalactite, stalagmites, glowing
 * mushrooms, the grotto mouth) and the ferns and hiding places (a fern still and rustling, a curtain of moss, a hollow log, a giant
 * pawprint pressed in the mud, a boulder with claw marks).
 *
 * The dressing of the World 3 stages (protoStage.ts) is a list of W3Decor. Standing pieces sit with their bottom on `b`; hanging pieces
 * (`hang`) hang with their top at `b`. A glowworm thread names the light it belongs to (`light`), and is drawn asleep until that light
 * wakes (the engine's glowworms, engine.ts), then lit. Every draw does nothing until the atlas has loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { W3_FRAMES } from './w3PropsData.ts';

export type W3Piece = keyof typeof W3_FRAMES;

export interface W3Decor {
  n: W3Piece;
  x: number;
  /** the bottom of a standing piece, the top of a hanging one */
  b: number;
  w: number;
  flip?: boolean;
  front?: boolean;
  hang?: boolean;
  /** a glowworm thread: the id of its light (asleep until the light wakes) */
  light?: number;
}

let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, new URL('../assets/props/w3-props.webp', import.meta.url).href, () => { ready = true; }, () => { img = null; });
}
/** whether the World 3 pieces have loaded (starts the load) */
export function w3ArtReady(): boolean {
  load();
  return ready && !!img;
}

/** a piece's drawn height at width w */
export function w3Height(n: W3Piece, w: number): number {
  const f = W3_FRAMES[n];
  return (w * f.h) / f.w;
}

function blit(ctx: CanvasRenderingContext2D, n: W3Piece, x: number, y: number, w: number, h: number, flip = false) {
  const f = W3_FRAMES[n];
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

/**
 * The dressing on one layer (behind Pokey, or `front`) between x0 and x1. `lit(id)` says how awake a light is (0 asleep, 1 lit); the
 * glowworm threads cross-fade from asleep to lit with it, and sway a little.
 */
export function drawW3Decor(ctx: CanvasRenderingContext2D, items: W3Decor[], x0: number, x1: number, t: number, front: boolean, lit: (id: number) => number) {
  if (!w3ArtReady()) return;
  for (const d of items) {
    if (!!d.front !== front) continue;
    if (d.x + d.w < x0 - 60 || d.x - d.w > x1 + 60) continue;
    const h = w3Height(d.n, d.w);
    const left = d.x - d.w / 2;
    const top = d.hang ? d.b : d.b - h;
    if (d.light !== undefined) {
      const u = Math.max(0, Math.min(1, lit(d.light)));
      // the threads sway about the knot they hang from
      ctx.save();
      ctx.translate(d.x, d.b);
      ctx.rotate(Math.sin(t * 0.9 + d.x * 0.01) * 0.025);
      ctx.translate(-d.x, -d.b);
      if (u < 1) blit(ctx, 'glowDim', left, top, d.w, h, d.flip);
      if (u > 0) {
        ctx.globalAlpha = u;
        blit(ctx, 'glowLit', left, top, d.w, h, d.flip);
      }
      ctx.restore();
      continue;
    }
    blit(ctx, d.n, left, top, d.w, h, d.flip);
  }
}

/** a fern to hide in (World 3's bushes): the still fern, or the rustling one while he moves inside it */
export function drawW3Fern(ctx: CanvasRenderingContext2D, b: { x: number; w: number; y: number }, inside: boolean, rustle: number, t: number): boolean {
  if (!w3ArtReady()) return false;
  const still = W3_FRAMES.fern;
  const h = (b.w * still.h) / still.w;
  ctx.save();
  if (inside) ctx.globalAlpha = 0.62;
  ctx.translate(b.x + b.w / 2, b.y + 6);
  ctx.transform(1, 0, Math.sin(t * 22) * 0.05 * rustle, 1, 0, 0);
  if (rustle > 0.3) {
    // the rustling fern is drawn at the same scale as the still one (its loose leaves stick up above it)
    const r = W3_FRAMES.fernRustle;
    const k = b.w / still.w;
    blit(ctx, 'fernRustle', (-r.w * k) / 2, -r.h * k, r.w * k, r.h * k);
  } else blit(ctx, 'fern', -b.w / 2, -h, b.w, h);
  ctx.restore();
  return true;
}

/** a World 3 fern's drawn height at width w */
export function w3FernHeight(w: number): number {
  return w3Height('fern', w);
}

/** how tall a glowworm is drawn (world px, hands to tail) and how long its thread is above its hands */
export const GLOWWORM_H = 74;
export const GLOWWORM_THREAD = 190;

/**
 * One of the grotto's glowworms (Matt's glowworm sheets), hanging by its hands from a thread at (x, hands). Asleep (eyes shut, dim,
 * breathing) until its light wakes; `age` is how long it has been awake (s, negative while asleep). Waking, it looks round and waves for a
 * moment, then hangs and sways, and now and then waves again.
 */
export function drawGlowworm(ctx: CanvasRenderingContext2D, x: number, hands: number, age: number, t: number, seed: number): boolean {
  if (!w3ArtReady()) return false;
  let n: W3Piece;
  if (age < 0) n = Math.floor(t / 1.3 + seed * 0.37) % 2 === 0 ? 'glowSleep0' : 'glowSleep1';
  else if (age < 0.35) n = 'glowHang0';
  else if (age < 2.6 || (t + seed * 1.7) % 7 < 1.1) n = (['glowWave0', 'glowWave1', 'glowWave2', 'glowWave3'] as const)[Math.floor(t * 8 + seed) % 4];
  else n = (['glowHang0', 'glowHang1', 'glowHang2', 'glowHang1'] as const)[Math.floor(t * 2.5 + seed) % 4];
  const f = W3_FRAMES[n];
  const h = GLOWWORM_H;
  const w = (h * f.w) / f.h;
  ctx.save();
  // the thread, up into the dark
  ctx.strokeStyle = age < 0 ? 'rgba(120, 170, 160, 0.35)' : 'rgba(160, 240, 225, 0.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x, hands - GLOWWORM_THREAD);
  ctx.lineTo(x + Math.sin(t * 0.8 + seed) * 3, hands + 2);
  ctx.stroke();
  ctx.translate(x, hands);
  ctx.rotate(Math.sin(t * 0.8 + seed) * 0.07);
  if (age < 0) ctx.globalAlpha = 0.85;
  const flip = seed % 2 === 1;
  if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img!, f.x, f.y, f.w, f.h, -w / 2, 0, w, h);
  ctx.restore();
  if (age < 0) {
    // a slow z or two
    const u = (t * 0.4 + seed * 0.21) % 1;
    ctx.save();
    ctx.globalAlpha = Math.sin(u * Math.PI) * 0.8;
    ctx.fillStyle = '#ccfbf1';
    ctx.font = `700 ${10 + u * 6}px Fredoka, sans-serif`;
    ctx.fillText('z', x + 14 + u * 10, hands + 12 - u * 22);
    ctx.restore();
  }
  return true;
}
