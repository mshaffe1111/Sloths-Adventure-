import test from 'node:test';
import assert from 'node:assert/strict';
import { typeSchedule } from './storyTyping.ts';
import { INTRO_PANELS, WORLD_STORIES } from './story.ts';

test('letters appear in order, 26 ms apart unless a breath is due', () => {
  const at = typeSchedule('Hello.');
  assert.equal(at.length, 6);
  assert.equal(at[0], 26);
  for (let i = 1; i < at.length; i++) assert.ok(at[i] > at[i - 1]);
  assert.equal(at[1] - at[0], 26);
});

test('a sentence end and an ellipsis each leave a beat, a plain letter does not', () => {
  const t = 'He sat. He waited... Then he went, slowly.';
  const at = typeSchedule(t);
  const gap = (ch: number) => at[ch + 1] - at[ch];
  assert.equal(gap(t.indexOf('sat.') + 3), 26 + 170, 'after "sat."');
  assert.equal(gap(t.indexOf('waited...') + 8), 26 + 320, 'after the third dot');
  assert.equal(gap(t.indexOf('went,') + 4), 26 + 50, 'after a comma');
  assert.equal(gap(1), 26);
});

test('an abbreviation-free decimal or a trailing quote does not stall, and a leading ellipsis hesitates once', () => {
  assert.equal(typeSchedule('3.5 hours').at(-1), 26 * 9, 'no pause inside 3.5');
  const lead = typeSchedule('...No.');
  assert.equal(lead[3] - lead[2], 26 + 320, 'one hesitation after the leading dots');
});

test('every panel finishes typing within a sane time', () => {
  const all = [...INTRO_PANELS, ...Object.values(WORLD_STORIES).flatMap((w) => w.panels)];
  let worst = 0;
  for (const p of all) {
    const at = typeSchedule(p.text);
    worst = Math.max(worst, at[at.length - 1] ?? 0);
  }
  assert.ok(worst < 14000, `the slowest panel takes ${worst} ms to type`);
});
