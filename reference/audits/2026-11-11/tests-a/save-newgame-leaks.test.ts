/**
 * Audit 2026-11-11, slice "save" — what belongs to one adventure but is NOT on saveFile.ts's allow-list, so it survives New Game,
 * is left in place by Load, and never travels in a save file.
 *
 * saveFile.ts decides what "a game" is with one list of key patterns (ALLOWED, saveFile.ts:26-48). New Game (resetProgress) removes
 * exactly those plus Dot's memory; Load (applySave) replaces exactly those; Save (buildSave) writes exactly those. A per-adventure
 * key that nobody added to the list is silently device-global. Three are proved here (all fail today):
 *
 *   sloth_story_b<w>         App.tsx:128 "a guardian's intro has been seen (a long one is shortened on the retries)". The pattern
 *                            is /^sloth_story_[wmng]\d{1,2}$/: no `b`. After New Game the final guardian's intro is already cut to
 *                            its 2-line retry version (storyBosses.ts RETRY_INTRO_LINES = { 10: 2 }) the first time the new
 *                            adventure meets him.
 *   sloth_seed_<stage>_<n>   protoStage.ts:6835 "golden seeds: the secrets, saved per stage". In a new adventure every golden seed
 *                            reads "GOLDEN SEED (found before)" and scores 200 instead of 1000 (engine.ts:2977-2985); a save file
 *                            moved to a new phone has none of them.
 *   sloth_flag_resume        flagResume.ts: the flag of the run the phone cut off. New Game and Load leave it, so the new game's
 *                            visit to that stage can start at the old game's flag (when the built stage has a flag there).
 *
 * (Not asserted, same root, listed in the findings: sloth_journal_told / sloth_journal_looked, sloth_dot_silk (written, never read),
 * sloth_dot_skip_offered.)
 *
 * FIXED LOOKS LIKE: one registry of every persisted key that says, per key, "adventure" or "device", and New Game / Load / Save are
 * derived from it; plus a test that scans src/ for every storage key written and fails when one is not in the registry.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySave, buildSave, parseSave, resetProgress, type Store } from '../../../../src/game/saveFile.ts';

function memStore(init: Record<string, string> = {}): Store & { m: Map<string, string> } {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}

/** a finished first adventure, as the game leaves it in storage */
const played = () => ({
  'sloth_lvl_10-9': JSON.stringify({ completed: true, stars: 2, highScore: 900, bestTime: 141 }),
  sloth_story_w10: '1',
  sloth_story_b10: '1', // the final guardian's intro has been seen
  'sloth_seed_2-3_seed': '1', // a golden seed found in 2-3
  sloth_flag_resume: JSON.stringify({ id: '1-1', x: 4895, y: 1369, at: Date.now() }), // the last run of 1-1 was cut off at a flag
});

const ADVENTURE_KEYS = ['sloth_story_b10', 'sloth_seed_2-3_seed', 'sloth_flag_resume'];

test('New Game forgets everything that belongs to the old adventure', () => {
  const st = memStore(played());
  resetProgress(st);
  assert.equal(st.m.has('sloth_lvl_10-9'), false, 'set-up: the stage results are gone');
  assert.deepEqual(ADVENTURE_KEYS.filter((k) => st.m.has(k)), [], 'still in storage after New Game');
});

test('a save file carries the whole adventure, and loading one replaces the whole adventure', () => {
  const file = buildSave(memStore(played()));
  assert.deepEqual(['sloth_story_b10', 'sloth_seed_2-3_seed'].filter((k) => !(k in file.data)), [], 'missing from the save file');
  // a beginner's save loaded over a finished game on this phone
  const beginner = parseSave(JSON.stringify(buildSave(memStore({ 'sloth_lvl_1-1': JSON.stringify({ completed: true, stars: 1, highScore: 100, bestTime: 200 }) }))));
  assert.ok(beginner.ok);
  if (!beginner.ok) return;
  const phone = memStore(played());
  applySave(phone, beginner.save);
  assert.deepEqual(ADVENTURE_KEYS.filter((k) => phone.m.has(k)), [], 'left over from the replaced game after Load');
});
