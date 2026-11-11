/**
 * Audit 2026-11-11, slice "save" — Load (saveFile.ts applySave, saveFile.ts:178-182) is not all-or-nothing.
 *
 * PROVES (fails today): applySave first removes every game entry on the phone and then writes the file's entries one setItem at a
 * time. When a write throws part-way (the storage is full: QuotaExceededError; or the WebView's storage is blocked), the dialog
 * catches it and says "Could not write the save into this browser." (SaveLoadDialog.tsx:121), but by then the game that WAS on the
 * phone has been erased and only part of the file is in. The screen still shows the old game (React state is not re-read on this
 * path: onLoaded is not called), so the player sees nothing wrong until the next start: old progress gone, a few stages of the file.
 *
 * FIXED LOOKS LIKE: a failed Load leaves the phone's game exactly as it was (write the new entries first / keep the old ones until
 * every write has succeeded, and put them back when one throws).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySave, buildSave, parseSave, type Store } from '../../../../src/game/saveFile.ts';

function memStore(init: Record<string, string> = {}): Store & { m: Map<string, string> } {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}
const done = (stars: number) => JSON.stringify({ completed: true, stars, highScore: 1000, bestTime: 120 });

test('a Load that fails part-way leaves the game on the phone as it was', () => {
  // the file: a small game from another phone
  const file = parseSave(JSON.stringify(buildSave(memStore({ 'sloth_lvl_1-1': done(1), 'sloth_lvl_1-2': done(1), 'sloth_lvl_1-3': done(1) }))));
  assert.ok(file.ok);
  if (!file.ok) return;
  // the phone: forty stages cleared, and storage that takes one more write and then is full
  const phone = memStore();
  for (let w = 1; w <= 4; w++) for (let m = 1; m <= 10; m++) phone.m.set(`sloth_lvl_${w}-${m}`, done(3));
  const before = new Map(phone.m);
  let writes = 0;
  const full: Store = {
    ...phone,
    setItem: (k, v) => {
      if (++writes > 1) throw new DOMException('The quota has been exceeded.', 'QuotaExceededError');
      phone.m.set(k, v);
    },
  };
  assert.throws(() => applySave(full, file.save), 'set-up: the Load failed (SaveLoadDialog shows "Could not write the save")');
  assert.deepEqual(
    { stagesOnPhone: [...phone.m.keys()].filter((k) => k.startsWith('sloth_lvl_')).length },
    { stagesOnPhone: before.size },
    'stage results left on the phone after the failed Load (40 before it)',
  );
});
