/**
 * LV-7 (polish report 2026-10-29): a switch from Easy to Normal mid-game no longer drops all of Easy's help at once. It fades out over
 * the next five different stages played, a retry counts nothing more, the first stage's card says so, and a switch back ends it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

const mem = new Map<string, string>();
const g = globalThis as unknown as { localStorage: unknown };
g.localStorage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
};

const { setDifficulty, switchDifficulty, startRun, easeInShare, easeInLine, reloadDifficulty, EASE_KEY } = await import('./difficulty.ts');
const { isSaveKey } = await import('./saveFile.ts');

test('a game played on Normal from the start has no easing (nor a new game, a save or a test that sets the mode)', () => {
  mem.clear();
  reloadDifficulty();
  setDifficulty('easy');
  setDifficulty('normal');
  startRun('3-2');
  assert.equal(easeInShare('3-2'), 0);
  assert.equal(easeInLine('3-2'), null);
});

test('Easy to Normal: the help fades over five stages, retries count once, the first card says so', () => {
  mem.clear();
  reloadDifficulty();
  setDifficulty('easy');
  startRun('3-1');
  assert.equal(easeInShare('3-1'), 0, 'Easy has its own help, not the easing');
  switchDifficulty('normal');
  const shares: number[] = [];
  for (const id of ['3-2', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7']) {
    startRun(id);
    shares.push(+easeInShare(id).toFixed(2));
  }
  assert.deepEqual(shares, [1, 1, 0.8, 0.6, 0.4, 0.2, 0]);
  assert.match(easeInLine('3-2') ?? '', /fades/);
  assert.equal(easeInLine('3-3'), null);
  assert.ok(isSaveKey(EASE_KEY), 'kept with the save');
});

test('a switch back to Easy ends the easing', () => {
  switchDifficulty('easy');
  assert.equal(mem.has(EASE_KEY), false);
  assert.equal(easeInShare('3-8'), 0);
});
