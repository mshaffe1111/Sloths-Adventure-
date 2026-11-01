import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePlayRecord, withRun } from './playRecords.ts';
import { stageEntry, worldReview, STAGE_LINES, BANNED_FILLER } from './pokeyJournal.ts';
import { isSaveKey, parseSave, buildSave, checksum, SAVE_FORMAT, SAVE_VERSION } from './saveFile.ts';
import type { StageStats } from './badges.ts';

const run = (o: Partial<StageStats> = {}): StageStats => ({
  win: true, stars: 2, livesLost: 1, heartsLost: 2, floraTotal: 40, floraCollected: 30, timeSec: 150.4, timeLimit: 300, maxStompChain: 2, maxCombo: 1, stomps: 3,
  kills: { snake: 4, boa: 1 }, seen: ['snake'], id: '1-3', ...o,
});
const names = { creature: (id: string, n: number) => (n === 1 ? id : `${id}s`), find: (id: string) => (id === 'w1_note' ? 'The first petal' : undefined), medal: (id: string) => (id === 'first_steps' ? 'First Steps' : undefined) };
const stage = { id: '1-3', name: 'Mossy Steps', worldIndex: 1, miniIndex: 3, stars: 2 };

test('the first clear is kept as it happened; later runs only count', () => {
  let r = withRun(null, run({ win: false }), { finds: [], medals: [], now: 0 });
  assert.equal(r.n, 1);
  assert.equal(r.first, undefined);
  r = withRun(r, run(), { finds: ['w1_note'], medals: ['first_steps'], now: 1e12 });
  assert.equal(r.first?.ll, 1);
  assert.equal(r.first?.kt, 'snake');
  assert.equal(r.first?.k, 5);
  r = withRun(r, run({ livesLost: 0, timeSec: 90, stars: 3 }), { finds: [], medals: [], now: 2e12 });
  assert.equal(r.first?.ll, 1, 'the first clear stays');
  assert.equal(r.bt, 90);
  assert.equal(r.bs, 3);
  assert.equal(r.w, 2);
  assert.equal(r.n, 3);
});

test('a record survives a round trip, and junk reads as never played', () => {
  const r = withRun(null, run(), { finds: ['w1_note'], medals: ['first_steps'], now: 1e12 });
  assert.deepEqual(parsePlayRecord(JSON.stringify(r)), r);
  assert.equal(parsePlayRecord('nope'), null);
  assert.equal(parsePlayRecord(JSON.stringify({ v: 2 })), null);
  const bad = parsePlayRecord(JSON.stringify({ v: 1, n: -4, w: 'x', first: { t: 'a', fd: ['<script>', 'ok_id'], kt: 'Bad Id' } }));
  assert.equal(bad?.n, 0);
  assert.deepEqual(bad?.first?.fd, ['ok_id']);
  assert.equal(bad?.first?.kt, undefined);
});

test('play records travel in save files, and a save without them still loads', () => {
  assert.ok(isSaveKey('sloth_play_3-10'));
  assert.ok(isSaveKey('sloth_play_5-M'));
  assert.ok(!isSaveKey('sloth_play_x'));
  const rec = JSON.stringify(withRun(null, run(), { finds: ['w1_note'], medals: ['first_steps', 'flawless', 'stomper_1'], now: 1e12 }));
  const data: Record<string, string> = { 'sloth_lvl_1-3': JSON.stringify({ completed: true, stars: 2 }), 'sloth_play_1-3': rec };
  const store = { getItem: (k: string) => data[k] ?? null, setItem() {}, removeItem() {}, keys: () => Object.keys(data) };
  const ok = parseSave(JSON.stringify(buildSave(store)));
  assert.ok(ok.ok);
  const old = { 'sloth_lvl_1-3': data['sloth_lvl_1-3'] };
  const oldSave = { format: SAVE_FORMAT, version: SAVE_VERSION, savedAt: '', data: old, checksum: checksum(old) };
  assert.ok(parseSave(JSON.stringify(oldSave)).ok);
});

test("a stage's entry is built from how it was played, and reads the same each time", () => {
  const r = withRun(null, run(), { finds: ['w1_note'], medals: ['first_steps'], now: 1e12 });
  const e = stageEntry(stage, r, names);
  const text = e.lines.join(' ');
  assert.equal(e.lines[0], STAGE_LINES['1-3'], "the stage's own line comes first");
  assert.ok(!text.includes('Mossy Steps'), 'the name is in the heading, not the lines');
  assert.ok(text.includes('The first petal'));
  assert.ok(text.includes('First Steps'));
  assert.ok(!/\{\w+\}/.test(text), 'every slot filled');
  assert.deepEqual(stageEntry(stage, r, names), e);
  assert.equal(e.plain, false);
});

test('a stage cleared before the journal kept records gets a plain entry, and a guardian ends with the approved world line', () => {
  const e = stageEntry({ ...stage, id: '2-10', worldIndex: 2, miniIndex: 10 }, null, names);
  assert.equal(e.plain, true);
  assert.equal(e.lines[0], STAGE_LINES['2-10']);
  assert.ok(e.lines.some((l) => l.includes('raft')));
  for (const l of e.lines) assert.doesNotMatch(l, BANNED_FILLER);
});

test("a world's review sums the stages and finds the best moments", () => {
  const stages = [1, 2, 3].map((m) => ({ id: `1-${m}`, name: `S${m}`, worldIndex: 1, miniIndex: m, completed: true, stars: 3 }));
  const recs = {
    '1-1': withRun(null, run({ id: '1-1', livesLost: 0, heartsLost: 0, timeSec: 60 }), { finds: [], medals: [], now: 0 }),
    '1-2': withRun(null, run({ id: '1-2', floraCollected: 40 }), { finds: [], medals: [], now: 0 }),
  };
  const r = worldReview(1, stages, recs, { teaser: 'A petal.', creatures: ['Snake'], finds: 1, findTotal: 3 });
  assert.equal(r.stats.cleared, 3);
  assert.equal(r.stats.stars, 9);
  assert.equal(r.stats.falls, 1);
  assert.ok(r.best.some((b) => b.includes('S1')));
  assert.ok(r.best.some((b) => b.includes('Every flower in S2')));
  assert.equal(r.done, false);
});
