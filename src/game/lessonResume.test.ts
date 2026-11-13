/**
 * Audit C-11 (ENGINE-AUDIT-C, 11-11): the lesson card is a dead path that still gated Resume. The engine never opens a card any more (a
 * lesson is one of Dot's lines, said in play: engine.ts lessonTick), yet `lessonOpen` and `lessonClosed()` stayed in the engine, the
 * 13-line LessonCard stub stayed mounted, and the pause menu's Resume returned early while App's `lessonId` was set: a pause landing
 * between the engine's onLesson and the stub's effect left the stage frozen under a Resume that did nothing. New replaces old: the
 * card, its engine half and the guard are gone; Dot's guide takes the lesson straight from the engine's callback (a feed, as her lines).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { InputEngine } from './inputEngine.ts';
import { generateAllLevels } from './worldsData.ts';

const app = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

test('C-11: the pause menu\'s Resume resumes the stage with no lesson state to hold it', () => {
  const body = /const resumeGame = \(\) => \{([\s\S]*?)\n  \};/.exec(app);
  assert.ok(body, 'App.tsx no longer builds resumeGame this way (update this test)');
  assert.doesNotMatch(body[1], /lesson/i, `Resume is still held by a lesson: ${body[1].trim()}`);
  assert.match(body[1], /engineRef\.current\?\.resume\(\)/, 'Resume resumes the engine');
  // (the one thing that still holds it: a find's reader that paused the stage, closing it carries on)
  assert.match(body[1], /if \(reading && pausedForFind\.current\) return;/);
});

test('C-11: no lesson card: not mounted, not on disk, and the engine has no card to wait for', () => {
  assert.doesNotMatch(app, /LessonCard/, 'App.tsx still mounts the lesson card');
  assert.equal(existsSync(new URL('../components/LessonCard.tsx', import.meta.url)), false, 'components/LessonCard.tsx is still there');
  const lvl = generateAllLevels().find((l) => l.id === '1-2')!;
  const e = new GameEngine(headlessCanvas(), lvl, new InputEngine(), {} as never) as unknown as Record<string, unknown> & { pause(): void; resume(): void; helpState(): { paused: boolean }; stop(): void };
  try {
    assert.equal('lessonClosed' in e, false, 'engine.lessonClosed() is still there');
    assert.equal('lessonOpen' in e, false, 'engine.lessonOpen is still there');
    e.pause();
    e.resume();
    assert.equal(e.helpState().paused, false, 'a pause and a Resume: the stage runs');
  } finally {
    e.stop();
  }
});
