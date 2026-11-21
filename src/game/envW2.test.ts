/**
 * R-165.362 (ENV-W2): World 2's ground grows no code-drawn plants. Its kit's flat neon-green reed stems and teal sprouts (reedclump, nipa,
 * hyacinth, proproot, with driftwood and the nest mound) clashed with the painted reeds and props on every World 2 stage
 * (reference/qa-reports/BUILD-23/stills/w2-env-plants-ON-2-5.jpg vs -OFF-2-5.jpg); STAGE-RULES §4 keeps code-drawn shapes to small
 * touches. What World 2's kit may still stand on the ground is Matt's painted flora only (paintedScenery.ts drawGroundFlora). The other
 * worlds' kits are unchanged (the control below).
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENV, paintDecorAt, paintNearPlant } from './envKit.ts';
import { lookFor } from './scenery.ts';
import { rng } from './artKit.ts';

/** the kit names drawn from Matt's painted pictures, not as code-drawn paths (envKit.ts paintDecorAt) */
const PAINTED = new Set(['pflower', 'pplant']);

/** a drawing surface that counts the paths it is asked to fill or stroke (a painted picture is a drawImage, not counted) */
function pathCounter() {
  let n = 0;
  const paths = new Set(['fill', 'stroke', 'fillRect', 'strokeRect']);
  const props: Record<string | symbol, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineCap: 'butt', filter: 'none', imageSmoothingEnabled: true, font: '10px sans-serif' };
  const ctx = new Proxy(props, {
    get(t, k) {
      if (k === 'canvas') return { width: 390, height: 844 };
      if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
      if (k === 'measureText') return () => ({ width: 10 });
      if (k in t) return t[k];
      return (..._a: unknown[]) => { if (paths.has(String(k))) n++; };
    },
    set(t, k, v) { t[k] = v; return true; },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, count: () => n };
}

/** paths drawn by a world's kit over many ground-edge slots and near-layer plants */
function kitPaths(world: number): number {
  const look = lookFor(world);
  const { ctx, count } = pathCounter();
  for (let s = 1; s <= 300; s++) {
    const r = rng(s * 7919 + world);
    paintDecorAt(ctx, world, look, 400 + s, 700, r);
    paintNearPlant(ctx, world, look, 400 + s, 700, 60, r);
  }
  return count();
}

test("World 2's kit lists hold no code-drawn plant: only Matt's painted flora", () => {
  const kit = ENV[2];
  assert.ok(kit, 'World 2 keeps its kit (its sway and front edge)');
  const drawn = [...kit.near, ...kit.decor].map(([name]) => name).filter((name) => !PAINTED.has(name));
  assert.deepEqual(drawn, [], `World 2's kit still names code-drawn plants: ${drawn.join(', ')}`);
});

test("World 2's ground slots and near layer draw no code-drawn plant paths", () => {
  assert.equal(kitPaths(2), 0, "World 2's kit drew code-drawn plant paths");
});

test('the control: another world with a code-drawn kit still draws it (the counter counts; other worlds unchanged)', () => {
  assert.ok(kitPaths(6) > 0, "World 6's bog kit draws its paths");
});
