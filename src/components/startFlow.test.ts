import test from 'node:test';
import assert from 'node:assert/strict';
import { nextStartStep } from './startFlow.ts';
import { difficulty } from '../game/difficulty.ts';

test('LV-19: a fresh save meets How to Play, then the mode card, and never reaches 1-1 without a stored mode', () => {
  const s = { hasProgress: false, howToSeen: false, modeChosen: false };
  assert.equal(nextStartStep(s), 'howto');
  s.howToSeen = true;
  // closing the how-to (or tapping Start again) still lands on the card, however often, until a mode is kept
  for (let i = 0; i < 3; i++) assert.equal(nextStartStep(s), 'pick');
  assert.equal(nextStartStep({ ...s, toMap: true }), 'pick', 'the World Map is no way round it');
  assert.equal(nextStartStep({ ...s, howToSeen: false, toMap: true }), 'pick');
  s.modeChosen = true;
  assert.equal(nextStartStep(s), 'go');
});

test('LV-19: an old save with no mode stored goes straight on, and still reads Normal', () => {
  assert.equal(nextStartStep({ hasProgress: true, howToSeen: false, modeChosen: false }), 'go');
  assert.equal(nextStartStep({ hasProgress: true, howToSeen: true, modeChosen: false }), 'go');
  assert.equal(difficulty(), 'normal');
});
