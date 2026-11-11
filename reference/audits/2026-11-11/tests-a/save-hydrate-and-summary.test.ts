/**
 * Audit 2026-11-11, slice "save" — how a stored stage result (`sloth_lvl_<id>`) is read back: two readers, two different rules.
 *
 * PROVES (all three fail today):
 *  1. worldsData.ts:358-364 (generateAllLevels, the game's own hydration) copies `stars`, `highScore` and `bestTime` out of the
 *     stored JSON with `parsed.stars || 0`: no type check, no range. saveFile.ts parseSave only checks that a stage result is an
 *     object (saveFile.ts:164-172), so a save file (or storage) holding "stars":"3" or stars: 1e9 goes straight into LevelConfig.
 *     The title's "Continue" card then adds them with `a + (l.stars || 0)` (App.tsx:198): strings concatenate ("033"), and a huge
 *     number is shown as the star total; mergeBest (stageBest.ts) then keeps a number over 3 for good because no real run beats it.
 *     saveFile.ts summarize (line 115) DOES clamp the same field to 0..3, so the Save & Load dialog and the title disagree.
 *  2. The same two readers disagree about WHICH stages count: summarize's pattern (saveFile.ts:110 /^sloth_lvl_(\d{1,2}|S)-\d{1,2}$/)
 *     leaves out the extra stages 4-D and 5-M, which the allow-list (line 27) and generateAllLevels both include. A game that has
 *     cleared both shows two more stages and up to six more stars on the title than in "Save & Load" and "New Game: this erases...".
 *  3. summarize counts a result for a stage that does not exist (a stage id from a re-laid world, or junk like 99-9) as a cleared
 *     stage and a started world; the game itself never reads it. expeditionScore (BossCards.tsx:101) adds its score to the total too.
 *
 * FIXED LOOKS LIKE: one parser for a stage result (typed, clamped: stars 0..3 integer, score and time finite and >= 0), used by
 * generateAllLevels, withExtraStages, summarize, expeditionScore and parseSave; and one list of real stage ids that all of them ask.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { summarize } from '../../../../src/game/saveFile.ts';

test('a stage result with the wrong types is not hydrated as-is', () => {
  localStorage.clear();
  localStorage.setItem('sloth_lvl_1-1', '{"completed":true,"stars":"3","highScore":"900","bestTime":"41"}');
  localStorage.setItem('sloth_lvl_1-2', '{"completed":true,"stars":1000000000,"highScore":-5,"bestTime":-1}');
  const levels = generateAllLevels();
  localStorage.clear();
  const l11 = levels.find((l) => l.id === '1-1')!;
  const l12 = levels.find((l) => l.id === '1-2')!;
  // App.tsx:198, the "Continue" card's star total
  const total = levels.reduce((a, l) => a + (l.stars || 0), 0);
  assert.deepEqual(
    { stars11: typeof l11.stars, score11: typeof l11.highScore, stars12InRange: l12.stars >= 0 && l12.stars <= 3, total: typeof total },
    { stars11: 'number', score11: 'number', stars12InRange: true, total: 'number' },
    `hydrated 1-1 stars=${JSON.stringify(l11.stars)}, 1-2 stars=${l12.stars}, title total=${JSON.stringify(total)}`,
  );
});

test("the save summary counts the same stages the game does (Dot's 4-D and Meeca's 5-M are stages)", () => {
  const done = JSON.stringify({ completed: true, stars: 3, highScore: 500, bestTime: 90 });
  const s = summarize({ 'sloth_lvl_4-5': done, 'sloth_lvl_4-D': done, 'sloth_lvl_5-M': done });
  assert.deepEqual({ cleared: s.stagesCleared, stars: s.stars }, { cleared: 3, stars: 9 }, 'three cleared stages with three stars each');
});

test('a result for a stage that does not exist is not counted as progress', () => {
  const s = summarize({ 'sloth_lvl_99-9': JSON.stringify({ completed: true, stars: 3, highScore: 500, bestTime: 90 }) });
  assert.deepEqual({ cleared: s.stagesCleared, worlds: s.worldsStarted }, { cleared: 0, worlds: 0 }, 'there is no World 99');
});
