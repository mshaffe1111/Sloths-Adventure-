import test from 'node:test';
import assert from 'node:assert/strict';
import { CAM, camAnchor, camLook, snapCam } from './cameraFollow.ts';

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

test('the camera snaps to whole device pixels', () => {
  assert.equal(snapCam(10.4, 3), 31 / 3);
  assert.equal(snapCam(10.2, 1), 10);
});
