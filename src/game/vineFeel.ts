/**
 * The climbing vine's settle (FEEL-VINE, R-165.214; Matt 11-13 on 1-4: "the climbing vines and going from vine to vine felt a little
 * off... not very smooth", and what felt least smooth: getting on or off a vine, and the jump between vines).
 *
 * Measured on the real engine at 30 fps (tools/inspect/vineFeel.ts, 1-4 both settings): the engine puts him on a vine's line, between
 * two field vines' hands, or at the vault's start in ONE frame. A grab from beside a trunk moved him 40 px in a frame; a jump caught
 * on a trunk moved him 40-50 px and stopped him dead (268 px/s to 0); each push between two field vines moved him 40 px; the vault at
 * a top lifted him 22-29 px. His body has to be where it is (every reach, vault and verdict number is measured from it: vineTop.ts,
 * climbReach, gen2's tower verdicts), so the BODY still moves as before and no stage, seed or rule moves.
 *
 * What changes is what the player sees: the drawn Pokey keeps where he was and how he was moving at the moment of the snap, and
 * settles onto the body with a critically damped spring (no overshoot, no wobble), in about a quarter of a second. A grab from a jump
 * carries his speed into the catch; a hand step slides him across; the vault lifts him off the top without a jump. Nothing here
 * touches play: the offset is drawn only (engine.ts draws the hero translated by it, as wallOff and meecaOff are).
 */

/** the drawn body's offset from the real one (px) and its rate (px/s) */
export interface Settle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** where his body was at the last step (a jump past SETTLE_MAX between steps is a cut: a respawn, a flag, a placement) */
  bx: number;
  by: number;
  /**
   * where the climb left his body at the end of its own block last frame (NaN: not climbing then). A climbing body has no speed, so
   * anything that moves it between there and the next frame is a snap from outside the climb (a bough's body he climbed into pushing
   * him onto its top, as an uncleared vine does), carried the same way
   */
  ex: number;
  ey: number;
}

export const newSettle = (): Settle => ({ x: 0, y: 0, vx: 0, vy: 0, bx: NaN, by: NaN, ex: NaN, ey: NaN });

/**
 * The spring's rate (1/s). Critically damped at 22/s a 40 px offset is under 5 px after 5 frames (0.17 s) and gone after 8 (0.27 s);
 * the biggest single-frame move it makes from a standing grab is about 10.5 px, under the run's 9-11 px a frame at full speed.
 */
export const SETTLE_RATE = 25;
/** an offset beyond this (px) is a placement, a respawn or a cut, never a vine's snap: it is not carried (the old cut stands) */
export const SETTLE_MAX = 96;
/** a carried speed beyond this (px/s) is clipped: a catch keeps a little of a fast fall, never a long slide past the vine */
export const SETTLE_VMAX = 600;
/** where the climb leaves his body at the end of its block this frame (engine.ts, only while he still climbs: see Settle.ex) */
export function climbEnd(s: Settle, x: number, y: number): void {
  s.ex = x;
  s.ey = y;
}

/**
 * Where to draw him, off his body at (x, y) (px): the settle, and a snap from outside the climb that landed after the climb's block this
 * frame (it is carried at the next step; drawn from now, so the eye never sees it). Pure: the draw reads, the update moves.
 */
export function drawnOff(s: Settle, x: number, y: number, climbing: boolean): { x: number; y: number } {
  if (!climbing || Number.isNaN(s.ex)) return { x: s.x, y: s.y };
  const dx = x - s.ex, dy = y - s.ey;
  if (Math.abs(s.x - dx) > SETTLE_MAX || Math.abs(s.y - dy) > SETTLE_MAX) return { x: 0, y: 0 };
  return { x: s.x - dx, y: s.y - dy };
}

/** under this (px, px/s) the settle is done */
const REST = 0.05;

const clip = (v: number, m: number) => Math.max(-m, Math.min(m, v));

/**
 * The engine moved his body by (dx, dy) in one frame and changed his speed from (vx0, vy0) to (vx1, vy1) (px/s): the drawn body keeps
 * its place and its motion, and settles from there. A move too big to be a vine's snap clears the settle (it is a cut).
 */
export function carry(s: Settle, dx: number, dy: number, vx0 = 0, vy0 = 0, vx1 = vx0, vy1 = vy0): void {
  const x = s.x - dx, y = s.y - dy;
  if (Math.abs(x) > SETTLE_MAX || Math.abs(y) > SETTLE_MAX) {
    clear(s);
    return;
  }
  s.x = x;
  s.y = y;
  s.vx = clip(s.vx + vx0 - vx1, SETTLE_VMAX);
  s.vy = clip(s.vy + vy0 - vy1, SETTLE_VMAX);
}

export function clear(s: Settle): void {
  s.x = s.y = s.vx = s.vy = 0;
}

/** one axis of a critically damped spring toward 0, exactly over dt: d(t) = (d + (v + w d) t) e^(-w t) */
function axis(d: number, v: number, dt: number, w: number): [number, number] {
  const c = v + w * d;
  const e = Math.exp(-w * dt);
  return [(d + c * dt) * e, (v - w * c * dt) * e];
}

/**
 * one frame of the settle (dt in seconds), his body at (bx, by) as the frame begins and whether he is still climbing (a respawn or a
 * hurt lets go of the vine: nothing from outside is carried then, so neither is ever blurred)
 */
export function settleStep(s: Settle, dt: number, bx: number, by: number, climbing: boolean, w = SETTLE_RATE): void {
  const cut = Math.abs(bx - s.bx) > SETTLE_MAX || Math.abs(by - s.by) > SETTLE_MAX;
  s.bx = bx;
  s.by = by;
  if (cut) clear(s);
  else if (climbing && !Number.isNaN(s.ex)) carry(s, bx - s.ex, by - s.ey);
  s.ex = s.ey = NaN;
  if (!s.x && !s.y && !s.vx && !s.vy) return;
  [s.x, s.vx] = axis(s.x, s.vx, dt, w);
  [s.y, s.vy] = axis(s.y, s.vy, dt, w);
  if (Math.abs(s.x) < REST && Math.abs(s.y) < REST && Math.abs(s.vx) < REST * 30 && Math.abs(s.vy) < REST * 30) clear(s);
}
