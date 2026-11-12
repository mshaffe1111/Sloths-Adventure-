/**
 * The Save / Load dialog's words match what the save file carries (PROOF-1 violation 3). Since audit C saves #8 the file carries no
 * sound setting (saveFile.ts ALLOWED: mute and volumes belong to the device; an old file's are dropped as it is read), but the dialog
 * still told the player it saves "your sound settings". Player text is never written here: the story keeper writes it.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isSaveKey } from '../game/saveFile.ts';

/** the words the player sees: JSX text and strings, with comments dropped */
const words = readFileSync(new URL('./SaveLoadDialog.tsx', import.meta.url), 'utf8').replace(/\{\/\*[\s\S]*?\*\/\}|\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');

/** each device-only setting a player might be told the file holds, the words that would promise it, and a key that would carry it */
const DEVICE_ONLY: Array<[string, RegExp, string[]]> = [
  ['sound settings', /sound settings|\bvolume|\bmute/i, ['sloth_music_vol', 'sloth_sfx_vol', 'sloth_game_muted']],
];

for (const [what, promise, keys] of DEVICE_ONLY) {
  test(`the Save / Load words promise ${what} only if the save file carries them`, () => {
    const promises = promise.test(words);
    const carries = keys.some(isSaveKey);
    assert.equal(promises, carries, `the dialog ${promises ? 'promises' : 'does not mention'} ${what}; the file ${carries ? 'carries' : 'does not carry'} them`);
  });
}
