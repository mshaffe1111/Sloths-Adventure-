/**
 * The GPU layer (gpuLayer.ts, GPU-RENDERER-PLAN stage 0, R-3.1): the world container lands where the 2D canvas draws the world; the
 * layer is WebGL 2 or nothing (never WebGL 1, never a lost context); with no layer, the game's loop calls it harmlessly; a lost context
 * comes back once or the session goes on with the 2D canvas alone. The browser check of the real layer (mount, camera, context loss and
 * restore, no WebGL 2, never restored) is tools/qa/gpuLayer.cjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  drawGpuFrame, FALLBACK, GL_ATTRS, gpuCanvas, gpuFallback, gpuLive, gpuPixi, gpuWorld, lossStep, makeGl2, MAX_RESTORES, mountGpuLayer, onGpuChange,
  resizeGpuLayer, RESTORE_WAIT_MS, worldPlace, type LossState,
} from './gpuLayer.ts';

test('the world container goes where the 2D canvas puts the world: scale(zoom) then translate(t), so p lands at (p + t) * zoom', () => {
  const cam = { tx: -383.5, ty: 12.25, zoom: 1.1089 };
  const w = worldPlace(cam);
  for (const p of [{ x: 0, y: 0 }, { x: 400, y: 580 }, { x: -20, y: 1200 }]) {
    const screen2d = { x: (p.x + cam.tx) * cam.zoom, y: (p.y + cam.ty) * cam.zoom };
    const gpu = { x: p.x * w.s + w.x, y: p.y * w.s + w.y };
    assert.ok(Math.abs(gpu.x - screen2d.x) < 1e-9 && Math.abs(gpu.y - screen2d.y) < 1e-9, `world point ${JSON.stringify(p)}`);
  }
  // planted: translate-then-scale (the wrong order) misses by t * (zoom - 1)
  const wrong = { x: 400 * cam.zoom + cam.tx, y: 580 * cam.zoom + cam.ty };
  assert.ok(Math.abs(wrong.x - (400 + cam.tx) * cam.zoom) > 1, 'the planted wrong order is told apart');
});

test('WebGL 2 or nothing: no webgl2 context, a lost one, or a throwing browser all mean no layer (never a WebGL 1 fallback)', () => {
  const cv = {} as HTMLCanvasElement;
  assert.equal(makeGl2(cv, () => null), null);
  assert.equal(makeGl2(cv, () => ({ isContextLost: () => true }) as unknown as WebGL2RenderingContext), null);
  assert.equal(makeGl2(cv, () => { throw new Error('blocked'); }), null);
  const gl = { isContextLost: () => false } as unknown as WebGL2RenderingContext;
  assert.equal(makeGl2(cv, () => gl), gl);
  // (it asks the canvas for 'webgl2' and nothing else: a canvas that only has WebGL 1 gives null)
  const asked: string[] = [];
  const only1 = { getContext: (kind: string) => { asked.push(kind); return kind === 'webgl' || kind === 'experimental-webgl' ? gl : null; } } as unknown as HTMLCanvasElement;
  assert.equal(makeGl2(only1), null);
  assert.deepEqual(asked, ['webgl2']);
  // (asked for see-through: what it draws is copied over other pixels, or shows under the 2D canvas; no antialias for sprites)
  assert.equal(GL_ATTRS.alpha, true);
  assert.equal(GL_ATTRS.antialias, false);
  assert.equal(GL_ATTRS.preserveDrawingBuffer, false);
});

test('without a layer (not started) the loop and resizes call it harmlessly, nothing is mounted, and it is not a fallback yet', async () => {
  assert.doesNotThrow(() => drawGpuFrame(-10, 0, 1.2));
  assert.doesNotThrow(() => resizeGpuLayer(412, 915, 2));
  assert.equal(await mountGpuLayer(null), false);
  assert.equal(gpuLive(), false);
  assert.equal(gpuWorld(), null);
  assert.equal(gpuPixi(), null);
  assert.equal(gpuCanvas(), null);
  assert.equal(gpuFallback(), '', 'no canvas yet is not a reason to give up for the session');
  const off = onGpuChange(() => assert.fail('nothing happened to the layer'));
  drawGpuFrame(0, 0, 1);
  off();
});

test('a lost context: stand down, come back once; not given back in time, or lost again, the session goes on without the layer', () => {
  const s0: LossState = { lost: false, losses: 0, restores: 0, fallback: '' };
  // lost, then given back: running again, no fallback
  const lost = lossStep(s0, 'lost');
  assert.deepEqual(lost, { lost: true, losses: 1, restores: 0, fallback: '' });
  const back = lossStep(lost, 'restored');
  assert.deepEqual(back, { lost: false, losses: 1, restores: 1, fallback: '' });
  // (the wait's timer firing after it came back changes nothing)
  assert.equal(lossStep(back, 'timeout'), back);
  // lost and still lost when the wait ends: off for the session
  assert.equal(lossStep(lost, 'timeout').fallback, FALLBACK.notRestored);
  // lost again after coming back MAX_RESTORES times: off for the session, at once
  let s = s0;
  for (let i = 0; i < MAX_RESTORES; i++) s = lossStep(lossStep(s, 'lost'), 'restored');
  assert.equal(s.fallback, '');
  s = lossStep(s, 'lost');
  assert.equal(s.fallback, FALLBACK.lostAgain);
  // once off, nothing turns it back on (planted: a late 'restored' used to be able to)
  const after = lossStep(s, 'restored');
  assert.equal(after, s);
  assert.equal(after.fallback, FALLBACK.lostAgain);
  // a repeated 'lost' for the same loss is one loss; a 'restored' with nothing lost is nothing
  assert.equal(lossStep(lost, 'lost'), lost);
  assert.equal(lossStep(s0, 'restored'), s0);
  assert.ok(RESTORE_WAIT_MS >= 2000 && RESTORE_WAIT_MS <= 10000, 'a few seconds');
  assert.equal(new Set(Object.values(FALLBACK)).size, 4, 'four reasons, each its own words');
});

test('only the WebGL renderer is used: the layer never asks Pixi to auto-detect or for WebGPU, and Pixi is only ever loaded late', () => {
  const src = fs.readFileSync(new URL('./gpuLayer.ts', import.meta.url), 'utf8');
  assert.ok(/new pixi\.WebGLRenderer\(\)/.test(src), 'it makes a WebGLRenderer itself');
  const bad = /autoDetectRenderer|WebGPURenderer|preference:\s*['"]webgpu|getContext\('webgl'\)|experimental-webgl/;
  assert.ok(!bad.test(src), 'and never auto-detects, asks for WebGPU or takes WebGL 1');
  assert.ok(/getContext\('webgl2'/.test(src), 'its context is a webgl2 one it makes');
  const pixi = fs.readFileSync(new URL('./gpuPixi.ts', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!bad.test(pixi) && !/\bApplication\b/.test(pixi), 'gpuPixi.ts names only the WebGL side');
  // planted: the scan sees each thing it forbids
  for (const planted of ["await autoDetectRenderer({})", 'new WebGPURenderer()', "preference: 'webgpu'", "cv.getContext('webgl')"]) assert.ok(bad.test(planted), planted);
  // Pixi's code is reached from one place only, by import(): no module of the game imports 'pixi.js' or gpuPixi.ts plainly
  const dir = new URL('.', import.meta.url);
  for (const f of fs.readdirSync(dir)) {
    if (!/\.tsx?$/.test(f) || /\.test\.ts$/.test(f)) continue;
    const s = fs.readFileSync(new URL(`./${f}`, dir), 'utf8');
    for (const m of s.matchAll(/^\s*(?:import|export)\s+(type\s+)?[^'";]*?from\s*['"]([^'"]+)['"]/gm)) {
      if (m[2] === 'pixi.js' && !m[1] && f !== 'gpuPixi.ts') assert.fail(`${f} imports pixi.js itself (only gpuPixi.ts may, and only type imports elsewhere)`);
      if (/gpuPixi(\.ts)?$/.test(m[2])) assert.fail(`${f} imports gpuPixi.ts plainly: it must be import() so Pixi stays a late file`);
    }
    if (f !== 'gpuLayer.ts' && /new WebGLRenderer|getContext\('webgl2'/.test(s)) assert.fail(`${f} makes a WebGL layer of its own`);
  }
  assert.ok(/await import\('\.\/gpuPixi\.ts'\)/.test(src), 'gpuLayer.ts loads it with import()');
});

test('the 2D canvas is never made see-through (every glow and blend drawn over the layer needs real pixels under it)', () => {
  const eng = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  for (const m of eng.matchAll(/getContext\('2d',\s*([^)]*)\)/g)) assert.ok(!/alpha:\s*true/.test(m[1]), `engine.ts game canvas context: ${m[1]}`);
  // (the game canvas's settings live in one place, gameCanvas.ts, shared by every first getContext on it: opaque both ways)
  assert.ok(/canvas\.getContext\('2d', gameCtxOpts\(\)\)/.test(eng), 'the engine asks for the shared settings');
  const opts = fs.readFileSync(new URL('./gameCanvas.ts', import.meta.url), 'utf8');
  assert.ok(/\? \{ alpha: false, willReadFrequently: false \} : \{ alpha: false \}/.test(opts) && !/alpha:\s*true/.test(opts), 'the game canvas stays opaque (alpha: false)');
});

test('the loop drives the layer: one call right after the 2D frame, with the 2D canvas own camera translate; resizes pass through', () => {
  const eng = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  assert.ok(/this\.render\(\);\s*\/\/[^\n]*\n\s*drawGpuFrame\(this\.gpuTx, this\.gpuTy, this\.zoom\);/.test(eng), 'drawGpuFrame follows render() in the loop');
  assert.equal([...eng.matchAll(/drawGpuFrame\(/g)].length, 1, 'once a frame, from one place');
  assert.ok(/this\.gpuTx = -snapCam\(this\.camera\.x, snap\) \+ shakeX;\s*this\.gpuTy = -snapCam\(this\.camera\.y, snap\) \+ shakeY;\s*ctx\.translate\(this\.gpuTx, this\.gpuTy\);/.test(eng), 'the very translate the 2D canvas uses');
  assert.ok(/resizeGpuLayer\(w, h, dpr\);/.test(eng), 'resizeCanvas hands the layer its size');
});
