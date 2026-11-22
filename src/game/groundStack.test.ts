/**
 * A leg laid UNDER another leg is not buried by the upper leg's earth (ENG-GROUND, 2-7 "The Way Home" and every out-and-back stage).
 * The painted ground runs each bank's soil down out of sight (protoArt.ts drawBankArt); on the out-and-back toy (gen2/toyHome.ts
 * POST_CODE, the shape 2-7 is built on) the race leg runs under the out leg, and the out leg's soil was drawn down over it: Pokey walked
 * in front of solid earth and the river under it did not show (ENG-27d's still, x 14950). This judges the ground's own draw calls (a
 * canvas that records every image and fill with the clip in force when it was drawn), on the toy's own roll, both settings:
 *   1. the lower leg's walk band (his body and a jump over every piece of it) and its rivers' water are covered by no soil;
 *   2. the upper leg's earth is still drawn (its body down past its own collider), so the fix is a ceiling, not a hole;
 *   3. the ceiling is not a straight cut: the lowest painted soil along it moves up and down.
 *   npx tsx --test src/game/groundStack.test.ts
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';

// (every sheet arrives the moment it is asked for: the painters decide as they do once the art is in. Set before the game loads.)
(globalThis as Record<string, unknown>).Image = class {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  width = 1; height = 1; naturalWidth = 1; naturalHeight = 1; complete = true;
  set src(_u: string) { this.onload?.(); }
  decode() { return { then: (ok: () => void) => ok() }; }
};

const protoArt = await import('./protoArt.ts');
const { drawProtoScene, protoArtReady, setGroundLook, setGroundPaint, setKitWorld } = protoArt;
// (the stacked zones the lay marks, as engine.ts sets them at a stage's start; tolerant, so on a base without them this fails on the
// picture, not on a missing name)
const stack = await import('./groundStack.ts').catch(() => null);
const setStacks = (legs: unknown, rivers?: unknown) => (protoArt as { setGroundStacks?: (z: unknown, r?: unknown) => void }).setGroundStacks?.(stack?.stackZonesOf(legs as never), rivers);
const { paintedBank } = await import('./w1Pits.ts');
const { buildGen2Stage } = await import('./gen2/pipeline.ts');
const { towerCfg } = await import('./gen2/toyTower.ts');
const { homeKit, POST_CODE } = await import('./gen2/toyHome.ts');
const { w2Finish } = await import('./gen2/worlds/w2.ts');
type Platform = import('./types.ts').Platform;
type Pt = [number, number];

/** a 2D context that keeps, for every image and rect it fills, the box filled and the clips in force (paths in world units) */
class RecordingCtx {
  draws: Array<{ box: [number, number, number, number]; clips: Array<{ polys: Pt[][]; evenodd: boolean }>; quad?: Pt[]; src?: number[]; alpha?: number; flip?: boolean }> = [];
  private src: number[] | undefined;
  private m = [1, 0, 0, 1, 0, 0];
  private clips: Array<{ polys: Pt[][]; evenodd: boolean }> = [];
  private stack: Array<{ m: number[]; n: number }> = [];
  private path: Pt[][] = [];
  off = false;
  fillStyle: unknown = '#000'; strokeStyle: unknown = '#000'; globalAlpha = 1; globalCompositeOperation = 'source-over'; lineWidth = 1;
  filter = 'none'; imageSmoothingEnabled = true; imageSmoothingQuality = 'high'; lineCap = 'butt'; lineJoin = 'miter'; font = '10px x';
  shadowBlur = 0; shadowColor = 'transparent'; textAlign = 'left'; textBaseline = 'alphabetic';
  private tp(x: number, y: number): Pt { const m = this.m; return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]; }
  save() { this.stack.push({ m: [...this.m], n: this.clips.length }); }
  restore() { const s = this.stack.pop(); if (s) { this.m = s.m; this.clips.length = s.n; } }
  setTransform(a: number | DOMMatrix, b = 0, c = 0, d = 1, e = 0, f = 0) { this.m = typeof a === 'number' ? [a, b, c, d, e, f] : [1, 0, 0, 1, 0, 0]; }
  resetTransform() { this.m = [1, 0, 0, 1, 0, 0]; }
  transform(a: number, b: number, c: number, d: number, e: number, f: number) {
    const m = this.m;
    this.m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]];
  }
  translate(x: number, y: number) { this.transform(1, 0, 0, 1, x, y); }
  scale(x: number, y: number) { this.transform(x, 0, 0, y, 0, 0); }
  rotate(r: number) { this.transform(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0); }
  beginPath() { this.path = []; }
  moveTo(x: number, y: number) { this.path.push([this.tp(x, y)]); }
  lineTo(x: number, y: number) { if (!this.path.length) this.path.push([]); this.path[this.path.length - 1].push(this.tp(x, y)); }
  quadraticCurveTo(_cx: number, _cy: number, x: number, y: number) { this.lineTo(x, y); }
  bezierCurveTo(_a: number, _b: number, _c: number, _d: number, x: number, y: number) { this.lineTo(x, y); }
  closePath() {}
  rect(x: number, y: number, w: number, h: number) { this.path.push([this.tp(x, y), this.tp(x + w, y), this.tp(x + w, y + h), this.tp(x, y + h)]); }
  arc(x: number, y: number, r: number) { this.path.push(Array.from({ length: 12 }, (_, i) => this.tp(x + r * Math.cos((i * Math.PI) / 6), y + r * Math.sin((i * Math.PI) / 6)))); }
  ellipse(x: number, y: number, rx: number, ry: number) { this.path.push(Array.from({ length: 12 }, (_, i) => this.tp(x + rx * Math.cos((i * Math.PI) / 6), y + ry * Math.sin((i * Math.PI) / 6)))); }
  clip(rule?: string) { this.clips.push({ polys: this.path.map((p) => [...p]), evenodd: rule === 'evenodd' }); }
  private box(x: number, y: number, w: number, h: number) {
    if (this.off) return;
    const a = this.tp(x, y), b = this.tp(x + w, y + h);
    // (the four corners as drawn: a sheared column's box is not its two corners)
    const quad = [a, this.tp(x + w, y), b, this.tp(x, y + h)];
    const xs = quad.map((q) => q[0]), ys = quad.map((q) => q[1]);
    this.draws.push({ box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], clips: [...this.clips], quad, src: this.src, alpha: this.globalAlpha, flip: this.m[0] < 0 });
  }
  drawImage(_img: unknown, ...a: number[]) {
    if (a.length === 2) return; // (no size: an image drawn at its own size, never the soil)
    const [x, y, w, h] = a.length === 4 ? a : a.slice(4);
    this.src = a.length === 8 ? a.slice(0, 4) : undefined;
    this.box(x, y, w, h);
    this.src = undefined;
  }
  fillRect(x: number, y: number, w: number, h: number) { this.box(x, y, w, h); }
  fill() {
    if (this.off) return;
    const pts = this.path.flat();
    if (!pts.length) return;
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    this.draws.push({ box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], clips: [...this.clips, { polys: this.path.map((p) => [...p]), evenodd: false }] });
  }
  stroke() {} fillText() {} strokeText() {} clearRect() {} setLineDash() {}
  measureText() { return { width: 0 }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  createPattern() { return {}; }
  getImageData() { return { data: new Uint8ClampedArray(4) }; }
  putImageData() {}
}

/** is the point inside polygon set `polys` (nonzero approximated by even-odd per subpath for simple outlines, or even-odd across all) */
function inside(polys: Pt[][], evenodd: boolean, x: number, y: number): boolean {
  let crossings = 0, any = false;
  for (const poly of polys) {
    let c = 0;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c++;
    }
    crossings += c;
    if (c % 2) any = true;
  }
  return evenodd ? crossings % 2 === 1 : any;
}
/** is (x, y) under soil: a fill drawn there inside every clip in force. Soil is always drawn inside its outline's clip (protoArt.ts
 *  drawBankArt); a bank's end piece is an unclipped image of its own (the lower leg's river banks' ends overhang their water by design) */
const covered = (r: RecordingCtx, x: number, y: number) =>
  r.draws.some((d) => d.clips.length > 0 && x >= d.box[0] && x <= d.box[2] && y >= d.box[1] && y <= d.box[3] && d.clips.every((c) => inside(c.polys, c.evenodd, x, y)));

const solidish = (q: Platform) => q.type !== 'drift' && q.type !== 'moving' && q.type !== 'bouncy';

for (const difficulty of ['normal', 'easy'] as const) {
  test(`the out-and-back toy (${difficulty}): the race leg under the out leg and its rivers show, the out leg's earth ends above them as a ceiling, not a straight cut`, () => {
    const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
    const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed: 1, difficulty }) as never, difficulty) as unknown as {
      platforms: Platform[]; rivers?: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: unknown } };
    };
    assert.equal(st.platforms.length > 20, true, 'the toy built');
    setKitWorld(2);
    setGroundLook(undefined);
    setGroundPaint(true);
    setStacks(st.gen2?.tower?.legs);
    assert.ok(protoArtReady(), 'the painted layer is ready');
    const banks = st.platforms.filter(paintedBank);
    // the stacked pieces: a piece he stands on under a bank's earth, a clear gap under its collider
    const under = (q: Platform) => banks.find((p) => p !== q && Math.min(p.x + p.width, q.x + q.width) - Math.max(p.x, q.x) > 8 && q.y >= p.y + p.height + 20);
    const lower = st.platforms.filter((q) => solidish(q) && under(q));
    assert.ok(lower.length >= 4, `the toy stacks its race leg under its out leg (${lower.length} pieces under earth)`);
    const uppers = [...new Set(lower.map((q) => under(q)!))];
    const x0 = Math.min(...lower.map((q) => q.x)), x1 = Math.max(...lower.map((q) => q.x + q.width));
    const rivers = (st.rivers ?? []).filter((z) => z.x1 > x0 && z.x0 < x1 && banks.some((p) => p.x < z.x1 && p.x + p.width > z.x0 && p.y < z.surfaceY - 300));
    assert.ok(rivers.length >= 1, 'a river runs under the out leg');
    const misses: string[] = [];
    const bottoms: number[] = [];
    const holes: string[] = [];
    // the view: a phone's sideways screen on the lower leg, stepped along it (the soil runs to the view's foot)
    for (let vx = Math.floor(x0 / 400) * 400; vx < x1; vx += 400) {
      const here = lower.filter((q) => q.x < vx + 900 && q.x + q.width > vx);
      if (!here.length) continue;
      const gy = Math.min(...here.map((q) => q.y));
      const view = { x0: vx, x1: vx + 900, y0: gy - 520, y1: gy + 220 };
      const r = new RecordingCtx();
      drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
      r.off = true;
      // 1. his walk band over every lower piece: his body (48) and a jump over it
      for (const q of here)
        for (let x = Math.max(q.x + 12, vx); x <= Math.min(q.x + q.width - 12, vx + 900); x += 24)
          for (const dy of [40, 90, 140]) if (covered(r, x, q.y - dy)) misses.push(`walk band at x ${Math.round(x)}, ${dy} over the piece at y ${Math.round(q.y)}`);
      // ... and the rivers' water: just over and just under its surface, across its middle
      for (const z of rivers) {
        const a = z.x0 + (z.x1 - z.x0) * 0.2, b = z.x0 + (z.x1 - z.x0) * 0.8;
        for (let x = Math.max(a, vx); x <= Math.min(b, vx + 900); x += 24)
          for (const dy of [-12, 10]) if (covered(r, x, z.surfaceY + dy)) misses.push(`river at x ${Math.round(x)}, ${dy} from its surface ${Math.round(z.surfaceY)}`);
      }
      // 2. the upper leg's earth is still drawn: its body down past its collider, over the lower leg's x
      for (const p of uppers) {
        if (p.x + p.width < vx + 40 || p.x > vx + 860) continue;
        const x = Math.max(p.x + 40, vx + 40);
        if (!covered(r, x, p.y + p.height + 10)) holes.push(`the upper bank at x ${Math.round(p.x)} (view ${vx}) has no earth under its collider`);
      }
      // 3. the ceiling's line: the lowest soil over the lower leg at each x, between the upper leg's collider and the lower leg
      for (let x = vx + 20; x < vx + 880; x += 16) {
        const q = here.find((o) => x >= o.x && x <= o.x + o.width);
        const p = uppers.find((o) => x >= o.x && x <= o.x + o.width);
        if (!q || !p) continue;
        let y = p.y + p.height;
        while (y < q.y && covered(r, x, y + 4)) y += 4;
        if (y < q.y) bottoms.push(y);
      }
    }
    assert.deepEqual(misses.slice(0, 12), [], `${misses.length} points of the lower leg are under the upper leg's soil`);
    assert.deepEqual(holes, [], 'a hole, not a ceiling');
    assert.ok(bottoms.length >= 20, `the ceiling was found at ${bottoms.length} places`);
    const spread = Math.max(...bottoms) - Math.min(...bottoms);
    let turns = 0;
    for (let i = 2; i < bottoms.length; i++) if (Math.sign(bottoms[i] - bottoms[i - 1]) * Math.sign(bottoms[i - 1] - bottoms[i - 2]) < 0) turns++;
    assert.ok(spread >= 12 && turns >= 6, `the ceiling reads as a straight cut (spread ${spread} px, ${turns} turns)`);
  });
}

test('a stage whose lay stacks no leg has no stacked zone, so its ground draws exactly as before (the ruling (b): 1-4 and 7-4 untouched)', () => {
  assert.ok(stack, 'groundStack.ts');
  assert.deepEqual(stack!.stackZonesOf(undefined), []);
  // a tower (one up leg) and a run (one right leg): nothing stacked
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'up', x0: 0, x1: 900, y0: 0, y1: 9000 }]), []);
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'right', x0: 0, x1: 9000, y0: 600, y1: 700 }]), []);
  // out right, down a column, home left under the way out: the home leg is the zone, and (ENG-GROUND-d) the home leg's band runs on under
  // the column that comes down into it (its stairs and pools stand over the floor at its foot); a left leg beside (not under) it is not
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'right', x0: 100, x1: 5000, y0: 600, y1: 760 }, { travel: 'down', x0: 5000, x1: 5600, y0: 760, y1: 1400 }, { travel: 'left', x0: 0, x1: 5000, y0: 1400, y1: 1600 }]), [{ x0: 0, x1: 5000, y0: 1400, y1: 1600 }, { x0: 5000, x1: 5600, y0: 1400, y1: 1600 }]);
  // (a column wholly over the band, its foot short of it, adds nothing)
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'right', x0: 100, x1: 5000, y0: 600, y1: 760 }, { travel: 'down', x0: 5000, x1: 5600, y0: 760, y1: 1300 }, { travel: 'left', x0: 0, x1: 5000, y0: 1400, y1: 1600 }]), [{ x0: 0, x1: 5000, y0: 1400, y1: 1600 }]);
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'right', x0: 100, x1: 5000, y0: 600, y1: 760 }, { travel: 'left', x0: 5000, x1: 9000, y0: 1400, y1: 1600 }]), []);
});

// ENG-GROUND-b: the upper leg's RIVERS end at the ceiling too. engine.ts drawRivers runs a river's water, its bed and the soil under it
// down to the view's foot; on the out leg its still pools (between the out leg's banks) hung as columns of earth to just over the race
// leg's banks and planks (2-7's re-shoot at x 15350, and the join at x 18450). This runs the engine's OWN river painter on the toy (a
// World 2 engine with the toy's stage in it) into the recording canvas, over the race leg, both settings, and judges every fill:
//   the race leg's walk band and its rivers' water are under no upper river's paint; each upper river is still drawn (to its ceiling).
// Planted RED on 6c45381d0 (the engine ran the upper pools to the view's foot): see reference/qa-reports/ENG-GROUND/red-b.txt.
const { RealPlay } = await import('./realPlay.ts');
const { riverPaintFoot } = await import('./riverArt.ts');
const { WORLDS_DATA } = await import('./worldsData.ts');
for (const difficulty of ['normal', 'easy'] as const) {
  test(`the out-and-back toy (${difficulty}): the out leg's rivers end at the ceiling, not in a column over the race leg (the engine's own river painter)`, () => {
    const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
    const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed: 1, difficulty }) as never, difficulty) as unknown as {
      platforms: Platform[]; rivers: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: unknown } };
    };
    // (a World 2 engine, its stage swapped for the toy's: the river painter reads the stage's rivers and platforms, the camera and the clock)
    const rp = new RealPlay('2-1', 1);
    const e = rp.e;
    e.currentStage = st;
    e.platforms = st.platforms;
    e.riverUnder = new WeakMap();
    e.riverBankOf = new WeakMap();
    e.paintKit = true;
    setKitWorld(2);
    setGroundLook(undefined);
    setGroundPaint(true);
    setStacks(st.gen2?.tower?.legs);
    const world = WORLDS_DATA.find((w: { id: number }) => w.id === 2);
    const banks = st.platforms.filter(paintedBank);
    const under = (q: Platform) => banks.find((p) => p !== q && Math.min(p.x + p.width, q.x + q.width) - Math.max(p.x, q.x) > 8 && q.y >= p.y + p.height + 20);
    const lower = st.platforms.filter((q) => solidish(q) && under(q));
    assert.ok(lower.length >= 4, `the toy stacks its race leg under its out leg (${lower.length} pieces under earth)`);
    const x0 = Math.min(...lower.map((q) => q.x)), x1 = Math.max(...lower.map((q) => q.x + q.width));
    const lowY = Math.min(...lower.map((q) => q.y));
    // (the upper leg's rivers over the race leg: their surface well over the race leg's pieces)
    const uppers = st.rivers.filter((z) => z.x1 > x0 && z.x0 < x1 && z.surfaceY < lowY - 300);
    const lows = st.rivers.filter((z) => z.x1 > x0 && z.x0 < x1 && z.surfaceY >= lowY - 60);
    assert.ok(uppers.length >= 2, `the out leg has pools over the race leg (${uppers.length})`);
    const misses: string[] = [];
    const drawn = new Set<object>();
    for (let vx = Math.floor(x0 / 400) * 400; vx < x1; vx += 400) {
      const here = lower.filter((q) => q.x < vx + 900 && q.x + q.width > vx);
      if (!here.length) continue;
      const gy = Math.min(...here.map((q) => q.y));
      Object.assign(e.camera, { x: vx, y: gy - 520, viewportWidth: 900, viewportHeight: 740 });
      const r = new RecordingCtx();
      e.drawRivers(r as unknown as CanvasRenderingContext2D, world, false);
      // (only the upper rivers' paint: a fill inside an upper river's x whose box starts well over the race leg: its water, bed or soil)
      const up = r.draws.filter((d) => uppers.some((z) => { const hit = d.box[0] < z.x1 + 200 && d.box[2] > z.x0 - 200 && d.box[1] < lowY - 200; if (hit) drawn.add(z); return hit; }));
      const coveredUp = (x: number, y: number) => up.some((d) => d.clips.length > 0 && x >= d.box[0] && x <= d.box[2] && y >= d.box[1] && y <= d.box[3] && d.clips.every((c) => inside(c.polys, c.evenodd, x, y)));
      for (const q of here)
        for (let x = Math.max(q.x + 12, vx); x <= Math.min(q.x + q.width - 12, vx + 900); x += 24)
          for (const dy of [40, 90, 140]) if (coveredUp(x, q.y - dy)) misses.push(`walk band at x ${Math.round(x)}, ${dy} over the piece at y ${Math.round(q.y)}`);
      for (const z of lows) {
        const a = z.x0 + (z.x1 - z.x0) * 0.2, b = z.x0 + (z.x1 - z.x0) * 0.8;
        for (let x = Math.max(a, vx); x <= Math.min(b, vx + 900); x += 12) if (coveredUp(x, z.surfaceY - 12)) misses.push(`the race river at x ${Math.round(x)}, 12 over its surface ${Math.round(z.surfaceY)}`);
      }
    }
    assert.deepEqual(misses.slice(0, 12), [], `${misses.length} points of the race leg are under the out leg's river paint`);
    assert.ok(drawn.size >= 2, `the out leg's pools are still drawn (${drawn.size} of ${uppers.length})`);
  });
}

// ENG-GROUND-b, the lead's ruling for ART-UNDER: the underside is drawn AFTER the ceiling's clip, over the bank's (or the pool's) own x
// span only, the painted strip's `edge` on the line and its roots hanging below it (into UNDER_HANG). Drawn inside the clip, as ENG-GROUND
// laid it, the roots were cut off at the line. With a strip in World 2's sheet (a test frame: edge 0.75, so 32 units hang), a point 12
// under the line over every upper bank and pool of the toy over its race leg is painted, and nothing is painted past the span's ends.
// Planted RED on 0f5ca9999 (the hook inside drawBankArt's soil clip and the river's ceiling clip): see red-b.txt.
const { GROUND_FRAMES } = await import('./groundAtlasData.ts');
test('the out-and-back toy: the painted underside hangs its roots below the ceiling line (banks and pools), over their own spans only', () => {
  const g2 = GROUND_FRAMES[2] as unknown as { unders?: Array<{ x: number; y: number; w: number; h: number; edge: number }> };
  const had = g2.unders;
  g2.unders = [0, 1, 2].map((i) => ({ x: 0, y: 2368 + i * 256, w: 1024, h: 256, edge: 0.75 }));
  const g2c = GROUND_FRAMES[2] as unknown as { underCorner?: { x: number; y: number; w: number; h: number; edge: number; cx: number } };
  const hadC = g2c.underCorner;
  g2c.underCorner = { x: 1408, y: 2208, w: 384, h: 576, edge: 0.7, cx: 0.83 };
  try {
    const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
    const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed: 1, difficulty: 'normal' }) as never, 'normal') as unknown as {
      platforms: Platform[]; rivers: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: unknown } };
    };
    // (the engine first: its stage start sets the painter's world and stacked zones for ITS stage)
    const rp = new RealPlay('2-1', 1);
    const e = rp.e;
    setKitWorld(2);
    setGroundLook(undefined);
    setGroundPaint(true);
    setStacks(st.gen2?.tower?.legs, st.rivers);
    const banks = st.platforms.filter(paintedBank);
    // (the painter's own ceilings: the stage's rivers go in with the foot of their paint, as protoArt.ts setGroundStacks gives them. Laid
    //  without them, this line ran through the descent's first pool where the painter's runs at its bed foot, ENG-GROUND-d)
    const waters = st.rivers.map((z) => ({ x0: z.x0, x1: z.x1, top: z.surfaceY, foot: riverPaintFoot(z.surfaceY, !!(z as { safe?: unknown }).safe) }));
    const cs = stack!.findCeilings(st.platforms, banks, stack!.stackZonesOf(st.gen2?.tower?.legs as never), waters);
    assert.ok(cs.length >= 1, 'the toy has a ceiling');
    const line = (x: number) => Math.min(...cs.filter((c) => x >= c.x0 && x <= c.x1).map((c) => stack!.ceilingAt(c, x)));
    Object.assign(e, { currentStage: st, platforms: st.platforms, riverUnder: new WeakMap(), riverBankOf: new WeakMap(), paintKit: true });
    const world = WORLDS_DATA.find((w: { id: number }) => w.id === 2);
    const spans = [
      ...banks.filter((p) => stack!.ceilingsOver(p, cs).length).map((p) => ({ what: `bank x ${Math.round(p.x)}`, x0: p.x, x1: p.x + p.width, river: false })),
      ...st.rivers.filter((z) => stack!.ceilingsOverSpan(z.x0, z.x1, z.surfaceY, cs).length).map((z) => ({ what: `pool x ${Math.round(z.x0)}`, x0: z.x0, x1: z.x1, river: true })),
    ];
    assert.ok(spans.filter((s) => s.river).length >= 2 && spans.filter((s) => !s.river).length >= 4, `the out leg's banks and pools over the race leg (${spans.length})`);
    const bare: string[] = [], spill: string[] = [], stair: string[] = [], seam: string[] = [], corner: string[] = [];
    for (const s of spans) {
      const mid = (s.x0 + s.x1) / 2;
      const ly = line(mid);
      if (!Number.isFinite(ly)) continue;
      const view = { x0: mid - 450, x1: mid + 450, y0: ly - 500, y1: ly + 240 };
      const r = new RecordingCtx();
      if (s.river) {
        Object.assign(e.camera, { x: view.x0, y: view.y0, viewportWidth: 900, viewportHeight: 740 });
        e.drawRivers(r as unknown as CanvasRenderingContext2D, world, false);
      } else drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
      let hit = 0, n = 0;
      for (let x = s.x0 + 8; x <= s.x1 - 8; x += 16) {
        const y = line(x);
        if (!Number.isFinite(y)) continue;
        n++;
        // (painted there by a draw whose clips all hold the point: a strip column, its root band 12 under the line)
        if (r.draws.some((d) => x >= d.box[0] && x <= d.box[2] && y + 12 >= d.box[1] && y + 12 <= d.box[3] && d.box[3] - d.box[1] > 60 && d.box[3] - d.box[1] < 200 && d.clips.every((c) => inside(c.polys, c.evenodd, x, y + 12)))) hit++;
      }
      if (n && hit < n * 0.9) bare.push(`${s.what}: roots under the line at ${hit} of ${n} points`);
      // (the strip stays over its own span: no strip-sized draw starts left of x0 or ends right of x1, under the line)
      // (paint, not a box: a fill whose clips hold a point just past an end, under the line. A neighbouring pool's water tile is 476 wide
      //  and clipped to its own span; with the descent's pools lidded (ENG-GROUND-d) the second pool's tile box reached over the first's end)
      const past = (d: RecordingCtx['draws'][number]) => [s.x0 - 1, s.x0 - 8, s.x1 + 1, s.x1 + 8].some((x) => { const y = line(x) + 6; return Number.isFinite(y) && x >= d.box[0] && x <= d.box[2] && y >= d.box[1] && y <= d.box[3] && d.clips.every((c) => inside(c.polys, c.evenodd, x, y)); });
      const out = r.draws.filter((d) => d.box[3] - d.box[1] > 60 && d.box[3] - d.box[1] < 200 && d.box[1] < line(Math.max(s.x0, Math.min(s.x1, d.box[0]))) && d.box[3] > line(Math.max(s.x0, Math.min(s.x1, d.box[0]))) + 4 && (d.box[0] < s.x0 - 0.01 || d.box[2] > s.x1 + 0.51) && d.box[2] > s.x0 - 40 && d.box[0] < s.x1 + 40 && past(d));
      if (s.river && out.length) spill.push(`${s.what}: ${out.length} strip columns past its ends`);
      // (the strip's ragged edge runs ON the line along every column, both ends: ENG-GROUND-c's re-shoot found each 16-unit column
      //  set at the lower of its two ends, so the edge stepped by up to the line's rise over a column: stairs every 16 units)
      const lineNear = (x: number, y: number) => Math.min(...cs.filter((c) => x >= c.x0 - 1 && x <= c.x1 + 1).map((c) => Math.abs(stack!.ceilingAt(c, x) - y)));
      let worst = 0, cols = 0;
      for (const d of r.draws) {
        const q = d.quad;
        if (!q || Math.abs(q[3][1] - q[0][1] - 128) > 1 || q[1][0] - q[0][0] > 17 || q[1][0] < s.x0 || q[0][0] > s.x1) continue;
        cols++;
        worst = Math.max(worst, lineNear(q[0][0], q[0][1] + 0.75 * (q[3][1] - q[0][1])), lineNear(q[1][0], q[1][1] + 0.75 * (q[2][1] - q[1][1])));
      }
      if (cols && worst > 1) stair.push(`${s.what}: the strip's edge ${worst.toFixed(1)} off the line at a column's end (${cols} columns)`);
      // (where one strip gives way to the next (every 512 units, each strip wrapping only with itself) the next is already drawn over the
      //  column before the change, faded in: ENG-GROUND-c's painted shoot showed a hard seam there)
      const strips = r.draws.filter((d) => d.src && d.quad && Math.abs(d.quad[3][1] - d.quad[0][1] - 128) <= 1 && d.quad[1][0] - d.quad[0][0] <= 17);
      for (let B = Math.ceil((s.x0 + 48) / 512) * 512; B < s.x1 - 48; B += 512) {
        if (!Number.isFinite(line(B))) continue;
        const after = strips.find((d) => d.quad![0][0] >= B - 0.01 && d.quad![0][0] < B + 1)?.src?.[1];
        const before = strips.filter((d) => d.quad![1][0] <= B + 0.6 && d.quad![1][0] > B - 1 && d.src![1] === after);
        if (after === undefined || !before.some((d) => (d.alpha ?? 1) >= 0.8)) seam.push(`${s.what}: a hard seam at x ${B}`);
      }
    }
    // (a bank's underside that ends over open air (no bank or river of the upper leg beside it, inside the ceiling's run) turns up into its
    //  end face with the painted corner, mirrored for a left end; it stopped in a straight cut, ENG-GROUND-c's painted shoot)
    const upper = [
      ...banks.filter((p) => stack!.ceilingsOver(p, cs).length).map((p) => ({ x0: p.x, x1: p.x + p.width })),
      ...st.rivers.filter((z) => stack!.ceilingsOverSpan(z.x0, z.x1, z.surfaceY, cs).length).map((z) => ({ x0: z.x0, x1: z.x1 })),
    ];
    const ends: Array<{ x: number; side: 'l' | 'r' }> = [];
    for (const u of upper) for (const side of ['l', 'r'] as const) {
      const x = side === 'l' ? u.x0 : u.x1, out = side === 'l' ? x - 4 : x + 4;
      if (!upper.some((o) => o.x0 <= out && o.x1 >= out) && cs.some((c) => x > c.x0 + 8 && x < c.x1 - 8) && !ends.some((e) => Math.abs(e.x - x) < 2)) ends.push({ x, side });
    }
    assert.ok(ends.length >= 1, `the toy's underside ends over open air somewhere (${ends.length})`);
    for (const end of ends) {
      const ly = line(end.x);
      const view = { x0: end.x - 450, x1: end.x + 450, y0: ly - 500, y1: ly + 240 };
      const r = new RecordingCtx();
      drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
      // (the corner: 288 tall, its face (cx of its width) at the end, its body over the bank's side, mirrored on a left end)
      // (from the sheet, or from the corner faded once: its whole frame, 192 x 288 shown)
      const k = r.draws.filter((d) => d.src && d.quad && d.src[2] === 384 && d.src[3] === 576 && ((d.src[0] === 1408 && d.src[1] === 2208) || (d.src[0] === 0 && d.src[1] === 0)) && Math.abs(Math.abs(d.quad[1][0] - d.quad[0][0]) - 192) < 2 && Math.abs(d.box[3] - d.box[1] - 288) < 40);
      const ok = k.some((d) => (end.side === 'r' ? !d.flip && d.box[0] < end.x - 100 && d.box[2] > end.x : d.flip && d.box[2] > end.x + 100 && d.box[0] < end.x) && d.box[1] < ly && d.box[3] > ly);
      if (!ok) corner.push(`${end.side === 'l' ? 'left' : 'right'} end x ${Math.round(end.x)}: no corner (${k.length} corner draws)`);
    }
    assert.deepEqual(bare, [], 'the roots are cut off at the line');
    assert.deepEqual(spill, [], 'the strip spills past its span');
    assert.deepEqual(stair, [], "the strip's edge steps off the line between columns");
    assert.deepEqual(seam, [], 'a hard seam where one strip gives way to the next');
    assert.deepEqual(corner, [], 'an end over open air has no corner');
  } finally {
    g2.unders = had;
    g2c.underCorner = hadC;
  }
});

// ENG-GROUND-d: the race leg's band is under no other leg's paint ANYWHERE, ends included. The zones fed only the race leg's own box, so
// where another leg comes DOWN into its band (the toy's descent: stairs and still pools standing over the floor he walks at their foot,
// past the out leg's end) no ceiling stood: each pool ran its water, bed and soil to the view's foot, two straight-sided columns over the
// floor (the lead's painted still right-end-x18760-sideways: an earth column (the first pool's bed and soil, its water above the frame)
// and a pond column). Here, over every piece whose top lies in the race leg's band, at every x, his body's air (over the piece's own grass
// lip, which stands 20 over its top, up to his height) is under no paint from above the band (a fill whose clips all start over the band's top: another leg's bank soil, a river's
// water, bed and soil, a river's soil under its banks), by both painters (the ground's and the engine's own river painter), seeds 1-3,
// both settings. Planted RED on 72ea2daab: reference/qa-reports/ENG-GROUND/red-d.txt.
for (const difficulty of ['normal', 'easy'] as const) {
  for (const seed of [1, 2, 3]) {
    test(`the out-and-back toy (${difficulty}, seed ${seed}): no other leg's paint stands in his air anywhere over the race leg's band, ends and the descent's floor included`, () => {
      const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
      const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed, difficulty }) as never, difficulty) as unknown as {
        platforms: Platform[]; rivers: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: Array<{ travel: string; x0: number; x1: number; y0: number; y1: number }> } };
      };
      const legs = st.gen2?.tower?.legs ?? [];
      // (the race leg: a run leg laid wholly under another run leg it shares x with, his height clear between them; stated here, not read
      //  from the code under test)
      const run = legs.filter((l) => l.travel === 'left' || l.travel === 'right');
      const race = run.filter((l) => run.some((u) => u !== l && Math.min(u.x1, l.x1) - Math.max(u.x0, l.x0) > 0 && l.y0 >= u.y1 + 48));
      assert.ok(race.length >= 1, 'the toy lays its race leg under its out leg');
      const rp = new RealPlay('2-1', 1);
      const e = rp.e;
      Object.assign(e, { currentStage: st, platforms: st.platforms, riverUnder: new WeakMap(), riverBankOf: new WeakMap(), paintKit: true });
      setKitWorld(2);
      setGroundLook(undefined);
      setGroundPaint(true);
      // (as engine.ts sets them at a stage's start: the zones and the stage's rivers)
      setStacks(legs, st.rivers);
      const world = WORLDS_DATA.find((w: { id: number }) => w.id === 2);
      // (the most restrictive clip's top: a fill can paint nothing above it)
      const clipTop = (d: RecordingCtx['draws'][number]) => Math.max(...d.clips.map((c) => Math.min(...c.polys.flat().map((p) => p[1]))));
      const misses: string[] = [];
      let pieces = 0;
      for (const band of race) {
        const inBand = st.platforms.filter((q) => solidish(q) && q.y >= band.y0 - 2 && q.y <= band.y1 + 2);
        pieces += inBand.length;
        const x0 = Math.min(...inBand.map((q) => q.x)), x1 = Math.max(...inBand.map((q) => q.x + q.width));
        for (let vx = Math.floor(x0 / 400) * 400; vx < x1; vx += 400) {
          const here = inBand.filter((q) => q.x < vx + 900 && q.x + q.width > vx);
          if (!here.length) continue;
          const gy = Math.min(...here.map((q) => q.y));
          const view = { x0: vx, x1: vx + 900, y0: gy - 520, y1: gy + 220 };
          const r = new RecordingCtx();
          drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
          r.off = true;
          Object.assign(e.camera, { x: view.x0, y: view.y0, viewportWidth: 900, viewportHeight: 740 });
          const rr = new RecordingCtx();
          e.drawRivers(rr as unknown as CanvasRenderingContext2D, world, false);
          const from = [...r.draws.map((d) => ({ d, who: 'ground' })), ...rr.draws.map((d) => ({ d, who: 'river' }))].filter(({ d }) => d.clips.length > 0 && clipTop(d) < band.y0 - 8);
          for (const q of here)
            for (let x = Math.max(q.x + 12, vx); x <= Math.min(q.x + q.width - 12, vx + 900); x += 24)
              for (const dy of [28, 46]) {
                const y = q.y - dy;
                const hit = from.find(({ d }) => x >= d.box[0] && x <= d.box[2] && y >= d.box[1] && y <= d.box[3] && d.clips.every((c) => inside(c.polys, c.evenodd, x, y)));
                if (hit && !misses.some((m) => m.startsWith(`x ${Math.round(x)},`))) misses.push(`x ${Math.round(x)}, ${dy} over the piece at y ${Math.round(q.y)} (x ${Math.round(q.x)}-${Math.round(q.x + q.width)}): ${hit.who} paint from y ${Math.round(clipTop(hit.d))}`);
              }
        }
      }
      assert.ok(pieces >= 6, `the race leg's band has its pieces (${pieces})`);
      assert.deepEqual(misses.slice(0, 16), [], `${misses.length} points of his air over the race leg's band are under another leg's paint`);
    });
  }
}

// ENG-GROUND-d: a bank that stands ON the race leg's band (a tall wall of another leg whose collider comes down to the band: the toy's
// descent ends at one, its foot on the floor) is a wall of that level, not earth over it. With the band's zone run on under the descent the
// ceiling reached it: its line dived to the wall's foot, the wall's paint took the ceiling's clip and an underside was drawn along its foot,
// at the floor's own top, its corners turning up either side. Around such a wall the ground draws exactly as on a stage that stacks nothing.
// Planted RED with the rule off (groundStack.ts standsOn): reference/qa-reports/ENG-GROUND/red-d2.txt.
for (const difficulty of ['normal', 'easy'] as const) {
  test(`the out-and-back toy (${difficulty}): a wall standing on the race leg's band is drawn whole, as with no ceiling`, () => {
    let walls = 0;
    const diffs: string[] = [];
    for (const seed of [1, 2, 3]) {
      const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
      const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed, difficulty }) as never, difficulty) as unknown as {
        platforms: Platform[]; rivers: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: Array<{ travel: string; x0: number; x1: number; y0: number; y1: number }> } };
      };
      const legs = st.gen2?.tower?.legs ?? [];
      const run = legs.filter((l) => l.travel === 'left' || l.travel === 'right');
      const race = run.filter((l) => run.some((u) => u !== l && Math.min(u.x1, l.x1) - Math.max(u.x0, l.x0) > 0 && l.y0 >= u.y1 + 48));
      setKitWorld(2);
      setGroundLook(undefined);
      setGroundPaint(true);
      const banks = st.platforms.filter(paintedBank);
      for (const band of race) {
        // (a tall bank whose top stands well over the band and whose foot is down at it)
        for (const w of banks.filter((p) => p.y < band.y0 - 300 && p.y + p.height >= band.y0 - 2 && p.y + p.height <= band.y1 + 2)) {
          walls++;
          const mid = w.x + w.width / 2, foot = w.y + w.height;
          const view = { x0: mid - 450, x1: mid + 450, y0: foot - 520, y1: foot + 220 };
          // (every draw over the wall's span: its box and how many clips hold it)
          const shot = (stacked: boolean) => {
            setStacks(stacked ? legs : undefined, st.rivers);
            const r = new RecordingCtx();
            drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
            r.off = true;
            return r.draws.filter((d) => d.box[2] > w.x + 4 && d.box[0] < w.x + w.width - 4).map((d) => `${d.box.map((v) => Math.round(v)).join(',')} clips ${d.clips.length}`).sort();
          };
          const plain = shot(false), stacked = shot(true);
          const gained = stacked.filter((d) => !plain.includes(d)), lost = plain.filter((d) => !stacked.includes(d));
          if (gained.length || lost.length) diffs.push(`seed ${seed}: the wall x ${Math.round(w.x)}-${Math.round(w.x + w.width)} (foot ${Math.round(foot)}): ${gained.length} draws gained (${gained.slice(0, 2).join('; ')}), ${lost.length} lost`);
        }
      }
    }
    assert.ok(walls >= 3, `the toy's descent ends at a wall on the floor (${walls})`);
    assert.deepEqual(diffs, [], 'a wall standing on the band is drawn as earth over it');
  });
}

// ENG-GROUND-e, the lead's ruling (the corner, wall-end-x19900): a tall bank standing beside a lower floor (a wall, its closed side on the
// floor's end) runs its soil to the view's foot as any bank does, with no seam against the floor's soil. Its open end's face wobbles on down
// below the end piece (groundPaint endFace); on a wall 60 wide that wobble swung back in past the wall's own closed side, the soil's outline
// crossed itself and, from about y1693 down, nothing was painted past the floor's end: a straight seam at the floor's end and the backdrop
// beyond it. Judged on the toy's own roll (its descent ends at such a wall, the stage's bottom-right corner), both settings.
for (const difficulty of ['normal', 'easy'] as const) {
  test(`the out-and-back toy (${difficulty}): a wall beside a lower floor runs its soil down to the view's foot, no seam at the floor's end`, () => {
    let walls = 0;
    const gaps: string[] = [];
    for (const seed of [1, 2, 3]) {
      const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
      const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed, difficulty }) as never, difficulty) as unknown as {
        platforms: Platform[]; rivers: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: unknown } };
      };
      setKitWorld(2);
      setGroundLook(undefined);
      setGroundPaint(true);
      setStacks(st.gen2?.tower?.legs ?? [], st.rivers);
      const banks = st.platforms.filter(paintedBank);
      for (const w of banks.filter((p) => p.height >= 300 && p.width <= 120)) {
        // (closed on one side by a floor whose end meets it, 150 or more below its top; nothing on the other side)
        const floorL = banks.find((q) => q !== w && Math.abs(q.x + q.width - w.x) < 2 && q.y - w.y > 150);
        const floorR = banks.find((q) => q !== w && Math.abs(w.x + w.width - q.x) < 2 && q.y - w.y > 150);
        if (!!floorL === !!floorR) continue;
        const outside = floorL ? banks.some((q) => q !== w && q.x <= w.x + w.width + 4 && q.x + q.width > w.x + w.width + 4) : banks.some((q) => q !== w && q.x < w.x - 4 && q.x + q.width >= w.x - 4);
        if (outside) continue;
        walls++;
        const foot = w.y + w.height;
        const view = { x0: w.x - 450, x1: w.x + w.width + 450, y0: foot - 300, y1: foot + 700 };
        const r = new RecordingCtx();
        drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
        r.off = true;
        // (just past the floor's end, where its soil stops straight, at every depth from the wall's foot to the view's foot)
        const xs = floorL ? [w.x + 2] : [w.x + w.width - 2];
        const miss: number[] = [];
        for (let y = foot + 10; y <= view.y1 - 10; y += 20) if (xs.some((x) => !covered(r, x, y))) miss.push(y);
        if (miss.length) gaps.push(`seed ${seed}: the wall x ${Math.round(w.x)}-${Math.round(w.x + w.width)} (foot ${Math.round(foot)}): no soil at ${miss.length} depths, first y ${miss[0]}`);
      }
    }
    setStacks(undefined);
    assert.ok(walls >= 3, `the toy's descent ends at a wall beside its floor (${walls})`);
    assert.deepEqual(gaps, [], 'a wall\'s soil stops short of the view\'s foot');
  });
}

// ENG-WALL (R-165.380, the lead's ruling (A); ENG-GROUND-e's plant): a tall wall's painted face is never stretched past its frame's own
// aspect, and none of it shows past its bank's span. The high canopy wall's root-wall picture (protoArt drawWallArt, each world's 'wall'
// frame, a square soil cutaway with straight sides) was blitted once from its lip to the ground: on the toy's descent 806 tall from a
// 537-row frame squeezed to 244 wide, x3.4 out of shape, its straight side one long vertical edge, and 170 past a 60-wide column.
// TILE_STRETCH: STAGE-RULES.md:275 (5b 2, 'no texture stretched in strips') + 10%, the slack of a frame fitted to its bank's lip.
const TILE_STRETCH = 1.1;
for (const difficulty of ['normal', 'easy'] as const) {
  test(`the out-and-back toy (${difficulty}): no wall's painted face is stretched past its frame's own aspect, nor past its bank`, async () => {
    const { KIT_FRAMES } = await import('./kitAtlasData.ts');
    const f = KIT_FRAMES[2].wall;
    let walls = 0;
    const bad: string[] = [];
    for (const seed of [1, 2, 3]) {
      const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
      const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed, difficulty }) as never, difficulty) as unknown as {
        platforms: Platform[]; rivers: Array<{ x0: number; x1: number; surfaceY: number }>; gen2?: { tower?: { legs?: unknown } };
      };
      setKitWorld(2);
      setGroundLook(undefined);
      setGroundPaint(true);
      setStacks(st.gen2?.tower?.legs ?? [], st.rivers);
      const banks = st.platforms.filter(paintedBank);
      // (a high canopy wall: a bank with a floor 150 or more below its top meeting its left end, as drawGround's isWall)
      for (const w of banks.filter((p) => banks.some((q) => q !== p && Math.abs(q.x + q.width - p.x) < 2 && q.y - p.y > 150))) {
        const r = new RecordingCtx();
        const foot = banks.find((q) => Math.abs(q.x + q.width - w.x) < 2)!.y;
        const view = { x0: w.x - 300, x1: w.x + 500, y0: w.y - 200, y1: foot + 200 };
        drawProtoScene(r as unknown as CanvasRenderingContext2D, st.platforms, [], [], 0, view, { brokeAt: new Map(), movedAt: new Map() }, () => { r.off = true; });
        r.off = true;
        // (the frame from the sheet, or its copy baked once per world: the same size)
        const pics = r.draws.filter((d) => d.src && d.src[2] > 0 && Math.abs(d.src[2] - f.w) < f.w * 0.05 + 1 && Math.abs(d.src[3] - f.h) < f.h * 0.05 + 1 && d.box[0] < w.x + 20 && d.box[2] > w.x);
        if (!pics.length) continue;
        walls++;
        const tag = `seed ${seed}: the wall x ${Math.round(w.x)}-${Math.round(w.x + w.width)}`;
        for (const d of pics) {
          const [, , sw, sh] = d.src!, dw = d.box[2] - d.box[0], dh = d.box[3] - d.box[1];
          const k = Math.max((dh / sh) / (dw / sw), (dw / sw) / (dh / sh));
          if (k > TILE_STRETCH) bad.push(`${tag}: its face drawn ${Math.round(dw)}x${Math.round(dh)} from ${sw}x${sh}, x${k.toFixed(2)} out of shape`);
          // (past its bank: any of the face's box right of the bank's end, inside every clip in force, shows in the air)
          let past = 0;
          for (let x = w.x + w.width + 4; x < d.box[2]; x += 8) for (let y = d.box[1] + 4; y < d.box[3]; y += 16) {
            if (d.clips.every((c) => inside(c.polys, c.evenodd, x, y))) past = Math.max(past, x - (w.x + w.width));
          }
          if (past > 0) bad.push(`${tag}: its face shows ${Math.round(past)} past the bank's end`);
        }
      }
    }
    setStacks(undefined);
    assert.ok(walls >= 3, `the toy has high canopy walls with the root-wall face (${walls})`);
    assert.deepEqual(bad, [], 'a wall\'s painted face is stretched past its frame\'s aspect or shows past its bank');
  });
}
