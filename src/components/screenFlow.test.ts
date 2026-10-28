import test from 'node:test';
import assert from 'node:assert/strict';
import { releasesStage, resumeAction, type StageHold } from './screenFlow.ts';
import type { GameScreen } from '../game/types.ts';

/** walks the screens as App.tsx would, and says whether the stage's engine is still there at the end */
function walk(steps: { screen: GameScreen; hold: StageHold }[]): boolean {
  let engine = true;
  for (const s of steps) if (releasesStage(s.screen, s.hold)) engine = false;
  return engine;
}

test("Matt's freeze: Menu → Trophies → Library → watch a memory → Back → Back keeps the paused stage", () => {
  const fromPause: StageHold = { trophyFrom: 'paused', memoryBack: null };
  const steps: { screen: GameScreen; hold: StageHold }[] = [
    { screen: 'playing', hold: fromPause },
    { screen: 'paused', hold: fromPause },
    { screen: 'trophy', hold: fromPause },
    { screen: 'memory', hold: { trophyFrom: 'paused', memoryBack: 'trophy' } },
    { screen: 'trophy', hold: fromPause },
    { screen: 'paused', hold: fromPause },
  ];
  assert.equal(walk(steps), true, 'the stage must still be there for Resume');
  // the Jungle Cards tab is the same Trophy Room
  assert.equal(releasesStage('trophy', fromPause), false);
});

test('a memory from the title or the map, or after a guardian falls, still frees the stage', () => {
  assert.equal(releasesStage('memory', { trophyFrom: 'title', memoryBack: 'trophy' }), true);
  assert.equal(releasesStage('memory', { trophyFrom: 'world_map', memoryBack: 'trophy' }), true);
  // a boss defeat: the Trophy Room had been opened from a pause earlier in the session, but this memory is the boss's
  assert.equal(releasesStage('memory', { trophyFrom: 'paused', memoryBack: 'victory' }), true);
  for (const s of ['title', 'world_map', 'story_cutscene', 'world_story', 'boss_intro', 'boss_defeat', 'ending_story'] as GameScreen[]) {
    assert.equal(releasesStage(s, { trophyFrom: 'paused', memoryBack: null }), true, s);
  }
  for (const s of ['playing', 'paused', 'victory', 'game_over'] as GameScreen[]) {
    assert.equal(releasesStage(s, { trophyFrom: 'title', memoryBack: null }), false, s);
  }
});

test('Resume with the stage let go of starts it again instead of freezing', () => {
  assert.equal(resumeAction(true, false), 'resume');
  assert.equal(resumeAction(false, true), 'restart');
  // still loading (the engine is on its way, nothing was let go of): wait for it
  assert.equal(resumeAction(false, false), 'resume');
});
