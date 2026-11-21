/**
 * R-165.343 (Matt 11-20 2:39 PM ET): the testers' link plays ALL of World 1, picked on its front page. A pick that is not 1-5 (the one stage
 * the link played before) is the stage played, the recorder's lines name it, the survey's row carries it and its first words say it.
 * Planted: on the base (one stage, playRecorder.ts CTEST_LEVEL_ID '1-5', no picker) none of this exists and the file fails.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../game/headlessDom.ts';
import { existsSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ControlTestDone, ControlTestGate, ctestBegin, ctestLevelFor, ctestStageTitle, surveyIntro, surveyRow } from './ControlTestGate.tsx';
import { CTEST_STAGES, recorder, savedCtestStage } from '../game/playRecorder.ts';
import { generateAllLevels } from '../game/worldsData.ts';
import { stageSpec } from '../game/stagePlan.ts';
import { setDifficulty } from '../game/difficulty.ts';

/** a stage the testers pick that is not the old single stage */
const PICK = '1-4';

/** the recorder's lines while `fn` runs (its push caught, as recorderMoments.test.ts does) */
function linesOf(fn: () => void): unknown[][] {
  const lines: unknown[][] = [];
  const rec = recorder as unknown as { on: boolean; push: (l: unknown[]) => void; start: (who: string) => void };
  const was = { on: rec.on, push: rec.push, start: rec.start };
  rec.on = true;
  rec.push = (l) => lines.push(l);
  // (start() needs a whole page: the recording is already on here, as on a second pick)
  rec.start = () => {};
  try {
    fn();
  } finally {
    rec.on = was.on;
    rec.push = was.push;
    rec.start = was.start;
  }
  return lines;
}

test(`the picker: World 1's nine stages by number and name, the saved pick shown, and Start names it (${PICK})`, () => {
  assert.deepEqual(CTEST_STAGES, ['1-1', '1-2', '1-3', '1-4', '1-5', '1-6', '1-7', '1-8', '1-9']);
  localStorage.clear();
  assert.equal(savedCtestStage(), '1-1', 'a fresh phone starts on 1-1');
  localStorage.setItem('sloth_qa_ctest_stage', PICK);
  assert.equal(savedCtestStage(), PICK);
  const html = renderToStaticMarkup(React.createElement(ControlTestGate, { onStart: () => {} }));
  for (const id of CTEST_STAGES) {
    const name = stageSpec(1, Number(id.split('-')[1]))!.name;
    assert.ok(html.includes(`data-stage="${id}"`), `${id} is offered`);
    assert.ok(html.includes(name.replace(/'/g, '&#x27;')), `${id}'s name (${name}) is on its tile`);
  }
  assert.match(html, new RegExp(`aria-checked="true"[^>]*data-stage="${PICK}"`), `${PICK} is the one picked`);
  assert.equal((html.match(/aria-checked="true"[^>]*data-stage=/g) ?? []).length, 1, 'one pick at a time');
  assert.ok(html.includes(`The moves in <!-- -->${PICK}`) || html.includes(`The moves in ${PICK}`), 'the moves follow the pick');
  assert.ok(html.includes(`Start <!-- -->${PICK}`) || html.includes(`Start ${PICK}`), 'Start names the pick');
  // a pick the link does not offer is never kept
  localStorage.setItem('sloth_qa_ctest_stage', '2-1');
  assert.equal(savedCtestStage(), '1-1');
  localStorage.clear();
});

test(`a pick of ${PICK} is the stage played, and the recorder's lines name it`, () => {
  let played = '';
  const lines = linesOf(() => ctestBegin(PICK, 'Tess', 'normal', (id) => (played = id)));
  assert.equal(played, PICK, 'the stage handed on to be played is the pick');
  const lvl = ctestLevelFor(generateAllLevels(), played);
  assert.ok(lvl, 'the game has that stage');
  assert.equal(lvl!.id, PICK, 'and it is the one played, not 1-5');
  assert.equal(ctestLevelFor(generateAllLevels(), '2-1'), null, 'a stage the link does not offer is never played');
  const stage = lines.find((l) => l[2] === 'stage');
  assert.ok(stage, JSON.stringify(lines));
  assert.equal(stage![3], PICK, "the recorder's stage line");
  assert.equal(savedCtestStage(), PICK, 'the pick is kept for next time');
  localStorage.clear();
  setDifficulty('normal');
});

test(`the survey names ${PICK} ("How was 1-4, Up the Kapok?"), its row carries it, and the end offers it again or another`, () => {
  assert.equal(ctestStageTitle(PICK), '1-4, Up the Kapok');
  assert.match(surveyIntro(PICK), /^How was 1-4, Up the Kapok\? /);
  const row = surveyRow({ fun: ['Fun'], long: ['About right'], knew: ['Mostly'] }, '', '', '1-4 seed 7 normal', PICK);
  assert.equal(row.stage, PICK, "the survey row's stage, in the Data cell the collector already stores");
  const html = renderToStaticMarkup(React.createElement(ControlTestDone, { stage: PICK, onAgain: () => {}, onPickAnother: () => {} }));
  const text = html.replace(/<[^>]+>/g, '');
  assert.ok(text.includes(surveyIntro(PICK)), 'the end screen names the stage, in the words surveyIntro gives');
  assert.ok(html.includes('<span class="ct-nb">1-4</span>'), "the stage's number is kept on one line");
  assert.ok(/Play <!-- -->1-4<!-- --> again|Play 1-4 again/.test(html), 'Play 1-4 again');
  assert.ok(html.includes('Pick another level'));
  assert.ok(!/1-5|Where She Walked/.test(html), 'nothing of the old single stage');
});

test("every stage the link offers has its front-page still (880 x 425, the real game), so no page opens without one", () => {
  for (const id of CTEST_STAGES) assert.ok(existsSync(new URL(`../assets/ui/ctest-${id}.webp`, import.meta.url)), `src/assets/ui/ctest-${id}.webp`);
});

test("every stage the link offers names its own stretches for \"What felt hardest?\" (none falls back to World 1's generic chips)", async () => {
  // (the table test in ctestSurvey.test.ts reads w1World's shared sections only; 1-2 and 1-4..1-9 lay their own arcs' sections, and
  // before this every one of them fell back to the generic four: 1-5, the link's stage, included)
  const { RealPlay } = await import('../game/realPlay.ts');
  const { STRETCH_WORDS, STRETCH_FALLBACK, stretchChoices } = await import('./ctestStretches.ts');
  const generic = STRETCH_FALLBACK.map((w) => w[0].toUpperCase() + w.slice(1));
  for (const id of CTEST_STAGES) {
    for (const setting of ['normal', 'easy'] as const) {
      setDifficulty(setting);
      for (const seed of [1, 2]) {
        const r = new RealPlay(id, seed);
        const labels: string[] = r.e.stretchNames();
        (r.e as unknown as { stop(): void }).stop();
        assert.ok(labels.length > 0, `${id} ${setting} seed ${seed}: the stage says its stretches`);
        const unnamed = [...new Set(labels.map((l) => l.split(':')[0]).filter((s) => !(s in STRETCH_WORDS)))];
        assert.deepEqual(unnamed, [], `${id} ${setting} seed ${seed}: name these in ctestStretches.ts`);
        const chips = stretchChoices(labels);
        assert.ok(chips.length >= 2, `${id} ${setting} seed ${seed}: ${chips.length} chip(s)`);
        // (the story keeper, KEEPER-PICK 11-21: each stage keeps its 6 clearest, plus Running and Nothing beside them)
        assert.ok(chips.length <= 6, `${id} ${setting} seed ${seed}: ${chips.length} chips, the most is 6 (${chips.join(', ')})`);
        assert.ok(chips.some((c) => !generic.includes(c)) || id === '1-1', `${id} ${setting} seed ${seed}: only the generic chips (${chips.join(', ')})`);
      }
    }
  }
  setDifficulty('normal');
});

test("a stage this phone finished wears a tick on its tile (the lead 11-20: testers spread over all nine); none on a fresh phone", async () => {
  const { markCtestPlayed, ctestPlayed } = await import('../game/playRecorder.ts');
  localStorage.clear();
  const tiles = () => renderToStaticMarkup(React.createElement(ControlTestGate, { onStart: () => {} }));
  assert.equal((tiles().match(/ct-played/g) ?? []).length, 0, 'a fresh phone: no ticks');
  markCtestPlayed('1-6');
  markCtestPlayed('1-6');
  markCtestPlayed('2-1');
  assert.deepEqual(ctestPlayed(), ['1-6'], 'once each, and only a stage the link offers');
  const html = tiles();
  assert.equal((html.match(/class="ct-played"/g) ?? []).length, 1);
  assert.match(html, /aria-label="1-6, First Lianas, played"[^>]*>\s*<span class="ct-played"/);
  localStorage.clear();
});
