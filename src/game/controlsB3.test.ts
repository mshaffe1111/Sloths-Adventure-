/**
 * Build 3 of the polish report (2026-10-29): the rest of the control items (CT-14 to CT-18, CT-21 to CT-26, CT-28). Each test is the
 * item's reproduction, kept as a regression test, run through the whole touch chain where touch matters (touchRig.ts).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { HANG_DROP, ropeYAt } from './rope.ts';
import type { Rope } from './types.ts';
import { TouchGestures, TUNING } from './touchGestures.ts';

const G = 2000;

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
function gestures(world: { rope?: boolean; vine?: boolean; air?: boolean } = {}) {
  const log: string[] = [];
  const g = new TouchGestures(
    {
      move: (d) => log.push(`move:${d}`), duck: (on) => log.push(on ? 'duck' : 'duckOff'), jumpPress: (l) => log.push(`jump:${l ?? 0}`),
      jumpRelease: () => log.push('jumpUp'), punch: () => log.push('punch'), kick: (d) => log.push(`kick:${d ?? 0}`), mega: () => log.push('mega'),
      climb: (d) => log.push(`climb:${d}`), feedback: () => {},
    },
    () => 844,
    { assist: () => true, air: () => !!world.air, refined: () => true, kickNear: () => false, onVine: () => !!world.vine, onRope: () => !!world.rope },
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
  return { g, log, path, wait: (ms: number) => { const end = now + ms; while (now < end) { now += 30; g.tick(now); } }, at: () => now };
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
