/**
 * pieces/ridePiece — RIDE (t-pieces, gen2/rideLay.ts lays it) on the piece hook: every 'moving' platform that carries a `ride` is put
 * where its beat on the stage's clock says each fixed step (ridePlay.ts moveRide), carrying whoever stands on it. It was a branch of
 * engine.ts's moving-platform loop; it runs here now, at the same point of the step (the engine steps its pieces just before that loop,
 * which skips a ride's platform). No timer of its own, so a respawn only puts each ride back where its beat says now.
 *
 * Its look is the platform's own (the platform drawer paints the log, pad or lift): it draws nothing on a layer of its own, and it
 * never hurts him.
 */
import { moveRide } from '../ridePlay.ts';
import type { PieceHost, PieceKind, StagePiece } from '../stagePiece.types.ts';
import type { Platform } from '../types.ts';

class RidePiece implements StagePiece {
  readonly kind = 'ride';
  readonly layers = [] as const;
  constructor(private readonly rides: readonly Platform[]) {}

  step(_dt: number, host: PieceHost) {
    const p = host.player;
    for (const plat of this.rides) {
      if (plat.broken) continue;
      const m = moveRide(plat, host.clock);
      if (p.grounded && host.standingOnId === plat.id) (p.x += m.dx), (p.y += m.dy);
    }
  }

  respawn(host: PieceHost) {
    for (const plat of this.rides) if (!plat.broken) moveRide(plat, host.clock);
  }
}

export const RIDE_PIECE: PieceKind = {
  id: 'ride',
  start(_stage, host) {
    const rides = host.platforms.filter((pl) => pl.type === 'moving' && !!pl.ride);
    return rides.length ? new RidePiece(rides) : null;
  },
};
