import { FirstTimerRun, FT_MIDDLE_EASY } from '/home/user/Sloths-Adventure-/tools/inspect/firsttimer.ts';
const plats = [
  { id: 1, x: 520, y: 1045, width: 440, height: 24, type: 'solid' },
  { id: 2, x: 960, y: 1005, width: 248, height: 24, type: 'solid' },
  { id: 3, x: 1100, y: 705, width: 400, height: 24, type: 'solid' },
  { id: 9, x: 0, y: 1365, width: 2000, height: 100, type: 'solid' },
];
const vine = { id: 41, x: 1190, topY: 705, bottomY: 1005, swaySpeed: 0, swayPhase: 0, vineType: 'tree_climb' };
const route = [
  ...Array.from({ length: 29 }, (_, i) => ({ x: 517 + i * 24, y: 1045 - (40 * i) / 28 })),
  ...Array.from({ length: 13 }, (_, i) => ({ x: 1190, y: 1005 - i * 24 })),
  ...Array.from({ length: 13 }, (_, i) => ({ x: 1190 + i * 24, y: 705 })),
];
const res: string[] = [];
for (const plant of [false, true]) { let drops = 0; for (let seed = 1; seed <= 40; seed++) {
  let lo = 0;
  const run: any = new FirstTimerRun('1-1', seed, { ...FT_MIDDLE_EASY, look: 0 }, { route, cap: 10, rescueAfter: 100, onFrame: (s: any) => { lo = Math.max(lo, s.p.y); } });
  run.sim.bare(plats as never, [vine as never]);
  run.sim.stand(560, 1045); run.sim.p.facing = 1; run.onTower = true;
  if (plant) run.ledgeJustPast = () => false;
  run.prog.relocate(run.sim.p); run.play();
  if (lo > 1300) { drops++; res.push(`${plant ? 'PLANT' : 'fix'} seed ${seed} dropped`); }
} res.push(`${plant ? 'PLANT' : 'fix'} drops ${drops}/40`); }
console.log(res.join('\n'));
