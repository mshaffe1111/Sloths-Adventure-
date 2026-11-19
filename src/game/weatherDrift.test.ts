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
import { petalsReady } from './petalSprites.ts';

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
  petalsReady();
  await new Promise((r) => setTimeout(r, 20));
  assert.ok(petalsReady(), 'the petal sheet did not load');
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
