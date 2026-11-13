// Build-ahead (stageGenerator.ts buildAhead): the stage built at idle for the next play is the one that play gets, once; another seed or
// setting builds afresh (planted), and the stage built ahead is the stage a fresh build of that seed makes
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { aheadKeys, buildAhead, generateStage } from './stageGenerator.ts';
import { clearPlay11, newPlay11, peekPlay11, setPick11 } from './testlink1_1.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-1')!;

test('the next play draws the seed built ahead and gets that very stage, once; a play on another setting builds afresh (planted)', () => {
  setPick11('play');
  clearPlay11();
  const seed = peekPlay11(() => 0.123)!;
  buildAhead(cfg, seed, 'normal');
  assert.deepEqual(aheadKeys(), [`1-1|${seed}|normal`]);
  const ready = (() => { assert.equal(newPlay11(), seed, 'Play takes the seed drawn ahead'); return generateStage(cfg, 'normal'); })();
  assert.deepEqual(aheadKeys(), [], 'taken once');
  const fresh = generateStage(cfg, 'normal');
  assert.notEqual(fresh, ready, 'a restart builds afresh');
  assert.equal(JSON.stringify(fresh.platforms), JSON.stringify(ready.platforms), 'the same seed, the same stage');
  // (planted: built ahead for Normal, the play is on Easy: not taken)
  buildAhead(cfg, seed, 'normal');
  const easy = generateStage(cfg, 'easy');
  assert.deepEqual(aheadKeys(), [`1-1|${seed}|normal`]);
  assert.equal((easy as { gen2?: { budget: { difficulty: string } } }).gen2?.budget.difficulty, 'easy');
  clearPlay11();
});

test("1-1's Play: no proven entry repeats until the whole list has been played on this device, and the order survives a restart of the game", async () => {
  const { provenSeeds } = await import('./gen2/seedList.ts');
  clearPlay11();
  const n = provenSeeds('1-1').length;
  const got: number[] = [];
  for (let i = 0; i < n; i++) got.push(newPlay11()!);
  assert.equal(new Set(got).size, n, 'every entry once');
  // (the next round: no repeat at the seam, and the order is kept in storage, so a reload carries on, not restarts)
  const first = newPlay11();
  assert.notEqual(first, got[n - 1], 'a new round does not start with the entry that ended the last');
  const saved = JSON.parse(localStorage.getItem('sloth_play11_order')!);
  assert.equal(saved.i, 1);
  // (planted: random draws each press repeat early, the bug this replaces)
  const seen = new Set<number>();
  let repeatAt = -1;
  for (let i = 0; i < n && repeatAt < 0; i++) { const s = provenSeeds('1-1')[Math.floor(Math.random() * n)]; if (seen.has(s)) repeatAt = i; seen.add(s); }
  assert.ok(repeatAt > 0 && repeatAt < n, `random draws repeat early (at play ${repeatAt})`);
  clearPlay11();
});
