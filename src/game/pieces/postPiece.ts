/**
 * pieces/postPiece — the POST's doors (post.ts; gen2/postLay.ts lays them; 2-7's PLEASE BE PATIENT doors, reference/design/2-7.md NEW
 * 2) on the piece hook: each door stands shut until he passes its slot (the engine's own pick-up reach, post.ts inReach: the same step
 * the engine takes the letter, a counted petal), then is drawn OPEN for the rest of the run (a respawn never shuts it: the letter stays
 * posted). Drawn on layer 'back', behind him (postDraw.ts: the door's painted art by inventory id). It never hurts him.
 */
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import { inReach, type Post } from '../post.ts';
import { drawDoor } from '../postDraw.ts';

export class PostPiece implements StagePiece {
  readonly kind = 'post';
  readonly layers: readonly PieceLayer[] = ['back'];
  /** each door's state, in the post's door order: open once its letter is posted */
  readonly open: boolean[];
  constructor(readonly post: Post, private readonly slots: ReadonlyArray<{ x: number; y: number }>) {
    this.open = post.doors.map(() => false);
  }

  step(_dt: number, host: PieceHost) {
    const p = host.player;
    this.slots.forEach((s, i) => {
      if (!this.open[i] && inReach(p.x, p.y, s.x, s.y)) this.open[i] = true;
    });
  }

  draw(ctx: CanvasRenderingContext2D, _layer: PieceLayer, host: PieceHost) {
    this.post.doors.forEach((d, i) => drawDoor(ctx, this.post, d, this.open[i], host.view));
  }
}

export const POST_PIECE: PieceKind = {
  id: 'post',
  start(stage) {
    const post = stage.post;
    if (!post) return null;
    // (each slot where its letter lies: the stage's own collectible)
    const slots = post.doors.map((d) => stage.collectibles.find((c) => c.id === d.letter) ?? { x: d.x, y: d.y - 20 });
    return new PostPiece(post, slots.map((c) => ({ x: c.x, y: c.y })));
  },
};
