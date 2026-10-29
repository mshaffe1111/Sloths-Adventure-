/**
 * Play again (the control test's replay, QA 2026-10-29: a replay that fell to 2 fps for 11 minutes). Each run is a new engine on the same
 * canvas: the old one must stop for good (no frame asked for, no listener left), so after any number of replays exactly one loop runs,
 * and a stopped engine never asks for another frame even when a frame it asked for earlier still comes in.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';

// frames: each request is kept until it is run or cancelled; window listeners are counted
const g = globalThis as unknown as Record<string, unknown> & { window: Record<string, unknown> };
let nextId = 1;
const frames = new Map<number, (t: number) => void>();
g.requestAnimationFrame = (f: (t: number) => void) => (frames.set(nextId, f), nextId++);
g.cancelAnimationFrame = (id: number) => void frames.delete(id);
const listeners = new Map<string, number>();
g.window.addEventListener = (t: string) => void listeners.set(t, (listeners.get(t) ?? 0) + 1);
g.window.removeEventListener = (t: string) => void listeners.set(t, (listeners.get(t) ?? 0) - 1);

const { RealPlay } = await import('./realPlay.ts');
/** a run's engine (its drawing is left out: there is no screen here) */
const engineFor = (seed: number) => {
  const e = new RealPlay('1-2', seed).e as unknown as { start(): void; stop(): void; render: () => void };
  e.render = () => {};
  return e;
};

let clock = 1000;
/** run every frame that is due, as the browser would at one vsync */
function vsync() {
  clock += 1000 / 30;
  const due = [...frames];
  frames.clear();
  for (const [, f] of due) f(clock);
}

test('play again, five times: one loop runs, and every stopped run let go of its frame and its listeners', () => {
  const before = listeners.get('resize') ?? 0;
  let live: { start(): void; stop(): void } | null = null;
  for (let run = 0; run < 5; run++) {
    // (App.tsx launchEngine: the last run stops, the new one starts)
    live?.stop();
    const e = engineFor(1 + run);
    e.start();
    live = e;
    for (let i = 0; i < 10; i++) vsync();
    assert.equal(frames.size, 1, `run ${run + 1}: exactly one frame waiting`);
    assert.equal((listeners.get('resize') ?? 0) - before, 1, `run ${run + 1}: one engine listening`);
  }
  live!.stop();
  assert.equal(frames.size, 0, 'nothing runs once the last one stops');
  assert.equal(listeners.get('resize') ?? 0, before);
});

test('a frame asked for before stop() that still comes in does not start the stopped loop again', () => {
  const e = engineFor(9);
  e.start();
  const [cb] = [...frames.values()];
  e.stop();
  cb(clock + 50);
  assert.equal(frames.size, 0);
});
