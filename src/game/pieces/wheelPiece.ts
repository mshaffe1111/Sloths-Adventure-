/**
 * pieces/wheelPiece — the WATER WHEEL (wheel.ts; gen2/wheelLay.ts lays it; 2-6.md NEW 1) on the piece hook: every 'moving' platform that
 * carries a `wheel` seat is a bucket, put each fixed step where its wheel's turn says (wheel.ts bucketAt, read off the game's time), and
 * whoever stands in it is moved by the bucket's own (dx, dy), as pieces/ridePiece.ts carries a ride's rider. The engine steps its pieces
 * before its carry read (engine.ts carryVx), so a jump out of a bucket keeps its sideways speed by the one carry rule (ride.ts RIDE.keep).
 *
 * No timer of its own (the wheel never stops; pauses hold the game's time), so a respawn only puts each bucket where the turn says now.
 * It draws the wheel behind him (wheelDraw.ts drawWheel: the hook the painted wheel replaces) and never hurts him: a miss falls into the
 * pond under it (a safe water zone that sets him back on the jetty, wheelLay.ts).
 */
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from '../stagePiece.types.ts';
import type { Platform } from '../types.ts';
import { bucketAt, type Wheel } from '../wheel.ts';
import { drawWheel } from '../wheelDraw.ts';

class WheelPiece implements StagePiece {
  readonly kind = 'wheel';
  readonly layers: readonly PieceLayer[] = ['world'];
  /** each wheel and its buckets, in bucket order */
  private readonly wheels: Array<{ w: Wheel; buckets: Platform[] }> = [];
  constructor(buckets: readonly Platform[]) {
    for (const b of buckets) {
      const s = b.wheel!;
      let g = this.wheels.find((q) => q.w === s.w);
      if (!g) this.wheels.push((g = { w: s.w, buckets: [] }));
      g.buckets[s.i] = b;
    }
  }

  step(_dt: number, host: PieceHost) {
    const p = host.player;
    for (const { w, buckets } of this.wheels) {
      for (let i = 0; i < buckets.length; i++) {
        const b = buckets[i];
        if (!b) continue;
        const at = bucketAt(w, i, host.t);
        const dx = at.x - b.x, dy = at.y - b.y;
        b.x = at.x;
        b.y = at.y;
        if (p.grounded && host.standingOnId === b.id) (p.x += dx), (p.y += dy);
      }
    }
  }

  respawn(host: PieceHost) {
    for (const { w, buckets } of this.wheels) buckets.forEach((b, i) => {
      if (!b) return;
      const at = bucketAt(w, i, host.t);
      b.x = at.x;
      b.y = at.y;
    });
  }

  draw(ctx: CanvasRenderingContext2D, _layer: PieceLayer, host: PieceHost) {
    const v = host.view;
    const vw = v.w / (v.zoom || 1), vh = v.h / (v.zoom || 1);
    const seen = (x0: number, y0: number, x1: number, y1: number) => x1 >= v.x - 40 && x0 <= v.x + vw + 40 && y1 >= v.y - 40 && y0 <= v.y + vh + 40;
    for (const { w, buckets } of this.wheels) drawWheel(ctx, w, buckets.filter(Boolean), seen);
  }
}

export const WHEEL_PIECE: PieceKind = {
  id: 'wheel',
  start(_stage, host) {
    const buckets = host.platforms.filter((pl) => pl.type === 'moving' && !!pl.wheel);
    return buckets.length ? new WheelPiece(buckets) : null;
  },
};

