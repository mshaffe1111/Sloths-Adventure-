// PROOF-1 defect test (fails on d0276817): the Save / Load dialog tells the player the file carries "your sound settings", but since
// EN-F saves#8 the save file carries no sound setting (saveFile.ts ALLOWED; an old file's are dropped as it is read).
//   npx tsx --test reference/qa-reports/PROOF-1/runtime/saveCopy.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isSaveKey } from '../../../../src/game/saveFile.ts';
test('the Save / Load words match what the save file carries', () => {
  const tsx = readFileSync(new URL('../../../../src/components/SaveLoadDialog.tsx', import.meta.url), 'utf8');
  const promisesSound = /sound settings/i.test(tsx.replace(/\{\/\*[\s\S]*?\*\/\}|\/\/.*$/gm, ''));
  const carriesSound = ['sloth_music_vol', 'sloth_sfx_vol', 'sloth_game_muted'].some(isSaveKey);
  assert.equal(promisesSound, carriesSound, `the dialog ${promisesSound ? 'promises' : 'does not mention'} sound settings; the file ${carriesSound ? 'carries' : 'does not carry'} them`);
});
