import test from 'node:test';
import assert from 'node:assert/strict';
import { liftCycle, liftY, pickFloor } from './lift.ts';
import { PHYS } from './physics.ts';
import { generateAllLevels } from './worldsData.ts';
import { generateStage } from './stageGenerator.ts';
import { buildW2Stage } from './w2Stages.ts';
import type { LevelConfig, Platform } from './types.ts';

// the shipped stages are the ones built from the stage plan (protoStage.ts reads `location` to tell a browser from the generator's tests)
(globalThis as { location?: unknown }).location ??= { search: '' };

const DT = 1 / 30; // the game loop is locked at 30 fps
const W = 44; // Pokey's width (engine.ts)

/**
 * Pokey standing still in a lift's basket for two full round trips, frame by frame in the engine's order (engine.ts update): the
 * lifts move and carry whoever stands on them, gravity pulls him, and he lands on the floors his feet meet, pickFloor choosing between
 * floors at the same height. Returns the first frame he is not in the basket, or null.
 */
function ride(plats: Platform[], lift: Platform, t0: number): string | null {
  const L = lift.lift!;
  lift.y = liftY(L, t0);
  const p = { x: lift.x + lift.width / 2, y: lift.y, vy: 0, grounded: true };
  let on = lift.id;
  const frames = Math.ceil((2 * liftCycle(L)) / DT);
  for (let f = 1; f <= frames; f++) {
    const t = t0 + f * DT;
    for (const pl of plats) {
      if (!pl.lift) continue;
      const ny = liftY(pl.lift, t);
      if (p.grounded && on === pl.id) p.y += ny - pl.y;
      pl.y = ny;
    }
    p.vy = Math.min(PHYS.maxFall, p.vy + PHYS.gravDown * DT);
    p.y += p.vy * DT;
    const prevFeet = p.y - p.vy * DT;
    const floors = plats.filter((pl) => !pl.broken && p.x + W * 0.26 > pl.x && p.x - W * 0.26 < pl.x + pl.width && p.vy >= 0 && prevFeet <= pl.y + 14 && p.y >= pl.y);
    const fl = pickFloor(floors, p.x);
    p.grounded = !!fl;
    on = fl?.id ?? -1;
    if (fl) {
      p.y = fl.y;
      p.vy = 0;
    }
    if (on !== lift.id || Math.abs(p.y - lift.y) > 0.5) {
      return `t ${t.toFixed(2)} (lift at ${lift.y.toFixed(1)}, ${L.top}..${L.bottom}): on ${on} at y ${p.y.toFixed(1)}`;
    }
  }
  return null;
}

/** every lift in a stage, ridden from the bottom stop, the top stop and mid-ride */
function rideAll(name: string, plats: Platform[]): number {
  const lifts = plats.filter((pl) => pl.lift);
  for (const lift of lifts) {
    const L = lift.lift!;
    const ride1 = (L.bottom - L.top) / L.speed;
    // (game time t puts the cycle at t + phase: waiting at the bottom from 0, at the top from wait + ride)
    for (const [where, u] of [['bottom stop', L.wait / 2], ['top stop', 1.5 * L.wait + ride1], ['mid-ride', L.wait + ride1 / 2]] as const) {
      const copy = plats.map((pl) => ({ ...pl }));
      const miss = ride(copy, copy.find((pl) => pl.id === lift.id)!, u - L.phase + liftCycle(L));
      assert.equal(miss, null, `${name}: lift ${lift.id} at x ${lift.x}, from the ${where}, left him behind: ${miss}`);
    }
  }
  return lifts.length;
}

test('a player standing in a lift is carried through a full down-and-up cycle, in every shipped stage that has lifts', () => {
  const withLifts: string[] = [];
  for (const l of generateAllLevels()) {
    const st = generateStage(l);
    if (rideAll(l.id, st.platforms)) withLifts.push(l.id);
  }
  assert.ok(withLifts.includes('2-7'), `stages with lifts: ${withLifts.join(', ')}`);
});

test('2-7: every roll of the stage, every lift carries him up and down', () => {
  const cfg = { worldIndex: 2, miniIndex: 7, id: '2-7', name: '2-7', objectiveType: 'sprint', targetCount: 1, timeLimit: 0, levelWidth: 9000, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 } as LevelConfig;
  // (two lifts at least on every roll: the ride back down became a drop off the high ground's end in the variety pass, 2026-10-28)
  for (let s = 1; s < 600; s += 37) assert.ok(rideAll(`2-7 seed ${s}`, buildW2Stage(cfg, s, '2-7').platforms) >= 2);
});

test('pickFloor: in the basket when it sits flush on the path, on the path or the rock once his middle leaves it', () => {
  const ground = { id: 1, x: 0, y: 580, width: 1000, type: 'solid' };
  const basket = { id: 2, x: 400, y: 580, width: 96, type: 'moving' };
  assert.equal(pickFloor([ground, basket], 450), basket, 'in the basket');
  assert.equal(pickFloor([basket, ground], 450), basket);
  assert.equal(pickFloor([ground, basket], 390), ground, 'his middle is past the basket: on the path');
  const rock = { id: 3, x: 502, y: 360, width: 400, type: 'solid' };
  const high = { ...basket, y: 360 };
  assert.equal(pickFloor([high, rock], 508), rock, 'stepping off at the top');
  assert.equal(pickFloor([high, rock], 490), high);
  // on its last frames down the basket is a frame's fall above the path: still the basket
  assert.equal(pickFloor([ground, { ...basket, y: 577 }], 450)?.id, basket.id);
  // a floor well below the highest one never wins (here the first in stage order, as before)
  const ledge = { id: 4, x: 300, y: 570, width: 300, type: 'solid' };
  assert.equal(pickFloor([ledge, basket], 450), ledge);
  assert.equal(pickFloor([], 0), undefined);
});
