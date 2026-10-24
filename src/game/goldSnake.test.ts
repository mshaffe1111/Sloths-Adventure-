import test from 'node:test';
import assert from 'node:assert/strict';
import { goldShape, goldSnakeEnabled } from './goldSnake.ts';

test('the golden snake is the game\'s snake (on unless ?snake=classic)', () => {
  assert.equal(goldSnakeEnabled(), true);
});

test('the strike lunges forward and the rear-up lifts the head', () => {
  assert.ok(goldShape('strike', 0.2, 0).lunge > 15);
  assert.ok(goldShape('rear', 0.3, 0).lift > 15);
  assert.ok(goldShape('prowl', 0, 0).lift === 0);
});

test('a defeated snake lies flat and still', () => {
  const d = goldShape('defeat', 1, 3);
  assert.equal(d.lift, 0);
  assert.equal(d.amp, 0);
  assert.equal(d.speed, 0);
});
