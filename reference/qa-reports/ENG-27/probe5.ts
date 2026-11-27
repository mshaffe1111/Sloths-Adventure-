import { homeRun } from '../../../tools/inspect/homeToys.ts';
let last = -1;
homeRun('middle', 'normal', 1, 1, { onFrame: (sim: { t: number; p: { x: number; y: number; vy: number; grounded: boolean }; standingOn: number; e: { lives?: number } }) => {
  if (sim.t >= 14 && sim.t <= 22.5 && Math.floor(sim.t * 4) !== last) { last = Math.floor(sim.t * 4); console.log(sim.t.toFixed(2), Math.round(sim.p.x), Math.round(sim.p.y), Math.round(sim.p.vy), sim.p.grounded ? 'G' : '-', sim.standingOn, (sim.e as { lives?: number }).lives); }
} } as never);
