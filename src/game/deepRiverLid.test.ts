/**
 * A DEEP river on a leg another leg runs under has a bed: its painted water strip, then the banks' own earth down to the ceiling, where the
 * underside ends it (READY-27; the lead's blocker for 2-7's link). Before, the deep river's flat fill (riverArt.ts RIVER_DEEP) ran from the
 * strip's foot down to the ceiling: on the out-and-back toy, upright on the race leg, the out leg's deep river hung over him as a flat
 * dark-teal panel (reference/qa-reports/READY-27/teal-before-after.jpg). A river with no leg under it is drawn as before: its deep fill runs
 * to the view's foot. This runs the engine's own river painter (engine.ts drawRivers) on the toy's roll, both settings, into a canvas that
 * keeps every fill's colour and box and every image's box.
 *   npx tsx --test src/game/deepRiverLid.test.ts
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

const { setGroundLook, setGroundPaint, setKitWorld, setGroundStacks, riverLid } = await import('./protoArt.ts');
const { stackZonesOf, ceilingAt } = await import('./groundStack.ts');
const { RIVER_DEEP, riverPaintFoot } = await import('./riverArt.ts');
const { buildGen2Stage } = await import('./gen2/pipeline.ts');
const { towerCfg } = await import('./gen2/toyTower.ts');
const { homeKit, POST_CODE } = await import('./gen2/toyHome.ts');
const { w2Finish } = await import('./gen2/worlds/w2.ts');
const { RealPlay } = await import('./realPlay.ts');
const { WORLDS_DATA } = await import('./worldsData.ts');
type Platform = import('./types.ts').Platform;
type River = { x0: number; x1: number; surfaceY: number; safe?: unknown };

/** keeps every fillRect (its colour) and every sized image, as boxes in world px (drawRivers draws in world px, no transform) */
class Rec {
  fills: Array<{ style: unknown; x0: number; y0: number; x1: number; y1: number }> = [];
  images: Array<{ x0: number; y0: number; x1: number; y1: number }> = [];
  fillStyle: unknown = '#000'; strokeStyle: unknown = '#000'; globalAlpha = 1; globalCompositeOperation = 'source-over'; lineWidth = 1;
  filter = 'none'; imageSmoothingEnabled = true;
  fillRect(x: number, y: number, w: number, h: number) { this.fills.push({ style: this.fillStyle, x0: x, y0: y, x1: x + w, y1: y + h }); }
  drawImage(_i: unknown, ...a: number[]) {
    if (a.length === 2) return;
    const [x, y, w, h] = a.length === 4 ? a : a.slice(4);
    this.images.push({ x0: x, y0: y, x1: x + w, y1: y + h });
  }
  private path: Array<[number, number]> = [];
  /** a filled path's box (the over pass's water: its gradient from the surface down) */
  paths: Array<{ x0: number; y0: number; x1: number; y1: number }> = [];
  beginPath() { this.path = []; }
  moveTo(x: number, y: number) { this.path.push([x, y]); }
  lineTo(x: number, y: number) { this.path.push([x, y]); }
  rect(x: number, y: number, w: number, h: number) { this.path.push([x, y], [x + w, y + h]); }
  fill() {
    if (!this.path.length) return;
    const xs = this.path.map((p) => p[0]), ys = this.path.map((p) => p[1]);
    this.paths.push({ x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) });
  }
  save() {} restore() {} closePath() {} clip() {} stroke() {}
  quadraticCurveTo() {} bezierCurveTo() {} arc() {} ellipse() {} translate() {} scale() {} rotate() {} setTransform() {} transform() {}
  resetTransform() {} fillText() {} strokeText() {} clearRect() {} setLineDash() {}
  measureText() { return { width: 0 }; }
  createLinearGradient() { return { addColorStop() {} }; }
  createRadialGradient() { return { addColorStop() {} }; }
  createPattern() { return {}; }
  getImageData() { return { data: new Uint8ClampedArray(4) }; }
  putImageData() {}
}

for (const difficulty of ['normal', 'easy'] as const) {
  test(`a deep river over a lower leg (${difficulty}): its flat fill ends at its strip's foot and the earth runs on to the ceiling; one with no leg under it is unchanged`, () => {
    const cfg = { ...towerCfg('2-97', 'sprint'), unlocked: true };
    const st = w2Finish(buildGen2Stage({ config: cfg, kit: homeKit('2-97', POST_CODE), seed: 1, difficulty }) as never, difficulty) as unknown as {
      platforms: Platform[]; rivers: River[]; gen2?: { tower?: { legs?: unknown } };
    };
    // (a World 2 engine, its stage swapped for the toy's; the painter's world and stacked zones set as the engine's stage start sets them)
    const e = new RealPlay('2-1', 1).e as unknown as Record<string, unknown> & { camera: Record<string, number>; drawRivers: (c: unknown, w: unknown, over: boolean) => void };
    setKitWorld(2);
    setGroundLook(undefined);
    setGroundPaint(true);
    setGroundStacks(stackZonesOf(st.gen2?.tower?.legs as never), st.rivers);
    Object.assign(e, { currentStage: st, platforms: st.platforms, riverUnder: new WeakMap(), riverBankOf: new WeakMap(), paintKit: true });
    const world = WORLDS_DATA.find((w: { id: number }) => w.id === 2);
    const deep = st.rivers.filter((r) => !r.safe);
    const lidded = deep.filter((r) => riverLid(st.platforms, r.x0, r.x1, r.surfaceY));
    const open = deep.filter((r) => !riverLid(st.platforms, r.x0, r.x1, r.surfaceY));
    assert.ok(lidded.length >= 1, `the toy has a deep river over the race leg (${deep.length} deep)`);
    assert.ok(open.length >= 1, 'and a deep river with no leg under it');
    const paint = (r: River, over = false) => {
      const rec = new Rec();
      Object.assign(e.camera, { x: (r.x0 + r.x1) / 2 - 300, y: r.surfaceY - 200, viewportWidth: 600, viewportHeight: 900 });
      e.drawRivers(rec, world, over);
      // (this river's fills only: its x span)
      const mine = (b: { x0: number; x1: number }) => b.x0 < r.x1 && b.x1 > r.x0;
      return { fills: rec.fills.filter(mine), images: rec.images.filter(mine), paths: rec.paths.filter(mine), bottom: r.surfaceY - 200 + 900 };
    };
    const bad: string[] = [];
    for (const r of lidded) {
      const lid = riverLid(st.platforms, r.x0, r.x1, r.surfaceY)!;
      const mid = (r.x0 + r.x1) / 2;
      const line = Math.min(...lid.filter((c) => mid >= c.x0 && mid <= c.x1).map((c) => ceilingAt(c, mid)));
      const foot = riverPaintFoot(r.surfaceY, false);
      const { fills, images } = paint(r);
      // (the flat deep fill never runs below the strip's foot: it ran to the view's foot, the lid's clip leaving a flat panel to the ceiling)
      const panel = fills.filter((f) => f.style === RIVER_DEEP && f.y1 > foot + 1);
      if (panel.length) bad.push(`deep river x ${Math.round(r.x0)}: its flat fill runs to y ${Math.round(Math.max(...panel.map((f) => f.y1)))}, ${Math.round(line - foot)} px of panel over the race leg`);
      // (and the earth is drawn there instead: a painted image holds the point half way from the strip's foot to the ceiling)
      const y = (foot + line) / 2;
      if (Number.isFinite(line) && line > foot + 20 && !images.some((b) => mid >= b.x0 && mid <= b.x1 && y >= b.y0 && y <= b.y1)) bad.push(`deep river x ${Math.round(r.x0)}: no earth painted under its water at y ${Math.round(y)}`);
      // (and the pass over the logs (the water they sink into, 75% of the deep colour) ends there too: it ran to the view's foot and dimmed
      //  the bed's earth to the same dark teal, the lead's re-check of the first fix's still)
      const veil = paint(r, true).paths.filter((p) => p.y1 > foot + 1);
      if (veil.length) bad.push(`deep river x ${Math.round(r.x0)}: the water over its logs runs to y ${Math.round(Math.max(...veil.map((p) => p.y1)))}, over its bed`);
    }
    assert.deepEqual(bad, []);
    // (a deep river with no leg under it: its flat fill runs to the view's foot as it always has)
    for (const r of open) {
      const { fills, bottom } = paint(r);
      assert.ok(fills.some((f) => f.style === RIVER_DEEP && f.y1 >= bottom - 1), `open deep river x ${Math.round(r.x0)}: its deep fill runs to the view's foot`);
      assert.ok(paint(r, true).paths.some((p) => p.y1 >= bottom - 1), `open deep river x ${Math.round(r.x0)}: the water over its logs runs to the view's foot`);
    }
  });
}
