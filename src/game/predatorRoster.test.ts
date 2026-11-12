// The roster's rules (reference/design/PREDATORS.md §0, §2): one habit an animal, no two animals in a world's cast with the same
// habit, every habit used somewhere, and World 1's data agreeing with the roster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASTS, HABIT, SPECIAL_CASTS, type Kind } from './predators/roster.ts';
import { WORLD1 } from './predators/world1.ts';
import type { Habit } from './predators/types.ts';

const ALL: Habit[] = ['patrol', 'ambush', 'stalk', 'charge', 'sweep', 'drop', 'guard', 'seek'];

test('no two animals in one world share a habit, and every world has a cast of at least two', () => {
  for (let w = 1; w <= 10; w++) {
    const cast = CASTS[w];
    assert.ok(cast && cast.length >= 2, `World ${w} has a cast`);
    const seen = new Map<Habit, Kind>();
    for (const k of cast) {
      const h = HABIT[k];
      assert.ok(h, `${k} has a habit`);
      assert.equal(seen.get(h), undefined, `World ${w}: ${k} and ${seen.get(h)} both ${h}`);
      seen.set(h, k);
    }
  }
});

test('every habit in the kit is used by somebody, and every animal is in a cast', () => {
  const used = new Set<Habit>(Object.values(HABIT));
  for (const h of ALL) assert.ok(used.has(h), `nobody has the habit ${h}`);
  const cast = new Set<string>([...Object.values(CASTS).flat(), ...Object.values(SPECIAL_CASTS).flat()]);
  for (const k of Object.keys(HABIT)) assert.ok(cast.has(k), `${k} is in no cast`);
});

test("World 1's data is World 1's cast, with the roster's habits", () => {
  assert.deepEqual(WORLD1.map((d) => d.kind).sort(), [...CASTS[1]].sort());
  for (const d of WORLD1) assert.equal(d.habit, HABIT[d.kind as Kind], d.kind);
});
