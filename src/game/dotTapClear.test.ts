/**
 * R-165.175 (Matt's wife's blind test, 11-12: "By the time she tries to read it, it's gone"): Dot's cards are cleared by a tap, at the
 * player's own pace; one left unread fades after about 3x its reading time; one card at a time, with a +N badge for those waiting; 1-1
 * teaches it on her first card ("Tap here when you've read it. I'll wait!"). Pure queue logic: the clock is handed in.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { FADE_K, GuideQueue, TAP_HINT, TAP_MIN_MS, TIPS_GAP_MS, readMs, type GuideLine, type TickEnv } from './dotGuide.ts';

const env: TickEnv = { danger: false, moveCount: () => 0 };
const info = (key: string, text: string, o: Partial<GuideLine> = {}): GuideLine => ({ key, text, kind: 'info', who: 'Dot', source: 'engine', waitMs: 60000, ...o });
/** the app's queue: calm, on Tips' 30 s gap, with tap-to-clear's fade */
const app = () => {
  const q = new GuideQueue(true, TIPS_GAP_MS);
  q.fadeK = FADE_K;
  return q;
};
const run = (q: GuideQueue, from: number, to: number, step = 50) => {
  const seen: { at: number; key: string }[] = [];
  let last = '';
  for (let t = from; t <= to; t += step) {
    const s = q.tick(t, env);
    const k = s?.line.key ?? '';
    if (k && k !== last) seen.push({ at: t, key: k });
    last = k;
  }
  return seen;
};

test('an unread card stays about 3x its reading time, then fades (it never goes at its bare reading time)', () => {
  assert.equal(FADE_K, 3);
  const q = app();
  const l = info('a', 'A flag! Fall, and you start again here.');
  q.push(l, 3000);
  assert.equal(q.tick(3000, env)?.line.key, 'a');
  const r = readMs(l.text);
  assert.equal(q.tick(3000 + r + 100, env)?.line.key, 'a', 'still up just after its reading time');
  assert.equal(q.tick(3000 + FADE_K * r - 50, env)?.line.key, 'a', 'still up just before 3x');
  assert.equal(q.tick(3000 + FADE_K * r, env), null, 'gone at 3x');
  assert.deepEqual(q.drain().filter((e) => e.type === 'end').map((e) => e.type === 'end' && e.why), ['read']);
});

test('a tap clears the card at once (why "tapped"); a tap in its first moments does not (a stray touch as it opens)', () => {
  const q = app();
  q.push(info('a', 'A flag! Fall, and you start again here.'), 3000);
  q.tick(3000, env);
  assert.equal(q.tap(3000 + TAP_MIN_MS - 10), false);
  assert.equal(q.cur?.line.key, 'a');
  assert.equal(q.tap(3000 + TAP_MIN_MS), true);
  assert.equal(q.cur, null);
  const ends = q.drain().filter((e) => e.type === 'end');
  assert.equal(ends.length, 1);
  assert.equal(ends[0].type === 'end' && ends[0].why, 'tapped');
  assert.equal(q.tap(5000), false, 'nothing up: nothing to clear');
});

test('the +N badge counts the cards still to come, and a player tapping each one then sees exactly that many, one at a time, even on Tips', () => {
  const q = app();
  q.push(info('a', 'First card words here.'), 3000);
  q.tick(3000, env);
  q.push(info('b', 'Second card words.'), 3100);
  q.push(info('c', 'Third card words.'), 3200);
  assert.equal(q.pending(3300, env), 2);
  let t = 3300 + TAP_MIN_MS;
  const shown: string[] = [];
  for (let i = 0; i < 5; i++) {
    assert.ok(q.tap(t) || i > 0);
    const next = run(q, t, t + 2000);
    if (!next.length) break;
    shown.push(next[0].key);
    t = next[0].at + TAP_MIN_MS + 100;
  }
  assert.deepEqual(shown, ['b', 'c'], 'two waiting, two seen (Tips\' 30 s gap does not hold back what he asked for by tapping)');
  assert.equal(q.pending(t, env), 0);
});

test('the badge leaves out a card that has gone stale, and one that came after the tap still waits the gap', () => {
  const q = app();
  q.push(info('a', 'First card words here.'), 3000);
  q.tick(3000, env);
  q.push(info('old', 'Old news soon.', { waitMs: 1000 }), 3100);
  assert.equal(q.pending(3200, env), 1);
  assert.equal(q.pending(4200, env), 0, 'past its wait: not counted');
  q.tap(4200);
  q.push(info('late', 'Came after the tap.'), 4300);
  assert.deepEqual(run(q, 4300, 4300 + 5000), [], 'a line that came after the tap keeps the usual gap');
});

test('1-1 teaches the tap on her first card that waits to be read (not a move tip, not Pokey, not a warning), once a stage, until learned', () => {
  assert.equal(TAP_HINT, "Tap here when you've read it. I'll wait!");
  const fresh = () => {
    const q = new GuideQueue(true, 0);
    q.fadeK = FADE_K;
    q.tapHint = true;
    return q;
  };
  let q = fresh();
  q.push({ key: 'm', text: 'Slide your thumb to run. Keep it down.', kind: 'teach', who: 'Dot', move: 'run', source: 'coach' }, 3000);
  assert.equal(q.tick(3000, env)?.line.key, 'm');
  assert.equal(q.cur?.hint, undefined, 'a move tip closes when the move is done: no time to read the hint');
  q = fresh();
  q.push(info('p', 'Pokey thinks.', { who: 'Pokey' }), 3000);
  assert.equal(q.tick(3000, env)?.line.key, 'p');
  assert.equal(q.cur?.hint, undefined, "Pokey's own thought never carries Dot's words");
  q = fresh();
  q.push(info('w', 'Ouch! Watch out.', { kind: 'danger' }), 3000);
  assert.equal(q.tick(3000, env)?.line.key, 'w');
  assert.equal(q.cur?.hint, undefined, 'a warning is no place for a lesson');
  q = fresh();
  const l = info('a', 'A flag! Fall, and you start again here.', { source: 'lesson' });
  q.push(l, 3000);
  const s = q.tick(3000, env);
  assert.equal(s?.hint, TAP_HINT);
  // (the hint's words are read too: the card holds for both)
  assert.equal(q.holdFor(s!), FADE_K * readMs(`${l.text} ${TAP_HINT}`));
  assert.equal(q.tick(3000 + FADE_K * readMs(l.text) + 100, env)?.line.key, 'a', 'up past the bare line\'s 3x');
  assert.ok(q.tap(3000 + TAP_MIN_MS));
  q.push(info('b', 'Next card words.'), 9500);
  assert.equal(run(q, 9500, 12000)[0]?.key, 'b');
  assert.equal(q.cur?.hint, undefined, 'once a stage');
});

test("the tools' reader (fadeK 1, the default) still has each card up its reading time, as before", () => {
  const q = new GuideQueue(true, TIPS_GAP_MS);
  const l = info('a', 'A flag! Fall, and you start again here.');
  q.push(l, 3000);
  q.tick(3000, env);
  assert.equal(q.tick(3000 + readMs(l.text) - 50, env)?.line.key, 'a');
  assert.equal(q.tick(3000 + readMs(l.text), env), null);
});

test('a move tip whose move he has done stays up its reading time on the phone (a petal picked up at once), unless a next step follows', () => {
  let ran = 0;
  const e: TickEnv = { danger: false, moveCount: (m) => (m === 'run' ? ran : 0) };
  const tip: GuideLine = { key: 'p', text: 'Run through petals to pick them up.', kind: 'teach', who: 'Dot', move: 'run', source: 'lesson' };
  for (const readDone of [false, true]) {
    const q = app();
    q.readDone = readDone;
    ran = 0;
    q.push(tip, 3000);
    q.tick(3000, e);
    ran = 1;
    const at = [3000 + 1600, 3000 + readMs(tip.text) - 100, 3000 + readMs(tip.text) + 50].map((t) => q.tick(t, e)?.line.key ?? null);
    assert.deepEqual(at, readDone ? ['p', 'p', null] : [null, null, null], readDone ? 'held to its reading time' : 'the old way: gone at 1.5 s (the defect)');
  }
  const q = app();
  q.readDone = true;
  ran = 0;
  q.push({ ...tip, key: 'g', next: { key: 'g2', text: 'Flick up as you swing forward to leap.', kind: 'teach', who: 'Dot', move: 'leap', source: 'lesson' } }, 3000);
  q.tick(3000, e);
  ran = 1;
  assert.equal(q.tick(3000 + 1600, e), null, 'with a next step, it goes once done (its next step is about now)');
});

test('a warning and a scene\'s line keep their reading time; the rest of the cards stay 3x', () => {
  const q = app();
  const w = info('w', 'Ouch! Watch out for that one.', { kind: 'danger' });
  q.push(w, 3000);
  const s = q.tick(3000, env)!;
  assert.equal(q.holdFor(s), readMs(w.text));
  const sc = { line: info('s', 'Somebody I am scared of.', { kind: 'story', scene: true }), startedAt: 0, base: 0, n: 1 };
  assert.equal(q.holdFor(sc), readMs(sc.line.text));
  const st = { line: info('a', 'A story aside, said slowly.', { kind: 'story' }), startedAt: 0, base: 0, n: 2 };
  assert.equal(q.holdFor(st), FADE_K * readMs(st.line.text));
});
