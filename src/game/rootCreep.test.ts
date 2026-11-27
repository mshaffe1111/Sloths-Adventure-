/**
 * A rope's OWN creep speed (Rope.speed, ENG-ROOT item 1; Matt's B for 3-2's roots, R-165.452: 'slower and tense', 85 px/s): the real
 * engine creeps him at the rope's number, ROPE_SPEED (120) when it has none, so every rope laid before roots is unchanged; the
 * hand-over-hand cycle is paced by distance (heroRope.ts), so it slows with the root. Planted: the engine back on ROPE_SPEED for
 * every rope -> the root test reads 120 and fails.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, DT } from './realPlay.ts';
import { ROOT_SPEED, ROPE_SPEED, ropeSpeed } from './rope.ts';
import type { Platform, Rope } from './types.ts';

const G = 600;
/** one long walkable floor and a root over it, `up` px over the floor (3-2's Normal root is 190), its ends in the roof */
function world(speed: number | undefined, up = 190) {
  const r = new RealPlay('8-2', 1);
  const floor = { id: 1, x: 0, y: G, width: 3000, height: 400, type: 'solid' } as Platform;
  const rope: Rope = { id: 1, x0: 800, x1: 2200, y: G - up, g0: G, g1: G, required: false, look: 'root', ...(speed !== undefined ? { speed } : {}) };
  r.bare([floor], [], [rope]);
  r.e.skills.add('shimmy');
  r.e.currentStage.heartFalls = [];
  r.e.collectibles = [];
  return { r, rope };
}

/** stand under the root, a held jump up to it; then creep right for `secs`: px per second crept, and the paw cycle per px */
function creep(speed: number | undefined, secs = 2): { pxs: number; cyclePerPx: number } {
  const { r } = world(speed);
  r.stand(1200, G);
  for (let t = 0; t < 1 && !r.p.hanging; t += DT) r.frame({ jump: true, ...(t === 0 ? { press: true } : {}) });
  assert.ok(r.p.hanging, 'a held jump from under a 190 px root catches it (3-2.md: Normal roots 190)');
  for (let i = 0; i < 10; i++) r.frame({});
  const x0 = r.p.x, c0 = r.p.walkCycle;
  const n = Math.round(secs / DT);
  for (let i = 0; i < n; i++) r.frame({ right: true });
  assert.ok(r.p.hanging, 'still on the root');
  const dx = r.p.x - x0;
  return { pxs: dx / (n * DT), cyclePerPx: (r.p.walkCycle - c0) / dx };
}

test("a root creeps at its own speed (85 px/s, Matt's B), a rope with none at ROPE_SPEED (120): every shipped rope is unchanged", () => {
  assert.equal(ROOT_SPEED, 85);
  assert.equal(ropeSpeed({}), ROPE_SPEED);
  assert.equal(ropeSpeed({ speed: ROOT_SPEED }), ROOT_SPEED);
  const root = creep(ROOT_SPEED), rope = creep(undefined);
  assert.ok(Math.abs(root.pxs - ROOT_SPEED) < 1, `the root creeps ${root.pxs.toFixed(1)} px/s`);
  assert.ok(Math.abs(rope.pxs - ROPE_SPEED) < 1, `a rope with no speed creeps ${rope.pxs.toFixed(1)} px/s`);
  // (the paws are paced by distance: the same cycle per px, so the hand-over-hand slows with the root, never a fast shuffle)
  assert.ok(Math.abs(root.cyclePerPx - rope.cyclePerPx) < 1e-6, `paw cycle per px ${root.cyclePerPx} vs ${rope.cyclePerPx}`);
});
