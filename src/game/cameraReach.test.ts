import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cameraReachBreaches } from './cameraReach.ts';

const stage = (extra: any[] = [], more: any = {}): any => ({
  config: { levelHeight: 1000 },
  platforms: [{ id: 1, x: 0, y: 700, width: 2000, height: 300, type: 'solid', style: 'moss_stone' }, ...extra],
  collectibles: [{ id: 1, type: 'flower', x: 500, y: 600 }],
  exitTotemX: 1800, exitTotemY: 700,
  proto: { dress: [{ n: 'w1Fern', x: 300, b: 700 }] },
  ...more,
});

test('a stage inside the camera reach has no breach', () => {
  assert.deepEqual(cameraReachBreaches(stage([{ id: 2, x: 900, y: 250, width: 200, height: 24, type: 'solid', style: 'log' }])), []);
});

test('a planted platform over the camera reach is caught, upright and sideways (Roll B: an end log at y -237)', () => {
  const b = cameraReachBreaches(stage([{ id: 2, x: 900, y: -237, width: 200, height: 24, type: 'solid', style: 'log' }]));
  assert.deepEqual(b.map((q) => `${q.what} ${q.view}`), ['platform 2 (log) upright', 'platform 2 (log) sideways']);
});

test('a platform he would stand on with his head under the HUD: 244 upright passes, 230 fails upright only', () => {
  const at = (y: number) => cameraReachBreaches(stage([{ id: 2, x: 900, y, width: 200, height: 24, type: 'solid', style: 'log' }])).map((q) => q.view);
  assert.deepEqual(at(244), []);
  assert.deepEqual(at(230), ['upright']);
});

test('the totem, a pickup and a dressing piece over the reach are caught, and a piece under the level foot', () => {
  const b = cameraReachBreaches(stage([{ id: 3, x: 100, y: 1040, width: 50, height: 24, type: 'solid' }], {
    exitTotemY: -9, collectibles: [{ id: 1, type: 'seed', x: 500, y: 60 }], proto: { mixDress: [{ n: 'bootprint', x: 1700, b: 100 }] },
  }));
  const whats = new Set(b.map((q) => q.what));
  assert.deepEqual([...whats].sort(), ['dressing bootprint', 'exit totem', 'pickup seed', 'platform 3 (solid)']);
});
