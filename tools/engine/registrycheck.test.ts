// The registry gate (tools/engine/registrycheck.ts, ADD-LEVEL R-165.187): the shipped table passes with no known list, and every
// need is proven by a planted fault on the real inputs (one registration taken away, nothing else changed), each failing by its name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allMisses, ciChecks, CI_LOOP, realInputs, realSheetMisses, stageMisses, type RegistryInputs } from './registrycheck.ts';
import { stageSheets } from '../../src/game/stageSheets.ts';

const real = realInputs();
/** the real inputs with the slow sheet builds stubbed (the sheets need has its own plant below and the gate test runs the real builds) */
const quick = (o: Partial<RegistryInputs> = {}): RegistryInputs => ({ ...real, sheetMisses: async () => [], ...o });
const needs = async (id: string, I: RegistryInputs) => (await stageMisses(id, I)).map((m) => m.need);
const listed = real.lists[0];

test('the shipped table passes the gate: every stage-table stage registered everywhere, every list checked in CI (no known list)', async () => {
  assert.deepEqual((await allMisses(real)).map((x) => `${x.stage} ${x.need}: ${x.line}`), []);
});

test('planted: a stage taken out of drawcheck\'s scenarios fails "drawcheck" (D51), and the gate fails on it', async () => {
  const id = real.stages.find((s) => real.scenarios.includes(s))!;
  const I = quick({ scenarios: real.scenarios.filter((s) => s !== id) });
  assert.ok((await needs(id, I)).includes('drawcheck'));
  const fail = (await allMisses(I)).map((x) => `${x.stage} ${x.need}`);
  assert.ok(fail.includes(`${id} drawcheck`), fail.join('\n'));
});

test('planted: a listed stage with its list taken away and no stand-in fails "seeds"; a stand-in alone passes', async () => {
  const I = quick({ lists: real.lists.filter((s) => s !== listed), row: (id) => (id === listed ? { ...real.row(id), standIn: undefined } : real.row(id)) });
  assert.ok((await needs(listed, I)).includes('seeds'));
  const J = quick({ lists: real.lists.filter((s) => s !== listed), row: (id) => (id === listed ? { ...real.row(id), standIn: { seed: 1 } } : real.row(id)) });
  assert.ok(!(await needs(listed, J)).includes('seeds'));
});

test('planted: a kit name listed.ts does not hold fails "kit"; a stage with no row fails "row"', async () => {
  const id = real.stages[0];
  assert.ok((await needs(id, quick({ hasKit: (s) => s !== id && real.hasKit(s) }))).includes('kit'));
  assert.deepEqual(await needs('9-99', quick()), ['row']);
});

test('planted: no config, a hand-built plan shadowing the row, no levelSeeds entry each fail by name', async () => {
  const id = real.stages[real.stages.length - 1];
  assert.ok((await needs(id, quick({ config: (s) => (s === id ? undefined : real.config(s)) }))).includes('config'));
  assert.ok((await needs(id, quick({ routed: (s) => s !== id && real.routed(s) }))).includes('routed'));
  const { [id]: _gone, ...attempts } = real.attempts;
  assert.ok((await needs(id, quick({ attempts }))).includes('attempts'));
});

test('planted: an unjudged row, a judged scope with no rows, and a scope missing one of Easy\'s moves each fail "flown"', async () => {
  const id = Object.keys(real.judged).find((s) => real.stages.includes(s))!;
  const scope = real.judged[id];
  assert.ok(!(await needs(id, quick())).includes('flown'), 'the shipped judged stage is flown');
  const { [id]: _j, ...unjudged } = real.judged;
  assert.ok((await needs(id, quick({ judged: unjudged }))).includes('flown'));
  assert.ok((await needs(id, quick({ flown: real.flown.filter((r) => r.scope !== scope) }))).includes('flown'));
  const move = real.flown.find((r) => r.scope === 'easy-any')!.move;
  const m = (await stageMisses(id, quick({ flown: real.flown.filter((r) => !(r.scope === scope && r.move === move)) }))).find((x) => x.need === 'flown');
  assert.ok(m && m.line.includes(move), m?.line);
});

test('planted: a sheet the rolls draw that the preload list lacks fails "sheets"', async () => {
  const id = real.stages[0];
  const m = (await stageMisses(id, quick({ sheetMisses: async (s) => (s === id ? ['foe:planted (seed 1 normal)'] : []) }))).find((x) => x.need === 'sheets');
  assert.ok(m && m.line.includes('foe:planted'));
});

test('planted on the real builds: a stage whose rolls lay a creature, with the creature sheets taken out of its preload list, is caught', async () => {
  // (the shipped preload lists cover every stage-table stage's rolls; then each list with its creature sheets removed: the stages whose
  // rolls lay a creature (1-3's snakes) must be caught by name, on the real builds)
  const caught: string[] = [];
  for (const id of real.stages) {
    assert.deepEqual(await realSheetMisses(id), [], `${id}: the shipped preload list covers its rolls`);
    const out = await realSheetMisses(id, (cfg) => stageSheets(cfg, { hand: true, paint: true, ctest: false }).filter((k) => !k.startsWith('foe:')));
    if (out.length) { assert.ok(out.every((k) => k.startsWith('foe:')), out.join(', ')); caught.push(id); }
  }
  assert.ok(caught.length >= 1, 'a stage-table stage lays a creature and is caught');
});

test('planted: gates.yml without a seed-list check for a list fails "ci-seedlist"; a named line or the --lists loop passes', async () => {
  const bare = 'jobs:\n  g:\n    steps:\n      - run: npx tsx tools/engine/seedlist.ts 1-1 --check\n';
  assert.ok(ciChecks(bare, '1-1') && !ciChecks(bare, '1-3'));
  const loop = `      - run: for s in $(npx tsx ${CI_LOOP}); do npx tsx tools/engine/seedlist.ts "$s" --check || exit 1; done\n`;
  assert.ok(ciChecks(loop, '1-3') && ciChecks(loop, '7-7'));
  assert.ok(!ciChecks('      # - run: npx tsx tools/engine/seedlist.ts 1-3 --check\n', '1-3'), 'a commented-out line checks nothing');
  const I = quick({ gatesYml: bare, lists: ['1-1', '1-3'] });
  const miss = (await allMisses(I)).filter((x) => x.need === 'ci-seedlist').map((x) => x.stage);
  assert.deepEqual(miss, ['1-3']);
});
