// BUILD-26: one bot run's frames in a time window (rule 28's trace): t, x, y, grounded, climbing, vx, input
// usage: npx tsx tools/inspect/b26/frames.ts <bot> <setting> <seed> <t0> <t1> [every]
import '../../../src/game/headlessDom.ts';
import { CAST_BOTS } from '../castBots.ts';
import { firstTimer } from '../firsttimer.ts';
const [bot, setting, seedS, t0S, t1S, everyS] = process.argv.slice(2);
const t0 = Number(t0S), t1 = Number(t1S), every = Number(everyS ?? 10);
let f = 0;
const r: any = firstTimer(process.env.STAGE ?? '2-6', Number(seedS), CAST_BOTS[bot][setting as 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++;
  const t = f / 30;
  if (t < t0 || t > t1 || f % every) return;
  const p = sim.p;
  console.log(`t ${t.toFixed(1)} x ${Math.round(p.x)} y ${Math.round(p.y)} g ${p.grounded ? 1 : 0} cl ${p.climbing ? 1 : 0} vx ${Math.round(p.vx)} vy ${Math.round(p.vy)} in ${JSON.stringify(sim.lastInput ?? sim.input?.state ?? '')}`);
} });
console.log(r.end, r.time, r.rescues);
