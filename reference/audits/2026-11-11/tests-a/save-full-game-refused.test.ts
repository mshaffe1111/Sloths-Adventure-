/**
 * Audit 2026-11-11, slice "save" — Save & Load (src/game/saveFile.ts): a real game's own save file is refused on load.
 *
 * PROVES (both fail today): buildSave copies every game entry whatever its length, and parseSave refuses the whole file when any
 * entry is over its limit (saveFile.ts:152 `v.length > entryLimit(k)` -> "The save contains damaged entries."). The limit is 400
 * characters for everything except `sloth_badges` (12 000) and `sloth_play_*` (1 000), and two entries the game itself writes grow
 * past 400 in normal play:
 *   - `sloth_w5_carved` (meecaCarved.ts): Meeca's five warnings, written by clearing her stage 5-M, the stage that opens World 5.
 *     With all five it is about 480 characters. So from World 5 on, EVERY player's backup file (and "Copy save code") cannot be loaded.
 *   - `sloth_finds` (finds.ts): the notes, books and keepsakes. With 34 of the 47 it passes 400 characters.
 * Save succeeds and says "Keep it somewhere safe"; the player only finds out when they try to get the game back.
 *
 * This is the SAME defect that was fixed once for the Trophy Room (MAX_BADGE_ENTRY_CHARS, and the test "a save with every trophy
 * earned still loads" in saveFile.test.ts): that fix gave one key more room and its test pins that one key, so the cause (a limit
 * that is checked on load but not derived from, or checked against, what the game writes) came back for the next two keys that grew.
 *
 * FIXED LOOKS LIKE: what buildSave writes from a real, complete game always loads. Either the limit is per key and derived from each
 * record's real maximum (with a test that builds the biggest real record of EVERY allowed key: all finds, all carvings, every
 * trophy, a full play record, every memory, and round-trips it), or buildSave refuses/repairs at save time so a file that says
 * "saved" is one that loads.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSave, parseSave, type Store } from '../../../../src/game/saveFile.ts';
import { ALL_FINDS, FINDS_KEY } from '../../../../src/game/finds.ts';
import { MEECA_WARNINGS } from '../../../../src/game/meecaLines.ts';
import { CARVED_KEY, markCarvingsDone, recordCarving } from '../../../../src/game/meecaCarved.ts';

function memStore(): Store & { m: Map<string, string> } {
  const m = new Map<string, string>();
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}

const stage = (stars: number) => JSON.stringify({ completed: true, stars, highScore: 4200, bestTime: 131, starsMode: 'normal', scoreMode: 'normal', timeMode: 'normal' });

test("a game that has cleared Meeca's stage (5-M) can load its own save file", () => {
  const st = memStore();
  for (let w = 1; w <= 4; w++) for (let m = 1; m <= 10; m++) st.setItem(`sloth_lvl_${w}-${m}`, stage(2));
  st.setItem('sloth_lvl_5-M', stage(3));
  // her five warnings, written the way meecaPlay.ts:752 writes them (each cut somewhere along her stage), then the clear
  MEECA_WARNINGS.forEach((w, i) => recordCarving({ id: w.id, lines: [...w.lines], along: Math.round(((i + 1) / 6.3) * 1000) / 1000, high: i === 3, caught: 0 }, st as never));
  markCarvingsDone(st as never);
  const text = JSON.stringify(buildSave(st));
  const r = parseSave(text);
  assert.ok(r.ok, `the game's own save file was refused: "${r.ok ? '' : r.reason}" (sloth_w5_carved is ${st.getItem(CARVED_KEY)!.length} characters; the limit is 400)`);
});

test('a game with every note, book and keepsake found can load its own save file', () => {
  const st = memStore();
  st.setItem('sloth_lvl_1-1', stage(3));
  let firstRefused = 0;
  for (let n = 1; n <= ALL_FINDS.length && !firstRefused; n++) {
    // (finds.ts saveFinds writes exactly this)
    st.setItem(FINDS_KEY, JSON.stringify({ v: 1, found: ALL_FINDS.slice(0, n).map((f) => f.id) }));
    if (!parseSave(JSON.stringify(buildSave(st))).ok) firstRefused = n;
  }
  assert.equal(firstRefused, 0, `the save file is refused from ${firstRefused} finds on (of ${ALL_FINDS.length}); sloth_finds is then ${st.getItem(FINDS_KEY)!.length} characters and the limit is 400`);
});
