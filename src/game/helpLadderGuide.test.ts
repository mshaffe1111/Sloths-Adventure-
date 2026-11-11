// Dot's guide shows the help ladder's lines (R-165.62; DotGuide.tsx engineLine routes them through helpGuideLine): on Help and Tips,
// after the stage's own double-jump teach has been said and read, the move line and the step line each come up in her bubble; on Quiet
// neither does. The red: the old path (engineGuideLine through DotSay, what engineLine did before) never shows them on Tips.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { engineGuideLine } from './dotLines.ts';
import { DotSay } from './dotSay.ts';
import { GuideQueue, type GuideLine } from './dotGuide.ts';
import { helpGuideLine, HELP_LINES, MOVE_LINES, STEP_LINE } from './helpLadder.ts';

type Help = 'teach' | 'reminders' | 'quiet';
const env = { danger: false, moveCount: () => 0, stale: () => false };

/** a stage of 1-1 on a setting: the double's teach line said and read, then each ladder line sent; what came up in her bubble */
function bubble(help: Help, route: 'ladder' | 'old'): string[] {
  const q = new GuideQueue(true);
  const ds = new DotSay(q, help, new Set(), new Set(['jump', 'double']));
  const shown: string[] = [];
  let now = 0;
  const run = (ms: number) => {
    for (const end = now + ms; now < end; now += 100) {
      q.tick(now, env as never);
      ds.keep(now);
      const t = q.cur?.line.text;
      if (t && shown[shown.length - 1] !== t) shown.push(t);
    }
  };
  ds.say(engineGuideLine('Flick up again in the air to jump twice', '1-1', { dot: true })!, now);
  run(20000);
  for (const text of [MOVE_LINES.double.touch, STEP_LINE]) {
    if (route === 'ladder') {
      const l = helpGuideLine(text, help, 6000);
      assert.notEqual(l, undefined, 'a ladder line');
      if (l) q.push(l as GuideLine, now);
    } else ds.say(engineGuideLine(text, '1-1', { dot: true, ms: 6000 })!, now);
    run(30000);
  }
  return shown;
}

for (const help of ['teach', 'reminders'] as const) {
  test(`Dot's guide on ${help === 'teach' ? 'Help (Easy)' : 'Tips (Normal)'}: the ladder's move line and step line each come up once, after the double was taught`, () => {
    const s = bubble(help, 'ladder');
    assert.equal(s.filter((t) => t === MOVE_LINES.double.touch).length, 1, s.join(' | '));
    assert.equal(s.filter((t) => t === STEP_LINE).length, 1, s.join(' | '));
  });
}

test('Quiet: no ladder line in her bubble (the step still grows and the offer still shows: the engine does those, helpLadder11.test.ts)', () => {
  const s = bubble('quiet', 'ladder');
  assert.ok(!s.some((t) => HELP_LINES.has(t)), s.join(' | '));
});

test('planted: the old path (her tip rules) drops both lines on Tips', () => {
  const s = bubble('reminders', 'old');
  assert.ok(!s.some((t) => HELP_LINES.has(t)), s.join(' | '));
});

test('a line that is not the ladder\'s goes the old way', () => {
  assert.equal(helpGuideLine('Flick up again in the air to jump twice', 'teach'), undefined);
});
