import test from 'node:test';
import assert from 'node:assert/strict';
import { BASE_LIVES, OFFER_AFTER_FAILS, extraLives, gameSpeed, setExtraLives, setGameSpeed, shouldOfferHelp, startingLives } from './assist.ts';

test('defaults give the usual three lives at normal speed', () => {
  assert.equal(extraLives(), 0);
  assert.equal(gameSpeed(), 1);
  assert.equal(startingLives(), BASE_LIVES);
});

test('extra lives add to the starting lives and the speed is kept', () => {
  setExtraLives(2);
  assert.equal(startingLives(), 5);
  setExtraLives(4);
  assert.equal(startingLives(), 7);
  setGameSpeed(0.8);
  assert.equal(gameSpeed(), 0.8);
  setExtraLives(0);
  setGameSpeed(1);
});

test('help is offered only after enough Game Overs, and only while it is off', () => {
  assert.equal(shouldOfferHelp(OFFER_AFTER_FAILS - 1), false);
  assert.equal(shouldOfferHelp(OFFER_AFTER_FAILS), true);
  setExtraLives(2);
  assert.equal(shouldOfferHelp(OFFER_AFTER_FAILS + 5), false);
  setExtraLives(0);
});
