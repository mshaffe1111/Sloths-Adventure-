/**
 * The ground's squares on the GPU (gpuGround.ts, R-3.3): the rules that keep it safe, read from the code and its one pure decision.
 * The look and the speed are proven in a browser: tools/qa/gpuGround.cjs and tools/perf/layerstick.mjs --ab.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GROUND_COPY_SLOW_MS, groundBegin, groundCheck, groundFlush, groundForget, groundGpuOff, groundTextures, groundWarming, slowCopy } from './gpuGround.ts';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = (f: string) => fs.readFileSync(path.join(here, f), 'utf8');

test('PLANTED: a slow copy (a readback) sends the ground back to the 2D canvas; a quick one, or one slow first frame, does not', () => {
  assert.equal(slowCopy([9, 9, 9, 9]), null, 'too few timings: no verdict yet');
  assert.equal(slowCopy([0.2, 0.3, 0.2, 0.4, 0.3]), null);
  assert.equal(slowCopy([30, 0.2, 0.3, 0.2, 0.3]), null, 'one slow first copy is not a readback');
  assert.equal(slowCopy([9, 8, 12, 9, 10]), 9);
  assert.equal(slowCopy([GROUND_COPY_SLOW_MS, GROUND_COPY_SLOW_MS, 1, 1, GROUND_COPY_SLOW_MS]), null, 'at the limit is not over it');
});

test('with no layer running (no browser, no WebGL 2) nothing is taken: the squares stay on the 2D canvas', () => {
  const target = { width: 800, height: 1760, parentElement: {} } as unknown as HTMLCanvasElement;
  assert.equal(groundBegin(target), false);
  assert.equal(groundFlush({} as CanvasRenderingContext2D), false);
  assert.equal(groundWarming(), false);
  assert.equal(groundGpuOff(), '');
  assert.equal(groundTextures(), 0);
  groundForget(null);
  groundForget({} as HTMLCanvasElement);
});

test('the check switches start off: a player gets the GPU path wherever it runs, and no forced path', () => {
  assert.deepEqual(groundCheck, { force2d: false, keepGpu: false });
});

test('gpuGround.ts never loads Pixi itself: only its types, and the classes the layer hands it', () => {
  const s = src('gpuGround.ts');
  assert.match(s, /import type \{[^}]+\} from 'pixi\.js';/);
  assert.equal([...s.matchAll(/from 'pixi\.js'/g)].length, 1);
  assert.ok(!/import\(['"]/.test(s), 'no dynamic import here: gpuLayer.ts mounts the layer');
});

test('protoArt.ts keeps the 2D stamps as the fallback on every frame the GPU cannot take', () => {
  const s = src('protoArt.ts');
  const a = s.indexOf('function drawGroundChunks(');
  const body = s.slice(a, s.indexOf('\n}\n', a));
  // (the GPU branch returns only on a flush that worked; the 2D stamps follow it, unconditionally)
  assert.match(body, /if \(groundBegin\(ctx\.canvas\)\) \{[\s\S]*?groundPush\(cv, pad, pad, px, px, m\.e \+ cx \* CHUNK \* scale, m\.f \+ cy \* CHUNK \* scale, px, px\);[\s\S]*?if \(groundFlush\(ctx\)\) return true;\s*\}\s*for \(let cy = cy0;[\s\S]*?ctx\.drawImage\(cv, pad, pad, px, px, cx \* CHUNK, cy \* CHUNK, CHUNK, CHUNK\);/);
  // (a square let go, or painted again, lets its texture go)
  assert.match(s, /const freeTile = [\s\S]{0,160}groundForget\(cv\);/);
  assert.match(body, /else groundForget\(c\.tiles\.get\(k\) \?\? null\);/);
});

test('the copy leaves the caller\'s clip, alpha and blend alone: it resets the transform only', () => {
  const s = src('gpuGround.ts');
  const a = s.indexOf('export function groundFlush(');
  const body = s.slice(a, s.indexOf('\n}\n', a));
  assert.match(body, /ctx\.save\(\);[\s\S]*?ctx\.setTransform\(1, 0, 0, 1, 0, 0\);\s*ctx\.drawImage\(cv, 0, 0\);\s*ctx\.restore\(\);/);
  assert.ok(!/globalAlpha|globalCompositeOperation/.test(body));
});

test('stageReady.ts starts the layer under the title card and never waits past the deadline for it', () => {
  const s = src('stageReady.ts');
  assert.match(s, /const gpu = mountGpuLayer\(\);/);
  assert.match(s, /await Promise\.race\(\[gpu, sleep\(Math\.max\(0, left\(\)\)\)\]\);/);
  assert.match(s, /for \(let i = 0; i < GROUND_WARM_FRAMES && left\(\) > 0 && groundWarming\(\); i\+\+\) frame\(\);/);
});
