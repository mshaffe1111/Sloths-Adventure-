/**
 * The measuring stick counts what its names say (R-150.4 / R-150.1, GL0): the clock's arithmetic on a hand-set time source, and the marks
 * in the real draw code read from the source, in order.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LayerClock, STICK_LAYERS, STICK_LEGEND, stickMedians, type StickFrame, type StickLayer } from './layerClock.ts';

const here = path.dirname(fileURLToPath(import.meta.url));

/** a clock the test moves by hand */
function rig(mode: 'cpu' | 'flush' = 'cpu') {
  let t = 100;
  const c = new LayerClock(() => t);
  c.mode = mode;
  return { c, tick: (ms: number) => void (t += ms), flush: (cost: number) => () => void (t += cost) };
}

test('a mark gives its layer exactly the time since the mark before it', () => {
  const { c, tick } = rig();
  c.begin();
  tick(3); c.mark('sky');
  tick(5); c.mark('far');
  tick(0); c.mark('mid');
  tick(11); c.mark('ground');
  c.end();
  const [f] = c.take();
  assert.deepEqual([f.layers.sky, f.layers.far, f.layers.mid, f.layers.ground], [3, 5, 0, 11]);
  assert.equal(f.layers.pokey, 0);
});

test('the layers add up to the whole draw: nothing counted twice, nothing left out', () => {
  const { c, tick } = rig();
  c.begin();
  const spent = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  STICK_LAYERS.forEach((l, i) => { tick(spent[i]); c.mark(l); });
  c.end();
  const [f] = c.take();
  assert.equal(f.total, 45);
  assert.equal(STICK_LAYERS.reduce((a, l) => a + f.layers[l], 0), f.total);
});

test('a layer marked twice in a frame (a strip drawn in two parts) keeps both parts', () => {
  const { c, tick } = rig();
  c.begin();
  tick(2); c.mark('mid');
  tick(4); c.mark('far');
  tick(3); c.mark('mid');
  c.end();
  const [f] = c.take();
  assert.equal(f.layers.mid, 5);
  assert.equal(f.layers.far, 4);
});

test("a span is part of its layer's time and is never added to the sum", () => {
  const { c, tick } = rig();
  c.begin();
  tick(2);
  c.spanBegin('squares'); tick(6); c.spanEnd('squares');
  tick(1); c.mark('ground');
  c.end();
  const [f] = c.take();
  assert.equal(f.spans.squares, 6);
  assert.equal(f.layers.ground, 9);
  assert.equal(f.total, 9);
});

test('PLANTED: time spent in one layer never lands on its neighbour', () => {
  // (the mistake this guards: a mark placed at the START of a layer gives every layer the cost of the one before it)
  const { c, tick } = rig();
  c.begin();
  tick(1); c.mark('props');
  tick(20); c.mark('creatures');
  tick(1); c.mark('pokey');
  c.end();
  const [f] = c.take();
  assert.equal(f.layers.creatures, 20);
  assert.ok(f.layers.props < 2 && f.layers.pokey < 2, 'the 20 ms belongs to creatures alone');
});

test("flush mode: each mark's pixel read is inside that layer's time, and is counted", () => {
  const { c, tick, flush } = rig('flush');
  c.begin(flush(7)); // (the read at begin finishes the frame before: it is in no layer)
  tick(2); c.mark('sky', flush(4)); // 2 of our own + a 4 ms raster wait
  tick(1); c.mark('far', flush(0));
  c.end();
  const [f] = c.take();
  assert.equal(f.layers.sky, 6);
  assert.equal(f.layers.far, 1);
  assert.equal(f.total, 7);
  assert.equal(f.flushes, 3);
});

test('cpu mode never reads a pixel back', () => {
  const { c, tick } = rig('cpu');
  let reads = 0;
  const f = () => void reads++;
  c.begin(f);
  tick(1); c.mark('sky', f);
  c.spanBegin('squares'); c.spanEnd('squares', f);
  c.end();
  assert.equal(reads, 0);
  assert.equal(c.take()[0].flushes, 0);
});

test('off: nothing is read, timed or kept', () => {
  let reads = 0;
  const c = new LayerClock(() => void reads++ as unknown as number);
  c.begin(); c.mark('sky'); c.spanBegin('x'); c.spanEnd('x'); c.end();
  assert.equal(reads, 0);
  assert.equal(c.frames.length, 0);
});

test('a frame that left early (a stage with its own screen) is dropped, not half counted', () => {
  const { c, tick } = rig();
  c.begin(); tick(5); c.end(false);
  assert.equal(c.take().length, 0);
});

test('the planted cost lands in the layer it names', () => {
  // (a real clock here: the plant is a busy wait)
  const c = new LayerClock();
  c.mode = 'cpu';
  c.plant = { ground: 6 };
  c.begin();
  for (const l of STICK_LAYERS) c.mark(l);
  c.end();
  const [f] = c.take();
  assert.ok(f.layers.ground >= 6 && f.layers.ground < 12, `ground ${f.layers.ground}`);
  for (const l of STICK_LAYERS) if (l !== 'ground') assert.ok(f.layers[l] < 2, `${l} ${f.layers[l]}`);
});

test('medians: one slow frame does not move a layer, and a span missing from a frame counts as 0', () => {
  const mk = (g: number, sq?: number): StickFrame => ({ layers: { sky: 0, far: 0, mid: 0, ground: g, props: 0, creatures: 0, pokey: 0, front: 0, hud: 0 }, spans: (sq === undefined ? {} : { squares: sq }) as Record<string, number>, total: g, flushes: 0 });
  const m = stickMedians([mk(2, 1), mk(3, 1), mk(90), mk(2, 1), mk(3, 1)]);
  assert.equal(m.layers.ground, 3);
  assert.equal(m.spans.squares, 1);
  assert.equal(m.n, 5);
  assert.equal(stickMedians([mk(1), mk(1), mk(1, 9)]).spans.squares, 0);
});

test('every layer has a line saying what is inside it', () => {
  for (const l of STICK_LAYERS) assert.ok(STICK_LEGEND[l].length > 20, l);
});

// ---- the marks in the real draw code ------------------------------------------------------------------------------------------------
const marksIn = (file: string, from: string, to: string) => {
  const src = fs.readFileSync(path.join(here, file), 'utf8');
  const a = src.indexOf(from);
  const b = src.indexOf(to, a);
  assert.ok(a >= 0 && b > a, `${file}: ${from} .. ${to}`);
  return { body: src.slice(a, b), marks: [...src.slice(a, b).matchAll(/stickMark\(ctx, '([a-z]+)'\)/g)].map((m) => m[1] as StickLayer) };
};

test('engine.ts render() ends every layer with its mark, in draw order, each beside the frame-time marker of the same layer', () => {
  const { body, marks } = marksIn('engine.ts', '  public render() {', '  // --- Meeca');
  assert.deepEqual(marks, ['mid', 'ground', 'props', 'creatures', 'pokey', 'front', 'hud']);
  // (the control test's own per-layer timing, gpuProf.ts, marks the same seven places: the two can never drift apart)
  const pair: Record<string, string> = { bg: 'mid', ground: 'ground', decor: 'props', enemies: 'creatures', hero: 'pokey', front: 'front', overlay: 'hud' };
  for (const [prof, st] of Object.entries(pair)) assert.match(body, new RegExp(`profMark\\(ctx, '${prof}'\\);\\s*stickMark\\(ctx, '${st}'\\);`), `${prof} -> ${st}`);
  assert.match(body, /profBegin\(ctx\);\s*stickBegin\(ctx\);/);
  assert.match(body, /stickMark\(ctx, 'hud'\);\s*stickEnd\(\);/);
  // (the two early ways out, Dot's flight and the slide, close the frame as not a layered one)
  assert.equal([...body.matchAll(/stickEnd\(false\)/g)].length, 2);
});

test('scenery.ts splits the backdrop: the drawn sky, then each strip by its own name', () => {
  const { body, marks } = marksIn('scenery.ts', 'export function renderScenery(', '\n}\n');
  assert.equal(marks[0], 'sky', 'the drawn sky is marked first');
  const strip = marksIn('scenery.ts', 'function drawStrip(', '\n}\n').body;
  // (drawStrip is the one place a strip is stamped: far counts to far, the middle and near strips to mid)
  assert.match(strip, /stickMark\(ctx, part === 'far' \? 'far' : 'mid'\)/);
  assert.ok(body.includes('drawStrip('));
});

test("protoArt.ts times the ground's baked squares as the span 'squares', around the one call that stamps them", () => {
  const src = fs.readFileSync(path.join(here, 'protoArt.ts'), 'utf8');
  assert.match(src, /stickSpanBegin\('squares'\);\s*const stamped = drawGroundChunks\(ctx, platforms, banks, view\);\s*stickSpanEnd\(ctx, 'squares'\);/);
});
