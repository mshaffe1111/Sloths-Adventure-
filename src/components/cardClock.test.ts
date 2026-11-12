/**
 * Audit C saves #7 (2026-11-11): medals earned on a clear never came in on the stage-cleared card. App.tsx works the medals out in
 * its own effect on the render where the screen becomes 'victory'; a child's effects run first, so the card's clock started with no
 * medals, stopped at the last star (2200 ms with three stars) before the medal row was due (2570 ms), never scheduled the chime, and
 * a tap after the count did nothing. This drives the card's clock (fx/cardClock.ts) on a fake timeline.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCardClock, DONE_MS } from './fx/cardClock.ts';
import { medalsAtMs } from './fx/countUp.ts';

/** a fake browser: time moves only when the test says, rAF fires every 16.7 ms, timers at their time */
function fakeHost() {
  let t = 0;
  let id = 0;
  const timers = new Map<number, { at: number; f: () => void }>();
  let frame: { id: number; f: () => void } | null = null;
  const sounds: string[] = [];
  const st = {
    ms: 0,
    host: {
      now: () => t,
      setTimeout: (f: () => void, ms: number) => (timers.set(++id, { at: t + ms, f }), id),
      clearTimeout: (k: number) => void timers.delete(k),
      raf: (f: () => void) => ((frame = { id: ++id, f }), id),
      cancelRaf: (k: number) => {
        if (frame?.id === k) frame = null;
      },
      setMs: (ms: number) => void (st.ms = ms),
    },
    sounds: { tick: () => {}, counted: () => {}, star: (n: number) => void sounds.push(`star${n}`), medals: () => void sounds.push('medals') },
    heard: sounds,
    /** run the page for `ms` */
    run(ms: number) {
      const until = t + ms;
      while (t < until) {
        t = Math.min(until, t + 1000 / 60);
        for (const [k, v] of [...timers]) if (v.at <= t) (timers.delete(k), v.f());
        const fr = frame;
        frame = null;
        fr?.f();
      }
    },
  };
  return st;
}

test('medals known a moment after the card opened still come in, with their chime', () => {
  const f = fakeHost();
  const clock = createCardClock({ stars: 3, score: 1200, reduced: false, host: f.host, sounds: f.sounds });
  // (App.tsx's effect: the same commit as the card's, a few ms later)
  f.run(10);
  clock.medals();
  f.run(4000);
  assert.ok(f.ms >= medalsAtMs(3), `the clock stopped at ${Math.round(f.ms)} ms, the medal row is due at ${medalsAtMs(3)} ms`);
  assert.ok(f.heard.includes('medals'), 'the medal chime');
});

test('medals that arrive after the count has ended bring the row in, and a tap then skips to it', () => {
  const f = fakeHost();
  const clock = createCardClock({ stars: 1, score: 500, reduced: false, host: f.host, sounds: f.sounds });
  f.run(3000); // the count and the star are done; the clock has stopped
  clock.medals();
  clock.skip();
  assert.equal(f.ms, DONE_MS, 'the tap brings the row in');
});

test('the control: medals known at the opening come in at their time, and no medals means no chime', () => {
  const f = fakeHost();
  const clock = createCardClock({ stars: 2, score: 800, reduced: false, host: f.host, sounds: f.sounds });
  clock.medals();
  f.run(4000);
  assert.ok(f.ms >= medalsAtMs(2));
  assert.deepEqual(f.heard, ['star1', 'star2', 'medals']);
  const g = fakeHost();
  createCardClock({ stars: 2, score: 800, reduced: false, host: g.host, sounds: g.sounds });
  g.run(4000);
  assert.deepEqual(g.heard, ['star1', 'star2']);
  assert.ok(g.ms < medalsAtMs(2), 'without medals the clock ends with the stars');
});
