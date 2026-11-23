/**
 * porchPosts — the posts under a plank deck over a river (DRESS-27, R-165.415: 2-7's porch planks over the race read as floating, rope-tied
 * planks with nothing under them). Every solid plank span (style canopy_bridge) whose end stands over a river gets a post there, from
 * under the plank down into the water: the world kit's own climb pole (protoArt.ts drawKitPiece 'trunk': World 2's bamboo pole, the
 * inventory's w2#trunk) drawn narrow at Pokey's scale. Drawn before the river's water (engine.ts), so the water covers the post's foot
 * with its own surface and nothing new is drawn along the waterline. A picture only: never a platform, a climb or a hurt; it moves nothing.
 */
import type { Platform } from './types.ts';

/** a post's drawn width, how far in from the plank's end it stands, how far over the plank's walk line its top hides behind the plank,
 *  and how far under the water's surface its foot runs (world px; the bamboo pole is 84 wide as a climb: a stilt is a thin one) */
export const PORCH_POST = { w: 24, inset: 26, top: 6, sink: 40 } as const;

/** one post: its middle, its top (behind the plank) and its foot (under the water) */
export interface PorchPost {
  x: number;
  top: number;
  foot: number;
}

/** the posts under every plank span over a river: one at each end over the water */
export function porchPosts(platforms: readonly Pick<Platform, 'x' | 'y' | 'width' | 'type' | 'style'>[], rivers: readonly { x0: number; x1: number; surfaceY: number }[]): PorchPost[] {
  const out: PorchPost[] = [];
  for (const p of platforms) {
    if (p.type !== 'solid' || p.style !== 'canopy_bridge') continue;
    for (const x of [p.x + PORCH_POST.inset, p.x + p.width - PORCH_POST.inset]) {
      const r = rivers.find((q) => x >= q.x0 && x <= q.x1 && q.surfaceY > p.y);
      if (r) out.push({ x, top: p.y + PORCH_POST.top, foot: r.surfaceY + PORCH_POST.sink });
    }
  }
  return out;
}

/** draws the posts in view with `draw` (a kit piece filling a box; false while the kit is not in), each clipped to its own height */
export function drawPorchPosts(
  ctx: CanvasRenderingContext2D,
  posts: readonly PorchPost[],
  view: { x0: number; x1: number; y0: number; y1: number },
  pieceH: number,
  draw: (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => boolean,
) {
  const w = PORCH_POST.w;
  for (const p of posts) {
    if (p.x + w < view.x0 || p.x - w > view.x1 || p.foot < view.y0 || p.top > view.y1) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x - w, p.top, w * 2, p.foot - p.top);
    ctx.clip();
    for (let y = p.foot - pieceH; y + pieceH > p.top; y -= pieceH - 2) draw(ctx, p.x - w / 2, y, w, pieceH);
    ctx.restore();
  }
}
