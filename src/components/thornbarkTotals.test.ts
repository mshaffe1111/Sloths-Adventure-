/**
 * EN-F quality check (2026-11-12): since saves#12 writes Thornbark's result (sloth_lvl_S-1, so his journal entry shows what was
 * earned), the totals the player reads must stay as they were: the save summary ("Stages cleared" and "Stars" on Save & Load and on
 * the New Game question) and The End's expedition score leave the secret stage out, as they did when nothing wrote his result.
 * Whether he should count is the lead's call.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from '../game/saveFile.ts';
import { THORNBARK_LEVEL } from '../game/secret.ts';
import { memStorage, withLocalStorage } from '../game/saveFill.ts';
import { expeditionScore } from './BossCards.tsx';

const done = (stars: number, highScore: number) => JSON.stringify({ completed: true, stars, highScore, bestTime: 90 });

test("the save summary does not count the secret stage (a finished game reads as it did before his result was kept)", () => {
  const s = summarize({ 'sloth_lvl_1-1': done(2, 500), [`sloth_lvl_${THORNBARK_LEVEL.id}`]: done(3, 9000) });
  assert.deepEqual({ cleared: s.stagesCleared, stars: s.stars }, { cleared: 1, stars: 2 });
});

test("The End's expedition score does not add the secret stage's score", () => {
  const mem = memStorage({ 'sloth_lvl_1-1': done(2, 500), [`sloth_lvl_${THORNBARK_LEVEL.id}`]: done(3, 9000) });
  assert.equal(withLocalStorage(mem, () => expeditionScore()), 500);
});
