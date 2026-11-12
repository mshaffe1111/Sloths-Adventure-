// The piece library's proof, held (EN-L): 1-2's brief rolled from World 1's EXISTING sections picked by need, plus the chain-hop twist
// bricks and the one stood-in exit (tools/engine/library.ts). Tool-side: nothing the game ships sets these rows.
//   npx tsx --test tools/engine/library.test.ts          (about a minute)
import test from 'node:test';
import assert from 'node:assert/strict';
import { ENGINE_OPEN, NEW_STOOD_IN, REFUSE_12, TWISTS, WAY_DOWN, kitLib12, poolReport, roll, stageIdOf } from './library.ts';
import { stagePool } from '../../src/game/gen2/pipeline.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';

const O = { flown: true };
const SEEDS = Array.from({ length: 12 }, (_, i) => i + 1);
const rolls = SEEDS.map((s) => roll(s, 'normal', O));
const med = (xs: number[]) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

test("the pool is World 1's own sections, untouched but for a feel tag, plus the twist bricks: no section names the stage", () => {
  const M = kitLib12(O).manifest, own = new Map(w1World().manifest.sections.map((t) => [t.id, t]));
  for (const t of M.sections.filter((q) => own.has(q.id))) {
    const { feel: _f, ...a } = t, { feel: _g, ...b } = own.get(t.id)!;
    assert.deepEqual(a, b, `${t.id}: a World 1 section was re-cut`);
  }
  const pool = stagePool(M, stageIdOf(O));
  assert.ok(pool.filter((t) => own.has(t.id)).length >= 50, `only ${pool.filter((t) => own.has(t.id)).length} of World 1's sections serve by need`);
  assert.equal(M.sections.length - own.size, TWISTS.length + NEW_STOOD_IN.length + WAY_DOWN.length);
  assert.ok(TWISTS.length <= 8 && NEW_STOOD_IN.length <= 2, 'the twist bricks and the stood-in new sections are the whole of what was authored');
  assert.deepEqual(poolReport(O).out.filter((q) => q.why === 'refused: '), [], 'a section is out with no reason named');
});

test('every roll builds: no throw, no pool short, the teach and a signature chain in each, hollows only after the lesson', () => {
  for (const [i, r] of rolls.entries()) {
    assert.equal(r.thrown, undefined, `seed ${SEEDS[i]}: ${r.thrown}`);
    assert.deepEqual(r.errors.filter((e) => /pool short|fits no node|no section|untaught/.test(e)), [], `seed ${SEEDS[i]}`);
    assert.ok(r.plan.includes('lib-thorn-teach') && r.plan.some((t) => t.startsWith('lib-thorn-chain')), `seed ${SEEDS[i]}: ${r.plan.join(' ')}`);
    assert.ok(r.hollows >= 5, `seed ${SEEDS[i]}: ${r.hollows} hollows`);
  }
});

test("at least half the rolls are clean but for the thorn bed's draw (the engine's open item, named: ENGINE_OPEN)", () => {
  const ok = rolls.filter((r) => r.errors.every((e) => ENGINE_OPEN.test(e)));
  assert.ok(ok.length >= rolls.length / 2, `${ok.length} of ${rolls.length}`);
});

test("the brief's trend is applied by the lay: a level stage ends near the height it started at", () => {
  const climbs = rolls.map((r) => Math.abs(r.climb!));
  assert.ok(med(climbs) <= 150, `the end stands ${med(climbs)} px from the start's height (median of ${climbs.join(', ')})`);
});

test('what the stage refuses never comes with a shape: no 1-1 line is said, no squirrel sits', () => {
  assert.ok(REFUSE_12.includes('hint.1-1'));
  for (const [i, r] of rolls.entries()) assert.deepEqual(r.said.filter((m) => REFUSE_12.some((x) => m.startsWith(x))), [], `seed ${SEEDS[i]}`);
});
