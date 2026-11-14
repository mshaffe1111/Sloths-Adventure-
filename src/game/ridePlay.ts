/**
 * ridePlay — a ride in the engine (ride.ts; gen2/rideLay.ts lays it): a 'moving' platform that carries a `ride` is put where its beat
 * on the stage's clock says each fixed step (beat.ts: every piece on a beat reads the one clock), and the engine carries whoever
 * stands on it by the move this returns, the way it carries a lift's rider.
 *
 * No timer of its own, so a ride cannot drift off its beat: seek the clock (a harness, a frozen frame) and the ride is there.
 */
import type { StageClock } from './clock.ts';
import { rideAt } from './ride.ts';
import type { Platform } from './types.ts';

/** how far a ride moved this step (one object, reused: read it before the next call) */
export interface RideMove { dx: number; dy: number }
const MOVE: RideMove = { dx: 0, dy: 0 };

/** one fixed step of a ride: move its platform to where its beat puts it. Returns the move, for its rider */
export function moveRide(plat: Platform, clock: Pick<StageClock, 'read'>): RideMove {
  const r = plat.ride!;
  const at = rideAt(r, clock.read(r.clock, r.shift));
  MOVE.dx = at.x - plat.x;
  MOVE.dy = at.y - plat.y;
  plat.x = at.x;
  plat.y = at.y;
  return MOVE;
}
