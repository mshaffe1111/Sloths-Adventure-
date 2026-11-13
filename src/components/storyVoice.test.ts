/**
 * Audit C (audio) #6, 2026-11-11: a speaker's voice sounded at the picture change, before the title card and the beat, and again when
 * the words started. StoryPlayer kept the typed count (`shown`) in state and reset it in an effect, so on the render that changed the
 * picture it still held the last line's count; the voice effect then said the new line's first letter at once (Speech.next found it due),
 * and again when the typing really began. The count is now derived per picture and page, the way the page itself is: no effect ever
 * sees another line's count.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { shownFor } from '../game/storyTyping.ts';

test('the typed count belongs to its own picture and page: a new picture starts at 0 on its first render', () => {
  const typed = { idx: 4, page: 0, n: 31 }; // the last line, fully typed
  assert.equal(shownFor(typed, 4, 0), 31, 'the same picture keeps its count');
  assert.equal(shownFor(typed, 5, 0), 0, 'the next picture has typed nothing yet');
  assert.equal(shownFor(typed, 4, 1), 0, 'a new page of the same picture has typed nothing yet');
  assert.equal(shownFor(typed, 3, 0), 0, 'Back to the picture before: nothing typed yet');
});

test('StoryPlayer derives the count (no effect resets it, so the voice never sees the last line\'s count)', () => {
  const src = readFileSync(new URL('./StoryPlayer.tsx', import.meta.url), 'utf8');
  assert.match(src, /const shown = shownFor\(shownAt, idx, page\);/, 'derived, as the page is');
  assert.ok(!/setShown\(0\)/.test(src), 'no reset in an effect');
  // the voice speaks only letters typed on this picture: from what it already said of it
  assert.match(src, /for \(let i = from; i < shown; i\+\+\) sound\.speak\(panel\.speaker, text, i, dir\.tone\);/);
});
