/**
 * The GPU layer (gpuLayer.ts, GPU-RENDERER-PLAN stage 0): the world container lands where the 2D canvas draws the world; the layer is
 * WebGL 2 or nothing (never WebGL 1, never a lost context); with no layer, the game's loop calls it harmlessly. The browser check of the
 * real layer (mount, camera, context loss and restore) is tools/qa/gpuLayer.cjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { drawGpuFrame, GL_ATTRS, gpuLive, gpuWorld, makeGl2, mountGpuLayer, resizeGpuLayer, worldPlace } from './gpuLayer.ts';

test('the world container goes where the 2D canvas puts the world: scale(zoom) then translate(t), so p lands at (p + t) * zoom', () => {
  const cam = { tx: -383.5, ty: 12.25, zoom: 1.1089 };
  const w = worldPlace(cam);
  for (const p of [{ x: 0, y: 0 }, { x: 400, y: 580 }, { x: -20, y: 1200 }]) {
    const screen2d = { x: (p.x + cam.tx) * cam.zoom, y: (p.y + cam.ty) * cam.zoom };
    const gpu = { x: p.x * w.s + w.x, y: p.y * w.s + w.y };
    assert.ok(Math.abs(gpu.x - screen2d.x) < 1e-9 && Math.abs(gpu.y - screen2d.y) < 1e-9, `world point ${JSON.stringify(p)}`);
  }
});

test('WebGL 2 or nothing: no webgl2 context, a lost one, or a throwing browser all mean no layer (never a WebGL 1 fallback)', () => {
  const cv = {} as HTMLCanvasElement;
  assert.equal(makeGl2(cv, () => null), null);
  assert.equal(makeGl2(cv, () => ({ isContextLost: () => true }) as unknown as WebGL2RenderingContext), null);
  assert.equal(makeGl2(cv, () => { throw new Error('blocked'); }), null);
  const gl = { isContextLost: () => false } as unknown as WebGL2RenderingContext;
  assert.equal(makeGl2(cv, () => gl), gl);
  // (asked for see-through, so the 2D canvas over it can let it show in later stages; no antialias for sprites)
  assert.equal(GL_ATTRS.alpha, true);
  assert.equal(GL_ATTRS.antialias, false);
});

test('without a layer (no WebGL 2, or not started) the loop and resizes call it harmlessly, and nothing is mounted', async () => {
  assert.doesNotThrow(() => drawGpuFrame(-10, 0, 1.2));
  assert.doesNotThrow(() => resizeGpuLayer(412, 915, 2));
  assert.equal(await mountGpuLayer(null), false);
  assert.equal(gpuLive(), false);
  assert.equal(gpuWorld(), null);
});

test('only the WebGL renderer is used: the layer never asks Pixi to auto-detect or for WebGPU', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('./gpuLayer.ts', import.meta.url), 'utf8');
  assert.ok(/new WebGLRenderer\(\)/.test(src), 'it makes a WebGLRenderer itself');
  assert.ok(!/autoDetectRenderer|WebGPURenderer|preference:\s*['"]webgpu/.test(src), 'and never auto-detects or asks for WebGPU');
  assert.ok(/getContext\('webgl2'/.test(src), 'its context is a webgl2 one it makes');
});
