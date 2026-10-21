import test from 'node:test';
import assert from 'node:assert/strict';
import { praiseFor, totalKills, tuckeredLine } from './stageSummary.ts';
import type { StageStats } from '../game/badges.ts';

const base: StageStats = {
  win: true, stars: 2, livesLost: 0, heartsLost: 0, floraTotal: 10, floraCollected: 4, timeSec: 100, timeLimit: 0,
  maxStompChain: 0, maxCombo: 0, stomps: 0, kills: {}, seen: [],
};

test('praise: the nicest true thing wins', () => {
  assert.equal(praiseFor({ ...base, floraCollected: 10 }, 3).title, 'Flawless!');
  assert.equal(praiseFor({ ...base, floraCollected: 10, heartsLost: 2 }, 3).title, 'Green thumb!');
  assert.equal(praiseFor(base, 2).title, 'Not a scratch!');
  assert.equal(praiseFor({ ...base, heartsLost: 1, maxCombo: 6 }, 2).title, 'Combo king!');
  assert.equal(praiseFor({ ...base, heartsLost: 1, kills: { snake: 4, eagle: 3 } }, 2).title, 'Foe flattener!');
  assert.equal(praiseFor({ ...base, heartsLost: 3, livesLost: 1 }, 1).title, 'Back on your feet!');
  assert.equal(praiseFor({ ...base, heartsLost: 1 }, 2).title, 'Slow and steady!');
  assert.equal(praiseFor(null, 3).title, 'Splendid!');
});

test('praise: no flowers in the stage is not "every flower"', () => {
  assert.notEqual(praiseFor({ ...base, floraTotal: 0, floraCollected: 0, heartsLost: 1 }, 2).title, 'Green thumb!');
});

test('kills add up across types', () => {
  assert.equal(totalKills({ ...base, kills: { snake: 2, eagle: 3 } }), 5);
  assert.equal(totalKills(null), 0);
});

test('the game-over line is steady for a stage and varies across stages', () => {
  assert.equal(tuckeredLine('3-5'), tuckeredLine('3-5'));
  const seen = new Set<string>();
  for (let w = 1; w <= 10; w++) for (let m = 1; m <= 9; m++) seen.add(tuckeredLine(`${w}-${m}`));
  assert.ok(seen.size >= 4);
});
