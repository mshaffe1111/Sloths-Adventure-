/**
 * CAM-THREAT (ENG-S3): a vine snake on his liana is kept in the clear view (PieceHost.focus, cameraFollow.ts focusY). Sideways the view
 * keeps his head just under the HUD band, so the tell on the bough over his liana was above the clear view: 0 of 6 tell frames seen
 * (ENG-S2's shots). Now, through the REAL engine and its real camera (realPlay.ts with updateCamera put back, as swingCam.test.ts):
 *   - sideways on three phones and upright on two, held high and low: the tell is whole in the clear view (under the HUD band, over the
 *     foot his feet are kept above) on >= 90% of its frames where its box fits, and the snake is in the clear view >= SNAKE.seen s before
 *     it reaches his hands where it does not; he is never out of the clear view; the view never steps more than CAM_RISE_STEP a frame;
 *   - gen2's verdict (vineSnake.ts snakeViewFaults) refuses a beat whose snake is not in view 1 s before it reaches his lowest hold on the
 *     squattest sideways phone, and passes 1-6.md's.
 * Planted: without host.focus (a no-op) the sideways tests go red (planted.out.txt).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { AHEAD, focusY, HUD_BAND, sideClear, FOCUS_CAM, WORLD_VIEW_H, type Box } from './cameraFollow.ts';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import { beatClock, beatDef } from './beat.ts';
import { handsAlong } from './pieces/vineSnakePiece.ts';
import type { Platform, Vine } from './types.ts';
import { SNAKE, snakeFocusBox, snakeNow, snakeViewFaults, onVine, type VineSnake } from './vineSnake.ts';

const FLOOR = 900;
const STEP = 11; // engine.ts CAM_RISE_STEP

/** the real engine and its real camera on a bare world: a ledge under a liana 400 px long (anchor 500 px over the floor), its snake on a
 *  beat (off 4, tell 0.6, trip `on`): the tell starts 4 s after he is on */
function setup(w: number, h: number, sn: Omit<VineSnake, 'clock'>, on = 4) {
  const r = new RealPlay('1-3', 1);
  const e = r.e as unknown as GameEngine & Record<string, unknown> & { camera: { x: number; y: number; viewportWidth: number; viewportHeight: number }; zoom: number; clock: ReturnType<typeof beatClock>; startPieces(): void; pieces: Array<{ kind: string }> };
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  const vine = { id: 9, x: 1300, topY: FLOOR - 500, bottomY: FLOOR - 100, vineType: 'swing_liana', isSwingingVine: true, swaySpeed: 1.1, swayPhase: 0 } as Vine;
  const plats = [{ id: 1, x: 0, y: FLOOR, width: 4000, height: 200, type: 'solid' }] as Platform[];
  r.bare(plats, [vine]);
  e.enemies = [];
  e.currentStage.config = { ...e.currentStage.config, levelHeight: 1100, levelWidth: 4000 };
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  (e as unknown as { applyZoom(): void }).applyZoom();
  vine.snake = { ...sn, clock: 'snake' };
  e.currentStage.clocks = [beatDef('snake', 4 + 0.6 + on, 0.6, on)];
  // (the beat starts at its off: 4 s off (the camera settles on him first), then the tell)
  e.clock = beatClock(e.currentStage.clocks, false, 0);
  e.currentStage.vines = [vine];
  e.startPieces();
  return { r, e, v: e.vines[0] as Vine };
}

/** the clear view now: its top under the HUD band and its foot (world px) */
function clearNow(e: { camera: { y: number; viewportHeight: number }; zoom: number; viewCssW: number; viewCssH: number }) {
  const band = (e.viewCssH > e.viewCssW ? HUD_BAND.port : HUD_BAND.land) / e.zoom;
  return { y0: e.camera.y + band, y1: e.camera.y + e.camera.viewportHeight * AHEAD.heroPad.b };
}

/** he swings on it from a hold `len` (feet that far down); per frame: is the tell whole in the clear view, is any of the snake, is he */
function watch(w: number, h: number, sn: Omit<VineSnake, 'clock'>, hold: number, on = 4) {
  const { r, e, v } = setup(w, h, sn, on);
  r.swing(v, { angle: 0.05, omega: 0.2, len: hold });
  const len = v.bottomY - v.topY;
  let tellFrames = 0, tellSeen = 0, tripSeen = 0, gave = 0, heroOut = '', maxStep = 0, touched = false, focusFrames = 0;
  let lastY = e.camera.y;
  for (let i = 0; i < 30 * 11 && !touched; i++) {
    const read = e.clock.read('snake');
    r.frame();
    if (!r.p.isVineSwinging) {
      touched = true;
      break;
    }
    // (from 1.5 s on: the view's own first catch-up to him on the bare world, and the upright swing's widening, are not the focus)
    if (i > 45) maxStep = Math.max(maxStep, Math.abs(e.camera.y - lastY));
    lastY = e.camera.y;
    const c = clearNow(e);
    const a = v.swingAngle ?? 0;
    const n = snakeNow(v.snake!, len, read);
    // (his body, feet at p.y and his head HERO_HEAD over them, while the snake's piece asks for the focus: the focus's promise)
    const focused = !!(e as unknown as { camFocus: Box | null }).camFocus;
    if (focused) focusFrames++;
    if (focused && (r.p.y - 104 < c.y0 - 1 || r.p.y + 12 > c.y1 + 1)) heroOut ||= `frame ${i}: him ${Math.round(r.p.y - 104)}..${Math.round(r.p.y + 12)}, clear ${Math.round(c.y0)}..${Math.round(c.y1)}`;
    if (!n.shown) continue;
    gave += 1 / 30;
    if (n.tell) {
      tellFrames++;
      const d = n.dir === 1 ? 0 : len;
      const ty = v.topY + Math.cos(a) * d;
      if (ty - SNAKE.tellH >= c.y0 - 0.5 && ty <= c.y1 + 0.5) tellSeen++;
      continue;
    }
    const s = onVine(n, len);
    if (s && v.topY + Math.cos(a) * s.to >= c.y0 && v.topY + Math.cos(a) * s.from <= c.y1) tripSeen++;
  }
  return { tellFrames, tellSeen, seen: (tellSeen + tripSeen) / 30, gave, heroOut, maxStep, touched, focusFrames, hands: handsAlong(hold, len), len };
}

const SIDE = [[915, 412], [844, 390], [782, 288]] as const;
const UP = [[412, 915], [390, 844]] as const;

test('sideways, held HIGH (the box fits): the snake\'s tell on the bough is whole in the clear view on >= 90% of its frames (it was 0/6), the view never steps more than CAM_RISE_STEP, he never leaves it', () => {
  for (const [w, h] of SIDE) {
    // (a hold whose box fits on this phone: the anchor's tell over him and his feet, within the clear view)
    const c = sideClear(h);
    const hold = Math.floor(c.foot - c.top - SNAKE.tellH - 12 - 6);
    const o = watch(w, h, { route: 'down-off' }, hold);
    assert.ok(o.tellFrames >= 17, `${w}x${h}: the tell ran (${o.tellFrames} frames)`);
    assert.ok(o.tellSeen >= 0.9 * o.tellFrames, `${w}x${h} held ${hold}: the tell was whole in the clear view ${o.tellSeen}/${o.tellFrames} frames`);
    assert.equal(o.heroOut, '', `${w}x${h}: he left the clear view (${o.heroOut})`);
    assert.ok(o.maxStep <= STEP + 1e-6, `${w}x${h}: the view stepped ${o.maxStep.toFixed(1)} px in a frame`);
    assert.ok(o.touched, `${w}x${h}: it reached his hands`);
    assert.ok(o.focusFrames >= 30 * (FOCUS_CAM.lead + 0.6) - 2, `${w}x${h}: the focus was asked ${o.focusFrames} frames`);
  }
});

test('sideways, held LOW (the box cannot fit): he stays whole at the foot of the clear view and the snake is in it >= SNAKE.seen s before it reaches his hands; no snap', () => {
  for (const [w, h] of SIDE) {
    const o = watch(w, h, { route: 'down-off' }, 400);
    assert.ok(o.touched, `${w}x${h}: it reached his hands`);
    assert.equal(o.heroOut, '', `${w}x${h}: he left the clear view (${o.heroOut})`);
    assert.ok(o.seen >= SNAKE.seen - 1 / 30, `${w}x${h} held low: the snake was in the clear view ${o.seen.toFixed(2)} s of ${o.gave.toFixed(2)} s before it reached his hands`);
    assert.ok(o.maxStep <= STEP + 1e-6, `${w}x${h}: the view stepped ${o.maxStep.toFixed(1)} px in a frame`);
    // (the verdict agrees at the lowest hold on every phone: it names none there)
    assert.ok(!snakeViewFaults({ route: 'down-off', clock: 'snake' }, o.len, beatDef('snake', 8.6, 0.6, 4).phases, h).some((f) => /held at 400 px/.test(f)), `${w}x${h}: the verdict refused the low hold the engine shows`);
  }
});

test('the verdict and the real engine agree: on the squattest phone a 4 s trip is too quick at a middle hold (the tell cut by the HUD, 118 px of trip seen); a 6 s trip is not', () => {
  const sn = { route: 'down-off' as const };
  const quick = snakeViewFaults({ ...sn, clock: 'snake' }, 400, beatDef('snake', 8.6, 0.6, 4).phases, 288);
  assert.ok(quick.some((f) => /held at 220 px/.test(f)), `the verdict passed a middle hold it cannot show: ${quick.join(' | ')}`);
  const o = watch(782, 288, sn, 220);
  assert.ok(o.touched && o.seen < SNAKE.seen, `the engine showed it ${o.seen.toFixed(2)} s: the verdict refused a lay the screen shows`);
  assert.deepEqual(snakeViewFaults({ ...sn, clock: 'snake' }, 400, beatDef('snake', 10.6, 0.6, 6).phases, 288), []);
  const slow = watch(782, 288, sn, 220, 6);
  assert.ok(slow.touched && slow.seen >= SNAKE.seen - 1 / 30, `a 6 s trip at the middle hold: in view ${slow.seen.toFixed(2)} s`);
});

test('upright, high and low: the tell is whole in the clear view on >= 90% of its frames (the tall view fits the box)', () => {
  for (const [w, h] of UP) {
    for (const hold of [220, 400]) {
      const o = watch(w, h, { route: 'down-off' }, hold);
      assert.ok(o.tellSeen >= 0.9 * o.tellFrames && o.tellFrames >= 17, `${w}x${h} held ${hold}: tell ${o.tellSeen}/${o.tellFrames}`);
      assert.equal(o.heroOut, '', `${w}x${h}: ${o.heroOut}`);
      assert.ok(o.maxStep <= STEP + 1e-6, `${w}x${h}: stepped ${o.maxStep.toFixed(1)} px`);
    }
  }
});

test('a snake rising from the foot: the focus keeps the foot\'s tell in view under him, sideways, at a middle hold', () => {
  for (const [w, h] of SIDE) {
    const o = watch(w, h, { route: 'up', reach: 0.7 }, 300);
    assert.ok(o.tellSeen >= 0.9 * o.tellFrames && o.tellFrames >= 17, `${w}x${h}: tell ${o.tellSeen}/${o.tellFrames}`);
    assert.equal(o.heroOut, '', `${w}x${h}: ${o.heroOut}`);
  }
});

test('focusY: the box between the HUD band and the foot, moved as little as does it; too tall, him whole on the side the box reaches further', () => {
  const vh = WORLD_VIEW_H, band = 150, foot = vh * AHEAD.heroPad.b;
  const hero: Box = { x0: 0, x1: 60, y0: 300, y1: 416 };
  // (fits: an aim that already shows it is left alone; one too low comes up just enough)
  const box: Box = { x0: 0, x1: 60, y0: 200, y1: 416 };
  assert.equal(focusY(20, box, hero, vh, band), 20);
  assert.equal(focusY(80, box, hero, vh, band), box.y0 - FOCUS_CAM.pad - band);
  // (too tall above him: his feet at the foot of the clear view; below him: his head under the band)
  assert.equal(focusY(80, { ...box, y0: -200 }, hero, vh, band), hero.y1 - foot);
  assert.equal(focusY(-500, { ...box, y1: 1200 }, hero, vh, band), hero.y0 - band);
});

test('gen2\'s view verdict: a snake too quick to be seen 1 s on the squattest phone sideways is refused; 1-6.md\'s beat-7 pace passes', () => {
  // (1-6.md beat 7: "a whole swing at least (2.85 s) before it reaches his grip": a 410 px liana, a 6 s trip off the foot)
  assert.deepEqual(snakeViewFaults({ route: 'down-off', clock: 'c' }, 410, beatDef('c', 12, 0.6, 6).phases), []);
  const quick = snakeViewFaults({ route: 'down-off', clock: 'c' }, 410, beatDef('c', 12, 0.6, 2).phases);
  assert.ok(quick.length > 0 && /held at 410 px/.test(quick.join('\n')), `a 2 s trip is too quick at the lowest hold: ${quick[0]}`);
  // (and on a tall phone sideways, where the box fits higher, the same quick snake still fails at its lowest hold)
  assert.ok(snakeViewFaults({ route: 'down-off', clock: 'c' }, 410, beatDef('c', 12, 0.6, 2).phases, 412).length > 0);
  // a false liana and a snake with no beat are not the verdict's (snakeBeatFaults names the second)
  assert.deepEqual(snakeViewFaults({ route: 'still' }, 410, []), []);
  assert.equal(FOCUS_CAM.shortest, 288);
  // (the box the verdict judges is the piece's own: his feet and the tell over the anchor)
  const b = snakeFocusBox({ route: 'down-off', clock: 'c' }, 410, 0, 0, 0, 0, 300);
  assert.ok(b.y0 === -SNAKE.tellH && b.y1 === 312);
  void FLOOR;
});
