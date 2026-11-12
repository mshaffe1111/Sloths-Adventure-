// A stage's proven seed list is its own file, loaded on its own (R-165.112, seedList.ts loadSeedList). Every test here plants the
// page's side (plantSeedListSource: the list comes only from the planted source, as in a browser; nothing is read on the spot) and starts
// from the list not in memory. Held here: under Node a reader reads the file on the spot (the tests and tools), a page's reader asks
// for the list and answers "not here" without throwing; the real file loads once and is the list the index names; a failed load never
// throws into Play, leaves the device's shuffled order alone and plays the stand-in (a listed seed whose plan is in the main script),
// the same stage as the list's own entry, kept for that play; the next load tries again; the app's wait is held once, never twice; a
// Play pressed before the list arrives draws from it at the build.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { PROVEN_INDEX } from './provenIndex.ts';
import { FIRST_RUN_11 } from './firstRun11.ts';
import {
  buildPlayStage, hasSeedList, listVersion, loadSeedList, packPlan, plantSeedListSource, provenList, provenPlan, provenSeedFor, provenSeeds,
  seedListError, seedListSettled, seedListState, stageParts, standIn, type PackedList, type SeedListSource,
} from './seedList.ts';
import { w1World } from './worlds/w1.ts';
import { generateAllLevels } from '../worldsData.ts';
import { seedListVersion } from '../testRound.ts';
import { clearPlay11, newPlay11, peekPlay11, play11Seed, setPick11 } from '../testlink1_1.ts';
import { aheadKeys, generateStage } from '../stageGenerator.ts';
import { scheduleAhead } from '../buildAhead.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const REAL = PROVEN_INDEX['1-1'].load;
const ORDER_KEY = 'sloth_play11_order';
const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));
/** start a test from "nobody has asked for the list"; returns the undo */
const fresh = (src: SeedListSource | null = REAL) => { clearPlay11(); setPick11('play'); return plantSeedListSource('1-1', src); };

test('a list nobody asked for: Node reads the file on the spot (tests and tools); a page asks for it and answers "not here" (the stand-in), never throws', async () => {
  // Node, nothing planted: the readers answer from the file at once, the list the index names
  const undo0 = plantSeedListSource('1-1', REAL);
  undo0(); // (whatever an earlier import left in memory is put back as it was; now forget it the plain way)
  assert.equal(provenSeeds('1-1').length, PROVEN_INDEX['1-1'].n, 'Node: read on the spot');
  assert.equal(seedListState('1-1'), 'ready');
  // a page (planted): the list is not in memory and nobody asked. A reader asks for it, and meanwhile answers without it
  let calls = 0;
  const undo = fresh(() => { calls++; return REAL(); });
  try {
    assert.equal(seedListState('1-1'), 'unloaded');
    assert.deepEqual(provenSeeds('1-1'), [], 'not here yet');
    assert.equal(seedListState('1-1'), 'loading', 'the reader asked for it');
    assert.equal(play11Seed(5), standIn('1-1')!.seed, 'a build that did not wait gets the stand-in, not a throw');
    const st = generateStage(cfg, 'normal') as unknown as { gen2: { seed: number; errors?: string[] } };
    assert.equal(st.gen2.seed, standIn('1-1')!.seed);
    assert.deepEqual(st.gen2.errors ?? [], []);
    assert.throws(() => provenSeedFor('1-1', 0), /no proven seed list/, 'a plain draw with no list in memory says so');
    await tick(50);
    assert.equal(seedListState('1-1'), 'ready');
    assert.equal(calls, 1, 'asked for once');
    assert.equal(provenSeeds('1-1').length, PROVEN_INDEX['1-1'].n);
    // (a stage with no list at all: no seeds, as before)
    assert.deepEqual(provenSeeds('5-7'), []);
    assert.equal(hasSeedList('5-7'), false);
    assert.throws(() => provenSeedFor('5-7', 0), /no proven seed list/);
  } finally { undo(); clearPlay11(); }
});

test("the real file loads through the index's own loader, once for callers at the same moment, and is the list the index names", async () => {
  let calls = 0;
  const undo = fresh(() => { calls++; return REAL(); });
  try {
    const a = loadSeedList('1-1'), b = loadSeedList('1-1');
    assert.equal(seedListState('1-1'), 'loading');
    assert.deepEqual(await Promise.all([a, b]), [true, true]);
    assert.equal(calls, 1, 'one fetch');
    assert.equal(seedListState('1-1'), 'ready');
    assert.equal(await loadSeedList('1-1'), true);
    assert.equal(calls, 1, 'in memory: not fetched again');
    const L = provenList('1-1')!;
    assert.equal(L.seeds.length, PROVEN_INDEX['1-1'].n);
    assert.equal(L.plans.length, L.seeds.length);
    assert.equal(listVersion(L), PROVEN_INDEX['1-1'].version, 'the index holds this list\'s version (tools/engine/seedlist.ts wrote both)');
    assert.equal(seedListVersion('1-1'), listVersion(L), "a run's `list` stamp is the loaded list's own hash");
    assert.equal(await loadSeedList('no-such-stage'), false);
    assert.equal(await seedListSettled('no-such-stage'), false);
  } finally { undo(); }
});

test("1-1's stand-in is the fixed first run, and it is the list's own entry: the same seed, the same packed plan", async () => {
  const undo = fresh();
  try {
    assert.ok(await loadSeedList('1-1'));
    const s = standIn('1-1')!;
    assert.equal(s.seed, FIRST_RUN_11.seed);
    const L = provenList('1-1')!;
    const i = L.seeds.indexOf(s.seed);
    assert.ok(i >= 0, `the stand-in's seed ${s.seed} is on the list`);
    assert.equal(packPlan(s, [...L.dict]), L.plans[i], 'packed as the list packs it, the stand-in is the listed plan');
    // (planted: another plan under that seed is not the listed one)
    assert.notEqual(packPlan({ ...s, plan: s.plan.map((p, k) => (k === 2 ? { ...p, mirrored: !p.mirrored } : p)) }, [...L.dict]), L.plans[i]);
  } finally { undo(); }
});

test('a failed load: nothing throws, the shuffled order is left alone, Play builds the stand-in (the listed stage itself) and keeps it for that play; the next load tries again', async () => {
  // (the listed build of the stand-in's seed, from the real list, to compare with)
  let undo = fresh();
  assert.ok(await loadSeedList('1-1'));
  const seed = standIn('1-1')!.seed;
  const listed = { normal: stageParts(buildPlayStage(cfg, w1World(), seed, 'normal')), easy: stageParts(buildPlayStage(cfg, w1World(), seed, 'easy')) };
  const n = provenSeeds('1-1').length;
  undo();

  let calls = 0, fail = true;
  undo = fresh(() => { calls++; return fail ? Promise.reject(new Error('Failed to fetch dynamically imported module')) : REAL(); });
  try {
    const order = JSON.stringify({ n, order: Array.from({ length: n }, (_, j) => (j * 7) % n), i: 5 });
    localStorage.setItem(ORDER_KEY, order);
    assert.equal(await loadSeedList('1-1'), false, 'resolves false, never rejects');
    assert.equal(seedListState('1-1'), 'failed');
    assert.match(seedListError('1-1')!, /Failed to fetch/);
    // the readers: no list, and only the stand-in's own plan
    assert.deepEqual(provenSeeds('1-1'), []);
    assert.equal(provenPlan('1-1', seed)!.seed, seed);
    assert.equal(provenPlan('1-1', seed + 1), undefined);
    // a press of Play: no draw, the device's order untouched
    assert.equal(peekPlay11(), null);
    assert.equal(newPlay11(), null);
    assert.equal(localStorage.getItem(ORDER_KEY), order, 'the shuffled order is not re-shuffled or advanced by a play the list never reached');
    // the build: the stand-in, by its proven plan (one lay), the very stage the list's entry builds, on both settings
    for (const difficulty of ['normal', 'easy'] as const) {
      const st = generateStage(cfg, difficulty) as unknown as Parameters<typeof stageParts>[0];
      assert.equal(st.gen2.seed, seed);
      assert.deepEqual(st.gen2.errors ?? [], []);
      const direct = stageParts(buildPlayStage(cfg, w1World(), seed, difficulty));
      assert.deepEqual(direct, listed[difficulty], `${difficulty}: the stand-in's stage is the listed seed's stage`);
    }
    assert.equal(play11Seed(7), seed, 'whatever the layout variant');
    assert.equal(localStorage.getItem(ORDER_KEY), order);
    // the next load tries again (a failure is not kept), and succeeds once the network is back
    assert.equal(await loadSeedList('1-1'), false);
    assert.equal(calls, 2, 'a failed load is tried again');
    fail = false;
    assert.equal(await loadSeedList('1-1'), true);
    assert.equal(seedListState('1-1'), 'ready');
    assert.equal(seedListError('1-1'), null);
    // the play in progress keeps its stage (a restart or respawn builds the same one); the next press of Play draws from the order
    assert.equal(play11Seed(7), seed, 'the same play: the same seed after the list arrives');
    const next = newPlay11(() => 0.5);
    assert.equal(next, provenSeeds('1-1')[(5 * 7) % n], "the next Play takes the order's next entry");
    assert.equal(JSON.parse(localStorage.getItem(ORDER_KEY)!).i, 6);
  } finally { undo(); clearPlay11(); }
});

test('a cut-off or mismatched file is refused by name, never played from (planted: fewer seeds than the index says; plans short of seeds; no list)', async () => {
  const real = (await REAL()).LIST;
  const cases: Array<[PackedList | undefined, RegExp]> = [
    [{ ...real, seeds: real.seeds.slice(0, -1), plans: real.plans.slice(0, -1) }, /seeds, the index says/],
    [{ ...real, plans: real.plans.slice(0, -1) }, /seeds but \d+ plans/],
    [undefined, /no list in the file/],
  ];
  for (const [bad, why] of cases) {
    const undo = fresh(() => Promise.resolve({ LIST: bad as PackedList }));
    try {
      assert.equal(await loadSeedList('1-1'), false);
      assert.equal(seedListState('1-1'), 'failed');
      assert.match(seedListError('1-1')!, why);
      assert.deepEqual(provenSeeds('1-1'), []);
    } finally { undo(); }
  }
});

test("the app's wait before a build (seedListSettled): at once when the list is in memory; a stalled load is waited for once, capped, never twice; the list still arrives behind it", async () => {
  let release: (m: { LIST: PackedList }) => void = () => {};
  let calls = 0;
  const undo = fresh(() => { calls++; return new Promise((r) => { release = r; }); });
  try {
    let t0 = Date.now();
    assert.equal(await seedListSettled('1-1', 60), false, 'the cap passes: the build goes ahead on the stand-in');
    assert.ok(Date.now() - t0 >= 50, 'it waited for the cap');
    assert.equal(seedListState('1-1'), 'loading');
    assert.equal(play11Seed(3), standIn('1-1')!.seed, 'still loading at the build: the stand-in, not a throw');
    t0 = Date.now();
    assert.equal(await seedListSettled('1-1', 5000), false);
    assert.ok(Date.now() - t0 < 1000, 'the second start does not wait again');
    assert.equal(calls, 1, 'the stalled fetch is the one still on its way');
    const m = await REAL();
    release(m);
    await tick();
    assert.equal(seedListState('1-1'), 'ready');
    assert.equal(await seedListSettled('1-1', 5000), true);
  } finally { undo(); clearPlay11(); }
  // (a load that fails fast: the first start waits for the answer, not the cap; later starts go straight in while it is tried again)
  let n = 0;
  const undo2 = fresh(() => { n++; return Promise.reject(new Error('offline')); });
  try {
    const t0 = Date.now();
    assert.equal(await seedListSettled('1-1', 5000), false);
    assert.equal(await seedListSettled('1-1', 5000), false);
    assert.ok(Date.now() - t0 < 1000, 'a failed load answers at once');
    await tick();
    assert.equal(n, 2, 'each start tries the load again behind the play');
  } finally { undo2(); clearPlay11(); }
});

test('Play pressed before the list is in memory: the draw is owed to the build, and is made from the shuffled order once the list is there', async () => {
  let release: (m: { LIST: PackedList }) => void = () => {};
  const undo = fresh(() => new Promise((r) => { release = r; }));
  try {
    const wait = seedListSettled('1-1', 5000);
    assert.equal(newPlay11(() => 0.25), null, 'pressed while the list is on its way: nothing drawn yet');
    assert.equal(localStorage.getItem(ORDER_KEY), null);
    const m = await REAL(); // (awaited first: the planted source is called a tick after the ask, and only then is `release` its own)
    release(m);
    assert.equal(await wait, true);
    // (the build, after the app's wait: play11Seed makes the owed draw)
    const st = generateStage(cfg, 'normal') as unknown as { gen2: { seed: number } };
    const o = JSON.parse(localStorage.getItem(ORDER_KEY)!);
    assert.equal(o.i, 1, 'one entry of the order is played');
    assert.equal(st.gen2.seed, provenSeeds('1-1')[o.order[0]], "the order's first entry");
    assert.equal(play11Seed(9), st.gen2.seed, 'kept for the play');
    // (planted: without the owed draw the build would fall to the layout variant's seed)
    assert.notEqual(provenSeedFor('1-1', 9 - 1), st.gen2.seed);
  } finally { undo(); clearPlay11(); }
});

test('build-ahead loads the list first: a failed load builds nothing ahead (and throws nothing); a loaded list builds the next play', async () => {
  let undo = fresh(() => Promise.reject(new Error('offline')));
  try {
    scheduleAhead(cfg);
    await tick(450);
    assert.deepEqual(aheadKeys(), []);
  } finally { undo(); clearPlay11(); }
  undo = fresh();
  try {
    scheduleAhead(cfg);
    for (let i = 0; i < 40 && !aheadKeys().length; i++) await tick(100);
    const seed = peekPlay11();
    assert.ok(seed !== null && provenSeeds('1-1').includes(seed));
    assert.equal(aheadKeys().length, 1);
    assert.ok(aheadKeys()[0].startsWith(`1-1|${seed}|`), aheadKeys()[0]);
    assert.equal(newPlay11(), seed, 'Play takes the seed built ahead');
    generateStage(cfg, aheadKeys()[0].split('|')[2] as 'normal' | 'easy');
    assert.deepEqual(aheadKeys(), [], 'and its stage');
  } finally { undo(); clearPlay11(); }
});
