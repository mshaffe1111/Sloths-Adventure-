// The roster's rules (reference/design/PREDATORS.md §0, §2): one habit an animal, no two animals in a world's cast with the same
// habit, every habit used somewhere, and World 1's data agreeing with the roster.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CASTS_AFTER_1, HARPY, JAGUAR, OCELOT, RIVER_GUARD, TAYRA, TURTLE } from './predators/casts.ts';
import { CASTS, HABIT, SPECIAL_CASTS, TAUGHT, inWorld, type Kind } from './predators/roster.ts';
import { BOA, EAGLE, SNAKE, WORLD1 } from './predators/world1.ts';
import type { Habit, Way } from './predators/types.ts';

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

// ───────────────────────────── the move ladder ─────────────────────────────
// The lead, 11-11 9:56 PM ET: a way to beat a creature is only there in a world at or after the world that teaches its move.

const DEFS = [...WORLD1, ...CASTS_AFTER_1];
const worldsOf = (kind: string): number[] => Object.keys(CASTS).map(Number).filter((w) => (CASTS[w] as readonly string[]).includes(kind));

test('the ladder itself: World 1 teaches the hits, traps, stillness and the food chain; the bell is World 2\'s; thrown noise and the drum wait for World 3', () => {
  assert.equal(TAUGHT.bell, 2, 'the lead, 10:06 PM ET: the bell stays in World 2');
  assert.deepEqual([TAUGHT.punch, TAUGHT.trap, TAUGHT.still, TAUGHT.lure, TAUGHT.noise, TAUGHT.drum, TAUGHT.wind, TAUGHT.dew, TAUGHT.break, TAUGHT.light, TAUGHT.geyser],
    [1, 1, 1, 1, 3, 3, 4, 5, 7, 8, 9]);
});

test('in a world, an animal can only be beaten by moves that world has been taught, and never hears a lure before noise is taught', () => {
  const eagle1 = inWorld(EAGLE, 1);
  assert.equal(eagle1.hears, undefined, 'World 1: his own landing must not pull the shadow off him');
  assert.deepEqual(Object.keys(eagle1.beatenBy), ['still'], 'in World 1 the eagle is stillness and cover only');
  assert.equal(inWorld(EAGLE, 4).hears, EAGLE.hears, 'the noise lure comes back in World 4');
  assert.equal(inWorld(TURTLE, 2).hears, TURTLE.hears, 'World 2: the turtles answer the bell');
  assert.equal(inWorld(RIVER_GUARD, 2).hears, RIVER_GUARD.hears, 'and so does the River King\'s guard');
  assert.deepEqual(Object.keys(inWorld(JAGUAR, 3).beatenBy).sort(), ['drum', 'punch', 'trap'], 'no light before World 8, no geyser before 9');
  assert.ok(inWorld(JAGUAR, 9).beatenBy.geyser && inWorld(JAGUAR, 8).beatenBy.light && !inWorld(JAGUAR, 8).beatenBy.geyser);
  // the food chain needs the hunter it fears in the same world
  assert.ok(inWorld(BOA, 1).beatenBy.lure, 'the eagle is in World 1');
  assert.equal(inWorld(BOA, 7).beatenBy.lure, undefined, 'no eagle over the ruins');
  assert.ok(inWorld(TAYRA, 6).beatenBy.lure && !inWorld(TAYRA, 9).beatenBy.lure && inWorld(TAYRA, 9).beatenBy.geyser);
  assert.ok(inWorld(HARPY, 8).beatenBy.lure, "the owl is World 8's");
  assert.equal(inWorld(SNAKE, 1), SNAKE, 'nothing to take away: the same data');
});

test('every animal, in every world it is cast in: its first way is taught by then, and it keeps two ways or more', () => {
  // the one exception, by the lead's ruling: World 1's eagle cannot be fought at all; it is beaten by stillness in cover, and only that
  const ONE_WAY = new Set(['1 eagle']);
  let checked = 0;
  for (const d of DEFS) {
    const worlds = worldsOf(d.kind);
    assert.ok(worlds.length, `${d.kind} is in a cast`);
    assert.ok(TAUGHT[d.first] <= worlds[0], `${d.kind}: its first way (${d.first}, World ${TAUGHT[d.first]}) is taught after it first appears (World ${worlds[0]})`);
    for (const w of worlds) {
      const here = inWorld(d, w);
      const ways = Object.keys(here.beatenBy).length + (here.hears ? 1 : 0);
      checked++;
      if (ONE_WAY.has(`${w} ${d.kind}`)) assert.equal(ways, 1, `${d.kind} in World ${w}`);
      else {
        assert.ok(ways >= 2, `${d.kind} in World ${w} has ${ways} way(s) left: ${Object.keys(here.beatenBy)}`);
        assert.ok(Object.keys(here.beatenBy).some((x) => x !== 'stomp'), `${d.kind} in World ${w}: never only the stomp`);
      }
      for (const way of Object.keys(here.beatenBy) as Way[]) assert.ok(TAUGHT[way] <= w, `${d.kind} in World ${w}: ${way} is taught in World ${TAUGHT[way]}`);
    }
  }
  assert.ok(checked >= 20, `${checked} animal-in-a-world places checked`);
});

test('planted: an animal whose first way is a later world\'s move is caught', () => {
  const early = { ...OCELOT, first: 'light' as Way };
  assert.ok(TAUGHT[early.first] > worldsOf('ocelot')[0], 'light is World 8, the ocelot is cast from World 3');
  assert.equal(inWorld({ ...JAGUAR, beatenBy: { light: { ends: 'flees', seconds: 6 }, geyser: { ends: 'chasedOff' } } }, 3).beatenBy.light, undefined);
});
