import test from 'node:test';
import assert from 'node:assert/strict';
import { STRETCH_FALLBACK, STRETCH_WORDS, stretchChoices } from './ctestStretches.ts';
import { FACES, REQUIRED, readyToSend, surveyQuestions, surveyRow } from './ControlTestGate.tsx';
import { w1World } from '../game/gen2/worlds/w1.ts';
import { SECTIONS_12 } from '../game/gen2/worlds/w1Arc12.ts';
import { SECTIONS_14 } from '../game/gen2/worlds/w1Arc14.ts';
import { SECTIONS_15 } from '../game/gen2/worlds/w1Arc15.ts';
import { SECTIONS_16 } from '../game/gen2/worlds/w1Arc16.ts';
import { SECTIONS_17 } from '../game/gen2/worlds/w1Arc17.ts';
import { SECTIONS_18 } from '../game/gen2/worlds/w1Arc18.ts';
import { SECTIONS_19 } from '../game/gen2/worlds/w1Arc19.ts';
import { generateAllLevels } from '../game/worldsData.ts';
import { generateStage } from '../game/stageGenerator.ts';
import { clearPlay11, newPlay11 } from '../game/testlink1_1.ts';

/** every World 1 section a stage can lay: the world's shared ones and each arc's own (1-2, 1-4 .. 1-9 lay only their own: R-165.343,
 *  before which the table was checked against the shared ones alone and those stages' chips all fell back to the generic four) */
const ALL_SECTIONS = [...w1World().manifest.sections, ...SECTIONS_12, ...SECTIONS_14, ...SECTIONS_15, ...SECTIONS_16, ...SECTIONS_17, ...SECTIONS_18, ...SECTIONS_19];
const sections = (): string[] => [...new Set(ALL_SECTIONS.map((s) => s.id))];

test('ctest survey: every World 1 section has plain words (or is marked walking-only), and the table names no section that is gone', () => {
  const ids = sections();
  const missing = ids.filter((id) => !(id in STRETCH_WORDS));
  assert.deepEqual(missing, [], 'name these in ctestStretches.ts before they ship');
  const stale = Object.keys(STRETCH_WORDS).filter((id) => !ids.includes(id));
  assert.deepEqual(stale, [], 'these are no longer World 1 sections');
  // a walking-only section is never offered; anything a tester can find hard is
  for (const s of ALL_SECTIONS) {
    const calm = (s.phases ?? []).some((p) => p === 'rest' || p === 'goal' || p === 'start') || (s.jobs ?? []).some((j) => j === 'rest' || j === 'arrive' || j === 'exit');
    if (STRETCH_WORDS[s.id] === null) assert.ok((s.difficulty ?? 1) <= 1 || calm, `${s.id} is skipped but is a challenge`);
  }
});

test('ctest survey: the words are plain (no ids, no codes) and short enough for one chip', () => {
  for (const w of new Set(Object.values(STRETCH_WORDS))) {
    if (w === null) continue;
    assert.ok(!/w\d-|[_:]|\d/.test(w), w);
    assert.ok(w.length <= 30, w);
  }
});

test("ctest survey: a run's stretches become its choices in order, each once; unknown gen2 ids never show; the old course passes through", () => {
  assert.deepEqual(stretchChoices(['w1-forest-edge:start', 'w1-learn:ki', 'w1-stones:sho', 'w1-stone-road:ketsu', 'w1-ropes:ten']), ['The first jumps', 'The stepping stones', 'The rope']);
  const fallback = ['The first jumps', 'The double-jump gaps', 'The mushroom bounce', 'The high branches'];
  assert.deepEqual(stretchChoices(['w1-not-a-section:ki', 'w9-x:ki']), fallback);
  assert.deepEqual(stretchChoices([]), fallback);
  assert.equal(STRETCH_FALLBACK.length, 4);
  assert.deepEqual(stretchChoices(['Run and stop', 'Long jumps', 'Finish']), ['Long jumps']);
});

test("ctest survey: real gen2 1-1 runs (proven seeds, both settings) list at least four of their own stretches, all in plain words", () => {
  const cfg = generateAllLevels().find((l) => l.id === '1-1' && !l.secret)!;
  try {
    for (const [i, diff] of [[0, 'normal'], [0.37, 'easy'], [0.81, 'normal']] as const) {
      newPlay11(() => i);
      const st = generateStage(cfg, diff) as { proto?: { beats?: Array<[number, number, string]> } };
      const labels = (st.proto?.beats ?? []).map((b) => b[2]);
      assert.ok(labels.length >= 6, `${diff}: ${labels.length} stretches`);
      for (const l of labels) assert.ok(l.split(':')[0] in STRETCH_WORDS, `${l} has no words`);
      const choices = stretchChoices(labels);
      assert.ok(choices.length >= 4, choices.join(', '));
      assert.ok(choices.length <= 6, choices.join(', '));
    }
  } finally {
    clearPlay11();
  }
});

test('ctest survey: only what the log cannot tell, the three required first, no hand, held or age', () => {
  const qs = surveyQuestions(['w1-learn:ki']);
  assert.deepEqual(qs.map((q) => q.id), ['fun', 'long', 'knew', 'hard', 'tips', 'looked', 'next']);
  assert.deepEqual(qs.filter((q) => q.required).map((q) => q.id), [...REQUIRED]);
  assert.deepEqual([...REQUIRED], ['fun', 'long', 'knew']);
  assert.equal(FACES.length, 5);
  assert.deepEqual(qs.find((q) => q.id === 'long')!.a, ['Too short', 'About right', 'Too long']);
  assert.deepEqual(qs.find((q) => q.id === 'knew')!.a, ['Always', 'Mostly', 'I got lost']);
  assert.deepEqual(qs.find((q) => q.id === 'tips')!.a, ['Yes', 'A bit', 'No', "Didn't notice them"]);
  assert.deepEqual(qs.find((q) => q.id === 'looked')!.a, ['No', 'Yes']);
  assert.deepEqual(qs.find((q) => q.id === 'next')!.a, ['Yes', 'Maybe', 'No']);
  assert.ok(qs.filter((q) => q.many).map((q) => q.id).join() === 'hard', 'only "hardest" takes more than one tap');
  for (const q of qs) assert.ok(!/age|old are you|thumb|hold the phone/i.test(q.q), q.q);
});

test('ctest survey: Send waits for the three required answers, and only those', () => {
  assert.equal(readyToSend({}), false);
  assert.equal(readyToSend({ fun: ['Fun'], long: ['About right'] }), false);
  assert.equal(readyToSend({ fun: ['Fun'], long: ['About right'], knew: [] }), false, 'a pick taken back is not an answer');
  assert.equal(readyToSend({ fun: ['Fun'], long: ['About right'], knew: ['Mostly'] }), true);
  assert.equal(readyToSend({ hard: ['Running'], tips: ['Yes'], next: ['Yes'] }), false);
});

test("ctest survey: the front page shows the moves of the stage picked (every World 1 stage has a page; 1-5's creaky limbs, 1-4's climb and 1-3's traps kept), each a real pose of Pokey's sheet", async () => {
  const { CTEST_PAGES, ctestPage } = await import('./ControlTestGate.tsx');
  const { CTEST_STAGES } = await import('../game/playRecorder.ts');
  const { STD_FRAMES } = await import('../game/heroStandardData.ts');
  // (the link offers all of World 1: Matt 11-20 2:39 PM ET, R-165.343; before it one stage, 1-5: Matt 11-13 8:48 PM ET)
  for (const id of CTEST_STAGES) {
    assert.ok(CTEST_PAGES[id], `the link's stage ${id} has a front page`);
    assert.equal(ctestPage(id), CTEST_PAGES[id]);
  }
  assert.deepEqual(Object.keys(CTEST_PAGES).sort(), [...CTEST_STAGES].sort(), 'a page for every stage offered, and none for a stage not offered');
  assert.deepEqual(CTEST_PAGES['1-5'].moves.map((m) => m.name), ['Run', 'Jump', 'Climb', 'Creaky limbs']);
  assert.deepEqual(CTEST_PAGES['1-4'].moves.map((m) => m.name), ['Climb', 'Two hands', 'Push the figs', 'Heads up']);
  assert.deepEqual(CTEST_PAGES['1-3'].moves.map((m) => m.name), ['Run', 'Jump', 'Punch', 'Drop a trap']);
  // (each still's words are the story keeper's, matched to what the still shows: t-story@61b66bf7, STORY-KEEPER.md; 1-3's still has him on the ground)
  assert.equal(CTEST_PAGES['1-5'].alt, 'Pokey crossing a row of creaky limbs above the roots');
  assert.equal(CTEST_PAGES['1-4'].alt, 'Pokey climbing a curtain of vines up a giant kapok tree');
  assert.equal(CTEST_PAGES['1-3'].alt, 'Pokey on the forest floor near a golden snake and a hive');
  for (const [id, pg] of Object.entries(CTEST_PAGES)) {
    assert.ok(pg.moves.length <= 4, `${id}: the page holds four cards`);
    assert.ok(pg.alt.length > 0 && !/1-\d|mossy logs/.test(pg.alt), `${id}: its own still's words`);
    for (const m of pg.moves) {
      assert.ok(STD_FRAMES[m.frame], `${id} ${m.name}: ${m.frame} is on the sheet`);
      assert.ok(m.how.length <= 70, `${id} ${m.name}: one short line`);
    }
  }
  // (1-4's cards say nothing of 1-1's moves; 1-3's nothing of the mushroom)
  for (const m of CTEST_PAGES['1-5'].moves) assert.ok(!/mushroom|double|fig|pod/i.test(m.how), m.how);
  for (const m of CTEST_PAGES['1-4'].moves) assert.ok(!/mushroom|double/i.test(m.how), m.how);
  for (const m of CTEST_PAGES['1-3'].moves) assert.ok(!/mushroom/i.test(m.how), m.how);
});

test('ctest survey: the row keeps the old keys in their old shape, adds the new ones, and leaves a skipped one out', () => {
  const row = surveyRow({ hard: ['the rope', 'Running'], fun: ['Fun'], long: ['About right'], looked: ['Yes'], tips: [] }, ' all good ', ' a floating rock ', '1-1 seed 115 easy');
  assert.deepEqual(row, { v: 2, hard: ['the rope', 'Running'], long: 'About right', looked: 'Yes', fun: 4, lookedNote: 'a floating rock', note: 'all good', run: '1-1 seed 115 easy' });
  // nothing answered: still a row, just the note (as the old one always had)
  assert.deepEqual(surveyRow({}, '', 'ignored', ''), { v: 2, note: '' });
  // the "what looked wrong" words go only with a Yes
  assert.equal(surveyRow({ looked: ['No'] }, '', 'stray', '').lookedNote, undefined);
});

test('the notes hold 600 (looked wrong) and 1000 (anything else) characters, cut there, and a fullest row still fits a sheet cell', async () => {
  const { LOOKED_MAX, NOTE_MAX } = await import('./ControlTestGate.tsx');
  assert.equal(LOOKED_MAX, 600);
  assert.equal(NOTE_MAX, 1000);
  const long = 'x'.repeat(5000);
  const row = surveyRow({ fun: ['Fun'], long: ['About right'], knew: ['Mostly'], looked: ['Yes'], hard: surveyQuestions(['w1-learn:ki', 'w1-stones:ki', 'w1-ropes:ten']).find((q) => q.id === 'hard')!.a.slice() as string[], tips: ['A bit'], next: ['Yes'] }, long, long, '1-1 seed 158 normal build abcdef1 list 0123abcd round 1-1 gen2 r1');
  assert.equal((row.lookedNote as string).length, 600, 'looked wrong cut at 600');
  assert.equal((row.note as string).length, 1000, 'the note cut at 1000');
  // (the survey goes in one log line, which with every other line of the run must fit a 47 000 character cell: the row alone is tiny)
  const line = JSON.stringify(['e', 123456, 'survey', JSON.stringify(row)]);
  assert.ok(line.length < 3000, `${line.length} characters`);
  assert.ok(line.length < 47000);
  // the fields themselves stop typing at the same caps (the source: React needs a page)
  const src = (await import('node:fs')).readFileSync(new URL('./ControlTestGate.tsx', import.meta.url), 'utf8');
  assert.match(src, /id="ctest-looked"[^>]*max=\{LOOKED_MAX\}/);
  assert.match(src, /id="ctest-note"[^>]*max=\{NOTE_MAX\}/);
  assert.match(src, /maxLength=\{max\}/);
});

test('a key typed into a text box is the text, never the game (the notes ate P, R and Space: Matt 11-06)', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.match(src, /const handleGlobalKey = \(e: KeyboardEvent\) => \{\s*\/\/[^\n]*\n\s*if \(typingIn\(e\.target\)\) return;/);
  const inp = (await import('node:fs')).readFileSync(new URL('../game/inputEngine.ts', import.meta.url), 'utf8');
  assert.match(inp, /private handleKeyDown = \(e: KeyboardEvent\) => \{[\s\S]{0,300}TEXTAREA[\s\S]{0,80}return;/);
});

test("1-3's chips are the story keeper's words (11-12; trimmed to six, KEEPER-PICK 11-21: the awake snakes one chip, the punch one chip)", () => {
  const want: Record<string, string> = {
    'w1-13-lesson': 'the first hive', 'w1-13-again': 'the snakes on watch', 'w1-13-stone-stair': 'the snakes on watch', 'w1-13-other-way': 'punching the snakes',
    'w1-13-perch': 'the high branch', 'w1-13-gallery': 'three traps in a row', 'w1-13-two-snakes': 'the two snakes on a log', 'w1-13-finale': 'punching the snakes',
  };
  for (const [id, words] of Object.entries(want)) assert.equal(STRETCH_WORDS[id], words, id);
});
