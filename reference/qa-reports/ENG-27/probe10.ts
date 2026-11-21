import { homeRun } from '../../../tools/inspect/homeToys.ts';
let last = -1;
const r = homeRun('middle', 'normal', 1, 1, { onFrame: (sim: { t: number; p: { x: number; y: number; grounded: boolean }; standingOn: number }) => {
  if (Math.floor(sim.t / 8) !== last) { last = Math.floor(sim.t / 8); console.log(sim.t.toFixed(0), Math.round(sim.p.x), Math.round(sim.p.y), sim.p.grounded ? 'G' : '-', sim.standingOn); }
} } as never);
console.log(r.end, r.finishSeconds, 'lives', r.lives, 'rescues', r.rescues);
