/**
 * wheelDraw.test — the painted noria (ART-W2B) is drawn ON the wheel's colliders, every frame of a whole turn, both ways round:
 *   1. art = collider: every bucket's painted floor (its frame's (ax, ay), scaled) lands on its platform's left end and top;
 *   2. the turned rim and spokes: a spoke (the picture's straight-down one, turned by the draw's rotate) points at every bucket floor's middle;
 *   3. a bucket spills only over the top (within SPILL_DEG of straight up) and pours toward the jetty (-way); never spills on the way up low.
 * A planted failure (ART-W2B, 11-18): with the frame's `ay` ignored (the art's top on the platform top), test 1 went RED.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bucketAt, type Wheel } from './wheel.ts';
import { paintWheel, SPILL_DEG } from './wheelDraw.ts';
import { W2_WHEEL_FRAMES as F } from './w2WheelData.ts';
import type { Platform } from './types.ts';

interface Call { sx: number; sy: number; dx: number; dy: number; dw: number; dh: number; rot: number }
function fakeCtx() {
  const calls: Call[] = [];
  let rot = 0;
  const ctx = {
    save() {}, restore() { rot = 0; }, translate() {}, rotate(a: number) { rot = a; },
    drawImage(_im: unknown, sx: number, sy: number, _sw: number, _sh: number, dx: number, dy: number, dw: number, dh: number) {
      calls.push({ sx, sy, dx, dy, dw, dh, rot });
    },
  };
  return { ctx: ctx as unknown as CanvasRenderingContext2D, calls };
}

const wheels: Wheel[] = [
  { cx: 600, cy: 800, R: 180, N: 6, W: 120, V: 70, way: 1 },
  { cx: 300, cy: 500, R: 160, N: 6, W: 120, V: 60, way: -1, phase: 0.4 },
  { cx: 900, cy: 900, R: 200, N: 5, W: 120, V: 70, way: -1 },
];
const bucketsAt = (w: Wheel, t: number): Platform[] =>
  Array.from({ length: w.N }, (_, i) => ({ id: i, ...bucketAt(w, i, t), width: w.W, height: 16, type: 'moving' }) as Platform);
const frameOf = (c: Call) => Object.entries(F).find(([, f]) => f.x === c.sx && f.y === c.sy)?.[0];

test('art = collider: every bucket frame puts its painted floor on the platform top and left end, a whole turn, both ways', () => {
  for (const w of wheels) {
    for (let t = 0; t < (2 * Math.PI * w.R) / w.V; t += 0.25) {
      const bs = bucketsAt(w, t);
      const { ctx, calls } = fakeCtx();
      paintWheel(ctx, {} as CanvasImageSource, w, bs);
      const bc = calls.filter((c) => frameOf(c)?.startsWith('bucket'));
      assert.equal(bc.length, bs.length);
      bc.forEach((c, i) => {
        const f = F[frameOf(c) as 'bucket'];
        const s = c.dw / f.w;
        assert.ok(Math.abs(c.dx + f.ax * s - bs[i].x) < 0.01, `floor left at ${bs[i].x}, drawn ${c.dx + f.ax * s}`);
        assert.ok(Math.abs(c.dy + f.ay * s - bs[i].y) < 0.01, `floor top at ${bs[i].y}, drawn ${c.dy + f.ay * s}`);
        assert.ok(Math.abs(s * F.bucket.floorW - bs[i].width) < 0.01, 'the painted floor is the platform width');
      });
    }
  }
});

test('the turned rim: a spoke points at every bucket floor, and the rim is drawn at R', () => {
  for (const w of wheels) {
    for (let t = 0; t < 6; t += 0.37) {
      const bs = bucketsAt(w, t);
      const { ctx, calls } = fakeCtx();
      paintWheel(ctx, {} as CanvasImageSource, w, bs);
      const rim = calls.find((c) => frameOf(c) === 'noria')!;
      assert.ok(Math.abs((rim.dw * F.noria.r) / F.noria.w - w.R) < 0.01, 'the rim middle line is drawn at R');
      if (w.N !== 6) continue; // (the picture has 6 spokes: a 6-bucket wheel; another N is drawn but its spokes fall between)
      for (const b of bs) {
        const want = Math.atan2(-(b.x + b.width / 2 - w.cx), b.y - w.cy); // the turn that puts the straight-down spoke on this floor
        const d = ((((want - rim.rot) / (Math.PI / 3)) % 1) + 1) % 1;
        assert.ok(Math.min(d, 1 - d) < 1e-6, `a spoke meets the bucket at t=${t.toFixed(2)}`);
      }
    }
  }
});

test('a bucket spills only over the top, toward the jetty', () => {
  for (const w of wheels) {
    for (let t = 0; t < 20; t += 0.5) {
      const bs = bucketsAt(w, t);
      const { ctx, calls } = fakeCtx();
      paintWheel(ctx, {} as CanvasImageSource, w, bs);
      const bc = calls.filter((c) => frameOf(c)?.startsWith('bucket'));
      bc.forEach((c, i) => {
        const up = (w.cy - bs[i].y) / w.R; // cos of the angle from straight up
        const n = frameOf(c)!;
        if (up >= Math.cos((SPILL_DEG * Math.PI) / 180) + 1e-9) assert.equal(n, w.way > 0 ? 'bucketSpillL' : 'bucketSpillR');
        else if (up < Math.cos((SPILL_DEG * Math.PI) / 180) - 1e-9) assert.equal(n, 'bucket');
      });
    }
  }
});
