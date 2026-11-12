/**
 * ENGINE-AUDIT-C findings C-01 and C-04 (2026-11-11), brought into the suite from
 * reference/audits/2026-11-11/tests-c/app-story-keys.test.ts. The audit's copy read App.tsx's own key builders out of its source;
 * the builders now live in storyFlags.ts (one place), so this imports them, and a last test fails if a `sloth_story_` key is built
 * anywhere else in the game again.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applySave, buildSave, checksum, isSaveKey, parseSave, resetProgress, type Store } from './saveFile.ts';
import { WORLD_GATE } from './story.ts';
import { STORY_FLAGS_MOVED_KEY, bossIntroKey, gateStoryKey, guardianCardKey, midStoryKey, moveStoredStoryFlags, worldStoryKey } from './storyFlags.ts';

const mapStore = (init: Record<string, string>): Store & { m: Map<string, string> } => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
};
/** a boss stage of world `w` (not the secret one) */
const boss = (w: number) => ({ worldIndex: w });

test('C-01: the gate scene and the guardian card do not share a storage key', () => {
  for (const w of Object.keys(WORLD_GATE).map(Number)) {
    assert.notEqual(
      gateStoryKey(w),
      guardianCardKey(boss(w)),
      `World ${w}: markGateStorySeen (after ${w}-9) writes the same key hasSeenGuardianCard reads, so the guardian's first-time card is skipped`,
    );
  }
});

test('C-04: every story flag App.tsx writes belongs to the save (a New Game clears it, a save file carries it)', () => {
  const keys = [worldStoryKey(10), midStoryKey(10), guardianCardKey(boss(10)), bossIntroKey(10), gateStoryKey(10)];
  const missing = keys.filter((k) => !isSaveKey(k));
  assert.deepEqual(missing, [], 'story flags outside saveFile.ts ALLOWED');
});

test('C-04: a New Game plays the final guardian\'s whole intro again', () => {
  // (storyBosses.ts RETRY_INTRO_LINES = { 10: 2 }: with the flag left behind, the new adventure's first meeting is cut to 2 lines)
  const st = mapStore({ [bossIntroKey(10)]: '1', 'sloth_lvl_1-1': '{"completed":true}' });
  resetProgress(st);
  assert.equal(st.m.has(bossIntroKey(10)), false, 'the "intro seen" flag survived resetProgress');
});

test('every sloth_story_ key is built in storyFlags.ts (a builder kept anywhere else can drift off the save list)', () => {
  const src = fileURLToPath(new URL('..', import.meta.url));
  const files: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(f) && !/\.test\.tsx?$/.test(f) && !/(saveFill|storyFlags)\.ts$/.test(f)) files.push(p);
    }
  };
  walk(src);
  const hits = files.filter((p) => readFileSync(p, 'utf8').includes('sloth_story_')).map((p) => p.slice(src.length));
  assert.deepEqual(hits, [], 'files that build a sloth_story_ key themselves: use storyFlags.ts');
});

// ── C-01's move: a game from before the gate scene had its own flag keeps what it saw ──
/** 0.9.5's own mid-game save, as it would be once that player had cleared 10-9 and seen the gate scene (0.9.5 and 0.9.6 wrote it as g10) */
function oldSaveAfterGate(): string {
  const raw = JSON.parse(readFileSync(new URL('./fixtures/save-0.9.5-mid.json', import.meta.url), 'utf8'));
  assert.equal(raw.version, 1, 'the fixture is a version-1 save');
  raw.data['sloth_story_g10'] = '1';
  raw.checksum = checksum(raw.data);
  return JSON.stringify(raw);
}

test("C-01: an old save file that saw the gate scene does not see it again, and still gets the General's card", () => {
  const r = parseSave(oldSaveAfterGate());
  assert.ok(r.ok, r.ok ? '' : r.reason);
  if (!r.ok) return;
  const into = mapStore({});
  applySave(into, r.save);
  assert.equal(into.getItem(gateStoryKey(10)), '1', 'the gate scene stays seen');
  assert.equal(into.getItem(guardianCardKey(boss(10))), null, "the General's card has not been shown");
  assert.equal(into.getItem(worldStoryKey(1)), '1', 'the rest of the old save is as it was');
  // and the moved game saves and loads again as it is now
  const again = parseSave(JSON.stringify(buildSave(into)));
  assert.ok(again.ok);
  if (again.ok) assert.deepEqual(again.save.data, r.save.data);
});

test('C-01: a save file written now keeps the card it showed (only version-1 files are moved)', () => {
  const now = mapStore({ [guardianCardKey(boss(10))]: '1', [gateStoryKey(10)]: '1', 'sloth_lvl_10-9': '{"completed":true}' });
  const r = parseSave(JSON.stringify(buildSave(now)));
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.save.data[guardianCardKey(boss(10))], '1');
});

test("C-01: a phone's own old game is moved once at launch, and the card it shows afterwards stays shown", () => {
  const phone = mapStore({ sloth_story_g10: '1', sloth_story_g3: '1', 'sloth_lvl_10-9': '{"completed":true}' });
  moveStoredStoryFlags(phone);
  assert.equal(phone.getItem(gateStoryKey(10)), '1', 'the gate scene stays seen');
  assert.equal(phone.getItem(guardianCardKey(boss(10))), null, "the General's card is still to come");
  assert.equal(phone.getItem(guardianCardKey(boss(3))), '1', 'a world without a gate keeps its card flag');
  assert.equal(phone.getItem(STORY_FLAGS_MOVED_KEY), '1');
  assert.equal(isSaveKey(STORY_FLAGS_MOVED_KEY), false, 'the move is a device fact, not part of an adventure');
  phone.setItem(guardianCardKey(boss(10)), '1'); // the card is shown at 10-10
  moveStoredStoryFlags(phone); // the next launch
  assert.equal(phone.getItem(guardianCardKey(boss(10))), '1', 'the next launch does not move the card flag again');
  // a New Game on the moved phone writes the new shape: no second move
  resetProgress(phone);
  assert.equal(phone.getItem(STORY_FLAGS_MOVED_KEY), '1', 'a New Game keeps the device mark');
});
