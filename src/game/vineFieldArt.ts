/**
 * vineFieldArt — how a vine field draws (vineField.ts, R-165.177). STAND-INS until 1-4's own art (R-165.178), named plainly:
 *   - a field vine is World 1's painted vine (castArt.ts vineTile) hung straight from its top, a little curl at its free end (a plain
 *     green line while the sheet loads);
 *   - a fruit cluster is CODE-DRAWN: a bunch of small round orange-red wild figs on a stalk (circles; the story keeper's nature check,
 *     11-13: never purple grocery figs), no painted art yet;
 *   - a falling pod, its burst, a fig bunch and a shut gate's bough are ART's painted pieces (11-13, the inventory's hf1113/w14-*, sized
 *     by its pokey_scale against his drawn 89.1: pod 0.45, burst 0.34, figs 0.45, bough by its own walk line); the fluff's trickle is a
 *     small code touch (STAGE-RULES §4). The code-drawn shapes below draw only while a picture loads (named stand-ins).
 * Nothing allocates per frame (PERFORMANCE-RULES §3.1): the strand's points are a kept array.
 */
import type { Platform, Vine } from './types.ts';
import type { PodColumn, PodState } from './podfall.ts';
import { trackAtlas } from './atlasLoader.ts';

// ───────────────────────────── 1-4's painted pieces (ART 11-13, the inventory's hf1113/w14-*) ─────────────────────────────
/** his drawn height (heroSprite.ts; LESSONS D41): the inventory's pokey_scale is a share of it */
const POKEY_H = 89.1;
type Piece = { url: string; img: HTMLImageElement | null; ready: boolean };
const piece = (url: string): Piece => ({ url, img: null, ready: false });
const PIECES = {
  pod: piece(new URL('../assets/w1-1113/w14-kapokpod.webp', import.meta.url).href),
  burst: piece(new URL('../assets/w1-1113/w14-kapokpod-burst.webp', import.meta.url).href),
  figs: piece(new URL('../assets/w1-1113/w14-figcluster.webp', import.meta.url).href),
  bough: piece(new URL('../assets/w1-1113/w14-roughbough.webp', import.meta.url).href),
};
/** a piece's picture once loaded (starts the load; the phone taking it back reloads it: atlasLoader.ts) */
function pic(p: Piece): HTMLImageElement | null {
  if (!p.img && typeof Image !== 'undefined') {
    const im = new Image();
    p.img = im;
    trackAtlas(im, p.url, () => { p.ready = true; }, () => { p.img = null; }, () => { p.img = null; p.ready = false; });
  }
  return p.ready ? p.img : null;
}
/** drawn heights (px), the inventory's pokey_scale x his drawn height */
const POD_H = 0.45 * POKEY_H, BURST_H = 0.34 * POKEY_H, FIGS_H = 0.45 * POKEY_H;
/** the rough bough's picture: 707 x 180, his feet at 42 px down, walkable from 90 to 666 px across (the inventory row) */
const BOUGH = { w: 707, h: 180, walkY: 42, x0: 90, x1: 666 } as const;
import { vineTile } from './castArt.ts';
import { layRope } from './ropeArt.ts';
import type { VineCluster } from './vineField.ts';

/** a field vine's drawn thickness (px): thinner than the draped pair's liana (pairArt.ts 15), a vine a hand */
export const FIELD_THICK = 11;

const pts: Array<[number, number]> = [[0, 0], [0, 0], [0, 0], [0, 0]];

/** a field vine, top to its free end */
export function drawFieldVine(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number) {
  pts[0][0] = x; pts[0][1] = top - 6;
  pts[1][0] = x; pts[1][1] = bottom - 22;
  pts[2][0] = x + 4; pts[2][1] = bottom - 6;
  pts[3][0] = x + 10; pts[3][1] = bottom + 2;
  const v = vineTile();
  if (v) {
    layRope(ctx, v.src, pts, FIELD_THICK, v.tile);
    return;
  }
  ctx.strokeStyle = '#6f7d2f';
  ctx.lineWidth = FIELD_THICK * 0.8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < 4; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

/** the bunch's fruit, as offsets in a 1 x 1 box (x from the middle, y up from the bottom), and each one's radius */
const FRUIT: ReadonlyArray<readonly [number, number, number]> = [
  [0, 0.16, 0.17], [-0.24, 0.3, 0.16], [0.24, 0.3, 0.16], [-0.12, 0.52, 0.17], [0.13, 0.54, 0.17], [0, 0.74, 0.15],
];

/** the clusters still on screen: each on its vine's line, its bottom at `y` (stand-in: code-drawn) */
export function drawClusters(ctx: CanvasRenderingContext2D, clusters: readonly VineCluster[], vines: readonly Vine[], x0: number, x1: number) {
  for (const c of clusters) {
    if (c.gone) continue;
    let x = NaN;
    for (const v of vines) if (v.id === c.vine) x = v.x + (c.dx ?? 0);
    if (!(x > x0 - 80 && x < x1 + 80)) continue;
    const figs = pic(PIECES.figs);
    if (figs) {
      // (the bunch hangs from its stalk at the top: its bottom at c.y, its height the inventory's)
      const w = (FIGS_H * figs.width) / figs.height;
      ctx.drawImage(figs, x - w / 2, c.y - FIGS_H, w, FIGS_H);
      continue;
    }
    const h = c.h;
    // the stalk up to the vine
    ctx.strokeStyle = '#4d5a1e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, c.y - h);
    ctx.lineTo(x, c.y - h * 0.7);
    ctx.stroke();
    for (const [fx, fy, r] of FRUIT) {
      const cx = x + fx * h, cy = c.y - fy * h, rr = r * h;
      ctx.fillStyle = '#c94a24';
      ctx.strokeStyle = '#5a1d0c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255, 214, 170, 0.6)';
      ctx.beginPath();
      ctx.arc(cx - rr * 0.35, cy - rr * 0.35, rr * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    // a leaf over the stalk
    ctx.fillStyle = '#3f7d2a';
    ctx.beginPath();
    ctx.ellipse(x + h * 0.18, c.y - h * 0.86, h * 0.2, h * 0.08, -0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** a kapok pod (stand-in): an upright spindle `r` px across at its widest (drawn 1.5x its hit radius: a pod must read on a phone, and
 *  a drawing a little bigger than its hit is the forgiving side), a dark outline against the foliage, its seam, a stalk; `shake` rad */
function podShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, shake: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(shake);
  const im = pic(PIECES.pod);
  if (im) {
    // (the painted pod on its twig, its middle at (x, y), its height the inventory's scaled with r against the stand-in's)
    const h = POD_H * (r / POD_DRAW), w = (h * im.width) / im.height;
    ctx.drawImage(im, -w / 2, -h / 2, w, h);
    ctx.restore();
    return;
  }
  const w = r * 0.95, h = r * 1.9;
  ctx.fillStyle = '#b08a46';
  ctx.strokeStyle = '#2a1d0b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, w, h, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // its seam, and a pale split showing the fluff inside (a ripe pod)
  ctx.strokeStyle = '#5a4119';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.85);
  ctx.lineTo(0, h * 0.85);
  ctx.stroke();
  ctx.fillStyle = '#faf8ee';
  ctx.beginPath();
  ctx.ellipse(w * 0.32, h * 0.1, w * 0.22, h * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  // the stalk up to the bough
  ctx.strokeStyle = '#3e2c12';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, -h);
  ctx.lineTo(0, -h - 10);
  ctx.stroke();
  ctx.restore();
}

/** a fluff tuft (stand-in): a soft white puff with a faint grey rim, so it reads on sky and on leaves */
function fluff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  // (no colour string built per tuft: fixed fills and the alpha, PERFORMANCE-RULES §3.1)
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.fillStyle = '#8f8b7e';
  ctx.beginPath();
  ctx.arc(x, y + 1, r + 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffdf4';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/** the drawn pod's size (px across its widest, half): 1.5x the hit radius (podfall.ts POD.radius 14) */
const POD_DRAW = 21;

/**
 * A falling pod at its phase (podfall.ts podAt): hanging under the bough (idle), shaking with its fluff trickling down the column (the
 * tell: a stream of tufts that reaches further down the longer it runs, so on a short sideways view he sees fluff falling past him on
 * his own column), falling with fluff streaming off it, then a white burst on the wood (stand-in, code-drawn).
 */
export function drawPod(ctx: CanvasRenderingContext2D, p: PodColumn, s: PodState, t: number) {
  const r = POD_DRAW;
  // (its bottom hangs at the column's top, where the fall starts: podfall.ts rockAt's y is the pod's bottom)
  const hangY = p.top - r * 1.9;
  if (s.phase === 'idle') {
    // (a new pod swells in over the first part of the beat)
    const g = Math.min(1, s.u * 4);
    ctx.globalAlpha = g;
    podShape(ctx, p.x, hangY, r * (0.6 + 0.4 * g), 0);
    ctx.globalAlpha = 1;
    return;
  }
  if (s.phase === 'warn') {
    // the trickle: a stream of tufts drifting down the column from the pod, reaching further each moment of the tell (at its start a
    // third of the way, by its end the whole column), so on a phone he sees fluff falling past him on his own column before the drop
    const reach = (p.land - p.top) * Math.min(1, 0.35 + s.u * 0.9);
    for (let i = 0; i < 16; i++) {
      const f = (t * 0.55 + i / 16) % 1;
      const y = p.top + 6 + f * reach;
      fluff(ctx, p.x + Math.sin(t * 2.4 + i * 1.7) * 10, y, 6 + (i % 3) * 1.6, 1 - f * 0.35);
    }
    podShape(ctx, p.x, hangY, r, Math.sin(t * 38) * 0.14 * (0.4 + s.u));
    return;
  }
  if (s.phase === 'gone') return;
  if (s.phase === 'fall') {
    const y = s.y - r * 1.9;
    for (let i = 0; i < 4; i++) fluff(ctx, p.x + (i - 1.5) * 7, y - r * 1.9 - 8 - i * 12, 5 - i * 0.6, 0.85 - i * 0.18);
    podShape(ctx, p.x, y, r, 0);
    return;
  }
  // the burst: the painted pod burst open on the wood, silk spilling, fading; and a puff of fluff thinning out
  const bim = pic(PIECES.burst);
  if (bim) {
    const w = (BURST_H * bim.width) / bim.height;
    ctx.globalAlpha = Math.max(0, 1 - s.u * 0.8);
    ctx.drawImage(bim, p.x - w / 2, p.land - BURST_H, w, BURST_H);
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const d = 8 + s.u * 30;
    fluff(ctx, p.x + Math.cos(a) * d, p.land - 10 + Math.sin(a) * d * 0.5 - s.u * 12, 6 + (i % 2) * 2, 0.95 * (1 - s.u));
  }
}

/**
 * A shut gate's bough (stand-in): the bough's own length, tilted down at its `far` end by `sag` px under the weight of its fruit, with
 * bracket-fungus shelves. Drawn only while it sags; once open the stage's painted ground draws it, level.
 */
export function drawGate(ctx: CanvasRenderingContext2D, b: Pick<Platform, 'x' | 'y' | 'width' | 'height'>, far: -1 | 1, sag: number) {
  const pivotX = far > 0 ? b.x : b.x + b.width;
  const ang = Math.atan2(sag, b.width) * far;
  const thick = Math.max(16, Math.min(26, b.height || 22));
  ctx.save();
  ctx.translate(pivotX, b.y);
  ctx.rotate(ang);
  const x0 = far > 0 ? 0 : -b.width, w = b.width;
  const im = pic(PIECES.bough);
  if (im) {
    // (the painted rough bough, its walk line on the bough's top, its walkable span over the bough's width, sagging with it)
    const k = w / (BOUGH.x1 - BOUGH.x0);
    ctx.drawImage(im, x0 - BOUGH.x0 * k, -BOUGH.walkY * k, BOUGH.w * k, BOUGH.h * k);
    ctx.restore();
    return;
  }
  ctx.fillStyle = '#5a4026';
  ctx.beginPath();
  ctx.roundRect(x0, 0, w, thick, thick / 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 230, 190, 0.18)';
  ctx.fillRect(x0 + 6, 3, w - 12, 4);
  ctx.fillStyle = '#c9a25a';
  for (let i = 1; i <= 3; i++) {
    const fx = x0 + (w * i) / 4;
    ctx.beginPath();
    ctx.ellipse(fx, thick + 2, 12, 5, 0, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();
}
