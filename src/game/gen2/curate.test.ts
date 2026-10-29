/**
 * The curation tool (tools/gen2/curate.ts): the filters name each STAGE-RULES §2 number a roll misses (and honour a waiver), the greedy
 * pick spreads the set (max-min on the action 3-gram distance) and skips a roll the slow check refuses, the closing sections feed the
 * next stage's `recent`, the written table reads back, and a small run on the toy world ships rolls that pass levelCheck.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import '../headlessDom.ts';
import { buildGen2Stage, checkStage } from './pipeline.ts';
import { closingSections, curateStage, distance, failsOf, pickSpread, plainReason, renderReport, renderTable, resolveStage, sharedWith, toEntry, type RollMeasure, type SideMeasure } from '../../../tools/gen2/curate.ts';

const side = (o: Partial<SideMeasure> = {}): SideMeasure => ({ ok: true, errors: [], quick: 150, typical: 200, fast: 150, dead: 10, played: 150, longestQuiet: 3, perMin: 30, nearJumps: 0, ...o });
const roll = (seed: number, prof: Record<string, number>, quality = 0.5, plan: string[] = []): RollMeasure => ({
  seed, layoutSeed: seed, rerolls: 0, swaps: 0, plan, normal: side(), easy: side(), action: '', prof: new Map(Object.entries(prof)), wins: [], fails: [], quality,
});

test('the filters name every number a roll misses, and a waiver lifts only its own rule', () => {
  const floor = { target: 184, fast: 125, quick: 120 };
  assert.deepEqual(failsOf({ normal: side(), easy: side() }, floor, []), []);
  const bad = { normal: side({ ok: false, longestQuiet: 6, dead: 40, typical: 150 }), easy: side({ quick: 110, fast: 100 }) };
  const f = failsOf(bad, floor, []);
  for (const want of ['normal: levelCheck', 'normal: quiet over 4 s', 'normal: dead time over a fifth', 'normal: model typical under the target', 'easy: quick player under 2:00', 'easy: model fast under the floor']) assert.ok(f.includes(want), want);
  const w = failsOf(bad, floor, ['quiet', 'dead']);
  assert.ok(!w.some((x) => /quiet|dead/.test(x)) && w.includes('normal: levelCheck'));
  // (an animal by a take-off or a landing is never waived: the full suite's stageQuality clearance check, measured on each roll)
  const near = failsOf({ normal: side(), easy: side({ nearJumps: 2 }) }, floor, ['quiet', 'dead']);
  assert.deepEqual(near, ['easy: an animal by a jump']);
  assert.match(plainReason(near[0]), /^Easy: an animal within 120 px of a take-off or a landing$/);
});

test('the pick is greedy max-min: the best roll first, then the farthest, and a refused roll is skipped', () => {
  const a = roll(1, { JJV: 1 }, 0.9), a2 = roll(2, { JJV: 1, JJC: 0.1 }, 0.8), b = roll(3, { CCP: 1 }, 0.3), c = roll(4, { VVH: 1 }, 0.2);
  const { picks, spread } = pickSpread([a2, b, a, c], 3);
  assert.deepEqual(picks.map((p) => p.seed), [1, 3, 4], 'the near-copy of the best roll comes last');
  assert.equal(spread[0], null);
  assert.ok(spread[1]! > 0.9 && distance(a, a2) < 0.1);
  const r = pickSpread([a2, b, a, c], 3, (m) => m.seed !== 3);
  assert.deepEqual(r.picks.map((p) => p.seed), [1, 4, 2]);
  assert.equal(r.refused, 1);
});

test('a room quota: while the set holds fewer than n rolls with a puzzle room, the pick is made among those, the rooms in turn', () => {
  const plain = [roll(1, { JJV: 1 }, 0.9, ['a', 'b']), roll(2, { CCP: 1 }, 0.8, ['c']), roll(3, { VVH: 1 }, 0.7, ['d'])];
  const cake = [roll(4, { JJV: 1, R: 0.2 }, 0.3, ['a', 'room-cake']), roll(5, { CCP: 1, R: 0.2 }, 0.2, ['room-cake', 'c'])];
  const tea = [roll(6, { VVH: 1, T: 0.2 }, 0.1, ['room-tea'])];
  const pool = [...plain, ...cake, ...tea];
  assert.deepEqual(pickSpread(pool, 3).picks.map((p) => p.seed), [1, 2, 3], 'no quota: the rooms lose on quality');
  const { picks } = pickSpread(pool, 4, () => true, { n: 2, rooms: ['room-cake', 'room-tea'] });
  assert.deepEqual(picks.slice(0, 2).map((p) => p.plan.find((t) => t.startsWith('room'))), ['room-cake', 'room-tea'], 'one of each room first');
  assert.equal(picks[0].seed, 4, 'the better cake roll');
  assert.ok(!picks.slice(2).some((p) => p.plan.some((t) => t.startsWith('room'))), 'then the plain spread');
});

test("the closing sections (the next stage's recent) and the share of sections two stages have in common", () => {
  const p = [roll(1, {}, 0.5, ['m', 'a', 'b~', 'c', 'd', 'm']), roll(2, {}, 0.5, ['m', 'b', 'c', 'e', 'f', 'm'])];
  assert.deepEqual(closingSections(p, 3), ['c', 'b', 'd']);
  assert.equal(sharedWith(['a', 'b~', 'z'], new Set(['a', 'b'])), 2 / 3);
});

test('a small run on the toy world ships rolls that pass levelCheck on both settings, and the table it writes reads back', async () => {
  const stage = await resolveStage('toy-7');
  const r = curateStage(stage, { rolls: 6, keep: 3, salt: 7, waive: ['quiet', 'dead'], band: null, maxShared: 0.7, recent: [], neighbour: null, log: () => {} });
  assert.equal(r.measures.length, 6);
  assert.ok(r.picks.length >= 2, `${r.picks.length} picked; dropped ${JSON.stringify(r.dropped)}`);
  for (const m of r.picks) {
    assert.ok(m.bots && m.band, 'the bots ran on every pick');
    for (const difficulty of ['normal', 'easy'] as const) {
      const st = buildGen2Stage({ config: stage.config, kit: stage.kit, seed: m.seed, difficulty });
      assert.deepEqual(checkStage(st, st.gen2.budget).errors, []);
    }
  }
  const entry = toEntry(r, { waive: ['quiet', 'dead'], rolls: 6 }, '2026-10-28');
  assert.deepEqual(entry.waived, ['quiet', 'dead']);
  assert.equal(entry.seeds[0].nearest, null);
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'curate-'));
  const file = path.join(dir, 'table.ts');
  const types = path.resolve('src/game/gen2/seeds.ts');
  fs.writeFileSync(file, renderTable('T', { 'toy-7': entry }, '/** test */', types));
  const back = (await import(pathToFileURL(file).href)).T;
  assert.deepEqual(back['toy-7'], entry);
  fs.rmSync(dir, { recursive: true });
  // the report Matt reads: the pass rate, every drop reason in plain words, one row per shipped roll
  const md = renderReport([r], { rolls: 6, keep: 3, waive: ['quiet', 'dead'] }, '2026-10-28');
  assert.match(md, /\| toy-7 \(stealth\) \| 6 \|/);
  assert.equal(md.split('\n').filter((l) => /^\| \d+ \| \d+ \|/.test(l)).length, r.picks.length);
  for (const k of Object.keys(r.dropped)) assert.ok(md.includes(plainReason(k)), k);
  assert.equal(plainReason('easy: quiet over 4 s'), 'Easy: a stretch of more than 4 seconds with nothing to do');
});
