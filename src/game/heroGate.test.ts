import test from 'node:test';
import assert from 'node:assert/strict';
import { heroSource } from './heroSprite.ts';

test('the standard hero draws whenever it can, whether or not the older atlas has loaded', () => {
  assert.equal(heroSource(true, false), 'standard', 'the old atlas failing to load must not hide the new hero');
  assert.equal(heroSource(true, true), 'standard');
});

test('the older atlas is only the stand-in for a pose or a moment the standard hero cannot draw', () => {
  assert.equal(heroSource(false, true), 'main');
  assert.equal(heroSource(false, false), 'none', 'nothing painted is ready: the caller draws the classic hero');
});

// the real draw call, in a world where hero-standard.webp loads and hero-atlas.webp never does (a failed or very slow fetch)
class FakeImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  complete = false;
  naturalWidth = 1;
  private _src = '';
  decode() {
    return Promise.resolve();
  }
  set src(v: string) {
    this._src = v;
    // only the standard hero's sheet ever arrives
    if (/hero-standard/.test(v)) queueMicrotask(() => this.onload?.());
  }
  get src() {
    return this._src;
  }
}
(globalThis as unknown as { Image: unknown }).Image = FakeImage;

const calls: string[] = [];
const ctx = new Proxy(
  {},
  {
    get: (_t, k) => {
      if (k === 'drawImage') return (img: FakeImage) => calls.push(img.src);
      return () => undefined;
    },
    set: () => true,
  },
) as unknown as CanvasRenderingContext2D;

const player = (o: Record<string, unknown> = {}) =>
  ({ x: 100, y: 200, vx: 0, vy: 0, facing: 1, grounded: true, somersaultAngle: 0, attackType: 'none', walkCycle: 0, squashX: 1, squashY: 1, invincibleTimer: 0, hp: 5, ...o }) as never;

test('drawHeroSprite paints the standard hero while the old atlas has never loaded', async () => {
  const { drawHeroSprite, warmHeroAtlas } = await import('./heroSprite.ts');
  // before anything has loaded there is nothing painted to draw
  assert.equal(drawHeroSprite(ctx, player(), 1), false, 'while the sheets load the classic hero draws');
  warmHeroAtlas();
  await new Promise((r) => setTimeout(r, 10));
  calls.length = 0;
  assert.equal(drawHeroSprite(ctx, player(), 1.1), true, 'the standard hero draws without the old atlas');
  assert.equal(calls.length, 1);
  assert.match(calls[0], /hero-standard/, 'and it is the standard sheet that was drawn');
  // a pose with its own frames draws too
  assert.equal(drawHeroSprite(ctx, player({ grounded: false, vy: -500 }), 1.2), true);
  assert.equal(drawHeroSprite(ctx, player({ ducking: true }), 1.3), true);
});
