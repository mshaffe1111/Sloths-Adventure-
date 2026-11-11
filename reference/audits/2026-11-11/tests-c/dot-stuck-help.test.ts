/**
 * ENGINE-AUDIT-C findings C-02 and C-03 (2026-11-11). These tests assert the CORRECT behaviour and FAIL on t-int-1-1 @ fa5ad9d1.
 * Run: npx tsx --test reference/audits/2026-11-11/tests-c/dot-stuck-help.test.ts
 *
 * The engine's stuck helper (stuckHelper.ts, engine.ts watchForStuck) sends Dot one line in three wordings, by control style. Dot's
 * guide works out WHAT the line is from its English words (dotLines.ts engineGuideLine -> swapLine by old words, else classifyLine's
 * regexes). Only the touch wording is in the approved table (dotLinesData.ts eng.stuck.wall; w5Lines.ts w5.step).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { stuckLine } from '../../../../src/game/stuckHelper.ts';
import { engineGuideLine } from '../../../../src/game/dotLines.ts';
import { GuideQueue, type MoveId } from '../../../../src/game/dotGuide.ts';
import { DotSay } from '../../../../src/game/dotSay.ts';
import { W5_STEP_HELP, W5_STEP_HELP_KEYS, W5_STEP_HELP_PAD } from '../../../../src/game/w5Lines.ts';

const shape = (text: string, stage: string) => {
  const l = engineGuideLine(text, stage, { dot: true })!;
  return { kind: l.kind, move: l.move ?? null, key: l.key };
};

test('C-02: the stuck helper is the same kind of line whatever the controls (wall line)', () => {
  const touch = shape(stuckLine('screen'), '2-3');
  for (const mode of ['pad', 'keys'] as const) {
    const other = shape(stuckLine(mode), '2-3');
    assert.deepEqual({ kind: other.kind, move: other.move, key: other.key }, touch, `stuckLine('${mode}') is classified differently from the touch line`);
  }
});

test('C-02: the stuck helper is the same kind of line whatever the controls (World 5 step line)', () => {
  const touch = shape(W5_STEP_HELP, '5-1');
  for (const [mode, text] of [['pad', W5_STEP_HELP_PAD], ['keys', W5_STEP_HELP_KEYS]] as const) {
    const other = shape(text, '5-1');
    assert.deepEqual({ kind: other.kind, move: other.move, key: other.key }, touch, `W5 step help (${mode}) is classified differently from the touch line`);
  }
});

test('C-02: a pad player who double-jumped earlier in the stage still hears the stuck help', () => {
  // (the stuck watch fires after three failed single jumps at a wall; an earlier double jump elsewhere in the stage is normal)
  const q = new GuideQueue(true);
  const count = (m: MoveId) => (m === 'double' ? 1 : m === 'jump' ? 9 : 0);
  q.push(engineGuideLine(stuckLine('pad'), '2-3', { dot: true })!, 20000);
  let cur = null;
  for (let t = 20000; t <= 40000 && !cur; t += 100) cur = q.tick(t, { danger: false, moveCount: count });
  assert.ok(cur, 'the pad wording was dropped unsaid (treated as a move tip for a move already done this stage)');
});

test('C-03: on Tips (Normal\'s default) the stuck help the engine counts as given is really said', () => {
  // engine.ts watchForStuck sets told=true (once a stage), logs recorder 'stuckHelp' and holds World 5 still 7 s the moment it calls
  // guide(); it never learns whether Dot's setting let the line through
  const q = new GuideQueue(true);
  const say = new DotSay(q, 'reminders', new Set(), new Set(), true);
  const said = say.say(engineGuideLine(stuckLine('screen'), '2-3', { dot: true })!, 20000);
  assert.equal(said, true, "Tips drops the touch stuck line (kind 'struggle', source 'engine': helpAllows only passes source 'struggle' + key 'struggle:death')");
});
