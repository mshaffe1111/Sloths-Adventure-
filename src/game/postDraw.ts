/**
 * postDraw — the POST's looks (post.ts; 2-7): a door shut or open (pieces/postPiece.ts) and a letter or a reply (the engine's petal
 * draw), by inventory id (Post.art: w2-props#door shut, w2-next#doorOpen open, #letter/#letterB, #reply/#replyB). The door stands on
 * its ground as the hand-built 2-7 stood it (w2Stages.ts patientDoor: 170 px wide, its foot 6 px into the ground); the open door is
 * drawn in the shut one's box (the same cut, 480 px wide). A letter flutters between its two frames at the sheet's scale. Nothing is
 * drawn until the art is in: no code-drawn stand-in (the lead's rule for a shipped stage); a letter or reply then falls back to the
 * plain petal (drawPostItem returns false).
 */
import type { Post, PostDoor } from './post.ts';
import type { Collectible } from './types.ts';
import { drawW2Piece, w2Height } from './riverArt.ts';
import { drawW2Next, w2NextFrame, W2_NEXT_SCALE } from './w2NextArt.ts';

/** the door's width on the stage (w2Stages.ts patientDoor's), and how far its foot sits into the ground */
export const DOOR_W = 170;
export const DOOR_SINK = 6;
/** s a letter's flutter frame holds */
export const POST_FLUTTER = 0.3;

export function drawDoor(ctx: CanvasRenderingContext2D, post: Post, d: PostDoor, open: boolean, view: { x: number; y: number; w: number; h: number; zoom: number }): void {
  if (d.x + DOOR_W < view.x || d.x - DOOR_W > view.x + view.w / view.zoom) return;
  const bottom = d.y + DOOR_SINK;
  // (the shut door is World 2's own piece: its id names the frame on w2-props)
  const shut = post.art.door.split('#')[1] as Parameters<typeof drawW2Piece>[1];
  if (!open) {
    drawW2Piece(ctx, shut, d.x, bottom, DOOR_W);
    return;
  }
  const h = w2Height(shut, DOOR_W);
  drawW2Next(ctx, post.art.open, d.x - DOOR_W / 2, bottom - h, DOOR_W, h);
}

/** a letter or a reply in its art; false when the art is not ready (the caller draws the plain petal) */
export function drawPostItem(ctx: CanvasRenderingContext2D, c: Collectible, t: number, art: Post['art']): boolean {
  const frames = c.mark === 'reply' ? art.reply : art.letter;
  const id = frames[Math.floor(t / POST_FLUTTER) % frames.length];
  const f = w2NextFrame(id);
  if (!f) return false;
  const w = f.w / W2_NEXT_SCALE, h = f.h / W2_NEXT_SCALE;
  // (a slow bob, the petal's own: its middle on the collectible)
  const bob = Math.sin(t * 2.4 + c.id) * 2;
  return drawW2Next(ctx, id, c.x - w / 2, c.y - h / 2 + bob, w, h);
}
