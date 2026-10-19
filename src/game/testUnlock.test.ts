import test from 'node:test';
import assert from 'node:assert/strict';
import { nextTapRun, UNLOCK_TAPS, UNLOCK_TAP_GAP_MS, testUnlockOn } from './testUnlock.ts';
import { generateAllLevels } from './worldsData.ts';

test('ten quick taps in a row make a run; a pause restarts it', () => {
  let run = 0;
  for (let i = 0; i < UNLOCK_TAPS; i++) run = nextTapRun(run, i === 0 ? 99999 : 200);
  assert.equal(run, UNLOCK_TAPS);
  run = nextTapRun(9, UNLOCK_TAP_GAP_MS + 1);
  assert.equal(run, 1);
});

test('without the switch (no storage at all) only stage 1-1 is open', () => {
  assert.equal(testUnlockOn(), false);
  const open = generateAllLevels().filter((l) => l.unlocked);
  assert.deepEqual(open.map((l) => l.id), ['1-1']);
});

test('with the switch on, every stage is open but none is marked cleared', () => {
  const store = new Map<string, string>([['sloth_test_unlock', '1']]);
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  } as unknown as Storage;
  try {
    const levels = generateAllLevels();
    assert.equal(levels.every((l) => l.unlocked), true);
    assert.equal(levels.some((l) => l.completed), false);
  } finally {
    delete (globalThis as unknown as { localStorage?: Storage }).localStorage;
  }
});
