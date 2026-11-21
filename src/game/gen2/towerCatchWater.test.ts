/**
 * Every river's water is what lies under a tower's open ends (ENG-26e, the tower-turn rescues, cause (a)): towerCatches laid its catch
 * boughs under the ends it read as open over nothing, and only a wheel's pond counted as something (wheelLay.ts pondFloors). On 2-6's draft
 * tower the millrace, a ride river on a storey, got a catch bough 58 px under its surface and under its near bank (P70, 1118-1298 at
 * y 5028): in the water by riverAt, and the inspector's route ran through it (vine, P70, a hop to a log), which no one can fly; every tier
 * was rescued there. wheelLay.ts waterFloors: every river. RED on the pond-only read (the plant below).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { towerCatches } from './tower.ts';
import { waterFloors } from './wheelLay.ts';
import type { RiverZone } from '../river.ts';
import type { Platform } from '../types.ts';

const solid = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 24, type: 'solid' } as Platform);
// (a storey at y 600 high over the floor at 1600 (a drop no fall may have): a ride river between its banks, the near bank's lip over the water)
const floor = solid(1, 0, 1600, 1700), far = solid(2, 234, 600, 200), near = solid(3, 1232, 600, 260);
const race: RiverZone = { x0: 434, x1: 1232, surfaceY: 642, speed: 60, dir: -1 };
const level = (p: Platform) => (p === floor ? 0 : 1);
const underWater = (cs: ReadonlyArray<{ x: number; y: number; w: number }>) => cs.filter((c) => c.x < race.x1 && c.x + c.w > race.x0 && c.y > race.surfaceY - 120 && c.y < floor.y);

test("no catch bough is laid under a river's water on a tower storey: the water is what lies under its banks' ends", () => {
  const cs = towerCatches('up', [floor, far, near, ...waterFloors([race])], [], floor.y, 1700, [], level);
  assert.deepEqual(underWater(cs), [], `boughs under the water: ${JSON.stringify(underWater(cs))}`);
});

test('PLANTED: read as the pond-only rule did (a ride river is not a wheel pond), a bough is laid in the water under the bank (RED)', () => {
  const cs = towerCatches('up', [floor, far, near, ...waterFloors([race]).filter(() => race.wheelPond)], [], floor.y, 1700, [], level);
  assert.ok(underWater(cs).length > 0, `the pond-only read lays a bough under the water (${JSON.stringify(cs)})`);
});
