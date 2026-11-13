/**
 * The keys a New Game clears and a save file carries, as the game's own writers write them (EN-F quality check, 2026-11-12: the
 * golden-seed pattern could not match a hyphen, and every real seed key but 1-1's carries one, `sloth_seed_1-5_seed-2`; the tests had
 * checked made-up keys). Each key here comes from its writer: the golden seeds from the stages the game builds (engine.ts takes
 * `findId ?? 'seed'` and protoStage.ts markSeedFound writes it), the run flag from flagResume.ts saveFlag, the journal's marks from
 * movesJournal.ts, Dot's help setting from dotGuideHelp.ts setDotHelp.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { markSeedFound } from './protoStage.ts';
import { saveFlag } from './flagResume.ts';
import { markLooked, takeNewlyOpened, PAGES } from './movesJournal.ts';
import { setDotHelp } from './dotGuideHelp.ts';
import { memStorage, withLocalStorage } from './saveFill.ts';
import { buildSave, isAdventureKey, isSaveKey, resetProgress } from './saveFile.ts';

/** the golden-seed keys the game writes when every seed of these stages is picked up (built as the game builds them) */
function seedKeys(ids: string[]): string[] {
  const mem = memStorage();
  for (const id of ids) {
    const e = new RealPlay(id, 1).e as unknown as { collectibles: Array<{ type: string; findId?: string }>; stop(): void };
    const seeds = e.collectibles.filter((c) => c.type === 'seed');
    assert.ok(seeds.length > 0, `set-up: ${id} has golden seeds`);
    withLocalStorage(mem, () => seeds.forEach((c) => markSeedFound(id, c.findId ?? 'seed')));
    e.stop();
  }
  return [...mem.m.keys()];
}

test("every golden seed the game writes is part of the adventure: a save file carries it, a New Game clears it", () => {
  // (1-1's seed has no find id; 1-6's two are `seed-1`, `seed-2`: 1-5 rolls on gen2 from 11-13 and its one seed has none)
  const keys = seedKeys(['1-1', '1-6']);
  assert.ok(keys.some((k) => k.includes('-', 'sloth_seed_1-6_'.length)), `set-up: a seed key with its find id (${keys.join(', ')})`);
  assert.deepEqual(keys.filter((k) => !isSaveKey(k)), [], 'golden-seed keys on no list');
  const mem = memStorage(Object.fromEntries(keys.map((k) => [k, '1'])));
  assert.deepEqual(Object.keys(buildSave(mem).data).sort(), [...keys].sort(), 'the save file carries every seed');
  resetProgress(mem);
  assert.deepEqual([...mem.m.keys()], [], 'a New Game clears every seed');
});

test("what this adventure did on this phone, as its writers write it, is cleared by a New Game and not carried by a file", () => {
  const mem = memStorage();
  saveFlag('1-5', 5000, 800, { t: 30, lives: 3, score: 120, got: [], beat: [], n: {}, kills: {}, seen: [] }, Date.now(), mem);
  setDotHelp('quiet', mem);
  withLocalStorage(mem, () => {
    markLooked(PAGES[0].id);
    takeNewlyOpened(new Set([PAGES[0].id]));
  });
  const keys = [...mem.m.keys()];
  assert.equal(keys.length, 4, `set-up: the four writers wrote (${keys.join(', ')})`);
  assert.deepEqual(keys.filter((k) => !isAdventureKey(k) || isSaveKey(k)), [], 'keys not in the "this adventure on this phone" class');
  resetProgress(mem);
  assert.deepEqual([...mem.m.keys()], [], 'a New Game clears them');
});
