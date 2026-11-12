/**
 * Audit C-03 (ENGINE-AUDIT-C, 11-11): the engine counted the stuck help as given the moment it SENT the line. It set the stage's "told"
 * (never again this stage), held World 5's stillness 7 s and logged the recorder's `stuckHelp` / `stuckStepHelp` and `dot` moments,
 * though Dot's setting can drop the line (Tips drops it: dotGuideHelp.ts) and nothing was shown. The testers' "did Dot's tips help?"
 * counted sends, not shows. Now all of that hangs off Dot's "shown" report (guideShown.ts; DotSay.keep reports a line up its minimum
 * time). (The audit's own test 4, "Tips says the stuck line", is the stuck helper itself, which waits for the help ladder off 1-1:
 * R-165.62.)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G, buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { levelConfig } from './realPlay.ts';
import { recorder } from './playRecorder.ts';
import { stuckLine } from './stuckHelper.ts';
import { W5_STEP_HELP, W5_STEP_HELP_KEYS, W5_STEP_HELP_PAD } from './w5Lines.ts';
import { guideShown } from './guideShown.ts';
import { GuideQueue, GUIDE } from './dotGuide.ts';
import { DotSay } from './dotSay.ts';
import { engineGuideLine } from './dotLines.ts';
import { takeGuideShown } from './guideShown.ts';
import type { W5Info } from './w5Stages.ts';

const STEP_LINES = [W5_STEP_HELP, W5_STEP_HELP_PAD, W5_STEP_HELP_KEYS];
const WALL_LINES = [stuckLine('screen'), stuckLine('pad'), stuckLine('keys')];
const STUCK_HOLD = 7;

type Eng = { w5: { grace: number }; guide: (text: string, s: number) => void; gameTime: number; stop(): void };

/** 5-1, a player hopping at `q` again and again; Dot's guide never reports the line shown unless the test does (her setting dropped it) */
function atStep(kind: 'step' | 'wall') {
  const st = buildProtoStage(levelConfig('5-1'), 1, HAND_STAGES['5-1']) as unknown as { w5info: W5Info };
  const q = kind === 'step' ? st.w5info.stumps.find((s) => s.h <= 100)! : st.w5info.stumps.find((s) => s.h > 100)!;
  assert.ok(q, `5-1 seed 1 has a ${kind} stump`);
  const sim = new RealPlay('5-1', 1);
  sim.safe = false;
  const e = sim.e as unknown as Eng;
  // (the harness turns the stuck-helper off as cosmetic, realPlay.ts: here it is what is tested)
  delete (sim.e as Record<string, unknown>).watchForStuck;
  // (and its guide reports every line shown at once: here nothing is shown until the test says so)
  const sent: string[] = [];
  const proto = Object.getPrototypeOf(sim.e) as Eng;
  e.guide = (text: string, s: number) => {
    sent.push(text);
    proto.guide.call(e, text, s);
  };
  const events: string[] = [];
  const was = recorder.event;
  const wasOn = recorder.on;
  recorder.on = true;
  recorder.event = ((what: string, detail?: string | number) => {
    events.push(`${what} ${detail ?? ''}`.trim());
  }) as typeof recorder.event;
  sim.stand(q.x - 120, G);
  for (let i = 0; i < 40 && q.x - sim.p.x > 30; i++) sim.frame({ right: true });
  const lines = kind === 'step' ? STEP_LINES : WALL_LINES;
  const helpSent = () => sent.filter((t) => lines.includes(t)).length;
  /** hop straight up beside it, the thumb lifted, until the help is sent `n` times in all (at most `max` hops) */
  const hopUntil = (n: number, max: number) => {
    let hops = 0;
    for (; hops < max && helpSent() < n; hops++) {
      sim.frame({ press: true, jump: true });
      for (let i = 0; i < 4; i++) sim.frame({ jump: true });
      for (let i = 0; i < 40; i++) sim.frame();
    }
    return hops;
  };
  return {
    sim, e, events, sent, lines, helpSent, hopUntil,
    done: () => {
      recorder.event = was;
      recorder.on = wasOn;
      e.stop();
    },
  };
}

for (const kind of ['step', 'wall'] as const) {
  test(`C-03 (5-1, the ${kind} watch): stuck help Dot never showed is not counted as given; once she shows it, it is, once`, () => {
    takeGuideShown();
    const f = atStep(kind);
    const ev = kind === 'step' ? 'stuckStepHelp' : 'stuckHelp';
    try {
      f.hopUntil(1, 8);
      assert.equal(f.helpSent(), 1, `the ${kind} help is sent after the failed hops`);
      const text = f.sent.filter((t) => f.lines.includes(t))[0];
      for (let i = 0; i < 3; i++) f.sim.frame();
      // her setting dropped it: nothing was given
      assert.deepEqual(f.events.filter((v) => v.startsWith(ev)), [], `no ${ev} logged for a line nobody saw`);
      assert.deepEqual(f.events.filter((v) => v.startsWith('dot ')), [], 'no `dot` moment logged for a line nobody saw');
      assert.ok(f.e.w5.grace < 1, `World 5's stillness is not held for a line nobody sees (grace ${f.e.w5.grace.toFixed(2)} s)`);
      // and the stage is not marked told: three more failed hops ask again
      const hops = f.hopUntil(2, 8);
      assert.equal(f.helpSent(), 2, `the help is sent again after more failed hops (${hops} hops)`);
      // now Dot shows it (DotSay.keep's report): it is given, held and logged, once
      guideShown(text);
      f.sim.frame();
      assert.equal(f.events.filter((v) => v.startsWith(ev)).length, 1, `${ev} logged once it is shown: ${f.events.join(' | ')}`);
      assert.equal(f.events.filter((v) => v.startsWith('dot ')).length, 1, `one \`dot\` moment once it is shown: ${f.events.join(' | ')}`);
      assert.ok(f.e.w5.grace > STUCK_HOLD - 0.5, `the stillness waits while she says it (grace ${f.e.w5.grace.toFixed(2)} s)`);
      // told: never again this stage
      f.hopUntil(3, 8);
      assert.equal(f.helpSent(), 2, 'once shown, the help is not sent again this stage');
    } finally {
      f.done();
    }
  });
}

test('C-03: Dot\'s guide reports an engine line shown only once it has been up its minimum time, in the engine\'s own words', () => {
  takeGuideShown();
  const q = new GuideQueue(true);
  const say = new DotSay(q, 'teach', new Set(), new Set(), true);
  const text = stuckLine('screen');
  const l = engineGuideLine(text, '2-3', { dot: true })!;
  assert.ok(say.say(l, 20000), 'Help lets the stuck line through');
  let t = 20000;
  for (; t < 20000 + GUIDE.minShowMs - 200; t += 100) {
    q.tick(t, { danger: false, moveCount: () => 0 });
    say.keep(t);
  }
  assert.deepEqual(takeGuideShown(), [], 'not reported before its minimum time');
  for (; t < 20000 + GUIDE.minShowMs + 2000; t += 100) {
    q.tick(t, { danger: false, moveCount: () => 0 });
    say.keep(t);
  }
  assert.deepEqual(takeGuideShown(), [text], 'reported once, in the engine\'s words');
  // on Tips her setting drops it (dotGuideHelp.ts): never reported
  const q2 = new GuideQueue(true);
  const tips = new DotSay(q2, 'reminders', new Set(), new Set(), true);
  tips.say(engineGuideLine(text, '2-3', { dot: true })!, 20000);
  for (let u = 20000; u < 40000; u += 100) {
    q2.tick(u, { danger: false, moveCount: () => 0 });
    tips.keep(u);
  }
  assert.deepEqual(takeGuideShown(), [], 'a dropped line is never reported shown');
});
