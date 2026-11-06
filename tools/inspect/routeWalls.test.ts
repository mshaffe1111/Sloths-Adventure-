// npx tsx --test tools/inspect/routeWalls.test.ts
// The route sees walls on a floor (the lead's 11-05 ruling A, the planner's quiet finding): in the game a solid piece 50 px or taller is a
// wall (engine.ts's wall check), so walking along a floor he hops onto one standing on it, walks across and drops off its far side; one
// under 50 px he walks through (and so does the route). Planted: a 60 px block set midway along the longest walk of a gen2 1-1 roll.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { withGoals } from '../../src/game/goals.ts';
import { findRoute } from './route.ts';
import type { Platform } from '../../src/game/types.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const stageWith = (h: number) => {
  const st = withGoals(buildGen2Stage({ config: cfg, kit: w1World(), seed: 79191, difficulty: 'normal' }) as never) as never as { platforms: Platform[] };
  const r = findRoute(st as never);
  const w = r.segs.filter((s) => s.kind === 'walk' && s.plat).sort((a, b) => Math.abs(b.x1 - b.x0) - Math.abs(a.x1 - a.x0))[0];
  const mid = (w.x0 + w.x1) / 2;
  const wall: Platform = { id: 99999, x: Math.round(mid - 40), y: w.plat!.y - h, width: 80, height: h, type: 'solid', style: 'moss_stone' } as Platform;
  st.platforms.push(wall);
  return { st, wall, floor: w.plat! };
};
const through = (segs: ReturnType<typeof findRoute>['segs'], wall: Platform) =>
  segs.filter((s) => s.kind === 'walk' && Math.abs(s.y0 - (wall.y + wall.height)) < 3 && Math.min(s.x0, s.x1) < wall.x + 1 && Math.max(s.x0, s.x1) > wall.x + wall.width - 1);

test('a 60 px wall standing on a floor is hopped onto, never walked through', () => {
  const { st, wall } = stageWith(60);
  const r = findRoute(st as never);
  assert.deepEqual(through(r.segs, wall).map((s) => [Math.round(s.x0), Math.round(s.x1)]), [], 'the route walks through the wall');
  assert.ok(r.segs.some((s) => s.kind === 'hop' && Math.abs(s.y1 - wall.y) < 3), 'no hop onto the wall');
});

test('a 40 px stump on a floor is walked through, as the game lets him', () => {
  const { st, wall } = stageWith(40);
  const r = findRoute(st as never);
  assert.ok(through(r.segs, wall).length > 0 || r.segs.some((s) => s.plat === wall), 'the 40 px stump changed the route');
});
