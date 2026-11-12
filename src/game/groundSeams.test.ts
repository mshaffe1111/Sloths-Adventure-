/**
 * World 1's ground seams (RF2, the lead 2026-11-12): the soil fills are sampled clear of the dark their lossy sheet bled into their edges,
 * and a floor's lip runs on under a short raised bank between two floors.
 *   npx tsx --test src/game/groundSeams.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { FILL_INSET, fillSrc } from './groundPaint.ts';
import { GROUND_FRAMES } from './groundAtlasData.ts';
import { stepFootLips } from './protoArt.ts';
import { paintedBank } from './w1Pits.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

test('every soil fill, in every world, is sampled at least 3 sheet pixels in from each edge (the WebP bleed: World 1 fill 2 falls 60 -> 36 over its last 3 rows, a hairline along every soil row, R-165.146 / R-165.129)', () => {
  assert.ok(FILL_INSET >= 3, `FILL_INSET ${FILL_INSET}: the bleed is 3 rows deep`);
  let n = 0;
  for (const [w, g] of Object.entries(GROUND_FRAMES)) {
    for (const f of g.fills) {
      const [sx, sy, sw, sh] = fillSrc(f);
      const where = `world ${w} fill at ${f.x},${f.y}`;
      assert.ok(sx >= f.x + 3 && sy >= f.y + 3, `${where}: sampled from its top or left edge rows`);
      assert.ok(sx + sw <= f.x + f.w - 3 && sy + sh <= f.y + f.h - 3, `${where}: sampled from its bottom or right edge rows`);
      // (and only those: the rest of the fill is used, so a tile still reads as the painted soil at its size)
      assert.ok(sw >= f.w - 8 && sh >= f.h - 8, `${where}: cut more than the bleed`);
      n++;
    }
  }
  assert.ok(n >= 30, `${n} fills checked`);
});

const P = (x: number, x1: number, y: number, extra: Partial<Platform> = {}): Platform => ({ id: x, x, y, width: x1 - x, height: 90, type: 'solid', ...extra }) as Platform;

test("a floor's lip runs on under a short raised bank between two floors, and only there (R-165.146: W1C's 1-3 box under the bank)", () => {
  // the 1-3 case: a moss stone 38 above the log floor either side
  assert.deepEqual(stepFootLips([P(7991, 8308, 580), P(8308, 8473, 542), P(8473, 9118, 580)]), [{ x0: 8308, x1: 8473, y: 580 }]);
  // a run of two raised pieces at different heights, still under SHORT_STEP: one lip under the whole run
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 560, 545), P(560, 620, 530), P(620, 900, 580)]), [{ x0: 500, x1: 620, y: 580 }]);
  // a run that ends at a drop (no floor beyond it) keeps its own painted end: no lip
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 542), P(800, 900, 580)]), []);
  // a tall step (SHORT_STEP or more) has its full end face, faded: no lip
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 500), P(660, 900, 580)]), []);
  // floors at different heights either side: no lip (which floor's would it be)
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 542), P(660, 900, 570)]), []);
  // a pit's low steps (soil) and a hollow's hurt floor are not floors
  assert.deepEqual(stepFootLips([P(0, 500, 580, { soil: true }), P(500, 660, 542), P(660, 900, 580, { soil: true })]), []);
  assert.deepEqual(stepFootLips([P(0, 500, 580), P(500, 660, 542, { soil: true }), P(660, 900, 580)]), []);
});

test("on 1-3's designed roll, every short raised bank between two floors gets the floor's lip under it", () => {
  const r = new RealPlay('1-3', 1);
  const banks: Platform[] = (r.e.platforms as Platform[]).filter(paintedBank);
  const lips = stepFootLips(banks);
  let raised = 0;
  for (const p of banks) {
    if (p.soil) continue;
    const L = banks.find((q) => !q.soil && Math.abs(q.x + q.width - p.x) < 2 && q.y > p.y + 2 && q.y - p.y < 60);
    const R = banks.find((q) => !q.soil && Math.abs(q.x - (p.x + p.width)) < 2 && L && Math.abs(q.y - L.y) < 2);
    if (!L || !R) continue;
    raised++;
    assert.ok(lips.some((f) => f.x0 <= p.x + 1 && f.x1 >= p.x + p.width - 1 && Math.abs(f.y - L.y) < 2), `the bank at ${Math.round(p.x)} (${Math.round(L.y - p.y)} up) has no floor lip under it`);
  }
  assert.ok(raised >= 10, `${raised} raised banks found on 1-3`);
});

test("a backdrop strip's foot (below its painted bottom, over a chasm) is its bottom edge averaged into soft columns and darkened downward, never its last rows stretched into streaks (R-165.129: 1-1's low log)", async () => {
  const { stripFoot, FOOT_W, FOOT_H, FOOT_DARK } = await import('./scenery.ts');
  const calls: Array<{ src: unknown; a: number[] }> = [];
  const stops: string[] = [];
  const doc = (globalThis as { document: { createElement: unknown } }).document;
  const was = doc.createElement;
  doc.createElement = () => {
    const cv = { width: 0, height: 0, getContext: () => g };
    const g = {
      canvas: cv, imageSmoothingEnabled: false, imageSmoothingQuality: 'low', globalCompositeOperation: 'source-over', fillStyle: '',
      drawImage: (src: unknown, ...a: number[]) => void calls.push({ src: src === cv ? 'self' : 'strip', a }),
      createLinearGradient: () => ({ addColorStop: (_o: number, c: string) => void stops.push(c) }),
      fillRect: () => {},
    };
    return cv;
  };
  try {
    const strip = {} as CanvasImageSource;
    const foot = stripFoot(strip, 0, 970, 2000, 30);
    assert.ok(foot && foot.width === FOOT_W && foot.height === FOOT_H, 'a foot of FOOT_W x FOOT_H');
    const fromStrip = calls.filter((c) => c.src === 'strip');
    assert.equal(fromStrip.length, 1, 'the strip is read once');
    // (its bottom rows, averaged down to FOOT_W columns and one row: no line of it is stretched down the screen)
    assert.deepEqual(fromStrip[0].a, [0, 970, 2000, 30, 0, 0, FOOT_W, 1]);
    assert.ok(FOOT_W <= 64, `${FOOT_W} columns: few enough that no painted mark survives as a streak`);
    assert.ok(stops.some((c) => c.includes(`${FOOT_DARK})`)) && FOOT_DARK >= 0.3, 'darker with depth by the bottom');
  } finally {
    doc.createElement = was;
  }
});

test("a dip pocket's soil (gen2 World 1) is painted into the ground's squares with its banks, never live over them: live, laid from the view, it stood as a lighter box between 1-1's earth pillars (R-165.129)", async () => {
  const G = globalThis as unknown as Record<string, unknown>;
  const doc = G.document as { createElement: unknown };
  const wasImage = G.Image, wasCreate = doc.createElement;
  const sheets: object[] = [];
  // (pictures that load at once, and canvases whose 2D context records each picture drawn into it)
  G.Image = class {
    onload: (() => void) | null = null;
    width = 2048;
    height = 2944;
    naturalWidth = 2048;
    naturalHeight = 2944;
    complete = true;
    set src(u: string) { if (u.includes('/ground/')) sheets.push(this); setTimeout(() => this.onload?.(), 0); }
    decode() { return Promise.resolve(); }
  };
  type Rec = { into: string; src: unknown; a: number[] };
  const recs: Rec[] = [];
  const ctx2d = (name: string, cv: object) => {
    let m = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    const stack: Array<typeof m> = [];
    const g: Record<string, unknown> = {
      canvas: cv, globalAlpha: 1, globalCompositeOperation: 'source-over', fillStyle: '', strokeStyle: '', imageSmoothingEnabled: true, imageSmoothingQuality: 'high', lineWidth: 1,
      drawImage: (src: unknown, ...a: number[]) => void recs.push({ into: name, src, a }),
      getTransform: () => ({ ...m }),
      setTransform: (a: number, b: number, c: number, d: number, e: number, f: number) => void (m = { a, b, c, d, e, f }),
      translate: (x: number, y: number) => void (m = { ...m, e: m.e + m.a * x, f: m.f + m.d * y }),
      scale: (x: number, y: number) => void (m = { ...m, a: m.a * x, d: m.d * y }),
      save: () => void stack.push({ ...m }),
      restore: () => void (m = stack.pop() ?? m),
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} }),
      createPattern: () => ({}),
      getImageData: () => ({ data: new Uint8ClampedArray(4) }),
      measureText: () => ({ width: 10 }),
    };
    return new Proxy(g, { get: (t, k) => (k in t ? t[k as string] : () => {}), set: (t, k, v) => ((t[k as string] = v), true) });
  };
  let n = 0;
  doc.createElement = () => {
    const cv: Record<string, unknown> = { width: 0, height: 0, style: {} };
    const c = ctx2d(`square${n++}`, cv);
    cv.getContext = () => c;
    return cv;
  };
  try {
    const { drawProtoScene, protoArtReady, setKitWorld } = await import('./protoArt.ts');
    const { warmGround } = await import('./groundPaint.ts');
    setKitWorld(1);
    warmGround(1);
    protoArtReady();
    for (let i = 0; i < 20 && !(protoArtReady() && warmGround(1)); i++) await new Promise((r) => setTimeout(r, 5));
    assert.ok(protoArtReady() && warmGround(1), 'the stubbed sheets loaded');
    // (1-1's case: an 82-wide pocket 68 down between two earth pillars, the floor below)
    const plats = [
      P(9819, 10210, 1390, { height: 445 }),
      P(10210, 10540, 1145, { height: 690 }),
      P(10540, 10622, 1213, { height: 120, ownLook: true } as Partial<Platform>),
      P(10622, 10971, 1145, { height: 690 }),
    ];
    const main = ctx2d('main', { width: 800, height: 450 }) as unknown as CanvasRenderingContext2D;
    main.setTransform(2, 0, 0, 2, -10240 * 2, -1280 * 2);
    const view = { x0: 10240, x1: 10495, y0: 1280, y1: 1535 };
    const st = { brokeAt: new Map(), movedAt: new Map() };
    for (let i = 0; i < 4; i++) drawProtoScene(main, plats, [], [], 0, view, st);
    const fill = GROUND_FRAMES[1].fills;
    const soil = (r: Rec) => sheets.includes(r.src as object) && r.a.length === 8 && fill.some((f) => r.a[0] >= f.x && r.a[0] < f.x + f.w && r.a[1] >= f.y && r.a[1] < f.y + f.h);
    assert.ok(recs.some((r) => r.into !== 'main' && soil(r)), 'the ground squares were painted with soil');
    const live = recs.filter((r) => r.into === 'main' && soil(r));
    assert.equal(live.length, 0, `${live.length} soil tiles drawn live over the ground's squares (the pocket's: laid from the view, a lighter box)`);
  } finally {
    G.Image = wasImage;
    doc.createElement = wasCreate;
  }
});
