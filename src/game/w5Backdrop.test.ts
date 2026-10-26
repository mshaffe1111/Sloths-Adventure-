import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { W5_STEMS, w5BackdropStem, w5Mood } from './w5Backdrop.ts';

test("World 5's light goes gold, dusk, twilight as the orchids close (Matt, 2026-10-26)", () => {
  const moods = Array.from({ length: 9 }, (_, i) => w5Mood(`5-${i + 1}`));
  assert.deepEqual(moods, ['gold', 'gold', 'gold', 'dusk', 'dusk', 'dusk', 'twilight', 'twilight', 'twilight']);
  // Meeca's bonus stage (after 5-5) is dusk too, whatever its id ends up being
  assert.equal(w5Mood('5-M'), 'dusk');
  assert.equal(w5Mood('4-5'), null);
  assert.equal(w5BackdropStem('4-5'), null);
});

test('the two takes of each mood alternate stage to stage: no two stages in a row look the same', () => {
  const stems = Array.from({ length: 10 }, (_, i) => w5BackdropStem(`5-${i + 1}`)!);
  for (let i = 1; i < stems.length; i++) assert.notEqual(stems[i], stems[i - 1], `5-${i} and 5-${i + 1}`);
  assert.equal(stems[0], 'w5', "5-1 is the world's own face (the map, the title)");
  assert.deepEqual(new Set(stems.slice(0, 9)), new Set(W5_STEMS), 'every take is used');
});

test("every World 5 strip set is on disk, far, mid and near, and the arena's two paintings", () => {
  for (const s of W5_STEMS) {
    for (const p of ['far', 'mid', 'near']) assert.ok(existsSync(new URL(`../assets/backdrops/${s}-${p}.webp`, import.meta.url)), `${s}-${p}`);
  }
  for (const t of ['table', 'webs']) assert.ok(existsSync(new URL(`../assets/backdrops/w5arena-${t}.webp`, import.meta.url)), t);
});
