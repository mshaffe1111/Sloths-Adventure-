// Writes the old-version save fixtures (src/game/fixtures/save-<version>-*.json) with THAT version's own code. Run from a worktree of the
// release, with src/game/saveFill.ts copied in: git worktree add /tmp/old origin/main && cp src/game/saveFill.ts /tmp/old/src/game/ &&
// cp tools/save/oldSaves.ts /tmp/old/ && (cd /tmp/old && npx tsx oldSaves.ts <this repo>/src/game/fixtures) (R-165.117, 2026-11-11: 0.9.5)
import { writeFileSync } from 'node:fs';
import { memStorage, fillFinds, fillCarvings, withLocalStorage } from './src/game/saveFill.ts';
import { buildSave, parseSave } from './src/game/saveFile.ts';
import { mergeBest } from './src/game/stageBest.ts';
const out = process.argv[2];
const at = new Date('2026-11-10T20:00:00Z');
// a mid-game: worlds 1-4 and 5-M cleared, 33 finds (0.9.5 loads it back); then the same game with Meeca's carvings (0.9.5 refuses it)
const mid = memStorage();
withLocalStorage(mid, () => {
  for (let w = 1; w <= 4; w++) for (let m = 1; m <= 10; m++) mid.setItem(`sloth_lvl_${w}-${m}`, JSON.stringify(mergeBest(null, { stars: 2, score: 4200, time: 131 }, 'normal')));
  mid.setItem('sloth_lvl_5-M', JSON.stringify(mergeBest(null, { stars: 3, score: 5100, time: 160 }, 'normal')));
  mid.setItem('sloth_difficulty', 'normal');
  mid.setItem('sloth_story_w1', '1');
});
fillFinds(mid, 33);
const midText = JSON.stringify(buildSave(mid, at), null, 2);
// the same game after Meeca's stage: 0.9.5 refuses it (R-165.117); kept to prove the fix loads what 0.9.5 wrote
fillCarvings(mid);
const midCarvedText = JSON.stringify(buildSave(mid, at), null, 2);
for (const [name, text] of [['save-0.9.5-mid.json', midText], ['save-0.9.5-after-5M.json', midCarvedText]] as const) {
  writeFileSync(`${out}/${name}`, text + '\n');
  const r = parseSave(text);
  console.log(name, text.length, '0.9.5 loads it:', r.ok ? 'yes' : `no (${r.reason})`);
}
