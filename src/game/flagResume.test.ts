import test from 'node:test';
import assert from 'node:assert/strict';
import { clearFlag, flagFor, saveFlag, type HeldRun } from './flagResume.ts';

const mem = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) };
};
const RUN: HeldRun = { t: 95.5, lives: 2, score: 1300, got: [0, 4, 7], beat: [2], n: { fruits: 3, livesLost: 1 }, kills: { snake: 1 }, seen: ['snake'] };

test('a run cut off at a flag comes back at that flag, with its run, for that stage only', () => {
  const s = mem();
  saveFlag('2-4', 1810.4, 620.6, RUN, 1000, s);
  assert.deepEqual(flagFor('2-4', 2000, s), { x: 1810, y: 621, run: RUN });
  assert.equal(flagFor('2-5', 2000, s), null);
});

test('a flag without the run it held (an older save) does not resume: the stage starts at the beginning', () => {
  const s = mem();
  s.setItem('sloth_flag_resume', JSON.stringify({ id: '2-4', x: 1810, y: 621, at: 1000 }));
  assert.equal(flagFor('2-4', 2000, s), null);
  s.setItem('sloth_flag_resume', JSON.stringify({ id: '2-4', x: 1810, y: 621, at: 1000, run: { ...RUN, got: [-1] } }));
  assert.equal(flagFor('2-4', 2000, s), null);
  s.setItem('sloth_flag_resume', JSON.stringify({ id: '2-4', x: 1810, y: 621, at: 1000, run: { ...RUN, lives: 0 } }));
  assert.equal(flagFor('2-4', 2000, s), null);
});

test('a stage that ended the normal way forgets its flag', () => {
  const s = mem();
  saveFlag('1-3', 900, 400, RUN, 1000, s);
  clearFlag(s);
  assert.equal(flagFor('1-3', 2000, s), null);
});

test('a day later the stage starts at the beginning again', () => {
  const s = mem();
  saveFlag('3-1', 500, 300, RUN, 0, s);
  assert.equal(flagFor('3-1', 25 * 60 * 60 * 1000, s), null);
});

test('broken or missing storage never stops a stage starting', () => {
  const s = mem();
  s.setItem('sloth_flag_resume', '{not json');
  assert.equal(flagFor('3-1', 0, s), null);
  assert.equal(flagFor('3-1', 0, null), null);
});
