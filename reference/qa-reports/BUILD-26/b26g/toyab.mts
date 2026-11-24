import { FirstTimerRun, FT_CHILD, FT_ADULT } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const plats = [
  { id: 1, x: 364, y: 987, width: 110, height: 24, type: 'solid' },
  { id: 2, x: 634, y: 987, width: 110, height: 24, type: 'solid' },
  { id: 3, x: 744, y: 987, width: 110, height: 24, type: 'solid' },
  { id: 4, x: 854, y: 987, width: 200, height: 24, type: 'solid' },
  { id: 5, x: 334, y: 1067, width: 640, height: 24, type: 'solid' },
  { id: 6, x: 900, y: 706, width: 500, height: 24, type: 'solid' },
  { id: 9, x: 0, y: 1348, width: 2000, height: 100, type: 'solid' },
];
const vine = { id: 5, x: 1036, topY: 706, bottomY: 987, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
const route = [
  ...Array.from({ length: 27 }, (_, i) => ({ x: 400 + i * 24, y: 987 })),
  ...Array.from({ length: 12 }, (_, i) => ({ x: 1036, y: 987 - i * 24 })),
  ...Array.from({ length: 14 }, (_, i) => ({ x: 1036 + i * 24, y: 706 })),
];
for (const who of [FT_CHILD, FT_ADULT]) for (const plant of [false, true]) for (const seed of [1, 2, 3]) {
  let low = 0, top = 9999;
  const run = new FirstTimerRun('1-1', seed, { ...who, look: 0 }, { route, cap: 14, rescueAfter: 100, onFrame: (s: any) => { low = Math.max(low, s.p.y); top = Math.min(top, s.p.y); } });
  run.sim.bare(plats as never, [vine as never]);
  run.sim.stand(687, 1067); run.sim.p.vx = 268; (run as any).lastSteer = 1;
  run.sim.p.facing = 1;
  (run as any).onTower = true;
  let sets = 0, val = false; Object.defineProperty(run, 'stopMeant', { get: () => (plant ? false : val), set: (v: boolean) => { if (v) sets++; val = v; } });
  run.prog.relocate(run.sim.p);
  run.play();
  console.log(who === FT_CHILD ? 'kid' : 'adult', plant ? 'PLANT' : 'fix', seed, Math.round(run.sim.p.x), Math.round(run.sim.p.y), 'low', Math.round(low), 'top', Math.round(top), 'stops', sets);
}
