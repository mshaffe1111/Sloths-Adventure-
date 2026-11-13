/**
 * vineFieldArt — how a vine field draws (vineField.ts, R-165.177). STAND-INS until 1-4's own art (R-165.178), named plainly:
 *   - a field vine is World 1's painted vine (castArt.ts vineTile) hung straight from its top, a little curl at its free end (a plain
 *     green line while the sheet loads);
 *   - a fruit cluster is CODE-DRAWN: a bunch of purple passion fruit on a stalk (circles), no painted art yet.
 * Nothing allocates per frame (PERFORMANCE-RULES §3.1): the strand's points are a kept array.
 */
import type { Vine } from './types.ts';
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
    for (const v of vines) if (v.id === c.vine) x = v.x;
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
