/**
 * pairArt — the draped pair (Vine.pair, 1-4.md piece 4): ONE liana thrown over a bough, its loop in view and its two ends hanging side by
 * side to the ground. A plant, never two placed ropes.
 *
 * FEEL-PAIR's stand-in until the lead's art call (R-165.170): World 1's own painted vine (castArt.ts vineTile, the shimmy vine's twisted
 * run) laid along the liana's path with ropeArt.ts layRope; only the path (the loop over the bough, the trailing ends on the ground) is
 * code. While the sheet loads it is a plain green line, so it never vanishes.
 */
import { vineTile } from './castArt.ts';
import { layRope } from './ropeArt.ts';

/** how thick the liana is drawn (px): a climb a sloth takes in two fists, thicker than a shimmy vine (ropeArt.ts ROPE_THICK 9) */
export const PAIR_THICK = 15;
/** the loop's points round the top of the bough, and how far each end trails along the ground */
const LOOP_STEPS = 10;
const TRAIL = 26;

/** the liana's path, kept from frame to frame (no new arrays per frame: PERFORMANCE-RULES §3.1) */
const pts: Array<[number, number]> = [];
const pool: Array<[number, number]> = [];
function put(i: number, x: number, y: number) {
  const p = pool[i] ?? (pool[i] = [0, 0]);
  p[0] = x;
  p[1] = y;
  pts[i] = p;
}

/**
 * The path, end to end: the left end trailing on the ground, up the left strand, over the bough in a round loop, down the right strand,
 * its end trailing the other way. `top` is the climb's top (the bough's top 2 px under it), `bottom` the ground; `gap` the strands' spacing.
 * Returns how many points (they are in `pts`).
 */
export function pairPath(x: number, top: number, bottom: number, gap: number): number {
  const r = gap / 2;
  const lx = x - r, rx = x + r;
  // (the loop rests on the bough: its ends just at the bough's top, its crown a radius over it)
  const lip = top + 2 - PAIR_THICK * 0.45;
  let n = 0;
  // the left end: trailing out on the ground, then rising into the strand
  put(n++, lx - TRAIL, bottom - 3);
  put(n++, lx - TRAIL * 0.45, bottom - 6);
  put(n++, lx - 2, bottom - 18);
  put(n++, lx, bottom - 40);
  put(n++, lx, lip);
  for (let i = 1; i < LOOP_STEPS; i++) {
    const a = Math.PI - (Math.PI * i) / LOOP_STEPS;
    put(n++, x + r * Math.cos(a), lip - r * Math.sin(a));
  }
  put(n++, rx, lip);
  put(n++, rx, bottom - 40);
  put(n++, rx + 2, bottom - 18);
  put(n++, rx + TRAIL * 0.45, bottom - 6);
  put(n++, rx + TRAIL, bottom - 3);
  pts.length = n;
  return n;
}

/** the draped pair, behind the bough it hangs over (drawn before it: protoArt.ts drawProtoScene's climbs) */
export function drawDrapedPair(ctx: CanvasRenderingContext2D, x: number, top: number, bottom: number, gap: number): void {
  pairPath(x, top, bottom, gap);
  const v = vineTile();
  if (v) {
    layRope(ctx, v.src, pts, PAIR_THICK, v.tile);
    return;
  }
  ctx.strokeStyle = '#6f7d2f';
  ctx.lineWidth = PAIR_THICK * 0.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) (i ? ctx.lineTo(pts[i][0], pts[i][1]) : ctx.moveTo(pts[i][0], pts[i][1]));
  ctx.stroke();
}
