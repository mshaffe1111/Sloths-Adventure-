/**
 * Dot's stuck-helper: a player jumping at a wall again and again, never using the second jump, gets told about it once a stage.
 * In the control test (2026-10-23) two beginners gave up at the foot of a stump only the second jump climbs: one quit there twice and
 * never tried a second jump. This watches for that and nothing else: a jump taken with a wall too tall for one jump just ahead, that
 * lands back at the same height near where it began, without the second jump. Three of those in a row (a landing higher up resets
 * the count) and it says its line, once.
 */

/** how many failed jumps at a wall before Dot speaks */
export const STUCK_TRIES = 3;
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
    ? 'Too tall for one jump! Tap again in the air to jump twice'
    : mode === 'pad'
      ? 'Too tall for one jump! Press Jump again in the air to jump twice'
      : 'Too tall for one jump! Press Space again in the air to jump twice';
}
