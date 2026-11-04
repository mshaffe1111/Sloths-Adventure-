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

test('stage 1 backdrop: with no layer it stays on the 2D canvas and says why; no readout or gpuback=0 for a player', async () => {
  const m = await import('./gpuLayer.ts');
  assert.equal(m.backdropGpuReady(), false, 'no layer: no GPU backdrop');
  assert.equal(m.backdropLine(), 'backdrop: 2D (no WebGL 2 layer)');
  // (not a QA build here: no import.meta.env from Vite, as on the live site and in the app)
  assert.equal(m.backdropReadout(), false, 'no readout outside a QA build');
  assert.equal(m.backdropCheck.force2d, false, 'and the address cannot switch the backdrop outside a QA build');
  assert.equal(m.backdropFlush({} as CanvasRenderingContext2D), false, 'nothing begun: nothing copied');
  assert.doesNotThrow(() => m.backdropIdle());
  assert.equal(m.COPY_SLOW_MS, 2);
});

test('stage 1 backdrop: the 2D canvas is never made see-through (every glow and blend after the copy needs real pixels under it)', async () => {
  const fs = await import('node:fs');
  const eng = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  for (const m of eng.matchAll(/getContext\('2d',\s*([^)]*)\)/g)) assert.ok(!/alpha:\s*true/.test(m[1]), `engine.ts game canvas context: ${m[1]}`);
  assert.ok(/alpha: false/.test(eng), 'the game canvas stays opaque (alpha: false)');
});

test('the measurement switch: players never start the GPU layer; only a QA build or the testers\' link (#ctest) does, never the app', async () => {
  const m = await import('./gpuLayer.ts');
  const pr = await import('./playRecorder.ts');
  const g = globalThis as { location?: unknown; document?: unknown };
  const had = { location: g.location, document: g.document };
  try {
    // (a player on the live site: no #ctest, not a QA build)
    g.location = { hash: '', search: '' };
    g.document = {};
    assert.equal(m.gpuBackdropOn(), false, 'off for a player');
    let asked = 0;
    const cv = { getContext: () => { asked++; return null; } } as unknown as HTMLCanvasElement;
    assert.equal(await m.mountGpuLayer(cv), false, 'and the layer is not started');
    assert.equal(asked, 0, 'not even a WebGL context is asked for');
    assert.equal(m.backdropReadout(), false, 'no readout for a player');
    // (the testers' link)
    g.location = { hash: '#ctest&gpuback=0', search: '' };
    assert.equal(m.gpuBackdropOn(), true, 'on with #ctest');
    assert.equal(m.backdropReadout(), true, 'with its readout');
    g.location = { hash: '', search: '' };
    pr.asQaBuildForTest(true);
    assert.equal(m.gpuBackdropOn(), true, 'on in a QA build');
  } finally {
    pr.asQaBuildForTest(false);
    g.location = had.location;
    g.document = had.document;
  }
  const fs = await import('node:fs');
  // (the app: ctestEnabled is false in the store build, and qaBuild is never set there)
  const rec = fs.readFileSync(new URL('./playRecorder.ts', import.meta.url), 'utf8');
  assert.ok(/export function ctestEnabled\(\): boolean \{\s*if \(STORE\) return false;/.test(rec), 'the store build never has the control test');
  // (the switch is the first thing the start-up checks, and nothing else starts the layer)
  const src = fs.readFileSync(new URL('./gpuLayer.ts', import.meta.url), 'utf8');
  assert.ok(/export function mountGpuLayer[^{]*\{\s*if \(live\) return Promise\.resolve\(true\);\s*\/\/[^\n]*\n\s*if \(!gpuBackdropOn\(\)\) return Promise\.resolve\(false\);/.test(src), 'mountGpuLayer checks the switch first');
  for (const f of fs.readdirSync(new URL('.', import.meta.url))) {
    if (!/\.tsx?$/.test(f) || /\.test\.ts$/.test(f) || f === 'gpuLayer.ts') continue;
    const s = fs.readFileSync(new URL(`./${f}`, import.meta.url), 'utf8');
    if (/new WebGLRenderer|getContext\('webgl2'/.test(s)) assert.fail(`${f} makes a WebGL layer of its own`);
  }
});
