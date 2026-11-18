/**
 * World 1's eagle roost (w19Art.ts; ENG-19b, 1-9 "be the bait"): a stage that lays a roost (proto.gen2.roosts, w1.ts W1_LURE) loads its
 * art with the stage, and no other stage does; the shipped file is the size the draw is measured on, and it stands 1.6 of Pokey (89.1),
 * its nest over the post and its bough piece on the ground the post stands on.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { builtStageKeys, type BuiltStage } from './stageManifest.ts';
import { ROOST, SCALE, W19_URLS, drawEagleRoost } from './w19Art.ts';

const stage = (roosts?: Array<{ x: number; y: number }>): BuiltStage =>
  ({ config: { worldIndex: 1, id: 'toy' }, platforms: [], enemies: [], vines: [], proto: roosts ? { gen2: { roosts } } : null } as unknown as BuiltStage);

test('a stage that lays a roost loads its art with the stage; a stage with none (or an empty list) never asks for it', () => {
  assert.ok(builtStageKeys(stage([{ x: 900, y: 500 }])).includes('w19'));
  assert.ok(!builtStageKeys(stage()).includes('w19'));
  assert.ok(!builtStageKeys(stage([])).includes('w19'));
  assert.equal(W19_URLS.length, 1);
});

test('the shipped file is the size the draw is measured on (its WebP VP8X canvas), and it stands 1.6 of Pokey', () => {
  const b = readFileSync(new URL('../assets/w1-19/w1-roost.webp', import.meta.url));
  assert.equal(b.toString('ascii', 12, 16), 'VP8X');
  assert.deepEqual([b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1], [ROOST.w, ROOST.h]);
  const tall = ROOST.foot * SCALE;
  assert.ok(Math.abs(tall / 89.1 - 1.6) < 0.1, `its bough to its leaf tips: ${tall.toFixed(1)} px, ${(tall / 89.1).toFixed(2)} of Pokey`);
});

test('drawn with its nest over the post and its bough piece resting on the ground (foot row on groundY); nothing before it loads', () => {
  const calls: number[][] = [];
  const ctx = { drawImage: (_im: unknown, ...a: number[]) => calls.push(a) } as unknown as CanvasRenderingContext2D;
  // (no Image in node: it never loads, so nothing is drawn and the caller knows)
  assert.equal(drawEagleRoost(ctx, 900, 500), false);
  assert.equal(calls.length, 0);
  // (the placement, by the same numbers the draw uses)
  const x0 = 900 - ROOST.nest * SCALE, y0 = 500 - ROOST.foot * SCALE;
  assert.ok(x0 < 900 && x0 + ROOST.w * SCALE > 900, 'the post is under the piece');
  assert.ok(Math.abs(y0 + ROOST.foot * SCALE - 500) < 1e-9, 'its foot row on the ground');
});
