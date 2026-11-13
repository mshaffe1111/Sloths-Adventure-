import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { withGoals } from './goals.ts';
import { judgeLines, median, REFERENCE, splitsOf } from './passLines.ts';
import type { Platform } from './types.ts';

// (deleted 11-12, P12S: "the split measure is engine-runs' own" read the hand-built 1-2's recorded row, 16 (13-25) and 0.787; that 1-2's
// builder is deleted (the game rolls 1-2 on gen2), so the fixture cannot be built. The measure stays proven by the planted floors below)
test("1-1's lines are old 1-1's measured medians, not its profile words: a planted 1-1 with 20 splits fails, one with 34 and 0.61 passes", () => {
  assert.deepEqual(REFERENCE['1-1'] && [REFERENCE['1-1'].splitsMin, REFERENCE['1-1'].twoRoadMin], [34, 0.61]);
  // (a floor 3,000 px long and over it n high ledges 400 px long, 800 apart (the measure joins tops within 90 px): n splits)
  const plant = (n: number, w = 400) => {
    const P: Platform[] = [{ id: 1, x: 0, y: 1000, width: 800 * n + 600, height: 120, type: 'solid', style: 'moss_stone' }];
    for (let i = 0; i < n; i++) P.push({ id: i + 2, x: 300 + 800 * i, y: 800, width: w, height: 24, type: 'solid', style: 'branch' });
    return splitsOf({ platforms: P });
  };
  assert.equal(plant(20).splits, 20);
  const twenty = judgeLines('1-1', Array.from({ length: 16 }, () => plant(20)));
  assert.ok(twenty.some((e) => e.startsWith('splits at 120 px: median 20, line 34')), twenty.join('; '));
  assert.deepEqual(judgeLines('1-1', Array.from({ length: 16 }, () => ({ splits: 34, twoRoad: 0.61 }))), []);
  // (a stage with no reference row has no lines to judge)
  assert.deepEqual(judgeLines('9-9', [{ splits: 0, twoRoad: 0 }]), []);
});
