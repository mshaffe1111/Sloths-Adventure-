/**
 * w7TempleArt — World 7's old temple stone and its lianas, from the Hugging Face set (lead review 2026-10-29, src/assets/w7):
 *   temple-walls.webp   four carved wall strips 220 x 900, each repeating top to bottom, any two side by side. They face every high
 *                       ledge (a run of banks standing HIGH_LEDGE px or more over the floor beside it) in place of the plain stacked
 *                       bricks, on one grid through the stage (stripAt): never the same strip twice side by side, the carved sloth face
 *                       (wall-3) at most once a wall and never again down its own column, and wall-4 (its root runs off both its edges)
 *                       only on a lone bank one strip wide.
 *   vine-anchors.webp   four stone lintels each with a knotted liana (300 x 220: ax, ay where the liana leaves the frame), each with its
 *                       own liana as a repeating run (liana-a1..a4), and six spare brown runs (liana-1..6). A swinging liana hangs from a
 *                       lintel on its own run, in place of the leafy clump; the brown vines down the old walls are the spare runs.
 * Pictures only: nothing here is solid. Every draw returns false (or does nothing) until both sheets have loaded.
 */
import { trackAtlas } from './atlasLoader.ts';
import type { Platform } from './types.ts';

export const W7_TEMPLE_URLS = [new URL('../assets/w7/temple-walls.webp', import.meta.url).href, new URL('../assets/w7/vine-anchors.webp', import.meta.url).href] as const;
type F = { x: number; y: number; w: number; h: number; ax?: number; ay?: number };
/** temple-walls.json */
const WALLS: readonly F[] = [
  { x: 0, y: 0, w: 220, h: 900 },
  { x: 224, y: 0, w: 220, h: 900 },
  { x: 448, y: 0, w: 220, h: 900 },
  { x: 672, y: 0, w: 220, h: 900 },
];
/** the carved sloth face, and the strip whose root runs off both its edges (temple-walls.webp) */
const FACE = 2;
const ROOTED = 3;
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
  const run = runOf(p, banks);
  const a = run[0], z = run[run.length - 1];
  const left = banks.filter((q) => !run.includes(q) && q.x + q.width <= a.x + 2 && q.x + q.width > a.x - 400).sort((u, v) => v.x - u.x)[0];
  const right = banks.filter((q) => !run.includes(q) && q.x >= z.x + z.width - 2 && q.x < z.x + z.width + 400).sort((u, v) => u.x - v.x)[0];
  return [left, right].some((q) => q && q.y - p.y >= HIGH_LEDGE);
}

/**
 * The strip of wall column n (columns of COL px on a grid through the whole stage, so touching banks are one wall), and whether it is
 * mirrored: the odd columns wall-2, the even ones wall-1, each mirrored by its spot, and the carved sloth face (wall-3) on an even column
 * a FACE_EVERY'th of the time, so it never shows twice on a wall a phone screen wide or stands beside itself. Exported for its test.
 */
export function stripAt(n: number): { s: number; flip: boolean } {
  const h = hash01(n, 17);
  const s = n % 2 !== 0 ? 1 : n % FACE_EVERY === 0 && h < 0.6 ? FACE : 0;
  return { s, flip: hash01(n, 29) < 0.5 };
}
/** the wall columns' width, and how many columns apart the sloth face can come */
const COL = 220;
const FACE_EVERY = 8;

/**
 * a high ledge's face, from under its top band down to `bottom`, between view.x0 and view.x1; `alone`: no other bank touches it (a lone
 * ledge one strip wide carries wall-4, whose root runs off both its edges)
 */
export function drawW7TempleWall(ctx: CanvasRenderingContext2D, p: Platform, bottom: number, view?: { x0: number; x1: number }, alone = false): boolean {
  if (!w7TempleReady()) return false;
  const top = p.y + WALL_TOP;
  if (bottom <= top) return true;
  const img = imgs[0]!;
  ctx.save();
  ctx.beginPath();
  ctx.rect(p.x, top, p.width, bottom - top + 2);
  ctx.clip();
  const lone = alone && p.width <= COL + 20;
  const n0 = Math.floor(p.x / COL), n1 = Math.floor((p.x + p.width - 1) / COL);
  for (let n = n0; n <= n1; n++) {
    const x = lone ? p.x + p.width / 2 - COL / 2 : n * COL;
    if (view && (x > view.x1 + 20 || x + COL < view.x0 - 20)) continue;
    const { s, flip } = lone ? { s: ROOTED, flip: hash01(n, 29) < 0.5 } : stripAt(n);
    // (each column at its own height in its strip, so the joints don't run in one line across the wall; that height is the world's, not
    // the bank's, so a column shared by two banks of a run, their tops a step apart, carries on unbroken)
    const phase = Math.floor(hash01(n, 23) * 898);
    for (let k = 0, y = top - ((((top - phase) % 898) + 898) % 898); y < bottom; k++, y += 898) {
      // (the sloth face once: below its first repeat its column carries wall-1)
      const f = WALLS[s === FACE && k > 0 ? 0 : s];
      ctx.save();
      ctx.translate(x + COL / 2, y);
      if (flip) ctx.scale(-1, 1);
      ctx.drawImage(img, f.x, f.y, f.w, f.h, -COL / 2, 0, COL, 900);
      ctx.restore();
    }
    if (lone) break;
  }
  ctx.restore();
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
