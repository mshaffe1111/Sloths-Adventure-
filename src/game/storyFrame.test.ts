import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capStoryZoom, liftForFeet, MAX_CEL_MAG } from './storyFrame.ts';
import { CEL_K } from './storyCels.ts';

test('a story close-up never draws a figure above 1.5x its cel, and never zooms out past the framing (ST-1)', () => {
  // upright on a phone: the picture is 390 css wide at dpr 2 over 960 scene units: about 0.81 device px a unit
  const up = 0.81;
  const z = capStoryZoom(1.5, up);
  assert.ok(z < 1.5 && z >= 1, `capped to ${z}`);
  assert.ok(up * CEL_K * z <= MAX_CEL_MAG + 1e-9);
  // sideways the picture is 390 css tall at dpr 2 over 540 units: already past the cap at 1, so the plain framing holds
  assert.equal(capStoryZoom(1.35, (390 * 2) / 540), 1);
  // a wide shot is left alone
  assert.equal(capStoryZoom(1, up), 1);
});

test('the picture is raised until the ground is clear of the words box (ST-1)', () => {
  // ground at 0.86 of a 540-unit view, box top at 0.66: raised 0.2
  assert.ok(Math.abs(liftForFeet(0.86 * 540, 540, 0.66, 0.09) - 0.2) < 1e-9);
  // already clear: the usual lift stays
  assert.equal(liftForFeet(0.5 * 540, 540, 0.66, 0.09), 0.09);
  // never more than a third
  assert.equal(liftForFeet(540, 540, 0.5, 0), 0.32);
});

// R-1.1 (2026-11-02): a beaten guardian on a defeat card must lie clear of the words box, upright and in a close sideways shot
import { clearOfBox } from './storyFrame.ts';
test('a beaten guardian whose bottom would sit under the words box is raised just clear of it; nothing else moves', () => {
  const h = 540, ground = 0.86, z = 1.2, vh = 540, lift = 0;
  const fy = 0.62 * h;
  const boss: { kind: string; beaten?: boolean; scale?: number; x: number; y?: number; seq?: string[] } = { kind: 'boss', beaten: true, scale: 1, x: 0.72 };
  // the box's top at 60% of the view: the boss's feet line is far under it
  const up = clearOfBox(boss, ground, h, fy, z, vh, lift, 0.6);
  const visible = fy + ((0.6 + lift) * vh - vh / 2) / z;
  const bottom = (up.y ?? ground) * h + 5 + (0.62 * 24 + 6) * 3;
  assert.ok(up.y !== undefined && up.y < ground, 'raised');
  assert.ok(Math.abs(bottom - visible) < 0.01, 'its bottom sits on the box line');
  // the box low enough: untouched
  assert.equal(clearOfBox(boss, ground, h, fy, z, vh, lift, 1.4), boss);
  // not beaten, a performance (seq), Pokey: untouched
  const calm = { ...boss, beaten: false };
  assert.equal(clearOfBox(calm, ground, h, fy, z, vh, lift, 0.6), calm);
  const perf = { ...boss, seq: ['x'] };
  assert.equal(clearOfBox(perf, ground, h, fy, z, vh, lift, 0.6), perf);
  const pokey = { kind: 'milo', beaten: true };
  assert.equal(clearOfBox(pokey, ground, h, fy, z, vh, lift, 0.6), pokey);
});
