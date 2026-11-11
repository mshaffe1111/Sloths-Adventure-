/**
 * ENGINE-AUDIT-C finding C-06 (2026-11-11). Asserts the CORRECT behaviour; FAILS on t-int-1-1 @ fa5ad9d1.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/dot-tip-session.test.ts
 *
 * tipMemory.ts (the DOT-1 fix): a stage tip is written to the phone only once Dot has SHOWN it. But the engine's "sent" mark is kept for
 * the whole session (the module-level `sent` map, cleared only by a New Game or "Hear Dot's tips again"), and the engine skips any tip
 * with that mark (engine.ts: `if (tipHeard(stage, id)) continue;`). So a tip Dot never showed (dropped by the setting, old news in her
 * queue, held back because he was falling) is silent on every retry of the stage until the page or app is restarted. In the Android
 * app a session is the life of the process.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';
import { bindSent, forgetSent, markTipHeard, tipHeard, tipKept } from '../../../../src/game/tipMemory.ts';

test('C-06: a stage tip that was sent but never shown is sent again on the next run of the stage', () => {
  forgetSent();
  const stage = '2-3';
  const id = 'tip:Flick up into the log to hop on';
  // run 1: the engine reaches the hint and sends it (engine.ts stage hints: markTipHeard, then guide -> bindSent)
  assert.equal(tipHeard(stage, id), false);
  markTipHeard(stage, id);
  bindSent('Flick up into the log to hop on');
  // Dot never shows it (he fell as it was queued; it aged out of her queue): confirmHeard is never called
  assert.equal(tipKept(stage, id), false, 'not written to the phone: right (DOT-1)');
  // run 2: he restarts the stage in the same session. The engine builds a new stage and resets every hint (h.shown = false),
  // then asks tipMemory whether to say it
  assert.equal(tipHeard(stage, id), false, 'the tip is still marked "sent" from the last run, so the engine will not say it again this session');
});
