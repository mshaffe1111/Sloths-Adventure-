// Which stages are judged on the flown arcs, and on which rows, is a TABLE (reach.ts JUDGED; packet E12 item 3, D43): a stage is judged
// where it has a row, Easy stays easy-any, and every lookup takes the judged stage's own id. The fixture stage is test-only
// (listed.ts withTestStage adds its table line and takes it away): nothing shipped names it.
//   npx tsx --test src/game/gen2/judgedTable.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAIN_BANDS, JUDGED, gapEnvelope, judgedOnArcs, lesserArcs, linkArcs, scopeFor, scopeOf } from './reach.ts';
import { askVerdicts, judgeRoll } from './verdicts.ts';
import type { Judged11 } from './verdicts.ts';
import { withTestStage } from './listed.ts';
import { w1World } from './worlds/w1.ts';
import '../headlessDom.ts';
import { buildGen2Stage } from './pipeline.ts';
import { PROMISES_11 } from './promises11.ts';
import { provenSeeds } from './seedList.ts';
import { generateAllLevels } from '../worldsData.ts';
import type { Platform } from '../types.ts';

const FIX = '1-4';
/** a planted roll of `stageId` with one single-jump gap of `gap` px */
const planted = (stageId: string, gap: number): Judged11 =>
  ({ stageId, setting: 'normal', policy: 'per-gap', drops: [], asks: [{ section: 's1', kind: 'single-gap', x0: 400, x1: 400 + gap, figure: gap, move: 'single-flick', headroom: 9999 }], routeGaps: [] }) as Judged11;

test('the table: a stage is judged where it has a row; Easy is easy-any; a stage with no row is not judged', () => {
  assert.deepEqual(JUDGED, { '1-1': 'normal-1-1', '1-2': 'normal-1-2' });
  assert.equal(judgedOnArcs('1-1'), true);
  assert.equal(scopeOf('1-1', 'normal'), 'normal-1-1');
  assert.equal(scopeOf('1-1', 'easy'), 'easy-any');
  for (const id of ['1-4', '5-7', '8-3', FIX, 'toString', 'constructor']) {
    assert.equal(judgedOnArcs(id), false, id);
    assert.equal(scopeOf(id, 'normal'), undefined, id);
  }
});

test("the lookups take the judged stage's own id: 1-1's figures are what they were, and a stage with no row has none on Normal, by name", () => {
  assert.deepEqual(linkArcs('normal', '1-1'), { single: { gap: 143, climb: { block: 123, thin: 117 } }, double: { gap: 283, climb: { block: 212, thin: 206 } } });
  assert.deepEqual(linkArcs('easy', '1-1'), { single: { gap: 132, climb: { block: 123, thin: 117 } }, double: { gap: 287, climb: { block: 212, thin: 206 } } });
  assert.deepEqual(lesserArcs('normal', '1-1'), { single: { gap: 246, climb: { block: 123, thin: 117 } }, double: { gap: 409, climb: { block: 214, thin: 208 } } });
  assert.deepEqual([gapEnvelope(false, 'normal', '1-1'), gapEnvelope(true, 'normal', '1-1'), gapEnvelope(true, 'easy', '1-1')], [143, 262, 287]);
  assert.equal(scopeFor('normal', '1-1'), 'normal-1-1');
  for (const f of [() => scopeFor('normal', '5-7'), () => linkArcs('normal', '5-7'), () => lesserArcs('normal', FIX), () => gapEnvelope(true, 'normal', FIX), () => askVerdicts(planted('5-7', 100).asks[0], 'normal', '5-7')]) {
    assert.throws(f, /has no flown rows \(reach\.ts JUDGED\)/);
  }
  // (Easy's rows hold on any stage, reach.md "Scope": easy-any)
  assert.equal(scopeFor('easy', '5-7'), 'easy-any');
});

test('any stage: one table line and the fixture stage is judged (a planted 300 px gap refused band.out); without the line it is notJudged', () => {
  const out = judgeRoll(planted(FIX, 300));
  assert.equal(out.accepted, true, 'no row: nothing judges its arcs');
  assert.ok(out.notJudged.includes('reach.unflown') && out.notJudged.includes('band.out'));
  withTestStage({ [FIX]: { kit: w1World, seeds: [1, 2, 3], scope: 'normal-1-1' } }, () => {
    assert.equal(judgedOnArcs(FIX), true);
    assert.equal(scopeOf(FIX, 'normal'), 'normal-1-1');
    const v = judgeRoll(planted(FIX, 300));
    assert.equal(v.accepted, false);
    assert.ok(!v.accepted && v.failed.some((f) => f.name === 'band.out' && /300 px, over the band's 143/.test(f.line)), JSON.stringify(v));
    assert.ok(!v.notJudged.includes('reach.unflown'));
    assert.equal(judgeRoll(planted(FIX, 120)).accepted, true, 'a gap inside the band passes');
    assert.equal(linkArcs('normal', FIX).double.gap, 283, 'its links read its copied rows');
  });
  assert.equal(judgedOnArcs(FIX), false, 'restored');
  assert.deepEqual(JUDGED, { '1-1': 'normal-1-1', '1-2': 'normal-1-2' });
  withTestStage({ [FIX]: { kit: w1World, seeds: [1] } }, () => assert.equal(judgedOnArcs(FIX), false, 'a listed stage with no table line is still not judged'));
});

test("the promises read the table and the stage's brief, never a stage id: floor.unmarked judges every judged stage, the double's where the brief teaches it", () => {
  const P = (id: number, x: number, width: number): Platform => ({ id, x, y: 900, width, height: 300, type: 'solid', style: 'moss_stone' });
  // (two banks with an unmarked floorless gap between them, and no double teach node)
  const built = (teaches: string[]) => ({ platforms: [P(1, 0, 600), P(2, 800, 600)], config: { levelHeight: 2000 }, gen2: { nodes: [], brief: { teaches } } });
  const names = (stageId: string, teaches: string[]) => {
    const v = judgeRoll({ stageId, setting: 'normal', policy: 'per-gap', drops: [], asks: [], routeGaps: [], built: built(teaches) } as unknown as Judged11, PROMISES_11);
    return v.accepted ? [] : v.failed.map((f) => f.name);
  };
  withTestStage({ [FIX]: { kit: w1World, seeds: [1, 2, 3], scope: 'normal-1-1' } }, () => {
    assert.deepEqual(names(FIX, ['jump']), ['floor.unmarked'], 'a judged stage that does not teach the double: its floors are judged, the double promises are not');
    assert.deepEqual(names(FIX, ['jump', 'double']), ['floor.unmarked', 'teach.double-no-gap-after'], 'a judged stage whose brief teaches the double');
  });
  assert.deepEqual(names('1-1', ['jump', 'double', 'bounce']), ['floor.unmarked', 'teach.double-no-gap-after'], '1-1 as before');
  // (1-1's own brief does teach the double: the promise still runs on the real stage)
  assert.ok(w1World().manifest.graphs!.briefs['1-1'].teaches!.includes('double'));
  const real = buildGen2Stage({ config: { ...generateAllLevels().find((l) => l.id === '1-1')!, unlocked: true }, kit: w1World(), seed: provenSeeds('1-1')[0], difficulty: 'normal' });
  assert.ok(real.gen2.brief?.teaches?.includes('double'), 'the built 1-1 carries its brief');
  assert.equal(real.gen2.verdicts?.normal?.accepted, true);
  // (planted on the real stage: its double teach node taken away, the promise names it)
  const cut = { ...real, gen2: { ...real.gen2, nodes: (real.gen2.nodes ?? []).filter((n) => !/^T\w*2/.test(n.token)) } };
  const v = judgeRoll({ stageId: '1-1', setting: 'normal', policy: 'no-lethal', drops: [], asks: [], routeGaps: [], built: cut } as unknown as Judged11, PROMISES_11);
  assert.ok(!v.accepted && v.failed.some((f) => f.name === 'teach.double-no-gap-after'), JSON.stringify(v).slice(0, 300));
  const src = fs.readFileSync('src/game/gen2/promises11.ts', 'utf8');
  assert.equal((src.match(/['"`]\d-\d['"`]/g) ?? []).filter((_, i, a) => i < a.length).length, 1, "one stage id in promises11.ts: its own direct reader's (promiseBreaches11), none in the registry");
  assert.doesNotMatch(src, /stages: \[/, 'no registry row lists stages');
});

test('a chain hop is a section kind, judged cap centre to cap centre (S) against chain.md §3 by the step between the two caps; band.out names it (planted)', () => {
  const hop = (S: number, step = 0) => ({ section: 's1', kind: 'chain-hop' as const, x0: 1000, x1: 1000 + S, figure: S, step, move: 'bounce' as const, headroom: 9999 });
  for (const setting of ['normal', 'easy'] as const) {
    const out = (S: number, step = 0) => askVerdicts(hop(S, step), setting, '1-1').map((v) => `${v.name}: ${v.line}`);
    // (the rows, chain.md §3: level ±6 px S 205-220; up 24-36 S 195-210; up 54-66 S 185-200; down 24-36 S 215-225)
    for (const [S, step] of [[205, 0], [220, 6], [212, -6], [195, 24], [210, 36], [185, 54], [200, 66], [215, -24], [225, -36]]) assert.deepEqual(out(S, step), [], `${setting}: S ${S} at a step of ${step}`);
    assert.deepEqual(out(240), ["band.out: chain-hop at x 1000 (s1): 240 px, over the band's 220"], `${setting}: S 240 level`);
    assert.deepEqual(out(215, 60), ["band.out: chain-hop, a step of 60 px, at x 1000 (s1): 215 px, over the band's 200"], `${setting}: S 215 with a 60 px step`);
    assert.deepEqual(out(200), ["band.out: chain-hop at x 1000 (s1): 200 px, under the band's 205"]);
    assert.deepEqual(out(214, -30), ["band.out: chain-hop, a step of -30 px, at x 1000 (s1): 214 px, under the band's 215"]);
    // (a step in no row is not laid: between the rows, a cap more than 66 px over the last, or more than 36 px under it)
    for (const step of [15, 45, 80, -15, -50]) assert.deepEqual(out(205, step), [`band.out: chain-hop, a step of ${step} px, at x 1000 (s1): ${setting} has no chain-hop (band 'none')`], `${setting}: a step of ${step}`);
  }
  // (judged on any judged stage that lays one; a stage with no table line states it notJudged)
  const roll = (id: string) => judgeRoll({ stageId: id, setting: 'normal', policy: 'per-gap', drops: [], asks: [hop(240)], routeGaps: [] } as Judged11);
  assert.equal(roll(FIX).accepted, true);
  withTestStage({ [FIX]: { kit: w1World, seeds: [1], scope: 'normal-1-1' } }, () => {
    const v = roll(FIX);
    assert.ok(!v.accepted && v.failed.length === 1 && v.failed[0].name === 'band.out', JSON.stringify(v));
  });
  // (the data rows carry their chain.md source, for the Critic's diff)
  assert.deepEqual(CHAIN_BANDS.map((r) => [r.step, [r.s.lo, r.s.hi]]), [[[-6, 6], [205, 220]], [[24, 36], [195, 210]], [[54, 66], [185, 200]], [[-36, -24], [215, 225]]]);
  assert.ok(CHAIN_BANDS.every((r) => /^chain\.md §3 "Cap to cap/.test(r.source)));
});

test('no stage id in reach.ts or verdicts.ts: the table is world data (worlds/stageTable.ts), JUDGED reads its rows', () => {
  const ids = (f: string) => fs.readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && /['"`]\d-\d['"`]/.test(l));
  assert.deepEqual(ids('src/game/gen2/reach.ts'), []);
  assert.deepEqual(ids('src/game/gen2/verdicts.ts'), []);
  assert.match(fs.readFileSync('src/game/gen2/reach.ts', 'utf8'), /^export const JUDGED\b.*STAGE_TABLE/m);
});
