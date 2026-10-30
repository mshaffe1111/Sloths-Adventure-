import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { syllableAt, typeMs, voiceOf } from './voiceLine.ts';
import { VOICES } from './voiceData.ts';
import { INTRO_PANELS, WORLD_STORIES, WORLD_MID, ENDING_PANELS, bossPanels } from '../game/story.ts';
import { MEMORIES, MEMORY_ORDER } from '../game/storyChapters.ts';

const all = [
  ...INTRO_PANELS, ...ENDING_PANELS,
  ...Object.values(WORLD_STORIES).flatMap((w) => w.panels), ...Object.values(WORLD_MID).flat(),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((w) => [...bossPanels(w, 'intro', 'boss'), ...bossPanels(w, 'defeat', 'boss')]),
  ...MEMORY_ORDER.flatMap((id) => MEMORIES[id].panels ?? []),
];

/** the letters of a line that get a syllable, as a reader hears it */
function said(text: string, speaker: string): number[] {
  const v = voiceOf(speaker)!;
  const out: number[] = [];
  let last = -1;
  for (let i = 0; i < text.length; i++) if (syllableAt(text, i, v.slug, v.spec, last)) out.push((last = i));
  return out;
}

test('everyone who speaks in the story has a voice of their own, except the Narrator, who is read', () => {
  const speakers = new Set(all.map((p) => p.speaker));
  for (const s of speakers) {
    if (s === 'Narrator') assert.equal(voiceOf(s), null);
    else assert.ok(voiceOf(s), `${s} has no voice`);
  }
});

test('every voice file is there and tiny', () => {
  for (const slug of Object.keys(VOICES)) {
    const f = new URL(`../assets/voices/${slug}.mp3`, import.meta.url);
    assert.ok(existsSync(f), slug);
    assert.ok(statSync(f).size < 24_000, `${slug} is ${statSync(f).size} bytes`);
  }
});

test('a syllable starts each word and recurs every few letters, never on spaces or stops', () => {
  const t = 'Slow is not stopped.';
  const at = said(t, 'Pokey');
  assert.ok(at.includes(0) && at.includes(5) && at.includes(8) && at.includes(12), `${at}`);
  for (const i of at) assert.match(t[i], /[A-Za-z]/);
});

test('Dot chatters more than Pokey on the same words', () => {
  const t = 'We have to go now, the thorns are closing behind us!';
  assert.ok(said(t, 'Dot').length > said(t, 'Pokey').length);
  assert.ok(typeMs('Dot') < typeMs('Pokey'));
});

test('a question rises at its end, a statement falls, the same word picks the same take', () => {
  const v = voiceOf('Meeca')!;
  const q = 'Is it you?';
  const s = 'It is you.';
  const qa = syllableAt(q, q.indexOf('you'), v.slug, v.spec, -1)!;
  const sa = syllableAt(s, s.indexOf('you'), v.slug, v.spec, -1)!;
  assert.ok(qa.semis > sa.semis + 2, `${qa.semis} vs ${sa.semis}`);
  assert.equal(qa.take, sa.take);
});
