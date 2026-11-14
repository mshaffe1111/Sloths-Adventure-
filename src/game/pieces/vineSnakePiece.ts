/**
 * pieces/vineSnakePiece — the vine snake (vineSnake.ts; 1-6.md NEW 2, ENG-S2) on the piece hook: every liana whose data carries a
 * `snake` gets one, keeping its beat on the stage's one clock and riding the liana's grip line wherever the liana's swing has it now.
 *
 *   step    reads its beat (its tell, its trip) and, if he swings on that liana and any of it reaches his hands while it travels, makes
 *           him let go (host.letGo: a startle hop off, never a bite). It never hurts him: no `hurts`.
 *   draw    'world' (over the liana, behind him): the tell is the hiss pose, reared at the end it starts from (on the bough at the
 *           anchor, or at the liana's foot), turned to face him; the trip is the hanging pose laid along the liana at its swing angle,
 *           head first, fading in and out only where it is off the vine (into the bough or the ferns).
 *   respawn nothing to put back: where it is comes from the clock alone.
 *
 * The liana's geometry is the stage's own Vine (the engine draws, catches and swings that same object; engine.ts writes swingAngle on
 * it from the vines' clock every step, before the pieces step). No stage id, world, seed or x here: all of it is the stage's data.
 */
import { VINE_HANG } from '../heroVine.ts';
import type { PieceHost, PieceKind, StagePiece } from '../stagePiece.types.ts';
import type { Vine } from '../types.ts';
import { onVine, SNAKE, snakeNow, snakeTouches, type SnakeNow } from '../vineSnake.ts';
import { VINE_SNAKE_ART, vineSnakeImg } from '../vineSnakeArt.ts';

/** how far down the liana (px from its anchor) his hands are while he swings on it: grip to toes is VINE_HANG (heroVine.ts) */
export function handsAlong(swingLength: number, len: number): number {
  return Math.max(0, Math.min(len, swingLength - VINE_HANG));
}

type Snaked = Vine & { snake: NonNullable<Vine['snake']> };

class VineSnakePiece implements StagePiece {
  readonly kind = 'vine-snake';
  readonly layers = ['world'] as const;
  /** each snake's place this step (drawn from it, so the draw never reads the clock again) */
  readonly now: SnakeNow[];
  /** how many times a snake has made him let go (the recorder and the tests) */
  letGos = 0;
  constructor(readonly vines: readonly Snaked[]) {
    this.now = vines.map(() => ({ shown: false, tell: false, live: false, head: 0, tail: 0, dir: 1 }));
  }

  step(_dt: number, host: PieceHost) {
    const p = host.player;
    for (let i = 0; i < this.vines.length; i++) {
      const v = this.vines[i];
      const len = v.bottomY - v.topY;
      const n = snakeNow(v.snake, len, host.clock.read(v.snake.clock, v.snake.shift ?? 0));
      this.now[i] = n;
      if (p.isVineSwinging && p.swingVineId === v.id && snakeTouches(n, len, handsAlong(p.swingLength ?? 0, len)) && host.letGo()) this.letGos++;
    }
  }

  draw(ctx: CanvasRenderingContext2D, _layer: 'world' | 'front' | 'screen', host: PieceHost) {
    for (let i = 0; i < this.vines.length; i++) {
      const n = this.now[i];
      if (!n.shown) continue;
      const v = this.vines[i];
      const len = v.bottomY - v.topY;
      const a = v.swingAngle ?? 0;
      const ux = Math.sin(a), uy = Math.cos(a);
      if (n.tell) {
        const img = vineSnakeImg('hiss');
        if (!img) continue;
        const A = VINE_SNAKE_ART.hiss;
        const h = A.drawH, w = (A.w / A.h) * h;
        // (reared where it starts: its coil's foot on the anchor, on the bough; or on the liana's foot. Its head turned toward him)
        const d = n.dir === 1 ? 0 : len;
        const x = v.x + ux * d, y = v.topY + uy * d;
        const face = host.player.x < x ? -1 : 1;
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(face, 1);
        ctx.drawImage(img, -w / 2, -h, w, h);
        ctx.restore();
        continue;
      }
      const img = vineSnakeImg('hang');
      if (!img) continue;
      const on = onVine(n, len);
      // (only where it is off the vine does it fade: going into the bough, or off the foot into the ferns)
      const alpha = on ? Math.min(1, ((on.to - on.from) / SNAKE.body) * 1.5) : 0;
      if (alpha <= 0.01) continue;
      const A = VINE_SNAKE_ART.hang;
      const h = SNAKE.body, w = (A.w / A.h) * h;
      const mid = (n.head + n.tail) / 2;
      ctx.save();
      ctx.globalAlpha *= alpha;
      ctx.translate(v.x + ux * mid, v.topY + uy * mid);
      // (the pose hangs head-down: turned to the liana's angle; heading up, it is turned end for end so its head leads)
      ctx.rotate(-a);
      if (n.dir === -1) ctx.scale(1, -1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
    }
  }
}

export const VINE_SNAKE_PIECE: PieceKind = {
  id: 'vine-snake',
  start(stage) {
    const vines = (stage.vines ?? []).filter((v): v is Snaked => !!v.snake && v.vineType !== 'tree_climb');
    return vines.length ? new VineSnakePiece(vines) : null;
  },
};
