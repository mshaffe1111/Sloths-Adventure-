/**
 * No camera jump on a turn (QA 2026-10-28, `camjump`: 55 in a day, 47 on Matt's 498 x 1034 upright phone, in back-and-forth pairs at
 * the same x, 21 of them in 1-6's "Twist: the swing frames"). Turning round on a stepping stone between two gaps swapped the landing the
 * view shows from one side to the other, and on a swing every swing back turned him round and swapped it again: the view moved 100-200
 * px in a frame. Now the landing's shift eases in and out, and on a swinging vine the view keeps looking the way he caught it.
 *
 * The real engine and its real camera (realPlay.ts, with updateCamera put back), on bare ledges in a stage 900 px tall.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import type { Platform, Vine } from './types.ts';

const FLOOR = 700;
/** the most the camera may move sideways in one 30 fps frame on a turn or a swing (px of world; the glitch watch calls 120 a jump) */
const STEP = 40;
const PHONES: Array<[number, number]> = [[498, 1034], [390, 844], [320, 782], [844, 390]];

function setup(w: number, h: number, plats: Array<Partial<Platform>>, vines: Array<Partial<Vine>> = []) {
  const r = new RealPlay('1-3', 1);
  const e = r.e;
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  r.bare(plats as Platform[], vines as Vine[]);
  e.enemies = [];
  e.currentStage.config = { ...e.currentStage.config, levelHeight: 900 };
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  return { r, e };
}

const ledge = (id: number, x: number, width: number): Partial<Platform> => ({ id, x, y: FLOOR, width, height: 200, type: 'solid' });

test('turning round on a stepping stone between two gaps eases the view across: no jump, upright or sideways', () => {
  for (const [w, h] of PHONES) {
    const { r, e } = setup(w, h, [ledge(1, 0, 1000), ledge(2, 1200, 160), ledge(3, 1560, 2000)]);
    r.stand(1280, FLOOR);
    for (let i = 0; i < 60; i++) r.frame();
    let last = e.camera.x;
    let most = 0;
    let moved = 0;
    for (let k = 0; k < 6; k++) {
      for (let i = 0; i < 45; i++) {
        r.frame(i < 2 ? (k % 2 ? { right: true } : { left: true }) : {});
        most = Math.max(most, Math.abs(e.camera.x - last));
        moved += Math.abs(e.camera.x - last);
        last = e.camera.x;
      }
    }
    assert.ok(moved > 100, `${w}x${h}: the view never looked across (moved ${Math.round(moved)} px in all)`);
    assert.ok(most <= STEP, `${w}x${h}: the view moved ${most.toFixed(1)} px in one frame on a turn`);
  }
});

test('pumping a swing (each swing back turns him round): the view holds steady, no jump', () => {
  for (const [w, h] of PHONES) {
    const vine: Partial<Vine> = { id: 9, x: 1300, topY: 300, bottomY: 650, vineType: 'swing_liana' };
    const { r, e } = setup(w, h, [ledge(1, 0, 1100), ledge(3, 1550, 2000)], [vine]);
    r.swing(vine as Vine, { angle: 0.9, omega: 0, len: 300 });
    for (let i = 0; i < 10; i++) r.frame();
    let last = e.camera.x;
    let most = 0;
    let flips = 0;
    let f = r.p.facing;
    for (let i = 0; i < 240; i++) {
      r.frame(r.p.vx > 0 ? { right: true } : { left: true });
      if (r.p.facing !== f) {
        flips++;
        f = r.p.facing;
      }
      most = Math.max(most, Math.abs(e.camera.x - last));
      last = e.camera.x;
    }
    assert.ok(r.p.isVineSwinging, 'still on the vine');
    assert.ok(flips >= 4, `${w}x${h}: he turned round only ${flips} times (the test proves nothing)`);
    assert.ok(most <= STEP * 0.75, `${w}x${h}: the view moved ${most.toFixed(1)} px in one frame on a swing`);
  }
});

test('turning round at the end of a ledge, the landing across the gap is still in view within half a second', () => {
  for (const [w, h] of PHONES) {
    const { r, e } = setup(w, h, [ledge(1, 0, 1000), ledge(3, 1240, 2000)]);
    r.stand(930, FLOOR);
    r.p.facing = -1;
    for (let i = 0; i < 60; i++) r.frame({ left: i < 1 });
    let seenAt = -1;
    for (let i = 0; i < 30; i++) {
      r.frame(i < 2 ? { right: true } : {});
      if (seenAt < 0 && e.camera.x + e.camera.viewportWidth >= 1240 + 20) seenAt = i;
    }
    assert.ok(seenAt >= 0 && seenAt <= 15, `${w}x${h}: the far ledge came into view after ${seenAt} frames`);
  }
});
