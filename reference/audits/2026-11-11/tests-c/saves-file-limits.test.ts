/**
 * Audit C (saves): a save file the game itself makes must load again.
 * saveFile.ts parseSave refuses any entry longer than MAX_ENTRY_CHARS (400), except sloth_badges and sloth_play_*.
 * The game's own writers make longer entries: Meeca's finished carvings (sloth_w5_carved) and a full set of finds (sloth_finds).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSave, parseSave, type Store } from '../../../../src/game/saveFile.ts';
import { MEECA_WARNINGS } from '../../../../src/game/meecaLines.ts';
import { CARVED_KEY, markCarvingsDone, recordCarving } from '../../../../src/game/meecaCarved.ts';
import { ALL_FINDS } from '../../../../src/game/finds.ts';

function mapStore(): Store & Pick<Storage, 'getItem' | 'setItem'> {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
}

test("a save made after Meeca's stage (all five warnings cut) loads again", () => {
  const s = mapStore();
  // exactly what meecaPlay.ts:752 writes: each warning's own lines, `along` rounded to 3 places
  MEECA_WARNINGS.forEach((w, i) => recordCarving({ id: w.id, lines: [...w.lines], along: Math.round(((i + 1) / 6) * 1000) / 1000, high: i === 3, caught: 0 }, s));
  markCarvingsDone(s);
  const raw = s.getItem(CARVED_KEY)!;
  const r = parseSave(JSON.stringify(buildSave(s)));
  assert.ok(r.ok, `sloth_w5_carved is ${raw.length} characters: ${r.ok ? '' : r.reason}`);
});

test('a save with every find collected loads again', () => {
  const s = mapStore();
  // exactly what finds.ts saveFinds writes
  s.setItem('sloth_finds', JSON.stringify({ v: 1, found: ALL_FINDS.map((f) => f.id) }));
  const raw = s.getItem('sloth_finds')!;
  const r = parseSave(JSON.stringify(buildSave(s)));
  assert.ok(r.ok, `sloth_finds is ${raw.length} characters with ${ALL_FINDS.length} finds: ${r.ok ? '' : r.reason}`);
});
