// The camera's re-pick ease (cameraFollow.ts repick; FEEL-CAM, R-165.214 second half; Matt 11-13: getting on and off vines "not very
// smooth"). Planted from the measure on the real page (tools/inspect/camFeel.mjs, 1-4 both ways): the anchor re-picked in one frame at
// a grab (91 px), a leap's catch (62) and the landing after jumping off a trunk (140), and the view went from rest to 14-28 css px a
// frame in one frame. Here: a re-pick starts the view from rest; a move that does not jump frames EXACTLY as before (a climb, a run, a
// fall); a cut (respawn, flag, door, the camera put somewhere) is followed at once; the fastest fall never leaves him further out of the
// view than before; and on the real engine every vine move on three stages of two worlds keeps the view's jerk small.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { camAnchor, CAM, newRepick, repick, markCam, REPICK, RUN, travelFeet, HERO_HEAD, HUD_BAND, type CamSubject } from './cameraFollow.ts';
import { towerLead } from './gen2/tower.ts';
import { PHYS } from './physics.ts';
import { RealPlay, DT } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { moves } from '../../tools/inspect/vineFeel.ts';

const VW = 440, VH = 790;

/** a camera like updateCamera's: the anchor, the eased subject (or not), the first-order follow; returns the view's y per frame */
function fly(path: Array<{ x: number; s: CamSubject }>, eased: boolean, feet = 0.55): { cy: number[]; feetOn: number[] } {
  const r = newRepick();
  let an = NaN, cy = NaN;
  const out = { cy: [] as number[], feetOn: [] as number[] };
  for (const { x, s } of path) {
    const prev = an;
    an = camAnchor(prev, s, VH);
    const y = eased ? repick(r, x, an, prev, s, VW, VH, DT, 0, Number.isFinite(cy) ? cy : 0).y : an;
    const ty = y - VH * feet;
    cy = Number.isFinite(cy) ? cy + (ty - cy) * Math.min(1, DT * RUN.follow) : ty;
    markCam(r, 0, cy);
    out.cy.push(cy);
    out.feetOn.push(s.y - cy);
  }
  return out;
}
const jerk = (v: number[]): number => {
  let w = 0;
  for (let i = 2; i < v.length; i++) w = Math.max(w, Math.abs(v[i] - 2 * v[i - 1] + v[i - 2]));
  return w;
};

test('a grab after a jump: the view starts from rest (planted: the one-frame re-pick moved it 20 px from rest)', () => {
  // standing at 8203, a jump that rises 90 px, caught on a trunk at 8112, then climbed up at 7 px a frame
  const path = [
    ...Array.from({ length: 8 }, () => ({ x: 1000, s: { y: 8203, grounded: true } })),
    ...Array.from({ length: 6 }, (_, k) => ({ x: 1000 + 8 * k, s: { y: 8203 - 15 * (k + 1), grounded: false } })),
    ...Array.from({ length: 40 }, (_, k) => ({ x: 1048, s: { y: 8112 - 7 * k, grounded: false, climbing: true } })),
  ];
  const before = jerk(fly(path, false).cy), after = jerk(fly(path, true).cy);
  assert.ok(before > 15, `the planted cut is there without the ease (${before.toFixed(1)} px)`);
  assert.ok(after <= 4, `jerk ${after.toFixed(1)} px (was ${before.toFixed(1)})`);
});

test('the landing after jumping off a trunk eases in (planted: 140 px re-picked in one frame)', () => {
  const path = [
    ...Array.from({ length: 6 }, () => ({ x: 900, s: { y: 8063, grounded: false, climbing: true } })),
    ...Array.from({ length: 10 }, (_, k) => ({ x: 900 - 9 * k, s: { y: 8063 + 14 * (k + 1), grounded: false } })),
    ...Array.from({ length: 40 }, () => ({ x: 810, s: { y: 8203, grounded: true } })),
  ];
  const before = jerk(fly(path, false).cy), after = jerk(fly(path, true).cy);
  assert.ok(before > 20, `planted (${before.toFixed(1)})`);
  assert.ok(after <= 4, `jerk ${after.toFixed(1)} px (was ${before.toFixed(1)})`);
});

test('a move that does not jump frames exactly as before: a run, a turn, a climb, a hop, a fall followed down', () => {
  const r = newRepick();
  let an = NaN, x = 500, vx = 0, y = 700;
  const at = (s: CamSubject) => {
    const prev = an;
    an = camAnchor(prev, s, VH);
    const e = repick(r, x, an, prev, s, VW, VH, DT, 0, 0);
    markCam(r, 0, 0);
    assert.equal(e.x, x, 'x is his body exactly');
    assert.ok(Math.abs(e.y - an) < 1e-9, `y is the anchor exactly (${e.y} vs ${an})`);
  };
  // a run up to full speed, a turn (he slows and turns over a few frames), a run back
  for (let k = 0; k < 90; k++) {
    const want = k < 50 ? PHYS.maxRun : -PHYS.maxRun;
    vx += Math.max(-60, Math.min(60, want - vx));
    at({ y, grounded: true });
    x += vx * DT;
  }
  // a climb up a vine at 7 px a frame
  for (let k = 0; k < 30; k++) at({ y: (y -= 7), grounded: false, climbing: true });
  // a hop off it and back onto it, then a long fall off its side, followed down by the air rule
  let vy = 0;
  for (let k = 0; k < 40; k++) {
    vy = Math.min(PHYS.maxFall, vy + PHYS.gravDown * DT);
    at({ y: (y += vy * DT), grounded: false });
  }
});

test('a cut is never eased: a respawn, a flag or a door, and the camera put somewhere by anything else', () => {
  const r = newRepick();
  const s = (y: number): CamSubject => ({ y, grounded: true });
  let an = camAnchor(NaN, s(700), VH);
  repick(r, 500, an, NaN, s(700), VW, VH, DT, 0, 0);
  markCam(r, 10, 20);
  // a door: his body moves 300 px in one frame
  let prev = an;
  an = camAnchor(prev, s(400), VH);
  assert.deepEqual(repick(r, 800, an, prev, s(400), VW, VH, DT, 10, 20), { x: 800, y: 400 });
  markCam(r, 10, 20);
  // the camera set directly (a slide's come-out), body moved under a teleport's size
  prev = an;
  an = camAnchor(prev, { y: 330, grounded: true }, VH);
  assert.deepEqual(repick(r, 850, an, prev, s(330), VW, VH, DT, 300, 20), { x: 850, y: 330 });
  markCam(r, 300, 20);
  // a respawn (the engine clears the anchor)
  an = camAnchor(NaN, s(360), VH);
  assert.deepEqual(repick(r, 880, an, NaN, s(360), VW, VH, DT, 300, 20), { x: 880, y: 360 });
});

test('the fastest fall, upright and on a climb framing: never further out of the view than before, and never out of it', () => {
  for (const feet of [0.55, 0.8]) {
    // off a high bough, falling at full speed past the air band for a second, then landing
    const path: Array<{ x: number; s: CamSubject }> = Array.from({ length: 6 }, () => ({ x: 500, s: { y: 1000, grounded: true } }));
    let y = 1000, vy = 0;
    for (let k = 0; k < 34; k++) path.push({ x: 500, s: { y: (y += (vy = Math.min(PHYS.maxFall, vy + PHYS.gravDown * DT)) * DT), grounded: false } });
    for (let k = 0; k < 40; k++) path.push({ x: 500, s: { y, grounded: true } });
    const a = fly(path, false, feet), b = fly(path, true, feet);
    const worstA = Math.max(...a.feetOn), worstB = Math.max(...b.feetOn);
    assert.ok(worstB <= worstA + 0.5, `feet ${feet}: lowest on the view ${worstB.toFixed(1)} px vs ${worstA.toFixed(1)} before`);
    // after the landing he comes back into the framing by 1.2 s
    assert.ok(Math.abs(b.feetOn.at(-1)! - VH * feet) < 4, `feet ${feet}: settled at ${b.feetOn.at(-1)!.toFixed(1)} of ${VH * feet}`);
    assert.ok(Math.abs(b.cy.at(-1)! - b.cy.at(-2)!) < 1, 'and at rest');
  }
  assert.ok(REPICK.rate >= 6 && CAM.airDown < 0.3);
});

// The real engine on every vine move the measurer finds from the stage's own vines (no stage data in the engine), three stages of two
// worlds: the view's jerk (world px a frame, per frame) stays small, and Pokey stays inside the view the whole way.
for (const [id, seed] of [['1-4', 1], ['1-5', 1], ['6-1', 1]] as const) {
  test(`${id}: on every vine move the view starts and stops smoothly and he stays in view`, () => {
    setDifficulty('normal');
    const n = moves(new RealPlay(id, seed)).length;
    assert.ok(n >= 3, `the measurer finds the moves on ${id} (${n})`);
    for (let i = 0; i < n; i++) {
      const r = new RealPlay(id, seed);
      // (RealPlay stubs the camera as paint: here it is the thing measured, so the engine's own runs)
      const e = r.e as unknown as { updateCamera: (dt: number) => void };
      e.updateCamera = (Object.getPrototypeOf(r.e) as typeof e).updateCamera;
      const m = moves(r)[i];
      m.setup();
      // (a second and a half for the view to come to rest after the placement cut)
      for (let k = 0; k < 45; k++) r.frame({});
      const c = r.e.camera;
      const cy: number[] = [], cx: number[] = [];
      const L = r.e as unknown as { camLandX: number; camLandY: number };
      let look = false, lx = L.camLandX, ly = L.camLandY;
      for (const pad of [...m.pads, ...Array(20).fill({})]) {
        r.frame(pad);
        assert.ok(r.p.y - c.y <= c.viewportHeight && r.p.y - 90 - c.y >= 0, `${m.name}: Pokey inside the view (feet ${Math.round(r.p.y - c.y)} of ${Math.round(c.viewportHeight)})`);
        assert.ok(r.p.x - c.x >= 0 && r.p.x - c.x <= c.viewportWidth, `${m.name}: Pokey inside the view across`);
        // (the look across a gap is its own rule, LAND_EASE: once it starts to move the view, the rest of the move is its; named in
        // FEEL-CAM's report as the one lurch left at the top of a trunk, not this ease's)
        look ||= Math.abs(L.camLandX - lx) + Math.abs(L.camLandY - ly) > 2;
        lx = L.camLandX;
        ly = L.camLandY;
        if (look) continue;
        cx.push(c.x);
        cy.push(c.y);
      }
      // (across always; up and down wherever the framing leaves room under the HUD for the ease: a stage laid as a tower does on every
      // screen, a run stage upright does; a run stage on this squat 960 x 540 view has none, so there the old move is kept, never worse)
      const E = r.e as unknown as { camera: { viewportHeight: number }; currentStage: object; mode: Parameters<typeof towerLead>[1]; zoom: number };
      const room = E.camera.viewportHeight * travelFeet(0.55, towerLead(E.currentStage, E.mode)) - HERO_HEAD - HUD_BAND.land / E.zoom - REPICK.hudRoom;
      assert.ok(jerk(cx) <= 6, `${m.name}: view jerk across ${jerk(cx).toFixed(1)} px`);
      if (room > 0) assert.ok(jerk(cy) <= 6, `${m.name}: view jerk up/down ${jerk(cy).toFixed(1)} px (room ${room.toFixed(0)})`);
    }
  });
}
