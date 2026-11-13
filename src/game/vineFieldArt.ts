/**
 * vineFieldArt — how a vine field draws (vineField.ts, R-165.177). STAND-INS until 1-4's own art (R-165.178), named plainly:
 *   - a field vine is World 1's painted vine (castArt.ts vineTile) hung straight from its top, a little curl at its free end (a plain
 *     green line while the sheet loads);
 *   - a fruit cluster is CODE-DRAWN: a bunch of purple passion fruit on a stalk (circles), no painted art yet;
 *   - a falling pod is CODE-DRAWN (B14, 11-13): a green-brown kapok pod hanging under the bough, its fluff trickling down the column in
 *     the tell, a white puff where it bursts; the ART member's painted seed pod replaces it (reference/packets/2026-11-13/ART.md);
 *   - a shut gate's bough is CODE-DRAWN (B14): a brown bough tilted down at its far end by its sag, bracket-fungus shelves on it, until
 *     the painted bough (B15's rotting bough piece / ART) is drawn tilted instead.
 * Nothing allocates per frame (PERFORMANCE-RULES §3.1): the strand's points are a kept array.
 */
import type { Platform, Vine } from './types.ts';
import type { PodColumn, PodPhase } from './podfall.ts';
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
      ctx.fillStyle = '#5b2a6e';
      ctx.beginPath();
      ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(232, 200, 255, 0.55)';
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

/** a kapok pod (stand-in): an upright spindle `r` px across, its seam, a stalk; `shake` rad of sway */
function podShape(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, shake: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(shake);
  ctx.fillStyle = '#6b6a2a';
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.62, r * 1.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3e3d16';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -r * 1.15);
  ctx.lineTo(0, r * 1.15);
  ctx.stroke();
  ctx.fillStyle = 'rgba(214, 220, 160, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.22, -r * 0.4, r * 0.16, r * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** a fluff tuft (stand-in): a soft white dot */
function fluff(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number) {
  // (no colour string built per tuft: a fixed fill and the alpha, PERFORMANCE-RULES §3.1)
  ctx.globalAlpha = Math.max(0, Math.min(1, a));
  ctx.fillStyle = '#faf8ee';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

/**
 * A falling pod at its phase (podfall.ts podAt): hanging under the bough (idle), shaking with its fluff trickling down the column (the
 * tell: the trickle reaches further down the longer it runs, so on a short sideways view he sees fluff on his own column), falling, then
 * a white burst on the wood (stand-in, code-drawn).
 */
export function drawPod(ctx: CanvasRenderingContext2D, p: PodColumn, s: { phase: PodPhase; u: number; y: number }, t: number) {
  const r = 14;
  const hangY = p.top + r * 1.25;
  if (s.phase === 'idle') {
    // (a new pod swells in over the first part of the beat)
    const g = Math.min(1, s.u * 4);
    ctx.globalAlpha = g;
    podShape(ctx, p.x, hangY, r * (0.6 + 0.4 * g), 0);
    ctx.globalAlpha = 1;
    return;
  }
  if (s.phase === 'warn') {
    podShape(ctx, p.x, hangY, r, Math.sin(t * 38) * 0.12 * (0.4 + s.u));
    // the trickle: tufts drifting down the column, further each moment of the tell
    const reach = (p.land - p.top) * Math.min(1, 0.25 + s.u);
    for (let i = 0; i < 7; i++) {
      const f = ((t * 0.9 + i / 7) % 1);
      const y = p.top + 10 + f * reach;
      fluff(ctx, p.x + Math.sin(t * 3 + i * 1.7) * 9, y, 3 + (i % 3), 0.85 * (1 - f * 0.6));
    }
    return;
  }
  if (s.phase === 'fall') {
    podShape(ctx, p.x, s.y - r * 1.25, r, 0);
    return;
  }
  // the burst: a puff of fluff on the wood, thinning out
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const d = 6 + s.u * 26;
    fluff(ctx, p.x + Math.cos(a) * d, p.land - 8 + Math.sin(a) * d * 0.5 - s.u * 10, 4 + (i % 2) * 2, 0.9 * (1 - s.u));
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
