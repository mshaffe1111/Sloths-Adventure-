/**
 * Build 3 of the polish report (2026-10-29): the rest of the control items (CT-14 to CT-18, CT-21 to CT-26, CT-28). Each test is the
 * item's reproduction, kept as a regression test, run through the whole touch chain where touch matters (touchRig.ts).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { HANG_DROP, ropeYAt } from './rope.ts';
import type { Rope } from './types.ts';
import { TouchGestures, TUNING, applyTouchSensitivity } from './touchGestures.ts';
import { PadInput, pickButton, BUTTON_REACH, type PadButtonSpot } from './padControl.ts';
import { TouchRig, stroke, type TouchEv } from './touchRig.ts';
import { TouchMarks, touchMarksOn, MARK } from './touchMarks.ts';

const G = 2000;
/** a bare floor, Pokey standing on it at x, the whole touch chain wired (touchRig.ts) */
function floorRig(x = 300): TouchRig {
  const rig = new TouchRig('1-1', 1);
  rig.r.bare([{ id: 1, x: 0, y: G, width: 20000, height: 300, type: 'solid' } as never]);
  rig.r.stand(x, G);
  rig.clear();
  return rig;
}

// ───────────────────────────── CT-21: the rope hop and the flick's lean ─────────────────────────────

test('CT-21: hopping off a shimmy rope goes the way the flick leaned, even against the steer held a moment before', () => {
  for (const lean of [-1, 1] as const) {
    const r = new RealPlay('1-3', 1);
    const rope: Rope = { id: 5, x0: 400, x1: 1000, y: G - 260, g0: G, g1: G, required: false };
    r.bare([{ id: 1, x: 0, y: G, width: 400, height: 300, type: 'solid' } as never, { id: 2, x: 1000, y: G, width: 400, height: 300, type: 'solid' } as never], [], [rope]);
    r.e.skills.add('shimmy');
    r.hang(rope, 700, ropeYAt(rope, 700) + HANG_DROP);
    r.e.ropeGrace = 0;
    // creeping the other way, then the flick that leaned `lean`
    for (let i = 0; i < 6; i++) r.frame(lean > 0 ? { left: true } : { right: true });
    assert.ok(r.p.hanging, 'creeping along the rope');
    r.input.state.jumpLean = lean;
    r.frame({ press: true });
    assert.ok(!r.p.hanging, 'let go');
    assert.equal(Math.sign(r.p.vx), lean, `hopped ${r.p.vx > 0 ? 'right' : 'left'} after a flick leaning ${lean > 0 ? 'right' : 'left'}`);
  }
});

/** the recogniser on its own, with what the game tells it; every decision in order */
function gestures(world: { rope?: boolean; vine?: boolean; air?: boolean; hand?: 'left' | 'right' } = {}) {
  const log: string[] = [];
  const marks: Array<{ k: string; x?: number; y?: number }> = [];
  const g = new TouchGestures(
    {
      move: (d) => log.push(`move:${d}`), duck: (on) => log.push(on ? 'duck' : 'duckOff'), jumpPress: (l) => log.push(`jump:${l ?? 0}`),
      jumpRelease: () => log.push('jumpUp'), punch: () => log.push('punch'), kick: (d) => log.push(`kick:${d ?? 0}`), mega: () => log.push('mega'),
      climb: (d) => log.push(`climb:${d}`), feedback: (k, x, y) => marks.push({ k, x, y }),
    },
    () => 844,
    { steerHand: () => world.hand ?? 'left', assist: () => true, air: () => !!world.air, refined: () => true, kickNear: () => false, onVine: () => !!world.vine, onRope: () => !!world.rope },
  );
  let now = 1000;
  const path = (id: number, pts: Array<[number, number]>, every = 16, lift = true) => {
    g.down(id, pts[0][0], pts[0][1], now);
    for (let i = 1; i < pts.length; i++) {
      now += every;
      g.move(id, pts[i][0], pts[i][1], now);
    }
    if (lift) g.up(id, pts[pts.length - 1][0], pts[pts.length - 1][1], (now += 8));
  };
  return { g, log, marks, path, wait: (ms: number) => { const end = now + ms; while (now < end) { now += 30; g.tick(now); } }, at: () => now };
}

test('CT-21: on a rope the steering thumb\'s flick up and back lets go of the steer (no intent lock there), and leans that way', () => {
  const t = gestures({ rope: true });
  // creep right, then flick up and left
  t.path(1, [[200, 600], [215, 600], [230, 600], [245, 600], [250, 600], ...Array.from({ length: 10 }, () => [250, 600] as [number, number]), [241, 580], [229, 555], [217, 530], [208, 510]]);
  const jump = t.log.findIndex((l) => l.startsWith('jump'));
  assert.ok(jump >= 0, t.log.join(' '));
  assert.equal(t.log[jump], 'jump:-1', t.log.join(' '));
  assert.ok(t.log.slice(0, jump).includes('move:none') || t.log.slice(0, jump).includes('move:left'), `the steer right let go before the hop: ${t.log.join(' ')}`);
});

// ───────────────────────────── CT-23: one "20 degrees" ─────────────────────────────

test('CT-23: one 20 degree lean: the flick that carries a lean and the least lean that can let go of a vine are the same number', () => {
  assert.equal((TUNING as Record<string, unknown>).vineLeapSlant, undefined);
  assert.ok(Math.abs(TUNING.leanSlant - Math.tan((20 * Math.PI) / 180)) < 0.001);
});

// ───────────────────────────── CT-24: accidental double jumps ─────────────────────────────

test('CT-24: a thumb drifting slowly down and up after a jump is no second jump; a real wiggle or flick still is', () => {
  // the steering thumb: runs, flicks up (the jump), then in the air drifts down 14 px and back up 22 px slowly (0.12 px/ms)
  const slow = gestures({ air: true });
  slow.path(1, [[200, 600], [230, 600], [250, 600], [252, 570], [254, 540], [254, 540], [254, 547], [254, 554], [254, 554], [254, 549], [254, 544], [254, 539], [254, 534], [254, 532]], 30, false);
  assert.equal(slow.log.filter((l) => l.startsWith('jump')).length, 1, `steering thumb, slow drift: ${slow.log.join(' ')}`);
  // the same thumb wiggling on purpose: down 18 px, up 26 px at 0.5 px/ms
  const quick = gestures({ air: true });
  quick.path(1, [[200, 600], [230, 600], [250, 600], [252, 570], [254, 540], ...Array.from({ length: 8 }, () => [254, 540] as [number, number]), [254, 549], [254, 558], [254, 545], [254, 532]], 20, false);
  assert.equal(quick.log.filter((l) => l.startsWith('jump')).length, 2, `steering thumb, a quick wiggle: ${quick.log.join(' ')}`);
  // the other thumb: its flick jumped, it stays on the glass, sinks 20 px and slides back up 25 px slowly (0.15 px/ms): no second jump
  const two = gestures({ air: true });
  two.path(1, [[100, 600], [140, 600]], 16, false);
  two.path(2, [[600, 600], [600, 570], [600, 540], [600, 540], [600, 550], [600, 560], [600, 560], [600, 555], [600, 550], [600, 545], [600, 540], [600, 535]], 33, false);
  assert.equal(two.log.filter((l) => l.startsWith('jump')).length, 1, `other thumb, slow re-rise: ${two.log.join(' ')}`);
  // … and a quick re-flick of it is the second jump
  const two2 = gestures({ air: true });
  two2.path(1, [[100, 600], [140, 600]], 16, false);
  two2.path(2, [[600, 600], [600, 570], [600, 540], ...Array.from({ length: 8 }, () => [600, 540] as [number, number]), [600, 550], [600, 560], [600, 545], [600, 530], [600, 515]], 25, false);
  assert.equal(two2.log.filter((l) => l.startsWith('jump')).length, 2, `other thumb, quick re-flick: ${two2.log.join(' ')}`);
});

// ───────────────────────────── CT-22: the still press between a tap and a hold ─────────────────────────────

test('CT-22: a still press too long for a tap and too short for a mega punches, on either half', () => {
  for (const x of [200, 650]) {
    for (const ms of [300, 450, 520]) {
      const t = gestures();
      t.path(1, [[x, 600], ...Array.from({ length: Math.round(ms / 30) }, () => [x, 600] as [number, number])], 30);
      assert.deepEqual(t.log, ['punch'], `x ${x}, still ${ms} ms: ${t.log.join(' ')}`);
    }
  }
  // (a lone left-half finger held still is NOT a mega: replaying the testers' touches, that threw 283 more megas, 85 -> 368, from thumbs
  // resting before they steer. The right half's held finger megas as before)
  const t = gestures();
  t.g.down(1, 200, 600, 1000);
  for (let ms = 30; ms <= 700; ms += 30) t.g.tick(1000 + ms);
  t.g.up(1, 200, 600, 1710);
  assert.deepEqual(t.log, [], t.log.join(' '));
});

// ───────────────────────────── CT-26: the Pad's Jump while the pad is held up ─────────────────────────────

test('CT-26: pressing Jump while the pad is held up is a fresh jump press (the second jump), off a vine too', () => {
  const presses: number[] = [];
  const inp = {
    onVine: false, source: 'pad',
    triggerTouchMove() {}, triggerTouchDuck() {}, triggerTouchClimb() {}, releaseTouchUp() {}, triggerHaptic() {}, triggerTouchPunch() {}, triggerTouchMega() {}, setHold() {},
    triggerTouchUp(lean?: -1 | 0 | 1) { presses.push(lean ?? 0); },
  };
  const pad = new PadInput(inp);
  pad.pad(0, -45); // up: the first jump
  assert.equal(presses.length, 1);
  pad.jumpButton(true); // the second jump, the pad still held up
  assert.equal(presses.length, 2, 'Jump pressed while the pad is up is a new press');
  pad.jumpButton(false);
  pad.jumpButton(true);
  assert.equal(presses.length, 3, 'and again');
});

// ───────────────────────────── CT-15: the palm rule ─────────────────────────────

test('CT-15: a second thumb tapping 45-70 px from the steering thumb punches (the palm rule ate it); resting there it throws no mega', () => {
  for (const d of [50, 65]) {
    const t = gestures();
    t.path(1, [[200, 600], [240, 600]], 16, false); // steering right, thumb stays down
    t.path(2, [[240 + d, 600], [241 + d, 601]], 40);
    assert.ok(t.log.includes('punch'), `a tap ${d} px from the steering thumb: ${t.log.join(' ')}`);
    const r = gestures();
    r.path(1, [[200, 600], [240, 600]], 16, false);
    r.g.down(2, 240 + d, 600, r.at() + 10);
    for (let ms = 30; ms <= 900; ms += 30) r.g.tick(r.at() + 10 + ms);
    assert.ok(!r.log.includes('mega'), `resting ${d} px from the steering thumb threw a mega: ${r.log.join(' ')}`);
  }
  // nearer than 45 px it is the same hand: ignored, as before
  const p = gestures();
  p.path(1, [[200, 600], [240, 600]], 16, false);
  p.path(2, [[270, 600], [271, 601]], 40);
  assert.ok(!p.log.includes('punch'), p.log.join(' '));
});

// ───────────────────────────── CT-16: a gripping palm, a lift never reported ─────────────────────────────

test('CT-16: a touch at the very side edge does nothing until it moves; one that slides in steers', () => {
  for (const x of [2, 842]) {
    const blip = gestures();
    blip.path(1, [[x, 600], [x, 600]], 15);
    assert.deepEqual(blip.log, [], `an edge blip at x ${x}: ${blip.log.join(' ')}`);
    // a gripping palm at the edge, then the real thumb: the thumb steers
    const grip = gestures();
    grip.g.down(9, x, 650, grip.at());
    grip.path(1, [[300, 600], [320, 600], [340, 600], [360, 600]], 16, false);
    assert.ok(grip.log.includes('move:right'), `the thumb steers past a grip at x ${x}: ${grip.log.join(' ')}`);
  }
  // a thumb that starts at the edge and slides in is a thumb
  const slide = gestures();
  slide.path(1, [[3, 600], [15, 600], [30, 600], [45, 600], [60, 600]], 16, false);
  assert.ok(slide.log.includes('move:right'), slide.log.join(' '));
});

test('CT-16: a finger the browser no longer reports is dropped on the next touch, so it never holds the steering', () => {
  const t = gestures();
  t.path(1, [[200, 600], [240, 600]], 16, false); // steering right; its lift is lost
  t.g.keepOnly([2], t.at() + 100);
  t.path(2, [[500, 600], [480, 600], [460, 600], [440, 600], [420, 600]], 16, false);
  assert.ok(t.log.includes('move:left'), `the new thumb steers: ${t.log.join(' ')}`);
});

// ───────────────────────────── CT-17: punches wait for the finger to lift ─────────────────────────────

/** the engine's current swing: which move, how far in, and whether it has struck yet */
const swing = (rig: TouchRig) => (rig.r.e as unknown as { atk: { move: { id: string; startup: number }; t: number; id: number } | null }).atk;

test('CT-17: the Pad punches as Punch is pressed, and holding it on 320 ms upgrades to the mega', () => {
  const rig = floorRig();
  rig.input.source = 'pad';
  const pad = new PadInput(rig.input);
  rig.run(100);
  pad.punchButton(true);
  rig.runFrames(2);
  assert.equal(swing(rig)?.move.id, 'jab', 'a jab two frames after the press, the button still held');
  rig.run(400);
  assert.equal(swing(rig)?.move.id, 'mega', 'held on: the mega');
  pad.punchButton(false);
  // a quick press and release: one jab, no mega
  const rig2 = floorRig();
  const pad2 = new PadInput(rig2.input);
  rig2.run(100);
  pad2.punchButton(true);
  rig2.run(80);
  pad2.punchButton(false);
  const seen = new Set<string>();
  rig2.run(800, () => swing(rig2) && seen.add(swing(rig2)!.move.id));
  assert.deepEqual([...seen], ['jab']);
});

/** steering with the left thumb, a second thumb's touch on the right: every swing the engine ran, and whether one struck */
function secondThumb(evs: TouchEv[]) {
  const rig = floorRig();
  rig.push([...stroke(1, [[0, 200, 700], [900, 230, 700]]), ...evs]);
  const swings: Array<{ id: string; n: number; struck: boolean }> = [];
  let jumped = false;
  rig.run(1000, () => {
    const a = swing(rig);
    if (a && swings[swings.length - 1]?.n !== a.id) swings.push({ id: a.move.id, n: a.id, struck: false });
    if (a && a.t >= a.move.startup) swings[swings.length - 1].struck = true;
    if (!rig.p.grounded) jumped = true;
  });
  return { swings, jumped, words: rig.words().join(' ') };
}

test('CT-17: a second thumb\'s tap starts the jab as it lands, not when it lifts, and lifting does not punch again', () => {
  const rig = floorRig();
  rig.push([...stroke(1, [[0, 200, 700], [900, 230, 700]]), ...stroke(2, [[200, 800, 700], [380, 801, 701]])]);
  rig.run(200 + 40);
  assert.equal(swing(rig)?.move.id, 'jab', 'winding up 40 ms after the thumb landed, the thumb still down');
  rig.run(100);
  assert.ok(swing(rig)!.t >= swing(rig)!.move.startup, 'and it has struck before the thumb lifts');
  const s = secondThumb(stroke(2, [[200, 800, 700], [380, 801, 701]]));
  assert.equal(s.swings.length, 1, `one swing: ${s.words}`);
});

test('CT-17: a second thumb that lands and flicks up (its first move reported 50 ms late) jumps, and its jab is taken back before it strikes', () => {
  for (const [first, dy] of [[50, 6], [60, 14], [90, 20]] as const) {
    const s = secondThumb(stroke(2, [[200, 800, 700], [200 + first, 801, 700 - dy], [200 + first + 50, 806, 620]], true, 17));
    assert.ok(s.jumped, `jumped: ${s.words}`);
    assert.ok(s.words.includes('punchCancel'), `jab taken back: ${s.words}`);
    assert.ok(s.swings.every((w) => !w.struck), `nothing struck: ${JSON.stringify(s.swings)}`);
  }
});

// ───────────────────────────── CT-18: the Pad buttons' reach ─────────────────────────────

/** the three buttons where PadController.tsx draws them (on the left, --b 80 px: a 390 x 844 phone held upright) */
function padSpots(h = 844, b = 80): PadButtonSpot[] {
  const at = (bt: string, left: number, bottom: number, size: number) => ({ b: bt, cx: 10 + left + (size * b) / 2, cy: h - 10 - bottom - (size * b) / 2, r: (size * b) / 2 });
  return [at('kick', 0.45 * b, 1.45 * b, 1), at('punch', 1.55 * b, 0.7 * b, 1), at('jump', 0.1 * b, 0, 1.2)];
}

test('CT-18: a touch that misses a Pad button by a few px still presses it, and anywhere in the buttons\' half presses the nearest', () => {
  const spots = padSpots();
  const by = (b: string) => spots.find((s) => s.b === b)!;
  // dead on, and just outside each drawn edge (up to 0.3 of its radius), every way round
  for (const s of spots) {
    assert.equal(pickButton(s.cx, s.cy, spots), s.b);
    for (let a = 0; a < 360; a += 30) {
      const d = s.r * (1 + (BUTTON_REACH - 1) * 0.9);
      const x = s.cx + d * Math.cos((a * Math.PI) / 180), y = s.cy + d * Math.sin((a * Math.PI) / 180);
      // (where two reaches overlap, the one it is deeper in wins)
      if (spots.some((o) => o !== s && Math.hypot(x - o.cx, y - o.cy) < o.r * BUTTON_REACH)) continue;
      assert.equal(pickButton(x, y, spots), s.b, `${s.b}, just outside it at ${a} degrees`);
    }
  }
  // the gap between Jump and Kick: split between them, never nothing
  const j = by('jump'), k = by('kick');
  const gap = Math.hypot(k.cx - j.cx, k.cy - j.cy) - j.r - k.r;
  assert.ok(gap > 0, 'there is a gap');
  const ux = (k.cx - j.cx) / (gap + j.r + k.r), uy = (k.cy - j.cy) / (gap + j.r + k.r);
  assert.equal(pickButton(j.cx + ux * (j.r + 2), j.cy + uy * (j.r + 2), spots), 'jump');
  assert.equal(pickButton(k.cx - ux * (k.r + 2), k.cy - uy * (k.r + 2), spots), 'kick');
  // high up the half, far from all of them: the nearest (Kick, the top one)
  assert.equal(pickButton(100, 300, spots), 'kick');
  // out to the right, by Punch
  assert.equal(pickButton(by('punch').cx + 80, by('punch').cy, spots), 'punch');
});

// ───────────────────────────── CT-14: marks under the fingers in Screen mode ─────────────────────────────

test('CT-14: every move a touch makes is reported where the finger is, and the steering thumb\'s anchor and run direction are there to draw', () => {
  const t = gestures();
  // steer right with the left thumb, held down
  t.path(1, [[200, 600], [215, 600], [235, 600], [255, 600]], 16, false);
  const s = t.g.steerMark();
  assert.ok(s, 'a steering mark while the thumb steers');
  assert.equal(s!.dir, 1);
  assert.ok(Math.abs(s!.y - 600) < 1 && s!.x >= 200 && s!.x <= 255, `anchored at ${s!.x},${s!.y}`);
  // a second thumb: a tap, then a flick up
  t.path(2, [[700, 600], [701, 600]]);
  t.wait(300);
  t.path(3, [[700, 650], [700, 630], [700, 600], [700, 570]]);
  const kinds = t.marks.map((m) => m.k);
  assert.ok(kinds.includes('punch') && kinds.includes('jump'), kinds.join(' '));
  for (const m of t.marks) assert.ok(m.x !== undefined && m.x >= 650 && m.y !== undefined, `${m.k} marked at ${m.x},${m.y}`);
  t.g.up(1, 255, 600, t.at() + 10);
  assert.equal(t.g.steerMark(), null, 'no ring once the thumb lifts');
});

test('CT-14: a mark flashes, its label fades by 450 ms, and a jab taken back leaves no mark; Auto shows them in World 1 only', () => {
  const m = new TouchMarks();
  m.add('jump', 10, 10, 0);
  m.add('punch', 20, 20, 50);
  assert.equal(m.live(100).length, 2);
  m.takeBack('punch');
  assert.deepEqual(m.live(100).map((x) => x.kind), ['jump']);
  assert.equal(m.live(MARK.labelMs + 1).length, 0);
  assert.ok(touchMarksOn(1, 'auto') && !touchMarksOn(2, 'auto'));
  assert.ok(touchMarksOn(7, 'on') && !touchMarksOn(1, 'off'));
});

// ───────────────────────────── CT-28: sensitivity and the steering hand ─────────────────────────────

test('CT-28: sensitivity scales how far a quick flick must rise: 18 px at 100%, about 14 at 135%, 24 at 75%; the palm stays the palm', () => {
  const flick = (rise: number) => {
    const t = gestures();
    t.path(1, Array.from({ length: 5 }, (_, i) => [700, 600 - (rise * i) / 4] as [number, number]), 7);
    return t.log.some((l) => l.startsWith('jump'));
  };
  try {
    applyTouchSensitivity(1);
    assert.ok(!flick(16) && flick(20), 'at 100%: 16 px no, 20 px yes');
    applyTouchSensitivity(1.35);
    assert.ok(flick(16), 'at 135% a 16 px flick jumps');
    assert.equal(TUNING.palmPx, 45, 'the palm is the hand, not the move: unscaled');
    applyTouchSensitivity(0.75);
    assert.ok(!flick(20) && flick(26), 'at 75% a 20 px flick does not, 26 px does');
  } finally {
    applyTouchSensitivity(1);
  }
  assert.equal(TUNING.groundJumpPx, 26, 'back to the numbers at 100%');
});

test('CT-28: Steer with Right mirrors the screen: a lone first finger on the right steers at once, one on the left taps to punch', () => {
  const r = gestures({ hand: 'right' });
  r.path(1, [[700, 600], [712, 600], [726, 600], [742, 600]], 16, false);
  assert.ok(r.log.includes('move:right'), `right half steers at once: ${r.log.join(' ')}`);
  r.g.up(1, 742, 600, r.at() + 10);
  r.wait(200);
  r.path(2, [[150, 600], [151, 601]]);
  assert.ok(r.log.includes('punch'), `left half tap punches: ${r.log.join(' ')}`);
  // and Left is today's layout
  const l = gestures({ hand: 'left' });
  l.path(1, [[150, 600], [162, 600], [176, 600], [192, 600]], 16, false);
  assert.ok(l.log.includes('move:right'), l.log.join(' '));
});
