/**
 * ride — a platform that moves and carries him (GAME-MAP B4: logs, pads, lifts, bubbles, vents), on the one clock (clock.ts).
 *
 *   - The path is data: two or more points (`sideToSide`, `upDown`, or any list). The ride's clock says where it is: at the near end
 *     while the clock is off or warning (the warning is the tell that it is about to leave), along the path while it is on, at the far
 *     end while it rests. The next cycle brings it back. Easy only stretches the clock.
 *   - Carrying: a rider standing on it takes the ride's own move each step and has his feet set on its top, so there is no slip and
 *     no jitter; a jump off keeps the ride's sideways speed (RIDE.keep).
 *   - A sinking pad is a beatBrick ('gone') on a count that only runs while he stands on it, and runs back when he leaves.
 *
 * Pure (no canvas, no engine).
 */
import type { ClockId } from './stageKit.types.ts';
import { beatAt, type Beat, type ClockRead } from './clock.ts';
import { brickNow, type BrickNow } from './beatBrick.ts';

export const RIDE = {
  /** how much of the ride's speed a jump off it keeps: all of it sideways (letting go onto a moving log), none of it up or down */
  keep: { x: 1, y: 0 },
  /** how near its top his feet must be to be standing on it (px) */
  snap: 4,
  /** a sunk pad stays down this long after he leaves it (s on Normal), then comes back up through its warning */
  padRise: 0.6,
} as const;

export interface Point { x: number; y: number }

export interface Ride {
  clock: ClockId;
  /** this ride's stagger on its clock (StageClock.read's `shift`) */
  shift?: number;
  /** its top's left end travels the path; its width */
  path: readonly Point[];
  w: number;
  /** ease away from and into each stop (a lift); without it the speed is even (a log on a current) */
  smooth?: boolean;
}

/** a path that goes `range` either side of x, starting at the left */
export const sideToSide = (x: number, y: number, range: number): Point[] => [{ x: x - range, y }, { x: x + range, y }];
/** a path that goes `range` above and below y, starting at the bottom */
export const upDown = (x: number, y: number, range: number): Point[] => [{ x, y: y + range }, { x, y: y - range }];

/** where a ride is for a read of its clock */
export function rideAt(r: Pick<Ride, 'path' | 'smooth'>, read: ClockRead): Point {
  let s = read.phase === 'on' ? read.u : read.phase === 'rest' ? 1 : 0;
  if (r.smooth) s = s * s * (3 - 2 * s);
  if (((read.cycle % 2) + 2) % 2 === 1) s = 1 - s;
  const p = r.path;
  let total = 0;
  for (let i = 1; i < p.length; i++) total += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
  let d = s * total;
  for (let i = 1; i < p.length; i++) {
    const len = Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y);
    if (d <= len || i === p.length - 1) {
      const f = len > 0 ? Math.min(1, d / len) : 0;
      return { x: p[i - 1].x + (p[i].x - p[i - 1].x) * f, y: p[i - 1].y + (p[i].y - p[i - 1].y) * f };
    }
    d -= len;
  }
  return { x: p[0].x, y: p[0].y };
}

/** a running ride: where its top's left end is, and how far it moved this step */
export interface RideState { x: number; y: number; dx: number; dy: number }

export function newRide(r: Ride, read: ClockRead): RideState {
  const p = rideAt(r, read);
  return { x: p.x, y: p.y, dx: 0, dy: 0 };
}

/** one fixed step: move it to where its clock puts it, and keep the move for whoever rides it */
export function stepRide(s: RideState, r: Ride, read: ClockRead): RideState {
  const p = rideAt(r, read);
  s.dx = p.x - s.x;
  s.dy = p.y - s.y;
  s.x = p.x;
  s.y = p.y;
  return s;
}

export interface Rider { x: number; y: number; vx: number; vy: number }

/** is he standing on it? Asked after stepRide and before carry: his feet on the top it had before this step, inside its width, not rising */
export const standingOn = (s: RideState, r: Pick<Ride, 'w'>, p: Rider): boolean =>
  p.vy >= 0 && p.x >= s.x - s.dx && p.x <= s.x - s.dx + r.w && Math.abs(p.y - (s.y - s.dy)) <= RIDE.snap;

/** carry him: he takes the ride's move, and his feet are on its top */
export function carry(p: { x: number; y: number }, s: RideState): void {
  p.x += s.dx;
  p.y = s.y;
}

/** he jumps off: his own launch speed plus what RIDE.keep lets him keep of the ride's */
export function jumpOff(p: { vx: number; vy: number }, s: RideState, dt: number): void {
  p.vx += (s.dx / dt) * RIDE.keep.x;
  if (RIDE.keep.y) p.vy += (s.dy / dt) * RIDE.keep.y;
}

/** a sinking pad's count: seconds he has stood on it (it runs back down when he leaves) */
export interface PadState { stood: number }
export const newPad = (): PadState => ({ stood: 0 });

/**
 * One fixed step of a pad. Its clock is read by the count, not by game time: off = it holds, warn = it is going, on = sunk. The count
 * stops a little into 'on' (RIDE.padRise, stretched on Easy), so the pad stays down that long after he leaves and then rises.
 */
export function stepPad(pad: PadState, b: Beat, standing: boolean, dt: number): PadState {
  const on = b.ons[0] ?? b.period;
  const cap = Math.min(on + RIDE.padRise * b.stretch, b.period - 1e-6);
  pad.stood = standing ? Math.min(cap, pad.stood + dt) : Math.max(0, pad.stood - dt);
  // (the step it sinks it is no floor, so he is off it from the next step: it latches at its cap, so it stays down RIDE.padRise after
  // he leaves however he leaves, never popping up under his falling feet; ENG-22)
  if (standing && (pad.stood >= on || beatAt(b, pad.stood - b.offset).phase === 'on')) pad.stood = cap;
  return pad;
}

/**
 * A sinking pad as data (ENG-22; 2-2.md NEW 1 and 2; a platform's `pad`, pieces/padPiece.ts runs it, gen2/rideLay.ts layPads lays it):
 *   'weight'  its clock is read by a count that runs only while he stands on it (newPad / stepPad): it holds, shivers, sinks
 *   'beat'    it keeps the stage's clock itself, weight or not: a row in step sinks and rises together (the pond's breath)
 * Either way the clock's warning is its shiver, so it never sinks unwarned, and Easy stretches it with every brick on that clock.
 */
export interface Pad {
  by: 'weight' | 'beat';
  /** the stage clock it reads (a weight pad: its size's clock, read by its count; a beat pad: the row's beat) */
  clock: ClockId;
  /** a beat pad's stagger on its clock (s on Normal); a row in step has none */
  shift?: number;
  /** the look slot the painter fills: the pad's size (gen2 PadRow / PAD_SIZES: 'small', 'big'; a beat row's pads too, told apart by `by`), or 'snap' for a snap stone (ENG-25b); the drawer falls back to the plain lily */
  look?: string;
  /**
   * what it does while its clock is 'on' (beatBrick.ts BrickOn): 'gone' (the default) it sinks, no floor; 'bites' it is a SNAP STONE
   * (ENG-25; 2-5.md NEW 1): a floor always, that hurts him while 'on' (it claps shut on four), its jaw opening a notch a count before
   */
  on?: import('./beatBrick.ts').BrickOn;
}

/** the pad now: whether it holds him, and its tell */
export const padNow = (pad: PadState, b: Beat): BrickNow => brickNow('gone', beatAt(b, pad.stood - b.offset));
