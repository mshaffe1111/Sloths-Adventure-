/**
 * Dot curbed (Matt, 2026-10-29: "it feels like she's constantly nagging me... As soon as they run in, Dot tells exactly how to do it"):
 * the Tips gap, what Tips says, puzzles that name the problem and escalate only on struggle, and her memory (a tip is heard only once it
 * has been shown, DOT-1; a New Game teaches it all again).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { GUIDE, GuideQueue, TIPS_GAP_MS, type GuideLine, type MoveId } from './dotGuide.ts';
import { DotSay, HELP_GAP_MS } from './dotSay.ts';
import { helpAllows, seenSkills } from './dotGuideHelp.ts';
import { bindSent, markTipHeard, tipHeard, tipKept, forgetSent } from './tipMemory.ts';
import { engineGuideLine } from './dotLines.ts';
import { asQaBuildForTest } from './playRecorder.ts';
import { PUZZLE_STEPS, roomLineOf } from './dotTips.ts';
import { lessonDotLine, lessonsSeen } from './lessons.ts';
import { hearTipsAgain } from './dotMemory.ts';
import { resetProgress } from './saveFile.ts';
import { KitPlay } from './puzzlePlay.ts';
import { buildProtoStage } from './protoStage.ts';
import { generateAllLevels } from './worldsData.ts';

const line = (key: string, text: string, o: Partial<GuideLine> = {}): GuideLine => ({ key, text, kind: 'info', who: 'Dot', source: 'engine', ...o });

/** pushes at given times through a DotSay on the help setting; returns when each line started */
function play(help: 'teach' | 'reminders', ms: number, pushes: Array<[number, GuideLine]>, seen = new Set<string>()) {
  const q = new GuideQueue(true);
  const say = new DotSay(q, help, seen, new Set());
  const out: Array<{ key: string; at: number }> = [];
  const todo = [...pushes].sort((a, b) => a[0] - b[0]);
  for (let t = 0; t <= ms; t += 1000 / 30) {
    while (todo.length && todo[0][0] <= t) say.say(todo.shift()![1], t);
    q.tick(t, { danger: false, moveCount: (_m: MoveId) => 0 });
    say.keep(t);
    for (const ev of q.drain()) if (ev.type === 'start') out.push({ key: ev.show.line.key, at: t });
  }
  return out;
}

test('Tips: at least 30 s between lines that can wait; a new hazard, the locked exit and a first move need not wait', () => {
  const lessons = (id: string, text: string, soon = false) => line(`lesson:${id}:0`, text, { source: 'lesson', skill: `lesson:${id}`, ...(soon ? { soon: true } : {}) });
  const evs = play('reminders', 70000, [
    [3000, lessons('checkpoint', 'A flag! Fall, and you start again here.')],
    [9000, lessons('heart', 'Hurt? Grab a heart to heal.')],
    [12000, line('lock', "It's sealed. Finish the goal first.", { kind: 'must' })],
    [14000, lessons('crumble', "Shaky branches drop. Don't stop on them!", true)],
  ]);
  const at = (k: string) => evs.find((e) => e.key === k)?.at ?? -1;
  assert.ok(at('lesson:checkpoint:0') >= 3000);
  assert.ok(at('lock') < 12100, 'the locked exit at once');
  assert.ok(at('lesson:crumble:0') >= 0 && at('lesson:crumble:0') < 30000, 'a first-time hazard does not wait out the gap');
  // the harmless one waited the gap, or was old news before it was up
  const h = at('lesson:heart:0');
  assert.ok(h < 0 || h - at('lesson:checkpoint:0') >= TIPS_GAP_MS, `the heart's lesson waited (${h})`);
  // Help keeps 15 s
  const help = play('teach', 30000, [[3000, line('a', 'Follow the petals')], [3500, line('b', 'Still 20 flowers to collect!', { kind: 'goal' })]]);
  assert.ok(help[1].at - help[0].at >= HELP_GAP_MS && help[1].at - help[0].at < HELP_GAP_MS + 100, `${help[1].at - help[0].at}`);
});

test('Tips says only what is new: a stage line about a thing already taught, a reminder or chatter is for Help', () => {
  const seen = new Set<string>();
  const first = line('engine:hint.4-1.rocks', 'Rocks! Stop at the shadow. Go once it falls.', { mech: 'rocks' });
  assert.equal(helpAllows(first, 'reminders', seen), true, 'the first time');
  seen.add('mech:rocks');
  assert.equal(helpAllows(first, 'reminders', seen), false, 'not again');
  assert.equal(helpAllows(line('engine:hint.4-3.rocks', 'Rocks again! Stop at the shadow. Go once it falls.'), 'reminders', seen), false, 'a reminder');
  assert.equal(helpAllows(line('engine:goal.late', 'Still 20 flowers to collect!', { kind: 'goal' }), 'reminders', seen), false, '"Still N" is gone');
  assert.equal(helpAllows(line('struggle:stuck:40', 'This way, Pokey! Try over here.', { kind: 'struggle', source: 'struggle' }), 'reminders', seen), false, 'no stuck nag');
  assert.equal(helpAllows(line('struggle:death:12', 'That spot again. Slow down and look first.', { kind: 'struggle', source: 'struggle' }), 'reminders', seen), true, 'help after two deaths');
  assert.equal(helpAllows(line('engine:hint.3-5.grandma', 'Grandma said the old thorn vines were asleep...', { kind: 'story' }), 'reminders', seen), false, 'story chatter in play');
  assert.equal(helpAllows(line('story:L', 'Meeca crossed these twice before I finished one.', { kind: 'story', source: 'story' }), 'reminders', seen), true, 'the wayside story beat');
});

test('no puzzle gives the answer on entry: a room names the problem; the nudge and the move come only on struggle (the move on Help only)', () => {
  // 1-6's seesaw rooms (protoStage.ts), built as the game builds them
  const lvl = generateAllLevels().find((l) => l.id === '1-6')!;
  const st = buildProtoStage(lvl, 1);
  const rooms = st.kit!.rooms;
  assert.ok(rooms.length >= 3);
  new KitPlay(st.kit!, st.platforms, { world: 1, stage: 6 });
  for (const r of rooms) {
    const t = r.tips!;
    assert.ok(t.enter && t.nudge && t.move, `${r.id}: a name, a nudge and a move`);
    const words = (s: string) => new Set(s.toLowerCase().replace(/[^a-z' ]/g, '').split(' ').filter((w) => w.length > 3));
    const enter = words(String(t.enter));
    const move = [...words(String(t.move))];
    assert.ok(move.filter((w) => enter.has(w)).length < Math.max(2, move.length / 2), `${r.id}: "${t.enter}" does not say "${t.move}"`);
    for (const w of [t.enter, t.nudge, t.move]) assert.ok(String(w).split(' ').length < 10, `under 10 words: ${w}`);
    assert.equal(roomLineOf(String(t.enter))?.step, 'name');
    assert.equal(roomLineOf(String(t.nudge))?.step, 'nudge');
    assert.equal(roomLineOf(String(t.move))?.step, 'move');
    const name = engineGuideLine(String(t.enter), '1-6', { dot: true })!;
    const mv = engineGuideLine(String(t.move), '1-6', { dot: true })!;
    assert.equal(helpAllows(mv, 'reminders', new Set()), false, 'the move is never said on Tips');
    assert.equal(helpAllows(mv, 'teach', new Set()), true, 'it is on Help, after struggle');
    // on Tips the name is said only for the room that teaches the seesaw for the first time
    assert.equal(helpAllows(name, 'reminders', new Set()), !!r.mech, `${r.id} on Tips`);
  }
  // 4-3's pool: its move is never said as he walks up
  assert.ok(PUZZLE_STEPS['hint.4-3.pool']);
  assert.equal(engineGuideLine('Stand on the near end of the log, under the ledge, and double jump straight up', '4-3', { dot: true }), null);
});

test('a tip is heard only once it has been shown (DOT-1): one the setting dropped, or that waited until it was old news, is kept for later', () => {
  localStorage.clear();
  forgetSent();
  // the engine marks it sent and says it
  markTipHeard('1-5', 'tip:Shaky branches');
  bindSent('Creaky branches! Grab the petals and keep moving');
  assert.equal(tipHeard('1-5', 'tip:Shaky branches'), true, 'not sent again this session');
  assert.equal(tipKept('1-5', 'tip:Shaky branches'), false, 'not kept yet');
  // shown for less than its minimum time: still not kept
  const q = new GuideQueue(true);
  const say = new DotSay(q, 'teach', new Set(), new Set());
  say.say(line('engine:hint.1-5.creaky', 'Creaky branches! Grab the petals and keep moving', { said: 'Creaky branches! Grab the petals and keep moving' }), 0);
  q.tick(3000, { danger: false, moveCount: () => 0 });
  say.keep(3000 + GUIDE.minShowMs - 100);
  assert.equal(tipKept('1-5', 'tip:Shaky branches'), false);
  say.keep(3000 + GUIDE.minShowMs);
  assert.equal(tipKept('1-5', 'tip:Shaky branches'), true, 'kept once shown its minimum time');
  // a line Tips drops is never kept: a later session says it
  forgetSent();
  markTipHeard('1-5', 'tip:groups');
  bindSent('Every group of petals needs a different move');
  const tips = new DotSay(new GuideQueue(true), 'reminders', new Set(), new Set());
  assert.equal(tips.say(line('engine:hint.1-5.groups', 'Every group of petals needs a different move', { said: 'Every group of petals needs a different move' }), 3000), false);
  forgetSent();
  assert.equal(tipHeard('1-5', 'tip:groups'), false, 'dropped, so not heard');
  // a lesson likewise: kept once shown, not when it is sent
  const lq = new GuideQueue(true);
  const ls = new DotSay(lq, 'teach', new Set(), new Set());
  ls.say(lessonDotLine('checkpoint', 'screen')!, 3000);
  lq.tick(3000, { danger: false, moveCount: () => 0 });
  assert.equal(lessonsSeen().has('checkpoint'), false);
  ls.keep(3000 + GUIDE.minShowMs);
  assert.equal(lessonsSeen().has('checkpoint'), true);
});

test('a New Game, or "Hear Dot\'s tips again", teaches it all again', () => {
  localStorage.clear();
  localStorage.setItem('sloth_tips_1-5', JSON.stringify(['tip:a']));
  localStorage.setItem('sloth_lessons', JSON.stringify(['gap']));
  localStorage.setItem('sloth_dot_seen', JSON.stringify(['mech:rocks']));
  localStorage.setItem('sloth_dot_moves', JSON.stringify(['jump']));
  localStorage.setItem('sloth_dot_help', 'reminders');
  localStorage.setItem('sloth_music_vol', '0.5');
  const store = { keys: () => Object.keys(Object.fromEntries(Array.from({ length: localStorage.length }, (_, i) => [localStorage.key(i)!, 1]))), getItem: (k: string) => localStorage.getItem(k), setItem: (k: string, v: string) => localStorage.setItem(k, v), removeItem: (k: string) => localStorage.removeItem(k) };
  resetProgress(store as never);
  assert.equal(localStorage.getItem('sloth_tips_1-5'), null);
  assert.equal(lessonsSeen().size, 0);
  assert.equal(seenSkills().size, 0);
  assert.equal(localStorage.getItem('sloth_dot_moves'), null);
  assert.equal(localStorage.getItem('sloth_dot_help'), null, 'a new save starts on the difficulty\'s setting');
  assert.equal(localStorage.getItem('sloth_music_vol'), '0.5');
  // the menu button
  localStorage.setItem('sloth_dot_help', 'reminders');
  localStorage.setItem('sloth_tips_2-2', JSON.stringify(['tip:b']));
  localStorage.setItem('sloth_lessons', JSON.stringify(['swing']));
  hearTipsAgain();
  assert.equal(localStorage.getItem('sloth_tips_2-2'), null);
  assert.equal(lessonsSeen().size, 0);
  assert.equal(localStorage.getItem('sloth_dot_help'), 'reminders');
});

test('Tips: no more than two lines start in any 30 s, a warning or a first-time hazard about to hit aside', () => {
  const t = (k: string, o: Partial<GuideLine> = {}) => line(k, `Something new here, ${k}.`, { kind: 'teach', mech: k, ...o });
  const evs = play('reminders', 60000, [[3000, t('a')], [5000, t('b')], [7000, t('c')], [8000, line('d', 'Look out!', { kind: 'danger', mech: 'd' })]]);
  const at = (k: string) => evs.find((e) => e.key === k)?.at ?? -1;
  assert.ok(at('d') >= 0 && at('d') < 12000, 'the warning at once');
  const c = at('c');
  assert.ok(c < 0 || c - at('a') >= TIPS_GAP_MS, `the third waits for the first to be 30 s old (${c})`);
  // a first-time hazard about to hit is never held back by it
  const soon = play('reminders', 30000, [[3000, t('a')], [5000, t('b')], [7000, t('c', { soon: true })]]);
  assert.ok(soon.some((e) => e.key === 'c' && e.at < 20000));
});

test("a watcher's pass: one call to hide, not three in other words, even when the warning would cut in over a tip", () => {
  const q = new GuideQueue(true);
  const env = { danger: false, moveCount: (_m: MoveId) => 0 };
  const warn = (text: string) => engineGuideLine(text, '1-7', { dot: true })!;
  q.push(warn('Here it comes! Slide down inside a bush to hide'), 3000);
  q.tick(3000, env);
  q.push(line('room', 'The squirrels\' acorn tree, and that eagle!', { kind: 'teach' }), 9000);
  q.tick(9000, env);
  q.push(warn('Hide! Into a bush!'), 12000);
  q.tick(12000, env);
  assert.notEqual(q.cur?.line.text, 'Hide! Into a bush!', 'not 9 s after the first call');
  q.push(warn('Hide! Into a bush!'), 45000);
  q.tick(45000, env);
  assert.equal(q.cur?.line.text, 'Hide! Into a bush!', 'the next pass, half a minute on');
});

test('the control test: the opener teaches the jump and gap 3 the double jump (qa-fix-e, Matt-approved rows ctest.gaps and ctest.gap3)', () => {
  const opener = engineGuideLine('Jump across the gaps', 'ctest', { dot: true })!;
  assert.equal(opener.text, 'Flick up to jump the gaps.');
  assert.equal(opener.move, 'jump');
  const gap3 = engineGuideLine('This one needs two jumps: jump, then jump again in the air', 'ctest', { dot: true })!;
  assert.equal(gap3.text, 'Flick up again midair to jump twice.');
  assert.equal(gap3.move, 'double');
  // seed 7920 said nothing for 24 s: the opening lines were dropped because he was already running when Dot could first speak
  const g = globalThis as unknown as { location?: unknown };
  const was = g.location;
  g.location = { hash: '#ctest', search: '' };
  // (the control test runs only in QA builds since UI-15; this test plays one)
  asQaBuildForTest(true);
  for (const help of ['reminders', 'teach'] as const) {
    const q = new GuideQueue(true);
    const say = new DotSay(q, help, new Set(['move:run']), new Set(['run']));
    assert.ok(say.say(engineGuideLine('Run to the flowers and stop on them', '1-2', { dot: true })!, 0), help);
    q.tick(2600, { danger: false, moveCount: (m: MoveId) => (m === 'run' ? 40 : 0) });
    assert.equal(q.cur?.line.key, 'engine:ctest.runStop', `${help}: said, though he is running and has run before`);
  }
  g.location = was;
  asQaBuildForTest(false);
  // a stage's own words that match a test row are an ordinary tip there (1-3 said the bounce in every stage)
  const bounce = engineGuideLine('Flick up onto the mushroom to bounce.', '1-3', { dot: true });
  assert.ok(!bounce?.ctest);
});

test('no ring and no arrow, for good (Matt, 2026-10-29: "Lets remove this from the game. Its ugly and gives everything away.")', async () => {
  const fs = await import('node:fs');
  const files = ['src/components/dot/DotGuide.tsx', 'src/components/dot/dotGuide.css', 'src/components/hud/painted.tsx'];
  for (const f of files) {
    const s = fs.readFileSync(f, 'utf8');
    assert.doesNotMatch(s, /dg-ring|dg-arrow|ringBox|dotGuideTarget/, f);
  }
});

test('nothing marks the answer: no ring, arrow, twinkle or sparkle on a puzzle piece, Easy or Normal (Matt, 2026-10-29: "that horrible blue pointer, the helper, I want that out")', async () => {
  const fs = await import('node:fs');
  const dot = fs.readFileSync('src/components/dot/DotGuide.tsx', 'utf8') + fs.readFileSync('src/components/dot/dotGuide.css', 'utf8');
  assert.doesNotMatch(dot, /dg-ring|dg-arrow|dg-twinkle|ringBox|dotGuideTarget/);
  const kit = fs.readFileSync('src/game/puzzlePlay.ts', 'utf8');
  assert.doesNotMatch(kit, /drawSparkle|\.sparkle\b/);
});
