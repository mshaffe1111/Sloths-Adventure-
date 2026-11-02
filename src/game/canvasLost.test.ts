/**
 * canvasLost: a baked copy Chrome took back and then gave back EMPTY ('contextrestored', isContextLost() false again) still counts as
 * lost, once, so its owner bakes it again or draws from the sheet. Missed, Meeca's baked frames drew nothing on Matt's Pixel for the rest
 * of 5-M (2026-10-31: "she goes in and out the whole level").
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { canvasLost } from './canvasLost.ts';

function fakeCanvas() {
  let lostNow = false;
  const fns = new Map<string, Array<() => void>>();
  const cv = {
    width: 64,
    height: 64,
    getContext: () => ({ isContextLost: () => lostNow }),
    addEventListener: (k: string, f: () => void) => fns.set(k, [...(fns.get(k) ?? []), f]),
    fire: (k: string) => (fns.get(k) ?? []).forEach((f) => f()),
    set lost(v: boolean) {
      lostNow = v;
    },
  };
  return cv;
}

test('a copy lost and given back empty between two checks is reported lost, once', () => {
  const cv = fakeCanvas();
  const c = cv as unknown as HTMLCanvasElement;
  assert.equal(canvasLost(c, 'test'), false, 'fine at first');
  // (taken back and given back between two frames: never seen lost)
  cv.lost = true;
  cv.fire('contextlost');
  cv.lost = false;
  cv.fire('contextrestored');
  assert.equal(canvasLost(c, 'test'), true, 'given back empty: lost');
  assert.equal(canvasLost(c, 'test'), false, 'said once: the owner has baked it again');
});

test('a copy lost right now is reported lost', () => {
  const cv = fakeCanvas();
  const c = cv as unknown as HTMLCanvasElement;
  canvasLost(c, 'test');
  cv.lost = true;
  assert.equal(canvasLost(c, 'test'), true);
});
