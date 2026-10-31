/**
 * "Don't sit" is warned before it can hurt (QA v193): standing still in 5-1 and 5-2, Dot's line about the creeping silk is on screen
 * before the wrap comes, in both looks. The old look's banner puts up an engine line the moment it arrives (Wayside.tsx) and holds it for
 * guideShowMs; the new look's queue (dotGuide.ts) must let it break in over whatever she is saying then (a lesson's info line, a tip),
 * so the creep and the wrap are danger lines, not tips waiting their turn.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { W5_TEACH } from './w5Kit.ts';
import { GuideQueue, classifyLine, isUrgent, type GuideLine } from './dotGuide.ts';
import { swapLine } from './dotLines.ts';
import { guideShowMs } from './wayside.ts';

/** stand him at x, take a step (the stage has seen him move), let go, and stand still until the wrap; when each line came */
function standStill(stage: '5-1' | '5-2') {
  const sim = new RealPlay(stage, 1);
  sim.safe = false;
  sim.stand(stage === '5-1' ? 700 : 600, G);
  for (let i = 0; i < 3; i++) sim.frame({ right: true });
  const t0 = sim.e.gameTime;
  const hp = sim.p.hp;
  const wrapText = stage === '5-1' ? W5_TEACH.wrapGentle : W5_TEACH.wrapped;
  let wrapAt = -1;
  for (let i = 0; i < 30 * 14 && wrapAt < 0; i++) {
    sim.frame();
    if (sim.p.hp < hp || sim.said.some((s) => s.text === wrapText)) wrapAt = sim.e.gameTime;
  }
  for (let i = 0; i < 15; i++) sim.frame();
  const sit = sim.said.find((s) => s.text === W5_TEACH.sit);
  const wrapLine = sim.said.find((s) => s.text === wrapText);
  return { t0, wrapAt, sitAt: sit ? sit.t : -1, wrapLineAt: wrapLine ? wrapLine.t : -1 };
}

/** the line as the new look's guide builds it from the engine's words (DotGuide.tsx engineLine) */
function asGuideLine(text: string, stage: string): GuideLine {
  const c = classifyLine(text);
  const sw = swapLine(text, stage);
  return { key: `engine:${sw?.line.id ?? text}`, text: sw?.text ?? text, kind: c.kind, who: 'Dot', move: c.move, topic: c.topic, source: 'engine' };
}

for (const stage of ['5-1', '5-2'] as const) {
  test(`${stage}: standing still, Dot's silk warning is on screen before the wrap, in the old look and the new`, () => {
    const { t0, wrapAt, sitAt, wrapLineAt } = standStill(stage);
    assert.ok(wrapAt > 0, 'he is wrapped in the end');
    assert.ok(wrapLineAt > 0 && wrapLineAt - wrapAt < 0.4, 'the wrap\'s own line follows at once (the warning taken down first)');
    assert.ok(sitAt > 0 && sitAt < wrapAt - 1.5, `the warning (at ${(sitAt - t0).toFixed(2)} s) comes well before the wrap (${(wrapAt - t0).toFixed(2)} s)`);

    // the old look: the banner shows it from when it is sent, and still at the wrap
    assert.ok(guideShowMs(W5_TEACH.sit, 4200) >= (wrapAt - sitAt) * 1000, 'the banner still holds it when the wrap comes');

    // the new look: she is in the middle of a lesson's info line (and a tip waits) when the silk starts; the warning breaks in at once
    const sit = asGuideLine(W5_TEACH.sit, stage);
    const wrap = asGuideLine(stage === '5-1' ? W5_TEACH.wrapGentle : W5_TEACH.wrapped, stage);
    assert.ok(isUrgent(sit) && isUrgent(wrap), `the creep and the wrap are urgent (${sit.kind}, ${wrap.kind})`);
    const q = new GuideQueue();
    const env = { danger: false, moveCount: () => 0 };
    const ms = (t: number) => (t - t0) * 1000;
    q.push({ key: 'lesson:fruit', text: 'Run through petals to pick them up.', kind: 'info', who: 'Dot', source: 'lesson' }, ms(sitAt) - 1500);
    q.tick(ms(sitAt) - 1500, env);
    q.push({ key: 'engine:w5.chair', text: 'Slide past the chairs. Never sit.', kind: 'teach', who: 'Dot', move: 'run', source: 'engine' }, ms(sitAt) - 1000);
    q.push(sit, ms(sitAt));
    assert.equal(q.cur?.line.key, sit.key, 'the warning is up the moment the silk starts');
    for (let t = ms(sitAt); t < ms(wrapAt); t += 100) {
      q.tick(t, env);
      assert.equal(q.cur?.line.key, sit.key, `still up at ${((t - ms(sitAt)) / 1000).toFixed(1)} s, before the wrap`);
    }
    // and the wrap's own line comes in at once too
    q.push(wrap, ms(wrapAt));
    q.tick(ms(wrapAt), env);
    assert.ok(q.cur?.line.key === wrap.key || q.has(wrap.key), 'the wrap line is up or next');
  });
}
