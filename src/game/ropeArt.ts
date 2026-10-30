import type { Rope } from './types.ts';
import { ropeYAt } from './rope.ts';
import { trackAtlas } from './atlasLoader.ts';
import { ROPE_KIT } from './ropeKitData.ts';

/**
 * Draws shimmy ropes in painted art (Matt, 2026-10-28: the stroked rope with its dashed twist and the gradient posts with yellow
 * lashings were "awful"; major looks are painted). The rope is World 2's painted twisted rope laid along the rope's sag in short
 * slices, so the twist follows the curve; the posts are the painted pole of World 2's rope-swing frame, its X lashing where the rope
 * is tied on (rope-kit.webp, tools/art/rope/pack_kit.py). Under Pokey's weight the rope gives: a taut rope with a load on it bends
 * to a V at the load, deepest when he is in the middle (ropeDip). Only the drawing gives; the rope's physics (rope.ts) is unchanged,
 * and his hands are drawn on the rope where it is drawn (heroRope.ts, PlayerState.hangDip).
 */

export const ROPE_KIT_URL = new URL('../assets/props/rope-kit.webp', import.meta.url).href;
let img: HTMLImageElement | null = null;
let ready = false;
function load() {
  if (img || typeof Image === 'undefined') return;
  const im = new Image();
  img = im;
  trackAtlas(im, ROPE_KIT_URL, () => { ready = true; }, () => { img = null; });
}
/** start loading the rope's painted pieces (a stage with ropes asks as it starts: sheetWarm.ts) */
export function warmRopeKit() {
  load();
}

/** how thick the painted rope is drawn (world units) */
export const ROPE_THICK = 9;
/** how far the rope gives under Pokey's weight at the middle of a crossing (world units); less towards the posts */
export const ROPE_DIP = 10;
/** how wide a painted post is drawn (its pole, world units) */
const POST_W = 15;
/** the slice length the rope is laid in (world units): short enough that the sag reads as a smooth curve */
const SLICE = 8;

/**
 * How much further down the rope is drawn at x, with Pokey's hands at `at` and his weight on it by `amt` (0..1): a V from post to post
 * through his hands, its depth largest mid-span (a load on a taut line sags as t(1-t) of the way along it).
 */
export function ropeDip(r: Pick<Rope, 'x0' | 'x1'>, x: number, at: number, amt: number): number {
  if (amt <= 0) return 0;
  const span = Math.max(1, r.x1 - r.x0);
  const a = Math.max(r.x0, Math.min(r.x1, at));
  const t = (a - r.x0) / span;
  const depth = amt * ROPE_DIP * 4 * t * (1 - t);
  if (x <= r.x0 || x >= r.x1) return 0;
  return x <= a ? (depth * (x - r.x0)) / Math.max(1, a - r.x0) : (depth * (r.x1 - x)) / Math.max(1, r.x1 - a);
}

/** where the rope is drawn at x: its sag (rope.ts) and the give under him */
export function ropeDrawY(r: Rope, x: number, dip?: RopeLoad): number {
  return ropeYAt(r, x) + (dip && dip.id === r.id ? ropeDip(r, x, dip.x, dip.amt) : 0);
}

/** Pokey's weight on a rope: which rope, where his hands are, how much of his weight it has taken (eases in as he grabs, out as he lets go) */
export interface RopeLoad {
  id: number;
  x: number;
  amt: number;
}

/** the painted rope laid through `pts` (a polyline), its twist running on along the length */
function layRope(ctx: CanvasRenderingContext2D, im: CanvasImageSource, pts: ArrayLike<readonly [number, number]>, thick = ROPE_THICK, src = ROPE_KIT.tile) {
  const t = src;
  const k = thick / t.thick;
  const tileLen = t.w * k;
  // Only the slices on screen are drawn (PERFORMANCE-RULES.md §2.5): a stage's ropes are hundreds of 8-unit slices, nearly all of them
  // off screen, each one a drawImage and a save/restore (perf-sprites, 2026-10-30: 683 draws a frame in 1-4, 98% off screen). Each
  // slice's turn is set straight on the transform the rope started with, instead of a save/translate/rotate/restore around it.
  const m = ctx.getTransform();
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const pad = thick * Math.hypot(m.a, m.b) * 2 + 2;
  let u = 0; // how far along the rope (world units), for the twist
  let turned = false;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const len = Math.hypot(bx - ax, by - ay);
    if (len < 0.01) continue;
    const pax = m.a * ax + m.c * ay + m.e;
    const pay = m.b * ax + m.d * ay + m.f;
    const pbx = m.a * bx + m.c * by + m.e;
    const pby = m.b * bx + m.d * by + m.f;
    if (Math.max(pax, pbx) < -pad || Math.min(pax, pbx) > W + pad || Math.max(pay, pby) < -pad || Math.min(pay, pby) > H + pad) {
      u += len;
      continue;
    }
    const cs = (bx - ax) / len;
    const sn = (by - ay) / len;
    ctx.setTransform(m.a * cs + m.c * sn, m.b * cs + m.d * sn, m.c * cs - m.a * sn, m.d * cs - m.b * sn, pax, pay);
    turned = true;
    // one slice may run past the end of the tile: then it is drawn in two parts, the second from the tile's start
    let done = 0;
    while (done < len - 0.001) {
      const at = (u + done) % tileLen;
      const part = Math.min(len - done, tileLen - at);
      // (a hair of overlap into the next slice so no seam shows where the slices meet at an angle)
      const over = done + part >= len - 0.001 ? 0.6 : 0;
      ctx.drawImage(im, t.x + at / k, t.y, part / k, t.h, done, -t.mid * k, part + over, t.h * k);
      done += part;
    }
    u += len;
  }
  if (turned) ctx.setTransform(m);
}

/** a painted post: its lashing's middle at the rope (tieY), the pole down to the ground (a little into it) */
function paintedPost(ctx: CanvasRenderingContext2D, im: HTMLImageElement, x: number, ground: number, tieY: number) {
  const f = ROPE_KIT.post;
  const k = POST_W / (f.poleR - f.poleL);
  const w = f.w * k;
  const left = x - ((f.poleL + f.poleR) / 2) * k;
  const top = tieY - f.tie * k;
  // a soft contact shadow where the pole goes into the ground
  ctx.fillStyle = 'rgba(20, 14, 6, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x, ground + 2, POST_W * 0.9, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // the cap and the lashing keep their shape; the pole below them is cut to length, or stretched where the rope is hung higher
  const headRows = 72;
  const headH = headRows * k;
  const shaftH = Math.max(4, ground + 6 - (top + headH));
  const shaftRows = Math.min(f.h - headRows, shaftH / k);
  ctx.drawImage(im, f.x, f.y, f.w, headRows, left, top, w, headH + 0.5);
  ctx.drawImage(im, f.x, f.y + headRows, f.w, shaftRows, left, top + headH, w, shaftH);
}

/** the points a stage rope is laid through, kept from frame to frame (no new arrays per frame: PERFORMANCE-RULES.md §3.1) */
const ropePts: Array<[number, number]> = [];
const ptPool: Array<[number, number]> = [];
function pt(i: number, x: number, y: number): [number, number] {
  const p = ptPool[i] ?? (ptPool[i] = [0, 0]);
  p[0] = x;
  p[1] = y;
  return p;
}

export function drawRopes(
  ctx: CanvasRenderingContext2D,
  ropes: Rope[],
  _time: number,
  opts: { load?: RopeLoad },
) {
  load();
  const im = ready ? img : null;
  // (a rope wholly off screen to the side is skipped; its posts too: PERFORMANCE-RULES.md §2.5)
  const m = ctx.getTransform();
  const flat = m.b === 0 && m.c === 0 && m.a > 0;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  for (const r of ropes) {
    if (flat && (m.a * (r.x1 + POST_W * 3) + m.e < 0 || m.a * (r.x0 - POST_W * 3) + m.e > W)) continue;
    // (or wholly above or below it: the post caps reach a little over the tie, the poles down to the ground)
    if (flat && m.d > 0 && (m.d * (Math.max(r.g0, r.g1) + 20) + m.f < 0 || m.d * (r.y - 80) + m.f > H)) continue;
    // the rope is only a rope to someone who has learned the skill; before that it is still drawn (it is part of the jungle)
    const n = Math.max(2, Math.ceil((r.x1 - r.x0) / SLICE));
    const pts = ropePts;
    pts.length = 0;
    for (let i = 0; i <= n; i++) {
      const x = r.x0 + ((r.x1 - r.x0) * i) / n;
      pts.push(pt(i, x, ropeDrawY(r, x, opts.load)));
    }
    // (his hands are a point on the rope: a slice ends exactly there, so the V's corner is sharp under them)
    const ld = opts.load;
    if (ld && ld.id === r.id && ld.amt > 0 && ld.x > r.x0 && ld.x < r.x1) {
      const i = pts.findIndex(([x]) => x > ld.x);
      if (i > 0) pts.splice(i, 0, [ld.x, ropeDrawY(r, ld.x, ld)]);
    }
    if (im) {
      layRope(ctx, im, pts);
      // (a post off to the side of the screen is skipped)
      const postOn = (x: number) => !flat || (m.a * (x + POST_W * 3) + m.e >= 0 && m.a * (x - POST_W * 3) + m.e <= W);
      if (postOn(r.x0)) paintedPost(ctx, im, r.x0, r.g0, r.y);
      if (postOn(r.x1)) paintedPost(ctx, im, r.x1, r.g1, r.y);
    } else {
      // (the painted pieces are still on their way: a plain rope for a moment, so it never vanishes)
      ctx.strokeStyle = '#9a7656';
      ctx.lineWidth = ROPE_THICK * 0.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
  }
}

/** the rope's tile re-coloured once per tint (multiplied by `tint`, its own alpha kept): silk, glowing vine, jungle liana */
const tinted = new Map<string, HTMLCanvasElement>();
function tintedTile(im: HTMLImageElement, tint: string): HTMLCanvasElement | null {
  let c = tinted.get(tint);
  if (c) return c;
  if (typeof document === 'undefined') return null;
  const t = ROPE_KIT.tile;
  c = document.createElement('canvas');
  c.width = t.w;
  c.height = t.h;
  const g = c.getContext('2d');
  if (!g) return null;
  g.drawImage(im, t.x, t.y, t.w, t.h, 0, 0, t.w, t.h);
  g.globalCompositeOperation = 'multiply';
  g.fillStyle = tint;
  g.fillRect(0, 0, t.w, t.h);
  g.globalCompositeOperation = 'destination-in';
  g.drawImage(im, t.x, t.y, t.w, t.h, 0, 0, t.w, t.h);
  tinted.set(tint, c);
  return c;
}

/**
 * A lair's rope or vine along its own curve `at(u)` (u 0..1, N slices), in the painted rope: World 2's twisted rope as it is, or
 * multiplied by `tint` (pale lilac silk, green vine). While the pieces load it is a plain line of `fallback`, so it never vanishes.
 */
export function drawLairRope(
  ctx: CanvasRenderingContext2D,
  at: (u: number) => { x: number; y: number },
  N: number,
  thick: number,
  tint: string | null,
  fallback: string,
) {
  load();
  const pts: Array<[number, number]> = [];
  for (let i = 0; i <= N; i++) {
    const p = at(i / N);
    pts.push([p.x, p.y]);
  }
  const src = ready && img ? (tint ? tintedTile(img, tint) : img) : null;
  if (src) {
    const t = ROPE_KIT.tile;
    layRope(ctx, src, pts, thick, tint ? { ...t, x: 0, y: 0 } : t);
    return;
  }
  ctx.save();
  ctx.strokeStyle = fallback;
  ctx.lineWidth = thick * 0.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  ctx.restore();
}

/** a straight lair rope from (x0, y0) to (x1, y1), in the painted rope (see drawLairRope) */
export function drawLairRopeLine(ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, thick: number, tint: string | null, fallback: string) {
  const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 40));
  drawLairRope(ctx, (u) => ({ x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u }), n, thick, tint, fallback);
}

/** the painted rope along a curve of the caller's (the journal's shimmy demo); false until the pieces have loaded */
export function drawRopeAlong(ctx: CanvasRenderingContext2D, pts: Array<[number, number]>): boolean {
  load();
  if (!ready || !img) return false;
  layRope(ctx, img, pts);
  return true;
}
