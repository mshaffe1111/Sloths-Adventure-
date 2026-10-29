import test from 'node:test';
import assert from 'node:assert/strict';
import { ALL_DOT_LINES, dotLine, engineGuideLine, gestureMove, swapLine, targetTopic } from './dotLines.ts';
import { CALM, GuideQueue, SAME_TIP, wordCount } from './dotGuide.ts';
import { goalLine } from './stagePlan.ts';
import { HURT_DELAY_MS, START_AFTER_MS, WAYSIDE, dueLine } from './wayside.ts';
import { lessonDotLine } from './lessons.ts';

/** words as a reader counts them (a {hole} is one word) */
const words = (s: string) => s.split(/\s+/).filter((t) => /[A-Za-z0-9${]/.test(t)).length;
const KEYBOARD = /\b(press(es|ed)?|buttons?|keys?|space ?bar|spacebar|arrow keys?|hold jump|left side|right side|shift key|enter key|wasd)\b/i;

test("Matt's lines keep to the limits: 8 words for a move tip, 12 for a story line or anything else", () => {
  for (const l of ALL_DOT_LINES) {
    for (const t of [l.text, l.then]) {
      if (!t) continue;
      // (a second line said after a move tip is a remark, not a tip: the 12-word limit)
      const limit = l.kind === 'move' && t === l.text ? 8 : 12;
      assert.ok(words(t) <= limit, `${l.id} (${l.kind}): ${words(t)} words: ${t}`);
    }
  }
});

test("Matt's lines use touch words only: no keys, buttons or sides of the screen", () => {
  for (const l of ALL_DOT_LINES) {
    for (const t of [l.text, l.then]) if (t) assert.ok(!KEYBOARD.test(t), `${l.id}: ${t}`);
  }
});

test('every id is unique, and every gesture named is one the guide knows', () => {
  const ids = new Set<string>();
  for (const l of ALL_DOT_LINES) {
    assert.ok(!ids.has(l.id), `twice: ${l.id}`);
    ids.add(l.id);
    if (l.gesture) assert.ok(['slide', 'flick-up', 'tap', 'flick-hold', 'double-jump', 'climb-up', 'climb-down', 'flick-side', 'slide-down', 'lift', 'hold-still'].includes(l.gesture), `${l.id}: ${l.gesture}`);
  }
});

test('a line is swapped by its old words, a cut one is not said, and one the review does not have is said as it is', () => {
  assert.equal(swapLine('That fern looks different! Stand beside it and slide your thumb down to crouch and search it')?.text, 'Slide down beside the fern to search it.');
  // the hint that says what the vine lesson says is cut
  assert.equal(swapLine('Flick up into the vine to grab it', '1-6')?.text, null);
  assert.equal(swapLine('Something nobody wrote down'), null);
  // punctuation and spacing do not matter
  assert.equal(swapLine('that fern looks different  stand beside it and slide your thumb down to crouch and search it.')?.line.id, 'eng.fern.near');
});

test('the goal lines fill their holes: the verb, the count and the noun', () => {
  assert.equal(swapLine(goalLine('start', 1, 'harvest', 14))?.text, 'Collect 14 petals to open the sanctuary');
  assert.equal(swapLine(goalLine('late', 8, 'harvest', 3))?.text, 'Still 3 night blooms to collect!');
  assert.equal(swapLine(goalLine('sealed', 3, 'relic_hunt', 2))?.text, "It's sealed. Find 2 more keepsakes first.");
  assert.equal(swapLine('Finish the goal to open the sanctuary')?.text, "It's sealed. Finish the goal first.");
});

test("4-9's goal says guards, as its counter does", () => {
  assert.match(goalLine('start', 4, 'gauntlet', 6), /guards/);
  assert.match(goalLine('sealed', 4, 'gauntlet', 1), /guard\b/);
  assert.match(goalLine('start', 1, 'purge', 6), /predators/);
});

test('every story aside the stages say has its approved line (or is cut on purpose)', () => {
  for (const [w, world] of Object.entries(WAYSIDE)) {
    for (const s of Object.values(world.stages)) assert.ok(swapLine(s.text), `world ${w}: ${s.text}`);
    for (const h of world.hurt) assert.ok(swapLine(h.text), `world ${w} hurt: ${h.text}`);
  }
  // (and dueLine still hands over the old words, which is what the "already said" memory is keyed by)
  const due = dueLine({ world: 1, mini: 2, ratio: 0, playedMs: START_AFTER_MS + HURT_DELAY_MS, shownL: false, shownH: true });
  assert.ok(due && swapLine(due.line.text));
});

test('the move a tip waits for comes from its gesture and what it points at', () => {
  assert.equal(gestureMove('flick-up', targetTopic('vine')), 'grab');
  assert.equal(gestureMove('flick-up', targetTopic('gap edge')), 'jump');
  assert.equal(gestureMove('tap', targetTopic('foe')), 'punch');
  assert.equal(gestureMove('flick-hold', undefined), 'glide');
  assert.equal(gestureMove('slide', targetTopic('log')), 'push');
  assert.equal(gestureMove('lift', undefined), undefined);
  assert.equal(targetTopic('pokey'), 'controls');
  assert.ok(dotLine('lesson.swing.grab'));
  assert.ok(lessonDotLine('gap', 'screen'));
});

test("Dot's in-play lines keep under the QA rule's 10 words where QA found them over (2026-10-29: 4-3's molting line, the tough lesson, 3-2's fern)", () => {
  for (const id of ['way.4-3', 'lesson.tough', 'hint.3-2.fern']) {
    const t = dotLine(id)?.text;
    assert.ok(t && wordCount(t) <= 10, `${id}: ${t}`);
  }
  // (the joke stays: a real season)
  assert.match(dotLine('way.4-3')!.text!, /molting season.*real season/i);
});

test("every line paired as saying the same thing (SAME_TIP) is a line of the review, and the pairs name each other", () => {
  const ids = new Set(ALL_DOT_LINES.map((l) => l.id));
  for (const [k, others] of SAME_TIP) {
    assert.ok(ids.has(k.replace(/^engine:/, '')), k);
    for (const o of others) assert.ok(SAME_TIP.get(o)?.includes(k), `${o} does not name ${k} back`);
  }
});

test("4-3 Easy: the fall's tip is not said 10 s after the stage hint said the same (QA 2026-10-29), and still comes without the hint", () => {
  const hint = engineGuideLine('The water pushes you back down! Climb the tree, and stop it at the top', '4-3')!;
  const fall = engineGuideLine('The water pushes you back. Can you stop it at the top?', '4-3')!;
  assert.equal(hint.key, 'engine:hint.4-3.push');
  assert.equal(fall.key, 'engine:w4.fall');
  const env = { danger: false, moveCount: () => 0 };
  const said = (q: GuideQueue, from: number, to: number) => {
    const out = new Set<string>();
    for (let t = from; t <= to; t += 100) {
      const s = q.tick(t, env);
      if (s) out.add(s.line.key);
    }
    return out;
  };
  const q = new GuideQueue(true);
  q.push(hint, 20000);
  assert.ok(said(q, 20000, 29000).has(hint.key));
  q.push(fall, 30000);
  assert.ok(!said(q, 30000, 60000).has(fall.key), "the fall's tip repeats the hint");
  // long after the hint (past CALM.nearMs), or with no hint at all: the fall's tip is said
  const late = 20000 + CALM.nearMs + 1000;
  q.push(fall, late);
  assert.ok(said(q, late, late + 20000).has(fall.key));
  const q2 = new GuideQueue(true);
  q2.push(fall, 20000);
  assert.ok(said(q2, 20000, 30000).has(fall.key));
});

test("DOT-4: 1-9's ring wall is explained (no cut row stands in front of the lock line)", () => {
  assert.equal(swapLine('Snakes from above! Clear them all to open the way', '1-9')?.text, 'Snakes! Clear them all to open the way.');
  // no cut stage row shadows a lock line with the same old words
  for (const l of ALL_DOT_LINES) {
    if (l.kind !== 'lock' || l.text !== null || !l.stage) continue;
    const sw = swapLine(l.old ?? '', l.stage);
    assert.ok(!ALL_DOT_LINES.some((o) => o !== l && o.kind === 'lock' && o.text !== null && o.old === l.old) || sw?.text, `${l.id} cuts a lock line`);
  }
});
