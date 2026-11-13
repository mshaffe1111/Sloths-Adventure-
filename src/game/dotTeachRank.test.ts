// R-165.147 (FIX-A): a stage's own TEACH line outranks the stock lessons at its beat. Waiting, it goes before a stock lesson queued
// ahead of it (same priority, older: before this, the older went first); and a stock lesson's move tip that is up and has been read its
// reading time steps aside for it, coming back once after (1-3: "Flick up..." and "Tap to punch it..." held the trap tip back past the
// first trap, P13's first-timer bots). General: no stage id here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CALM, GuideQueue, TIPS_GAP_MS, readMs, type GuideLine, type TickEnv } from './dotGuide.ts';
import { engineGuideLine } from './dotLines.ts';
import { lessonDotLine } from './lessons.ts';

const TIP = 'Shake the vine by the branch and the hive drops on whoever sleeps under it.';
const env: TickEnv = { danger: false, moveCount: () => 0 };
const keysUp = (q: GuideQueue, from: number, to: number, push: Record<number, GuideLine[]>) => {
  const out: { t: number; key: string | null }[] = [];
  for (let t = from; t <= to; t += 100) {
    for (const l of push[t] ?? []) q.push(l, t);
    out.push({ t, key: q.tick(t, env)?.line.key ?? null });
  }
  return out;
};
const firstAt = (rows: { t: number; key: string | null }[], key: string) => rows.find((r) => r.key === key)?.t ?? -1;

test('waiting: the stage teach line goes before stock lessons queued ahead of it', () => {
  for (const tips of [true, false]) {
    const q = new GuideQueue(true, tips ? TIPS_GAP_MS : CALM.gapMs);
    const t0 = CALM.startMs;
    const up: GuideLine = { key: 'up', text: 'A flag! Fall, and you start again here.', kind: 'must', who: 'Dot', source: 'engine' };
    const gap = lessonDotLine('gap', 'screen')!;
    const foe = lessonDotLine('foe', 'screen')!;
    const tip = engineGuideLine(TIP, '9-9', { dot: true, teach: true })!;
    const rows = keysUp(q, t0, t0 + 40000, { [t0]: [up], [t0 + 200]: [gap, foe], [t0 + 400]: [tip] });
    const at = firstAt(rows, tip.key);
    assert.ok(at > 0, 'said');
    for (const l of [gap, foe]) {
      const s = firstAt(rows, l.key);
      assert.ok(s < 0 || s > at, `${tips ? 'Tips' : 'Help'}: ${l.key} at ${s}, the teach at ${at}: the teach goes first`);
    }
  }
});

test('up: a stock lesson\'s move tip, once read, steps aside for the stage teach line, and comes back once after it', () => {
  const q = new GuideQueue(true, TIPS_GAP_MS);
  const t0 = CALM.startMs;
  const gap = lessonDotLine('gap', 'screen')!;
  const tip = engineGuideLine(TIP, '9-9', { dot: true, teach: true })!;
  const rows = keysUp(q, t0, t0 + 40000, { [t0]: [gap], [t0 + 500]: [tip] });
  const at = firstAt(rows, tip.key);
  assert.ok(at >= t0 + readMs(gap.text) && at <= t0 + readMs(gap.text) + 1000, `the teach at ${at - t0} ms: once the lesson has been up its reading time (${readMs(gap.text)})`);
  const back = rows.filter((r) => r.t > at && r.key === gap.key);
  assert.ok(back.length > 0, 'the lesson (its move still not done) comes back after the teach line');
  // (the planted contrast: a plain line of the same words does not move the lesson)
  const q2 = new GuideQueue(true, TIPS_GAP_MS);
  const plain = engineGuideLine(TIP, '9-9', { dot: true })!;
  const rows2 = keysUp(q2, t0, t0 + 14000, { [t0]: [gap], [t0 + 500]: [plain] });
  assert.ok(rows2.filter((r) => r.t < t0 + 11000).every((r) => r.key === gap.key || r.key === null));
});

test('a stage teach line never makes a lesson give way before it has been read its reading time', () => {
  const q = new GuideQueue(true, TIPS_GAP_MS);
  const t0 = CALM.startMs;
  const gap = lessonDotLine('gap', 'screen')!;
  const tip = engineGuideLine(TIP, '9-9', { dot: true, teach: true })!;
  const rows = keysUp(q, t0, t0 + 20000, { [t0]: [gap], [t0 + 100]: [tip] });
  assert.ok(rows.filter((r) => r.t < t0 + readMs(gap.text)).every((r) => r.key === gap.key));
});
