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
import { isSaveKey, resetProgress, type Store } from './saveFile.ts';
import { bossIntroKey, gateStoryKey, guardianCardKey, midStoryKey, worldStoryKey } from './storyFlags.ts';

const mapStore = (init: Record<string, string>): Store & { m: Map<string, string> } => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
};
/** a boss stage of world `w` (not the secret one) */
const boss = (w: number) => ({ worldIndex: w });

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
