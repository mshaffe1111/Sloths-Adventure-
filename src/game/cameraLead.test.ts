/**
 * How long an animal ahead is on screen before it reaches Pokey at a full run (QA, 2026-10-26: upright on a 320 x 782 phone a
 * first-timer running right in 1-3 lost two hearts to snakes he never saw; the snake came on screen 0.70 s before it bit).
 *
 * The real engine and its real camera (realPlay.ts, with updateCamera put back), on a flat floor in a stage 900 high (1-3's height,
 * which sets how much of the world a tall phone shows), running right at full speed at one of 1-3's snakes. The warning is the time
 * from the first frame a fair part of the snake is in view to the frame it hurts him.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { GameEngine } from './engine.ts';
import { CAM, camLag, camRun, FRAME, framing, HERO_HEAD, HUD_BAND, RUN, runLead, runOffset } from './cameraFollow.ts';
import { PHYS } from './physics.ts';

const FLOOR = 700;
/** how much of the snake must be in view before it counts as seen (px of world) */
const SEEN = 12;

function setup(w: number, h: number) {
  const r = new RealPlay('1-3', 1);
  const e = r.e;
  e.updateCamera = (GameEngine.prototype as unknown as Record<string, () => void>).updateCamera.bind(e);
  const snake0 = e.enemies.find((q: { type: string }) => q.type === 'snake');
  assert.ok(snake0, '1-3 has no snake');
  r.bare([{ id: 1, x: 0, y: FLOOR, width: 8000, height: 200, type: 'solid' } as never]);
  e.currentStage.config = { ...e.currentStage.config, levelHeight: 900 };
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  return { r, e, snake0 };
}

/** seconds the snake is on screen before it bites, and where Pokey sits across the screen (fraction of its width) as it does */
function warning(w: number, h: number): { secs: number; heroAt: number; vw: number } {
  const { r, e, snake0 } = setup(w, h);
  const snake = { ...snake0, asleep: false, x: 1500, y: FLOOR - snake0.height, patrolMinX: 1400, patrolMaxX: 1700, facing: -1, defeated: false };
  e.enemies = [snake];
  r.safe = false;
  r.stand(200, FLOOR);
  r.p.invincibleTimer = 0;
  for (let i = 0; i < 30; i++) r.frame();
  const vw: number = e.camera.viewportWidth;
  const hp0 = r.p.hp;
  let seen = -1;
  for (let i = 0; i < 300; i++) {
    r.frame({ right: true });
    const cx: number = e.camera.x;
    if (seen < 0 && Math.min(snake.x + snake.width, cx + vw) - Math.max(snake.x, cx) >= SEEN) seen = r.t;
    if (r.p.hp < hp0) {
      assert.ok(seen >= 0, `${w}x${h}: bitten by a snake that was never on screen`);
      assert.ok(Math.abs(r.p.vx) > 0 || r.p.x > 1000, 'he never got going');
      return { secs: r.t - seen, heroAt: (r.p.x - cx) / vw, vw };
    }
  }
  throw new Error(`${w}x${h}: the snake never bit (the test proves nothing)`);
}

test('upright on 320, 360 and 400 px phones a snake ahead is on screen 0.8 s or more before it bites at a full run', () => {
  const rows: string[] = [];
  for (const w of [320, 360, 400]) {
    // short and tall: a tall phone shows less width (the view never shows more height than the stage has)
    for (const h of [640, 782, 850]) {
      const { secs, heroAt, vw } = warning(w, h);
      rows.push(`${w}x${h} (${Math.round(vw)} px of world): ${secs.toFixed(2)} s, Pokey ${Math.round(heroAt * 100)}% across`);
      // (whole frames: 0.8 s is 24 of them; one frame's rounding is allowed for)
      assert.ok(secs >= 0.8 - 1 / 30 + 1e-6, `${w}x${h}: only ${secs.toFixed(2)} s of warning\n${rows.join('\n')}`);
      // and he is never shoved against the edge behind him
      assert.ok(heroAt >= RUN.back - 0.02, `${w}x${h}: Pokey is ${Math.round(heroAt * 100)}% across, too near the edge behind him`);
    }
  }
});

test('sideways nothing changes: the view already shows well over a second ahead, and takes no extra lead', () => {
  for (const [w, h] of [[844, 390], [740, 360], [568, 320], [1280, 720]]) {
    const { secs } = warning(w, h);
    assert.ok(secs > 1.5, `${w}x${h}: ${secs.toFixed(2)} s`);
    const { e } = setup(w, h);
    assert.equal(runLead(e.camera.viewportWidth), 0, `${w}x${h} takes a run lead`);
  }
});

test('the run lead only applies on narrow views, and never puts him nearer the edge behind him than RUN.back', () => {
  assert.equal(runLead(1168), 0);
  assert.equal(runLead(600), 0);
  for (const vw of [330, 360, 400, 440, 480]) {
    const lead = runLead(vw);
    assert.ok(lead > 0, `no lead on a ${vw} px view`);
    // where his middle sits at a full run: 45% across, less the look-ahead and the lead, plus the camera's trail
    const at = vw * 0.45 - CAM.lookAhead - lead + PHYS.maxRun * (1 / RUN.follow - 1 / 30);
    assert.ok(at >= vw * RUN.back - 0.5, `${vw}: his middle ${Math.round(at)} px from the edge behind`);
  }
});

test('the lead eases in with his speed and fades when he stops; backing up or standing takes none', () => {
  let k = 0;
  k = camRun(k, PHYS.maxRun, 1, 1 / 30);
  assert.ok(k > 0 && k < 0.15, `jumped to ${k}`);
  for (let i = 0; i < 60; i++) k = camRun(k, PHYS.maxRun, 1, 1 / 30);
  assert.ok(k > 0.95);
  for (let i = 0; i < 6; i++) k = camRun(k, 0, 1, 1 / 30);
  assert.ok(k < 0.1, `still ${k} after 0.2 s standing`);
  assert.equal(camRun(0, -PHYS.maxRun, 1, 1), 0, 'moving against the way he faces');
  // the part that makes up for the camera's trail is the part that fades fast
  assert.ok(Math.abs(runOffset(368, 1, 0) - Math.min(runLead(368), camLag(PHYS.maxRun, 1 / 30))) < 1e-9);
  assert.ok(Math.abs(runOffset(368, 1, 1) - runLead(368)) < 1e-9);
});

test('stopping after a run brings the view to rest: it does not carry on past him and swing back', () => {
  for (const [w, h] of [[320, 782], [400, 720], [844, 390]]) {
    const { r, e } = setup(w, h);
    e.enemies = [];
    r.stand(3000, FLOOR);
    for (let i = 0; i < 30; i++) r.frame();
    for (let i = 0; i < 60; i++) r.frame({ right: true });
    let prev: number = e.camera.x;
    let back = 0;
    let fastest = 0;
    for (let i = 0; i < 90; i++) {
      r.frame();
      const dx = e.camera.x - prev;
      prev = e.camera.x;
      if (dx < 0) back -= dx;
      fastest = Math.max(fastest, -dx);
    }
    // (a slow settle of a few px, never a swing back: under 1.5 px a frame, where a turn eases the view across at up to 13)
    assert.ok(fastest < 1.5, `${w}x${h}: the view swung back ${fastest.toFixed(1)} px in a frame after he stopped`);
    assert.ok(back < 24, `${w}x${h}: the view drifted back ${back.toFixed(1)} px after he stopped`);
  }
});

// ───── the framing by the screen's shape (QA, 2026-10-26: cramped behind him upright, too much dirt on a squat sideways screen) ─────

/** standing on the flat floor, settled: where his middle sits across the view and his feet down it (fractions) */
function standing(w: number, h: number, facing: 1 | -1 = 1) {
  const { r, e } = setup(w, h);
  e.enemies = [];
  r.stand(3000, FLOOR);
  r.p.facing = facing;
  for (let i = 0; i < 120; i++) r.frame();
  const across = (r.p.x - e.camera.x) / e.camera.viewportWidth;
  return { across: facing > 0 ? across : 1 - across, feet: (FLOOR - e.camera.y) / e.camera.viewportHeight, zoom: e.zoom as number, camY: e.camera.y as number, vh: e.camera.viewportHeight as number };
}

test('every other screen keeps the plain framing: sideways phones, tablets and desktops', () => {
  for (const [w, h] of [[844, 390], [740, 360], [932, 430], [1024, 768], [768, 1024], [1280, 720]]) {
    assert.deepEqual(framing(w, h, 1000), { look: CAM.lookAhead, back: RUN.back, feetAt: FRAME.feetAt }, `${w}x${h}`);
  }
  // (his feet 55% down, as far as the bottom of this 900 px stage lets the view go)
  const s = standing(844, 390);
  assert.ok(Math.abs(s.camY - Math.min(900 - s.vh, FLOOR - s.vh * 0.55)) < 1, `844x390: his feet ${Math.round(s.feet * 100)}% down`);
});

test('upright on a narrow phone he keeps room behind him, standing and at a run, and never less than before', () => {
  for (const [w, h, stand, run] of [[390, 844, 0.28, 0.26], [360, 782, 0.28, 0.26], [400, 720, 0.28, 0.26], [320, 782, 0.21, 0.17]]) {
    for (const facing of [1, -1] as const) {
      const s = standing(w, h, facing);
      assert.ok(s.across >= stand, `${w}x${h} facing ${facing}: standing ${Math.round(s.across * 100)}% from the edge behind him`);
    }
    const { heroAt } = warning(w, h);
    assert.ok(heroAt >= run, `${w}x${h}: at a run ${Math.round(heroAt * 100)}% from the edge behind him`);
  }
});

test('sideways on a squat screen his feet sit lower (less dirt, more sky), and his head stays under the HUD', () => {
  for (const [w, h] of [[640, 320], [782, 288], [568, 320]]) {
    const s = standing(w, h);
    assert.ok(Math.abs(s.feet - FRAME.shortFeetAt) < 0.01, `${w}x${h}: his feet ${Math.round(s.feet * 100)}% down`);
    const headCss = (FLOOR - HERO_HEAD - s.camY) * s.zoom;
    assert.ok(headCss >= HUD_BAND.land, `${w}x${h}: his head ${Math.round(headCss)} px down, under the HUD (${HUD_BAND.land})`);
  }
});
