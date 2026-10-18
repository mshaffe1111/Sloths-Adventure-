import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getSceneSeed, setSceneSeed, onSceneSeedChange, rollSceneSeed } from './sceneSeed.ts';
import { lookFor, LOOKS } from './scenery.ts';
import { RECIPES } from './biomes.ts';
import { GROUND_STYLE, CAP_STYLE } from './soil.ts';
import { LIFE } from './life.ts';
import { isRich } from './rainforest.ts';

const WORLDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

test('every world has a backdrop recipe, a ground, a grass edge and a wildlife kit', () => {
  for (const w of WORLDS) {
    assert.ok(LOOKS[w], `look for world ${w}`);
    assert.ok(isRich(w), `world ${w} uses the rich scenery`);
    const rec = RECIPES[w];
    assert.ok(rec, `recipe for world ${w}`);
    for (const row of [rec.far, rec.mid, rec.giants]) {
      assert.ok(row.mix.length > 0, `world ${w} row has species`);
      assert.ok(row.mix.every(([, wt]) => wt > 0), `world ${w} species weights are positive`);
      assert.ok(row.n[0] >= 1 && row.n[1] >= row.n[0], `world ${w} tree counts make sense`);
    }
    assert.ok(GROUND_STYLE[w], `ground style for world ${w}`);
    assert.ok(CAP_STYLE[w], `cap style for world ${w}`);
    assert.ok(LIFE[w], `life kit for world ${w}`);
  }
});

test('the ten worlds do not all share one skyline or one ground', () => {
  const skylines = new Set(WORLDS.map((w) => JSON.stringify(RECIPES[w].giants.mix.map(([s]) => s).sort())));
  assert.ok(skylines.size >= 6, 'at least six distinct giant-tree mixes');
  assert.ok(new Set(Object.values(GROUND_STYLE)).size >= 6, 'at least six ground styles');
  assert.ok(new Set(Object.values(CAP_STYLE)).size >= 5, 'at least five grass-edge styles');
});

test('changing the scene seed notifies listeners once and only when it really changes', () => {
  let calls = 0;
  onSceneSeedChange(() => calls++);
  setSceneSeed(111);
  assert.equal(getSceneSeed(), 111);
  assert.equal(calls, 1);
  setSceneSeed(111);
  assert.equal(calls, 1, 'same seed does nothing');
  setSceneSeed(222);
  assert.equal(calls, 2);
});

test('rolled seeds are non-zero integers and (almost always) different', () => {
  const seen = new Set<number>();
  for (let i = 0; i < 20; i++) {
    const s = rollSceneSeed();
    assert.ok(Number.isInteger(s) && s !== 0);
    seen.add(s);
  }
  assert.ok(seen.size > 15);
});

test('the look of a world is stable for a seed, varies between seeds, and keeps its identity', () => {
  setSceneSeed(5);
  const a1 = lookFor(3);
  const a2 = lookFor(3);
  assert.equal(a1, a2, 'cached per seed');
  setSceneSeed(6);
  const b = lookFor(3);
  assert.notEqual(a1, b);
  const differs = JSON.stringify(a1.sky) !== JSON.stringify(b.sky) || JSON.stringify(a1.flora) !== JSON.stringify(b.flora) || a1.haze !== b.haze;
  assert.ok(differs, 'a new seed changes something visible');
  assert.equal(a1.ground.kind, b.ground.kind, 'ground kind is part of the world identity');
  assert.equal(a1.weather, b.weather);
});

test('wildlife kits never ask for more than a few dozen things', () => {
  for (const w of WORLDS) {
    const k = LIFE[w];
    const total = k.nFauna + k.bats + k.fireflies + k.embers + k.ash + k.gusts + k.motes;
    assert.ok(total <= 110, `world ${w} wildlife budget (${total})`);
  }
});
