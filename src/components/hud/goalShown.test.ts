// The goal sign stops at its goal (R-165.155, the lead 11-12): a goal can be smaller than what a stage holds (1-3: every trapped snake,
// the bare-branch ones optional), and the sign showed "11/10" at the totem, which reads as a bug. Any count goal.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { goalShown } from './goalInfo.ts';

test('goalShown: progress to the goal, never past it; anything with no count goal as it is', () => {
  assert.equal(goalShown(11, 10), 10);
  assert.equal(goalShown(10, 10), 10);
  assert.equal(goalShown(4, 10), 4);
  assert.equal(goalShown(7, 0), 7);
});

test('the HUD shows its count through goalShown, and a clear past the goal flies no icon (VineHud.tsx: it imports CSS, so it is read here, not rendered)', () => {
  const src = fs.readFileSync(new URL('./VineHud.tsx', import.meta.url), 'utf8');
  assert.match(src, /const goalNow = goalShown\(/, 'the number, the slots and the label all read goalNow');
  assert.match(src, /target > 0 && before >= target/, 'no flight into a full sign');
  for (const use of ['vals.goal = goalNow', '{goalNow}', '`${goalNow} of ${target}']) assert.ok(src.includes(use), use);
});
