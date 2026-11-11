/**
 * Audit C (puzzle), finding P-04. Asserts the CORRECT behaviour; FAILS today.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/puzzle-lantern-resume.test.ts
 *
 * 8-4 (the Lantern Run) has its own set-back: every fall and every dark-out puts him at "the last flower he filled at"
 * (w8LanternRun.ts fallBack / setbackAt -> lantern.ts setbackTo, `st.last`). A fresh LanternState starts with `last` = the FIRST
 * flower (lantern.ts newLantern). The Android app's flag resume (engine.ts start(): skipped for a slide, Dot's flight and a rising
 * tide, "which keep their own flags", but not for the jar) puts him at the flag the cut-off run had reached and leaves `last` at the
 * first flower. So the first fall after a resume, before he has walked through another flower, sends him back to the very start of
 * the stage: up to 34,000 px behind the flag he was just given.
 *
 * Correct: a set-back after a resume never puts him behind the flag he resumed at.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../../../src/game/realPlay.ts';

test('P-04: 8-4 resumed at a flag: the first fall sets him back no further than that flag', () => {
  const flags = new RealPlay('8-4', 1).stage.checkpoints ?? [];
  assert.ok(flags.length >= 3, 'the stage has flags');
  const flag = flags[flags.length - 1];
  const sim = new RealPlay('8-4', 1);
  const e = sim.e;
  // (what start() does in the Android app when flagFor('8-4') has a flag)
  e.startAtFlag({ x: flag.x, y: flag.y });
  for (let i = 0; i < 20; i++) sim.frame();
  assert.ok(Math.abs(sim.p.x - flag.x) < 60, `he stands at the flag (${Math.round(sim.p.x)})`);
  // a fall past the bottom (engine.ts: `if (this.lanternRun) this.lanternFall()`)
  e.lanternFall();
  for (let i = 0; i < 5; i++) sim.frame();
  assert.ok(sim.p.x >= flag.x - 1500, `resumed at the flag at x ${Math.round(flag.x)}, then one fall put him at x ${Math.round(sim.p.x)}: the start of the stage`);
});
