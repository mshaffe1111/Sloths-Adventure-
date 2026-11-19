// FIX-284 (R-165.284): the pond's hop numbers are the hops a thumb makes. rideLay PAD_HOP is flown here on the real engine at 30 fps through
// the game's own InputEngine (RealPlay.useRealInput: the touch layer's press with its minimum hold, or the Pad button's PAD_HOP_MS), press to
// landing, and must match to the frame (and the pixel). 2-2 was sized on FakeInput's one-frame press (0.30 s / 83 px / 30 px up): no control
// makes that hop, and this test is red on it.
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../realPlay.ts';
import { PAD_HOP_MS } from '../padControl.ts';
import type { Platform } from '../types.ts';
import { PAD_HOP } from './rideLay.ts';

const FLOOR = 400;
/** a bare flat floor, a press of the given control at a full run, held `holdFrames` (1: let go at once, as a flick or a tap does) */
function fly(input: 'touch' | 'pad', holdFrames: number): { frames: number; along: number; up: number } {
  const r = new RealPlay('1-3', 1);
  r.bare([{ id: 1, x: 0, y: FLOOR, width: 20000, height: 200, type: 'solid' } as Platform]);
  r.stand(600, FLOOR);
  r.useRealInput(input === 'pad' ? PAD_HOP_MS : undefined);
  for (let i = 0; i < 10; i++) r.frame();
  for (let i = 0; i < 40; i++) r.frame({ right: true });
  const x0 = r.p.x;
  let f = 1, top = r.p.y, left = false;
  r.frame({ press: true, jump: holdFrames > 1, right: true });
  for (; f < 120; f++) {
    if (!r.p.grounded) left = true;
    else if (left) break;
    r.frame({ jump: f < holdFrames, right: true });
    top = Math.min(top, r.p.y);
  }
  return { frames: f, along: Math.round(r.p.x - x0), up: Math.round(FLOOR - top) };
}
/** px/s along six hops at a run, each pressed the frame he lands */
function chain(input: 'touch' | 'pad'): number {
  const r = new RealPlay('1-3', 1);
  r.bare([{ id: 1, x: 0, y: FLOOR, width: 20000, height: 200, type: 'solid' } as Platform]);
  r.stand(600, FLOOR);
  r.useRealInput(input === 'pad' ? PAD_HOP_MS : undefined);
  for (let i = 0; i < 10; i++) r.frame();
  for (let i = 0; i < 40; i++) r.frame({ right: true });
  const x0 = r.p.x;
  let f = 1, hops = 0, air = false;
  r.frame({ press: true, right: true });
  while (hops < 6 && f < 600) {
    if (air && r.p.grounded) { hops++; air = false; if (hops === 6) break; r.frame({ press: true, right: true }); f++; continue; }
    if (!r.p.grounded) air = true;
    r.frame({ right: true }); f++;
  }
  return Math.round((r.p.x - x0) / (f / 30));
}

test('PAD_HOP is the hop each control makes, flown through InputEngine, to the frame', () => {
  assert.deepEqual(fly('touch', 1), PAD_HOP.touch, 'a touch flick (MIN_TOUCH_JUMP_HOLD_MS: a full jump by design)');
  assert.deepEqual(fly('pad', 1), PAD_HOP.pad, "a tap of the Pad's Jump button (PAD_HOP_MS)");
  assert.deepEqual(fly('touch', 30), PAD_HOP.held, 'a jump held to its top, touch');
  assert.deepEqual(fly('pad', 30), PAD_HOP.held, 'a jump held to its top, the Pad');
  assert.equal(chain('touch'), PAD_HOP.chain, 'a chain of flicks');
  assert.equal(chain('pad'), PAD_HOP.chain, 'a chain of Pad taps');
});

test('on touch there is no short hop: a flick flies a full jump, so a pond never asks a touch player for less', () => {
  // (inputEngine.ts MIN_TOUCH_JUMP_HOLD_MS: "a flick must give a full one". The shortest hop any player makes is the Pad button's)
  assert.ok(PAD_HOP.touch.up >= PAD_HOP.held.up - 2, `a flick rises ${PAD_HOP.touch.up} px, a held jump ${PAD_HOP.held.up}`);
  assert.ok(PAD_HOP.pad.frames < PAD_HOP.touch.frames);
});
