/**
 * ENGINE-AUDIT-C findings C-01 and C-04 (2026-11-11). Assert the CORRECT behaviour; FAIL on t-int-1-1 @ fa5ad9d1.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/app-story-keys.test.ts
 *
 * App.tsx keeps "seen once" story flags in localStorage under keys it builds itself (not exported, so this reads the source).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isSaveKey, resetProgress, type Store } from '../../../../src/game/saveFile.ts';
import { WORLD_GATE } from '../../../../src/game/story.ts';

const app = readFileSync(new URL('../../../../src/App.tsx', import.meta.url), 'utf8');
/** the key a `const <name> = (...) => \`...\`` builder in App.tsx makes for world `w` (a boss stage of that world, not the secret one) */
function keyOf(name: string, w: number): string {
  const m = new RegExp(`const ${name} = \\(([^)]*)\\) => \`([^\`]*)\``).exec(app);
  assert.ok(m, `App.tsx no longer defines ${name} as a one-line template (update this test)`);
  const arg = m[1].split(':')[0].trim();
  // eslint-disable-next-line no-new-func
  return new Function(arg, `return \`${m[2]}\`;`)(arg === 'lvl' ? { secret: false, worldIndex: w } : w) as string;
}
const mapStore = (init: Record<string, string>): Store & { m: Map<string, string> } => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k), keys: () => [...m.keys()] };
};

test('C-01: the gate scene and the guardian card do not share a storage key', () => {
  for (const w of Object.keys(WORLD_GATE).map(Number)) {
    assert.notEqual(
      keyOf('gateStoryKey', w),
      keyOf('guardianCardKey', w),
      `World ${w}: markGateStorySeen (after ${w}-9) writes the same key hasSeenGuardianCard reads, so the guardian's first-time card is skipped`,
    );
  }
});

test('C-04: every story flag App.tsx writes belongs to the save (a New Game clears it, a save file carries it)', () => {
  const builders = ['worldStoryKey', 'midStoryKey', 'guardianCardKey', 'bossIntroKey', 'gateStoryKey'];
  const missing = builders.map((b) => keyOf(b, 10)).filter((k) => !isSaveKey(k));
  assert.deepEqual(missing, [], 'story flags outside saveFile.ts ALLOWED');
});

test('C-04: a New Game plays the final guardian\'s whole intro again', () => {
  // (storyBosses.ts RETRY_INTRO_LINES = { 10: 2 }: with the flag left behind, the new adventure's first meeting is cut to 2 lines)
  const st = mapStore({ [keyOf('bossIntroKey', 10)]: '1', 'sloth_lvl_1-1': '{"completed":true}' });
  resetProgress(st);
  assert.equal(st.m.has(keyOf('bossIntroKey', 10)), false, 'the "intro seen" flag survived resetProgress');
});
