import test from 'node:test';
import assert from 'node:assert/strict';
import { AHEAD, CAM, camAnchor, camLook, heroBox, landingAhead, landingBox, showBoth, snapCam, type Box } from './cameraFollow.ts';

const VH = 720;

test('a hop does not move the camera: in the air it holds the ground height', () => {
  let a = camAnchor(NaN, { y: 700, grounded: true }, VH);
  // a jump that rises 170 px and lands back on the same ground
  for (let k = 0; k <= 20; k++) {
    const y = 700 - 170 * Math.sin((Math.PI * k) / 20);
    a = camAnchor(a, { y, grounded: k === 0 || k === 20 }, VH);
    assert.equal(a, 700, `the camera moved during a hop (frame ${k})`);
  }
});

test('landing on a higher ledge moves the camera up to it; a fall is followed down', () => {
  let a = camAnchor(NaN, { y: 700, grounded: true }, VH);
  a = camAnchor(a, { y: 600, grounded: false }, VH);
  assert.equal(a, 700);
  a = camAnchor(a, { y: 560, grounded: true }, VH);
  assert.equal(a, 560);
  // falling into a pit: past the band the camera comes down with him
  a = camAnchor(a, { y: 560 + VH * CAM.airDown + 100, grounded: false }, VH);
  assert.equal(a, 560 + 100);
});

test('a high bounce is followed once he is well above the ground', () => {
  let a = 700;
  a = camAnchor(a, { y: 700 - VH * CAM.airUp - 50, grounded: false }, VH);
  assert.equal(a, 650);
});

test('on a swinging vine the camera keeps level with the bottom of the arc, whatever the swing is doing', () => {
  let a = 700;
  for (let k = 0; k < 30; k++) {
    a = camAnchor(a, { y: 520 + 100 * Math.cos(k), grounded: false, swingBottom: 640 }, VH);
    assert.equal(a, 640);
  }
});

test('climbing and hanging follow him; a respawn far away moves the anchor at once', () => {
  assert.equal(camAnchor(700, { y: 650, grounded: false, climbing: true }, VH), 650);
  assert.equal(camAnchor(700, { y: 640, grounded: false, hanging: true }, VH), 640);
  assert.equal(camAnchor(3000, { y: 700, grounded: false }, VH), 700);
});

test('turning round eases the look-ahead across instead of jumping it', () => {
  let l: number = CAM.lookAhead;
  l = camLook(l, -1, 1 / 30);
  assert.ok(l < CAM.lookAhead && l > CAM.lookAhead - 20, `look-ahead jumped to ${l}`);
  for (let k = 0; k < 90; k++) l = camLook(l, -1, 1 / 30);
  assert.ok(Math.abs(l + CAM.lookAhead) < 2);
});

// ───── the look across a gap: upright (a 400 x 720 phone shows 440 x 792 of world) and sideways (844 x 390 shows 1168 x 540) ─────
const VIEWS = { upright: { vw: 440, vh: 792 }, sideways: { vw: 1168, vh: 540 } };
/** where the engine aims before the look across (engine.ts updateCamera: 45% across plus the look-ahead, his feet 55% down) */
const plain = (px: number, py: number, vw: number, vh: number, facing = 1) => ({ x: px - vw * 0.45 + facing * CAM.lookAhead, y: py - vh * 0.55 });
const inView = (b: Box, v: { x: number; y: number }, vw: number, vh: number, P: { l: number; r: number; t: number; b: number } = AHEAD.pad) =>
  b.x0 >= v.x + vw * P.l - 1 && b.x1 <= v.x + vw * P.r + 1 && b.y0 >= v.y + vh * P.t - 1 && b.y1 <= v.y + vh * P.b + 1;
const him = heroBox;
/** Pokey in view (his own, roomier margins) */
const heroIn = (px: number, py: number, v: { x: number; y: number }, vw: number, vh: number) => inView(heroBox(px, py), v, vw, vh, AHEAD.heroPad);

test('at the end of a ledge, the view shows the far side of the gap, upright and sideways (testers, 4-4 and 4-7)', () => {
  const ledge = { x: 0, y: 700, width: 1000 };
  const far = { x: 1300, y: 760, width: 400 };
  const plats = [ledge, far];
  const px = 960;
  const land = landingAhead(px, 1, ledge, plats)!;
  assert.ok(land && land.x0 <= 1310 && land.x1 > 1320, 'the far ledge is what it looks at');
  // (upright, the plain view did not reach it)
  const u = VIEWS.upright;
  assert.ok(!inView(land, plain(px, 700, u.vw, u.vh), u.vw, u.vh), 'upright the far side was already in view: the test proves nothing');
  for (const [name, { vw, vh }] of Object.entries(VIEWS)) {
    const p0 = plain(px, 700, vw, vh);
    const v = showBoth(p0.x, p0.y, px, 700, land, vw, vh);
    assert.ok(inView(land, v, vw, vh), `${name}: the far ledge is off screen`);
    assert.ok(heroIn(px, 700, v, vw, vh), `${name}: Pokey left the view`);
  }
  // the other way, and a lower ledge across a wider gap (4-7's leaf), sideways
  const left = landingAhead(1040, -1, { x: 1000, y: 700, width: 800 }, [{ x: 1000, y: 700, width: 800 }, { x: 300, y: 900, width: 300 }])!;
  const s = VIEWS.sideways;
  const p1 = plain(1040, 700, s.vw, s.vh, -1);
  const v1 = showBoth(p1.x, p1.y, 1040, 700, left, s.vw, s.vh);
  assert.ok(inView(left, v1, s.vw, s.vh) && heroIn(1040, 700, v1, s.vw, s.vh));
  // 4-7's deepest drop (410 down, 470 across) in its wider view (w4LongDrop LONG_DROP_VIEW: 640 of world tall sideways, 620 wide upright)
  for (const [vw, vh] of [[1385, 640], [620, 1116]]) {
    const deep = landingBox(1470, 1110, 1);
    const p2 = plain(990, 700, vw, vh);
    const v2 = showBoth(p2.x, p2.y, 990, 700, deep, vw, vh);
    assert.ok(inView(deep, v2, vw, vh) && heroIn(990, 700, v2, vw, vh), `4-7's deep drop is off screen in ${vw} x ${vh}`);
  }
});

test('the next vine past the end of a ledge is shown whole upright, not cut off at the edge (4-4)', () => {
  const ledge = { x: 0, y: 700, width: 1000 };
  const vine = { x: 1290, topY: 380, bottomY: 690 };
  const px = 970;
  const land = landingAhead(px, 1, ledge, [ledge], [vine])!;
  assert.ok(land && land.x0 < 1290 && land.x1 > 1290);
  const { vw, vh } = VIEWS.upright;
  const p0 = plain(px, 700, vw, vh);
  const v = showBoth(p0.x, p0.y, px, 700, land, vw, vh);
  assert.ok(inView(land, v, vw, vh) && heroIn(px, 700, v, vw, vh));
});

test('swinging on a vine, the view shows where letting go throws him: the next vine or ledge the way he faces (1-8)', () => {
  // he hangs from a vine at x 500 (feet at the bottom of the arc about 660); the landing branch is 330 px on, a little lower
  const hang = { x: 500, y: 660, width: 0 };
  const branch = { x: 830, y: 720, width: 300 };
  const back = { x: 0, y: 700, width: 380 };
  const land = landingAhead(500, 1, hang, [back, branch])!;
  assert.ok(land && land.x0 <= 840 && land.x1 > 840, 'it looks at the branch ahead, not the one behind');
  const { vw, vh } = VIEWS.upright;
  // through the forward half of his swing, when he lets go, the branch is in view; at the back of it he still is
  for (const x of [500, 530, 560]) {
    const p0 = plain(x, 640, vw, vh);
    const v = showBoth(p0.x, p0.y, x, 640, land, vw, vh);
    assert.ok(inView(land, v, vw, vh) && heroIn(x, 640, v, vw, vh), `upright, the landing branch is off screen while he swings (at ${x})`);
  }
  const pb = plain(440, 640, vw, vh);
  assert.ok(heroIn(440, 640, showBoth(pb.x, pb.y, 440, 640, land, vw, vh), vw, vh));
  // facing the other way he lets go back: it looks back
  const backLand = landingAhead(500, -1, hang, [back, branch])!;
  assert.ok(backLand.x1 <= 390);
  // and a next vine to catch counts as a landing too
  const next = landingAhead(500, 1, hang, [back], [{ x: 860, topY: 300, bottomY: 640 }])!;
  assert.ok(next.x0 < 860 && next.x1 > 860);
});

test('no look across where there is no gap, or he is still far from the end', () => {
  const ledge = { x: 0, y: 700, width: 1000 };
  assert.equal(landingAhead(980, 1, ledge, [ledge, { x: 1000, y: 700, width: 500 }]), null, 'the ledge carries straight on');
  assert.equal(landingAhead(300, 1, ledge, [ledge, { x: 1200, y: 700, width: 500 }]), null, 'far from the edge');
  // Pokey always stays in view, even when the landing cannot fit beside him
  const { vw, vh } = VIEWS.upright;
  const land: Box = { x0: 1700, x1: 1840, y0: 620, y1: 724 };
  const p0 = plain(960, 700, vw, vh);
  assert.ok(heroIn(960, 700, showBoth(p0.x, p0.y, 960, 700, land, vw, vh), vw, vh));
});

test('the camera snaps to whole device pixels', () => {
  assert.equal(snapCam(10.4, 3), 31 / 3);
  assert.equal(snapCam(10.2, 1), 10);
});
