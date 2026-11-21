/**
 * The edge marker (R-165.372, UI-372): a little one spooked back off the screen gets an arrow at the screen's edge on its side, at its
 * height, with its face; none while it is on the screen, following, rejoined or home. Planted: on 66775dabf the engine has no marker at
 * all for an off-screen spooked one (RED); GREEN after.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, RealPlay } from './realPlay.ts';
import { CLEAR_BOTTOM, CLEAR_TOP, drawEdgeMarks, edgeMarks, MARK_R, type EdgeMark, type MarkView } from './edgeMarker.ts';
import type { Follower } from './follow.ts';
import { W2_FRAMES } from './w2PropsData.ts';

const one = (o: Partial<Follower>): Follower => ({ kind: 'otter', s: 0, x: 1000, y: 600, moved: false, state: 'follow', facing: 1, ...o }) as Follower;
const view = (o: Partial<MarkView> = {}): MarkView => ({ camX: 1000, camY: 0, vw: 400, vh: 900, zoom: 1, w: 400, h: 900, ins: { top: 0, right: 0, bottom: 0, left: 0 }, ...o });

test('the real engine marks a little one spooked back off the screen, on its side; none on the screen, following or home (planted)', () => {
  const r = new RealPlay('2-3', 1);
  const e = r.e as never as Record<string, any>;
  // (the stage's own first three cages freed, as a burst does, and the line given a moment)
  const cages = (e.collectibles as Array<{ type: string; x: number; collected: boolean }>).filter((c) => c.type === 'cage').sort((a, b) => a.x - b.x).slice(0, 3);
  for (const c of cages) { e.freeCritter(c); c.collected = true; }
  for (let i = 0; i < 60; i++) e.update(DT);
  assert.ok(e.follow?.line.length >= 3, 'three little ones in the line');
  // (planted: before UI-372 the engine has no spookMarks, so an off-screen spooked one has no marker: RED)
  assert.equal(typeof e.spookMarks, 'function', 'the engine places edge marks');
  const f = e.follow.line[1] as Follower;
  const cam = e.camera as { x: number; viewportWidth: number };
  f.state = 'spooked';
  f.back = true;
  f.x = cam.x - 330;
  let m = e.spookMarks() as { n: number; marks: EdgeMark[] };
  assert.equal(m.n, 1, 'off the left edge: one marker');
  assert.equal(m.marks[0].side, -1);
  assert.equal(m.marks[0].kind, f.kind, 'its own face');
  f.x = cam.x + cam.viewportWidth + 330;
  m = e.spookMarks();
  assert.equal(m.n, 1, 'off the right edge: one marker');
  assert.equal(m.marks[0].side, 1);
  f.x = cam.x + cam.viewportWidth / 2;
  assert.equal(e.spookMarks().n, 0, 'on the screen: none');
  f.x = cam.x - 330;
  f.state = 'follow';
  assert.equal(e.spookMarks().n, 0, 'rejoined, off the screen: none');
  f.state = 'home';
  assert.equal(e.spookMarks().n, 0, 'home: none');
});

test('the draw: one face cut from the sheet per mark, its Sad painting; nothing drawn for none', () => {
  const blits: number[][] = [];
  const slow: string[] = [];
  const ctx = new Proxy({}, {
    get: (_t, k) => (k === 'drawImage' ? (...a: number[]) => void blits.push(a.slice(1)) : String(k).startsWith('create') ? (slow.push(String(k)), () => ({ addColorStop() {} })) : () => {}),
    set: (_t, k, v) => ((k === 'shadowBlur' && v) || (k === 'filter' && v !== 'none') ? slow.push(String(k)) : 0, true),
  }) as never as CanvasRenderingContext2D;
  const out: EdgeMark[] = [];
  const n = edgeMarks([one({ state: 'spooked', x: 500 }), one({ kind: 'capy', state: 'spooked', x: 2000 })], view(), out);
  drawEdgeMarks(ctx, {} as CanvasImageSource, W2_FRAMES, out, n, 0, false);
  assert.equal(blits.length, 2, 'one face each');
  assert.deepEqual(blits[0].slice(0, 4), [W2_FRAMES.otterSad.x, W2_FRAMES.otterSad.y, W2_FRAMES.otterSad.w, W2_FRAMES.otterSad.h], "the otter's worried face");
  assert.deepEqual(blits[1].slice(0, 4), [W2_FRAMES.capySad.x, W2_FRAMES.capySad.y, W2_FRAMES.capySad.w, W2_FRAMES.capySad.h]);
  drawEdgeMarks(ctx, {} as CanvasImageSource, W2_FRAMES, out, 0, 0, false);
  assert.equal(blits.length, 2, 'none: nothing drawn');
  assert.deepEqual(slow, [], 'no shadowBlur, filter or gradient in a frame (PERFORMANCE-RULES §1)');
});

test('the mark sits at its height, clamped clear of the HUD and the pad, inside the insets, and two on one side never overlap', () => {
  const out: EdgeMark[] = [];
  const ins = { top: 30, right: 12, bottom: 20, left: 40 };
  // at its height (its body's middle, 30 px over its feet)
  assert.equal(edgeMarks([one({ state: 'spooked', x: 500, y: 600 })], view(), out), 1);
  assert.equal(out[0].y, 570);
  // high up: under the HUD's band and the inset; low down: over the pad's
  edgeMarks([one({ state: 'spooked', x: 500, y: 20 })], view({ ins }), out);
  assert.equal(out[0].y, ins.top + CLEAR_TOP + MARK_R);
  edgeMarks([one({ state: 'spooked', x: 500, y: 2000 })], view({ ins }), out);
  assert.equal(out[0].y, 900 - ins.bottom - CLEAR_BOTTOM - MARK_R);
  // inside the side insets (the whole arrow on the screen)
  edgeMarks([one({ state: 'spooked', x: 500 })], view({ ins }), out);
  assert.ok(out[0].x - MARK_R - 13 >= ins.left, 'left arrow inside the inset');
  edgeMarks([one({ state: 'spooked', x: 2000 })], view({ ins }), out);
  assert.ok(out[0].x + MARK_R + 13 <= 400 - ins.right, 'right arrow inside the inset');
  // two on the left at the same height: stacked apart
  const n = edgeMarks([one({ state: 'spooked', x: 500 }), one({ kind: 'duck', state: 'spooked', x: 600 })], view(), out);
  assert.equal(n, 2);
  assert.ok(Math.abs(out[0].y - out[1].y) >= 2 * MARK_R, 'stacked, not overlapping');
  // the array is reused: no new marks made for the same count
  const first = out[0];
  edgeMarks([one({ state: 'spooked', x: 500 })], view(), out);
  assert.equal(out[0], first, 'reused, not reallocated');
  // a sliver still on the screen counts as on it
  assert.equal(edgeMarks([one({ state: 'spooked', x: 990 })], view(), out), 0, 'half on the screen: none');
});
