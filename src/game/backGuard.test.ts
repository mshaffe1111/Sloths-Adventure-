/** CT-6: a back swipe while a stage is on pauses the game instead of leaving it, every time */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { guardBack } from './backGuard.ts';

/** a browser history: a stack of entries, back() pops one and fires popstate */
function fakeBrowser() {
  const stack: unknown[] = [null];
  const pops = new Set<() => void>();
  const h = {
    get state() {
      return stack[stack.length - 1];
    },
    pushState: (d: unknown) => void stack.push(d),
  };
  const w = { addEventListener: (_: 'popstate', f: () => void) => void pops.add(f), removeEventListener: (_: 'popstate', f: () => void) => void pops.delete(f) };
  const back = () => {
    if (stack.length === 1) return 'left the game';
    stack.pop();
    for (const f of pops) f();
    return 'stayed';
  };
  return { h, w, back, depth: () => stack.length };
}

test('CT-6: a back swipe during a stage pauses it and stays in the game, the second one too', () => {
  const b = fakeBrowser();
  let paused = 0;
  const stop = guardBack(() => paused++, b.h, b.w);
  assert.equal(b.back(), 'stayed');
  assert.equal(paused, 1);
  assert.equal(b.back(), 'stayed');
  assert.equal(paused, 2);
  stop();
  // a new stage reuses the same entry: the history does not grow a step per stage
  const depth = b.depth();
  const stop2 = guardBack(() => paused++, b.h, b.w);
  assert.equal(b.depth(), depth);
  stop2();
});

test('CT-6: off a stage the guard is gone: a back swipe takes our entry off quietly, the next one leaves as usual', () => {
  const b = fakeBrowser();
  let paused = 0;
  guardBack(() => paused++, b.h, b.w)();
  assert.equal(b.back(), 'stayed');
  assert.equal(paused, 0);
  assert.equal(b.back(), 'left the game');
});
