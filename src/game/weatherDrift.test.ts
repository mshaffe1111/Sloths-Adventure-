/**
 * The falling petals and leaves drift BEHIND the stage (BUILD-24c): drawn over the playfield they fell through the soil band under the
 * ground line, upright most of all (2-4's "pink specks in the soil"). The game draws them right after the backdrop (engine.ts:
 * renderScenery, then scenery.ts renderDrift) and asks the overlay for the air's weather only (renderOverlay drift=false); menus and
 * story scenes, with no ground in front, keep them in the overlay. Rain, mist, motes of light stay over the playfield.
 */
import './headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { driftsBehind, lookFor, renderDrift, renderOverlayWeather } from './scenery.ts';
import { PETAL_SET_IDS, petalsReady } from './petalSprites.ts';

const g = globalThis as Record<string, unknown>;

/** a drawing surface that counts what is drawn (every fill, stroke and picture) */
function counter() {
  let n = 0;
  const draws = new Set(['fill', 'stroke', 'drawImage', 'fillRect', 'strokeRect', 'fillText']);
  const props: Record<string | symbol, unknown> = { globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, filter: 'none', imageSmoothingEnabled: true, imageSmoothingQuality: 'low', font: '10px sans-serif' };
  const ctx = new Proxy(props, {
    get(t, k) {
      if (k === 'canvas') return { width: 390, height: 844 };
      if (k === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
      if (k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern') return () => ({ addColorStop() {} });
      if (k === 'measureText') return () => ({ width: 10 });
      if (k in t) return t[k];
      return (..._a: unknown[]) => { if (draws.has(String(k))) n++; };
    },
    set(t, k, v) { t[k] = v; return true; },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, count: () => n };
}

test('which worlds drift behind: the petal and leaf worlds, and only they', () => {
  for (let w = 1; w <= 10; w++) {
    const kind = lookFor(w).weather;
    assert.equal(driftsBehind(w), kind === 'petals' || kind === 'leaves', `world ${w} (${kind})`);
  }
  assert.ok(driftsBehind(2), "World 2's petals drift behind (2-4's soil)");
});

test('the petals are drawn by renderDrift and left out of the overlay when the game drew them; nothing else moves', async () => {
  // (a picture that loads at once, as a browser's does once the sheet arrives: headlessDom has none; as riverRaft.test)
  class Loaded { onload: (() => void) | null = null; onerror: (() => void) | null = null; naturalWidth = 1024; naturalHeight = 1024; private s = '';
    get src() { return this.s; } set src(v: string) { this.s = v; setTimeout(() => this.onload?.(), 0); } }
  g.Image = Loaded;
  // (every petal set: a world's look names its own, World 2's the river's, ART-22P; stagePreload asks for every set)
  for (const set of PETAL_SET_IDS) petalsReady(set);
  await new Promise((r) => setTimeout(r, 20));
  for (const set of PETAL_SET_IDS) assert.ok(petalsReady(set), `the ${set} petal sheet did not load`);
  for (let w = 1; w <= 10; w++) {
    // (time and camera where a full set of motes is on screen; lite off)
    const drift = counter();
    renderDrift(drift.ctx, w, 1200, 390, 844, 3.2);
    const whole = counter();
    renderOverlayWeather(whole.ctx, w, 1200, 390, 844, 3.2, false, true);
    const air = counter();
    renderOverlayWeather(air.ctx, w, 1200, 390, 844, 3.2, false, false);
    if (driftsBehind(w)) {
      assert.ok(drift.count() > 0, `world ${w}: renderDrift drew no petal or leaf`);
      assert.equal(air.count() + drift.count(), whole.count(), `world ${w}: the overlay without drift + the drift is the old overlay`);
    } else {
      assert.equal(drift.count(), 0, `world ${w}: renderDrift drew its ${lookFor(w).weather}`);
      assert.equal(air.count(), whole.count(), `world ${w}: its weather left the overlay`);
    }
  }
});

test("on a stage the frame's foot clumps are never drawn, either way up: every one is code-drawn and the screen's bottom edge is soil (BUILD-24c)", async () => {
  // (the engine's own call: its last argument is `foot`; the scenery's baked layers cannot be drawn headless (no 2D canvas), so this reads
  // the one line that decides it, as the game runs it. RED if the stage passes foot true, or by orientation, as it did at 622fa1b4)
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  const calls = [...src.matchAll(/renderOverlay\(ctx, world\.id,[^;]*\);/g)].map((m) => m[0]);
  assert.equal(calls.length, 1, `the engine draws the overlay once: ${calls.join(' | ')}`);
  assert.match(calls[0], /, false\);$/, `the stage asks for no foot clumps: ${calls[0]}`);
  // (and every world's foot clump is one of the code-drawn kinds: a PAINTED clump would be a new kind, and may come back sideways)
  const { ENV } = await import('./envKit.ts');
  for (const [w, kit] of Object.entries(ENV)) if (kit?.front) assert.ok(['reed', 'fern', 'rock'].includes(kit.front), `world ${w}: foot clump '${kit.front}'`);
});

test("World 5's own drifting petals are drawn behind the stage too: before the ground, never in its front pass (BUILD-24c)", async () => {
  const fs = await import('node:fs');
  const eng = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  const drift = eng.indexOf('this.w5?.drawDrift('), ground = eng.indexOf('renderWorldObjects(\n'), front = eng.indexOf('this.w5?.drawFront(');
  assert.ok(drift > 0 && ground > 0 && front > 0, 'the three calls are in the engine');
  assert.ok(drift < ground, 'World 5\'s petals are drawn after the ground (in front of the soil)');
  // (the front pass draws no petal: w5Play.ts drawFront's body up to the next method)
  const w5 = fs.readFileSync(new URL('./w5Play.ts', import.meta.url), 'utf8');
  const body = w5.slice(w5.indexOf('  drawFront('), w5.indexOf('  drawDrift('));
  assert.ok(body.length > 0 && !body.includes('drawPetal('), "World 5's front pass draws petals over the ground");
});
