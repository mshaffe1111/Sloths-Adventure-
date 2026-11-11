/**
 * Audit C (saves): a New Game must forget everything that belongs to the old adventure, and a save file must carry it.
 * saveFile.ts decides both from one hand-kept allow-list (ALLOWED) plus DOT_MEMORY; keys added later were never put on either.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { isSaveKey, resetProgress, type Store } from '../../../../src/game/saveFile.ts';

function mapStore(init: Record<string, string>): Store {
  const m = new Map(Object.entries(init));
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}

test("the guardian's intro-seen flag (App.tsx bossIntroKey, sloth_story_b<w>) is part of the adventure", () => {
  // App.tsx:128 writes it; App.tsx:1277 reads it to cut the General's nine-line intro down to two lines "on a retry"
  assert.ok(isSaveKey('sloth_story_b10'), 'sloth_story_b10 is not on the save allow-list (the pattern is [wmng] only)');
});

test('a New Game forgets that the old adventure met the General (so his first scene plays whole again)', () => {
  const s = mapStore({ 'sloth_story_b10': '1', 'sloth_story_w1': '1', 'sloth_lvl_1-1': '{"completed":true,"stars":3}' });
  resetProgress(s);
  assert.equal(s.getItem('sloth_lvl_1-1'), null, 'the control: stage results are forgotten');
  assert.equal(s.getItem('sloth_story_b10'), null, 'sloth_story_b10 survived a New Game');
});

test('a New Game forgets the golden seeds found (protoStage.ts sloth_seed_<stage>_<n>), so they are secrets again', () => {
  const s = mapStore({ 'sloth_seed_4-3_seed': '1' });
  resetProgress(s);
  assert.equal(s.getItem('sloth_seed_4-3_seed'), null, 'a golden seed found in the old adventure still reads "found before" in the new one');
});
