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
  const seed = peekPlay11(() => 0.123);
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
