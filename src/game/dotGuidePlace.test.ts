import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyGuideView, type GuideView } from './dotGuideView.ts';
import { MoveWatch } from './dotGuideWatch.ts';
import { GUIDE, GuideQueue, type GuideLine, type MoveId } from './dotGuide.ts';
import { BUBBLE_TAG_H, PUNCH_REACH, cornerBubble, fallbackSafeArea, hoverSpot, landingRects, perchPoseFor, placeBubble, pokeyRect, popupRects, weakSpotRect, type Rect } from './dotGuidePerch.ts';
import { SKIP_ARM_MS, dotHelp, helpAllows, markSkipOffered, offersSkip, skipOffered, skipTapCounts, skipTips } from './dotGuideHelp.ts';
import { gestureMove } from './dotLines.ts';

const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const spotBox = (s: { x: number; y: number }): Rect => ({ x0: s.x - 26, y0: s.y - 20, x1: s.x + 26, y1: s.y + 20 });

/** a view of Pokey standing on the ground at screen x `sx` (zoom 1, camera at 0,0) */
function view(w: number, h: number, sx: number, facing: 1 | -1 = 1): GuideView {
  const v = emptyGuideView();
  v.live = true;
  v.cssW = w;
  v.cssH = h;
  v.zoom = 1;
  v.px = sx;
  v.py = h * 0.7;
  v.facing = facing;
  return v;
}

test('hovering, Dot keeps off Pokey and his punch reach, even with his back to the screen edge (QA v189, 1-3 at 320x782)', () => {
  for (const [w, h] of [[320, 782], [390, 844], [844, 390], [640, 320], [782, 288]] as const) {
    for (const [sx, f] of [[10, 1], [w / 2, 1], [w - 50, -1], [w / 2, -1], [4, -1]] as const) {
      const v = view(w, h, sx, f);
      const s = hoverSpot(v);
      const p = pokeyRect(v, 0);
      const reach = { x0: f > 0 ? p.x1 : p.x0 - PUNCH_REACH, y0: p.y0, x1: f > 0 ? p.x1 + PUNCH_REACH : p.x0, y1: p.y1 };
      assert.ok(!overlaps(spotBox(s), p), `${w}x${h} at ${sx} facing ${f}: on his body (${s.x}, ${s.y})`);
      assert.ok(!overlaps(spotBox(s), reach), `${w}x${h} at ${sx} facing ${f}: in his punch (${s.x}, ${s.y})`);
      assert.ok(s.x >= 0 && s.x <= w, 'on screen');
    }
  }
});

test('hovering, she rises off a score pop-up ("+100 FLOWER!")', () => {
  const v = view(390, 844, 150);
  const at = hoverSpot(v);
  v.popups = [{ x: at.x, y: at.y + 10 }];
  const s = hoverSpot(v);
  assert.ok(Math.abs(s.y - (at.y + 10)) >= 40, `clear of the pop-up (${s.y})`);
  // and her bubble keeps off it too
  const r = popupRects(v, []);
  assert.equal(r.length, 1);
});

test('her bubble keeps off the landing ahead of him (QA v189: the mossy block in 1-3)', () => {
  const v = view(844, 390, 200);
  // the ground he stands on, and a raised block ahead he must jump to
  v.platforms = [
    { x: 0, y: v.py, width: 2000, height: 40, type: 'solid' },
    { x: 330, y: v.py - 110, width: 160, height: 40, type: 'solid' },
  ];
  const land = landingRects(v, []);
  assert.equal(land.length, 1, 'the block ahead, not the ground under him');
  assert.ok(land[0].x0 <= 330 && land[0].x1 >= 450);
  const safe = fallbackSafeArea(844, 390);
  // a speaker just above him and to the right: the spot above her would cover the block
  const b = placeBubble(300, v.py - 150, 220, 60, safe, [...land, pokeyRect(v)], ['above', 'left', 'right', 'below'], 26, [pokeyRect(v, 4)]);
  assert.ok(!overlaps({ x0: b.x, y0: b.y, x1: b.x + 220, y1: b.y + 60 }, land[0]), `bubble on the landing at ${b.x},${b.y}`);
  // facing the other way, the block is behind him: nothing ahead to keep clear
  v.facing = -1;
  assert.equal(landingRects(v, []).length, 0);
});

test("in a boss fight her bubble never covers the open weak spot (its NOW! marker sits on it), and its lines go within 6 s", () => {
  const v = view(844, 390, 100);
  assert.equal(weakSpotRect(v), null, 'closed: nothing to keep off');
  v.weakOn = true;
  v.weakX = 380;
  v.weakY = 120;
  v.weakW = 80;
  v.weakH = 60;
  const ws = weakSpotRect(v)!;
  assert.ok(ws.y0 < 120 - 36, 'room for the NOW! above it');
  const safe = fallbackSafeArea(844, 390);
  const b = placeBubble(420, 200, 240, 60, safe, [], ['above', 'left', 'right', 'below'], 26, [ws]);
  assert.ok(!overlaps({ x0: b.x, y0: b.y, x1: b.x + 240, y1: b.y + 60 }, ws), `bubble on the weak spot at ${b.x},${b.y}`);
  // a boss line with a move that never comes still goes at 6 s
  const q = new GuideQueue();
  q.push({ key: 'b', text: 'Flick up when he lands.', kind: 'teach', move: 'jump', who: 'Dot', source: 'engine', capMs: GUIDE.bossLineMs }, 0);
  q.tick(0, { danger: false, moveCount: () => 0 });
  assert.equal(q.tick(GUIDE.bossLineMs - 100, { danger: true, moveCount: () => 0 })?.line.key, 'b');
  assert.equal(q.tick(GUIDE.bossLineMs, { danger: true, moveCount: () => 0 }), null);
});

test('a mushroom tip waits for a bounce, not any jump (QA v189: 1-2 closed on a slide and a hop)', () => {
  assert.equal(gestureMove('flick-up', 'mushroom'), 'bounce');
  assert.equal(gestureMove('flick-up', 'gap'), 'jump');
  const v = emptyGuideView();
  const w = new MoveWatch();
  w.step(v);
  v.grounded = false;
  v.vy = -640;
  w.step(v);
  assert.equal(w.count('jump'), 1);
  assert.equal(w.count('bounce'), 0, 'a jump is not a bounce');
  v.vy = 200;
  w.step(v);
  v.vy = -830;
  w.step(v);
  assert.equal(w.count('bounce'), 1, 'flung up off the mushroom');
});

test('perched, she talks while she says her line, then points the way to the thing', () => {
  const talk = ['talk', 'talkSmall', 'perch'];
  assert.equal(perchPoseFor(-1, 5, false, 100, 0, 0), 'perch', 'no line: she sits');
  assert.ok(talk.includes(perchPoseFor(200, 5, false, 100, 0, 0)));
  let opened = false;
  for (let t = 0; t < 1000; t += 60) if (perchPoseFor(300, 5, false, 100, 0, t).startsWith('talk')) opened = true;
  assert.ok(opened, 'her beak opens');
  assert.equal(perchPoseFor(5000, 5, false, 100, 0, 0), 'pointFwd');
  assert.equal(perchPoseFor(5000, 5, false, 30, -200, 0), 'pointUp');
  assert.equal(perchPoseFor(5000, 5, false, -30, 200, 0), 'pointDown');
  assert.equal(perchPoseFor(5000, 5, false, null, 0, 0), 'perch', 'nothing to point at');
  // a move tip that stays up: she says it again every 6 s
  assert.ok(talk.includes(perchPoseFor(6200, 5, true, 100, 0, 0)));
});

function memStore() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) };
}
const tip = (kind: GuideLine['kind'], who: GuideLine['who'] = 'Dot') => ({ kind, who });

test('Skip tips: offered once per device, never on 1-1 or the coach (DOT-5); tapping it turns tips off (Quiet) but keeps the locked-exit lines', () => {
  const s = memStore();
  const none = new Set<string>();
  assert.equal(skipOffered(s), false);
  // not on a must-know line, a warning, a story, or someone else's line
  assert.equal(offersSkip(tip('must'), 'teach', '1-2', s), false);
  assert.equal(offersSkip(tip('danger'), 'teach', '1-2', s), false);
  assert.equal(offersSkip(tip('story'), 'teach', '1-2', s), false);
  assert.equal(offersSkip(tip('teach', 'Pokey'), 'teach', '1-2', s), false);
  // not on the first stage's coach lines, nor anywhere in 1-1: a newcomer tapping the bubble away turned tips off before learning to run
  assert.equal(offersSkip({ ...tip('teach'), source: 'coach' }, 'teach', '1-2', s), false);
  assert.equal(offersSkip(tip('teach'), 'teach', '1-1', s), false);
  // not when tips are already off
  assert.equal(offersSkip(tip('teach'), 'quiet', '1-2', s), false);
  // the first tip after 1-1, on Help or Tips: yes; marked as offered when it goes up, it is never offered again
  assert.equal(offersSkip(tip('teach'), 'reminders', '1-2', s), true);
  assert.equal(offersSkip(tip('teach'), 'teach', '1-2', s), true);
  markSkipOffered(s);
  assert.equal(offersSkip(tip('teach'), 'teach', '1-2', s), false);
  assert.equal(offersSkip(tip('info'), 'teach', '1-2', s), false);
  // not tapped: the setting stays (nothing picked: Tips on Normal, Help on Easy)
  assert.equal(dotHelp(s), 'reminders');
  const easy = memStore();
  easy.setItem('sloth_difficulty', 'easy');
  assert.equal(dotHelp(easy), 'teach');
  // tapped (on another fresh phone): Quiet, and still offered only once
  const s2 = memStore();
  assert.equal(offersSkip(tip('teach'), 'teach', '1-3', s2), true);
  assert.equal(skipTips(s2), 'quiet');
  assert.equal(dotHelp(s2), 'quiet');
  assert.equal(skipOffered(s2), true);
  assert.equal(helpAllows({ kind: 'must' }, dotHelp(s2), none), true, 'a locked exit is still explained');
  assert.equal(helpAllows({ kind: 'teach', skill: 'move:jump' }, dotHelp(s2), none), false, 'tips are off');
});

test('Skip tips needs a deliberate tap: not in its first moments (a tap meant for the game), and only a touch that began on it', () => {
  // (QA: Cheddarbob played on Quiet from his first second; Dot's first tip comes while the thumb is busy with the game)
  assert.ok(SKIP_ARM_MS >= 1000);
  assert.equal(skipTapCounts(200, true), false, 'a tap as the bubble comes up');
  assert.equal(skipTapCounts(SKIP_ARM_MS - 1, true), false);
  assert.equal(skipTapCounts(SKIP_ARM_MS + 500, false), false, 'a touch that came from elsewhere onto it');
  assert.equal(skipTapCounts(SKIP_ARM_MS + 500, true), true);
  // a key (Enter on the focused button) is always on purpose
  assert.equal(skipTapCounts(100, false, true), true);
});

test('turning tips off takes the line down at once (no 1.5 s wait), and what Quiet would not say goes with it', () => {
  const q = new GuideQueue();
  const env = { danger: false, moveCount: (_m: MoveId) => 0 };
  q.push({ key: 't', text: 'Slide your thumb to run. Keep it down.', kind: 'teach', who: 'Dot', source: 'coach', move: 'run' }, 0);
  q.push({ key: 'g', text: 'Collect 16 fruit', kind: 'goal', who: 'Dot', source: 'engine' }, 0);
  q.push({ key: 'm', text: 'Sealed: finish the goal first', kind: 'must', who: 'Dot', source: 'engine' }, 0);
  q.tick(0, env);
  assert.equal(q.cur?.line.key, 'm');
  q.tick(GUIDE.minShowMs + 5000, env);
  q.tick(GUIDE.minShowMs + 6000, env);
  assert.equal(q.cur?.line.key, 't');
  const at = q.cur!.startedAt;
  q.clear((l) => !helpAllows(l, 'quiet', new Set()), at + 100, true);
  assert.equal(q.cur, null);
  assert.equal(q.size, 0);
});

test('in a boss fight her bubble sits in a corner band away from the boss, off Pokey and the weak spot, with Dot beside it, not on him (QA v189, 1-10)', () => {
  for (const [w, h] of [[390, 844], [844, 390], [640, 320]] as const) {
    const v = view(w, h, w * 0.3);
    v.boss = true;
    v.bossX = w * 0.75;
    const safe = fallbackSafeArea(w, h);
    const c = cornerBubble(v, 240, 64, safe, [pokeyRect(v, 4)]);
    const box = { x0: c.bub.x, y0: c.bub.y, x1: c.bub.x + 240, y1: c.bub.y + 64 };
    assert.ok(box.x0 <= safe.rect.x0 + 1, `${w}x${h}: against the side away from the boss (${box.x0})`);
    assert.ok(box.y1 < h * 0.4 || box.y0 > h * 0.5, `${w}x${h}: in a band, not the arena middle`);
    assert.ok(!overlaps(box, pokeyRect(v)), `${w}x${h}: off Pokey`);
    assert.ok(!overlaps(spotBox(c.dot), pokeyRect(v, 0)), `${w}x${h}: Dot is not on Pokey`);
    // the weak spot open in that corner: upright she takes the bottom band instead
    if (h > w) {
      v.weakOn = true;
      v.weakX = safe.rect.x0 + 20;
      v.weakY = safe.rect.y0 + 10;
      v.weakW = 60;
      v.weakH = 40;
      const ws = weakSpotRect(v)!;
      const c2 = cornerBubble(v, 240, 64, safe, [pokeyRect(v, 4), ws]);
      assert.ok(!overlaps({ x0: c2.bub.x, y0: c2.bub.y, x1: c2.bub.x + 240, y1: c2.bub.y + 64 }, ws), 'off the weak spot and its NOW!');
      for (const k of safe.keepOut) assert.ok(!overlaps({ x0: c2.bub.x, y0: c2.bub.y, x1: c2.bub.x + 240, y1: c2.bub.y + 64 }, k), 'out of the thumb zone');
    }
  }
});

test("no line starts while the stage-start goal card is up, not even a must-know one: Dot's first line waits until it has gone (QA v189, 640x320)", () => {
  const q = new GuideQueue();
  const hold = { danger: false, hold: true, moveCount: (_m: MoveId) => 0 };
  q.push({ key: 'run', text: 'Slide your thumb to run. Keep it down.', kind: 'teach', who: 'Dot', source: 'coach', move: 'run' }, 0);
  q.push({ key: 'lock', text: 'Sealed: finish the goal first', kind: 'must', who: 'Dot', source: 'engine' }, 0);
  for (let t = 0; t <= 4000; t += 100) assert.equal(q.tick(t, hold), null);
  // the card has shrunk into the counter: the lines come, in order
  assert.equal(q.tick(4100, { ...hold, hold: false })?.line.key, 'lock');
});

test('a move tip for a move already done this stage is not said; one that arrives late closes as soon as the move is done (QA v189)', () => {
  const q = new GuideQueue();
  // she has been double jumping since 16 s: the tip at 37 s is not said
  q.push({ key: 'dbl', text: 'Flick up again midair to jump twice.', kind: 'teach', who: 'Dot', source: 'lesson', move: 'double' }, 37000);
  assert.equal(q.tick(37000, { danger: false, moveCount: (m) => (m === 'double' ? 4 : 0) }), null);
  assert.equal(q.size, 0);
  // a lesson whose first step was already done still says its next step
  const q2 = new GuideQueue();
  const next: GuideLine = { key: 'up', text: 'Slide your thumb up to climb.', kind: 'teach', who: 'Dot', source: 'lesson', move: 'climb' };
  q2.push({ key: 'grab', text: 'Flick up into the trunk to grab it.', kind: 'teach', who: 'Dot', source: 'lesson', move: 'grab', next }, 0);
  const counts: Partial<Record<MoveId, number>> = { grab: 1 };
  const e2 = { danger: false, moveCount: (m: MoveId) => counts[m] ?? 0 };
  q2.tick(0, e2);
  assert.equal(q2.tick(700, e2)?.line.key, 'up');
  // and it closes once he climbs (after its 1.5 s), not 17 s later
  counts.climb = 1;
  assert.equal(q2.tick(1000, e2)?.line.key, 'up');
  assert.equal(q2.tick(700 + GUIDE.minShowMs, e2), null);
});

test("upright, with every side of her blocked by a carving and by Pokey, her bubble goes clear of both, name tag and his feet included (QA v194, 5-1)", () => {
  for (const [w, h] of [[390, 844], [320, 782]] as const) {
    const v = view(w, h, 80);
    v.py = h * 0.62;
    const safe = fallbackSafeArea(w, h);
    const pk = pokeyRect(v, 4);
    // Meeca's words on the tree just ahead of him, from above his head to the ground
    const carving: Rect = { x0: w * 0.36, y0: v.py - 180, x1: w * 0.8, y1: v.py - 4 };
    const bw = w - 32;
    const bh = 111;
    // Dot hovering behind his head
    const b = placeBubble(40, v.py - v.ph - 14, bw, bh, safe, [pokeyRect(v)], ['above', 'left', 'below', 'right'], 32, [pk, carving]);
    const box = { x0: b.x, y0: b.y - BUBBLE_TAG_H, x1: b.x + bw, y1: b.y + bh };
    assert.ok(!overlaps(box, carving), `${w}x${h}: on the carving at ${b.x},${b.y}`);
    assert.ok(!overlaps(box, { ...pk, y1: pk.y1 + 12 }), `${w}x${h}: on Pokey (or his feet) at ${b.x},${b.y}`);
  }
});
