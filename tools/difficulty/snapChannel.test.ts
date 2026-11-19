// npx tsx --test tools/difficulty/snapChannel.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The meter's SNAP channel (ENG-25b; 2-5.md: "per row, the meter's timed-hazard form log2(1 + cycle / open window) on the flown window";
 * score.ts snapChallenges): a run of snap stones is ONE timed press on its window to leave the floor before it (rideLay.ts snapWindow, the
 * engine's own read, the verdict's), a heart a bite. On ENG-25's snap toys laid by gen2 (snapToys.ts, the meter's copy METER_ID among World
 * 2's first stages, where the leaf glide is not his), both settings. Planted: a run on a clock the stage does not list is refused (never
 * priced as nothing); the coverage table without the channel is a coveragecheck fault; and 2-5.md's rows read where its targets are.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { beatOf } from '../../src/game/clock.ts';
import { snapClock, snapWindow } from '../../src/game/gen2/rideLay.ts';
import { scoreStage, snapChallenges, UnpricedPiece, windowBits } from './score.ts';
import { judge, vocabulary, type Table } from './coveragecheck.ts';
import { fixtureSeed, METER_ID, onSnapToy, pondOf, snapStage, TOY_SNAPS, type ToySnap } from '../inspect/snapToys.ts';
import { sampleRoute } from '../inspect/beats.ts';
import fs from 'node:fs';

const scored = (row: ToySnap, setting: 'normal' | 'easy') => {
  const seed = fixtureSeed(row);
  return { seed, r: onSnapToy(row, seed, setting, () => scoreStage(METER_ID, setting, seed, new Map()), TOY_SNAPS, METER_ID) };
};

for (const row of Object.keys(TOY_SNAPS) as ToySnap[]) {
  test(`the ${row} toy: its pond is ONE snap run, priced on the engine's window (snapWindow), a heart, both settings; the piece is pad:snap`, () => {
    for (const setting of ['normal', 'easy'] as const) {
      const { seed, r } = scored(row, setting);
      const st = snapStage(row, seed, setting);
      const pond = pondOf(st);
      const runs = r.challenges.filter((c) => c.kind === 'snap-run');
      assert.equal(runs.length, 1, `${setting}: one run: ${runs.map((c) => c.note).join('; ')}`);
      const stones = st.platforms.filter((p) => p.pad?.on === 'bites').sort((a, b) => a.x - b.x);
      const def = (st.clocks ?? []).find((c) => c.id === stones[0].pad!.clock)!;
      const bar = beatOf(def, setting === 'easy').period;
      const open = snapWindow(def, stones.map((p) => p.pad!.shift ?? 0), setting === 'easy');
      assert.ok(Math.abs(runs[0].bits - windowBits(bar, open)) < 1e-9, `${setting}: ${runs[0].note}`);
      assert.ok(runs[0].x >= pond.x0 - 1 && runs[0].x < stones[0].x + 1, `${setting}: priced where he leaves the bank (x ${runs[0].x})`);
      assert.equal(runs[0].cost, 'heart');
      assert.ok(r.pieces.includes('pad:snap') && !r.pieces.includes('pad:beat'), `${setting}: ${r.pieces.join(' ')}`);
    }
  });
}

test('the in-step row reads harder than the wave of 3 on Normal (its window is shorter: 1.37 s vs 1.60 s, 2-5.md\'s flight 1.40 vs 1.63)', () => {
  const step = scored('step', 'normal').r.challenges.find((c) => c.kind === 'snap-run')!;
  const wave = scored('wave', 'normal').r.challenges.find((c) => c.kind === 'snap-run')!;
  assert.ok(step.bits > wave.bits, `${step.note} ${step.bits} vs ${wave.note} ${wave.bits}`);
});

test('planted: a run of snap stones on a clock the stage does not list is refused (UnpricedPiece pad:snap), never priced as nothing', () => {
  const seed = fixtureSeed('step');
  const { r } = scored('step', 'normal');
  const st = snapStage('step', seed);
  assert.throws(() => snapChallenges({ ...st, clocks: [] }, r.route, sampleRoute(r.route), 'normal', 'toy'), (e: unknown) => e instanceof UnpricedPiece && e.piece === 'pad:snap');
});

test('planted: the coverage table without the snap channel is a coveragecheck fault on a stage that lays snap stones', () => {
  const table = JSON.parse(fs.readFileSync(new URL('../../reference/design/meter-coverage.json', import.meta.url), 'utf8')) as Table;
  const uses = new Map([['pad:snap', new Set(['toy'])]]);
  assert.deepEqual(judge(vocabulary(), table, [], uses, []).faults.filter((f) => f.includes('pad:snap')), [], 'with the channel: no fault');
  const bare = { ...table, pieces: { ...table.pieces, 'pad:snap': { ...table.pieces['pad:snap'], channel: null } } };
  assert.ok(judge(vocabulary(), bare, [], uses, []).faults.some((f) => /\(b\) pad:snap .*no channel/.test(f)), 'without it: (b)');
});

test("2-5.md's rows on the channel (its bars, snapClock): the teach and the wave of 5 where the design put them; Easy's beat never over Normal's", () => {
  const bits = (count: number, shifts: number[], easy: boolean) => {
    const def = snapClock('snap-x', { count } as never);
    return windowBits(beatOf(def, easy).period, snapWindow(def, shifts, easy));
  };
  const near = (a: number, b: number, tol: number, what: string) => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a.toFixed(2)} vs the design's ${b}`);
  near(bits(0.75, [0], false), 1.22, 0.03, 'teach, 1 stone');
  near(bits(0.75, [0, -0.75, -1.5, -2.25, -3], false), 2.0, 0.05, "Normal's wave of 5");
  // (in step and the quickening read ~0.1 over the design's: snapWindow is the straight-through tap window, the flight's low end; the
  //  design took the middle of its flown range, 1.40-1.60 s and 0.93-1.13 s. The order is the design's)
  assert.ok(bits(0.75, [0, 0, 0], false) < bits(0.6, [0, 0, 0], false) && bits(0.6, [0, 0, 0], false) < bits(0.75, [0, -0.75, -1.5, -2.25, -3], false), 'step < quickening < wave of 5');
  // (rule 4, beat for beat: Easy's teach and step at or under Normal's; Easy's twist is the wave of 3 against Normal's wave of 5)
  assert.ok(bits(0.75, [0], true) <= bits(0.75, [0], false) + 1e-9);
  assert.ok(bits(0.75, [0, 0, 0], true) <= bits(0.75, [0, 0, 0], false));
  assert.ok(bits(0.75, [0, -0.75, -1.5], true) <= bits(0.75, [0, -0.75, -1.5, -2.25, -3], false));
  assert.ok(bits(0.6, [0, 0, 0], true) <= bits(0.6, [0, 0, 0], false));
});
