import { homeRun } from '../../../tools/inspect/homeToys.ts';
homeRun('middle', 'normal', 1, 1, { onFrame: (sim: { t: number; p: { x: number; y: number; vx: number; vy: number; grounded: boolean; climbing?: boolean; hanging?: boolean }; standingOn: number }) => {
  if (sim.t > 87.3 && sim.t < 88.5) console.log(sim.t.toFixed(3), Math.round(sim.p.x), Math.round(sim.p.y), Math.round(sim.p.vx), Math.round(sim.p.vy), sim.p.grounded ? 'G' : '-', sim.standingOn, sim.p.hanging ? 'hang' : '', sim.p.climbing ? 'climb' : '');
} } as never);
