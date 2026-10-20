import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classicFor } from './sfx.ts';
import { hitArg } from './combat.ts';

test('sounds chosen as "keep old" in the listening test stay on the original recipes', () => {
  assert.ok(classicFor('checkpoint', undefined, 0));
  assert.ok(classicFor('vine', undefined, 0));
  assert.ok(classicFor('flower', 3, 0));
  assert.ok(!classicFor('flower', 0, 0) && !classicFor('flower', 5, 0));
  assert.ok(classicFor('power', 1, 0) && !classicFor('power', 0, 0));
  assert.ok(classicFor('land', 0.3, 0) && !classicFor('land', 1, 0));
  assert.ok(classicFor('defeat', 3, 0) && classicFor('defeat', 8, 0) && classicFor('defeat', -1, 0) && !classicFor('defeat', 0, 0));
  assert.ok(classicFor('tayraCall', 2, 0) && !classicFor('tayraCall', 0, 0));
});

test('light hits: plain, fur and stone stay original (plain ones only until a combo starts); the rest are new', () => {
  assert.ok(classicFor('hit', hitArg(false, 'generic'), 0));
  assert.ok(!classicFor('hit', hitArg(false, 'generic'), 5));
  assert.ok(classicFor('hit', hitArg(false, 'fur'), 0));
  assert.ok(classicFor('hit', hitArg(false, 'armor'), 0));
  assert.ok(!classicFor('hit', hitArg(false, 'scale'), 0));
  assert.ok(!classicFor('hit', hitArg(true, 'fur'), 0));
});
