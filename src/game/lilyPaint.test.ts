/**
 * A lily pad is always Matt's painted pad, in any world that lays one (the mixer's 1-5 in World 1): never terrain.ts's code-drawn island
 * or grey slab (drawcheck: three gradients a pad a frame at 1-5's n4 fork; Matt's stills 01, 07, 09: "a grey slab floating over the pond")
 *   npx tsx --test src/game/lilyPaint.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

test("a World 1 stage that lays lily pads paints them as World 2's painted pads; one with none does not ask for the river art", () => {
  const r = new RealPlay('1-4', 1);
  const e = r.e as unknown as { paintedRivers(w: number): boolean; currentStage: { config: { worldIndex: number } } };
  assert.equal(e.currentStage.config.worldIndex, 1);
  r.bare([{ id: 1, x: 0, y: 900, width: 2000, height: 120, type: 'solid', style: 'moss_stone' } as Platform]);
  assert.equal(e.paintedRivers(1), false, 'no pads: no river art');
  r.bare([
    { id: 1, x: 0, y: 900, width: 600, height: 120, type: 'solid', style: 'moss_stone' } as Platform,
    { id: 2, x: 700, y: 960, width: 100, height: 12, type: 'solid', lily: true } as Platform,
  ]);
  assert.equal(e.paintedRivers(1), true, 'a pad in World 1 is the painted pad');
});
