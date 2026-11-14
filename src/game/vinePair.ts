/**
 * vinePair — a climb's speed and reach, and the draped pair (1-4.md piece 4, R-165.170; Matt's feel test, feelPairStage.ts).
 *
 * A single climb (a vine up a trunk) is climbed at CLIMB_SPEED, 220 px/s, as it always was. The pair is ONE liana draped over a bough,
 * its two ends hanging side by side PAIR_GAP apart: no new button, up climbs, and from between the strands (or beside either) one grab
 * takes both. Its speed is a value on the vine piece (`Vine.climbSpeed`), so a stage (or the feel room's sign) sets how quick it is.
 */
import type { Vine } from './types.ts';

/** the single climb's speed, up or down (px/s): unchanged everywhere (engine.ts used it as a bare 220 until R-165.170) */
export const CLIMB_SPEED = 220;
/** how far apart the pair's two strands hang (px; 1-4.md: "strands 40 px apart") */
export const PAIR_GAP = 40;
/** the pair's speeds Matt tries in the feel room (times the single's), the room's sign switching between them; the first is where it starts */
export const PAIR_SPEEDS = [2, 1.6] as const;
/** how far from a climb's line his middle may be to take hold of it (px): standing or in the air, and once climbing (it keeps him) */
export const GRAB_REACH = 54;
export const HOLD_REACH = 60;

/** the speed a climb is climbed at, up or down (px/s) */
export function climbSpeedOf(v: Pick<Vine, 'climbSpeed'>): number {
  return v.climbSpeed ?? CLIMB_SPEED;
}

/** how far from `v.x` he can be and take hold (or keep hold): a pair reaches from beside either strand, so its half-gap is added */
export function climbReach(v: Pick<Vine, 'pair'>, climbing: boolean): number {
  return (climbing ? HOLD_REACH : GRAB_REACH) + (v.pair ? v.pair / 2 : 0);
}

/** the climb's rustle: a soft grip per hand, about every 0.36-0.48 s on a single; quicker in step with a quicker climb */
export function rustleGap(v: Pick<Vine, 'climbSpeed'>, rand: number): number {
  return (0.36 + rand * 0.12) * Math.min(1, CLIMB_SPEED / climbSpeedOf(v));
}
