import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RELEASED_WORLDS, isReleasedStage, isReleasedWorld, releasedOnly } from './released.ts';
import { FINDS, POCKET_FINDS, SNAIL_FINDS } from './finds.ts';
import { releasedScenes } from './sceneList.ts';
import { BADGES, REWARDS, RELEASED_FINDS, SHOWN_BADGES, SHOWN_POINTS, emptyStore, journeyStages, type EvalContext, type LevelRecord } from './badges.ts';
import { GUARDIAN_ENTRIES, PREDATOR_ENTRIES, ROAD_ENTRIES } from './journal.ts';
import { generateAllLevels } from './worldsData.ts';
import { starsPossible } from '../components/mapStars.ts';

/**
 * Every count the player sees ("X of Y" in the Satchel, the Trophies, the World Map) counts the worlds that are out (released.ts),
 * and nothing from a later world shows (lead, 2026-11-01: "6 of 30 things", "3 of 10 guardians", "17 of 60 scenes" all counted
 * Worlds 9 and 10, which aren't out). Each total below is the one its screen shows.
 */
const later = (w: number) => w > RELEASED_WORLDS;
const allLevels = () => {
  const g = globalThis as { location?: unknown };
  g.location = { search: '', hash: '', href: 'http://localhost/' };
  try {
    return generateAllLevels();
  } finally {
    delete g.location;
  }
};

test('released: the one source', () => {
  assert.ok(RELEASED_WORLDS >= 1 && RELEASED_WORLDS <= 10);
  assert.ok(isReleasedWorld(0), 'the prologue is always out');
  assert.equal(isReleasedStage('1-1'), true);
  assert.equal(isReleasedStage('4-D'), true);
  assert.equal(isReleasedStage('5-M'), true);
  assert.equal(isReleasedStage(`${RELEASED_WORLDS + 1}-1`), RELEASED_WORLDS >= 10);
  assert.equal(isReleasedStage('S-1'), false);
});

test('released: Finds (the count line and every card) hold no later world', () => {
  for (const set of [releasedOnly(FINDS), releasedOnly(POCKET_FINDS), releasedOnly(SNAIL_FINDS), RELEASED_FINDS]) {
    for (const f of set) assert.ok(!later(f.world), `${f.id} is from World ${f.world}`);
  }
  assert.equal(RELEASED_FINDS.length, FINDS.filter((f) => f.world <= RELEASED_WORLDS).length);
  assert.equal(RELEASED_FINDS.length, RELEASED_WORLDS * 3, 'a note, a keepsake and an album per world');
});

test('released: Scenes ("X of Y scenes open") hold no later world and no ending', () => {
  const list = releasedScenes();
  for (const e of list) {
    if (e.kind === 'secret') continue; // the Thorn Gate, in 7-7
    assert.ok(!later(e.world), `${e.id} is from World ${e.world}`);
    for (let w = RELEASED_WORLDS + 1; w <= 10; w++) assert.ok(!new RegExp(`World ${w}\\b|\\b${w}-\\d`).test(`${e.title} ${e.hint}`), `${e.id} names World ${w}`);
  }
  if (RELEASED_WORLDS < 10) assert.ok(!list.some((e) => e.kind === 'ending'), 'the ending waits for World 10');
});

test('released: Creatures (predators, met on the road, guardians) hold no later world', () => {
  assert.equal(releasedOnly(GUARDIAN_ENTRIES).length, RELEASED_WORLDS);
  for (const g of releasedOnly(GUARDIAN_ENTRIES)) assert.ok(!later(g.world));
  // (the tab shows only those whose first world is out; today every predator and road card is from Worlds 1-6)
  for (const e of Object.values(PREDATOR_ENTRIES)) assert.ok(e.first >= 1);
  for (const r of ROAD_ENTRIES) assert.ok(r.first >= 1);
});

test('released: World Map "X of Y stars in all" counts released stages only', () => {
  const lv = allLevels().filter((l) => isReleasedWorld(l.worldIndex));
  for (const l of lv) assert.ok(!later(l.worldIndex));
  // ten numbered stages a world, plus 4-D and 5-M once Worlds 4 and 5 are out
  assert.equal(starsPossible(lv), (RELEASED_WORLDS * 10 + (RELEASED_WORLDS >= 5 ? 2 : RELEASED_WORLDS >= 4 ? 1 : 0)) * 3);
});

test('released: medals count released stages, and every medal shown can really be earned', () => {
  const lv: LevelRecord[] = allLevels().map((l) => ({ id: l.id, worldIndex: l.worldIndex, miniIndex: l.miniIndex, completed: true, stars: 3 }));
  const stages = journeyStages(lv);
  for (const s of stages) assert.ok(!later(s.worldIndex), `${s.id} counted`);
  for (const b of SHOWN_BADGES) assert.ok((b.needsWorld ?? 0) <= RELEASED_WORLDS, `${b.id} needs World ${b.needsWorld}`);
  assert.ok(BADGES.length > SHOWN_BADGES.length || RELEASED_WORLDS >= 10);
  // a perfect save of the released worlds: every stage cleared with 3 stars and every released find. Each counted medal's progress
  // must reach its need (a "Clear 100 stages" with 82 out could never be earned)
  const ctx: EvalContext = { store: emptyStore(), levels: lv, gateFound: true, thornHeart: true, finds: RELEASED_FINDS.map((f) => f.id) };
  const COUNTED_FROM_SAVE = /^(cleared|stars|perfect|guardians|finds)_|^world_/;
  for (const b of SHOWN_BADGES.filter((x) => COUNTED_FROM_SAVE.test(x.id))) {
    assert.ok(b.test(ctx), `${b.id} (${b.desc}) can't be earned with Worlds 1-${RELEASED_WORLDS}`);
  }
  // the text of a shown medal never names a later world, and the coats stay in reach
  for (const b of SHOWN_BADGES) for (let w = RELEASED_WORLDS + 1; w <= 10; w++) assert.ok(!new RegExp(`World ${w}\\b`).test(b.desc), `${b.id}: ${b.desc}`);
  for (const r of REWARDS) assert.ok(r.need <= SHOWN_POINTS, `${r.name} needs ${r.need} of ${SHOWN_POINTS} points`);
});
