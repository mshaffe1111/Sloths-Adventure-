/**
 * Audit C (saves): loading a save file (saveFile.ts applySave).
 * 1. It deletes the current game first and writes the new one after, with nothing to undo it: a write that throws half-way (a full
 *    phone) leaves neither game. PLAY-STORE-RULES §6.8: "Saves survive everything ... a full phone."
 * 2. It treats the sound settings as part of the game (deletes this phone's, writes the file's), while resetProgress says they
 *    "belong to the device, not to an adventure" (KEEP_ON_NEW_GAME).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySave, buildSave, type Store } from '../../../../src/game/saveFile.ts';

function mapStore(init: Record<string, string>, failAfter = Infinity): Store {
  const m = new Map(Object.entries(init));
  let writes = 0;
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      if (++writes > failAfter) throw new Error('QuotaExceededError');
      m.set(k, v);
    },
    removeItem: (k) => void m.delete(k),
    keys: () => [...m.keys()],
  };
}

const lvl = (stars: number) => JSON.stringify({ completed: true, stars, highScore: 1000, bestTime: 90 });

test('a load that fails half-way leaves the game that was on the phone', () => {
  const file = buildSave(mapStore({ 'sloth_lvl_1-1': lvl(1), 'sloth_lvl_1-2': lvl(1), 'sloth_lvl_1-3': lvl(1) }));
  const phone = mapStore({ 'sloth_lvl_1-1': lvl(3), 'sloth_lvl_1-2': lvl(3), 'sloth_lvl_2-5': lvl(3), sloth_badges: '{"v":1}' }, 1);
  assert.throws(() => applySave(phone, file)); // SaveLoadDialog.tsx:121 then says "Could not write the save into this browser."
  assert.equal(phone.getItem('sloth_lvl_2-5'), lvl(3), 'the old game was deleted before the new one was safely written');
});

test("loading a save that carries no sound settings keeps this phone's mute", () => {
  const file = buildSave(mapStore({ 'sloth_lvl_1-1': lvl(2) }));
  const phone = mapStore({ sloth_game_muted: 'true', sloth_music_vol: '0.2' });
  applySave(phone, file);
  assert.equal(phone.getItem('sloth_game_muted'), 'true', "the phone's mute was deleted by the load (it comes back loud at the next launch)");
});
