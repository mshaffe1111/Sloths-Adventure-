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
const setStacks = (legs: unknown) => (protoArt as { setGroundStacks?: (z: unknown) => void }).setGroundStacks?.(stack?.stackZonesOf(legs as never));
const { paintedBank } = await import('./w1Pits.ts');
const { buildGen2Stage } = await import('./gen2/pipeline.ts');
const { towerCfg } = await import('./gen2/toyTower.ts');
const { homeKit, POST_CODE } = await import('./gen2/toyHome.ts');
const { w2Finish } = await import('./gen2/worlds/w2.ts');
type Platform = import('./types.ts').Platform;
type Pt = [number, number];

/** a 2D context that keeps, for every image and rect it fills, the box filled and the clips in force (paths in world units) */
class RecordingCtx {
  draws: Array<{ box: [number, number, number, number]; clips: Array<{ polys: Pt[][]; evenodd: boolean }> }> = [];
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
    this.draws.push({ box: [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0], b[0]), Math.max(a[1], b[1])], clips: [...this.clips] });
  }
  drawImage(_img: unknown, ...a: number[]) {
    if (a.length === 2) return; // (no size: an image drawn at its own size, never the soil)
    const [x, y, w, h] = a.length === 4 ? a : a.slice(4);
    this.box(x, y, w, h);
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
  // out right, down a column, home left under the way out: the home leg is the zone; a left leg beside (not under) it is not
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'right', x0: 100, x1: 5000, y0: 600, y1: 760 }, { travel: 'down', x0: 5000, x1: 5600, y0: 760, y1: 1400 }, { travel: 'left', x0: 0, x1: 5000, y0: 1400, y1: 1600 }]), [{ x0: 0, x1: 5000, y0: 1400, y1: 1600 }]);
  assert.deepEqual(stack!.stackZonesOf([{ travel: 'right', x0: 100, x1: 5000, y0: 600, y1: 760 }, { travel: 'left', x0: 5000, x1: 9000, y0: 1400, y1: 1600 }]), []);
});
