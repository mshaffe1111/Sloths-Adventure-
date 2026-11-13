/**
 * The stage-cleared card's clock (StageCleared.tsx useCardClock), with no React in it so it can be tested: ms since the card opened,
 * stepped at the game's 30 fps until the last thing on the timeline is in, and the sounds on the same timeline (a soft tick while the
 * numbers count, a chime as they land, a ring for each star, the medal chime). skip() jumps to the end.
 *
 * The medals can arrive after the card has opened (audit C saves #7): App.tsx works them out in its own effect on the render where
 * the screen becomes 'victory', and a child's effects run before its parent's, so the card used to start its clock with no medals,
 * stop before the medal row was due, and never bring the row in (no chime; a tap after the count did nothing). medals() now moves
 * the end of the timeline out, schedules the chime, and runs the clock on again if it had stopped.
 */
import { COUNT_MS, COUNT_START_MS, medalsAtMs, starTimes, tickTimes } from './countUp.ts';

export const DONE_MS = 1e6;

export interface ClockHost {
  now(): number;
  setTimeout(f: () => void, ms: number): number;
  clearTimeout(id: number): void;
  raf(f: () => void): number;
  cancelRaf(id: number): void;
  setMs(ms: number): void;
}
export interface ClockSounds {
  tick(): void;
  counted(): void;
  star(n: number): void;
  medals(): void;
}

export function createCardClock(o: { stars: number; score: number; reduced: boolean; host: ClockHost; sounds: ClockSounds }) {
  const { stars, reduced, host, sounds } = o;
  const timers: number[] = [];
  let raf = 0;
  let running = false;
  let finished = reduced; // the clock has reached its end (or was skipped)
  let skipped = false;
  let medalsDue = false;
  let end = Math.max(COUNT_START_MS + COUNT_MS, ...starTimes(stars));
  const t0 = host.now();
  const at = (t: number, f: () => void) => timers.push(host.setTimeout(f, Math.max(0, t - (host.now() - t0))));

  const dispose = () => {
    timers.forEach((id) => host.clearTimeout(id));
    timers.length = 0;
    host.cancelRaf(raf);
    running = false;
  };
  const run = () => {
    if (running) return;
    running = true;
    finished = false;
    let last = -1;
    const step = () => {
      const now = host.now() - t0;
      // (stepped at the game's 30 fps: the card re-draws a few pieces each step, not every display frame)
      if (now - last >= 33) {
        last = now;
        host.setMs(now);
      }
      if (now < end + 50) raf = host.raf(step);
      else {
        running = false;
        finished = true;
      }
    };
    raf = host.raf(step);
  };

  if (reduced) {
    host.setMs(DONE_MS);
    // (no count to hear: the stars ring together, as the card shows them)
    if (stars > 0) at(200, () => sounds.star(stars));
  } else {
    for (const t of tickTimes(o.score)) at(t, sounds.tick);
    at(COUNT_START_MS + COUNT_MS, sounds.counted);
    starTimes(stars).forEach((t, i) => at(t, () => sounds.star(i + 1)));
    run();
  }

  return {
    /** this run's medals are known (at the card's opening, or a moment after it) */
    medals() {
      if (medalsDue) return;
      medalsDue = true;
      if (reduced) return void at(500, sounds.medals);
      // (skipped: the row is already in, at the end, as it is when the medals were known at the opening)
      if (skipped) return;
      end = Math.max(end, medalsAtMs(stars));
      at(medalsAtMs(stars), sounds.medals);
      run();
    },
    /** a tap: everything at its end (nothing to do once the clock is there) */
    skip() {
      if (finished) return;
      skipped = true;
      finished = true;
      dispose();
      if (stars > 0) sounds.star(stars);
      host.setMs(DONE_MS);
    },
    dispose,
  };
}

export type CardClock = ReturnType<typeof createCardClock>;
