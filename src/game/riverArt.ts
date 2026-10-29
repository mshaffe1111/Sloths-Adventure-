/**
 * riverArt — Matt's World 2 sheets (2026-10-24): the painted river (a repeating strip of water, the drifting logs, lily pads and reeds),
 * the riverbank village (round doors, windows, a sign, a mailbox, a chimney, a jetty, a washing line), the little ones and the reed cages.
 *
 * Every draw returns false until the atlas has loaded, and the caller then draws the old shapes.
 */
import { trackAtlas } from './atlasLoader.ts';
import { W2_FRAMES } from './w2PropsData.ts';
import type { Platform } from './types.ts';
import { CELS, drawCel, warmCels } from './storyCels.ts';
import { FONT_DISPLAY } from './fonts.ts';

export type W2Piece = keyof typeof W2_FRAMES;

/** the sheet's address (stagePreload.ts decodes it before a World 2 stage starts) */
export const W2_PROPS_URL = new URL('../assets/props/w2-props.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(
    im,
    W2_PROPS_URL,
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
/** whether the World 2 pieces have loaded (starts the load) */
export function riverArtReady(): boolean {
  load();
  return ready && !!img;
}

/** piece `n` filling the box (x, y, w, h); `flip` mirrors it */
function blit(ctx: CanvasRenderingContext2D, n: W2Piece, x: number, y: number, w: number, h: number, flip = false) {
  const f = W2_FRAMES[n];
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

/** a piece standing on the ground: `w` wide, its bottom at `bottom`, centred on `cx`. Returns its drawn height (0 before loading). */
export function drawW2Piece(ctx: CanvasRenderingContext2D, n: W2Piece, cx: number, bottom: number, w: number, flip = false, hh?: number): number {
  if (!riverArtReady()) return 0;
  const f = W2_FRAMES[n];
  const h = hh ?? (w * f.h) / f.w;
  blit(ctx, n, cx - w / 2, bottom - h, w, h, flip);
  return h;
}

/** a piece's height at width w (for placing things on it) */
export function w2Height(n: W2Piece, w: number): number {
  const f = W2_FRAMES[n];
  return (w * f.h) / f.w;
}

/** the painted water's colours: the top of the strip, and the deep water below it */
export const RIVER_DEEP = '#264247';
/** how wide one repeat of the water strip is drawn, in world units */
const WATER_TILE = 300;

/**
 * The river's water between x0 and x1, from the surface down to `bottom`: the painted strip repeated along the river, sliding slowly
 * the way the current runs, and the deep water under it.
 */
export function drawRiverWater(
  ctx: CanvasRenderingContext2D,
  x0: number,
  x1: number,
  surfaceY: number,
  bottom: number,
  t: number,
  dir: 1 | -1,
  speed: number,
): boolean {
  if (!riverArtReady()) return false;
  const f = W2_FRAMES.water;
  const th = (WATER_TILE * f.h) / f.w;
  // the strip's wave crests sit a few rows down its picture: line them up with the surface
  const top = surfaceY - th * 0.045;
  ctx.fillStyle = RIVER_DEEP;
  ctx.fillRect(x0, top + th - 2, x1 - x0, Math.max(0, bottom - (top + th - 2)));
  // the water slides with the current, a good deal slower than the logs (it reads as flow, not as a conveyor belt)
  const shift = (((t * speed * 0.35 * dir) % WATER_TILE) + WATER_TILE) % WATER_TILE;
  const start = Math.floor((x0 - shift) / WATER_TILE) * WATER_TILE + shift;
  for (let x = start; x < x1; x += WATER_TILE - 1) blit(ctx, 'water', x, top, WATER_TILE, th);
  return true;
}

/** a drifting log: the long painting for a long log, the short one for a short one, bobbing a touch on the current */
export function drawRiverLog(ctx: CanvasRenderingContext2D, p: Platform, t: number): boolean {
  if (!riverArtReady()) return false;
  const n: W2Piece = p.width >= 140 ? 'logLong' : 'logShort';
  const f = W2_FRAMES[n];
  const w = p.width * 1.08;
  const h = (w * f.h) / f.w;
  const bob = Math.sin(t * 2.3 + p.id * 1.7) * 1.5;
  // the bark's top is about a fifth of the way down the painting (the moss and the twig stand up above it)
  blit(ctx, n, p.x + p.width / 2 - w / 2, p.y + 2 - h * 0.2 + bob, w, h, p.id % 2 === 1);
  return true;
}

/** a cluster of lily pads floating on the water at (cx, surfaceY), gently bobbing */
export function drawLily(ctx: CanvasRenderingContext2D, cx: number, surfaceY: number, w: number, t: number, flip = false): boolean {
  if (!riverArtReady()) return false;
  const h = w2Height('lily', w);
  const bob = Math.sin(t * 1.8 + cx * 0.01) * 1.2;
  blit(ctx, 'lily', cx - w / 2, surfaceY - h * 0.55 + bob, w, h, flip);
  return true;
}

/** a clump of reeds at the water's edge or on a bank, swaying in the breeze about its roots */
export function drawReeds(
  ctx: CanvasRenderingContext2D,
  kind: 'reedTall' | 'reedShort' | 'reedLean',
  cx: number,
  bottom: number,
  w: number,
  t: number,
  flip = false,
): boolean {
  if (!riverArtReady()) return false;
  const h = w2Height(kind, w);
  ctx.save();
  ctx.translate(cx, bottom);
  ctx.transform(1, 0, Math.sin(t * 1.3 + cx * 0.02) * 0.05, 1, 0, 0);
  blit(ctx, kind, -w / 2, -h, w, h, flip);
  ctx.restore();
  return true;
}

// ───────────── the stage's dressing (w2Stages.ts places it) ─────────────

/**
 * One piece of a World 2 stage's dressing. `n`: a piece of the sheet, standing with its bottom middle at (x, b), `w` wide. A reed
 * clump sways; `front` draws it in front of Pokey (a reed at the water's edge he runs behind). `cel`: one of the village folk from the
 * story sheets instead (the mailman, Gruntlewick), `k` world units per atlas pixel, walking slowly between `walk[0]` and `walk[1]`.
 * `text`: words painted on a sign board.
 */
export interface W2Decor {
  n?: W2Piece;
  cel?: string;
  /** the folk's pose while walking (cel is the pose while standing) */
  celWalk?: string;
  x: number;
  b: number;
  w?: number;
  k?: number;
  flip?: boolean;
  front?: boolean;
  text?: string[];
  walk?: [number, number, number];
  /** a swing frame (2-7): the height of its beam (the posts run from there down to `b`) */
  top?: number;
  /** drawn this tall instead of in the painting's own shape (the carved steps, stretched to the stairs they cover) */
  h?: number;
}

/** where a walking figure is at time t (px), and which way it faces: back and forth between its two ends, very slowly */
export function walkerAt(d: W2Decor, t: number): { x: number; face: 1 | -1; moving: boolean } {
  if (!d.walk) return { x: d.x, face: d.flip ? -1 : 1, moving: false };
  const [a, b, speed] = d.walk;
  const len = Math.max(1, b - a);
  // a pause of 3 s at each end
  const leg = len / speed;
  const T = 2 * (leg + 3);
  const u = ((t % T) + T) % T;
  if (u < leg) return { x: a + u * speed, face: 1, moving: true };
  if (u < leg + 3) return { x: b, face: 1, moving: false };
  if (u < 2 * leg + 3) return { x: b - (u - leg - 3) * speed, face: -1, moving: true };
  return { x: a, face: -1, moving: false };
}

/** the dressing on one layer (behind Pokey, or `front` in front of him) between x0 and x1 */
export function drawW2Decor(ctx: CanvasRenderingContext2D, items: W2Decor[], x0: number, x1: number, t: number, front: boolean) {
  if (!riverArtReady()) return;
  for (const d of items) {
    if (!!d.front !== front) continue;
    if (d.cel) {
      const wk = walkerAt(d, t);
      if (wk.x < x0 - 200 || wk.x > x1 + 200) continue;
      const pose = wk.moving && d.celWalk ? d.celWalk : d.cel;
      if (CELS[pose]) warmCels([CELS[pose].a]);
      const bob = wk.moving ? Math.abs(Math.sin(t * 3)) * 1.5 : 0;
      drawCel(ctx, pose, wk.x, d.b - bob, d.k ?? 0.42, wk.face);
      continue;
    }
    if (!d.n) continue;
    const w = d.w ?? 100;
    if (d.x + w < x0 - 40 || d.x - w > x1 + 40) continue;
    if (d.n === 'swingFrame' && d.top !== undefined) {
      drawSwingFrame(ctx, d.x, d.top, d.b, w);
      continue;
    }
    if (d.n === 'reedTall' || d.n === 'reedShort' || d.n === 'reedLean') {
      drawReeds(ctx, d.n, d.x, d.b, w, t, d.flip);
      continue;
    }
    const h = drawW2Piece(ctx, d.n, d.x, d.b, w, d.flip, d.h);
    if (d.text && h) {
      // the sign's words, painted on its board (the board fills the top 55% of the picture)
      ctx.save();
      ctx.fillStyle = '#3b2412';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = d.text;
      const size = Math.min(18, ((w * 0.78) / Math.max(...lines.map((l) => l.length))) * 1.75);
      ctx.font = `${Math.round(size)}px ${FONT_DISPLAY}`;
      const top = d.b - h;
      const mid = top + h * 0.28;
      lines.forEach((l, i) => ctx.fillText(l, d.x, mid + (i - (lines.length - 1) / 2) * size * 1.15));
      ctx.restore();
    }
  }
}

/** part of a piece: the box (sx, sy, sw, sh) of its picture, in the picture's own pixels, drawn into (x, y, w, h) */
function blitPart(ctx: CanvasRenderingContext2D, n: W2Piece, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number, flip = false) {
  const f = W2_FRAMES[n];
  ctx.save();
  if (flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    ctx.drawImage(img!, f.x + sx, f.y + sy, sw, sh, 0, 0, w, h);
  } else ctx.drawImage(img!, f.x + sx, f.y + sy, sw, sh, x, y, w, h);
  ctx.restore();
}

/**
 * a rope-swing frame over the water (2-7): Matt's frame, its two posts standing in the river and its beam across the top, built to the
 * size the swing needs (the beam at `top`, the posts down to `bottom`, `w` between the posts' outer edges). The vine hangs from the middle
 * of the beam; the painting's own two thin ropes are left out (the vine is the rope).
 */
export function drawSwingFrame(ctx: CanvasRenderingContext2D, cx: number, top: number, bottom: number, w: number) {
  if (!riverArtReady()) return;
  const k = w / 340;
  const postW = 62 * k;
  const beamH = 70 * k;
  // the posts (left and right), from just under the beam's top to the water
  blitPart(ctx, 'swingFrame', 18, 60, 62, 280, cx - w / 2, top + beamH * 0.4, postW, bottom - top - beamH * 0.4);
  blitPart(ctx, 'swingFrame', 287, 60, 62, 280, cx + w / 2 - postW, top + beamH * 0.4, postW, bottom - top - beamH * 0.4);
  // the beam with its lashed ends, the full width (the rope knots in the middle stay: the vine hangs there)
  blitPart(ctx, 'swingFrame', 0, 10, 380, 70, cx - (w * 380) / 340 / 2, top - beamH * 0.35, (w * 380) / 340, beamH);
}

/**
 * The rope-and-basket lift (2-7), drawn from Matt's lift painting: the crane (post, arm and pulley) stands fixed on the upper ground
 * beside the shaft, the rope runs from the pulley down to the basket wherever it is, and the sack of stones on the other rope rises as
 * the basket sinks. `p` is the basket's platform (its floor is p.y), `postRight`: the crane stands on the right of the shaft.
 */
export function drawW2Lift(ctx: CanvasRenderingContext2D, p: Platform, postRight: boolean): boolean {
  if (!riverArtReady() || !p.lift) return false;
  // the basket in the painting is 66 px across (x 112..178) with its rim at y 300; the rope comes down at x 145
  const k = p.width / 66;
  const cx = p.x + p.width / 2;
  const top = p.lift.top;
  const s = postRight ? -1 : 1;
  // the crane: the painting's top 150 px, its post's foot on the upper ground (the basket's top stop), its rope over the shaft
  const craneX = cx - s * 145 * k;
  const craneTop = top - 145 * k;
  const pulleyX = cx - s * (145 - 127) * k;
  const pulleyY = craneTop + 77 * k;
  // the counterweight's rope (the pulley's other side) and the sack: high when the basket is low
  const sackX = pulleyX - s * 21 * k;
  const travel = p.lift.bottom - top;
  const sackY = pulleyY + 40 * k + travel - (p.y - top);
  ctx.save();
  ctx.strokeStyle = '#6b4a2b';
  ctx.lineCap = 'round';
  ctx.lineWidth = Math.max(2, 3.2 * k);
  ctx.beginPath();
  ctx.moveTo(pulleyX + s * 20 * k, pulleyY);
  ctx.lineTo(cx, p.y - 57 * k);
  ctx.moveTo(sackX, pulleyY);
  ctx.lineTo(sackX, sackY);
  ctx.stroke();
  ctx.restore();
  // the sack of stones (x 40..100, y 270..378 in the painting)
  blitPart(ctx, 'lift', 40, 270, 60, 108, sackX - 30 * k, sackY - 10 * k, 60 * k, 108 * k, postRight);
  // the crane in front of the ropes' tops
  blitPart(ctx, 'lift', 0, 0, 181, 150, postRight ? craneX - 181 * k : craneX, craneTop, 181 * k, 150 * k, postRight);
  // the basket with its hook and handle (x 108..181, y 255..345): its rim on the platform's floor
  // (the rim a little above his feet, so he stands in the basket, not on its edge)
  blitPart(ctx, 'lift', 108, 255, 73, 90, cx - (145 - 108) * k, p.y - 57 * k, 73 * k, 90 * k);
  return true;
}

/**
 * a ripple where the next log will slide out from under the bank (the logs used to appear with no warning: a tester could not see them
 * coming, 2026-10-24). Grows over the last second before the log shows.
 */
export function drawLogComing(ctx: CanvasRenderingContext2D, x: number, surfaceY: number, k: number, t: number) {
  ctx.save();
  ctx.globalAlpha = 0.25 + 0.55 * k;
  ctx.strokeStyle = '#eafcff';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    const r = 10 + i * 9 + ((t * 26) % 9) + k * 8;
    ctx.beginPath();
    ctx.ellipse(x, surfaceY + 2, r, r * 0.28, 0, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.restore();
}

/** the little ones' pictures: sad in the cage, happy when freed */
const CRITTER: Record<'capy' | 'duck' | 'otter', { sad: W2Piece; happy: W2Piece }> = {
  capy: { sad: 'capySad', happy: 'capyHappy' },
  duck: { sad: 'duckSad', happy: 'duckHappy' },
  otter: { sad: 'otterSad', happy: 'otterHappy' },
};

/** how long a freed little one takes to hop away home (s) */
export const FREED_HOP = 2.4;

/**
 * A reed cage with a little one inside: whole, cracked after the first blow, burst open when freed. Once free the little one hops away
 * along the bank, three happy hops, and is gone. The cage's middle is (c.x, c.y), its floor 26 below (the blow's box, engine.ts).
 */
export function drawW2Cage(
  ctx: CanvasRenderingContext2D,
  c: {
    x: number;
    y: number;
    cageHp?: number;
    collected: boolean;
    critter?: 'capy' | 'duck' | 'otter' | 'eaglet';
    freedAt?: number;
  },
  t: number,
  /** a cage hanging from a pulley (2-3, 2-8: the puzzle kit draws its cage, puzzlePlay.ts): only the little one in it, and its hop home */
  bare = false,
): boolean {
  if (!riverArtReady() || !c.critter || c.critter === 'eaglet') return false;
  const floor = c.y + 26;
  const pics = CRITTER[c.critter];
  const since = c.freedAt !== undefined ? t - c.freedAt : -1;
  if (c.collected && since > FREED_HOP + 1.5) return true;
  // the little one sits inside, the bars in front of it
  if (!c.collected) {
    const shiver = Math.sin(t * 9) * 0.6;
    drawW2Piece(ctx, pics.sad, c.x + shiver, floor - 4, 44);
    if (bare) return true;
    // (until Matt's redrawn set arrives the dome cage stands in for the whole one too: the first sheet's whole cage was a solid bundle
    // that hid the little one. Cracked, it shakes.)
    const hurt = (c.cageHp ?? 2) < 2;
    drawW2Piece(ctx, 'cageB', c.x + (hurt ? Math.sin(t * 30) * 1.2 : 0), floor + 2, 84);
    return true;
  }
  // the burst cage stays where it was, fading away
  if (!bare) {
    ctx.save();
    ctx.globalAlpha *= Math.max(0, 1 - Math.max(0, since - FREED_HOP) / 1.5);
    drawW2Piece(ctx, 'cageC', c.x, floor + 2, 92);
    ctx.restore();
  }
  if (since <= FREED_HOP) {
    // three hops away from the cage, getting smaller as it runs home into the reeds
    const u = since / FREED_HOP;
    const hop = Math.abs(Math.sin(u * Math.PI * 3)) * 26;
    const fade = u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1;
    ctx.save();
    ctx.globalAlpha *= fade;
    drawW2Piece(ctx, pics.happy, c.x + u * 150, floor - 4 - hop, 50);
    ctx.restore();
  }
  return true;
}

/**
 * A village ladder up the bank (2-6): Matt's lashed-pole ladder repeated from the porch below up past the porch above, standing where
 * the climb is (the engine climbs it like a trunk). False until the sheet has loaded.
 */
export function drawLadder(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number): boolean {
  if (!riverArtReady()) return false;
  const f = W2_FRAMES.ladder;
  const w = 50;
  const h = (w * f.h) / f.w;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x - w, top - 26, w * 2, bottom - top + 34);
  ctx.clip();
  for (let y = bottom + 8 - h; y > top - 26 - h; y -= h - 6) blit(ctx, 'ladder', x - w / 2, y, w, h);
  ctx.restore();
  return true;
}
