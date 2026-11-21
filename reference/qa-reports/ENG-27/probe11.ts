import { homeRun } from '../../../tools/inspect/homeToys.ts';
let px = 0, n = 0, dirNow = 0, lastTurn = 0;
const r = homeRun('middle', 'normal', 1, 1, { onFrame: (sim: { t: number; p: { x: number; y: number; vx: number } }) => {
  const { x } = sim.p;
  if (n++ && Math.abs(x - px) > 60) console.log('JUMP', sim.t.toFixed(2), Math.round(px), '->', Math.round(x), Math.round(sim.p.y));
  const d = Math.sign(sim.p.vx);
  if (d && d !== dirNow && sim.t - lastTurn > 6 && sim.t > 60 && sim.t < 260) { console.log('turn', sim.t.toFixed(1), d > 0 ? 'right' : 'left', Math.round(x), Math.round(sim.p.y)); lastTurn = sim.t; }
  if (d) dirNow = d;
  px = x;
} } as never);
console.log(r.end, r.finishSeconds);
