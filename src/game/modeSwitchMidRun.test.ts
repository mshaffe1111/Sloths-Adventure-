/**
 * Audit C (things): the pause menu's Easy/Normal switch says "It starts from the next stage" (menuParts.tsx DifficultySetting), and
 * difficulty.ts keeps the mode the stage was started on for exactly that (startRun / runDifficulty: "the run keeps this one"; the stage's
 * best result is kept with it, App.tsx mergeBest(..., runDifficulty())). The engine's report of the stage reads the menu's mode at the
 * moment the stage ends instead (engine.ts buildStats: `difficulty: difficulty()`), and the medals trust it (badges.ts finishedNormal,
 * recordStage `end && s.difficulty !== 'easy'`). So a stage built and played on Easy, with the switch flipped to Normal in the pause
 * menu before its last second, is reported as a Normal clear: on 10-10 that is Jungle Hero (gold) and the Platinum's "Finish on Normal".
 *
 * Correct: a stage's report carries the mode the stage was built and played on.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { runDifficulty, setDifficulty, startRun, switchDifficulty } from './difficulty.ts';
import { emptyStore, recordStage, type StageStats } from './badges.ts';
import { setDotHelp } from './dotGuideHelp.ts';

test('a stage started on Easy is reported as an Easy run after the pause menu is switched to Normal', () => {
  setDifficulty('easy');
  try {
    startRun('1-2'); // (App.tsx launchEngine)
    const r = new RealPlay('1-2', 1);
    assert.equal(r.e.softOn, true, 'the stage was built for Easy (its soft falls are on)');
    r.frame();
    switchDifficulty('normal'); // (the pause menu's switch, mid-stage)
    r.frame();
    assert.equal(runDifficulty(), 'easy', 'the run keeps the mode it started on');
    const stats = r.e.liveStats() as StageStats;
    assert.equal(stats.difficulty, runDifficulty(), "the stage's report says the mode it was played on");
    // (what the medals make of it, were this the General's stage won)
    const store = recordStage(emptyStore(), { ...stats, win: true, id: '10-10' });
    assert.equal(store.counters.finishedNormal, 0, 'an Easy run of the last stage is not "finished on Normal"');
  } finally {
    setDifficulty('normal');
  }
});

test("Dot's help switched to Quiet in the pause menu mid-stage does not make a Quiet run", () => {
  setDotHelp('reminders');
  try {
    const r = new RealPlay('1-2', 1);
    r.frame();
    r.e.pause();
    setDotHelp('quiet'); // (the pause menu's Dot's help setting, mid-stage)
    r.e.resume();
    r.frame();
    assert.equal((r.e.liveStats() as StageStats).quiet, false, 'help was on for part of the run');
  } finally {
    setDotHelp('reminders');
  }
});

test('a stage played with Quiet all the way is a Quiet run', () => {
  setDotHelp('quiet');
  try {
    const r = new RealPlay('1-2', 1);
    r.frame();
    r.e.pause();
    r.e.resume();
    r.frame();
    assert.equal((r.e.liveStats() as StageStats).quiet, true);
  } finally {
    setDotHelp('reminders');
  }
});
