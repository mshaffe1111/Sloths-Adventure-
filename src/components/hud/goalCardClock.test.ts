import test from 'node:test';
import assert from 'node:assert/strict';
import { startGoalCard, type CardPhase, type CardTimers } from './goalCardClock.ts';
import { readMs } from './hudLayout.ts';

/** a fake clock: advance(ms) runs what falls due, in order */
function fakeTimers() {
  let now = 0;
  let next = 1;
  const due = new Map<number, { at: number; fn: () => void }>();
  const timers: CardTimers = {
    set: (fn, ms) => {
      due.set(next, { at: now + ms, fn });
      return next++;
    },
    clear: (id) => void due.delete(id),
  };
  const advance = (ms: number) => {
    const end = now + ms;
    for (;;) {
      const first = [...due.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!first) break;
      due.delete(first[0]);
      now = first[1].at;
      first[1].fn();
    }
    now = end;
  };
  return { timers, advance, now: () => now };
}

/** the card as GoalCard.tsx runs it: one clock per stage run, its words free to change under it */
function card(line: string, quick = false) {
  const f = fakeTimers();
  const seen: CardPhase[] = [];
  let words = line;
  const holdMs = quick ? 900 : Math.min(4500, readMs(words, 3000));
  const clock = startGoalCard({ quick, holdMs, reducedMotion: false, timers: f.timers, onPhase: (p) => seen.push(p) });
  return { f, clock, seen, holdMs, setLine: (l: string) => (words = l), words: () => words };
}

test('UI-22: the count changing after the card is up (2-3: free 3, then the engine says 5) still shrinks on time', () => {
  const c = card('This stage: free 3 little ones');
  c.f.advance(400);
  c.setLine('This stage: free 5 little ones');
  c.f.advance(c.holdMs - 400);
  assert.equal(c.clock.phase(), 'shrink', 'shrinks at its first reading time, not one restarted by the new count');
  c.f.advance(480);
  assert.equal(c.clock.phase(), 'done');
  assert.deepEqual(c.seen, ['hold', 'shrink', 'done']);
});

test('UI-22: a change arriving after the shrink began never brings the card back', () => {
  const c = card('This stage: free 3 little ones');
  c.f.advance(c.holdMs + 100);
  c.setLine('This stage: free 5 little ones');
  c.clock.poke();
  c.f.advance(1000);
  assert.equal(c.clock.phase(), 'done');
  assert.ok(!c.seen.slice(c.seen.indexOf('shrink')).includes('hold'), 'its phases only go forward');
});

test('UI-22: any touch or key shrinks it once it has been seen a moment; the first instant does not', () => {
  const c = card('This stage: collect 33 petals');
  c.f.advance(500);
  c.clock.poke();
  assert.equal(c.clock.phase(), 'hold', 'a touch in its first 0.9 s (the tap that started the stage) is not a dismissal');
  c.f.advance(500);
  c.clock.poke();
  assert.equal(c.clock.phase(), 'shrink');
  c.f.advance(480);
  assert.equal(c.clock.phase(), 'done');
});

test('a retry gets the one-second card', () => {
  const c = card('This stage: collect 33 petals', true);
  c.f.advance(900);
  assert.equal(c.clock.phase(), 'shrink');
});

test("UI-22: GoalCard keys its clock on the stage, never on its words, and waits for the engine's count", async () => {
  const { readFileSync } = await import('node:fs');
  const src = readFileSync(new URL('./GoalCard.tsx', import.meta.url), 'utf8');
  const deps = src.match(/startGoalCard\([\s\S]*?\n  \}, \[([^\]]*)\]\);/);
  assert.ok(deps, "GoalCard's clock effect");
  assert.doesNotMatch(deps[1], /info|line|target/, `deps: [${deps[1]}]`);
  const hud = readFileSync(new URL('./VineHud.tsx', import.meta.url), 'utf8');
  assert.match(hud, /showCard && !counting && \(\s*<GoalCard/);
});
