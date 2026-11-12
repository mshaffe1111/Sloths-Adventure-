// The ONE table of listed stages (gen2/listed.ts; packet E12 item 1, D43): a stage rolled from a proven seed list is a ROW (its kit, and
// what is that stage's alone as fields), never a literal in a tool or in engine code. The fixture stage here is test-only: nothing shipped
// names it.
//   npx tsx --test src/game/gen2/listed.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { LISTED, listedStage, withTestStage } from './listed.ts';
import { provenSeedFor, provenSeeds } from './seedList.ts';
import { w1World } from './worlds/w1.ts';

const FIX = '1-3'; // (the packet's fixture: stage 1-3's id given World 1's kit and a 3-seed stub list, inside the test only)

test('the table: a row per listed stage, its kit and what is that stage\'s alone as fields', () => {
  const a = listedStage('1-1'), b = listedStage('1-2');
  assert.ok(a && b, 'both World 1 rows are entered');
  assert.equal(a.kit, w1World);
  assert.equal(b.kit, w1World);
  assert.deepEqual([a.squirrels, a.firstRun, a.pick], [true, true, true], "1-1's own: squirrels, the fixed first run, the test link's picker");
  assert.deepEqual([b.squirrels, b.firstRun, b.pick], [undefined, undefined, undefined], '1-2 has none of them');
  assert.equal(listedStage(FIX), undefined, 'a stage with no row is not listed');
  assert.equal(listedStage('toString'), undefined, 'an inherited name is not a row');
});

test('withTestStage: the fixture is a row and a list while fn runs, and gone after (after a throw too)', () => {
  const before = Object.keys(LISTED).join();
  const got = withTestStage({ [FIX]: { kit: w1World, seeds: [7, 8, 9] } }, () => {
    assert.equal(listedStage(FIX)?.kit, w1World);
    assert.equal(listedStage(FIX)?.squirrels, undefined);
    assert.deepEqual([...provenSeeds(FIX)], [7, 8, 9]);
    assert.equal(provenSeedFor(FIX, 4), 8, 'the n-th play draws the stub list\'s (n mod 3)-th seed');
    assert.ok(listedStage('1-1'), 'the shipped rows stay');
    return 'ran';
  });
  assert.equal(got, 'ran');
  assert.equal(Object.keys(LISTED).join(), before);
  assert.equal(listedStage(FIX), undefined);
  assert.deepEqual([...provenSeeds(FIX)], []);
  assert.throws(() => provenSeedFor(FIX, 0), /no proven seed list/);
  assert.throws(() => withTestStage({ [FIX]: { kit: w1World, seeds: [1] } }, () => { throw new Error('planted'); }), /planted/);
  assert.equal(listedStage(FIX), undefined, 'restored after a throw');
  assert.deepEqual([...provenSeeds(FIX)], []);
  assert.throws(() => withTestStage({ '1-1': { kit: w1World, seeds: [1] } }, () => 0), /already listed/, 'a fixture never writes over a shipped row');
  assert.ok(provenSeeds('1-1').length >= 100, "1-1's own list is untouched");
});

test('nothing in the game calls withTestStage: tests only', () => {
  const hits: string[] = [];
  const walk = (dir: string) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.tsx?$/.test(e.name) && !/\.test\.tsx?$/.test(e.name) && !p.endsWith(path.join('gen2', 'listed.ts')) && /withTestStage/.test(fs.readFileSync(p, 'utf8'))) hits.push(p);
    }
  };
  walk('src');
  assert.deepEqual(hits, []);
});
