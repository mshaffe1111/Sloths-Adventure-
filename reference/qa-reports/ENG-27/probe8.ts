import { homeRun } from '../../../tools/inspect/homeToys.ts';
let px = 0, py = 0, n = 0;
const r = homeRun('middle', 'normal', 1, 1, { onFrame: (sim: { t: number; p: { x: number; y: number }; e: { lives?: number; checkpoint?: { x: number; y: number } } }) => {
  const { x, y } = sim.p;
  if (n++ && (Math.abs(x - px) > 200 || Math.abs(y - py) > 200) && n < 4000) console.log(sim.t.toFixed(2), 'from', Math.round(px), Math.round(py), 'to', Math.round(x), Math.round(y), 'lives', sim.e.lives, 'cp', JSON.stringify(sim.e.checkpoint));
  px = x; py = y;
} } as never);
console.log(r.end, r.finishSeconds, 'lives', r.lives, 'putbacks', r.putbacks, 'rescues', r.rescues);
