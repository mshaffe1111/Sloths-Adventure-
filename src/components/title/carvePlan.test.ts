import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CARVE_GLYPHS, TITLE_LINES, cutSoFar, planCarve } from './carvePlan.ts';

test('every letter of the title has its carved strokes', () => {
  for (const ln of TITLE_LINES) for (const ch of ln.text.replace(/ /g, '')) assert.ok(CARVE_GLYPHS[ch], ch);
});

test('the name is cut at about a quarter of a second a letter, then the subtitle quicker, all in about three seconds', () => {
  const p = planCarve(TITLE_LINES);
  const name = p.letters.filter((l) => l.line === 0);
  const sub = p.letters.filter((l) => l.line === 1);
  assert.equal(name.map((l) => l.ch).join(''), 'SLOTHS');
  assert.equal(sub.length, 'RAINFORESTADVENTURES'.length);
  for (const l of name) assert.ok(Math.abs(l.end - l.start - 0.27) < 1e-9);
  // each starts before the one before it has quite finished (the knife moves on), and never before it started
  for (let i = 1; i < name.length; i++) assert.ok(name[i].start < name[i - 1].end && name[i].start > name[i - 1].start);
  assert.ok(sub[0].start >= p.lineEnds[0], 'the subtitle waits for the name');
  assert.ok(p.end > 2.5 && p.end < 3.3, `the carve takes ${p.end.toFixed(2)} s`);
  // the subtitle has a real space between its two words, not a squeeze
  const gapAt = sub.findIndex((l, i) => i > 0 && l.ch === 'A' && sub[i - 1].ch === 'T');
  assert.ok(sub[gapAt].x0 - sub[gapAt - 1].x0 > 4 + TITLE_LINES[1].gap + 2);
});

test('a letter is cut stroke by stroke along its path: nothing before, part way through, all of it after', () => {
  const l = planCarve(TITLE_LINES).letters[1]; // L: one stroke, down then across
  assert.deepEqual(cutSoFar(l, l.start - 0.01).strokes, []);
  const half = cutSoFar(l, (l.start + l.end) / 2);
  assert.equal(half.done, false);
  assert.ok(half.tip, 'the knife is somewhere');
  const [x, y] = half.tip!;
  assert.ok(Math.abs(x - 0) < 1e-9 && Math.abs(y - 5) < 1e-9, `half of L (6 down, 4 across) is 5 down: ${x},${y}`);
  const all = cutSoFar(l, l.end);
  assert.equal(all.done, true);
  assert.deepEqual(all.strokes, l.strokes);
  // H: its first stroke whole and the second begun, a third of the way in
  const h = planCarve(TITLE_LINES).letters[4];
  assert.equal(h.ch, 'H');
  const third = cutSoFar(h, h.start + (h.end - h.start) * 0.4);
  assert.equal(third.strokes.length, 2);
  assert.deepEqual(third.strokes[0], h.strokes[0]);
});
