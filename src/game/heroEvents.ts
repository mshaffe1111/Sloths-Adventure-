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
  /** on a shimmy rope: whether he is creeping (vx) and how far he has gone (walkCycle, which the rope advances: heroRope.ts) */
  hanging?: boolean;
  vx?: number;
  walkCycle?: number;
}

/** the engine's walkCycle grows by this much per px he creeps along a rope (engine.ts updateRope) */
const ROPE_WALK_PER_PX = 0.08;

export class HeroEvents {
  private lastHp = -1;
  private wasGrounded = true;
  private lastTime = 0;
  hurtUntil = 0;
  landUntil = 0;
  /** set only by a drop at (nearly) the hardest speed: the painted roll-out `tumble` frame plays for this landing */
  hardLandUntil = 0;
  /** the fastest downward speed of the current fall (the engine zeroes vy on touchdown, so it has to be remembered) */
  private fallSpeed = 0;
  /** creeping along a rope: whether he was last frame, and the walkCycle when this creep began (so each creep starts its cycle afresh) */
  private ropeMoving = false;
  private ropeFrom = 0;
  /** how far (world units) he has crept along the rope since this creep began; 0 while he hangs still */
  ropeTravel = 0;

  reset() {
    this.lastHp = -1;
    this.wasGrounded = true;
    this.hurtUntil = 0;
    this.landUntil = 0;
    this.hardLandUntil = 0;
    this.fallSpeed = 0;
    this.ropeMoving = false;
    this.ropeTravel = 0;
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
      this.hardLandUntil = hard >= 0.9 ? this.landUntil : 0;
    }
    if (p.grounded) this.fallSpeed = 0;
    this.wasGrounded = p.grounded;
    const creeping = !!p.hanging && Math.abs(p.vx ?? 0) > 10;
    if (creeping && !this.ropeMoving) this.ropeFrom = p.walkCycle ?? 0;
    this.ropeMoving = creeping;
    this.ropeTravel = creeping ? Math.max(0, ((p.walkCycle ?? 0) - this.ropeFrom) / ROPE_WALK_PER_PX) : 0;
    // belt and braces: a timer can never be further ahead than it was ever set to
    if (this.hurtUntil - time > HURT_TIME + 0.01) this.hurtUntil = time;
    if (this.landUntil - time > LAND_TIME_HARD + 0.01) this.landUntil = time;
    if (this.hardLandUntil > this.landUntil) this.hardLandUntil = this.landUntil;
  }

  isHurt(time: number) {
    return time < this.hurtUntil;
  }
  isHardLanding(time: number) {
    return time < this.hardLandUntil;
  }
  isLanding(time: number) {
    return time < this.landUntil;
  }
}
