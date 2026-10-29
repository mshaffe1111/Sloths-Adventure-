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
