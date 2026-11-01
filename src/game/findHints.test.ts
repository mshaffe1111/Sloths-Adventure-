import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ALL_FINDS, DOT_HINTS, FIND_BY_ID } from './finds.ts';

/** lead, 2026-11-01: every locked card, in all ten worlds, has its own hint, in Dot's voice, under 12 words, naming the place */
const shown = ALL_FINDS.filter((f) => f.world >= 1);

test('find hints: every find has its own hint, no two alike', () => {
  for (const f of shown) assert.ok(DOT_HINTS[f.id], `${f.id} has no hint of its own`);
  const hints = shown.map((f) => f.hint);
  assert.equal(new Set(hints).size, hints.length, 'two cards say the same thing');
  for (const f of shown) assert.equal(FIND_BY_ID[f.id].hint, DOT_HINTS[f.id]);
});

test('find hints: short (under 12 words, so two or three lines on a card), and no filler', () => {
  for (const f of shown) {
    const words = f.hint.trim().split(/\s+/).length;
    assert.ok(words < 12, `${f.id}: ${words} words`);
    assert.ok(f.hint.length <= 70, `${f.id}: ${f.hint.length} characters`);
    assert.ok(!/^World \d+, hidden\./.test(f.hint), `${f.id} still has the old filler`);
  }
});
