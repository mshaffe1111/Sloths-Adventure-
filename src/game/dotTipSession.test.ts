/**
 * Audit C-06 (ENGINE-AUDIT-C, 11-11) claimed a stage tip sent but never shown stays silent for the whole session: tipMemory.ts's `sent`
 * mark is cleared only by a New Game or "Hear Dot's tips again". NOT REPRODUCED in the game: every run of a stage is a new engine (a
 * restart, Next, the map's Play: App.tsx launchEngine), and the engine's constructor forgets what the last run sent (engine.ts
 * `forgetSent()`, where the stage loads, beside the hints' `shown = false`). This pins it on the real engine, the audit's scenario.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { bindSent, forgetSent, markTipHeard, tipHeard, tipKept } from './tipMemory.ts';

test('C-06: a stage tip sent but never shown is sent again on the next run of the stage (a new engine forgets the last run\'s sends)', () => {
  forgetSent();
  const stage = '2-3';
  const id = 'tip:Flick up into the log to hop on';
  const run1 = new RealPlay(stage, 1);
  // run 1: the engine reaches the hint and sends it (markTipHeard, then guide -> bindSent); Dot never shows it
  markTipHeard(stage, id);
  bindSent('Flick up into the log to hop on');
  assert.equal(tipHeard(stage, id), true, 'not sent again in this run');
  assert.equal(tipKept(stage, id), false, 'not written to the phone: right (DOT-1)');
  (run1.e as unknown as { stop(): void }).stop();
  // run 2: he restarts the stage, a new engine
  const run2 = new RealPlay(stage, 1);
  assert.equal(tipHeard(stage, id), false, 'the tip is still marked "sent" from the last run, so the engine will not say it again');
  (run2.e as unknown as { stop(): void }).stop();
});
