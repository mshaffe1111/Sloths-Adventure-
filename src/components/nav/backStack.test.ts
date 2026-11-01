import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackStack } from './backStack.ts';

test('back runs only the newest handler, then the one under it', () => {
  const s = createBackStack();
  const log: string[] = [];
  const offScreen = s.push(() => log.push('screen'));
  const offPopup = s.push(() => log.push('popup'));
  assert.equal(s.handle(), true);
  assert.deepEqual(log, ['popup']);
  offPopup();
  assert.equal(s.handle(), true);
  assert.deepEqual(log, ['popup', 'screen']);
  offScreen();
  assert.equal(s.handle(), false);
  assert.equal(s.size(), 0);
});

test('taking a handler off twice, or out of order, leaves the rest alone', () => {
  const s = createBackStack();
  const log: string[] = [];
  const a = s.push(() => log.push('a'));
  const b = s.push(() => log.push('b'));
  a();
  a();
  assert.equal(s.size(), 1);
  s.handle();
  assert.deepEqual(log, ['b']);
  b();
  assert.equal(s.size(), 0);
});
