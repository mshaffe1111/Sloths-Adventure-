/**
 * Audit C-05 / saves #9 (2026-11-11): what plays before a stage. A new player who opened the World Map first and tapped 1-1 got
 * World 1's arrival scene (Dot's return, Meeca's first note: the reward for clearing 1-1) BEFORE the stage, never the prologue, and the
 * same scene again after the clear; the title's Space and Enter started the stage past the how-to, the mode card and the prologue.
 * Every door now goes through App.tsx startLevel, which asks screenFlow.ts storyBefore.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { storyBefore } from './screenFlow.ts';

const first = { miniIndex: 1, objectiveType: 'sprint' };

test("a fresh save's first stage, by any door, plays the prologue first, never its world's after-the-stage scene", () => {
  assert.equal(storyBefore(first, { firstStage: true, worldSeen: false }), 'prologue');
  assert.equal(storyBefore(first, { firstStage: true, worldSeen: true }), null, 'once the prologue is seen, the first stage starts');
});

test("every other world's first stage plays its arrival scene on the first visit; a guardian's stage its intro", () => {
  assert.equal(storyBefore(first, { firstStage: false, worldSeen: false }), 'world_story');
  assert.equal(storyBefore(first, { firstStage: false, worldSeen: true }), null);
  assert.equal(storyBefore({ miniIndex: 10, objectiveType: 'boss_lair' }, { firstStage: false, worldSeen: true }), 'boss_intro');
  assert.equal(storyBefore({ miniIndex: 4, objectiveType: 'sprint' }, { firstStage: false, worldSeen: false }), null);
});

test('every way into a stage goes through startLevel and storyBefore (the title, its keys, the map, a link)', () => {
  const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  const start = app.slice(app.indexOf('const startLevel = useCallback('), app.indexOf('}, []);', app.indexOf('const startLevel = useCallback(')));
  assert.match(start, /storyBefore\(/, 'startLevel asks storyBefore');
  assert.doesNotMatch(start, /miniIndex === 1/, 'startLevel keeps no rule of its own beside storyBefore');
  assert.match(app, /onStartGame=\{\(\) => startLevel\(resumeLevel\)\}/, "the title's Play goes through startLevel");
  // the title's keys press its own Play (TitleScreen.tsx), never start a stage from App.tsx's key handler
  const keys = app.slice(app.indexOf('const handleGlobalKey'), app.indexOf('window.addEventListener', app.indexOf('const handleGlobalKey')));
  assert.doesNotMatch(keys, /\bstartLevel\(/, "App.tsx's key handler starts no stage itself");
  const title = readFileSync(new URL('./TitleScreen.tsx', import.meta.url), 'utf8');
  assert.match(title, /keyStart\.current\.start\(\)/, "the title's Space and Enter run the same start as its Play button");
});
