import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newLookOn, setNewLook, NEW_LOOK_DEFAULT } from './newLook.ts';

test('the new look is off by default on the real game, and a player choice wins', () => {
  assert.equal(NEW_LOOK_DEFAULT, false);
  const m = new Map<string, string>();
  const store = { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
  assert.equal(newLookOn(store), false);
  setNewLook(true, store);
  assert.equal(newLookOn(store), true);
  setNewLook(false, store);
  assert.equal(newLookOn(store), false);
});
