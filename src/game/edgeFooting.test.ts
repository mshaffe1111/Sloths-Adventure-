/**
 * Standing at the end of a ledge (QA, 2-6, 2026-10-29: at the furthest the footing allows, his middle 12 px past the end, about half of
 * him hung over the air and he stood on nothing). Standing still there he is now DRAWN a small step back, until about a quarter of him
 * is past the end, and teeters (engine.ts edgeOffset, physics.ts EDGE). Only the picture moves: where he stands, walks off and jumps
 * from, coyote time and the landing forgiveness are as they were (moving him for real cost 4-4 a liana jump, w4RealReach).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { EDGE } from './physics.ts';
import type { Platform } from './types.ts';

const G = 2000;
const floor = (x: number, w: number, id = 1, y = G): Platform => ({ id, x, y, width: w, height: 300, type: 'solid' });

function at(plats: Platform[], x: number, on = plats[0]) {
  const r = new RealPlay('2-6', 1);
  r.bare(plats);
  r.stand(x, on.y);
  r.e.standingOnId = on.id;
  return r;
}

test('standing still past the end of a ledge, he is drawn back until about a quarter of him is over the air, and teeters there', () => {
  for (const [side, x] of [[1, 1000 + 11], [-1, 600 - 11]] as const) {
    const r = at([floor(600, 400)], x);
    r.wait(1.2);
    const drawn = r.p.x + (r.p.drawDx ?? 0);
    const past = side > 0 ? drawn - 1000 : 600 - drawn;
    assert.ok(r.p.grounded, 'still on the ledge');
    assert.equal(r.p.x, x, 'where he stands is unchanged');
    assert.ok(Math.abs(past + EDGE.inset) < 0.5, `${side > 0 ? 'right' : 'left'} end: drawn middle ${past.toFixed(1)} px past it`);
    assert.equal(r.p.teeter, side, 'teetering out over the drop');
  }
});

test('moving off the spot, the picture rejoins his footing within a few frames', () => {
  const r = at([floor(600, 400)], 1011);
  r.wait(1.2);
  for (let i = 0; i < 3; i++) r.frame({ left: true });
  assert.equal(r.p.drawDx, 0);
  assert.ok(!r.p.teeter);
});

test('the end of a ledge that carries on at the same height is no edge: he stays where he stopped', () => {
  const r = at([floor(600, 400), floor(1000, 300, 2)], 1000 + 8);
  r.wait(1);
  assert.equal(Math.round(r.p.x), 1008);
  assert.ok(!r.p.drawDx);
  assert.ok(!r.p.teeter);
});

test('walking off a ledge happens where it always did (the footing is unchanged), and a held steer is never pulled back', () => {
  const r = at([floor(600, 400)], 900);
  let fellAt = NaN;
  for (let i = 0; i < 60 && Number.isNaN(fellAt); i++) {
    r.frame({ right: true });
    if (!r.p.grounded) fellAt = r.p.x;
  }
  // (0.26 of his 44 px width past the end, plus the frame he moved on)
  assert.ok(fellAt > 1000 + 44 * 0.26 && fellAt < 1000 + 44 * 0.26 + 12, `fell at ${(fellAt - 1000).toFixed(1)} px past the end`);
});

test('a ledge too narrow to step back on is left alone', () => {
  const r = at([floor(600, EDGE.inset * 2 + 4)], 600 + EDGE.inset * 2 + 4 + 8);
  const x0 = r.p.x;
  r.wait(0.6);
  assert.equal(r.p.x, x0);
  assert.ok(!r.p.drawDx);
});
