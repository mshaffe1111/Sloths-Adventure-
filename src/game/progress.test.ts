import test from 'node:test';
import assert from 'node:assert/strict';
import { generateAllLevels } from './worldsData.ts';

/** a throwaway localStorage so generateAllLevels reads the results we plant */
function withStorage(items: Record<string, string>, fn: () => void) {
  const g = globalThis as unknown as { localStorage?: unknown };
  const prev = g.localStorage;
  g.localStorage = { getItem: (k: string) => (k in items ? items[k] : null), setItem() {}, removeItem() {}, key: () => null, length: 0 };
  try {
    fn();
  } finally {
    g.localStorage = prev;
  }
}
const done = JSON.stringify({ completed: true, stars: 2, highScore: 100, bestTime: 50 });

test('a fresh game opens only the first stage', () => {
  withStorage({}, () => {
    const l = generateAllLevels();
    assert.equal(l.filter((x) => x.unlocked).length, 1);
    assert.equal(l[0].unlocked, true);
  });
});

test('after a reload, the stage right after the last cleared one is open (and no further)', () => {
  withStorage({ 'sloth_lvl_1-1': done, 'sloth_lvl_1-2': done, 'sloth_lvl_1-3': done }, () => {
    const l = generateAllLevels();
    assert.equal(l.find((x) => x.id === '1-4')!.unlocked, true);
    assert.equal(l.find((x) => x.id === '1-4')!.completed, false);
    assert.equal(l.find((x) => x.id === '1-5')!.unlocked, false);
  });
});

test('clearing a world boss opens the next world', () => {
  const items: Record<string, string> = {};
  for (let m = 1; m <= 10; m++) items[`sloth_lvl_1-${m}`] = done;
  withStorage(items, () => {
    const l = generateAllLevels();
    assert.equal(l.find((x) => x.id === '2-1')!.unlocked, true);
    assert.equal(l.find((x) => x.id === '2-2')!.unlocked, false);
  });
});
