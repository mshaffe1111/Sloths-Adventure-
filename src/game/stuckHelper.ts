/**
 * Dot's stuck-helper: a player jumping at a wall again and again, never using the second jump, gets told about it once a stage.
 * In the control test (2026-10-23) two beginners gave up at the foot of a stump only the second jump climbs: one quit there twice and
 * never tried a second jump. This watches for that and nothing else: a jump taken with a wall too tall for one jump just ahead, that
 * lands back at the same height near where it began, without the second jump. Three of those in a row (a landing higher up resets
 * the count) and it says its line, once.
 */
import { RUNGS } from './helpLadder.ts';

/** how many failed jumps at a wall before Dot speaks: the help ladder's first rung (helpLadder.ts; in 1-1 the ladder speaks instead) */
export const STUCK_TRIES = RUNGS.move;
/** a landing this far from the take-off still counts as going nowhere */
const NEAR_X = 110;

export class StuckWatch {
  private wasGrounded = true;
  private takeoff: { x: number; y: number; wall: boolean } | null = null;
  private usedDouble = false;
  private fails = 0;
  private told = false;

  /**
   * once a frame. `wallAhead`: a solid face just in front, taller than one jump (the engine works it out). True on the one frame Dot
   * should speak.
   */
  tick(s: { grounded: boolean; x: number; y: number; doubleJumping: boolean; wallAhead: boolean }): boolean {
    if (this.told) return false;
    let speak = false;
    if (this.wasGrounded && !s.grounded) {
      this.takeoff = { x: s.x, y: s.y, wall: s.wallAhead };
      this.usedDouble = false;
    } else if (!s.grounded) {
      if (s.doubleJumping) this.usedDouble = true;
    } else if (!this.wasGrounded && this.takeoff) {
      const t = this.takeoff;
      if (s.y < t.y - 20) this.fails = 0;
      else if (t.wall && !this.usedDouble && Math.abs(s.x - t.x) < NEAR_X) {
        this.fails++;
        if (this.fails >= STUCK_TRIES) {
          this.told = true;
          speak = true;
        }
      }
      this.takeoff = null;
    }
    this.wasGrounded = s.grounded;
    return speak;
  }
}

/** Dot's line, for the kind of controls in use */
export function stuckLine(mode: 'screen' | 'pad' | 'keys'): string {
  return mode === 'screen'
    ? 'Too tall for one jump! Flick up again in the air to jump twice'
    : mode === 'pad'
      ? 'Too tall for one jump! Press Jump again in the air to jump twice'
      : 'Too tall for one jump! Press Space again in the air to jump twice';
}

/**
 * The help ladder's tries (1-1, R-165.119; ENGINE-AUDIT-B B-01): a jump taken at a wall that lands back at the height it left, near
 * where it began and short of the face, is a failed try. On solid ground there is no fall, so no put-back: the ladder counts each failed
 * try the same as a put-back (helpLadder.ts tried), single or double, every time (not once a stage, as StuckWatch speaks). A jump that
 * never moved toward the wall (a hop on the spot for a petal) is no try.
 */
export class TryWatch {
  private wasGrounded = true;
  private takeoff: { x: number; y: number; face: { x: number; dir: 1 | -1 } | null; toward: boolean } | null = null;
  private last: { x: number; y: number; face: { x: number; dir: 1 | -1 } | null } | null = null;

  /**
   * once a frame. `face`: the near x of a wall just ahead and the way he faces it (the engine works it out on the ground), or null; `vx`
   * his speed, `held` the way the controls push him (-1, 0, 1). Returns the face's x on the frame a try at it fails, else null.
   */
  tick(s: { grounded: boolean; x: number; y: number; vx: number; held: -1 | 0 | 1; face: { x: number; dir: 1 | -1 } | null }): number | null {
    let failed: number | null = null;
    // (where he stood and the wall before him, as on his last frame on the ground: in the air there is no wall to read, and the first frame
    // in the air is already a jump's frame up)
    if (s.grounded) this.last = { x: s.x, y: s.y, face: s.face };
    if (this.wasGrounded && !s.grounded && this.last) this.takeoff = { ...this.last, toward: false };
    else if (!s.grounded && this.takeoff?.face) {
      // (moving toward it, or held toward it: pressed against the face his speed is 0)
      if (s.vx * this.takeoff.face.dir > TOWARD_VX || s.held === this.takeoff.face.dir) this.takeoff.toward = true;
    } else if (s.grounded && !this.wasGrounded && this.takeoff) {
      const t = this.takeoff;
      const short = t.face && (t.face.dir > 0 ? s.x < t.face.x : s.x > t.face.x);
      if (t.face && t.toward && short && s.y >= t.y - 20 && Math.abs(s.x - t.x) < NEAR_X) failed = t.face.x;
      this.takeoff = null;
    }
    this.wasGrounded = s.grounded;
    return failed;
  }

  /** forget the jump in flight (a put-back or a respawn moved him: that landing is no try) */
  reset(): void {
    this.takeoff = null;
    this.last = null;
    this.wasGrounded = true;
  }
}
/** a try is a jump that moved toward the wall at least this fast (px/s) at some moment in the air, or was held toward it */
const TOWARD_VX = 30;
