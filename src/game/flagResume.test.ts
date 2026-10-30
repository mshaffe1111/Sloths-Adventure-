import test from 'node:test';
import assert from 'node:assert/strict';
import { clearFlag, flagFor, saveFlag } from './flagResume.ts';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};

test('a run cut off at a flag comes back at that flag, for that stage only', () => {
  const s = mem();
  saveFlag('2-4', 1810.4, 620.6, 1000, s);
  assert.deepEqual(flagFor('2-4', 2000, s), { x: 1810, y: 621 });
  assert.equal(flagFor('2-5', 2000, s), null);
});

test('a stage that ended the normal way forgets its flag', () => {
  const s = mem();
  saveFlag('1-3', 900, 400, 1000, s);
  clearFlag(s);
  assert.equal(flagFor('1-3', 2000, s), null);
});

test('a day later the stage starts at the beginning again', () => {
  const s = mem();
  saveFlag('3-1', 500, 300, 0, s);
  assert.equal(flagFor('3-1', 25 * 60 * 60 * 1000, s), null);
});

test('broken or missing storage never stops a stage starting', () => {
  const s = mem();
  s.setItem('sloth_flag_resume', '{not json');
  assert.equal(flagFor('3-1', 0, s), null);
  assert.equal(flagFor('3-1', 0, null), null);
});
