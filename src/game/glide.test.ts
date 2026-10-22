import test from 'node:test';
import assert from 'node:assert/strict';
import { GLIDE, newGlide, glideStep, glideBrake } from './glide.ts';

const fall = { has: true, airborne: true, held: true, vy: 300 };

test('the leaf opens only after he has been falling a moment, with Jump held', () => {
  const g = newGlide();
  assert.equal(glideStep(g, fall, 0.05), Infinity, 'too soon');
  assert.equal(g.on, false);
  assert.equal(glideStep(g, fall, 0.06), GLIDE.fallSpeed);
  assert.equal(g.on, true);
});

test('no skill, no glide; letting go of Jump folds it', () => {
  const g = newGlide();
  glideStep(g, { ...fall, has: false }, 0.5);
  assert.equal(g.on, false);
  glideStep(g, fall, 0.5);
  assert.equal(g.on, true);
  glideStep(g, { ...fall, held: false }, 0.016);
  assert.equal(g.on, false);
});

test('going up never glides', () => {
  const g = newGlide();
  glideStep(g, { ...fall, vy: -300 }, 1);
  assert.equal(g.on, false);
});

test('a glide runs out, comes back on a new upward launch, and on landing', () => {
  const g = newGlide();
  glideStep(g, fall, 0.2);
  let t = 0;
  while (g.on && t < 5) {
    glideStep(g, fall, 0.05);
    t += 0.05;
  }
  assert.ok(t > 1 && t < 1.6, `lasted ${t}s`);
  assert.equal(g.on, false);
  glideStep(g, { ...fall, vy: -420 }, 0.016);
  assert.equal(g.left, GLIDE.maxTime);
  glideStep(g, { ...fall, airborne: false }, 0.016);
  assert.equal(g.left, GLIDE.maxTime);
});

test('the leaf only ever slows a fall', () => {
  assert.equal(glideBrake(600, GLIDE.fallSpeed, 0.01) < 600, true);
  assert.equal(glideBrake(600, GLIDE.fallSpeed, 1), GLIDE.fallSpeed);
  assert.equal(glideBrake(80, GLIDE.fallSpeed, 0.1), 80);
  assert.equal(glideBrake(-200, GLIDE.fallSpeed, 0.1), -200);
  assert.equal(glideBrake(600, Infinity, 0.1), 600);
});
