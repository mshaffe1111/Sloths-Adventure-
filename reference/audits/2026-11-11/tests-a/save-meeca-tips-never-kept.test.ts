/**
 * Audit 2026-11-11, slice "save" — Dot's tip memory (src/game/tipMemory.ts, `sloth_tips_<stage>`) and Meeca's stage (5-M).
 *
 * PROVES (fails today): a "teach" line of Meeca's stage is documented as said "once per device" (meecaLines.ts:40, meecaPlay.ts:852
 * "a teaching one once per device"), and it is said again on every run. Since the DOT-1 change a tip is written to the phone only
 * when the line that carries it has been SHOWN: markTipHeard only marks it "sent this session", the engine's guide() binds the sent
 * tips to its text (engine.ts:8381 bindSent) and Dot's bubble confirms it (dotSay.ts:78 confirmHeard -> keep). Meeca's lines never go
 * through the engine's guide(): meecaPlay.ts say() (line 860) and the ring tip (line 739) call markTipHeard and then show the line
 * in her own thought cloud. Nothing ever confirms it, and the next engine (a retry, the next visit) starts with forgetSent()
 * (engine.ts:833), so the tip is gone. Worse, a tip left "pending" is bound to whatever line the engine says NEXT (tipMemory.ts:48
 * bindSent takes every pending tip), so if anything is kept at all it is kept when an unrelated line is shown.
 *
 * FIXED LOOKS LIKE: one way to say a once-only line, used by every speaker (Meeca's cloud confirms its own tips when the thought has
 * been up its time, or calls keep() the way tipMemory.ts:64 offers for "a tip with no line"), and a test per caller of markTipHeard
 * that the tip is on the phone after its line was shown. This test uses the real engine and the real stage.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { run, step } from './save-engine.ts';
import { MEECA_SAY } from '../../../../src/game/meecaLines.ts';
import { tipKept } from '../../../../src/game/tipMemory.ts';

test("Meeca's teaching line, once shown, is not said again on the next run", () => {
  localStorage.removeItem('sloth_tips_5-M');
  const line = MEECA_SAY.high; // { teach: true }: "Too far to jump. The high way, then."
  const a = run('5-M', 4242);
  a.e.isRunning = true;
  a.e.mc.say(line);
  let shown = false;
  for (let i = 0; i < 30 * 20; i++) {
    step(a);
    if (a.e.mc.thought?.text === line.text) shown = true;
  }
  assert.ok(shown, 'set-up: her thought was on screen in the first run');
  const kept = tipKept('5-M', `meeca:${line.id}`);
  a.e.stop();
  // the next run of her stage (a retry, or tomorrow)
  const b = run('5-M', 4242);
  const before = b.e.mc.queue.length;
  b.e.mc.say(line);
  const saidAgain = b.e.mc.queue.length - before;
  b.e.stop();
  assert.deepEqual(
    { keptOnThePhone: kept, saidAgainNextRun: saidAgain },
    { keptOnThePhone: true, saidAgainNextRun: 0 },
    `after 20 s with the line shown (the engine's own guide() was called ${a.guides.length} times in that run)`,
  );
});
