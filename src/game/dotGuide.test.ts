import test from 'node:test';
import assert from 'node:assert/strict';
import { GUIDE, GuideQueue, classifyLine, readMs, wordCount, type GuideLine, type MoveId } from './dotGuide.ts';
import { StruggleWatch, STRUGGLE, STRUGGLE_LINES, MoveWatch, inDanger } from './dotGuideWatch.ts';
import { helpAllows } from './dotGuideHelp.ts';
import { emptyGuideView } from './dotGuideView.ts';
import { lessonDotLine, LESSON_DOT, type LessonId } from './lessons.ts';
import { fallbackSafeArea, placeBubble, bubbleMaxW } from './dotGuidePerch.ts';

const line = (key: string, kind: GuideLine['kind'], text = 'Follow the petals up the tree', extra: Partial<GuideLine> = {}): GuideLine => ({ key, text, kind, who: 'Dot', source: 'engine', ...extra });

function env(counts: Partial<Record<MoveId, number>> = {}, danger = false) {
  return { danger, moveCount: (m: MoveId) => counts[m] ?? 0 };
}

/** run the queue's clock from `from` to `to` in 100 ms steps; returns the key on screen at each step */
function run(q: GuideQueue, from: number, to: number, e = env()): (string | null)[] {
  const out: (string | null)[] = [];
  for (let t = from; t <= to; t += 100) out.push(q.tick(t, e)?.line.key ?? null);
  return out;
}

test('reading time is 1.5 s + 0.5 s a word, at least 4 s', () => {
  assert.equal(readMs('Go'), 4000);
  assert.equal(readMs('one two three four five'), 4000);
  assert.equal(readMs('one two three four five six'), 4500);
  assert.equal(readMs('Flick up again in the air to jump'), 5500); // 8 words
  assert.equal(readMs('a b c d e f g h i j k l'), 7500); // 12 words
  assert.equal(readMs('  spaced   out   words  here  '), 4000);
});

test('one line at a time, and no line is cut short by a later one (the goal line got 1.1 s before a tip replaced it)', () => {
  const q = new GuideQueue();
  const goal = line('goal', 'goal', 'Collect 14 petals to open the sanctuary');
  q.push(goal, 0);
  assert.equal(q.tick(0, env())?.line.key, 'goal');
  // a tip arrives 1.1 s later: it waits
  const tip = line('tip', 'teach', 'Jump the little gaps', { move: 'jump' });
  q.push(tip, 1100);
  const shown = run(q, 1100, 8000);
  const goalMs = readMs(goal.text);
  // the goal stays its whole reading time
  for (let i = 0; i < shown.length; i++) {
    const t = 1100 + i * 100;
    if (t < goalMs) assert.equal(shown[i], 'goal', `at ${t} ms`);
  }
  // then, after a breath, the tip
  assert.ok(shown.includes('tip'));
  const tipAt = 1100 + shown.indexOf('tip') * 100;
  assert.ok(tipAt >= goalMs + GUIDE.breathMs, `tip at ${tipAt}`);
});

test('the highest priority waiting line goes next, oldest first within a priority', () => {
  const q = new GuideQueue();
  q.push(line('first', 'info', 'Something shiny, far away'), 0);
  q.tick(0, env());
  q.push(line('story', 'story', 'A quiet line'), 10);
  q.push(line('info2', 'info', 'The canopy road', { waitMs: 60000 }), 20);
  q.push(line('goal', 'goal', 'Collect 3 petals to open the sanctuary'), 30);
  q.push(line('info3', 'info', 'Follow the petals', { waitMs: 60000 }), 40);
  const order: string[] = [];
  for (let t = 0; t < 60000; t += 100) {
    const k = q.tick(t, env())?.line.key;
    if (k && order[order.length - 1] !== k) order.push(k);
  }
  assert.deepEqual(order, ['first', 'goal', 'info2', 'info3', 'story']);
});

test('only an urgent line comes in over one being read, and the line it interrupted is said again in full', () => {
  const q = new GuideQueue();
  q.push(line('tip', 'info', 'Something shiny, far away'), 0);
  q.tick(0, env());
  // a story line or a goal does not interrupt
  q.push(line('goal', 'goal', 'Collect 3 petals to open the sanctuary'), 500);
  assert.equal(q.tick(600, env())?.line.key, 'tip');
  // a warning does
  q.push(line('warn', 'danger', 'It saw you! Get into a bush'), 1000);
  assert.equal(q.cur?.line.key, 'warn');
  const ev = q.drain();
  assert.ok(ev.some((e) => e.type === 'end' && e.why === 'cut' && e.show.line.key === 'tip'));
  // after the warning the queue goes by priority again (the goal), and the interrupted line comes back, said in full
  const order: string[] = [];
  let tipFrom = -1;
  let tipTo = -1;
  for (let t = 1000; t < 30000; t += 100) {
    const k = q.tick(t, env())?.line.key;
    if (k && order[order.length - 1] !== k) order.push(k);
    if (k === 'tip') {
      if (tipFrom < 0) tipFrom = t;
      tipTo = t;
    }
  }
  assert.deepEqual(order, ['warn', 'goal', 'tip']);
  assert.ok(tipTo - tipFrom + 100 >= readMs('Something shiny, far away'));
});

test('a move tip stays until the move is done, whatever its reading time', () => {
  const q = new GuideQueue();
  const counts: Partial<Record<MoveId, number>> = { glide: 0 };
  q.push(line('leaf', 'teach', 'Your leaf! Flick up, then keep your thumb on the glass as you fall', { move: 'glide' }), 0);
  for (let t = 0; t <= 15000; t += 100) assert.equal(q.tick(t, env(counts))?.line.key, 'leaf', `at ${t}`);
  counts.glide = 1;
  assert.equal(q.tick(15100, env(counts)), null);
  assert.ok(q.drain().some((e) => e.type === 'end' && e.why === 'done'));
});

test('a move tip not done closes after 20 s, and steps aside after its reading time for a more important line (then comes back)', () => {
  const q = new GuideQueue();
  q.push(line('climb', 'teach', 'Flick up beside the trunk, keep your thumb up', { move: 'climb' }), 0);
  q.tick(0, env());
  assert.equal(q.tick(GUIDE.moveCapMs - 100, env())?.line.key, 'climb');
  assert.equal(q.tick(GUIDE.moveCapMs, env()), null);

  const q2 = new GuideQueue();
  q2.push(line('climb', 'teach', 'Flick up beside the trunk, keep your thumb up', { move: 'climb' }), 0);
  q2.tick(0, env());
  q2.push(line('door', 'must', 'Sealed: collect 2 more petals to open it'), 100);
  // (must is urgent: it comes in over the tip at once, and the tip comes back after it)
  assert.equal(q2.cur?.line.key, 'door');
  const order: string[] = [];
  for (let t = 100; t < 20000; t += 100) {
    const k = q2.tick(t, env())?.line.key;
    if (k && order[order.length - 1] !== k) order.push(k);
  }
  assert.deepEqual(order, ['door', 'climb']);
});

test('no line starts while Pokey is in danger, except the warning itself', () => {
  const q = new GuideQueue();
  q.push(line('tip', 'info', 'Something shiny, far away'), 0);
  assert.equal(q.tick(0, env({}, true)), null);
  q.push(line('warn', 'danger', 'Ouch! When a vine opens an eye, stand still'), 50);
  assert.equal(q.tick(100, env({}, true))?.line.key, 'warn');
  // the tip waits for calm
  let t = 100;
  while (q.cur?.line.key === 'warn' || q.cur === null) {
    t += 100;
    if (t > 20000) break;
    q.tick(t, env({}, t < 9000));
  }
  assert.equal(q.cur?.line.key, 'tip');
  assert.ok(t >= 9000, `tip started at ${t} while still in danger`);
});

test('a story aside waits 8 s after the last line; a line waiting too long is dropped as old news', () => {
  const q = new GuideQueue();
  q.push(line('a', 'info', 'Something shiny, far away'), 0);
  q.tick(0, env());
  q.push(line('s', 'story', 'Quiet stage. Quiet is easy.'), 100);
  const end = readMs('Something shiny, far away');
  assert.equal(q.tick(end, env()), null);
  assert.equal(q.tick(end + GUIDE.storyGapMs - 100, env()), null);
  assert.equal(q.tick(end + GUIDE.storyGapMs, env())?.line.key, 's');

  const q2 = new GuideQueue();
  q2.push(line('tip', 'teach', 'Jump the little gaps', { move: 'jump', waitMs: 3000 }), 0);
  // in danger the whole time it could have started
  q2.tick(0, env({}, true));
  q2.tick(3100, env({}, false));
  assert.equal(q2.cur, null);
  assert.equal(q2.size, 0);
});

test('the same line is never queued twice, and the engine can take its line down when the moment has passed', () => {
  const q = new GuideQueue();
  q.push(line('x', 'danger', 'Here it comes! Duck to hide'), 0);
  q.push(line('x', 'danger', 'Here it comes! Duck to hide'), 10);
  assert.equal(q.size, 1);
  q.tick(20, env());
  q.push(line('x', 'danger', 'Here it comes! Duck to hide'), 30);
  assert.equal(q.size, 0);
  assert.equal(q.cur?.line.key, 'x');
  q.clear((l) => l.kind === 'danger', 500);
  assert.equal(q.cur, null);
});

test('a story aside gives way to a waiting tip after 2 s, once, and comes back in full', () => {
  const q = new GuideQueue();
  const story = line('story:L', 'story', 'The leaf is bigger than he is. He holds it over his head and steps off the edge before he can think about it.');
  q.push(story, 0);
  q.tick(0, env());
  q.push(line('leaf', 'teach', 'Your leaf! Flick up, then keep your thumb on the glass as you fall', { move: 'glide' }), 1000);
  assert.equal(q.tick(1900, env())?.line.key, 'story:L');
  assert.equal(q.tick(2000, env())?.line.key, undefined);
  assert.equal(q.tick(2600, env())?.line.key, 'leaf');
  const counts: Partial<Record<MoveId, number>> = { glide: 1 };
  q.tick(6000, env(counts));
  // back after the story gap, and this time it is read to the end even with a tip waiting
  let t = 6000;
  while (q.cur?.line.key !== 'story:L' && t < 30000) q.tick((t += 100), env(counts));
  const from = t;
  assert.ok(from < 30000, 'the story came back');
  q.push(line('tip2', 'teach', 'Jump the little gaps', { move: 'jump', waitMs: 60000 }), from + 100);
  while (q.cur?.line.key === 'story:L' && t < 60000) q.tick((t += 100), env(counts));
  assert.ok(t - from >= readMs(story.text), `story up ${t - from} ms`);
});

test('the pause menu keeps her last three lines', () => {
  const q = new GuideQueue();
  for (let i = 0; i < 5; i++) {
    q.push(line(`l${i}`, 'danger', `Line number ${i}`), i * 10000);
    q.tick(i * 10000, env());
  }
  assert.deepEqual(q.history.map((h) => h.key), ['l4', 'l3', 'l2']);
});

test("Dot's help: Teach me says it all, Just reminders skips what this phone has seen, Quiet keeps only the must-know and opted-in story", () => {
  const seen = new Set(['move:jump']);
  const kinds = {
    must: { kind: 'must' as const },
    danger: { kind: 'danger' as const },
    goal: { kind: 'goal' as const },
    struggle: { kind: 'struggle' as const },
    newTip: { kind: 'teach' as const, skill: 'move:glide' },
    oldTip: { kind: 'teach' as const, skill: 'move:jump' },
    info: { kind: 'info' as const },
    newInfoLesson: { kind: 'info' as const, skill: 'lesson:fruit' },
    journal: { kind: 'journal' as const },
    story: { kind: 'story' as const },
  };
  const allowed = (help: 'teach' | 'reminders' | 'quiet', storyOn = true) =>
    Object.entries(kinds)
      .filter(([, l]) => helpAllows(l, help, seen, storyOn))
      .map(([k]) => k);
  assert.deepEqual(allowed('teach'), Object.keys(kinds));
  assert.deepEqual(allowed('reminders'), ['must', 'danger', 'goal', 'struggle', 'newTip', 'newInfoLesson', 'story']);
  assert.deepEqual(allowed('quiet'), ['must', 'story']);
  assert.deepEqual(allowed('quiet', false), ['must']);
  assert.deepEqual(allowed('teach', false).includes('story'), false);
});

test('what an engine line is: the locked exit is must-know, warnings are urgent, tips name the move that closes them', () => {
  assert.equal(classifyLine('Sealed: collect 3 more petals to open it').kind, 'must');
  assert.equal(classifyLine('Finish the goal to open the sanctuary').kind, 'must');
  assert.equal(classifyLine('The water is rising! Free them and get back to the bank!').kind, 'must');
  assert.equal(classifyLine('Collect 14 petals to open the sanctuary').kind, 'goal');
  assert.equal(classifyLine('It saw you! Get into a bush before its shadow reaches you').kind, 'danger');
  const t = (s: string) => classifyLine(s);
  assert.deepEqual([t('Flick up into the vine to grab it').move, t('Flick up into the vine to grab it').topic], ['grab', 'vine']);
  assert.equal(t('Flick up again as you swing forward').move, 'leap');
  assert.equal(t('Flick up again in the air to jump twice').move, 'double');
  assert.equal(t('Your leaf! Flick up, then keep your thumb on the glass as you fall').move, 'glide');
  assert.equal(t('Your leaf! Flick up, then keep your thumb on the glass as you fall').topic, 'controls');
  assert.equal(t('Flick up beside the trunk, keep your thumb up').move, 'climb');
  assert.equal(t('Hop up beside the sleeping snake and tap to punch it').move, 'punch');
  assert.equal(t('An eagle is watching. Slide down inside a bush to hide').move, 'crouch');
  assert.equal(t('Keep sliding into the log to push it').move, 'push');
  assert.equal(t('Follow the petals').kind, 'info');
  assert.equal(t('Follow the petals').topic, 'petal');
  // in a boss fight every engine line is the fight's own, said at once
  assert.equal(classifyLine('Hit the head now', true).kind, 'danger');
});

test('every lesson is a short Dot line for each kind of controls, and a move lesson stays until its move', () => {
  for (const id of Object.keys(LESSON_DOT) as LessonId[]) {
    for (const mode of ['screen', 'pad', 'keys'] as const) {
      const l = lessonDotLine(id, mode);
      assert.ok(l, `${id} ${mode}`);
      assert.ok(wordCount(l.text) <= (l.kind === 'teach' ? 8 : 12), `${id} ${mode}: ${l.text}`);
      // touch lines never name keys or buttons
      if (mode === 'screen') assert.ok(!/\b(press|space|button|key)\b/i.test(l.text), `${id}: ${l.text}`);
    }
  }
  // the approved words, and the lesson's next step after the first is done
  const swing = lessonDotLine('swing', 'screen')!;
  assert.equal(swing.text, 'Flick up into the vine to grab it.');
  assert.equal(swing.move, 'grab');
  assert.equal(swing.next?.text, 'Flick up as you swing forward to leap.');
  assert.equal(swing.next?.move, 'leap');
  assert.equal(lessonDotLine('climb', 'screen')!.next?.move, 'climb');
  assert.equal(lessonDotLine('foe', 'screen')!.move, 'punch');
  assert.equal(lessonDotLine('fruit', 'screen')!.kind, 'info');
  // a pad gets its own first line, and no touch follow-up
  assert.equal(lessonDotLine('swing', 'pad')!.next, undefined);
});

test('struggle: two deaths at the same spot give one help line about what got him, once per spot', () => {
  const s = new StruggleWatch();
  assert.equal(s.death(1000, 500, 'fall'), null);
  const h = s.death(1060, 520, 'fall');
  assert.equal(h?.kind, 'death');
  assert.equal(h?.text, STRUGGLE_LINES['death-fall']);
  assert.equal(s.death(1030, 500, 'fall'), null, 'once per spot');
  // a death somewhere else is a fresh spot
  assert.equal(s.death(3000, 500, 'foe'), null);
  assert.equal(s.death(3050, 480, 'foe')?.text, STRUGGLE_LINES['death-foe']);
});

test('struggle: stuck means no progress for 15 s while a thumb is on the glass', () => {
  const s = new StruggleWatch();
  s.restart(100, 500);
  // no thumb on the glass: putting the phone down is not being stuck
  for (let t = 0; t < 30000; t += 100) assert.equal(s.step(100, 100, 500, false), null);
  let got: ReturnType<StruggleWatch['step']> = null;
  let at = 0;
  for (let t = 100; t <= 20000 && !got; t += 100) {
    got = s.step(100, 110, 500, true);
    at = t;
  }
  assert.equal(got?.kind, 'stuck');
  assert.ok(at >= STRUGGLE.stuckMs && at < STRUGGLE.stuckMs + 300, `at ${at}`);
  // progress resets it
  const s2 = new StruggleWatch();
  s2.restart(100, 500);
  for (let t = 0; t < 40000; t += 100) assert.equal(s2.step(100, 100 + t / 50, 500, true), null);
  // climbing up counts as progress too
  const s3 = new StruggleWatch();
  s3.restart(100, 2000);
  for (let t = 0; t < 40000; t += 100) assert.equal(s3.step(100, 100, 2000 - t / 40, true), null);
});

test('struggle: three kicks in a row with nothing in reach is a thumb that meant to run', () => {
  const s = new StruggleWatch();
  assert.equal(s.kick(false), null);
  assert.equal(s.kick(false), null);
  assert.equal(s.kick(false)?.text, 'Kicking the air? Slide your thumb to run.');
  // a kick at something, or a run, breaks the row
  assert.equal(s.kick(false), null);
  assert.equal(s.kick(true), null);
  assert.equal(s.kick(false), null);
  s.otherMove();
  assert.equal(s.kick(false), null);
  assert.equal(s.kick(false), null);
  assert.equal(s.kick(false)?.kind, 'kicks');
});

test('the move watch sees a jump, a grab, a leap off a vine, a glide and a kick', () => {
  const v = emptyGuideView();
  const w = new MoveWatch();
  w.step(v);
  v.grounded = false;
  v.vy = -400;
  w.step(v);
  assert.equal(w.count('jump'), 1);
  v.swinging = true;
  w.step(v);
  assert.equal(w.count('grab'), 1);
  v.swinging = false;
  w.step(v);
  assert.equal(w.count('leap'), 1);
  assert.equal(w.count('jump'), 1, 'letting go of a vine is not a jump');
  v.gliding = true;
  w.step(v);
  assert.equal(w.count('glide'), 1);
  v.attack = 'kick';
  v.kickNear = false;
  w.step(v);
  assert.equal(w.count('kick'), 1);
  assert.deepEqual(w.kicked, { near: false });
});

test('danger: hurt, falling, or an animal at hand', () => {
  const v = emptyGuideView();
  assert.equal(inDanger(v), false);
  v.hurt = true;
  assert.equal(inDanger(v), true);
  v.hurt = false;
  v.grounded = false;
  v.vy = 500;
  assert.equal(inDanger(v), true);
  v.gliding = true;
  assert.equal(inDanger(v), false, 'a glide is not a fall');
  v.gliding = false;
  v.grounded = true;
  v.vy = 0;
  v.enemies = [{ x: 100, y: 0, type: 'snake', defeated: false }];
  assert.equal(inDanger(v), true);
});

test('the bubble stays on screen, out of the thumb corners and off Pokey, upright and sideways', () => {
  for (const [w, h] of [
    [390, 844],
    [844, 390],
    [640, 320],
  ]) {
    const safe = fallbackSafeArea(w, h);
    const bw = Math.min(bubbleMaxW(w, h), 260);
    const bh = 70;
    const pokey = { x0: w * 0.3, y0: h * 0.5, x1: w * 0.3 + 60, y1: h * 0.5 + 80 };
    for (const [sx, sy] of [
      [40, safe.rect.y0 + 10],
      [w - 40, h * 0.5],
      [w / 2, h * 0.45],
    ]) {
      const b = placeBubble(sx, sy, bw, bh, safe, [pokey]);
      assert.ok(b.x >= safe.rect.x0 && b.x + bw <= safe.rect.x1, `${w}x${h} x ${b.x}`);
      assert.ok(b.y >= safe.rect.y0 && b.y + bh <= safe.rect.y1, `${w}x${h} y ${b.y}`);
      for (const k of safe.keepOut) assert.ok(!(b.x < k.x1 && b.x + bw > k.x0 && b.y < k.y1 && b.y + bh > k.y0), `${w}x${h} in a thumb zone at ${sx},${sy}`);
    }
  }
});
