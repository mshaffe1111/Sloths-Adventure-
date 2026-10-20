/**
 * Short-lived hero poses (hurt, landing) are triggered by a change of state, not by a flag on the player.
 * The clock they run on is the stage's game time, which starts again at 0 whenever a stage is launched or retried,
 * so a timer left over from the last stage must never outlive it (it once held the hero in the hurt pose for as
 * long as it took the new stage's clock to catch up).
 */
export const HURT_TIME = 0.3;
/** how long the landing pose lasts after a short drop, and after the hardest one */
export const LAND_TIME = 0.12;
export const LAND_TIME_HARD = 0.2;
/** falling faster than this (px/s) starts to lengthen the landing; at HARD_FALL it is the full hard landing */
const SOFT_FALL = 450;
const HARD_FALL = 950;

export interface HeroEventState {
  hp: number;
  grounded: boolean;
  vy: number;
}

export class HeroEvents {
  private lastHp = -1;
  private wasGrounded = true;
  private lastTime = 0;
  hurtUntil = 0;
  landUntil = 0;
  /** the fastest downward speed of the current fall (the engine zeroes vy on touchdown, so it has to be remembered) */
  private fallSpeed = 0;

  reset() {
    this.lastHp = -1;
    this.wasGrounded = true;
    this.hurtUntil = 0;
    this.landUntil = 0;
    this.fallSpeed = 0;
  }

  track(p: HeroEventState, time: number) {
    // the clock went backwards: a new stage (or a retry) has begun
    if (time < this.lastTime - 0.25) this.reset();
    this.lastTime = time;
    if (this.lastHp >= 0 && p.hp < this.lastHp) this.hurtUntil = time + HURT_TIME;
    this.lastHp = p.hp;
    if (!p.grounded) this.fallSpeed = Math.max(this.fallSpeed, p.vy);
    if (p.grounded && !this.wasGrounded && p.vy >= 0) {
      // a short hop lands lightly; a long drop holds the crouch a little longer
      const hard = Math.max(0, Math.min(1, (this.fallSpeed - SOFT_FALL) / (HARD_FALL - SOFT_FALL)));
      this.landUntil = time + LAND_TIME + hard * (LAND_TIME_HARD - LAND_TIME);
    }
    if (p.grounded) this.fallSpeed = 0;
    this.wasGrounded = p.grounded;
    // belt and braces: a timer can never be further ahead than it was ever set to
    if (this.hurtUntil - time > HURT_TIME + 0.01) this.hurtUntil = time;
    if (this.landUntil - time > LAND_TIME_HARD + 0.01) this.landUntil = time;
  }

  isHurt(time: number) {
    return time < this.hurtUntil;
  }
  isLanding(time: number) {
    return time < this.landUntil;
  }
}
