// PROOF-1 defect test (fails on d0276817 AND on 0.9.6 585ef376: pre-existing): World 4's rock burst throws in a drop's first cycle.
// w4Grit.ts sinceWarn's idle branch returns `cycle - 1`, so in the first 0.25 s of cycle 0 the shatter burst indexes W4_PEBBLES[-1]
// (w4Grit.ts:285) and piece() reads `.w` of undefined (w4Grit.ts:50): the frame's draw throws ('frame error' in the live 4-1 runs).
// Calls the REAL drawRockFx on 4-1's real drops (realPlay.ts builds the stage), with pictures that "load" at once and a canvas that
// records nothing.   npx tsx --test reference/qa-reports/PROOF-1/runtime/w4RockBurst.test.ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
const g = globalThis as any;
// (a picture that loads the moment its src is set, and decodes at once: the sheets' code paths run as on a phone after loading)
g.Image = class { onload: null | (() => void) = null; onerror: null | (() => void) = null; width = 4096; height = 4096; naturalWidth = 4096; naturalHeight = 4096; complete = true; decode() { return Promise.resolve(); } set src(_v: string) { queueMicrotask(() => this.onload?.()); } };
const { RealPlay } = await import('../../../../src/game/realPlay.ts');
const { drawRockFx, w4GritReady } = await import('../../../../src/game/w4Grit.ts');
const { w4ArtReady } = await import('../../../../src/game/w4Art.ts');
const ctx = new Proxy({}, { get: (_t, k) => (k === 'canvas' ? { width: 400, height: 800 } : k === 'globalAlpha' ? 1 : () => ({ addColorStop() {} })), set: () => true }) as unknown as CanvasRenderingContext2D;
test("4-1: drawing every drop's rock effects never throws through the first cycles", async () => {
  w4GritReady(); w4ArtReady();
  for (let i = 0; i < 20 && !(w4GritReady() && w4ArtReady()); i++) await new Promise((r) => setTimeout(r, 5));
  assert.ok(w4GritReady() && w4ArtReady(), 'the sheets never became ready in the stand-in');
  const thrown: string[] = [];
  for (const seed of [0, 1, 2, 4, 5]) {
    const rp = new RealPlay('4-1', seed);
    for (const r of rp.e.w4?.w4?.rocks ?? []) {
      for (let t = 0; t < 8; t += 1 / 30) {
        try { drawRockFx(ctx, r, t); } catch (e) { thrown.push(`layout ${seed} drop x${Math.round(r.x)} t=${t.toFixed(2)}: ${(e as Error).message}`); break; }
      }
    }
  }
  assert.deepEqual(thrown, [], `${thrown.length} drops throw while drawn:\n${thrown.slice(0, 6).join('\n')}`);
});
