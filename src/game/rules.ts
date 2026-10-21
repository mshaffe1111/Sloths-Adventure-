import type { ObjectiveType } from './types.ts';

/**
 * Check simple 2D Axis-Aligned Bounding Box (AABB) intersection
 */
export function checkAABBCollision(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number
): boolean {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

/**
 * Calculate distance between two 2D points
 */
export function distance2D(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Interprets touch joystick polar vector (angle in degrees 0-360, where 0 is right, 90 is down, 270 is up)
 * and magnitude (0..1) into game actions:
 * - 30° - 60° upward-right (-30° to -60° or 300° to 330°): triggers Slanted Momentum Run-Jump
 * - 120° - 150° (or 210° to 240°): triggers Slanted Momentum Run-Jump Left
 * - 70° - 110°: triggers Duck / Drop down
 * - 250° - 290°: triggers Climb Up
 */
export interface TouchJoystickAction {
  moveX: number; // -1 to 1
  moveY: number; // -1 to 1
  isAngledRunJump: boolean;
  isDuck: boolean;
  isClimb: boolean;
}

export function parseTouchVector(
  angleDeg: number | null,
  magnitude: number,
  deadzone: number = 0.2
): TouchJoystickAction {
  if (angleDeg === null || magnitude < deadzone) {
    return {
      moveX: 0,
      moveY: 0,
      isAngledRunJump: false,
      isDuck: false,
      isClimb: false,
    };
  }

  // Normalize angle to [0, 360)
  const normAngle = ((angleDeg % 360) + 360) % 360;

  // Convert polar to cartesian
  const rad = (normAngle * Math.PI) / 180;
  const rawX = Math.cos(rad);
  const rawY = Math.sin(rad); // down is positive if screen coords

  const moveX = Math.abs(rawX) > 0.25 ? Math.sign(rawX) : 0;
  const moveY = Math.abs(rawY) > 0.25 ? Math.sign(rawY) : 0;

  // Angled Run-Jump: Up-Right is 290° to 345° (or -70° to -15°), Up-Left is 195° to 250°
  const isAngledRunJumpRight = normAngle >= 290 && normAngle <= 345;
  const isAngledRunJumpLeft = normAngle >= 195 && normAngle <= 250;
  const isAngledRunJump = (isAngledRunJumpRight || isAngledRunJumpLeft) && magnitude > 0.55;

  // Duck is pulling downward: 70° to 110°
  const isDuck = normAngle >= 70 && normAngle <= 110 && magnitude > 0.45;

  // Climb is pulling straight upward: 250° to 290°
  const isClimb = normAngle >= 250 && normAngle <= 290 && magnitude > 0.4;

  return {
    moveX,
    moveY,
    isAngledRunJump,
    isDuck,
    isClimb,
  };
}

/**
 * Difficulty scaling algorithm from Stage 1-1 to Stage 10-10 (Requirement 6k)
 * Smoothly scales:
 * - platform gaps (1.0 to 1.8x base)
 * - enemy speed (1.0 to 2.2x base)
 * - hazard and enemy density (1.0 to 2.5x base)
 * - enemy attack frequency
 */
export interface DifficultyMetrics {
  progressionRatio: number; // 0.0 (1-1) to 1.0 (10-10)
  platformGapMultiplier: number;
  enemySpeedMultiplier: number;
  hazardDensityMultiplier: number;
  enemyHpMultiplier: number;
  enemyTelegraphSpeed: number; // seconds of warning (decreases with difficulty)
}

export function calculateDifficultyScaling(
  worldIndex: number, // 1 to 10
  miniIndex: number   // 1 to 10
): DifficultyMetrics {
  const clampedWorld = Math.max(1, Math.min(10, worldIndex));
  const clampedMini = Math.max(1, Math.min(10, miniIndex));

  // Overall progression index: 0 (1-1) to 99 (10-10)
  const linearStep = (clampedWorld - 1) * 10 + (clampedMini - 1);
  const progressionRatio = linearStep / 99; // 0.0 to 1.0

  return {
    progressionRatio,
    platformGapMultiplier: 1.0 + progressionRatio * 0.75, // up to 1.75x gap
    enemySpeedMultiplier: 1.0 + progressionRatio * 0.95, // up to 1.95x speed
    hazardDensityMultiplier: 1.0 + progressionRatio * 1.4, // up to 2.4x density
    enemyHpMultiplier: 1.0 + Math.floor(progressionRatio * 2.2), // up to +2 HP for tough stages
    enemyTelegraphSpeed: Math.max(0.28, 0.75 - progressionRatio * 0.38), // 0.75s down to 0.28s telegraph
  };
}

/**
 * Evaluates whether an objective is fulfilled
 */
export function isObjectiveComplete(
  type: ObjectiveType,
  currentProgress: number,
  targetCount: number,
  playerReachedTotem: boolean,
  bossDefeated: boolean
): boolean {
  if (type === 'boss_lair') {
    return bossDefeated;
  }
  if (type === 'sprint' || type === 'stealth' || type === 'ascent' || type === 'vine_runner') {
    return playerReachedTotem;
  }
  // For quota-based missions (harvest, purge, rescue, relic_hunt, gauntlet):
  // You must complete the quota target AND touch the unlocked sacred exit shrine!
  return currentProgress >= targetCount && playerReachedTotem;
}

/**
 * Calculates star rating (1 to 3 stars) upon level completion
 */
export function calculateLevelStars(
  timeTakenSec: number,
  timeTargetSec: number,
  remainingHpRatio: number, // 0..1
  collectedBonusItemRatio: number, // 0..1
  livesLost = 0
): number {
  let stars = 1; // 1 star for simply completing the level

  // Second star for remaining with at least 50% HP or fast time
  if (remainingHpRatio >= 0.5 || (timeTargetSec > 0 && timeTakenSec <= timeTargetSec)) {
    stars = 2;
  }

  // Third star is earned, not given: no life lost, most hearts kept, and on a timed stage a quick run
  // (on the others, nearly everything collected)
  const quick = timeTargetSec > 0 ? timeTakenSec <= timeTargetSec * 0.6 : collectedBonusItemRatio >= 0.85;
  if (livesLost === 0 && remainingHpRatio >= 0.75 && quick) {
    stars = 3;
  }

  return stars;
}

/**
 * Calculate player score additions
 */
export function calculateHitScore(
  enemyType: string,
  isMegaPunch: boolean,
  comboCount: number
): number {
  let baseScore = 100;
  if (enemyType === 'snake') baseScore = 150;
  if (enemyType === 'eagle') baseScore = 200;
  if (enemyType === 'ocelot') baseScore = 250;
  if (enemyType === 'tayra') baseScore = 200;
  if (enemyType === 'harpy') baseScore = 350;
  if (enemyType === 'boa') baseScore = 300;
  if (enemyType === 'caiman') baseScore = 300;
  if (enemyType === 'jaguar') baseScore = 350;
  if (enemyType === 'boss') baseScore = 1000;

  const megaMultiplier = isMegaPunch ? 2 : 1;
  const comboMultiplier = 1 + Math.min(5, comboCount) * 0.2;

  return Math.round(baseScore * megaMultiplier * comboMultiplier);
}

/**
 * Is Pokey actually at the sanctuary door? The door stands on the ground at (x, y): about 92px wide and 134px tall.
 * His body has to overlap it. Being level with it somewhere else on the screen, past it, or on another floor does not count.
 */
export function atExitDoor(p: { x: number; y: number }, doorX: number, doorGroundY: number): boolean {
  const feet = p.y;
  const head = p.y - 38;
  return Math.abs(p.x - doorX) <= 40 && feet > doorGroundY - 142 && head < doorGroundY - 8;
}

/** is he on the door's own floor and at or past the door's near side (a sealed door stops him there)? */
export function atSealedDoor(p: { x: number; y: number }, doorX: number, doorGroundY: number): boolean {
  return p.x >= doorX - 25 && p.x <= doorX + 120 && p.y > doorGroundY - 142 && p.y - 38 < doorGroundY + 4;
}
