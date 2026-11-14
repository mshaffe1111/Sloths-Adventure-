/**
 * The swing camera and the FAR cap (R-165.225; Matt, 2026-11-14 2:02 AM ET: "shorter swings", every liana's landing fits upright).
 * Upright a phone shows ~405-440 px of world and a liana throws him 400 px and more past its anchor, so on Matt's mock-up (A1-SWING
 * upright-abc.png) no FAR landing was ever in view: a jump the player cannot see. Now, upright, the view eases out while he swings
 * (at most SWING_CAM.out, Pokey 77% of his size), leads with the WHOLE perch (perchBox), lifts the level's height floor while it does
 * (the extra is sky), and eases back in once he is down; and gen2 lays a dialled liana's perch only where the presses that land him
 * see it whole (SWING_SEEN, pipeline lianaRelease). Each test is red without its part.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { AHEAD, heroBox, landingAhead, perchBox, showBoth, SWING_CAM, SWING_SEEN, swingWideEase, swingWideTarget, type Box } from './cameraFollow.ts';
import { LETGO_FLIGHTS, pressWindow, setTimedSwing, type AirBody } from './physics.ts';
import { lianaRelease } from './gen2/pipeline.ts';
import { gripsOf } from './levelCheck.ts';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import type { Platform, Vine } from './types.ts';

/** World 1's liana (1-6.md, gen2 w1Liana): anchor 400 px over the bough, 410 px long, Normal's self-swing */
const LIANA = { x: 0, topY: 0, bottomY: 410, swingAmp: 0.45, swingPeriod: 2.85, swingPhase: 0 };
const BOUGH_Y = 400;
const inView = (b: Box, v: { x: number; y: number }, vw: number, vh: number, P: { l: number; r: number; t: number; b: number } = AHEAD.pad) =>
  b.x0 >= v.x + vw * P.l - 1 && b.x1 <= v.x + vw * P.r + 1 && b.y0 >= v.y + vh * P.t - 1 && b.y1 <= v.y + vh * P.b + 1;

/** every press of one swing at the foot that lands him on a perch (near end `near` past the anchor, `w` wide): where he is as he presses */
function landingPresses(near: number, w: number): Array<{ x: number; y: number }> {
  setTimedSwing(false);
  const out: Array<{ x: number; y: number }> = [];
  const hits = (c: AirBody, _t: number, prevY: number) => c.vy >= 0 && prevY <= BOUGH_Y + 14 && c.y >= BOUGH_Y && c.x > near + 10 && c.x < near + w;
  pressWindow(LIANA, hits, LETGO_FLIGHTS, gripsOf('low', LIANA.bottomY - LIANA.topY), (x, y) => (out.push({ x, y }), true));
  return out;
}

test('THE FAR CAP is the camera\'s own: every press that sees the perch under SWING_SEEN has it whole in view beside him at the full ease', () => {
  // the narrowest gate phone (412 x 915) on a 900 px level: its usual view, eased out the whole way
  const vw = SWING_CAM.refVw * SWING_CAM.out;
  const vh = vw * (915 / 412);
  let seen = 0;
  for (const [near, w] of [[460, 120], [500, 120], [480, 140], [380, 240], [340, 280]] as const) {
    for (const r of landingPresses(near, w)) {
      if (near + w > r.x + SWING_SEEN) continue;
      seen++;
      // the camera's aim (engine.ts updateCamera: 45% across, feet 55% down) moved as little as shows him and the whole perch
      const feet = r.y + 60;
      const plain = { x: r.x - vw * 0.45, y: feet - vh * 0.55 };
      const box = perchBox(near, near + w, BOUGH_Y, 1);
      const v = showBoth(plain.x, plain.y, r.x, feet, box, vw, vh);
      assert.ok(inView(box, v, vw, vh), `a ${w} px perch ${near} px out: not whole in view as he presses at x ${Math.round(r.x)}`);
      assert.ok(inView(heroBox(r.x, feet), v, vw, vh, AHEAD.heroPad), `and Pokey left the view (x ${Math.round(r.x)})`);
    }
  }
  assert.ok(seen >= 20, `only ${seen} seen presses: the test proves nothing`);
});

test('gen2 lays a dialled liana\'s perch only where its landing presses see it whole: 1-6.md\'s old FAR (540 px, a 240 px bough) is gone', () => {
  const v = { x: LIANA.x, topY: LIANA.topY, bottomY: LIANA.bottomY };
  const sw = { amp: 0.45, period: 2.85, grip: 'low' as const };
  // (the perch's width did not matter to the window before: he lands on its near part; now its far end must be seen)
  assert.equal(lianaRelease(v, sw, { x: 540, y: BOUGH_Y, w: 240 }, 'normal'), 0, 'a 240 px perch 540 px out is past what he sees as he presses');
  assert.equal(lianaRelease(v, sw, { x: 420, y: BOUGH_Y, w: 240 }, 'normal'), 0, 'and so is one 420 px out');
  assert.ok(lianaRelease(v, sw, { x: 480, y: BOUGH_Y, w: 120 }, 'normal') >= 0.4, 'a narrow FAR perch 480 px out still gives the foot its window');
  // a dial-free liana (Worlds 6-8) is as it was: its window does not look at the perch's far end
  const free = { amp: 0.45, period: 2.85 };
  assert.equal(lianaRelease(v, free, { x: 380, y: BOUGH_Y, w: 240 }, 'normal'), lianaRelease(v, free, { x: 380, y: BOUGH_Y, w: 120 }, 'normal'));
});

test('a swing\'s landing is the WHOLE perch, end to end (at most SWING_CAM.perch of a long one); off a ledge it is still the lip', () => {
  const hang = { x: 0, y: 440, width: 0 };
  const perch = { x: 480, y: BOUGH_Y, width: 130 };
  const whole = landingAhead(0, 1, hang, [perch], [], true)!;
  assert.ok(whole.x0 <= 480 && whole.x1 >= 610, `the whole 130 px perch (got ${whole.x0}..${whole.x1})`);
  const long = landingAhead(0, 1, hang, [{ x: 480, y: BOUGH_Y, width: 2000 }], [], true)!;
  assert.equal(long.x1, 480 + SWING_CAM.perch, 'of a long bough, its first SWING_CAM.perch');
  const lip = landingAhead(0, 1, hang, [perch])!;
  assert.ok(lip.x1 < 560, 'the plain look across a gap keeps landingBox\'s lip');
  // leftward the same, mirrored
  const back = landingAhead(0, -1, hang, [{ x: -610, y: BOUGH_Y, width: 130 }], [], true)!;
  assert.ok(back.x0 <= -610 && back.x1 >= -480);
});

test('the swing ease: upright only, out to at most SWING_CAM.out in ~0.67 s, back in ~1 s; settles exactly', () => {
  const land = perchBox(480, 600, BOUGH_Y, 1);
  assert.equal(swingWideTarget(false, true, 0, land, 1168), 1, 'sideways it never widens');
  assert.equal(swingWideTarget(true, false, 0, land, 405), 1, 'off the swing: the usual view');
  assert.equal(swingWideTarget(true, true, 0, null, 405), 1, 'no landing ahead: the usual view');
  assert.equal(swingWideTarget(true, true, 0, land, 405), SWING_CAM.out, 'a FAR perch: the whole ease');
  const near = swingWideTarget(true, true, 0, perchBox(200, 300, BOUGH_Y, 1), 405);
  assert.ok(near < SWING_CAM.out && near >= 1, 'a near perch: only as much as it needs');
  let k = 1;
  for (let i = 0; i < 20; i++) k = swingWideEase(k, SWING_CAM.out, 1 / 30);
  assert.ok(k >= 1 + 0.95 * (SWING_CAM.out - 1), `out: ${k.toFixed(3)} after 0.67 s`);
  for (let i = 0; i < 60; i++) k = swingWideEase(k, SWING_CAM.out, 1 / 30);
  assert.equal(k, SWING_CAM.out);
  for (let i = 0; i < 30; i++) k = swingWideEase(k, 1, 1 / 30);
  assert.ok(k <= 1 + 0.05 * (SWING_CAM.out - 1) + 1e-9, `in: ${k.toFixed(3)} after 1 s`);
});

// ── the real engine and its real camera (realPlay.ts with updateCamera put back), a 900 px level ──
const FLOOR = 700;
function setup(w: number, h: number, plats: Array<Partial<Platform>>, vines: Array<Partial<Vine>>) {
  const r = new RealPlay('1-3', 1);
  const e = r.e;
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  r.bare(plats as Platform[], vines as Vine[]);
  e.enemies = [];
  e.currentStage.config = { ...e.currentStage.config, levelHeight: 900 };
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  return { r, e };
}
const ledge = (id: number, x: number, width: number): Partial<Platform> => ({ id, x, y: FLOOR, width, height: 200, type: 'solid' });

test('the real engine, upright: swinging toward a FAR perch, the view eases out past the level\'s height (sky over it), shows the WHOLE perch at every frame gen2 counts as seeing it, and eases back in once he is down', () => {
  // the liana 400 px over the bough he left (anchor at 1300), a 120 px perch 480 px past the anchor, level with the bough
  const vine: Partial<Vine> = { id: 9, x: 1300, topY: FLOOR - 400, bottomY: FLOOR + 10, vineType: 'swing_liana', isSwingingVine: true, swaySpeed: 1.1, swayPhase: 0 };
  const perch = ledge(2, 1300 + 480, 120);
  for (const [w, h] of [[412, 915], [390, 844], [400, 880]] as const) {
    const { r, e } = setup(w, h, [ledge(1, 0, 1100), perch, ledge(3, 2400, 2000)], [vine]);
    const usual = e.zoom as number;
    const usualVw = e.camera.viewportWidth as number;
    r.swing(vine as Vine, { angle: -0.4, omega: 0.5, len: 400 });
    let sweetSeen = 0;
    let sweetMissed = '';
    for (let i = 0; i < 240; i++) {
      r.frame({ right: true });
      assert.ok(r.p.isVineSwinging, 'still on the liana');
      // (after the ease has had a swing to settle, at every frame of a forward sweep from which gen2 counts a press as seeing the
      // perch: SWING_SEEN, the cap's own claim)
      const om = r.p.swingAngularVelocity ?? 0;
      if (i >= 30 && om > 0 && r.p.x + SWING_SEEN >= 1780 + 120) {
        const vx = e.camera.x as number, vwNow = e.camera.viewportWidth as number;
        if (1780 + 120 <= vx + vwNow * AHEAD.pad.r + 1 && r.p.x - 28 >= vx) sweetSeen++;
        else sweetMissed ||= `x ${Math.round(r.p.x)} view ${Math.round(vx)}..${Math.round(vx + vwNow)}`;
      }
    }
    assert.ok(e.zoom < usual / 1.29, `${w}x${h}: the view did not ease out (zoom ${e.zoom.toFixed(3)} vs ${usual.toFixed(3)})`);
    assert.ok(e.camera.viewportWidth > usualVw * 1.29, `${w}x${h}: ${Math.round(e.camera.viewportWidth)} px wide, usual ${Math.round(usualVw)}`);
    assert.ok(e.camera.viewportHeight > 900, `${w}x${h}: the level's height still caps it (${Math.round(e.camera.viewportHeight)} px tall)`);
    assert.ok(Math.abs(e.camera.y + e.camera.viewportHeight - 900) < 1, `${w}x${h}: the view's foot is the level's foot`);
    assert.equal(sweetMissed, '', `${w}x${h}: the whole perch was out of view where SWING_SEEN says he sees it (${sweetMissed})`);
    assert.ok(sweetSeen >= 20, `${w}x${h}: only ${sweetSeen} seeing frames (the test proves nothing)`);
    // down on the perch: back in to the usual view (95% in a second, settled within two)
    r.stand(1300 + 520, FLOOR);
    for (let i = 0; i < 60; i++) r.frame();
    assert.ok(Math.abs(e.zoom - usual) < 1e-6, `${w}x${h}: still widened after landing (zoom ${e.zoom.toFixed(3)})`);
  }
});

test('the real engine, sideways: a swing never widens the view', () => {
  const vine: Partial<Vine> = { id: 9, x: 1300, topY: FLOOR - 400, bottomY: FLOOR + 10, vineType: 'swing_liana', isSwingingVine: true, swaySpeed: 1.1, swayPhase: 0 };
  const { r, e } = setup(844, 390, [ledge(1, 0, 1100), ledge(2, 1780, 120), ledge(3, 2400, 2000)], [vine]);
  const usual = e.zoom as number;
  r.swing(vine as Vine, { angle: -0.4, omega: 0.5, len: 400 });
  for (let i = 0; i < 60; i++) r.frame({ right: true });
  assert.equal(e.zoom, usual);
});
