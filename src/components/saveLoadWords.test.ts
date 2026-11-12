/**
 * The Save / Load dialog's words match what the save file carries (PROOF-1 violation 3). Since audit C saves #8 the file carries no
 * sound setting (saveFile.ts ALLOWED: mute and volumes belong to the device; an old file's are dropped as it is read), but the dialog
 * still told the player it saves "your sound settings". The words are the story keeper's (reference/packets/2026-11-12/STORY-LINES.md,
 * 11:35 AM ET); each promise is checked here against a real save made by buildSave and read back by parseSave and applySave.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { applySave, buildSave, isSaveKey, parseSave, type Store } from '../game/saveFile.ts';

/** the words the player sees: JSX text and strings, with comments dropped and the markup's tags taken out */
const src = readFileSync(new URL('./SaveLoadDialog.tsx', import.meta.url), 'utf8').replace(/\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const words = src.replace(/<\/?b>/g, '').replace(/\s+/g, ' ');

const mapStore = (m: Map<string, string>): Store => ({
  getItem: (k) => m.get(k) ?? null,
  setItem: (k, v) => void m.set(k, v),
  removeItem: (k) => void m.delete(k),
  keys: () => [...m.keys()],
});

/** a played phone: a stage cleared, a story seen, a note found, sound turned down; saved to a file and loaded on a fresh phone */
function roundTrip() {
  const phone = new Map<string, string>([
    ['sloth_lvl_1-1', JSON.stringify({ completed: true, stars: 3, highScore: 4000, bestTime: 120 })],
    ['sloth_story_w1', '1'],
    ['sloth_finds', JSON.stringify({ v: 1, found: ['w1_note'] })],
    ['sloth_music_vol', '0.2'],
    ['sloth_sfx_vol', '0.3'],
    ['sloth_game_muted', '1'],
  ]);
  const parsed = parseSave(JSON.stringify(buildSave(mapStore(phone))));
  assert.ok(parsed.ok, 'the save file reads back');
  const other = new Map<string, string>();
  applySave(mapStore(other), (parsed as { save: Parameters<typeof applySave>[1] }).save);
  return other;
}

test('the file line: stages, stories and finds travel in the save file; sound does not, and the words say exactly that', () => {
  const loaded = roundTrip();
  assert.ok(loaded.has('sloth_lvl_1-1'), 'a stage result travels');
  assert.ok(loaded.has('sloth_story_w1'), 'a story seen travels');
  assert.ok(loaded.has('sloth_finds'), 'the things found (sloth_finds) travel');
  for (const k of ['sloth_music_vol', 'sloth_sfx_vol', 'sloth_game_muted']) assert.ok(!loaded.has(k) && !isSaveKey(k), `${k} does not travel`);
  assert.ok(words.includes('Saves your stages, the stories you have seen and the things you have found in one small file. Load it later, or on another device.'), "the story keeper's line, with finds (they travel)");
});

test('the dialog promises no sound setting, volume or mute (the file carries none)', () => {
  assert.ok(!/sound settings|\bvolume|\bmute/i.test(words), 'the dialog promises sound settings the file does not carry');
});

test('the save-error and load-note lines are the story keeper\'s', () => {
  assert.ok(words.includes("'Could not save it on this device.'"), 'the save error');
  assert.ok(!words.includes('Could not write the save into this browser.'), 'the old save error is gone');
  assert.ok(words.includes('Loading replaces the progress on this device with this save.'), 'the load note');
  assert.ok(!words.includes('with what is in the file'), 'the old load note is gone (it also shows for a pasted code)');
});
