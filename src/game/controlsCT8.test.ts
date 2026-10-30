/**
 * Polish report CT-8, step 2 (2026-10-29): a lone first finger steers at once, anywhere on the screen. On the far half it waited 60 ms
 * and 18 px; now it steers the moment it has slid 16 px sideways, as on the steering half. Going up or down it is still judged as a
 * flick first, so a flick up is never misread as a run. Both steering hands (CT-28's Steer with: Left / Right), upright and sideways.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures } from './touchGestures.ts';

function rig(w: number, hand: 'left' | 'right') {
  const log: Array<{ t: number; what: string }> = [];
  let now = 1000;
  const say = (what: string) => log.push({ t: now, what });
  const g = new TouchGestures(
    {
      move: (d) => say(`move:${d}`), duck: (on) => say(on ? 'duck' : 'duckOff'), jumpPress: () => say('jump'), jumpRelease: () => say('jumpUp'),
      punch: () => say('punch'), kick: (d) => say(`kick:${d ?? 0}`), mega: () => say('mega'), climb: (d) => say(`climb:${d}`), feedback: () => {},
    },
    () => w,
    { steerHand: () => hand, assist: () => true, air: () => false, refined: () => true, kickNear: () => false, onVine: () => false, onRope: () => false },
  );
  /** a stroke from (x, y), `dx`/`dy` px every 8 ms for `n` moves, the finger left down */
  const slide = (x: number, y: number, dx: number, dy: number, n: number) => {
    g.down(1, x, y, now);
    for (let k = 1; k <= n; k++) {
      now += 8;
      g.move(1, x + dx * k, y + dy * k, now);
    }
  };
  return { g, log, slide, at: () => now, t0: 1000 };
}

const VIEWS = { upright: 412, sideways: 915 } as const;

test('CT-8: a lone first finger on the far half steers the moment it has slid 16 px sideways, either steering hand, either view', () => {
  for (const [view, w] of Object.entries(VIEWS)) {
    for (const hand of ['left', 'right'] as const) {
      // the far half: the right one for a left-hand steerer, the left one for a right-hand steerer
      const x = hand === 'left' ? w * 0.75 : w * 0.25;
      for (const dir of [1, -1]) {
        const t = rig(w, hand);
        t.slide(x, 600, dir * 6, 0, 4); // 6 px every 8 ms: 18 px by 24 ms
        const mv = t.log.find((l) => l.what.startsWith('move:') && l.what !== 'move:none');
        assert.ok(mv, `${view}, ${hand} hand, sliding ${dir > 0 ? 'right' : 'left'}: it steered (${t.log.map((l) => l.what).join(' ')})`);
        assert.equal(mv!.what, `move:${dir > 0 ? 'right' : 'left'}`);
        assert.ok(mv!.t - t.t0 <= 24, `${view}, ${hand} hand: steered ${mv!.t - t.t0} ms after landing (it waited 60 ms)`);
      }
    }
  }
});

test('CT-8: a far-half flick up still jumps and starts no run, and a far-half tap still punches', () => {
  for (const [view, w] of Object.entries(VIEWS)) {
    for (const hand of ['left', 'right'] as const) {
      const x = hand === 'left' ? w * 0.75 : w * 0.25;
      const t = rig(w, hand);
      t.slide(x, 600, 7, -14, 5); // up and a little over: 35 px across, 70 up
      t.g.up(1, x + 35, 530, t.at() + 8);
      const words = t.log.map((l) => l.what);
      assert.ok(words.includes('jump'), `${view}, ${hand} hand: the flick jumped (${words.join(' ')})`);
      assert.ok(!words.some((l) => l === 'move:right' || l === 'move:left'), `${view}, ${hand} hand: no run (${words.join(' ')})`);
      const tap = rig(w, hand);
      tap.g.down(1, x, 600, 1000);
      tap.g.up(1, x + 2, 601, 1090);
      assert.deepEqual(tap.log.map((l) => l.what), ['punch'], `${view}, ${hand} hand: a tap`);
    }
  }
});
