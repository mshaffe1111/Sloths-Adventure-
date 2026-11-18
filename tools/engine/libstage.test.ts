// The one roll tool (tools/engine/libstage.ts, ADD-LEVEL R-165.187): it builds a stage from its stage-table row exactly as the seed-list
// search does, so a listed seed is clean on both settings in it and lays the very beats its list holds; a seed it calls clean on both is
// one the list keeps; and its summary counts what its names say (each count planted on synthetic rolls).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kindOf, rollMany, rollStage, stageSource, summarize, type StageRoll } from './libstage.ts';
import { PROVEN_INDEX } from '../../src/game/gen2/provenIndex.ts';
import { loadSeedList, provenList, unpackPlan } from '../../src/game/gen2/seedList.ts';
import { STAGE_TABLE } from '../../src/game/gen2/worlds/stageTable.ts';

const listedIds = Object.keys(PROVEN_INDEX).filter((id) => Object.hasOwn(STAGE_TABLE, id));

test('a stage with no row is refused by name, and rolls report it as thrown, never clean', () => {
  assert.throws(() => stageSource('9-99'), /no row for "9-99"/);
  const r = rollStage('9-99', 1, 'normal');
  assert.equal(r.clean, false);
  assert.match(r.thrown ?? '', /no row/);
});

test('every listed stage-table stage: its first 6 listed seeds are clean on both settings here, and lay the beats its list holds (Normal)', async () => {
  assert.ok(listedIds.length >= 1);
  for (const id of listedIds) {
    assert.ok(await loadSeedList(id), `${id}: the list loads`);
    const L = provenList(id)!;
    for (let i = 0; i < Math.min(6, L.seeds.length); i++) {
      const seed = L.seeds[i];
      const n = rollStage(id, seed, 'normal'), e = rollStage(id, seed, 'easy');
      assert.ok(n.clean && e.clean, `${id} seed ${seed}: ${n.thrown ?? n.errors[0] ?? e.thrown ?? e.errors[0]}`);
      assert.deepEqual(n.plan, unpackPlan(L.plans[i], L.dict).plan.map((p) => p.template), `${id} seed ${seed}: the beats its list replays`);
    }
  }
});

test('the seeds it calls clean on both settings are the ones the list search kept (the first 12 seeds of each list\'s search range)', async () => {
  for (const id of listedIds) {
    await loadSeedList(id);
    const L = provenList(id)!;
    const s = summarize(id, rollMany(id, 12, 1));
    const listed = L.seeds.filter((x) => x <= 12);
    // (the list search keeps a seed clean on both settings and passing its own extra rules; so every listed seed is clean on both here)
    for (const x of listed) assert.ok(s.both.includes(x), `${id} seed ${x} is listed but not clean on both here`);
    // (and with no extra rule in the row, a seed clean on both is a listed one)
    if (!STAGE_TABLE[id].squirrels && !STAGE_TABLE[id].firstRun) assert.deepEqual(s.both, listed, `${id}: clean on both = listed`);
  }
});

test('planted: the summary counts what its names say (clean, thrown, both, refusals per roll once, foes on clean rolls only)', () => {
  const R = (o: Partial<StageRoll>): StageRoll => ({ seed: 1, d: 'normal', clean: true, errors: [], plan: ['a', 'b'], kinds: [], foes: {}, ...o });
  const rows: StageRoll[] = [
    R({ seed: 1, foes: { snake: 3 }, seconds: 130, width: 9000 }), R({ seed: 1, d: 'easy', foes: { snake: 2 } }),
    R({ seed: 2, clean: false, errors: ['pool short at slot 4', 'pool short at slot 9'] }), R({ seed: 2, d: 'easy' }),
    R({ seed: 3, clean: false, thrown: 'boom' }), R({ seed: 3, d: 'easy', clean: false, errors: ['x 1'], foes: { snake: 99 } }),
  ];
  const s = summarize('9-99', rows);
  assert.deepEqual(s.both, [1]);
  assert.equal(s.per.normal.clean, 1);
  assert.equal(s.per.normal.thrown, 1);
  assert.deepEqual(s.per.normal.refusals.find(([k]) => k.startsWith('pool short')), ['pool short at slot #', 1], 'one roll, two lines of one kind: counted once');
  assert.deepEqual(s.per.easy.foes, { snake: [0, 2] }, 'a dirty roll\'s 99 snakes are not counted');
  assert.deepEqual(s.per.normal.seconds, [130, 130]);
  assert.equal(kindOf('gap at x 120..340 seed 7'), 'gap at x #..# seed #');
});
