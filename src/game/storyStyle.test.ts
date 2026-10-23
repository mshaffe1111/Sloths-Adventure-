/**
 * House style for every line a player reads (Matt, 2026-10-23: testers kept saying the punctuation was wrong).
 * The rules: no semicolons, no spaced hyphen used as a dash, no "…" character (three dots), no line that opens on "...",
 * an em dash only where speech is cut off (never with a space before it), notes signed "Love, M." (never "— J." or "—M."),
 * a comma between "said" and the words said, no "?!" and no "!!", and stage missions that end on a period, not "!".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { INTRO_PANELS } from './storyIntro.ts';
import { WORLD_STORIES, WORLD_MID } from './storyWorlds.ts';
import { BOSS_STORIES } from './storyBosses.ts';
import * as MEM from './storyMemories.ts';
import { finalePanels } from './storyFinale.ts';
import { WAYSIDE } from './wayside.ts';
import { FINDS, BONUS_FIND } from './finds.ts';
import { STAGE_PLAN } from './stagePlan.ts';
import { LESSONS } from './lessons.ts';
import { getStageClue } from '../components/stageClue.ts';

const TEXT_KEYS = new Set(['text', 'caption', 'desc', 'tip', 'intro', 'sub', 'hint']);

/** every player-facing string under a text-like key, anywhere in the value */
function collect(v: unknown, out: string[], key = ''): string[] {
  if (typeof v === 'string') {
    if (TEXT_KEYS.has(key)) out.push(v);
  } else if (Array.isArray(v)) {
    v.forEach((x) => collect(x, out, key));
  } else if (v && typeof v === 'object') {
    for (const [k, x] of Object.entries(v)) collect(x, out, k);
  }
  return out;
}

const allFindIds = [...FINDS.map((f) => f.id), BONUS_FIND.id];
const LINES = collect(
  [
    INTRO_PANELS,
    WORLD_STORIES,
    WORLD_MID,
    BOSS_STORIES,
    Object.values(MEM),
    finalePanels(allFindIds),
    WAYSIDE,
    FINDS,
    BONUS_FIND,
    STAGE_PLAN,
    LESSONS,
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => getStageClue(`1-${n}`)),
  ],
  [],
);

const offenders = (rx: RegExp) => LINES.filter((t) => rx.test(t));

test('the style check sees the whole script', () => {
  assert.ok(LINES.length > 900, `only ${LINES.length} lines found`);
});

test('no semicolons, spaced hyphens, or the single ellipsis character', () => {
  assert.deepEqual(offenders(/;/), []);
  assert.deepEqual(offenders(/ - /), []);
  assert.deepEqual(offenders(/…/), []);
});

test('no line opens on an ellipsis, and none hides one at the start of a sentence', () => {
  assert.deepEqual(offenders(/^\s*\.\.\./), []);
  assert.deepEqual(offenders(/[.!?] \.\.\.\S/), []);
});

test('an em dash only cuts speech off: never a space before it', () => {
  assert.deepEqual(offenders(/ —/), []);
});

test('notes are signed "Love, M.", never with a dash and an initial', () => {
  assert.deepEqual(offenders(/—\s?[A-Z]\./), []);
});

test('a comma comes between "said" and the words said', () => {
  // (a quotation woven into the sentence, such as 'said "Hurry up" or', takes none: only a quoted sentence of its own does)
  assert.deepEqual(offenders(/\b(said|says|say) "[A-Z][^"]*[.!?]"/), []);
});

test('no doubled marks', () => {
  assert.deepEqual(offenders(/\?!|!!|!\?/), []);
});

test('stage missions end on a period', () => {
  const loud = Object.values(STAGE_PLAN)
    .flat()
    .filter((s) => s.desc && /!/.test(s.desc))
    .map((s) => s.desc);
  assert.deepEqual(loud, []);
});
