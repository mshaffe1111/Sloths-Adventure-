import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkAABBCollision,
  distance2D,
  parseTouchVector,
  calculateDifficultyScaling,
  isObjectiveComplete,
  calculateLevelStars,
  calculateHitScore,
} from './rules.ts';

test('AABB collision correctly detects overlapping and separate rectangles', () => {
  // Overlapping
  assert.equal(checkAABBCollision(10, 10, 20, 20, 15, 15, 20, 20), true);
  // Touching edge only (non-overlapping)
  assert.equal(checkAABBCollision(10, 10, 20, 20, 30, 10, 20, 20), false);
  // Completely separate
  assert.equal(checkAABBCollision(0, 0, 10, 10, 100, 100, 10, 10), false);
});

test('distance2D calculates exact Euclidean distance', () => {
  assert.equal(distance2D(0, 0, 3, 4), 5);
  assert.equal(distance2D(10, 10, 10, 20), 10);
});

test('parseTouchVector accurately handles null or deadzone input', () => {
  const resultNull = parseTouchVector(null, 0);
  assert.equal(resultNull.moveX, 0);
  assert.equal(resultNull.moveY, 0);
  assert.equal(resultNull.isAngledRunJump, false);

  const resultDeadzone = parseTouchVector(45, 0.1);
  assert.equal(resultDeadzone.moveX, 0);
  assert.equal(resultDeadzone.moveY, 0);
});

test('parseTouchVector detects angled jump, duck, and climb gestures', () => {
  // Up-right diagonal swipe (around 315° in 0..360 where 270 is up, 0 is right)
  const swipeUpRight = parseTouchVector(315, 0.8);
  assert.equal(swipeUpRight.isAngledRunJump, true);
  assert.equal(swipeUpRight.moveX, 1);

  // Pulling straight down (90° is down)
  const duckDown = parseTouchVector(90, 0.7);
  assert.equal(duckDown.isDuck, true);
  assert.equal(duckDown.moveY, 1);

  // Pulling straight up (270° is up)
  const climbUp = parseTouchVector(270, 0.6);
  assert.equal(climbUp.isClimb, true);
  assert.equal(climbUp.moveY, -1);
});

test('calculateDifficultyScaling correctly scales from 1-1 to 10-10', () => {
  const scaleStart = calculateDifficultyScaling(1, 1);
  assert.equal(scaleStart.progressionRatio, 0);
  assert.equal(scaleStart.platformGapMultiplier, 1.0);
  assert.equal(scaleStart.enemySpeedMultiplier, 1.0);

  const scaleEnd = calculateDifficultyScaling(10, 10);
  assert.equal(scaleEnd.progressionRatio, 1.0);
  assert.ok(scaleEnd.platformGapMultiplier > 1.5);
  assert.ok(scaleEnd.enemySpeedMultiplier > 1.5);
  assert.ok(scaleEnd.hazardDensityMultiplier > 2.0);
  assert.ok(scaleEnd.enemyTelegraphSpeed < scaleStart.enemyTelegraphSpeed);
});

test('isObjectiveComplete checks various mission archetypes', () => {
  // Harvest fruits
  assert.equal(isObjectiveComplete('harvest', 9, 10, false, false), false);
  // quota missions also need the player to touch the unlocked exit shrine
  assert.equal(isObjectiveComplete('harvest', 10, 10, false, false), false);
  assert.equal(isObjectiveComplete('harvest', 10, 10, true, false), true);

  // Sprint to exit totem
  assert.equal(isObjectiveComplete('sprint', 0, 0, false, false), false);
  assert.equal(isObjectiveComplete('sprint', 0, 0, true, false), true);

  // Boss Lair
  assert.equal(isObjectiveComplete('boss_lair', 0, 0, false, false), false);
  assert.equal(isObjectiveComplete('boss_lair', 0, 0, false, true), true);

  // Relic Hunt (3 idols)
  assert.equal(isObjectiveComplete('relic_hunt', 2, 3, false, false), false);
  assert.equal(isObjectiveComplete('relic_hunt', 3, 3, false, false), false);
  assert.equal(isObjectiveComplete('relic_hunt', 3, 3, true, false), true);
});

test('calculateLevelStars awards 1 to 3 stars based on performance', () => {
  // Bare completion
  assert.equal(calculateLevelStars(100, 60, 0.2, 0.1), 1);
  // Decent health remaining
  assert.equal(calculateLevelStars(80, 60, 0.6, 0.3), 2);
  // High mastery: full health & fast/high collectibles
  assert.equal(calculateLevelStars(30, 60, 0.9, 0.9), 3);
  // a life lost, or a slow timed run, keeps the third star away
  assert.equal(calculateLevelStars(30, 60, 0.9, 0.9, 1), 2);
  assert.equal(calculateLevelStars(50, 60, 0.9, 0.9), 2);
  // stages without a time limit: nearly everything collected, no life lost
  assert.equal(calculateLevelStars(500, 0, 0.9, 1), 3);
  assert.equal(calculateLevelStars(500, 0, 0.9, 0.5), 2);
});

test('calculateHitScore awards bonus for mega punch and combo', () => {
  const normalHit = calculateHitScore('snake', false, 0);
  const megaHit = calculateHitScore('snake', true, 0);
  const comboHit = calculateHitScore('snake', false, 3);

  assert.equal(normalHit, 150);
  assert.equal(megaHit, 300);
  assert.ok(comboHit > normalHit);
});
