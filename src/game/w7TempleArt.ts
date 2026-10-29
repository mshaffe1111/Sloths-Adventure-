/**
 * w7TempleArt — World 7's old temple stone and its lianas, from the Hugging Face set (lead review 2026-10-29, src/assets/w7):
 *   temple-run.webp     the temple wall as one wide built wall (2048 x 1024, its courses level all the way across), in three variants
 *                       sharing their edges, made on Hugging Face from the kit's own strips (the lead's round-5 review: strips butted
 *                       side by side showed hard joins however they were cross-faded). It faces every high ledge (a run of banks
 *                       standing HIGH_LEDGE px or more over the floor beside it), repeating left to right on the world's grid and hung
 *                       from its run's top, so a run is one wall; it ends a little under the floor beside it, fading into the soil.
 *   vine-anchors.webp   four stone lintels each with a knotted liana (300 x 220: ax, ay where the liana leaves the frame), each with its
 *                       own liana as a repeating run (liana-a1..a4), and six spare brown runs (liana-1..6). A swinging liana hangs from a
 *                       lintel on its own run, in place of the leafy clump; the brown vines down the old walls are the spare runs.
 * Pictures only: nothing here is solid. Every draw returns false (or does nothing) until both sheets have loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import { drawSoil } from './groundPaint.ts';
import type { Platform } from './types.ts';

export const W7_TEMPLE_URLS = [new URL('../assets/w7/temple-run.webp', import.meta.url).href, new URL('../assets/w7/vine-anchors.webp', import.meta.url).href] as const;
type F = { x: number; y: number; w: number; h: number; ax?: number; ay?: number };
/**
 * temple-run.webp (hfb-w7wallrun, tools/art/hfbatch/make_wallrun.py): the temple wall as one wide built wall, RUN_W x RUN_H, its
 * courses level all the way across, in three variants that share their left and right edges, so any of them repeats next to any other
 * with no join
 */
const RUN: readonly F[] = [{x: 0, y: 0, w: 2048, h: 1024}, {x: 0, y: 1024, w: 2048, h: 1024}];
const RUN_W = 2048;
const RUN_H = 1024;
/** vine-anchors.json: each lintel and its own liana run */
const ANCHORS: ReadonlyArray<{ a: F; run: F }> = [
  { a: { x: 0, y: 0, w: 300, h: 220, ax: 251.3, ay: 220 }, run: { x: 304, y: 0, w: 68, h: 42, ax: 33.9 } },
  { a: { x: 376, y: 0, w: 300, h: 220, ax: 105.6, ay: 220 }, run: { x: 680, y: 0, w: 71, h: 37, ax: 35.5 } },
  { a: { x: 755, y: 0, w: 300, h: 220, ax: 256.5, ay: 220 }, run: { x: 1059, y: 0, w: 71, h: 50, ax: 35.3 } },
  { a: { x: 1134, y: 0, w: 300, h: 220, ax: 90.8, ay: 220 }, run: { x: 1438, y: 0, w: 64, h: 43, ax: 32.2 } },
];
/** the spare brown runs (liana-1..6), 527 tall, each repeating; stem: the vine's width in the frame */
const RUNS: ReadonlyArray<F & { stem: number }> = [
  { x: 1506, y: 0, w: 64, h: 527, ax: 28.5, stem: 31 },
  { x: 1574, y: 0, w: 86, h: 527, ax: 45, stem: 44 },
  { x: 1664, y: 0, w: 71, h: 527, ax: 29, stem: 50 },
  { x: 1739, y: 0, w: 80, h: 527, ax: 45.5, stem: 67 },
  { x: 1823, y: 0, w: 50, h: 527, ax: 27, stem: 28 },
  { x: 1877, y: 0, w: 76, h: 527, ax: 43, stem: 38 },
];
/** a bank this much over the floor beside it is a high ledge, faced with temple wall */
export const HIGH_LEDGE = 90;
/** how far under a bank's top its wall starts (under the painted top band) */
const WALL_TOP = 30;
/** a swinging liana's lintel and run drawn at this scale (its rope about 17 px across, near the kit's 15) */
const ANCHOR_K = 0.72;
/** a wall vine's stem across (px), and how far its foot thins away */
const VINE_STEM = 14;
const FADE = 36;

const imgs: Array<HTMLImageElement | null> = [null, null];
const ready = [false, false];
function load(i: number) {
  if (imgs[i] || typeof Image === 'undefined') return;
  const im = new Image();
  imgs[i] = im;
  trackAtlas(
    im,
    W7_TEMPLE_URLS[i],
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
export function w7TempleReady(): boolean {
  load(0);
  load(1);
  return ready[0] && ready[1];
}

const hash01 = (x: number, salt: number): number => {
  const s = Math.sin(x * 12.9898 + salt * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/** the run of banks touching edge to edge that p stands in, left to right, each a step of under HIGH_LEDGE from the next */
function runOf(p: Platform, banks: readonly Platform[]): Platform[] {
  const run = [p];
  const step = (a: Platform, b: Platform) => Math.abs(a.y - b.y) < HIGH_LEDGE;
  for (let q: Platform | undefined = p; (q = banks.find((o) => Math.abs(o.x + o.width - run[0].x) < 2 && step(o, run[0]))); ) run.unshift(q);
  for (let q: Platform | undefined = p; (q = banks.find((o) => Math.abs(run[run.length - 1].x + run[run.length - 1].width - o.x) < 2 && step(o, run[run.length - 1]))); ) run.push(q);
  return run;
}

/**
 * is p a high ledge: the run of touching banks it stands in rises HIGH_LEDGE px or more over the floor beside it (the bank touching
 * the run's end, or across a gap of up to 400 px), so a wall's top steps (the plinths, 30 to 40 px apart) are all one wall
 */
export function isHighLedge(p: Platform, banks: readonly Platform[]): boolean {
  return highLedgeFoot(p, banks) !== undefined;
}
/** a high ledge's foot: the top of the highest floor beside its run that it stands HIGH_LEDGE px or more over (undefined: not one) */
export function highLedgeFoot(p: Platform, banks: readonly Platform[]): number | undefined {
  return highLedge(p, banks)?.foot;
}
/** a high ledge's foot, and the top of its run's highest bank (where its wall hangs from) */
export function highLedge(p: Platform, banks: readonly Platform[]): { foot: number; runTop: number } | undefined {
  const run = runOf(p, banks);
  const a = run[0], z = run[run.length - 1];
  const left = banks.filter((q) => !run.includes(q) && q.x + q.width <= a.x + 2 && q.x + q.width > a.x - 400).sort((u, v) => v.x - u.x)[0];
  const right = banks.filter((q) => !run.includes(q) && q.x >= z.x + z.width - 2 && q.x < z.x + z.width + 400).sort((u, v) => u.x - v.x)[0];
  const feet = [left, right].filter((q): q is Platform => !!q && q.y - p.y >= HIGH_LEDGE).map((q) => q.y);
  return feet.length ? { foot: Math.min(...feet), runTop: Math.min(...run.map((q) => q.y)) } : undefined;
}

/** a high ledge's wall runs this far under the floor beside it, the soil coming back over its last FOOT_FADE px */
const FOOT_DEEP = 150;
const FOOT_FADE = 110;
/** how wide the soil wraps round a high ledge's corner (px), give or take its wobble */
const WRAP_W = 26;

/**
 * a high ledge's face, from under its top band down to `bottom` (or to FOOT_DEEP under the floor beside it, `foot`), between view.x0
 * and view.x1: the composed temple wall laid on the world's grid, so every bank of a run shows one wall and its courses carry on from
 * bank to bank
 */
export function drawW7TempleWall(
  ctx: CanvasRenderingContext2D, p: Platform, bottom: number, view?: { x0: number; x1: number; y0?: number }, foot?: number, viewBottom = bottom, runTop = p.y,
  wrap: { left?: boolean; right?: boolean } = {},
): boolean {
  if (!w7TempleReady()) return false;
  const img = imgs[0]!;
  const top = p.y + WALL_TOP;
  // (the wall stands from the ledge down to a little under the floor beside it, then the soil takes over: underground the ledge is the
  // same ground as the floor, with no straight seam between them down the screen)
  const end = foot === undefined ? bottom : Math.min(bottom, foot + FOOT_DEEP);
  if (end <= top) return true;
  // (to the bank's own edges: the painted end wraps the soil round its corner afterwards)
  const x0 = view ? Math.max(p.x, view.x0 - 20) : p.x, x1 = view ? Math.min(p.x + p.width, view.x1 + 20) : p.x + p.width;
  if (x1 <= x0) return true;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top, x1 - x0, end - top + 2);
  ctx.clip();
  // (one picture tall, hung from the run's top: every bank of a run, its tops a step apart, shows the same courses; across, the world's
  // repeat of RUN_W, each repeat one of the three variants by its place)
  const y0 = runTop + WALL_TOP;
  for (let tx = Math.floor(x0 / RUN_W) * RUN_W; tx < x1; tx += RUN_W) {
    const f = RUN[Math.floor(hash01(tx / RUN_W, 41) * RUN.length) % RUN.length];
    for (let ty = y0; ty < end; ty += RUN_H) ctx.drawImage(img, f.x, f.y, f.w, f.h, tx, ty, RUN_W + 0.5, RUN_H);
  }
  ctx.restore();
  // (where the ledge drops to a floor, the soil wraps round the wall's corner: a band of it down the stone's edge, its inner edge wobbling,
  // outlined thin and dark like the painted kit, never a ruler-straight cut)
  for (const right of [false, true]) {
    if (!(right ? wrap.right : wrap.left)) continue;
    const edge = right ? p.x + p.width : p.x, d = right ? -1 : 1;
    const pts: Array<[number, number]> = [];
    for (let y = p.y - 4; y <= end + 24; y += 24) pts.push([edge + d * (WRAP_W + 9 * Math.sin(y * 0.031 + edge) + 6 * Math.sin(y * 0.083 + edge * 0.7)), y]);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(edge, p.y - 4);
    for (const q of pts) ctx.lineTo(q[0], q[1]);
    ctx.lineTo(edge, end + 24);
    ctx.closePath();
    ctx.clip();
    drawSoil(ctx, 7, Math.min(edge, edge + d * (WRAP_W + 16)), Math.max(edge, edge + d * (WRAP_W + 16)), p.y - 4, end + 24, viewBottom, view?.y0);
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = 'rgba(22, 18, 12, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    pts.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])));
    ctx.stroke();
    ctx.restore();
  }
  // (the soil comes back over the wall's last FOOT_FADE px, in steps of rising strength)
  if (end < bottom) {
    // (the last step at full strength, overlapping the wall's end by a few px: no trace of the wall below it)
    const N = 10, h = FOOT_FADE / N;
    for (let i = 0; i < N; i++) {
      const a = end - FOOT_FADE + i * h;
      ctx.save();
      ctx.globalAlpha = (i + 1) / N;
      ctx.beginPath();
      ctx.rect(x0, a, x1 - x0, i === N - 1 ? h + 6 : h + 0.5);
      ctx.clip();
      drawSoil(ctx, 7, x0, x1, a, a + h + 7, viewBottom, view?.y0);
      ctx.restore();
    }
  }
  return true;
}

/**
 * A swinging liana hung from a stone lintel: the lintel fixed at its top (the liana leaves it at (x, topY)), the anchor's own liana run
 * repeated down the vine's length, turned with the vine by `ang`. False until the sheets have loaded.
 */
export function drawW7SwingLiana(ctx: CanvasRenderingContext2D, v: { x: number; topY: number; bottomY: number; id: number }, ang: number): boolean {
  if (!w7TempleReady()) return false;
  const img = imgs[1]!;
  const { a, run } = ANCHORS[Math.abs(v.id) % ANCHORS.length];
  const len = v.bottomY - v.topY;
  const rw = run.w * ANCHOR_K;
  const rh = run.h * ANCHOR_K;
  ctx.save();
  ctx.translate(v.x, v.topY);
  ctx.rotate(-ang);
  ctx.beginPath();
  ctx.rect(-rw, -4, rw * 2, len + 4);
  ctx.clip();
  // (each repeat overlaps the next by a pixel so no seam shows)
  for (let y = -4; y < len; y += rh - 1) ctx.drawImage(img, run.x, run.y, run.w, run.h, -run.ax! * ANCHOR_K, y, rw, rh);
  ctx.restore();
  // the lintel over the top, not turning: its knot hides where the run starts
  ctx.drawImage(img, a.x, a.y, a.w, a.h, v.x - a.ax! * ANCHOR_K, v.topY - a.ay! * ANCHOR_K + 6, a.w * ANCHOR_K, a.h * ANCHOR_K);
  return true;
}

/** three of the spare brown runs hanging from a wall's lip down its face to the floor, each its own run */
export function drawW7WallVines(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number): boolean {
  if (!w7TempleReady()) return false;
  const img = imgs[1]!;
  // (each a vine's stem VINE_STEM px across, spread over the wall's edge; each down to its foot, where it thins away over its last
  // FADE px rather than stopping in a cut)
  for (const [i, dx, len] of [[0, 12, 1], [1, 40, 0.9], [2, 66, 0.8]] as const) {
    const f = RUNS[(Math.abs(Math.round(x)) + i * 2) % RUNS.length];
    const k = VINE_STEM / f.stem!;
    const w = f.w * k, fh = f.h * k;
    const y0 = top - 8;
    const end = y0 + (bottom - y0) * len;
    const run = (from: number, to: number) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x + dx - w, from, w * 2, to - from);
      ctx.clip();
      for (let y = y0; y < to; y += fh - 1) if (y + fh > from) ctx.drawImage(img, f.x, f.y, f.w, f.h, x + dx - f.ax! * k, y, w, fh);
      ctx.restore();
    };
    run(y0, end - FADE);
    for (let j = 0; j < 4; j++) {
      ctx.save();
      ctx.globalAlpha = 0.8 - j * 0.2;
      run(end - FADE + (j * FADE) / 4, end - FADE + ((j + 1) * FADE) / 4);
      ctx.restore();
    }
  }
  return true;
}
