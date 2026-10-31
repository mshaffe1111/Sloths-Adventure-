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
/** the turn on the ground (AN-13): how long the change of facing takes to draw. The physics turns him at once; only the picture eases round */
export const TURN_TIME = 0.09;
/** reversing faster than this (px/s, about 55% of a full run) skids; the skid is drawn for at least SKID_MIN seconds (three frames: the engine's reversal itself takes two) */
export const SKID_SPEED = 160;
export const SKID_MIN = 0.1;
/** the lean as he sets off from standing (AN-13) */
export const START_LEAN_TIME = 0.1;
/** the dust a skid kicks up lives this long (seconds) */
export const PUFF_LIFE = 0.34;

export interface HeroEventState {
  hp: number;
  grounded: boolean;
  vy: number;
  /** on a shimmy rope: whether he is creeping (vx) and how far he has gone (walkCycle, which the rope advances: heroRope.ts) */
  hanging?: boolean;
  vx?: number;
  walkCycle?: number;
  /** for the turn, the skid and the run start (AN-13) */
  x?: number;
  y?: number;
  facing?: 1 | -1;
}

/** a puff of dust from a skid, at his feet, drifting the way he was sliding */
export interface SkidPuff {
  x: number;
  y: number;
  dir: number;
  t0: number;
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
  /** when the last landing began (the landing's frames go by how far through it he is) */
  landFrom = 0;
  /** the facing the picture shows: it follows p.facing through a turn, and holds the old way through a skid */
  shownFacing: 1 | -1 = 1;
  /** when the last turn on the ground began (-1: none yet) */
  turnAt = -1;
  /** a skid: until when, and the way he was sliding */
  skidUntil = 0;
  skidDir: 1 | -1 = 1;
  /** when he last set off from standing still */
  startAt = -1;
  puffs: SkidPuff[] = [];
  private lastSpeed = 0;

  reset() {
    this.lastHp = -1;
    this.wasGrounded = true;
    this.hurtUntil = 0;
    this.landUntil = 0;
    this.hardLandUntil = 0;
    this.fallSpeed = 0;
    this.ropeMoving = false;
    this.ropeTravel = 0;
    this.landFrom = 0;
    this.turnAt = -1;
    this.skidUntil = 0;
    this.startAt = -1;
    this.puffs = [];
    this.lastSpeed = 0;
  }

  /** busy: on a trunk, a vine or a rope, attacking, ducking or down: no turn, skid or lean is drawn then */
  track(p: HeroEventState, time: number, busy = false) {
    // the clock went backwards: a new stage (or a retry) has begun
    if (time < this.lastTime - 0.25) this.reset();
    this.lastTime = time;
    if (this.lastHp >= 0 && p.hp < this.lastHp) this.hurtUntil = time + HURT_TIME;
    this.lastHp = p.hp;
    if (!p.grounded) this.fallSpeed = Math.max(this.fallSpeed, p.vy);
    if (p.grounded && !this.wasGrounded && p.vy >= 0) {
      // a short hop lands lightly; a long drop holds the crouch a little longer
      const hard = Math.max(0, Math.min(1, (this.fallSpeed - SOFT_FALL) / (HARD_FALL - SOFT_FALL)));
      this.landFrom = time;
      this.landUntil = time + LAND_TIME + hard * (LAND_TIME_HARD - LAND_TIME);
      this.hardLandUntil = hard >= 0.9 ? this.landUntil : 0;
    }
    if (p.grounded) this.fallSpeed = 0;
    this.wasGrounded = p.grounded;
    this.trackMoves(p, time, busy);
    const creeping = !!p.hanging && Math.abs(p.vx ?? 0) > 10;
    if (creeping && !this.ropeMoving) this.ropeFrom = p.walkCycle ?? 0;
    this.ropeMoving = creeping;
    this.ropeTravel = creeping ? Math.max(0, ((p.walkCycle ?? 0) - this.ropeFrom) / ROPE_WALK_PER_PX) : 0;
    // belt and braces: a timer can never be further ahead than it was ever set to
    if (this.hurtUntil - time > HURT_TIME + 0.01) this.hurtUntil = time;
    if (this.landUntil - time > LAND_TIME_HARD + 0.01) this.landUntil = time;
    if (this.hardLandUntil > this.landUntil) this.hardLandUntil = this.landUntil;
  }

  /**
   * The turn, the skid and the run start (AN-13). They only change the picture: the engine has already turned him and set his speed, so
   * steering answers exactly as before.
   */
  private trackMoves(p: HeroEventState, time: number, busy: boolean) {
    const facing = p.facing ?? this.shownFacing;
    const vx = p.vx ?? 0;
    const speed = Math.abs(vx);
    const ground = p.grounded && !busy;
    if (!ground) {
      this.skidUntil = 0;
      this.turnAt = -1;
      this.shownFacing = facing;
      this.lastSpeed = speed;
      return;
    }
    // reversing at a run: he plants his feet and skids, still facing the way he was sliding, and kicks up two puffs
    const reversing = Math.sign(vx) === -facing && speed > 20;
    // (the engine's turn bonus takes 160 px/s off in a single frame, so the speed he had the frame before is what counts)
    if (reversing && Math.max(speed, this.lastSpeed) >= SKID_SPEED && time >= this.skidUntil) {
      this.skidDir = vx > 0 ? 1 : -1;
      this.shownFacing = this.skidDir;
      this.puffs = this.puffs.filter((f) => time - f.t0 < PUFF_LIFE);
      for (const k of [0, 1]) this.puffs.push({ x: (p.x ?? 0) + this.skidDir * (6 + k * 16), y: p.y ?? 0, dir: this.skidDir, t0: time + k * 0.04 });
      this.skidUntil = time + SKID_MIN;
    }
    if (time < this.skidUntil + 1e-6 && reversing) this.skidUntil = Math.max(this.skidUntil, time + 1 / 60);
    const skidding = time < this.skidUntil;
    // the facing changed (or a skid just ended facing the old way): the picture turns round
    if (!skidding && facing !== this.shownFacing) {
      this.shownFacing = facing;
      this.turnAt = time;
    }
    if (speed > 10 && this.lastSpeed <= 10) this.startAt = time;
    this.lastSpeed = speed;
  }

  isSkidding(time: number) {
    return time < this.skidUntil;
  }
  /** how far through the turn (0..1), or -1 outside one */
  turnPhase(time: number) {
    if (this.turnAt < 0 || time < this.turnAt) return -1;
    const u = (time - this.turnAt) / TURN_TIME;
    return u < 1 ? u : -1;
  }
  /** how far through the run start's lean (0..1), or -1 outside it */
  startPhase(time: number) {
    if (this.startAt < 0 || time < this.startAt) return -1;
    const u = (time - this.startAt) / START_LEAN_TIME;
    return u < 1 ? u : -1;
  }
  /** how far through the landing (0..1) */
  landPhase(time: number) {
    return Math.max(0, Math.min(1, (time - this.landFrom) / Math.max(1e-3, this.landUntil - this.landFrom)));
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
