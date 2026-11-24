// gradCache.ts: a fixed gradient is made once per context and reused; a changed line or stop is a new one; the cache never grows past its cap
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cachedLinearGradient } from './gradCache.ts';

function fakeCtx() {
  let made = 0;
  const ctx = {
    createLinearGradient: () => {
      made++;
      return { stops: [] as [number, string][], addColorStop(o: number, c: string) { this.stops.push([o, c]); } };
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, made: () => made };
}

test('gradCache: the same line and stops return the same gradient, made once', () => {
  const { ctx, made } = fakeCtx();
  const a = cachedLinearGradient(ctx, 0, 10, 0, 170, [[0, 'red'], [1, 'blue']]);
  const b = cachedLinearGradient(ctx, 0, 10, 0, 170, [[0, 'red'], [1, 'blue']]);
  assert.equal(a, b);
  assert.equal(made(), 1);
  assert.deepEqual((a as unknown as { stops: [number, string][] }).stops, [[0, 'red'], [1, 'blue']]);
});

test('gradCache: a different line, stop or context is a different gradient', () => {
  const { ctx, made } = fakeCtx();
  const a = cachedLinearGradient(ctx, 0, 10, 0, 170, [[0, 'red'], [1, 'blue']]);
  assert.notEqual(cachedLinearGradient(ctx, 0, 11, 0, 170, [[0, 'red'], [1, 'blue']]), a);
  assert.notEqual(cachedLinearGradient(ctx, 0, 10, 0, 170, [[0, 'red'], [1, 'green']]), a);
  assert.equal(made(), 3);
  const other = fakeCtx();
  assert.notEqual(cachedLinearGradient(other.ctx, 0, 10, 0, 170, [[0, 'red'], [1, 'blue']]), a);
});

test('gradCache: a key that changes every frame costs a miss, never a leak (the cache empties at its cap)', () => {
  const { ctx, made } = fakeCtx();
  for (let i = 0; i < 500; i++) cachedLinearGradient(ctx, 0, i, 0, i + 160, [[0, 'red'], [1, 'blue']]);
  assert.equal(made(), 500);
  // (the last key is still held after the churn)
  cachedLinearGradient(ctx, 0, 499, 0, 659, [[0, 'red'], [1, 'blue']]);
  assert.equal(made(), 500);
});
